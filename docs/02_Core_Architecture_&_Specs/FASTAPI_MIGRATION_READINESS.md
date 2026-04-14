# FastAPI Microservice Migration Readiness Assessment

## Executive Summary
This report assesses the readiness of the current Python inference layer (`src/ml/inference/predict_mastery.py`) for migration to a standalone FastAPI microservice. The current architecture uses a Node.js-managed subprocess with stdin/stdout communication, which is suitable for development but limits scalability and observability in production.

## Current Architecture
-   **Transport:** Standard Input/Output (JSON Lines).
-   **Orchestrator:** `src/ml/inference/ml-bridge.ts` (Node.js).
-   **Runtime:** Single persistent Python process.
-   **Serialization:** Manual `json.loads` / `json.dumps`.

## Migration Gap Analysis

### 1. Transport Layer (Protocol Shift)
-   **Current:** `ml-bridge.ts` writes newline-delimited JSON to the Python process `stdin`.
-   **Target:** HTTP/1.1 or HTTP/2 over REST.
-   **Gap:** Need to replace the `while sys.stdin:` loop with FastAPI route handlers.
-   **Action:**
    -   Install `fastapi` and `uvicorn`.
    -   Define `app = FastAPI()`.
    -   Create `@app.post("/predict/mastery")` endpoint.

### 2. Data Serialization & Validation
-   **Current:** Manual dictionary access (e.g., `features['avg_quiz_score']`). No strict type checking on the Python side (relies on Typescript safety upstream).
-   **Target:** Pydantic models.
-   **Gap:** Missing schema definitions in Python.
-   **Action:** Define Pydantic models:
    ```python
    class MasteryFeatures(BaseModel):
        avg_quiz_score: float
        attempts_per_topic: int
        days_since_last_revision: int
        quiz_score_variance: float
        time_spent_per_question: float

    class MasteryResponse(BaseModel):
        mastery_probability: float
        confidence: float
        predicted_class: str
    ```

### 3. Concurrency & Performance
-   **Current:** Single-threaded, blocking processing of each line.
-   **Target:** Asynchronous request handling.
-   **Gap:** The `predict_proba` method of Scikit-Learn is CPU-bound and blocking.
-   **Action:**
    -   Use `async def` for route handlers.
    -   Run blocking inference in a threadpool (FastAPI does this automatically for `def` endpoints, but explicit `run_in_executor` is better for control).
    -   Configure Uvicorn workers for parallelism.

### 4. Lifecycle Management
-   **Current:** `if __name__ == "__main__": load_model()` loads the model on script start.
-   **Target:** Lifespan events.
-   **Gap:** Need to ensure model is loaded once during application startup, not per request.
-   **Action:** Use FastAPI lifespan context manager:
    ```python
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        global model
        model = load_model()
        yield
        # cleanup
    ```

### 5. Security & Authentication
-   **Current:** Implicit trust (subprocess of the main application).
-   **Target:** Network boundary security.
-   **Gap:** No authentication mechanism.
-   **Action:** Implement API Key validation or JWT middleware if the service is deployed separately from the Next.js backend.

### 6. Dependency Management
-   **Current:** Relies on global environment or `venv`.
-   **Target:** Containerized environment.
-   **Gap:** Need `Dockerfile` and `requirements.txt` specific to the service.

## Recommendation
The migration is Low Risk / High Reward. The core inference logic (`predict_mastery` function) is already isolated and pure. The main effort is wrapping it in the FastAPI boilerplate and updating the `ml-bridge.ts` to call an HTTP URL instead of spawning a process.

**Readiness Score:** **High** (Core logic is ready, only wrapper code needed).
