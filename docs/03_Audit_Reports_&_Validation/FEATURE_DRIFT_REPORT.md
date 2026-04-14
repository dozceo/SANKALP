# ML Feature Drift Report

**Date:** 2026-02-19T19:19:27.470Z
**Status:** FAIL

## Training Data Statistics (Ground Truth)
| Feature | Min | Max | Mean | StdDev |
|---|---|---|---|---|
| `avg_quiz_score` | 0.00 | 1.00 | 0.50 | 0.19 |
| `attempts_per_topic` | 1.00 | 9.00 | 5.66 | 2.31 |
| `days_since_last_revision` | 0.00 | 29.00 | 14.41 | 8.66 |
| `quiz_score_variance` | 0.00 | 0.28 | 0.10 | 0.06 |
| `time_spent_per_question` | 10.00 | 90.20 | 44.66 | 15.09 |

## Summary
❌ Found 3 potential drifts.

| Severity | Feature | Expected | Actual | Scenario |
|---|---|---|---|---|
| 🟠 WARNING | `days_since_last_revision` | Range [0, 29] | `999` | New Student (0 Quizzes) |
| 🟠 WARNING | `days_since_last_revision` | Range [0, 29] | `60` | Returning Student (60 Days Inactive) |
| 🔴 CRITICAL | `days_since_last_revision` | >= 0 | `-1` | Future Date Student |

## Recommendations
- **Fix Date Logic:** TypeScript allows negative days for future dates (Time Travel). Add clamp to 0 in `extractMasteryFeatures`.
- **Handle New Topics:** Default value for `days_since_last_revision` is 999, but training data max is ~30. This is a massive outlier. Use a value closer to the max seen in training (e.g., 30 or 60) or specific imputation strategy.
