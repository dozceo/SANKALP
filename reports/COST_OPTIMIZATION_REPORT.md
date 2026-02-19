# Cost Optimization & Resource Efficiency Report

## Executive Summary
This report analyzes the projected costs for the SANKALP platform across LLM, ML, Database, and Serverless infrastructure. It identifies key cost drivers, potential scaling risks, and optimization opportunities.

## 1. Unit Cost Analysis (Per Operation)

| Operation | LLM Cost ($) | ML Cost ($) | DB Cost ($) | Total ($) |
| :--- | :--- | :--- | :--- | :--- |
| **Quiz Generation** | $0.000480 | - | $0.000001 | $0.000481 |
| **Syllabus Generation** | $0.000622 | - | $0.000001 | $0.000624 |
| **Chatbot Message** | $0.000135 | - | $0.000001 | $0.000136 |
| **ML Prediction (Mastery)** | - | $0.000117 | $0.000001 | $0.000118 |
| **Dashboard Load** | - | - | $0.000007 | $0.000007 |

**Key Insight:** Quiz and Syllabus generation are the most expensive single operations due to LLM output tokens. ML prediction is relatively cheap per unit *if* warm, but cold starts add up.

## 2. Monthly Cost Projections (at Scale)

Assumptions:
- **Active Users**: 20% of total users are daily active.
- **Student Profile**: 2 quizzes/day, 5 chat/day, 10 dashboard loads/day, 1 syllabus/week.
- **ML Load**: Every dashboard load triggers ~5 topic mastery predictions (batched).

| Metric | 1,000 Users | 10,000 Users | 100,000 Users |
| :--- | :--- | :--- | :--- |
| **Total Monthly Cost** | **$46.29** | **$462.89** | **$4628.90** |
| LLM Share | $10.31 (22.3%) | $103.08 (22.3%) | $1030.80 (22.3%) |
| ML Share | $35.06 (75.7%) | $350.60 (75.7%) | $3506.00 (75.7%) |
| DB Share | $0.92 (2.0%) | $9.21 (2.0%) | $92.10 (2.0%) |


## 3. Waste Inventory & Risk Analysis

### High-Risk Patterns
1.  **ML Cold Start Penalties**: The current architecture spawns a Python subprocess for ML inference. In a serverless environment (Next.js), this leads to high latency and cost due to repeated environment initialization (loading `sklearn`, `pandas`, model pickling).
    *   **Est. Waste**: 80% of ML compute time is overhead in cold starts.
2.  **Uncached Syllabus Generation**: Syllabus generation is expensive ($0.0006). Students likely request the same syllabus ("AP Calculus BC") repeatedly.
    *   **Est. Waste**: 90% of requests could be served from cache.
3.  **Dashboard N+1 Queries**: Loading the dashboard fetches user, then classes, then quizzes, then predictions.
    *   **Impact**: Increases Firestore read costs linearly with complexity.

### Token Usage Heatmap
- **Adaptive Quiz**: HIGH (Input + Output). Array structure consumes many tokens.
- **Syllabus**: HIGH (Output). Long structured text.
- **Chatbot**: MEDIUM (Input). Context window (brain map) grows over time.
- **Smart Revision**: LOW.

## 4. Optimization Roadmap

### Phase 1: Low Effort, High Impact (Immediate)
- [ ] **Cache Syllabi**: Implement Firestore caching for generated syllabi keying by standard exam names.
    *   *Savings*: ~90% of Syllabus LLM costs.
- [ ] **Batch ML Predictions**: Ensure the frontend requests predictions for all visible topics in one batch (already partially implemented, but ensure effectively used).
- [ ] **Optimize Prompts**: Reduce verbose instructions in System Prompts. Use shorter field names in JSON schemas (e.g., `q` instead of `question`, `ops` instead of `options`) to save output tokens.

### Phase 2: Architectural Improvements (Medium Term)
- [ ] **Deploy ML as Microservice**: Move `src/ml` to a dedicated FastAPI service (e.g., on Cloud Run or persistent container).
    *   *Benefit*: Eliminates Python spawn overhead. Keeps model in memory (Warm start). Reduces latency from ~3s to ~100ms.
- [ ] **Database Denormalization**: Store a summary "Dashboard Object" in Firestore that is updated only when necessary (e.g., after a quiz), rather than re-aggregating on every read.

### Phase 3: Advanced Optimization (Long Term)
- [ ] **Model Quantization**: Compress the ML model to reduce memory footprint and load time.
- [ ] **Edge Caching**: Cache API responses for static content (e.g., class lists) at the edge.

## 5. Budget Alert System Spec

### Thresholds
- **Global Daily Budget**: $50 (Soft Alert), $100 (Critical Alert).
- **Per-User Monthly Limit**: $5.00 (stops expensive features like Syllabus Gen).

### Monitoring Logic
1.  **Token Counter Middleware**: Intercept all calls to `ai.generate`. Log token usage to a `usage_logs` Firestore collection.
2.  **Cost Aggregator**: A scheduled Cloud Function runs hourly to sum up costs from `usage_logs`.
3.  **Alert Dispatch**: If `current_daily_cost > threshold`, send email/Slack notification to admin.
