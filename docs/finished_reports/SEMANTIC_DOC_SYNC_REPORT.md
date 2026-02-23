# Semantic Documentation Synchronization Report
Generated: 2026-02-19T18:35:29.208Z

## Overview
- **Files Scanned**: 159
- **Claims Extracted**: 1634
- **Stale Claims**: 91
- **Documentation Debt**: 6% stale
- **Undocumented Endpoints**: 0

## 1. Staleness Audit
The following documentation claims appear to be outdated or incorrect based on code analysis.

| File | Type | Claim | Issue | Suggestion |
|------|------|-------|-------|------------|
| `ARCHITECTURE.md` | file_path | `src/components/quiz/NewQuizType.tsx` | File not found on disk. |  |
| `ARCHITECTURE.md` | file_path | `src/app/api/quiz/new-type/route.ts` | File not found at specified path, but exists elsewhere. | Did you mean one of: src/app/api/activity/log/route.ts, src/app/api/brainmap/nodes/route.ts, src/app/api/chaos/route.ts, src/app/api/classes/create/route.ts, src/app/api/classes/join/route.ts, src/app/api/classes/leave/route.ts, src/app/api/intelligence/student/route.ts, src/app/api/planner/convert-to-node/route.ts, src/app/api/planner/data/route.ts, src/app/api/planner/review/route.ts, src/app/api/quiz/submit/route.ts, src/app/api/sankalp/session/end/route.ts, src/app/api/sankalp/session/start/route.ts, src/app/api/student/graph/route.ts, src/app/api/student/onboard/route.ts, src/app/api/student/route.ts, src/app/api/students/create/route.ts, src/app/api/syllabus/save/route.ts, src/app/api/teacher/classes/[classId]/route.ts, src/app/api/teacher/classes/[classId]/students/route.ts, src/app/api/teacher/classes/route.ts, src/app/api/teacher/graph/route.ts, src/app/api/teacher/onboard/route.ts, src/app/api/teacher/route.ts, src/app/api/teacher/students/[studentId]/route.ts, src/app/api/teacher/students/route.ts, src/app/api/teachers/create/route.ts, src/app/api/test/seed/route.ts, src/app/api/users/[userId]/route.ts, src/app/api/users/create/route.ts? |
| `ARCHITECTURE.md` | endpoint | `/api/quiz/new-type/route` | Endpoint '/api/quiz/new-type' NOT found in src/app/api. |  |
| `ARCHITECTURE.md` | file_path | `src/ai/flows/new-quiz-generator.ts` | File not found on disk. |  |
| `CACHING_STRATEGY_PROPOSAL.md` | endpoint | `/api/syllabus/generate` | Endpoint '/api/syllabus/generate' NOT found in src/app/api. |  |
| `CACHING_STRATEGY_PROPOSAL.md` | endpoint | `/api/quiz/generate` | Endpoint '/api/quiz/generate' NOT found in src/app/api. |  |
| `CACHING_STRATEGY_PROPOSAL.md` | endpoint | `/api/syllabus/generate` | Endpoint '/api/syllabus/generate' NOT found in src/app/api. |  |
| `CACHING_STRATEGY_PROPOSAL.md` | endpoint | `/api/quiz/generate` | Endpoint '/api/quiz/generate' NOT found in src/app/api. |  |
| `DATABASE.md` | file_path | `src/lib/db.ts` | File not found on disk. |  |
| `ML_QUICKSTART.md` | command | `python --version` | Python script '--version' not found. | Check if the script exists. |
| `ML_QUICKSTART.md` | command | `python generate_data.py` | Python script 'generate_data.py' not found. | Check if the script exists. |
| `ML_QUICKSTART.md` | command | `python train_mastery_model.py` | Python script 'train_mastery_model.py' not found. | Check if the script exists. |
| `ML_QUICKSTART.md` | command | `python predict_mastery.py` | Python script 'predict_mastery.py' not found. | Check if the script exists. |
| `ML_SETUP_GUIDE.md` | command | `python generate_data.py` | Python script 'generate_data.py' not found. | Check if the script exists. |
| `ML_SETUP_GUIDE.md` | command | `python train_mastery_model.py` | Python script 'train_mastery_model.py' not found. | Check if the script exists. |
| `ML_SETUP_GUIDE.md` | command | `python predict_mastery.py` | Python script 'predict_mastery.py' not found. | Check if the script exists. |
| `ML_SETUP_GUIDE.md` | command | `python api.py` | Python script 'api.py' not found. | Check if the script exists. |
| `ML_SETUP_GUIDE.md` | command | `python -m` | Python script '-m' not found. | Check if the script exists. |
| `ML_SETUP_GUIDE.md` | command | `python -m` | Python script '-m' not found. | Check if the script exists. |
| `ML_SETUP_GUIDE.md` | command | `python -m` | Python script '-m' not found. | Check if the script exists. |
| `PRE_ROLLOUT_CHECKLIST.md` | file_path | `src/middleware.ts` | File not found on disk. |  |
| `PRE_ROLLOUT_CHECKLIST.md` | command | `python --version` | Python script '--version' not found. | Check if the script exists. |
| `PRE_ROLLOUT_CHECKLIST.md` | command | `python generate_data.py` | Python script 'generate_data.py' not found. | Check if the script exists. |
| `PRE_ROLLOUT_CHECKLIST.md` | command | `python train_mastery_model.py` | Python script 'train_mastery_model.py' not found. | Check if the script exists. |
| `RATE_LIMIT_PROPOSAL.md` | command | `python bridge.` | Python script 'bridge.' not found. | Check if the script exists. |
| `README.md` | file_path | `docs/genkit` | File not found on disk. |  |
| `README.md` | command | `python generate_data.py` | Python script 'generate_data.py' not found. | Check if the script exists. |
| `README.md` | command | `python train_mastery_model.py` | Python script 'train_mastery_model.py' not found. | Check if the script exists. |
| `README.md` | file_path | `src/ml/models/mastery_model.pk` | File not found on disk. |  |
| `SESSION_PERSISTENCE_REPORT.md` | file_path | `src/hooks/use-local-storage.ts` | File not found on disk. |  |
| `debug.md` | endpoint | `/api/users/` | Endpoint '/api/users' NOT found in src/app/api. | Did you mean one of: /api/users/[userId], /api/users/create? |
| `debug.md` | endpoint | `/api/users/undefined` | Endpoint '/api/users/undefined' NOT found in src/app/api. |  |
| `docs/Architecture Map.md` | endpoint | `/api/users/[id]` | Endpoint '/api/users/[id]' NOT found in src/app/api. |  |
| `docs/Architecture Map.md` | endpoint | `/api/activity/log]` | Endpoint '/api/activity/log]' NOT found in src/app/api. | Did you mean one of: /api/activity/log? |
| `env_var_security_report.md` | file_path | `src/env.mjs` | File not found on disk. |  |
| `ml_model_integration.md` | file_path | `src/ml/models/your_model_name.pkl` | File not found on disk. |  |
| `ml_model_integration.md` | file_path | `src/ml/inference/predict_your_task.py` | File not found on disk. |  |
| `ml_model_integration.md` | command | `python predict_your_task.py` | Python script 'predict_your_task.py' not found. | Check if the script exists. |
| `reports/API_NAMING_AUDIT.md` | endpoint | `/api/teachers` | Endpoint '/api/teachers' NOT found in src/app/api. | Did you mean one of: /api/teacher, /api/teachers/create? |
| `reports/API_NAMING_AUDIT.md` | endpoint | `/api/students` | Endpoint '/api/students' NOT found in src/app/api. | Did you mean one of: /api/student, /api/students/create? |
| `reports/API_NAMING_AUDIT.md` | endpoint | `/api/users` | Endpoint '/api/users' NOT found in src/app/api. | Did you mean one of: /api/users/[userId], /api/users/create? |
| `reports/API_NAMING_AUDIT.md` | endpoint | `/api/classes` | Endpoint '/api/classes' NOT found in src/app/api. | Did you mean one of: /api/classes/create, /api/classes/join, /api/classes/leave? |
| `reports/API_NAMING_AUDIT.md` | endpoint | `/api/classes/` | Endpoint '/api/classes' NOT found in src/app/api. | Did you mean one of: /api/classes/create, /api/classes/join, /api/classes/leave? |
| `reports/API_NAMING_AUDIT.md` | endpoint | `/api/enrollments` | Endpoint '/api/enrollments' NOT found in src/app/api. |  |
| `reports/API_NAMING_AUDIT.md` | endpoint | `/api/classes/` | Endpoint '/api/classes' NOT found in src/app/api. | Did you mean one of: /api/classes/create, /api/classes/join, /api/classes/leave? |
| `reports/API_NAMING_AUDIT.md` | endpoint | `/api/enrollments/` | Endpoint '/api/enrollments' NOT found in src/app/api. |  |
| `reports/API_NAMING_AUDIT.md` | endpoint | `/api/users` | Endpoint '/api/users' NOT found in src/app/api. | Did you mean one of: /api/users/[userId], /api/users/create? |
| `reports/API_NAMING_AUDIT.md` | endpoint | `/api/teachers` | Endpoint '/api/teachers' NOT found in src/app/api. | Did you mean one of: /api/teacher, /api/teachers/create? |
| `reports/API_NAMING_AUDIT.md` | endpoint | `/api/students` | Endpoint '/api/students' NOT found in src/app/api. | Did you mean one of: /api/student, /api/students/create? |
| `reports/API_NAMING_AUDIT.md` | endpoint | `/api/syllabi` | Endpoint '/api/syllabi' NOT found in src/app/api. |  |
| `reports/API_NAMING_AUDIT.md` | endpoint | `/api/syllabi/` | Endpoint '/api/syllabi' NOT found in src/app/api. |  |
| `reports/API_NAMING_AUDIT.md` | endpoint | `/api/quizzes/` | Endpoint '/api/quizzes' NOT found in src/app/api. |  |
| `reports/API_NAMING_AUDIT.md` | endpoint | `/api/sessions` | Endpoint '/api/sessions' NOT found in src/app/api. |  |
| `reports/API_NAMING_AUDIT.md` | endpoint | `/api/planner/nodes` | Endpoint '/api/planner/nodes' NOT found in src/app/api. |  |
| `reports/API_NAMING_AUDIT.md` | endpoint | `/api/teachers/me` | Endpoint '/api/teachers/me' NOT found in src/app/api. | Did you mean one of: /api/teacher? |
| `reports/API_NAMING_AUDIT.md` | endpoint | `/api/teachers/` | Endpoint '/api/teachers' NOT found in src/app/api. | Did you mean one of: /api/teacher, /api/teachers/create? |
| `reports/API_NAMING_AUDIT.md` | endpoint | `/api/teachers` | Endpoint '/api/teachers' NOT found in src/app/api. | Did you mean one of: /api/teacher, /api/teachers/create? |
| `reports/API_NAMING_AUDIT.md` | endpoint | `/api/students/me` | Endpoint '/api/students/me' NOT found in src/app/api. | Did you mean one of: /api/student? |
| `reports/API_NAMING_AUDIT.md` | endpoint | `/api/students/` | Endpoint '/api/students' NOT found in src/app/api. | Did you mean one of: /api/student, /api/students/create? |
| `reports/API_NAMING_AUDIT.md` | endpoint | `/api/students` | Endpoint '/api/students' NOT found in src/app/api. | Did you mean one of: /api/student, /api/students/create? |
| `reports/API_NAMING_AUDIT.md` | endpoint | `/api/classes` | Endpoint '/api/classes' NOT found in src/app/api. | Did you mean one of: /api/classes/create, /api/classes/join, /api/classes/leave? |
| `reports/API_NAMING_AUDIT.md` | endpoint | `/api/users` | Endpoint '/api/users' NOT found in src/app/api. | Did you mean one of: /api/users/[userId], /api/users/create? |
| `reports/API_NAMING_AUDIT.md` | endpoint | `/api/syllabi` | Endpoint '/api/syllabi' NOT found in src/app/api. |  |
| `reports/API_NAMING_AUDIT.md` | endpoint | `/api/quizzes/` | Endpoint '/api/quizzes' NOT found in src/app/api. |  |
| `reports/ERROR_BOUNDARY_COVERAGE.md` | file_path | `src/app/global-error.tsx` | File not found on disk. |  |
| `reports/ERROR_BOUNDARY_COVERAGE.md` | file_path | `src/app/error.tsx` | File not found on disk. |  |
| `reports/LOADING_STATE_AUDIT.md` | file_path | `src/app/loading.tsx` | File not found on disk. |  |
| `reports/task30_vulnerability_scan.md` | command | `python dependencies` | Python script 'dependencies' not found. | Check if the script exists. |
| `reports/task32_api_audit.md` | endpoint | `/api/class` | Endpoint '/api/class' NOT found in src/app/api. | Did you mean one of: /api/classes/create, /api/classes/join, /api/classes/leave? |
| `reports/task32_api_audit.md` | endpoint | `/api/classes` | Endpoint '/api/classes' NOT found in src/app/api. | Did you mean one of: /api/classes/create, /api/classes/join, /api/classes/leave? |
| `reports/task32_api_audit.md` | endpoint | `/api/classes` | Endpoint '/api/classes' NOT found in src/app/api. | Did you mean one of: /api/classes/create, /api/classes/join, /api/classes/leave? |
| `reports/task32_api_audit.md` | endpoint | `/api/students/me` | Endpoint '/api/students/me' NOT found in src/app/api. | Did you mean one of: /api/student? |
| `reports/task32_api_audit.md` | endpoint | `/api/classes` | Endpoint '/api/classes' NOT found in src/app/api. | Did you mean one of: /api/classes/create, /api/classes/join, /api/classes/leave? |
| `reports/task32_api_audit.md` | endpoint | `/api/classes/[id]/members` | Endpoint '/api/classes/[id]/members' NOT found in src/app/api. |  |
| `reports/task32_api_audit.md` | endpoint | `/api/classes/[id]/members` | Endpoint '/api/classes/[id]/members' NOT found in src/app/api. |  |
| `reports/task32_api_audit.md` | endpoint | `/api/users` | Endpoint '/api/users' NOT found in src/app/api. | Did you mean one of: /api/users/[userId], /api/users/create? |
| `reports/task32_api_audit.md` | endpoint | `/api/sessions` | Endpoint '/api/sessions' NOT found in src/app/api. |  |
| `reports/task32_api_audit.md` | endpoint | `/api/sessions/[id]` | Endpoint '/api/sessions/[id]' NOT found in src/app/api. |  |
| `reports/task32_api_audit.md` | endpoint | `/api/quizzes/[id]/submissions` | Endpoint '/api/quizzes/[id]/submissions' NOT found in src/app/api. |  |
| `reports/task32_api_audit.md` | endpoint | `/api/syllabus/[id]` | Endpoint '/api/syllabus/[id]' NOT found in src/app/api. |  |
| `reports/task35_strict_mode_audit.md` | file_path | `src/components/FocusTimer.tsx` | File not found at specified path, but exists elsewhere. | Did you mean one of: src/components/planner/FocusTimer.tsx? |
| `reports/task36_loading_ux_audit.md` | file_path | `src/components/FocusTimer.tsx` | File not found at specified path, but exists elsewhere. | Did you mean one of: src/components/planner/FocusTimer.tsx? |
| `reports/teacher-permission-audit.md` | file_path | `src/middleware.ts` | File not found on disk. |  |
| `reports/teacher-permission-audit.md` | file_path | `src/middleware.ts` | File not found on disk. |  |
| `tutorial.md` | command | `python generate_data.py` | Python script 'generate_data.py' not found. | Check if the script exists. |
| `tutorial.md` | command | `python train_mastery_model.py` | Python script 'train_mastery_model.py' not found. | Check if the script exists. |
| `tutorial.md` | file_path | `src/ml/training/train_forgetting_model.py` | File not found on disk. |  |
| `tutorial.md` | file_path | `src/ml/inference/predict_forgetting.py` | File not found on disk. |  |
| `tutorial.md` | file_path | `src/app/api/teacher/analytics/route.ts` | File not found at specified path, but exists elsewhere. | Did you mean one of: src/app/api/activity/log/route.ts, src/app/api/brainmap/nodes/route.ts, src/app/api/chaos/route.ts, src/app/api/classes/create/route.ts, src/app/api/classes/join/route.ts, src/app/api/classes/leave/route.ts, src/app/api/intelligence/student/route.ts, src/app/api/planner/convert-to-node/route.ts, src/app/api/planner/data/route.ts, src/app/api/planner/review/route.ts, src/app/api/quiz/submit/route.ts, src/app/api/sankalp/session/end/route.ts, src/app/api/sankalp/session/start/route.ts, src/app/api/student/graph/route.ts, src/app/api/student/onboard/route.ts, src/app/api/student/route.ts, src/app/api/students/create/route.ts, src/app/api/syllabus/save/route.ts, src/app/api/teacher/classes/[classId]/route.ts, src/app/api/teacher/classes/[classId]/students/route.ts, src/app/api/teacher/classes/route.ts, src/app/api/teacher/graph/route.ts, src/app/api/teacher/onboard/route.ts, src/app/api/teacher/route.ts, src/app/api/teacher/students/[studentId]/route.ts, src/app/api/teacher/students/route.ts, src/app/api/teachers/create/route.ts, src/app/api/test/seed/route.ts, src/app/api/users/[userId]/route.ts, src/app/api/users/create/route.ts? |
| `tutorial.md` | endpoint | `/api/teacher/analytics/route` | Endpoint '/api/teacher/analytics' NOT found in src/app/api. | Did you mean one of: /api/teacher? |
| `tutorial.md` | command | `python train_mastery_model.py` | Python script 'train_mastery_model.py' not found. | Check if the script exists. |

