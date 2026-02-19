# Genkit Flow Validation Audit Report

**Date:** October 26, 2023
**Scope:** `src/ai/flows/*.ts`
**Objective:** Verify that all Genkit flows enforce strict input validation via Zod schemas and do not construct LLM prompts using unvalidated input.

## Summary of Findings

A static analysis of the 8 Genkit flow definitions revealed consistent security gaps across all files. The primary issues are:
1.  **Missing Length Constraints:** String inputs (`z.string()`) lack `.max()` constraints, allowing for potential Denial of Service (DoS) attacks via large payloads.
2.  **Unrestricted Input Content:** Free-form text fields accept any character, including potential prompt injection sequences, without sanitization or pattern matching.
3.  **Direct Prompt Injection:** User input is directly interpolated into LLM prompts using handlebars syntax (e.g., `{{{input}}}`), making the system vulnerable to prompt injection attacks if the input contains malicious instructions.
4.  **Primitive Input Types:** Some flows (e.g., `speech-to-speech`, `text-to-speech`) use primitive `z.string()` schemas instead of structured objects, limiting extensibility and validation precision.

## Detailed Analysis

### 1. `src/ai/flows/adaptive-quiz-engine.ts`

-   **Flow Name:** `adaptiveQuizFlow`
-   **Input Schema:**
    ```typescript
    z.object({
      topic: z.string(),
      numQuestions: z.number(),
      educationLevel: z.string(),
      difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    })
    ```
-   **Vulnerabilities:**
    -   `topic`: Unbounded string. Vulnerable to prompt injection (e.g., "Math. Ignore previous instructions...").
    -   `numQuestions`: Unbounded number. Could request negative or excessive questions (DoS).
    -   `educationLevel`: Unbounded string.
-   **Risk Level:** **High**
-   **Remediation:**
    -   `topic`: `z.string().min(3).max(100).regex(/^[a-zA-Z0-9\s\-_]+$/)`
    -   `numQuestions`: `z.number().int().min(1).max(20)`
    -   `educationLevel`: `z.string().max(50)` or use an Enum (e.g., `z.enum(['High School', 'University'])`).

### 2. `src/ai/flows/custom-cognitive-chatbot.ts`

-   **Flow Name:** `customizedConceptFlow`
-   **Input Schema:**
    ```typescript
    z.object({
      concept: z.string(),
      brainMapContext: z.string(),
      language: z.string(),
      personality: z.string(),
      customInstructions: z.string(),
    })
    ```
-   **Vulnerabilities:**
    -   `customInstructions`: **Critical Risk**. Allows direct modification of system behavior.
    -   All fields are unbounded strings.
-   **Risk Level:** **Critical**
-   **Remediation:**
    -   `customInstructions`: Strictly validate against a whitelist of allowed instruction types or remove entirely if not essential. If essential, restrict length significantly (e.g., `max(200)`).
    -   `concept`: `z.string().max(200)`
    -   `language`: `z.string().max(50)` (or ISO code validation).
    -   `personality`: `z.enum([...])` or strict length limit.

### 3. `src/ai/flows/mindful-mentor.ts`

-   **Flow Name:** `mindfulMentorFlow`
-   **Input Schema:**
    ```typescript
    z.object({
      studentConcern: z.string(),
      studentHistory: z.string(),
    })
    ```
-   **Vulnerabilities:**
    -   `studentConcern`: Unbounded string. Primary vector for jailbreaking attempts.
    -   `studentHistory`: Unbounded string.
-   **Risk Level:** **High**
-   **Remediation:**
    -   `studentConcern`: `z.string().max(1000)`
    -   `studentHistory`: `z.string().max(2000)`

### 4. `src/ai/flows/multilingual-cognitive-chatbot.ts`

-   **Flow Name:** `explainConceptFlow`
-   **Input Schema:**
    ```typescript
    z.object({
      concept: z.string(),
      brainMapContext: z.string(),
      language: z.string(),
    })
    ```
-   **Vulnerabilities:**
    -   Similar to `custom-cognitive-chatbot.ts`, but without `customInstructions`.
    -   `concept` and `language` are unbounded.
-   **Risk Level:** **Medium**
-   **Remediation:**
    -   `concept`: `z.string().max(200)`
    -   `language`: `z.string().max(50)`

### 5. `src/ai/flows/smart-revision-planner.ts`

-   **Flow Name:** `smartRevisionPlannerFlow`
-   **Input Schema:**
    ```typescript
    z.object({
      brainMap: z.string(), // JSON string
      studentId: z.string(),
    })
    ```
-   **Vulnerabilities:**
    -   `brainMap`: Accepts a raw JSON string. If parsed without validation, the structure is trusted blindly.
    -   `topicsToExplain` (internal prompt input): Constructed from ML decisions, but relies on `topic` names which come from the `brainMap` input. Indirect injection possible if `brainMap` contains malicious topic names.
-   **Risk Level:** **Medium**
-   **Remediation:**
    -   `brainMap`: Validate the parsed object against a strict Zod schema immediately after `JSON.parse()`.
    -   `studentId`: `z.string().uuid()` or specific format.

### 6. `src/ai/flows/speech-to-speech.ts`

-   **Flow Name:** `speechToSpeechFlow`
-   **Input Schema:** `z.string()` (Data URI)
-   **Vulnerabilities:**
    -   Input validation is weak (relies on description).
    -   **Indirect Prompt Injection:** The flow transcribes audio to text (`userQuery`) and then inserts it directly into the prompt: `Question: "${userQuery}"`. Malicious audio can inject commands.
-   **Risk Level:** **High**
-   **Remediation:**
    -   Input: Validate Data URI format strictly (MIME type, base64).
    -   Prompt: Use structured prompt inputs instead of string interpolation for `userQuery` if supported, or sanitize `userQuery` (though difficult for natural language). Use "Sandwich Defense" or delimiter instructions in the system prompt.

### 7. `src/ai/flows/syllabus-generator.ts`

-   **Flow Name:** `syllabusGeneratorFlow`
-   **Input Schema:**
    ```typescript
    z.object({
      query: z.string(),
    })
    ```
-   **Vulnerabilities:**
    -   `query`: Unbounded string.
-   **Risk Level:** **Medium**
-   **Remediation:**
    -   `query`: `z.string().min(3).max(100).regex(/^[a-zA-Z0-9\s\-_]+$/)`

### 8. `src/ai/flows/text-to-speech.ts`

-   **Flow Name:** `textToSpeechFlow`
-   **Input Schema:** `z.string()`
-   **Vulnerabilities:**
    -   Unbounded string length. Sending massive text could cause high costs or timeouts.
-   **Risk Level:** **Low** (primarily DoS/Cost)
-   **Remediation:**
    -   Input: `z.string().max(5000)`

## Conclusion

The current state of Genkit flows represents a significant security risk due to the lack of strict input validation. Immediate remediation is recommended to implement the Zod constraints outlined above.
