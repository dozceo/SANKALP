# Forgetting Curve Model Mathematical Correctness Audit

## Executive Summary
The Adaptive Decision Kit (ADK) in `src/ai/adk/decision-engine.ts` contains explicit logic to trigger "Urgent Revision" based on a `days_until_forget` metric. However, the Machine Learning inference layer (`src/ml/inference/predict_mastery.py`) completely **fails to calculate this metric**. As a result, the ADK defaults to a "perfect memory" assumption (999 days), rendering the forgetting curve-based intervention logic non-functional.

## Methodology
1.  **Code Analysis:** Traced the `days_until_forget` variable from its usage in `src/ai/adk/decision-engine.ts` to its definition in `src/ml/inference/types.ts` and its expected source in `src/ml/inference/predict_mastery.py`.
2.  **Reference Comparison:** Compared the implementation against standard Ebbinghaus Forgetting Curve models (Exponential Decay: $R = e^{-t/S}$).

## Findings

### 1. Missing Implementation
*   **Usage:** In `decision-engine.ts`:
    ```typescript
    // POLICY RULE 1: Critical Mastery + Imminent Forgetting
    if (mastery_probability < 0.4 && (mlSignals.days_until_forget ?? 999) < 3) { ... }
    ```
    This rule triggers only if `days_until_forget` is less than 3.
*   **Source:** The Python inference script `predict_mastery.py` returns a JSON object with `mastery_probability` and `confidence`. **It does not calculate or return `days_until_forget`.**
*   **Result:** The value defaults to `999` (via the nullish coalescing operator `?? 999`). Since 999 is never less than 3, **Policy Rule 1 never triggers** based on forgetting risk.

### 2. Mathematical Correctness
Since there is no implementation, the mathematical correctness is technically "N/A" (or incorrect by omission). The system effectively models memory as infinite.

### 3. Intended Logic (Recommendation)
A correct implementation should use the Half-Life regression or a simple exponential decay model based on `days_since_last_revision` and `quiz_score_variance`:
$$ P(recall) = 2^{-\frac{\Delta t}{h}} $$
Where $h$ (half-life) is estimated from previous retrieval success.

## Recommendations

### Short Term (Fix functionality)
1.  **Implement Fallback:** In `predict_mastery.py`, add a simple heuristic if a full model isn't ready:
    ```python
    # Simple Ebbinghaus approximation
    # If mastery is low (<0.5), forget in 2 days. If high (>0.8), forget in 7 days.
    days_until_forget = 2 if mastery_probability < 0.5 else 7
    ```
2.  **Update Bridge:** Ensure `ml-bridge.ts` passes this value.

### Long Term (Scientific Validity)
1.  **Train Retention Model:** Collect data on (Review Interval, Recall Success) pairs and train a regression model to predict the "forgetting horizon" (time until probability of recall < 0.5).
2.  **Use Spaced Repetition Algorithms:** Integrate a standard algorithm like SM-2 or FSRS (Free Spaced Repetition Scheduler) logic into the Python layer.