## 2. Update Proposals
Below are specific patches to fix the detected issues.

### ARCHITECTURE.md
```diff
- 1. **Frontend Component**: `src/components/quiz/NewQuizType.tsx`
+ <!-- [STALE] 1. **Frontend Component**: `src/components/quiz/NewQuizType.tsx` -->
- 2. **API Route**: `src/app/api/quiz/new-type/route.ts`
+ 2. **API Route**: `src/app/api/activity/log/route.ts` (Proposed)
- 2. **API Route**: `src/app/api/quiz/new-type/route.ts`
+ <!-- [STALE] 2. **API Route**: `src/app/api/quiz/new-type/route.ts` -->
- 3. **AI Flow** (if using LLM): `src/ai/flows/new-quiz-generator.ts`
+ <!-- [STALE] 3. **AI Flow** (if using LLM): `src/ai/flows/new-quiz-generator.ts` -->
```

### CACHING_STRATEGY_PROPOSAL.md
```diff
- | `/api/syllabus/generate` | 72 | **94.4%** | 99261 | 163861 |
+ <!-- [STALE] | `/api/syllabus/generate` | 72 | **94.4%** | 99261 | 163861 | -->
- | `/api/quiz/generate` | 30 | **96.7%** | 23200 | 50750 |
+ <!-- [STALE] | `/api/quiz/generate` | 30 | **96.7%** | 23200 | 50750 | -->
- **Target:** `/api/syllabus/generate`
+ <!-- [STALE] **Target:** `/api/syllabus/generate` -->
- **Target:** `/api/quiz/generate`
+ <!-- [STALE] **Target:** `/api/quiz/generate` -->
```

