# ADK & ML Production Code Generation Prompt

Use this prompt to generate the production implementation for the Sankalp ADK Decision Engine and ML Inference layer, based on the regression test suite.

---

## **Role**
You are a Senior Software Engineer specializing in EdTech, AI orchestration, and Machine Learning. Your task is to implement the core logic for the **Sankalp** platform's **ADK (Agent Decision Kit)** and **Topic Mastery ML Model**.

## **Context**
The project is a Next.js application with a Python-based ML backend. We have a comprehensive regression test suite (`src/ai/adk/decision-engine.test.ts`, `src/ml/tests/test_inference.py`, `src/ai/flows/schema.test.ts`) that defines the expected behavior.

## **Task**
Implement the following three files to satisfy the test requirements:

1.  **`src/ai/adk/decision-engine.ts`** (TypeScript)
    *   **Purpose:** Determine revision urgency and content strategy based on student mastery and exam proximity.
    *   **Logic Rules:**
        *   **Exam Cramming:** If `daysUntilExam <= 3` AND `mastery < 0.6` -> `URGENT_REVISION` (High Priority).
        *   **Forgetting Risk:** If `mastery < 0.4` AND `days_until_forget < 3` -> `URGENT_REVISION` (High Priority).
        *   **Attention Risk:** If `mastery < 0.4` AND `attention_risk == "HIGH"` -> `ADAPTIVE_TEACHING` (Interactive).
        *   **Stale Knowledge:** If `mastery 0.4-0.6` AND `days_since_last_revision > 7` -> `SCHEDULED_REVISION` (Medium Priority).
        *   **Mastery Achieved:** If `mastery >= 0.7` AND `days_since_last_revision <= 14` -> `PROGRESS_ALLOWED` (Low Priority).
    *   **Intervention Logic:**
        *   **Critical:** Low mastery (< 0.3) + High Attention Risk + Inactivity (> 10 days).
    *   **Exports:** `makeRevisionDecision`, `makeInterventionDecision`.

2.  **`src/ml/inference/predict_mastery.py`** (Python)
    *   **Purpose:** Predict topic mastery probability (0-1) from student features.
    *   **Input:** JSON via `stdin` (e.g., `{"avg_quiz_score": 0.8, ...}`).
    *   **Output:** JSON via `stdout` (e.g., `{"mastery_probability": 0.75, "confidence": 0.9, ...}`).
    *   **Model:** Load a `scikit-learn` Logistic Regression model from `../models/mastery_model.pkl`.
    *   **Requirements:** Handle zero-values, negative inputs (robustness), and outliers gracefully.

3.  **`src/ai/flows/smart-revision-planner.ts`** (TypeScript/Genkit)
    *   **Purpose:** A Genkit flow that takes a student ID, fetches history, runs the ML prediction, calls the ADK engine, and returns a prioritized revision plan.
    *   **Schema:** Must match `SmartRevisionPlannerOutputSchema` (Zod).

## **Constraints**
*   **TypeScript:** Use strict typing. No `any` where possible.
*   **Python:** Use `joblib` for model loading. Ensure JSON I/O is robust (flush stdout).
*   **Validation:** Use `zod` for all data crossing the API/LLM boundary.
*   **Testing:** The code MUST pass the provided regression tests.

## **Reference: Test Cases**

### ADK Logic (`decision-engine.test.ts`)
```typescript
test('Rule 0: Exam Cramming Mode', () => { ... mastery < 0.6, daysUntilExam <= 3 ... });
test('Rule 1: Critical Mastery + Imminent Forgetting', () => { ... mastery < 0.4 ... });
```

### ML Inference (`test_inference.py`)
```python
def test_valid_input(self): ...
def test_boundary_zero(self): ...
def test_negative_values(self): ...
```

---

**Output:** Provide the full source code for the three files.
