# Fairness & Bias Cascade Analysis Report

This report analyzes how the ML-ADK-LLM pipeline responds to different student behavioral profiles who have identical underlying mastery (0.8 score).

## 1. Outcome Disparity Matrix

| Cohort | Mastery Prob | ADK Action | Strategy | Readability (Grade Level) | Tone |
|---|---|---|---|---|---|
| Baseline | 1.000 | PROGRESS_ALLOWED | CHALLENGE | 9.5 | CHALLENGING |
| Slow Pacer | 1.000 | PROGRESS_ALLOWED | CHALLENGE | 9.5 | CHALLENGING |
| Fast Pacer | 1.000 | PROGRESS_ALLOWED | CHALLENGE | 9.5 | CHALLENGING |
| Returning Student | 0.000 | ADAPTIVE_TEACHING | INTERACTIVE | 3.0 | MOTIVATING |
| Crammer | 1.000 | PROGRESS_ALLOWED | CHALLENGE | 9.5 | CHALLENGING |
| Erratic | 1.000 | PROGRESS_ALLOWED | CHALLENGE | 9.5 | CHALLENGING |
| Morning Learner | 1.000 | PROGRESS_ALLOWED | CHALLENGE | 9.5 | CHALLENGING |
| Evening Learner | 1.000 | PROGRESS_ALLOWED | CHALLENGE | 9.5 | CHALLENGING |

## 2. Analysis of Bias Amplification

### Slow Pacer Bias
- Mastery Difference: 0.0%
- No significant bias detected based on speed alone.
### Recency Bias (Returning Student)
- Mastery Difference: 100.0%
- **WARNING**: Model heavily penalizes inactivity, potentially discouraging returning students.
### Time-of-Day Bias
- Mastery Difference: 0.0%
- No significant time-of-day bias detected.

## 3. Explanation Quality Parity

Analyzed the readability and tone of simulated LLM explanations based on ADK context.

- **Flag**: Returning Student is receiving very simple content (Grade 3.0) despite high scores (0.8).

## 4. Privacy-Preserving Fairness Monitoring Strategy

To monitor fairness without collecting sensitive demographics, we recommend:
1.  **Behavioral Clustering**: Group students by interaction patterns (e.g., 'Night Owls', 'Weekend Warriors', 'Sprinters') rather than demographics.
2.  **Disparity Audits**: Run this automated audit script weekly to detect if new model versions introduce bias against specific behavioral clusters.
3.  **Counterfactual Testing**: Before deploying any ADK rule change, run it against synthetic profiles to ensure no group is unfairly penalized.

## 5. Recommended Fairness Constraints

Based on findings, we recommend the following constraints for the next ML retraining:
1.  **Reduce Recency Weight**: The model over-penalizes gaps in practice. Cap the negative impact of `days_since_last_revision`.
2.  **Normalize Time Spent**: Use z-scores for `time_spent_per_question` relative to the student's own history, rather than absolute values, to accommodate different reading speeds.
3.  **Explicit Fairness Loss**: Include a fairness loss term during training that penalizes performance differences between behavioral clusters.