### DATABASE.md
```diff
- **`src/lib/db.ts` (NEW FILE):**
+ <!-- [STALE] **`src/lib/db.ts` (NEW FILE):** -->
```

### ML_QUICKSTART.md
```diff
- - **Python 3.8+** installed (`python --version`)
+ <!-- [STALE] - **Python 3.8+** installed (`python --version`) -->
- python generate_data.py
+ <!-- [STALE] python generate_data.py -->
- python train_mastery_model.py
+ <!-- [STALE] python train_mastery_model.py -->
- echo '{"avg_quiz_score": 0.75, "attempts_per_topic": 3, "days_since_last_revision": 2, "quiz_score_variance": 0.1, "time_spent_per_question": 45}' | python predict_mastery.py
+ <!-- [STALE] echo '{"avg_quiz_score": 0.75, "attempts_per_topic": 3, "days_since_last_revision": 2, "quiz_score_variance": 0.1, "time_spent_per_question": 45}' | python predict_mastery.py -->
```

### ML_SETUP_GUIDE.md
```diff
- python generate_data.py
+ <!-- [STALE] python generate_data.py -->
- python train_mastery_model.py
+ <!-- [STALE] python train_mastery_model.py -->
- echo '{"avg_quiz_score": 0.75, "attempts_per_topic": 3, "days_since_last_revision": 2, "quiz_score_variance": 0.1, "time_spent_per_question": 45}' | python predict_mastery.py
+ <!-- [STALE] echo '{"avg_quiz_score": 0.75, "attempts_per_topic": 3, "days_since_last_revision": 2, "quiz_score_variance": 0.1, "time_spent_per_question": 45}' | python predict_mastery.py -->
- python api.py
+ <!-- [STALE] python api.py -->
- → Use `python -m pip install -r requirements.txt`
+ <!-- [STALE] → Use `python -m pip install -r requirements.txt` -->
- python -m pip install -r src\ml\training\requirements.txt
+ <!-- [STALE] python -m pip install -r src\ml\training\requirements.txt -->
- python -m pip install fastapi uvicorn
+ <!-- [STALE] python -m pip install fastapi uvicorn -->
```

