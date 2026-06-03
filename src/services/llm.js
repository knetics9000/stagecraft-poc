/**
 * LLM Connector Service
 * Handles prompt engineering, model selection, API requests, and fallback mocks.
 */

export function buildSystemPrompt(tenant, frameworkType, crmContext = {}) {
  const stageDefinitionsStr = tenant.stages
    .map((s, idx) => `${idx + 1}. Stage Name: "${s.name}"\n   Description: ${s.description}\n   Entry Criteria: ${s.entry_criteria}\n   Exit Criteria: ${s.exit_criteria}`)
    .join('\n\n');

  let frameworkInstructions = '';
  let frameworkSchemaNotes = '';

  if (frameworkType === 'meddic') {
    frameworkInstructions = `
Evaluate the deal against the MEDDIC framework criteria:
- Metrics (M): Quantified value or ROI discussed.
- Economic Buyer (E): The person who controls the funds.
- Decision Criteria (D): Technical/business requirements for evaluation.
- Decision Process (D): Steps, timeline, and approvals needed.
- Identify Pain (I): Underlying business problem causing urgency.
- Champion (C): Internal advocate driving the project internally.
`;
    frameworkSchemaNotes = `
Ensure the output framework_criteria array has exactly these keys: ["metrics", "economic_buyer", "decision_criteria", "decision_process", "identify_pain", "champion"].
`;
  } else if (frameworkType === 'bant') {
    frameworkInstructions = `
Evaluate the deal against the BANT framework criteria:
- Budget (B): Funding details or price ranges discussed.
- Authority (A): Decision-maker mapping or engagement.
- Need (N): Core business need or problem.
- Timeline (T): Projected decision-making schedule or deadlines.
`;
    frameworkSchemaNotes = `
Ensure the output framework_criteria array has exactly these keys: ["budget", "authority", "need", "timeline"].
`;
  } else if (frameworkType === 'spin') {
    frameworkInstructions = `
Evaluate the deal against the SPIN conversation stages:
- Situation (S): Context, current tools, setup info.
- Problem (P): Expressed dissatisfactions and pains.
- Implication (I): Consequences of the problems if left unsolved.
- Need-payoff (N): Value or urgency of the proposed solution.
`;
    frameworkSchemaNotes = `
Ensure the output framework_criteria array has exactly these keys: ["situation", "problem", "implication", "need_payoff"].
`;
  }

  const crmContextStr = `
Current CRM Database State:
- Opportunity Name: ${crmContext.opportunityName || 'N/A'}
- Account Name: ${crmContext.accountName || 'N/A'}
- Stage: ${crmContext.stage || 'N/A'}
- Close Date: ${crmContext.closeDate || 'N/A'}
- Amount: ${crmContext.amount || 'N/A'}
- Opportunity Type: ${crmContext.type || 'N/A'}
- Probability: ${crmContext.probability || 'N/A'}
- PushCount: ${crmContext.pushCount || '0'}
- Price Book: ${crmContext.priceBook || 'N/A'}
- Opportunity Origin: ${crmContext.origin || 'N/A'}
`;

  return `You are "Sales Brain" — an expert B2B Sales Manager and executive CRM coach. Your task is to analyze the sales representative's meeting notes, extract evidence according to the company's active sales framework, compare the notes against the current database values, and map the deal to its correct sales stage.

Target Company Context:
Company Name: ${tenant.name}
Industry: ${tenant.industry}

Sales Process Stage Definitions (Evaluated in sequential order):
${stageDefinitionsStr}

${crmContextStr}

Active Sales Framework: ${frameworkType.toUpperCase()}
${frameworkInstructions}

Instructions:
1. First, analyze the meeting notes to evaluate each framework criterion. For each, assign a status: "confirmed" (clear explicit evidence in notes), "partial" (inferred or partially discussed), or "missing" (no mention). Quote or reference the exact evidence.
2. Next, review the entry and exit criteria of each sales stage in order. Decide which stage the deal is currently in. Be realistic: do not skip stages unless explicit exit criteria of previous stages are met.
3. Compare the AI's deduced stage and notes metadata with the Current CRM Database State listed above:
   - Audits: Does the notes narrative support the CRM Stage? (e.g. if the CRM Stage is set to 'Closed' but notes indicate they are in early Discovery, this is a massive mismatch).
   - Timeline Audits: Is the Close Date realistic based on notes? (e.g. if Close Date is in 3 days but notes show legal redlines are stuck).
   - Budget Audits: Does the CRM Amount match notes budget discussions?
   - If there are mismatches, explain them in the "reasoning", add them as critical gaps to "missing_or_ambiguous", and generate warning flags in "risk_flags" (e.g. "CRM Stage Mismatch", "Close Date Risk", "Amount Discrepancy").
4. Compute a confidence score (integer between 0 and 100) based on criteria coverage and database alignment. If there are massive database/notes discrepancies, reduce the confidence score significantly.
5. Draft a sales-manager-style reasoning (2-4 sentences) explaining why you assigned this stage, citing signals, deficiencies, and any CRM field misalignments.
6. Extract a list of "signals_found" (explicit positive markers) and "missing_or_ambiguous" data gaps.
7. Provide a single "recommended_next_action" that target-addresses the most critical framework gap (e.g. if Champion is missing, action should focus on finding one).
8. Flag deal risks in "risk_flags" (e.g., single-threaded, timeline slippage, redline delays, database discrepancies).

${frameworkSchemaNotes}

You must return a JSON object that adheres strictly to the following JSON schema:
{
  "stage": "Stage Name",
  "confidence_score": 85,
  "confidence_label": "High" | "Medium" | "Low",
  "reasoning": "Plain-English sales coaching reasoning...",
  "signals_found": ["Signal 1", "Signal 2"],
  "missing_or_ambiguous": ["Missing 1", "Missing 2"],
  "recommended_next_action": "Actionable next step",
  "risk_flags": ["Risk Flag 1"],
  "framework_criteria": [
    {
      "key": "framework_key", // e.g. "champion", "budget", "situation"
      "label": "Display Name", // e.g. "Champion", "Budget", "Situation"
      "status": "confirmed" | "partial" | "missing",
      "evidence": "Verbatim quote or 'No evidence found in notes.'"
    }
  ]
}

Only return the raw JSON object. Do not include markdown code block syntax.`;
}

