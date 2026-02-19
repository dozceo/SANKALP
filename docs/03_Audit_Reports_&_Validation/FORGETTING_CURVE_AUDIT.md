# Forgetting Curve Model Mathematical Correctness Audit

## Executive Summary
The ADK decision engine relies on a `days_until_forget` metric to schedule revisions based on the forgetting curve.
This audit verified whether the ML inference layer correctly calculates and returns this metric.

## Methodology
1.  **Input Simulation**: Provided student feature data to `src/ml/inference/predict_mastery.py`.
    *   Attempts: 5
    *   Avg Score: 0.8
    *   Time Since Last Revision: 2 days
2.  **Reference Model**: Ebbinghaus Forgetting Curve ($R = e^{-t/S}$).
    *   Expected Behavior: As memory strength (S) increases with repetitions/score, `days_until_forget` (t where R < threshold) should increase.
3.  **Comparison**: Checked if the ML output contains `days_until_forget` and if it aligns with the reference model.

## Findings

### ML Output Analysis
```json
{
  "mastery_probability": 0.963,
  "confidence": 0.963,
  "predicted_class": "mastered"
}
```

**CRITICAL FINDING: Missing Metric**
The ML inference script **does not return** `days_until_forget`.
The ADK logic in `src/ai/adk/decision-engine.ts` attempts to use this value:
```typescript
if (mastery_probability < 0.4 && (mlSignals.days_until_forget ?? 999) < 3)
```
Because the value is missing, it defaults to `999` (perfect memory), effectively **disabling** the forgetting-curve-based intervention logic.

### Deviation from Reference Model
- **Theoretical Prediction**: For a student with 5 attempts and 80% score, memory stability (S) should be high, and `days_until_forget` should be calculable (e.g., > 7 days).
- **Actual Implementation**: No calculation exists. Deviation is **Total (Feature Missing)**.

## Recommendations
1.  **Implement Calculation**: Add logic to `src/ml/inference/predict_mastery.py` (or a new script) to calculate `days_until_forget`.
    *   *Proposed Formula*: $S = \text{attempts} \times \text{score} \times 2$ (simplified Leitner)
    *   $\text{days_until_forget} = S \times \ln(2)$
2.  **Update ADK Logic**: Ensure the default fallback in ADK is safe (e.g., fallback to a standard decay curve based on time only) rather than `999`.
