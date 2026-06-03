# Sales Brain — Product Spec

**Feature:** Sales Brain (AI Pipeline Coach)
**CRM:** Faisal CRM (working name)
**Author:** Kurt
**Date:** 2026-05-27
**Status:** Draft v1 — for alignment with Faisal

---

## 1. What this is, in one sentence

Sales Brain is an always-on AI sales coach inside the CRM that reviews every open deal in a rep's pipeline and tells them — every Monday morning, and on demand — which deals to push, which are slipping, and the specific moves to make this week.

## 2. The problem it solves

Pipeline coaching is the single most valuable thing a sales manager does, and the rarest. A rep with 25 open deals gets maybe 30 minutes of real deal review per week, focused on the 2–3 deals their manager already knows about. The other 22 deals coast on autopilot until they slip past close date, go dark, or come back as "we went with the other vendor."

The data to coach every deal already exists — meeting notes, email threads, stage history, who's been talked to. No one has the time to read all of it weekly and synthesize what to do.

Sales Brain reads everything every week and writes the brief.

## 3. Who it's for

**Primary user:** B2B SaaS Account Executive carrying 20–40 open opportunities, $25K–$500K ACV, 30–120 day sales cycles, multi-stakeholder (3–8 people per deal).

**Secondary user:** Sales Manager / VP Sales who currently does ad-hoc pipeline reviews. The Brain gives them a starting point for 1:1s and surfaces deals they should jump into.

**Not the user (yet):** SDRs doing cold outreach, transactional/single-call closes, $1M+ enterprise deals with custom motions.

## 4. The coaching framework (the "brain" part)

Every deal gets scored and analyzed across four dimensions. This is the opinionated model the agent reasons over — it's what makes the Brain better than a generic "summarize this deal" prompt.

### 4.1 Qualification depth — MEDDPICC-lite
For each deal the agent asks: what do we know vs. what's missing?
- **M**etrics — has the rep quantified the buyer's pain in dollars/hours/risk?
- **E**conomic buyer — identified? talked to? bypassed?
- **D**ecision criteria — written down? agreed to by buyer?
- **D**ecision process — do we know the steps from now to signature?
- **P**aper process — legal/procurement/security review path mapped?
- **I**dentified pain — explicit, named, owned by someone on buyer side?
- **C**hampion — internal advocate selling on our behalf when we're not in the room?
- **C**ompetition — who else is in, what's their angle?

Missing fields aren't blockers — they're the next questions to ask. The Brain converts gaps into specific suggested actions ("ask Maria for the project budget she mentioned in passing").