### PRE_ROLLOUT_CHECKLIST.md
```diff
- - [ ] `src/middleware.ts` exists
+ <!-- [STALE] - [ ] `src/middleware.ts` exists -->
- python --version  # Should be 3.8+
+ <!-- [STALE] python --version  # Should be 3.8+ -->
- python generate_data.py
+ <!-- [STALE] python generate_data.py -->
- python train_mastery_model.py
+ <!-- [STALE] python train_mastery_model.py -->
```

### RATE_LIMIT_PROPOSAL.md
```diff
- The `/api/intelligence/student` route has no rate limiting. A malicious actor or a bug in the frontend could DoS the python bridge.
+ <!-- [STALE] The `/api/intelligence/student` route has no rate limiting. A malicious actor or a bug in the frontend could DoS the python bridge. -->
```

### README.md
```diff
- -   **AI Framework**: [Genkit](https://firebase.google.com/docs/genkit) (Google's AI SDK)
+ <!-- [STALE] -   **AI Framework**: [Genkit](https://firebase.google.com/docs/genkit) (Google's AI SDK) -->
- python generate_data.py
+ <!-- [STALE] python generate_data.py -->
- python train_mastery_model.py
+ <!-- [STALE] python train_mastery_model.py -->
- This creates `src/ml/models/mastery_model.pk`l with >90% accuracy.
+ <!-- [STALE] This creates `src/ml/models/mastery_model.pk`l with >90% accuracy. -->
```

