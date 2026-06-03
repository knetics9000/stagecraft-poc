# Mirofish Simulation Prompt — Stagecraft 24-Month Trajectory

**Purpose:** A simulation-requirements prompt formatted for mirofish (graph-based prediction engine), not a chat-style LLM prompt.

**How to use:**
1. Upload these three documents as the document corpus for mirofish to build its ontology from:
   - `POC_Spec_AI_Stage_Classifier.md`
   - `Competitive_Analysis_Day_AI.md`
   - `Competitive_Analysis_Coffee_AI.md`
2. Paste the simulation requirements below into mirofish's "simulation requirements" field
3. Let mirofish generate the ontology, build the GraphRAG, and run the simulation
4. Compare its output against the baseline assessment Claude already gave you (~10% probability of reaching $1M ARR in 24 months)

---

## Simulation Requirements

```
SIMULATION TITLE: 24-Month Trajectory of a Bootstrapped AI-Native CRM
Startup ("Stagecraft")

OBJECTIVE
Simulate the most probable outcomes for Stagecraft — a bootstrapped,
AI-native, standalone CRM startup targeting B2B sales teams of 5–50
reps — over the 24-month period following MVP launch. Predict the
likelihood of reaching $1M ARR, identify the most probable failure
modes, and surface the key decision points where outcomes diverge.

WORLD CONTEXT
Build the ontology from the uploaded documents:
- Product vision, POC scope, and differentiation strategy
  (POC_Spec_AI_Stage_Classifier.md)
- Direct competitor analysis: Day.ai ($24M Sequoia, ex-HubSpot CPO,
  meeting-recording-based) (Competitive_Analysis_Day_AI.md)
- Direct competitor analysis: Coffee AI (Salesforce Ventures backed,
  flexible deployment, SEO-dominant) (Competitive_Analysis_Coffee_AI.md)

KEY ENTITIES TO MODEL
- Stagecraft (the startup being simulated)
- Faisal (non-technical founder, enterprise sales leadership background,
  domain expertise in EdTech/biotech sales)
- Kurt (technical partner, technically literate but not a traditional
  engineer, plans to build POC using AI coding assistants)
- Day.ai (well-funded direct competitor, $24M, Sequoia-backed)
- Coffee AI (well-funded direct competitor, Salesforce Ventures backing)
- Adjacent competitors (Sybill, Read.ai, Attio, Salesforce Einstein,
  HubSpot Breeze)
- Target customer segment (B2B sales teams, 5–50 reps, vertical TBD)
- Founder's sales-leader network (proposed distribution channel,
  currently unvalidated)
- Capital sources (currently zero — bootstrap)

KEY VARIABLES TO TRACK
- Time-to-validated-wedge: months until 10+ customer conversations
  confirm or invalidate the rep-narrative-input thesis
- Time-to-MVP: months from project start to shippable POC
- Time-to-first-paying-customer: months from MVP to first revenue
- Founder commitment level: hours/week and full-time vs. part-time
- Partner commitment level: hours/week and skill acquisition rate
- Competitor velocity: ship rate of Day.ai and Coffee AI new features
- Distribution channel efficacy: conversion rate of Faisal's network
  contacts into pilot customers
- Capital availability: runway extension via angel/seed/F&F funding
- Vertical-focus decision: whether and when founder commits to a
  single vertical
- Partnership-terms resolution: whether and when equity, time, and
  decision-rights are documented in writing

OUTCOMES TO TRACK
- Probability of reaching $1M ARR within 24 months of MVP launch
- Probability of project stalling before MVP launch
- Probability of meaningful pivot away from current strategy
- Most likely failure mode and approximate month of occurrence
- Key inflection points where founder/partner decisions materially
  change the trajectory
- Conditions that, if met, would meaningfully raise success probability
  (with quantified impact on probability)

SIMULATION CONSTRAINTS
- Use base rates for bootstrapped SMB SaaS startups (~8–15% reach
  $1M ARR within 24 months even with capital) as the anchor for
  any probability claim.
- Account for asymmetric capital and engineering-velocity advantages
  of funded competitors.
- Account for the structural advantages the founder has (real domain
  expertise, real network, real differentiation thesis on input
  modality).
- Do not flatter the founders. Do not refuse to give numeric estimates.
- Identify both upside scenarios (preconditions met, network converts,
  vertical chosen wisely) and downside scenarios (most likely failure
  paths).

OUTPUT STRUCTURE
1. Headline probability of reaching $1M ARR within 24 months of MVP
   launch, expressed as a single calibrated percentage.
2. Three highest-likelihood future scenarios, each with a probability
   weight, a brief narrative, and the conditions that would lead to
   that scenario. Probabilities should sum to ~100%.
3. Top 5 failure-mode pathways ranked by likelihood, each with the
   approximate month the failure becomes irreversible.
4. Top 5 decision points where founder/partner choices most affect the
   outcome, with the choice that maximizes survival probability at
   each point.
5. Honest verdict: proceed under current plan, pivot meaningfully
   (specify how), or walk away — with reasoning grounded in the
   graph relationships.
```

---

## What to Compare Against

Claude's baseline assessment of this same scenario landed at approximately **10% probability of reaching $1M ARR within 24 months**, with distribution as the top risk, wedge validation as the second, and founder-partner velocity asymmetry as the third.

If mirofish's simulation lands meaningfully higher (e.g., 25%+) or lower (e.g., 3% or less), investigate why before trusting either number. Convergence between independent reasoning systems is the real signal; divergence is the question worth chasing.
