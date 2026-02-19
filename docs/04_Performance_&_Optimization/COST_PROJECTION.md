# LLM Token Usage & Cost Projection

## 1. Executive Summary

This report provides a cost projection model for the application's Genkit-based LLM features (`src/ai/flows/`).

**Key Finding:** The current use of **Gemini 1.5/2.0 Flash** keeps costs exceptionally low. However, costs can escalate linearly with user growth, and significantly if the model is switched to a higher-tier model (e.g., Gemini Pro or GPT-4o).

**Estimated Monthly Cost at 10,000 Users:** ~$53.00 (USD)
*Assumes 20% daily active users.*

## 2. Methodology & Assumptions

### Pricing Model (Gemini 1.5 Flash)
*Based on public pricing for Google Vertex AI / AI Studio as of late 2024.*
*   **Input Tokens:** $0.075 per 1 million tokens ($0.000000075 / token)
*   **Output Tokens:** $0.30 per 1 million tokens ($0.00000030 / token)
*   *Note: Audio/Video input costs are calculated separately and are not included in this text-based projection.*

### Usage Definitions
*   **DAU (Daily Active Users):** Assumed to be **20%** of total registered users.
*   **Token Estimation:** Based on static analysis of prompt templates in `src/ai/flows/` and heuristic estimates of average user inputs/outputs.

## 3. Per-Feature Analysis

### 3.1 Adaptive Quiz Engine
*   **File:** `src/ai/flows/adaptive-quiz-engine.ts`
*   **Function:** Generates a quiz with ~10 questions (estimated).
*   **Input:** Prompt (~100 tokens) + Topic/Metadata (~10 tokens) = **110 tokens**.
*   **Output:** 10 Questions w/ options (~70 tokens/q) + JSON overhead = **700 tokens**.
*   **Cost per Call:**
    *   Input: $0.00000825
    *   Output: $0.00021000
    *   **Total:** ~$0.00022

### 3.2 Syllabus Generator
*   **File:** `src/ai/flows/syllabus-generator.ts`
*   **Function:** Generates a comprehensive study syllabus.
*   **Input:** Prompt (~150 tokens) + Query (~20 tokens) = **170 tokens**.
*   **Output:** Structure, Strategy, References = **800 tokens**.
*   **Cost per Call:**
    *   Input: $0.00001275
    *   Output: $0.00024000
    *   **Total:** ~$0.00025

### 3.3 Smart Revision Planner
*   **File:** `src/ai/flows/smart-revision-planner.ts`
*   **Function:** Explains revision reasons for ~5 topics.
*   **Input:** Prompt (~130 tokens) + List of 5 topics (~100 tokens) = **230 tokens**.
*   **Output:** 5 Explanations (~40 tokens/exp) = **200 tokens**.
*   **Cost per Call:**
    *   Input: $0.00001725
    *   Output: $0.00006000
    *   **Total:** ~$0.00008

### 3.4 Mindful Mentor
*   **File:** `src/ai/flows/mindful-mentor.ts`
*   **Function:** Provides emotional support/advice.
*   **Input:** Prompt (~250 tokens) + Student Concern (~100 tokens) = **350 tokens**.
*   **Output:** Advice paragraph = **150 tokens**.
*   **Cost per Call:**
    *   Input: $0.00002625
    *   Output: $0.00004500
    *   **Total:** ~$0.00007

### 3.5 Cognitive Chatbots (Multilingual & Custom)
*   **Files:** `multilingual-cognitive-chatbot.ts`, `custom-cognitive-chatbot.ts`
*   **Function:** Explains concepts with context.
*   **Avg Input:** Prompt + Context (~200 tokens).
*   **Avg Output:** Explanation (~150 tokens).
*   **Cost per Call:**
    *   Input: $0.00001500
    *   Output: $0.00004500
    *   **Total:** ~$0.00006

## 4. Scalability Projections

### User Behavior Model (Daily per DAU)
*   **Quizzes:** 2 / day
*   **Syllabus:** 0.1 / day (once every 10 days)
*   **Revision Plan:** 1 / day
*   **Mentor Session:** 0.5 / day
*   **Chatbot Interactions:** 5 / day

**Total Daily Cost per DAU:** ~$0.00088 (approx. $0.001)

### Monthly Cost Estimates (30 Days)

| User Base | DAU (20%) | Daily Cost | Monthly Cost |
| :--- | :--- | :--- | :--- |
| **100 Users** | 20 | $0.02 | **$0.53** |
| **1,000 Users** | 200 | $0.18 | **$5.28** |
| **10,000 Users** | 2,000 | $1.76 | **$52.80** |

*Note: These estimates are for LLM Text Generation only. Audio processing (STT/TTS) and vector database storage/retrieval are excluded.*

## 5. Recommendations for Cost Control

1.  **Cache Syllabus Generation:** The syllabus for "AP Calculus BC" is identical for all students. Implement Redis or database caching to serve the same syllabus to multiple users, potentially reducing Syllabus API calls by 95%.
2.  **Limit Chatbot Context:** Ensure the `brainMapContext` passed to chatbots is truncated or summarized. Passing entire student histories can bloat input tokens significantly.
3.  **Client-Side Throttling:** Prevent users from spamming the "Generate Quiz" button. Implement a cooldown (e.g., 10 seconds) or a daily cap for free-tier users.
4.  **Monitor Model Versions:** Ensure the `gemini20Flash` (or `gemini15Flash`) model is strictly pinned. Accidentally switching to `gemini15Pro` would increase costs by ~50x.
5.  **Track Audio Costs:** If `speech-to-speech` usage grows, audit the `gemini-2.5-flash-speech` costs separately, as audio processing is typically priced by duration (seconds) and can be more expensive than text.
