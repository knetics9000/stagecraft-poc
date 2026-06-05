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
- Quote Date: ${crmContext.quoteDate || 'N/A'}
- Quote Delivered: ${crmContext.quoteDelivered || 'false'}
- Decision Date: ${crmContext.decisionDate || 'N/A'}
- Opportunity Description: ${crmContext.description || 'N/A'}
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
   - Proposal/Quote Audits: Compare the Close Date against the Quote Date, Quote Delivered status, and Decision Date. If the Close Date is close (e.g. within 15 days of the current date of June 5, 2026), but Quote Delivered is 'false' or Quote Date is missing/empty, this is a severe deal risk. Raise a critical flag (e.g. "Close Date Risk" or "No Proposal Delivered"), deduct confidence, and explain this in the reasoning. If the client's Decision Date is scheduled after the opportunity Close Date, raise a "Timeline Conflict" risk flag.
   - Budget Audits: Does the CRM Amount match notes budget discussions?
   - If there are mismatches, explain them in the "reasoning", add them as critical gaps to "missing_or_ambiguous", and generate warning flags in "risk_flags" (e.g. "CRM Stage Mismatch", "Close Date Risk", "Amount Discrepancy", "No Proposal Delivered", "Timeline Conflict").
4. Compute a confidence score (integer between 0 and 100) based on criteria coverage and database alignment. If there are massive database/notes discrepancies, reduce the confidence score significantly.
5. Draft a sales-manager-style reasoning (2-4 sentences) explaining why you assigned this stage, citing signals, deficiencies, and any CRM field misalignments.
6. Extract a list of "signals_found" (explicit positive markers) and "missing_or_ambiguous" data gaps.
7. Provide a single "recommended_next_action" that target-addresses the most critical framework gap (e.g. if Champion is missing, action should focus on finding one).
8. Flag deal risks in "risk_flags" (e.g., single-threaded, timeline slippage, redline delays, database discrepancies).
9. Provide an array of "coaching_playbook" containing a structured action plan for every gap in the opportunity record. For each gap, you must provide: gap_key, missing_info, importance, recommended_action, target_contact, timing, suggested_questions (an array of 3-4 specific open-ended discovery questions), communication_guidance, and desired_outcome.

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
  "coaching_playbook": [
    {
      "gap_key": "champion" | "pain" | "economic_buyer" | "metrics" | "decision_criteria" | "decision_process" | "budget" | "authority" | "need" | "timeline",
      "missing_info": "Primary Business Pain Point",
      "importance": "Why this information is important for the deal",
      "recommended_action": "Specific next action for the representative",
      "target_contact": "Who to contact",
      "timing": "When to contact them (e.g. Within 24 hours, Next 3 days)",
      "suggested_questions": [
        "Discovery question 1",
        "Discovery question 2"
      ],
      "communication_guidance": "How to approach the conversation / tone / style",
      "desired_outcome": "Expected outcome of this action"
    }
  ],
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
      coaching_playbook: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            gap_key: { type: "STRING" },
            missing_info: { type: "STRING" },
            importance: { type: "STRING" },
            recommended_action: { type: "STRING" },
            target_contact: { type: "STRING" },
            timing: { type: "STRING" },
            suggested_questions: { type: "ARRAY", items: { type: "STRING" } },
            communication_guidance: { type: "STRING" },
            desired_outcome: { type: "STRING" }
          },
          required: [
            "gap_key",
            "missing_info",
            "importance",
            "recommended_action",
            "target_contact",
            "timing",
            "suggested_questions",
            "communication_guidance",
            "desired_outcome"
          ]
        }
      },
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
      "coaching_playbook",
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

