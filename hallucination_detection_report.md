# Cognitive Chatbot Hallucination Detection Report

## Overview
This report details the methodology and results of the hallucination detection process for the Cognitive Chatbot. The goal was to establish a pipeline for monitoring chatbot responses and identifying factual inaccuracies or "hallucinations" which can harm learning outcomes.

## Methodology
Due to the absence of direct access to a historical database of chatbot interactions within the accessible codebase, a simulation approach was used.
A script (`scripts/detect-hallucinations.ts`) was created to:
1.  **Simulate Historical Data**: A dataset of synthetic chatbot responses was generated, including both factually correct statements and deliberate hallucinations/inaccuracies.
2.  **Mock Fact-Checking Pipeline**: A verification function was implemented to check these responses against a trusted "Knowledge Base" (a dictionary of verified facts).

### Synthetic Data Samples
The dataset included:
*   **Correct Responses**: e.g., "The capital of France is Paris."
*   **Hallucinations**: e.g., "The capital of France is Berlin."
*   **Scientific Inaccuracies**: e.g., Claiming photosynthesis produces Carbon Dioxide (instead of Oxygen).

## Results

The detection pipeline successfully identified the following issues in the synthetic dataset:

| Message ID | Prompt | Response | Issue Detected |
| :--- | :--- | :--- | :--- |
| **msg-003** | "What is the capital of France?" | "The capital of France is Berlin." | **Hallucination**: Expected "Paris", found mismatch. |
| **msg-004** | "What does photosynthesis produce?" | "Photosynthesis produces Carbon Dioxide." | **Inaccuracy**: Expected "Oxygen", found "Carbon Dioxide". |

All correct responses were verified as valid.

## Recommendations for Production Implementation
To implement this in the live system:
1.  **Logging**: Ensure all chatbot interactions (prompt + response) are logged to a persistent store (e.g., Firestore `chat_logs` collection).
2.  **Automated Verification**:
    *   Integrate an LLM-based evaluator (using a different model or prompt than the chatbot) to cross-reference responses with retrieved context (RAG) or external knowledge.
    *   Example Prompt for Evaluator: *"Verify if the following statement is factually correct based on the provided context. Statement: [Response]. Context: [Textbook Source]."*
3.  **Feedback Loop**: Flagged responses should be reviewed by human educators to improve the system prompts and grounding data.
