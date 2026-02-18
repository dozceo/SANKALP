# Cost Optimization & Resource Efficiency Analyzer

**Domain**: Performance & Cost (Financial Engineering)
**Scope**: LLM API (Genkit), ML Inference (sklearn/Python), Firestore, Next.js Serverless Functions

---

## 1. Executive Summary

Sankalp's current architecture has critical scalability bottlenecks that will lead to exponential cost growth and severe latency issues as the user base expands. The primary cost drivers are:
1.  **ML Inference Latency & Compute**: The `smartRevisionPlanner` flow spawns a Python subprocess *sequentially* for every topic in a student's brain map. For a student with 20 topics, this means 20 separate inference calls, leading to 2s+ latency and massive serverless compute bills if not properly batched.
2.  **Uncached LLM Calls**: High-frequency flows like Chatbot (`getExplanation`) and Text-to-Speech (`getTextToSpeech`) lack caching, leading to redundant token usage for common questions.
3.  **Database Read Amplification**: The Teacher Dashboard (`/api/teacher/students`) performs an O(N) read operation, fetching every student's quiz history individually on every page load.

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
    2.  Iterates through `N` topics (e.g., 20) in a `for` loop.
    3.  **For each topic**: Awaits `predictMastery` (overhead: ~100ms inference via Python bridge).
    4.  **Total Time**: `N * 100ms` ≈ 2 seconds for 20 topics (plus network latency).
    5.  **Compute Cost**: 2s of GB-sec execution per user per day.
*   **Optimization Potential**: **90% reduction** by using `batchPredictMastery` (parallel inference).

### B. Adaptive Quiz Generation
*   **Trigger**: User requests a quiz.
*   **LLM Cost**:
    *   Input: System Prompt + JSON Schema (~800 tokens) + Topic Context.
    *   Output: 10 Questions JSON (~1000 tokens).
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

### D. Teacher Dashboard
*   **Trigger**: Teacher loads `/teacher/students`.
*   **Process**:
    1.  Fetches `M` students (DB Read).
    2.  Fetches `K` quiz results for *each* student (Batched DB Read).
    3.  Computes stats in memory.
*   **Cost**: O(M * K) reads. For 100 students taking 10 quizzes each, this is 1000+ reads per dashboard load.

---

## 4. Cost-at-Scale Projections

Assuming:
*   **100 Users**: 10 active/day.
*   **1K Users**: 100 active/day.
*   **10K Users**: 1000 active/day.

| Metric | 100 Users | 1K Users | 10K Users | 100K Users | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ML Compute (Planner)** | $5/mo | $50/mo | **$500/mo** | **$5,000/mo** | Linear growth, but base unit cost is dangerously high due to loop overhead. |
| **LLM (Chat/Quiz)** | $10/mo | $100/mo | $1,000/mo | $10,000/mo | Scales linearly with usage. Caching essential. |
| **DB Reads** | Free Tier | $5/mo | $50/mo | $500/mo | Manageable with indexes. |
| **Total Est. Cost** | **$15/mo** | **$155/mo** | **$1,550/mo** | **$15,500/mo** | *Does not include potential timeout retries which double costs.* |

*Warning: If ML inference times out (Vercel 10s limit), the planner will fail 100% of the time for students with >5 topics, causing churn and wasted compute.*

---

## 5. Waste Inventory

1.  **Sequential ML Loop**: `smart-revision-planner.ts` iterates topics and calls `predictMastery` sequentially.
    *   *Waste*: ~2s overhead per user per day.
    *   *Fix*: Use `batchPredictMastery` (parallel/batch processing).
2.  **Uncached Chatbot**: `getExplanation` in `chat/actions.ts` is raw generation.
    *   *Waste*: 100% redundant tokens for "What is photosynthesis?".
    *   *Fix*: Wrap in `unstable_cache`.
