# Sales Frameworks Reference — MEDDIC, SPIN, BANT

**Purpose:** Plain-language reference for the three sales qualification frameworks Faisal wants Stagecraft's AI to use. Written so Kurt can follow the discussion at tomorrow's meeting with confidence.

**Date:** 2026-05-26

---

## Why these frameworks matter for Stagecraft

These are the three most widely used qualification frameworks in B2B sales. Sales leaders use them to answer one question: "Is this deal real, and what stage is it actually at?"

For Stagecraft, they matter because they give the AI **standardized criteria to reason against** when a rep submits meeting notes. Instead of asking "what stage is this?" in a vacuum, the AI can ask "based on what the rep wrote, which BANT criteria are met? Which MEDDIC criteria? What's missing?"

Faisal's instinct to feed these into the AI is correct. It gives Stagecraft an opinionated, out-of-the-box default that demos well — customers don't have to define their own stage criteria from scratch on day one, they can start with a framework and customize from there.

---

## BANT — Budget, Authority, Need, Timeline

The oldest and simplest of the three. Originally invented by IBM in the 1960s. Still ubiquitous.

| Letter | Question the rep is trying to answer |
|---|---|
| **B**udget | Does the prospect have money to spend? How much? Is it already allocated? |
| **A**uthority | Is the rep talking to someone who can sign? Who else needs to approve? |
| **N**eed | Is there a real problem the product solves? Is it urgent or nice-to-have? |
| **T**imeline | When does the prospect want to make a decision? Is it driven by a real deadline? |

**How it maps to deal stage:**
- 0 of 4 BANT criteria met → early discovery
- 1–2 met → qualified lead
- 3 met → opportunity / solution discussion
- All 4 met → late stage / proposal / negotiation

**Where BANT is weak:** modern complex B2B sales rarely have just one decision-maker, and "budget" often only gets created during the sales process itself. MEDDIC and SPIN exist partly to address these gaps.

---

## MEDDIC (and MEDDPICC) — The Enterprise Standard

Developed at PTC in the 1990s and now standard at companies like Salesforce, Oracle, and most enterprise SaaS sellers. There's a base version (MEDDIC, 6 letters) and an extended version (MEDDPICC, 8 letters). Faisal might use either name.

| Letter | What it means | What the rep is trying to find out |
|---|---|---|
| **M**etrics | Quantified pain or opportunity | What number does the buyer want to move? By how much? In what timeframe? |
| **E**conomic Buyer | The person who actually controls the budget | Who has the authority to release funds — not approve, but actually sign? |
| **D**ecision Criteria | What the buyer will use to evaluate options | What specific capabilities or criteria must the solution meet? |
| **D**ecision Process | How the decision will get made | What are the steps, who's involved at each step, what could derail it? |
| **I**dentify Pain | The actual pain driving urgency | What happens to the buyer's business or career if nothing changes? |
| **C**hampion | An internal advocate selling on your behalf | Who inside the buyer's org will fight for this deal when you're not in the room? |
| **P**aper Process *(MEDDPICC only)* | The legal/procurement steps | What contracts, security reviews, vendor approvals are required? |
| **C**ompetition *(MEDDPICC only)* | Who else the buyer is considering | Status quo, in-house build, named competitors — what are you up against? |

**How it maps to deal stage:**
- Most criteria unknown → early discovery
- Metrics + Pain confirmed → qualified opportunity
- Economic Buyer + Champion identified → solution stage
- Decision Process + Paper Process mapped → proposal / negotiation
- All criteria green → close

**Where MEDDIC is strong:** it forces reps to actually understand the buyer's organization, not just collect feature requirements. The Champion concept in particular — "who fights for you when you're not in the room" — is what separates real deals from polite interest.

**Where MEDDIC is weak:** it can become bureaucratic. Some sales orgs turn MEDDIC into a checklist that reps fill in to satisfy management rather than to actually understand the deal.

---

## SPIN — Situation, Problem, Implication, Need-payoff

Developed by Neil Rackham in the 1980s based on actual research into what successful salespeople do differently. Less about qualification and more about how to structure a sales conversation. Often used alongside BANT or MEDDIC.

