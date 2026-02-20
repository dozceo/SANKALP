# Polyglot Type Consistency Report

**Generated:** 2026-02-20T06:12:39.512Z

## 1. Visual Schema Map

```mermaid
erDiagram
    ML_Training_Data {
        csv_col avg_quiz_score
        csv_col attempts_per_topic
        csv_col days_since_last_revision
        csv_col quiz_score_variance
        csv_col time_spent_per_question
    }
    Python_Inference_Input {
        any avg_quiz_score
        any attempts_per_topic
        any days_since_last_revision
        any quiz_score_variance
        any time_spent_per_question
    }
    Python_Inference_Output {
        any mastery_probability
        any confidence
        any predicted_class
    }
    TS_MasteryPredictionInput {
        number avg_quiz_score
        number attempts_per_topic
        number days_since_last_revision
        number quiz_score_variance
        number time_spent_per_question
    }
    TS_MasteryPredictionOutput {
        number mastery_probability
        number confidence
        mastered_not_ma predicted_class
        string error
    }
    Firestore_MLPrediction {
        string id
        string studentId
        string topic
        number masteryProbability
        number confidence
        number daysSinceRevision
        Date createdAt
        Date expiresAt
    }
    Frontend_MasterySignal {
        number score
        number confidence
        number daysSinceRevision
        number attempts
        IMPROVING_STABL trend
        boolean needsRevision
        HIGH_MEDIUM_LOW priority
    }
    Zod_AdaptiveQuizOutput {
        array( quiz
        string().descri question
        array(z.string( options
        string().descri correctAnswer
    }
    Firestore_QuizGeneration {
        string id
        string studentId
        string topic
        string difficulty
        string educationLevel
        number numQuestions
        any[] questions
        Date generatedAt
    }
    ML_Training_Data ||--|| Python_Inference_Input : "trains"
    Python_Inference_Input ||--|| TS_MasteryPredictionInput : "serialized as"
    TS_MasteryPredictionOutput ||--|| Firestore_MLPrediction : "caches to"
    Firestore_MLPrediction ||--|| Frontend_MasterySignal : "consumes"
    Zod_AdaptiveQuizOutput ||--|| Firestore_QuizGeneration : "stores as"
```

## 2. Cross-Language Diff Matrix

### ML_Training_Data ↔ Python_Inference_Input

⚠️ **Type/Nullability Mismatches**:
- `avg_quiz_score`: ⚠️ Type safety loss (mapped to `any` or `any[]`)
- `attempts_per_topic`: ⚠️ Type safety loss (mapped to `any` or `any[]`)
- `days_since_last_revision`: ⚠️ Type safety loss (mapped to `any` or `any[]`)
- `quiz_score_variance`: ⚠️ Type safety loss (mapped to `any` or `any[]`)
- `time_spent_per_question`: ⚠️ Type safety loss (mapped to `any` or `any[]`)

### Python_Inference_Input ↔ TS_MasteryPredictionInput

⚠️ **Type/Nullability Mismatches**:
- `avg_quiz_score`: ⚠️ Type safety loss (mapped to `any` or `any[]`)
- `attempts_per_topic`: ⚠️ Type safety loss (mapped to `any` or `any[]`)
- `days_since_last_revision`: ⚠️ Type safety loss (mapped to `any` or `any[]`)
- `quiz_score_variance`: ⚠️ Type safety loss (mapped to `any` or `any[]`)
- `time_spent_per_question`: ⚠️ Type safety loss (mapped to `any` or `any[]`)

### Python_Inference_Output ↔ TS_MasteryPredictionOutput

⚠️ **Extra in Target**:
  - `error`
⚠️ **Type/Nullability Mismatches**:
- `mastery_probability`: ⚠️ Type safety loss (mapped to `any` or `any[]`)
- `confidence`: ⚠️ Type safety loss (mapped to `any` or `any[]`)
- `predicted_class`: ⚠️ Type safety loss (mapped to `any` or `any[]`)

### TS_MasteryPredictionOutput ↔ Firestore_MLPrediction

❌ **Missing in Target**:
  - `mastery_probability`
  - `predicted_class`
  - `error`
⚠️ **Extra in Target**:
  - `id`
  - `studentId`
  - `topic`
  - `masteryProbability`
  - `daysSinceRevision`
  - `createdAt`
  - `expiresAt`

### Firestore_MLPrediction ↔ Frontend_MasterySignal

❌ **Missing in Target**:
  - `id`
  - `studentId`
  - `topic`
  - `masteryProbability`
  - `createdAt`
  - `expiresAt`
⚠️ **Extra in Target**:
  - `score`
  - `attempts`
  - `trend`
  - `needsRevision`
  - `priority`

### Zod_AdaptiveQuizOutput ↔ Firestore_QuizGeneration

❌ **Missing in Target**:
  - `quiz`
  - `question`
  - `options`
  - `correctAnswer`
⚠️ **Extra in Target**:
  - `id`
  - `studentId`
  - `topic`
  - `difficulty`
  - `educationLevel`
  - `numQuestions`
  - `questions`
  - `generatedAt`

## 3. Serialization Boundary Failure Catalog

### A. Case Conversion Risks
The following fields require manual mapping (snake_case ↔ camelCase). Any missing map in `ml-bridge.ts` or `smart-revision-planner.ts` causes data loss.

**Snake Case (ML Layer)**:
- `avg_quiz_score`
- `attempts_per_topic`
- `days_since_last_revision`
- `quiz_score_variance`
- `time_spent_per_question`

**Camel Case (App Layer)**:
- `studentId`
- `masteryProbability`
- `daysSinceRevision`
- `createdAt`
- `expiresAt`

### B. Known Hardcoded Mappings
We detected manual mappings in the codebase that are points of failure:
- `src/ai/flows/smart-revision-planner.ts`: Maps `mastery_probability` → `masteryProbability` manually.
- `src/ml/features/student_features.ts`: Manually constructs snake_case object.

## 4. Schema Evolution Impact Simulation

**Scenario: Adding a new feature 'avg_time_per_session' to the ML Model**

If you add `avg_time_per_session` to `training_data.csv` and re-train:
1. **Python Script**: Will fail if `predict_mastery.py` is not updated to extract this feature.
2. **TypeScript Types**: `MasteryPredictionInput` will be missing the field.
3. **Feature Extractor**: `extractMasteryFeatures` will not return it, causing Python key error.
4. **Runtime**: Silent failure or 500 Error in `ml-bridge` depending on error handling.

**Recommendation**: Use a shared schema definition (Protobuf or JSON Schema) to generate types for both Python and TypeScript automatically.

## 5. Recommended Migration Path

1. **Define Source of Truth**: Create `schemas/prediction.json` (JSON Schema).
2. **Codegen**:
   - Use `datamodel-code-generator` for Python Pydantic models.
   - Use `json-schema-to-typescript` for TS Interfaces.
3. **Validate**: Add a pre-commit hook that validates `training_data.csv` headers against the schema.