### SESSION_PERSISTENCE_REPORT.md
```diff
- - Create a custom hook `useLocalStorage<T>(key: string, initialValue: T)` in `src/hooks/use-local-storage.ts`.
+ <!-- [STALE] - Create a custom hook `useLocalStorage<T>(key: string, initialValue: T)` in `src/hooks/use-local-storage.ts`. -->
```

### debug.md
```diff
- const userResponse = await fetch(`/api/users/${(await signIn(email, password))}`);
+ const userResponse = await fetch(`/api/users/[userId]${(await signIn(email, password))}`); (Proposed)
- Because `signIn` returned `void`, the fetch URL resolved to `/api/users/undefined`, causing a 404 or 500 error immediately after login. This was the primary cause of "errors on every click" during authentication.
+ <!-- [STALE] Because `signIn` returned `void`, the fetch URL resolved to `/api/users/undefined`, causing a 404 or 500 error immediately after login. This was the primary cause of "errors on every click" during authentication. -->
```

### docs/Architecture Map.md
```diff
- UI->>API: POST /api/users/[id]
+ <!-- [STALE] UI->>API: POST /api/users/[id] -->
- E --> F[POST /api/activity/log]
+ E --> F[POST /api/activity/log (Proposed)
```

### env_var_security_report.md
```diff
- 1.  **Implement Config Validation**: Create a centralized `src/env.mjs` or similar (using `t3-env` or `zod`) to validate all environment variables at build/runtime start. This prevents runtime crashes due to missing keys.
+ <!-- [STALE] 1.  **Implement Config Validation**: Create a centralized `src/env.mjs` or similar (using `t3-env` or `zod`) to validate all environment variables at build/runtime start. This prevents runtime crashes due to missing keys. -->
```

