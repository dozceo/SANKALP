# ML Feature Importance Attribution Transparency

**Date:** 2026-02-18T19:37:26.381Z
**Model Version:** 1.0.0
**Training Timestamp:** 2026-02-17T19:19:52.940743

## 1. Feature Ranking
The following table ranks the input features used by the Topic Mastery Model based on their impact on the prediction (Logistic Regression Coefficients).

| Rank | Feature Name | Coefficient | Impact Direction | Interpretation |
|------|--------------|-------------|------------------|----------------|
| 1 | `avg_quiz_score` | `13.2384` | Positive (+) | Higher quiz scores strongly indicate mastery. |
| 2 | `quiz_score_variance` | `-2.5364` | Negative (-) | Consistency matters; erratic performance reduces confidence. |
| 3 | `days_since_last_revision` | `-0.1745` | Negative (-) | Recent practice is better; long gaps reduce mastery. |
| 4 | `attempts_per_topic` | `-0.1557` | Negative (-) | More attempts without high scores might indicate struggle. |
| 5 | `time_spent_per_question` | `0.0050` | Positive (+) | Very fast or very slow answers can be negative signals. |

## 2. Model Introspection
- **Top Predictor:** `avg_quiz_score` (Coef: 13.24) is the dominant factor.
- **Secondary Factor:** `quiz_score_variance` also plays a significant role.

## 3. Transparency Statement
This model uses a linear architecture (Logistic Regression), making these coefficients directly interpretable as the change in log-odds of mastery for a unit increase in the feature value.
