# Microservice Migration Readiness Report: ML Inference Layer

## 1. Executive Summary
This report assesses the readiness of the current ML inference layer to migrate from a subprocess-based architecture to a FastAPI microservice. The assessment is based on an analysis of `src/ml/inference/api.py` (FastAPI implementation) and `src/ml/inference/ml-bridge.ts` (Node.js client).

**Current Status:** PARTIALLY READY
The core API logic is implemented in `api.py` and the client (`ml-bridge.ts`) supports HTTP fallback. However, critical production requirements such as authentication, deployment configuration, and rigorous testing are missing.

## 2. Architecture Gap Analysis

### 2.1 API Implementation (`src/ml/inference/api.py`)
*   **Strengths:**
    *   **FastAPI Framework:** Correctly utilizes `FastAPI`, `Pydantic`, and `Uvicorn` for high-performance async handling.
    *   **Serialization:** Uses `Pydantic` models (`MasteryPredictionInput`, `MasteryPredictionOutput`) for strict request/response validation.
    *   **Startup Logic:** Implements `@app.on_event("startup")` to load the ML model once into memory, preventing reloading per request.
    *   **Health Check:** Includes a `/health` endpoint for monitoring.
    *   **CORS:** Configured for local development (`localhost:3000`).

*   **Weaknesses / Gaps:**
    *   **Authentication:** The API is completely open. No API key, JWT validation, or other auth mechanism is implemented. In a microservice architecture, this exposes the model to unauthorized access.
    *   **Error Handling:** Basic `try-except` block returns 500 errors but lacks detailed logging or specific error codes for known failure modes (e.g., malformed input vs model error).
    *   **Concurrency:** While FastAPI is async, `joblib.load` and `model.predict_proba` are synchronous CPU-bound operations. High load could block the event loop.

### 2.2 Client Integration (`src/ml/inference/ml-bridge.ts`)
*   **Strengths:**
    *   **Hybrid Approach:** The `predictMastery` function attempts to call the API first (`fetch(API_URL)`), falling back to the subprocess if it fails. This allows for a gradual rollout.
    *   **Configuration:** Uses `process.env.ML_API_URL` for flexibility.

*   **Weaknesses:**
    *   **Timeout:** Hardcoded 1s timeout for API calls might be too aggressive for cold starts or network latency in production.
    *   **Security:** Does not send any authentication headers to the API.

### 2.3 Deployment & Infrastructure
*   **Missing Artifacts:**
    *   **Dockerfile:** No `Dockerfile` exists to containerize the FastAPI application.
    *   **Dependency Management:** Python dependencies are not pinned in a `requirements.txt` specifically for the service (only a generic one exists in `src/ml/training`).
    *   **Process Management:** No configuration for a production server (e.g., Gunicorn with Uvicorn workers) to handle multiple concurrent requests effectively.

## 3. Migration Roadmap

To achieve full production readiness, the following steps are required:

1.  **Security Hardening:**
    *   Implement API Key authentication in `api.py` (e.g., using `fastapi.security.APIKeyHeader`).
    *   Update `ml-bridge.ts` to send the API key in headers.

2.  **Containerization:**
    *   Create a `Dockerfile` in `src/ml/inference/` that installs dependencies and runs the Uvicorn server.
    *   Create a `docker-compose.yml` (or update existing) to orchestrate the ML service alongside the Next.js app.

3.  **Performance Optimization:**
    *   Offload model prediction to a thread pool (using `fastapi.concurrency.run_in_threadpool`) if latency becomes an issue under load.
    *   Configure Gunicorn as a process manager for Uvicorn.

4.  **Observability:**
    *   Add structured logging (JSON format) to the Python service.
    *   Integrate with a monitoring tool (e.g., Prometheus) to track request latency and error rates.

## 4. Conclusion
The codebase is approximately **60% ready** for migration. The logical implementation is complete, but the infrastructure and security layers required for a robust microservice are absent. The recommended path is to first containerize the existing `api.py`, add authentication, and then update the deployment pipeline.
