# Result: Adaptive Quiz Engine Analysis

**Prompt Source:** `prompts/01-adaptive-quiz-engine.md`  
**Execution Date:** 2026-02-19  
**Flow File:** `src/ai/flows/adaptive-quiz-engine.ts`

---

## 1. Flow Implementation Review

### Input Schema (`AdaptiveQuizInputSchema`)

| Field | Type | Description |
|-------|------|-------------|
| `topic` | `string` | The subject or topic for the quiz |
| `numQuestions` | `number` | Number of questions to generate |
| `educationLevel` | `string` | Target education level (e.g., High School, University) |
| `difficulty` | `enum` | `'Easy' | 'Medium' | 'Hard'` |

### Output Schema (`AdaptiveQuizOutputSchema`)

| Field | Type | Description |
|-------|------|-------------|
| `quiz` | `array` | Array of question objects |
| `quiz[].question` | `string` | The question text |
| `quiz[].options` | `string[4]` | Four answer choices |
| `quiz[].correctAnswer` | `string` | The correct answer string |
| `isFallback` | `boolean?` | Optional flag indicating fallback generation |

### LLM Prompt Template

The prompt instructs the LLM to act as an "expert quiz generator" and generate questions in a specific JSON format. It uses Handlebars-style template variables (`{{topic}}`, `{{numQuestions}}`, `{{educationLevel}}`, `{{difficulty}}`).

---

## 2. Prompt Quality Evaluation

### Strengths
- **Explicit format constraint**: Requires `question`, `options` (array of 4), and `correctAnswer` fields.
- **Difficulty differentiation**: The `difficulty` enum (`Easy/Medium/Hard`) provides clear levels.
- **Education level awareness**: Allows calibration for High School vs. University vs. competitive exam contexts.

### Weaknesses
- **No explanation field**: Questions lack explanations for why the correct answer is right — a significant educational gap.
- **Correct answer format ambiguity**: `correctAnswer` is a string matching one of the `options` strings, but the prompt doesn't explicitly require this match, risking mismatches.
- **No topic scoping guidance**: The prompt doesn't restrict output to curriculum-relevant questions; a broad topic could yield off-syllabus content.
- **`numQuestions` not validated**: Nothing prevents the LLM from returning fewer or more questions than requested.

---

## 3. Edge Cases and Failure Modes

| Scenario | Current Behavior | Risk Level |
|----------|-----------------|------------|
| LLM returns invalid JSON | `adaptiveQuizFlow` throws `Error('AI failed to generate quiz questions.')` — no fallback | **HIGH** |
| `correctAnswer` doesn't match any option | Accepted without validation at flow level | **MEDIUM** |
| `numQuestions` = 0 or negative | No input validation; LLM behavior undefined | **MEDIUM** |
| Very broad topic (e.g., "Science") | LLM may produce inconsistent difficulty/scope | **LOW** |
| Non-English `educationLevel` string | No normalization; may confuse LLM | **LOW** |
| `isFallback` flag | Defined in schema but never set to `true` in this flow | **LOW** |

**Key finding**: There is no fallback quiz generation mechanism despite the `isFallback` field being present in the output schema.

---

## 4. Educational Effectiveness Assessment

### Present
- Four-option multiple choice format is standard and appropriate.
- Single correct answer per question reduces ambiguity.
- Difficulty tiers allow adaptive difficulty assignment.

### Missing
- **Answer explanations**: No `explanation` field — students cannot learn from wrong answers.
- **Learning objective tags**: No metadata linking questions to specific curriculum objectives.
- **Question type variety**: Only MCQ; no true/false, fill-in-the-blank, or short answer options.
- **Bloom's Taxonomy alignment**: No cognitive level tagging (recall vs. application vs. analysis).

---

## 5. Recommendations

### High Priority
1. **Add `explanation` field to output schema**: Include a brief explanation for the correct answer to support learning.
   ```typescript
   explanation: z.string().describe('Brief explanation of why the correct answer is correct.')
   ```

2. **Implement fallback quiz generation**: When the primary LLM call fails, generate a static or template-based quiz using a fallback provider and set `isFallback: true`.

3. **Validate `correctAnswer` matches `options`**: Add post-processing to ensure the correct answer string matches one of the four options exactly.

### Medium Priority
4. **Add `numQuestions` bounds validation**: Clamp `numQuestions` to a reasonable range (e.g., 1–50) in input validation.

5. **Add topic scoping to the prompt**: Include curriculum context (e.g., "Focus questions on the standard CBSE/ICSE/AP curriculum for this topic.").

6. **Enhance prompt to prevent answer leakage**: Some LLMs put the correct answer as the first option; add a shuffle instruction.

### Low Priority
7. **Add Bloom's Taxonomy support**: Allow callers to specify cognitive level (`KNOWLEDGE`, `COMPREHENSION`, `APPLICATION`, `ANALYSIS`).

8. **Add `tags` field**: Include topic-specific tags for filtering and analytics.

---

## Summary

The Adaptive Quiz Engine is functional and well-structured but has a critical educational gap: no answer explanations. The prompt is clear but lacks validation constraints. The `isFallback` field in the schema suggests a fallback was planned but not implemented. Adding explanations and a fallback mechanism are the highest-priority improvements.
