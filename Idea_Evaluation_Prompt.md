# Idea Evaluation Prompt — Stagecraft / Faisal's AI CRM

**Purpose:** A self-contained prompt to feed into any AI evaluation tool (mirofish, ChatGPT, Claude, Gemini, Perplexity, etc.) to get a calibrated honest assessment of whether the project is worth committing to.

**Why it's structured this way:**
- Forces a calibrated probability (most "evaluate this idea" prompts return mush — a number commits the model and forces real reasoning)
- Combines skeptical-investor framing (overweights distribution / TAM / unit economics) with sales-VP framing (overweights real workflow pain) — closer to what an actual seasoned advisor would do
- Demands structured output so responses are comparable across tools and across iterations
- Closes the "don't flatter, don't hedge" door explicitly because LLMs default to encouragement

**How to use:**
1. Copy everything in the code block below
2. Paste into the AI tool of your choice
3. Compare answers across tools — if multiple independent tools converge on similar probabilities and risks, that's a stronger signal than any single answer
4. Re-run the prompt every time the project's situation materially changes (new customer validation data, partnership terms settled, funding secured, etc.) — the answer will shift

---

## The Prompt

```
You are a skeptical early-stage venture investor and a former enterprise
sales VP. You have seen many CRM and sales-tech startups succeed and fail.
You evaluate ideas honestly — neither cheerleading nor reflexively negative.
Calibrate your assessment in probabilities, not opinions.

Evaluate the following startup concept and predict its likelihood of
reaching $1M in annual recurring revenue within 24 months of shipping
its MVP.

THE CONCEPT
An AI-native, standalone CRM for B2B sales teams of 5–50 reps, in
established industries (initial vertical: TBD, candidates include EdTech,
biotech, recruiting, professional services). The product is positioned
as an "AI sales operating system" — not a database for storing sales data,
but an intelligent layer that replaces manual stage management,
forecast guessing, and pipeline inspection.

THE CORE WEDGE FEATURE ("Stagecraft")
The rep types or dictates a brief narrative summary of what happened in
a sales meeting (NOT a recorded transcript). An AI agent — preloaded with
that company's sales process and stage criteria — returns the deal's
current stage, a confidence score, the reasoning, the signals it found,
what's missing or ambiguous, and a recommended next action.

THE FOUNDING TEAM
- Founder: enterprise sales leader with operational experience running
  sales teams (background in EdTech / biotech sectors). Non-technical.
  Strong domain knowledge of pipeline pain, forecasting failures, CRM
  hygiene problems, and sales-management workflow.
- Partner: technically literate but not a traditional engineer. Plans to
  build the proof-of-concept himself using modern AI coding assistants
  (Lovable / Bolt / v0 + Claude/GPT APIs). Will navigate technical
  decisions and product architecture. Comfortable learning what's needed
  for the POC.

THE COMPETITIVE LANDSCAPE (as of mid-2026)
- Day.ai: AI-native standalone CRM. $24M from Sequoia. Founded by ex-CPO
  of HubSpot. Auto-infers deal stages from RECORDED meeting transcripts
  (Zoom / Google Meet / Teams). Google-first. Targets solo founders and
  tech startups. Pricing typically $100+/user/month.
- Coffee AI: AI-native CRM that can run standalone OR as a companion to
  Salesforce/HubSpot. Backed by Salesforce Ventures. Multi-platform.
  Flat seat-based pricing with unlimited automation. Aggressive content
  marketing — dominates SEO. Founded by ex-LinkedIn/Salesforce exec
  (Fliptop, acquired by LinkedIn).
- Sybill, Read.ai: companion apps that autofill CRM fields including
  deal stage from call data, sit on top of Salesforce/HubSpot.
- Attio: $116M-funded modern AI-native CRM, more horizontal.
- Salesforce Einstein, HubSpot Breeze: incumbents adding AI features
  inside their platforms.

THE PROPOSED DIFFERENTIATION
1. Input modality: rep narrative (text/voice summary), not meeting
   recording. Works for in-person meetings, phone calls, hallway
   conversations, regulated industries that cannot record, and any
   situation a meeting bot cannot join.
2. Vertical focus (TBD, leveraging founder's domain depth) — competitors
   are all horizontal.
3. Management layer as first-class citizen: forecast confidence, deal
   inspection, rep accountability, manager visibility. Competitors treat
   this as shallow / afterthought.
4. Standalone-only positioning (not hedged like Coffee).
5. Multi-platform support (not Google-first like Day.ai).
6. Transparent flat-fee pricing matching SMB buying preferences.

CURRENT STATUS
Concept stage. No customer interviews completed. No prototype. Partnership
terms (equity / time / money) not yet finalized between founder and
partner. Funding: none — bootstrapping a POC first.

YOUR TASK
Respond in this exact structure:

1. PROBABILITY: a calibrated probability (0–100%) that this project
   reaches $1M ARR within 24 months of shipping MVP. Justify the number
   in two sentences.

2. TOP THREE RISKS (ranked by severity): For each risk, state the risk,
   why it's serious, and the failure mode it leads to.

3. TOP THREE CONDITIONS THAT WOULD MEANINGFULLY RAISE THE ODDS: Be
   specific — not "good execution" but "founder commits to one vertical
   and lands three named pilot customers in that vertical within 90 days."

4. MOST LIKELY FAILURE MODE: The single most probable way this dies, in
   2–3 sentences.

5. HONEST VERDICT: If you had to choose, would you (a) commit personal
   time as the technical partner described, (b) advise the founder to
   pivot meaningfully, or (c) advise the founder to walk away? Explain
   why in 3–4 sentences.

Do not flatter. Do not hedge. Do not refuse to give a number. If the
information is incomplete, state what's missing AND give your best
estimate anyway.
```
