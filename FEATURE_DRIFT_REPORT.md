# ML Feature Drift Report

**Date:** 2026-02-17T19:28:41.731Z
**Status:** FAIL

## Summary
❌ Found 10 potential drifts.

| Severity | Feature | Expected | Actual | Scenario |
|---|---|---|---|---|
| 🟠 WARNING | `attempts_per_topic` | Range [1, 10] | `0` | New Student (0 Quizzes) |
| 🟠 WARNING | `days_since_last_revision` | Range [0, 30] | `999` | New Student (0 Quizzes) |
| 🟠 WARNING | `time_spent_per_question` | Range [10, 120] | `0` | New Student (0 Quizzes) |
| 🟠 WARNING | `time_spent_per_question` | Range [10, 120] | `6` | Active Student (Normal) |
| 🟠 WARNING | `days_since_last_revision` | Range [0, 30] | `60` | Returning Student (60 Days Inactive) |
| 🟠 WARNING | `time_spent_per_question` | Range [10, 120] | `6` | Returning Student (60 Days Inactive) |
| 🟠 WARNING | `time_spent_per_question` | Range [10, 120] | `6` | High Variance Student |
| 🔴 CRITICAL | `quiz_score_variance` | Variance (<= 0.25 for [0,1]) | `0.5 (Likely StdDev)` | High Variance Student |
| 🔴 CRITICAL | `days_since_last_revision` | Range [0, 30] | `-1` | Future Date Student |
| 🟠 WARNING | `time_spent_per_question` | Range [10, 120] | `6` | Future Date Student |

## Recommendations
- **Fix Variance Calculation:** TypeScript calculates Standard Deviation (`Math.sqrt(variance)`) but Python model expects Variance. Remove `Math.sqrt` in `student_features.ts`.
- **Fix Date Logic:** TypeScript allows negative days for future dates. Add clamp to 0.
- **Review Training Data:** Synthetic data generation range [0-30] days and [10-120]s is too narrow for real-world usage. Update `generate_data.py`.
