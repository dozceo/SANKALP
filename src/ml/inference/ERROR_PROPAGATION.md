# Python-TypeScript Subprocess Error Propagation Audit

This document details the handling of errors in the communication bridge between the Node.js application (`src/ml/inference/ml-bridge.ts`) and the Python inference script (`src/ml/inference/predict_mastery.py`).

## Error Propagation Matrix

The following matrix maps failure modes simulated in the Python subprocess to the corresponding behavior in the TypeScript bridge.

| Failure Mode | Description | TypeScript Behavior | Outcome | Severity |
| :--- | :--- | :--- | :--- | :--- |
| **NORMAL** | Standard operation | Parses JSON, resolves promise | **Success** | Low |
| **STARTUP_CRASH** | Python script exits immediately (e.g., ImportError) | `process.on('close')` fires with non-zero code. `cleanup` rejects pending requests. | **Rejection** with `Error: Python process exited with code 1` | High (Recoverable) |
| **PROCESS_CRASH** | Python script exits during processing (e.g., Segfault) | `process.on('close')` fires with non-zero code. `cleanup` rejects pending requests. | **Rejection** with `Error: Python process exited with code 1` | High (Recoverable) |
| **STDERR_NOISE** | Python script writes to stderr but continues | `process.stderr.on('data')` logs message to `console.error`. | **Success** (Logs only) | Low (Informational) |
| **MALFORMED_JSON** | Python script outputs invalid JSON | `JSON.parse` throws error. `catch` block logs error and calls `process.kill()`. | **Rejection** with `Error: Python process exited with code null` (signal kill) | Critical (Fail-fast) |
| **TIMEOUT** | Python script hangs indefinitely | `setTimeout` triggers after 5000ms. | **Rejection** with `Error: Timeout waiting for Python inference` | Medium (Degraded) |
| **LOGICAL_ERROR** | Python script returns JSON with `error` field | `handleLine` detects `error` field in JSON. Resolves promise with error object. | **Resolution** with `{ predicted_class: "error", error: "..." }` | Medium (Application Logic) |

## Implementation Notes

1.  **Fail-Fast on Protocol Errors**: When the Python script outputs malformed JSON, the bridge deliberately kills the process. This is a safety mechanism to prevent state corruption (e.g., desynchronization of request/response pairs if `_id` cannot be parsed).
2.  **Request Isolation**: Each request is tracked via a UUID (`_id`). If the process crashes or is killed, all pending requests are rejected immediately.
3.  **Timeout Protection**: A strict 5000ms timeout prevents the Node.js event loop from hanging on unresponsive Python processes.
4.  **Logging**: All stderr output from Python is piped to Node.js `console.error`, ensuring visibility into Python-side warnings and errors.

## Recommendations

-   The current implementation is robust against process failures.
-   Consider structured logging for Python stderr to differentiate between warnings (e.g., DeprecationWarning) and critical errors.
-   The "Python process exited with code null" error for malformed JSON is technically correct (signal kill) but could be more descriptive if the bridge stored the last error before killing.
