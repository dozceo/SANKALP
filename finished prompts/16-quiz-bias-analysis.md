# Prompt: Quiz Generation Bias Analysis

## Objective
Analyze generated quiz questions in SANKALP for cultural bias, gender bias, and reading level accessibility issues. Use the bias detection script to produce a quantitative bias report.

## Actions to Execute

1. **Run** `scripts/analyze-quiz-bias.ts` against `src/data/mock_quiz_generations.json`
2. **Report** gender pronoun counts and male:female ratio
3. **Report** Western vs. non-Western name and location counts — flag if ratio exceeds 2:1
4. **List** all flagged questions with their bias type and severity
5. **Report** Flesch-Kincaid reading grade level (average, min, max)
6. **Provide** concrete prompt engineering improvements to reduce detected biases

## Expected Output
A quantitative bias detection report with flagged questions, bias metrics, and updated prompt engineering recommendations.
