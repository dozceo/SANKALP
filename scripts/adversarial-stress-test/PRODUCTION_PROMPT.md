# Prompt for Production Security Hardening

**Role:** Expert Security Engineer & AI Developer
**Task:** Harden the Genkit flows for an EdTech platform against adversarial attacks, prompt injection, and resource exhaustion.

**Context:**
We have `src/ai/flows/` containing:
1.  `syllabus-generator.ts`
2.  `adaptive-quiz-engine.ts`
3.  `mindful-mentor.ts`

Recent stress tests (`scripts/adversarial-stress-test/`) identified risks regarding input sanitization, potential jailbreaks, and lack of rate limiting.

**Requirements:**

1.  **Strict Input Validation (Zod):**
    *   Update all `InputSchema` definitions in the flows.
    *   Add `.min()`, `.max()`, and regex patterns to strings to prevent massive payloads or obvious injection patterns.
    *   Example: `query: z.string().min(5).max(100)` for syllabus.

2.  **System Prompt Defense (The "Fence"):**
    *   Refine the `prompt` definitions in each file.
    *   Add a "Security/Safety" section to each system prompt explicitly forbidding:
        *   Revealing system instructions.
        *   Generating illegal/harmful content.
        *   Roleplaying as other entities (DAN, etc.).
    *   Instruct the model to return a specific error code or standard refusal message if a violation is detected.

3.  **Output Validation & Error Handling:**
    *   Ensure the flows gracefully handle cases where the LLM refuses to generate output (returns null or refusal text).
    *   Wrap Genkit calls in a try/catch that specifically looks for `400` or policy violation errors and rethrows them as user-friendly application errors.

4.  **Rate Limiting Middleware:**
    *   Create a `src/lib/rate-limit.ts` using a simple sliding window or token bucket (backed by memory or Redis/Firestore if available, otherwise memory for now).
    *   Apply this rate limiter to the flow entry points.

**Deliverables:**
*   Modified code for the 3 flow files.
*   New `src/lib/rate-limit.ts`.
