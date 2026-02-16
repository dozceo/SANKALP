# ML Model Deployment Maturity Assessment

## Executive Summary
This report evaluates the current infrastructure's capability to support ML model versioning, A/B testing, and safe rollout strategies. The current system relies on a single-file deployment model (`mastery_model.pkl`) with no built-in version control or traffic splitting mechanisms, presenting significant risks for production updates.

## Current Infrastructure
-   **Model Storage:** Local filesystem (`src/ml/models/mastery_model.pkl`).
-   **Loading Mechanism:** Direct `joblib.load()` from a hardcoded path in `predict_mastery.py`.
-   **Update Strategy:** Overwrite the `.pkl` file via Git or deployment artifact.
-   **Rollback:** Revert Git commit or restore previous file.

## Identified Gaps

### 1. Lack of Model Versioning (Critical)
-   **Issue:** The system only knows about "the current model". There is no history of past models or ability to reference a specific version (e.g., `v1.2.0`).
-   **Risk:** Cannot easily revert to a known good state if a new model fails silently (e.g., performance regression).
-   **Recommendation:** Implement a model registry or simply versioned filenames (e.g., `mastery_model_v1.pkl`, `mastery_model_v2.pkl`) and update configuration to point to the active version.

### 2. No A/B Testing Capability
-   **Issue:** All traffic goes to the single loaded model. No infrastructure exists to route a percentage of requests to a "challenger" model.
-   **Risk:** New models are deployed to 100% of users immediately ("Big Bang" deployment), maximizing the impact of any defects.
-   **Recommendation:** Modify `ml-bridge.ts` or the future FastAPI service to support traffic splitting (e.g., based on user ID hash) between a `champion` and `challenger` model.

### 3. Missing Metadata & Provenance
-   **Issue:** The `.pkl` file is a black box. No metadata links it to the training data, hyperparameters, or training code version used to create it.
-   **Risk:** Debugging production issues is difficult without knowing exactly how the model was built.
-   **Recommendation:** Save a companion `metadata.json` with each model (e.g., training date, accuracy metrics, git commit SHA).

### 4. Zero-Downtime Updates
-   **Issue:** Updating the model requires restarting the Python process or overwriting the file (which might cause read errors during the operation).
-   **Risk:** Brief service interruption during deployment.
-   **Recommendation:** Implement a "hot reload" endpoint or strategy where the new model is loaded into memory before switching traffic.

## Roadmap to Maturity

### Phase 1: Basic Versioning
-   Rename models to include version/date.
-   Use an environment variable `ACTIVE_MODEL_VERSION` to select the model file.

### Phase 2: Metadata & Registry
-   Store models in a cloud bucket (S3/GCS) with metadata.
-   Download models at startup based on manifest.

### Phase 3: Experimentation Infrastructure
-   Implement a feature flag system or experimentation service.
-   Route requests to specific model versions based on experiment groups.
-   Track metrics (latency, accuracy) per model version.

## Maturity Score: 1/5 (Ad-hoc)
The current setup is suitable for a prototype but inadequate for a production system requiring reliability and continuous improvement.
