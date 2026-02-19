# ML Feature Importance Attribution Transparency

**Generated:** 2026-02-19T19:15:39.318Z

## Executive Summary
This report extracts and visualizes the feature importance rankings from the trained Topic Mastery Prediction Model to ensure model interpretability and transparency.

## Model Metadata
- **Model Name:** Topic Mastery Prediction Model
- **Model Type:** LogisticRegression
- **Accuracy:** 91.25%
- **Training Timestamp:** 2026-02-17T19:19:52.940743

## Feature Importance Rankings
The following table ranks input features by their influence on the model's prediction of topic mastery.
- **Positive Importance:** Increases likelihood of mastery.
- **Negative Importance:** Decreases likelihood of mastery.

| Rank | Feature Name | Coefficient (Impact) | Direction |
|------|--------------|----------------------|-----------|
| 1 | `avg_quiz_score` | **13.2384** | Positive (+) |
| 2 | `quiz_score_variance` | **-2.5364** | Negative (-) |
| 3 | `days_since_last_revision` | **-0.1745** | Negative (-) |
| 4 | `attempts_per_topic` | **-0.1557** | Negative (-) |
| 5 | `time_spent_per_question` | **0.0050** | Positive (+) |

## Interpretation Guide
1. **High Impact Features:** The top features (Rank 1-3) are the primary drivers of the model's decision. Focus on these for student interventions.
2. **Low Impact Features:** Features at the bottom have minimal effect on the outcome.
3. **Transparency:** This data allows teachers and students to understand *why* a mastery status was assigned.