### 4.2 Momentum & slip-risk
- Days since last meaningful contact (not just email opens — actual replies, meetings)
- Stage age vs. company benchmark (this deal is 47 days in "Demo" — your team's median is 18)
- Close date credibility (has the close date moved? how many times?)
- Stakeholder engagement trend (was talking to 4 people last month, only 1 this month → red flag)

### 4.3 Multi-threading
- Who do we know? Who do we *need* to know?
- Coverage of decision committee vs. typical buyer org chart for this deal size
- Single-threaded deals get flagged hard — they're the deals that vanish

### 4.4 Buyer signal
- What did the buyer actually say vs. what the rep wrote down as next step?
- Verbal vs. written commitment levels
- Language patterns that historically correlate with closed-won vs. closed-lost (learned from the company's own history over time)

## 5. Inputs

The Brain consumes whatever's in the CRM. Bare minimum:
1. **Deal record** — account, amount, stage, close date, owner, history
2. **Activity log** — call notes (typed or transcribed), emails, meeting summaries
3. **Stakeholders** — contacts on the deal, their titles, last touch
4. **Stage definitions** — this company's actual stages and what they mean (consumed from the [Stage Classifier / StageAgent](./POC_Spec_AI_Stage_Classifier.md) — same data model)

Nice-to-have, added later:
- Calendar (upcoming meetings on the deal)
- Email thread bodies (not just metadata)
- Call transcripts via Gong/Fireflies/etc.
- Historical closed-won/lost outcomes for benchmark-learning

## 6. Outputs — what the rep actually sees

### 6.1 Monday morning brief (the headline deliverable)
A single page, generated overnight, ranked by "deals that need YOU this week":

```
DEAL: Acme Corp — $85K — Stage: Demo Complete — Close: Jun 15
─────────────────────────────────────────────────────────────
STATUS:  ⚠️  At risk — slipping
SIGNAL:  Last meaningful contact 12 days ago. Champion (Maria,
         VP Eng) hasn't responded to your last 2 emails. Decision
         committee shrunk from 4 → 1 active participant.

GAPS:    • No economic buyer identified (Maria reports to ?)
         • Close date moved twice — credibility low
         • No competing vendor named in your notes (likely 1–2)

DO THIS WEEK:
  1. [Mon] Call — not email — Maria. Reference the security
     question she raised on the May 8 call.
  2. [Tue] Ask Maria: "Who else needs to weigh in before we
     can lock the June 15 date?" (gets to economic buyer)
  3. [Wed] Send a one-pager comparing us to {likely competitor}.
     Acme is in fintech — Plaid/Stripe-adjacent — so the
     compliance angle wins here.

WHY YOU: This deal is your largest in Q2 with no manager
         touches yet. Self-rescue window closes ~10 days.
```

### 6.2 Deal-detail coach (on demand)
Inside any deal record: "Coach this deal" button. Same analysis, deeper, includes:
- Drafted email/call-script for the suggested next move
- "What I'd ask if I were on the call" question bank
- Risk register for the deal (3–5 specific things that could kill it)

### 6.3 Manager view
- Pipeline-wide: "5 deals at risk this week, here's where to spend your 1:1 time"
- Auto-generated talking points per rep
- Coaching trends: this rep consistently weak on economic buyer identification → suggest training

## 7. How it learns the rep's company (personalization)

This is where Sales Brain stops being generic. Three layers of learning:

### Layer 1 — Configured at setup
- ICP definition (verticals, sizes, geos)
- Stage definitions (already done by the stage classifier)
- Sales methodology (MEDDPICC / Challenger / SPIN — switches the prompt scaffolding)
- Typical deal cycle length and ACV bands

### Layer 2 — Learned from history
After 60–90 days of CRM use, the Brain extracts:
- Median time in each stage for this company
- Patterns in won deals (e.g., "won deals have champion calls before Demo")
- Patterns in lost deals (e.g., "deals where pricing was discussed before stage 3 close 60% lower")
- Company-specific language ("POC" here means a 2-week paid pilot, not a 30-day trial)

### Layer 3 — Per-rep adaptation
- Coaching style adapts (some reps want direct callouts, some want context)
- Tracks which suggestions the rep acted on vs. ignored, weights accordingly
- Suggestions get more specific as the model learns the rep's voice

## 8. Relationship to the AI Stage Classifier (the wedge)

The stage classifier is the **data primitive**. It reads meeting notes and outputs structured fields: "this conversation moved the deal into Demo Complete; here's the decision criteria mentioned; here's who was on the call." That structured output is what populates the CRM activity log cleanly.

Sales Brain is the **synthesis layer** that runs on top of that clean data. Without the classifier, the Brain would be reading messy free-text notes and guessing. With the classifier, it's reasoning over structured deal events.

This is the architectural argument for building both: the classifier alone is a productivity feature (saves rep 5 min per call). The Brain on top of the classifier is a category-changing feature (replaces a function — pipeline coaching — that was previously done by a human manager).

Sequence for the build:
1. Stage classifier — extracts structured events from notes → ships first, sells the CRM
2. Sales Brain — reasons over structured events → ships as the upgrade tier / manager seat

## 9. Data model sketch

```
Account
  └── Opportunity (Deal)
        ├── stage, amount, close_date, owner, created_at
        ├── stage_history[]
        ├── Activities[]
        │     ├── type (call, meeting, email, note)
        │     ├── raw_content
        │     └── structured_extraction (from stage classifier)
        │           ├── attendees[]
        │           ├── topics_discussed[]
        │           ├── commitments_made[]
        │           ├── concerns_raised[]
        │           └── stage_signal
        ├── Stakeholders[]
        │     ├── name, title, role_on_deal
        │     ├── champion_score
        │     └── last_meaningful_contact
        └── CoachingBriefs[] (output of Sales Brain)
              ├── generated_at
              ├── risk_level
              ├── gaps[], actions[], reasoning
              └── rep_response (acted/dismissed/snoozed)
```

## 10. What "good" looks like — success metrics

- **Leading:** % of weekly briefs the rep actually opens (target: 80%+)
- **Leading:** % of suggested actions the rep takes within 7 days (target: 30%+)
- **Lagging:** Win rate uplift on deals where the rep acted on coaching vs. didn't (target: 15%+ relative uplift)
- **Lagging:** Average slip days reduction (target: -3 days vs. control)
- **Stickiness:** Manager-seat attach rate (does the Brain pull in the manager? target: 40%+ of accounts)

## 11. Open questions for Faisal

1. **Tiering** — is the Brain a separate paid tier, a manager-seat add-on, or table stakes in the core CRM?
2. **Trust & override** — how aggressive should the coach be? Suggestions vs. nudges vs. nags?
3. **Privacy** — many sales orgs have compliance issues with AI reading customer call transcripts. Do we self-host the model, use an enterprise OpenAI deployment, or build for both?
4. **Manager adoption** — building a coaching feature that's loved by reps but ignored by managers loses the upsell motion. How do we design for both audiences from day one?
5. **Bootstrap problem** — Layer 2 personalization needs 60–90 days of data. What do we ship for new accounts who don't have that history?

## 12. What this spec deliberately does NOT cover

- Pre-call prep, post-call analysis, skill drills (different features, possibly later)
- The stage classifier itself (covered in its own doc — the Brain assumes it exists)
- Pricing, packaging, GTM
- Integrations (Gong, Salesforce, HubSpot) — assumed feasible, spec'd separately

---

*Companion docs:*
- `02_Sales_Brain_POC.html` — interactive prototype
- `03_Sales_Brain_Build_Plan.md` — technical build & sequencing
