# Proof of Concept Spec — AI Stage Classifier

**Project:** Stagecraft (working name)
**Author:** Kurt (drafted with AI assistance for review with Faisal)
**Status:** DRAFT v0.2 — for partner review
**Date:** 2026-05-26 (v0.2 updated same day to add framework templates per Faisal's input)

> **Working name note:** "Stagecraft" is the placeholder product name chosen 2026-05-26. Not a final brand — that gets professional naming and trademark search once the POC validates the thesis.

> **v0.2 change:** Per Faisal's direction, the POC now ships with three industry-standard sales frameworks pre-loaded as default stage criteria templates: MEDDIC (or MEDDPICC), SPIN, and BANT. See Section 3.5 below. See also `Sales_Frameworks_Reference.md` for full framework definitions.

---

## 1. Purpose of This Document

This spec defines a single, narrow proof of concept: an AI agent that reads a sales rep's account of how a meeting went and determines what stage the deal is currently in, using stage definitions configured by the rep's company.

It is intentionally not a full CRM. It is the smallest demoable artifact that proves the core thesis of the broader vision — that AI can replace manual stage management and forecast guessing for sales teams. If this single workflow is convincing in front of sales leaders, the rest of the product roadmap (forecast scoring, risk detection, manager dashboards, CS nudges) is a downstream extension of the same primitive.

This document is meant to be argued with. Anywhere a decision is marked **[CONFIRM WITH FAISAL]**, that's a place where alignment matters before any building starts.

---

## 2. What the POC Does (and Doesn't)

### In Scope for the POC

A working web application that:

1. Lets an admin configure one company's sales stages and the criteria that define entry into each stage.
2. Lets a sales rep submit a free-text account of a sales meeting — what was discussed, who was there, what was committed, what was vague, what concerns came up.
3. Returns a structured AI judgment: which stage the deal is currently in, a confidence score, the reasoning behind the call, what signals from the notes drove the conclusion, what's missing or ambiguous, and a recommended next action.
4. Displays that output in a clear, scannable way that makes the AI's reasoning visible — because trust is the entire battle.
5. **(v0.2)** Ships with three industry-standard sales framework templates (MEDDIC/MEDDPICC, SPIN, BANT) that customers can select, combine, or customize as the basis for their stage criteria — so demos and onboarding work out of the box without requiring custom criteria definition.

### Explicitly Out of Scope for the POC

- User accounts, authentication, multi-user sessions
- A real database of contacts, accounts, or opportunities
- Pipeline views, dashboards, reports
- Integrations with email, calendar, or other CRMs
- Forecast rollups, manager views, CS workflows
- Mobile app
- Multi-tenancy (POC will run with hardcoded example companies)
- Voice-to-text for meeting input (text-only for v1, voice in v2)

The discipline of saying "no" to these matters more than the discipline of saying "yes" to the stage classifier. A bloated POC is worse than a tight one.

---

## 3. The Core User Workflow

A single loop, repeated:

**Step 1 — Setup (one-time per company, done by admin)**
Admin opens the configuration screen and enters their company's sales stages. For each stage, they provide:
- Stage name
- Plain-English description of what this stage means
- Entry criteria (what must be true for a deal to be in this stage)
- Common signals that indicate a deal belongs here
- Common signals that indicate a deal has moved past here

For the POC, we will pre-load **[CONFIRM WITH FAISAL: 2 or 3]** example companies with realistic stage definitions so demos work out of the box without setup.

**Step 2 — Rep submits meeting notes**
Sales rep opens the main screen, selects the company context (in POC, picks from a dropdown of pre-loaded examples), and types or pastes a free-form account of their meeting. They are encouraged to write the way they'd talk to a manager, not the way they'd fill in a form.

Example input:
> "Had a 45-minute call with Sarah, the VP of Operations at Acme. She brought her IT director Mike. They confirmed they're trying to solve their forecasting problem this quarter, said budget is approved for $40-60K. Mike pushed back on integration timeline — wants to see a security review. Sarah said she'll loop in the CFO for the next call. We agreed I'd send the security packet by Friday and book the CFO meeting for next week."

**Step 3 — AI returns structured judgment**
The system displays:
- **Current stage:** the AI's best call from the configured stage list
- **Confidence:** a score (High / Medium / Low, plus a 0–100 number)
- **Reasoning:** 2–4 sentences in plain English explaining why this stage
- **Signals found:** specific things from the notes that supported the call ("budget confirmed: $40-60K range," "decision-maker engaged: CFO being looped in," "clear next steps committed by both sides")
- **Missing / ambiguous:** things the AI would want to know to be more confident ("decision timeline not stated explicitly," "competitive situation unclear")
- **Recommended next action:** one concrete next step ("Send security packet by Friday as committed; confirm CFO meeting date within 48 hours")

**Step 4 — Rep accepts, overrides, or asks for re-evaluation**
The rep can accept the AI's call, override it (and provide a reason), or add more context and re-run. This override loop is critical — it's how the system earns trust over time and how Faisal eventually collects the training data that becomes the moat.

---

## 3.5 Sales Framework Templates (added in v0.2)

Per Faisal's direction, StageAgent ships with three pre-built sales framework templates that customers can use immediately. This is a major change from v0.1, which assumed each customer would define their stage criteria from scratch.

### The three frameworks

- **BANT** (Budget, Authority, Need, Timeline) — the classic 4-criterion qualifier, simple and ubiquitous
- **MEDDIC / MEDDPICC** (Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion, [+ Paper Process, Competition]) — the enterprise standard, more nuanced
- **SPIN** (Situation, Problem, Implication, Need-payoff) — Neil Rackham's conversation framework, used alongside qualification

Full definitions and mappings to deal stages are in `Sales_Frameworks_Reference.md`.

### How customers choose

During onboarding, the customer picks:
- **A single framework** — most common; the customer's whole team operates on one
- **Multiple frameworks combined** — for orgs that use BANT for SMB deals and MEDDIC for enterprise, for example
- **A custom framework** — the customer can write their own criteria from scratch, or start with a template and customize it (e.g., add "compliance review required" to MEDDPICC's Paper Process step for regulated industries)

### How the AI uses them

When a rep submits meeting notes, the AI:

1. Identifies which framework(s) are active for this customer
2. Evaluates the notes against each framework criterion (e.g., for MEDDIC: did the notes mention Metrics? Economic Buyer? Champion? etc.)
3. Marks each criterion as **confirmed** (explicit evidence), **partial** (inferred but uncertain), or **missing** (no evidence)
4. Derives the deal stage from the criteria coverage (e.g., MEDDIC with 5/6 confirmed and Champion identified → late solution stage)
5. Generates the next-action recommendation targeted at the highest-value missing criterion (e.g., "no Economic Buyer identified — recommend asking about budget approval process on next call")

### Strategic note — Important for partner conversation

The framework integration is the *right* design choice, but it is *not* differentiation against Day.ai or Coffee AI. Coffee AI explicitly markets that its agent applies "BANT or MEDDIC frameworks" automatically. From the Coffee AI competitive analysis:

> "Coffee's Agent applies sales frameworks automatically through AI-structured meeting notes, which supports 90%+ stage accuracy without manual interpretation."

So adopting these frameworks brings StageAgent to parity, not ahead. The actual differentiation remains:

- **Rep narrative input** (not meeting recording) — Day.ai and Coffee both depend on meeting bots
- **Vertical focus** — both competitors are horizontal
- **Management layer as hero** — both treat manager visibility as a side feature

The frameworks support these differentiators (they make the demo land faster) but do not replace them in the positioning story.

---

## 4. What the AI Actually Returns (Output Contract)

A structured response, every time, with these fields:

| Field | Type | Notes |
|---|---|---|
| `stage` | string | Must match one of the configured stage names |
| `confidence_score` | integer 0–100 | |
| `confidence_label` | enum: High / Medium / Low | Derived from score thresholds **[CONFIRM WITH FAISAL on thresholds]** |
| `reasoning` | string (2–4 sentences) | Plain English, written as a sales manager would explain |
| `signals_found` | list of strings | Specific evidence from the notes |
| `missing_or_ambiguous` | list of strings | What would increase confidence |
| `recommended_next_action` | string | One concrete action, with timing if possible |
| `risk_flags` | list of strings (can be empty) | E.g. "single-threaded," "no clear decision-maker," "timeline slipping" |
| `framework_criteria` *(v0.2)* | object | Per-criterion evaluation. E.g. for MEDDIC: `{"metrics": "confirmed", "economic_buyer": "missing", "decision_criteria": "partial", ...}` with brief evidence for each |

Returning structured output (not free-form text) is what makes this product different from "just ask ChatGPT about the meeting." It's also what lets every other feature in the future roadmap plug in.

---

## 5. Definition of Done for the POC

The POC is "done" when all of the following are true:

1. A rep can submit meeting notes for one of the pre-loaded companies and get a structured response back in under 10 seconds.
2. The response uses the company's actual stage names and references the company's actual criteria.
3. The AI's reasoning is plausible to an experienced sales leader at least 80% of the time on a test set of 20 realistic meeting notes (Faisal to judge, this is the validation bar).
4. The interface is clean enough that a non-technical sales leader can use it in a demo without coaching.
5. Two or three different example companies are configured so the demo can show the AI behaves differently based on company context — this is the proof that it's not a generic chatbot.

If those five conditions hold, the POC has earned the right to be shown to real prospective customers in validation interviews.

---

## 6. Technical Approach (Overview, Not Deep Dive)

Kurt builds this himself using AI coding assistants. The stack is intentionally boring:

- **Frontend:** simple web app generated and iterated with Lovable, Bolt, or v0 — basic forms and a results view, nothing fancy
- **LLM:** Claude (Anthropic) or GPT (OpenAI), called via API with structured output / JSON mode
- **Backend:** a thin serverless function (Vercel or similar) that takes the meeting notes plus the company's stage config, builds a prompt, calls the LLM, returns the structured response
- **Storage:** for POC, company configs and example data are hardcoded; no database needed
- **Hosting:** Vercel or Replit free tier

Estimated build time: 2–4 focused weekends for Kurt. Estimated cost to build and demo: under $100 total (API credits + maybe a paid tier of a build tool).

The hard work is not the code. The hard work is the **prompt engineering** and the **stage criteria definitions** — getting the AI to reason about deals the way a real sales manager would. That's where 80% of iteration time will go, and that's where Faisal's domain expertise is irreplaceable.

---

## 7. Open Questions for Faisal

These are the decisions that need an answer before building starts:

1. **Example companies for the demo.** How many do we pre-load, and what verticals? (Recommendation: 2–3, spanning SaaS, professional services, and one of Faisal's existing strongholds like EdTech or biotech.)
2. **Source of stage definitions.** Does Faisal hand-write the example companies' stages himself based on his sales-leadership experience, or do we pull them from a real company he can get cooperation from?
3. **Confidence thresholds.** What confidence score makes the AI say "I'm not sure, please give me more info" instead of returning a stage? (Recommendation: below 40 = low, 40–70 = medium, above 70 = high, but Faisal should sanity-check.)
4. **Validation panel.** Who does Faisal commit to showing the POC to once it's working? (Target: 10 sales leaders from his network, with structured feedback.)
5. **Risk flags scope.** For v1, do we limit risk flags to a fixed list (single-threaded, no decision-maker, etc.) or let the AI generate them freely? (Recommendation: fixed list of ~8, both for consistency and so the broader product can build on them later.)
6. **Override-and-correction handling.** Do we store reps' overrides for later analysis? (Recommendation: yes, even in POC, as flat-file logs — this becomes invaluable training data later.)
7. **(v0.2) MEDDIC vs MEDDPICC.** Does Faisal want the 6-letter or 8-letter version of the MEDDIC template? (Recommendation: ship both as separate selectable templates so customers choose.)
8. **(v0.2) Framework default for demo.** Which of the three frameworks does the POC demo lead with? (Recommendation: MEDDIC for the enterprise sales-leader audience Faisal will be demoing to — they'll recognize it instantly and it's the most credibility-conveying choice.)
9. **(v0.2) Custom criteria override path.** Even with frameworks pre-loaded, customers will want to override or extend them. Do we expose this in the v1 POC (more work, but more honest demo) or save it for v2 (faster ship, but risk customers asking "what if my org doesn't use MEDDIC")? (Recommendation: expose a simple "edit framework" view in the POC — it's the most common follow-up question and showing it answers the objection live.)

---

## 8. What This Spec Is Not

This is a POC spec, not a product spec. It deliberately ignores everything outside the single classifier workflow. Once the POC validates the core thesis, a real product spec — with the broader feature set, architecture, multi-tenancy, billing, integrations, and full team — gets written. Trying to spec the whole CRM right now would be procrastination disguised as planning.

---

## 9. Next Steps After This Spec Is Approved

1. Faisal and Kurt walk through this document together, answer the open questions, and lock the scope.
2. Faisal drafts the stage definitions and criteria for the 2–3 example companies (his work).
3. Kurt starts a prompt-engineering scratch pad to iterate on the AI prompt before any UI gets built (most important early work).
4. In parallel, Faisal begins reaching out to his network of sales leaders to line up the validation panel that will see the working POC.
5. Kurt starts building the UI in week 2 or 3, once the prompt is producing reliable output.
