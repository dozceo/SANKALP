# Chatbot Conversation Context Window Management Audit

## Executive Summary
The audit of the conversational AI system (`src/ai/flows/multilingual-cognitive-chatbot.ts` and `src/app/(main)/chat/actions.ts`) reveals that the chatbot currently **does not maintain conversation history** in its interactions with the LLM. Consequently, while there is no risk of token overflow from long sessions in the current state, the chatbot fails to meet the functional requirement of maintaining context, resulting in a stateless experience where the AI forgets previous interactions immediately.

## Methodology
1.  **Code Analysis:** Examined `src/ai/flows/multilingual-cognitive-chatbot.ts` (AI flow definition) and `src/app/(main)/chat/actions.ts` (Server Action).
2.  **Simulation:** Attempted to simulate a conversation history growth using `scripts/audit-chatbot-context.ts`.

## Findings

### 1. Stateless Implementation
The `explainConcept` function, which drives the chatbot, accepts `concept`, `brainMapContext`, and `language`.
In `src/app/(main)/chat/actions.ts`, the `brainMapContext` is **hardcoded** to a static string:
> "This concept is part of the introductory algebra syllabus, focusing on solving linear equations."

The user's current input is passed as `concept`. Previous messages are stored in the client-side React state (`messages` in `src/app/(main)/chat/page.tsx`) but are **never sent to the server or the AI model**.

### 2. Token Usage
Since history is not transmitted, token usage per request remains constant (roughly equal to the prompt template + current user query).
*   **Risk of Overflow:** None (currently).
*   **Risk of Degradation:** High (functional degradation due to lack of context).

### 3. Simulation Results
The simulation script `scripts/audit-chatbot-context.ts` confirmed that the underlying AI flow accepts a `brainMapContext` string. If we *were* to pass history into this field (as a naive implementation), the token count would grow linearly.
*   **Gemini 2.0 Flash Context Window:** The model (configured in `src/ai/genkit.ts`) has a very large context window (1M+ tokens), so a simple sliding window of the last ~20 messages would likely suffice without complex management strategies for typical sessions.

## Recommendations

### Short Term (Stability & Functionality)
1.  **Inject History:** Update `explainConcept` to accept a `history` array (e.g., `Message[]`).
2.  **Pass History:** Update `src/app/(main)/chat/actions.ts` to receive the chat history from the client and pass it to the AI flow.

### Long Term (Scalability)
1.  **Sliding Window:** Implement a sliding window strategy (e.g., keep last 10-20 turns) to prevent unbound growth, even though Gemini 2.0 Flash is generous.
2.  **Summarization:** For very long sessions, periodically summarize the conversation using a separate AI call and inject the summary as `context`.
3.  **Token Counting:** Integrate a token counting library (e.g., `js-tiktoken` or Genkit's built-in tools) to monitor usage and trigger truncation proactively.
