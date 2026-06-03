# Master Context Document — Kurt's Personal Operating System Profile

**Purpose:** This document is a portable context dump so a new ChatGPT (or any other LLM) session can immediately understand who I am, what I am working on, who I am working with, what has already been decided, and what is still open. Read this first before answering any project-related question.

**Last updated:** 2026-05-27
**Owner:** Kurt (email: kingkurt1978@gmail.com)

---

## 1. Personal background and relevant details

- Name: Kurt.
- Email: kingkurt1978@gmail.com.
- I operate as a technical/product partner on an early-stage venture (see Section 5). I am not currently employed at the venture — this is a partnership.
- I am more technically literate than my partner (Faisal), but I am not a career software engineer. I am comfortable evaluating architecture, build strategy, and technical decisions, and I am open to learning to build a proof of concept (POC) myself with the help of AI coding assistants.
- I work out of a Claude "Cowork" environment with a project folder called **"Faisal CRM Project"** where all artifacts for this venture live.

> **Note to ChatGPT:** Where this document does not specify something about my personal life, career history, location, family, etc., do not invent it. Ask me, or treat it as unknown.

---

## 2. Career and responsibilities

- My professional history is not yet documented in this context file beyond the role described in Section 3. For now, treat me as someone with enough technical and product judgment to act as the "how do we build this" partner on an AI startup concept, while not yet being a full-time builder.
- I am responsible for thinking through architecture, MVP scope, build-vs-buy decisions, validation strategy, and the technical roadmap for the venture below — not (yet) for writing production code.

---

## 3. Current role and day-to-day tasks

I am the **technical/product navigator and co-founder/partner** on an AI-native CRM venture with my friend **Faisal**.

Specifically:
- Partnership, not employment. Equity, time commitment, and funding model are not yet finalized (see Section 16).
- Faisal owns the **sales-leadership vision and domain pain**. He is non-technical.
- I own the **path-to-product**: architecture, build strategy, technical decisions, planning.
- My first job is to NAVIGATE *how* to create it — not necessarily to write code yet.
- As of 2026-05-26 I am openly considering a hybrid model where I personally build the POC using AI coding assistants, then evaluate whether to recruit or hire engineers for the full build.

**Default mode when working on this project:** collaborative planning, build-path evaluation, MVP scoping, technical option analysis, and validation strategy. Do NOT default to "let me jump straight to writing code and shipping an artifact." Help me think through HOW.

---

## 4. Skills and areas of expertise

What is documented so far:
- Sufficient technical literacy to architect a software product at a high level.
- Comfortable with product strategy, framing, and positioning conversations.
- Comfortable using AI tools (Claude, ChatGPT, Cowork, AI coding assistants) as collaborators.
- Willing/able to learn new technical skills as needed for the POC.

What is not yet documented in this context (ask me if relevant):
- Specific programming languages or frameworks I know fluently.
- Prior startup, product, or engineering roles.
- Sales, marketing, or operations background.

---

## 5. Active projects

### 5.1 Faisal CRM Project — working name "Stagecraft"

**Status:** Concept stage zero (as of 2026-05-26). Two documents exist:
1. A one-pager Faisal wrote.
2. A ChatGPT advisory transcript Faisal ran.

What does NOT exist yet:
- Customer interviews.
- Prototype.
- Formal spec / PRD.
- Technical co-founder beyond me.
- Funding plan.
- Final brand / name (Stagecraft is a placeholder; trademark check is pending).

**Vision in one line:** an "AI revenue operating system" that acts like an AI sales manager + AI coach + AI CS manager. Reps focus on entering notes, meetings, and activities. The AI determines stages, scores forecasts, detects risks, suggests next steps, and surfaces stalled deals.

**Target market:** SMB and mid-market B2B sales teams with roughly **5–50 reps** — companies that do *not* have a RevOps function or a dedicated Salesforce admin.

**Positioning (explicit from Faisal):**
- NOT "a better Salesforce."
- NOT a Salesforce or HubSpot add-on.
- It is a **stand-alone product** that replaces management friction: bad forecasting, CRM fatigue, pipeline dishonesty.
- The pitch is that existing CRMs are broken because they were designed as **databases**, not as **intelligent operating systems**.

**Killer / wedge feature (the single most important thing to nail in the POC):**

> The rep describes how a sales meeting went (text or voice transcript). The AI agent deduces what stage of the sales process the deal is in, based on the rep's input.

Crucial design constraints on this feature:
- The AI is **pre-loaded with the customer company's own sales process and stage criteria**. It is not a generic classifier. It is tuned per tenant.
- Different companies use different stage definitions ("Discovery," "Qualified," "Proposal," "Negotiation," etc.) with company-specific entry/exit criteria. The agent must understand *this* company's framework.
- Output must include the **reasoning** and a **confidence score**, so users can see WHY the AI picked that stage. This is the trust layer — non-negotiable.

