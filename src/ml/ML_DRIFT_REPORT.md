# ML Feature Drift Report

**Date:** 2024-05-23
**Scope:** `src/ml/features/student_features.ts` (TS Feature Extraction) vs `src/ml/training/generate_data.py` (Python Training Data Generation)

## Executive Summary
This report identifies significant discrepancies (drift) between the feature extraction logic used in the production inference pipeline (TypeScript) and the synthetic data generation logic used to train the ML models (Python). These drifts likely cause model performance degradation in production, as the model receives input distributions it was not trained on.

## Detailed Drift Analysis

| Feature Name | TS Implementation (Inference) | Python Expectation (Training) | Drift Type | Severity | Recommendation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`days_since_last_revision`** | Returns `999` for new topics (0 quizzes). | Generated as `[0, 30]` (integers). | **Range Mismatch** | **CRITICAL** | Update TS to return a value within range (e.g., `30` or `max_days`) or retrain model with `999` as a special value. |
| **`quiz_score_variance`** | Calculates **Standard Deviation** (`Math.sqrt(variance)`). | Labeled "variance", generated as `[0.0, 0.3]`. | **Semantic/Type Mismatch** | **HIGH** | Rename TS variable to `quiz_score_std_dev` and update model, OR change TS calculation to return Variance (remove `Math.sqrt`). |
| **`attempts_per_topic`** | Returns `0` for new topics. | Generated as `[1, 10]`. | **Range Mismatch** | **MEDIUM** | Standardize handling of new topics. If 0 attempts is valid, training data must include 0. |
| **`time_spent_per_question`** | Returns `0` for new topics. | Generated as `[10, 120]`. | **Range Mismatch** | **LOW** | Ensure model can handle 0 (which might imply "no data" rather than "fast/slow"). |
| **`performance_trend`** | `calculatePerformanceTrend` in `student_features.ts` uses **Linear Regression**. `smartRevisionPlanner.ts` re-implements it using **Moving Average Comparison**. | N/A (Feature not explicitly used in Mastery Model training script, but part of `MLSignals`). | **Logic Duplication** | **MEDIUM** | Centralize logic in `student_features.ts` and use it consistently across the application. |

## Technical Details

### 1. `days_since_last_revision` Outlier
- **Source:** `src/ml/features/student_features.ts:119`
- **Issue:** The default value `999` is an extreme outlier compared to the training data max of `30`.
- **Impact:** Linear models (like Logistic Regression used in `train_mastery_model.py`) will assign extreme weight to this feature, likely forcing a "not mastered" prediction regardless of other features, or causing numerical instability.

### 2. Variance vs Standard Deviation
- **Source:** `src/ml/features/student_features.ts:133`
- **Code:** `const quiz_score_variance = Math.sqrt(variance);`
- **Issue:** The variable is named `variance` but holds the standard deviation. The training data generator produces values in `[0.0, 0.3]` under the name `quiz_score_variance`.
- **Impact:** While the ranges overlap, the semantic meaning is different. A standard deviation of 0.3 implies a variance of 0.09. A variance of 0.3 implies a standard deviation of ~0.55. The model learns coefficients based on the training distribution; feeding it a different distribution (square root of the expected) distorts the decision boundary.

### 3. Logic Duplication in `performance_trend`
- **Source:** `src/ml/features/student_features.ts` vs `src/ai/flows/smart-revision-planner.ts`
- **Issue:** `smartRevisionPlanner.ts` defines a local `calculatePerformanceTrend` function that differs algorithmically from the exported one in `student_features.ts`.
- **Impact:** Inconsistent system behavior. The ADK might receive "STABLE" from one part of the system and "DECLINING" from another for the same student data.

## Recommendations

1. **Immediate Fixes (TypeScript Side):**
   - Change `days_since_last_revision` default from `999` to `30` (or a reasonable max value that fits the training distribution).
   - Verify if the model expects Variance or StdDev. If it expects Variance (based on the name), remove `Math.sqrt` in TS. If it expects StdDev (based on the range of values in training data), rename the variable in TS to `quiz_score_std_dev` and update the Python training script to generate StdDev explicitly.

2. **Long-Term Fixes (Python/ML Side):**
   - Update `generate_data.py` to include edge cases: 0 attempts, 0 time spent, and "never revised" scenarios.
   - Retrain the model on this more robust dataset.
   - Implement strict schema validation in the ML Bridge to reject inputs that violate training assumptions.

## Automated Drift Detection

A script `scripts/detect-drift.ts` has been added to programmatically verify these findings.

### Run Instructions:
```bash
npx tsx scripts/detect-drift.ts
```

### Sample Output:
```
📊 DRIFT DETECTION REPORT
===========================
❌ Found 7 potential drifts:

Scenario 1 (New Student) - [DRIFT] attempts_per_topic: Value 0 is outside training range [1, 10]
Scenario 1 (New Student) - [DRIFT] days_since_last_revision: Value 999 is outside training range [0, 30]
Scenario 1 (New Student) - [DRIFT] time_spent_per_question: Value 0 is outside training range [10, 120]
Scenario 2 (Active Student) - [DRIFT] time_spent_per_question: Value 6 is outside training range [10, 120]
Scenario 3 (Returning Student) - [DRIFT] days_since_last_revision: Value 60 is outside training range [0, 30]
Scenario 3 (Returning Student) - [DRIFT] time_spent_per_question: Value 6 is outside training range [10, 120]
Scenario 4 (Variance Check) - [DRIFT] quiz_score_variance: Value 0.5 suggests Standard Deviation is being returned, but Training Data expects Variance (max 0.3).
```
