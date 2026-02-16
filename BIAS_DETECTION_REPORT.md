# Bias Detection Report: Adaptive Quiz Engine

## Executive Summary
This report analyzes the bias potential in the Adaptive Quiz Engine (`src/ai/flows/adaptive-quiz-engine.ts`). Due to API access restrictions, a dynamic analysis of generated content was not possible. The findings below are based on a static analysis of the codebase, specifically the prompt engineering and flow logic.

**Overall Risk Level:** High
**Primary Concern:** Lack of explicit constraints for cultural neutrality and accessibility in the generation prompts.

## Methodology
- **Scope:** `src/ai/flows/adaptive-quiz-engine.ts`
- **Approach:** Static Code Analysis & Prompt Review. (Dynamic generation attempted but blocked by API security policies).

## Findings

### 1. Prompt Engineering Deficiencies
The current prompt used for quiz generation is:
```typescript
prompt: `You are an expert quiz generator.

Generate a quiz with {{numQuestions}} questions on the topic of "{{topic}}".

The quiz should be suitable for a "{{educationLevel}}" level.
The questions should have a difficulty of "{{difficulty}}".

Each question should have 4 possible answers. One and only one answer is correct.
...`
```
**Issues Identified:**
- **Lack of Cultural Neutrality Instructions:** The prompt does not instruct the LLM to avoid region-specific assumptions (e.g., currency, sports, historical figures) unless the topic specifically calls for it. This risks generating US-centric or Western-centric content by default.
- **Accessibility Gaps:** There are no instructions regarding language simplicity, sentence structure, or avoiding idioms, which could disadvantage non-native speakers or students with reading difficulties, even at the same "education level".
- **No Diversity Mandate:** The prompt does not encourage diversity in examples or names used within word problems.

### 2. Missing Validation Layer
The `generateQuiz` function returns the AI output directly:
```typescript
const {output} = await adaptiveQuizPrompt(input);
// ...
return output;
```
**Issues Identified:**
- There is no intermediate step to "critique" or filter the questions for bias before presenting them to the student.
- No automated checks for reading level (e.g., Flesch-Kincaid) are implemented in the flow.

### 3. Model Dependency
The system relies on `gemini20Flash`. While efficient, smaller or "flash" models may prioritize speed over the nuanced understanding required to detect subtle cultural biases compared to larger reasoning models.

## Recommendations

### Short Term (Prompt Engineering)
Update `adaptiveQuizPrompt` to include specific fairness instructions:
> "Ensure questions are culturally neutral and avoid region-specific idioms. Use diverse names and examples where applicable. Language should be clear, accessible, and strictly aligned with the requested education level."

### Medium Term (Validation)
Implement a "Refinement Step" in the Genkit flow:
1.  **Generate** the quiz.
2.  **Critique** the quiz using a separate prompt (potentially with a stronger model) to identify bias.
3.  **Regenerate** if issues are found.

### Long Term (Systemic)
- Incorporate user feedback loops allowing students/teachers to flag questions for "Cultural Bias" or "Unclear Phrasing".
- Build a regression test suite of "sensitive topics" to periodically audit the model's neutrality.
