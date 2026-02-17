# FastAPI Microservice Migration Readiness Assessment

## Executive Summary
This report assesses the readiness of the current ML inference layer (`src/ml/inference/`) for migration to a scalable FastAPI microservice architecture. The current implementation relies on a Node.js subprocess bridge (`ml-bridge.ts`) communicating with a Python script (`predict_mastery.py`) via standard I/O streams. While functional for low loads, this architecture lacks the scalability, observability, and robustness required for production.

## Current Architecture
-   **Bridge:** `src/ml/inference/ml-bridge.ts` spawns a persistent Python process.
-   **Communication:** JSON payloads over `stdin`/`stdout`.
-   **Model Loading:** Global variable `model` in `predict_mastery.py`, loaded on script start.
-   **Concurrency:** Synchronous processing loop; single request at a time per process.

## Migration Gaps & Blockers

### 1. Request Schema Definition (Critical)
-   **Current:** Raw `json.loads(line)` with manual key access.
-   **Gap:** FastAPI requires Pydantic models (`BaseModel`) for strict request/response validation and automatic documentation (Swagger UI).
-   **Action:** Define `MasteryPredictionInput` and `MasteryPredictionOutput` using Pydantic.

### 2. Application Structure
-   **Current:** A simple script with a `while` loop reading `sys.stdin`.
-   **Gap:** No ASGI application instance (`app = FastAPI()`).
-   **Action:** Refactor `predict_mastery.py` to expose an API endpoint (e.g., `@app.post("/predict/mastery")`).

### 3. Model Lifecycle Management
-   **Current:** Model is loaded at the module level when the script runs.
-   **Gap:** FastAPI best practices suggest using Lifespan Events (`@asynccontextmanager`) to load models during startup and handle cleanup.
-   **Action:** Implement a lifespan context manager to load `mastery_model.pkl`.

### 4. Concurrency & Performance
-   **Current:** Blocking synchronous execution.
-   **Gap:** While `scikit-learn`'s `predict` is CPU-bound and synchronous, the API handler should be defined as `def` (not `async def`) to run in a threadpool, preventing the event loop from blocking, OR use `async def` if the model call is wrapped in `run_in_threadpool`.
-   **Action:** Configure the endpoint for optimal concurrency.

### 5. Error Handling & Logging
-   **Current:** `sys.stderr` for errors, custom JSON error fields.
-   **Gap:** HTTP standard error responses (400, 500) are missing.
-   **Action:** Implement `HTTPException` handling and structured logging.

### 6. Client-Side Update
-   **Current:** `ml-bridge.ts` has a fallback to `fetch(API_URL)`, but defaults to subprocess if it fails.
-   **Gap:** The primary logic is still heavily coupled to the subprocess lifecycle.
-   **Action:** Update `ml-bridge.ts` to treat the HTTP service as the primary source and potentially remove the subprocess logic entirely once the service is reliable.

## Migration Plan

1.  **Phase 1: API Implementation**
    -   Create `src/ml/api.py` (or modify `inference/api.py` if it exists).
    -   Define Pydantic models.
    -   Implement the FastAPI app and `/predict` endpoint.
    -   Add Dockerfile for the ML service.

2.  **Phase 2: Testing & Validation**
    -   Unit tests for the API using `TestClient`.
    -   Load testing to compare throughput vs. subprocess.

3.  **Phase 3: Integration**
    -   Deploy the FastAPI service.
    -   Update `ML_API_URL` environment variable.
    -   Deprecate the subprocess logic in `ml-bridge.ts`.

## Readiness Score: 4/10
The core logic (feature extraction, prediction) is ready, but the wrapping infrastructure needs a complete rewrite to support the microservice pattern.
