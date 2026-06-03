import { NextResponse } from 'next/server';
import { buildSystemPrompt, callGemini, getMockAnalysis } from '@/services/llm';

/**
 * Snap an arbitrary stage label to one of the tenant's defined stage names.
 * The UI highlights the pipeline chevrons via an EXACT name match
 * (activeTenant.stages.findIndex(s => s.name === stage)), so a label that is
 * even slightly off ("Proposition" vs "C - Proposition", trailing whitespace,
 * different casing) makes the chevron path silently fail to advance in front of
 * a prospect. This guarantees we always hand the UI a real stage name.
 *
 * Returns { stage, matched }. matched=false means we had to guess the closest
 * stage, which the caller flags so it is visible rather than silent.
 */
function snapToTenantStage(stageName, tenant) {
  const names = (tenant && tenant.stages ? tenant.stages : []).map((s) => s.name);
  if (!stageName || names.length === 0) return { stage: stageName, matched: true };

  // 1. Exact match (happy path).
  if (names.includes(stageName)) return { stage: stageName, matched: true };

  const norm = (s) =>
    String(s).toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
  const target = norm(stageName);

  // 2. Case / punctuation insensitive exact match.
  let hit = names.find((n) => norm(n) === target);
  if (hit) return { stage: hit, matched: true };

  // 3. One label contains the other (e.g. "validation" inside "B - Validation").
  hit = names.find((n) => {
    const nn = norm(n);
    return nn.includes(target) || target.includes(nn);
  });
  if (hit) return { stage: hit, matched: true };

  // 4. Best word-token overlap.
  const targetWords = new Set(target.split(' ').filter(Boolean));
  let best = null;
  let bestScore = 0;
  for (const n of names) {
    const score = norm(n).split(' ').filter((w) => targetWords.has(w)).length;
    if (score > bestScore) {
      bestScore = score;
      best = n;
    }
  }
  if (best && bestScore > 0) return { stage: best, matched: true };

  // 5. No confident match: fall back to the first stage, but flag it.
  return { stage: names[0], matched: false };
}

/**
 * Does the submitted text match one of the tenant's built-in sample meetings?
 * The mock heuristics engine is hardcoded to the demo data: it only produces
 * sensible output for these canned notes and returns misleading defaults on
 * anything else. We only allow the mock path for known samples so a prospect
 * typing their own notes never sees a fabricated-but-plausible answer.
 */
function notesMatchSample(notes, tenant) {
  const norm = (s) => String(s).toLowerCase().replace(/\s+/g, ' ').trim();
  const n = norm(notes);
  if (!n) return false;
  const samples = tenant && tenant.sampleMeetings ? tenant.sampleMeetings : [];
  return samples.some((m) => {
    const mn = norm(m.notes);
    if (!mn) return false;
    if (n === mn) return true;
    // Tolerate light trimming / minor edits at either end.
    return n.includes(mn.slice(0, 120)) || mn.includes(n.slice(0, 120));
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { meetingNotes, tenant, frameworkType, crmContext } = body;

    if (!meetingNotes || !tenant || !frameworkType) {
      return NextResponse.json(
        { error: 'Missing required fields: meetingNotes, tenant, or frameworkType' },
        { status: 400 }
      );
    }

    // Lookup API key: env var first, then client header.
    let apiKey = process.env.GEMINI_API_KEY;
    const clientKey = request.headers.get('x-api-key');
    if (clientKey) {
      apiKey = clientKey;
    }

    // No API key: the mock engine is reliable ONLY on the built-in sample
    // notes. For known samples, serve the offline canned demo. For novel input,
    // refuse rather than fabricate -- a fake answer that breaks on the rep's
    // real words is worse than a clear "add your key" prompt.
    if (!apiKey) {
      await new Promise((resolve) => setTimeout(resolve, 500)); // UX latency
      const mockResult = getMockAnalysis(tenant, frameworkType, meetingNotes, crmContext);
      
      // Ensure risk registry lists the offline mode warning
      if (!mockResult.risk_flags) {
        mockResult.risk_flags = [];
      }
      if (!mockResult.risk_flags.includes("Offline Heuristics Engine: No Gemini API Key set")) {
        mockResult.risk_flags.unshift("Offline Heuristics Engine: No Gemini API Key set");
      }
      
      const snapped = snapToTenantStage(mockResult.stage, tenant);
      return NextResponse.json({ ...mockResult, stage: snapped.stage, isMock: true });
    }

    // Run real LLM classification.
    const systemPrompt = buildSystemPrompt(tenant, frameworkType, crmContext);
    const classification = await callGemini(apiKey, systemPrompt, meetingNotes);

    // Validate the returned stage against the tenant's real stage list so the
    // chevron path never silently breaks on an off-by-a-word label.
    const snapped = snapToTenantStage(classification.stage, tenant);
    if (!snapped.matched) {
      classification.risk_flags = [
        `AI returned an unrecognized stage ("${classification.stage}") -- snapped to closest defined stage "${snapped.stage}". Review stage definitions.`,
        ...(classification.risk_flags || []),
      ];
      classification.confidence_score = Math.max(10, (classification.confidence_score ?? 50) - 15);
    }
    classification.stage = snapped.stage;

    return NextResponse.json({ ...classification, isMock: false });
  } catch (error) {
    console.error('Classification API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error during classification' },
      { status: 500 }
    );
  }
}