export async function callGemini(apiKey, systemPrompt, meetingNotes) {
  const model = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const responseSchema = {
    type: "OBJECT",
    properties: {
      stage: { type: "STRING" },
      confidence_score: { type: "INTEGER" },
      confidence_label: { type: "STRING", enum: ["High", "Medium", "Low"] },
      reasoning: { type: "STRING" },
      signals_found: { type: "ARRAY", items: { type: "STRING" } },
      missing_or_ambiguous: { type: "ARRAY", items: { type: "STRING" } },
      recommended_next_action: { type: "STRING" },
      risk_flags: { type: "ARRAY", items: { type: "STRING" } },
      framework_criteria: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            key: { type: "STRING" },
            label: { type: "STRING" },
            status: { type: "STRING", enum: ["confirmed", "partial", "missing"] },
            evidence: { type: "STRING" }
          },
          required: ["key", "label", "status", "evidence"]
        }
      }
    },
    required: [
      "stage",
      "confidence_score",
      "confidence_label",
      "reasoning",
      "signals_found",
      "missing_or_ambiguous",
      "recommended_next_action",
      "risk_flags",
      "framework_criteria"
    ]
  };

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: `System Instructions:\n${systemPrompt}\n\nUser Input Meeting Notes:\n${meetingNotes}` }]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.1
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API Error (HTTP ${res.status}): ${errorText}`);
  }

  const data = await res.json();
  try {
    const rawText = data.candidates[0].content.parts[0].text;
    return JSON.parse(rawText);
  } catch (err) {
    throw new Error(`Failed to parse structured JSON response from Gemini API: ${err.message}`);
  }
}

/**
 * Fallback Mock Analysis for demo resilience when no API key is present
 */
export function getMockAnalysis(tenant, frameworkType, notes, crmContext = {}) {
  const text = notes.toLowerCase();
  
  let matchingStage = tenant.stages[0].name;
  let confidence = 50;
  let reasoning = "";
  let signals = [];
  let gaps = [];
  let riskFlags = [];
  let nextAction = "";
  let frameworkCriteria = [];

  // Determine stage based on notes keywords
  let notesDeducedStage = tenant.stages[0].name;
  const stagesCount = tenant.stages.length;

  if (text.includes('lost') || text.includes('closed lost') || text.includes('won') || text.includes('closed won') || text.includes('closed') || text.includes('onboard') || text.includes('done')) {
    notesDeducedStage = tenant.stages[stagesCount - 1].name; // Last stage (e.g. Closed)
  } else if (text.includes('booking') || text.includes('signature') || text.includes('signed') || text.includes('retainer approval') || text.includes('invoice') || text.includes('purchase order') || text.includes('po')) {
    notesDeducedStage = tenant.stages[stagesCount - 2]?.name || tenant.stages[stagesCount - 1].name; // Second-to-last stage
  } else if (text.includes('redline') || text.includes('legal') || text.includes('valdoshia') || text.includes('compliance') || text.includes('security')) {
    notesDeducedStage = tenant.stages[3]?.name || tenant.stages[2]?.name || tenant.stages[0].name;
  } else if (text.includes('proposal') || text.includes('pricing') || text.includes('quote') || text.includes('$') || text.includes('cost') || text.includes('proposition')) {
    notesDeducedStage = tenant.stages[2]?.name || tenant.stages[1]?.name || tenant.stages[0].name;
  } else if (text.includes('trial') || text.includes('recommendation') || text.includes('results') || text.includes('demo') || text.includes('feedback')) {
    notesDeducedStage = tenant.stages[1]?.name || tenant.stages[0].name;
  }

  matchingStage = notesDeducedStage;

  // 1. Framework scoring
  if (frameworkType === 'meddic') {
    const hasChampion = text.includes('sarah') || text.includes('dr. thorne') || text.includes('champion') || text.includes('dr. jenkins') || text.includes('will') || text.includes('valdoshia');
    const hasEB = text.includes('cfo') || text.includes('robert') || text.includes('chen') || text.includes('buyer') || text.includes('terrence') || text.includes('provost');
    const hasMetrics = text.includes('%') || text.includes('throughput') || text.includes('dollars') || text.includes('$') || text.includes('pricing');
    const hasPain = text.includes('bottleneck') || text.includes('slow') || text.includes('problem') || text.includes('budget conscious') || text.includes('unl going away');
    const hasCriteria = text.includes('security') || text.includes('it review') || text.includes('compliance') || text.includes('redlines') || text.includes('ip ownership');
    const hasProcess = text.includes('timeline') || text.includes('process') || text.includes('monthly') || text.includes('next steps') || text.includes('roundtable');

    frameworkCriteria = [
      { key: "metrics", label: "Metrics", status: hasMetrics ? "confirmed" : "missing", evidence: hasMetrics ? "Pricing parameters mapped ($46K-$52K ACV / trial stats)." : "No quantified ROI or financial metrics discussed." },
      { key: "economic_buyer", label: "Economic Buyer", status: hasEB ? "confirmed" : "missing", evidence: hasEB ? "Identified decision-maker or budget owner (Provost / Library Director Dr. Terrence Martin)." : "No budget owner or signer directly engaged." },
      { key: "decision_criteria", label: "Decision Criteria", status: hasCriteria ? "confirmed" : "missing", evidence: hasCriteria ? "IT security compliance and IP ownership redlines referenced." : "No explicit purchase/eval criteria stated." },
      { key: "decision_process", label: "Decision Process", status: hasProcess ? "confirmed" : "partial", evidence: hasProcess ? "Timeline mapped to Provost monthly meeting & HBCU roundtables." : "Vague or unmapped decision process." },
      { key: "identify_pain", label: "Identify Pain", status: hasPain ? "confirmed" : "missing", evidence: hasPain ? "Institutional need to upgrade due to 'unlimited access going away' bottleneck." : "No core workflow bottleneck documented." },
      { key: "champion", label: "Champion", status: hasChampion ? "confirmed" : "missing", evidence: hasChampion ? "Faculty champions (Dr. Sarah Jenkins / Dr. Will Waldron) advocating internally." : "No internal champion driving the deal." }
    ];

    const confirmedCount = frameworkCriteria.filter(c => c.status === 'confirmed').length;
    confidence = Math.min(30 + confirmedCount * 12, 95);

    if (text.includes('lost') || text.includes('closed lost') || text.includes('bummer') || text.includes('failed')) {
      reasoning = `The deal is classified as Closed Lost. The meeting notes state that the opportunity has been lost (evaluating other vendors, etc.). The relationship remains strong, but no further sales actions are active.`;
      signals = ["Maintained relationship with contact"];
      gaps = ["Post-mortem review not scheduled"];
      riskFlags = ["Opportunity Lost"];
      nextAction = "Schedule a post-mortem call to gather feedback.";
    } else if (text.includes('won') || text.includes('closed won') || text.includes('booking') || text.includes('signed')) {
      reasoning = `The deal has been successfully Closed Won. The contract is signed, and the client onboarding handoff is underway.`;
      signals = ["Contract signed", "Buyer approved subscription/deal"];
      gaps = [];
      riskFlags = [];
      nextAction = "Complete onboarding sequence and transition account to Customer Success.";
    } else if (text.includes('redline') || text.includes('legal') || text.includes('valdoshia')) {
      reasoning = `The deal is currently in ${matchingStage} due to active IP ownership redlines. While we have a strong Academic Champion (Director), we are single-threaded on the legal clearance path.`;
      signals = ["Champion validated in R&D team", "NDA signed and initial testing complete"];
      gaps = ["No response from Business Champion regarding legal escalations", "Economic buyer has not intervened"];
      riskFlags = ["Legal redline friction", "Single-threaded contact"];
      nextAction = "Request an executive alignment call with the Champion to resolve indemnification disputes.";
    } else if (hasChampion && hasEB && hasMetrics) {
      reasoning = `Validation successful and the Champion is preparing to present to the Economic Buyer. Deal is positioned in ${matchingStage} pending budget sign-off.`;
      signals = ["Budget parameters confirmed", "Champion is presenting validation results internally"];
      gaps = ["IT security review pending", "Direct engagement with Economic Buyer"];
      riskFlags = ["No direct access to budget owner"];
      nextAction = "Send the security/compliance documentation packet today to clear the IT security gate.";
    } else {
      reasoning = `Initial scoping completed. Client is facing high-urgency bottlenecks, suggesting alignment on pain. Deal resides in ${matchingStage} while we draft the NDA.`;
      signals = ["Access bottleneck is top priority", "Champion agreed to evaluate a data trial"];
      gaps = ["No budget details shared yet", "No formal contract drafted"];
      riskFlags = ["Early-stage discovery"];
      nextAction = "Deliver the standard NDA template today and confirm the follow-up meeting date.";
    }

  } else if (frameworkType === 'bant') {
    const hasB = text.includes('$') || text.includes('budget') || text.includes('cost') || text.includes('price');
    const hasA = text.includes('owner') || text.includes('chief') || text.includes('VP') || text.includes('decision');
    const hasN = text.includes('scheduling') || text.includes('efficiency') || text.includes('pain') || text.includes('problem');
    const hasT = text.includes('month') || text.includes('quarter') || text.includes('timeline') || text.includes('date');

    frameworkCriteria = [
      { key: "budget", label: "Budget", status: hasB ? "confirmed" : "missing", evidence: hasB ? "Stated budget range or financial capability." : "No budget numbers shared." },
      { key: "authority", label: "Authority", status: hasA ? "confirmed" : "missing", evidence: hasA ? "Identified decision-maker or committee heads." : "No clear authority path mapped." },
      { key: "need", label: "Need", status: hasN ? "confirmed" : "missing", evidence: hasN ? "Identified core workflow inefficiency." : "No explicit clinical/business need." },
      { key: "timeline", label: "Timeline", status: hasT ? "confirmed" : "missing", evidence: hasT ? "Stated timeline or target launch date." : "No clear decision schedule." }
    ];

    const confirmedCount = frameworkCriteria.filter(c => c.status === 'confirmed').length;
    confidence = Math.min(25 + confirmedCount * 18, 90);

    if (text.includes('lost') || text.includes('closed lost') || text.includes('bummer') || text.includes('failed')) {
      reasoning = `Deal classified as Closed Lost. The opportunity has failed qualification or was lost to alternative solutions.`;
      signals = [];
      gaps = ["Reason for loss documentation pending"];
      riskFlags = ["Lead Lost"];
      nextAction = "Update account status to Lost and set up nurture follow-up in CRM.";
    } else if (text.includes('won') || text.includes('closed won') || text.includes('booking') || text.includes('signed')) {
      reasoning = `Deal closed and won. Software licenses and terms are finalized and signed.`;
      signals = ["Signed contract", "Budget approved"];
      gaps = [];
      riskFlags = [];
      nextAction = "Configure customer software workspace and send login credentials.";
    } else if (confirmedCount >= 3) {
      reasoning = `A clear budget has been confirmed ($30K) and the Chief of Cardiology (Authority) has requested a demo. This deal is solidifying in ${matchingStage}.`;
      signals = ["Budget confirmed up to $30K", "Chief actively engaged"];
      gaps = ["Security review not yet started", "Procurement process unmapped"];
      riskFlags = ["Procurement department gatekeepers"];
      nextAction = "Schedule the live product demo with the operations team.";
    } else {
      reasoning = `Early discovery call. Some pain was identified regarding missed appointments, but budget and timeline remain unconfirmed.`;
      signals = ["Clinician expressed interest in scheduling optimization"];
      gaps = ["Budget scope unconfirmed", "Timeline undefined"];
      riskFlags = ["Early lead qualification"];
      nextAction = "Engage department head in discovery call to confirm budget cycles.";
    }
  } else {
    // SPIN
    const hasS = text.includes('ceo') || text.includes('founder') || text.includes('Apex') || text.includes('setup');
    const hasP = text.includes('threat') || text.includes('sued') || text.includes('patent') || text.includes('problem');
    const hasI = text.includes('derail') || text.includes('funding') || text.includes('risk') || text.includes('consequence');
    const hasN = text.includes('opinion') || text.includes('retainer') || text.includes('immediately');

    frameworkCriteria = [
      { key: "situation", label: "Situation", status: hasS ? "confirmed" : "missing", evidence: hasS ? "Gathered context on Apex Labs patent status." : "No background context." },
      { key: "problem", label: "Problem", status: hasP ? "confirmed" : "missing", evidence: hasP ? "Threat of competitor patent infringement." : "No dissatisfaction stated." },
      { key: "implication", label: "Implication", status: hasI ? "confirmed" : "missing", evidence: hasI ? "Infringement lawsuit would derail funding round." : "No business consequences explored." },
      { key: "need_payoff", label: "Need-payoff", status: hasN ? "confirmed" : "missing", evidence: hasN ? "Thomas requested immediate FTO draft." : "No value statement made." }
    ];

    const confirmedCount = frameworkCriteria.filter(c => c.status === 'confirmed').length;
    confidence = Math.min(20 + confirmedCount * 20, 95);

    if (text.includes('lost') || text.includes('closed lost') || text.includes('bummer') || text.includes('failed')) {
      reasoning = `Opportunity marked as Closed Lost. Client engagement has terminated without retainer agreement.`;
      signals = [];
      gaps = ["Competitor selection feedback missing"];
      riskFlags = ["Opportunity Lost"];
      nextAction = "Perform internal audit of lost deal objections.";
    } else if (text.includes('won') || text.includes('closed won') || text.includes('booking') || text.includes('signed')) {
      reasoning = `Engagement retainer successfully completed and signed by both parties.`;
      signals = ["Retainer paid", "Conflicts cleared"];
      gaps = [];
      riskFlags = [];
      nextAction = "Open case files and schedule initial strategy session.";
    } else if (hasI && hasN) {
      reasoning = `High-implied risk (funding round failure) has driven urgent buyer need. Deal is positioned in ${matchingStage} pending conflicts check.`;
      signals = ["Thomas stated cost is irrelevant to risk", "Urgent timeline"];
      gaps = ["Conflict check clearing pending", "Signed retainer agreement"];
      riskFlags = ["Extremely tight timeline", "Active competitor threat"];
      nextAction = "Run internal legal conflict checks immediately and deliver the engagement letter.";
    } else {
      reasoning = `Initial legal consultation completed. Client situation is documented but implication and value payoffs have not been deep-dived.`;
      signals = ["Thomas outlined business structure"];
      gaps = ["Implication of lawsuit unmapped", "Price sensitivity unknown"];
      riskFlags = ["Low urgency scoping"];
      nextAction = "Prompt Thomas to discuss potential funding impact of unresolved IP disputes.";
    }
  }

  // 2. Perform database audit checks and inject mismatches dynamically
  if (crmContext && Object.keys(crmContext).length > 0) {
    const crmStage = crmContext.stage;
    const crmAmount = crmContext.amount || '';
    const crmCloseDate = crmContext.closeDate || '';

    // Check 1: Stage Discrepancy
    if (crmStage && crmStage !== matchingStage) {
      confidence = Math.max(10, confidence - 25); // Deduct 25 confidence points for mismatch
      reasoning = `⚠️ STAGE MISMATCH: CRM database lists stage as "${crmStage}", but AI analysis of the meeting notes indicates the deal is actually at "${matchingStage}". ${reasoning}`;
      riskFlags.push("CRM Stage Mismatch");
      gaps.push(`Verify why CRM is set to '${crmStage}' when notes indicate '${matchingStage}'`);
    }

    // Check 2: Amount Audit (UAH $46K vs custom value)
    if (crmAmount && text.includes('$') && !crmAmount.includes('N/A')) {
      const numericCrmAmount = parseFloat(crmAmount.replace(/[^0-9.]/g, ''));
      let notesAmount = 0;
      if (text.includes('$46,282.50')) notesAmount = 46282.5;
      if (text.includes('$52,900.00')) notesAmount = 52900.0;
      if (text.includes('$30,000.00')) notesAmount = 30000.0;
      if (text.includes('$15,000.00')) notesAmount = 15000.0;

      if (notesAmount > 0 && Math.abs(numericCrmAmount - notesAmount) > 100) {
        confidence = Math.max(10, confidence - 15);
        reasoning = `⚠️ BUDGET GAP: CRM Amount is set to ${crmAmount}, but rep notes explicitly reference pricing of $${notesAmount.toLocaleString()}. ${reasoning}`;
        riskFlags.push("Budget Mismatch");
        gaps.push(`CRM opportunity value ($${numericCrmAmount.toLocaleString()}) does not match quoted pricing ($${notesAmount.toLocaleString()})`);
      }
    }

    // Check 3: Tight Close Date Verification
    if (crmCloseDate && !crmCloseDate.includes('N/A')) {
      // If notes contain 'stalled' or 'pushback' and close date is very close (implied)
      if (text.includes('redline') || text.includes('legal') || text.includes('pushback')) {
        confidence = Math.max(10, confidence - 10);
        reasoning = `⚠️ CLOSE DATE RISK: Deal has stuck legal redlines but CRM Close Date is locked on ${crmCloseDate}. ${reasoning}`;
        riskFlags.push("Close Date Risk");
        gaps.push(`Validate Close Date (${crmCloseDate}) credibility against active legal bottlenecks`);
      }
    }
  }

  // Adjust label
  let label = "Medium";
  if (confidence > 70) label = "High";
  if (confidence < 40) label = "Low";

  return {
    stage: matchingStage,
    confidence_score: confidence,
    confidence_label: label,
    reasoning: reasoning,
    signals_found: signals,
    missing_or_ambiguous: gaps,
    recommended_next_action: nextAction,
    risk_flags: riskFlags,
    framework_criteria: frameworkCriteria
  };
}
