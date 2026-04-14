# FastAPI Microservice Migration Readiness Assessment

## Executive Summary
The current ML inference architecture relies on a persistent Python subprocess spawned by Node.js, communicating via standard I/O. While efficient for low throughput, this architecture scales poorly and couples the application server to the ML runtime. This report assesses the gaps and steps required to migrate to a FastAPI-based microservice.

## Current Architecture Analysis
- **Mechanism**: `child_process.spawn("python", ["-u", ...])`
- **Communication**: JSON over Stdin/Stdout.
- **State**: Persistent process (Model loaded once).
- **Concurrency**: Single-process (Node.js handles concurrency via queue/promises, but Python side is serial unless multi-threaded).
- **Error Handling**: Basic process exit monitoring and timeout logic in `ml-bridge.ts`.

## Migration Gap Analysis

### 1. Asynchronous Execution Model
- **Current**: `predict_mastery.py` likely runs synchronously, blocking the single process for each prediction.
- **Target**: FastAPI runs asynchronously.
- **Gap**: The inference logic must be non-blocking or offloaded to a thread pool (FastAPI does this automatically for `def` endpoints, but `async def` requires non-blocking I/O).
- **Action**: Wrap model inference in `run_in_threadpool` or ensure the model library (scikit-learn) releases the GIL where possible.

### 2. Data Serialization & Validation
- **Current**: Manual `JSON.parse` and `JSON.stringify` in `ml-bridge.ts`. No strict schema enforcement on the Python side.
- **Target**: Pydantic models in FastAPI.
- **Gap**: Need to define Pydantic models matching `MasteryPredictionInput` and `MasteryPredictionOutput` types in `src/ml/inference/types.ts`.
- **Action**: Create `schemas.py` in the ML service with Pydantic definitions.

### 3. State Management & Model Loading
- **Current**: Model loaded globally on script start.
- **Target**: Model loaded during application startup (Lifespan events).
- **Gap**: Need to implement FastAPI Lifespan context manager to load `mastery_model.pkl` once and share it across requests.
- **Action**: Use `@asynccontextmanager` for model loading.

### 4. Authentication & Security
- **Current**: Implicit trust (same machine, subprocess).
- **Target**: HTTP API accessible over network.
- **Gap**: No authentication mechanism.
- **Action**: Implement API Key validation (e.g., `X-API-Key` header) or internal network isolation (e.g., Kubernetes service discovery).

### 5. Deployment & Scalability
- **Current**: Scales with the Next.js server instance. Heavy ML models bloat the web server memory.
- **Target**: Independent scaling.
- **Gap**: Need Dockerfile for the Python service and orchestration (Docker Compose / K8s).
- **Action**: Create `Dockerfile.ml` and update `docker-compose.yml`.

## Recommended Migration Plan

1.  **Phase 1: Dual-Stack**: Deploy FastAPI service alongside the subprocess.
    -   Update `ml-bridge.ts` to prefer the HTTP endpoint (already partially implemented with `API_URL`).
2.  **Phase 2: Traffic Shifting**: Gradually increase traffic to the HTTP endpoint using the Circuit Breaker logic.
3.  **Phase 3: Deprecation**: Remove the subprocess logic from `ml-bridge.ts`.

## Risk Assessment
- **Latency**: HTTP overhead (10-50ms) vs Stdin/Stdout (<1ms). For real-time typing prediction, this might be noticeable.
- **Solution**: Keep persistent connection (Keep-Alive) or use gRPC for ultra-low latency requirements.
