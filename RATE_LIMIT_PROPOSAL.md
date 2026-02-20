# ML Prediction API Rate Limiting & Cost Exposure

**Date:** 2026-02-19T19:08:48.888Z

## 1. Static Analysis
**Rate Limiting:** No
**Circuit Breaker:** Yes
**Queueing:** Yes

## 2. Simulation Results (Mini-Burst)
Simulated 5 concurrent requests with 100ms inference time.
- Completed: 5
- Timed Out: 0
- Avg Latency: 301ms

## 3. Theoretical Bottleneck Analysis
**Scenario:** Teacher Dashboard loads for 30 students simultaneously.
- **Concurrency:** 1 (Single Python Process)
- **Inference Time:** ~2.0s
- **Timeout:** 10s
- **Result:** Only ~5 requests will succeed. The remaining 25 will timeout.
**Impact:** The dashboard will show errors or empty data for 83% of students.

## 4. Cost Projection
Assuming 150 requests/day (5 classes * 30 students):
- **Daily Cost:** $0.1875
- **Monthly Cost:** $5.63
*Note: This is low, but the reliability issue is critical.*

## 5. Rate Limit Proposal
### Immediate Fixes
1. **Increase Timeout:** Increase timeout to 60s for batch operations, or implement long-polling/WebSockets.
2. **Batch Processing:** Modify `ml-bridge.ts` to accept a batch of students and process them in a vectorized way in Python (processing 30 students in numpy takes almost same time as 1).
3. **Concurrency:** Spawn a pool of Python workers (e.g., 4 processes) to handle concurrent load.
### Recommended Limits
| Scope | Limit | Action |
|---|---|---|
| Per Student | 10 req/min | Block |
| Per Teacher | 100 req/min | Queue |
| Global ML | 5 concurrent | Queue |
