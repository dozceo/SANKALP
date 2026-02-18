# ML Model Versioning & Deployment Maturity Assessment

## Executive Summary
The current ML deployment infrastructure is at **Level 1 (Initial)** maturity. It relies on a single binary artifact (`mastery_model.pkl`) that is overwritten during deployment. This creates significant risks for reliability and prevents data-driven model improvements (A/B testing).

To support safe model rollouts and experimentation, the infrastructure must be upgraded to support **Multi-Model Versioning** and **Traffic Routing**.

## Current State Analysis

| Component | Status | Description | Risk |
| :--- | :--- | :--- | :--- |
| **Model Registry** | ❌ Missing | No central tracking of model versions, metrics, or lineage. | High - Cannot reproduce past results. |
| **Versioning** | ❌ Missing | Hardcoded path: `../models/mastery_model.pkl`. | Critical - Overwrites previous version. |
| **Rollout Strategy** | ⚠️ Big Bang | Immediate cutover for all users. | High - Bugs affect 100% of traffic instantly. |
| **Rollback** | ⚠️ Manual | Requires re-running training or restoring backup. | Medium - Slow recovery time (RTO). |
| **A/B Testing** | ❌ Impossible | Infrastructure supports only one active model. | High - Cannot validate improvements safely. |

## Critical Gaps

### 1. Single Point of Failure (Artifact Overwrite)
The deployment script likely does `cp new_model.pkl mastery_model.pkl`.
-   **Risk:** If the new model is corrupt or performs poorly, there is no immediate fallback.
-   **Impact:** Downtime or degradation of service until manual intervention.

### 2. Lack of Experimentation Capabilities
We cannot run a "Challenger" model against the "Champion" model.
-   **Impact:** We are flying blind on model updates. We rely on offline metrics (accuracy on test set) rather than online business metrics (user engagement, learning efficacy).

### 3. Missing Metadata
There is no automated link between the `.pkl` file and the code/data used to train it.
-   **Risk:** "It works on my machine" syndrome.
-   **Impact:** Compliance and debugging nightmares.

## Recommendations

### Phase 1: Directory-Based Versioning (Immediate)
Change the model loading logic to support a directory structure:
```
models/
  ├── v1/
  │   ├── model.pkl
  │   └── metadata.json
  ├── v2/
  │   ├── model.pkl
  │   └── metadata.json
  └── production -> v1 (symlink or config)
```
**Action:** Update `predict_mastery.py` to read `MODEL_VERSION` env var.

### Phase 2: Traffic Routing (Short Term)
Implement a simple router in the inference service (or `ml-bridge.ts`):
-   90% traffic -> `v1` (Champion)
-   10% traffic -> `v2` (Challenger)

**Action:** Add `ab_test_group` to user context and pass to inference layer.

### Phase 3: Model Registry (Long Term)
Use a tool like MLflow or a simple S3/GCS bucket with versioning enabled to store artifacts and metadata.

## Maturity Score: 1/5
**Goal:** Reach Level 3 (Automated Rollouts & A/B Testing) within 3 months.
