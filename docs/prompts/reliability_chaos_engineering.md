# Task: System Resilience & Chaos Engineering Fixes

**Source:** `docs/06_Quality_Testing_&_Debt/CHAOS_ENGINEERING_REPORT.md`

## Objective
Improve system resilience against component failures (ML Service, Database).

## Context
- **Scenario:** ML Error -> **FAILED** (Status 500). System crashed when ML service failed.
- **Scenario:** ML Latency -> **PASSED**.
- **Scenario:** Firestore Read Error -> **PASSED** (Handled gracefully).

## Requirements
1.  **Fix ML Service Failure Handling:**
    - Implement a circuit breaker or try-catch block around the ML service call.
    - Return a graceful degradation state (e.g., "Predictions unavailable") instead of a hard 500 crash.
2.  **Fallback UI:**
    - Ensure the UI displays a helpful message when ML/AI features are down, rather than a blank screen or raw error.
3.  **Observability:**
    - Log these degraded states with specific error codes for monitoring.

## Constraints
- Use existing error boundary components if available.