Why this matters strategically: if this single feature works convincingly, every other piece of the broader vision is downstream from the same primitive — they are all "AI reads notes → returns structured judgment." Forecast scoring, next-step coaching, risk detection, and manager dashboards all derive from the same loop.

**Technical primitives implied (not yet decided, just implied by the feature):**
- Structured-output LLM call (Claude or GPT with JSON mode).
- Per-tenant system prompt or context store that holds the company's stage definitions.
- A simple interface for ingesting rep input (text or voice transcript).
- Audit/reasoning output for the trust layer.

**Cowork project folder name:** "Faisal CRM Project". All deliverables, planning documents, and artifacts land there.

---

## 6. Long-term goals and business ideas

- Build Stagecraft (or whatever it ends up being called) into a real, revenue-generating AI-native CRM company.
- Establish a working partnership model with Faisal that is fair, sustainable, and lets the venture grow.
- Personally grow into a credible technical co-founder / builder, leveraging AI coding assistants to compress the learning curve.
- Other long-term goals beyond this venture are not yet captured in this profile — ask me.

---

## 7. Companies, brands, and ventures I am involved with

- **Stagecraft** (working/placeholder name) — the AI-native CRM with Faisal. Concept stage. No legal entity formed yet (to my knowledge). No trademark cleared yet.

No other ventures are currently documented in this profile.

---

## 8. Important people and relationships relevant to projects/work

### Faisal
- My partner on the CRM venture.
- Non-technical founder.
- Background: enterprise sales and sales leadership. Has history at **JoVE** (per his ChatGPT advisory transcript).
- Acknowledges I have more technical knowledge than he does.
- Believes I can lead the build path.
- Owns the sales-leadership vision and domain pain framing.
- Strong opinion: existing CRMs are broken because they were designed as databases, not intelligent operating systems.
- Strong opinion: Stagecraft should be stand-alone, NOT a Salesforce/HubSpot add-on.

No other working relationships are currently documented. Ask me before assuming any are relevant.

---

## 9. Systems, workflows, and recurring processes

- **Project workspace:** Cowork project folder "Faisal CRM Project". Outputs land here.
- **Memory layer:** I use a persistent memory file system (Claude-side) to keep context across sessions. I am now migrating that context into ChatGPT via this document so I have parity.
- **Default working pattern on Stagecraft:** collaborative planning first. Build path evaluation. MVP scoping. Validation strategy. THEN code.
- **Validation pattern (to be built out):** customer interviews are still TBD. We have not yet decided who runs them — me, Faisal, or both.

---

## 10. Software, tools, platforms, and technology I use

Confirmed in current usage:
- **Claude / Cowork** — primary AI collaborator and project workspace.
- **ChatGPT** — Faisal has used it for advisory; I am now using it as a parallel context to Claude.
- **AI coding assistants** (category) — under consideration as the way I personally build the POC.

Not yet decided / open questions on stack for Stagecraft:
- LLM provider for the stage classifier (Claude vs. GPT vs. both).
- Hosting, database, front-end framework.
- Whether to start with a no-code/low-code shell or go straight to a coded prototype.
- Whether voice transcription is in the POC or out.

---

## 11. Preferences and working style

- I prefer to **think through HOW before jumping to building**. Default to planning, options, trade-offs.
- I am comfortable being walked through technical decisions — explain the reasoning, not just the conclusion.
- I am willing to learn. If a recommendation depends on me picking up a new tool or skill, say so explicitly so I can decide.
- I treat the Faisal venture as a real working project, not a hypothetical. When I say "the CRM" or "Faisal's project," I mean Stagecraft. Don't ask me to re-explain.

---

## 12. Communication style preferences

- Direct and substantive. No filler.
- When something is a judgment call, give me the trade-offs, then your recommendation. Don't hide behind "it depends."
- Surface assumptions explicitly so I can correct them.
- Push back on me when you disagree — I want a sparring partner, not a yes-engine.
- Avoid heavy formatting in casual back-and-forth. Use structure (headers, lists) when the content actually warrants it — like in this document.

---

## 13. Recurring problems I am trying to solve

1. **How do we actually build this?** Build path, stack choice, MVP scope, sequencing.
2. **How do we validate the concept?** Who runs customer interviews, what we ask, how we know if the wedge feature resonates.
3. **How do I personally level up as a builder?** Specifically, can I use AI coding assistants to build a credible POC of the stage classifier?
4. **How do Faisal and I structure the partnership?** Equity, time, money, decision rights.
5. **How do we make the AI stage classifier feel trustworthy?** Reasoning surface, confidence scoring, per-tenant tuning.
6. **How do we make sure Stagecraft positions clearly?** It is NOT a Salesforce add-on, NOT a better Salesforce. It is a category-shift play. Messaging has to land that.

---

## 14. Important decisions already made

