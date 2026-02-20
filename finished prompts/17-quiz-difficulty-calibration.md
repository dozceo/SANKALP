# Prompt: Quiz Difficulty Calibration

## Objective
Audit the Adaptive Quiz Engine's difficulty calibration. Verify that Easy/Medium/Hard labels produce measurably different question complexity and assess whether any post-generation validation exists.

## Actions to Execute

1. **Run** `scripts/analyze-quiz-difficulty.ts` to analyse generated quiz data
2. **Report** average word count, character count, and option length per difficulty tier
3. **Check** `src/ai/flows/adaptive-quiz-engine.ts` for post-generation difficulty validation logic
4. **Identify** whether the LLM prompt grounds Easy/Medium/Hard with examples (few-shot)
5. **Measure** reading grade level per difficulty level
6. **Recommend** few-shot prompting examples and heuristic difficulty validators

## Expected Output
A quiz difficulty calibration report with per-tier statistics, validation gap analysis, and specific few-shot prompt examples for each difficulty level.
