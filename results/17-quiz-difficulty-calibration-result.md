# Result: Quiz Difficulty Calibration

**Prompt executed:** `prompts/17-quiz-difficulty-calibration.md`  
**Date:** 2026-02-20  
**Script run:** `scripts/analyze-quiz-difficulty.ts`  
**Report generated:** `QUIZ_DIFFICULTY_REPORT.md`

---

## Action 1 + 2: Script executed — simulated statistics

Script ran in mock mode (no live API key). Per-difficulty metrics from mock data:

| Difficulty | Avg Word Count | Avg Char Count | Avg Option Length |
|------------|---------------|----------------|------------------|
| Easy | 4.00 | 17.00 | 2.75 |
| Medium | 7.00 | 27.00 | 3.50 |
| Hard | 5.50 | 33.00 | 4.75 |

---

## Action 3: Post-generation difficulty validation

Source file read: `src/ai/flows/adaptive-quiz-engine.ts`

**Finding:** No post-generation validation logic exists. The flow:
1. Calls the LLM with the `difficulty` string in the prompt
2. Returns the raw LLM output

There is no code that verifies the generated questions actually match the requested difficulty level.

---

## Action 4: Few-shot examples in prompt

Current prompt (relevant excerpt):
```
The questions should have a difficulty of "{{difficulty}}".
```

**Finding:** No few-shot examples. The LLM receives only the label "Easy", "Medium", or "Hard" with no reference examples. This leads to subjective interpretation that varies by topic.

---

## Action 5: Reading level per difficulty

Mock data only — live measurement not possible without API key. Heuristic analysis of option lengths shows Hard questions have longer options (4.75 avg chars) but similar question length to Easy (5.50 vs 4.00 words), suggesting difficulty calibration is inconsistent.

---

## Action 6: Recommendations

### Few-shot prompt additions

```
Difficulty calibration guide:
- "Easy": Single-concept recall questions. Example: "What is the symbol for oxygen?" Options: ["O", "Ox", "Om", "Ok"]
- "Medium": Application questions requiring understanding of a concept. Example: "Which process converts glucose to energy in cells?" Options: ["Photosynthesis", "Cellular respiration", "Osmosis", "Mitosis"]  
- "Hard": Analysis or synthesis questions requiring multi-concept integration. Example: "A student observes that a plant placed in saltwater wilts. Which process best explains this observation?" Options: ["Osmosis causing water loss", "Photosynthesis inhibition", "Cellular respiration increase", "Root pressure decrease"]
```

### Heuristic validator

Add post-generation check:
```typescript
function validateDifficulty(question: QuizQuestion, requested: 'Easy' | 'Medium' | 'Hard'): boolean {
  const wordCount = question.question.split(' ').length;
  const minWords = { Easy: 3, Medium: 6, Hard: 8 };
  return wordCount >= minWords[requested];
}
```
