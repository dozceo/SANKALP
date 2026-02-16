# Model Deployment Maturity Assessment: ML Versioning & Rollout

## 1. Executive Summary
This report evaluates the current infrastructure for deploying, versioning, and updating ML models (Topic Mastery, Forgetting Curve, Attention Risk). The assessment reveals a **low maturity level**, with significant gaps in model version control, safe rollout capabilities (A/B testing), and rollback mechanisms.

**Current State:**
*   **Model Loading:** Hardcoded file paths (`src/ml/models/mastery_model.pkl`).
*   **Versioning:** Manual file replacement. No version history or registry.
*   **Rollout Strategy:** "Big Bang" deployment (replace file, restart service).

## 2. Infrastructure Gap Analysis

### 2.1 Model Versioning (`src/ml/inference/predict_mastery.py`, `src/ml/inference/api.py`)
*   **Issue:** Both the subprocess script and the API server load the model from a static path:
    ```python
    MODEL_PATH = os.path.join(os.path.dirname(__file__), "../models/mastery_model.pkl")
    ```
*   **Impact:**
    *   **No traceability:** Cannot determine which version of the model generated a specific prediction.
    *   **High risk:** Deploying a new model requires overwriting the existing file. If the new model is buggy, rollback is manual and error-prone.
    *   **Conflict:** Multiple developers working on different model iterations will overwrite each other's work if they commit to the repo.

### 2.2 Rollout & Testing Capabilities
*   **Issue:** The system lacks infrastructure for A/B testing or canary releases.
    *   **No Request Routing:** All requests go to the single loaded model instance. There is no mechanism to route x% of traffic to a "candidate" model.
    *   **No Shadow Mode:** Cannot run a new model in parallel with the production model to compare outputs without affecting user experience.

### 2.3 Model Registry & Metadata
*   **Issue:** Models are treated as binary blobs in the source code repository.
    *   **Git LFS:** It is unclear if Git LFS is used, potentially bloating the repo.
    *   **Metadata Missing:** No accompanying metadata (accuracy, training date, hyperparameters) is stored with the model artifact.

## 3. Maturity Assessment Score
| Dimension | Score (1-5) | Justification |
| :--- | :--- | :--- |
| **Reproducibility** | 2 | Training scripts exist, but no strict versioning of data/code/model linkage. |
| **Deployment Safety** | 1 | Manual file replacement; no automated rollback or health checks. |
| **Observability** | 1 | Basic logging only; no model drift detection or performance monitoring. |
| **Scalability** | 2 | Single instance; hard to scale model serving independently. |

## 4. Recommendations for Improvement

### Short-Term (Quick Wins)
1.  **Environment Variable Configuration:**
    *   Update `predict_mastery.py` and `api.py` to read `MODEL_PATH` from an environment variable (`ML_MODEL_PATH`). This allows pointing to different model files without code changes.
2.  **Filename Versioning:**
    *   Adopt a naming convention: `mastery_model_v1.0.0.pkl`, `mastery_model_v1.1.0.pkl`.
    *   Update deployment scripts to symlink `mastery_model.pkl` to the active version.

### Mid-Term (Strategic)
1.  **Model Registry (MLflow/S3):**
    *   Store model artifacts in an external object store (e.g., S3, GCS) instead of the Git repo.
    *   Use a lightweight registry (like MLflow) to track versions and metrics.
2.  **A/B Testing Framework:**
    *   Implement a "Router" component in `ml-bridge.ts` or `api.py` that can direct traffic to different model versions based on user ID or random sampling.
    *   Log prediction inputs/outputs with a `model_version` tag for analysis.

## 5. Conclusion
The current setup is suitable for early-stage development but poses significant risks for a production environment. Prioritizing **external model storage** and **configurable model paths** is essential to enable safe, incremental improvements to the ML capabilities.
