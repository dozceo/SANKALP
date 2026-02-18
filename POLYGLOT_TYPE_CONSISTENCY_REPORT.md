# Polyglot Type Consistency Report

## 1. Visual Schema Map

This map visualizes the flow of data structures across the system boundaries.

```mermaid
graph TD
    subgraph "Python (ML Training & Inference)"
        TRAIN_DATA[Training Data (CSV)]
        TRAIN_DATA -->|trains| MODEL[LogisticRegression Model]
        MODEL -->|predicts| P_OUTPUT[Prediction Output]

        classDef python fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
        class TRAIN_DATA,MODEL,P_OUTPUT python;
    end

    subgraph "TypeScript (App Logic & Feature Extraction)"
        DB_QUIZ[Firestore QuizResult] -->|mapped to| RAW_QUIZ[RawQuizResult]
        RAW_QUIZ -->|extracted to| FEAT[MasteryFeatures]
        FEAT -->|sent to| ML_BRIDGE[ML Bridge]
        ML_BRIDGE -->|receives| P_RESULT[MasteryPredictionOutput]
        P_RESULT -->|mapped to| ADK_SIG[MLSignals]
        ADK_SIG -->|used by| ADK_DECISION[ADK Decision Engine]

        classDef ts fill:#f3e5f5,stroke:#4a148c,stroke-width:2px;
        class DB_QUIZ,RAW_QUIZ,FEAT,ML_BRIDGE,P_RESULT,ADK_SIG,ADK_DECISION ts;
    end

    subgraph "LLM (Genkit Flows)"
        ADK_DECISION -->|context for| PLAN_FLOW[Smart Revision Planner]
        PLAN_FLOW -->|input| ZOD_INPUT[Zod: SmartRevisionPlannerInput]
        ZOD_INPUT -->|output| ZOD_OUTPUT[Zod: SmartRevisionPlannerOutput]

        classDef llm fill:#fff3e0,stroke:#e65100,stroke-width:2px;
        class PLAN_FLOW,ZOD_INPUT,ZOD_OUTPUT llm;
    end

    ML_BRIDGE -- JSON over Stdin/Stdout --> MODEL
    TRAIN_DATA -.->|Conceptually Aligned| FEAT
```

## 2. Cross-Language Type Diff Matrix

| Entity | Field | Python Type | TypeScript Type | Firestore Type | Zod Schema | Mismatch / Risk |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Topic Mastery** | `avg_quiz_score` | `float` (0.0-1.0) | `number` | - | - | ✅ Consistent |
| | `attempts_per_topic` | `int` (1-10) | `number` | - | - | ⚠️ Range mismatch: TS can be >10 or 0 |
| | `days_since_last_revision` | `int` (0-30) | `number` | - | - | 🚨 **CRITICAL**: TS defaults to 999 for new topics. Model trained on max 30. |
| | `quiz_score_variance` | `float` | `number` | - | - | ✅ Consistent |
| | `time_spent_per_question` | `float` | `number` | - | - | ✅ Consistent |
| **Prediction** | `mastery_probability` | `float` | `number` | `number` | `number` | ✅ Consistent |
| | `confidence` | `float` | `number` | `number` | - | ✅ Consistent |
| | `predicted_class` | `str` | `string` | - | - | ✅ Consistent |
| **Quiz Result** | `timestamp` | - | `Date` | `Timestamp` | - | ✅ Handled via `.toDate()` |
| | `score` | - | `number` | `number` | - | ✅ Consistent |
| **Smart Planner** | `brainMap` | - | `any` (parsed) | - | `string` (JSON) | ⚠️ **Unsafe**: `JSON.parse` at runtime. No schema validation for internal structure. |
| | `studentId` | - | `string` | `string` | `string` | ✅ Consistent |

## 3. Serialization Boundary Failure Catalog

### Python <-> TypeScript (ML Bridge)
*   **Failure Mode:** `JSON.parse` error in `ml-bridge.ts`.
    *   **Cause:** Python script prints non-JSON output (e.g., warnings/errors) to stdout.
    *   **Mitigation:** `ml-bridge.ts` checks for valid JSON but could fail if mixed output occurs.
*   **Failure Mode:** Feature value overflow.
    *   **Cause:** TS sends `days_since_last_revision: 999`.
    *   **Impact:** Python model (Logistic Regression) applies massive negative weight (e.g., -200 score), resulting in probability ~0.0. While "safe" (low mastery), it distorts calibration.
*   **Failure Mode:** Missing `_id`.
    *   **Cause:** `predict_mastery.py` logic `if request_id:` is robust, but if TS fails to send it, response correlation breaks.

