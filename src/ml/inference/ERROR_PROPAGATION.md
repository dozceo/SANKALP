# Python-TypeScript Subprocess Error Propagation Audit

This document details the handling of errors in the communication bridge between the Node.js application (`src/ml/inference/ml-bridge.ts`) and the Python inference script (`src/ml/inference/predict_mastery.py`).

## Scope & Methodology

This audit was conducted to verify and harden error propagation mechanisms. Fault injection testing was performed using a mock subprocess harness (`mock_predict.py`) to simulate various failure modes (crashes, timeouts, malformed data, logic errors).

## Error Propagation Matrix

The following matrix maps failure modes simulated in the Python subprocess to the corresponding behavior in the TypeScript bridge.

| Failure Mode | Description | TypeScript Behavior | Outcome | Severity |
| :--- | :--- | :--- | :--- | :--- |
| **NORMAL** | Standard operation | Parses JSON, resolves promise | **Success** | Low |
| **STARTUP_CRASH** | Python script exits immediately (e.g., ImportError) | `process.on('close')` fires with non-zero code. `cleanup` rejects pending requests. | **Rejection** with `Error: Python process exited with code 1` | High (Recoverable) |
| **PROCESS_CRASH** | Python script exits during processing (e.g., Segfault) | `process.on('close')` fires with non-zero code. `cleanup` rejects pending requests. | **Rejection** with `Error: Python process exited with code 1` | High (Recoverable) |
| **STDERR_NOISE** | Python script writes to stderr but continues | `process.stderr.on('data')` logs message to `console.error`. | **Success** (Logs only) | Low (Informational) |
| **MALFORMED_JSON** | Python script outputs invalid JSON | `JSON.parse` throws error. `catch` block logs error and calls `process.kill()`. | **Rejection** with `Error: Python process exited with code null` (signal kill) | Critical (Fail-fast) |
| **TIMEOUT** | Python script hangs indefinitely | `setTimeout` triggers after 10000ms. Calls `process.kill()` to unblock queue. | **Rejection** with `Error: Timeout waiting for Python inference` | Medium (Recoverable) |
| **LOGICAL_ERROR** | Python script returns JSON with `error` field | `handleLine` detects `error` field in JSON. Rejects promise with error. | **Rejection** with `Error: <error_message>` | Medium (Application Logic) |

## Implementation Improvements (Audit Findings)

Following the audit, the following improvements were implemented to ensure operational safety:

1.  **Fail-Fast on Timeout**: Previously, a timeout merely rejected the specific request but left the Python process running (potentially in a hung state), which could block subsequent requests in the queue. The bridge now explicitly kills the process on timeout (`this.process.kill()`) to force a fresh start for the next request.
2.  **Explicit Rejection on Logic Errors**: Previously, if the Python script returned a JSON object with an `error` field (e.g., model loading failure), the bridge resolved the promise with an error object (`{ predicted_class: "error", ... }`). This silent failure risk has been eliminated by changing the bridge to explicitly **reject** the promise, ensuring the error is caught and logged by consumers (like `batchPredictMastery`).

## Recommendations

-   The current implementation is robust against process failures and hangs.
-   Consumers of `predictMastery` should always implement `try/catch` blocks (or use `batchPredictMastery` which handles it).
-   Structured logging for Python stderr is recommended for production observability.
