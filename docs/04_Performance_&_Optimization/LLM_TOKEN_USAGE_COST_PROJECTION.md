# LLM Token Usage Cost Projection

**Domain**: Performance & Cost (Financial Engineering)
**Scope**: `src/ai/flows/` (Genkit LLM Calls)
**Date**: October 26, 2023
**Author**: Jules (AI Engineer)

---

## 1. Executive Summary

This report provides a detailed cost projection for LLM usage within the application. Based on current prompt structures and model pricing (Gemini 1.5/2.0 Flash Tier), the system is generally cost-efficient for text-based operations. However, **audio-based features (Speech-to-Speech, Text-to-Speech)** represent a significant cost multiplier, potentially accounting for >70% of AI costs at scale.

**Projected Monthly Costs**:
-   **100 Active Users**: ~$17 / month
-   **1,000 Active Users**: ~$170 / month
-   **10,000 Active Users**: ~$1,700 / month

**Key Recommendation**: Implement strict caching for TTS (Text-to-Speech) and consider limiting speech features to premium tiers or specific quotas to prevent cost blowouts.

---

## 2. Methodology & Assumptions

### Model Pricing (Estimated)
We assume usage of **Gemini 1.5 Flash** (or equivalent 2.0 Flash) as the primary model, known for high speed and low cost.
-   **Input**: $0.075 / 1M tokens
-   **Output**: $0.30 / 1M tokens
-   **Context Window**: < 128k tokens

### Audio Pricing (Standard Google Cloud Rates)
-   **Speech-to-Text (STT)**: $0.006 / minute (rounded to 15s increments).
-   **Text-to-Speech (TTS)**: $15.00 / 1M characters (Standard WaveNet/Neural).

### User Behavior Profile (Daily Average per Active User)
-   **Quizzes**: 2 per day.
-   **Chat/Explain**: 10 interactions per day.
-   **Syllabus**: 0.1 per day (infrequent).
-   **Speech/Audio**: 1 interaction per day (high variance).
-   **Revision Planning**: 1 per day.

---

## 3. Per-Flow Cost Analysis

### A. Adaptive Quiz Engine (`adaptive-quiz-engine.ts`)
*   **Model**: Gemini 2.0 Flash
*   **Input**: ~500 tokens (System prompt + JSON Schema).
*   **Output**: ~550 tokens (10 questions + options + JSON overhead).
*   **Unit Cost**: **$0.00020** / call
*   **Risk**: Medium. High output token count relative to input.

### B. Custom & Multilingual Chatbot (`custom-cognitive-chatbot.ts`, `multilingual...`)
*   **Model**: Gemini 2.0 Flash
*   **Input**: ~400 tokens (Persona + Context + Query).
*   **Output**: ~200 tokens (Concise explanation).
*   **Unit Cost**: **$0.00010** / call
*   **Risk**: Low. Very efficient.

### C. Mindful Mentor (`mindful-mentor.ts`)
*   **Model**: Gemini 2.0 Flash
*   **Input**: ~650 tokens (Longer system prompt + student history).
*   **Output**: ~250 tokens (Empathetic advice).
*   **Unit Cost**: **$0.00012** / call
*   **Risk**: Low.

### D. Smart Revision Planner (`smart-revision-planner.ts`)
*   **Model**: Gemini 2.0 Flash (Explanation only)
*   **Input**: ~250 tokens (List of topics + metadata).
*   **Output**: ~150 tokens (Short explanations).
*   **Unit Cost**: **$0.00006** / call
*   **Risk**: Low. The heavy lifting is done by ML (free/fixed compute), LLM is just for gloss.

### E. Syllabus Generator (`syllabus-generator.ts`)
*   **Model**: Gemini 2.0 Flash
*   **Input**: ~200 tokens.
*   **Output**: ~1,100 tokens (Detailed structure + 5 references + strategy).
*   **Unit Cost**: **$0.00035** / call
*   **Risk**: Medium-High. Large output generation.

### F. Speech-to-Speech (`speech-to-speech.ts`)
*   **Components**: STT (10s) + LLM + TTS (200 chars).
*   **STT Cost**: ~$0.0010 (10s audio).
*   **LLM Cost**: ~$0.0001.
*   **TTS Cost**: ~$0.0030 (200 chars).
*   **Total Unit Cost**: **$0.00410** / call
*   **Risk**: **CRITICAL**. This flow is **40x more expensive** than a standard chat message.

---

## 4. Scaled Cost Projections (Monthly)

| Feature | Unit Cost | 100 Users | 1,000 Users | 10,000 Users |
| :--- | :--- | :--- | :--- | :--- |
| **Adaptive Quiz** (2/day) | $0.00020 | $1.20 | $12.00 | $120.00 |
| **Chatbot / Mentor** (10/day) | $0.00010 | $3.00 | $30.00 | $300.00 |
| **Syllabus** (0.1/day) | $0.00035 | $0.10 | $1.00 | $10.00 |
| **Revision Planner** (1/day) | $0.00006 | $0.18 | $1.80 | $18.00 |
| **Speech-to-Speech** (1/day) | $0.00410 | **$12.30** | **$123.00** | **$1,230.00** |
| **Total Monthly Cost** | | **~$16.78** | **~$167.80** | **~$1,678.00** |

*Note: Costs are estimates and do not include free tier benefits or enterprise volume discounts.*

---

## 5. Optimization Recommendations

1.  **Cache TTS Output (High Impact)**
    *   **Issue**: Generating audio for common phrases or repeated explanations is wasteful ($3 per 1M chars).
    *   **Fix**: Store generated audio files in Cloud Storage with a hash of the text as the filename. Serve static files for subsequent requests.

2.  **Limit Speech Features (Policy)**
    *   **Issue**: Speech-to-Speech is disproportionately expensive.
    *   **Fix**: Make this a "Pro" feature or limit to 5 mins/day for free users.

3.  **Optimize Syllabus Prompt (Medium Impact)**
    *   **Issue**: Asking for "5 references" and "detailed structure" generates massive text blocks.
    *   **Fix**: Reduce to "3 references" and "outline" for the initial request. Allow users to "expand" sections on demand (lazy loading).

4.  **JSON Schema Efficiency (Low Impact)**
    *   **Issue**: Verbose field descriptions in Zod schemas consume input tokens.
    *   **Fix**: Shorten descriptions in `z.describe()` for production schemas (e.g., "The user's query" -> "User query").

5.  **Monitor "Gemini 2.5" Usage**
    *   **Issue**: Code references `gemini-2.5-flash-speech`. If this model has higher pricing than standard Flash, costs could double.
    *   **Fix**: Verify pricing for experimental/preview models before broad rollout.

---
*Report generated by Jules (AI Engineer)*