| Letter | Type of question the rep asks | Example |
|---|---|---|
| **S**ituation | Gathering facts about the buyer's current state | "How do your sales managers currently track pipeline health?" |
| **P**roblem | Surfacing dissatisfactions and challenges | "How often do you discover late-stage deals were never going to close?" |
| **I**mplication | Exploring the consequences of the problem | "When the forecast misses, what happens with the board? With your team's headcount?" |
| **N**eed-payoff | Getting the buyer to articulate the value of solving it | "If your forecast were accurate within 5%, what would that change about how you run the team?" |

**How it maps to deal stage:**
- Mostly Situation questions → early discovery
- Problem questions confirming pain → qualified
- Implication questions getting buyer to articulate cost of inaction → solution stage
- Need-payoff statements from the buyer → late stage (they're now selling internally)

**Where SPIN is strong:** it's the framework that most closely tracks how complex B2B buying decisions actually get made. The Implication step in particular is where good salespeople differentiate from bad ones.

**Where SPIN is weak:** it's a conversation framework more than a qualification framework — it tells you how to ask, not what's required to advance the deal.

---

## How Stagecraft Uses Them

For the POC, Stagecraft should ship with all three frameworks pre-loaded as default templates. Here's how the AI uses them:

When a rep submits meeting notes, the AI evaluates the notes against the active framework (or all three combined) and returns:

- Which framework criteria are **confirmed** (explicit evidence in the notes)
- Which are **partial** (inferred but not certain)
- Which are **missing or unknown** (no evidence yet)
- A derived **stage recommendation** based on the criteria coverage
- A **next-action recommendation** targeted at the highest-value missing criterion (e.g., "no Economic Buyer identified — recommend asking about budget approval process on next call")

The customer can:
- Pick which framework(s) their team uses
- Customize the criteria (add "compliance review required" to MEDDPICC's Paper Process for regulated industries)
- Override the framework entirely and define their own stages

This is more flexible than what most competitors offer — Coffee AI applies frameworks rigidly, Day.ai mostly infers from conversation transcripts without an explicit framework.

---

## Strategic Note (Read Before the Meeting)

**Important caveat for tomorrow's conversation:** Using BANT/MEDDIC/SPIN as the AI's reasoning backbone is *correct* but is *not* differentiation. Coffee AI explicitly markets that its agent "applies sales frameworks automatically through AI-structured meeting notes" using these exact frameworks. From the Coffee AI competitive analysis we already wrote:

> "AI agents like Coffee automate the structuring of meeting notes using BANT or MEDDIC frameworks, so consistent qualification data enters the system without extra work from sales representatives."

What this means for the partner meeting:

1. **Embrace Faisal's framework idea** — it's smart, it's the right design choice, it makes the POC demo land.
2. **But don't let it become the differentiation story** — saying "we use MEDDIC" is the same thing every other AI sales tool says. The differentiation is still **rep narrative input (no recording)**, **vertical focus**, and **management layer as hero**.
3. The framework integration *supports* the differentiation; it doesn't replace it. The pitch becomes: "We use the frameworks your team already knows, but we read them from a rep's plain-English summary instead of requiring meeting recordings, and we focus on the management view your existing tools don't give you."

If Faisal during the meeting starts pitching the framework integration as the wedge, gently steer him back to the structural differentiation. The wedge has to be something competitors don't already do.

---

## Cheat Sheet for the Meeting

If Faisal references one of these in conversation and Kurt wants a quick mental model:

- **BANT** = the basic 4-question qualifier. Budget, Authority, Need, Timeline.
- **MEDDIC** = the 6-letter enterprise version. Adds Metrics, Champion, Decision Process.
- **MEDDPICC** = MEDDIC + Paper Process + Competition.
- **SPIN** = the 4-stage conversation framework. Situation → Problem → Implication → Need-payoff.

If Faisal says "we'd run this against MEDDIC," that means he wants the AI to score deals on those 6 criteria.

If Faisal says "we'd use SPIN for the next-action recommendations," that means he wants the AI to suggest the next question the rep should ask based on which SPIN stage the conversation is currently in.

If Faisal says "BANT-qualified," that means the prospect has all 4 of Budget, Authority, Need, Timeline confirmed.
