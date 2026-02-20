# ML Model Deployment Maturity Assessment

## Executive Summary
The current model deployment strategy is rudimentary, relying on manual file placement (`mastery_model.pkl`) and a single active model instance. This lacks the safety mechanisms required for production reliability, such as version control, automated rollback, and A/B testing capabilities.

## Maturity Level: Initial / Ad-hoc

### 1. Model Versioning
- **Current State**:
  - Single file: `src/ml/models/mastery_model.pkl`.
  - No versioning scheme (semantic or hash-based) in filenames.
  - Updates overwrite the existing file.
- **Risk**:
  - High. Overwriting a model with a regressed version requires manual restoration from backup (if one exists).
  - No traceability of which model version produced a specific prediction.

### 2. A/B Testing Capabilities
- **Current State**:
  - `ml-bridge.ts` spawns a single Python process running `predict_mastery.py`.
  - All user traffic goes to this single instance.
- **Gap**:
  - No traffic splitting logic (e.g., "Route 10% of users to Model B").
  - No experimentation framework to compare model metrics (e.g., "Model B has 5% higher conversion").

### 3. Rollback & Safety
- **Current State**:
  - Rollback involves manually replacing the `.pkl` file and restarting the Node.js server (to respawn the python process).
- **Gap**:
  - No automated rollback trigger based on error rates or latency.
  - No "Blue/Green" deployment support.

## Recommendations for Improvement

### Short Term (Fixing the Basics)
1.  **Implement Versioned Filenames**:
    -   Rename models to include version/date: `mastery_model_v1.0.0_20231027.pkl`.
    -   Update `ml-bridge.ts` to accept a `model_version` configuration or environment variable.
2.  **Metadata Tracking**:
    -   Create a `model_manifest.json` alongside the `.pkl` files to store metadata (training date, accuracy metrics, author).

### Medium Term (Enabling Experimentation)
3.  **Traffic Splitting in Bridge**:
    -   Modify `ml-bridge.ts` to spawn *two* python processes (e.g., "Primary" and "Candidate").
    -   Implement a hashing function (e.g., `hash(userId) % 100`) to route a percentage of traffic to the Candidate model.
    -   Log the `model_version` used in the prediction output for analysis.

### Long Term (Production Grade)
4.  **Model Registry**:
    -   Use a dedicated artifact store (e.g., MLflow, S3) instead of committing large `.pkl` files to Git.
5.  **Shadow Mode**:
    -   Send traffic to both models asynchronously, return the Primary's result to the user, and log the Candidate's result for offline comparison.
