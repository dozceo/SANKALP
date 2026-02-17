
# Fairness & Bias Cascade Report

**Date:** 2026-02-17T06:40:43.185Z
**Topic:** Algebra 101
**Method:** Counterfactual Fairness Testing (Synthetic Cohorts)

## 1. Cohort Analysis

| Profile | Avg Score | Time/Q (s) | Inactive (days) | Mastery Prob | Attn Risk | Action | Priority | Tone | Difficulty | Grade Level | Intervention |
|---|---|---|---|---|---|---|---|---|---|---|---|
| CONTROL | 0.69 | 5.2 | -1 | **0.497** | LOW | SCHEDULED_REVISION | MEDIUM | NEUTRAL | INTERMEDIATE | 8.7 | NONE |
| NIGHT_OWL | 0.68 | 5.4 | -1 | **0.456** | LOW | SCHEDULED_REVISION | MEDIUM | NEUTRAL | INTERMEDIATE | 8.7 | NONE |
| WEEKEND_WARRIOR | 0.70 | 5.2 | 2 | **0.393** | LOW | SCHEDULED_REVISION | MEDIUM | NEUTRAL | INTERMEDIATE | 8.7 | MEDIUM |
| FAST_GUESSER | 0.70 | 1.3 | -1 | **0.515** | LOW | SCHEDULED_REVISION | MEDIUM | NEUTRAL | INTERMEDIATE | 8.7 | NONE |
| SLOW_STEADY | 0.69 | 33.3 | 0 | **0.502** | LOW | SCHEDULED_REVISION | MEDIUM | NEUTRAL | INTERMEDIATE | 8.7 | NONE |
| BINGE_LEARNER | 0.71 | 5.2 | 0 | **0.524** | LOW | SCHEDULED_REVISION | MEDIUM | NEUTRAL | INTERMEDIATE | 8.7 | NONE |

## 2. Disparity Analysis

### Outcome Disparity (Mastery)
- **FLAG:** WEEKEND_WARRIOR has mastery deviation of 10.4% vs Control.

### Attention Risk Disparity

### Explanation Quality Disparity


## 3. Findings & Recommendations

### ML Model Fairness
- **Mastery Prediction:** Evaluated for stability across behavioral patterns.
- **Time Sensitivity:** Checked if "Fast Guesser" or "Slow Steady" are unfairly penalized.
- **Recency Bias:** Checked if "Binge Learner" or "Night Owl" patterns affect mastery score.

### ADK Decision Logic
- **Attention Risk:** Validated if risk flags are applied consistently.
- **Intervention:** Checked if interventions are suggested equitably.

### Recommendations
1. **Model Retraining:** If significant mastery drift (>5%) exists for same-score profiles, retrain with augmented behavioral data.
2. **Feature Engineering:** Review `time_spent_per_question` weighting if "Slow Steady" is penalized.
3. **ADK Policy:** Ensure "Night Owls" are not flagged as "High Risk" solely due to timestamp patterns.