### TypeScript <-> LLM (Genkit)
*   **Failure Mode:** Invalid Brain Map JSON.
    *   **Cause:** Client sends malformed JSON string for `brainMap`.
    *   **Impact:** `JSON.parse` throws in `smartRevisionPlannerFlow`. `try-catch` exists but falls back to empty object, potentially leading to "No revision needed" when one is critical.
*   **Failure Mode:** Prompt Injection in `topic`.
    *   **Cause:** `topic` string passed directly to prompt.
    *   **Impact:** LLM ignores instructions.

## 4. Case Conversion Bug Inventory

| Concept | Python (snake_case) | TypeScript (camelCase) | Firestore (camelCase) | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Feature: Avg Score** | `avg_quiz_score` | `avg_quiz_score` | - | ✅ **Intentional Deviation**: TS uses snake_case to match Python model. |
| **Feature: Attempts** | `attempts_per_topic` | `attempts_per_topic` | - | ✅ **Intentional Deviation** |
| **Feature: Days Since** | `days_since_last_revision` | `days_since_last_revision` | `daysSinceRevision` (in `MLPrediction`) | ⚠️ **Inconsistent**: Stored as camelCase, used as snake_case. |
| **ID Field** | `_id` (internal) | `id` / `_id` | `id` | ✅ Handled by bridge. |
| **Student ID** | `student_id` (implied) | `studentId` | `studentId` | ✅ Consistent |

## 5. Nullability Mismatch Heatmap

*   **High Risk:** `days_since_last_revision`
    *   **Python Training:** Never null, always 0-30.
    *   **TS Feature Extraction:** Defaults to 999 if no history.
    *   **Impact:** Out-of-distribution input.

*   **Medium Risk:** `brainMap` (Input to Planner)
    *   **Zod:** Required string.
    *   **Runtime:** Parsed object can be anything. `topics` array accessed via `brainMapData.topics || []`.
    *   **Impact:** Silent failure (empty topics) if schema doesn't match expectations.

*   **Low Risk:** `masteryScore` (Output of Planner)
    *   **Zod:** Optional (`number | undefined`).
    *   **TS:** `number` in logic.
    *   **Impact:** UI must handle `undefined`.

## 6. Schema Evolution Impact Simulation

**Scenario:** Adding `reading_level` feature to ML model.

1.  **Python Training:**
    *   Add `reading_level` column to `generate_data.py`.
    *   Retrain model. `mastery_model.pkl` now expects 6 features.
2.  **Impact on TypeScript:**
    *   `ml-bridge.ts` sends 5 features.
    *   **Result:** Python script crashes (`ValueError: X has 5 features, but LogisticRegression is expecting 6`).
    *   **System Failure:** All mastery predictions fail. Fallback (if any) or error state triggered.
3.  **Required Changes:**
    *   Update `MasteryFeatures` interface in `student_features.ts`.
    *   Update `extractMasteryFeatures` logic to calculate `reading_level`.
    *   Update `predictMastery` payload.
4.  **Detection:**
    *   No compile-time error! `MasteryFeatures` is an interface, but the bridge sends JSON.
    *   Runtime error only.

## 7. Recommended Schema-First Architecture Migration Path

To prevent these issues, we recommend a **Schema-First** approach using a shared definition language (e.g., JSON Schema or Protocol Buffers) or a single source of truth generator.

### Phase 1: Shared Type Definitions (Low Effort)
1.  Create `src/schemas/ml_features.json` (JSON Schema).
2.  **Python:** Use `pydantic` to generate model class from JSON Schema.
3.  **TypeScript:** Use `json-schema-to-typescript` to generate `MasteryFeatures` interface.
4.  **Validation:** Add runtime validation in `ml-bridge.ts` against the schema before sending.

### Phase 2: Zod-Python Unification (Medium Effort)
1.  Define the schema in Python using `pydantic`.
2.  Use a tool to generate TypeScript interfaces/Zod schemas from Pydantic models.
3.  Ensure `generate_data.py` uses the Pydantic model to validate synthetic data.

### Phase 3: Contract Testing (High Effort)
1.  Implement a "Contract Test" in CI.
2.  Python script exports its expected schema (JSON).
3.  TypeScript test reads this schema and validates its own `MasteryFeatures` interface against it.
4.  Fails build if they diverge.

### Immediate Fixes
1.  **Cap `days_since_last_revision`:** In `extractMasteryFeatures`, cap the value at 30 (or whatever the max reasonable value is) to match training data distribution.
    ```typescript
    const days_since_last_revision = Math.min(
        Math.floor((referenceDate.getTime() - latestTimestamp) / (1000 * 60 * 60 * 24)),
        30
    );
    ```
2.  **Validate `brainMap`:** Define a Zod schema for the internal structure of the Brain Map JSON and parse it safely in `smartRevisionPlannerFlow`.
