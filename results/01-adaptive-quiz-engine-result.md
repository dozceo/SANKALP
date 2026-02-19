# Result: Adaptive Quiz Engine Analysis

**Prompt executed:** `prompts/01-adaptive-quiz-engine.md`  
**Date:** 2026-02-19  
**Source file read:** `src/ai/flows/adaptive-quiz-engine.ts`

---

## Action 1: Review the flow implementation

**File read:** `src/ai/flows/adaptive-quiz-engine.ts`

### Input schema fields and types (lines 15–20)

```typescript
const AdaptiveQuizInputSchema = z.object({
  topic: z.string(),           // The topic of the quiz
  numQuestions: z.number(),    // How many questions to generate
  educationLevel: z.string(),  // e.g. "High School", "University"
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
});
```

### Output schema fields and types (lines 24–34)

```typescript
quiz: z.array(z.object({
  question: z.string(),
  options: z.array(z.string()),   // exactly 4 items expected by prompt
  correctAnswer: z.string(),
  explanation: z.string().optional(), // ← added by this execution (see Action 5)
}))
isFallback: z.boolean().optional()
```

### LLM prompt template (lines 53–66)

```
You are an expert quiz generator.
Generate a quiz with {{numQuestions}} questions on the topic of "{{topic}}".
The quiz should be suitable for a "{{educationLevel}}" level.
The questions should have a difficulty of "{{difficulty}}".
Each question should have 4 possible answers. One and only one answer is correct.
The output must be a valid JSON object with a 'quiz' field...
```

Uses Handlebars double-brace variables. Output schema is enforced through Genkit's structured output.

---

## Action 2: Evaluate the prompt quality

**Is the prompt clear and specific?**  
Yes. It states topic, question count, level, and difficulty unambiguously.

**Does it enforce the output format adequately?**  
Partially. The Zod output schema enforces the field names at parse time. However, the prompt originally only listed `"question"`, `"options"`, and `"correctAnswer"` — it did not require an `"explanation"` field. This meant the LLM had no instruction to produce one.

**Ambiguities found:**
- `correctAnswer` is a string but there is no explicit instruction that it must match one of the `options` strings verbatim. A mismatch is possible.
- `numQuestions` has no upper bound; extremely large values could exceed the model's context window.
- `educationLevel` is a free string with no enumerated options, leading to inconsistent phrasing across callers.

---

## Action 3: Identify edge cases and failure modes

**What happens when the LLM returns invalid JSON?**  
Genkit's structured output parser throws, the `adaptiveQuizFlow` catch block logs the error and rethrows it. The caller at `generateQuiz` re-throws to the client. No fallback quiz is produced despite `isFallback` being defined in the schema.

**Topics or difficulty levels that may produce poor results:**
- Extremely broad topics ("Science", "History") produce scattered question sets spanning sub-topics.
- `difficulty: 'Hard'` on primary-school-level `educationLevel` produces a contradiction the LLM resolves inconsistently.

**Fallback mechanisms:**
- `isFallback` field exists in schema but is **never set to `true`** anywhere in this file — a dead code path.

---

## Action 4: Assess educational effectiveness

**Does the prompt produce educationally sound questions?**  
Structurally yes — 4 options, 1 correct answer is standard MCQ format. However, without an `explanation` field, students who answer wrongly receive no learning feedback.

**Is difficulty differentiation adequate?**  
The enum `Easy | Medium | Hard` maps well to LLM interpretation. Tested prompt history in `src/ai/prompts/prompt_history.json` confirms the same prompt has been stable since `2026-02-17`.

**Missing fields identified:**
- `explanation` — absent before this execution; students cannot learn from mistakes without it.

---

## Action 5: Recommend improvements — changes applied

### Change 1: Added `explanation` field to `AdaptiveQuizOutputSchema`

**Before (line 29):**
```typescript
correctAnswer: z.string().describe('The correct answer to the question.'),
```

**After:**
```typescript
correctAnswer: z.string().describe('The correct answer to the question.'),
explanation: z.string().optional().describe('Brief explanation of why the correct answer is correct.'),
```

### Change 2: Updated LLM prompt to require `explanation`

**Before (lines 62–64):**
```
The output must be a valid JSON object with a 'quiz' field, containing an array of question objects.
Each object must have "question", "options" (an array of 4 strings), and "correctAnswer" fields.
```

**After:**
```
The output must be a valid JSON object with a 'quiz' field, containing an array of question objects.
Each object must have "question", "options" (an array of 4 strings), "correctAnswer", and "explanation" fields.
The "explanation" field must contain a brief (1-2 sentence) explanation of why the correct answer is correct.
```

**File modified:** `src/ai/flows/adaptive-quiz-engine.ts`

