
# Chatbot Context Window Health Report

## Summary
The current implementation of the chatbot is **stateless**. The AI flow (`multilingual-cognitive-chatbot`) does not maintain conversation history, and the frontend only sends the current user input as context.

## Findings

### 1. Context Window Management
- **Status**: Non-Existent (Single-turn only).
- **Risk**: Low (No overflow risk currently), but Quality is impacted.
- **Limit**: The `concept` input is the only variable field. Theoretical max length is bounded by the underlying model (Gemini 2.0 Flash ~1M tokens), but practical UI limits likely apply first.
- **Logic**: No truncation logic implemented because history is not accumulated.

### 2. Session Persistence
- **Status**: Client-side only (`localStorage`).
- **Risk**: Loss of context on device switch or cache clear.
- **Server-side**: No session ID or history storage in database for chat.

### 3. Token Overflow
- **Current State**: Immune due to lack of history.
- **Potential Risk**: If history were naïvely appended to `brainMapContext`, it would eventually overflow.
- **Recommendation**: Implement a sliding window or summarization strategy if multi-turn context is desired.

## Recommendations
1.  **Implement Server-Side Session Management**: Store chat history in Firestore linked to `sessionId`.
2.  **Update Flow Schema**: Add `history` field to `ExplainConceptInput`.
3.  **Context Pruning**: Use a sliding window of the last 5-10 turns to maintain context without overflowing tokens.
