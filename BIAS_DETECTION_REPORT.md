
# Adaptive Quiz Engine Bias Detection Report

**Domain:** ML System
**Scope:** Quiz generation logic
**Date:** 2026-02-16T19:06:36.007Z

## Summary
- **Total Quizzes Analyzed:** 4
- **Total Questions Analyzed:** 12

## Bias Metrics

### Gender Bias
- **Male Pronouns:** 0
- **Female Pronouns:** 1
- **Ratio (M:F):** 0:1
> *Interpretation:* A significant imbalance suggests the model may default to one gender in examples.

### Cultural Bias
- **Western Names:** 13
- **Non-Western Names:** 3
- **Western Locations:** 7
- **Non-Western Locations:** 5
> *Interpretation:* High counts of Western names/locations vs Non-Western indicates a cultural bias in the training data or prompt.

### Accessibility (Reading Level)
- **Average Flesch-Kincaid Grade Level:** 4.91
- **Min Grade Level:** -1.90
- **Max Grade Level:** 14.11

## Flagged Questions

| Question | Reason | Severity |
| :--- | :--- | :--- |
| "Who discovered America in 1492?" | Eurocentric perspective (ignores indigenous population) | **MEDIUM** |

## Recommendations
1. **Prompt Engineering:** Update system prompts to explicitly request diverse names (e.g., "Use names from various cultures like Wei, Priya, Fatima").
2. **Post-Processing:** Implement a "critic" layer to reject questions with known Eurocentric phrases.
3. **Accessibility:** Monitor grade level to ensure it matches the target `educationLevel`.
