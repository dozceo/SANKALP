# ML Prediction API Rate Limiting Proposal

**Date:** 2026-02-17T19:28:08.937Z
**Test Scenario:** 50 requests with 50 concurrency.

## Performance Analysis
- **Total Duration:** 860ms
- **Throughput:** 58.14 requests/second
- **Success Rate:** 0.0%

## Observations
The current implementation uses a persistent Python subprocess via `stdin/stdout`.
- If throughput is high, this architecture is efficient as it avoids process spawn overhead.
- However, if the Python script blocks or crashes, all pending requests in the queue will timeout.
- A single Python process is a bottleneck for CPU-bound tasks (Global Interpreter Lock).

## Rate Limit Proposal

| User Role | Rate Limit (Requests/Min) | Burst Allowance | Justification |
|-----------|---------------------------|-----------------|---------------|
| **Student** | 60 | 10 | Typical usage is 1 quiz submission every few minutes. 60/min allows for rapid UI navigation but prevents abuse. |
| **Teacher** | 300 | 50 | Teachers may view class dashboards triggering batch predictions for multiple students. |
| **System** | 1000 | 200 | Background jobs (e.g., nightly analysis) need higher throughput. |

## Recommendations
1. **Implement Token Bucket:** Use Redis or an in-memory rate limiter to enforce per-user limits.
2. **Horizontal Scaling:** If load increases, use a pool of Python workers (e.g., `generic-pool`) instead of a single singleton process.
3. **Circuit Breaker:** If the Python bridge fails repeatedly, fail fast and fall back to heuristic (non-ML) logic to avoid hanging requests.
