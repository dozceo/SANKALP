# Chatbot Context Window Audit Report

## Executive Summary
The chatbot flow `mindfulMentorFlow` in `src/ai/flows/mindful-mentor.ts` was audited for context window management. The audit simulated conversations with history sizes ranging from 1,000 to 100,000 characters.

## Findings

1.  **Unbounded Context Transmission**: The application attempts to transmit the entire `studentHistory` string to the LLM API, regardless of its length. Tests with payloads up to 100,000 characters (approx. 25,000 tokens) were sent to the API provider.
2.  **Lack of Client-Side Validation**: There is no pre-flight check or truncation logic in the application code to prevent sending excessive context.
3.  **Dependency on Upstream Limits**: The system relies entirely on the model provider (Gemini) to reject requests that exceed the context window. This is inefficient and can lead to runtime errors during long sessions.
4.  **Error Handling**: The current error handling catches the API error but does not gracefully recover (e.g., by summarizing history and retrying).

## Recommendations

1.  **Implement Sliding Window**: Truncate `studentHistory` to the most recent N turns or characters (e.g., last 10,000 chars) before sending to the API.
2.  **Add Summarization**: Periodically summarize older conversation history into a "context summary" string to retain key information without consuming token budget.
3.  **Token Counting**: Integrate a tokenizer (e.g., `tiktoken` or similar) to accurately estimate token usage before making API calls.

## Technical Details
- **Flow**: `mindfulMentorFlow`
- **Input Field**: `studentHistory`
- **Observed Behavior**: The application constructs a prompt with the full history and initiates an API request.
- **Test Result**: Requests with 100k characters failed with `API_KEY_INVALID` (due to environment configuration), but the *attempt* to send the payload confirms the absence of local size constraints.
