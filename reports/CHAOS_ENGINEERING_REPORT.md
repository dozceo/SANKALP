# Chaos Engineering Report
Date: 2026-02-20T06:45:49.097Z

## Failure Injection Matrix

| Scenario | Injection | Expected Outcome | Actual Outcome | Duration (ms) | Recovery |
|---|---|---|---|---|---|
| Baseline | `{}` | Success | Success | 380 | Full Recovery |
| ML Latency (2s) | `{"mlLatency":2000}` | Delayed Success | Success | 2006 | Full Recovery |
| ML Error | `{"mlError":true}` | Degraded (Fallback) | Error: Simulated ML Service Failure | 7 | None |
| Genkit Error | `{"genkitError":true}` | Degraded (No Explanations) | Error: Simulated Genkit Failure | 0 | None |
| Firestore Read Error | `{"firestoreReadError":true}` | Failure | Error: Simulated Firestore Read Failure | 4 | None |
| Firestore Write Error | `{"firestoreWriteError":true}` | Success (Non-blocking Cache) | Success | 3 | Full Recovery |

## System Resilience Analysis

### Cascade Propagation
- **ML Service Failure**: Currently causes a crash in `smartRevisionPlanner` if cache is empty. The `batchPredictMastery` failure is not caught by the caller.
- **Genkit Failure**: Currently causes a crash because `chaos.checkChaos` in the flow wrapper prevents execution. Fallback logic inside the flow is unreachable.
- **Firestore Read Failure**: This is a critical failure. The system cannot fetch student history or profile data, resulting in a complete breakage of the feature.
- **Firestore Write Failure**: Verified as non-critical. The system continues to function even if caching fails.

### Single Points of Failure
- **Firestore (Read)**: No fallback available. If DB is down, the app is effectively unusable for personalized features.
- **ML Service**: Identified as SPOF (Single Point of Failure) in current implementation due to unhandled exception.
- **Genkit AI**: Identified as SPOF due to unhandled exception in flow wrapper.

### Observability Gaps
- **Silent Failures**: ML errors are logged to console but might not trigger alerts in a real monitoring system unless specifically configured.
- **Traceability**: Fallback usage is not explicitly tagged in the output response, making it hard to know from the UI if the system is running in degraded mode.

### Recommendations
1. **Implement Circuit Breakers**: Add explicit circuit breakers for Firestore reads to fail fast.
2. **Cache Critical Data**: Cache student profile and recent quiz results in Redis or similar to survive short DB outages.
3. **UI Indicators**: visual indication when data is stale or estimated (fallback mode).
4. **Retry Logic**: Ensure retries are exponential backoff to avoid thundering herd on recovery.