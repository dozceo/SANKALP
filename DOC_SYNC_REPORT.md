# Documentation Synchronization Report

Generated on: 2026-02-18T18:19:28.449Z

## Documentation Debt Metric: 104 Issues

Trend: 🔴 High Debt

## 1. Staleness Audit (Status & Claims)

| File | Issue | Severity | Context |
|---|---|---|---|
| `DATABASE.md` | Feature "`src/components/LearningStateCard.tsx` - No mock data, uses API" marked as [ ] (pending), but potential implementation found: `src/data/mock_quiz_generations.json`... | medium | `- [ ] `src/components/LearningStateCard.tsx` - No ...` |
| `DATABASE.md` | Feature "`src/components/TopicMasteryGrid.tsx` - No mock data, uses API" marked as [ ] (pending), but potential implementation found: `src/data/mock_quiz_generations.json`... | medium | `- [ ] `src/components/TopicMasteryGrid.tsx` - No m...` |
| `ML_QUICKSTART.md` | Feature "Inference script returns valid JSON" marked as [ ] (pending), but potential implementation found: `scripts/audit-flow-validation.ts`... | medium | `- [ ] Inference script returns valid JSON...` |
| `ML_SETUP_GUIDE.md` | Python script `-m` not found. | medium | `python -m pip install -r src\ml\training\requireme...` |
| `ML_SETUP_GUIDE.md` | Python script `-m` not found. | medium | `python -m pip install fastapi uvicorn...` |
| `PRE_ROLLOUT_CHECKLIST.md` | Python script `--version` not found. | medium | `python --version  # Should be 3.8+...` |
| `PRE_ROLLOUT_CHECKLIST.md` | Feature "**Configure Firestore security rules**" marked as [ ] (pending), but potential implementation found: `scripts/simulate-firestore-rules.ts`... | medium | `- [ ] **Configure Firestore security rules**...` |
| `PRE_ROLLOUT_CHECKLIST.md` | Feature "Run seed script to populate test data" marked as [ ] (pending), but potential implementation found: `scripts/adversarial-stress-test/prompts.ts`... | medium | `- [ ] Run seed script to populate test data...` |
| `PRE_ROLLOUT_CHECKLIST.md` | Feature "**Replace mock data in API routes**" marked as [ ] (pending), but potential implementation found: `src/data/mock_quiz_generations.json`... | medium | `- [ ] **Replace mock data in API routes**...` |
| `PRE_ROLLOUT_CHECKLIST.md` | Feature "Any other API routes using mock data" marked as [ ] (pending), but potential implementation found: `src/data/mock_quiz_generations.json`... | medium | `- [ ] Any other API routes using mock data...` |
| `PRE_ROLLOUT_CHECKLIST.md` | Feature "**Test with real data**" marked as [ ] (pending), but potential implementation found: `scripts/audit_data_realism.py`... | medium | `- [ ] **Test with real data**...` |
| `PRE_ROLLOUT_CHECKLIST.md` | Feature "Create test student account" marked as [ ] (pending), but potential implementation found: `src/app/api/students/create/route.ts`... | medium | `- [ ] Create test student account...` |
| `PRE_ROLLOUT_CHECKLIST.md` | Feature "**Complete login page**" marked as [ ] (pending), but potential implementation found: `src/app/(auth)/login/page.tsx`... | medium | `- [ ] **Complete login page**...` |
| `PRE_ROLLOUT_CHECKLIST.md` | Feature "Create user in Firebase Auth" marked as [ ] (pending), but potential implementation found: `src/app/api/users/create/route.ts`... | medium | `- [ ] Create user in Firebase Auth...` |
| `PRE_ROLLOUT_CHECKLIST.md` | Feature "Create user document in Firestore" marked as [ ] (pending), but potential implementation found: `src/app/api/users/create/route.ts`... | medium | `- [ ] Create user document in Firestore...` |
| `PRE_ROLLOUT_CHECKLIST.md` | Feature "**Test authentication flow**" marked as [ ] (pending), but potential implementation found: `src/ai/flows/schema-regression.test.ts`... | medium | `- [ ] **Test authentication flow**...` |
| `PRE_ROLLOUT_CHECKLIST.md` | Feature "**Check Firestore security rules**" marked as [ ] (pending), but potential implementation found: `scripts/simulate-firestore-rules.ts`... | medium | `- [ ] **Check Firestore security rules**...` |
| `PRE_ROLLOUT_CHECKLIST.md` | Feature "Use revision planner" marked as [ ] (pending), but potential implementation found: `src/ai/flows/smart-revision-planner.ts`... | medium | `- [ ] Use revision planner...` |
| `PRE_ROLLOUT_CHECKLIST.md` | Feature "**Test with real data volume**" marked as [ ] (pending), but potential implementation found: `scripts/audit_data_realism.py`... | medium | `- [ ] **Test with real data volume**...` |
| `PRE_ROLLOUT_CHECKLIST.md` | Feature "Home page < 2 seconds" marked as [ ] (pending), but potential implementation found: `src/app/(main)/home/page.tsx`... | medium | `- [ ] Home page < 2 seconds...` |
| `PRE_ROLLOUT_CHECKLIST.md` | Feature "**Test ML inference**" marked as [ ] (pending), but potential implementation found: `src/ml/tests/test_inference.py`... | medium | `- [ ] **Test ML inference**...` |
| `PRE_ROLLOUT_CHECKLIST.md` | Feature "Can login" marked as [ ] (pending), but potential implementation found: `src/app/(auth)/login/page.tsx`... | medium | `- [ ] Can login...` |
| `PRE_ROLLOUT_CHECKLIST.md` | Feature "**Create user documentation**" marked as [ ] (pending), but potential implementation found: `src/app/api/users/create/route.ts`... | medium | `- [ ] **Create user documentation**...` |
| `PRE_ROLLOUT_CHECKLIST.md` | Feature "How to sign up" marked as [ ] (pending), but potential implementation found: `scripts/audit-responsive-design.ts`... | medium | `- [ ] How to sign up...` |
| `PRE_ROLLOUT_CHECKLIST.md` | Feature "How to use features" marked as [ ] (pending), but potential implementation found: `scripts/benchmark_student_features.ts`... | medium | `- [ ] How to use features...` |
| `PRIVACY_COMPLIANCE_REPORT.md` | Feature "**Data Export**: No API found for "Download My Data" (Portability)." marked as [ ] (pending), but potential implementation found: `scripts/audit-synthetic-data.py`... | medium | `- [ ] **Data Export**: No API found for "Download ...` |
| `docs/Development Status.md` | Feature "E2E testing" marked as [ ] (pending), but potential implementation found: `scripts/security-testing/adversarial-prompts.ts`... | medium | `- [ ] E2E testing...` |
| `src/ai/adk/README.md` | Feature "Integration with more ML models (Forgetting Curve, Attention Risk)" marked as [ ] (pending), but potential implementation found: `scripts/audit-forgetting-curve.ts`... | medium | `- [ ] Integration with more ML models (Forgetting ...` |
| `src/ml/README.md` | Feature "Topic Mastery Prediction (Model #1)" marked as [ ] (pending), but potential implementation found: `src/components/TopicMasteryGrid.tsx`... | medium | `- [ ] Topic Mastery Prediction (Model #1)...` |
| `src/ml/README.md` | Feature "ML-LLM integration in Revision Planner" marked as [ ] (pending), but potential implementation found: `src/ai/flows/smart-revision-planner.ts`... | medium | `- [ ] ML-LLM integration in Revision Planner...` |
| `src/ml/README.md` | Feature "Forgetting Curve Prediction (Model #2)" marked as [ ] (pending), but potential implementation found: `scripts/audit-forgetting-curve.ts`... | medium | `- [ ] Forgetting Curve Prediction (Model #2)...` |
| `tutorial.md` | Feature "Replace mock data with real database (see `DATABASE.md`)" marked as [ ] (pending), but potential implementation found: `scripts/audit_data_realism.py`... | medium | `- [ ] Replace mock data with real database (see `D...` |
| `tutorial.md` | Feature "Train model on real user data (not synthetic)" marked as [ ] (pending), but potential implementation found: `scripts/audit-synthetic-data.py`... | medium | `- [ ] Train model on real user data (not synthetic...` |

## 2. Broken Reference Inventory

| File | Description | Suggestion |
|---|---|---|
| `ARCHITECTURE.md` | Referenced file `src/components/quiz/NewQuizType.tsx` not found. | - |
| `ARCHITECTURE.md` | Referenced file `src/app/api/quiz/new-type/route.ts` not found. | - |
| `ARCHITECTURE.md` | Referenced file `src/ai/flows/new-quiz-generator.ts` not found. | - |
| `ARCHITECTURE.md` | Endpoint `/api/intelligence/student/route.ts` not found in `src/app/api`. | - |
| `ARCHITECTURE.md` | Endpoint `/api/quiz/submit/route.ts` not found in `src/app/api`. | - |
| `ARCHITECTURE.md` | Endpoint `/api/quiz/new-type/route.ts` not found in `src/app/api`. | - |
| `ARCHITECTURE.md` | Endpoint `/api/teacher/students/route.ts` not found in `src/app/api`. | - |
| `BUNDLE_SIZE_REPORT.md` | Endpoint `/api/intelligence/student/route.ts` not found in `src/app/api`. | - |
| `BUNDLE_SIZE_REPORT.md` | Endpoint `/api/activity/log/route.ts` not found in `src/app/api`. | - |
| `CACHING_STRATEGY_PROPOSAL.md` | Endpoint `/api/syllabus/generate` not found in `src/app/api`. | - |
| `CACHING_STRATEGY_PROPOSAL.md` | Endpoint `/api/quiz/generate` not found in `src/app/api`. | - |
| `CACHING_STRATEGY_PROPOSAL.md` | Endpoint `/api/syllabus/generate` not found in `src/app/api`. | - |
| `CACHING_STRATEGY_PROPOSAL.md` | Endpoint `/api/quiz/generate` not found in `src/app/api`. | - |
| `COST_OPTIMIZATION_REPORT.md` | Endpoint `/api/intelligence/student/route.ts` not found in `src/app/api`. | - |
| `DATABASE.md` | Referenced file `src/lib/db.ts` not found. | - |
| `DATABASE.md` | Endpoint `/api/intelligence/student/route.ts` not found in `src/app/api`. | - |
| `DATABASE.md` | Endpoint `/api/intelligence/student/route.ts` not found in `src/app/api`. | - |
| `DATABASE.md` | Endpoint `/api/quiz/submit/route.ts` not found in `src/app/api`. | - |
| `DATABASE.md` | Endpoint `/api/intelligence/student/route.ts` not found in `src/app/api`. | - |
| `I18N_READINESS_REPORT.md` | Endpoint `/api/intelligence/student/route.ts` not found in `src/app/api`. | - |
| `I18N_READINESS_REPORT.md` | Endpoint `/api/teacher/students/route.ts` not found in `src/app/api`. | - |
| `ML_QUICKSTART.md` | Referenced file `models/mastery_model.pkl` not found. | - |
| `ML_QUICKSTART.md` | Referenced file `inference` not found. | - |
| `ML_SETUP_GUIDE.md` | Referenced file `models/mastery_model.pkl` not found. | - |
| `ML_SETUP_GUIDE.md` | Referenced file `inference` not found. | - |
| `PRE_ROLLOUT_CHECKLIST.md` | Referenced file `src/middleware.ts` not found. | - |
| `PRE_ROLLOUT_CHECKLIST.md` | Endpoint `/api/intelligence/student/route.ts` not found in `src/app/api`. | - |
| `README.md` | Referenced file `src/ml/models/mastery_model.pk` not found. | src/ml/models/mastery_model.pkl |
| `SESSION_PERSISTENCE_REPORT.md` | Referenced file `src/hooks/use-local-storage.ts` not found. | - |
| `TEACHER_RBAC_REPORT.md` | Endpoint `/api/teacher/students/route.ts` not found in `src/app/api`. | - |
| `TEACHER_RBAC_REPORT.md` | Endpoint `/api/teacher/route.ts` not found in `src/app/api`. | - |
| `debug.md` | Endpoint `/api/users/` not found in `src/app/api`. | - |
| `debug.md` | Endpoint `/api/users/undefined` not found in `src/app/api`. | - |
| `docs/API Documentation.md` | Endpoint `/api/student/route.ts` not found in `src/app/api`. | - |
| `docs/API Documentation.md` | Endpoint `/api/student/onboard/route.ts` not found in `src/app/api`. | - |
| `docs/API Documentation.md` | Endpoint `/api/student/graph/route.ts` not found in `src/app/api`. | - |
| `docs/API Documentation.md` | Endpoint `/api/teacher/route.ts` not found in `src/app/api`. | - |
| `docs/API Documentation.md` | Endpoint `/api/teacher/onboard/route.ts` not found in `src/app/api`. | - |
| `docs/API Documentation.md` | Endpoint `/api/teacher/students/route.ts` not found in `src/app/api`. | - |
| `docs/API Documentation.md` | Endpoint `/api/teacher/graph/route.ts` not found in `src/app/api`. | - |
| `docs/API Documentation.md` | Endpoint `/api/users/` not found in `src/app/api`. | - |
| `docs/API Documentation.md` | Endpoint `/api/users/` not found in `src/app/api`. | - |
| `docs/API Documentation.md` | Endpoint `/api/users/create/route.ts` not found in `src/app/api`. | - |
| `docs/API Documentation.md` | Endpoint `/api/activity/log/route.ts` not found in `src/app/api`. | - |
| `docs/API Documentation.md` | Endpoint `/api/quiz/submit/route.ts` not found in `src/app/api`. | - |
| `docs/Architecture Map.md` | Endpoint `/api/users/` not found in `src/app/api`. | - |
| `docs/Development Status.md` | Endpoint `/api/users/` not found in `src/app/api`. | - |
| `docs/Features Overview.md` | Endpoint `/api/student/onboard/route.ts` not found in `src/app/api`. | - |
| `docs/Features Overview.md` | Endpoint `/api/student/graph/route.ts` not found in `src/app/api`. | - |
| `docs/Features Overview.md` | Endpoint `/api/quiz/submit/route.ts` not found in `src/app/api`. | - |
| `docs/Features Overview.md` | Endpoint `/api/teacher/onboard/route.ts` not found in `src/app/api`. | - |
| `docs/Features Overview.md` | Endpoint `/api/teacher/students/route.ts` not found in `src/app/api`. | - |
| `docs/Features Overview.md` | Endpoint `/api/teacher/graph/route.ts` not found in `src/app/api`. | - |
| `docs/audit_report.md` | Endpoint `/api/intelligence/student/route.ts` not found in `src/app/api`. | - |
| `env_var_security_report.md` | Referenced file `src/env.mjs` not found. | - |
| `ml_model_integration.md` | Referenced file `src/ml/models/your_model_name.pkl` not found. | - |
| `ml_model_integration.md` | Referenced file `src/ml/inference/predict_your_task.py` not found. | - |
| `ml_model_integration.md` | Referenced file `models/your_model_name.pkl` not found. | - |
| `ml_model_integration.md` | Referenced file `models/your_model.h5` not found. | - |
| `ml_model_integration.md` | Referenced file `models/your_model.pt` not found. | - |
| `ml_model_integration.md` | Referenced file `models/your_model.onnx` not found. | - |
| `src/ai/adk/README.md` | Referenced file `ml/README.md` not found. | - |
| `src/ai/adk/README.md` | Referenced file `flows/smart-revision-planner.ts` not found. | - |
| `src/ai/adk/README.md` | Referenced file `teacher-analytics.ts` not found. | - |
| `tutorial.md` | Referenced file `models/mastery_model.pkl` not found. | - |
| `tutorial.md` | Referenced file `src/ml/training/train_forgetting_model.py` not found. | - |
| `tutorial.md` | Referenced file `src/ml/inference/predict_forgetting.py` not found. | - |
| `tutorial.md` | Referenced file `src/app/api/teacher/analytics/route.ts` not found. | - |
| `tutorial.md` | Endpoint `/api/intelligence/student/route.ts` not found in `src/app/api`. | - |
| `tutorial.md` | Endpoint `/api/teacher/analytics/route.ts` not found in `src/app/api`. | - |
| `tutorial.md` | Endpoint `/api/intelligence/student/route.ts` not found in `src/app/api`. | - |

## 3. Coverage Gaps

✅ High documentation coverage.

## 4. Update Proposals (Patches)

### ARCHITECTURE.md
### BUNDLE_SIZE_REPORT.md
### CACHING_STRATEGY_PROPOSAL.md
### COST_OPTIMIZATION_REPORT.md
### DATABASE.md
**Problem:** Feature "`src/components/LearningStateCard.tsx` - No mock data, uses API" marked as [ ] (pending), but potential implementation found: `src/data/mock_quiz_generations.json`...
```diff
- - [ ] `src/components/LearningStateCard.tsx` - No mock data, uses API
+ Mark as [x] and link to `src/data/mock_quiz_generations.json`
```

**Problem:** Feature "`src/components/TopicMasteryGrid.tsx` - No mock data, uses API" marked as [ ] (pending), but potential implementation found: `src/data/mock_quiz_generations.json`...
```diff
- - [ ] `src/components/TopicMasteryGrid.tsx` - No mock data, uses API
+ Mark as [x] and link to `src/data/mock_quiz_generations.json`
```

### I18N_READINESS_REPORT.md
### ML_QUICKSTART.md
**Problem:** Feature "Inference script returns valid JSON" marked as [ ] (pending), but potential implementation found: `scripts/audit-flow-validation.ts`...
```diff
- - [ ] Inference script returns valid JSON
+ Mark as [x] and link to `scripts/audit-flow-validation.ts`
```

### ML_SETUP_GUIDE.md
### PRE_ROLLOUT_CHECKLIST.md
**Problem:** Feature "**Configure Firestore security rules**" marked as [ ] (pending), but potential implementation found: `scripts/simulate-firestore-rules.ts`...
```diff
- - [ ] **Configure Firestore security rules**
+ Mark as [x] and link to `scripts/simulate-firestore-rules.ts`
```

**Problem:** Feature "Run seed script to populate test data" marked as [ ] (pending), but potential implementation found: `scripts/adversarial-stress-test/prompts.ts`...
```diff
- - [ ] Run seed script to populate test data
+ Mark as [x] and link to `scripts/adversarial-stress-test/prompts.ts`
```

**Problem:** Feature "**Replace mock data in API routes**" marked as [ ] (pending), but potential implementation found: `src/data/mock_quiz_generations.json`...
```diff
- - [ ] **Replace mock data in API routes**
+ Mark as [x] and link to `src/data/mock_quiz_generations.json`
```

**Problem:** Feature "Any other API routes using mock data" marked as [ ] (pending), but potential implementation found: `src/data/mock_quiz_generations.json`...
```diff
- - [ ] Any other API routes using mock data
+ Mark as [x] and link to `src/data/mock_quiz_generations.json`
```

**Problem:** Feature "**Test with real data**" marked as [ ] (pending), but potential implementation found: `scripts/audit_data_realism.py`...
```diff
- - [ ] **Test with real data**
+ Mark as [x] and link to `scripts/audit_data_realism.py`
```

**Problem:** Feature "Create test student account" marked as [ ] (pending), but potential implementation found: `src/app/api/students/create/route.ts`...
```diff
- - [ ] Create test student account
+ Mark as [x] and link to `src/app/api/students/create/route.ts`
```

**Problem:** Feature "**Complete login page**" marked as [ ] (pending), but potential implementation found: `src/app/(auth)/login/page.tsx`...
```diff
- - [ ] **Complete login page**
+ Mark as [x] and link to `src/app/(auth)/login/page.tsx`
```

**Problem:** Feature "Create user in Firebase Auth" marked as [ ] (pending), but potential implementation found: `src/app/api/users/create/route.ts`...
```diff
- - [ ] Create user in Firebase Auth
+ Mark as [x] and link to `src/app/api/users/create/route.ts`
```

**Problem:** Feature "Create user document in Firestore" marked as [ ] (pending), but potential implementation found: `src/app/api/users/create/route.ts`...
```diff
- - [ ] Create user document in Firestore
+ Mark as [x] and link to `src/app/api/users/create/route.ts`
```

**Problem:** Feature "**Test authentication flow**" marked as [ ] (pending), but potential implementation found: `src/ai/flows/schema-regression.test.ts`...
```diff
- - [ ] **Test authentication flow**
+ Mark as [x] and link to `src/ai/flows/schema-regression.test.ts`
```

**Problem:** Feature "**Check Firestore security rules**" marked as [ ] (pending), but potential implementation found: `scripts/simulate-firestore-rules.ts`...
```diff
- - [ ] **Check Firestore security rules**
+ Mark as [x] and link to `scripts/simulate-firestore-rules.ts`
```

**Problem:** Feature "Use revision planner" marked as [ ] (pending), but potential implementation found: `src/ai/flows/smart-revision-planner.ts`...
```diff
- - [ ] Use revision planner
+ Mark as [x] and link to `src/ai/flows/smart-revision-planner.ts`
```

**Problem:** Feature "**Test with real data volume**" marked as [ ] (pending), but potential implementation found: `scripts/audit_data_realism.py`...
```diff
- - [ ] **Test with real data volume**
+ Mark as [x] and link to `scripts/audit_data_realism.py`
```

**Problem:** Feature "Home page < 2 seconds" marked as [ ] (pending), but potential implementation found: `src/app/(main)/home/page.tsx`...
```diff
- - [ ] Home page < 2 seconds
+ Mark as [x] and link to `src/app/(main)/home/page.tsx`
```

**Problem:** Feature "**Test ML inference**" marked as [ ] (pending), but potential implementation found: `src/ml/tests/test_inference.py`...
```diff
- - [ ] **Test ML inference**
+ Mark as [x] and link to `src/ml/tests/test_inference.py`
```

**Problem:** Feature "Can login" marked as [ ] (pending), but potential implementation found: `src/app/(auth)/login/page.tsx`...
```diff
- - [ ] Can login
+ Mark as [x] and link to `src/app/(auth)/login/page.tsx`
```

**Problem:** Feature "**Create user documentation**" marked as [ ] (pending), but potential implementation found: `src/app/api/users/create/route.ts`...
```diff
- - [ ] **Create user documentation**
+ Mark as [x] and link to `src/app/api/users/create/route.ts`
```

**Problem:** Feature "How to sign up" marked as [ ] (pending), but potential implementation found: `scripts/audit-responsive-design.ts`...
```diff
- - [ ] How to sign up
+ Mark as [x] and link to `scripts/audit-responsive-design.ts`
```

**Problem:** Feature "How to use features" marked as [ ] (pending), but potential implementation found: `scripts/benchmark_student_features.ts`...
```diff
- - [ ] How to use features
+ Mark as [x] and link to `scripts/benchmark_student_features.ts`
```

### PRIVACY_COMPLIANCE_REPORT.md
**Problem:** Feature "**Data Export**: No API found for "Download My Data" (Portability)." marked as [ ] (pending), but potential implementation found: `scripts/audit-synthetic-data.py`...
```diff
- - [ ] **Data Export**: No API found for "Download My Data" (Portability).
+ Mark as [x] and link to `scripts/audit-synthetic-data.py`
```

### README.md
**Problem:** Referenced file `src/ml/models/mastery_model.pk` not found.
```diff
- This creates `src/ml/models/mastery_model.pk`l with >90% accuracy.
+ (Suggestion: Replace broken path with src/ml/models/mastery_model.pkl)
```

### SESSION_PERSISTENCE_REPORT.md
### TEACHER_RBAC_REPORT.md
### debug.md
### docs/API Documentation.md
### docs/Architecture Map.md
### docs/Development Status.md
**Problem:** Feature "E2E testing" marked as [ ] (pending), but potential implementation found: `scripts/security-testing/adversarial-prompts.ts`...
```diff
- - [ ] E2E testing
+ Mark as [x] and link to `scripts/security-testing/adversarial-prompts.ts`
```

### docs/Features Overview.md
### docs/audit_report.md
### env_var_security_report.md
### ml_model_integration.md
### src/ai/adk/README.md
**Problem:** Feature "Integration with more ML models (Forgetting Curve, Attention Risk)" marked as [ ] (pending), but potential implementation found: `scripts/audit-forgetting-curve.ts`...
```diff
- - [ ] Integration with more ML models (Forgetting Curve, Attention Risk)
+ Mark as [x] and link to `scripts/audit-forgetting-curve.ts`
```

### src/ml/README.md
**Problem:** Feature "Topic Mastery Prediction (Model #1)" marked as [ ] (pending), but potential implementation found: `src/components/TopicMasteryGrid.tsx`...
```diff
- - [ ] Topic Mastery Prediction (Model #1)
+ Mark as [x] and link to `src/components/TopicMasteryGrid.tsx`
```

**Problem:** Feature "ML-LLM integration in Revision Planner" marked as [ ] (pending), but potential implementation found: `src/ai/flows/smart-revision-planner.ts`...
```diff
- - [ ] ML-LLM integration in Revision Planner
+ Mark as [x] and link to `src/ai/flows/smart-revision-planner.ts`
```

**Problem:** Feature "Forgetting Curve Prediction (Model #2)" marked as [ ] (pending), but potential implementation found: `scripts/audit-forgetting-curve.ts`...
```diff
- - [ ] Forgetting Curve Prediction (Model #2)
+ Mark as [x] and link to `scripts/audit-forgetting-curve.ts`
```

### tutorial.md
**Problem:** Feature "Replace mock data with real database (see `DATABASE.md`)" marked as [ ] (pending), but potential implementation found: `scripts/audit_data_realism.py`...
```diff
- - [ ] Replace mock data with real database (see `DATABASE.md`)
+ Mark as [x] and link to `scripts/audit_data_realism.py`
```

**Problem:** Feature "Train model on real user data (not synthetic)" marked as [ ] (pending), but potential implementation found: `scripts/audit-synthetic-data.py`...
```diff
- - [ ] Train model on real user data (not synthetic)
+ Mark as [x] and link to `scripts/audit-synthetic-data.py`
```
