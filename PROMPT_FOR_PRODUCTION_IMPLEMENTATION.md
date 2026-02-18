# Prompt for Production Implementation: Polyglot Schema-First Architecture

**Role:** Senior Software Architect / Polyglot Engineer
**Task:** Implement a Schema-First Architecture to unify Python (ML), TypeScript (App), and Firestore data models, resolving the critical type safety issues identified in `POLYGLOT_TYPE_CONSISTENCY_REPORT.md`.

## Context
The current system has silent data corruption risks due to implicit schemas between:
1.  Python ML Model (Logistic Regression) expecting specific feature distributions.
2.  TypeScript Feature Extraction logic (`student_features.ts`) sending unvalidated JSON.
3.  Genkit LLM Flows consuming weak types (stringified JSON).

A report (`POLYGLOT_TYPE_CONSISTENCY_REPORT.md`) has identified critical mismatches, including an out-of-distribution bug where `days_since_last_revision` defaults to 999 (vs max 30 in training), effectively killing the model's accuracy.

## Objectives

### 1. Establish a Single Source of Truth
*   **Action:** Create a central schema definition for `MasteryFeatures` using **JSON Schema** (or Pydantic if preferred as the source).
*   **Location:** `src/schemas/mastery-features.schema.json`.
*   **Constraints:**
    *   `avg_quiz_score`: number (0.0 - 1.0)
    *   `attempts_per_topic`: integer (min 0)
    *   `days_since_last_revision`: integer (min 0, max 30) - **Crucial Fix**: Enforce the upper bound to match training data.
    *   `quiz_score_variance`: number (min 0)
    *   `time_spent_per_question`: number (min 0)

### 2. Implement Python Validation Layer
*   **Action:** Update `src/ml/inference/predict_mastery.py` to use `pydantic`.
*   **Implementation:**
    *   Create a `MasteryInputModel` Pydantic class.
    *   Validate incoming JSON from stdin against this model *before* passing to the Logistic Regression model.
    *   Return a clear error structure if validation fails.

### 3. Harden TypeScript ML Bridge
*   **Action:** Update `src/ml/inference/ml-bridge.ts`.
*   **Implementation:**
    *   Add runtime validation using a library like `zod` (derived from the schema) or manual checks before sending data to the Python subprocess.
    *   **Fix the Bug:** In `extractMasteryFeatures` (`src/ml/features/student_features.ts`), clamp `days_since_last_revision` to 30.
    *   Ensure the bridge handles Python validation errors gracefully.

### 4. Secure LLM Input Parsing
*   **Action:** Update `src/ai/flows/smart-revision-planner.ts`.
*   **Implementation:**
    *   Replace `JSON.parse(input.brainMap)` with a safe Zod parsing step.
    *   Define a `BrainMapSchema` that validates the internal structure of the JSON string (e.g., ensuring `topics` array exists).
    *   Fail gracefully or provide a fallback if the input JSON is malformed, rather than crashing or proceeding with empty data.

## Definition of Done
1.  `src/schemas/mastery-features.schema.json` exists.
2.  Python inference script rejects invalid inputs with clear error messages.
3.  TypeScript feature extractor clamps values to valid ranges (0-30 for days).
4.  `ml-bridge.ts` never sends out-of-spec data to Python.
5.  `smart-revision-planner.ts` safely validates `brainMap` structure.
6.  Unit tests added for the boundary validation logic.
