# Database Schema Migration Risk Analysis

**Date:** 2026-02-18
**Scope:** Database Integration Layer vs ML Feature Extraction

## ML Model Requirements
The following features are required by the `mastery_model.pkl`:
- `avg_quiz_score`
- `attempts_per_topic`
- `days_since_last_revision`
- `quiz_score_variance`
- `time_spent_per_question`
- `mastered`

## Schema Risk Matrix
Analysis of `StudentHistory` and `RawQuizResult` interfaces in `src/ml/features/student_features.ts`.

| Field Name | Usage Status | Migration Risk | Impact |
|---|---|---|---|
| `studentId` | Unused | 🟢 LOW | Safe to modify/remove |
| `quizResults` | **USED** | 🔴 CRITICAL | Breaks ML Feature Extraction |
| `lastLoginDate` | Unused | 🟢 LOW | Safe to modify/remove |
| `registrationDate` | Unused | 🟢 LOW | Safe to modify/remove |
| `topic` | **USED** | 🔴 CRITICAL | Breaks ML Feature Extraction |
| `score` | **USED** | 🔴 CRITICAL | Breaks ML Feature Extraction |
| `timestamp` | **USED** | 🔴 CRITICAL | Breaks ML Feature Extraction |
| `timeSpent` | **USED** | 🔴 CRITICAL | Breaks ML Feature Extraction |
| `questionsAttempted` | **USED** | 🔴 CRITICAL | Breaks ML Feature Extraction |

## Recommendations
- **Do NOT rename or remove** fields marked as **CRITICAL** without updating `src/ml/features/student_features.ts`.
- Ensure any database migration (e.g., to Firestore) populates these fields exactly as typed.
- `quizResults` is a nested array; deep migration strategies are required.