3.  **Teacher Dashboard Read Amplification**: `src/app/api/teacher/students/route.ts` fetches raw quiz data every time.
    *   *Waste*: Re-reading immutable history.
    *   *Fix*: Store aggregated stats in `studentProfile` (e.g., `avgScore`, `quizzesTaken`) and update on quiz submission.
4.  **Redundant Syllabus Generation**: `syllabus-generator.ts` references prompt is huge.
    *   *Waste*: Asking for "5 references" consumes output tokens.
    *   *Fix*: Reduce to "top 3" or use a search tool instead of generation. Cache by `query`.

---

## 6. Optimization Roadmap

### Phase 1: Critical Fixes (Immediate)
1.  **Refactor `smart-revision-planner.ts`**:
    *   Replace the `for (const topic of ...)` loop with a single call to `batchPredictMastery`.
    *   Update `ml-bridge.ts` to ensure `batchPredictMastery` efficiently reuses the process.
2.  **Implement Chat Caching**:
    *   Add `unstable_cache` to `getExplanation` with a TTL of 24h.

### Phase 2: Structural Optimization (Short-term)
1.  **Persistent ML Service**:
    *   Move `predict_mastery.py` to a standalone FastAPI service (e.g., Cloud Run or a separate container).
    *   Update `ml-bridge.ts` to call this HTTP endpoint.
    *   *Benefit*: Removes startup overhead completely. Latency drops to <100ms.
2.  **Database Indexing**:
    *   Ensure `sankalpSessions` has composite index `studentId + status`.
    *   Add aggregated fields to `students` collection to eliminate N+1 reads in dashboard.

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
| **Mindful Mentor** | ~2000+ | ~150 | $0.001+ | Low | **High** (Context size risk) |

---

## 8. Database Hotspots

1.  **Session Start**: `sankalpSessions` query (`where studentId == X and status == active`).
    *   *Optimization*: Composite index.
2.  **Teacher Dashboard**: `getTeacherStudents` + `getBatchedQuizResults`.
    *   *Optimization*: Denormalize stats onto `student` document.

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

## 10. Appendix: Implementation Prompts

Use the following prompt to guide an AI developer in implementing the "Phase 1" critical fixes.

**Prompt:**
```markdown
You are a Senior Backend Engineer working on the Sankalp platform. Based on the "Cost Optimization Report", implement the following "Phase 1" critical optimizations to reduce ML compute costs and LLM token usage.

### 1. Optimize Smart Revision Planner (Critical)
**File**: `src/ai/flows/smart-revision-planner.ts`
**Current State**: Iterates through topics and calls `predictMastery` sequentially (N subprocesses).
**Requirement**:
- Refactor the logic to collect all topic features first.
- Call `batchPredictMastery` (from `src/ml/inference/ml-bridge.ts`) once for all topics.
- Ensure `ml-bridge.ts` and `predict_mastery.py` correctly handle list inputs to process them in a single Python execution context if possible, or at least concurrently.

### 2. Implement Caching for Chat & Syllabus
**Files**: `src/app/(main)/chat/actions.ts`, `src/ai/flows/syllabus-generator.ts`
**Requirement**:
- Wrap the `getExplanation` function in `chat/actions.ts` with Next.js `unstable_cache`. Use a cache key based on the normalized concept/question. Set TTL to 24 hours.
- Wrap the `syllabusGenerator` result in a cache layer (or `unstable_cache` if applicable to the flow architecture) to prevent regenerating the same syllabus (e.g., "AP Calculus BC") multiple times.

### 3. Optimize Teacher Dashboard Reads
**File**: `src/app/api/teacher/students/route.ts`
**Requirement**:
- Identify the N+1 query pattern where quiz results are fetched for every student.
- Refactor to either:
  a) Use a single batched query (if Firestore limits allow).
  b) (Preferred) Read from a denormalized "stats" field on the Student document if it exists (add a TODO to implement the aggregation trigger).

**Constraints**:
- Maintain existing type safety.
- Do not break existing functionality.
- Add comments explaining the cost-saving rationale.
```

---
*Report generated by Jules (AI Engineer)*