### ml_model_integration.md
```diff
- Save your trained model to src/ml/models/your_model_name.pkl
+ <!-- [STALE] Save your trained model to src/ml/models/your_model_name.pkl -->
- Create an inference script at src/ml/inference/predict_your_task.py:
+ <!-- [STALE] Create an inference script at src/ml/inference/predict_your_task.py: -->
- `echo '${input}' | python predict_your_task.py`,
+ <!-- [STALE] `echo '${input}' | python predict_your_task.py`, -->
```

### reports/API_NAMING_AUDIT.md
```diff
- - **Recommendation:** Standardize on plural nouns for resource collections (e.g., `/api/teachers`, `/api/students`). Use `/api/users` consistently.
+ - **Recommendation:** Standardize on plural nouns for resource collections (e.g., `/api/teacher`, `/api/students`). Use `/api/users` consistently. (Proposed)
- - **Recommendation:** Standardize on plural nouns for resource collections (e.g., `/api/teachers`, `/api/students`). Use `/api/users` consistently.
+ - **Recommendation:** Standardize on plural nouns for resource collections (e.g., `/api/teachers`, `/api/student`). Use `/api/users` consistently. (Proposed)
- - **Recommendation:** Standardize on plural nouns for resource collections (e.g., `/api/teachers`, `/api/students`). Use `/api/users` consistently.
+ - **Recommendation:** Standardize on plural nouns for resource collections (e.g., `/api/teachers`, `/api/students`). Use `/api/users/[userId]` consistently. (Proposed)
- - `src/app/api/classes/create` -> Should be `POST /api/classes`
+ - `src/app/api/classes/create/create` -> Should be `POST /api/classes` (Proposed)
- - `src/app/api/classes/join` -> Should be `POST /api/classes/:id/join` or `POST /api/enrollments`
+ - `src/app/api/classes/createjoin` -> Should be `POST /api/classes/:id/join` or `POST /api/enrollments` (Proposed)
- - `src/app/api/classes/join` -> Should be `POST /api/classes/:id/join` or `POST /api/enrollments`
+ <!-- [STALE] - `src/app/api/classes/join` -> Should be `POST /api/classes/:id/join` or `POST /api/enrollments` -->
- - `src/app/api/classes/leave` -> Should be `DELETE /api/classes/:id/join` or `DELETE /api/enrollments/:id`
+ - `src/app/api/classes/createleave` -> Should be `DELETE /api/classes/:id/join` or `DELETE /api/enrollments/:id` (Proposed)
- - `src/app/api/classes/leave` -> Should be `DELETE /api/classes/:id/join` or `DELETE /api/enrollments/:id`
+ <!-- [STALE] - `src/app/api/classes/leave` -> Should be `DELETE /api/classes/:id/join` or `DELETE /api/enrollments/:id` -->
- - `src/app/api/users/create` -> Should be `POST /api/users`
+ - `src/app/api/users/[userId]/create` -> Should be `POST /api/users` (Proposed)
- - `src/app/api/teachers/create` -> Should be `POST /api/teachers`
+ - `src/app/api/teacher/create` -> Should be `POST /api/teachers` (Proposed)
- - `src/app/api/students/create` -> Should be `POST /api/students`
+ - `src/app/api/student/create` -> Should be `POST /api/students` (Proposed)
- - `src/app/api/syllabus/save` -> Should be `POST /api/syllabi` or `PUT /api/syllabi/:id`
+ <!-- [STALE] - `src/app/api/syllabus/save` -> Should be `POST /api/syllabi` or `PUT /api/syllabi/:id` -->
- - `src/app/api/syllabus/save` -> Should be `POST /api/syllabi` or `PUT /api/syllabi/:id`
+ <!-- [STALE] - `src/app/api/syllabus/save` -> Should be `POST /api/syllabi` or `PUT /api/syllabi/:id` -->
- - `src/app/api/quiz/submit` -> Should be `POST /api/quizzes/:id/submissions`
+ <!-- [STALE] - `src/app/api/quiz/submit` -> Should be `POST /api/quizzes/:id/submissions` -->
- - `src/app/api/sankalp/session/start` and `end`: Specific to "Sankalp" domain. Consider if `sankalp` is needed in the path if it's the app name. Maybe `/api/sessions`.
+ <!-- [STALE] - `src/app/api/sankalp/session/start` and `end`: Specific to "Sankalp" domain. Consider if `sankalp` is needed in the path if it's the app name. Maybe `/api/sessions`. -->
- - `src/app/api/planner/convert-to-node`: Specific action. Consider `POST /api/planner/nodes`.
+ <!-- [STALE] - `src/app/api/planner/convert-to-node`: Specific action. Consider `POST /api/planner/nodes`. -->
- | `/api/teacher` | `/api/teachers/me` or `/api/teachers/:id` | GET |
+ | `/api/teacher` | `/api/teacher` or `/api/teachers/:id` | GET | (Proposed)
- | `/api/teacher` | `/api/teachers/me` or `/api/teachers/:id` | GET |
+ | `/api/teacher` | `/api/teacherme` or `/api/teachers/:id` | GET | (Proposed)
- | `/api/teachers/create` | `/api/teachers` | POST |
+ | `/api/teacher/create` | `/api/teachers` | POST | (Proposed)
- | `/api/student` | `/api/students/me` or `/api/students/:id` | GET |
+ | `/api/student` | `/api/student` or `/api/students/:id` | GET | (Proposed)
- | `/api/student` | `/api/students/me` or `/api/students/:id` | GET |
+ | `/api/student` | `/api/studentme` or `/api/students/:id` | GET | (Proposed)
- | `/api/students/create` | `/api/students` | POST |
+ | `/api/student/create` | `/api/students` | POST | (Proposed)
- | `/api/classes/create` | `/api/classes` | POST |
+ | `/api/classes/create/create` | `/api/classes` | POST | (Proposed)
- | `/api/users/create` | `/api/users` | POST |
+ | `/api/users/[userId]/create` | `/api/users` | POST | (Proposed)
- | `/api/syllabus/save` | `/api/syllabi` | POST |
+ <!-- [STALE] | `/api/syllabus/save` | `/api/syllabi` | POST | -->
- | `/api/quiz/submit` | `/api/quizzes/:id/submit` | POST |
+ <!-- [STALE] | `/api/quiz/submit` | `/api/quizzes/:id/submit` | POST | -->
```