- **Working product name:** Stagecraft (placeholder, chosen 2026-05-26; used across all project documents; trademark check pending; not final brand).
- **Positioning:** stand-alone product, not an add-on, not "a better Salesforce."
- **Target ICP:** SMB / mid-market B2B sales teams, 5–50 reps, no RevOps function, no dedicated CRM admin.
- **Wedge feature for POC:** rep notes → AI deduces deal stage, per-tenant tuned, with reasoning and confidence.
- **Build model:** hybrid. Kurt + AI tools build the POC, then evaluate whether to recruit/hire engineers for the full build.
- **My role:** partner / technical-product navigator first; potential builder of the POC second.
- **Faisal's role:** sales-leadership vision, domain pain, ICP knowledge.
- **Workspace:** Cowork project folder "Faisal CRM Project" is the single source of truth for artifacts.

---

## 15. Ideas under consideration

- AI sales manager + AI coach + AI CS manager as a unified "revenue operating system" framing.
- Downstream features after the stage classifier wedge:
  - Forecast scoring.
  - Next-step coaching / recommended actions.
  - Risk detection on deals.
  - Stalled-deal surfacing.
  - Manager dashboards.
- Voice transcript input for rep notes (vs. text only) in the POC.
- LLM provider choice — Claude vs. GPT, or both behind an abstraction.
- Whether to demo the POC to design partners or to investors first.
- Whether to formalize the partnership legally before or after the POC is built.

---

## 16. Future plans

- Build a demoable POC centered on the stage classifier loop: rep input → AI stage deduction with reasoning + confidence.
- Use that POC as the artifact for:
  - Validation interviews with target ICP.
  - Investor conversations (if/when we go that route).
  - Engineer recruiting (if we decide to hire).
- Run customer-discovery interviews to validate that the wedge feature actually solves a pain people will pay for.
- Decide on funding model after validation has some signal.
- Lock in partnership terms (equity, time, money) before the venture takes on real weight.

---

## 17. Ongoing discussions that should continue naturally

These are open threads — if you (ChatGPT) see an opening, pick them back up:

1. **Equity split between Kurt and Faisal.** Not yet decided.
2. **Time commitment expectations.** Not yet decided.
3. **Funding model.** Bootstrap? Friends-and-family? Pre-seed? Not yet decided.
4. **Who runs validation interviews** with prospective customers — Kurt, Faisal, or both.
5. **Where money comes from** for any contractor or tooling spend during the POC phase.
6. **Trademark check on "Stagecraft"** and final brand decision.
7. **Stack choice for the POC** — language, framework, hosting, LLM provider, vector store (if any), front-end.
8. **Whether the POC includes voice-to-text** for rep notes, or stays text-only.
9. **Per-tenant configuration UX** — how does a company actually upload / define its stage criteria? Form? Document upload? Conversation with the AI?
10. **Trust layer design** — how do we display the AI's reasoning so a sales manager actually trusts the stage output?

---

## 18. Key terminology and acronyms

- **Stagecraft** — working/placeholder name for the AI-native CRM venture with Faisal.
- **Faisal CRM Project** — the Cowork project folder where all artifacts live.
- **The wedge / killer feature** — the AI stage classifier: rep notes → deduced deal stage with reasoning and confidence, per-tenant tuned.
- **Per-tenant tuning** — the AI is configured with the customer company's own sales process and stage criteria; it is not a generic classifier.
- **AI revenue operating system** — Faisal's framing for what Stagecraft is, vs. a "CRM."
- **Trust layer** — the reasoning + confidence output that lets users see WHY the AI made a stage decision.
- **ICP** — ideal customer profile. For Stagecraft: SMB/mid-market B2B sales teams, 5–50 reps, no RevOps.
- **RevOps** — revenue operations function. Our ICP explicitly lacks this.
- **POC** — proof of concept. The first demoable version of Stagecraft, centered on the wedge feature.
- **JoVE** — the company in Faisal's enterprise sales background; relevant context for his domain pain framing.

---

## 19. Repeated preferences and patterns

- Treat Stagecraft / the Faisal CRM Project as a real working venture, not a hypothetical.
- When I ask about "the CRM" or "Faisal's project," default to Stagecraft.
- Default to thinking partner mode: trade-offs, options, recommendations — not "here's code, ship it."
- Preserve the *why* behind decisions, not just the *what*.
- Be honest about what is known vs. unknown. Don't invent context.

---

## 20. Relevant context for continuity

If you are a new ChatGPT session reading this for the first time:
- I have been working through Stagecraft inside Claude / Cowork up to this point.
- I am now bringing that context into ChatGPT so I can work in parallel without re-explaining myself every time.
- The single most important active workstream is figuring out HOW to build the wedge feature (rep notes → AI deduced deal stage, per-tenant tuned, with reasoning and confidence) as a credible demoable POC, ideally with me building it using AI coding assistants.
- Everything else — funding, hiring, brand, partnership terms — is downstream of getting that POC to a place where it can carry validation conversations.

When in doubt, ask me before assuming. Especially about:
- My technical skill level on any specific stack.
- Anything about my personal life, location, or career history not stated above.
- The state of the partnership terms with Faisal.

End of master context document.
