# Python-TypeScript Subprocess Error Propagation Matrix

This document details the handling of various failure modes in the `src/ml/inference/ml-bridge.ts` bridge.

| Failure Mode | Python Behavior | TypeScript Handling | Outcome |
|---|---|---|---|
| **Process Crash** | Exits with non-zero code (e.g., `sys.exit(1)`) | `close` event listener triggers `cleanup(error)` | **Rejected** immediately with exit code error. |
| **Hang / Timeout** | Script hangs or sleeps indefinitely | `setTimeout` (5000ms) triggers | **Rejected** after 5s with "Timeout waiting for Python inference". |
| **Malformed JSON** | Stdout contains invalid JSON (e.g., debug prints) | `JSON.parse` throws SyntaxError; `catch` block logs error and calls `this.process.kill()` | **Rejected** immediately (process killed, triggering `close` event). |
| **Stderr Output** | Writes to `sys.stderr` but continues running | `stderr` data listener logs to `console.error` | **Resolved** (Prediction succeeds if stdout is valid). |
| **Success** | Writes valid JSON to stdout | `handleLine` parses JSON and resolves promise | **Resolved** with prediction data. |

## Verification
This behavior was verified using a fault injection harness (`mock_predict.py`) that simulated each scenario.
