# GENKIT FLOW VALIDATION AUDIT REPORT

**Date:** 2024-05-22
**Scope:** `src/ai/flows/`
**Goal:** Verify strict input validation via Zod schemas and check for unvalidated LLM prompt construction.

## Overview
All Genkit flows in `src/ai/flows/` implement input validation using Zod schemas. However, most schemas rely on generic `z.string()` types without length constraints or pattern matching. Prompt construction typically involves direct interpolation of these user inputs into the system prompt, creating potential prompt injection vulnerabilities.

## Detailed Analysis

### 1. `adaptiveQuizFlow` (`adaptive-quiz-engine.ts`)
- **Input Schema:** `AdaptiveQuizInputSchema`
  - `topic`: `z.string()` (No length limit)
  - `numQuestions`: `z.number()`
  - `educationLevel`: `z.string()` (No length limit)
  - `difficulty`: `z.enum(['Easy', 'Medium', 'Hard'])` (Strict)
- **Prompt Construction:** `{{topic}}`, `{{numQuestions}}`, `{{educationLevel}}` are interpolated directly.
- **Risk:** **Medium**. `topic` and `educationLevel` are injection vectors.
- **Recommendation:** Add `.max()` constraints. Validate `educationLevel` against a known set of levels if possible.

### 2. `customizedConceptFlow` (`custom-cognitive-chatbot.ts`)
- **Input Schema:** `ExplainConceptCustomizedInputSchema`
  - All fields (`concept`, `brainMapContext`, `language`, `personality`, `customInstructions`) are `z.string()` with no limits.
- **Prompt Construction:** Direct interpolation of all fields.
- **Risk:** **High**. `customInstructions` and `personality` effectively allow the user to rewrite the system prompt.
- **Recommendation:** Treat `customInstructions` as data, not system instructions. Use strict length limits. Validate `language`.

### 3. `mindfulMentorFlow` (`mindful-mentor.ts`)
- **Input Schema:** `MotivationalCounselingInputSchema`
  - `studentConcern`: `z.string()`
  - `studentHistory`: `z.string()`
- **Prompt Construction:** `{{{studentConcern}}}`, `{{{studentHistory}}}`.
- **Risk:** **Medium-High**. Free-text input injected directly.
- **Recommendation:** Limit input length. Use XML tagging (e.g., `<concern>...</concern>`) to demarcate user input.

### 4. `explainConceptFlow` (`multilingual-cognitive-chatbot.ts`)
- **Input Schema:** `ExplainConceptInputSchema`
  - `concept`: `z.string()`
  - `brainMapContext`: `z.string()`
  - `language`: `z.string()`
- **Prompt Construction:** Direct interpolation.
- **Risk:** **Medium**.
- **Recommendation:** Use `z.enum` for `language`. Add length limits to `concept`.

### 5. `smartRevisionPlannerFlow` (`smart-revision-planner.ts`)
- **Input Schema:** `SmartRevisionPlannerInputSchema`
  - `brainMap`: `z.string()` (Expected to be JSON)
  - `studentId`: `z.string()`
- **Logic:** `brainMap` is parsed via `JSON.parse` but the internal structure is not validated by Zod before use.
- **Prompt Construction:** `explanationPrompt` uses `{{{topicsToExplain}}}` derived from the parsed JSON.
- **Risk:** **Medium**. Indirect injection via malicious JSON content.
- **Recommendation:** Define a Zod schema for the parsed `brainMap` object and validate it.

### 6. `speechToSpeechFlow` (`speech-to-speech.ts`)
- **Input Schema:** `SpeechToSpeechInputSchema` (`z.string()` representing data URI).
- **Logic:** Transcribes audio to text (`userQuery`), then injects `userQuery` into LLM prompt.
- **Prompt Construction:** `Question: "${userQuery}"`.
- **Risk:** **Medium**. Audio-based prompt injection ("ignore previous instructions").
- **Recommendation:** Analyze `userQuery` length and content before passing to LLM.

### 7. `syllabusGeneratorFlow` (`syllabus-generator.ts`)
- **Input Schema:** `SyllabusInputSchema`
  - `query`: `z.string()`
- **Prompt Construction:** `{{{query}}}`.
- **Risk:** **Medium**.
- **Recommendation:** Limit `query` length.

### 8. `textToSpeechFlow` (`text-to-speech.ts`)
- **Input Schema:** `TextToSpeechInputSchema` (`z.string()`).
- **Logic:** Direct pass to TTS model.
- **Risk:** **Low** (TTS only).
- **Recommendation:** Add length limit to prevent high costs/abuse.

## Summary of Recommendations
1.  **Enforce Length Limits:** Update all `z.string()` schemas to include `.max(N)` to prevent buffer overflows and token exhaustion.
2.  **Restrict Enums:** Convert free-text fields like `language` and `educationLevel` to `z.enum()` where the set of values is known.
3.  **Validate JSON:** For `smartRevisionPlanner`, use Zod to validate the structure of the parsed JSON input.
4.  **Prompt Hardening:** Use structured prompts or delimiters (e.g., XML tags) to clearly separate user input from system instructions.
