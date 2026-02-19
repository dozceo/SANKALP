# Quiz Question Difficulty Calibration Report

## Executive Summary
The quiz generation engine was audited for difficulty calibration. Due to missing API keys, the dynamic generation was simulated using mock data, but the code logic was analyzed.

## Static Code Analysis
The file `src/ai/flows/adaptive-quiz-engine.ts` relies entirely on the LLM prompt to determine difficulty:
```typescript
const adaptiveQuizPrompt = ai.definePrompt({
  // ...
  prompt: `... The questions should have a difficulty of "{{difficulty}}". ...`,
});
```
**Finding:** There is no mechanism to verify if the generated questions match the requested difficulty. The "Easy", "Medium", "Hard" labels are subjective to the LLM and may drift over time or vary by topic.

## Dynamic Analysis (Simulated)

| Difficulty | Source | Avg Word Count | Avg Char Count | Avg Option Length |
|------------|--------|----------------|----------------|-------------------|
| Easy | MOCK | 4.00 | 17.00 | 2.75 |
| Medium | MOCK | 7.00 | 27.00 | 3.50 |
| Hard | MOCK | 5.50 | 33.00 | 4.75 |

## Recommendations
1.  **Implement Few-Shot Prompting**: Provide examples of "Easy", "Medium", and "Hard" questions in the prompt to ground the model's understanding.
2.  **Post-Generation Validation**: Use a lightweight "Judge" model or heuristic (e.g., reading level score) to verify the difficulty of generated questions before showing them to the user.
3.  **Feedback Loop**: Collect student performance data (pass rates) per question to empirically calibrate difficulty labels over time.
