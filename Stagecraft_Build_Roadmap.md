# Stagecraft Build Roadmap — How to Create the AI Stage Classifier

**Project:** Stagecraft (working name)
**Scope:** The technical build plan for the POC's core feature — the AI stage classifier (what we previously called "StageAgent"). Everything else in the eventual product is downstream of this working well.
**Audience:** Kurt — technically literate but not a traditional engineer; building with AI coding assistants.
**Realistic total timeline:** ~8 weeks part-time (10–15 hrs/week), or ~4 weeks full-time.
**Total cost:** under $100 (LLM credits + maybe a paid tier on a build tool).

---

## Core Principles — Read These First

These are the load-bearing ideas. Internalize them before starting any phase.

1. **Prompt > Code.** 80% of the value of the product lives in the prompt that tells the LLM how to reason. The wrapper code (UI, API call, hosting) is the easy 20% that AI coding assistants can write for you in an afternoon. Spend your time on the prompt.

2. **Faisal MUST be in the loop on prompt iteration.** You cannot define "what stage is this deal at" alone. That's domain expertise Faisal has and you don't. The prompt-engineering phase is a collaboration, not a solo build. Block time on his calendar weekly.

3. **Test set before prompt.** Before writing the prompt, build a set of 20–30 example meeting notes paired with the "correct" stage answer. This becomes your ground truth. You'll measure every prompt iteration against this set. Without it you're flying blind.

4. **No scope creep.** Only the stage classifier. No contacts database, no pipeline view, no manager dashboard, no integrations, no auth. Every "wouldn't it be cool if" is a delay that kills the POC. Discipline matters more than ambition.

5. **Demo before you optimize.** Get something Faisal can show to sales leaders within 6–8 weeks. Polish comes after validation, not before.

---

## Phase 0 — Setup (Days 1–2)

**Goal:** Working dev environment, confirmed API access.

**Steps:**

