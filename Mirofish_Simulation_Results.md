# Mirofish Simulation Results — Stagecraft 24-Month Forecast

**Project:** Stagecraft (working name)
**Source:** MiroFish multi-agent simulation engine (graph-based, GraphRAG via Zep, LLM via DeepSeek)
**Inputs:** POC spec + both competitive analyses + simulation requirements prompt
**Date:** 2026-05-26

---

## Headline Finding

**~6% probability of reaching $1M ARR within 24 months of MVP launch.**

Below the typical 8–15% base rate for bootstrapped SMB SaaS, driven by asymmetric competition (Day.ai $24M Sequoia, Coffee AI Salesforce Ventures) and unresolved structural risks. If all five critical decisions are executed optimally, probability rises to ~15–20%.

---

## Scenario Distribution

| Scenario | Probability | Summary |
|---|---|---|
| Silent Extinction | 55% | Project stalls 6–12 months after MVP; no PMF, no revenue; partnership crumbles |
| Meaningful Transformation | 30% | Wedge validates but initial positioning fails; team forced to pivot (vertical, integration model); survival yes, $1M ARR no |
| Achieving $1M ARR | 6% | All preconditions met; near-perfect execution + luck |
| MVP fails before launch | 9% | Founders abandon during POC phase; AI tooling insufficient, stage criteria too hard to define |

---

## Five Failure Modes (with month-of-no-return)

1. **Slow Suffocation from insufficient founder commitment** — irreversible by Month 6
2. **Partnership breakdown** (terms never documented) — irreversible by Month 4
3. **Competitor feature release closes market window** (Day.ai/Coffee AI copy the wedge) — irreversible by Month 9
4. **Distribution channel falsification** (Faisal's network politely passes) — irreversible by Month 8
5. **Capital depletion / funding failure** — irreversible by Month 12

The five modes form a network, not a sequence. Failure in one accelerates the others.

---

## Five Decision Points (in chronological order)

1. **Month 0 — Sign formal partnership agreement.** Equity, decision rights, arbitration mechanism. Recommendation: Faisal owns product/distribution, Kurt owns technical execution.
2. **Month 1 — Lock single-vertical focus.** Recommendation: Biotech BD (regulated industry where Day.ai's recording dependence is structurally disabled).
3. **Month 2 — Full-time commitment.** Don't wait for "perfect timing" — the wait itself is the biggest risk. (Quoted Day.ai's Christopher O'Donnell as the contrast model.)
4. **Month 3 — Lock distribution strategy with measurable validation deadline.** "Vertical community + personal network" with hard checkpoint at Month 5 (POC shown to 10 sales leaders, conversion rate measured).
5. **Month 5 — Lock POC scope and write the "Why us, not Day.ai?" sentence.** Strict scope discipline + sharp positioning around manager visibility (Day.ai's blind spot).

---

## Convergence with Claude's Baseline Assessment

Two independent reasoning systems analyzed the same source documents:

| Dimension | Claude baseline | Mirofish simulation |
|---|---|---|
| Probability of $1M ARR in 24 months | ~10% | ~6% |
| Top failure: distribution | ✓ (risk #1) | ✓ (failure mode #4) |
| Top failure: partnership terms | ✓ (condition #2) | ✓ (decision point #1) |
| Top failure: wedge unvalidated / MVP risk | ✓ (risk #2) | ✓ (scenario "MVP fails," 9%) |
| Critical: vertical focus decision | ✓ (condition #1) | ✓ (decision point #2) |
| Critical: capital / funding gap | ✓ (condition #3) | ✓ (failure mode #5) |
| Critical: competitor velocity | ✓ (risk #3) | ✓ (failure mode #3) |

**Signal:** Two methodologically different systems (chat Q&A vs. graph-based simulation), looking at the same documents, converged on (a) single-digit-to-low-double-digit probability of major success, (b) the same top failure modes, and (c) the same critical early decisions. That's strong corroboration that the assessment is real, not idiosyncratic.

**Where Mirofish added value beyond Claude's baseline:**

- Month-level timing of irreversibility for each failure mode (more granular than Claude went)
- The "Silent Extinction" framing at 55% probability — a sharper articulation of the "POC works but won't convert" failure mode
- Explicit ceiling: optimal execution raises probability to ~15–20%, not higher
- Chronological decision chain (not just a list of conditions — actual sequencing)
- The "Meaningful Transformation" scenario (30%) — the possibility that the project survives only through significant pivot. Claude under-weighted this.

**Where Claude went beyond Mirofish:**

- Concrete numeric thresholds (3 named pilots in 90 days, $100K–$250K raise)
- Explicit recommendation framing for Kurt's go/pivot/walk-away decision
- Identified that two non-technical co-founders building AI SaaS is a structural problem mirofish softened

---

## What to Do With This

1. **Walk Faisal through this document and Claude's baseline together.** Two independent analyses converging is the headline. The numbers are not encouraging, but they are honest.

2. **Use the five decision points as the partner-conversation agenda.** Each decision has a survival-maximizing answer; commit in writing to the choice at each one before any building happens.

3. **Don't try to argue with the probability.** Try to change it. The doc explicitly says optimal execution moves the number from 6% to 15–20% — that's the only lever available, and it requires acting on all five decisions, not just the easy ones.

4. **Re-run mirofish quarterly.** Once a decision is locked or a milestone is hit (vertical chosen, partnership signed, first paying customer, etc.), update the input docs and re-simulate. The probability should move. If it doesn't move, something is wrong with the execution.

5. **The 6% number is not a verdict.** It's a starting point. The simulation explicitly shows that the difference between 6% and 20% is execution discipline on five specific decisions. Whether to commit time depends entirely on whether Faisal and Kurt can credibly commit to those five decisions — and the only honest way to know that is to ask them, in writing, before starting.
