# LLM Token Usage Cost Projection

**Scope:** `src/ai/flows/` (Genkit LLM calls)
**Model Basis:** Gemini 1.5 Flash
**Pricing Assumptions:**
- Input: $0.0750 / 1M tokens
- Output: $0.3000 / 1M tokens

---

## 1. Per-Feature Token Analysis

Estimates based on prompt templates and typical usage patterns.

| Feature | Input Tokens | Output Tokens | Total Tokens | Est. Cost / Call |
| :--- | :---: | :---: | :---: | :---: |
| **Adaptive Quiz** | 200 | 600 | 800 | $0.000195 |
| **Syllabus Generator** | 300 | 1200 | 1500 | $0.000382 |
| **Smart Revision Planner** | 500 | 250 | 750 | $0.000112 |
| **Cognitive Chatbot (Custom & Multilingual)** | 800 | 400 | 1200 | $0.000180 |
| **Mindful Mentor** | 600 | 350 | 950 | $0.000150 |
| **Speech-to-Speech (LLM Only)** | 150 | 150 | 300 | $0.000056 |


---

## 2. Monthly Usage Profile (Active Student)

Assumed frequency of feature usage per active student per month.

| Feature | Monthly Frequency | Total Monthly Tokens | Monthly Cost / User |
| :--- | :---: | :---: | :---: |
| Adaptive Quiz | 10 | 8,000 | $0.0019 |
| Syllabus Generator | 2 | 3,000 | $0.0008 |
| Smart Revision Planner | 30 | 22,500 | $0.0034 |
| Cognitive Chatbot (Custom & Multilingual) | 50 | 60,000 | $0.0090 |
| Mindful Mentor | 5 | 4,750 | $0.0007 |
| Speech-to-Speech (LLM Only) | 10 | 3,000 | $0.0006 |
| **TOTAL** | - | **101,250** | **$0.0164** |

---

## 3. Cost Projection by Scale

Projected monthly infrastructure costs at different user scales.

| Scale (Active Users) | Monthly Token Volume | Monthly Cost | Yearly Run Rate |
| :--- | :---: | :---: | :---: |
| **100** | 10,125,000 | **$1.64** | $19.68 |
| **1,000** | 101,250,000 | **$16.40** | $196.83 |
| **10,000** | 1,012,500,000 | **$164.03** | $1,968.30 |
| **100,000** | 10,125,000,000 | **$1,640.25** | $19,683.00 |


## 4. Recommendations for Cost Control

1.  **Cache Heavy Responses:** Implement caching for immutable generations like Syllabi (already partly implemented).
2.  **Optimize System Prompts:** Reduce verbose instructions in frequent flows like *Smart Revision Planner*.
3.  **Tiered Usage:** Limit expensive features (e.g., unlimited Chatbot) to premium tiers.
4.  **Token Budgeting:** Implement per-user daily token quotas to prevent abuse.
5.  **Model Distillation:** Fine-tune smaller models for specific high-volume tasks (e.g., Quiz Generation) to reduce latency and potentially cost (though Flash is already very cheap).

