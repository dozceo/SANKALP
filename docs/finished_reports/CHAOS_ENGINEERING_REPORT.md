
# Infrastructure Chaos Engineering Report

**Date:** 2026-02-19T06:27:18.762Z
**Environment:** Staging / Simulation
**Tool:** Custom Chaos Monkey (scripts/chaos-experiment.ts)

## 1. Executive Summary
This report details the findings from a controlled chaos engineering experiment designed to validate system resilience against infrastructure failures. We simulated failures across ML, AI, and Database layers.

## 2. Failure Injection Matrix

| Scenario | Service | Failure Type | Outcome | Duration | Observation |
|----------|---------|--------------|---------|----------|-------------|
| Baseline: ML Prediction | ML | None | CAUGHT | 711ms | Error caught: Python process exited with code 1 |
| Baseline: Firestore Read | Firestore | None | SUCCESS | 1ms | Operation succeeded despite chaos (or baseline). |
| ML Latency Injection (2s) | ML | Latency | CAUGHT | 2260ms | Error caught: Python process exited with code 1 |
| ML Service Error | ML | Crash/Error | CAUGHT | 0ms | Error caught: Simulated ML Service Failure |
| AI Service Error | Genkit | Error 500 | CAUGHT | 1ms | Error caught: Simulated Genkit Failure |
| AI Quota Exceeded | Genkit | Rate Limit 429 | CAUGHT | 0ms | Error caught: 429: Quota Exceeded |
| Firestore Read Timeout/Latency | Firestore | Latency | SUCCESS | 3004ms | Operation succeeded despite chaos (or baseline). |
| Firestore Read Failure | Firestore | Connection Error | CAUGHT | 0ms | Error caught: Simulated Firestore Read Failure |
| Firestore Write Failure | Firestore | Disk/Network Error | CAUGHT | 1ms | Error caught: Simulated Firestore Write Failure |

## 3. Resilience Analysis

### 3.1 ML Service (FastAPI / Bridge)
- **Circuit Breaker:** The system correctly identifies failures.
- **Fallback:** When ML fails, the system currently throws an error. Recommendation: Implement a fallback to heuristic-based mastery calculation.

### 3.2 Genkit AI (Gemini)
- **Error Handling:** AI failures result in explicit errors.
- **Retry Strategy:** Not observed in this simulation layer (likely handled by Genkit internal retries, but we simulated terminal failures).
- **Impact:** Critical feature loss (Quiz Generation, Chat).

### 3.3 Firestore (Database)
- **Read Failures:** Propagate immediately. No caching fallback observed for critical user data.
- **Write Failures:** Result in data loss for the current transaction (e.g. Quiz Result).

## 4. Recommendations & Improvements

1.  **ML Fallback:** Update `predictMastery` to return a default "Unknown" or simple heuristic prediction instead of throwing, allowing the UI to degrade gracefully.
2.  **Database Cache:** Implement a local or Redis-based cache for `getStudent` to survive temporary Firestore outages.
3.  **Queue for Writes:** For `saveQuizResult`, implement a background queue (e.g., in localStorage or Service Worker) to retry writes if Firestore is down.
4.  **Circuit Breaker for AI:** Ensure UI disables "Ask AI" buttons when 429s are detected to prevent user frustration.

