# Documentation Synchronization Report

## 1. Staleness Audit

| File | Claim | Reality | Status |
|---|---|---|---|
| `./ml_model_integration.md` | File: `src/ml/inference/predict_your_task.py` | File not found | **Broken Link** |
| `./ml_model_integration.md` | File: `src/ml/models/your_model_name.pkl` | File not found | **Broken Link** |
| `./DATABASE.md` | File: `src/lib/db.ts` | File not found | **Broken Link** |
| `./CACHING_STRATEGY_PROPOSAL.md` | Endpoint: `/api/syllabus/generate` | Route not found in `src/app/api` | **Missing Endpoint** |
| `./CACHING_STRATEGY_PROPOSAL.md` | Endpoint: `/api/quiz/generate` | Route not found in `src/app/api` | **Missing Endpoint** |
| `./README.md` | File: `src/ml/models/mastery_model.pk` | Did you mean `src/ml/models/mastery_model.pkl`? | **Broken Link** |
| `./PRE_ROLLOUT_CHECKLIST.md` | File: `src/middleware.ts` | File not found | **Broken Link** |
| `./debug.md` | Endpoint: `/api/users/` | Route not found in `src/app/api` | **Missing Endpoint** |
| `./debug.md` | Endpoint: `/api/users/undefined` | Route not found in `src/app/api` | **Missing Endpoint** |
| `./BUNDLE_SIZE_REPORT.md` | Endpoint: `/api/users/` | Route not found in `src/app/api` | **Missing Endpoint** |
| `./env_var_security_report.md` | File: `src/env.mjs` | File not found | **Broken Link** |
| `./SESSION_PERSISTENCE_REPORT.md` | File: `src/hooks/use-local-storage.ts` | File not found | **Broken Link** |
| `./FASTAPI_MIGRATION_READINESS.md` | File: `src/ml/api.py` | File not found | **Broken Link** |
| `./tutorial.md` | File: `src/app/api/teacher/analytics/route.ts` | File not found | **Broken Link** |
| `./tutorial.md` | File: `src/ml/inference/predict_forgetting.py` | File not found | **Broken Link** |
| `./tutorial.md` | File: `src/ml/training/train_forgetting_model.py` | File not found | **Broken Link** |
| `./tutorial.md` | Endpoint: `/api/teacher/analytics/route.ts` | Route not found in `src/app/api` | **Missing Endpoint** |
| `./ARCHITECTURE.md` | File: `src/app/api/quiz/new-type/route.ts` | File not found | **Broken Link** |
| `./ARCHITECTURE.md` | File: `src/components/quiz/NewQuizType.tsx` | File not found | **Broken Link** |
| `./ARCHITECTURE.md` | File: `src/ai/flows/new-quiz-generator.ts` | File not found | **Broken Link** |
| `./ARCHITECTURE.md` | Endpoint: `/api/quiz/new-type/route.ts` | Route not found in `src/app/api` | **Missing Endpoint** |
| `./docs/Development Status.md` | Endpoint: `/api/users/` | Route not found in `src/app/api` | **Missing Endpoint** |
| `./docs/API Documentation.md` | Endpoint: `/api/users/` | Route not found in `src/app/api` | **Missing Endpoint** |
| `./docs/Architecture Map.md` | Endpoint: `/api/users/` | Route not found in `src/app/api` | **Missing Endpoint** |

## 2. Update Proposals (Patches)

- File: `./README.md`
- Replace `src/ml/models/mastery_model.pk` with `src/ml/models/mastery_model.pkl`

## 3. Broken Reference Inventory

| File | Referenced Path | Status |
|---|---|---|
| `./ml_model_integration.md` | `src/ml/inference/predict_your_task.py` | **Missing** |
| `./ml_model_integration.md` | `src/ml/models/your_model_name.pkl` | **Missing** |
| `./DATABASE.md` | `src/lib/db.ts` | **Missing** |
| `./README.md` | `src/ml/models/mastery_model.pk` | **Missing** |
| `./PRE_ROLLOUT_CHECKLIST.md` | `src/middleware.ts` | **Missing** |
| `./env_var_security_report.md` | `src/env.mjs` | **Missing** |
| `./SESSION_PERSISTENCE_REPORT.md` | `src/hooks/use-local-storage.ts` | **Missing** |
| `./FASTAPI_MIGRATION_READINESS.md` | `src/ml/api.py` | **Missing** |
| `./tutorial.md` | `src/app/api/teacher/analytics/route.ts` | **Missing** |
| `./tutorial.md` | `src/ml/inference/predict_forgetting.py` | **Missing** |
| `./tutorial.md` | `src/ml/training/train_forgetting_model.py` | **Missing** |
| `./ARCHITECTURE.md` | `src/app/api/quiz/new-type/route.ts` | **Missing** |
| `./ARCHITECTURE.md` | `src/components/quiz/NewQuizType.tsx` | **Missing** |
| `./ARCHITECTURE.md` | `src/ai/flows/new-quiz-generator.ts` | **Missing** |