# Brain Map™ Architectural Laws

When working with `src/core/knowledge/` or any logic interacting with student state:

1. **Continuous Updating:** Every interaction must trigger a mastery update. No stale beliefs.
2. **Bayesian Core:** Never use point estimates for mastery. Always represent state as Beta(α, β) distributions.
3. **Uncertainty is Mandatory:** You must compute and pass along the confidence interval width (CI) on all estimates.
4. **Struggle Detection:** Focus heavily on expanding early sequence struggle detection (e.g. noticing declining mastery chains or widening uncertainty early).

## API / Brain Map Gotchas

- **Never update only the mean.** The core math of SANKALP is Beta(α, β). 
- If you update the mastery, you MUST update α (successes) and β (failures) respectively. 
- You MUST pass the generated Confidence Interval width downstream. Doing deterministic `if mastery > 0` logic without checking `ci_width` breaks the entire engine.
