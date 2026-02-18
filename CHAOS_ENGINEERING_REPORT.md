# Chaos Engineering Report: Infrastructure Resilience & Cascading Failure Analysis

**Date:** February 17, 2026
**Author:** Jules (AI Software Engineer)
**Scope:** Distributed System (ML Service, Genkit AI, Firestore, Next.js)
**Methodology:** Progressive Fault Injection via `scripts/chaos-test-suite.ts`

## 1. Executive Summary

A systematic chaos engineering audit was conducted on the Sankalp platform to evaluate system behavior under failure conditions. The analysis reveals a generally resilient architecture with robust fallback mechanisms for ML and Database failures, but identifies a critical Single Point of Failure (SPoF) in the AI/Genkit integration layer where service unavailability prevents the execution of fallback logic.

**Overall Resilience Score:** 🟠 **Medium-High** (Graceful degradation for ML/DB, but fragile AI dependency)

## 2. Failure Injection Test Matrix

The following scenarios were executed in a controlled test environment.

| Scenario | Injection Type | Target | Outcome | Impact Duration | Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BASELINE** | None | System | ✅ **Success** | 1.4s | System functions normally. Handles missing Python deps/API keys via internal fallbacks. |
| **ML_LATENCY** | Latency (+2s) | `predictMastery` | ✅ **Success (Delayed)** | 6.9s | Linear latency increase due to sequential processing of topics (3 topics × 2s). |
| **ML_FAILURE** | Error (Crash) | `predictMastery` | ⚠️ **Degraded** | 0.01s | **Resilient.** Catches error, logs it, and falls back to rule-based revision logic. |
| **GENKIT_FAILURE** | Error (Service Down) | `ai.defineFlow` | ❌ **Critical Failure** | 0s | **Fragile.** The entire `smartRevisionPlanner` flow aborts. Fallback logic inside the flow is never reached. |
| **DB_READ_LATENCY** | Latency (+1s) | `getStudent` | ✅ **Success (Delayed)** | 2.9s | Latency adds to total time but does not cause timeout or failure. |
| **DB_READ_FAILURE** | Error (Connection) | `getStudent` | ⚠️ **Degraded** | 0.9s | **Resilient.** Catches error and successfully uses provided `brainMap` data as fallback. |
| **CASCADING** | Combined Latency | ML + DB | ✅ **Success (Delayed)** | 9.0s | Latencies compound linearly. No exponential backoff or timeout detected. |

## 3. Cascade Propagation & Latency Analysis

### 3.1 Sequential Processing Bottleneck
The `smartRevisionPlanner` processes topics sequentially in a loop:
```typescript
for (const topic of brainMapData.topics || []) {
  // ...
  const mlPrediction = await predictMastery(...); // Blocking call
  // ...
}
```
**Finding:** A 2s latency in the ML service causes a `2s * N` delay in the total request time, where N is the number of topics.
**Impact:** For a student with 10 topics, a minor ML slowdown (2s) results in a 20s+ response time, likely causing a frontend timeout (gateway timeout is typically 10-30s).
**Recommendation:** Parallelize `predictMastery` calls using `Promise.all` to cap latency at `max(individual_latency)`.

### 3.2 Database Latency
Database latency affects the initial data fetch (`getStudent`). Since this is a single call at the start, it adds a fixed overhead. However, combined with ML latency, it pushes the total duration dangerously close to timeout thresholds.

## 4. Single Points of Failure (SPoF) Inventory

### 🔴 Critical SPoF: Genkit Flow Initialization
The chaos test revealed that the `chaos.checkChaos('genkit')` (simulating Genkit service availability) is applied to the `ai.defineFlow` wrapper in `src/ai/genkit.ts`.
- **Observation:** When Genkit is "down" (simulated), the flow function throws immediately upon invocation.
- **Consequence:** The `try/catch` block *inside* the flow (which contains the fallback logic for LLM failures) is never executed.
- **Risk:** If the AI service provider (Google Gemini) is unreachable, the Revision Planner feature breaks completely, instead of degrading to a rule-based system.

### 🟡 Partial SPoF: ML Bridge Subprocess
The `ml-bridge.ts` relies on a Python subprocess.
- **Observation:** In the baseline test, the Python process crashed due to `ModuleNotFoundError: No module named 'joblib'`.
- **Resilience:** The system correctly caught this crash and used the fallback. However, the reliance on a single persistent subprocess means if it crashes repeatedly or hangs, it could affect multiple requests if not managed correctly (the current implementation respawns, which is good).

## 5. Circuit Breaker & Retry Validation

- **Circuit Breaker:** ❌ **Absent.** The system does not appear to "open" a circuit after repeated failures. It continues to attempt to call the failing service (e.g., Python process is spawned every time if it keeps crashing).
- **Retries:** ❌ **Absent.** No automatic retries were observed for transient failures (e.g., DB read error). The system fails fast and falls back.
- **Timeouts:** ✅ **Present.** `ml-bridge.ts` has a 5000ms timeout for Python inference. This prevents infinite hangs.

## 6. Observability Gaps

- **Captured:**
  - Python process crashes are logged to stderr and captured by the bridge.
  - `smartRevisionPlanner` logs "Failed to make decision for topic..." and "LLM Explanation Failed".
- **Gaps:**
  - **Structured Logging:** Errors are logged to `console.error` but lack correlation IDs across the distributed trace (Frontend -> API -> ML).
  - **Metric Visibility:** There is no metric incrementing for "Fallback Triggered". Operators would not know the system is running in degraded mode (using fallbacks) without grepping logs.

## 7. Recommendations for Resilience

1.  **Fix Genkit Wrapper:** Move the chaos check (and by extension, the dependency check) from the `defineFlow` wrapper to the specific `generate` or `prompt` calls *inside* the flow. This allows the flow to start and handle AI unavailability gracefully.
2.  **Parallelize ML Calls:** Update `smartRevisionPlanner` to fetch ML predictions in parallel (`Promise.all`) to decouple total latency from the number of topics.
3.  **Implement Circuit Breaker for ML:** If the Python process crashes >3 times in 1 minute, stop trying to spawn it and immediately return fallback values for a cooldown period (e.g., 5 mins).
4.  **Add Metrics:** Instrument `logDecision` to record when `FALLBACK` logic is used, allowing for an alert on "High Fallback Rate".
5.  **Fix Python Dependencies:** Ensure `joblib` and other dependencies in `src/ml/inference/requirements.txt` are installed in the production environment.

## 8. Conclusion
The Sankalp platform demonstrates good "fail-safe" design principles (defaulting to safe values) but suffers from "fail-fast" behavior in the AI layer that bypasses these safeguards. Addressing the sequential processing bottleneck and the AI service dependency scope will significantly improve operational resilience.