1. Create a new folder on your computer: `C:\Users\WOLF\Documents\Stagecraft-POC\`
2. Inside, create subfolders: `prompts/`, `test_data/`, `code/`, `output_samples/`
3. Confirm DeepSeek API still works — re-run the PowerShell test from earlier
4. Install **Cursor** (cursor.sh) or **Claude Code** (claude.com/code) — these are AI coding assistants that let you build by describing what you want. Pick one. Cursor is more like an IDE; Claude Code runs in your terminal.
5. Optional but recommended: sign up for **Lovable** (lovable.dev) and **Bolt** (bolt.new) — both have free tiers. You'll use one of them to generate the UI later.

**What to learn this phase:**
- How to make an API call to DeepSeek with curl or Python (your existing PowerShell test counts)
- Basic interaction pattern with Cursor or Claude Code — type what you want, review what it writes

**Deliverable:** You can call DeepSeek's API from a script and get a response.

---

## Phase 1 — Build the Test Set (Days 3–5)

**Goal:** 25–30 realistic meeting note samples, each labeled with the "correct" answer.

**This is where Faisal does most of the work.** You facilitate, he provides the domain content.

**Steps:**

1. Pick the vertical Faisal commits to at tomorrow's meeting (e.g., biotech BD).
2. Define 5–7 sales stages with criteria. Use MEDDIC as the default framework. Faisal writes the stage names, entry/exit criteria, and which MEDDIC elements gate each transition.
3. Faisal drafts 25–30 sample meeting notes. Each one is a 100–300 word account of a realistic sales meeting in that vertical. Vary the realism: some early-stage, some deep negotiations, some clearly stalled, some ambiguous.
4. For each note, Faisal writes the "correct" answer: which stage, why, what's missing, what next action. This is the answer key.
5. Save the test set as a JSON or markdown file in `test_data/`.

**Why this matters:** Without ground truth, you can't tell if a prompt is good or bad. You'll just be guessing. With it, every prompt iteration is measurable.

**What to learn this phase:**
- Nothing technical for you — this is Faisal's work. You just structure his input into usable files.

**Deliverable:** `test_data/sample_meetings.json` with 25–30 labeled examples.

---

## Phase 2 — Prompt Engineering (Weeks 2–3) — THE MOST IMPORTANT PHASE

**Goal:** A prompt that, when given a meeting note + company config, returns the correct structured stage judgment 80%+ of the time on the test set.

**This is the heart of the project. Spend more time here than anywhere else.** Most days of these two weeks should be iterating on the prompt with Faisal at your side (or on call).

**Steps:**

1. Write the initial system prompt. It should include:
   - The company's stage definitions
   - The chosen framework's criteria (e.g., MEDDIC's 6 elements)
   - The output structure (stage, confidence, reasoning, signals_found, missing_criteria, recommended_next_action, risk_flags, framework_criteria)
   - Reasoning instructions ("think step by step before you respond")
   - Examples of good output (1–2 worked examples inside the prompt itself — this is called "few-shot prompting")

2. Write a simple Python or Node script that:
   - Loads the test set
   - For each sample, calls DeepSeek with the system prompt + the sample notes
   - Saves the AI's response
   - Compares to the answer key
   - Reports: how many stages matched? How many reasonings were plausible (Faisal judges)?

3. Run the script. Review the failures with Faisal. Adjust the prompt. Re-run. Repeat.

4. Common failure modes you'll see and how to fix:
   - **AI hallucinates evidence not in the notes** → add instruction "Only cite specific phrases from the notes. Do not invent details."
   - **AI is too confident** → add instruction "If 2+ MEDDIC criteria are missing, confidence cannot exceed 60."
   - **AI ignores the framework** → restructure the prompt to make framework evaluation Step 1, stage assignment Step 2.
   - **AI returns inconsistent output structure** → use DeepSeek's `response_format={"type": "json_object"}` parameter and include a JSON schema in the prompt.

5. When you hit 80%+ accuracy and Faisal agrees the reasoning quality is "what I'd say in a pipeline review" — lock the prompt. Save it as `prompts/v1.0_locked.md` with a date.

**What to learn this phase:**
- How LLMs follow structured prompts (read Anthropic's prompt engineering guide; same principles apply to DeepSeek)
- Few-shot prompting (giving examples inside the prompt)
- Structured output with JSON mode
- How to write evaluation scripts (basic Python with the `openai` library — works for DeepSeek since they're OpenAI-compatible)

**Deliverable:** `prompts/v1.0_locked.md` + an evaluation script that proves 80%+ accuracy on the test set.

---

## Phase 3 — Build the Core API Function (Week 4)

**Goal:** A single function that takes meeting notes + company config and returns the structured judgment. No UI yet.

**Steps:**

1. Refactor the script from Phase 2 into a clean reusable function. Inputs: meeting notes string, company config object. Output: the structured judgment JSON.
2. Wrap it as a serverless function. Use **Vercel Functions** (deploy a Next.js or plain Node.js handler).
3. Test the endpoint with curl or Postman from your machine. Same response as the local script? Good.
4. Add basic error handling: what happens if DeepSeek returns malformed JSON, if the notes are empty, if rate-limited, if the API key is wrong. Don't over-engineer — just don't crash.

**What to learn this phase:**
- What a serverless function is (it's a Node or Python function that runs in the cloud when called via HTTP — Vercel makes this easy)
- How to deploy to Vercel (it's "push to GitHub, Vercel auto-deploys" — about 30 minutes to learn)
- How to test an API endpoint with Postman or curl

**Deliverable:** A live URL like `https://stagecraft-poc.vercel.app/api/classify` that returns a structured judgment when called.

---

## Phase 4 — Build the UI (Weeks 5–6)

**Goal:** A simple, demo-ready web app that wraps the API function from Phase 3.

**This is where Lovable or Bolt earns its keep.** Don't write React from scratch — describe what you want and let the AI build it.

**Steps:**

1. Open Lovable (lovable.dev) and describe the app in plain English. Suggested prompt:

   > "Build a simple web app for a sales CRM POC. Three screens: (1) Setup: configure a company's sales stages and choose a framework (MEDDIC/SPIN/BANT). (2) Input: a large text box where a sales rep pastes their meeting notes, plus a 'Analyze' button. (3) Output: shows the AI's response — current deal stage with confidence badge, plain-English reasoning, list of confirmed/missing framework criteria, recommended next action, any risk flags. Make it clean, professional, dark mode. When the user clicks Analyze, call the API at [your Vercel URL]."

2. Iterate with Lovable. It generates code; you preview; you say "make the output card bigger, add a copy button next to the AI's recommendation." Repeat until it looks demo-ready.

3. Hard-code 2–3 example companies in the setup screen so demos work without configuration (e.g., "Demo Co A: Biotech BD", "Demo Co B: EdTech Enrollment").

4. Hard-code 3–5 example meeting notes the rep can load with one click — for live demos where you don't want to type a full meeting summary.

5. Connect the UI to your Vercel API endpoint from Phase 3.

6. Test end-to-end: pick a company → load a sample note → click Analyze → see the AI's response.

**What to learn this phase:**
- How to use Lovable or Bolt (intuitive — describe and iterate)
- Basic web app concepts (frontend calls backend API, displays response)
- Connecting a frontend to an external API endpoint

**Deliverable:** A working URL that Faisal can show to a sales leader on a screen-share and have it not embarrass either of you.

---

## Phase 5 — Polish for Demo (Week 7)