const parseDateMDY = (str) => {
  if (!str || str === 'N/A') return null;
  const parts = str.split('/');
  if (parts.length === 3) {
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    return new Date(year, month - 1, day);
  }
  return null;
};

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
  let coachingPlaybook = [];

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
      coachingPlaybook = [
        {
          gap_key: "timeline",
          missing_info: "Competitor Decision & Post-Mortem Feedback",
          importance: "Documenting the exact criteria why we were deselected (pricing, product scope, or champion advocacy) is essential for refining our sales motion.",
          recommended_action: "Reach out to Dan for a brief, friendly post-mortem conversation.",
          target_contact: "Dan (Primary Contact)",
          timing: "Within 48 hours",
          suggested_questions: [
            "What were the key deciding factors that led your committee to select the alternative vendor?",
            "Is there any feedback you can share on our proposal or trial process that would help us improve?"
          ],
          communication_guidance: "Friendly, humble, and completely non-defensive. Focus entirely on self-improvement and learning.",
          desired_outcome: "Acquire concrete reasons for loss and log them in the opportunity file."
        }
      ];
    } else if (text.includes('won') || text.includes('closed won') || text.includes('booking') || text.includes('signed')) {
      reasoning = `The deal has been successfully Closed Won. The contract is signed, and the client onboarding handoff is underway.`;
      signals = ["Contract signed", "Buyer approved subscription/deal"];
      gaps = [];
      riskFlags = [];
      nextAction = "Complete onboarding sequence and transition account to Customer Success.";
      coachingPlaybook = [
        {
          gap_key: "decision_process",
          missing_info: "Onboarding & Implementation Scoping",
          importance: "Smooth handoff from Sales to Customer Success is critical to prevent early churn and secure long-term adoption.",
          recommended_action: "Coordinate an internal hand-off sync with the Customer Success Specialist and share meeting summaries.",
          target_contact: "CS Specialist (Noelia Gorod)",
          timing: "Within 24 hours",
          suggested_questions: [
            "What is the client's target activation date for the scientific video portal?",
            "Are there specific faculty members who requested immediate training sessions?"
          ],
          communication_guidance: "Professional and collaborative. Ensure all custom package details are logged in the handoff document.",
          desired_outcome: "Establish a clear implementation path and schedule the CS onboarding meeting."
        }
      ];
    } else if (text.includes('redline') || text.includes('legal') || text.includes('valdoshia')) {
      reasoning = `The deal is currently in ${matchingStage} due to active IP ownership redlines. While we have a strong Academic Champion (Director), we are single-threaded on the legal clearance path.`;
      signals = ["Champion validated in R&D team", "NDA signed and initial testing complete"];
      gaps = ["No response from Business Champion regarding legal escalations", "Economic buyer has not intervened"];
      riskFlags = ["Legal redline friction", "Single-threaded contact"];
      nextAction = "Request an executive alignment call with the Champion to resolve indemnification disputes.";
      coachingPlaybook = [
        {
          gap_key: "decision_process",
          missing_info: "Legal Review & IP Clearance",
          importance: "The contract is currently stalled in legal review. We must clear the IP ownership gate before Dr. Terrence Martin can sign.",
          recommended_action: "Set up a tripartite legal review call with Valdoshia Hunt and our internal compliance officer.",
          target_contact: "Valdoshia Hunt (University Legal Counsel)",
          timing: "Within 24 hours",
          suggested_questions: [
            "What specific clauses in our standard IP ownership terms are causing concern for CAU's procurement guidelines?",
            "Can we review our standard educational license addendum to see if it satisfies your board's indemnity requirements?"
          ],
          communication_guidance: "Collaborative and solution-oriented. Frame the discussion around finding a standard compromise addendum rather than arguing contract clauses.",
          desired_outcome: "Agree on modified IP terms and schedule final approval date."
        },
        {
          gap_key: "economic_buyer",
          missing_info: "Economic Buyer Alignment (Library Director)",
          importance: "While legal reviews the contract, keeping the Library Director engaged prevents the deal from stalling or losing executive urgency.",
          recommended_action: "Send a brief status update email to Dr. Terrence Martin outlining the progress on the legal review.",
          target_contact: "Dr. Terrence Martin (Library Director)",
          timing: "Next 48 hours",
          suggested_questions: [
            "Are there any additional departments or faculty members who have requested access to the Core: A&P module since our last meeting?",
            "Would it be helpful to have a quick alignment sync once Val reviews the revised IP draft?"
          ],
          communication_guidance: "Brief, professional, and reassuring. Keep the Library Director informed of progress to maintain deal velocity.",
          desired_outcome: "Ensure Dr. Martin remains aligned and ready to sign the agreement once legal clears the terms."
        }
      ];
    } else if (hasChampion && hasEB && hasMetrics) {
      reasoning = `Validation successful and the Champion is preparing to present to the Economic Buyer. Deal is positioned in ${matchingStage} pending budget sign-off.`;
      signals = ["Budget parameters confirmed", "Champion is presenting validation results internally"];
      gaps = ["IT security review pending", "Direct engagement with Economic Buyer"];
      riskFlags = ["No direct access to budget owner"];
      nextAction = "Send the security/compliance documentation packet today to clear the IT security gate.";
      coachingPlaybook = [
        {
          gap_key: "economic_buyer",
          missing_info: "Economic Buyer Engagement (Provost)",
          importance: "Securing the Provost's alignment is critical because the library budget is capped and the Provost holds final approval on multi-department upgrades.",
          recommended_action: "Ask David Moore to coordinate a brief 10-minute briefing call with the Provost's office before their monthly review next week.",
          target_contact: "David Moore (Social Sciences Librarian)",
          timing: "Within the next 24 hours",
          suggested_questions: [
            "How can we help prepare your presentation to the Provost so the educational value of the Physics and Engineering bundle is clear?",
            "Would the Provost be open to a 10-minute briefing on how other institutions in the system realized a 30% increase in research throughput using JoVE?"
          ],
          communication_guidance: "Position yourself as a supportive partner helping David prepare for his monthly review. Frame the request around reducing David's workload and providing executive-ready slides.",
          desired_outcome: "Secure an introduction or a joint briefing call with the Provost."
        },
        {
          gap_key: "metrics",
          missing_info: "Quantified Departmental ROI Metrics",
          importance: "Without clear usage value metrics from the Physics & Engineering faculty, the library cannot justify the incremental spend to the Provost.",
          recommended_action: "Reach out to faculty champion Will Waldron to gather specific classroom usage projections.",
          target_contact: "Dr. Will Waldron (Physics Faculty Champion)",
          timing: "Within 3 days",
          suggested_questions: [
             "How many undergraduate students do you project will use the new Physics lab modules in the upcoming fall semester?",
             "What specific curriculum areas are currently suffering from a lack of high-quality scientific video content?"
          ],
          communication_guidance: "Maintain a consultative, educational tone. Faculty champions are busy, so keep questions focused on their curriculum alignment and student learning outcomes.",
          desired_outcome: "Obtain a projected student reach figure and a quote on class performance impact to insert into the library proposal."
        }
      ];
    } else {
      reasoning = `Initial scoping completed. Client is facing high-urgency bottlenecks, suggesting alignment on pain. Deal resides in ${matchingStage} while we draft the NDA.`;
      signals = ["Access bottleneck is top priority", "Champion agreed to evaluate a data trial"];
      gaps = ["No budget details shared yet", "No formal contract drafted"];
      riskFlags = ["Early-stage discovery"];
      nextAction = "Deliver the standard NDA template today and confirm the follow-up meeting date.";
      coachingPlaybook = [
        {
          gap_key: "champion",
          missing_info: "Faculty Champion Recommendations",
          importance: "Academic sales require strong faculty demand to justify library purchases. We must identify and arm science faculty champions to lobby the library.",
          recommended_action: "Reach out to researchers who accessed the free trials to request formal recommendation submissions.",
          target_contact: "Faculty Trial Users (Science/Nursing)",
          timing: "Within 3 days",
          suggested_questions: [
            "How has the video database impacted your lab preparation or classroom instruction during the trial period?",
            "Would you be willing to submit a brief recommendation form to the library dean advocating for our subscription?"
          ],
          communication_guidance: "Helpful and educational. Emphasize that their feedback is vital for the library to allocate budget for resources they need.",
          desired_outcome: "Secure at least three formal faculty recommendations to submit to the library."
        }
      ];
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
      coachingPlaybook = [
        {
          gap_key: "timeline",
          missing_info: "Post-Mortem Competitor Feedback",
          importance: "Understanding why the cardiology department went with another vendor helps us refine our clinical software packaging.",
          recommended_action: "Reach out to Dr. Marcus to request a brief post-mortem phone call.",
          target_contact: "Dr. Marcus (Chief of Cardiology)",
          timing: "Within 48 hours",
          suggested_questions: [
            "What were the deciding factors that led you to choose the alternative scheduler solution?",
            "Is there any feedback on our clinical demo or product features you'd suggest we improve?"
          ],
          communication_guidance: "Humble and non-defensive. Frame the request entirely as a feedback loop to improve clinical services.",
          desired_outcome: "Document reasons for loss in CRM database."
        }
      ];
    } else if (text.includes('won') || text.includes('closed won') || text.includes('booking') || text.includes('signed')) {
      reasoning = `Deal closed and won. Software licenses and terms are finalized and signed.`;
      signals = ["Signed contract", "Budget approved"];
      gaps = [];
      riskFlags = [];
      nextAction = "Configure customer software workspace and send login credentials.";
      coachingPlaybook = [
        {
          gap_key: "timeline",
          missing_info: "Implementation & Account Configuration",
          importance: "Prompt clinical setup ensures early software adoption by doctors and nurses, leading to successful contract renewals.",
          recommended_action: "Contact Valley Health IT to schedule the clinical workspace setup.",
          target_contact: "Cardiology Operations Manager",
          timing: "Within 24 hours",
          suggested_questions: [
            "What is the ideal time to run the first training session for the nursing staff?",
            "Do we have the IT contact who will manage the software integration?"
          ],
          communication_guidance: "Helpful, organized, and technical. Share a clear implementation checklist.",
          desired_outcome: "Secure IT contact details and schedule clinical training."
        }
      ];
    } else if (confirmedCount >= 3) {
      reasoning = `A clear budget has been confirmed ($30K) and the Chief of Cardiology (Authority) has requested a demo. This deal is solidifying in ${matchingStage}.`;
      signals = ["Budget confirmed up to $30K", "Chief actively engaged"];
      gaps = ["Security review not yet started", "Procurement process unmapped"];
      riskFlags = ["Procurement department gatekeepers"];
      nextAction = "Schedule the live product demo with the operations team.";
      coachingPlaybook = [
        {
          gap_key: "timeline",
          missing_info: "Procurement Process & IT Security Gate",
          importance: "Dr. Marcus is the clinical decision-maker, but the hospital procurement department will run a separate security and pricing audit which can delay the deal by months.",
          recommended_action: "Ask Dr. Marcus for an introduction to the hospital IT procurement manager during the June 8 demo.",
          target_contact: "Dr. Marcus (Chief of Cardiology)",
          timing: "During the June 8 Demo",
          suggested_questions: [
            "What is the typical timeline for security reviews once the department approves a clinical software trial?",
            "Who is the designated IT security analyst we should send our HIPAA compliance packet to?"
          ],
          communication_guidance: "Professional and compliance-focused. Emphasize that we have a pre-packaged HIPAA compliance booklet ready to submit to help speed up their internal review.",
          desired_outcome: "Map out the procurement timeline and get the contact details of the security auditor."
        }
      ];
    } else {
      reasoning = `Early discovery call. Some pain was identified regarding missed appointments, but budget and timeline remain unconfirmed.`;
      signals = ["Clinician expressed interest in scheduling optimization"];
      gaps = ["Budget scope unconfirmed", "Timeline undefined"];
      riskFlags = ["Early lead qualification"];
      nextAction = "Engage department head in discovery call to confirm budget cycles.";
      coachingPlaybook = [
        {
          gap_key: "budget",
          missing_info: "Budget Scope & Approval Limits",
          importance: "Before spending weeks on clinical demos, we must qualify that Valley Health has software budget allocations for the cardiology department.",
          recommended_action: "Schedule a discovery call with the cardiology operations manager to confirm budget approval limits.",
          target_contact: "Clinical Operations Manager",
          timing: "Within 3 days",
          suggested_questions: [
            "Do you have a dedicated budget allocated for patient scheduling software this fiscal year?",
            "What is the standard authorization limit for departmental purchases before requiring CFO sign-off?"
          ],
          communication_guidance: "Direct and professional. Frame it as aligning the software proposal with their budget boundaries.",
          desired_outcome: "Confirm budget availability and executive authorization thresholds."
        }
      ];
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
      coachingPlaybook = [
        {
          gap_key: "timeline",
          missing_info: "Post-Mortem Consultation Scoping",
          importance: "Understanding why the CEO selected alternative counsel provides crucial insights for our IP litigation scoping.",
          recommended_action: "Contact Thomas to request a brief post-mortem consultation.",
          target_contact: "Thomas (CEO of Apex Labs)",
          timing: "Within 48 hours",
          suggested_questions: [
            "Which firm was selected to represent Apex Labs in the upcoming patent dispute, and what drove that decision?",
            "How can we improve our initial conflict-clearing or proposal process for clients in the biotech space?"
          ],
          communication_guidance: "Objective, professional, and respectful. Focus entirely on client service feedback.",
          desired_outcome: "Log competitor selection reasons in case archives."
        }
      ];
    } else if (text.includes('won') || text.includes('closed won') || text.includes('booking') || text.includes('signed')) {
      reasoning = `Engagement retainer successfully completed and signed by both parties.`;
      signals = ["Retainer paid", "Conflicts cleared"];
      gaps = [];
      riskFlags = [];
      nextAction = "Open case files and schedule initial strategy session.";
      coachingPlaybook = [
        {
          gap_key: "timeline",
          missing_info: "Engagement Letter & Case Initialization",
          importance: "Formally opening the legal files and conducting conflicts clearance is required before legal representation can begin.",
          recommended_action: "Send the final signed engagement letter to the administrative head.",
          target_contact: "Apex Labs Administrative Lead",
          timing: "Within 24 hours",
          suggested_questions: [
            "Who is the main contact for billing and invoice records?",
            "Can you upload the competitor's patent dispute letter to our secure file server?"
          ],
          communication_guidance: "Detailed, structured, and legally precise.",
          desired_outcome: "Receive the retainer payment and initialize the active IP defense file."
        }
      ];
    } else if (hasI && hasN) {
      reasoning = `High-implied risk (funding round failure) has driven urgent buyer need. Deal is positioned in ${matchingStage} pending conflicts check.`;
      signals = ["Thomas stated cost is irrelevant to risk", "Urgent timeline"];
      gaps = ["Conflict check clearing pending", "Signed retainer agreement"];
      riskFlags = ["Extremely tight timeline", "Active competitor threat"];
      nextAction = "Run internal legal conflict checks immediately and deliver the engagement letter.";
      coachingPlaybook = [
        {
          gap_key: "implication",
          missing_info: "Investor Due Diligence Timeline & Exposure",
          importance: "Understanding the exact date and terms of the Series A due diligence is vital because our FTO opinion must be delivered before the lead investor's board review.",
          recommended_action: "Follow up with Thomas today to align our conflict-clearance and FTO delivery timeline with their funding schedule.",
          target_contact: "Thomas (CEO of Apex Labs)",
          timing: "Within the next 24 hours",
          suggested_questions: [
            "When does your lead investor begin their formal IP due diligence audit?",
            "Has the investor's counsel requested a formal Freedom to Operate (FTO) letter, or is this a proactive defense strategy for your board?"
          ],
          communication_guidance: "Maintain a high-urgency, authoritative, yet supportive counsel tone. Focus on protecting their upcoming funding round.",
          desired_outcome: "Lock in the FTO opinion delivery date and secure the list of investor entities for conflict clearing."
        }
      ];
    } else {
      reasoning = `Initial legal consultation completed. Client situation is documented but implication and value payoffs have not been deep-dived.`;
      signals = ["Thomas outlined business structure"];
      gaps = ["Implication of lawsuit unmapped", "Price sensitivity unknown"];
      riskFlags = ["Low urgency scoping"];
      nextAction = "Prompt Thomas to discuss potential funding impact of unresolved IP disputes.";
      coachingPlaybook = [
        {
          gap_key: "problem",
          missing_info: "Litigation Pain & Competitor Patent Scoping",
          importance: "We must scope the exact patent claims the competitor is raising to estimate the legal hours required for a Freedom to Operate (FTO) opinion.",
          recommended_action: "Schedule a technical scoping session with Apex Labs' lead scientific founder.",
          target_contact: "Apex Labs Scientific Lead",
          timing: "Within 3 days",
          suggested_questions: [
            "What specific patent claims are the competitor raising, and how does your core molecular catalog overlap with those claims?",
            "Have you received a formal cease-and-desist letter, or has the competitor only made informal inquiries?"
          ],
          communication_guidance: "Technical, precise, and highly analytical. Focus on scientific details and evidence.",
          desired_outcome: "Gather competitor patent documents and outline the initial FTO search scope."
        }
      ];
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

      // Quote / Proposal Delivery audit & Timeline checks
      const closeDateObj = parseDateMDY(crmCloseDate);
      const today = new Date(2026, 5, 5); // anchor date June 5, 2026 as per local context time
      if (closeDateObj) {
        const timeDiff = closeDateObj.getTime() - today.getTime();
        const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        const quoteDelivered = crmContext.quoteDelivered === 'true' || crmContext.quoteDelivered === true || crmContext.quoteDelivered === 'Yes';
        const quoteDate = crmContext.quoteDate || '';
        const decisionDate = crmContext.decisionDate || '';

        // Rule A: Close Date is close, but quote not delivered
        if (daysRemaining >= 0 && daysRemaining <= 15 && (!quoteDelivered || !quoteDate)) {
          confidence = Math.max(10, confidence - 20);
          reasoning = `⚠️ PROPOSAL DELAY: Close Date is scheduled for ${crmCloseDate} (${daysRemaining} days away), but no pricing quote or proposal has been delivered to the client. ${reasoning}`;
          riskFlags.push("No Proposal Delivered");
          gaps.push(`CRM Close Date is very close (${crmCloseDate}, ${daysRemaining} days away) but Quote Delivered is not checked`);
          
          coachingPlaybook.unshift({
            gap_key: "timeline",
            missing_info: "Pricing Quote / Proposal Delivery",
            importance: `The opportunity Close Date is scheduled in ${daysRemaining} days, but no proposal or quote has been marked as delivered. A deal cannot close without a delivered proposal.`,
            recommended_action: `Reach out to the client and deliver the proposal within the next 24 hours.`,
            target_contact: crmContext.owner || "Primary Contact",
            timing: "Within 24 hours",
            suggested_questions: [
              `How is your close date ${crmCloseDate} (${daysRemaining} days away) and you haven't submitted a proposal yet?`,
              `Have you received and reviewed our pricing proposal yet?`,
              `What specific revisions or adjustments do we need to make to the pricing package to align with your budget?`
            ],
            communication_guidance: "Urgent and professional. Emphasize that we want to ensure they have the proposal for their upcoming review cycle.",
            desired_outcome: "Deliver the proposal and lock in a review sync date."
          });
        }

        // Rule B: Decision Date is scheduled after Close Date
        if (decisionDate && decisionDate !== 'N/A') {
          const decisionDateObj = parseDateMDY(decisionDate);
          if (decisionDateObj && decisionDateObj.getTime() > closeDateObj.getTime()) {
            confidence = Math.max(10, confidence - 15);
            reasoning = `⚠️ TIMELINE CONFLICT: Client decision date (${decisionDate}) is scheduled after opportunity Close Date (${crmCloseDate}). ${reasoning}`;
            riskFlags.push("Timeline Conflict");
            gaps.push(`Crossover timelines: Decision Date (${decisionDate}) is after Close Date (${crmCloseDate})`);

            coachingPlaybook.unshift({
              gap_key: "timeline",
              missing_info: "Close Date / Decision Date Alignment",
              importance: `The opportunity Close Date in the CRM is set to ${crmCloseDate}, but the client's decision date is not until ${decisionDate}. The CRM Close Date must be updated to align with the real decision schedule.`,
              recommended_action: `Adjust the opportunity Close Date in the CRM database to a date after the decision date, or align with the client on an expedited decision.`,
              target_contact: crmContext.owner || "Sales Operations",
              timing: "Immediate",
              suggested_questions: [
                `Is there any process or board approval we can run in parallel to expedite the decision date before the close date?`,
                `Would you like to adjust the target launch schedule to align with the decision cycle?`
              ],
              communication_guidance: "Administrative / internal alignment. Update the CRM database fields to reflect correct pipeline metrics.",
              desired_outcome: "Update CRM Close Date to align with real client decision date."
            });
          }
        }
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
    coaching_playbook: coachingPlaybook,
    framework_criteria: frameworkCriteria
  };
}
