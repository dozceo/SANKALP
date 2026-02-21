# Fairness & Bias Cascade Analysis Report

**Generated:** 2026-02-19T06:35:01.187Z
**Scope:** Full Pipeline (Features -> ML -> ADK -> LLM Prompt)
**Method:** Counterfactual Testing with Synthetic Student Profiles

## 1. Outcome Disparity Matrix
Comparing how different behavioral profiles with similar "true" mastery are treated by the system.

| Profile | Avg Score | Time/Q | Days Since Rev | ML Probability | Prediction | ADK Action | Priority |
|---|---|---|---|---|---|---|---|
| **Standard Learner** | 0.78 | 31.0s | 1 | 0.917 | mastered | PROGRESS_ALLOWED | LOW |
| **Crammer** | 0.71 | 19.6s | 0 | 0.777 | mastered | PROGRESS_ALLOWED | LOW |
| **Slow Pacer** | 0.78 | 93.0s | 1 | 0.938 | mastered | PROGRESS_ALLOWED | LOW |
| **Fast Pacer** | 0.78 | 10.0s | 1 | 0.908 | mastered | PROGRESS_ALLOWED | LOW |
| **Returning Student** | 0.84 | 30.4s | 30 | 0.138 | not_mastered | ADAPTIVE_TEACHING | HIGH |
| **Struggling Student** | 0.44 | 46.2s | 1 | 0.120 | not_mastered | SCHEDULED_REVISION | MEDIUM |

## 2. Bias Detection Findings
### Aggregate Risk Metrics
- **False Positive Rate (Attention Risk):** 20.0%
  (Percentage of high-scoring students flagged for intervention)

### Crammer vs. Standard
- **Prob Difference:** 14.0%
- **Observation:** Crammers (high variance) are significantly penalized by the model.
### Slow Pacer vs. Standard
- **Prob Difference:** 2.1%
- **Observation:** Slower students are slightly favored (Coef: +0.005/sec).
### Returning Student Penalty
- **Days Inactive:** 30
- **ML Probability:** 0.138
- **ADK Action:** ADAPTIVE_TEACHING
- **Observation:** Inactivity heavily decays mastery probability (Coef: -0.174/day).

## 3. Explanation Quality & Tone Audit
Analysis of the strategy instructions sent to the LLM.

### Standard Learner
- **Strategy:** CHALLENGE
- **Tone:** CHALLENGING
- **Simulated Output:** "Analyze the advanced properties of Algebra. Determine the limiting factors and calculate the theoretical maximum efficiency under ideal conditions."
- **Reading Level (Flesch-Kincaid):** 17.3
- **Prompt Instructions:**
> Content Strategy: Advanced problems and thought-provoking questions. Push boundaries and explore implications.
>
> Constraints:
> - Target Duration: 15-MIN
> - Tone: CHALLENGING
> - Difficulty Level: ADVANCED
> - Include Examples: No
> - Include Visuals: No

### Crammer
- **Strategy:** CHALLENGE
- **Tone:** CHALLENGING
- **Simulated Output:** "Analyze the advanced properties of Algebra. Determine the limiting factors and calculate the theoretical maximum efficiency under ideal conditions."
- **Reading Level (Flesch-Kincaid):** 17.3
- **Prompt Instructions:**
> Content Strategy: Advanced problems and thought-provoking questions. Push boundaries and explore implications.
>
> Constraints:
> - Target Duration: 15-MIN
> - Tone: CHALLENGING
> - Difficulty Level: ADVANCED
> - Include Examples: No
> - Include Visuals: No

### Slow Pacer
- **Strategy:** CHALLENGE
- **Tone:** CHALLENGING
- **Simulated Output:** "Analyze the advanced properties of Algebra. Determine the limiting factors and calculate the theoretical maximum efficiency under ideal conditions."
- **Reading Level (Flesch-Kincaid):** 17.3
- **Prompt Instructions:**
> Content Strategy: Advanced problems and thought-provoking questions. Push boundaries and explore implications.
>
> Constraints:
> - Target Duration: 15-MIN
> - Tone: CHALLENGING
> - Difficulty Level: ADVANCED
> - Include Examples: No
> - Include Visuals: No

### Fast Pacer
- **Strategy:** CHALLENGE
- **Tone:** CHALLENGING
- **Simulated Output:** "Analyze the advanced properties of Algebra. Determine the limiting factors and calculate the theoretical maximum efficiency under ideal conditions."
- **Reading Level (Flesch-Kincaid):** 17.3
- **Prompt Instructions:**
> Content Strategy: Advanced problems and thought-provoking questions. Push boundaries and explore implications.
>
> Constraints:
> - Target Duration: 15-MIN
> - Tone: CHALLENGING
> - Difficulty Level: ADVANCED
> - Include Examples: No
> - Include Visuals: No

### Returning Student
- **Strategy:** INTERACTIVE
- **Tone:** MOTIVATING
- **Simulated Output:** "Let's look at Algebra together! Can you see how this works? Try to think about it this way. What happens if we change this variable?"
- **Reading Level (Flesch-Kincaid):** 2.9
- **Prompt Instructions:**
> Content Strategy: Engaging, question-driven format. Use analogies, visuals, and check understanding frequently.
>
> Constraints:
> - Target Duration: 2-MIN
> - Tone: MOTIVATING
> - Difficulty Level: BASIC
> - Include Examples: Yes
> - Include Visuals: Yes (describe diagrams)

### Struggling Student
- **Strategy:** DEEP_DIVE
- **Tone:** NEUTRAL
- **Simulated Output:** "To fully understand Algebra, we must examine the underlying principles and their applications in various contexts. Consider the implications of this theorem."
- **Reading Level (Flesch-Kincaid):** 12.8
- **Prompt Instructions:**
> Content Strategy: Comprehensive explanation with multiple perspectives. Include edge cases and nuances.
>
> Constraints:
> - Target Duration: 10-MIN
> - Tone: NEUTRAL
> - Difficulty Level: INTERMEDIATE
> - Include Examples: Yes
> - Include Visuals: No

## 4. Recommendations
1. **Crammer Variance Penalty:** High variance negatively impacts mastery score (-2.5 coefficient). Consider reducing this weight if recent scores are consistently high.
2. **Inactivity Decay:** The -0.174/day coefficient creates a steep drop-off. A student with perfect scores drops to <50% mastery in ~25 days. Validate if this matches the actual forgetting curve.
3. **Slow Pacer Fairness:** Slow pacers are not penalized, which is positive for inclusivity.
4. **ADK Fallbacks:** Ensure "Returning Students" get "Refresher" content rather than "Remedial" content if their past scores were high.
