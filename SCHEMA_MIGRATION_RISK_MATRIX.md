# Database Schema Migration Risk Analysis

## Executive Summary
This document assesses the risks associated with migrating the database schema (currently implemented via `src/lib/db-helpers.ts` using Firestore) to a relational database (e.g., PostgreSQL) or modifying the existing Firestore schema. The primary constraint is ensuring uninterrupted ML feature extraction and ADK decision logging.

## Current Schema Analysis (Firestore)
The application currently uses a document-oriented model with the following key collections:
*   `students`: Core user profiles.
*   `quizResults`: Historical performance data. **Critical for ML.**
*   `mlPredictions`: Cached ML outputs with expiration.
*   `adkDecisions`: Audit trail for AI decisions.
*   `syllabi`: AI-generated content.

## ML Feature Dependencies
The ML feature extraction logic in `src/ml/features/student_features.ts` strictly requires the following data structure from `quizResults`:

```typescript
export interface RawQuizResult {
    topic: string;             // Essential for topic-specific mastery
    score: number;             // Essential (0.0 - 1.0)
    timestamp: Date;           // Essential for forgetting curve & recency
    timeSpent: number;         // Essential for 'time_spent_per_question' feature
    questionsAttempted: number;// Essential for 'attempts_per_topic' feature
}
```

**Critical Dependency:** The `extractMasteryFeatures` function calculates variance and trends based on *chronological order* and *exact timestamps*. Any migration that truncates timestamps to dates or loses precision will degrade model accuracy.

## Migration Risk Matrix

| Component | Risk Description | Impact (1-5) | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Quiz Results (Time)** | Loss of `timeSpent` precision or field omission during normalization. | 5 (Critical) | **Mandatory:** Ensure `time_spent` column exists in new schema with second-level precision. |
| **Quiz Results (History)** | Failure to migrate full historical data for long-term trend analysis. | 4 (High) | Perform full historical backfill. Verify `questionsAttempted` count matches `count(*)` in legacy data. |
| **Timestamps** | Timezone conversion errors (e.g., UTC vs Local) affecting `days_since_last_revision`. | 4 (High) | Store all timestamps in UTC ISO-8601 format. Validate ML feature output pre/post migration. |
| **ADK Decisions** | `flags` field is an array of strings; relational DBs might require normalization. | 2 (Low) | Use `JSONB` column type for `flags` and `reasoning` to maintain flexibility without rigid schema. |
| **ML Predictions** | `expiresAt` logic might be handled differently (e.g., TTL index vs cron job). | 3 (Medium) | Implement explicit cleanup job or use DB-native TTL features. Ensure `expiresAt` is indexed. |
| **Student IDs** | Changing from Firestore string IDs to Integer Auto-Increment IDs. | 5 (Critical) | **Do not change ID format.** ML models and vector stores may reference string IDs. Use UUID/String primary keys. |

## Backward Compatibility Assessment
*   **Safe:** Adding new fields to `QuizResult` (e.g., `difficulty_level`).
*   **Unsafe:** Renaming `score` to `grade` or changing `score` scale (e.g., 0-100 instead of 0.0-1.0). **ML model expects 0.0-1.0.**
*   **Unsafe:** Removing `topic` field or normalizing it to an integer ID without a reliable lookup, as the ML model is trained on specific topic string identifiers (or embeddings derived from them).

## Recommendations
1.  **Freeze API:** Ensure `src/lib/db-helpers.ts` interfaces are treated as the contract.
2.  **Dual-Write:** During migration, write to both Firestore and the new DB to verify data consistency.
3.  **Feature Parity Test:** Run `extractMasteryFeatures` on a sample of students from both DBs and ensure identical output vectors.
