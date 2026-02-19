# ML Feature Engineering Drift Report

**Generated:** 2026-02-16T19:21:30.868Z
**Source Analysis:** `src/ml/features/student_features.ts` vs `src/ml/training/generate_data.py`

## Summary
⚠️ **Drift Detected:** 2 CRITICAL, 3 WARNING violations.

## Training Contract (Assumptions)
| Feature | Expected Range | Severity |
|---|---|---|
| `avg_quiz_score` | 0 - 1 | CRITICAL |
| `attempts_per_topic` | 1 - 10 | CRITICAL |
| `days_since_last_revision` | 0 - 30 | CRITICAL |
| `quiz_score_variance` | 0 - 0.3 | WARNING |
| `time_spent_per_question` | 10 - 120 | WARNING |

## Detailed Violations
### Test Case: Cold Start (New Topic)
| Feature | Value | Expected Range | Severity | Description |
|---|---|---|---|---|
| `attempts_per_topic` | 0.0000 | 1 - 10 | **CRITICAL** | Zero attempts (Cold Start) not covered in training data. |
| `days_since_last_revision` | 999.0000 | 0 - 30 | **CRITICAL** | Cold Start default (999) far exceeds training max (30). |
| `time_spent_per_question` | 0.0000 | 10 - 120 | **WARNING** | Time spent is below training minimum (10s). |

### Test Case: Inconsistent Student (High Variance/SD)
| Feature | Value | Expected Range | Severity | Description |
|---|---|---|---|---|
| `quiz_score_variance` | 0.5000 | 0 - 0.3 | **WARNING** | Calculated SD exceeds training Variance range (Likely SD vs Variance mismatch). |

### Test Case: Speed Runner (Low Time Spent)
| Feature | Value | Expected Range | Severity | Description |
|---|---|---|---|---|
| `time_spent_per_question` | 0.5000 | 10 - 120 | **WARNING** | Time spent is below training minimum (10s). |

## Recommendations
1. **Cold Start Handling:** The model is not trained on `attempts_per_topic=0` or `days_since_last_revision=999`. Retrain model with synthetic "new user" data or update feature extractor to normalize these values (e.g., clamp days to 30).
2. **Variance vs Standard Deviation:** TypeScript calculates SD (`Math.sqrt(variance)`) but Python generates low-range values labeled "variance" (0.0-0.3). If Python meant Variance, SD would be 0.0-0.55. Confirm definition and standardize.
3. **Time Spent Normalization:** Handle extremely low time-spent values (e.g., < 5s) to avoid outlier predictions.
