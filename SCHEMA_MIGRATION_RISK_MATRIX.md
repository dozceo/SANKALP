# Database Schema Migration Risk Analysis

**Domain**: Data & APIs
**Scope**: Database Integration Layer (`src/lib/db-helpers.ts`) vs ML Feature Requirements (`src/ml/features/student_features.ts`)
**Date**: 2024-05-22

## Overview
This analysis assesses the risks associated with the current database schema implementation (Firestore) concerning the data requirements of the Machine Learning pipeline. Specifically, it highlights the mismatch between the document-oriented storage model and the aggregated history required for feature extraction.

## Schema Comparison

| Feature | DB Schema (`src/lib/db-helpers.ts`) | ML Requirement (`src/ml/features/student_features.ts`) | Mismatch / Risk |
| :--- | :--- | :--- | :--- |
| **Student History** | Distributed. `Student` doc + separate `quizResults` collection. | Aggregated. `StudentHistory` object containing `quizResults` array. | **High Risk**. Requires a "join" operation (multiple reads) to construct the ML input object. |
| **Quiz Results Limit** | `getQuizResults` defaults to `limit=100`. | `calculatePerformanceTrend` and `extractMasteryFeatures` benefit from full history. | **Critical Risk**. Limits on query results will truncate history, causing the model to perceive the student as having fewer attempts or different trends (Recency Bias). |
| **Timestamps** | Firestore `Timestamp`. | JavaScript `Date` object. | **Low Risk**. `db-helpers.ts` correctly handles conversion via `.toDate()`. |
| **Score Format** | `number` (0.0 - 1.0). | `number` (0.0 - 1.0). | **No Risk**. Consistent. |
| **Missing Fields** | `timeSpent` is mandatory in `QuizResult`. | `timeSpent` is mandatory in `RawQuizResult`. | **Medium Risk**. If legacy data exists without `timeSpent` (e.g., from early dev), the ML pipeline may fail or produce `NaN`. |

## Migration Risk Matrix

| Risk Scenario | Severity | Likelihood | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **Truncated History** | **Critical** | **High** | The ML model will receive only the most recent 100 quizzes. Features like `attempts_per_topic` will be capped, and `performance_trend` might be calculated on a window too small, leading to incorrect mastery predictions. | **Implement Dedicated ML Export**: Create a function `getAllStudentHistory(studentId)` that bypasses default limits or uses pagination to fetch complete history for training/inference. |
| **Legacy Data Incompatibility** | **High** | **Medium** | Older quiz results (if any) missing `timeSpent` or `questionsAttempted` will cause `extractMasteryFeatures` to crash or return invalid features (e.g., division by zero). | **Data Validation Layer**: Implement a sanitation step before passing data to ML: filter out incomplete records or fill with defaults (e.g., avg time). |
| **Schema Drift** | **Medium** | **Medium** | If `db-helpers.ts` adds new fields (e.g., `difficulty`) but `student_features.ts` is not updated, the model won't use them. If fields are renamed/removed, the model breaks. | **Shared Type Definitions**: Ensure `student_features.ts` imports types directly from `db-helpers.ts` (or a shared types file) to catch breaking changes at compile time. |

## Recommendations

1.  **Dedicated ML Data Accessor**:
    *   Do not rely on the general-purpose `getQuizResults` (with its 100-item limit) for ML tasks.
    *   Create a specific `fetchStudentHistoryForML(studentId)` function in `db-helpers.ts` that retrieves *all* necessary records (perhaps limited by time, e.g., last 6 months, rather than count).

2.  **Data Validation / Sanitization**:
    *   Update `student_features.ts` to robustly handle missing or `null` values in `quizResults` (e.g., `timeSpent || 0`).

3.  **Snapshotting for Training**:
    *   When generating training data, store a snapshot of the *exact* data used (as a versioned dataset artifact) to ensure reproducibility, as the live DB is mutable.
