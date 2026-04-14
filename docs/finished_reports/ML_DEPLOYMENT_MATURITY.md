# ML Model Deployment Maturity Assessment

## Executive Summary
This report evaluates the current infrastructure's capability to support ML model versioning, A/B testing, and safe rollout strategies. The current system relies on a single-file deployment model (`mastery_model.pkl`) but has successfully implemented metadata tracking (`provenance_report.json`), improving traceability. However, it still lacks runtime version control or traffic splitting mechanisms, presenting risks for production updates.

## Current Infrastructure
-   **Model Storage:** Local filesystem (`src/ml/models/mastery_model.pkl`).
-   **Metadata:** `src/ml/models/provenance_report.json` (Git hash, script hash, data hash, metrics).
-   **Loading Mechanism:** Direct `joblib.load()` from a hardcoded path in `predict_mastery.py`.
-   **Update Strategy:** Overwrite the `.pkl` and `.json` files via Git or deployment artifact.
-   **Rollback:** Revert Git commit or restore previous file.

## Identified Gaps

### 1. Lack of Runtime Model Versioning (High)
-   **Issue:** The system only knows about "the current model". While metadata exists, there is no ability to reference a specific version (e.g., `v1.2.0`) in the API call.
-   **Risk:** Cannot easily revert to a known good state if a new model fails silently (e.g., performance regression).
-   **Recommendation:** Implement a model registry or simply versioned filenames (e.g., `mastery_model_v1.pkl`, `mastery_model_v2.pkl`) and update configuration to point to the active version.

### 2. No A/B Testing Capability (Critical)
-   **Issue:** All traffic goes to the single loaded model. No infrastructure exists to route a percentage of requests to a "challenger" model.
-   **Risk:** New models are deployed to 100% of users immediately ("Big Bang" deployment), maximizing the impact of any defects.
-   **Recommendation:** Modify `ml-bridge.ts` or the future FastAPI service to support traffic splitting (e.g., based on user ID hash) between a `champion` and `challenger` model.

### 3. Metadata Linkage (Partial Success)
-   **Status:** **Implemented.** `provenance_report.json` captures training context.
-   **Remaining Gap:** The metadata is not validated at load time. The system assumes the `.json` matches the `.pkl`.
-   **Recommendation:** Embed version ID inside the `.pkl` or verify hash on load.

### 4. Zero-Downtime Updates
-   **Issue:** Updating the model requires restarting the Python process or overwriting the file (which might cause read errors during the operation).
-   **Risk:** Brief service interruption during deployment.
-   **Recommendation:** Implement a "hot reload" endpoint or strategy where the new model is loaded into memory before switching traffic.

## Roadmap to Maturity

### Phase 1: Basic Versioning
-   Rename models to include version/date.
-   Use an environment variable `ACTIVE_MODEL_VERSION` to select the model file.

### Phase 2: Registry & Validation
-   Store models in a cloud bucket (S3/GCS) with metadata.
-   Download models at startup based on manifest.
-   Verify SHA256 of loaded model against metadata.

### Phase 3: Experimentation Infrastructure
-   Implement a feature flag system or experimentation service.
-   Route requests to specific model versions based on experiment groups.
-   Track metrics (latency, accuracy) per model version.

## Maturity Score: 2/5 (Repeatable)
The system has basic repeatability (provenance tracking) but lacks the operational controls (versioning, A/B testing) required for a mature ML production environment.
