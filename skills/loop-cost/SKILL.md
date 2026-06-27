---
name: loop-cost
description: Use before running a verification loop to estimate its token/iteration budget and decide whether it is worth running unattended. Produces a rough token-spend range, a suggested iteration cap, and a recommendation. Trigger on "how much will this loop cost", "estimate the loop", "budget for verify-loop", "/loop-cost", or before kicking off an expensive maker/checker loop.
---

# loop-cost

Estimate what a verify-loop will cost before running it, so the loop has a number to say
"no" against. This is a heuristic, not a meter — it sets a budget ceiling, it does not
measure actual spend.

## Inputs

- **Task size:** small (one function / one file), medium (a feature across a few files),
  large (cross-cutting change, many files).
- **Iteration cap:** expected max turns (default 3).
- **Verify command cost:** cheap (fast unit tests / lint) vs heavy (full build, slow or
  integration test suite). Heavy commands inflate the checker turn.

## Model

Per iteration there are two sub-agent turns — a maker and a checker:

| Task size | Maker / turn | Checker / turn (cheap cmds) | Checker / turn (heavy cmds) |
|-----------|--------------|------------------------------|------------------------------|
| small     | ~8–20k       | ~6–15k                       | ~15–35k                      |
| medium    | ~20–50k      | ~15–35k                      | ~35–80k                      |
| large     | ~50–120k     | ~35–80k                      | ~80–200k                     |

`estimate ≈ iterations × (maker_per_turn + checker_per_turn)`, plus ~5–10k orchestrator
overhead per turn. Report a **range** (best case = passes in 1 iteration; worst case =
hits the cap), not a single number.

## Output

```
task_size: small | medium | large
verify_cost: cheap | heavy
iteration_cap: <n>
estimate:
  best_case:  <pass on turn 1>  ~<tokens>
  worst_case: <hits cap>        ~<tokens>
recommendation: <run as-is | lower the cap | split the task | run report-only via grade first>
```

## Guidance

- Worst case more than ~300k tokens → recommend splitting the task or lowering the cap;
  a loop that large is usually doing too much per turn.
- Heavy verify commands dominate the checker cost — suggest a fast subset for inner
  iterations and the full suite only on the final confirming turn.
- For a one-off check where you are unsure it is worth a full loop, recommend running
  `grade` once (report-only) before committing to the maker/checker cycle.
