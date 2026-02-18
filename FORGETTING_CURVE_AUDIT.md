
# Forgetting Curve Model Audit

## Summary
The audit identifies a fundamental mismatch between the Adaptive Decision Kit (ADK) requirements and the underlying Spaced Repetition System (SRS) implementation. The ADK expects a continuous predictive model (`days_until_forget`), while the database layer implements a discrete fixed-interval schedule (Leitner system). Consequently, the "Critical Mastery + Imminent Forgetting" rule in the ADK is effectively dead code.

## Findings

### 1. Implementation Mismatch
- **ADK Requirement**: Expects `mlSignals.days_until_forget` (a predictive float value representing days until retention drops below threshold).
- **Actual Implementation**: `src/lib/db-helpers-extended.ts` uses a hardcoded array: `[1, 3, 7, 14, 30, 60]`.
- **Result**: The ADK rule `if (mastery < 0.4 && days_until_forget < 3)` never triggers correctly because `days_until_forget` is undefined (defaulting to 999).

### 2. Mathematical Validity
- **Leitner System**: The interval array `[1, 3, 7, 14, 30, 60]` is a valid, standard approximation of spaced repetition for flashcards. It is "mathematically correct" as a heuristic but **not** an exponential decay model.
- **Ebbinghaus Alignment**: The exponential decay curve $R = e^{-t/S}$ suggests intervals should expand based on retrieval strength ($S$). The fixed intervals approximate this but do not adapt to the student's *actual* performance (only review count).

### 3. Missing Feature
- **Predictive Model**: There is no code in `src/ml` or `src/ai` that calculates `days_until_forget` based on `last_review_date` and `retention_strength`.

## Recommendations
1.  **Implement Half-Life Regression (HLR)**: Create a Python model in `src/ml` to estimate the half-life of memory for a topic and predict `days_until_forget`.
2.  **Bridge the Gap**: Update `ml-bridge.ts` to call this new model and populate `mlSignals.days_until_forget`.
3.  **Fallback Logic**: If a predictive model is too complex, update the ADK to use `days_since_last_revision` and `current_interval` to estimate urgency, rather than a non-existent `days_until_forget`.
