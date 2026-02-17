# Causal Integrity Report: Cross-System Failure Analysis

## 1. Visual Data Flow (DAG)

The following Directed Acyclic Graph represents the causal chain from user input to UI rendering, annotated with observed silent failure points.

```mermaid
graph TD
    A[User Quiz Submission] -->|Raw Data| B(Feature Extraction)
    B -->|Features| C{ML Prediction Model}
    C -->|Prediction| D(ADK Decision Engine)
    D -->|Decision| E{LLM Content Generation}
    E -->|Explanation| F[UI Rendering]

    subgraph "Silent Failure Points"
    B -.->|Accepts Negative Time| B_Fail[Invalid Features]
    C -.->|Overconfidence (1.0)| C_Fail[False Mastery]
    C -.->|Process Error (0.0)| C_Err[Default Fallback]
    D -.->|Blind Trust| D_Fail[Inappropriate Strategy]
    end
```

## 2. Semantic Coherence Violation Matrix

This matrix highlights where the semantic meaning of the data diverges from the system's output.

| Stage | Input State | Output State | Semantic Violation | Severity |
| :--- | :--- | :--- | :--- | :--- |
| **ML Prediction** | Low Quiz Scores (Avg: 24%) | Mastery Probability: 1.0 (Mastered) | **Complete Inversion**: System claims failing student is a master. | **CRITICAL** |
| **Feature Extraction** | Time Spent: -10 seconds | Valid Feature Set | **Physical Impossibility**: Negative time accepted. | HIGH |
| **ADK Decision** | ML Error (Prob: 0.0) | Action: SCHEDULED_REVISION | **Masking**: System failure presented as "Routine Recommendation". | MEDIUM |
| **LLM Generation** | Action: PROGRESS_ALLOWED | Text: "Strong mastery - ready for advanced content" | **Hallucination Support**: LLM justifies the false mastery prediction. | HIGH |

## 3. Silent Failure Cascade Scenarios

### Scenario A: The "False Master" (Critical)
1.  **Trigger**: Student takes multiple quizzes, scoring poorly (20-30%).
2.  **Propagation**:
    *   **Feature Extraction**: Correctly calculates low average.
    *   **ML Prediction**: Incorrectly predicts `mastery_probability: 1.0` (likely due to overfitting or data drift).
    *   **ADK Decision**: Sees 1.0, applies `Rule 4 (High Mastery)`. Decides `PROGRESS_ALLOWED`.
    *   **LLM**: Generates "You have mastered this topic! Moving to advanced concepts."
3.  **Outcome**: Failing student is encouraged to skip fundamentals and attempt advanced work, leading to frustration and dropout. **No error is logged.**

### Scenario B: The "Hidden Outage"
1.  **Trigger**: ML Python bridge fails (e.g., missing dependency `joblib`).
2.  **Propagation**:
    *   **ML Bridge**: Catches error, returns default `mastery_probability: 0`.
    *   **ADK Decision**: Sees 0.0. Checks rules. `Rule 1` & `Rule 2` fail due to missing auxiliary signals (`days_until_forget`, `attention_risk`).
    *   **Default Fallback**: Applies `SCHEDULED_REVISION` (Routine).
3.  **Outcome**: User receives a generic "Review this topic" message regardless of actual needs. System appears functional but intelligence is dead.

## 4. Blast Radius Analysis

*   **ML Model Failure**: 100% of revision recommendations are currently untrustworthy due to the "False Master" prediction bug.
*   **Feature Validation**: The lack of bounds checking (e.g., negative time) allows corrupted data to poison the ML model, potentially causing the erratic predictions.
*   **ADK Logic**: The decision engine relies entirely on the ML probability being accurate. It lacks a "sanity check" (e.g., "If avg_score < 0.3, CANNOT be Mastered").

## 5. Recommendations

1.  **Circuit Breakers**:
    *   **Feature Layer**: Throw error if `time_spent < 0` or `score < 0`.
    *   **ADK Layer**: Implement a "Sanity Guard".
        ```typescript
        if (ml.mastery_probability > 0.8 && features.avg_quiz_score < 0.5) {
            return ForceRemedialAction();
        }
        ```
2.  **Model Retraining**: The current `mastery_model.pkl` is severely flawed (predicting 1.0 for low scores). It must be retrained with balanced, realistic data.
3.  **Error Transparency**: If ML fails, the UI should indicate "Personalization unavailable" rather than giving a generic (potentially wrong) recommendation.
