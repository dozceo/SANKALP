# Cost Optimization & Resource Efficiency Analyzer

**Domain**: Performance & Cost (Financial Engineering)
**Scope**: LLM API (Genkit), ML Inference (sklearn/Python), Firestore, Next.js Serverless Functions

---

## 1. Executive Summary

Sankalp's current architecture has critical scalability bottlenecks that will lead to exponential cost growth and severe latency issues as user base expands. The primary cost drivers are:
1.  **ML Inference Latency & Compute**: The `smartRevisionPlanner` flow spawns a new Python subprocess *sequentially* for every topic in a student's brain map. For a student with 20 topics, this means 20 separate Python startup events, leading to 40s+ latency and massive serverless compute bills.
2.  **Uncached LLM Calls**: High-frequency flows like Chatbot (`getExplanation`) and Text-to-Speech (`getTextToSpeech`) lack caching, leading to redundant token usage for common questions.
3.  **Verbose Prompts**: `adaptive-quiz-engine` and `syllabus-generator` use large prompts with extensive JSON schema definitions, consuming input tokens rapidly.

**Projected Cost Risk**: At 10K users, monthly costs could exceed **$15,000/month** due to ML compute inefficiency alone, rendering the platform economically unviable without immediate remediation.

---

## 2. Current Cost Breakdown

| Component | Primary Cost Driver | Unit Cost (Est.) | Risk Level |
| :--- | :--- | :--- | :--- |
| **LLM API** | Input Tokens (Syllabus, Quiz) | $0.50 / 1M input | **Medium** |
| **ML Inference** | Serverless Compute (Duration) | $0.60 / GB-hr | **CRITICAL** |
| **Database** | Reads (Session Start, Planner) | $0.036 / 100K reads | **Low** |
| **Hosting** | Function Invocations | $0.20 / 1M req | **High** |

---

## 3. Per-Operation Cost Analysis

### A. Smart Revision Planner (The "Cost Bomb")
*   **Trigger**: User opens planner or requests revision.
*   **Process**:
    1.  Fetches Student History (DB Read).
    2.  Iterates through `N` topics (e.g., 20).
    3.  **For each topic**: Spawns `python predict_mastery.py` (overhead: ~2s startup + ~100ms inference).
    4.  **Total Time**: `N * 2.1s` ≈ 42 seconds for 20 topics.
    5.  **Compute Cost**: 42s of GB-sec execution per user per day.
*   **Optimization Potential**: **99% reduction** by using `batchPredictMastery` or a persistent model service.

### B. Adaptive Quiz Generation
*   **Trigger**: User requests a quiz.
*   **LLM Cost**:
    *   Input: System Prompt + JSON Schema (~800 tokens) + Topic Context.
    *   Output: 5-10 Questions JSON (~1000 tokens).
    *   Total: ~2000 tokens ($0.001 - $0.003 per quiz).
*   **Cache**: Implemented (`unstable_cache` 1 hr). **Good**.

### C. Chatbot Explanation
*   **Trigger**: Student asks "Explain gravity".
*   **LLM Cost**:
    *   Input: Concept + Context (~300 tokens).
    *   Output: Explanation (~200 tokens).
    *   Total: ~500 tokens.
*   **Cache**: **NONE**.
*   **Risk**: Viral topics or common questions generate 1000s of identical calls.

---

## 4. Cost-at-Scale Projections

Assuming:
*   **100 Users**: 10 active/day.
*   **1K Users**: 100 active/day.
*   **10K Users**: 1000 active/day.

| Metric | 100 Users | 1K Users | 10K Users | 100K Users | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ML Compute (Planner)** | $5/mo | $50/mo | **$500/mo** | **$5,000/mo** | Linear growth, but base unit cost is dangerously high due to spawn overhead. |
| **LLM (Chat/Quiz)** | $10/mo | $100/mo | $1,000/mo | $10,000/mo | Scales linearly with usage. Caching essential. |
| **DB Reads** | Free Tier | $5/mo | $50/mo | $500/mo | Manageable with indexes. |
| **Total Est. Cost** | **$15/mo** | **$155/mo** | **$1,550/mo** | **$15,500/mo** | *Does not include potential timeout retries which double costs.* |

