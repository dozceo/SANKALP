# FastAPI Microservice Migration Readiness Assessment

## Executive Summary
The current ML inference architecture relies on a persistent Python subprocess (`predict_mastery.py`) communicating with the Node.js backend via standard input/output (stdin/stdout). While functional for low-load scenarios, this architecture presents significant bottlenecks for scalability, observability, and maintainability.

Migration to a FastAPI-based microservice is **High Priority** to enable horizontal scaling and robust error handling.

## Gap Analysis

| Feature | Current State (Subprocess) | Target State (FastAPI) | Gap Severity |
| :--- | :--- | :--- | :--- |
| **Communication** | IPC via Stdin/Stdout (JSON Lines) | HTTP/REST (JSON) | 🔴 Critical |
| **Concurrency** | Single Process (GIL Limited) | Async Workers (Uvicorn) | 🔴 Critical |
| **Serialization** | Manual `json.loads` / `json.dumps` | Pydantic Models (Validation) | 🟠 High |
| **Error Handling** | Stderr parsing / Process Exit Codes | HTTP Status Codes (4xx, 5xx) | 🟠 High |
| **Security** | None (Local Process) | API Key / JWT Authentication | 🟠 High |
| **Observability** | Console logs | Structured Logging / Metrics (Prometheus) | 🟡 Medium |
| **State Management** | Global `model` variable | Global `app.state.model` (Lifespan Events) | 🟢 Low |

## Architectural Blockers

### 1. Synchronous Blocking Logic
The current `predict_mastery.py` script uses a synchronous `sys.stdin` loop.
- **Problem:** Blocks the event loop.
- **Solution:** Rewrite as `async def predict(...)` endpoints.

### 2. Manual Serialization
The script manually parses JSON and constructs dictionaries.
- **Risk:** Brittle to schema changes. No validation of input types (e.g., ensuring `avg_quiz_score` is a float).
- **Solution:** Define Pydantic models:
  ```python
  class MasteryInput(BaseModel):
      avg_quiz_score: float
      attempts_per_topic: int
      ...
  ```

### 3. Lack of Authentication
The current script trusts all input because it runs locally.
- **Risk:** Exposing this as a service without auth would be a security vulnerability.
- **Solution:** Implement `APIKeyHeader` dependency in FastAPI.

## Migration Steps

1.  **Dependency Update:** Add `fastapi`, `uvicorn`, `pydantic` to `requirements.txt`.
2.  **Code Restructuring:**
    -   Extract `load_model` and `predict_mastery` logic into a separate `inference_engine.py` module.
    -   Create `main.py` for the FastAPI app.
3.  **API Definition:**
    -   `POST /predict/mastery`: Single prediction.
    -   `POST /predict/mastery/batch`: Batch prediction.
    -   `GET /health`: Health check.
4.  **Client Update:**
    -   Refactor `src/ml/inference/ml-bridge.ts` to use `fetch` exclusively (remove `spawn`).
    -   Remove `PythonBridge` class and circuit breaker fallback to subprocess.

## Impact Assessment
- **Reliability:** Improves by isolating ML crashes from the main Node.js process.
- **Scalability:** Allows deploying ML service on GPU-optimized nodes independent of the Next.js app.
- **Latency:** Slight increase in per-request overhead (HTTP vs IPC) but vastly improved throughput under load.