### reports/ERROR_BOUNDARY_COVERAGE.md
```diff
- - `src/app/global-error.tsx` (Root layout errors)
+ <!-- [STALE] - `src/app/global-error.tsx` (Root layout errors) -->
- 2.  **Create `src/app/error.tsx`:** specific error page for main app.
+ <!-- [STALE] 2.  **Create `src/app/error.tsx`:** specific error page for main app. -->
```

### reports/LOADING_STATE_AUDIT.md
```diff
- 1.  **Global Loading:** Create `src/app/loading.tsx` with a generic app shell skeleton.
+ <!-- [STALE] 1.  **Global Loading:** Create `src/app/loading.tsx` with a generic app shell skeleton. -->
```

### reports/task30_vulnerability_scan.md
```diff
- 3.  **Review Python Deps:** Pin python dependencies in `requirements.txt` to specific versions after verifying security.
+ <!-- [STALE] 3.  **Review Python Deps:** Pin python dependencies in `requirements.txt` to specific versions after verifying security. -->
```

### reports/task32_api_audit.md
```diff
- *   `/api/class` vs `/api/classes`. The codebase uses `/api/classes`.
+ *   `/api/classes/create` vs `/api/classes`. The codebase uses `/api/classes`. (Proposed)
- *   `/api/class` vs `/api/classes`. The codebase uses `/api/classes`.
+ *   `/api/class` vs `/api/classes/create`. The codebase uses `/api/classes`. (Proposed)
- *   `/api/class` vs `/api/classes`. The codebase uses `/api/classes`.
+ *   `/api/class` vs `/api/classes/create`. The codebase uses `/api/classes`. (Proposed)
- *   **Recommendation:** Standardize on plural nouns for resources (e.g., `/api/students/me` instead of `/api/student`).
+ *   **Recommendation:** Standardize on plural nouns for resources (e.g., `/api/student` instead of `/api/student`). (Proposed)
- | `/api/classes/create` | POST | 'create' in path | `POST /api/classes` |
+ | `/api/classes/create/create` | POST | 'create' in path | `POST /api/classes` | (Proposed)
- | `/api/classes/join` | POST | 'join' in path | `POST /api/classes/[id]/members` |
+ <!-- [STALE] | `/api/classes/join` | POST | 'join' in path | `POST /api/classes/[id]/members` | -->
- | `/api/classes/leave` | POST | 'leave' in path | `DELETE /api/classes/[id]/members` |
+ <!-- [STALE] | `/api/classes/leave` | POST | 'leave' in path | `DELETE /api/classes/[id]/members` | -->
- | `/api/users/create` | POST | 'create' in path | `POST /api/users` |
+ | `/api/users/[userId]/create` | POST | 'create' in path | `POST /api/users` | (Proposed)
- | `/api/sankalp/session/start` | POST | 'start' in path | `POST /api/sessions` |
+ <!-- [STALE] | `/api/sankalp/session/start` | POST | 'start' in path | `POST /api/sessions` | -->
- | `/api/sankalp/session/end` | POST | 'end' in path | `PATCH /api/sessions/[id]` (status=ended) |
+ <!-- [STALE] | `/api/sankalp/session/end` | POST | 'end' in path | `PATCH /api/sessions/[id]` (status=ended) | -->
- | `/api/quiz/submit` | POST | 'submit' in path | `POST /api/quizzes/[id]/submissions` |
+ <!-- [STALE] | `/api/quiz/submit` | POST | 'submit' in path | `POST /api/quizzes/[id]/submissions` | -->
- | `/api/syllabus/save` | POST | 'save' in path | `PUT /api/syllabus/[id]` |
+ <!-- [STALE] | `/api/syllabus/save` | POST | 'save' in path | `PUT /api/syllabus/[id]` | -->
```

