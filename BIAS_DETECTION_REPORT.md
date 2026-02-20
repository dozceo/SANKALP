
# Adaptive Quiz Engine Bias Detection Report

**Domain:** ML System
**Scope:** Quiz generation logic
**Date:** 2026-02-20T02:20:10.106Z

## Summary
- **Total Quizzes Analyzed:** 7
- **Total Questions Analyzed:** 21

## Bias Metrics

### Gender Bias
- **Male Pronouns:** 4
- **Female Pronouns:** 4
- **Ratio (M:F):** 4:4
> *Interpretation:* The gender distribution appears balanced.

### Cultural Bias
- **Western Names:** 15
- **Non-Western Names:** 9
- **Western Locations:** 10
- **Non-Western Locations:** 9
> *Interpretation:* High disparity between Western and Non-Western names indicates a cultural bias in the training data or prompt.

### Accessibility (Reading Level)
- **Average Flesch-Kincaid Grade Level:** 5.31
- **Min Grade Level:** -1.90
- **Max Grade Level:** 14.28

## Flagged Questions

| Question | Reason | Severity |
| :--- | :--- | :--- |
| "Who discovered America in 1492?" | Eurocentric perspective (ignores indigenous population) | **MEDIUM** |
| "The Dark Ages refers to the period after the fall of Rome." | Eurocentric historical periodization | **MEDIUM** |
| "Christopher Columbus discovered America in 1492." | Eurocentric perspective (ignores indigenous population) | **MEDIUM** |
| "The Far East is known for its unique spices." | Eurocentric geographical term | **MEDIUM** |

## Recommendations
1. **Prompt Engineering:** Update system prompts to explicitly request diverse names (e.g., "Use names from various cultures like Wei, Priya, Fatima").
2. **Post-Processing:** Implement a "critic" layer to reject questions with known Eurocentric phrases.
3. **Accessibility:** Monitor grade level to ensure it matches the target `educationLevel`.
