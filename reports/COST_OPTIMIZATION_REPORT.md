# Cost Optimization & Resource Efficiency Report

## Executive Summary

Sankalp's architecture shows proactive cost management in several areas (syllabus caching, batched ML inference), but faces significant scalability risks in its Teacher Dashboard and ML deployment model.

**Key Findings:**
1.  **Teacher Dashboard Scalability Risk**: The current implementation fetches *all* quiz results for *all* students every time a teacher views the dashboard. This is an O(N*M) operation that will degrade performance and spike database read costs as the user base grows.
2.  **ML Cold Start Penalties**: The serverless ML inference model (`ml-bridge.ts`) relies on spawning Python subprocesses. In a serverless environment (Next.js/Vercel), this incurs a 3-5s cold start penalty per instance, increasing compute costs and latency.
3.  **Syllabus Caching is Effective**: The 24-hour `unstable_cache` for syllabus generation is a strong cost-saving measure for popular exams.
4.  **Chatbot Context Overhead**: The chatbot injects the entire "Brain Map" into the prompt context, which is a variable and potentially unbounded cost driver per message.

---

## Current Cost Breakdown

### 1. LLM Token Usage (Gemini Pro)

| Operation | Input Tokens (Est.) | Output Tokens (Est.) | Cost per Op (Approx.) | Frequency |
| :--- | :--- | :--- | :--- | :--- |
| **Syllabus Generation** | ~50 | ~1,500 | **$0.0025** | Low (Cached 24h) |
| **Adaptive Quiz (10 Qs)** | ~100 | ~1,000 | **$0.0016** | Medium |
| **Chatbot Message** | ~2,000 (Context) | ~300 | **$0.0014** | High |
| **Revision Explanations** | ~500 | ~200 | **$0.0005** | Medium |

*   **Analysis**: Chatbot is the highest aggregate cost driver due to frequency and large context window. Syllabus generation is expensive per op but infrequent due to caching.

### 2. ML Inference Compute

*   **Mechanism**: Node.js `spawn('python')` bridge.
*   **Cost Driver**: Vercel/Serverless Function GB-Hours.
*   **Cold Start Cost**: ~3 seconds @ 1GB memory = ~$0.000013 per cold start.
*   **Warm Inference**: ~200ms = negligible.
*   **Risk**: High concurrency will trigger multiple cold starts, multiplying costs and latency.

### 3. Database (Firestore)

*   **Reads**: $0.036 per 100,000 reads.
*   **Writes**: $0.108 per 100,000 writes.
*   **Hotspot**: `GET /api/teacher/students`
    *   **Logic**: Fetches `students` (N) + `quizResults` (N * Avg_Quizzes).
    *   **Cost**: For 30 students with 50 quizzes each: 1,530 reads per dashboard load.
    *   **Impact**: 1,000 teachers loading dashboard once daily = 1.5M reads/day = **$0.54/day**.
    *   **At Scale (10k teachers)**: **$5.40/day** (pure waste).

---

## Cost-at-Scale Projections

| User Base | Est. Monthly Cost | Primary Cost Driver | Scalability Risk |
| :--- | :--- | :--- | :--- |
| **1,000 Users** | ~$50 - $100 | LLM (Chat/Quiz) | Low |
| **10,000 Users** | ~$800 - $1,200 | DB Reads (Teacher Dash) | **Medium** (Dashboard Latency) |
| **100,000 Users** | ~$15,000+ | ML Compute & DB Reads | **High** (ML Cold Starts, DB Throttling) |

*   **100k Scenario**: The Teacher Dashboard logic becomes untenable. ML inference on serverless functions will likely hit concurrency limits or become prohibitively expensive compared to a dedicated instance.

---

## Waste Inventory

| Source | Waste Description | Estimated Savings | Difficulty |
| :--- | :--- | :--- | :--- |
| **Teacher Dashboard** | Re-fetching complete quiz history to calculate a simple average score. | 95% of Dashboard DB Reads | Low |
| **Syllabus Generation** | Case-sensitive cache keys (e.g., "Math" vs "math") cause duplicate generations. | 10-20% of Syllabus Gen | Low |
| **ML Inference** | Spawning new Python processes for single predictions in serverless mode. | 50% of ML Compute Time | High |
| **Chatbot Context** | Re-sending static "Brain Map" data in every turn of conversation. | 40-60% of Chat Tokens | Medium |

---

## Optimization Roadmap

### Phase 1: Immediate Wins (Low Effort, High Impact)

1.  **Optimize Teacher Dashboard (Aggregation)**
    *   **Action**: Add `averageScore` and `quizzesTaken` fields to the `Student` document. Update these fields incrementally using Firestore Cloud Functions or atomic increments when a quiz is submitted.
    *   **Benefit**: Reduces Dashboard reads from O(Quizzes) to O(Students).
    *   **Est. Savings**: >90% on DB reads for dashboard.

2.  **Normalize Cache Keys**
    *   **Action**: Lowercase and trim `query` in `src/app/(main)/syllabus/actions.ts` before checking cache.
    *   **Benefit**: Increases cache hit rate.

### Phase 2: Architectural Improvements (Medium Effort)

3.  **Dedicated ML Service**
    *   **Action**: Move `predict_mastery.py` to a persistent FastAPI service (e.g., on Cloud Run or a small VM). Update `ml-bridge.ts` to prefer HTTP over subprocess.
    *   **Benefit**: Eliminates cold start latency (3s -> 100ms) and reduces compute cost at scale.

4.  **Chatbot Context Optimization**
    *   **Action**: Implement a "sliding window" or summary-based context for the chatbot instead of injecting the full Brain Map every time. Or use Client-side limiting.
    *   **Benefit**: Reduces input token consumption per message.

### Phase 3: Scale (High Effort)

5.  **Data Archival Strategy**
    *   **Action**: Move old `quizResults` (> 6 months) to Cold Storage (BigQuery/GCS) or delete them.
    *   **Benefit**: Keeps Firestore indices small and performant.

---

## Budget Alert System Spec

To prevent "bill shock", implement the following monitoring using Google Cloud Operations (formerly Stackdriver) or a custom middleware:

1.  **Daily Cost Threshold**: Alert if estimated daily cost > $10.00.
2.  **Token Spike Alert**: Alert if any single user consumes > 100k tokens/hour.
3.  **DB Read Velocity**: Alert if Firestore reads exceed 50k/hour (indicates N+1 loop).

**Implementation**:
*   Middleware in `src/middleware.ts` to track token usage (approximate) and log to Firestore/Logging.
*   Scheduled Cloud Function to aggregate usage and check against thresholds.
