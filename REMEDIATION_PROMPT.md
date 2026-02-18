# Remediation Prompt for Genkit Flows

Use the following prompt to apply the security fixes identified in `FLOW_VALIDATION_AUDIT.md`.

---

**Role:** Senior Security Engineer & TypeScript Expert

**Task:** Refactor the Genkit flows in `src/ai/flows/` to achieve production-grade security and robustness, based on the findings in `FLOW_VALIDATION_AUDIT.md`.

**Objectives:**

1.  **Harden Input Validation:**
    -   Update all Zod schemas to enforce strict constraints: use `.max()` for strings, logical `.min()/.max()` for numbers, and `.regex()` for patterned inputs (e.g., IDs, topics).
    -   Convert primitive inputs (e.g., in `speech-to-speech.ts`) to structured `z.object` schemas for extensibility and type safety.

2.  **Mitigate Prompt Injection:**
    -   Refactor prompt definitions to isolate user input. Avoid direct interpolation into instruction blocks; use structured input parts or XML delimiters (e.g., `<user_query>`) to separate data from directives.

3.  **Production Standards:**
    -   Ensure proper error handling for validation failures.
    -   Maintain all existing functionality and export types.

**Scope:**

Apply these changes to the following files:
- `src/ai/flows/adaptive-quiz-engine.ts`
- `src/ai/flows/custom-cognitive-chatbot.ts`
- `src/ai/flows/mindful-mentor.ts`
- `src/ai/flows/multilingual-cognitive-chatbot.ts`
- `src/ai/flows/smart-revision-planner.ts`
- `src/ai/flows/speech-to-speech.ts`
- `src/ai/flows/syllabus-generator.ts`
- `src/ai/flows/text-to-speech.ts`

**Output:**
Produce fully refactored, production-ready code for each file.