### reports/task35_strict_mode_audit.md
```diff
- -   **Locations:** `src/components/InteractiveGraph.tsx`, `src/components/FocusTimer.tsx` (window as any), and likely in API types or library integrations.
+ -   **Locations:** `src/components/InteractiveGraph.tsx`, `src/components/planner/FocusTimer.tsx` (window as any), and likely in API types or library integrations. (Proposed)
```

### reports/task36_loading_ux_audit.md
```diff
- -   **File:** `src/components/FocusTimer.tsx`
+ -   **File:** `src/components/planner/FocusTimer.tsx` (Proposed)
```

### reports/teacher-permission-audit.md
```diff
- *   **Observation:** The file `src/middleware.ts` is missing.
+ <!-- [STALE] *   **Observation:** The file `src/middleware.ts` is missing. -->
- 1.  **Implement Middleware:** Create `src/middleware.ts` to protect `/teacher/**` routes, ensuring only users with `role: 'teacher'` can access them.
+ <!-- [STALE] 1.  **Implement Middleware:** Create `src/middleware.ts` to protect `/teacher/**` routes, ensuring only users with `role: 'teacher'` can access them. -->
```

### tutorial.md
```diff
- python generate_data.py  # Create training data
+ <!-- [STALE] python generate_data.py  # Create training data -->
- python train_mastery_model.py  # Train model
+ <!-- [STALE] python train_mastery_model.py  # Train model -->
- # src/ml/training/train_forgetting_model.py
+ <!-- [STALE] # src/ml/training/train_forgetting_model.py -->
- # src/ml/inference/predict_forgetting.py
+ <!-- [STALE] # src/ml/inference/predict_forgetting.py -->
- // src/app/api/teacher/analytics/route.ts
+ // src/app/api/activity/log/route.ts (Proposed)
- // src/app/api/teacher/analytics/route.ts
+ // src/app/api/teacher.ts (Proposed)
- **Fix:** Run `python train_mastery_model.py`
+ <!-- [STALE] **Fix:** Run `python train_mastery_model.py` -->
```


## 3. Coverage Gaps
The following features or endpoints exist in the code but are NOT mentioned in any documentation.

### Undocumented API Endpoints

## 4. Next Steps
1. Review the "Update Proposals" above.
2. Manually verify ambiguous suggestions.
3. Apply changes to `.md` files.
4. Run this script again to verify resolution.
