# Fairness & Bias Cascade Report

Analysis of ML predictions, ADK decisions, and LLM contexts across behavioral archetypes.

## 1. Outcome Disparity Matrix
Comparing outcomes for students with **identical quiz scores** but different behaviors.

### Cohort: Score 0.3
| Archetype | Mastery Prob | Attention Risk | ADK Action | Priority | LLM Tone | LLM Strategy |
|---|---|---|---|---|---|---|
| Standard | 0.047 (0.000) | LOW | SCHEDULED_REVISION | MEDIUM | NEUTRAL | DEEP_DIVE |
| Slow Pacer | 0.063 (+0.016) | LOW | SCHEDULED_REVISION | MEDIUM | NEUTRAL | DEEP_DIVE |
| Fast Pacer | 0.028 (-0.019) | HIGH | ADAPTIVE_TEACHING | HIGH | MOTIVATING | INTERACTIVE |
| Crammer | 0.041 (-0.006) | LOW | URGENT_REVISION | HIGH | SUPPORTIVE | SHORT_FORM |
| Consistent Reviewer | 0.016 (-0.031) | LOW | SCHEDULED_REVISION | MEDIUM | NEUTRAL | DEEP_DIVE |

### Cohort: Score 0.5
| Archetype | Mastery Prob | Attention Risk | ADK Action | Priority | LLM Tone | LLM Strategy |
|---|---|---|---|---|---|---|
| Standard | 0.413 (0.000) | LOW | SCHEDULED_REVISION | MEDIUM | NEUTRAL | DEEP_DIVE |
| Slow Pacer | 0.489 (+0.076) | LOW | SCHEDULED_REVISION | MEDIUM | NEUTRAL | DEEP_DIVE |
| Fast Pacer | 0.291 (-0.122) | HIGH | ADAPTIVE_TEACHING | HIGH | MOTIVATING | INTERACTIVE |
| Crammer | 0.378 (-0.035) | LOW | URGENT_REVISION | HIGH | SUPPORTIVE | SHORT_FORM |
| Consistent Reviewer | 0.183 (-0.230) | LOW | SCHEDULED_REVISION | MEDIUM | NEUTRAL | DEEP_DIVE |

### Cohort: Score 0.7
| Archetype | Mastery Prob | Attention Risk | ADK Action | Priority | LLM Tone | LLM Strategy |
|---|---|---|---|---|---|---|
| Standard | 0.909 (0.000) | LOW | PROGRESS_ALLOWED | LOW | CHALLENGING | CHALLENGE |
| Slow Pacer | 0.931 (+0.022) | LOW | PROGRESS_ALLOWED | LOW | CHALLENGING | CHALLENGE |
| Fast Pacer | 0.853 (-0.056) | HIGH | PROGRESS_ALLOWED | LOW | CHALLENGING | CHALLENGE |
| Crammer | 0.896 (-0.013) | LOW | PROGRESS_ALLOWED | LOW | CHALLENGING | CHALLENGE |
| Consistent Reviewer | 0.759 (-0.150) | LOW | PROGRESS_ALLOWED | LOW | CHALLENGING | CHALLENGE |

### Cohort: Score 0.9
| Archetype | Mastery Prob | Attention Risk | ADK Action | Priority | LLM Tone | LLM Strategy |
|---|---|---|---|---|---|---|
| Standard | 0.993 (0.000) | LOW | PROGRESS_ALLOWED | LOW | CHALLENGING | CHALLENGE |
| Slow Pacer | 0.995 (+0.002) | LOW | PROGRESS_ALLOWED | LOW | CHALLENGING | CHALLENGE |
| Fast Pacer | 0.988 (-0.005) | HIGH | PROGRESS_ALLOWED | LOW | CHALLENGING | CHALLENGE |
| Crammer | 0.992 (-0.001) | LOW | PROGRESS_ALLOWED | LOW | CHALLENGING | CHALLENGE |
| Consistent Reviewer | 0.978 (-0.015) | LOW | PROGRESS_ALLOWED | LOW | CHALLENGING | CHALLENGE |

## 2. Attention Risk False Positive Rate
Identifying high-performing students (Score >= 0.7) flagged as 'At Risk'.

**Found 2 high-performing students flagged with HIGH priority/risk:**

- **Fast Pacer** (Score: 0.7): Flagged due to Strong mastery - ready for advanced content
- **Fast Pacer** (Score: 0.9): Flagged due to Strong mastery - ready for advanced content

## 3. Intervention Suggestion Disparity
Analyzing if certain behaviors trigger interventions disproportionately.

Total Interventions Triggered: 9

| Archetype | Score | Severity | Reason |
|---|---|---|---|
| Standard | 0.3 | MEDIUM | Repeated attempts without improvement |
| Fast Pacer | 0.3 | HIGH | High dropout risk detected |
| Crammer | 0.3 | MEDIUM | Repeated attempts without improvement |
| Consistent Reviewer | 0.3 | MEDIUM | Repeated attempts without improvement |
| Fast Pacer | 0.5 | HIGH | High dropout risk detected |
| Crammer | 0.5 | MEDIUM | Repeated attempts without improvement |
| Consistent Reviewer | 0.5 | MEDIUM | Repeated attempts without improvement |
| Fast Pacer | 0.7 | HIGH | High dropout risk detected |
| Fast Pacer | 0.9 | HIGH | High dropout risk detected |

## 4. Explanation Quality Parity (LLM Context Audit)
Checking if LLM instructions differ for valid learning styles.

### Disparity at Score 0.3:
- **Slow Pacer**: Tone=NEUTRAL, Diff=INTERMEDIATE
- **Fast Pacer**: Tone=MOTIVATING, Diff=BASIC
  *Potential Bias:* System treats speed differences as proficiency differences.

### Disparity at Score 0.5:
- **Slow Pacer**: Tone=NEUTRAL, Diff=INTERMEDIATE
- **Fast Pacer**: Tone=MOTIVATING, Diff=BASIC
  *Potential Bias:* System treats speed differences as proficiency differences.

## 5. Forgetting Curve Universality Test
Testing if the system's forgetting assumptions fit all learning styles.

- **Bias Detected at Score 0.3**: 'Consistent Reviewer' (10 day gap) has mastery probability 0.016 vs 'Standard' (3 day gap) 0.047.
  *Impact:* System assumes rapid decay for all students, potentially forcing unnecessary review for those with strong retention.
- **Bias Detected at Score 0.5**: 'Consistent Reviewer' (10 day gap) has mastery probability 0.183 vs 'Standard' (3 day gap) 0.413.
  *Impact:* System assumes rapid decay for all students, potentially forcing unnecessary review for those with strong retention.

## 6. Recommendations
Based on the audit findings:

1. **Calibrate Attention Risk**: High-performing 'Fast Pacers' are being flagged as 'High Risk'. Ensure `attention_risk` logic accounts for high mastery.
2. **Tone Consistency**: Detected tone disparities for 'Fast Pacer' vs 'Slow Pacer'. Ensure speed does not dictate the 'Supportive' vs 'Neutral' tone of explanations.
3. **Personalize Forgetting Parameters**: The system penalizes 'Consistent Reviewers' with longer gaps between sessions. Consider using a personalized decay rate rather than a global one.
4. **Normalize Time-Based Features**: `time_spent_per_question` triggers risk flags even for successful students. Normalize against student's personal history.

*Note: LLM analysis is based on ADK Prompt Context instructions. Actual generated text was not sampled to avoid API costs, but instruction disparity is a strong proxy for output bias.*