**Goal:** The POC is reliable enough for live demos to real prospects.

**Steps:**

1. Test the full flow 20 times in a row. Anything that breaks → fix.
2. Add a fallback: if DeepSeek is slow or fails, show a friendly error instead of a crash.
3. Make sure the URL is HTTPS (Vercel does this automatically) and works on mobile (sales leaders will sometimes pull it up on phones).
4. Take screenshots of the most impressive demo runs for the pitch deck.
5. Write a 2-minute demo script Faisal can use: "First I'll set up the company, then I'll paste a meeting note, then look at what Stagecraft tells us..."
6. Practice the demo with Faisal 5–10 times before he shows it to anyone real.

**What to learn this phase:**
- Basic demo polish instincts (you'll feel them as you practice)

**Deliverable:** A demo URL Faisal can confidently put in front of sales leaders.

---

## Phase 6 — Validation Demos (Week 8 — Faisal-led)

**Goal:** Get the POC in front of 10 sales leaders and learn what they actually think.

This phase is Faisal's domain, not yours. You support by:

- Being on the demos to take notes and watch reactions
- Iterating on the prompt or UI based on consistent feedback
- Tracking what works and what doesn't in a simple spreadsheet
- Updating mirofish quarterly with new learnings to see if the probability moves

**What you learn this phase:**
- What sales leaders actually care about (often different from what you assumed)
- Which parts of the demo land and which fall flat
- Whether the rep-narrative-input thesis holds up against real customer questions

**Deliverable:** Either signed pilot agreements (best case) or specific learning about what needs to change before the project continues.

---

## Tool Stack Summary

| Phase | Tool | Cost | Why |
|---|---|---|---|
| Setup | Cursor or Claude Code | Free / ~$20/mo | AI coding assistant for the wrapper code |
| Prompt eng | DeepSeek API | ~$5–10 total for all testing | LLM that interprets meeting notes |
| Code | Python or Node.js | Free | Your evaluation scripts |
| API | Vercel Functions | Free tier | Hosts your serverless API |
| UI | Lovable or Bolt | Free / ~$20/mo | Generates the web UI from descriptions |
| Hosting | Vercel | Free tier | Hosts both API and UI on one URL |
| Storage | Hard-coded JSON files | Free | No database needed for POC |
| Domain (optional) | Namecheap | ~$12/year | If you want a custom URL like stagecraft.app |

**Total recurring monthly cost during build: $20–40.** Total one-time API testing cost: under $20.

---

## What Could Go Wrong (and What to Do)

**You spend 6 weeks on prompt engineering and accuracy plateaus at 60%.**
→ This means the AI fundamentally can't reason about deals well enough. Talk to Faisal. Decide: do we sharpen the test set, simplify the framework, or pivot the product? Don't keep iterating blindly. If 6 weeks of focused work can't get to 80%, the thesis itself is at risk.

**Lovable/Bolt generates a UI that breaks every time you change anything.**
→ Common. Switch tools (try the other one). Or have Cursor or Claude Code write the React code directly — slower but more controllable.

**Faisal can't sit for the prompt iteration sessions.**
→ This is the project-killing risk. Schedule them in advance, treat them as non-negotiable. If Faisal can't commit 3–5 hours per week to this for 3 weeks, the project doesn't have a future.

**DeepSeek changes their API and breaks your integration.**
→ Switch to another OpenAI-compatible provider (OpenRouter is the easiest fallback — routes to dozens of models through one API). Your code shouldn't need to change much.

**You hit Vercel's free tier limits.**
→ Won't happen during the POC. The free tier is generous.

**The demo is technically great but sales leaders don't bite.**
→ This is actually the BEST outcome of the POC because it means you learned the truth cheaply. Either the wedge is wrong, the vertical is wrong, or the pitch is wrong. Faisal pivots based on what they say no to.

---

## When to Re-Run Mirofish

Re-run the mirofish simulation at each of these milestones:

- After the partner meeting (tomorrow) — to capture the new commitments and see how probability moves
- End of Phase 2 (prompt accuracy locked) — to see if technical validation moved the probability
- End of Phase 6 (after the 10 demos) — this is the big moment; market feedback will move the number meaningfully
- Any time the vertical, distribution strategy, or partnership terms change

The number should rise as preconditions get met. If it isn't rising, something is wrong with the execution and you need to inspect what.

---

## Bottom Line

In 8 weeks of focused work, with Faisal's domain expertise in the loop, you can have a real demoable POC for under $100. The hard part isn't the code — it's the discipline to (a) keep scope tight, (b) keep Faisal at the table for prompt iteration, and (c) ship something demoable instead of something perfect. If both of you commit to those three things at tomorrow's meeting, the build itself is achievable.