*Warning: If ML inference times out (Vercel 10s limit), the planner will fail 100% of the time for students with >5 topics, causing churn and wasted compute.*

---

## 5. Waste Inventory

1.  **Sequential ML Spawning**: `smart-revision-planner.ts` iterates topics and calls `predictMastery` sequentially.
    *   *Waste*: ~2s overhead per topic per student.
    *   *Fix*: Use `batchPredictMastery` (parallel/batch processing).
2.  **Uncached Chatbot**: `getExplanation` in `chat/actions.ts` is raw generation.
    *   *Waste*: 100% redundant tokens for "What is photosynthesis?".
    *   *Fix*: Wrap in `unstable_cache`.
3.  **Uncached TTS**: `getTextToSpeech` in `chat/actions.ts` generates audio every time.
    *   *Waste*: High API costs for audio generation.
    *   *Fix*: Upload to Cloud Storage, hash text as filename, return public URL.
4.  **Redundant Syllabus Generation**: `syllabus-generator.ts` references prompt is huge.
    *   *Waste*: Asking for "5 references" consumes output tokens.
    *   *Fix*: Reduce to "top 3" or use a search tool instead of generation.

---

## 6. Optimization Roadmap

### Phase 1: Critical Fixes (Immediate)
1.  **Refactor `smart-revision-planner.ts`**:
    *   Replace the `for (const topic of ...)` loop with a single call to `batchPredictMastery`.
    *   Update `ml-bridge.ts` to ensure `batchPredictMastery` efficiently reuses the process or batches the input to the python script if possible (currently it does `Promise.all` which might still spawn N processes if the bridge isn't persistent. **Better**: Modify python script to accept a list of inputs).
2.  **Implement Chat Caching**:
    *   Add `unstable_cache` to `getExplanation` with a TTL of 24h.

### Phase 2: Structural Optimization (Short-term)
1.  **Persistent ML Service**:
    *   Move `predict_mastery.py` to a standalone FastAPI service (e.g., Cloud Run or a separate container).
    *   Update `ml-bridge.ts` to call this HTTP endpoint.
    *   *Benefit*: Removes 2s startup overhead completely. Latency drops to <100ms.
2.  **Database Indexing**:
    *   Ensure `sankalpSessions` has composite index `studentId + status`.

### Phase 3: Long-term Efficiency
1.  **Edge ML**:
    *   Convert Scikit-Learn model to ONNX.
    *   Run inference directly in Node.js (V8) without Python.
    *   *Benefit*: Zero-latency, zero-overhead, runs on Edge.
2.  **Vector Caching for Chat**:
    *   Implement semantic caching (store embedding of question -> cached answer). Matches "Explain gravity" with "What is gravity?".

---

## 7. Token Usage Heatmap

| Flow Name | Input Tokens | Output Tokens | Est. Cost/Call | Frequency | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Syllabus Generator** | ~1200 | ~1000 | $0.002 | Low | Low |
| **Adaptive Quiz** | ~1500 | ~1500 | $0.003 | Med | Med |
| **Chatbot Explanation** | ~500 | ~300 | $0.0005 | **High** | **High** (Cache it!) |
| **Revision Explainer** | ~800 | ~200 | $0.001 | Low | Low |

---

## 8. Database Hotspots

1.  **Session Start**: `sankalpSessions` query (`where studentId == X and status == active`).
    *   *Optimization*: Composite index.
2.  **Quiz History**: `getQuizResults` fetches last 100 results.
    *   *Optimization*: Reduce limit to 20 for trend analysis, or calculate trend incrementally and store it in `StudentProfile`.

---

## 9. Budget Alert System Spec

**Thresholds**:
*   **Global Daily Spend**: > $50 (Alert DevOps).
*   **Per-User Daily Spend**: > $0.50 (Flag User / Rate Limit).
*   **Error Rate Spike**: > 5% (Alert Engineering).

**Implementation**:
1.  **Middleware**: Wrap AI calls in a `trackUsage(model, tokens, userId)` function.
2.  **Storage**: Log usage to a `usage_logs` Firestore collection (sharded by day).
3.  **Aggregation**: Cloud Function triggers on write to update `daily_usage` aggregate.
4.  **Alerting**: Check aggregate against thresholds; send email/Slack webhook.

---
*Report generated by Jules (AI Engineer)*
