# Adaptive Quiz Engine - Bias Detection Report

**Date:** 2026-02-18T19:17:51.746Z
**Total Quizzes Analyzed:** 6
**Total Questions Analyzed:** 11

## Flagged Questions

### Question 2.1
> **Question:** When a nurse arrives at the hospital, what is the first thing she should do?
> **Options:** Check her makeup, Clock in, Call her boyfriend, Drink coffee
> **Issues Detected:**
- **Gender Bias:** Gender Stereotype (Appearance)

### Question 3.1
> **Question:** Which of these is a staple food for a normal family dinner?
> **Options:** Steak and wine, Caviar, Rice and beans, Truffles
> **Issues Detected:**
- **Cultural/Socio-economic Bias:** Socio-economic Bias (Wealth Assumption)
- **Cultural/Socio-economic Bias:** Normative Language

### Question 3.2
> **Question:** Who discovered America?
> **Options:** Christopher Columbus, Leif Erikson, The Indigenous People, Amerigo Vespucci
> **Issues Detected:**
- **Cultural/Socio-economic Bias:** Historical Bias (Eurocentric)
- **Readability:** High complexity (Grade Level: 17.0)

### Question 6.1
> **Question:** Which holiday involves decorating a Christmas tree?
> **Options:** Christmas, Hanukkah, Diwali, Eid
> **Issues Detected:**
- **Cultural/Socio-economic Bias:** Cultural Specificity (Western Holidays)

## Summary
- **Total Flagged Questions:** 4
- Potential bias detected in generated content. Review flagged items for sensitivity training or prompt engineering adjustments.

## Improvement Recommendations
1. **Prompt Engineering:** Explicitly instruct the LLM to use diverse names, genders, and cultural contexts.
2. **Post-Processing:** Implement a filter step (like this script) to catch and regenerate biased questions before serving them to students.
3. **Diverse Few-Shot Examples:** Ensure training data or few-shot examples in the prompt include non-Western and gender-neutral scenarios.
