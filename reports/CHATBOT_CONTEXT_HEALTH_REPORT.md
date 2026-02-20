# Chatbot Context Window Health Report

## Overview
This report audits the conversational AI context window handling for token overflow, truncation logic, and session persistence.

## Methodology
- Simulated a conversation using `src/ai/flows/multilingual-cognitive-chatbot.ts`.
- Checked for mechanisms to pass conversation history.
- Analyzed token usage and context retention.

## Findings

### 1. Stateless Architecture
The current implementation of `multilingual-cognitive-chatbot.ts` (function `explainConcept`) is designed as a **single-turn** request-response model.
- **Input Schema**: `{ concept, brainMapContext, language }`
- **Missing Field**: There is no `history` or `messages` array in the input schema.
- **Implication**: The chatbot does not maintain conversation history between turns. Each request is treated as a standalone query.

### 2. Conversation Simulation Results
**Error**: Simulation failed with error: GenkitError: FAILED_PRECONDITION: Please pass in the API key or set the GEMINI_API_KEY or GOOGLE_API_KEY environment variable.
For more details see https://genkit.dev/docs/plugins/google-genai
This might be due to missing API keys or network issues in the test environment.
However, the static analysis of the code confirms the lack of history handling.
### 3. Context Window & Token Limits
- **Current State**: Since history is not passed, there is no risk of *accumulating* history to hit token limits in the current implementation.
- **Risk**: If history *were* to be implemented by simply appending strings to the prompt, it would eventually hit the Gemini Flash token limit (approx 1M tokens, but practical limits are lower for latency).
- **Recommendation**: Implement a sliding window or summarization strategy for history.

## Recommendations

1.  **Implement Conversation History**:
    - Update `ExplainConceptInputSchema` to include a `history` array: `{ role: 'user' | 'model', text: string }[]`.
    - Pass this history to the Genkit prompt.

2.  **Context Management Strategy**:
    - **Sliding Window**: Keep the last N turns (e.g., 10) to stay within token limits.
    - **Summarization**: Use a background task to summarize older turns into the `brainMapContext` or a new `summary` field.

3.  **Session Persistence**:
    - The client currently stores messages in `localStorage`. This should be synchronized with the server (Firestore) to allow cross-device continuity.
