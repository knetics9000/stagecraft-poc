# Sales Brain — Build & Architecture Plan

**Companion to:** `01_Sales_Brain_Spec.md`, `02_Sales_Brain_POC.html`
**Related:** `POC_Spec_AI_Stage_Classifier.md` (the StageAgent — Sales Brain's upstream data source)
**Date:** 2026-05-27
**Author:** Kurt

---

## 1. Build philosophy

Three stages, each with a different goal and a different bar for "done."

| Stage | Goal | Bar for done | Time | Who builds |
|---|---|---|---|---|
| **A. Throwaway POC** | Prove it feels right. Demo to Faisal, design partners, advisors. | Looks real, works on canned data, no infra. | 1–2 weeks | Kurt + AI |
| **B. Design-partner MVP** | Run it on 1–3 real reps' real pipelines. Learn what coaching is actually useful. | Real CRM data in, real briefs out, hosted somewhere, login works. | 4–8 weeks | Kurt + AI, with help on auth/infra |
| **C. Product** | Ship it to paying customers. Reliable, multi-tenant, secure. | SOC 2 path, integrations with real CRMs, billing, support. | 3–6+ months | Real eng team |

**The biggest mistake** to avoid: skipping Stage A to "do it properly" in Stage B. The POC is where you find out the coaching framework is wrong. Cheaper to fix in HTML than in production code.

## 2. Architecture — the simple version

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  CRM data    │──▶│   Stage      │──▶│  Structured  │
│  (notes,     │   │ Classifier   │   │ deal events  │
│  activities) │   │  (existing)  │   │  (clean)     │
└──────────────┘   └──────────────┘   └──────┬───────┘
                                              │
                                              ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Coaching    │◀──│  Sales Brain │◀──│  Pipeline    │
│  briefs      │   │   reasoning  │   │  context     │
│  (UI + email)│   │   pipeline   │   │  (all deals) │
└──────────────┘   └──────────────┘   └──────────────┘
                          ▲
                          │
                   ┌──────┴───────┐
                   │  Company-    │
                   │  specific    │
                   │  config &    │
                   │  history     │
                   └──────────────┘
```

Three things matter here:

1. **Sales Brain sits downstream of the Stage Classifier**, not in parallel. Clean structured data in → useful coaching out. Garbage in → generic platitudes out.
2. **The "company config + history" loop is what makes it stick.** Without it, you're shipping a generic prompt and the rep can get the same thing from ChatGPT.
3. **The output is delivered, not requested.** Monday morning email + in-CRM dashboard. Push, not pull. Coaching the rep doesn't ask for is the whole product.

## 3. The AI pipeline — what actually runs

This is the meat. Three LLM calls per deal per week (more on cost in §6):

### Call 1 — Deal state extraction (cheap, fast)
- **Input:** Raw deal record + last 30 days of activities (already partially structured by the Stage Classifier)
- **Output:** Structured JSON — current MEDDPICC fill rate, stakeholder map, momentum signals, slip indicators
- **Model:** Haiku-class (small, cheap, deterministic)
- **Why separate:** You want this output cached and inspectable. If the coaching looks wrong, you can check whether the model misread the data vs. reasoned badly about it.

### Call 2 — Risk & opportunity reasoning (the smart one)
- **Input:** Output of Call 1 + company config (methodology, benchmarks, history) + similar past deals (RAG)
- **Output:** Risk classification, top 3–5 gaps, prioritized actions with reasoning
- **Model:** Sonnet-class (need real reasoning here)
- **Why separate:** This is where the company-specific learning lives. Different prompt per customer based on their methodology and historical patterns.

### Call 3 — Brief writing (the wordsmith)
- **Input:** Output of Call 2 + rep's voice/tone preferences
- **Output:** The Monday brief copy (the stuff in the HTML POC)
- **Model:** Haiku-class
- **Why separate:** Lets you regenerate the *wording* without re-running the expensive reasoning if a rep says "this is too harsh."

**Cost per deal per week:** ~$0.02–0.05 with current pricing. For a rep with 25 deals = ~$1–1.25/rep/week = $5/rep/month. Trivial vs. ~$50–200/seat pricing.

## 4. Stack — what to build with

### Stage A (POC, 1–2 weeks)
- **Frontend:** Single HTML file with embedded JS (like the POC) OR Next.js if you want routing. Vibe code with Claude/Cursor.
- **Backend:** None. Hardcoded deal data in JSON. LLM calls direct from the browser to an API (yes, key exposed — it's a demo).
- **LLM:** Anthropic API directly. Skip RAG, skip eval — just get the prompts right.
- **Hosting:** Nothing. Open the .html locally, or Vercel if you want a shareable URL.

### Stage B (design-partner MVP, 4–8 weeks)
- **Frontend:** Next.js (App Router) — Kurt can build this with Cursor/Claude.
- **Backend:** Next.js API routes or a separate Node/Python service. Postgres for the data, Pinecone or pgvector for the RAG.
- **Auth:** Clerk or Supabase Auth. Don't roll your own.
- **LLM:** Anthropic + OpenAI behind a tiny abstraction. Add structured outputs (JSON mode). Build the evals you wish you'd built sooner.
- **Hosting:** Vercel + Supabase. ~$50/mo at this stage.
- **CRM integration:** Skip real Salesforce/HubSpot. Build a CSV importer. Design partners will hand you the data.

### Stage C (product)
This is where you need a real engineer. CRM integrations alone are months of work (Salesforce API is hostile, HubSpot less so). SOC 2 isn't optional for sales tools touching pipeline data. Multi-tenant data isolation is unforgiving. Not a Kurt-with-AI build.

## 5. What Kurt can build vs. what needs a dev

| Task | Kurt + AI? | Notes |
|---|---|---|
| Stage A POC (HTML + canned data + Anthropic calls) | ✅ Yes | This is exactly what AI coding assistants are best at. |
| Stage B frontend (Next.js + Tailwind + UI) | ✅ Yes | Cursor + Claude does this well. Will be messy code; that's fine. |
| Stage B prompt engineering & eval design | ✅ Yes | This is product work disguised as tech work. Kurt is the right person. |
| Stage B database schema + simple API routes | ⚠️ With help | Doable with AI, but ask a friend to review the schema before you commit. |
| Stage B auth, login, sessions | ❌ Use a service | Clerk/Supabase Auth. Don't touch this. |
| CSV importer for design partners | ✅ Yes | Easy. |
| Salesforce/HubSpot real integration | ❌ Need a dev | Salesforce especially. Don't underestimate. |
| Multi-tenant data isolation | ❌ Need a dev | Get this wrong and it's a customer-trust death event. |
| Production deploy, monitoring, on-call | ❌ Need a dev | Not Kurt's job. |
| SOC 2, security review, DPAs | ❌ Hire help | Vanta/Drata + a fractional CISO. |

**Translation:** Kurt can credibly build the first 70% of the product alone. The last 30% is what turns a prototype into a company — and that's where you need a co-founder-grade engineer, not a contractor.

## 6. Phased roadmap with milestones

### Phase 0 — Now to +2 weeks: Validate the spec
- [ ] Walk Faisal through the spec doc + POC
- [ ] Show the POC to 5 working AEs/sales managers — ask: "would this change your Monday?"
- [ ] Capture every objection in writing
- [ ] Decide: do we believe this is the second feature? Confirm or pivot.

### Phase 1 — +2 to +6 weeks: Live POC on real data
- [ ] Build the actual LLM pipeline (the 3 calls in §3)
- [ ] Get 1–2 friendly reps to send you a CSV export of their pipeline + their last month of notes
- [ ] Generate real Monday briefs for them, by hand if needed
- [ ] Iterate the prompts based on their reactions

### Phase 2 — +6 to +14 weeks: Design-partner MVP
- [ ] Build the Next.js shell, hosted, login, CSV upload
- [ ] Onboard 3 paying design partners (cheap, $200–500/mo) for committed feedback
- [ ] Build the eval harness — score every brief against the rep's reaction
- [ ] Find the moment that flips a rep from "this is cool" to "I'd pay for this"

### Phase 3 — +14 weeks onward: Decide to fundraise / hire / pivot
- [ ] If usage and willingness-to-pay are real, hire engineering #1
- [ ] Real CRM integrations begin here, not earlier
- [ ] Stage classifier and Sales Brain unified as one product

## 7. Risks worth naming now

1. **The coaching framework is wrong.** What you think is good pipeline coaching may not match what reps will actually use. *Mitigation:* show the POC to real reps in Phase 0 before any code.

2. **The personalization layer is harder than it looks.** Layer 2 (learning from a company's own data) needs 60–90 days of history. Until then it's a generic prompt. *Mitigation:* in Phase 0/1, the "generic prompt" still has to be useful enough to onboard. Test that explicitly.

3. **Reps will not read the brief.** Most sales tools die from non-adoption, not from being wrong. *Mitigation:* delivery format matters more than content. Slack DM > email > in-app dashboard. Test all three.

4. **Manager-seat economics.** The pitch deck math depends on a manager-seat upsell. If only reps use it, the unit economics get worse. *Mitigation:* in Phase 2, design the manager view in parallel — don't bolt it on later.

5. **Anthropic/OpenAI dependency.** If the model gets dumber or pricier, you have no moat. *Mitigation:* keep the prompts modular, evals portable. Cross-model in Phase 2.

6. **You're not technical enough to ship Stage C alone.** This is fine as long as you're honest about it. *Mitigation:* start looking for technical co-founder now, not in month 6. The POC is your recruiting tool.

## 8. The single most important next step

Before any code: get the POC in front of 5 working B2B SaaS AEs and 2 sales managers. Don't ask "is this cool?" — ask "what would you do differently this week if I delivered this every Monday?"

If the answer is specific, build it. If the answer is "I'd skim it," redesign before building.

---

*If this plan changes, edit it here — keeping the spec, prototype, and plan in sync is what makes the docs useful to Faisal.*
