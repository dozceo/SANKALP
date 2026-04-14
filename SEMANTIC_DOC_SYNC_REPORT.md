# Semantic Documentation Synchronization Report
Generated: 2026-04-14T08:18:49.352Z

## Overview
- **Files Scanned**: 216
- **Claims Extracted**: 2471
- **Stale Claims**: 1062
- **Documentation Debt**: 43% stale
- **Undocumented Endpoints**: 0

## 1. Staleness Audit
The following documentation claims appear to be outdated or incorrect based on code analysis.

| File | Type | Claim | Issue | Suggestion |
|------|------|-------|-------|------------|
| `docs\01_Critical_Security_&_Alerts\ENV_VAR_SECURITY_REPORT.md` | file_path | `src/app/api/chaos/route.ts` | File not found on disk. |  |
| `docs\01_Critical_Security_&_Alerts\ENV_VAR_SECURITY_REPORT.md` | endpoint | `/api/chaos/route` | Endpoint '/api/chaos' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | endpoint | `/api/student` | Endpoint '/api/student' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | file_path | `src/app/api/student/route.ts` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | endpoint | `/api/student/route` | Endpoint '/api/student' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | endpoint | `/api/student/onboard` | Endpoint '/api/student/onboard' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | file_path | `src/app/api/student/onboard/route.ts` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | endpoint | `/api/student/onboard/route` | Endpoint '/api/student/onboard' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | endpoint | `/api/student/graph` | Endpoint '/api/student/graph' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | file_path | `src/app/api/student/graph/route.ts` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | endpoint | `/api/student/graph/route` | Endpoint '/api/student/graph' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | endpoint | `/api/teacher` | Endpoint '/api/teacher' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | file_path | `src/app/api/teacher/route.ts` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | endpoint | `/api/teacher/route` | Endpoint '/api/teacher' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | endpoint | `/api/teacher/onboard` | Endpoint '/api/teacher/onboard' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | file_path | `src/app/api/teacher/onboard/route.ts` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | endpoint | `/api/teacher/onboard/route` | Endpoint '/api/teacher/onboard' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | endpoint | `/api/teacher/students` | Endpoint '/api/teacher/students' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | file_path | `src/app/api/teacher/students/route.ts` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | endpoint | `/api/teacher/students/route` | Endpoint '/api/teacher/students' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | endpoint | `/api/teacher/graph` | Endpoint '/api/teacher/graph' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | file_path | `src/app/api/teacher/graph/route.ts` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | endpoint | `/api/teacher/graph/route` | Endpoint '/api/teacher/graph' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | endpoint | `/api/users/[userId]` | Endpoint '/api/users/[userId]' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | file_path | `src/app/api/users/[userId]/route.ts` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | endpoint | `/api/users/[userId]/route` | Endpoint '/api/users/[userId]' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | endpoint | `/api/users/create` | Endpoint '/api/users/create' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | file_path | `src/app/api/users/create/route.ts` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | endpoint | `/api/users/create/route` | Endpoint '/api/users/create' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | endpoint | `/api/activity/log` | Endpoint '/api/activity/log' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | file_path | `src/app/api/activity/log/route.ts` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | endpoint | `/api/activity/log/route` | Endpoint '/api/activity/log' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | endpoint | `/api/quiz/submit` | Endpoint '/api/quiz/submit' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | file_path | `src/app/api/quiz/submit/route.ts` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | endpoint | `/api/quiz/submit/route` | Endpoint '/api/quiz/submit' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | endpoint | `/api/classes/create` | Endpoint '/api/classes/create' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | endpoint | `/api/classes/join` | Endpoint '/api/classes/join' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\API Documentation.md` | endpoint | `/api/student` | Endpoint '/api/student' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\Architecture Map.md` | endpoint | `/api/users/[id]` | Endpoint '/api/users/[id]' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\Architecture Map.md` | endpoint | `/api/student` | Endpoint '/api/student' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\Architecture Map.md` | endpoint | `/api/activity/log]` | Endpoint '/api/activity/log]' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\Architecture Map.md` | endpoint | `/api/student` | Endpoint '/api/student' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\Architecture Map.md` | endpoint | `/api/student/onboard` | Endpoint '/api/student/onboard' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\Architecture Map.md` | endpoint | `/api/student/graph` | Endpoint '/api/student/graph' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\Architecture Map.md` | endpoint | `/api/teacher` | Endpoint '/api/teacher' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\Architecture Map.md` | endpoint | `/api/teacher/students` | Endpoint '/api/teacher/students' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\Architecture Map.md` | endpoint | `/api/activity/log` | Endpoint '/api/activity/log' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\ARCHITECTURE.md` | endpoint | `/api/intelligence/student` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\ARCHITECTURE.md` | file_path | `src/app/api/intelligence/student/route.ts` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\ARCHITECTURE.md` | endpoint | `/api/intelligence/student/route` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\ARCHITECTURE.md` | endpoint | `/api/quiz/submit` | Endpoint '/api/quiz/submit' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\ARCHITECTURE.md` | file_path | `src/app/api` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\ARCHITECTURE.md` | file_path | `src/app/api/quiz/submit/route.ts` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\ARCHITECTURE.md` | endpoint | `/api/quiz/submit/route` | Endpoint '/api/quiz/submit' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\ARCHITECTURE.md` | file_path | `src/components/quiz/NewQuizType.tsx` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\ARCHITECTURE.md` | file_path | `src/app/api/quiz/new-type/route.ts` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\ARCHITECTURE.md` | endpoint | `/api/quiz/new-type/route` | Endpoint '/api/quiz/new-type' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\ARCHITECTURE.md` | file_path | `src/ai/flows/new-quiz-generator.ts` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\ARCHITECTURE.md` | file_path | `src/app/api/teacher/students/route.ts` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\ARCHITECTURE.md` | endpoint | `/api/teacher/students/route` | Endpoint '/api/teacher/students' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\ARCHITECTURE.md` | endpoint | `/api/intelligence/student` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\DATABASE.md` | endpoint | `/api/intelligence/student/route` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\DATABASE.md` | file_path | `src/lib/db.ts` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\DATABASE.md` | file_path | `src/app/api/intelligence/student/route.ts` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\DATABASE.md` | endpoint | `/api/intelligence/student/route` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\DATABASE.md` | file_path | `src/app/api/quiz/submit/route.ts` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\DATABASE.md` | endpoint | `/api/quiz/submit/route` | Endpoint '/api/quiz/submit' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\DATABASE.md` | endpoint | `/api/intelligence/student` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\DATABASE.md` | file_path | `src/app/api/intelligence/student/route.ts` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\DATABASE.md` | endpoint | `/api/intelligence/student/route` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\FASTAPI_MIGRATION_READINESS.md` | file_path | `src/ml/inference/predict_mastery.py` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\FASTAPI_MIGRATION_READINESS.md` | file_path | `src/ml/inference/ml-bridge.ts` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\OBSERVABILITY_INFRASTRUCTURE_SPEC.md` | endpoint | `/api/intelligence/student` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\OBSERVABILITY_INFRASTRUCTURE_SPEC.md` | file_path | `src/ml/inference/ml-bridge.ts` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\OBSERVABILITY_INFRASTRUCTURE_SPEC.md` | file_path | `src/ml/inference/predict_mastery.py` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\OBSERVABILITY_INFRASTRUCTURE_SPEC.md` | file_path | `src/ml/inference/ml-bridge.ts` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\OBSERVABILITY_INFRASTRUCTURE_SPEC.md` | file_path | `src/ml/inference/ml-bridge.ts` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\OBSERVABILITY_INFRASTRUCTURE_SPEC.md` | endpoint | `/api/intelligence/student]` | Endpoint '/api/intelligence/student]' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\OBSERVABILITY_INFRASTRUCTURE_SPEC.md` | endpoint | `/api/intelligence/student]` | Endpoint '/api/intelligence/student]' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\OBSERVABILITY_INFRASTRUCTURE_SPEC.md` | file_path | `src/ml/inference/ml-bridge.ts` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\OBSERVABILITY_INFRASTRUCTURE_SPEC.md` | file_path | `src/ml/inference/predict_mastery.py` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\OBSERVABILITY_INFRASTRUCTURE_SPEC.md` | endpoint | `/api/intelligence/student` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\OBSERVABILITY_INFRASTRUCTURE_SPEC.md` | endpoint | `/api/quiz/submit` | Endpoint '/api/quiz/submit' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\OBSERVABILITY_SPEC.md` | file_path | `src/app/api/quiz/submit` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\OBSERVABILITY_SPEC.md` | endpoint | `/api/quiz/submit` | Endpoint '/api/quiz/submit' NOT found in src/app/api. |  |
| `docs\02_Core_Architecture_&_Specs\OBSERVABILITY_SPEC.md` | file_path | `src/ai/flows/smart-revision-planner.ts` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\OBSERVABILITY_SPEC.md` | file_path | `src/ml/inference/ml-bridge.ts` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\OBSERVABILITY_SPEC.md` | file_path | `src/ml/inference/predict_mastery.py` | File not found on disk. |  |
| `docs\02_Core_Architecture_&_Specs\SCHEMA_MIGRATION_RISK_MATRIX.md` | file_path | `src/ml/training/training_data.csv` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\AUDIT_REPORT.md` | file_path | `src/components/ui/accordion.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\AUDIT_REPORT.md` | file_path | `src/components/ui/alert.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\AUDIT_REPORT.md` | file_path | `src/components/ui/calendar.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\AUDIT_REPORT.md` | file_path | `src/components/ui/carousel.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\AUDIT_REPORT.md` | file_path | `src/components/ui/collapsible.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\AUDIT_REPORT.md` | file_path | `src/components/ui/menubar.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\AUDIT_REPORT.md` | file_path | `src/components/ui/slider.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\AUDIT_REPORTS.md` | file_path | `src/lib/rewards/calculateRewards.ts` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\design-token-violations.md` | file_path | `src/components/app/sidebar-nav.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\design-token-violations.md` | file_path | `src/components/app/teacher-sidebar-nav.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\design-token-violations.md` | file_path | `src/components/app/teacher-sidebar-nav.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\design-token-violations.md` | file_path | `src/components/app/teacher-sidebar-nav.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\design-token-violations.md` | file_path | `src/components/planner/StudyLibrary.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\design-token-violations.md` | file_path | `src/components/rewards/RewardsSkeleton.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\design-token-violations.md` | file_path | `src/components/ui/chart.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\design-token-violations.md` | file_path | `src/components/ui/chart.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\design-token-violations.md` | file_path | `src/components/ui/chart.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\design-token-violations.md` | file_path | `src/components/ui/chart.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\design-token-violations.md` | file_path | `src/components/ui/chart.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\design-token-violations.md` | file_path | `src/components/ui/scroll-area.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\design-token-violations.md` | file_path | `src/components/ui/scroll-area.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\design-token-violations.md` | file_path | `src/components/ui/separator.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\design-token-violations.md` | file_path | `src/components/ui/separator.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\design-token-violations.md` | file_path | `src/components/ui/sidebar.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\design-token-violations.md` | file_path | `src/components/ui/textarea.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\design-token-violations.md` | file_path | `src/components/ui/toast.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\FLOW_VALIDATION_AUDIT.md` | file_path | `src/ai/flows/` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\FLOW_VALIDATION_AUDIT_REPORT.md` | file_path | `src/ai/flows/` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\FORGETTING_CURVE_AUDIT.md` | file_path | `src/ml/inference/predict_mastery.py` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\FORGETTING_CURVE_AUDIT.md` | file_path | `src/ai/adk/decision-engine.ts` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\FORGETTING_CURVE_AUDIT.md` | file_path | `src/ml/inference/predict_mastery.py` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\GENKIT_FLOW_VALIDATION_REPORT.md` | file_path | `src/ai/flows/` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\GENKIT_FLOW_VALIDATION_REPORT.md` | file_path | `src/ai/flows/` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\ML_DRIFT_REPORT.md` | file_path | `src/ml/features/student_features.ts` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\ML_DRIFT_REPORT.md` | file_path | `src/ml/training/generate_data.py` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\POLYGLOT_TYPE_CONSISTENCY_REPORT.md` | file_path | `src/ai/flows/smart-revision-planner.ts` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\POLYGLOT_TYPE_CONSISTENCY_REPORT.md` | file_path | `src/ml/features/student_features.ts` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\PRE_ROLLOUT_CHECKLIST.md` | file_path | `src/app/api/intelligence/student/route.ts` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\PRE_ROLLOUT_CHECKLIST.md` | endpoint | `/api/intelligence/student/route` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `docs\03_Audit_Reports_&_Validation\PRE_ROLLOUT_CHECKLIST.md` | command | `python --version` | Python script '--version' not found. | Check if the script exists. |
| `docs\03_Audit_Reports_&_Validation\PRE_ROLLOUT_CHECKLIST.md` | command | `python generate_data.py` | Python script 'generate_data.py' not found. | Check if the script exists. |
| `docs\03_Audit_Reports_&_Validation\PRE_ROLLOUT_CHECKLIST.md` | command | `python train_mastery_model.py` | Python script 'train_mastery_model.py' not found. | Check if the script exists. |
| `docs\03_Audit_Reports_&_Validation\PRE_ROLLOUT_CHECKLIST.md` | file_path | `src/ml/models/mastery_model.pkl` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\smart_revision_flow_integrity_report.md` | file_path | `src/ai/flows/smart-revision-planner.ts` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\smart_revision_flow_integrity_report.md` | file_path | `src/ai/flows/smart-revision-planner.ts` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\smart_revision_flow_integrity_report.md` | file_path | `src/components/planner/ScheduleView.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\typography-drift-report.md` | file_path | `src/app/test-accessibility/page.tsx` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\app\admin\dashboard\page.tsx, src\app\login\page.tsx, src\app\page.tsx, src\app\parent\dashboard\page.tsx, src\app\parent\onboarding\page.tsx, src\app\student\dashboard\page.tsx, src\app\student\map\page.tsx, src\app\student\onboarding\page.tsx, src\app\student\progress\page.tsx, src\app\student\revision\page.tsx, src\app\student\study\page.tsx, src\app\teacher\dashboard\page.tsx, src\app\teacher\onboarding\page.tsx, src\app\teacher\overview\page.tsx? |
| `docs\03_Audit_Reports_&_Validation\typography-drift-report.md` | file_path | `src/app/test-accessibility/page.tsx` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\app\admin\dashboard\page.tsx, src\app\login\page.tsx, src\app\page.tsx, src\app\parent\dashboard\page.tsx, src\app\parent\onboarding\page.tsx, src\app\student\dashboard\page.tsx, src\app\student\map\page.tsx, src\app\student\onboarding\page.tsx, src\app\student\progress\page.tsx, src\app\student\revision\page.tsx, src\app\student\study\page.tsx, src\app\teacher\dashboard\page.tsx, src\app\teacher\onboarding\page.tsx, src\app\teacher\overview\page.tsx? |
| `docs\03_Audit_Reports_&_Validation\typography-drift-report.md` | file_path | `src/app/test-accessibility/page.tsx` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\app\admin\dashboard\page.tsx, src\app\login\page.tsx, src\app\page.tsx, src\app\parent\dashboard\page.tsx, src\app\parent\onboarding\page.tsx, src\app\student\dashboard\page.tsx, src\app\student\map\page.tsx, src\app\student\onboarding\page.tsx, src\app\student\progress\page.tsx, src\app\student\revision\page.tsx, src\app\student\study\page.tsx, src\app\teacher\dashboard\page.tsx, src\app\teacher\onboarding\page.tsx, src\app\teacher\overview\page.tsx? |
| `docs\03_Audit_Reports_&_Validation\typography-drift-report.md` | file_path | `src/app/test-accessibility/page.tsx` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\app\admin\dashboard\page.tsx, src\app\login\page.tsx, src\app\page.tsx, src\app\parent\dashboard\page.tsx, src\app\parent\onboarding\page.tsx, src\app\student\dashboard\page.tsx, src\app\student\map\page.tsx, src\app\student\onboarding\page.tsx, src\app\student\progress\page.tsx, src\app\student\revision\page.tsx, src\app\student\study\page.tsx, src\app\teacher\dashboard\page.tsx, src\app\teacher\onboarding\page.tsx, src\app\teacher\overview\page.tsx? |
| `docs\03_Audit_Reports_&_Validation\typography-drift-report.md` | file_path | `src/app/test-accessibility/page.tsx` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\app\admin\dashboard\page.tsx, src\app\login\page.tsx, src\app\page.tsx, src\app\parent\dashboard\page.tsx, src\app\parent\onboarding\page.tsx, src\app\student\dashboard\page.tsx, src\app\student\map\page.tsx, src\app\student\onboarding\page.tsx, src\app\student\progress\page.tsx, src\app\student\revision\page.tsx, src\app\student\study\page.tsx, src\app\teacher\dashboard\page.tsx, src\app\teacher\onboarding\page.tsx, src\app\teacher\overview\page.tsx? |
| `docs\03_Audit_Reports_&_Validation\typography-drift-report.md` | file_path | `src/app/test-charts/page.tsx` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\app\admin\dashboard\page.tsx, src\app\login\page.tsx, src\app\page.tsx, src\app\parent\dashboard\page.tsx, src\app\parent\onboarding\page.tsx, src\app\student\dashboard\page.tsx, src\app\student\map\page.tsx, src\app\student\onboarding\page.tsx, src\app\student\progress\page.tsx, src\app\student\revision\page.tsx, src\app\student\study\page.tsx, src\app\teacher\dashboard\page.tsx, src\app\teacher\onboarding\page.tsx, src\app\teacher\overview\page.tsx? |
| `docs\03_Audit_Reports_&_Validation\typography-drift-report.md` | file_path | `src/components/app/header.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\typography-drift-report.md` | file_path | `src/components/app/sidebar-nav.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\typography-drift-report.md` | file_path | `src/components/app/sidebar-nav.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\typography-drift-report.md` | file_path | `src/components/app/teacher-sidebar-nav.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\typography-drift-report.md` | file_path | `src/components/app/teacher-sidebar-nav.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\typography-drift-report.md` | file_path | `src/components/app/teacher-sidebar-nav.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\typography-drift-report.md` | file_path | `src/components/app/teacher-sidebar-nav.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\typography-drift-report.md` | file_path | `src/components/planner/StudyLibrary.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\typography-drift-report.md` | file_path | `src/components/planner/StudyLibrary.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\typography-drift-report.md` | file_path | `src/components/planner/StudyLibrary.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\typography-drift-report.md` | file_path | `src/components/profile/StudentProfile.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\typography-drift-report.md` | file_path | `src/components/profile/StudentProfile.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\typography-drift-report.md` | file_path | `src/components/profile/StudentProfile.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\typography-drift-report.md` | file_path | `src/components/profile/TeacherProfile.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\typography-drift-report.md` | file_path | `src/components/profile/TeacherProfile.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\typography-drift-report.md` | file_path | `src/components/profile/TeacherProfile.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\typography-drift-report.md` | file_path | `src/components/profile/TeacherProfile.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\typography-drift-report.md` | file_path | `src/components/profile/TeacherProfile.tsx` | File not found on disk. |  |
| `docs\03_Audit_Reports_&_Validation\typography-drift-report.md` | file_path | `src/components/ui/calendar.tsx` | File not found on disk. |  |
| `docs\04_Performance_&_Optimization\BUNDLE_SIZE_REPORT.md` | file_path | `src/app/api/intelligence/student/route.ts` | File not found on disk. |  |
| `docs\04_Performance_&_Optimization\BUNDLE_SIZE_REPORT.md` | endpoint | `/api/intelligence/student/route` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `docs\04_Performance_&_Optimization\BUNDLE_SIZE_REPORT.md` | file_path | `src/app/api/activity/log/route.ts` | File not found on disk. |  |
| `docs\04_Performance_&_Optimization\BUNDLE_SIZE_REPORT.md` | endpoint | `/api/activity/log/route` | Endpoint '/api/activity/log' NOT found in src/app/api. |  |
| `docs\04_Performance_&_Optimization\LLM-Cost-Projection.md` | file_path | `src/ai/flows/` | File not found on disk. |  |
| `docs\04_Performance_&_Optimization\LLM-Cost-Projection.md` | file_path | `src/app/actions/ai-error.ts` | File not found on disk. |  |
| `docs\04_Performance_&_Optimization\LLM_TOKEN_USAGE_COST_PROJECTION.md` | file_path | `src/ai/flows/` | File not found on disk. |  |
| `docs\04_Performance_&_Optimization\ML_PERFORMANCE_REPORT.md` | file_path | `src/ml/training/test_set.csv` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\ml_model_integration.md` | file_path | `src/ml/models/mastery_model.pkl` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\ml_model_integration.md` | file_path | `src/ml/features/student_features.ts` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\ml_model_integration.md` | file_path | `src/ml/models/your_model_name.pkl` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\ml_model_integration.md` | file_path | `src/ml/inference/predict_your_task.py` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\ml_model_integration.md` | file_path | `src/ml/inference/` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\ml_model_integration.md` | command | `python predict_your_task.py` | Python script 'predict_your_task.py' not found. | Check if the script exists. |
| `docs\05_ML_AI_&_Genkit\ml_model_integration.md` | file_path | `src/ml/inference` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\ml_model_integration.md` | file_path | `src/ml/training/requirements.txt` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\ml\requirements.txt? |
| `docs\05_ML_AI_&_Genkit\ml_model_integration.md` | file_path | `src/ml/inference/` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\ML_QUICKSTART.md` | command | `python --version` | Python script '--version' not found. | Check if the script exists. |
| `docs\05_ML_AI_&_Genkit\ML_QUICKSTART.md` | command | `python generate_data.py` | Python script 'generate_data.py' not found. | Check if the script exists. |
| `docs\05_ML_AI_&_Genkit\ML_QUICKSTART.md` | command | `python train_mastery_model.py` | Python script 'train_mastery_model.py' not found. | Check if the script exists. |
| `docs\05_ML_AI_&_Genkit\ML_QUICKSTART.md` | command | `python predict_mastery.py` | Python script 'predict_mastery.py' not found. | Check if the script exists. |
| `docs\05_ML_AI_&_Genkit\ML_SETUP_GUIDE.md` | command | `python generate_data.py` | Python script 'generate_data.py' not found. | Check if the script exists. |
| `docs\05_ML_AI_&_Genkit\ML_SETUP_GUIDE.md` | command | `python train_mastery_model.py` | Python script 'train_mastery_model.py' not found. | Check if the script exists. |
| `docs\05_ML_AI_&_Genkit\ML_SETUP_GUIDE.md` | command | `python predict_mastery.py` | Python script 'predict_mastery.py' not found. | Check if the script exists. |
| `docs\05_ML_AI_&_Genkit\ML_SETUP_GUIDE.md` | command | `python api.py` | Python script 'api.py' not found. | Check if the script exists. |
| `docs\05_ML_AI_&_Genkit\ML_SETUP_GUIDE.md` | command | `python -m` | Python script '-m' not found. | Check if the script exists. |
| `docs\05_ML_AI_&_Genkit\ML_SETUP_GUIDE.md` | command | `python -m` | Python script '-m' not found. | Check if the script exists. |
| `docs\05_ML_AI_&_Genkit\ML_SETUP_GUIDE.md` | command | `python -m` | Python script '-m' not found. | Check if the script exists. |
| `docs\05_ML_AI_&_Genkit\mobile_responsive_coverage_report.md` | file_path | `src/components/planner/AddStudyMaterial.tsx` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\mobile_responsive_coverage_report.md` | file_path | `src/components/planner/StudyLibrary.tsx` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\RESPONSIVE_COVERAGE_REPORT.md` | file_path | `src/app/test-accessibility/page.tsx` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\app\admin\dashboard\page.tsx, src\app\login\page.tsx, src\app\page.tsx, src\app\parent\dashboard\page.tsx, src\app\parent\onboarding\page.tsx, src\app\student\dashboard\page.tsx, src\app\student\map\page.tsx, src\app\student\onboarding\page.tsx, src\app\student\progress\page.tsx, src\app\student\revision\page.tsx, src\app\student\study\page.tsx, src\app\teacher\dashboard\page.tsx, src\app\teacher\onboarding\page.tsx, src\app\teacher\overview\page.tsx? |
| `docs\05_ML_AI_&_Genkit\RESPONSIVE_COVERAGE_REPORT.md` | file_path | `src/app/test-charts/page.tsx` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\app\admin\dashboard\page.tsx, src\app\login\page.tsx, src\app\page.tsx, src\app\parent\dashboard\page.tsx, src\app\parent\onboarding\page.tsx, src\app\student\dashboard\page.tsx, src\app\student\map\page.tsx, src\app\student\onboarding\page.tsx, src\app\student\progress\page.tsx, src\app\student\revision\page.tsx, src\app\student\study\page.tsx, src\app\teacher\dashboard\page.tsx, src\app\teacher\onboarding\page.tsx, src\app\teacher\overview\page.tsx? |
| `docs\05_ML_AI_&_Genkit\RESPONSIVE_COVERAGE_REPORT.md` | file_path | `src/components/app/audio-conversation.tsx` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\RESPONSIVE_COVERAGE_REPORT.md` | file_path | `src/components/app/header.tsx` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\RESPONSIVE_COVERAGE_REPORT.md` | file_path | `src/components/app/sidebar-nav.tsx` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\RESPONSIVE_COVERAGE_REPORT.md` | file_path | `src/components/app/teacher-sidebar-nav.tsx` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\RESPONSIVE_COVERAGE_REPORT.md` | file_path | `src/components/planner/AddStudyMaterial.tsx` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\RESPONSIVE_COVERAGE_REPORT.md` | file_path | `src/components/planner/FocusTimer.tsx` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\RESPONSIVE_COVERAGE_REPORT.md` | file_path | `src/components/planner/ScheduleView.tsx` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\RESPONSIVE_COVERAGE_REPORT.md` | file_path | `src/components/planner/StudyLibrary.tsx` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\RESPONSIVE_COVERAGE_REPORT.md` | file_path | `src/components/profile/StudentProfile.tsx` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\RESPONSIVE_COVERAGE_REPORT.md` | file_path | `src/components/profile/TeacherProfile.tsx` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\RESPONSIVE_COVERAGE_REPORT.md` | file_path | `src/components/rewards/RewardsSkeleton.tsx` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\RESPONSIVE_COVERAGE_REPORT.md` | file_path | `src/components/settings/StudentProfileForm.tsx` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\RESPONSIVE_COVERAGE_REPORT.md` | file_path | `src/components/settings/TeacherProfileForm.tsx` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\RESPONSIVE_COVERAGE_REPORT.md` | file_path | `src/components/ui/accordion.tsx` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\RESPONSIVE_COVERAGE_REPORT.md` | file_path | `src/components/ui/carousel.tsx` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\RESPONSIVE_COVERAGE_REPORT.md` | file_path | `src/components/ui/chart.tsx` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\RESPONSIVE_COVERAGE_REPORT.md` | file_path | `src/components/ui/checkbox.tsx` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\RESPONSIVE_COVERAGE_REPORT.md` | file_path | `src/components/ui/dialog.tsx` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\RESPONSIVE_COVERAGE_REPORT.md` | file_path | `src/components/ui/dropdown-menu.tsx` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\RESPONSIVE_COVERAGE_REPORT.md` | file_path | `src/components/ui/menubar.tsx` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\RESPONSIVE_COVERAGE_REPORT.md` | file_path | `src/components/ui/select.tsx` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\RESPONSIVE_COVERAGE_REPORT.md` | file_path | `src/components/ui/sheet.tsx` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\RESPONSIVE_COVERAGE_REPORT.md` | file_path | `src/components/ui/sidebar.tsx` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\RESPONSIVE_COVERAGE_REPORT.md` | file_path | `src/components/ui/slider.tsx` | File not found on disk. |  |
| `docs\05_ML_AI_&_Genkit\RESPONSIVE_COVERAGE_REPORT.md` | file_path | `src/components/ui/toast.tsx` | File not found on disk. |  |
| `docs\07_Manuals_Guides_&_Setup\tutorial.md` | file_path | `src/ml/features/student_features.ts` | File not found on disk. |  |
| `docs\07_Manuals_Guides_&_Setup\tutorial.md` | file_path | `src/ml/training/train_mastery_model.py` | File not found on disk. |  |
| `docs\07_Manuals_Guides_&_Setup\tutorial.md` | command | `python generate_data.py` | Python script 'generate_data.py' not found. | Check if the script exists. |
| `docs\07_Manuals_Guides_&_Setup\tutorial.md` | command | `python train_mastery_model.py` | Python script 'train_mastery_model.py' not found. | Check if the script exists. |
| `docs\07_Manuals_Guides_&_Setup\tutorial.md` | file_path | `src/ml/inference/ml-bridge.ts` | File not found on disk. |  |
| `docs\07_Manuals_Guides_&_Setup\tutorial.md` | file_path | `src/ai/adk/decision-engine.ts` | File not found on disk. |  |
| `docs\07_Manuals_Guides_&_Setup\tutorial.md` | file_path | `src/app/api/intelligence/student/route.ts` | File not found on disk. |  |
| `docs\07_Manuals_Guides_&_Setup\tutorial.md` | endpoint | `/api/intelligence/student/route` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `docs\07_Manuals_Guides_&_Setup\tutorial.md` | endpoint | `/api/intelligence/student` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `docs\07_Manuals_Guides_&_Setup\tutorial.md` | endpoint | `/api/intelligence/student` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `docs\07_Manuals_Guides_&_Setup\tutorial.md` | endpoint | `/api/intelligence/student` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `docs\07_Manuals_Guides_&_Setup\tutorial.md` | file_path | `src/ml/training/train_forgetting_model.py` | File not found on disk. |  |
| `docs\07_Manuals_Guides_&_Setup\tutorial.md` | file_path | `src/ml/inference/predict_forgetting.py` | File not found on disk. |  |
| `docs\07_Manuals_Guides_&_Setup\tutorial.md` | file_path | `src/app/api/teacher/analytics/route.ts` | File not found on disk. |  |
| `docs\07_Manuals_Guides_&_Setup\tutorial.md` | endpoint | `/api/teacher/analytics/route` | Endpoint '/api/teacher/analytics' NOT found in src/app/api. |  |
| `docs\07_Manuals_Guides_&_Setup\tutorial.md` | command | `python train_mastery_model.py` | Python script 'train_mastery_model.py' not found. | Check if the script exists. |
| `docs\07_Manuals_Guides_&_Setup\tutorial.md` | file_path | `src/ml/training/requirements.txt` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\ml\requirements.txt? |
| `docs\07_Manuals_Guides_&_Setup\tutorial.md` | endpoint | `/api/quiz/submit` | Endpoint '/api/quiz/submit' NOT found in src/app/api. |  |
| `docs\07_Manuals_Guides_&_Setup\tutorial.md` | endpoint | `/api/intelligence/student` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `docs\07_Manuals_Guides_&_Setup\tutorial.md` | endpoint | `/api/intelligence/student/route` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `docs\08_Unclassified_&_Misc\debug.md` | endpoint | `/api/users/` | Endpoint '/api/users' NOT found in src/app/api. |  |
| `docs\08_Unclassified_&_Misc\debug.md` | endpoint | `/api/users/undefined` | Endpoint '/api/users/undefined' NOT found in src/app/api. |  |
| `docs\08_Unclassified_&_Misc\debug.md` | endpoint | `/api/intelligence/student` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `docs\08_Unclassified_&_Misc\debug.md` | endpoint | `/api/intelligence/student` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `docs\08_Unclassified_&_Misc\Development Status.md` | endpoint | `/api/student` | Endpoint '/api/student' NOT found in src/app/api. |  |
| `docs\08_Unclassified_&_Misc\Development Status.md` | endpoint | `/api/student/onboard` | Endpoint '/api/student/onboard' NOT found in src/app/api. |  |
| `docs\08_Unclassified_&_Misc\Development Status.md` | endpoint | `/api/student/graph` | Endpoint '/api/student/graph' NOT found in src/app/api. |  |
| `docs\08_Unclassified_&_Misc\Development Status.md` | endpoint | `/api/teacher` | Endpoint '/api/teacher' NOT found in src/app/api. |  |
| `docs\08_Unclassified_&_Misc\Development Status.md` | endpoint | `/api/teacher/onboard` | Endpoint '/api/teacher/onboard' NOT found in src/app/api. |  |
| `docs\08_Unclassified_&_Misc\Development Status.md` | endpoint | `/api/teacher/students` | Endpoint '/api/teacher/students' NOT found in src/app/api. |  |
| `docs\08_Unclassified_&_Misc\Development Status.md` | endpoint | `/api/teacher/graph` | Endpoint '/api/teacher/graph' NOT found in src/app/api. |  |
| `docs\08_Unclassified_&_Misc\Development Status.md` | endpoint | `/api/activity/log` | Endpoint '/api/activity/log' NOT found in src/app/api. |  |
| `docs\08_Unclassified_&_Misc\Development Status.md` | endpoint | `/api/users/[userId]` | Endpoint '/api/users/[userId]' NOT found in src/app/api. |  |
| `docs\08_Unclassified_&_Misc\Development Status.md` | endpoint | `/api/users/create` | Endpoint '/api/users/create' NOT found in src/app/api. |  |
| `docs\08_Unclassified_&_Misc\Development Status.md` | endpoint | `/api/quiz/submit` | Endpoint '/api/quiz/submit' NOT found in src/app/api. |  |
| `docs\08_Unclassified_&_Misc\Development Status.md` | endpoint | `/api/planner/data` | Endpoint '/api/planner/data' NOT found in src/app/api. |  |
| `docs\08_Unclassified_&_Misc\Development Status.md` | endpoint | `/api/classes/create` | Endpoint '/api/classes/create' NOT found in src/app/api. |  |
| `docs\08_Unclassified_&_Misc\Development Status.md` | endpoint | `/api/classes/join` | Endpoint '/api/classes/join' NOT found in src/app/api. |  |
| `docs\08_Unclassified_&_Misc\Features Overview.md` | file_path | `src/app/api/student/onboard/route.ts` | File not found on disk. |  |
| `docs\08_Unclassified_&_Misc\Features Overview.md` | endpoint | `/api/student/onboard/route` | Endpoint '/api/student/onboard' NOT found in src/app/api. |  |
| `docs\08_Unclassified_&_Misc\Features Overview.md` | file_path | `src/app/api/student/graph/route.ts` | File not found on disk. |  |
| `docs\08_Unclassified_&_Misc\Features Overview.md` | endpoint | `/api/student/graph/route` | Endpoint '/api/student/graph' NOT found in src/app/api. |  |
| `docs\08_Unclassified_&_Misc\Features Overview.md` | file_path | `src/components/app/sidebar-nav.tsx` | File not found on disk. |  |
| `docs\08_Unclassified_&_Misc\Features Overview.md` | file_path | `src/app/api/quiz/submit/route.ts` | File not found on disk. |  |
| `docs\08_Unclassified_&_Misc\Features Overview.md` | endpoint | `/api/quiz/submit/route` | Endpoint '/api/quiz/submit' NOT found in src/app/api. |  |
| `docs\08_Unclassified_&_Misc\Features Overview.md` | file_path | `src/app/api/teacher/onboard/route.ts` | File not found on disk. |  |
| `docs\08_Unclassified_&_Misc\Features Overview.md` | endpoint | `/api/teacher/onboard/route` | Endpoint '/api/teacher/onboard' NOT found in src/app/api. |  |
| `docs\08_Unclassified_&_Misc\Features Overview.md` | file_path | `src/app/api/teacher/students/route.ts` | File not found on disk. |  |
| `docs\08_Unclassified_&_Misc\Features Overview.md` | endpoint | `/api/teacher/students/route` | Endpoint '/api/teacher/students' NOT found in src/app/api. |  |
| `docs\08_Unclassified_&_Misc\Features Overview.md` | file_path | `src/app/api/teacher/graph/route.ts` | File not found on disk. |  |
| `docs\08_Unclassified_&_Misc\Features Overview.md` | endpoint | `/api/teacher/graph/route` | Endpoint '/api/teacher/graph' NOT found in src/app/api. |  |
| `docs\08_Unclassified_&_Misc\Features Overview.md` | file_path | `src/components/app/teacher-sidebar-nav.tsx` | File not found on disk. |  |
| `docs\08_Unclassified_&_Misc\POLYGLOT_REPORT.md` | file_path | `src/ml/training/generate_data.py` | File not found on disk. |  |
| `docs\08_Unclassified_&_Misc\POLYGLOT_REPORT.md` | file_path | `src/ml/inference/types.ts` | File not found on disk. |  |
| `docs\08_Unclassified_&_Misc\POLYGLOT_REPORT.md` | file_path | `src/ai/flows/adaptive-quiz-engine.ts` | File not found on disk. |  |
| `docs\08_Unclassified_&_Misc\POLYGLOT_REPORT.md` | file_path | `src/ai/flows/adaptive-quiz-engine.ts` | File not found on disk. |  |
| `docs\08_Unclassified_&_Misc\POLYGLOT_REPORT.md` | file_path | `src/ml/features/student_features.ts` | File not found on disk. |  |
| `docs\CODEBASE_FLOW_DIAGRAM.md` | endpoint | `/api/users/create` | Endpoint '/api/users/create' NOT found in src/app/api. |  |
| `docs\CODEBASE_FLOW_DIAGRAM.md` | endpoint | `/api/users/[userId]` | Endpoint '/api/users/[userId]' NOT found in src/app/api. |  |
| `docs\CODEBASE_FLOW_DIAGRAM.md` | endpoint | `/api/students/create` | Endpoint '/api/students/create' NOT found in src/app/api. |  |
| `docs\CODEBASE_FLOW_DIAGRAM.md` | endpoint | `/api/teachers/create` | Endpoint '/api/teachers/create' NOT found in src/app/api. |  |
| `docs\CODEBASE_FLOW_DIAGRAM.md` | endpoint | `/api/student` | Endpoint '/api/student' NOT found in src/app/api. |  |
| `docs\CODEBASE_FLOW_DIAGRAM.md` | endpoint | `/api/student/onboard` | Endpoint '/api/student/onboard' NOT found in src/app/api. |  |
| `docs\CODEBASE_FLOW_DIAGRAM.md` | endpoint | `/api/student/graph` | Endpoint '/api/student/graph' NOT found in src/app/api. |  |
| `docs\CODEBASE_FLOW_DIAGRAM.md` | endpoint | `/api/teacher` | Endpoint '/api/teacher' NOT found in src/app/api. |  |
| `docs\CODEBASE_FLOW_DIAGRAM.md` | endpoint | `/api/teacher/onboard` | Endpoint '/api/teacher/onboard' NOT found in src/app/api. |  |
| `docs\CODEBASE_FLOW_DIAGRAM.md` | endpoint | `/api/teacher/students` | Endpoint '/api/teacher/students' NOT found in src/app/api. |  |
| `docs\CODEBASE_FLOW_DIAGRAM.md` | endpoint | `/api/teacher/classes` | Endpoint '/api/teacher/classes' NOT found in src/app/api. |  |
| `docs\CODEBASE_FLOW_DIAGRAM.md` | endpoint | `/api/teacher/graph` | Endpoint '/api/teacher/graph' NOT found in src/app/api. |  |
| `docs\CODEBASE_FLOW_DIAGRAM.md` | endpoint | `/api/classes/create` | Endpoint '/api/classes/create' NOT found in src/app/api. |  |
| `docs\CODEBASE_FLOW_DIAGRAM.md` | endpoint | `/api/classes/join` | Endpoint '/api/classes/join' NOT found in src/app/api. |  |
| `docs\CODEBASE_FLOW_DIAGRAM.md` | endpoint | `/api/classes/leave` | Endpoint '/api/classes/leave' NOT found in src/app/api. |  |
| `docs\CODEBASE_FLOW_DIAGRAM.md` | endpoint | `/api/quiz/submit` | Endpoint '/api/quiz/submit' NOT found in src/app/api. |  |
| `docs\CODEBASE_FLOW_DIAGRAM.md` | endpoint | `/api/planner/` | Endpoint '/api/planner' NOT found in src/app/api. |  |
| `docs\CODEBASE_FLOW_DIAGRAM.md` | endpoint | `/api/brainmap/nodes` | Endpoint '/api/brainmap/nodes' NOT found in src/app/api. |  |
| `docs\CODEBASE_FLOW_DIAGRAM.md` | endpoint | `/api/syllabus/save` | Endpoint '/api/syllabus/save' NOT found in src/app/api. |  |
| `docs\CODEBASE_FLOW_DIAGRAM.md` | endpoint | `/api/intelligence/student` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `docs\CODEBASE_FLOW_DIAGRAM.md` | endpoint | `/api/sankalp/session/start` | Endpoint '/api/sankalp/session/start' NOT found in src/app/api. |  |
| `docs\CODEBASE_FLOW_DIAGRAM.md` | endpoint | `/api/sankalp/session/end` | Endpoint '/api/sankalp/session/end' NOT found in src/app/api. |  |
| `docs\CODEBASE_FLOW_DIAGRAM.md` | endpoint | `/api/activity/log` | Endpoint '/api/activity/log' NOT found in src/app/api. |  |
| `docs\finished_reports\accessibility-report.md` | file_path | `src/app/test-accessibility/page.tsx` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\app\admin\dashboard\page.tsx, src\app\login\page.tsx, src\app\page.tsx, src\app\parent\dashboard\page.tsx, src\app\parent\onboarding\page.tsx, src\app\student\dashboard\page.tsx, src\app\student\map\page.tsx, src\app\student\onboarding\page.tsx, src\app\student\progress\page.tsx, src\app\student\revision\page.tsx, src\app\student\study\page.tsx, src\app\teacher\dashboard\page.tsx, src\app\teacher\onboarding\page.tsx, src\app\teacher\overview\page.tsx? |
| `docs\finished_reports\API_NAMING_AUDIT.md` | endpoint | `/api/activity/log` | Endpoint '/api/activity/log' NOT found in src/app/api. |  |
| `docs\finished_reports\API_NAMING_AUDIT.md` | endpoint | `/api/classes/create` | Endpoint '/api/classes/create' NOT found in src/app/api. |  |
| `docs\finished_reports\API_NAMING_AUDIT.md` | endpoint | `/api/classes/create` | Endpoint '/api/classes/create' NOT found in src/app/api. |  |
| `docs\finished_reports\API_NAMING_AUDIT.md` | endpoint | `/api/classes/join` | Endpoint '/api/classes/join' NOT found in src/app/api. |  |
| `docs\finished_reports\API_NAMING_AUDIT.md` | endpoint | `/api/classes/leave` | Endpoint '/api/classes/leave' NOT found in src/app/api. |  |
| `docs\finished_reports\API_NAMING_AUDIT.md` | endpoint | `/api/intelligence/student` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `docs\finished_reports\API_NAMING_AUDIT.md` | endpoint | `/api/planner/convert-to-node` | Endpoint '/api/planner/convert-to-node' NOT found in src/app/api. |  |
| `docs\finished_reports\API_NAMING_AUDIT.md` | endpoint | `/api/planner/data` | Endpoint '/api/planner/data' NOT found in src/app/api. |  |
| `docs\finished_reports\API_NAMING_AUDIT.md` | endpoint | `/api/planner/review` | Endpoint '/api/planner/review' NOT found in src/app/api. |  |
| `docs\finished_reports\API_NAMING_AUDIT.md` | endpoint | `/api/quiz/submit` | Endpoint '/api/quiz/submit' NOT found in src/app/api. |  |
| `docs\finished_reports\API_NAMING_AUDIT.md` | endpoint | `/api/sankalp/session/end` | Endpoint '/api/sankalp/session/end' NOT found in src/app/api. |  |
| `docs\finished_reports\API_NAMING_AUDIT.md` | endpoint | `/api/sankalp/session/start` | Endpoint '/api/sankalp/session/start' NOT found in src/app/api. |  |
| `docs\finished_reports\API_NAMING_AUDIT.md` | endpoint | `/api/student/graph` | Endpoint '/api/student/graph' NOT found in src/app/api. |  |
| `docs\finished_reports\API_NAMING_AUDIT.md` | endpoint | `/api/student/onboard` | Endpoint '/api/student/onboard' NOT found in src/app/api. |  |
| `docs\finished_reports\API_NAMING_AUDIT.md` | endpoint | `/api/student` | Endpoint '/api/student' NOT found in src/app/api. |  |
| `docs\finished_reports\API_NAMING_AUDIT.md` | endpoint | `/api/students/create` | Endpoint '/api/students/create' NOT found in src/app/api. |  |
| `docs\finished_reports\API_NAMING_AUDIT.md` | endpoint | `/api/students/create` | Endpoint '/api/students/create' NOT found in src/app/api. |  |
| `docs\finished_reports\API_NAMING_AUDIT.md` | endpoint | `/api/syllabus/save` | Endpoint '/api/syllabus/save' NOT found in src/app/api. |  |
| `docs\finished_reports\API_NAMING_AUDIT.md` | endpoint | `/api/teacher/graph` | Endpoint '/api/teacher/graph' NOT found in src/app/api. |  |
| `docs\finished_reports\API_NAMING_AUDIT.md` | endpoint | `/api/teacher/onboard` | Endpoint '/api/teacher/onboard' NOT found in src/app/api. |  |
| `docs\finished_reports\API_NAMING_AUDIT.md` | endpoint | `/api/teacher` | Endpoint '/api/teacher' NOT found in src/app/api. |  |
| `docs\finished_reports\API_NAMING_AUDIT.md` | endpoint | `/api/teachers/create` | Endpoint '/api/teachers/create' NOT found in src/app/api. |  |
| `docs\finished_reports\API_NAMING_AUDIT.md` | endpoint | `/api/teachers/create` | Endpoint '/api/teachers/create' NOT found in src/app/api. |  |
| `docs\finished_reports\API_NAMING_AUDIT.md` | endpoint | `/api/test/seed` | Endpoint '/api/test/seed' NOT found in src/app/api. |  |
| `docs\finished_reports\API_NAMING_AUDIT.md` | endpoint | `/api/users/create` | Endpoint '/api/users/create' NOT found in src/app/api. |  |
| `docs\finished_reports\API_NAMING_AUDIT.md` | endpoint | `/api/users/create` | Endpoint '/api/users/create' NOT found in src/app/api. |  |
| `docs\finished_reports\API_NAMING_AUDIT.md` | endpoint | `/api/students` | Endpoint '/api/students' NOT found in src/app/api. |  |
| `docs\finished_reports\API_NAMING_AUDIT.md` | endpoint | `/api/student` | Endpoint '/api/student' NOT found in src/app/api. |  |
| `docs\finished_reports\API_NAMING_AUDIT.md` | endpoint | `/api/students` | Endpoint '/api/students' NOT found in src/app/api. |  |
| `docs\finished_reports\API_NAMING_AUDIT.md` | endpoint | `/api/getStudents` | Endpoint '/api/getStudents' NOT found in src/app/api. |  |
| `docs\finished_reports\API_NAMING_AUDIT.md` | endpoint | `/api/user-profiles` | Endpoint '/api/user-profiles' NOT found in src/app/api. |  |
| `docs\finished_reports\CHATBOT_CONTEXT_HEALTH_REPORT.md` | file_path | `src/ai/flows/multilingual-cognitive-chatbot.ts` | File not found on disk. |  |
| `docs\finished_reports\CHATBOT_CONTEXT_HEALTH_REPORT.md` | file_path | `src/ai/flows/custom-cognitive-chatbot.ts` | File not found on disk. |  |
| `docs\finished_reports\CHATBOT_CONTEXT_HEALTH_REPORT.md` | file_path | `src/ai/flows/mindful-mentor.ts` | File not found on disk. |  |
| `docs\finished_reports\CHATBOT_CONTEXT_HEALTH_REPORT.md` | file_path | `src/ai/flows/mindful-mentor.ts` | File not found on disk. |  |
| `docs\finished_reports\CHATBOT_CONTEXT_REPORT.md` | file_path | `src/ai/flows/mindful-mentor.ts` | File not found on disk. |  |
| `docs\finished_reports\COST_OPTIMIZATION_REPORT.md` | file_path | `src/ai/flows/` | File not found on disk. |  |
| `docs\finished_reports\COST_OPTIMIZATION_REPORT.md` | file_path | `src/ai/flows/smart-revision-planner.ts` | File not found on disk. |  |
| `docs\finished_reports\COST_OPTIMIZATION_REPORT.md` | file_path | `src/app/api/intelligence/student/route.ts` | File not found on disk. |  |
| `docs\finished_reports\COST_OPTIMIZATION_REPORT.md` | endpoint | `/api/intelligence/student/route` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `docs\finished_reports\COST_OPTIMIZATION_REPORT.md` | file_path | `src/ai/flows/speech-to-speech.ts` | File not found on disk. |  |
| `docs\finished_reports\COST_OPTIMIZATION_REPORT.md` | endpoint | `/api/intelligence/student` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `docs\finished_reports\COST_OPTIMIZATION_REPORT.md` | endpoint | `/api/quiz/submit` | Endpoint '/api/quiz/submit' NOT found in src/app/api. |  |
| `docs\finished_reports\COST_PROJECTION.md` | file_path | `src/ai/flows/` | File not found on disk. |  |
| `docs\finished_reports\COST_PROJECTION.md` | file_path | `src/ai/flows/` | File not found on disk. |  |
| `docs\finished_reports\COST_PROJECTION.md` | file_path | `src/ai/flows/adaptive-quiz-engine.ts` | File not found on disk. |  |
| `docs\finished_reports\COST_PROJECTION.md` | file_path | `src/ai/flows/syllabus-generator.ts` | File not found on disk. |  |
| `docs\finished_reports\COST_PROJECTION.md` | file_path | `src/ai/flows/smart-revision-planner.ts` | File not found on disk. |  |
| `docs\finished_reports\COST_PROJECTION.md` | file_path | `src/ai/flows/mindful-mentor.ts` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_INVENTORY.md` | file_path | `src/components/ui/accordion.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_INVENTORY.md` | file_path | `src/components/ui/alert-dialog.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_INVENTORY.md` | file_path | `src/components/ui/alert.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_INVENTORY.md` | file_path | `src/components/ui/calendar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_INVENTORY.md` | file_path | `src/components/ui/carousel.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_INVENTORY.md` | file_path | `src/components/ui/collapsible.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_INVENTORY.md` | file_path | `src/components/ui/dropdown-menu.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_INVENTORY.md` | file_path | `src/components/ui/menubar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_INVENTORY.md` | file_path | `src/components/ui/popover.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_INVENTORY.md` | file_path | `src/components/ui/slider.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_INVENTORY.md` | file_path | `src/components/ui/table.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_INVENTORY.md` | file_path | `src/components/ui/toast.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_INVENTORY.md` | file_path | `src/lib/middleware/auth.ts` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\lib\auth.ts? |
| `docs\finished_reports\DEAD_CODE_INVENTORY.md` | file_path | `src/lib/rewards/calculateRewards.ts` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_INVENTORY.md` | file_path | `src/lib/validations/auth.ts` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\lib\auth.ts? |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/accordion.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/accordion.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/accordion.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/accordion.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/alert-dialog.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/alert-dialog.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/alert.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/alert.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/badge.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/badge.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/calendar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/carousel.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/carousel.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/carousel.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/carousel.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/carousel.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/carousel.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/chart.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/chart.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/chart.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/chart.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/collapsible.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/collapsible.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/collapsible.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/dialog.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/dialog.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/dialog.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/dropdown-menu.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/dropdown-menu.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/dropdown-menu.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/dropdown-menu.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/dropdown-menu.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/dropdown-menu.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/form.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/form.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/menubar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/menubar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/menubar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/menubar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/menubar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/menubar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/menubar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/menubar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/menubar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/menubar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/menubar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/menubar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/menubar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/menubar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/menubar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/menubar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/popover.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/popover.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/popover.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/scroll-area.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/select.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/select.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/select.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/select.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/select.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/sheet.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/sheet.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/sheet.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/sheet.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/sheet.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/sheet.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/sheet.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/sheet.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/sidebar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/sidebar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/sidebar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/sidebar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/sidebar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/sidebar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/sidebar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/sidebar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/sidebar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/sidebar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/sidebar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/sidebar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/sidebar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/sidebar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/sidebar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/slider.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/table.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/table.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/components/ui/toast.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/lib/middleware/auth.ts` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\lib\auth.ts? |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/lib/middleware/auth.ts` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\lib\auth.ts? |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/lib/middleware/auth.ts` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\lib\auth.ts? |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/lib/middleware/auth.ts` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\lib\auth.ts? |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/lib/middleware/auth.ts` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\lib\auth.ts? |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/lib/rewards/calculateRewards.ts` | File not found on disk. |  |
| `docs\finished_reports\DEAD_CODE_REPORT.md` | file_path | `src/lib/rewards/calculateRewards.ts` | File not found on disk. |  |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | file_path | `src/app/api/classes/join/route.ts` | File not found on disk. |  |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | endpoint | `/api/classes/join/route` | Endpoint '/api/classes/join' NOT found in src/app/api. |  |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | file_path | `src/app/api/classes/leave/route.ts` | File not found on disk. |  |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | endpoint | `/api/classes/leave/route` | Endpoint '/api/classes/leave' NOT found in src/app/api. |  |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | file_path | `src/app/api/student/route.ts` | File not found on disk. |  |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | endpoint | `/api/student/route` | Endpoint '/api/student' NOT found in src/app/api. |  |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | file_path | `src/lib/middleware/auth.ts` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\lib\auth.ts? |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | file_path | `src/app/api/intelligence/student/route.ts` | File not found on disk. |  |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | endpoint | `/api/intelligence/student/route` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | file_path | `src/components/ui/menubar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | file_path | `src/app/api/users/create/route.ts` | File not found on disk. |  |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | endpoint | `/api/users/create/route` | Endpoint '/api/users/create' NOT found in src/app/api. |  |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | file_path | `src/app/test-charts/page.tsx` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\app\admin\dashboard\page.tsx, src\app\login\page.tsx, src\app\page.tsx, src\app\parent\dashboard\page.tsx, src\app\parent\onboarding\page.tsx, src\app\student\dashboard\page.tsx, src\app\student\map\page.tsx, src\app\student\onboarding\page.tsx, src\app\student\progress\page.tsx, src\app\student\revision\page.tsx, src\app\student\study\page.tsx, src\app\teacher\dashboard\page.tsx, src\app\teacher\onboarding\page.tsx, src\app\teacher\overview\page.tsx? |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | file_path | `src/app/api/users/create/route.ts` | File not found on disk. |  |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | endpoint | `/api/users/create/route` | Endpoint '/api/users/create' NOT found in src/app/api. |  |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | file_path | `src/components/ui/menubar.tsx` | File not found on disk. |  |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | file_path | `src/lib/middleware/auth.ts` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\lib\auth.ts? |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | endpoint | `/api/classes/join` | Endpoint '/api/classes/join' NOT found in src/app/api. |  |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | endpoint | `/api/users/create` | Endpoint '/api/users/create' NOT found in src/app/api. |  |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | endpoint | `/api/student/onboard` | Endpoint '/api/student/onboard' NOT found in src/app/api. |  |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | endpoint | `/api/student` | Endpoint '/api/student' NOT found in src/app/api. |  |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | endpoint | `/api/students/create` | Endpoint '/api/students/create' NOT found in src/app/api. |  |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | endpoint | `/api/teacher` | Endpoint '/api/teacher' NOT found in src/app/api. |  |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | endpoint | `/api/teachers/create` | Endpoint '/api/teachers/create' NOT found in src/app/api. |  |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | file_path | `src/app/api/student/route.ts` | File not found on disk. |  |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | endpoint | `/api/student/route` | Endpoint '/api/student' NOT found in src/app/api. |  |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | file_path | `src/app/api/activity/log/route.ts` | File not found on disk. |  |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | endpoint | `/api/activity/log/route` | Endpoint '/api/activity/log' NOT found in src/app/api. |  |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | file_path | `src/app/api/chaos/route.ts` | File not found on disk. |  |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | endpoint | `/api/chaos/route` | Endpoint '/api/chaos' NOT found in src/app/api. |  |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | file_path | `src/app/api/` | File not found on disk. |  |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | file_path | `src/app/api/users/create/route.ts` | File not found on disk. |  |
| `docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md` | endpoint | `/api/users/create/route` | Endpoint '/api/users/create' NOT found in src/app/api. |  |
| `docs\finished_reports\DOC_DRIFT_REPORT.md` | file_path | `docs/Features` | File not found on disk. |  |
| `docs\finished_reports\DOC_DRIFT_REPORT.md` | file_path | `docs/Features` | File not found on disk. |  |
| `docs\finished_reports\DOC_DRIFT_REPORT.md` | file_path | `docs/Features` | File not found on disk. |  |
| `docs\finished_reports\DOC_DRIFT_REPORT.md` | file_path | `docs/Features` | File not found on disk. |  |
| `docs\finished_reports\DOC_DRIFT_REPORT.md` | file_path | `src/components/app/sidebar-nav.tsx` | File not found on disk. |  |
| `docs\finished_reports\DOC_DRIFT_REPORT.md` | file_path | `docs/Features` | File not found on disk. |  |
| `docs\finished_reports\DOC_DRIFT_REPORT.md` | file_path | `docs/Features` | File not found on disk. |  |
| `docs\finished_reports\DOC_DRIFT_REPORT.md` | file_path | `docs/Features` | File not found on disk. |  |
| `docs\finished_reports\DOC_DRIFT_REPORT.md` | file_path | `docs/Features` | File not found on disk. |  |
| `docs\finished_reports\DOC_DRIFT_REPORT.md` | file_path | `docs/Features` | File not found on disk. |  |
| `docs\finished_reports\DOC_DRIFT_REPORT.md` | file_path | `docs/Features` | File not found on disk. |  |
| `docs\finished_reports\DOC_DRIFT_REPORT.md` | file_path | `docs/Features` | File not found on disk. |  |
| `docs\finished_reports\DOC_DRIFT_REPORT.md` | file_path | `docs/Features` | File not found on disk. |  |
| `docs\finished_reports\DOC_DRIFT_REPORT.md` | file_path | `src/components/app/teacher-sidebar-nav.tsx` | File not found on disk. |  |
| `docs\finished_reports\DOC_DRIFT_REPORT.md` | file_path | `docs/Features` | File not found on disk. |  |
| `docs\finished_reports\DOC_DRIFT_REPORT.md` | file_path | `docs/Features` | File not found on disk. |  |
| `docs\finished_reports\DOC_DRIFT_REPORT.md` | file_path | `docs/Features` | File not found on disk. |  |
| `docs\finished_reports\DOC_DRIFT_REPORT.md` | file_path | `src/ai/flows/syllabus-generator.ts` | File not found on disk. |  |
| `docs\finished_reports\ERROR_BOUNDARY_COVERAGE.md` | file_path | `src/app/error.tsx` | File not found on disk. |  |
| `docs\finished_reports\ERROR_BOUNDARY_COVERAGE.md` | file_path | `src/app/global-error.tsx` | File not found on disk. |  |
| `docs\finished_reports\ERROR_PROPAGATION.md` | file_path | `src/ml/inference/ml-bridge.ts` | File not found on disk. |  |
| `docs\finished_reports\EXPLAINABILITY_DRIFT_REPORT.md` | file_path | `src/ai/flows/smart-revision-planner.ts` | File not found on disk. |  |
| `docs\finished_reports\I18N_READINESS_REPORT.md` | file_path | `src/app/test-accessibility/page.tsx` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\app\admin\dashboard\page.tsx, src\app\login\page.tsx, src\app\page.tsx, src\app\parent\dashboard\page.tsx, src\app\parent\onboarding\page.tsx, src\app\student\dashboard\page.tsx, src\app\student\map\page.tsx, src\app\student\onboarding\page.tsx, src\app\student\progress\page.tsx, src\app\student\revision\page.tsx, src\app\student\study\page.tsx, src\app\teacher\dashboard\page.tsx, src\app\teacher\onboarding\page.tsx, src\app\teacher\overview\page.tsx? |
| `docs\finished_reports\I18N_READINESS_REPORT.md` | file_path | `src/components/planner/AddStudyMaterial.tsx` | File not found on disk. |  |
| `docs\finished_reports\I18N_READINESS_REPORT.md` | file_path | `src/components/profile/StudentProfile.tsx` | File not found on disk. |  |
| `docs\finished_reports\I18N_READINESS_REPORT.md` | file_path | `src/components/planner/FocusTimer.tsx` | File not found on disk. |  |
| `docs\finished_reports\I18N_READINESS_REPORT.md` | file_path | `src/components/planner/StudyLibrary.tsx` | File not found on disk. |  |
| `docs\finished_reports\I18N_READINESS_REPORT.md` | file_path | `src/components/profile/TeacherProfile.tsx` | File not found on disk. |  |
| `docs\finished_reports\I18N_READINESS_REPORT.md` | file_path | `src/components/settings/StudentProfileForm.tsx` | File not found on disk. |  |
| `docs\finished_reports\I18N_READINESS_REPORT.md` | file_path | `src/components/settings/TeacherProfileForm.tsx` | File not found on disk. |  |
| `docs\finished_reports\I18N_READINESS_REPORT.md` | file_path | `src/components/planner/ScheduleView.tsx` | File not found on disk. |  |
| `docs\finished_reports\I18N_READINESS_REPORT.md` | file_path | `src/components/app/teacher-sidebar-nav.tsx` | File not found on disk. |  |
| `docs\finished_reports\I18N_READINESS_REPORT.md` | file_path | `src/components/app/header.tsx` | File not found on disk. |  |
| `docs\finished_reports\I18N_READINESS_REPORT.md` | file_path | `src/components/app/sidebar-nav.tsx` | File not found on disk. |  |
| `docs\finished_reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/sidebar.tsx` | File not found on disk. |  |
| `docs\finished_reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/carousel.tsx` | File not found on disk. |  |
| `docs\finished_reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/sheet.tsx` | File not found on disk. |  |
| `docs\finished_reports\I18N_READINESS_REPORT.md` | file_path | `src/app/api/intelligence/student/route.ts` | File not found on disk. |  |
| `docs\finished_reports\I18N_READINESS_REPORT.md` | endpoint | `/api/intelligence/student/route` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `docs\finished_reports\I18N_READINESS_REPORT.md` | file_path | `src/app/api/teacher/students/route.ts` | File not found on disk. |  |
| `docs\finished_reports\I18N_READINESS_REPORT.md` | endpoint | `/api/teacher/students/route` | Endpoint '/api/teacher/students' NOT found in src/app/api. |  |
| `docs\finished_reports\I18N_READINESS_REPORT.md` | file_path | `src/app/test-charts/page.tsx` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\app\admin\dashboard\page.tsx, src\app\login\page.tsx, src\app\page.tsx, src\app\parent\dashboard\page.tsx, src\app\parent\onboarding\page.tsx, src\app\student\dashboard\page.tsx, src\app\student\map\page.tsx, src\app\student\onboarding\page.tsx, src\app\student\progress\page.tsx, src\app\student\revision\page.tsx, src\app\student\study\page.tsx, src\app\teacher\dashboard\page.tsx, src\app\teacher\onboarding\page.tsx, src\app\teacher\overview\page.tsx? |
| `docs\finished_reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/dialog.tsx` | File not found on disk. |  |
| `docs\finished_reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/toast.tsx` | File not found on disk. |  |
| `docs\finished_reports\LOADING_STATE_CONSISTENCY.md` | file_path | `src/components/app/audio-conversation.tsx` | File not found on disk. |  |
| `docs\finished_reports\LOADING_STATE_CONSISTENCY.md` | file_path | `src/components/planner/AddStudyMaterial.tsx` | File not found on disk. |  |
| `docs\finished_reports\LOADING_STATE_CONSISTENCY.md` | file_path | `src/components/planner/ScheduleView.tsx` | File not found on disk. |  |
| `docs\finished_reports\LOADING_STATE_CONSISTENCY.md` | file_path | `src/components/profile/StudentProfile.tsx` | File not found on disk. |  |
| `docs\finished_reports\LOADING_STATE_CONSISTENCY.md` | file_path | `src/components/profile/TeacherProfile.tsx` | File not found on disk. |  |
| `docs\finished_reports\LOADING_STATE_CONSISTENCY.md` | file_path | `src/components/rewards/RewardsSkeleton.tsx` | File not found on disk. |  |
| `docs\finished_reports\LOADING_STATE_CONSISTENCY.md` | file_path | `src/components/settings/StudentProfileForm.tsx` | File not found on disk. |  |
| `docs\finished_reports\LOADING_STATE_CONSISTENCY.md` | file_path | `src/components/settings/TeacherProfileForm.tsx` | File not found on disk. |  |
| `docs\finished_reports\LOADING_STATE_CONSISTENCY.md` | file_path | `src/components/ui/sidebar.tsx` | File not found on disk. |  |
| `docs\finished_reports\LOADING_STATE_CONSISTENCY.md` | file_path | `src/components/ui/skeleton.tsx` | File not found on disk. |  |
| `docs\finished_reports\ML_DEPLOYMENT_MATURITY.md` | file_path | `src/ml/models/mastery_model.pkl` | File not found on disk. |  |
| `docs\finished_reports\ML_DEPLOYMENT_MATURITY.md` | file_path | `src/ml/models/provenance_report.json` | File not found on disk. |  |
| `docs\finished_reports\PRIVACY_COMPLIANCE_REPORT.md` | file_path | `src/components/ui/sidebar.tsx` | File not found on disk. |  |
| `docs\finished_reports\QUIZ_DIFFICULTY_ALIGNMENT_REPORT.md` | file_path | `src/ai/flows/adaptive-quiz-engine.ts` | File not found on disk. |  |
| `docs\finished_reports\QUIZ_DIFFICULTY_REPORT.md` | file_path | `src/ai/flows/adaptive-quiz-engine.ts` | File not found on disk. |  |
| `docs\finished_reports\RESPONSIVE_BREAKPOINT_COVERAGE_REPORT.md` | file_path | `src/components/planner/StudyLibrary.tsx` | File not found on disk. |  |
| `docs\finished_reports\RESPONSIVE_BREAKPOINT_COVERAGE_REPORT.md` | file_path | `src/components/rewards/RewardsSkeleton.tsx` | File not found on disk. |  |
| `docs\finished_reports\RESPONSIVE_BREAKPOINT_COVERAGE_REPORT.md` | file_path | `src/components/rewards/RewardsSkeleton.tsx` | File not found on disk. |  |
| `docs\finished_reports\RESPONSIVE_BREAKPOINT_COVERAGE_REPORT.md` | file_path | `src/components/rewards/RewardsSkeleton.tsx` | File not found on disk. |  |
| `docs\finished_reports\SERVER_ACTION_SECURITY_MATRIX.md` | file_path | `src/app/actions/student-configuration.ts` | File not found on disk. |  |
| `docs\finished_reports\SERVER_ACTION_SECURITY_MATRIX.md` | file_path | `src/app/actions/ai-error.ts` | File not found on disk. |  |
| `docs\finished_reports\SESSION_PERSISTENCE_REPORT.md` | file_path | `src/hooks/use-local-storage.ts` | File not found on disk. |  |
| `docs\finished_reports\STRICT_MODE_VIOLATIONS.md` | file_path | `src/components/planner/FocusTimer.tsx` | File not found on disk. |  |
| `docs\finished_reports\STRICT_MODE_VIOLATIONS.md` | file_path | `src/app/api/chaos/route.ts` | File not found on disk. |  |
| `docs\finished_reports\STRICT_MODE_VIOLATIONS.md` | endpoint | `/api/chaos/route` | Endpoint '/api/chaos' NOT found in src/app/api. |  |
| `docs\finished_reports\STRICT_MODE_VIOLATIONS.md` | file_path | `src/ai/flows/smart-revision-planner.ts` | File not found on disk. |  |
| `docs\finished_reports\STRICT_MODE_VIOLATIONS.md` | file_path | `src/app/api/intelligence/student/route.ts` | File not found on disk. |  |
| `docs\finished_reports\STRICT_MODE_VIOLATIONS.md` | endpoint | `/api/intelligence/student/route` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `docs\finished_reports\STRICT_MODE_VIOLATIONS.md` | file_path | `src/components/planner/AddStudyMaterial.tsx` | File not found on disk. |  |
| `docs\finished_reports\TEACHER_PERMISSION_BOUNDARY_REPORT.md` | endpoint | `/api/teacher/students` | Endpoint '/api/teacher/students' NOT found in src/app/api. |  |
| `docs\finished_reports\TEACHER_PERMISSION_BOUNDARY_REPORT.md` | endpoint | `/api/teacher/students` | Endpoint '/api/teacher/students' NOT found in src/app/api. |  |
| `docs\finished_reports\TEACHER_RBAC_REPORT.md` | endpoint | `/api/teacher/students` | Endpoint '/api/teacher/students' NOT found in src/app/api. |  |
| `docs\finished_reports\TEACHER_RBAC_REPORT.md` | file_path | `src/app/api/teacher/students/route.ts` | File not found on disk. |  |
| `docs\finished_reports\TEACHER_RBAC_REPORT.md` | endpoint | `/api/teacher/students/route` | Endpoint '/api/teacher/students' NOT found in src/app/api. |  |
| `docs\finished_reports\TEACHER_RBAC_REPORT.md` | endpoint | `/api/teacher` | Endpoint '/api/teacher' NOT found in src/app/api. |  |
| `docs\finished_reports\TEACHER_RBAC_REPORT.md` | file_path | `src/app/api/teacher/route.ts` | File not found on disk. |  |
| `docs\finished_reports\TEACHER_RBAC_REPORT.md` | endpoint | `/api/teacher/route` | Endpoint '/api/teacher' NOT found in src/app/api. |  |
| `docs\finished_reports\TEACHER_RBAC_REPORT.md` | file_path | `src/app/api/teacher/` | File not found on disk. |  |
| `docs\finished_reports\TEACHER_RBAC_REPORT.md` | endpoint | `/api/teacher/` | Endpoint '/api/teacher' NOT found in src/app/api. |  |
| `docs\finished_reports\TIME_DEPENDENCY_REPORT.md` | file_path | `src/ml/features/student_features.ts` | File not found on disk. |  |
| `docs\finished_reports\TIME_DEPENDENCY_REPORT.md` | file_path | `src/components/planner/ScheduleView.tsx` | File not found on disk. |  |
| `docs\SKELETON.md` | endpoint | `/api/intelligence/student` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `docs\SKELETON.md` | endpoint | `/api/quiz` | Endpoint '/api/quiz' NOT found in src/app/api. |  |
| `docs\tasks.md` | file_path | `docs/prompts/finished/` | File not found on disk. |  |
| `docs\upcoming manual changess\Core_block_upgrade.md` | file_path | `src/ml/training/train_ensemble_models.py` | File not found on disk. |  |
| `docs\upcoming manual changess\Core_block_upgrade.md` | command | `python name` | Python script 'name' not found. | Check if the script exists. |
| `docs\upcoming manual changess\Core_block_upgrade.md` | file_path | `src/ml/models/mastery_ensemble.pkl` | File not found on disk. |  |
| `docs\upcoming manual changess\Core_block_upgrade.md` | file_path | `src/ml/models/forgetting_curve.pkl` | File not found on disk. |  |
| `docs\upcoming manual changess\Core_block_upgrade.md` | file_path | `src/ml/models/attention_risk.pkl` | File not found on disk. |  |
| `docs\upcoming manual changess\Core_block_upgrade.md` | file_path | `src/ml/features/advanced_student_features.ts` | File not found on disk. |  |
| `docs\upcoming manual changess\Core_block_upgrade.md` | file_path | `src/ai/adk/advanced_decision_engine.ts` | File not found on disk. |  |
| `docs\upcoming manual changess\Core_block_upgrade.md` | file_path | `src/ml/training/train_transformer_models.py` | File not found on disk. |  |
| `docs\upcoming manual changess\Core_block_upgrade.md` | command | `python name` | Python script 'name' not found. | Check if the script exists. |
| `docs\upcoming manual changess\Core_block_upgrade.md` | file_path | `src/ml/models/transformer_mastery.pt` | File not found on disk. |  |
| `docs\upcoming manual changess\Core_block_upgrade.md` | file_path | `src/ml/training/train_bayesian_models.py` | File not found on disk. |  |
| `docs\upcoming manual changess\Core_block_upgrade.md` | command | `python name` | Python script 'name' not found. | Check if the script exists. |
| `docs\upcoming manual changess\Core_block_upgrade.md` | file_path | `src/ml/models/bayesian_mastery_posterior.nc` | File not found on disk. |  |
| `docs\upcoming manual changess\Core_block_upgrade.md` | file_path | `src/ai/llm/dynamic_llm_orchestrator.ts` | File not found on disk. |  |
| `docs\upcoming manual changess\Core_block_upgrade.md` | file_path | `src/ml/training/generate_advanced_data.py` | File not found on disk. |  |
| `docs\upcoming manual changess\Core_block_upgrade.md` | file_path | `src/ml/training/train_ensemble_models.py` | File not found on disk. |  |
| `docs\upcoming manual changess\Core_block_upgrade.md` | file_path | `scripts/compare_models.py` | File not found on disk. |  |
| `docs\upcoming manual changess\Core_block_upgrade.md` | file_path | `src/ml/features/student_features.ts` | File not found on disk. |  |
| `README.md` | endpoint | `/api/intelligence/student` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `README.md` | file_path | `docs/genkit` | File not found on disk. |  |
| `README.md` | file_path | `src/ai/flows/syllabus-generator.ts` | File not found on disk. |  |
| `README.md` | file_path | `src/ai/rag/retriever.ts` | File not found on disk. |  |
| `README.md` | file_path | `src/ai/rag/retriever.ts` | File not found on disk. |  |
| `README.md` | file_path | `src/ai/flows/multilingual-cognitive-chatbot.ts` | File not found on disk. |  |
| `README.md` | file_path | `src/ai/rag/retriever.ts` | File not found on disk. |  |
| `README.md` | command | `python generate_data.py` | Python script 'generate_data.py' not found. | Check if the script exists. |
| `README.md` | command | `python train_mastery_model.py` | Python script 'train_mastery_model.py' not found. | Check if the script exists. |
| `README.md` | file_path | `src/ml/models/mastery_model.pk` | File not found on disk. |  |
| `reports\ADK_EXPLAINABILITY_REPORT.md` | file_path | `src/ai/adk/decision-engine.ts` | File not found on disk. |  |
| `reports\api-naming-audit.md` | endpoint | `/api/classes/create` | Endpoint '/api/classes/create' NOT found in src/app/api. |  |
| `reports\api-naming-audit.md` | endpoint | `/api/students/create` | Endpoint '/api/students/create' NOT found in src/app/api. |  |
| `reports\api-naming-audit.md` | endpoint | `/api/teachers/create` | Endpoint '/api/teachers/create' NOT found in src/app/api. |  |
| `reports\api-naming-audit.md` | endpoint | `/api/users/create` | Endpoint '/api/users/create' NOT found in src/app/api. |  |
| `reports\api-naming-audit.md` | endpoint | `/api/activity/log` | Endpoint '/api/activity/log' NOT found in src/app/api. |  |
| `reports\api-naming-audit.md` | endpoint | `/api/brainmap/nodes` | Endpoint '/api/brainmap/nodes' NOT found in src/app/api. |  |
| `reports\api-naming-audit.md` | endpoint | `/api/chaos` | Endpoint '/api/chaos' NOT found in src/app/api. |  |
| `reports\api-naming-audit.md` | endpoint | `/api/classes/join` | Endpoint '/api/classes/join' NOT found in src/app/api. |  |
| `reports\api-naming-audit.md` | endpoint | `/api/classes/leave` | Endpoint '/api/classes/leave' NOT found in src/app/api. |  |
| `reports\api-naming-audit.md` | endpoint | `/api/intelligence/student` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `reports\api-naming-audit.md` | endpoint | `/api/planner/convert-to-node` | Endpoint '/api/planner/convert-to-node' NOT found in src/app/api. |  |
| `reports\api-naming-audit.md` | endpoint | `/api/planner/data` | Endpoint '/api/planner/data' NOT found in src/app/api. |  |
| `reports\api-naming-audit.md` | endpoint | `/api/planner/review` | Endpoint '/api/planner/review' NOT found in src/app/api. |  |
| `reports\api-naming-audit.md` | endpoint | `/api/quiz/submit` | Endpoint '/api/quiz/submit' NOT found in src/app/api. |  |
| `reports\api-naming-audit.md` | endpoint | `/api/sankalp/session/end` | Endpoint '/api/sankalp/session/end' NOT found in src/app/api. |  |
| `reports\api-naming-audit.md` | endpoint | `/api/sankalp/session/start` | Endpoint '/api/sankalp/session/start' NOT found in src/app/api. |  |
| `reports\api-naming-audit.md` | endpoint | `/api/student/graph` | Endpoint '/api/student/graph' NOT found in src/app/api. |  |
| `reports\api-naming-audit.md` | endpoint | `/api/student/onboard` | Endpoint '/api/student/onboard' NOT found in src/app/api. |  |
| `reports\api-naming-audit.md` | endpoint | `/api/student` | Endpoint '/api/student' NOT found in src/app/api. |  |
| `reports\api-naming-audit.md` | endpoint | `/api/syllabus/save` | Endpoint '/api/syllabus/save' NOT found in src/app/api. |  |
| `reports\api-naming-audit.md` | endpoint | `/api/teacher/classes/[classId]` | Endpoint '/api/teacher/classes/[classId]' NOT found in src/app/api. |  |
| `reports\api-naming-audit.md` | endpoint | `/api/teacher/classes/[classId]/students` | Endpoint '/api/teacher/classes/[classId]/students' NOT found in src/app/api. |  |
| `reports\api-naming-audit.md` | endpoint | `/api/teacher/classes` | Endpoint '/api/teacher/classes' NOT found in src/app/api. |  |
| `reports\api-naming-audit.md` | endpoint | `/api/teacher/graph` | Endpoint '/api/teacher/graph' NOT found in src/app/api. |  |
| `reports\api-naming-audit.md` | endpoint | `/api/teacher/onboard` | Endpoint '/api/teacher/onboard' NOT found in src/app/api. |  |
| `reports\api-naming-audit.md` | endpoint | `/api/teacher` | Endpoint '/api/teacher' NOT found in src/app/api. |  |
| `reports\api-naming-audit.md` | endpoint | `/api/teacher/students/[studentId]` | Endpoint '/api/teacher/students/[studentId]' NOT found in src/app/api. |  |
| `reports\api-naming-audit.md` | endpoint | `/api/teacher/students` | Endpoint '/api/teacher/students' NOT found in src/app/api. |  |
| `reports\api-naming-audit.md` | endpoint | `/api/test/seed` | Endpoint '/api/test/seed' NOT found in src/app/api. |  |
| `reports\api-naming-audit.md` | endpoint | `/api/users/[userId]` | Endpoint '/api/users/[userId]' NOT found in src/app/api. |  |
| `reports\API_NAMING_AUDIT.md` | endpoint | `/api/planner/data` | Endpoint '/api/planner/data' NOT found in src/app/api. |  |
| `reports\API_NAMING_AUDIT.md` | endpoint | `/api/planner/review` | Endpoint '/api/planner/review' NOT found in src/app/api. |  |
| `reports\API_NAMING_AUDIT.md` | endpoint | `/api/planner/convert-to-node` | Endpoint '/api/planner/convert-to-node' NOT found in src/app/api. |  |
| `reports\API_NAMING_AUDIT.md` | endpoint | `/api/brainmap/nodes` | Endpoint '/api/brainmap/nodes' NOT found in src/app/api. |  |
| `reports\API_NAMING_AUDIT.md` | endpoint | `/api/teacher` | Endpoint '/api/teacher' NOT found in src/app/api. |  |
| `reports\API_NAMING_AUDIT.md` | endpoint | `/api/teacher/graph` | Endpoint '/api/teacher/graph' NOT found in src/app/api. |  |
| `reports\API_NAMING_AUDIT.md` | endpoint | `/api/teacher/onboard` | Endpoint '/api/teacher/onboard' NOT found in src/app/api. |  |
| `reports\API_NAMING_AUDIT.md` | endpoint | `/api/teacher/classes` | Endpoint '/api/teacher/classes' NOT found in src/app/api. |  |
| `reports\API_NAMING_AUDIT.md` | endpoint | `/api/teacher/classes/[classId]` | Endpoint '/api/teacher/classes/[classId]' NOT found in src/app/api. |  |
| `reports\API_NAMING_AUDIT.md` | endpoint | `/api/teacher/classes/[classId]/students` | Endpoint '/api/teacher/classes/[classId]/students' NOT found in src/app/api. |  |
| `reports\API_NAMING_AUDIT.md` | endpoint | `/api/teacher/students` | Endpoint '/api/teacher/students' NOT found in src/app/api. |  |
| `reports\API_NAMING_AUDIT.md` | endpoint | `/api/teacher/students/[studentId]` | Endpoint '/api/teacher/students/[studentId]' NOT found in src/app/api. |  |
| `reports\API_NAMING_AUDIT.md` | endpoint | `/api/student` | Endpoint '/api/student' NOT found in src/app/api. |  |
| `reports\API_NAMING_AUDIT.md` | endpoint | `/api/student/graph` | Endpoint '/api/student/graph' NOT found in src/app/api. |  |
| `reports\API_NAMING_AUDIT.md` | endpoint | `/api/student/onboard` | Endpoint '/api/student/onboard' NOT found in src/app/api. |  |
| `reports\API_NAMING_AUDIT.md` | endpoint | `/api/test/seed` | Endpoint '/api/test/seed' NOT found in src/app/api. |  |
| `reports\API_NAMING_AUDIT.md` | endpoint | `/api/sankalp/session/start` | Endpoint '/api/sankalp/session/start' NOT found in src/app/api. |  |
| `reports\API_NAMING_AUDIT.md` | endpoint | `/api/sankalp/session/end` | Endpoint '/api/sankalp/session/end' NOT found in src/app/api. |  |
| `reports\API_NAMING_AUDIT.md` | endpoint | `/api/classes/create` | Endpoint '/api/classes/create' NOT found in src/app/api. |  |
| `reports\API_NAMING_AUDIT.md` | endpoint | `/api/classes/join` | Endpoint '/api/classes/join' NOT found in src/app/api. |  |
| `reports\API_NAMING_AUDIT.md` | endpoint | `/api/classes/leave` | Endpoint '/api/classes/leave' NOT found in src/app/api. |  |
| `reports\API_NAMING_AUDIT.md` | endpoint | `/api/activity/log` | Endpoint '/api/activity/log' NOT found in src/app/api. |  |
| `reports\API_NAMING_AUDIT.md` | endpoint | `/api/users/create` | Endpoint '/api/users/create' NOT found in src/app/api. |  |
| `reports\API_NAMING_AUDIT.md` | endpoint | `/api/users/[userId]` | Endpoint '/api/users/[userId]' NOT found in src/app/api. |  |
| `reports\API_NAMING_AUDIT.md` | endpoint | `/api/quiz/submit` | Endpoint '/api/quiz/submit' NOT found in src/app/api. |  |
| `reports\API_NAMING_AUDIT.md` | endpoint | `/api/teachers/create` | Endpoint '/api/teachers/create' NOT found in src/app/api. |  |
| `reports\API_NAMING_AUDIT.md` | endpoint | `/api/intelligence/student` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `reports\API_NAMING_AUDIT.md` | endpoint | `/api/students/create` | Endpoint '/api/students/create' NOT found in src/app/api. |  |
| `reports\API_NAMING_AUDIT.md` | endpoint | `/api/chaos` | Endpoint '/api/chaos' NOT found in src/app/api. |  |
| `reports\API_NAMING_AUDIT.md` | endpoint | `/api/syllabus/save` | Endpoint '/api/syllabus/save' NOT found in src/app/api. |  |
| `reports\BIAS_DETECTION_REPORT.md` | file_path | `src/ai/flows/adaptive-quiz-engine.ts` | File not found on disk. |  |
| `reports\BIAS_DETECTION_REPORT.md` | file_path | `src/ai/flows/adaptive-quiz-engine.ts` | File not found on disk. |  |
| `reports\build-performance-report.md` | endpoint | `/api/activity/log` | Endpoint '/api/activity/log' NOT found in src/app/api. |  |
| `reports\build-performance-report.md` | endpoint | `/api/brainmap/nodes` | Endpoint '/api/brainmap/nodes' NOT found in src/app/api. |  |
| `reports\build-performance-report.md` | endpoint | `/api/chaos` | Endpoint '/api/chaos' NOT found in src/app/api. |  |
| `reports\build-performance-report.md` | endpoint | `/api/classes/create` | Endpoint '/api/classes/create' NOT found in src/app/api. |  |
| `reports\build-performance-report.md` | endpoint | `/api/classes/join` | Endpoint '/api/classes/join' NOT found in src/app/api. |  |
| `reports\build-performance-report.md` | endpoint | `/api/classes/leave` | Endpoint '/api/classes/leave' NOT found in src/app/api. |  |
| `reports\build-performance-report.md` | endpoint | `/api/intelligence/student` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `reports\build-performance-report.md` | endpoint | `/api/planner/convert-to-node` | Endpoint '/api/planner/convert-to-node' NOT found in src/app/api. |  |
| `reports\build-performance-report.md` | endpoint | `/api/planner/data` | Endpoint '/api/planner/data' NOT found in src/app/api. |  |
| `reports\build-performance-report.md` | endpoint | `/api/planner/review` | Endpoint '/api/planner/review' NOT found in src/app/api. |  |
| `reports\build-performance-report.md` | endpoint | `/api/quiz/submit` | Endpoint '/api/quiz/submit' NOT found in src/app/api. |  |
| `reports\build-performance-report.md` | endpoint | `/api/sankalp/session/end` | Endpoint '/api/sankalp/session/end' NOT found in src/app/api. |  |
| `reports\build-performance-report.md` | endpoint | `/api/sankalp/session/start` | Endpoint '/api/sankalp/session/start' NOT found in src/app/api. |  |
| `reports\build-performance-report.md` | endpoint | `/api/student` | Endpoint '/api/student' NOT found in src/app/api. |  |
| `reports\build-performance-report.md` | endpoint | `/api/student/graph` | Endpoint '/api/student/graph' NOT found in src/app/api. |  |
| `reports\build-performance-report.md` | endpoint | `/api/student/onboard` | Endpoint '/api/student/onboard' NOT found in src/app/api. |  |
| `reports\build-performance-report.md` | endpoint | `/api/students/create` | Endpoint '/api/students/create' NOT found in src/app/api. |  |
| `reports\build-performance-report.md` | endpoint | `/api/syllabus/save` | Endpoint '/api/syllabus/save' NOT found in src/app/api. |  |
| `reports\build-performance-report.md` | endpoint | `/api/teacher` | Endpoint '/api/teacher' NOT found in src/app/api. |  |
| `reports\build-performance-report.md` | endpoint | `/api/teacher/classes` | Endpoint '/api/teacher/classes' NOT found in src/app/api. |  |
| `reports\build-performance-report.md` | endpoint | `/api/teacher/classes/[classId]` | Endpoint '/api/teacher/classes/[classId]' NOT found in src/app/api. |  |
| `reports\build-performance-report.md` | endpoint | `/api/teacher/classes/[classId]/students` | Endpoint '/api/teacher/classes/[classId]/students' NOT found in src/app/api. |  |
| `reports\build-performance-report.md` | endpoint | `/api/teacher/graph` | Endpoint '/api/teacher/graph' NOT found in src/app/api. |  |
| `reports\build-performance-report.md` | endpoint | `/api/teacher/onboard` | Endpoint '/api/teacher/onboard' NOT found in src/app/api. |  |
| `reports\build-performance-report.md` | endpoint | `/api/teacher/students` | Endpoint '/api/teacher/students' NOT found in src/app/api. |  |
| `reports\build-performance-report.md` | endpoint | `/api/teacher/students/[studentId]` | Endpoint '/api/teacher/students/[studentId]' NOT found in src/app/api. |  |
| `reports\build-performance-report.md` | endpoint | `/api/teachers/create` | Endpoint '/api/teachers/create' NOT found in src/app/api. |  |
| `reports\build-performance-report.md` | endpoint | `/api/test/seed` | Endpoint '/api/test/seed' NOT found in src/app/api. |  |
| `reports\build-performance-report.md` | endpoint | `/api/users/[userId]` | Endpoint '/api/users/[userId]' NOT found in src/app/api. |  |
| `reports\build-performance-report.md` | endpoint | `/api/users/create` | Endpoint '/api/users/create' NOT found in src/app/api. |  |
| `reports\BUNDLE_SIZE_IMPACT_REPORT.md` | file_path | `src/components/app/audio-conversation.tsx` | File not found on disk. |  |
| `reports\BUNDLE_SIZE_IMPACT_REPORT.md` | file_path | `src/components/app/header.tsx` | File not found on disk. |  |
| `reports\BUNDLE_SIZE_IMPACT_REPORT.md` | file_path | `src/components/app/sidebar-nav.tsx` | File not found on disk. |  |
| `reports\BUNDLE_SIZE_IMPACT_REPORT.md` | file_path | `src/components/app/teacher-sidebar-nav.tsx` | File not found on disk. |  |
| `reports\BUNDLE_SIZE_IMPACT_REPORT.md` | file_path | `src/components/planner/AddStudyMaterial.tsx` | File not found on disk. |  |
| `reports\BUNDLE_SIZE_IMPACT_REPORT.md` | file_path | `src/components/planner/FocusTimer.tsx` | File not found on disk. |  |
| `reports\BUNDLE_SIZE_IMPACT_REPORT.md` | file_path | `src/components/planner/ScheduleView.tsx` | File not found on disk. |  |
| `reports\BUNDLE_SIZE_IMPACT_REPORT.md` | file_path | `src/components/planner/StudyLibrary.tsx` | File not found on disk. |  |
| `reports\BUNDLE_SIZE_IMPACT_REPORT.md` | file_path | `src/components/profile/StudentProfile.tsx` | File not found on disk. |  |
| `reports\BUNDLE_SIZE_IMPACT_REPORT.md` | file_path | `src/components/profile/TeacherProfile.tsx` | File not found on disk. |  |
| `reports\BUNDLE_SIZE_IMPACT_REPORT.md` | file_path | `src/components/settings/StudentProfileForm.tsx` | File not found on disk. |  |
| `reports\BUNDLE_SIZE_IMPACT_REPORT.md` | file_path | `src/components/settings/TeacherProfileForm.tsx` | File not found on disk. |  |
| `reports\BUNDLE_SIZE_IMPACT_REPORT.md` | file_path | `src/components/ui/accordion.tsx` | File not found on disk. |  |
| `reports\BUNDLE_SIZE_IMPACT_REPORT.md` | file_path | `src/components/ui/calendar.tsx` | File not found on disk. |  |
| `reports\BUNDLE_SIZE_IMPACT_REPORT.md` | file_path | `src/components/ui/carousel.tsx` | File not found on disk. |  |
| `reports\BUNDLE_SIZE_IMPACT_REPORT.md` | file_path | `src/components/ui/carousel.tsx` | File not found on disk. |  |
| `reports\BUNDLE_SIZE_IMPACT_REPORT.md` | file_path | `src/components/ui/chart.tsx` | File not found on disk. |  |
| `reports\BUNDLE_SIZE_IMPACT_REPORT.md` | file_path | `src/components/ui/checkbox.tsx` | File not found on disk. |  |
| `reports\BUNDLE_SIZE_IMPACT_REPORT.md` | file_path | `src/components/ui/dialog.tsx` | File not found on disk. |  |
| `reports\BUNDLE_SIZE_IMPACT_REPORT.md` | file_path | `src/components/ui/dropdown-menu.tsx` | File not found on disk. |  |
| `reports\BUNDLE_SIZE_IMPACT_REPORT.md` | file_path | `src/components/ui/menubar.tsx` | File not found on disk. |  |
| `reports\BUNDLE_SIZE_IMPACT_REPORT.md` | file_path | `src/components/ui/radio-group.tsx` | File not found on disk. |  |
| `reports\BUNDLE_SIZE_IMPACT_REPORT.md` | file_path | `src/components/ui/select.tsx` | File not found on disk. |  |
| `reports\BUNDLE_SIZE_IMPACT_REPORT.md` | file_path | `src/components/ui/sheet.tsx` | File not found on disk. |  |
| `reports\BUNDLE_SIZE_IMPACT_REPORT.md` | file_path | `src/components/ui/sidebar.tsx` | File not found on disk. |  |
| `reports\BUNDLE_SIZE_IMPACT_REPORT.md` | file_path | `src/components/ui/toast.tsx` | File not found on disk. |  |
| `reports\CACHING_STRATEGY_PROPOSAL.md` | file_path | `src/ai/flows` | File not found on disk. |  |
| `reports\CACHING_STRATEGY_PROPOSAL.md` | file_path | `src/ai/flows/syllabus-generator.ts` | File not found on disk. |  |
| `reports\CACHING_STRATEGY_PROPOSAL.md` | file_path | `src/ai/flows/adaptive-quiz-engine.ts` | File not found on disk. |  |
| `reports\chatbot-context-audit.md` | file_path | `src/ai/flows/multilingual-cognitive-chatbot.ts` | File not found on disk. |  |
| `reports\chatbot-context-audit.md` | file_path | `src/ai/flows/multilingual-cognitive-chatbot.ts` | File not found on disk. |  |
| `reports\CHATBOT_CONTEXT_HEALTH_REPORT.md` | file_path | `src/ai/flows/multilingual-cognitive-chatbot.ts` | File not found on disk. |  |
| `reports\CHATBOT_CONTEXT_HEALTH_REPORT.md` | file_path | `docs/plugins/google-genai` | File not found on disk. |  |
| `reports\COST_OPTIMIZATION_REPORT.md` | endpoint | `/api/teacher/students` | Endpoint '/api/teacher/students' NOT found in src/app/api. |  |
| `reports\DATA_PORTABILITY_REPORT.md` | endpoint | `/api/user/export` | Endpoint '/api/user/export' NOT found in src/app/api. |  |
| `reports\dependency-vulnerability-report.md` | file_path | `src/ml/training/requirements.txt` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\ml\requirements.txt? |
| `reports\DEPENDENCY_VULNERABILITY_REPORT.md` | file_path | `src/ml/training/requirements.txt` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\ml\requirements.txt? |
| `reports\DEPENDENCY_VULNERABILITY_REPORT.md` | file_path | `src/ml/inference/requirements.txt` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\ml\requirements.txt? |
| `reports\design-token-violations.md` | file_path | `src/components/app/sidebar-nav.tsx` | File not found on disk. |  |
| `reports\design-token-violations.md` | file_path | `src/components/app/teacher-sidebar-nav.tsx` | File not found on disk. |  |
| `reports\design-token-violations.md` | file_path | `src/components/app/teacher-sidebar-nav.tsx` | File not found on disk. |  |
| `reports\design-token-violations.md` | file_path | `src/components/app/teacher-sidebar-nav.tsx` | File not found on disk. |  |
| `reports\design-token-violations.md` | file_path | `src/components/planner/StudyLibrary.tsx` | File not found on disk. |  |
| `reports\design-token-violations.md` | file_path | `src/components/rewards/RewardsSkeleton.tsx` | File not found on disk. |  |
| `reports\design-token-violations.md` | file_path | `src/components/ui/chart.tsx` | File not found on disk. |  |
| `reports\design-token-violations.md` | file_path | `src/components/ui/chart.tsx` | File not found on disk. |  |
| `reports\design-token-violations.md` | file_path | `src/components/ui/chart.tsx` | File not found on disk. |  |
| `reports\design-token-violations.md` | file_path | `src/components/ui/chart.tsx` | File not found on disk. |  |
| `reports\design-token-violations.md` | file_path | `src/components/ui/chart.tsx` | File not found on disk. |  |
| `reports\design-token-violations.md` | file_path | `src/components/ui/scroll-area.tsx` | File not found on disk. |  |
| `reports\design-token-violations.md` | file_path | `src/components/ui/scroll-area.tsx` | File not found on disk. |  |
| `reports\design-token-violations.md` | file_path | `src/components/ui/separator.tsx` | File not found on disk. |  |
| `reports\design-token-violations.md` | file_path | `src/components/ui/separator.tsx` | File not found on disk. |  |
| `reports\design-token-violations.md` | file_path | `src/components/ui/sidebar.tsx` | File not found on disk. |  |
| `reports\design-token-violations.md` | file_path | `src/components/ui/textarea.tsx` | File not found on disk. |  |
| `reports\design-token-violations.md` | file_path | `src/components/ui/toast.tsx` | File not found on disk. |  |
| `reports\ENVIRONMENT_SECURITY_REPORT.md` | file_path | `src/app/api/chaos/route.ts` | File not found on disk. |  |
| `reports\ENVIRONMENT_SECURITY_REPORT.md` | endpoint | `/api/chaos/route` | Endpoint '/api/chaos' NOT found in src/app/api. |  |
| `reports\ENVIRONMENT_SECURITY_REPORT.md` | file_path | `src/app/api/chaos/route.ts` | File not found on disk. |  |
| `reports\ENVIRONMENT_SECURITY_REPORT.md` | endpoint | `/api/chaos/route` | Endpoint '/api/chaos' NOT found in src/app/api. |  |
| `reports\ENVIRONMENT_SECURITY_REPORT.md` | file_path | `src/app/api/chaos/route.ts` | File not found on disk. |  |
| `reports\ENVIRONMENT_SECURITY_REPORT.md` | endpoint | `/api/chaos/route` | Endpoint '/api/chaos' NOT found in src/app/api. |  |
| `reports\ENVIRONMENT_SECURITY_REPORT.md` | file_path | `src/app/api/test/seed/route.ts` | File not found on disk. |  |
| `reports\ENVIRONMENT_SECURITY_REPORT.md` | endpoint | `/api/test/seed/route` | Endpoint '/api/test/seed' NOT found in src/app/api. |  |
| `reports\ENVIRONMENT_SECURITY_REPORT.md` | file_path | `src/app/api/test/seed/route.ts` | File not found on disk. |  |
| `reports\ENVIRONMENT_SECURITY_REPORT.md` | endpoint | `/api/test/seed/route` | Endpoint '/api/test/seed' NOT found in src/app/api. |  |
| `reports\EXPLAINABILITY_DRIFT_REPORT.md` | file_path | `src/ai/adk/decision-engine.ts` | File not found on disk. |  |
| `reports\forgetting-curve-audit.md` | file_path | `src/ai/adk/decision-engine.ts` | File not found on disk. |  |
| `reports\forgetting-curve-audit.md` | file_path | `src/ml/inference/predict_mastery.py` | File not found on disk. |  |
| `reports\forgetting-curve-audit.md` | file_path | `src/ai/adk/decision-engine.ts` | File not found on disk. |  |
| `reports\forgetting-curve-audit.md` | file_path | `src/ml/inference/types.ts` | File not found on disk. |  |
| `reports\forgetting-curve-audit.md` | file_path | `src/ml/inference/predict_mastery.py` | File not found on disk. |  |
| `reports\FORGETTING_CURVE_AUDIT.md` | file_path | `src/ml/models/forgetting_model.pkl` | File not found on disk. |  |
| `reports\FORGETTING_CURVE_AUDIT.md` | file_path | `src/ml/inference/predict_mastery.py` | File not found on disk. |  |
| `reports\FORGETTING_CURVE_AUDIT.md` | file_path | `src/ml/models/forgetting_model.pkl` | File not found on disk. |  |
| `reports\FORGETTING_CURVE_AUDIT.md` | file_path | `src/ai/adk/decision-engine.ts` | File not found on disk. |  |
| `reports\GAMIFICATION_QUALITY_REPORT.md` | file_path | `src/lib/rewards/calculateRewards.ts` | File not found on disk. |  |
| `reports\GENKIT_OBSERVABILITY_REPORT.md` | file_path | `src/ai/flows/` | File not found on disk. |  |
| `reports\HOOK_DEPENDENCY_AUDIT.md` | file_path | `src/components/planner/FocusTimer.tsx` | File not found on disk. |  |
| `reports\HOOK_DEPENDENCY_AUDIT.md` | file_path | `src/components/planner/FocusTimer.tsx` | File not found on disk. |  |
| `reports\HOOK_DEPENDENCY_AUDIT.md` | file_path | `src/components/planner/FocusTimer.tsx` | File not found on disk. |  |
| `reports\HOOK_DEPENDENCY_AUDIT.md` | file_path | `src/components/planner/ScheduleView.tsx` | File not found on disk. |  |
| `reports\HOOK_DEPENDENCY_AUDIT.md` | file_path | `src/components/planner/StudyLibrary.tsx` | File not found on disk. |  |
| `reports\HOOK_DEPENDENCY_AUDIT.md` | file_path | `src/components/planner/StudyLibrary.tsx` | File not found on disk. |  |
| `reports\HOOK_DEPENDENCY_AUDIT.md` | file_path | `src/components/settings/StudentProfileForm.tsx` | File not found on disk. |  |
| `reports\HOOK_DEPENDENCY_AUDIT.md` | file_path | `src/components/settings/TeacherProfileForm.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/app/api/intelligence/student/route.ts` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | endpoint | `/api/intelligence/student/route` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/app/api/teacher/students/route.ts` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | endpoint | `/api/teacher/students/route` | Endpoint '/api/teacher/students' NOT found in src/app/api. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/app/test-accessibility/page.tsx` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\app\admin\dashboard\page.tsx, src\app\login\page.tsx, src\app\page.tsx, src\app\parent\dashboard\page.tsx, src\app\parent\onboarding\page.tsx, src\app\student\dashboard\page.tsx, src\app\student\map\page.tsx, src\app\student\onboarding\page.tsx, src\app\student\progress\page.tsx, src\app\student\revision\page.tsx, src\app\student\study\page.tsx, src\app\teacher\dashboard\page.tsx, src\app\teacher\onboarding\page.tsx, src\app\teacher\overview\page.tsx? |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/app/test-charts/page.tsx` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\app\admin\dashboard\page.tsx, src\app\login\page.tsx, src\app\page.tsx, src\app\parent\dashboard\page.tsx, src\app\parent\onboarding\page.tsx, src\app\student\dashboard\page.tsx, src\app\student\map\page.tsx, src\app\student\onboarding\page.tsx, src\app\student\progress\page.tsx, src\app\student\revision\page.tsx, src\app\student\study\page.tsx, src\app\teacher\dashboard\page.tsx, src\app\teacher\onboarding\page.tsx, src\app\teacher\overview\page.tsx? |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/app/audio-conversation.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/app/header.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/app/sidebar-nav.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/app/teacher-sidebar-nav.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/planner/AddStudyMaterial.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/planner/FocusTimer.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/planner/ScheduleView.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/planner/StudyLibrary.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/profile/StudentProfile.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/profile/TeacherProfile.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/settings/StudentProfileForm.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/settings/TeacherProfileForm.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/accordion.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/alert-dialog.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/alert.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/avatar.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/badge.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/carousel.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/chart.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/checkbox.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/dialog.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/dropdown-menu.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/form.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/label.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/menubar.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/popover.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/progress.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/radio-group.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/scroll-area.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/select.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/separator.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/sheet.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/sidebar.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/slider.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/switch.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/table.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/tabs.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/toast.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/toaster.tsx` | File not found on disk. |  |
| `reports\I18N_READINESS_REPORT.md` | file_path | `src/components/ui/tooltip.tsx` | File not found on disk. |  |
| `reports\intervention-quality-report.md` | file_path | `src/ai/adk/decision-engine.ts` | File not found on disk. |  |
| `reports\INTERVENTION_QUALITY_REPORT.md` | file_path | `src/ai/adk/decision-engine.ts` | File not found on disk. |  |
| `reports\LOADING_STATE_AUDIT.md` | file_path | `src/components/profile/StudentProfile.tsx` | File not found on disk. |  |
| `reports\LOADING_STATE_AUDIT.md` | file_path | `src/components/profile/TeacherProfile.tsx` | File not found on disk. |  |
| `reports\LOADING_STATE_AUDIT.md` | file_path | `src/components/ui/skeleton.tsx` | File not found on disk. |  |
| `reports\LOADING_STATE_AUDIT.md` | file_path | `src/app/loading.tsx` | File not found on disk. |  |
| `reports\microservice-migration-readiness-report.md` | file_path | `src/ml/inference/api.py` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\ml\serving\api.py? |
| `reports\microservice-migration-readiness-report.md` | file_path | `src/ml/inference/ml-bridge.ts` | File not found on disk. |  |
| `reports\microservice-migration-readiness-report.md` | file_path | `src/ml/inference/api.py` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\ml\serving\api.py? |
| `reports\microservice-migration-readiness-report.md` | file_path | `src/ml/inference/ml-bridge.ts` | File not found on disk. |  |
| `reports\microservice-migration-readiness-report.md` | file_path | `src/ml/inference/` | File not found on disk. |  |
| `reports\MINDFUL_MENTOR_ROADMAP.md` | file_path | `src/ai/flows/mindful-mentor.ts` | File not found on disk. |  |
| `reports\ML_MICROSERVICE_MIGRATION_READINESS.md` | file_path | `src/ml/inference/types.ts` | File not found on disk. |  |
| `reports\ML_MODEL_DEPLOYMENT_MATURITY.md` | file_path | `src/ml/models/mastery_model.pkl` | File not found on disk. |  |
| `reports\ML_MODEL_DEPLOYMENT_MATURITY.md` | command | `python process` | Python script 'process' not found. | Check if the script exists. |
| `reports\ML_MODEL_DEPLOYMENT_MATURITY.md` | command | `python processes` | Python script 'processes' not found. | Check if the script exists. |
| `reports\ML_PERFORMANCE_REGRESSION_REPORT.md` | file_path | `src/ml/training/test_set.csv` | File not found on disk. |  |
| `reports\MOCK_DATA_CONSISTENCY_REPORT.md` | file_path | `src/ml/training/generate_data.py` | File not found on disk. |  |
| `reports\MOCK_DATA_CONSISTENCY_REPORT.md` | file_path | `src/ml/training/generate_data.py` | File not found on disk. |  |
| `reports\MOCK_DATA_CONSISTENCY_REPORT.md` | file_path | `src/ai/flows/adaptive-quiz-engine.ts` | File not found on disk. |  |
| `reports\MOCK_DATA_CONSISTENCY_REPORT.md` | file_path | `src/ml/inference/ml-bridge.ts` | File not found on disk. |  |
| `reports\model-deployment-maturity-assessment.md` | file_path | `src/ml/models/mastery_model.pkl` | File not found on disk. |  |
| `reports\model-deployment-maturity-assessment.md` | file_path | `src/ml/inference/predict_mastery.py` | File not found on disk. |  |
| `reports\model-deployment-maturity-assessment.md` | file_path | `src/ml/inference/api.py` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\ml\serving\api.py? |
| `reports\MODEL_FRESHNESS_REPORT.md` | file_path | `src/ml/models/mastery_model.pkl` | File not found on disk. |  |
| `reports\MODEL_FRESHNESS_REPORT.md` | file_path | `src/ml/training/train_mastery_model.py` | File not found on disk. |  |
| `reports\MODEL_FRESHNESS_REPORT.md` | file_path | `src/ml/training/training_data.csv` | File not found on disk. |  |
| `reports\NOTIFICATION_COPY_REPORT.md` | file_path | `src/components/app/audio-conversation.tsx` | File not found on disk. |  |
| `reports\NOTIFICATION_COPY_REPORT.md` | file_path | `src/components/app/audio-conversation.tsx` | File not found on disk. |  |
| `reports\NOTIFICATION_COPY_REPORT.md` | file_path | `src/components/planner/AddStudyMaterial.tsx` | File not found on disk. |  |
| `reports\NOTIFICATION_COPY_REPORT.md` | file_path | `src/components/planner/AddStudyMaterial.tsx` | File not found on disk. |  |
| `reports\NOTIFICATION_COPY_REPORT.md` | file_path | `src/components/planner/AddStudyMaterial.tsx` | File not found on disk. |  |
| `reports\NOTIFICATION_COPY_REPORT.md` | file_path | `src/components/planner/AddStudyMaterial.tsx` | File not found on disk. |  |
| `reports\NOTIFICATION_COPY_REPORT.md` | file_path | `src/components/planner/AddStudyMaterial.tsx` | File not found on disk. |  |
| `reports\NOTIFICATION_COPY_REPORT.md` | file_path | `src/components/planner/FocusTimer.tsx` | File not found on disk. |  |
| `reports\NOTIFICATION_COPY_REPORT.md` | file_path | `src/components/planner/FocusTimer.tsx` | File not found on disk. |  |
| `reports\NOTIFICATION_COPY_REPORT.md` | file_path | `src/components/settings/StudentProfileForm.tsx` | File not found on disk. |  |
| `reports\NOTIFICATION_COPY_REPORT.md` | file_path | `src/components/settings/StudentProfileForm.tsx` | File not found on disk. |  |
| `reports\NOTIFICATION_COPY_REPORT.md` | file_path | `src/components/settings/StudentProfileForm.tsx` | File not found on disk. |  |
| `reports\NOTIFICATION_COPY_REPORT.md` | file_path | `src/components/settings/TeacherProfileForm.tsx` | File not found on disk. |  |
| `reports\NOTIFICATION_COPY_REPORT.md` | file_path | `src/components/settings/TeacherProfileForm.tsx` | File not found on disk. |  |
| `reports\NOTIFICATION_COPY_REPORT.md` | file_path | `src/components/settings/TeacherProfileForm.tsx` | File not found on disk. |  |
| `reports\privacy-compliance-audit.md` | file_path | `src/app/api/` | File not found on disk. |  |
| `reports\privacy-compliance-audit.md` | file_path | `src/ml/inference/` | File not found on disk. |  |
| `reports\privacy-compliance-audit.md` | endpoint | `/api/teacher/students` | Endpoint '/api/teacher/students' NOT found in src/app/api. |  |
| `reports\PRIVACY_COMPLIANCE_REPORT.md` | file_path | `src/ml/inference/ml-bridge.ts` | File not found on disk. |  |
| `reports\PRIVACY_COMPLIANCE_REPORT.md` | file_path | `src/ai/flows/adaptive-quiz-engine.ts` | File not found on disk. |  |
| `reports\PRIVACY_COMPLIANCE_REPORT.md` | file_path | `src/ai/flows/multilingual-cognitive-chatbot.ts` | File not found on disk. |  |
| `reports\quiz-difficulty-drift.md` | file_path | `src/ai/flows/adaptive-quiz-engine.ts` | File not found on disk. |  |
| `reports\quiz-difficulty-drift.md` | file_path | `src/ai/flows/adaptive-quiz-engine.ts` | File not found on disk. |  |
| `reports\QUIZ_DIFFICULTY_ALIGNMENT_REPORT.md` | file_path | `docs/plugins/google-genai` | File not found on disk. |  |
| `reports\radix-a11y-violations.md` | file_path | `src/components/app/header.tsx` | File not found on disk. |  |
| `reports\radix-a11y-violations.md` | file_path | `src/components/app/sidebar-nav.tsx` | File not found on disk. |  |
| `reports\radix-a11y-violations.md` | file_path | `src/components/app/teacher-sidebar-nav.tsx` | File not found on disk. |  |
| `reports\radix-a11y-violations.md` | file_path | `src/components/planner/AddStudyMaterial.tsx` | File not found on disk. |  |
| `reports\radix-a11y-violations.md` | file_path | `src/components/ui/collapsible.tsx` | File not found on disk. |  |
| `reports\radix-a11y-violations.md` | file_path | `src/components/ui/collapsible.tsx` | File not found on disk. |  |
| `reports\radix-a11y-violations.md` | file_path | `src/components/ui/sidebar.tsx` | File not found on disk. |  |
| `reports\RESPONSIVE_DESIGN_COVERAGE.md` | file_path | `src/components/app/audio-conversation.tsx` | File not found on disk. |  |
| `reports\RESPONSIVE_DESIGN_COVERAGE.md` | file_path | `src/components/app/sidebar-nav.tsx` | File not found on disk. |  |
| `reports\RESPONSIVE_DESIGN_COVERAGE.md` | file_path | `src/components/app/teacher-sidebar-nav.tsx` | File not found on disk. |  |
| `reports\RESPONSIVE_DESIGN_COVERAGE.md` | file_path | `src/components/planner/FocusTimer.tsx` | File not found on disk. |  |
| `reports\RESPONSIVE_DESIGN_COVERAGE.md` | file_path | `src/components/planner/ScheduleView.tsx` | File not found on disk. |  |
| `reports\RESPONSIVE_DESIGN_COVERAGE.md` | file_path | `src/components/planner/StudyLibrary.tsx` | File not found on disk. |  |
| `reports\RESPONSIVE_DESIGN_COVERAGE.md` | file_path | `src/components/profile/StudentProfile.tsx` | File not found on disk. |  |
| `reports\RESPONSIVE_DESIGN_COVERAGE.md` | file_path | `src/components/profile/TeacherProfile.tsx` | File not found on disk. |  |
| `reports\RESPONSIVE_DESIGN_COVERAGE.md` | file_path | `src/components/rewards/RewardsSkeleton.tsx` | File not found on disk. |  |
| `reports\RESPONSIVE_DESIGN_COVERAGE.md` | file_path | `src/components/settings/StudentProfileForm.tsx` | File not found on disk. |  |
| `reports\RESPONSIVE_DESIGN_COVERAGE.md` | file_path | `src/components/settings/TeacherProfileForm.tsx` | File not found on disk. |  |
| `reports\RESPONSIVE_DESIGN_COVERAGE.md` | file_path | `src/components/ui/avatar.tsx` | File not found on disk. |  |
| `reports\RESPONSIVE_DESIGN_COVERAGE.md` | file_path | `src/components/ui/calendar.tsx` | File not found on disk. |  |
| `reports\RESPONSIVE_DESIGN_COVERAGE.md` | file_path | `src/components/ui/carousel.tsx` | File not found on disk. |  |
| `reports\RESPONSIVE_DESIGN_COVERAGE.md` | file_path | `src/components/ui/chart.tsx` | File not found on disk. |  |
| `reports\RESPONSIVE_DESIGN_COVERAGE.md` | file_path | `src/components/ui/dropdown-menu.tsx` | File not found on disk. |  |
| `reports\RESPONSIVE_DESIGN_COVERAGE.md` | file_path | `src/components/ui/menubar.tsx` | File not found on disk. |  |
| `reports\RESPONSIVE_DESIGN_COVERAGE.md` | file_path | `src/components/ui/popover.tsx` | File not found on disk. |  |
| `reports\RESPONSIVE_DESIGN_COVERAGE.md` | file_path | `src/components/ui/radio-group.tsx` | File not found on disk. |  |
| `reports\RESPONSIVE_DESIGN_COVERAGE.md` | file_path | `src/components/ui/scroll-area.tsx` | File not found on disk. |  |
| `reports\RESPONSIVE_DESIGN_COVERAGE.md` | file_path | `src/components/ui/select.tsx` | File not found on disk. |  |
| `reports\RESPONSIVE_DESIGN_COVERAGE.md` | file_path | `src/components/ui/sidebar.tsx` | File not found on disk. |  |
| `reports\RESPONSIVE_DESIGN_COVERAGE.md` | file_path | `src/components/ui/slider.tsx` | File not found on disk. |  |
| `reports\RESPONSIVE_DESIGN_COVERAGE.md` | file_path | `src/components/ui/switch.tsx` | File not found on disk. |  |
| `reports\RESPONSIVE_DESIGN_COVERAGE.md` | file_path | `src/components/ui/table.tsx` | File not found on disk. |  |
| `reports\RESPONSIVE_DESIGN_COVERAGE.md` | file_path | `src/components/ui/tabs.tsx` | File not found on disk. |  |
| `reports\RESPONSIVE_DESIGN_COVERAGE.md` | file_path | `src/components/ui/toast.tsx` | File not found on disk. |  |
| `reports\SERVER_ACTION_SECURITY_MATRIX.md` | file_path | `src/app/actions/student-configuration.ts` | File not found on disk. |  |
| `reports\SERVER_ACTION_SECURITY_MATRIX.md` | file_path | `src/app/actions/ai-error.ts` | File not found on disk. |  |
| `reports\SERVER_ACTION_SECURITY_MATRIX.md` | file_path | `src/ai/flows/text-to-speech.ts` | File not found on disk. |  |
| `reports\SERVER_ACTION_SECURITY_MATRIX.md` | file_path | `src/ai/flows/syllabus-generator.ts` | File not found on disk. |  |
| `reports\SERVER_ACTION_SECURITY_MATRIX.md` | file_path | `src/ai/flows/speech-to-speech.ts` | File not found on disk. |  |
| `reports\SERVER_ACTION_SECURITY_MATRIX.md` | file_path | `src/ai/flows/smart-revision-planner.ts` | File not found on disk. |  |
| `reports\SERVER_ACTION_SECURITY_MATRIX.md` | file_path | `src/ai/flows/multilingual-cognitive-chatbot.ts` | File not found on disk. |  |
| `reports\SERVER_ACTION_SECURITY_MATRIX.md` | file_path | `src/ai/flows/mindful-mentor.ts` | File not found on disk. |  |
| `reports\SERVER_ACTION_SECURITY_MATRIX.md` | file_path | `src/ai/flows/custom-cognitive-chatbot.ts` | File not found on disk. |  |
| `reports\SERVER_ACTION_SECURITY_MATRIX.md` | file_path | `src/ai/flows/adaptive-quiz-engine.ts` | File not found on disk. |  |
| `reports\task30_vulnerability_scan.md` | file_path | `src/ml/training/requirements.txt` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\ml\requirements.txt? |
| `reports\task30_vulnerability_scan.md` | command | `python dependencies` | Python script 'dependencies' not found. | Check if the script exists. |
| `reports\task32_api_audit.md` | file_path | `src/app/api/` | File not found on disk. |  |
| `reports\task32_api_audit.md` | endpoint | `/api/student` | Endpoint '/api/student' NOT found in src/app/api. |  |
| `reports\task32_api_audit.md` | endpoint | `/api/teacher/students` | Endpoint '/api/teacher/students' NOT found in src/app/api. |  |
| `reports\task32_api_audit.md` | endpoint | `/api/users/[userId]` | Endpoint '/api/users/[userId]' NOT found in src/app/api. |  |
| `reports\task32_api_audit.md` | endpoint | `/api/class` | Endpoint '/api/class' NOT found in src/app/api. |  |
| `reports\task32_api_audit.md` | endpoint | `/api/classes` | Endpoint '/api/classes' NOT found in src/app/api. |  |
| `reports\task32_api_audit.md` | endpoint | `/api/classes` | Endpoint '/api/classes' NOT found in src/app/api. |  |
| `reports\task32_api_audit.md` | endpoint | `/api/students/me` | Endpoint '/api/students/me' NOT found in src/app/api. |  |
| `reports\task32_api_audit.md` | endpoint | `/api/student` | Endpoint '/api/student' NOT found in src/app/api. |  |
| `reports\task32_api_audit.md` | endpoint | `/api/classes/create` | Endpoint '/api/classes/create' NOT found in src/app/api. |  |
| `reports\task32_api_audit.md` | endpoint | `/api/classes` | Endpoint '/api/classes' NOT found in src/app/api. |  |
| `reports\task32_api_audit.md` | endpoint | `/api/classes/join` | Endpoint '/api/classes/join' NOT found in src/app/api. |  |
| `reports\task32_api_audit.md` | endpoint | `/api/classes/[id]/members` | Endpoint '/api/classes/[id]/members' NOT found in src/app/api. |  |
| `reports\task32_api_audit.md` | endpoint | `/api/classes/leave` | Endpoint '/api/classes/leave' NOT found in src/app/api. |  |
| `reports\task32_api_audit.md` | endpoint | `/api/classes/[id]/members` | Endpoint '/api/classes/[id]/members' NOT found in src/app/api. |  |
| `reports\task32_api_audit.md` | endpoint | `/api/users/create` | Endpoint '/api/users/create' NOT found in src/app/api. |  |
| `reports\task32_api_audit.md` | endpoint | `/api/users` | Endpoint '/api/users' NOT found in src/app/api. |  |
| `reports\task32_api_audit.md` | endpoint | `/api/sankalp/session/start` | Endpoint '/api/sankalp/session/start' NOT found in src/app/api. |  |
| `reports\task32_api_audit.md` | endpoint | `/api/sessions` | Endpoint '/api/sessions' NOT found in src/app/api. |  |
| `reports\task32_api_audit.md` | endpoint | `/api/sankalp/session/end` | Endpoint '/api/sankalp/session/end' NOT found in src/app/api. |  |
| `reports\task32_api_audit.md` | endpoint | `/api/sessions/[id]` | Endpoint '/api/sessions/[id]' NOT found in src/app/api. |  |
| `reports\task32_api_audit.md` | endpoint | `/api/quiz/submit` | Endpoint '/api/quiz/submit' NOT found in src/app/api. |  |
| `reports\task32_api_audit.md` | endpoint | `/api/quizzes/[id]/submissions` | Endpoint '/api/quizzes/[id]/submissions' NOT found in src/app/api. |  |
| `reports\task32_api_audit.md` | endpoint | `/api/syllabus/save` | Endpoint '/api/syllabus/save' NOT found in src/app/api. |  |
| `reports\task32_api_audit.md` | endpoint | `/api/syllabus/[id]` | Endpoint '/api/syllabus/[id]' NOT found in src/app/api. |  |
| `reports\task32_api_audit.md` | endpoint | `/api/student` | Endpoint '/api/student' NOT found in src/app/api. |  |
| `reports\task32_api_audit.md` | endpoint | `/api/teacher` | Endpoint '/api/teacher' NOT found in src/app/api. |  |
| `reports\task33_hooks_audit.md` | file_path | `src/components/planner/FocusTimer.tsx` | File not found on disk. |  |
| `reports\task35_strict_mode_audit.md` | file_path | `src/components/FocusTimer.tsx` | File not found on disk. |  |
| `reports\task35_strict_mode_audit.md` | file_path | `src/ml/inference/ml-bridge.ts` | File not found on disk. |  |
| `reports\task36_loading_ux_audit.md` | file_path | `src/components/FocusTimer.tsx` | File not found on disk. |  |
| `reports\teacher-permission-audit.md` | file_path | `src/app/api/teacher/` | File not found on disk. |  |
| `reports\teacher-permission-audit.md` | endpoint | `/api/teacher/` | Endpoint '/api/teacher' NOT found in src/app/api. |  |
| `reports\teacher-permission-audit.md` | file_path | `src/app/api/teacher/students/route.ts` | File not found on disk. |  |
| `reports\teacher-permission-audit.md` | endpoint | `/api/teacher/students/route` | Endpoint '/api/teacher/students' NOT found in src/app/api. |  |
| `reports\teacher-permission-audit.md` | file_path | `src/app/api/teacher/students/route.ts` | File not found on disk. |  |
| `reports\teacher-permission-audit.md` | endpoint | `/api/teacher/students/route` | Endpoint '/api/teacher/students' NOT found in src/app/api. |  |
| `reports\teacher-permission-audit.md` | endpoint | `/api/teacher/students` | Endpoint '/api/teacher/students' NOT found in src/app/api. |  |
| `reports\teacher-permission-audit.md` | file_path | `src/app/api/teacher/students/route.ts` | File not found on disk. |  |
| `reports\teacher-permission-audit.md` | endpoint | `/api/teacher/students/route` | Endpoint '/api/teacher/students' NOT found in src/app/api. |  |
| `reports\TEACHER_PERMISSION_BOUNDARY_REPORT.md` | file_path | `src/app/api/teacher/students/route.ts` | File not found on disk. |  |
| `reports\TEACHER_PERMISSION_BOUNDARY_REPORT.md` | endpoint | `/api/teacher/students/route` | Endpoint '/api/teacher/students' NOT found in src/app/api. |  |
| `reports\TEACHER_PERMISSION_BOUNDARY_REPORT.md` | file_path | `src/app/api/teacher/graph/route.ts` | File not found on disk. |  |
| `reports\TEACHER_PERMISSION_BOUNDARY_REPORT.md` | endpoint | `/api/teacher/graph/route` | Endpoint '/api/teacher/graph' NOT found in src/app/api. |  |
| `reports\THEME_CONSISTENCY_REPORT.md` | file_path | `src/components/ui/chart.tsx` | File not found on disk. |  |
| `reports\THEME_CONSISTENCY_REPORT.md` | file_path | `src/components/ui/chart.tsx` | File not found on disk. |  |
| `reports\THEME_CONSISTENCY_REPORT.md` | file_path | `src/components/ui/chart.tsx` | File not found on disk. |  |
| `reports\THEME_CONSISTENCY_REPORT.md` | file_path | `src/components/ui/chart.tsx` | File not found on disk. |  |
| `reports\THEME_CONSISTENCY_REPORT.md` | file_path | `src/components/ui/chart.tsx` | File not found on disk. |  |
| `reports\THIRD_PARTY_EMBED_REPORT.md` | file_path | `src/ai/flows/schema-regression.test.ts` | File not found on disk. |  |
| `reports\THIRD_PARTY_EMBED_REPORT.md` | file_path | `src/ai/flows/schema-regression.test.ts` | File not found on disk. |  |
| `reports\THIRD_PARTY_EMBED_REPORT.md` | file_path | `src/ai/flows/schema-regression.test.ts` | File not found on disk. |  |
| `reports\THIRD_PARTY_EMBED_REPORT.md` | file_path | `src/ai/flows/schema-regression.test.ts` | File not found on disk. |  |
| `reports\THIRD_PARTY_EMBED_REPORT.md` | file_path | `src/ai/flows/schema-regression.test.ts` | File not found on disk. |  |
| `reports\THIRD_PARTY_EMBED_REPORT.md` | file_path | `src/components/planner/AddStudyMaterial.tsx` | File not found on disk. |  |
| `reports\TIME_DEPENDENCY_REPORT.md` | file_path | `src/components/planner/ScheduleView.tsx` | File not found on disk. |  |
| `reports\TIME_DEPENDENCY_REPORT.md` | file_path | `src/ml/features/student_features.ts` | File not found on disk. |  |
| `reports\TIME_DEPENDENCY_REPORT.md` | file_path | `src/ml/features/student_features.ts` | File not found on disk. |  |
| `reports\type-safety-audit.md` | file_path | `src/ai/flows/custom-cognitive-chatbot.ts` | File not found on disk. |  |
| `reports\type-safety-audit.md` | file_path | `src/ai/flows/smart-revision-planner.ts` | File not found on disk. |  |
| `reports\type-safety-audit.md` | file_path | `src/ai/flows/speech-to-speech.ts` | File not found on disk. |  |
| `reports\type-safety-audit.md` | file_path | `src/ai/flows/text-to-speech.ts` | File not found on disk. |  |
| `reports\type-safety-audit.md` | file_path | `src/app/actions/ai-error.ts` | File not found on disk. |  |
| `reports\type-safety-audit.md` | file_path | `src/app/actions/student-configuration.ts` | File not found on disk. |  |
| `reports\type-safety-audit.md` | file_path | `src/app/api/activity/log/route.ts` | File not found on disk. |  |
| `reports\type-safety-audit.md` | endpoint | `/api/activity/log/route` | Endpoint '/api/activity/log' NOT found in src/app/api. |  |
| `reports\type-safety-audit.md` | file_path | `src/app/api/intelligence/student/route.ts` | File not found on disk. |  |
| `reports\type-safety-audit.md` | endpoint | `/api/intelligence/student/route` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `reports\type-safety-audit.md` | file_path | `src/app/api/planner/convert-to-node/route.ts` | File not found on disk. |  |
| `reports\type-safety-audit.md` | endpoint | `/api/planner/convert-to-node/route` | Endpoint '/api/planner/convert-to-node' NOT found in src/app/api. |  |
| `reports\type-safety-audit.md` | file_path | `src/app/api/student/onboard/route.ts` | File not found on disk. |  |
| `reports\type-safety-audit.md` | endpoint | `/api/student/onboard/route` | Endpoint '/api/student/onboard' NOT found in src/app/api. |  |
| `reports\type-safety-audit.md` | file_path | `src/app/api/test/seed/route.ts` | File not found on disk. |  |
| `reports\type-safety-audit.md` | endpoint | `/api/test/seed/route` | Endpoint '/api/test/seed' NOT found in src/app/api. |  |
| `reports\type-safety-audit.md` | file_path | `src/components/planner/AddStudyMaterial.tsx` | File not found on disk. |  |
| `reports\type-safety-audit.md` | file_path | `src/components/planner/FocusTimer.tsx` | File not found on disk. |  |
| `reports\type-safety-audit.md` | file_path | `src/lib/middleware/auth.ts` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\lib\auth.ts? |
| `reports\type-safety-audit.md` | file_path | `src/ml/inference/ml-bridge.ts` | File not found on disk. |  |
| `reports\TYPE_SAFETY_VIOLATION_REPORT.md` | file_path | `src/app/actions/ai-error.ts` | File not found on disk. |  |
| `reports\TYPE_SAFETY_VIOLATION_REPORT.md` | file_path | `src/app/actions/student-configuration.ts` | File not found on disk. |  |
| `reports\TYPE_SAFETY_VIOLATION_REPORT.md` | file_path | `src/app/api/activity/log/route.ts` | File not found on disk. |  |
| `reports\TYPE_SAFETY_VIOLATION_REPORT.md` | endpoint | `/api/activity/log/route` | Endpoint '/api/activity/log' NOT found in src/app/api. |  |
| `reports\TYPE_SAFETY_VIOLATION_REPORT.md` | file_path | `src/app/api/chaos/route.ts` | File not found on disk. |  |
| `reports\TYPE_SAFETY_VIOLATION_REPORT.md` | endpoint | `/api/chaos/route` | Endpoint '/api/chaos' NOT found in src/app/api. |  |
| `reports\TYPE_SAFETY_VIOLATION_REPORT.md` | file_path | `src/app/api/chaos/route.ts` | File not found on disk. |  |
| `reports\TYPE_SAFETY_VIOLATION_REPORT.md` | endpoint | `/api/chaos/route` | Endpoint '/api/chaos' NOT found in src/app/api. |  |
| `reports\TYPE_SAFETY_VIOLATION_REPORT.md` | file_path | `src/app/api/chaos/route.ts` | File not found on disk. |  |
| `reports\TYPE_SAFETY_VIOLATION_REPORT.md` | endpoint | `/api/chaos/route` | Endpoint '/api/chaos' NOT found in src/app/api. |  |
| `reports\TYPE_SAFETY_VIOLATION_REPORT.md` | file_path | `src/app/api/chaos/route.ts` | File not found on disk. |  |
| `reports\TYPE_SAFETY_VIOLATION_REPORT.md` | endpoint | `/api/chaos/route` | Endpoint '/api/chaos' NOT found in src/app/api. |  |
| `reports\TYPE_SAFETY_VIOLATION_REPORT.md` | file_path | `src/app/api/intelligence/student/route.ts` | File not found on disk. |  |
| `reports\TYPE_SAFETY_VIOLATION_REPORT.md` | endpoint | `/api/intelligence/student/route` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `reports\TYPE_SAFETY_VIOLATION_REPORT.md` | file_path | `src/app/api/intelligence/student/route.ts` | File not found on disk. |  |
| `reports\TYPE_SAFETY_VIOLATION_REPORT.md` | endpoint | `/api/intelligence/student/route` | Endpoint '/api/intelligence/student' NOT found in src/app/api. |  |
| `reports\TYPE_SAFETY_VIOLATION_REPORT.md` | file_path | `src/app/api/planner/convert-to-node/route.ts` | File not found on disk. |  |
| `reports\TYPE_SAFETY_VIOLATION_REPORT.md` | endpoint | `/api/planner/convert-to-node/route` | Endpoint '/api/planner/convert-to-node' NOT found in src/app/api. |  |
| `reports\TYPE_SAFETY_VIOLATION_REPORT.md` | file_path | `src/app/api/student/onboard/route.ts` | File not found on disk. |  |
| `reports\TYPE_SAFETY_VIOLATION_REPORT.md` | endpoint | `/api/student/onboard/route` | Endpoint '/api/student/onboard' NOT found in src/app/api. |  |
| `reports\TYPE_SAFETY_VIOLATION_REPORT.md` | file_path | `src/app/api/test/seed/route.ts` | File not found on disk. |  |
| `reports\TYPE_SAFETY_VIOLATION_REPORT.md` | endpoint | `/api/test/seed/route` | Endpoint '/api/test/seed' NOT found in src/app/api. |  |
| `reports\TYPE_SAFETY_VIOLATION_REPORT.md` | file_path | `src/components/app/sidebar-nav.tsx` | File not found on disk. |  |
| `reports\TYPE_SAFETY_VIOLATION_REPORT.md` | file_path | `src/components/planner/AddStudyMaterial.tsx` | File not found on disk. |  |
| `reports\TYPE_SAFETY_VIOLATION_REPORT.md` | file_path | `src/components/planner/AddStudyMaterial.tsx` | File not found on disk. |  |
| `reports\TYPE_SAFETY_VIOLATION_REPORT.md` | file_path | `src/components/planner/FocusTimer.tsx` | File not found on disk. |  |
| `reports\TYPOGRAPHY_DRIFT_REPORT.md` | file_path | `src/app/test-accessibility/page.tsx` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\app\admin\dashboard\page.tsx, src\app\login\page.tsx, src\app\page.tsx, src\app\parent\dashboard\page.tsx, src\app\parent\onboarding\page.tsx, src\app\student\dashboard\page.tsx, src\app\student\map\page.tsx, src\app\student\onboarding\page.tsx, src\app\student\progress\page.tsx, src\app\student\revision\page.tsx, src\app\student\study\page.tsx, src\app\teacher\dashboard\page.tsx, src\app\teacher\onboarding\page.tsx, src\app\teacher\overview\page.tsx? |
| `reports\TYPOGRAPHY_DRIFT_REPORT.md` | file_path | `src/app/test-accessibility/page.tsx` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\app\admin\dashboard\page.tsx, src\app\login\page.tsx, src\app\page.tsx, src\app\parent\dashboard\page.tsx, src\app\parent\onboarding\page.tsx, src\app\student\dashboard\page.tsx, src\app\student\map\page.tsx, src\app\student\onboarding\page.tsx, src\app\student\progress\page.tsx, src\app\student\revision\page.tsx, src\app\student\study\page.tsx, src\app\teacher\dashboard\page.tsx, src\app\teacher\onboarding\page.tsx, src\app\teacher\overview\page.tsx? |
| `reports\TYPOGRAPHY_DRIFT_REPORT.md` | file_path | `src/app/test-accessibility/page.tsx` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\app\admin\dashboard\page.tsx, src\app\login\page.tsx, src\app\page.tsx, src\app\parent\dashboard\page.tsx, src\app\parent\onboarding\page.tsx, src\app\student\dashboard\page.tsx, src\app\student\map\page.tsx, src\app\student\onboarding\page.tsx, src\app\student\progress\page.tsx, src\app\student\revision\page.tsx, src\app\student\study\page.tsx, src\app\teacher\dashboard\page.tsx, src\app\teacher\onboarding\page.tsx, src\app\teacher\overview\page.tsx? |
| `reports\TYPOGRAPHY_DRIFT_REPORT.md` | file_path | `src/app/test-accessibility/page.tsx` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\app\admin\dashboard\page.tsx, src\app\login\page.tsx, src\app\page.tsx, src\app\parent\dashboard\page.tsx, src\app\parent\onboarding\page.tsx, src\app\student\dashboard\page.tsx, src\app\student\map\page.tsx, src\app\student\onboarding\page.tsx, src\app\student\progress\page.tsx, src\app\student\revision\page.tsx, src\app\student\study\page.tsx, src\app\teacher\dashboard\page.tsx, src\app\teacher\onboarding\page.tsx, src\app\teacher\overview\page.tsx? |
| `reports\TYPOGRAPHY_DRIFT_REPORT.md` | file_path | `src/app/test-accessibility/page.tsx` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\app\admin\dashboard\page.tsx, src\app\login\page.tsx, src\app\page.tsx, src\app\parent\dashboard\page.tsx, src\app\parent\onboarding\page.tsx, src\app\student\dashboard\page.tsx, src\app\student\map\page.tsx, src\app\student\onboarding\page.tsx, src\app\student\progress\page.tsx, src\app\student\revision\page.tsx, src\app\student\study\page.tsx, src\app\teacher\dashboard\page.tsx, src\app\teacher\onboarding\page.tsx, src\app\teacher\overview\page.tsx? |
| `reports\TYPOGRAPHY_DRIFT_REPORT.md` | file_path | `src/app/test-charts/page.tsx` | File not found at specified path, but exists elsewhere. | Did you mean one of: src\app\admin\dashboard\page.tsx, src\app\login\page.tsx, src\app\page.tsx, src\app\parent\dashboard\page.tsx, src\app\parent\onboarding\page.tsx, src\app\student\dashboard\page.tsx, src\app\student\map\page.tsx, src\app\student\onboarding\page.tsx, src\app\student\progress\page.tsx, src\app\student\revision\page.tsx, src\app\student\study\page.tsx, src\app\teacher\dashboard\page.tsx, src\app\teacher\onboarding\page.tsx, src\app\teacher\overview\page.tsx? |
| `reports\TYPOGRAPHY_DRIFT_REPORT.md` | file_path | `src/components/app/header.tsx` | File not found on disk. |  |
| `reports\TYPOGRAPHY_DRIFT_REPORT.md` | file_path | `src/components/app/sidebar-nav.tsx` | File not found on disk. |  |
| `reports\TYPOGRAPHY_DRIFT_REPORT.md` | file_path | `src/components/app/sidebar-nav.tsx` | File not found on disk. |  |
| `reports\TYPOGRAPHY_DRIFT_REPORT.md` | file_path | `src/components/app/teacher-sidebar-nav.tsx` | File not found on disk. |  |
| `reports\TYPOGRAPHY_DRIFT_REPORT.md` | file_path | `src/components/app/teacher-sidebar-nav.tsx` | File not found on disk. |  |
| `reports\TYPOGRAPHY_DRIFT_REPORT.md` | file_path | `src/components/app/teacher-sidebar-nav.tsx` | File not found on disk. |  |
| `reports\TYPOGRAPHY_DRIFT_REPORT.md` | file_path | `src/components/app/teacher-sidebar-nav.tsx` | File not found on disk. |  |
| `reports\TYPOGRAPHY_DRIFT_REPORT.md` | file_path | `src/components/planner/StudyLibrary.tsx` | File not found on disk. |  |
| `reports\TYPOGRAPHY_DRIFT_REPORT.md` | file_path | `src/components/planner/StudyLibrary.tsx` | File not found on disk. |  |
| `reports\TYPOGRAPHY_DRIFT_REPORT.md` | file_path | `src/components/planner/StudyLibrary.tsx` | File not found on disk. |  |
| `reports\TYPOGRAPHY_DRIFT_REPORT.md` | file_path | `src/components/profile/StudentProfile.tsx` | File not found on disk. |  |
| `reports\TYPOGRAPHY_DRIFT_REPORT.md` | file_path | `src/components/profile/StudentProfile.tsx` | File not found on disk. |  |
| `reports\TYPOGRAPHY_DRIFT_REPORT.md` | file_path | `src/components/profile/StudentProfile.tsx` | File not found on disk. |  |
| `reports\TYPOGRAPHY_DRIFT_REPORT.md` | file_path | `src/components/profile/TeacherProfile.tsx` | File not found on disk. |  |
| `reports\TYPOGRAPHY_DRIFT_REPORT.md` | file_path | `src/components/profile/TeacherProfile.tsx` | File not found on disk. |  |
| `reports\TYPOGRAPHY_DRIFT_REPORT.md` | file_path | `src/components/profile/TeacherProfile.tsx` | File not found on disk. |  |
| `reports\TYPOGRAPHY_DRIFT_REPORT.md` | file_path | `src/components/profile/TeacherProfile.tsx` | File not found on disk. |  |
| `reports\TYPOGRAPHY_DRIFT_REPORT.md` | file_path | `src/components/profile/TeacherProfile.tsx` | File not found on disk. |  |
| `reports\TYPOGRAPHY_DRIFT_REPORT.md` | file_path | `src/components/ui/calendar.tsx` | File not found on disk. |  |
| `src\ml\ML_DRIFT_REPORT.md` | file_path | `src/ml/features/student_features.ts` | File not found on disk. |  |
| `src\ml\ML_DRIFT_REPORT.md` | file_path | `src/ml/training/generate_data.py` | File not found on disk. |  |
| `src\ml\ML_DRIFT_REPORT.md` | file_path | `src/ml/features/student_features.ts` | File not found on disk. |  |
| `src\ml\ML_DRIFT_REPORT.md` | file_path | `src/ml/features/student_features.ts` | File not found on disk. |  |
| `src\ml\ML_DRIFT_REPORT.md` | file_path | `src/ml/features/student_features.ts` | File not found on disk. |  |
| `src\ml\ML_DRIFT_REPORT.md` | file_path | `src/ai/flows/smart-revision-planner.ts` | File not found on disk. |  |

## 2. Update Proposals
Below are specific patches to fix the detected issues.

### docs\01_Critical_Security_&_Alerts\ENV_VAR_SECURITY_REPORT.md
```diff
- - **Location:** `src/app/api/chaos/route.ts:29`
+ <!-- [STALE] - **Location:** `src/app/api/chaos/route.ts:29` -->
- - **Location:** `src/app/api/chaos/route.ts:29`
+ <!-- [STALE] - **Location:** `src/app/api/chaos/route.ts:29` -->
```

### docs\02_Core_Architecture_&_Specs\API Documentation.md
```diff
- ### GET `/api/student`
+ <!-- [STALE] ### GET `/api/student` -->
- **Implementation**: `src/app/api/student/route.ts`
+ <!-- [STALE] **Implementation**: `src/app/api/student/route.ts` -->
- **Implementation**: `src/app/api/student/route.ts`
+ <!-- [STALE] **Implementation**: `src/app/api/student/route.ts` -->
- ### POST `/api/student/onboard`
+ <!-- [STALE] ### POST `/api/student/onboard` -->
- **Implementation**: `src/app/api/student/onboard/route.ts`
+ <!-- [STALE] **Implementation**: `src/app/api/student/onboard/route.ts` -->
- **Implementation**: `src/app/api/student/onboard/route.ts`
+ <!-- [STALE] **Implementation**: `src/app/api/student/onboard/route.ts` -->
- ### GET `/api/student/graph`
+ <!-- [STALE] ### GET `/api/student/graph` -->
- **Implementation**: `src/app/api/student/graph/route.ts`
+ <!-- [STALE] **Implementation**: `src/app/api/student/graph/route.ts` -->
- **Implementation**: `src/app/api/student/graph/route.ts`
+ <!-- [STALE] **Implementation**: `src/app/api/student/graph/route.ts` -->
- ### GET `/api/teacher`
+ <!-- [STALE] ### GET `/api/teacher` -->
- **Implementation**: `src/app/api/teacher/route.ts`
+ <!-- [STALE] **Implementation**: `src/app/api/teacher/route.ts` -->
- **Implementation**: `src/app/api/teacher/route.ts`
+ <!-- [STALE] **Implementation**: `src/app/api/teacher/route.ts` -->
- ### POST `/api/teacher/onboard`
+ <!-- [STALE] ### POST `/api/teacher/onboard` -->
- **Implementation**: `src/app/api/teacher/onboard/route.ts`
+ <!-- [STALE] **Implementation**: `src/app/api/teacher/onboard/route.ts` -->
- **Implementation**: `src/app/api/teacher/onboard/route.ts`
+ <!-- [STALE] **Implementation**: `src/app/api/teacher/onboard/route.ts` -->
- ### GET `/api/teacher/students`
+ <!-- [STALE] ### GET `/api/teacher/students` -->
- **Implementation**: `src/app/api/teacher/students/route.ts`
+ <!-- [STALE] **Implementation**: `src/app/api/teacher/students/route.ts` -->
- **Implementation**: `src/app/api/teacher/students/route.ts`
+ <!-- [STALE] **Implementation**: `src/app/api/teacher/students/route.ts` -->
- ### GET `/api/teacher/graph`
+ <!-- [STALE] ### GET `/api/teacher/graph` -->
- **Implementation**: `src/app/api/teacher/graph/route.ts`
+ <!-- [STALE] **Implementation**: `src/app/api/teacher/graph/route.ts` -->
- **Implementation**: `src/app/api/teacher/graph/route.ts`
+ <!-- [STALE] **Implementation**: `src/app/api/teacher/graph/route.ts` -->
- ### GET `/api/users/[userId]`
+ <!-- [STALE] ### GET `/api/users/[userId]` -->
- **Implementation**: `src/app/api/users/[userId]/route.ts`
+ <!-- [STALE] **Implementation**: `src/app/api/users/[userId]/route.ts` -->
- **Implementation**: `src/app/api/users/[userId]/route.ts`
+ <!-- [STALE] **Implementation**: `src/app/api/users/[userId]/route.ts` -->
- ### POST `/api/users/create`
+ <!-- [STALE] ### POST `/api/users/create` -->
- **Implementation**: `src/app/api/users/create/route.ts`
+ <!-- [STALE] **Implementation**: `src/app/api/users/create/route.ts` -->
- **Implementation**: `src/app/api/users/create/route.ts`
+ <!-- [STALE] **Implementation**: `src/app/api/users/create/route.ts` -->
- ### POST `/api/activity/log`
+ <!-- [STALE] ### POST `/api/activity/log` -->
- **Implementation**: `src/app/api/activity/log/route.ts`
+ <!-- [STALE] **Implementation**: `src/app/api/activity/log/route.ts` -->
- **Implementation**: `src/app/api/activity/log/route.ts`
+ <!-- [STALE] **Implementation**: `src/app/api/activity/log/route.ts` -->
- ### POST `/api/quiz/submit`
+ <!-- [STALE] ### POST `/api/quiz/submit` -->
- **Implementation**: `src/app/api/quiz/submit/route.ts`
+ <!-- [STALE] **Implementation**: `src/app/api/quiz/submit/route.ts` -->
- **Implementation**: `src/app/api/quiz/submit/route.ts`
+ <!-- [STALE] **Implementation**: `src/app/api/quiz/submit/route.ts` -->
- ### POST `/api/classes/create`
+ <!-- [STALE] ### POST `/api/classes/create` -->
- ### POST `/api/classes/join`
+ <!-- [STALE] ### POST `/api/classes/join` -->
- curl http://localhost:3000/api/student?studentId=abc123
+ <!-- [STALE] curl http://localhost:3000/api/student?studentId=abc123 -->
```

### docs\02_Core_Architecture_&_Specs\Architecture Map.md
```diff
- UI->>API: POST /api/users/[id]
+ <!-- [STALE] UI->>API: POST /api/users/[id] -->
- CTX->>API: GET /api/student
+ <!-- [STALE] CTX->>API: GET /api/student -->
- E --> F[POST /api/activity/log]
+ <!-- [STALE] E --> F[POST /api/activity/log] -->
- | `/api/student` | Get student | - | - | - |
+ <!-- [STALE] | `/api/student` | Get student | - | - | - | -->
- | `/api/student/onboard` | - | Create student | - | - |
+ <!-- [STALE] | `/api/student/onboard` | - | Create student | - | - | -->
- | `/api/student/graph` | Get graph data | - | - | - |
+ <!-- [STALE] | `/api/student/graph` | Get graph data | - | - | - | -->
- | `/api/teacher` | Get teacher | - | - | - |
+ <!-- [STALE] | `/api/teacher` | Get teacher | - | - | - | -->
- | `/api/teacher/students` | List students | - | - | - |
+ <!-- [STALE] | `/api/teacher/students` | List students | - | - | - | -->
- | `/api/activity/log` | - | Log event | - | - |
+ <!-- [STALE] | `/api/activity/log` | - | Log event | - | - | -->
```

### docs\02_Core_Architecture_&_Specs\ARCHITECTURE.md
```diff
- const response = await fetch('/api/intelligence/student?studentId=123');
+ <!-- [STALE] const response = await fetch('/api/intelligence/student?studentId=123'); -->
- - File: `src/app/api/intelligence/student/route.ts`
+ <!-- [STALE] - File: `src/app/api/intelligence/student/route.ts` -->
- - File: `src/app/api/intelligence/student/route.ts`
+ <!-- [STALE] - File: `src/app/api/intelligence/student/route.ts` -->
- const result = await fetch('/api/quiz/submit', {
+ <!-- [STALE] const result = await fetch('/api/quiz/submit', { -->
- ### ✅ DO: Backend (`src/app/api`, `src/ai`, `src/ml`)
+ <!-- [STALE] ### ✅ DO: Backend (`src/app/api`, `src/ai`, `src/ml`) -->
- // src/app/api/quiz/submit/route.ts
+ <!-- [STALE] // src/app/api/quiz/submit/route.ts -->
- // src/app/api/quiz/submit/route.ts
+ <!-- [STALE] // src/app/api/quiz/submit/route.ts -->
- 1. **Frontend Component**: `src/components/quiz/NewQuizType.tsx`
+ <!-- [STALE] 1. **Frontend Component**: `src/components/quiz/NewQuizType.tsx` -->
- 2. **API Route**: `src/app/api/quiz/new-type/route.ts`
+ <!-- [STALE] 2. **API Route**: `src/app/api/quiz/new-type/route.ts` -->
- 2. **API Route**: `src/app/api/quiz/new-type/route.ts`
+ <!-- [STALE] 2. **API Route**: `src/app/api/quiz/new-type/route.ts` -->
- 3. **AI Flow** (if using LLM): `src/ai/flows/new-quiz-generator.ts`
+ <!-- [STALE] 3. **AI Flow** (if using LLM): `src/ai/flows/new-quiz-generator.ts` -->
- 2. **API Route**: `src/app/api/teacher/students/route.ts`
+ <!-- [STALE] 2. **API Route**: `src/app/api/teacher/students/route.ts` -->
- 2. **API Route**: `src/app/api/teacher/students/route.ts`
+ <!-- [STALE] 2. **API Route**: `src/app/api/teacher/students/route.ts` -->
- Browser->>API: fetch('/api/intelligence/student')
+ <!-- [STALE] Browser->>API: fetch('/api/intelligence/student') -->
```

### docs\02_Core_Architecture_&_Specs\DATABASE.md
```diff
- **Frontend (`/api/intelligence/student/route.ts`):**
+ <!-- [STALE] **Frontend (`/api/intelligence/student/route.ts`):** -->
- **`src/lib/db.ts` (NEW FILE):**
+ <!-- [STALE] **`src/lib/db.ts` (NEW FILE):** -->
- **`src/app/api/intelligence/student/route.ts`:**
+ <!-- [STALE] **`src/app/api/intelligence/student/route.ts`:** -->
- **`src/app/api/intelligence/student/route.ts`:**
+ <!-- [STALE] **`src/app/api/intelligence/student/route.ts`:** -->
- // src/app/api/quiz/submit/route.ts
+ <!-- [STALE] // src/app/api/quiz/submit/route.ts -->
- // src/app/api/quiz/submit/route.ts
+ <!-- [STALE] // src/app/api/quiz/submit/route.ts -->
- curl http://localhost:3000/api/intelligence/student?studentId=<real-id>
+ <!-- [STALE] curl http://localhost:3000/api/intelligence/student?studentId=<real-id> -->
- - [ ] `src/app/api/intelligence/student/route.ts` - Replace mock `studentHistory`
+ <!-- [STALE] - [ ] `src/app/api/intelligence/student/route.ts` - Replace mock `studentHistory` -->
- - [ ] `src/app/api/intelligence/student/route.ts` - Replace mock `studentHistory`
+ <!-- [STALE] - [ ] `src/app/api/intelligence/student/route.ts` - Replace mock `studentHistory` -->
```

### docs\02_Core_Architecture_&_Specs\FASTAPI_MIGRATION_READINESS.md
```diff
- This report assesses the readiness of the current Python inference layer (`src/ml/inference/predict_mastery.py`) for migration to a standalone FastAPI microservice. The current architecture uses a Node.js-managed subprocess with stdin/stdout communication, which is suitable for development but limits scalability and observability in production.
+ <!-- [STALE] This report assesses the readiness of the current Python inference layer (`src/ml/inference/predict_mastery.py`) for migration to a standalone FastAPI microservice. The current architecture uses a Node.js-managed subprocess with stdin/stdout communication, which is suitable for development but limits scalability and observability in production. -->
- -   **Orchestrator:** `src/ml/inference/ml-bridge.ts` (Node.js).
+ <!-- [STALE] -   **Orchestrator:** `src/ml/inference/ml-bridge.ts` (Node.js). -->
```

### docs\02_Core_Architecture_&_Specs\OBSERVABILITY_INFRASTRUCTURE_SPEC.md
```diff
- *   `api_handler`: Wraps API routes (e.g., `GET /api/intelligence/student`).
+ <!-- [STALE] *   `api_handler`: Wraps API routes (e.g., `GET /api/intelligence/student`). -->
- *   **Location**: `src/ml/inference/ml-bridge.ts`
+ <!-- [STALE] *   **Location**: `src/ml/inference/ml-bridge.ts` -->
- *   **Location**: `src/ml/inference/predict_mastery.py`
+ <!-- [STALE] *   **Location**: `src/ml/inference/predict_mastery.py` -->
- | **Node.js → Python** | Stdio Pipe | `src/ml/inference/ml-bridge.ts` (`proc.stdin.write`) | **Critical**: Must manually inject `_trace_id` into the JSON payload. |
+ <!-- [STALE] | **Node.js → Python** | Stdio Pipe | `src/ml/inference/ml-bridge.ts` (`proc.stdin.write`) | **Critical**: Must manually inject `_trace_id` into the JSON payload. | -->
- | **Python → Node.js** | Stdio Pipe | `src/ml/inference/ml-bridge.ts` (`rl.on("line")`) | Correlate the response log with the request span using the `_id` (and implicitly the active trace if context is preserved). |
+ <!-- [STALE] | **Python → Node.js** | Stdio Pipe | `src/ml/inference/ml-bridge.ts` (`rl.on("line")`) | Correlate the response log with the request span using the `_id` (and implicitly the active trace if context is preserved). | -->
- |-- [span: fetch /api/intelligence/student] (Frontend HTTP) -----------------------------> 950ms
+ <!-- [STALE] |-- [span: fetch /api/intelligence/student] (Frontend HTTP) -----------------------------> 950ms -->
- |-- [span: GET /api/intelligence/student] (Backend API) -----------------------------> 900ms
+ <!-- [STALE] |-- [span: GET /api/intelligence/student] (Backend API) -----------------------------> 900ms -->
- *   **Location**: `src/ml/inference/ml-bridge.ts` and `src/ml/inference/predict_mastery.py`
+ <!-- [STALE] *   **Location**: `src/ml/inference/ml-bridge.ts` and `src/ml/inference/predict_mastery.py` -->
- *   **Location**: `src/ml/inference/ml-bridge.ts` and `src/ml/inference/predict_mastery.py`
+ <!-- [STALE] *   **Location**: `src/ml/inference/ml-bridge.ts` and `src/ml/inference/predict_mastery.py` -->
- 1.  **Frontend**: `GET /api/intelligence/student` (Status: 200 OK, but partial content)
+ <!-- [STALE] 1.  **Frontend**: `GET /api/intelligence/student` (Status: 200 OK, but partial content) -->
- 1.  **Frontend**: `POST /api/quiz/submit` (Status: 500)
+ <!-- [STALE] 1.  **Frontend**: `POST /api/quiz/submit` (Status: 500) -->
```

### docs\02_Core_Architecture_&_Specs\OBSERVABILITY_SPEC.md
```diff
- #### A. Quiz Submission Flow (`src/app/api/quiz/submit`)
+ <!-- [STALE] #### A. Quiz Submission Flow (`src/app/api/quiz/submit`) -->
- #### A. Quiz Submission Flow (`src/app/api/quiz/submit`)
+ <!-- [STALE] #### A. Quiz Submission Flow (`src/app/api/quiz/submit`) -->
- #### B. Smart Revision Planner Flow (`src/ai/flows/smart-revision-planner.ts`)
+ <!-- [STALE] #### B. Smart Revision Planner Flow (`src/ai/flows/smart-revision-planner.ts`) -->
- #### C. ML Bridge (`src/ml/inference/ml-bridge.ts`)
+ <!-- [STALE] #### C. ML Bridge (`src/ml/inference/ml-bridge.ts`) -->
- ### 3. Python Instrumentation (`src/ml/inference/predict_mastery.py`)
+ <!-- [STALE] ### 3. Python Instrumentation (`src/ml/inference/predict_mastery.py`) -->
```

### docs\02_Core_Architecture_&_Specs\SCHEMA_MIGRATION_RISK_MATRIX.md
```diff
- derived from `src/ml/training/training_data.csv` headers
+ <!-- [STALE] derived from `src/ml/training/training_data.csv` headers -->
```

### docs\03_Audit_Reports_&_Validation\AUDIT_REPORT.md
```diff
- - `src/components/ui/accordion.tsx`
+ <!-- [STALE] - `src/components/ui/accordion.tsx` -->
- - `src/components/ui/alert.tsx` (Note: `alert-dialog.tsx` IS used)
+ <!-- [STALE] - `src/components/ui/alert.tsx` (Note: `alert-dialog.tsx` IS used) -->
- - `src/components/ui/calendar.tsx`
+ <!-- [STALE] - `src/components/ui/calendar.tsx` -->
- - `src/components/ui/carousel.tsx`
+ <!-- [STALE] - `src/components/ui/carousel.tsx` -->
- - `src/components/ui/collapsible.tsx`
+ <!-- [STALE] - `src/components/ui/collapsible.tsx` -->
- - `src/components/ui/menubar.tsx`
+ <!-- [STALE] - `src/components/ui/menubar.tsx` -->
- - `src/components/ui/slider.tsx`
+ <!-- [STALE] - `src/components/ui/slider.tsx` -->
```

### docs\03_Audit_Reports_&_Validation\AUDIT_REPORTS.md
```diff
- *   **Badges:** Defined in `Badge` interface (`src/data/docsData.ts`). Displayed in `RewardsPage` (`src/app/(main)/rewards/page.tsx`). Logic to retrieve badges exists in `getStudentBadges` (`src/lib/rewards/calculateRewards.ts`).
+ <!-- [STALE] *   **Badges:** Defined in `Badge` interface (`src/data/docsData.ts`). Displayed in `RewardsPage` (`src/app/(main)/rewards/page.tsx`). Logic to retrieve badges exists in `getStudentBadges` (`src/lib/rewards/calculateRewards.ts`). -->
```

### docs\03_Audit_Reports_&_Validation\design-token-violations.md
```diff
- | src/components/app/sidebar-nav.tsx | 84 | `text-[10px]` | Use nearest text size token | `<span className="text-[10px] font-medium text-mute...` |
+ <!-- [STALE] | src/components/app/sidebar-nav.tsx | 84 | `text-[10px]` | Use nearest text size token | `<span className="text-[10px] font-medium text-mute...` | -->
- | src/components/app/teacher-sidebar-nav.tsx | 47 | `text-[10px]` | Use nearest text size token | `<p className="text-[10px] text-muted-foreground up...` |
+ <!-- [STALE] | src/components/app/teacher-sidebar-nav.tsx | 47 | `text-[10px]` | Use nearest text size token | `<p className="text-[10px] text-muted-foreground up...` | -->
- | src/components/app/teacher-sidebar-nav.tsx | 66 | `text-[10px]` | Use nearest text size token | `className="ml-auto text-[10px] h-5 px-1.5 text-mut...` |
+ <!-- [STALE] | src/components/app/teacher-sidebar-nav.tsx | 66 | `text-[10px]` | Use nearest text size token | `className="ml-auto text-[10px] h-5 px-1.5 text-mut...` | -->
- | src/components/app/teacher-sidebar-nav.tsx | 92 | `text-[10px]` | Use nearest text size token | `<span className="text-[10px] font-medium text-mute...` |
+ <!-- [STALE] | src/components/app/teacher-sidebar-nav.tsx | 92 | `text-[10px]` | Use nearest text size token | `<span className="text-[10px] font-medium text-mute...` | -->
- | src/components/planner/StudyLibrary.tsx | 86 | `w-[200px]` | Use nearest spacing token | `<SelectTrigger className="w-full sm:w-[200px]" ari...` |
+ <!-- [STALE] | src/components/planner/StudyLibrary.tsx | 86 | `w-[200px]` | Use nearest spacing token | `<SelectTrigger className="w-full sm:w-[200px]" ari...` | -->
- | src/components/rewards/RewardsSkeleton.tsx | 72 | `h-[300px]` | Use nearest spacing token | `<Skeleton className="h-[300px] w-full" />` |
+ <!-- [STALE] | src/components/rewards/RewardsSkeleton.tsx | 72 | `h-[300px]` | Use nearest spacing token | `<Skeleton className="h-[300px] w-full" />` | -->
- | src/components/ui/chart.tsx | 55 | `#ccc` | Use a Tailwind color token (e.g., text-primary, bg-muted) | `"flex aspect-video justify-center text-xs [&_.rech...` |
+ <!-- [STALE] | src/components/ui/chart.tsx | 55 | `#ccc` | Use a Tailwind color token (e.g., text-primary, bg-muted) | `"flex aspect-video justify-center text-xs [&_.rech...` | -->
- | src/components/ui/chart.tsx | 55 | `#fff` | Use a Tailwind color token (e.g., text-primary, bg-muted) | `"flex aspect-video justify-center text-xs [&_.rech...` |
+ <!-- [STALE] | src/components/ui/chart.tsx | 55 | `#fff` | Use a Tailwind color token (e.g., text-primary, bg-muted) | `"flex aspect-video justify-center text-xs [&_.rech...` | -->
- | src/components/ui/chart.tsx | 55 | `#ccc` | Use a Tailwind color token (e.g., text-primary, bg-muted) | `"flex aspect-video justify-center text-xs [&_.rech...` |
+ <!-- [STALE] | src/components/ui/chart.tsx | 55 | `#ccc` | Use a Tailwind color token (e.g., text-primary, bg-muted) | `"flex aspect-video justify-center text-xs [&_.rech...` | -->
- | src/components/ui/chart.tsx | 55 | `#ccc` | Use a Tailwind color token (e.g., text-primary, bg-muted) | `"flex aspect-video justify-center text-xs [&_.rech...` |
+ <!-- [STALE] | src/components/ui/chart.tsx | 55 | `#ccc` | Use a Tailwind color token (e.g., text-primary, bg-muted) | `"flex aspect-video justify-center text-xs [&_.rech...` | -->
- | src/components/ui/chart.tsx | 55 | `#fff` | Use a Tailwind color token (e.g., text-primary, bg-muted) | `"flex aspect-video justify-center text-xs [&_.rech...` |
+ <!-- [STALE] | src/components/ui/chart.tsx | 55 | `#fff` | Use a Tailwind color token (e.g., text-primary, bg-muted) | `"flex aspect-video justify-center text-xs [&_.rech...` | -->
- | src/components/ui/scroll-area.tsx | 36 | `p-[1px]` | Use spacing token 'px' | `"h-full w-2.5 border-l border-l-transparent p-[1px...` |
+ <!-- [STALE] | src/components/ui/scroll-area.tsx | 36 | `p-[1px]` | Use spacing token 'px' | `"h-full w-2.5 border-l border-l-transparent p-[1px...` | -->
- | src/components/ui/scroll-area.tsx | 38 | `p-[1px]` | Use spacing token 'px' | `"h-2.5 flex-col border-t border-t-transparent p-[1...` |
+ <!-- [STALE] | src/components/ui/scroll-area.tsx | 38 | `p-[1px]` | Use spacing token 'px' | `"h-2.5 flex-col border-t border-t-transparent p-[1...` | -->
- | src/components/ui/separator.tsx | 22 | `h-[1px]` | Use spacing token 'px' | `orientation === "horizontal" ? "h-[1px] w-full" : ...` |
+ <!-- [STALE] | src/components/ui/separator.tsx | 22 | `h-[1px]` | Use spacing token 'px' | `orientation === "horizontal" ? "h-[1px] w-full" : ...` | -->
- | src/components/ui/separator.tsx | 22 | `w-[1px]` | Use spacing token 'px' | `orientation === "horizontal" ? "h-[1px] w-full" : ...` |
+ <!-- [STALE] | src/components/ui/separator.tsx | 22 | `w-[1px]` | Use spacing token 'px' | `orientation === "horizontal" ? "h-[1px] w-full" : ...` | -->
- | src/components/ui/sidebar.tsx | 303 | `w-[2px]` | Use spacing token '0.5' | `"absolute inset-y-0 z-20 hidden w-4 -translate-x-1...` |
+ <!-- [STALE] | src/components/ui/sidebar.tsx | 303 | `w-[2px]` | Use spacing token '0.5' | `"absolute inset-y-0 z-20 hidden w-4 -translate-x-1...` | -->
- | src/components/ui/textarea.tsx | 10 | `min-h-[80px]` | Use spacing token '20' | `'flex min-h-[80px] w-full rounded-md border border...` |
+ <!-- [STALE] | src/components/ui/textarea.tsx | 10 | `min-h-[80px]` | Use spacing token '20' | `'flex min-h-[80px] w-full rounded-md border border...` | -->
- | src/components/ui/toast.tsx | 19 | `max-w-[420px]` | Use nearest spacing token | `"fixed top-0 z-[100] flex max-h-screen w-full flex...` |
+ <!-- [STALE] | src/components/ui/toast.tsx | 19 | `max-w-[420px]` | Use nearest spacing token | `"fixed top-0 z-[100] flex max-h-screen w-full flex...` | -->
```

### docs\03_Audit_Reports_&_Validation\FLOW_VALIDATION_AUDIT.md
```diff
- **Scope:** src/ai/flows/
+ <!-- [STALE] **Scope:** src/ai/flows/ -->
```

### docs\03_Audit_Reports_&_Validation\FLOW_VALIDATION_AUDIT_REPORT.md
```diff
- **Scope:** src/ai/flows/
+ <!-- [STALE] **Scope:** src/ai/flows/ -->
```

### docs\03_Audit_Reports_&_Validation\FORGETTING_CURVE_AUDIT.md
```diff
- 1.  **Input Simulation**: Provided student feature data to `src/ml/inference/predict_mastery.py`.
+ <!-- [STALE] 1.  **Input Simulation**: Provided student feature data to `src/ml/inference/predict_mastery.py`. -->
- The ADK logic in `src/ai/adk/decision-engine.ts` attempts to use this value:
+ <!-- [STALE] The ADK logic in `src/ai/adk/decision-engine.ts` attempts to use this value: -->
- 1.  **Implement Calculation**: Add logic to `src/ml/inference/predict_mastery.py` (or a new script) to calculate `days_until_forget`.
+ <!-- [STALE] 1.  **Implement Calculation**: Add logic to `src/ml/inference/predict_mastery.py` (or a new script) to calculate `days_until_forget`. -->
```

### docs\03_Audit_Reports_&_Validation\GENKIT_FLOW_VALIDATION_REPORT.md
```diff
- **Scope:** `src/ai/flows/`
+ <!-- [STALE] **Scope:** `src/ai/flows/` -->
- All Genkit flows in `src/ai/flows/` implement input validation using Zod schemas. However, most schemas rely on generic `z.string()` types without length constraints or pattern matching. Prompt construction typically involves direct interpolation of these user inputs into the system prompt, creating potential prompt injection vulnerabilities.
+ <!-- [STALE] All Genkit flows in `src/ai/flows/` implement input validation using Zod schemas. However, most schemas rely on generic `z.string()` types without length constraints or pattern matching. Prompt construction typically involves direct interpolation of these user inputs into the system prompt, creating potential prompt injection vulnerabilities. -->
```

### docs\03_Audit_Reports_&_Validation\ML_DRIFT_REPORT.md
```diff
- **Source Analysis:** `src/ml/features/student_features.ts` vs `src/ml/training/generate_data.py`
+ <!-- [STALE] **Source Analysis:** `src/ml/features/student_features.ts` vs `src/ml/training/generate_data.py` -->
- **Source Analysis:** `src/ml/features/student_features.ts` vs `src/ml/training/generate_data.py`
+ <!-- [STALE] **Source Analysis:** `src/ml/features/student_features.ts` vs `src/ml/training/generate_data.py` -->
```

### docs\03_Audit_Reports_&_Validation\POLYGLOT_TYPE_CONSISTENCY_REPORT.md
```diff
- - `src/ai/flows/smart-revision-planner.ts`: Maps `mastery_probability` → `masteryProbability` manually.
+ <!-- [STALE] - `src/ai/flows/smart-revision-planner.ts`: Maps `mastery_probability` → `masteryProbability` manually. -->
- - `src/ml/features/student_features.ts`: Manually constructs snake_case object.
+ <!-- [STALE] - `src/ml/features/student_features.ts`: Manually constructs snake_case object. -->
```

### docs\03_Audit_Reports_&_Validation\PRE_ROLLOUT_CHECKLIST.md
```diff
- - [ ] `src/app/api/intelligence/student/route.ts`
+ <!-- [STALE] - [ ] `src/app/api/intelligence/student/route.ts` -->
- - [ ] `src/app/api/intelligence/student/route.ts`
+ <!-- [STALE] - [ ] `src/app/api/intelligence/student/route.ts` -->
- python --version  # Should be 3.8+
+ <!-- [STALE] python --version  # Should be 3.8+ -->
- python generate_data.py
+ <!-- [STALE] python generate_data.py -->
- python train_mastery_model.py
+ <!-- [STALE] python train_mastery_model.py -->
- # Verify: src/ml/models/mastery_model.pkl exists
+ <!-- [STALE] # Verify: src/ml/models/mastery_model.pkl exists -->
```

### docs\03_Audit_Reports_&_Validation\smart_revision_flow_integrity_report.md
```diff
- **Location:** `src/ai/flows/smart-revision-planner.ts`
+ <!-- [STALE] **Location:** `src/ai/flows/smart-revision-planner.ts` -->
- **Location:** `src/ai/flows/smart-revision-planner.ts` (`makeRevisionDecisions`)
+ <!-- [STALE] **Location:** `src/ai/flows/smart-revision-planner.ts` (`makeRevisionDecisions`) -->
- **Location:** `src/components/planner/ScheduleView.tsx`
+ <!-- [STALE] **Location:** `src/components/planner/ScheduleView.tsx` -->
```

### docs\03_Audit_Reports_&_Validation\typography-drift-report.md
```diff
- | src/app/test-accessibility/page.tsx | 10 | Heading <h1> uses inconsistent size: text-2xl. Expected one of: text-4xl, text-5xl, text-6xl, font-headline |
+ | src\app\admin\dashboard\page.tsx | 10 | Heading <h1> uses inconsistent size: text-2xl. Expected one of: text-4xl, text-5xl, text-6xl, font-headline | (Proposed)
- | src/app/test-accessibility/page.tsx | 13 | Heading <h2> uses inconsistent size: text-xl. Expected one of: text-3xl, text-4xl, font-headline |
+ | src\app\admin\dashboard\page.tsx | 13 | Heading <h2> uses inconsistent size: text-xl. Expected one of: text-3xl, text-4xl, font-headline | (Proposed)
- | src/app/test-accessibility/page.tsx | 25 | Heading <h2> uses inconsistent size: text-xl. Expected one of: text-3xl, text-4xl, font-headline |
+ | src\app\admin\dashboard\page.tsx | 25 | Heading <h2> uses inconsistent size: text-xl. Expected one of: text-3xl, text-4xl, font-headline | (Proposed)
- | src/app/test-accessibility/page.tsx | 39 | Heading <h2> uses inconsistent size: text-xl. Expected one of: text-3xl, text-4xl, font-headline |
+ | src\app\admin\dashboard\page.tsx | 39 | Heading <h2> uses inconsistent size: text-xl. Expected one of: text-3xl, text-4xl, font-headline | (Proposed)
- | src/app/test-accessibility/page.tsx | 51 | Heading <h2> uses inconsistent size: text-xl. Expected one of: text-3xl, text-4xl, font-headline |
+ | src\app\admin\dashboard\page.tsx | 51 | Heading <h2> uses inconsistent size: text-xl. Expected one of: text-3xl, text-4xl, font-headline | (Proposed)
- | src/app/test-charts/page.tsx | 30 | Heading <h1> uses inconsistent size: text-2xl. Expected one of: text-4xl, text-5xl, text-6xl, font-headline |
+ | src\app\admin\dashboard\page.tsx | 30 | Heading <h1> uses inconsistent size: text-2xl. Expected one of: text-4xl, text-5xl, text-6xl, font-headline | (Proposed)
- | src/components/app/header.tsx | 54 | Heading <h1> uses inconsistent size: text-xl. Expected one of: text-4xl, text-5xl, text-6xl, font-headline |
+ <!-- [STALE] | src/components/app/header.tsx | 54 | Heading <h1> uses inconsistent size: text-xl. Expected one of: text-4xl, text-5xl, text-6xl, font-headline | -->
- | src/components/app/sidebar-nav.tsx | 54 | Heading <h2> uses inconsistent size: text-xl. Expected one of: text-3xl, text-4xl, font-headline |
+ <!-- [STALE] | src/components/app/sidebar-nav.tsx | 54 | Heading <h2> uses inconsistent size: text-xl. Expected one of: text-3xl, text-4xl, font-headline | -->
- | src/components/app/sidebar-nav.tsx | 84 | Arbitrary text size used: text-[10px] |
+ <!-- [STALE] | src/components/app/sidebar-nav.tsx | 84 | Arbitrary text size used: text-[10px] | -->
- | src/components/app/teacher-sidebar-nav.tsx | 46 | Heading <h2> uses inconsistent size: text-xl. Expected one of: text-3xl, text-4xl, font-headline |
+ <!-- [STALE] | src/components/app/teacher-sidebar-nav.tsx | 46 | Heading <h2> uses inconsistent size: text-xl. Expected one of: text-3xl, text-4xl, font-headline | -->
- | src/components/app/teacher-sidebar-nav.tsx | 47 | Arbitrary text size used: text-[10px] |
+ <!-- [STALE] | src/components/app/teacher-sidebar-nav.tsx | 47 | Arbitrary text size used: text-[10px] | -->
- | src/components/app/teacher-sidebar-nav.tsx | 66 | Arbitrary text size used: text-[10px] |
+ <!-- [STALE] | src/components/app/teacher-sidebar-nav.tsx | 66 | Arbitrary text size used: text-[10px] | -->
- | src/components/app/teacher-sidebar-nav.tsx | 92 | Arbitrary text size used: text-[10px] |
+ <!-- [STALE] | src/components/app/teacher-sidebar-nav.tsx | 92 | Arbitrary text size used: text-[10px] | -->
- | src/components/planner/StudyLibrary.tsx | 104 | Heading <h3> uses inconsistent size: text-lg. Expected one of: text-2xl, text-3xl, font-headline |
+ <!-- [STALE] | src/components/planner/StudyLibrary.tsx | 104 | Heading <h3> uses inconsistent size: text-lg. Expected one of: text-2xl, text-3xl, font-headline | -->
- | src/components/planner/StudyLibrary.tsx | 201 | Heading <h4> uses inconsistent size: text-sm. Expected one of: text-xl, text-2xl, font-headline |
+ <!-- [STALE] | src/components/planner/StudyLibrary.tsx | 201 | Heading <h4> uses inconsistent size: text-sm. Expected one of: text-xl, text-2xl, font-headline | -->
- | src/components/planner/StudyLibrary.tsx | 229 | Heading <h4> uses inconsistent size: text-sm. Expected one of: text-xl, text-2xl, font-headline |
+ <!-- [STALE] | src/components/planner/StudyLibrary.tsx | 229 | Heading <h4> uses inconsistent size: text-sm. Expected one of: text-xl, text-2xl, font-headline | -->
- | src/components/profile/StudentProfile.tsx | 47 | Heading <h2> uses inconsistent size: text-2xl. Expected one of: text-3xl, text-4xl, font-headline |
+ <!-- [STALE] | src/components/profile/StudentProfile.tsx | 47 | Heading <h2> uses inconsistent size: text-2xl. Expected one of: text-3xl, text-4xl, font-headline | -->
- | src/components/profile/StudentProfile.tsx | 90 | Heading <h1> uses inconsistent size: text-3xl. Expected one of: text-4xl, text-5xl, text-6xl, font-headline |
+ <!-- [STALE] | src/components/profile/StudentProfile.tsx | 90 | Heading <h1> uses inconsistent size: text-3xl. Expected one of: text-4xl, text-5xl, text-6xl, font-headline | -->
- | src/components/profile/StudentProfile.tsx | 117 | Heading <h3> uses inconsistent size: text-lg. Expected one of: text-2xl, text-3xl, font-headline |
+ <!-- [STALE] | src/components/profile/StudentProfile.tsx | 117 | Heading <h3> uses inconsistent size: text-lg. Expected one of: text-2xl, text-3xl, font-headline | -->
- | src/components/profile/TeacherProfile.tsx | 45 | Heading <h2> uses inconsistent size: text-2xl. Expected one of: text-3xl, text-4xl, font-headline |
+ <!-- [STALE] | src/components/profile/TeacherProfile.tsx | 45 | Heading <h2> uses inconsistent size: text-2xl. Expected one of: text-3xl, text-4xl, font-headline | -->
- | src/components/profile/TeacherProfile.tsx | 75 | Heading <h1> uses inconsistent size: text-3xl. Expected one of: text-4xl, text-5xl, text-6xl, font-headline |
+ <!-- [STALE] | src/components/profile/TeacherProfile.tsx | 75 | Heading <h1> uses inconsistent size: text-3xl. Expected one of: text-4xl, text-5xl, text-6xl, font-headline | -->
- | src/components/profile/TeacherProfile.tsx | 104 | Heading <h3> uses inconsistent size: text-lg. Expected one of: text-2xl, text-3xl, font-headline |
+ <!-- [STALE] | src/components/profile/TeacherProfile.tsx | 104 | Heading <h3> uses inconsistent size: text-lg. Expected one of: text-2xl, text-3xl, font-headline | -->
- | src/components/profile/TeacherProfile.tsx | 125 | Heading <h4> uses inconsistent size: text-sm. Expected one of: text-xl, text-2xl, font-headline |
+ <!-- [STALE] | src/components/profile/TeacherProfile.tsx | 125 | Heading <h4> uses inconsistent size: text-sm. Expected one of: text-xl, text-2xl, font-headline | -->
- | src/components/profile/TeacherProfile.tsx | 139 | Heading <h4> uses inconsistent size: text-sm. Expected one of: text-xl, text-2xl, font-headline |
+ <!-- [STALE] | src/components/profile/TeacherProfile.tsx | 139 | Heading <h4> uses inconsistent size: text-sm. Expected one of: text-xl, text-2xl, font-headline | -->
- | src/components/ui/calendar.tsx | 37 | Arbitrary text size used: text-[0.8rem] |
+ <!-- [STALE] | src/components/ui/calendar.tsx | 37 | Arbitrary text size used: text-[0.8rem] | -->
```

### docs\04_Performance_&_Optimization\BUNDLE_SIZE_REPORT.md
```diff
- | `src/app/api/intelligence/student/route.ts` | 10.08 |
+ <!-- [STALE] | `src/app/api/intelligence/student/route.ts` | 10.08 | -->
- | `src/app/api/intelligence/student/route.ts` | 10.08 |
+ <!-- [STALE] | `src/app/api/intelligence/student/route.ts` | 10.08 | -->
- | `src/app/api/activity/log/route.ts` | 5.77 |
+ <!-- [STALE] | `src/app/api/activity/log/route.ts` | 5.77 | -->
- | `src/app/api/activity/log/route.ts` | 5.77 |
+ <!-- [STALE] | `src/app/api/activity/log/route.ts` | 5.77 | -->
```

### docs\04_Performance_&_Optimization\LLM-Cost-Projection.md
```diff
- This document provides a cost projection for LLM usage within the application, specifically focusing on the `src/ai/flows/` and related AI features. Estimates are based on current prompt structures, projected token usage, and standard pricing for **Gemini 2.0 Flash**.
+ <!-- [STALE] This document provides a cost projection for LLM usage within the application, specifically focusing on the `src/ai/flows/` and related AI features. Estimates are based on current prompt structures, projected token usage, and standard pricing for **Gemini 2.0 Flash**. -->
- ### 7. AI Error Handling (`src/app/actions/ai-error.ts`)
+ <!-- [STALE] ### 7. AI Error Handling (`src/app/actions/ai-error.ts`) -->
```

### docs\04_Performance_&_Optimization\LLM_TOKEN_USAGE_COST_PROJECTION.md
```diff
- **Scope:** `src/ai/flows/` (Genkit LLM calls)
+ <!-- [STALE] **Scope:** `src/ai/flows/` (Genkit LLM calls) -->
```

### docs\04_Performance_&_Optimization\ML_PERFORMANCE_REPORT.md
```diff
- The model was evaluated on a fixed holdout test set (`src/ml/training/test_set.csv`).
+ <!-- [STALE] The model was evaluated on a fixed holdout test set (`src/ml/training/test_set.csv`). -->
```

### docs\05_ML_AI_&_Genkit\ml_model_integration.md
```diff
- src/ml/models/mastery_model.pkl
+ <!-- [STALE] src/ml/models/mastery_model.pkl -->
- src/ml/features/student_features.ts
+ <!-- [STALE] src/ml/features/student_features.ts -->
- Save your trained model to src/ml/models/your_model_name.pkl
+ <!-- [STALE] Save your trained model to src/ml/models/your_model_name.pkl -->
- Create an inference script at src/ml/inference/predict_your_task.py:
+ <!-- [STALE] Create an inference script at src/ml/inference/predict_your_task.py: -->
- Create a TypeScript bridge in src/ml/inference/ to call your Python script:
+ <!-- [STALE] Create a TypeScript bridge in src/ml/inference/ to call your Python script: -->
- `echo '${input}' | python predict_your_task.py`,
+ <!-- [STALE] `echo '${input}' | python predict_your_task.py`, -->
- { cwd: 'src/ml/inference' }
+ <!-- [STALE] { cwd: 'src/ml/inference' } -->
- Install dependencies in src/ml/training/requirements.txt:
+ Install dependencies in src\ml\requirements.txt: (Proposed)
- Python inference script exists in src/ml/inference/
+ <!-- [STALE] Python inference script exists in src/ml/inference/ -->
```

### docs\05_ML_AI_&_Genkit\ML_QUICKSTART.md
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

### docs\05_ML_AI_&_Genkit\ML_SETUP_GUIDE.md
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

### docs\05_ML_AI_&_Genkit\mobile_responsive_coverage_report.md
```diff
- | `src/components/planner/AddStudyMaterial.tsx` | `grid-cols-2` | Change to `grid-cols-1 sm:grid-cols-2` |
+ <!-- [STALE] | `src/components/planner/AddStudyMaterial.tsx` | `grid-cols-2` | Change to `grid-cols-1 sm:grid-cols-2` | -->
- | `src/components/planner/StudyLibrary.tsx` | `w-[200px]` (Select) | Use `w-full sm:w-[200px]` |
+ <!-- [STALE] | `src/components/planner/StudyLibrary.tsx` | `w-[200px]` (Select) | Use `w-full sm:w-[200px]` | -->
```

### docs\05_ML_AI_&_Genkit\RESPONSIVE_COVERAGE_REPORT.md
```diff
- ### `src/app/test-accessibility/page.tsx`
+ ### `src\app\admin\dashboard\page.tsx` (Proposed)
- ### `src/app/test-charts/page.tsx`
+ ### `src\app\admin\dashboard\page.tsx` (Proposed)
- ### `src/components/app/audio-conversation.tsx`
+ <!-- [STALE] ### `src/components/app/audio-conversation.tsx` -->
- ### `src/components/app/header.tsx`
+ <!-- [STALE] ### `src/components/app/header.tsx` -->
- ### `src/components/app/sidebar-nav.tsx`
+ <!-- [STALE] ### `src/components/app/sidebar-nav.tsx` -->
- ### `src/components/app/teacher-sidebar-nav.tsx`
+ <!-- [STALE] ### `src/components/app/teacher-sidebar-nav.tsx` -->
- ### `src/components/planner/AddStudyMaterial.tsx`
+ <!-- [STALE] ### `src/components/planner/AddStudyMaterial.tsx` -->
- ### `src/components/planner/FocusTimer.tsx`
+ <!-- [STALE] ### `src/components/planner/FocusTimer.tsx` -->
- ### `src/components/planner/ScheduleView.tsx`
+ <!-- [STALE] ### `src/components/planner/ScheduleView.tsx` -->
- ### `src/components/planner/StudyLibrary.tsx`
+ <!-- [STALE] ### `src/components/planner/StudyLibrary.tsx` -->
- ### `src/components/profile/StudentProfile.tsx`
+ <!-- [STALE] ### `src/components/profile/StudentProfile.tsx` -->
- ### `src/components/profile/TeacherProfile.tsx`
+ <!-- [STALE] ### `src/components/profile/TeacherProfile.tsx` -->
- ### `src/components/rewards/RewardsSkeleton.tsx`
+ <!-- [STALE] ### `src/components/rewards/RewardsSkeleton.tsx` -->
- ### `src/components/settings/StudentProfileForm.tsx`
+ <!-- [STALE] ### `src/components/settings/StudentProfileForm.tsx` -->
- ### `src/components/settings/TeacherProfileForm.tsx`
+ <!-- [STALE] ### `src/components/settings/TeacherProfileForm.tsx` -->
- ### `src/components/ui/accordion.tsx`
+ <!-- [STALE] ### `src/components/ui/accordion.tsx` -->
- ### `src/components/ui/carousel.tsx`
+ <!-- [STALE] ### `src/components/ui/carousel.tsx` -->
- ### `src/components/ui/chart.tsx`
+ <!-- [STALE] ### `src/components/ui/chart.tsx` -->
- ### `src/components/ui/checkbox.tsx`
+ <!-- [STALE] ### `src/components/ui/checkbox.tsx` -->
- ### `src/components/ui/dialog.tsx`
+ <!-- [STALE] ### `src/components/ui/dialog.tsx` -->
- ### `src/components/ui/dropdown-menu.tsx`
+ <!-- [STALE] ### `src/components/ui/dropdown-menu.tsx` -->
- ### `src/components/ui/menubar.tsx`
+ <!-- [STALE] ### `src/components/ui/menubar.tsx` -->
- ### `src/components/ui/select.tsx`
+ <!-- [STALE] ### `src/components/ui/select.tsx` -->
- ### `src/components/ui/sheet.tsx`
+ <!-- [STALE] ### `src/components/ui/sheet.tsx` -->
- ### `src/components/ui/sidebar.tsx`
+ <!-- [STALE] ### `src/components/ui/sidebar.tsx` -->
- ### `src/components/ui/slider.tsx`
+ <!-- [STALE] ### `src/components/ui/slider.tsx` -->
- ### `src/components/ui/toast.tsx`
+ <!-- [STALE] ### `src/components/ui/toast.tsx` -->
```

### docs\07_Manuals_Guides_&_Setup\tutorial.md
```diff
- ### File: `src/ml/features/student_features.ts`
+ <!-- [STALE] ### File: `src/ml/features/student_features.ts` -->
- ### File: `src/ml/training/train_mastery_model.py`
+ <!-- [STALE] ### File: `src/ml/training/train_mastery_model.py` -->
- python generate_data.py  # Create training data
+ <!-- [STALE] python generate_data.py  # Create training data -->
- python train_mastery_model.py  # Train model
+ <!-- [STALE] python train_mastery_model.py  # Train model -->
- ### File: `src/ml/inference/ml-bridge.ts`
+ <!-- [STALE] ### File: `src/ml/inference/ml-bridge.ts` -->
- ### File: `src/ai/adk/decision-engine.ts`
+ <!-- [STALE] ### File: `src/ai/adk/decision-engine.ts` -->
- ### File: `src/app/api/intelligence/student/route.ts`
+ <!-- [STALE] ### File: `src/app/api/intelligence/student/route.ts` -->
- ### File: `src/app/api/intelligence/student/route.ts`
+ <!-- [STALE] ### File: `src/app/api/intelligence/student/route.ts` -->
- curl http://localhost:3000/api/intelligence/student?studentId=demo_student
+ <!-- [STALE] curl http://localhost:3000/api/intelligence/student?studentId=demo_student -->
- fetch("/api/intelligence/student")
+ <!-- [STALE] fetch("/api/intelligence/student") -->
- Frontend → /api/intelligence/student → ML + ADK → JSON
+ <!-- [STALE] Frontend → /api/intelligence/student → ML + ADK → JSON -->
- # src/ml/training/train_forgetting_model.py
+ <!-- [STALE] # src/ml/training/train_forgetting_model.py -->
- # src/ml/inference/predict_forgetting.py
+ <!-- [STALE] # src/ml/inference/predict_forgetting.py -->
- // src/app/api/teacher/analytics/route.ts
+ <!-- [STALE] // src/app/api/teacher/analytics/route.ts -->
- // src/app/api/teacher/analytics/route.ts
+ <!-- [STALE] // src/app/api/teacher/analytics/route.ts -->
- **Fix:** Run `python train_mastery_model.py`
+ <!-- [STALE] **Fix:** Run `python train_mastery_model.py` -->
- **Fix:** `pip install -r src/ml/training/requirements.txt`
+ **Fix:** `pip install -r src\ml\requirements.txt` (Proposed)
- POST /api/quiz/submit
+ <!-- [STALE] POST /api/quiz/submit -->
- GET /api/intelligence/student?studentId=xxx
+ <!-- [STALE] GET /api/intelligence/student?studentId=xxx -->
- 3. **Explore the code:** Start with `/api/intelligence/student/route.ts`
+ <!-- [STALE] 3. **Explore the code:** Start with `/api/intelligence/student/route.ts` -->
```

### docs\08_Unclassified_&_Misc\debug.md
```diff
- const userResponse = await fetch(`/api/users/${(await signIn(email, password))}`);
+ <!-- [STALE] const userResponse = await fetch(`/api/users/${(await signIn(email, password))}`); -->
- Because `signIn` returned `void`, the fetch URL resolved to `/api/users/undefined`, causing a 404 or 500 error immediately after login. This was the primary cause of "errors on every click" during authentication.
+ <!-- [STALE] Because `signIn` returned `void`, the fetch URL resolved to `/api/users/undefined`, causing a 404 or 500 error immediately after login. This was the primary cause of "errors on every click" during authentication. -->
- The main dashboard (`src/app/(main)/home/page.tsx`) was completely ignoring the sophisticated ML/ADK backend. It was relying on `generateStudentIntelligence` (a client-side mock function) instead of calling the `/api/intelligence/student` endpoint.
+ <!-- [STALE] The main dashboard (`src/app/(main)/home/page.tsx`) was completely ignoring the sophisticated ML/ADK backend. It was relying on `generateStudentIntelligence` (a client-side mock function) instead of calling the `/api/intelligence/student` endpoint. -->
- -   **Primary:** Fetch from `/api/intelligence/student` (Real ML/ADK).
+ <!-- [STALE] -   **Primary:** Fetch from `/api/intelligence/student` (Real ML/ADK). -->
```

### docs\08_Unclassified_&_Misc\Development Status.md
```diff
- | `/api/student` | GET | ✅ | Fetch student data |
+ <!-- [STALE] | `/api/student` | GET | ✅ | Fetch student data | -->
- | `/api/student/onboard` | POST | ✅ | Save onboarding |
+ <!-- [STALE] | `/api/student/onboard` | POST | ✅ | Save onboarding | -->
- | `/api/student/graph` | GET | ✅ | Get brain map data |
+ <!-- [STALE] | `/api/student/graph` | GET | ✅ | Get brain map data | -->
- | `/api/teacher` | GET | ✅ | Fetch teacher data |
+ <!-- [STALE] | `/api/teacher` | GET | ✅ | Fetch teacher data | -->
- | `/api/teacher/onboard` | POST | ✅ | Save onboarding |
+ <!-- [STALE] | `/api/teacher/onboard` | POST | ✅ | Save onboarding | -->
- | `/api/teacher/students` | GET | ✅ | Get student list |
+ <!-- [STALE] | `/api/teacher/students` | GET | ✅ | Get student list | -->
- | `/api/teacher/graph` | GET | ✅ | Get class network |
+ <!-- [STALE] | `/api/teacher/graph` | GET | ✅ | Get class network | -->
- | `/api/activity/log` | POST | ✅ | Log user activity |
+ <!-- [STALE] | `/api/activity/log` | POST | ✅ | Log user activity | -->
- | `/api/users/[userId]` | GET | ✅ | Get user by ID |
+ <!-- [STALE] | `/api/users/[userId]` | GET | ✅ | Get user by ID | -->
- | `/api/users/create` | POST | ✅ | Create new user |
+ <!-- [STALE] | `/api/users/create` | POST | ✅ | Create new user | -->
- | `/api/quiz/submit` | POST | 🚧 | Submit quiz (partial) |
+ <!-- [STALE] | `/api/quiz/submit` | POST | 🚧 | Submit quiz (partial) | -->
- | `/api/planner/data` | GET/POST | 🚧 | Planner CRUD |
+ <!-- [STALE] | `/api/planner/data` | GET/POST | 🚧 | Planner CRUD | -->
- | `/api/classes/create` | POST | 📝 | Create class |
+ <!-- [STALE] | `/api/classes/create` | POST | 📝 | Create class | -->
- | `/api/classes/join` | POST | 📝 | Join class |
+ <!-- [STALE] | `/api/classes/join` | POST | 📝 | Join class | -->
```

### docs\08_Unclassified_&_Misc\Features Overview.md
```diff
- - **API**: `src/app/api/student/onboard/route.ts`
+ <!-- [STALE] - **API**: `src/app/api/student/onboard/route.ts` -->
- - **API**: `src/app/api/student/onboard/route.ts`
+ <!-- [STALE] - **API**: `src/app/api/student/onboard/route.ts` -->
- - **API**: `src/app/api/student/graph/route.ts`
+ <!-- [STALE] - **API**: `src/app/api/student/graph/route.ts` -->
- - **API**: `src/app/api/student/graph/route.ts`
+ <!-- [STALE] - **API**: `src/app/api/student/graph/route.ts` -->
- - **Location**: `src/components/app/sidebar-nav.tsx`
+ <!-- [STALE] - **Location**: `src/components/app/sidebar-nav.tsx` -->
- - **API**: `src/app/api/quiz/submit/route.ts`
+ <!-- [STALE] - **API**: `src/app/api/quiz/submit/route.ts` -->
- - **API**: `src/app/api/quiz/submit/route.ts`
+ <!-- [STALE] - **API**: `src/app/api/quiz/submit/route.ts` -->
- - **API**: `src/app/api/teacher/onboard/route.ts`
+ <!-- [STALE] - **API**: `src/app/api/teacher/onboard/route.ts` -->
- - **API**: `src/app/api/teacher/onboard/route.ts`
+ <!-- [STALE] - **API**: `src/app/api/teacher/onboard/route.ts` -->
- - `src/app/api/teacher/students/route.ts`
+ <!-- [STALE] - `src/app/api/teacher/students/route.ts` -->
- - `src/app/api/teacher/students/route.ts`
+ <!-- [STALE] - `src/app/api/teacher/students/route.ts` -->
- - `src/app/api/teacher/graph/route.ts`
+ <!-- [STALE] - `src/app/api/teacher/graph/route.ts` -->
- - `src/app/api/teacher/graph/route.ts`
+ <!-- [STALE] - `src/app/api/teacher/graph/route.ts` -->
- - **Location**: `src/components/app/teacher-sidebar-nav.tsx`
+ <!-- [STALE] - **Location**: `src/components/app/teacher-sidebar-nav.tsx` -->
```

### docs\08_Unclassified_&_Misc\POLYGLOT_REPORT.md
```diff
- Source: `src/ml/training/generate_data.py`
+ <!-- [STALE] Source: `src/ml/training/generate_data.py` -->
- Source: `src/ml/inference/types.ts`
+ <!-- [STALE] Source: `src/ml/inference/types.ts` -->
- Source: `src/ai/flows/adaptive-quiz-engine.ts`
+ <!-- [STALE] Source: `src/ai/flows/adaptive-quiz-engine.ts` -->
- Source: `src/ai/flows/adaptive-quiz-engine.ts`
+ <!-- [STALE] Source: `src/ai/flows/adaptive-quiz-engine.ts` -->
- - **Source:** `src/ml/features/student_features.ts`
+ <!-- [STALE] - **Source:** `src/ml/features/student_features.ts` -->
```

### docs\CODEBASE_FLOW_DIAGRAM.md
```diff
- API_USER_CREATE["POST /api/users/create"]
+ <!-- [STALE] API_USER_CREATE["POST /api/users/create"] -->
- API_USER_GET["GET /api/users/[userId]"]
+ <!-- [STALE] API_USER_GET["GET /api/users/[userId]"] -->
- API_STUDENT_CREATE["POST /api/students/create"]
+ <!-- [STALE] API_STUDENT_CREATE["POST /api/students/create"] -->
- API_TEACHER_CREATE["POST /api/teachers/create"]
+ <!-- [STALE] API_TEACHER_CREATE["POST /api/teachers/create"] -->
- API_STUDENT["GET /api/student"]
+ <!-- [STALE] API_STUDENT["GET /api/student"] -->
- API_STUDENT_ONBOARD["POST /api/student/onboard"]
+ <!-- [STALE] API_STUDENT_ONBOARD["POST /api/student/onboard"] -->
- API_STUDENT_GRAPH["GET /api/student/graph"]
+ <!-- [STALE] API_STUDENT_GRAPH["GET /api/student/graph"] -->
- API_TEACHER["GET /api/teacher"]
+ <!-- [STALE] API_TEACHER["GET /api/teacher"] -->
- API_TEACHER_ONBOARD["POST /api/teacher/onboard"]
+ <!-- [STALE] API_TEACHER_ONBOARD["POST /api/teacher/onboard"] -->
- API_TEACHER_STUDENTS["GET /api/teacher/students"]
+ <!-- [STALE] API_TEACHER_STUDENTS["GET /api/teacher/students"] -->
- API_TEACHER_CLASSES["GET /api/teacher/classes"]
+ <!-- [STALE] API_TEACHER_CLASSES["GET /api/teacher/classes"] -->
- API_TEACHER_GRAPH["GET /api/teacher/graph"]
+ <!-- [STALE] API_TEACHER_GRAPH["GET /api/teacher/graph"] -->
- API_CLASS_CREATE["POST /api/classes/create"]
+ <!-- [STALE] API_CLASS_CREATE["POST /api/classes/create"] -->
- API_CLASS_JOIN["POST /api/classes/join"]
+ <!-- [STALE] API_CLASS_JOIN["POST /api/classes/join"] -->
- API_CLASS_LEAVE["POST /api/classes/leave"]
+ <!-- [STALE] API_CLASS_LEAVE["POST /api/classes/leave"] -->
- API_QUIZ_SUBMIT["POST /api/quiz/submit"]
+ <!-- [STALE] API_QUIZ_SUBMIT["POST /api/quiz/submit"] -->
- API_PLANNER["GET/POST /api/planner/*"]
+ <!-- [STALE] API_PLANNER["GET/POST /api/planner/*"] -->
- API_BRAINMAP["GET /api/brainmap/nodes"]
+ <!-- [STALE] API_BRAINMAP["GET /api/brainmap/nodes"] -->
- API_SYLLABUS["POST /api/syllabus/save"]
+ <!-- [STALE] API_SYLLABUS["POST /api/syllabus/save"] -->
- API_INTELLIGENCE["GET /api/intelligence/student"]
+ <!-- [STALE] API_INTELLIGENCE["GET /api/intelligence/student"] -->
- API_SESSION_START["POST /api/sankalp/session/start"]
+ <!-- [STALE] API_SESSION_START["POST /api/sankalp/session/start"] -->
- API_SESSION_END["POST /api/sankalp/session/end"]
+ <!-- [STALE] API_SESSION_END["POST /api/sankalp/session/end"] -->
- API_ACTIVITY["POST /api/activity/log"]
+ <!-- [STALE] API_ACTIVITY["POST /api/activity/log"] -->
```

### docs\finished_reports\accessibility-report.md
```diff
- ? **Reviewed on 2026-02-22**: Won't Fix. All listed violations are from 'src/app/test-accessibility/page.tsx', which intentionally contains accessibility violations (e.g., missing labels) to verify the automated accessibility scanning tools.
+ ? **Reviewed on 2026-02-22**: Won't Fix. All listed violations are from 'src\app\admin\dashboard\page.tsx', which intentionally contains accessibility violations (e.g., missing labels) to verify the automated accessibility scanning tools. (Proposed)
```

### docs\finished_reports\API_NAMING_AUDIT.md
```diff
- - **/api/activity/log**: Singular resource name `log`. Consider pluralizing to `logs` if it represents a collection.
+ <!-- [STALE] - **/api/activity/log**: Singular resource name `log`. Consider pluralizing to `logs` if it represents a collection. -->
- - **/api/classes/create**: Singular resource name `create`. Consider pluralizing to `creates` if it represents a collection.
+ <!-- [STALE] - **/api/classes/create**: Singular resource name `create`. Consider pluralizing to `creates` if it represents a collection. -->
- - **/api/classes/create**: URL contains verb `create`. Use HTTP methods (GET, POST) instead of verbs in the path.
+ <!-- [STALE] - **/api/classes/create**: URL contains verb `create`. Use HTTP methods (GET, POST) instead of verbs in the path. -->
- - **/api/classes/join**: Singular resource name `join`. Consider pluralizing to `joins` if it represents a collection.
+ <!-- [STALE] - **/api/classes/join**: Singular resource name `join`. Consider pluralizing to `joins` if it represents a collection. -->
- - **/api/classes/leave**: Singular resource name `leave`. Consider pluralizing to `leaves` if it represents a collection.
+ <!-- [STALE] - **/api/classes/leave**: Singular resource name `leave`. Consider pluralizing to `leaves` if it represents a collection. -->
- - **/api/intelligence/student**: Singular resource name `student`. Consider pluralizing to `students` if it represents a collection.
+ <!-- [STALE] - **/api/intelligence/student**: Singular resource name `student`. Consider pluralizing to `students` if it represents a collection. -->
- - **/api/planner/convert-to-node**: Singular resource name `convert-to-node`. Consider pluralizing to `convert-to-nodes` if it represents a collection.
+ <!-- [STALE] - **/api/planner/convert-to-node**: Singular resource name `convert-to-node`. Consider pluralizing to `convert-to-nodes` if it represents a collection. -->
- - **/api/planner/data**: Singular resource name `data`. Consider pluralizing to `datas` if it represents a collection.
+ <!-- [STALE] - **/api/planner/data**: Singular resource name `data`. Consider pluralizing to `datas` if it represents a collection. -->
- - **/api/planner/review**: Singular resource name `review`. Consider pluralizing to `reviews` if it represents a collection.
+ <!-- [STALE] - **/api/planner/review**: Singular resource name `review`. Consider pluralizing to `reviews` if it represents a collection. -->
- - **/api/quiz/submit**: Singular resource name `submit`. Consider pluralizing to `submits` if it represents a collection.
+ <!-- [STALE] - **/api/quiz/submit**: Singular resource name `submit`. Consider pluralizing to `submits` if it represents a collection. -->
- - **/api/sankalp/session/end**: Singular resource name `end`. Consider pluralizing to `ends` if it represents a collection.
+ <!-- [STALE] - **/api/sankalp/session/end**: Singular resource name `end`. Consider pluralizing to `ends` if it represents a collection. -->
- - **/api/sankalp/session/start**: Singular resource name `start`. Consider pluralizing to `starts` if it represents a collection.
+ <!-- [STALE] - **/api/sankalp/session/start**: Singular resource name `start`. Consider pluralizing to `starts` if it represents a collection. -->
- - **/api/student/graph**: Singular resource name `graph`. Consider pluralizing to `graphs` if it represents a collection.
+ <!-- [STALE] - **/api/student/graph**: Singular resource name `graph`. Consider pluralizing to `graphs` if it represents a collection. -->
- - **/api/student/onboard**: Singular resource name `onboard`. Consider pluralizing to `onboards` if it represents a collection.
+ <!-- [STALE] - **/api/student/onboard**: Singular resource name `onboard`. Consider pluralizing to `onboards` if it represents a collection. -->
- - **/api/student**: Singular resource name `student`. Consider pluralizing to `students` if it represents a collection.
+ <!-- [STALE] - **/api/student**: Singular resource name `student`. Consider pluralizing to `students` if it represents a collection. -->
- - **/api/students/create**: Singular resource name `create`. Consider pluralizing to `creates` if it represents a collection.
+ <!-- [STALE] - **/api/students/create**: Singular resource name `create`. Consider pluralizing to `creates` if it represents a collection. -->
- - **/api/students/create**: URL contains verb `create`. Use HTTP methods (GET, POST) instead of verbs in the path.
+ <!-- [STALE] - **/api/students/create**: URL contains verb `create`. Use HTTP methods (GET, POST) instead of verbs in the path. -->
- - **/api/syllabus/save**: Singular resource name `save`. Consider pluralizing to `saves` if it represents a collection.
+ <!-- [STALE] - **/api/syllabus/save**: Singular resource name `save`. Consider pluralizing to `saves` if it represents a collection. -->
- - **/api/teacher/graph**: Singular resource name `graph`. Consider pluralizing to `graphs` if it represents a collection.
+ <!-- [STALE] - **/api/teacher/graph**: Singular resource name `graph`. Consider pluralizing to `graphs` if it represents a collection. -->
- - **/api/teacher/onboard**: Singular resource name `onboard`. Consider pluralizing to `onboards` if it represents a collection.
+ <!-- [STALE] - **/api/teacher/onboard**: Singular resource name `onboard`. Consider pluralizing to `onboards` if it represents a collection. -->
- - **/api/teacher**: Singular resource name `teacher`. Consider pluralizing to `teachers` if it represents a collection.
+ <!-- [STALE] - **/api/teacher**: Singular resource name `teacher`. Consider pluralizing to `teachers` if it represents a collection. -->
- - **/api/teachers/create**: Singular resource name `create`. Consider pluralizing to `creates` if it represents a collection.
+ <!-- [STALE] - **/api/teachers/create**: Singular resource name `create`. Consider pluralizing to `creates` if it represents a collection. -->
- - **/api/teachers/create**: URL contains verb `create`. Use HTTP methods (GET, POST) instead of verbs in the path.
+ <!-- [STALE] - **/api/teachers/create**: URL contains verb `create`. Use HTTP methods (GET, POST) instead of verbs in the path. -->
- - **/api/test/seed**: Singular resource name `seed`. Consider pluralizing to `seeds` if it represents a collection.
+ <!-- [STALE] - **/api/test/seed**: Singular resource name `seed`. Consider pluralizing to `seeds` if it represents a collection. -->
- - **/api/users/create**: Singular resource name `create`. Consider pluralizing to `creates` if it represents a collection.
+ <!-- [STALE] - **/api/users/create**: Singular resource name `create`. Consider pluralizing to `creates` if it represents a collection. -->
- - **/api/users/create**: URL contains verb `create`. Use HTTP methods (GET, POST) instead of verbs in the path.
+ <!-- [STALE] - **/api/users/create**: URL contains verb `create`. Use HTTP methods (GET, POST) instead of verbs in the path. -->
- 1. **Use Plural Nouns:** `/api/students` instead of `/api/student`.
+ <!-- [STALE] 1. **Use Plural Nouns:** `/api/students` instead of `/api/student`. -->
- 1. **Use Plural Nouns:** `/api/students` instead of `/api/student`.
+ <!-- [STALE] 1. **Use Plural Nouns:** `/api/students` instead of `/api/student`. -->
- 2. **Avoid Verbs:** Use `GET /api/students` instead of `/api/getStudents`.
+ <!-- [STALE] 2. **Avoid Verbs:** Use `GET /api/students` instead of `/api/getStudents`. -->
- 2. **Avoid Verbs:** Use `GET /api/students` instead of `/api/getStudents`.
+ <!-- [STALE] 2. **Avoid Verbs:** Use `GET /api/students` instead of `/api/getStudents`. -->
- 3. **Consistent Casing:** Use kebab-case for URLs (e.g., `/api/user-profiles`).
+ <!-- [STALE] 3. **Consistent Casing:** Use kebab-case for URLs (e.g., `/api/user-profiles`). -->
```

### docs\finished_reports\CHATBOT_CONTEXT_HEALTH_REPORT.md
```diff
- The `Multilingual Cognitive Chatbot` (`src/ai/flows/multilingual-cognitive-chatbot.ts`) and `Custom Cognitive Chatbot` (`src/ai/flows/custom-cognitive-chatbot.ts`) appear to be **stateless** at the AI flow level.
+ <!-- [STALE] The `Multilingual Cognitive Chatbot` (`src/ai/flows/multilingual-cognitive-chatbot.ts`) and `Custom Cognitive Chatbot` (`src/ai/flows/custom-cognitive-chatbot.ts`) appear to be **stateless** at the AI flow level. -->
- The `Multilingual Cognitive Chatbot` (`src/ai/flows/multilingual-cognitive-chatbot.ts`) and `Custom Cognitive Chatbot` (`src/ai/flows/custom-cognitive-chatbot.ts`) appear to be **stateless** at the AI flow level.
+ <!-- [STALE] The `Multilingual Cognitive Chatbot` (`src/ai/flows/multilingual-cognitive-chatbot.ts`) and `Custom Cognitive Chatbot` (`src/ai/flows/custom-cognitive-chatbot.ts`) appear to be **stateless** at the AI flow level. -->
- The `Mindful Mentor` (`src/ai/flows/mindful-mentor.ts`) accepts a `studentHistory` string.
+ <!-- [STALE] The `Mindful Mentor` (`src/ai/flows/mindful-mentor.ts`) accepts a `studentHistory` string. -->
- Review of `src/ai/flows/mindful-mentor.ts` and other flows reveals **no explicit truncation logic**.
+ <!-- [STALE] Review of `src/ai/flows/mindful-mentor.ts` and other flows reveals **no explicit truncation logic**. -->
```

### docs\finished_reports\CHATBOT_CONTEXT_REPORT.md
```diff
- The chatbot flow `mindfulMentorFlow` in `src/ai/flows/mindful-mentor.ts` was audited for context window management. The audit simulated conversations with history sizes ranging from 1,000 to 100,000 characters.
+ <!-- [STALE] The chatbot flow `mindfulMentorFlow` in `src/ai/flows/mindful-mentor.ts` was audited for context window management. The audit simulated conversations with history sizes ranging from 1,000 to 100,000 characters. -->
```

### docs\finished_reports\COST_OPTIMIZATION_REPORT.md
```diff
- **Scope**: All LLM API calls (`src/ai/flows/`), ML inference compute (`src/ml/`), Firestore operations, Next.js serverless function usage.
+ <!-- [STALE] **Scope**: All LLM API calls (`src/ai/flows/`), ML inference compute (`src/ml/`), Firestore operations, Next.js serverless function usage. -->
- -   **Location**: `src/ai/flows/smart-revision-planner.ts`
+ <!-- [STALE] -   **Location**: `src/ai/flows/smart-revision-planner.ts` -->
- -   **Location**: `src/app/api/intelligence/student/route.ts`
+ <!-- [STALE] -   **Location**: `src/app/api/intelligence/student/route.ts` -->
- -   **Location**: `src/app/api/intelligence/student/route.ts`
+ <!-- [STALE] -   **Location**: `src/app/api/intelligence/student/route.ts` -->
- -   **Location**: `src/ai/flows/speech-to-speech.ts`
+ <!-- [STALE] -   **Location**: `src/ai/flows/speech-to-speech.ts` -->
- 1.  **Student Intelligence API** (`/api/intelligence/student`)
+ <!-- [STALE] 1.  **Student Intelligence API** (`/api/intelligence/student`) -->
- 2.  **Quiz Submission** (`/api/quiz/submit`)
+ <!-- [STALE] 2.  **Quiz Submission** (`/api/quiz/submit`) -->
```

### docs\finished_reports\COST_PROJECTION.md
```diff
- This report provides a cost projection model for the application's Genkit-based LLM features (`src/ai/flows/`).
+ <!-- [STALE] This report provides a cost projection model for the application's Genkit-based LLM features (`src/ai/flows/`). -->
- *   **Token Estimation:** Based on static analysis of prompt templates in `src/ai/flows/` and heuristic estimates of average user inputs/outputs.
+ <!-- [STALE] *   **Token Estimation:** Based on static analysis of prompt templates in `src/ai/flows/` and heuristic estimates of average user inputs/outputs. -->
- *   **File:** `src/ai/flows/adaptive-quiz-engine.ts`
+ <!-- [STALE] *   **File:** `src/ai/flows/adaptive-quiz-engine.ts` -->
- *   **File:** `src/ai/flows/syllabus-generator.ts`
+ <!-- [STALE] *   **File:** `src/ai/flows/syllabus-generator.ts` -->
- *   **File:** `src/ai/flows/smart-revision-planner.ts`
+ <!-- [STALE] *   **File:** `src/ai/flows/smart-revision-planner.ts` -->
- *   **File:** `src/ai/flows/mindful-mentor.ts`
+ <!-- [STALE] *   **File:** `src/ai/flows/mindful-mentor.ts` -->
```

### docs\finished_reports\DEAD_CODE_INVENTORY.md
```diff
- | `src/components/ui/accordion.tsx` |
+ <!-- [STALE] | `src/components/ui/accordion.tsx` | -->
- | `src/components/ui/alert-dialog.tsx` |
+ <!-- [STALE] | `src/components/ui/alert-dialog.tsx` | -->
- | `src/components/ui/alert.tsx` |
+ <!-- [STALE] | `src/components/ui/alert.tsx` | -->
- | `src/components/ui/calendar.tsx` |
+ <!-- [STALE] | `src/components/ui/calendar.tsx` | -->
- | `src/components/ui/carousel.tsx` |
+ <!-- [STALE] | `src/components/ui/carousel.tsx` | -->
- | `src/components/ui/collapsible.tsx` |
+ <!-- [STALE] | `src/components/ui/collapsible.tsx` | -->
- | `src/components/ui/dropdown-menu.tsx` |
+ <!-- [STALE] | `src/components/ui/dropdown-menu.tsx` | -->
- | `src/components/ui/menubar.tsx` |
+ <!-- [STALE] | `src/components/ui/menubar.tsx` | -->
- | `src/components/ui/popover.tsx` |
+ <!-- [STALE] | `src/components/ui/popover.tsx` | -->
- | `src/components/ui/slider.tsx` |
+ <!-- [STALE] | `src/components/ui/slider.tsx` | -->
- | `src/components/ui/table.tsx` |
+ <!-- [STALE] | `src/components/ui/table.tsx` | -->
- | `src/components/ui/toast.tsx` |
+ <!-- [STALE] | `src/components/ui/toast.tsx` | -->
- | `src/lib/middleware/auth.ts` |
+ | `src\lib\auth.ts` | (Proposed)
- | `src/lib/rewards/calculateRewards.ts` |
+ <!-- [STALE] | `src/lib/rewards/calculateRewards.ts` | -->
- | `src/lib/validations/auth.ts` |
+ | `src\lib\auth.ts` | (Proposed)
```

### docs\finished_reports\DEAD_CODE_REPORT.md
```diff
- | `src/components/ui/accordion.tsx` | named | `Accordion` |
+ <!-- [STALE] | `src/components/ui/accordion.tsx` | named | `Accordion` | -->
- | `src/components/ui/accordion.tsx` | named | `AccordionItem` |
+ <!-- [STALE] | `src/components/ui/accordion.tsx` | named | `AccordionItem` | -->
- | `src/components/ui/accordion.tsx` | named | `AccordionTrigger` |
+ <!-- [STALE] | `src/components/ui/accordion.tsx` | named | `AccordionTrigger` | -->
- | `src/components/ui/accordion.tsx` | named | `AccordionContent` |
+ <!-- [STALE] | `src/components/ui/accordion.tsx` | named | `AccordionContent` | -->
- | `src/components/ui/alert-dialog.tsx` | named | `AlertDialogPortal` |
+ <!-- [STALE] | `src/components/ui/alert-dialog.tsx` | named | `AlertDialogPortal` | -->
- | `src/components/ui/alert-dialog.tsx` | named | `AlertDialogOverlay` |
+ <!-- [STALE] | `src/components/ui/alert-dialog.tsx` | named | `AlertDialogOverlay` | -->
- | `src/components/ui/alert.tsx` | named | `AlertTitle` |
+ <!-- [STALE] | `src/components/ui/alert.tsx` | named | `AlertTitle` | -->
- | `src/components/ui/alert.tsx` | named | `AlertDescription` |
+ <!-- [STALE] | `src/components/ui/alert.tsx` | named | `AlertDescription` | -->
- | `src/components/ui/badge.tsx` | named | `BadgeProps` |
+ <!-- [STALE] | `src/components/ui/badge.tsx` | named | `BadgeProps` | -->
- | `src/components/ui/badge.tsx` | named | `badgeVariants` |
+ <!-- [STALE] | `src/components/ui/badge.tsx` | named | `badgeVariants` | -->
- | `src/components/ui/calendar.tsx` | named | `CalendarProps` |
+ <!-- [STALE] | `src/components/ui/calendar.tsx` | named | `CalendarProps` | -->
- | `src/components/ui/carousel.tsx` | named | `CarouselApi` |
+ <!-- [STALE] | `src/components/ui/carousel.tsx` | named | `CarouselApi` | -->
- | `src/components/ui/carousel.tsx` | named | `Carousel` |
+ <!-- [STALE] | `src/components/ui/carousel.tsx` | named | `Carousel` | -->
- | `src/components/ui/carousel.tsx` | named | `CarouselContent` |
+ <!-- [STALE] | `src/components/ui/carousel.tsx` | named | `CarouselContent` | -->
- | `src/components/ui/carousel.tsx` | named | `CarouselItem` |
+ <!-- [STALE] | `src/components/ui/carousel.tsx` | named | `CarouselItem` | -->
- | `src/components/ui/carousel.tsx` | named | `CarouselPrevious` |
+ <!-- [STALE] | `src/components/ui/carousel.tsx` | named | `CarouselPrevious` | -->
- | `src/components/ui/carousel.tsx` | named | `CarouselNext` |
+ <!-- [STALE] | `src/components/ui/carousel.tsx` | named | `CarouselNext` | -->
- | `src/components/ui/chart.tsx` | named | `ChartConfig` |
+ <!-- [STALE] | `src/components/ui/chart.tsx` | named | `ChartConfig` | -->
- | `src/components/ui/chart.tsx` | named | `ChartLegend` |
+ <!-- [STALE] | `src/components/ui/chart.tsx` | named | `ChartLegend` | -->
- | `src/components/ui/chart.tsx` | named | `ChartLegendContent` |
+ <!-- [STALE] | `src/components/ui/chart.tsx` | named | `ChartLegendContent` | -->
- | `src/components/ui/chart.tsx` | named | `ChartStyle` |
+ <!-- [STALE] | `src/components/ui/chart.tsx` | named | `ChartStyle` | -->
- | `src/components/ui/collapsible.tsx` | named | `Collapsible` |
+ <!-- [STALE] | `src/components/ui/collapsible.tsx` | named | `Collapsible` | -->
- | `src/components/ui/collapsible.tsx` | named | `CollapsibleTrigger` |
+ <!-- [STALE] | `src/components/ui/collapsible.tsx` | named | `CollapsibleTrigger` | -->
- | `src/components/ui/collapsible.tsx` | named | `CollapsibleContent` |
+ <!-- [STALE] | `src/components/ui/collapsible.tsx` | named | `CollapsibleContent` | -->
- | `src/components/ui/dialog.tsx` | named | `DialogPortal` |
+ <!-- [STALE] | `src/components/ui/dialog.tsx` | named | `DialogPortal` | -->
- | `src/components/ui/dialog.tsx` | named | `DialogOverlay` |
+ <!-- [STALE] | `src/components/ui/dialog.tsx` | named | `DialogOverlay` | -->
- | `src/components/ui/dialog.tsx` | named | `DialogClose` |
+ <!-- [STALE] | `src/components/ui/dialog.tsx` | named | `DialogClose` | -->
- | `src/components/ui/dropdown-menu.tsx` | named | `DropdownMenuCheckboxItem` |
+ <!-- [STALE] | `src/components/ui/dropdown-menu.tsx` | named | `DropdownMenuCheckboxItem` | -->
- | `src/components/ui/dropdown-menu.tsx` | named | `DropdownMenuRadioItem` |
+ <!-- [STALE] | `src/components/ui/dropdown-menu.tsx` | named | `DropdownMenuRadioItem` | -->
- | `src/components/ui/dropdown-menu.tsx` | named | `DropdownMenuShortcut` |
+ <!-- [STALE] | `src/components/ui/dropdown-menu.tsx` | named | `DropdownMenuShortcut` | -->
- | `src/components/ui/dropdown-menu.tsx` | named | `DropdownMenuGroup` |
+ <!-- [STALE] | `src/components/ui/dropdown-menu.tsx` | named | `DropdownMenuGroup` | -->
- | `src/components/ui/dropdown-menu.tsx` | named | `DropdownMenuPortal` |
+ <!-- [STALE] | `src/components/ui/dropdown-menu.tsx` | named | `DropdownMenuPortal` | -->
- | `src/components/ui/dropdown-menu.tsx` | named | `DropdownMenuRadioGroup` |
+ <!-- [STALE] | `src/components/ui/dropdown-menu.tsx` | named | `DropdownMenuRadioGroup` | -->
- | `src/components/ui/form.tsx` | named | `useFormField` |
+ <!-- [STALE] | `src/components/ui/form.tsx` | named | `useFormField` | -->
- | `src/components/ui/form.tsx` | named | `FormDescription` |
+ <!-- [STALE] | `src/components/ui/form.tsx` | named | `FormDescription` | -->
- | `src/components/ui/menubar.tsx` | named | `Menubar` |
+ <!-- [STALE] | `src/components/ui/menubar.tsx` | named | `Menubar` | -->
- | `src/components/ui/menubar.tsx` | named | `MenubarMenu` |
+ <!-- [STALE] | `src/components/ui/menubar.tsx` | named | `MenubarMenu` | -->
- | `src/components/ui/menubar.tsx` | named | `MenubarTrigger` |
+ <!-- [STALE] | `src/components/ui/menubar.tsx` | named | `MenubarTrigger` | -->
- | `src/components/ui/menubar.tsx` | named | `MenubarContent` |
+ <!-- [STALE] | `src/components/ui/menubar.tsx` | named | `MenubarContent` | -->
- | `src/components/ui/menubar.tsx` | named | `MenubarItem` |
+ <!-- [STALE] | `src/components/ui/menubar.tsx` | named | `MenubarItem` | -->
- | `src/components/ui/menubar.tsx` | named | `MenubarSeparator` |
+ <!-- [STALE] | `src/components/ui/menubar.tsx` | named | `MenubarSeparator` | -->
- | `src/components/ui/menubar.tsx` | named | `MenubarLabel` |
+ <!-- [STALE] | `src/components/ui/menubar.tsx` | named | `MenubarLabel` | -->
- | `src/components/ui/menubar.tsx` | named | `MenubarCheckboxItem` |
+ <!-- [STALE] | `src/components/ui/menubar.tsx` | named | `MenubarCheckboxItem` | -->
- | `src/components/ui/menubar.tsx` | named | `MenubarRadioGroup` |
+ <!-- [STALE] | `src/components/ui/menubar.tsx` | named | `MenubarRadioGroup` | -->
- | `src/components/ui/menubar.tsx` | named | `MenubarRadioItem` |
+ <!-- [STALE] | `src/components/ui/menubar.tsx` | named | `MenubarRadioItem` | -->
- | `src/components/ui/menubar.tsx` | named | `MenubarPortal` |
+ <!-- [STALE] | `src/components/ui/menubar.tsx` | named | `MenubarPortal` | -->
- | `src/components/ui/menubar.tsx` | named | `MenubarSubContent` |
+ <!-- [STALE] | `src/components/ui/menubar.tsx` | named | `MenubarSubContent` | -->
- | `src/components/ui/menubar.tsx` | named | `MenubarSubTrigger` |
+ <!-- [STALE] | `src/components/ui/menubar.tsx` | named | `MenubarSubTrigger` | -->
- | `src/components/ui/menubar.tsx` | named | `menubarGroup` |
+ <!-- [STALE] | `src/components/ui/menubar.tsx` | named | `menubarGroup` | -->
- | `src/components/ui/menubar.tsx` | named | `MenubarSub` |
+ <!-- [STALE] | `src/components/ui/menubar.tsx` | named | `MenubarSub` | -->
- | `src/components/ui/menubar.tsx` | named | `MenubarShortcut` |
+ <!-- [STALE] | `src/components/ui/menubar.tsx` | named | `MenubarShortcut` | -->
- | `src/components/ui/popover.tsx` | named | `Popover` |
+ <!-- [STALE] | `src/components/ui/popover.tsx` | named | `Popover` | -->
- | `src/components/ui/popover.tsx` | named | `PopoverTrigger` |
+ <!-- [STALE] | `src/components/ui/popover.tsx` | named | `PopoverTrigger` | -->
- | `src/components/ui/popover.tsx` | named | `PopoverContent` |
+ <!-- [STALE] | `src/components/ui/popover.tsx` | named | `PopoverContent` | -->
- | `src/components/ui/scroll-area.tsx` | named | `ScrollBar` |
+ <!-- [STALE] | `src/components/ui/scroll-area.tsx` | named | `ScrollBar` | -->
- | `src/components/ui/select.tsx` | named | `SelectGroup` |
+ <!-- [STALE] | `src/components/ui/select.tsx` | named | `SelectGroup` | -->
- | `src/components/ui/select.tsx` | named | `SelectLabel` |
+ <!-- [STALE] | `src/components/ui/select.tsx` | named | `SelectLabel` | -->
- | `src/components/ui/select.tsx` | named | `SelectSeparator` |
+ <!-- [STALE] | `src/components/ui/select.tsx` | named | `SelectSeparator` | -->
- | `src/components/ui/select.tsx` | named | `SelectScrollUpButton` |
+ <!-- [STALE] | `src/components/ui/select.tsx` | named | `SelectScrollUpButton` | -->
- | `src/components/ui/select.tsx` | named | `SelectScrollDownButton` |
+ <!-- [STALE] | `src/components/ui/select.tsx` | named | `SelectScrollDownButton` | -->
- | `src/components/ui/sheet.tsx` | named | `SheetPortal` |
+ <!-- [STALE] | `src/components/ui/sheet.tsx` | named | `SheetPortal` | -->
- | `src/components/ui/sheet.tsx` | named | `SheetOverlay` |
+ <!-- [STALE] | `src/components/ui/sheet.tsx` | named | `SheetOverlay` | -->
- | `src/components/ui/sheet.tsx` | named | `SheetTrigger` |
+ <!-- [STALE] | `src/components/ui/sheet.tsx` | named | `SheetTrigger` | -->
- | `src/components/ui/sheet.tsx` | named | `SheetClose` |
+ <!-- [STALE] | `src/components/ui/sheet.tsx` | named | `SheetClose` | -->
- | `src/components/ui/sheet.tsx` | named | `SheetHeader` |
+ <!-- [STALE] | `src/components/ui/sheet.tsx` | named | `SheetHeader` | -->
- | `src/components/ui/sheet.tsx` | named | `SheetFooter` |
+ <!-- [STALE] | `src/components/ui/sheet.tsx` | named | `SheetFooter` | -->
- | `src/components/ui/sheet.tsx` | named | `SheetTitle` |
+ <!-- [STALE] | `src/components/ui/sheet.tsx` | named | `SheetTitle` | -->
- | `src/components/ui/sheet.tsx` | named | `SheetDescription` |
+ <!-- [STALE] | `src/components/ui/sheet.tsx` | named | `SheetDescription` | -->
- | `src/components/ui/sidebar.tsx` | named | `SidebarContent` |
+ <!-- [STALE] | `src/components/ui/sidebar.tsx` | named | `SidebarContent` | -->
- | `src/components/ui/sidebar.tsx` | named | `SidebarGroup` |
+ <!-- [STALE] | `src/components/ui/sidebar.tsx` | named | `SidebarGroup` | -->
- | `src/components/ui/sidebar.tsx` | named | `SidebarGroupAction` |
+ <!-- [STALE] | `src/components/ui/sidebar.tsx` | named | `SidebarGroupAction` | -->
- | `src/components/ui/sidebar.tsx` | named | `SidebarGroupContent` |
+ <!-- [STALE] | `src/components/ui/sidebar.tsx` | named | `SidebarGroupContent` | -->
- | `src/components/ui/sidebar.tsx` | named | `SidebarGroupLabel` |
+ <!-- [STALE] | `src/components/ui/sidebar.tsx` | named | `SidebarGroupLabel` | -->
- | `src/components/ui/sidebar.tsx` | named | `SidebarInput` |
+ <!-- [STALE] | `src/components/ui/sidebar.tsx` | named | `SidebarInput` | -->
- | `src/components/ui/sidebar.tsx` | named | `SidebarMenuAction` |
+ <!-- [STALE] | `src/components/ui/sidebar.tsx` | named | `SidebarMenuAction` | -->
- | `src/components/ui/sidebar.tsx` | named | `SidebarMenuBadge` |
+ <!-- [STALE] | `src/components/ui/sidebar.tsx` | named | `SidebarMenuBadge` | -->
- | `src/components/ui/sidebar.tsx` | named | `SidebarMenuSkeleton` |
+ <!-- [STALE] | `src/components/ui/sidebar.tsx` | named | `SidebarMenuSkeleton` | -->
- | `src/components/ui/sidebar.tsx` | named | `SidebarMenuSub` |
+ <!-- [STALE] | `src/components/ui/sidebar.tsx` | named | `SidebarMenuSub` | -->
- | `src/components/ui/sidebar.tsx` | named | `SidebarMenuSubButton` |
+ <!-- [STALE] | `src/components/ui/sidebar.tsx` | named | `SidebarMenuSubButton` | -->
- | `src/components/ui/sidebar.tsx` | named | `SidebarMenuSubItem` |
+ <!-- [STALE] | `src/components/ui/sidebar.tsx` | named | `SidebarMenuSubItem` | -->
- | `src/components/ui/sidebar.tsx` | named | `SidebarRail` |
+ <!-- [STALE] | `src/components/ui/sidebar.tsx` | named | `SidebarRail` | -->
- | `src/components/ui/sidebar.tsx` | named | `SidebarSeparator` |
+ <!-- [STALE] | `src/components/ui/sidebar.tsx` | named | `SidebarSeparator` | -->
- | `src/components/ui/sidebar.tsx` | named | `useSidebar` |
+ <!-- [STALE] | `src/components/ui/sidebar.tsx` | named | `useSidebar` | -->
- | `src/components/ui/slider.tsx` | named | `Slider` |
+ <!-- [STALE] | `src/components/ui/slider.tsx` | named | `Slider` | -->
- | `src/components/ui/table.tsx` | named | `TableFooter` |
+ <!-- [STALE] | `src/components/ui/table.tsx` | named | `TableFooter` | -->
- | `src/components/ui/table.tsx` | named | `TableCaption` |
+ <!-- [STALE] | `src/components/ui/table.tsx` | named | `TableCaption` | -->
- | `src/components/ui/toast.tsx` | named | `ToastAction` |
+ <!-- [STALE] | `src/components/ui/toast.tsx` | named | `ToastAction` | -->
- | `src/lib/middleware/auth.ts` | named | `AuthenticatedRequest` |
+ | `src\lib\auth.ts` | named | `AuthenticatedRequest` | (Proposed)
- | `src/lib/middleware/auth.ts` | named | `verifyAuth` |
+ | `src\lib\auth.ts` | named | `verifyAuth` | (Proposed)
- | `src/lib/middleware/auth.ts` | named | `withAuth` |
+ | `src\lib\auth.ts` | named | `withAuth` | (Proposed)
- | `src/lib/middleware/auth.ts` | named | `errorResponse` |
+ | `src\lib\auth.ts` | named | `errorResponse` | (Proposed)
- | `src/lib/middleware/auth.ts` | named | `successResponse` |
+ | `src\lib\auth.ts` | named | `successResponse` | (Proposed)
- | `src/lib/rewards/calculateRewards.ts` | named | `SubjectProgress` |
+ <!-- [STALE] | `src/lib/rewards/calculateRewards.ts` | named | `SubjectProgress` | -->
- | `src/lib/rewards/calculateRewards.ts` | named | `ProjectionData` |
+ <!-- [STALE] | `src/lib/rewards/calculateRewards.ts` | named | `ProjectionData` | -->
```

### docs\finished_reports\DEEP_DIVE_ERROR_REPORT.md
```diff
- | `src/app/api/classes/join/route.ts` | 21 | `auth` is possibly `undefined` before calling `.verifyIdToken()` | 🔴 Auth crash |
+ <!-- [STALE] | `src/app/api/classes/join/route.ts` | 21 | `auth` is possibly `undefined` before calling `.verifyIdToken()` | 🔴 Auth crash | -->
- | `src/app/api/classes/join/route.ts` | 21 | `auth` is possibly `undefined` before calling `.verifyIdToken()` | 🔴 Auth crash |
+ <!-- [STALE] | `src/app/api/classes/join/route.ts` | 21 | `auth` is possibly `undefined` before calling `.verifyIdToken()` | 🔴 Auth crash | -->
- | `src/app/api/classes/leave/route.ts` | 21 | `auth` is possibly `undefined` before calling `.verifyIdToken()` | 🔴 Auth crash |
+ <!-- [STALE] | `src/app/api/classes/leave/route.ts` | 21 | `auth` is possibly `undefined` before calling `.verifyIdToken()` | 🔴 Auth crash | -->
- | `src/app/api/classes/leave/route.ts` | 21 | `auth` is possibly `undefined` before calling `.verifyIdToken()` | 🔴 Auth crash |
+ <!-- [STALE] | `src/app/api/classes/leave/route.ts` | 21 | `auth` is possibly `undefined` before calling `.verifyIdToken()` | 🔴 Auth crash | -->
- | `src/app/api/student/route.ts` | 68 | `auth` is possibly `undefined` before calling `.verifyIdToken()` | 🔴 Auth crash |
+ <!-- [STALE] | `src/app/api/student/route.ts` | 68 | `auth` is possibly `undefined` before calling `.verifyIdToken()` | 🔴 Auth crash | -->
- | `src/app/api/student/route.ts` | 68 | `auth` is possibly `undefined` before calling `.verifyIdToken()` | 🔴 Auth crash |
+ <!-- [STALE] | `src/app/api/student/route.ts` | 68 | `auth` is possibly `undefined` before calling `.verifyIdToken()` | 🔴 Auth crash | -->
- | `src/lib/middleware/auth.ts` | 42 | `auth` is possibly `undefined` | 🔴 Auth crash |
+ | `src\lib\auth.ts` | 42 | `auth` is possibly `undefined` | 🔴 Auth crash | (Proposed)
- | `src/app/api/intelligence/student/route.ts` | 166–236 | `MasteryPredictionOutput \| undefined` assigned where `null` expected (6 instances) | 🟡 Silent failure |
+ <!-- [STALE] | `src/app/api/intelligence/student/route.ts` | 166–236 | `MasteryPredictionOutput \| undefined` assigned where `null` expected (6 instances) | 🟡 Silent failure | -->
- | `src/app/api/intelligence/student/route.ts` | 166–236 | `MasteryPredictionOutput \| undefined` assigned where `null` expected (6 instances) | 🟡 Silent failure |
+ <!-- [STALE] | `src/app/api/intelligence/student/route.ts` | 166–236 | `MasteryPredictionOutput \| undefined` assigned where `null` expected (6 instances) | 🟡 Silent failure | -->
- | `src/components/ui/menubar.tsx` | 253 | `menubarGroup` not found — likely should be `MenubarGroup` (casing) |
+ <!-- [STALE] | `src/components/ui/menubar.tsx` | 253 | `menubarGroup` not found — likely should be `MenubarGroup` (casing) | -->
- | `src/app/api/users/create/route.ts` | 23 | `createUser(uid, email, name, role)` — passes **4 args**, function expects **1 object** `{ uid, email, name, role }` |
+ <!-- [STALE] | `src/app/api/users/create/route.ts` | 23 | `createUser(uid, email, name, role)` — passes **4 args**, function expects **1 object** `{ uid, email, name, role }` | -->
- | `src/app/api/users/create/route.ts` | 23 | `createUser(uid, email, name, role)` — passes **4 args**, function expects **1 object** `{ uid, email, name, role }` |
+ <!-- [STALE] | `src/app/api/users/create/route.ts` | 23 | `createUser(uid, email, name, role)` — passes **4 args**, function expects **1 object** `{ uid, email, name, role }` | -->
- | `src/app/test-charts/page.tsx` | 57 | `type: string` not assignable to `NodeType` union in `GraphData` |
+ | `src\app\admin\dashboard\page.tsx` | 57 | `type: string` not assignable to `NodeType` union in `GraphData` | (Proposed)
- **File:** `src/app/api/users/create/route.ts:23`
+ <!-- [STALE] **File:** `src/app/api/users/create/route.ts:23` -->
- **File:** `src/app/api/users/create/route.ts:23`
+ <!-- [STALE] **File:** `src/app/api/users/create/route.ts:23` -->
- **File:** `src/components/ui/menubar.tsx:253`
+ <!-- [STALE] **File:** `src/components/ui/menubar.tsx:253` -->
- **File:** `src/lib/middleware/auth.ts`
+ **File:** `src\lib\auth.ts` (Proposed)
- No rate limiting on any API routes, including authentication endpoints (`/api/classes/join`, `/api/users/create`, `/api/student/onboard`).
+ <!-- [STALE] No rate limiting on any API routes, including authentication endpoints (`/api/classes/join`, `/api/users/create`, `/api/student/onboard`). -->
- No rate limiting on any API routes, including authentication endpoints (`/api/classes/join`, `/api/users/create`, `/api/student/onboard`).
+ <!-- [STALE] No rate limiting on any API routes, including authentication endpoints (`/api/classes/join`, `/api/users/create`, `/api/student/onboard`). -->
- No rate limiting on any API routes, including authentication endpoints (`/api/classes/join`, `/api/users/create`, `/api/student/onboard`).
+ <!-- [STALE] No rate limiting on any API routes, including authentication endpoints (`/api/classes/join`, `/api/users/create`, `/api/student/onboard`). -->
- | `/api/student` (GET, POST for single student) | `/api/students/create` (POST to create) |
+ <!-- [STALE] | `/api/student` (GET, POST for single student) | `/api/students/create` (POST to create) | -->
- | `/api/student` (GET, POST for single student) | `/api/students/create` (POST to create) |
+ <!-- [STALE] | `/api/student` (GET, POST for single student) | `/api/students/create` (POST to create) | -->
- | `/api/teacher` (GET for single teacher) | `/api/teachers/create` (POST to create) |
+ <!-- [STALE] | `/api/teacher` (GET for single teacher) | `/api/teachers/create` (POST to create) | -->
- | `/api/teacher` (GET for single teacher) | `/api/teachers/create` (POST to create) |
+ <!-- [STALE] | `/api/teacher` (GET for single teacher) | `/api/teachers/create` (POST to create) | -->
- | `src/app/api/student/route.ts` | 8 | `[Student API] GET request`, `[Student API] Student fetched` |
+ <!-- [STALE] | `src/app/api/student/route.ts` | 8 | `[Student API] GET request`, `[Student API] Student fetched` | -->
- | `src/app/api/student/route.ts` | 8 | `[Student API] GET request`, `[Student API] Student fetched` |
+ <!-- [STALE] | `src/app/api/student/route.ts` | 8 | `[Student API] GET request`, `[Student API] Student fetched` | -->
- | `src/app/api/activity/log/route.ts` | 5 | `📦 [Activity Log] Batch request` |
+ <!-- [STALE] | `src/app/api/activity/log/route.ts` | 5 | `📦 [Activity Log] Batch request` | -->
- | `src/app/api/activity/log/route.ts` | 5 | `📦 [Activity Log] Batch request` |
+ <!-- [STALE] | `src/app/api/activity/log/route.ts` | 5 | `📦 [Activity Log] Batch request` | -->
- | `src/app/api/chaos/route.ts` | 3 | `[Chaos API] Seeding mock database` |
+ <!-- [STALE] | `src/app/api/chaos/route.ts` | 3 | `[Chaos API] Seeding mock database` | -->
- | `src/app/api/chaos/route.ts` | 3 | `[Chaos API] Seeding mock database` |
+ <!-- [STALE] | `src/app/api/chaos/route.ts` | 3 | `[Chaos API] Seeding mock database` | -->
- All 30 API routes under `src/app/api/` have **no unit or integration tests**:
+ <!-- [STALE] All 30 API routes under `src/app/api/` have **no unit or integration tests**: -->
- 1. **Fix `createUser()` call** in `src/app/api/users/create/route.ts:23` — wrap args in an object
+ <!-- [STALE] 1. **Fix `createUser()` call** in `src/app/api/users/create/route.ts:23` — wrap args in an object -->
- 1. **Fix `createUser()` call** in `src/app/api/users/create/route.ts:23` — wrap args in an object
+ <!-- [STALE] 1. **Fix `createUser()` call** in `src/app/api/users/create/route.ts:23` — wrap args in an object -->
```

### docs\finished_reports\DOC_DRIFT_REPORT.md
```diff
- | Student Onboarding | docs/Features Overview.md | `src/app/(auth)/onboarding/page.tsx` | ✅ Complete | ✅ Yes | ✅ Verified |
+ <!-- [STALE] | Student Onboarding | docs/Features Overview.md | `src/app/(auth)/onboarding/page.tsx` | ✅ Complete | ✅ Yes | ✅ Verified | -->
- | Brain Map Visualization | docs/Features Overview.md | `src/app/(main)/brain-map/page.tsx` | ✅ Complete | ✅ Yes | ✅ Verified |
+ <!-- [STALE] | Brain Map Visualization | docs/Features Overview.md | `src/app/(main)/brain-map/page.tsx` | ✅ Complete | ✅ Yes | ✅ Verified | -->
- | Home Dashboard | docs/Features Overview.md | `src/app/(main)/home/page.tsx` | ✅ Complete | ✅ Yes | ✅ Verified |
+ <!-- [STALE] | Home Dashboard | docs/Features Overview.md | `src/app/(main)/home/page.tsx` | ✅ Complete | ✅ Yes | ✅ Verified | -->
- | Student Sidebar Navigation | docs/Features Overview.md | `src/components/app/sidebar-nav.tsx` | ✅ Complete | ✅ Yes | ✅ Verified |
+ <!-- [STALE] | Student Sidebar Navigation | docs/Features Overview.md | `src/components/app/sidebar-nav.tsx` | ✅ Complete | ✅ Yes | ✅ Verified | -->
- | Student Sidebar Navigation | docs/Features Overview.md | `src/components/app/sidebar-nav.tsx` | ✅ Complete | ✅ Yes | ✅ Verified |
+ <!-- [STALE] | Student Sidebar Navigation | docs/Features Overview.md | `src/components/app/sidebar-nav.tsx` | ✅ Complete | ✅ Yes | ✅ Verified | -->
- | Study Planner | docs/Features Overview.md | `src/app/(main)/planner/page.tsx` | 🚧 50% Complete | ✅ Yes | ✅ Verified |
+ <!-- [STALE] | Study Planner | docs/Features Overview.md | `src/app/(main)/planner/page.tsx` | 🚧 50% Complete | ✅ Yes | ✅ Verified | -->
- | Quiz System | docs/Features Overview.md | `src/app/(main)/quiz/page.tsx` | 🚧 40% Complete | ✅ Yes | ✅ Verified |
+ <!-- [STALE] | Quiz System | docs/Features Overview.md | `src/app/(main)/quiz/page.tsx` | 🚧 40% Complete | ✅ Yes | ✅ Verified | -->
- | AI Chatbot (Mentor) | docs/Features Overview.md | `src/app/(main)/chat/page.tsx` | 🚧 30% Complete | ✅ Yes | ✅ Verified |
+ <!-- [STALE] | AI Chatbot (Mentor) | docs/Features Overview.md | `src/app/(main)/chat/page.tsx` | 🚧 30% Complete | ✅ Yes | ✅ Verified | -->
- | Rewards & Gamification | docs/Features Overview.md | `src/app/(main)/rewards/page.tsx` | 📝 Not Started | ✅ Yes | ✅ Verified |
+ <!-- [STALE] | Rewards & Gamification | docs/Features Overview.md | `src/app/(main)/rewards/page.tsx` | 📝 Not Started | ✅ Yes | ✅ Verified | -->
- | Syllabus Tracker | docs/Features Overview.md | `src/app/(main)/syllabus/page.tsx` | 📝 UI Only | ✅ Yes | ✅ Verified |
+ <!-- [STALE] | Syllabus Tracker | docs/Features Overview.md | `src/app/(main)/syllabus/page.tsx` | 📝 UI Only | ✅ Yes | ✅ Verified | -->
- | Teacher Onboarding | docs/Features Overview.md | `src/app/(auth)/teacher-onboarding/page.tsx` | ✅ Complete | ✅ Yes | ✅ Verified |
+ <!-- [STALE] | Teacher Onboarding | docs/Features Overview.md | `src/app/(auth)/teacher-onboarding/page.tsx` | ✅ Complete | ✅ Yes | ✅ Verified | -->
- | Teacher Dashboard | docs/Features Overview.md | `src/app/(main)/teacher/page.tsx` | ✅ Complete | ✅ Yes | ✅ Verified |
+ <!-- [STALE] | Teacher Dashboard | docs/Features Overview.md | `src/app/(main)/teacher/page.tsx` | ✅ Complete | ✅ Yes | ✅ Verified | -->
- | Teacher Sidebar | docs/Features Overview.md | `src/components/app/teacher-sidebar-nav.tsx` | ✅ Complete | ✅ Yes | ✅ Verified |
+ <!-- [STALE] | Teacher Sidebar | docs/Features Overview.md | `src/components/app/teacher-sidebar-nav.tsx` | ✅ Complete | ✅ Yes | ✅ Verified | -->
- | Teacher Sidebar | docs/Features Overview.md | `src/components/app/teacher-sidebar-nav.tsx` | ✅ Complete | ✅ Yes | ✅ Verified |
+ <!-- [STALE] | Teacher Sidebar | docs/Features Overview.md | `src/components/app/teacher-sidebar-nav.tsx` | ✅ Complete | ✅ Yes | ✅ Verified | -->
- | Class Management | docs/Features Overview.md | `TBD` | 📝 Not Started | ❌ No | ❓ No Location Claimed |
+ <!-- [STALE] | Class Management | docs/Features Overview.md | `TBD` | 📝 Not Started | ❌ No | ❓ No Location Claimed | -->
- | Intervention System | docs/Features Overview.md | `src/app/(main)/teacher/interventions/page.tsx` | 📝 Not Started | ❌ No | ⚠️ Planned (No Code) |
+ <!-- [STALE] | Intervention System | docs/Features Overview.md | `src/app/(main)/teacher/interventions/page.tsx` | 📝 Not Started | ❌ No | ⚠️ Planned (No Code) | -->
- | Analytics Dashboard | docs/Features Overview.md | `src/app/(main)/teacher/analytics/page.tsx` | 🚧 30% Complete | ❌ No | ❌ DRIFT (Missing Code) |
+ <!-- [STALE] | Analytics Dashboard | docs/Features Overview.md | `src/app/(main)/teacher/analytics/page.tsx` | 🚧 30% Complete | ❌ No | ❌ DRIFT (Missing Code) | -->
- | Syllabus Generator | README.md | `src/ai/flows/syllabus-generator.ts` | Implied Complete | ✅ Yes | ✅ Verified |
+ <!-- [STALE] | Syllabus Generator | README.md | `src/ai/flows/syllabus-generator.ts` | Implied Complete | ✅ Yes | ✅ Verified | -->
```

### docs\finished_reports\ERROR_BOUNDARY_COVERAGE.md
```diff
- 1. **Add Global Error Boundary:** Ensure the root `src/app/error.tsx` or `src/app/global-error.tsx` exists to catch root layout errors.
+ <!-- [STALE] 1. **Add Global Error Boundary:** Ensure the root `src/app/error.tsx` or `src/app/global-error.tsx` exists to catch root layout errors. -->
- 1. **Add Global Error Boundary:** Ensure the root `src/app/error.tsx` or `src/app/global-error.tsx` exists to catch root layout errors.
+ <!-- [STALE] 1. **Add Global Error Boundary:** Ensure the root `src/app/error.tsx` or `src/app/global-error.tsx` exists to catch root layout errors. -->
```

### docs\finished_reports\ERROR_PROPAGATION.md
```diff
- Scope: `src/ml/inference/ml-bridge.ts` and Python subprocess communication.
+ <!-- [STALE] Scope: `src/ml/inference/ml-bridge.ts` and Python subprocess communication. -->
```

### docs\finished_reports\EXPLAINABILITY_DRIFT_REPORT.md
```diff
- **Location:** `src/ai/flows/smart-revision-planner.ts`
+ <!-- [STALE] **Location:** `src/ai/flows/smart-revision-planner.ts` -->
```

### docs\finished_reports\I18N_READINESS_REPORT.md
```diff
- ### src/app/test-accessibility/page.tsx (18 strings)
+ ### src\app\admin\dashboard\page.tsx (18 strings) (Proposed)
- ### src/components/planner/AddStudyMaterial.tsx (14 strings)
+ <!-- [STALE] ### src/components/planner/AddStudyMaterial.tsx (14 strings) -->
- ### src/components/profile/StudentProfile.tsx (12 strings)
+ <!-- [STALE] ### src/components/profile/StudentProfile.tsx (12 strings) -->
- ### src/components/planner/FocusTimer.tsx (11 strings)
+ <!-- [STALE] ### src/components/planner/FocusTimer.tsx (11 strings) -->
- ### src/components/planner/StudyLibrary.tsx (10 strings)
+ <!-- [STALE] ### src/components/planner/StudyLibrary.tsx (10 strings) -->
- ### src/components/profile/TeacherProfile.tsx (9 strings)
+ <!-- [STALE] ### src/components/profile/TeacherProfile.tsx (9 strings) -->
- ### src/components/settings/StudentProfileForm.tsx (8 strings)
+ <!-- [STALE] ### src/components/settings/StudentProfileForm.tsx (8 strings) -->
- ### src/components/settings/TeacherProfileForm.tsx (8 strings)
+ <!-- [STALE] ### src/components/settings/TeacherProfileForm.tsx (8 strings) -->
- ### src/components/planner/ScheduleView.tsx (6 strings)
+ <!-- [STALE] ### src/components/planner/ScheduleView.tsx (6 strings) -->
- ### src/components/app/teacher-sidebar-nav.tsx (5 strings)
+ <!-- [STALE] ### src/components/app/teacher-sidebar-nav.tsx (5 strings) -->
- ### src/components/app/header.tsx (4 strings)
+ <!-- [STALE] ### src/components/app/header.tsx (4 strings) -->
- ### src/components/app/sidebar-nav.tsx (4 strings)
+ <!-- [STALE] ### src/components/app/sidebar-nav.tsx (4 strings) -->
- ### src/components/ui/sidebar.tsx (3 strings)
+ <!-- [STALE] ### src/components/ui/sidebar.tsx (3 strings) -->
- ### src/components/ui/carousel.tsx (2 strings)
+ <!-- [STALE] ### src/components/ui/carousel.tsx (2 strings) -->
- ### src/components/ui/sheet.tsx (2 strings)
+ <!-- [STALE] ### src/components/ui/sheet.tsx (2 strings) -->
- ### src/app/api/intelligence/student/route.ts (1 strings)
+ <!-- [STALE] ### src/app/api/intelligence/student/route.ts (1 strings) -->
- ### src/app/api/intelligence/student/route.ts (1 strings)
+ <!-- [STALE] ### src/app/api/intelligence/student/route.ts (1 strings) -->
- ### src/app/api/teacher/students/route.ts (1 strings)
+ <!-- [STALE] ### src/app/api/teacher/students/route.ts (1 strings) -->
- ### src/app/api/teacher/students/route.ts (1 strings)
+ <!-- [STALE] ### src/app/api/teacher/students/route.ts (1 strings) -->
- ### src/app/test-charts/page.tsx (1 strings)
+ ### src\app\admin\dashboard\page.tsx (1 strings) (Proposed)
- ### src/components/ui/dialog.tsx (1 strings)
+ <!-- [STALE] ### src/components/ui/dialog.tsx (1 strings) -->
- ### src/components/ui/toast.tsx (1 strings)
+ <!-- [STALE] ### src/components/ui/toast.tsx (1 strings) -->
```

### docs\finished_reports\LOADING_STATE_CONSISTENCY.md
```diff
- | `src/components/app/audio-conversation.tsx` | - | - | ✅ |
+ <!-- [STALE] | `src/components/app/audio-conversation.tsx` | - | - | ✅ | -->
- | `src/components/planner/AddStudyMaterial.tsx` | ✅ | - | ✅ |
+ <!-- [STALE] | `src/components/planner/AddStudyMaterial.tsx` | ✅ | - | ✅ | -->
- | `src/components/planner/ScheduleView.tsx` | ✅ | - | ✅ |
+ <!-- [STALE] | `src/components/planner/ScheduleView.tsx` | ✅ | - | ✅ | -->
- | `src/components/profile/StudentProfile.tsx` | ✅ | ✅ | - |
+ <!-- [STALE] | `src/components/profile/StudentProfile.tsx` | ✅ | ✅ | - | -->
- | `src/components/profile/TeacherProfile.tsx` | ✅ | ✅ | - |
+ <!-- [STALE] | `src/components/profile/TeacherProfile.tsx` | ✅ | ✅ | - | -->
- | `src/components/rewards/RewardsSkeleton.tsx` | - | ✅ | - |
+ <!-- [STALE] | `src/components/rewards/RewardsSkeleton.tsx` | - | ✅ | - | -->
- | `src/components/settings/StudentProfileForm.tsx` | ✅ | - | ✅ |
+ <!-- [STALE] | `src/components/settings/StudentProfileForm.tsx` | ✅ | - | ✅ | -->
- | `src/components/settings/TeacherProfileForm.tsx` | ✅ | - | ✅ |
+ <!-- [STALE] | `src/components/settings/TeacherProfileForm.tsx` | ✅ | - | ✅ | -->
- | `src/components/ui/sidebar.tsx` | - | ✅ | - |
+ <!-- [STALE] | `src/components/ui/sidebar.tsx` | - | ✅ | - | -->
- | `src/components/ui/skeleton.tsx` | - | ✅ | - |
+ <!-- [STALE] | `src/components/ui/skeleton.tsx` | - | ✅ | - | -->
```

### docs\finished_reports\ML_DEPLOYMENT_MATURITY.md
```diff
- -   **Model Storage:** Local filesystem (`src/ml/models/mastery_model.pkl`).
+ <!-- [STALE] -   **Model Storage:** Local filesystem (`src/ml/models/mastery_model.pkl`). -->
- -   **Metadata:** `src/ml/models/provenance_report.json` (Git hash, script hash, data hash, metrics).
+ <!-- [STALE] -   **Metadata:** `src/ml/models/provenance_report.json` (Git hash, script hash, data hash, metrics). -->
```

### docs\finished_reports\PRIVACY_COMPLIANCE_REPORT.md
```diff
- *   **src/components/ui/sidebar.tsx**: Used 4 times.
+ <!-- [STALE] *   **src/components/ui/sidebar.tsx**: Used 4 times. -->
```

### docs\finished_reports\QUIZ_DIFFICULTY_ALIGNMENT_REPORT.md
```diff
- The quiz generation prompt in `src/ai/flows/adaptive-quiz-engine.ts` explicitly includes the difficulty parameter:
+ <!-- [STALE] The quiz generation prompt in `src/ai/flows/adaptive-quiz-engine.ts` explicitly includes the difficulty parameter: -->
```

### docs\finished_reports\QUIZ_DIFFICULTY_REPORT.md
```diff
- The file `src/ai/flows/adaptive-quiz-engine.ts` relies entirely on the LLM prompt to determine difficulty:
+ <!-- [STALE] The file `src/ai/flows/adaptive-quiz-engine.ts` relies entirely on the LLM prompt to determine difficulty: -->
```

### docs\finished_reports\RESPONSIVE_BREAKPOINT_COVERAGE_REPORT.md
```diff
- | `src/components/planner/StudyLibrary.tsx` | 209 | `grid-cols-2` | Grid with 2 columns on mobile. Consider starting with grid-cols-1 and adding md:grid-cols-2. |
+ <!-- [STALE] | `src/components/planner/StudyLibrary.tsx` | 209 | `grid-cols-2` | Grid with 2 columns on mobile. Consider starting with grid-cols-1 and adding md:grid-cols-2. | -->
- | `src/components/rewards/RewardsSkeleton.tsx` | 30 | `w-64` | Fixed width > 16rem (256px) without max-width or responsive override. May overflow mobile. |
+ <!-- [STALE] | `src/components/rewards/RewardsSkeleton.tsx` | 30 | `w-64` | Fixed width > 16rem (256px) without max-width or responsive override. May overflow mobile. | -->
- | `src/components/rewards/RewardsSkeleton.tsx` | 52 | `w-64` | Fixed width > 16rem (256px) without max-width or responsive override. May overflow mobile. |
+ <!-- [STALE] | `src/components/rewards/RewardsSkeleton.tsx` | 52 | `w-64` | Fixed width > 16rem (256px) without max-width or responsive override. May overflow mobile. | -->
- | `src/components/rewards/RewardsSkeleton.tsx` | 69 | `w-80` | Fixed width > 16rem (256px) without max-width or responsive override. May overflow mobile. |
+ <!-- [STALE] | `src/components/rewards/RewardsSkeleton.tsx` | 69 | `w-80` | Fixed width > 16rem (256px) without max-width or responsive override. May overflow mobile. | -->
```

### docs\finished_reports\SERVER_ACTION_SECURITY_MATRIX.md
```diff
- | `src/app/actions/student-configuration.ts` | `saveChatbotConfiguration` | 🔴 HIGH | No |
+ <!-- [STALE] | `src/app/actions/student-configuration.ts` | `saveChatbotConfiguration` | 🔴 HIGH | No | -->
- | `src/app/actions/ai-error.ts` | `generateFriendlyErrorMessage` | 🔴 HIGH | No |
+ <!-- [STALE] | `src/app/actions/ai-error.ts` | `generateFriendlyErrorMessage` | 🔴 HIGH | No | -->
```

### docs\finished_reports\SESSION_PERSISTENCE_REPORT.md
```diff
- - Create a custom hook `useLocalStorage<T>(key: string, initialValue: T)` in `src/hooks/use-local-storage.ts`.
+ <!-- [STALE] - Create a custom hook `useLocalStorage<T>(key: string, initialValue: T)` in `src/hooks/use-local-storage.ts`. -->
```

### docs\finished_reports\STRICT_MODE_VIOLATIONS.md
```diff
- | `src/components/planner/FocusTimer.tsx` | 1 | 4 | 0 |
+ <!-- [STALE] | `src/components/planner/FocusTimer.tsx` | 1 | 4 | 0 | -->
- | `src/app/api/chaos/route.ts` | 4 | 0 | 0 |
+ <!-- [STALE] | `src/app/api/chaos/route.ts` | 4 | 0 | 0 | -->
- | `src/app/api/chaos/route.ts` | 4 | 0 | 0 |
+ <!-- [STALE] | `src/app/api/chaos/route.ts` | 4 | 0 | 0 | -->
- | `src/ai/flows/smart-revision-planner.ts` | 2 | 0 | 0 |
+ <!-- [STALE] | `src/ai/flows/smart-revision-planner.ts` | 2 | 0 | 0 | -->
- | `src/app/api/intelligence/student/route.ts` | 0 | 2 | 0 |
+ <!-- [STALE] | `src/app/api/intelligence/student/route.ts` | 0 | 2 | 0 | -->
- | `src/app/api/intelligence/student/route.ts` | 0 | 2 | 0 |
+ <!-- [STALE] | `src/app/api/intelligence/student/route.ts` | 0 | 2 | 0 | -->
- | `src/components/planner/AddStudyMaterial.tsx` | 2 | 0 | 0 |
+ <!-- [STALE] | `src/components/planner/AddStudyMaterial.tsx` | 2 | 0 | 0 | -->
```

### docs\finished_reports\TEACHER_PERMISSION_BOUNDARY_REPORT.md
```diff
- This report verifies whether the teacher-only API endpoint `/api/teacher/students` enforces Role-Based Access Control (RBAC).
+ <!-- [STALE] This report verifies whether the teacher-only API endpoint `/api/teacher/students` enforces Role-Based Access Control (RBAC). -->
- *   **Target Endpoint**: `/api/teacher/students`
+ <!-- [STALE] *   **Target Endpoint**: `/api/teacher/students` -->
```

### docs\finished_reports\TEACHER_RBAC_REPORT.md
```diff
- ### Endpoint: `GET /api/teacher/students`
+ <!-- [STALE] ### Endpoint: `GET /api/teacher/students` -->
- - **Location:** `src/app/api/teacher/students/route.ts`
+ <!-- [STALE] - **Location:** `src/app/api/teacher/students/route.ts` -->
- - **Location:** `src/app/api/teacher/students/route.ts`
+ <!-- [STALE] - **Location:** `src/app/api/teacher/students/route.ts` -->
- ### Endpoint: `GET /api/teacher`
+ <!-- [STALE] ### Endpoint: `GET /api/teacher` -->
- - **Location:** `src/app/api/teacher/route.ts`
+ <!-- [STALE] - **Location:** `src/app/api/teacher/route.ts` -->
- - **Location:** `src/app/api/teacher/route.ts`
+ <!-- [STALE] - **Location:** `src/app/api/teacher/route.ts` -->
- 3.  **Audit All Teacher Routes:** Review all files in `src/app/api/teacher/` for similar patterns.
+ <!-- [STALE] 3.  **Audit All Teacher Routes:** Review all files in `src/app/api/teacher/` for similar patterns. -->
- 3.  **Audit All Teacher Routes:** Review all files in `src/app/api/teacher/` for similar patterns.
+ <!-- [STALE] 3.  **Audit All Teacher Routes:** Review all files in `src/app/api/teacher/` for similar patterns. -->
```

### docs\finished_reports\TIME_DEPENDENCY_REPORT.md
```diff
- *   `src/ml/features/student_features.ts`: `const now = Date.now();` used for `days_since_last_revision` calculation.
+ <!-- [STALE] *   `src/ml/features/student_features.ts`: `const now = Date.now();` used for `days_since_last_revision` calculation. -->
- *   `src/components/planner/ScheduleView.tsx`: `new Date()` used for sorting and review due status.
+ <!-- [STALE] *   `src/components/planner/ScheduleView.tsx`: `new Date()` used for sorting and review due status. -->
```

### docs\SKELETON.md
```diff
- ### 4.1 Request Flow (API: `/api/intelligence/student`)
+ <!-- [STALE] ### 4.1 Request Flow (API: `/api/intelligence/student`) -->
- 1  Quiz submitted → POST /api/quiz
+ <!-- [STALE] 1  Quiz submitted → POST /api/quiz -->
```

### docs\tasks.md
```diff
- Each task links to a specific prompt file in `docs/prompts/finished/` that contains detailed instructions for an AI agent or engineer to execute.
+ <!-- [STALE] Each task links to a specific prompt file in `docs/prompts/finished/` that contains detailed instructions for an AI agent or engineer to execute. -->
```

### docs\upcoming manual changess\Core_block_upgrade.md
```diff
- ```python name="src/ml/training/train_ensemble_models.py"
+ <!-- [STALE] ```python name="src/ml/training/train_ensemble_models.py" -->
- ```python name="src/ml/training/train_ensemble_models.py"
+ <!-- [STALE] ```python name="src/ml/training/train_ensemble_models.py" -->
- model_path = Path("src/ml/models/mastery_ensemble.pkl")
+ <!-- [STALE] model_path = Path("src/ml/models/mastery_ensemble.pkl") -->
- joblib.dump(gb, Path("src/ml/models/forgetting_curve.pkl"))
+ <!-- [STALE] joblib.dump(gb, Path("src/ml/models/forgetting_curve.pkl")) -->
- joblib.dump(xgb_attention, Path("src/ml/models/attention_risk.pkl"))
+ <!-- [STALE] joblib.dump(xgb_attention, Path("src/ml/models/attention_risk.pkl")) -->
- ```typescript name="src/ml/features/advanced_student_features.ts"
+ <!-- [STALE] ```typescript name="src/ml/features/advanced_student_features.ts" -->
- ```typescript name="src/ai/adk/advanced_decision_engine.ts"
+ <!-- [STALE] ```typescript name="src/ai/adk/advanced_decision_engine.ts" -->
- ```python name="src/ml/training/train_transformer_models.py"
+ <!-- [STALE] ```python name="src/ml/training/train_transformer_models.py" -->
- ```python name="src/ml/training/train_transformer_models.py"
+ <!-- [STALE] ```python name="src/ml/training/train_transformer_models.py" -->
- torch.save(model.state_dict(), Path("src/ml/models/transformer_mastery.pt"))
+ <!-- [STALE] torch.save(model.state_dict(), Path("src/ml/models/transformer_mastery.pt")) -->
- ```python name="src/ml/training/train_bayesian_models.py"
+ <!-- [STALE] ```python name="src/ml/training/train_bayesian_models.py" -->
- ```python name="src/ml/training/train_bayesian_models.py"
+ <!-- [STALE] ```python name="src/ml/training/train_bayesian_models.py" -->
- az.to_netcdf(idata, Path("src/ml/models/bayesian_mastery_posterior.nc"))
+ <!-- [STALE] az.to_netcdf(idata, Path("src/ml/models/bayesian_mastery_posterior.nc")) -->
- ```typescript name="src/ai/llm/dynamic_llm_orchestrator.ts"
+ <!-- [STALE] ```typescript name="src/ai/llm/dynamic_llm_orchestrator.ts" -->
- python src/ml/training/generate_advanced_data.py
+ <!-- [STALE] python src/ml/training/generate_advanced_data.py -->
- python src/ml/training/train_ensemble_models.py
+ <!-- [STALE] python src/ml/training/train_ensemble_models.py -->
- python scripts/compare_models.py
+ <!-- [STALE] python scripts/compare_models.py -->
- # Replace src/ml/features/student_features.ts with advanced version
+ <!-- [STALE] # Replace src/ml/features/student_features.ts with advanced version -->
```

### README.md
```diff
- -   **Student Intelligence API**: Unified `/api/intelligence/student` endpoint serving ML predictions and ADK decisions
+ <!-- [STALE] -   **Student Intelligence API**: Unified `/api/intelligence/student` endpoint serving ML predictions and ADK decisions -->
- -   **AI Framework**: [Genkit](https://firebase.google.com/docs/genkit) (Google's AI SDK)
+ <!-- [STALE] -   **AI Framework**: [Genkit](https://firebase.google.com/docs/genkit) (Google's AI SDK) -->
- ### 1. Syllabus Generator (`src/ai/flows/syllabus-generator.ts`)
+ <!-- [STALE] ### 1. Syllabus Generator (`src/ai/flows/syllabus-generator.ts`) -->
- ### 4. RAG — Retrieval-Augmented Generation (`src/ai/rag/retriever.ts`)
+ <!-- [STALE] ### 4. RAG — Retrieval-Augmented Generation (`src/ai/rag/retriever.ts`) -->
- **Retrieval step:** When a user asks a question in the Chat page, `retrieveRelevantContext(query)` in `src/ai/rag/retriever.ts` is called.  It tokenises the query, scores every chunk by keyword overlap (a BM25-inspired term-frequency approach), and returns the top-3 most relevant chunks concatenated as a single string.
+ <!-- [STALE] **Retrieval step:** When a user asks a question in the Chat page, `retrieveRelevantContext(query)` in `src/ai/rag/retriever.ts` is called.  It tokenises the query, scores every chunk by keyword overlap (a BM25-inspired term-frequency approach), and returns the top-3 most relevant chunks concatenated as a single string. -->
- **Augmentation step:** The retrieved string is passed as the `brainMapContext` field to `explainConcept()` (the multilingual chatbot Genkit flow in `src/ai/flows/multilingual-cognitive-chatbot.ts`).  The prompt template already contains `Brain Map Context: {{{brainMapContext}}}`, so the LLM sees the retrieved student data as part of its context window.
+ <!-- [STALE] **Augmentation step:** The retrieved string is passed as the `brainMapContext` field to `explainConcept()` (the multilingual chatbot Genkit flow in `src/ai/flows/multilingual-cognitive-chatbot.ts`).  The prompt template already contains `Brain Map Context: {{{brainMapContext}}}`, so the LLM sees the retrieved student data as part of its context window. -->
- retrieveRelevantContext()          ← Retrieval (src/ai/rag/retriever.ts)
+ <!-- [STALE] retrieveRelevantContext()          ← Retrieval (src/ai/rag/retriever.ts) -->
- python generate_data.py
+ <!-- [STALE] python generate_data.py -->
- python train_mastery_model.py
+ <!-- [STALE] python train_mastery_model.py -->
- This creates `src/ml/models/mastery_model.pk`l with >90% accuracy.
+ <!-- [STALE] This creates `src/ml/models/mastery_model.pk`l with >90% accuracy. -->
```

### reports\ADK_EXPLAINABILITY_REPORT.md
```diff
- Static analysis of `src/ai/adk/decision-engine.ts` identifying object literals returned with `action` or `priority` keys, and verifying the presence of the `reasoning` key.
+ <!-- [STALE] Static analysis of `src/ai/adk/decision-engine.ts` identifying object literals returned with `action` or `priority` keys, and verifying the presence of the `reasoning` key. -->
```

### reports\api-naming-audit.md
```diff
- - `/api/classes/create`: - Route ends with a verb (create). RESTful APIs should use nouns and HTTP methods.
+ <!-- [STALE] - `/api/classes/create`: - Route ends with a verb (create). RESTful APIs should use nouns and HTTP methods. -->
- - `/api/students/create`: - Route ends with a verb (create). RESTful APIs should use nouns and HTTP methods.
+ <!-- [STALE] - `/api/students/create`: - Route ends with a verb (create). RESTful APIs should use nouns and HTTP methods. -->
- - `/api/teachers/create`: - Route ends with a verb (create). RESTful APIs should use nouns and HTTP methods.
+ <!-- [STALE] - `/api/teachers/create`: - Route ends with a verb (create). RESTful APIs should use nouns and HTTP methods. -->
- - `/api/users/create`: - Route ends with a verb (create). RESTful APIs should use nouns and HTTP methods.
+ <!-- [STALE] - `/api/users/create`: - Route ends with a verb (create). RESTful APIs should use nouns and HTTP methods. -->
- - `/api/activity/log`
+ <!-- [STALE] - `/api/activity/log` -->
- - `/api/brainmap/nodes`
+ <!-- [STALE] - `/api/brainmap/nodes` -->
- - `/api/chaos`
+ <!-- [STALE] - `/api/chaos` -->
- - `/api/classes/join`
+ <!-- [STALE] - `/api/classes/join` -->
- - `/api/classes/leave`
+ <!-- [STALE] - `/api/classes/leave` -->
- - `/api/intelligence/student`
+ <!-- [STALE] - `/api/intelligence/student` -->
- - `/api/planner/convert-to-node`
+ <!-- [STALE] - `/api/planner/convert-to-node` -->
- - `/api/planner/data`
+ <!-- [STALE] - `/api/planner/data` -->
- - `/api/planner/review`
+ <!-- [STALE] - `/api/planner/review` -->
- - `/api/quiz/submit`
+ <!-- [STALE] - `/api/quiz/submit` -->
- - `/api/sankalp/session/end`
+ <!-- [STALE] - `/api/sankalp/session/end` -->
- - `/api/sankalp/session/start`
+ <!-- [STALE] - `/api/sankalp/session/start` -->
- - `/api/student/graph`
+ <!-- [STALE] - `/api/student/graph` -->
- - `/api/student/onboard`
+ <!-- [STALE] - `/api/student/onboard` -->
- - `/api/student`
+ <!-- [STALE] - `/api/student` -->
- - `/api/syllabus/save`
+ <!-- [STALE] - `/api/syllabus/save` -->
- - `/api/teacher/classes/[classId]`
+ <!-- [STALE] - `/api/teacher/classes/[classId]` -->
- - `/api/teacher/classes/[classId]/students`
+ <!-- [STALE] - `/api/teacher/classes/[classId]/students` -->
- - `/api/teacher/classes`
+ <!-- [STALE] - `/api/teacher/classes` -->
- - `/api/teacher/graph`
+ <!-- [STALE] - `/api/teacher/graph` -->
- - `/api/teacher/onboard`
+ <!-- [STALE] - `/api/teacher/onboard` -->
- - `/api/teacher`
+ <!-- [STALE] - `/api/teacher` -->
- - `/api/teacher/students/[studentId]`
+ <!-- [STALE] - `/api/teacher/students/[studentId]` -->
- - `/api/teacher/students`
+ <!-- [STALE] - `/api/teacher/students` -->
- - `/api/test/seed`
+ <!-- [STALE] - `/api/test/seed` -->
- - `/api/users/[userId]`
+ <!-- [STALE] - `/api/users/[userId]` -->
```

### reports\API_NAMING_AUDIT.md
```diff
- | /api/planner/data | GET, POST | ✅ Clean |
+ <!-- [STALE] | /api/planner/data | GET, POST | ✅ Clean | -->
- | /api/planner/review | GET | ✅ Clean |
+ <!-- [STALE] | /api/planner/review | GET | ✅ Clean | -->
- | /api/planner/convert-to-node | POST | ✅ Clean |
+ <!-- [STALE] | /api/planner/convert-to-node | POST | ✅ Clean | -->
- | /api/brainmap/nodes | GET | ✅ Clean |
+ <!-- [STALE] | /api/brainmap/nodes | GET | ✅ Clean | -->
- | /api/teacher | GET, PUT | ✅ Clean |
+ <!-- [STALE] | /api/teacher | GET, PUT | ✅ Clean | -->
- | /api/teacher/graph | GET | ✅ Clean |
+ <!-- [STALE] | /api/teacher/graph | GET | ✅ Clean | -->
- | /api/teacher/onboard | POST | ✅ Clean |
+ <!-- [STALE] | /api/teacher/onboard | POST | ✅ Clean | -->
- | /api/teacher/classes | GET | ✅ Clean |
+ <!-- [STALE] | /api/teacher/classes | GET | ✅ Clean | -->
- | /api/teacher/classes/[classId] | GET | ⚠️ Uppercased segment: [classId] |
+ <!-- [STALE] | /api/teacher/classes/[classId] | GET | ⚠️ Uppercased segment: [classId] | -->
- | /api/teacher/classes/[classId]/students | GET | ⚠️ Uppercased segment: [classId] |
+ <!-- [STALE] | /api/teacher/classes/[classId]/students | GET | ⚠️ Uppercased segment: [classId] | -->
- | /api/teacher/students | GET | ✅ Clean |
+ <!-- [STALE] | /api/teacher/students | GET | ✅ Clean | -->
- | /api/teacher/students/[studentId] | GET | ⚠️ Uppercased segment: [studentId] |
+ <!-- [STALE] | /api/teacher/students/[studentId] | GET | ⚠️ Uppercased segment: [studentId] | -->
- | /api/student | GET, PUT | ✅ Clean |
+ <!-- [STALE] | /api/student | GET, PUT | ✅ Clean | -->
- | /api/student/graph | GET | ✅ Clean |
+ <!-- [STALE] | /api/student/graph | GET | ✅ Clean | -->
- | /api/student/onboard | POST | ✅ Clean |
+ <!-- [STALE] | /api/student/onboard | POST | ✅ Clean | -->
- | /api/test/seed | POST | ✅ Clean |
+ <!-- [STALE] | /api/test/seed | POST | ✅ Clean | -->
- | /api/sankalp/session/start | POST | ✅ Clean |
+ <!-- [STALE] | /api/sankalp/session/start | POST | ✅ Clean | -->
- | /api/sankalp/session/end | POST | ✅ Clean |
+ <!-- [STALE] | /api/sankalp/session/end | POST | ✅ Clean | -->
- | /api/classes/create | POST | ✅ Clean |
+ <!-- [STALE] | /api/classes/create | POST | ✅ Clean | -->
- | /api/classes/join | POST | ✅ Clean |
+ <!-- [STALE] | /api/classes/join | POST | ✅ Clean | -->
- | /api/classes/leave | POST | ✅ Clean |
+ <!-- [STALE] | /api/classes/leave | POST | ✅ Clean | -->
- | /api/activity/log | POST | ✅ Clean |
+ <!-- [STALE] | /api/activity/log | POST | ✅ Clean | -->
- | /api/users/create | POST | ✅ Clean |
+ <!-- [STALE] | /api/users/create | POST | ✅ Clean | -->
- | /api/users/[userId] | GET | ⚠️ Uppercased segment: [userId] |
+ <!-- [STALE] | /api/users/[userId] | GET | ⚠️ Uppercased segment: [userId] | -->
- | /api/quiz/submit | POST | ✅ Clean |
+ <!-- [STALE] | /api/quiz/submit | POST | ✅ Clean | -->
- | /api/teachers/create | POST | ✅ Clean |
+ <!-- [STALE] | /api/teachers/create | POST | ✅ Clean | -->
- | /api/intelligence/student | GET | ✅ Clean |
+ <!-- [STALE] | /api/intelligence/student | GET | ✅ Clean | -->
- | /api/students/create | POST | ✅ Clean |
+ <!-- [STALE] | /api/students/create | POST | ✅ Clean | -->
- | /api/chaos | GET, POST, DELETE | ✅ Clean |
+ <!-- [STALE] | /api/chaos | GET, POST, DELETE | ✅ Clean | -->
- | /api/syllabus/save | POST | ✅ Clean |
+ <!-- [STALE] | /api/syllabus/save | POST | ✅ Clean | -->
```

### reports\BIAS_DETECTION_REPORT.md
```diff
- **Scope:** `src/ai/flows/adaptive-quiz-engine.ts`
+ <!-- [STALE] **Scope:** `src/ai/flows/adaptive-quiz-engine.ts` -->
- Update the `adaptiveQuizPrompt` in `src/ai/flows/adaptive-quiz-engine.ts` to include the following instructions:
+ <!-- [STALE] Update the `adaptiveQuizPrompt` in `src/ai/flows/adaptive-quiz-engine.ts` to include the following instructions: -->
```

### reports\build-performance-report.md
```diff
- ├ ƒ /api/activity/log                          393 B         103 kB
+ <!-- [STALE] ├ ƒ /api/activity/log                          393 B         103 kB -->
- ├ ƒ /api/brainmap/nodes                        394 B         103 kB
+ <!-- [STALE] ├ ƒ /api/brainmap/nodes                        394 B         103 kB -->
- ├ ƒ /api/chaos                                 394 B         103 kB
+ <!-- [STALE] ├ ƒ /api/chaos                                 394 B         103 kB -->
- ├ ƒ /api/classes/create                        393 B         103 kB
+ <!-- [STALE] ├ ƒ /api/classes/create                        393 B         103 kB -->
- ├ ƒ /api/classes/join                          394 B         103 kB
+ <!-- [STALE] ├ ƒ /api/classes/join                          394 B         103 kB -->
- ├ ƒ /api/classes/leave                         393 B         103 kB
+ <!-- [STALE] ├ ƒ /api/classes/leave                         393 B         103 kB -->
- ├ ƒ /api/intelligence/student                  394 B         103 kB
+ <!-- [STALE] ├ ƒ /api/intelligence/student                  394 B         103 kB -->
- ├ ƒ /api/planner/convert-to-node               394 B         103 kB
+ <!-- [STALE] ├ ƒ /api/planner/convert-to-node               394 B         103 kB -->
- ├ ƒ /api/planner/data                          394 B         103 kB
+ <!-- [STALE] ├ ƒ /api/planner/data                          394 B         103 kB -->
- ├ ƒ /api/planner/review                        394 B         103 kB
+ <!-- [STALE] ├ ƒ /api/planner/review                        394 B         103 kB -->
- ├ ƒ /api/quiz/submit                           395 B         103 kB
+ <!-- [STALE] ├ ƒ /api/quiz/submit                           395 B         103 kB -->
- ├ ƒ /api/sankalp/session/end                   393 B         103 kB
+ <!-- [STALE] ├ ƒ /api/sankalp/session/end                   393 B         103 kB -->
- ├ ƒ /api/sankalp/session/start                 394 B         103 kB
+ <!-- [STALE] ├ ƒ /api/sankalp/session/start                 394 B         103 kB -->
- ├ ƒ /api/student                               394 B         103 kB
+ <!-- [STALE] ├ ƒ /api/student                               394 B         103 kB -->
- ├ ƒ /api/student/graph                         394 B         103 kB
+ <!-- [STALE] ├ ƒ /api/student/graph                         394 B         103 kB -->
- ├ ƒ /api/student/onboard                       393 B         103 kB
+ <!-- [STALE] ├ ƒ /api/student/onboard                       393 B         103 kB -->
- ├ ƒ /api/students/create                       394 B         103 kB
+ <!-- [STALE] ├ ƒ /api/students/create                       394 B         103 kB -->
- ├ ƒ /api/syllabus/save                         394 B         103 kB
+ <!-- [STALE] ├ ƒ /api/syllabus/save                         394 B         103 kB -->
- ├ ƒ /api/teacher                               394 B         103 kB
+ <!-- [STALE] ├ ƒ /api/teacher                               394 B         103 kB -->
- ├ ƒ /api/teacher/classes                       393 B         103 kB
+ <!-- [STALE] ├ ƒ /api/teacher/classes                       393 B         103 kB -->
- ├ ƒ /api/teacher/classes/[classId]             394 B         103 kB
+ <!-- [STALE] ├ ƒ /api/teacher/classes/[classId]             394 B         103 kB -->
- ├ ƒ /api/teacher/classes/[classId]/students    393 B         103 kB
+ <!-- [STALE] ├ ƒ /api/teacher/classes/[classId]/students    393 B         103 kB -->
- ├ ƒ /api/teacher/graph                         393 B         103 kB
+ <!-- [STALE] ├ ƒ /api/teacher/graph                         393 B         103 kB -->
- ├ ƒ /api/teacher/onboard                       393 B         103 kB
+ <!-- [STALE] ├ ƒ /api/teacher/onboard                       393 B         103 kB -->
- ├ ƒ /api/teacher/students                      393 B         103 kB
+ <!-- [STALE] ├ ƒ /api/teacher/students                      393 B         103 kB -->
- ├ ƒ /api/teacher/students/[studentId]          394 B         103 kB
+ <!-- [STALE] ├ ƒ /api/teacher/students/[studentId]          394 B         103 kB -->
- ├ ƒ /api/teachers/create                       394 B         103 kB
+ <!-- [STALE] ├ ƒ /api/teachers/create                       394 B         103 kB -->
- ├ ƒ /api/test/seed                             394 B         103 kB
+ <!-- [STALE] ├ ƒ /api/test/seed                             394 B         103 kB -->
- ├ ƒ /api/users/[userId]                        393 B         103 kB
+ <!-- [STALE] ├ ƒ /api/users/[userId]                        393 B         103 kB -->
- ├ ƒ /api/users/create                          394 B         103 kB
+ <!-- [STALE] ├ ƒ /api/users/create                          394 B         103 kB -->
```

### reports\BUNDLE_SIZE_IMPACT_REPORT.md
```diff
- | `src/components/app/audio-conversation.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
+ <!-- [STALE] | `src/components/app/audio-conversation.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage | -->
- | `src/components/app/header.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
+ <!-- [STALE] | `src/components/app/header.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage | -->
- | `src/components/app/sidebar-nav.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
+ <!-- [STALE] | `src/components/app/sidebar-nav.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage | -->
- | `src/components/app/teacher-sidebar-nav.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
+ <!-- [STALE] | `src/components/app/teacher-sidebar-nav.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage | -->
- | `src/components/planner/AddStudyMaterial.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
+ <!-- [STALE] | `src/components/planner/AddStudyMaterial.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage | -->
- | `src/components/planner/FocusTimer.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
+ <!-- [STALE] | `src/components/planner/FocusTimer.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage | -->
- | `src/components/planner/ScheduleView.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
+ <!-- [STALE] | `src/components/planner/ScheduleView.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage | -->
- | `src/components/planner/StudyLibrary.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
+ <!-- [STALE] | `src/components/planner/StudyLibrary.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage | -->
- | `src/components/profile/StudentProfile.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
+ <!-- [STALE] | `src/components/profile/StudentProfile.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage | -->
- | `src/components/profile/TeacherProfile.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
+ <!-- [STALE] | `src/components/profile/TeacherProfile.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage | -->
- | `src/components/settings/StudentProfileForm.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
+ <!-- [STALE] | `src/components/settings/StudentProfileForm.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage | -->
- | `src/components/settings/TeacherProfileForm.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
+ <!-- [STALE] | `src/components/settings/TeacherProfileForm.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage | -->
- | `src/components/ui/accordion.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
+ <!-- [STALE] | `src/components/ui/accordion.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage | -->
- | `src/components/ui/calendar.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
+ <!-- [STALE] | `src/components/ui/calendar.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage | -->
- | `src/components/ui/carousel.tsx` | `embla-carousel-react` | Client | ❌ No | ℹ️ Verify usage |
+ <!-- [STALE] | `src/components/ui/carousel.tsx` | `embla-carousel-react` | Client | ❌ No | ℹ️ Verify usage | -->
- | `src/components/ui/carousel.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
+ <!-- [STALE] | `src/components/ui/carousel.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage | -->
- | `src/components/ui/chart.tsx` | `recharts` | Client | ❌ No | ⚠️ Consider `next/dynamic` |
+ <!-- [STALE] | `src/components/ui/chart.tsx` | `recharts` | Client | ❌ No | ⚠️ Consider `next/dynamic` | -->
- | `src/components/ui/checkbox.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
+ <!-- [STALE] | `src/components/ui/checkbox.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage | -->
- | `src/components/ui/dialog.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
+ <!-- [STALE] | `src/components/ui/dialog.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage | -->
- | `src/components/ui/dropdown-menu.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
+ <!-- [STALE] | `src/components/ui/dropdown-menu.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage | -->
- | `src/components/ui/menubar.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
+ <!-- [STALE] | `src/components/ui/menubar.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage | -->
- | `src/components/ui/radio-group.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
+ <!-- [STALE] | `src/components/ui/radio-group.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage | -->
- | `src/components/ui/select.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
+ <!-- [STALE] | `src/components/ui/select.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage | -->
- | `src/components/ui/sheet.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
+ <!-- [STALE] | `src/components/ui/sheet.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage | -->
- | `src/components/ui/sidebar.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
+ <!-- [STALE] | `src/components/ui/sidebar.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage | -->
- | `src/components/ui/toast.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
+ <!-- [STALE] | `src/components/ui/toast.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage | -->
```

### reports\CACHING_STRATEGY_PROPOSAL.md
```diff
- **Scope:** `src/ai/flows` (Syllabus, Quiz, Chatbot)
+ <!-- [STALE] **Scope:** `src/ai/flows` (Syllabus, Quiz, Chatbot) -->
- - **Target**: `src/ai/flows/syllabus-generator.ts`
+ <!-- [STALE] - **Target**: `src/ai/flows/syllabus-generator.ts` -->
- - **Target**: `src/ai/flows/adaptive-quiz-engine.ts`
+ <!-- [STALE] - **Target**: `src/ai/flows/adaptive-quiz-engine.ts` -->
```

### reports\chatbot-context-audit.md
```diff
- The audit of the conversational AI system (`src/ai/flows/multilingual-cognitive-chatbot.ts` and `src/app/(main)/chat/actions.ts`) reveals that the chatbot currently **does not maintain conversation history** in its interactions with the LLM. Consequently, while there is no risk of token overflow from long sessions in the current state, the chatbot fails to meet the functional requirement of maintaining context, resulting in a stateless experience where the AI forgets previous interactions immediately.
+ <!-- [STALE] The audit of the conversational AI system (`src/ai/flows/multilingual-cognitive-chatbot.ts` and `src/app/(main)/chat/actions.ts`) reveals that the chatbot currently **does not maintain conversation history** in its interactions with the LLM. Consequently, while there is no risk of token overflow from long sessions in the current state, the chatbot fails to meet the functional requirement of maintaining context, resulting in a stateless experience where the AI forgets previous interactions immediately. -->
- 1.  **Code Analysis:** Examined `src/ai/flows/multilingual-cognitive-chatbot.ts` (AI flow definition) and `src/app/(main)/chat/actions.ts` (Server Action).
+ <!-- [STALE] 1.  **Code Analysis:** Examined `src/ai/flows/multilingual-cognitive-chatbot.ts` (AI flow definition) and `src/app/(main)/chat/actions.ts` (Server Action). -->
```

### reports\CHATBOT_CONTEXT_HEALTH_REPORT.md
```diff
- - Simulated a conversation using `src/ai/flows/multilingual-cognitive-chatbot.ts`.
+ <!-- [STALE] - Simulated a conversation using `src/ai/flows/multilingual-cognitive-chatbot.ts`. -->
- For more details see https://genkit.dev/docs/plugins/google-genai
+ <!-- [STALE] For more details see https://genkit.dev/docs/plugins/google-genai -->
```

### reports\COST_OPTIMIZATION_REPORT.md
```diff
- *   **Hotspot**: `GET /api/teacher/students`
+ <!-- [STALE] *   **Hotspot**: `GET /api/teacher/students` -->
```

### reports\DATA_PORTABILITY_REPORT.md
```diff
- 1. **Implement Data Export:** Create a dedicated API endpoint (e.g., `/api/user/export`) that aggregates all student data (quizzes, syllabus, mastery scores).
+ <!-- [STALE] 1. **Implement Data Export:** Create a dedicated API endpoint (e.g., `/api/user/export`) that aggregates all student data (quizzes, syllabus, mastery scores). -->
```

### reports\dependency-vulnerability-report.md
```diff
- Scanned `src/ml/training/requirements.txt`.
+ Scanned `src\ml\requirements.txt`. (Proposed)
```

### reports\DEPENDENCY_VULNERABILITY_REPORT.md
```diff
- ### src/ml/training/requirements.txt
+ ### src\ml\requirements.txt (Proposed)
- ### src/ml/inference/requirements.txt
+ ### src\ml\requirements.txt (Proposed)
```

### reports\design-token-violations.md
```diff
- | src/components/app/sidebar-nav.tsx | 84 | `text-[10px]` | Use nearest text size token | `<span className="text-[10px] font-medium text-mute...` |
+ <!-- [STALE] | src/components/app/sidebar-nav.tsx | 84 | `text-[10px]` | Use nearest text size token | `<span className="text-[10px] font-medium text-mute...` | -->
- | src/components/app/teacher-sidebar-nav.tsx | 47 | `text-[10px]` | Use nearest text size token | `<p className="text-[10px] text-muted-foreground up...` |
+ <!-- [STALE] | src/components/app/teacher-sidebar-nav.tsx | 47 | `text-[10px]` | Use nearest text size token | `<p className="text-[10px] text-muted-foreground up...` | -->
- | src/components/app/teacher-sidebar-nav.tsx | 66 | `text-[10px]` | Use nearest text size token | `className="ml-auto text-[10px] h-5 px-1.5 text-mut...` |
+ <!-- [STALE] | src/components/app/teacher-sidebar-nav.tsx | 66 | `text-[10px]` | Use nearest text size token | `className="ml-auto text-[10px] h-5 px-1.5 text-mut...` | -->
- | src/components/app/teacher-sidebar-nav.tsx | 92 | `text-[10px]` | Use nearest text size token | `<span className="text-[10px] font-medium text-mute...` |
+ <!-- [STALE] | src/components/app/teacher-sidebar-nav.tsx | 92 | `text-[10px]` | Use nearest text size token | `<span className="text-[10px] font-medium text-mute...` | -->
- | src/components/planner/StudyLibrary.tsx | 86 | `w-[200px]` | Use nearest spacing token | `<SelectTrigger className="w-full sm:w-[200px]" ari...` |
+ <!-- [STALE] | src/components/planner/StudyLibrary.tsx | 86 | `w-[200px]` | Use nearest spacing token | `<SelectTrigger className="w-full sm:w-[200px]" ari...` | -->
- | src/components/rewards/RewardsSkeleton.tsx | 72 | `h-[300px]` | Use nearest spacing token | `<Skeleton className="h-[300px] w-full" />` |
+ <!-- [STALE] | src/components/rewards/RewardsSkeleton.tsx | 72 | `h-[300px]` | Use nearest spacing token | `<Skeleton className="h-[300px] w-full" />` | -->
- | src/components/ui/chart.tsx | 55 | `#ccc` | Use a Tailwind color token (e.g., text-primary, bg-muted) | `"flex aspect-video justify-center text-xs [&_.rech...` |
+ <!-- [STALE] | src/components/ui/chart.tsx | 55 | `#ccc` | Use a Tailwind color token (e.g., text-primary, bg-muted) | `"flex aspect-video justify-center text-xs [&_.rech...` | -->
- | src/components/ui/chart.tsx | 55 | `#fff` | Use a Tailwind color token (e.g., text-primary, bg-muted) | `"flex aspect-video justify-center text-xs [&_.rech...` |
+ <!-- [STALE] | src/components/ui/chart.tsx | 55 | `#fff` | Use a Tailwind color token (e.g., text-primary, bg-muted) | `"flex aspect-video justify-center text-xs [&_.rech...` | -->
- | src/components/ui/chart.tsx | 55 | `#ccc` | Use a Tailwind color token (e.g., text-primary, bg-muted) | `"flex aspect-video justify-center text-xs [&_.rech...` |
+ <!-- [STALE] | src/components/ui/chart.tsx | 55 | `#ccc` | Use a Tailwind color token (e.g., text-primary, bg-muted) | `"flex aspect-video justify-center text-xs [&_.rech...` | -->
- | src/components/ui/chart.tsx | 55 | `#ccc` | Use a Tailwind color token (e.g., text-primary, bg-muted) | `"flex aspect-video justify-center text-xs [&_.rech...` |
+ <!-- [STALE] | src/components/ui/chart.tsx | 55 | `#ccc` | Use a Tailwind color token (e.g., text-primary, bg-muted) | `"flex aspect-video justify-center text-xs [&_.rech...` | -->
- | src/components/ui/chart.tsx | 55 | `#fff` | Use a Tailwind color token (e.g., text-primary, bg-muted) | `"flex aspect-video justify-center text-xs [&_.rech...` |
+ <!-- [STALE] | src/components/ui/chart.tsx | 55 | `#fff` | Use a Tailwind color token (e.g., text-primary, bg-muted) | `"flex aspect-video justify-center text-xs [&_.rech...` | -->
- | src/components/ui/scroll-area.tsx | 36 | `p-[1px]` | Use spacing token 'px' | `"h-full w-2.5 border-l border-l-transparent p-[1px...` |
+ <!-- [STALE] | src/components/ui/scroll-area.tsx | 36 | `p-[1px]` | Use spacing token 'px' | `"h-full w-2.5 border-l border-l-transparent p-[1px...` | -->
- | src/components/ui/scroll-area.tsx | 38 | `p-[1px]` | Use spacing token 'px' | `"h-2.5 flex-col border-t border-t-transparent p-[1...` |
+ <!-- [STALE] | src/components/ui/scroll-area.tsx | 38 | `p-[1px]` | Use spacing token 'px' | `"h-2.5 flex-col border-t border-t-transparent p-[1...` | -->
- | src/components/ui/separator.tsx | 22 | `h-[1px]` | Use spacing token 'px' | `orientation === "horizontal" ? "h-[1px] w-full" : ...` |
+ <!-- [STALE] | src/components/ui/separator.tsx | 22 | `h-[1px]` | Use spacing token 'px' | `orientation === "horizontal" ? "h-[1px] w-full" : ...` | -->
- | src/components/ui/separator.tsx | 22 | `w-[1px]` | Use spacing token 'px' | `orientation === "horizontal" ? "h-[1px] w-full" : ...` |
+ <!-- [STALE] | src/components/ui/separator.tsx | 22 | `w-[1px]` | Use spacing token 'px' | `orientation === "horizontal" ? "h-[1px] w-full" : ...` | -->
- | src/components/ui/sidebar.tsx | 303 | `w-[2px]` | Use spacing token '0.5' | `"absolute inset-y-0 z-20 hidden w-4 -translate-x-1...` |
+ <!-- [STALE] | src/components/ui/sidebar.tsx | 303 | `w-[2px]` | Use spacing token '0.5' | `"absolute inset-y-0 z-20 hidden w-4 -translate-x-1...` | -->
- | src/components/ui/textarea.tsx | 10 | `min-h-[80px]` | Use spacing token '20' | `'flex min-h-[80px] w-full rounded-md border border...` |
+ <!-- [STALE] | src/components/ui/textarea.tsx | 10 | `min-h-[80px]` | Use spacing token '20' | `'flex min-h-[80px] w-full rounded-md border border...` | -->
- | src/components/ui/toast.tsx | 19 | `max-w-[420px]` | Use nearest spacing token | `"fixed top-0 z-[100] flex max-h-screen w-full flex...` |
+ <!-- [STALE] | src/components/ui/toast.tsx | 19 | `max-w-[420px]` | Use nearest spacing token | `"fixed top-0 z-[100] flex max-h-screen w-full flex...` | -->
```

### reports\ENVIRONMENT_SECURITY_REPORT.md
```diff
- | `src/app/api/chaos/route.ts` | 7 | `NODE_ENV` | `const isChaosEnabled = process.env.NODE_ENV !== 'p...` |
+ <!-- [STALE] | `src/app/api/chaos/route.ts` | 7 | `NODE_ENV` | `const isChaosEnabled = process.env.NODE_ENV !== 'p...` | -->
- | `src/app/api/chaos/route.ts` | 7 | `NODE_ENV` | `const isChaosEnabled = process.env.NODE_ENV !== 'p...` |
+ <!-- [STALE] | `src/app/api/chaos/route.ts` | 7 | `NODE_ENV` | `const isChaosEnabled = process.env.NODE_ENV !== 'p...` | -->
- | `src/app/api/chaos/route.ts` | 7 | `ENABLE_CHAOS` | `const isChaosEnabled = process.env.NODE_ENV !== 'p...` |
+ <!-- [STALE] | `src/app/api/chaos/route.ts` | 7 | `ENABLE_CHAOS` | `const isChaosEnabled = process.env.NODE_ENV !== 'p...` | -->
- | `src/app/api/chaos/route.ts` | 7 | `ENABLE_CHAOS` | `const isChaosEnabled = process.env.NODE_ENV !== 'p...` |
+ <!-- [STALE] | `src/app/api/chaos/route.ts` | 7 | `ENABLE_CHAOS` | `const isChaosEnabled = process.env.NODE_ENV !== 'p...` | -->
- | `src/app/api/chaos/route.ts` | 29 | `USE_MOCK_DB` | `if (process.env.USE_MOCK_DB !== 'true') {...` |
+ <!-- [STALE] | `src/app/api/chaos/route.ts` | 29 | `USE_MOCK_DB` | `if (process.env.USE_MOCK_DB !== 'true') {...` | -->
- | `src/app/api/chaos/route.ts` | 29 | `USE_MOCK_DB` | `if (process.env.USE_MOCK_DB !== 'true') {...` |
+ <!-- [STALE] | `src/app/api/chaos/route.ts` | 29 | `USE_MOCK_DB` | `if (process.env.USE_MOCK_DB !== 'true') {...` | -->
- | `src/app/api/test/seed/route.ts` | 6 | `NODE_ENV` | `const isTest = process.env.NODE_ENV !== 'productio...` |
+ <!-- [STALE] | `src/app/api/test/seed/route.ts` | 6 | `NODE_ENV` | `const isTest = process.env.NODE_ENV !== 'productio...` | -->
- | `src/app/api/test/seed/route.ts` | 6 | `NODE_ENV` | `const isTest = process.env.NODE_ENV !== 'productio...` |
+ <!-- [STALE] | `src/app/api/test/seed/route.ts` | 6 | `NODE_ENV` | `const isTest = process.env.NODE_ENV !== 'productio...` | -->
- | `src/app/api/test/seed/route.ts` | 6 | `USE_MOCK_DB` | `const isTest = process.env.NODE_ENV !== 'productio...` |
+ <!-- [STALE] | `src/app/api/test/seed/route.ts` | 6 | `USE_MOCK_DB` | `const isTest = process.env.NODE_ENV !== 'productio...` | -->
- | `src/app/api/test/seed/route.ts` | 6 | `USE_MOCK_DB` | `const isTest = process.env.NODE_ENV !== 'productio...` |
+ <!-- [STALE] | `src/app/api/test/seed/route.ts` | 6 | `USE_MOCK_DB` | `const isTest = process.env.NODE_ENV !== 'productio...` | -->
```

### reports\EXPLAINABILITY_DRIFT_REPORT.md
```diff
- Extracted rules from `src/ai/adk/decision-engine.ts`:
+ <!-- [STALE] Extracted rules from `src/ai/adk/decision-engine.ts`: -->
```

### reports\forgetting-curve-audit.md
```diff
- The Adaptive Decision Kit (ADK) in `src/ai/adk/decision-engine.ts` contains explicit logic to trigger "Urgent Revision" based on a `days_until_forget` metric. However, the Machine Learning inference layer (`src/ml/inference/predict_mastery.py`) completely **fails to calculate this metric**. As a result, the ADK defaults to a "perfect memory" assumption (999 days), rendering the forgetting curve-based intervention logic non-functional.
+ <!-- [STALE] The Adaptive Decision Kit (ADK) in `src/ai/adk/decision-engine.ts` contains explicit logic to trigger "Urgent Revision" based on a `days_until_forget` metric. However, the Machine Learning inference layer (`src/ml/inference/predict_mastery.py`) completely **fails to calculate this metric**. As a result, the ADK defaults to a "perfect memory" assumption (999 days), rendering the forgetting curve-based intervention logic non-functional. -->
- The Adaptive Decision Kit (ADK) in `src/ai/adk/decision-engine.ts` contains explicit logic to trigger "Urgent Revision" based on a `days_until_forget` metric. However, the Machine Learning inference layer (`src/ml/inference/predict_mastery.py`) completely **fails to calculate this metric**. As a result, the ADK defaults to a "perfect memory" assumption (999 days), rendering the forgetting curve-based intervention logic non-functional.
+ <!-- [STALE] The Adaptive Decision Kit (ADK) in `src/ai/adk/decision-engine.ts` contains explicit logic to trigger "Urgent Revision" based on a `days_until_forget` metric. However, the Machine Learning inference layer (`src/ml/inference/predict_mastery.py`) completely **fails to calculate this metric**. As a result, the ADK defaults to a "perfect memory" assumption (999 days), rendering the forgetting curve-based intervention logic non-functional. -->
- 1.  **Code Analysis:** Traced the `days_until_forget` variable from its usage in `src/ai/adk/decision-engine.ts` to its definition in `src/ml/inference/types.ts` and its expected source in `src/ml/inference/predict_mastery.py`.
+ <!-- [STALE] 1.  **Code Analysis:** Traced the `days_until_forget` variable from its usage in `src/ai/adk/decision-engine.ts` to its definition in `src/ml/inference/types.ts` and its expected source in `src/ml/inference/predict_mastery.py`. -->
- 1.  **Code Analysis:** Traced the `days_until_forget` variable from its usage in `src/ai/adk/decision-engine.ts` to its definition in `src/ml/inference/types.ts` and its expected source in `src/ml/inference/predict_mastery.py`.
+ <!-- [STALE] 1.  **Code Analysis:** Traced the `days_until_forget` variable from its usage in `src/ai/adk/decision-engine.ts` to its definition in `src/ml/inference/types.ts` and its expected source in `src/ml/inference/predict_mastery.py`. -->
- 1.  **Code Analysis:** Traced the `days_until_forget` variable from its usage in `src/ai/adk/decision-engine.ts` to its definition in `src/ml/inference/types.ts` and its expected source in `src/ml/inference/predict_mastery.py`.
+ <!-- [STALE] 1.  **Code Analysis:** Traced the `days_until_forget` variable from its usage in `src/ai/adk/decision-engine.ts` to its definition in `src/ml/inference/types.ts` and its expected source in `src/ml/inference/predict_mastery.py`. -->
```

### reports\FORGETTING_CURVE_AUDIT.md
```diff
- - Checked for the existence of the trained model file: `src/ml/models/forgetting_model.pkl`.
+ <!-- [STALE] - Checked for the existence of the trained model file: `src/ml/models/forgetting_model.pkl`. -->
- - Analyzed the inference script: `src/ml/inference/predict_mastery.py`.
+ <!-- [STALE] - Analyzed the inference script: `src/ml/inference/predict_mastery.py`. -->
- - ❌ **MISSING**: Model file `src/ml/models/forgetting_model.pkl` does not exist. This confirms the feature is not deployed.
+ <!-- [STALE] - ❌ **MISSING**: Model file `src/ml/models/forgetting_model.pkl` does not exist. This confirms the feature is not deployed. -->
- The ADK Decision Engine (`src/ai/adk/decision-engine.ts`) relies on `days_until_forget` for scheduling urgent revisions:
+ <!-- [STALE] The ADK Decision Engine (`src/ai/adk/decision-engine.ts`) relies on `days_until_forget` for scheduling urgent revisions: -->
```

### reports\GAMIFICATION_QUALITY_REPORT.md
```diff
- - `src/lib/rewards/calculateRewards.ts`: Utility functions for calculating progress.
+ <!-- [STALE] - `src/lib/rewards/calculateRewards.ts`: Utility functions for calculating progress. -->
```

### reports\GENKIT_OBSERVABILITY_REPORT.md
```diff
- This report identifies AI flows in `src/ai/flows/` that lack sufficient logging or error handling.
+ <!-- [STALE] This report identifies AI flows in `src/ai/flows/` that lack sufficient logging or error handling. -->
```

### reports\HOOK_DEPENDENCY_AUDIT.md
```diff
- | src/components/planner/FocusTimer.tsx | 60 | useMemo | `[studyMaterials]` | ✅ Array Present |
+ <!-- [STALE] | src/components/planner/FocusTimer.tsx | 60 | useMemo | `[studyMaterials]` | ✅ Array Present | -->
- | src/components/planner/FocusTimer.tsx | 137 | useEffect | `[isRunning, timeLeft]` | ✅ Array Present |
+ <!-- [STALE] | src/components/planner/FocusTimer.tsx | 137 | useEffect | `[isRunning, timeLeft]` | ✅ Array Present | -->
- | src/components/planner/FocusTimer.tsx | 155 | useEffect | `[timeLeft, isRunning]` | ✅ Array Present |
+ <!-- [STALE] | src/components/planner/FocusTimer.tsx | 155 | useEffect | `[timeLeft, isRunning]` | ✅ Array Present | -->
- | src/components/planner/ScheduleView.tsx | 21 | useMemo | `[studyMaterials]` | ✅ Array Present |
+ <!-- [STALE] | src/components/planner/ScheduleView.tsx | 21 | useMemo | `[studyMaterials]` | ✅ Array Present | -->
- | src/components/planner/StudyLibrary.tsx | 36 | useMemo | `[studyMaterials]` | ✅ Array Present |
+ <!-- [STALE] | src/components/planner/StudyLibrary.tsx | 36 | useMemo | `[studyMaterials]` | ✅ Array Present | -->
- | src/components/planner/StudyLibrary.tsx | 39 | useMemo | `[studyMaterials, searchTerm, filterSubject]` | ✅ Array Present |
+ <!-- [STALE] | src/components/planner/StudyLibrary.tsx | 39 | useMemo | `[studyMaterials, searchTerm, filterSubject]` | ✅ Array Present | -->
- | src/components/settings/StudentProfileForm.tsx | 47 | useEffect | `[user, toast]` | ✅ Array Present |
+ <!-- [STALE] | src/components/settings/StudentProfileForm.tsx | 47 | useEffect | `[user, toast]` | ✅ Array Present | -->
- | src/components/settings/TeacherProfileForm.tsx | 41 | useEffect | `[user, toast]` | ✅ Array Present |
+ <!-- [STALE] | src/components/settings/TeacherProfileForm.tsx | 41 | useEffect | `[user, toast]` | ✅ Array Present | -->
```

### reports\I18N_READINESS_REPORT.md
```diff
- ### `src/app/api/intelligence/student/route.ts`
+ <!-- [STALE] ### `src/app/api/intelligence/student/route.ts` -->
- ### `src/app/api/intelligence/student/route.ts`
+ <!-- [STALE] ### `src/app/api/intelligence/student/route.ts` -->
- ### `src/app/api/teacher/students/route.ts`
+ <!-- [STALE] ### `src/app/api/teacher/students/route.ts` -->
- ### `src/app/api/teacher/students/route.ts`
+ <!-- [STALE] ### `src/app/api/teacher/students/route.ts` -->
- ### `src/app/test-accessibility/page.tsx`
+ ### `src\app\admin\dashboard\page.tsx` (Proposed)
- ### `src/app/test-charts/page.tsx`
+ ### `src\app\admin\dashboard\page.tsx` (Proposed)
- ### `src/components/app/audio-conversation.tsx`
+ <!-- [STALE] ### `src/components/app/audio-conversation.tsx` -->
- ### `src/components/app/header.tsx`
+ <!-- [STALE] ### `src/components/app/header.tsx` -->
- ### `src/components/app/sidebar-nav.tsx`
+ <!-- [STALE] ### `src/components/app/sidebar-nav.tsx` -->
- ### `src/components/app/teacher-sidebar-nav.tsx`
+ <!-- [STALE] ### `src/components/app/teacher-sidebar-nav.tsx` -->
- ### `src/components/planner/AddStudyMaterial.tsx`
+ <!-- [STALE] ### `src/components/planner/AddStudyMaterial.tsx` -->
- ### `src/components/planner/FocusTimer.tsx`
+ <!-- [STALE] ### `src/components/planner/FocusTimer.tsx` -->
- ### `src/components/planner/ScheduleView.tsx`
+ <!-- [STALE] ### `src/components/planner/ScheduleView.tsx` -->
- ### `src/components/planner/StudyLibrary.tsx`
+ <!-- [STALE] ### `src/components/planner/StudyLibrary.tsx` -->
- ### `src/components/profile/StudentProfile.tsx`
+ <!-- [STALE] ### `src/components/profile/StudentProfile.tsx` -->
- ### `src/components/profile/TeacherProfile.tsx`
+ <!-- [STALE] ### `src/components/profile/TeacherProfile.tsx` -->
- ### `src/components/settings/StudentProfileForm.tsx`
+ <!-- [STALE] ### `src/components/settings/StudentProfileForm.tsx` -->
- ### `src/components/settings/TeacherProfileForm.tsx`
+ <!-- [STALE] ### `src/components/settings/TeacherProfileForm.tsx` -->
- ### `src/components/ui/accordion.tsx`
+ <!-- [STALE] ### `src/components/ui/accordion.tsx` -->
- ### `src/components/ui/alert-dialog.tsx`
+ <!-- [STALE] ### `src/components/ui/alert-dialog.tsx` -->
- ### `src/components/ui/alert.tsx`
+ <!-- [STALE] ### `src/components/ui/alert.tsx` -->
- ### `src/components/ui/avatar.tsx`
+ <!-- [STALE] ### `src/components/ui/avatar.tsx` -->
- ### `src/components/ui/badge.tsx`
+ <!-- [STALE] ### `src/components/ui/badge.tsx` -->
- ### `src/components/ui/carousel.tsx`
+ <!-- [STALE] ### `src/components/ui/carousel.tsx` -->
- ### `src/components/ui/chart.tsx`
+ <!-- [STALE] ### `src/components/ui/chart.tsx` -->
- ### `src/components/ui/checkbox.tsx`
+ <!-- [STALE] ### `src/components/ui/checkbox.tsx` -->
- ### `src/components/ui/dialog.tsx`
+ <!-- [STALE] ### `src/components/ui/dialog.tsx` -->
- ### `src/components/ui/dropdown-menu.tsx`
+ <!-- [STALE] ### `src/components/ui/dropdown-menu.tsx` -->
- ### `src/components/ui/form.tsx`
+ <!-- [STALE] ### `src/components/ui/form.tsx` -->
- ### `src/components/ui/label.tsx`
+ <!-- [STALE] ### `src/components/ui/label.tsx` -->
- ### `src/components/ui/menubar.tsx`
+ <!-- [STALE] ### `src/components/ui/menubar.tsx` -->
- ### `src/components/ui/popover.tsx`
+ <!-- [STALE] ### `src/components/ui/popover.tsx` -->
- ### `src/components/ui/progress.tsx`
+ <!-- [STALE] ### `src/components/ui/progress.tsx` -->
- ### `src/components/ui/radio-group.tsx`
+ <!-- [STALE] ### `src/components/ui/radio-group.tsx` -->
- ### `src/components/ui/scroll-area.tsx`
+ <!-- [STALE] ### `src/components/ui/scroll-area.tsx` -->
- ### `src/components/ui/select.tsx`
+ <!-- [STALE] ### `src/components/ui/select.tsx` -->
- ### `src/components/ui/separator.tsx`
+ <!-- [STALE] ### `src/components/ui/separator.tsx` -->
- ### `src/components/ui/sheet.tsx`
+ <!-- [STALE] ### `src/components/ui/sheet.tsx` -->
- ### `src/components/ui/sidebar.tsx`
+ <!-- [STALE] ### `src/components/ui/sidebar.tsx` -->
- ### `src/components/ui/slider.tsx`
+ <!-- [STALE] ### `src/components/ui/slider.tsx` -->
- ### `src/components/ui/switch.tsx`
+ <!-- [STALE] ### `src/components/ui/switch.tsx` -->
- ### `src/components/ui/table.tsx`
+ <!-- [STALE] ### `src/components/ui/table.tsx` -->
- ### `src/components/ui/tabs.tsx`
+ <!-- [STALE] ### `src/components/ui/tabs.tsx` -->
- ### `src/components/ui/toast.tsx`
+ <!-- [STALE] ### `src/components/ui/toast.tsx` -->
- ### `src/components/ui/toaster.tsx`
+ <!-- [STALE] ### `src/components/ui/toaster.tsx` -->
- ### `src/components/ui/tooltip.tsx`
+ <!-- [STALE] ### `src/components/ui/tooltip.tsx` -->
```

### reports\intervention-quality-report.md
```diff
- This report evaluates the quality, specificity, and actionability of the teacher intervention suggestions generated by the ADK Decision Engine (`src/ai/adk/decision-engine.ts`). The assessment is based on a simulation of the decision logic using various student risk profiles.
+ <!-- [STALE] This report evaluates the quality, specificity, and actionability of the teacher intervention suggestions generated by the ADK Decision Engine (`src/ai/adk/decision-engine.ts`). The assessment is based on a simulation of the decision logic using various student risk profiles. -->
```

### reports\INTERVENTION_QUALITY_REPORT.md
```diff
- The current teacher intervention system relies on deterministic, rule-based logic (`makeInterventionDecision` in `src/ai/adk/decision-engine.ts`) that outputs static, pre-defined suggestion strings. While functional for basic flagging, it lacks the specificity and context-awareness expected of an "AI-generated" system. This report evaluates the current quality and proposes a generative AI integration.
+ <!-- [STALE] The current teacher intervention system relies on deterministic, rule-based logic (`makeInterventionDecision` in `src/ai/adk/decision-engine.ts`) that outputs static, pre-defined suggestion strings. While functional for basic flagging, it lacks the specificity and context-awareness expected of an "AI-generated" system. This report evaluates the current quality and proposes a generative AI integration. -->
```

### reports\LOADING_STATE_AUDIT.md
```diff
- - `src/components/profile/StudentProfile.tsx`
+ <!-- [STALE] - `src/components/profile/StudentProfile.tsx` -->
- - `src/components/profile/TeacherProfile.tsx`
+ <!-- [STALE] - `src/components/profile/TeacherProfile.tsx` -->
- - The `Skeleton` component (`src/components/ui/skeleton.tsx`) exists and is used in a few places.
+ <!-- [STALE] - The `Skeleton` component (`src/components/ui/skeleton.tsx`) exists and is used in a few places. -->
- 1.  **Global Loading:** Create `src/app/loading.tsx` with a generic app shell skeleton.
+ <!-- [STALE] 1.  **Global Loading:** Create `src/app/loading.tsx` with a generic app shell skeleton. -->
```

### reports\microservice-migration-readiness-report.md
```diff
- This report assesses the readiness of the current ML inference layer to migrate from a subprocess-based architecture to a FastAPI microservice. The assessment is based on an analysis of `src/ml/inference/api.py` (FastAPI implementation) and `src/ml/inference/ml-bridge.ts` (Node.js client).
+ This report assesses the readiness of the current ML inference layer to migrate from a subprocess-based architecture to a FastAPI microservice. The assessment is based on an analysis of `src\ml\serving\api.py` (FastAPI implementation) and `src/ml/inference/ml-bridge.ts` (Node.js client). (Proposed)
- This report assesses the readiness of the current ML inference layer to migrate from a subprocess-based architecture to a FastAPI microservice. The assessment is based on an analysis of `src/ml/inference/api.py` (FastAPI implementation) and `src/ml/inference/ml-bridge.ts` (Node.js client).
+ <!-- [STALE] This report assesses the readiness of the current ML inference layer to migrate from a subprocess-based architecture to a FastAPI microservice. The assessment is based on an analysis of `src/ml/inference/api.py` (FastAPI implementation) and `src/ml/inference/ml-bridge.ts` (Node.js client). -->
- ### 2.1 API Implementation (`src/ml/inference/api.py`)
+ ### 2.1 API Implementation (`src\ml\serving\api.py`) (Proposed)
- ### 2.2 Client Integration (`src/ml/inference/ml-bridge.ts`)
+ <!-- [STALE] ### 2.2 Client Integration (`src/ml/inference/ml-bridge.ts`) -->
- *   Create a `Dockerfile` in `src/ml/inference/` that installs dependencies and runs the Uvicorn server.
+ <!-- [STALE] *   Create a `Dockerfile` in `src/ml/inference/` that installs dependencies and runs the Uvicorn server. -->
```

### reports\MINDFUL_MENTOR_ROADMAP.md
```diff
- - `src/ai/flows/mindful-mentor.ts`: Genkit flow definition (implied).
+ <!-- [STALE] - `src/ai/flows/mindful-mentor.ts`: Genkit flow definition (implied). -->
```

### reports\ML_MICROSERVICE_MIGRATION_READINESS.md
```diff
- - **Gap**: Need to define Pydantic models matching `MasteryPredictionInput` and `MasteryPredictionOutput` types in `src/ml/inference/types.ts`.
+ <!-- [STALE] - **Gap**: Need to define Pydantic models matching `MasteryPredictionInput` and `MasteryPredictionOutput` types in `src/ml/inference/types.ts`. -->
```

### reports\ML_MODEL_DEPLOYMENT_MATURITY.md
```diff
- - Single file: `src/ml/models/mastery_model.pkl`.
+ <!-- [STALE] - Single file: `src/ml/models/mastery_model.pkl`. -->
- - Rollback involves manually replacing the `.pkl` file and restarting the Node.js server (to respawn the python process).
+ <!-- [STALE] - Rollback involves manually replacing the `.pkl` file and restarting the Node.js server (to respawn the python process). -->
- -   Modify `ml-bridge.ts` to spawn *two* python processes (e.g., "Primary" and "Candidate").
+ <!-- [STALE] -   Modify `ml-bridge.ts` to spawn *two* python processes (e.g., "Primary" and "Candidate"). -->
```

### reports\ML_PERFORMANCE_REGRESSION_REPORT.md
```diff
- The model was evaluated on the holdout test set (`src/ml/training/test_set.csv`).
+ <!-- [STALE] The model was evaluated on the holdout test set (`src/ml/training/test_set.csv`). -->
```

### reports\MOCK_DATA_CONSISTENCY_REPORT.md
```diff
- This report analyzes the structural consistency of mock data generation and storage mechanisms within the Student Intelligence Platform, specifically comparing the loose JSON storage of `src/lib/mock-db.ts` and the synthetic data generation in `src/ml/training/generate_data.py` against the strict TypeScript interfaces defined in `src/data/docsData.ts` and `src/types/intelligence.ts`.
+ <!-- [STALE] This report analyzes the structural consistency of mock data generation and storage mechanisms within the Student Intelligence Platform, specifically comparing the loose JSON storage of `src/lib/mock-db.ts` and the synthetic data generation in `src/ml/training/generate_data.py` against the strict TypeScript interfaces defined in `src/data/docsData.ts` and `src/types/intelligence.ts`. -->
- - `src/ml/training/generate_data.py`: Synthetic data generator for ML training.
+ <!-- [STALE] - `src/ml/training/generate_data.py`: Synthetic data generator for ML training. -->
- - **Evidence**: No `Quiz` interface validation found in `mock-db.ts` or `src/ai/flows/adaptive-quiz-engine.ts` during load.
+ <!-- [STALE] - **Evidence**: No `Quiz` interface validation found in `mock-db.ts` or `src/ai/flows/adaptive-quiz-engine.ts` during load. -->
- 2.  **Explicit Mapping Layer**: Create a dedicated `MapMLToFrontend` utility function in `src/ml/inference/ml-bridge.ts` to strictly type and convert snake_case ML outputs to camelCase frontend objects.
+ <!-- [STALE] 2.  **Explicit Mapping Layer**: Create a dedicated `MapMLToFrontend` utility function in `src/ml/inference/ml-bridge.ts` to strictly type and convert snake_case ML outputs to camelCase frontend objects. -->
```

### reports\model-deployment-maturity-assessment.md
```diff
- *   **Model Loading:** Hardcoded file paths (`src/ml/models/mastery_model.pkl`).
+ <!-- [STALE] *   **Model Loading:** Hardcoded file paths (`src/ml/models/mastery_model.pkl`). -->
- ### 2.1 Model Versioning (`src/ml/inference/predict_mastery.py`, `src/ml/inference/api.py`)
+ <!-- [STALE] ### 2.1 Model Versioning (`src/ml/inference/predict_mastery.py`, `src/ml/inference/api.py`) -->
- ### 2.1 Model Versioning (`src/ml/inference/predict_mastery.py`, `src/ml/inference/api.py`)
+ ### 2.1 Model Versioning (`src/ml/inference/predict_mastery.py`, `src\ml\serving\api.py`) (Proposed)
```

### reports\MODEL_FRESHNESS_REPORT.md
```diff
- - **Model Artifact:** `src/ml/models/mastery_model.pkl` (1.56 KB)
+ <!-- [STALE] - **Model Artifact:** `src/ml/models/mastery_model.pkl` (1.56 KB) -->
- - **Training Script:** `src/ml/training/train_mastery_model.py`
+ <!-- [STALE] - **Training Script:** `src/ml/training/train_mastery_model.py` -->
- - **Training Data:** `src/ml/training/training_data.csv`
+ <!-- [STALE] - **Training Data:** `src/ml/training/training_data.csv` -->
```

### reports\NOTIFICATION_COPY_REPORT.md
```diff
- | TOAST | `src/components/app/audio-conversation.tsx` | **T:** "Error"<br/>**D:** "Could not process audio. Please try again." | Negative sentiment<br/>ℹ️ Ends with period |
+ <!-- [STALE] | TOAST | `src/components/app/audio-conversation.tsx` | **T:** "Error"<br/>**D:** "Could not process audio. Please try again." | Negative sentiment<br/>ℹ️ Ends with period | -->
- | TOAST | `src/components/app/audio-conversation.tsx` | **T:** "Microphone Error"<br/>**D:** "Could not access the microphone. Please check permissions and try again." | Negative sentiment<br/>⚠️ Long (>60 chars), ℹ️ Ends with period |
+ <!-- [STALE] | TOAST | `src/components/app/audio-conversation.tsx` | **T:** "Microphone Error"<br/>**D:** "Could not access the microphone. Please check permissions and try again." | Negative sentiment<br/>⚠️ Long (>60 chars), ℹ️ Ends with period | -->
- | TOAST | `src/components/planner/AddStudyMaterial.tsx` | **T:** "Not authenticated"<br/>**D:** "Please sign in first" |  |
+ <!-- [STALE] | TOAST | `src/components/planner/AddStudyMaterial.tsx` | **T:** "Not authenticated"<br/>**D:** "Please sign in first" |  | -->
- | TOAST | `src/components/planner/AddStudyMaterial.tsx` | **T:** "Study material added!"<br/>**D:** "Your notes have been saved successfully" | ℹ️ Exclamation used |
+ <!-- [STALE] | TOAST | `src/components/planner/AddStudyMaterial.tsx` | **T:** "Study material added!"<br/>**D:** "Your notes have been saved successfully" | ℹ️ Exclamation used | -->
- | TOAST | `src/components/planner/AddStudyMaterial.tsx` | **T:** "Failed to add material"<br/>**D:** "error.message" | Negative sentiment |
+ <!-- [STALE] | TOAST | `src/components/planner/AddStudyMaterial.tsx` | **T:** "Failed to add material"<br/>**D:** "error.message" | Negative sentiment | -->
- | TOAST | `src/components/planner/AddStudyMaterial.tsx` | **T:** "Converted to brain map!"<br/>**D:** "Your study material is now a node in your brain map" | ℹ️ Exclamation used |
+ <!-- [STALE] | TOAST | `src/components/planner/AddStudyMaterial.tsx` | **T:** "Converted to brain map!"<br/>**D:** "Your study material is now a node in your brain map" | ℹ️ Exclamation used | -->
- | TOAST | `src/components/planner/AddStudyMaterial.tsx` | **T:** "Conversion failed"<br/>**D:** "error.message" |  |
+ <!-- [STALE] | TOAST | `src/components/planner/AddStudyMaterial.tsx` | **T:** "Conversion failed"<br/>**D:** "error.message" |  | -->
- | TOAST | `src/components/planner/FocusTimer.tsx` | **T:** "title"<br/>**D:** "message" |  |
+ <!-- [STALE] | TOAST | `src/components/planner/FocusTimer.tsx` | **T:** "title"<br/>**D:** "message" |  | -->
- | TOAST | `src/components/planner/FocusTimer.tsx` | **T:** "Topic Required"<br/>**D:** "Please select a topic before starting the timer." | ℹ️ Ends with period |
+ <!-- [STALE] | TOAST | `src/components/planner/FocusTimer.tsx` | **T:** "Topic Required"<br/>**D:** "Please select a topic before starting the timer." | ℹ️ Ends with period | -->
- | TOAST | `src/components/settings/StudentProfileForm.tsx` | **T:** "Error"<br/>**D:** "Failed to load profile data." | Negative sentiment<br/>ℹ️ Ends with period, Negative sentiment |
+ <!-- [STALE] | TOAST | `src/components/settings/StudentProfileForm.tsx` | **T:** "Error"<br/>**D:** "Failed to load profile data." | Negative sentiment<br/>ℹ️ Ends with period, Negative sentiment | -->
- | TOAST | `src/components/settings/StudentProfileForm.tsx` | **T:** "Profile updated"<br/>**D:** "Your changes have been saved." | ℹ️ Ends with period |
+ <!-- [STALE] | TOAST | `src/components/settings/StudentProfileForm.tsx` | **T:** "Profile updated"<br/>**D:** "Your changes have been saved." | ℹ️ Ends with period | -->
- | TOAST | `src/components/settings/StudentProfileForm.tsx` | **T:** "Error"<br/>**D:** "Failed to update profile. Please try again." | Negative sentiment<br/>ℹ️ Ends with period, Negative sentiment |
+ <!-- [STALE] | TOAST | `src/components/settings/StudentProfileForm.tsx` | **T:** "Error"<br/>**D:** "Failed to update profile. Please try again." | Negative sentiment<br/>ℹ️ Ends with period, Negative sentiment | -->
- | TOAST | `src/components/settings/TeacherProfileForm.tsx` | **T:** "Error"<br/>**D:** "Failed to load profile data." | Negative sentiment<br/>ℹ️ Ends with period, Negative sentiment |
+ <!-- [STALE] | TOAST | `src/components/settings/TeacherProfileForm.tsx` | **T:** "Error"<br/>**D:** "Failed to load profile data." | Negative sentiment<br/>ℹ️ Ends with period, Negative sentiment | -->
- | TOAST | `src/components/settings/TeacherProfileForm.tsx` | **T:** "Profile updated"<br/>**D:** "Your changes have been saved." | ℹ️ Ends with period |
+ <!-- [STALE] | TOAST | `src/components/settings/TeacherProfileForm.tsx` | **T:** "Profile updated"<br/>**D:** "Your changes have been saved." | ℹ️ Ends with period | -->
- | TOAST | `src/components/settings/TeacherProfileForm.tsx` | **T:** "Error"<br/>**D:** "Failed to update profile. Please try again." | Negative sentiment<br/>ℹ️ Ends with period, Negative sentiment |
+ <!-- [STALE] | TOAST | `src/components/settings/TeacherProfileForm.tsx` | **T:** "Error"<br/>**D:** "Failed to update profile. Please try again." | Negative sentiment<br/>ℹ️ Ends with period, Negative sentiment | -->
```

### reports\privacy-compliance-audit.md
```diff
- An audit of data handling practices across the application (`src/app/api/`, `src/lib/db-helpers.ts`, `src/ml/`) reveals significant privacy compliance gaps, particularly regarding GDPR (Right to Erasure) and COPPA (Age Gating). While the Machine Learning inference pipeline effectively anonymizes data, the core database interactions and API endpoints expose Personally Identifiable Information (PII) through insecure mechanisms (IDOR) and lack essential data lifecycle management features.
+ <!-- [STALE] An audit of data handling practices across the application (`src/app/api/`, `src/lib/db-helpers.ts`, `src/ml/`) reveals significant privacy compliance gaps, particularly regarding GDPR (Right to Erasure) and COPPA (Age Gating). While the Machine Learning inference pipeline effectively anonymizes data, the core database interactions and API endpoints expose Personally Identifiable Information (PII) through insecure mechanisms (IDOR) and lack essential data lifecycle management features. -->
- *   **Mastery ML (`src/ml/inference/`):** **SAFE**. Only aggregate statistics (scores, time, variance) are sent to the Python subprocess. No PII is transmitted.
+ <!-- [STALE] *   **Mastery ML (`src/ml/inference/`):** **SAFE**. Only aggregate statistics (scores, time, variance) are sent to the Python subprocess. No PII is transmitted. -->
- *   **Evidence:** As identified in the Permission Audit, `/api/teacher/students` allows unauthorized access to student PII.
+ <!-- [STALE] *   **Evidence:** As identified in the Permission Audit, `/api/teacher/students` allows unauthorized access to student PII. -->
```

### reports\PRIVACY_COMPLIANCE_REPORT.md
```diff
- **File**: `src/ml/inference/ml-bridge.ts`
+ <!-- [STALE] **File**: `src/ml/inference/ml-bridge.ts` -->
- **File**: `src/ai/flows/adaptive-quiz-engine.ts`, `src/ai/flows/multilingual-cognitive-chatbot.ts`
+ <!-- [STALE] **File**: `src/ai/flows/adaptive-quiz-engine.ts`, `src/ai/flows/multilingual-cognitive-chatbot.ts` -->
- **File**: `src/ai/flows/adaptive-quiz-engine.ts`, `src/ai/flows/multilingual-cognitive-chatbot.ts`
+ <!-- [STALE] **File**: `src/ai/flows/adaptive-quiz-engine.ts`, `src/ai/flows/multilingual-cognitive-chatbot.ts` -->
```

### reports\quiz-difficulty-drift.md
```diff
- The Adaptive Quiz Engine (`src/ai/flows/adaptive-quiz-engine.ts`) relies on a single-pass generation strategy where the desired difficulty is specified in the prompt. There is currently **no verification mechanism** to ensure the generated questions actually match the requested difficulty (Easy, Medium, Hard). This absence of calibration makes the system susceptible to "difficulty drift," where questions may become too easy or too hard over time, or fail to adapt to the student's mastery level effectively.
+ <!-- [STALE] The Adaptive Quiz Engine (`src/ai/flows/adaptive-quiz-engine.ts`) relies on a single-pass generation strategy where the desired difficulty is specified in the prompt. There is currently **no verification mechanism** to ensure the generated questions actually match the requested difficulty (Easy, Medium, Hard). This absence of calibration makes the system susceptible to "difficulty drift," where questions may become too easy or too hard over time, or fail to adapt to the student's mastery level effectively. -->
- 1.  **Code Analysis:** Reviewed `src/ai/flows/adaptive-quiz-engine.ts`.
+ <!-- [STALE] 1.  **Code Analysis:** Reviewed `src/ai/flows/adaptive-quiz-engine.ts`. -->
```

### reports\QUIZ_DIFFICULTY_ALIGNMENT_REPORT.md
```diff
- For more details see https://genkit.dev/docs/plugins/google-genai
+ <!-- [STALE] For more details see https://genkit.dev/docs/plugins/google-genai -->
```

### reports\radix-a11y-violations.md
```diff
- | src/components/app/header.tsx | icon-button-label | Button with size="icon" detected without aria-label. | 61 |
+ <!-- [STALE] | src/components/app/header.tsx | icon-button-label | Button with size="icon" detected without aria-label. | 61 | -->
- | src/components/app/sidebar-nav.tsx | icon-button-label | Button with size="icon" detected without aria-label. | 89 |
+ <!-- [STALE] | src/components/app/sidebar-nav.tsx | icon-button-label | Button with size="icon" detected without aria-label. | 89 | -->
- | src/components/app/teacher-sidebar-nav.tsx | icon-button-label | Button with size="icon" detected without aria-label. | 97 |
+ <!-- [STALE] | src/components/app/teacher-sidebar-nav.tsx | icon-button-label | Button with size="icon" detected without aria-label. | 97 | -->
- | src/components/planner/AddStudyMaterial.tsx | icon-button-label | Button with size="icon" detected without aria-label. | 202 |
+ <!-- [STALE] | src/components/planner/AddStudyMaterial.tsx | icon-button-label | Button with size="icon" detected without aria-label. | 202 | -->
- | src/components/ui/collapsible.tsx | radix-wrapper-forward-ref | Radix primitive wrapper should use forwardRef to maintain accessibility focus management. | - |
+ <!-- [STALE] | src/components/ui/collapsible.tsx | radix-wrapper-forward-ref | Radix primitive wrapper should use forwardRef to maintain accessibility focus management. | - | -->
- | src/components/ui/collapsible.tsx | radix-wrapper-props-spread | Radix primitive wrapper should spread props (e.g. ...props) to ensure ARIA attributes are passed down. | - |
+ <!-- [STALE] | src/components/ui/collapsible.tsx | radix-wrapper-props-spread | Radix primitive wrapper should spread props (e.g. ...props) to ensure ARIA attributes are passed down. | - | -->
- | src/components/ui/sidebar.tsx | icon-button-label | Button with size="icon" detected without aria-label. | 273 |
+ <!-- [STALE] | src/components/ui/sidebar.tsx | icon-button-label | Button with size="icon" detected without aria-label. | 273 | -->
```

### reports\RESPONSIVE_DESIGN_COVERAGE.md
```diff
- ### `src/components/app/audio-conversation.tsx`
+ <!-- [STALE] ### `src/components/app/audio-conversation.tsx` -->
- ### `src/components/app/sidebar-nav.tsx`
+ <!-- [STALE] ### `src/components/app/sidebar-nav.tsx` -->
- ### `src/components/app/teacher-sidebar-nav.tsx`
+ <!-- [STALE] ### `src/components/app/teacher-sidebar-nav.tsx` -->
- ### `src/components/planner/FocusTimer.tsx`
+ <!-- [STALE] ### `src/components/planner/FocusTimer.tsx` -->
- ### `src/components/planner/ScheduleView.tsx`
+ <!-- [STALE] ### `src/components/planner/ScheduleView.tsx` -->
- ### `src/components/planner/StudyLibrary.tsx`
+ <!-- [STALE] ### `src/components/planner/StudyLibrary.tsx` -->
- ### `src/components/profile/StudentProfile.tsx`
+ <!-- [STALE] ### `src/components/profile/StudentProfile.tsx` -->
- ### `src/components/profile/TeacherProfile.tsx`
+ <!-- [STALE] ### `src/components/profile/TeacherProfile.tsx` -->
- ### `src/components/rewards/RewardsSkeleton.tsx`
+ <!-- [STALE] ### `src/components/rewards/RewardsSkeleton.tsx` -->
- ### `src/components/settings/StudentProfileForm.tsx`
+ <!-- [STALE] ### `src/components/settings/StudentProfileForm.tsx` -->
- ### `src/components/settings/TeacherProfileForm.tsx`
+ <!-- [STALE] ### `src/components/settings/TeacherProfileForm.tsx` -->
- ### `src/components/ui/avatar.tsx`
+ <!-- [STALE] ### `src/components/ui/avatar.tsx` -->
- ### `src/components/ui/calendar.tsx`
+ <!-- [STALE] ### `src/components/ui/calendar.tsx` -->
- ### `src/components/ui/carousel.tsx`
+ <!-- [STALE] ### `src/components/ui/carousel.tsx` -->
- ### `src/components/ui/chart.tsx`
+ <!-- [STALE] ### `src/components/ui/chart.tsx` -->
- ### `src/components/ui/dropdown-menu.tsx`
+ <!-- [STALE] ### `src/components/ui/dropdown-menu.tsx` -->
- ### `src/components/ui/menubar.tsx`
+ <!-- [STALE] ### `src/components/ui/menubar.tsx` -->
- ### `src/components/ui/popover.tsx`
+ <!-- [STALE] ### `src/components/ui/popover.tsx` -->
- ### `src/components/ui/radio-group.tsx`
+ <!-- [STALE] ### `src/components/ui/radio-group.tsx` -->
- ### `src/components/ui/scroll-area.tsx`
+ <!-- [STALE] ### `src/components/ui/scroll-area.tsx` -->
- ### `src/components/ui/select.tsx`
+ <!-- [STALE] ### `src/components/ui/select.tsx` -->
- ### `src/components/ui/sidebar.tsx`
+ <!-- [STALE] ### `src/components/ui/sidebar.tsx` -->
- ### `src/components/ui/slider.tsx`
+ <!-- [STALE] ### `src/components/ui/slider.tsx` -->
- ### `src/components/ui/switch.tsx`
+ <!-- [STALE] ### `src/components/ui/switch.tsx` -->
- ### `src/components/ui/table.tsx`
+ <!-- [STALE] ### `src/components/ui/table.tsx` -->
- ### `src/components/ui/tabs.tsx`
+ <!-- [STALE] ### `src/components/ui/tabs.tsx` -->
- ### `src/components/ui/toast.tsx`
+ <!-- [STALE] ### `src/components/ui/toast.tsx` -->
```

### reports\SERVER_ACTION_SECURITY_MATRIX.md
```diff
- | `src/app/actions/student-configuration.ts` | **HIGH** | ❌ | `saveChatbotConfiguration` | Missing explicit authentication check |
+ <!-- [STALE] | `src/app/actions/student-configuration.ts` | **HIGH** | ❌ | `saveChatbotConfiguration` | Missing explicit authentication check | -->
- | `src/app/actions/ai-error.ts` | **HIGH** | ❌ | `generateFriendlyErrorMessage` | Missing explicit authentication check |
+ <!-- [STALE] | `src/app/actions/ai-error.ts` | **HIGH** | ❌ | `generateFriendlyErrorMessage` | Missing explicit authentication check | -->
- | `src/ai/flows/text-to-speech.ts` | **HIGH** | ❌ | `textToSpeech` | Missing explicit authentication check |
+ <!-- [STALE] | `src/ai/flows/text-to-speech.ts` | **HIGH** | ❌ | `textToSpeech` | Missing explicit authentication check | -->
- | `src/ai/flows/syllabus-generator.ts` | **HIGH** | ❌ | `SyllabusOutputSchema, syllabusGenerator` | Missing explicit authentication check |
+ <!-- [STALE] | `src/ai/flows/syllabus-generator.ts` | **HIGH** | ❌ | `SyllabusOutputSchema, syllabusGenerator` | Missing explicit authentication check | -->
- | `src/ai/flows/speech-to-speech.ts` | **HIGH** | ❌ | `speechToSpeech` | Missing explicit authentication check |
+ <!-- [STALE] | `src/ai/flows/speech-to-speech.ts` | **HIGH** | ❌ | `speechToSpeech` | Missing explicit authentication check | -->
- | `src/ai/flows/smart-revision-planner.ts` | **HIGH** | ❌ | `SmartRevisionPlannerOutputSchema, smartRevisionPlanner` | Missing explicit authentication check |
+ <!-- [STALE] | `src/ai/flows/smart-revision-planner.ts` | **HIGH** | ❌ | `SmartRevisionPlannerOutputSchema, smartRevisionPlanner` | Missing explicit authentication check | -->
- | `src/ai/flows/multilingual-cognitive-chatbot.ts` | **HIGH** | ❌ | `ExplainConceptOutputSchema, explainConcept` | Missing explicit authentication check |
+ <!-- [STALE] | `src/ai/flows/multilingual-cognitive-chatbot.ts` | **HIGH** | ❌ | `ExplainConceptOutputSchema, explainConcept` | Missing explicit authentication check | -->
- | `src/ai/flows/mindful-mentor.ts` | **HIGH** | ❌ | `MotivationalCounselingOutputSchema, getMotivationalCounseling` | Missing explicit authentication check |
+ <!-- [STALE] | `src/ai/flows/mindful-mentor.ts` | **HIGH** | ❌ | `MotivationalCounselingOutputSchema, getMotivationalCounseling` | Missing explicit authentication check | -->
- | `src/ai/flows/custom-cognitive-chatbot.ts` | **HIGH** | ❌ | `explainConceptWithCustomization` | Missing explicit authentication check |
+ <!-- [STALE] | `src/ai/flows/custom-cognitive-chatbot.ts` | **HIGH** | ❌ | `explainConceptWithCustomization` | Missing explicit authentication check | -->
- | `src/ai/flows/adaptive-quiz-engine.ts` | **HIGH** | ❌ | `AdaptiveQuizOutputSchema, generateQuiz` | Missing explicit authentication check |
+ <!-- [STALE] | `src/ai/flows/adaptive-quiz-engine.ts` | **HIGH** | ❌ | `AdaptiveQuizOutputSchema, generateQuiz` | Missing explicit authentication check | -->
```

### reports\task30_vulnerability_scan.md
```diff
- File: `src/ml/training/requirements.txt`
+ File: `src\ml\requirements.txt` (Proposed)
- 3.  **Review Python Deps:** Pin python dependencies in `requirements.txt` to specific versions after verifying security.
+ <!-- [STALE] 3.  **Review Python Deps:** Pin python dependencies in `requirements.txt` to specific versions after verifying security. -->
```

### reports\task32_api_audit.md
```diff
- **Scope:** src/app/api/
+ <!-- [STALE] **Scope:** src/app/api/ -->
- *   `/api/student` (Singular) - likely fetches current student.
+ <!-- [STALE] *   `/api/student` (Singular) - likely fetches current student. -->
- *   `/api/teacher/students` (Plural) - fetches list of students.
+ <!-- [STALE] *   `/api/teacher/students` (Plural) - fetches list of students. -->
- *   `/api/users/[userId]` (Plural) - standard REST.
+ <!-- [STALE] *   `/api/users/[userId]` (Plural) - standard REST. -->
- *   `/api/class` vs `/api/classes`. The codebase uses `/api/classes`.
+ <!-- [STALE] *   `/api/class` vs `/api/classes`. The codebase uses `/api/classes`. -->
- *   `/api/class` vs `/api/classes`. The codebase uses `/api/classes`.
+ <!-- [STALE] *   `/api/class` vs `/api/classes`. The codebase uses `/api/classes`. -->
- *   `/api/class` vs `/api/classes`. The codebase uses `/api/classes`.
+ <!-- [STALE] *   `/api/class` vs `/api/classes`. The codebase uses `/api/classes`. -->
- *   **Recommendation:** Standardize on plural nouns for resources (e.g., `/api/students/me` instead of `/api/student`).
+ <!-- [STALE] *   **Recommendation:** Standardize on plural nouns for resources (e.g., `/api/students/me` instead of `/api/student`). -->
- *   **Recommendation:** Standardize on plural nouns for resources (e.g., `/api/students/me` instead of `/api/student`).
+ <!-- [STALE] *   **Recommendation:** Standardize on plural nouns for resources (e.g., `/api/students/me` instead of `/api/student`). -->
- | `/api/classes/create` | POST | 'create' in path | `POST /api/classes` |
+ <!-- [STALE] | `/api/classes/create` | POST | 'create' in path | `POST /api/classes` | -->
- | `/api/classes/create` | POST | 'create' in path | `POST /api/classes` |
+ <!-- [STALE] | `/api/classes/create` | POST | 'create' in path | `POST /api/classes` | -->
- | `/api/classes/join` | POST | 'join' in path | `POST /api/classes/[id]/members` |
+ <!-- [STALE] | `/api/classes/join` | POST | 'join' in path | `POST /api/classes/[id]/members` | -->
- | `/api/classes/join` | POST | 'join' in path | `POST /api/classes/[id]/members` |
+ <!-- [STALE] | `/api/classes/join` | POST | 'join' in path | `POST /api/classes/[id]/members` | -->
- | `/api/classes/leave` | POST | 'leave' in path | `DELETE /api/classes/[id]/members` |
+ <!-- [STALE] | `/api/classes/leave` | POST | 'leave' in path | `DELETE /api/classes/[id]/members` | -->
- | `/api/classes/leave` | POST | 'leave' in path | `DELETE /api/classes/[id]/members` |
+ <!-- [STALE] | `/api/classes/leave` | POST | 'leave' in path | `DELETE /api/classes/[id]/members` | -->
- | `/api/users/create` | POST | 'create' in path | `POST /api/users` |
+ <!-- [STALE] | `/api/users/create` | POST | 'create' in path | `POST /api/users` | -->
- | `/api/users/create` | POST | 'create' in path | `POST /api/users` |
+ <!-- [STALE] | `/api/users/create` | POST | 'create' in path | `POST /api/users` | -->
- | `/api/sankalp/session/start` | POST | 'start' in path | `POST /api/sessions` |
+ <!-- [STALE] | `/api/sankalp/session/start` | POST | 'start' in path | `POST /api/sessions` | -->
- | `/api/sankalp/session/start` | POST | 'start' in path | `POST /api/sessions` |
+ <!-- [STALE] | `/api/sankalp/session/start` | POST | 'start' in path | `POST /api/sessions` | -->
- | `/api/sankalp/session/end` | POST | 'end' in path | `PATCH /api/sessions/[id]` (status=ended) |
+ <!-- [STALE] | `/api/sankalp/session/end` | POST | 'end' in path | `PATCH /api/sessions/[id]` (status=ended) | -->
- | `/api/sankalp/session/end` | POST | 'end' in path | `PATCH /api/sessions/[id]` (status=ended) |
+ <!-- [STALE] | `/api/sankalp/session/end` | POST | 'end' in path | `PATCH /api/sessions/[id]` (status=ended) | -->
- | `/api/quiz/submit` | POST | 'submit' in path | `POST /api/quizzes/[id]/submissions` |
+ <!-- [STALE] | `/api/quiz/submit` | POST | 'submit' in path | `POST /api/quizzes/[id]/submissions` | -->
- | `/api/quiz/submit` | POST | 'submit' in path | `POST /api/quizzes/[id]/submissions` |
+ <!-- [STALE] | `/api/quiz/submit` | POST | 'submit' in path | `POST /api/quizzes/[id]/submissions` | -->
- | `/api/syllabus/save` | POST | 'save' in path | `PUT /api/syllabus/[id]` |
+ <!-- [STALE] | `/api/syllabus/save` | POST | 'save' in path | `PUT /api/syllabus/[id]` | -->
- | `/api/syllabus/save` | POST | 'save' in path | `PUT /api/syllabus/[id]` |
+ <!-- [STALE] | `/api/syllabus/save` | POST | 'save' in path | `PUT /api/syllabus/[id]` | -->
- *   `PUT` is used in `/api/student` and `/api/teacher`, which is good for updates.
+ <!-- [STALE] *   `PUT` is used in `/api/student` and `/api/teacher`, which is good for updates. -->
- *   `PUT` is used in `/api/student` and `/api/teacher`, which is good for updates.
+ <!-- [STALE] *   `PUT` is used in `/api/student` and `/api/teacher`, which is good for updates. -->
```

### reports\task33_hooks_audit.md
```diff
- **File:** `src/components/planner/FocusTimer.tsx`
+ <!-- [STALE] **File:** `src/components/planner/FocusTimer.tsx` -->
```

### reports\task35_strict_mode_audit.md
```diff
- -   **Locations:** `src/components/InteractiveGraph.tsx`, `src/components/FocusTimer.tsx` (window as any), and likely in API types or library integrations.
+ <!-- [STALE] -   **Locations:** `src/components/InteractiveGraph.tsx`, `src/components/FocusTimer.tsx` (window as any), and likely in API types or library integrations. -->
- -   **Locations:** `src/ml/inference/ml-bridge.ts`.
+ <!-- [STALE] -   **Locations:** `src/ml/inference/ml-bridge.ts`. -->
```

### reports\task36_loading_ux_audit.md
```diff
- -   **File:** `src/components/FocusTimer.tsx`
+ <!-- [STALE] -   **File:** `src/components/FocusTimer.tsx` -->
```

### reports\teacher-permission-audit.md
```diff
- A critical security audit of the Teacher Analytics routes (`src/app/(main)/teacher/` and `src/app/api/teacher/`) reveals **severe vulnerabilities** allowing unauthorized access to sensitive student data. The application lacks a global middleware for route protection, and the API endpoints suffer from Insecure Direct Object Reference (IDOR), allowing any user (or unauthenticated attacker) to retrieve class lists and student risk profiles by simply providing a teacher ID.
+ <!-- [STALE] A critical security audit of the Teacher Analytics routes (`src/app/(main)/teacher/` and `src/app/api/teacher/`) reveals **severe vulnerabilities** allowing unauthorized access to sensitive student data. The application lacks a global middleware for route protection, and the API endpoints suffer from Insecure Direct Object Reference (IDOR), allowing any user (or unauthenticated attacker) to retrieve class lists and student risk profiles by simply providing a teacher ID. -->
- A critical security audit of the Teacher Analytics routes (`src/app/(main)/teacher/` and `src/app/api/teacher/`) reveals **severe vulnerabilities** allowing unauthorized access to sensitive student data. The application lacks a global middleware for route protection, and the API endpoints suffer from Insecure Direct Object Reference (IDOR), allowing any user (or unauthenticated attacker) to retrieve class lists and student risk profiles by simply providing a teacher ID.
+ <!-- [STALE] A critical security audit of the Teacher Analytics routes (`src/app/(main)/teacher/` and `src/app/api/teacher/`) reveals **severe vulnerabilities** allowing unauthorized access to sensitive student data. The application lacks a global middleware for route protection, and the API endpoints suffer from Insecure Direct Object Reference (IDOR), allowing any user (or unauthenticated attacker) to retrieve class lists and student risk profiles by simply providing a teacher ID. -->
- 2.  **Code Review:** Manually inspected `src/app/(main)/teacher/page.tsx` and `src/app/api/teacher/students/route.ts`.
+ <!-- [STALE] 2.  **Code Review:** Manually inspected `src/app/(main)/teacher/page.tsx` and `src/app/api/teacher/students/route.ts`. -->
- 2.  **Code Review:** Manually inspected `src/app/(main)/teacher/page.tsx` and `src/app/api/teacher/students/route.ts`.
+ <!-- [STALE] 2.  **Code Review:** Manually inspected `src/app/(main)/teacher/page.tsx` and `src/app/api/teacher/students/route.ts`. -->
- *   **Location:** `src/app/api/teacher/students/route.ts`
+ <!-- [STALE] *   **Location:** `src/app/api/teacher/students/route.ts` -->
- *   **Location:** `src/app/api/teacher/students/route.ts`
+ <!-- [STALE] *   **Location:** `src/app/api/teacher/students/route.ts` -->
- *   **Exploit:** An attacker can request `/api/teacher/students?teacherId=123` and receive full student rosters, grades, and "Dropout Risk" labels without being logged in or being that teacher.
+ <!-- [STALE] *   **Exploit:** An attacker can request `/api/teacher/students?teacherId=123` and receive full student rosters, grades, and "Dropout Risk" labels without being logged in or being that teacher. -->
- 2.  **Secure API:** In `src/app/api/teacher/students/route.ts`, remove the `teacherId` query parameter reliance. Instead:
+ <!-- [STALE] 2.  **Secure API:** In `src/app/api/teacher/students/route.ts`, remove the `teacherId` query parameter reliance. Instead: -->
- 2.  **Secure API:** In `src/app/api/teacher/students/route.ts`, remove the `teacherId` query parameter reliance. Instead:
+ <!-- [STALE] 2.  **Secure API:** In `src/app/api/teacher/students/route.ts`, remove the `teacherId` query parameter reliance. Instead: -->
```

### reports\TEACHER_PERMISSION_BOUNDARY_REPORT.md
```diff
- ### Analysis of `src/app/api/teacher/students/route.ts`
+ <!-- [STALE] ### Analysis of `src/app/api/teacher/students/route.ts` -->
- ### Analysis of `src/app/api/teacher/students/route.ts`
+ <!-- [STALE] ### Analysis of `src/app/api/teacher/students/route.ts` -->
- ### Analysis of `src/app/api/teacher/graph/route.ts`
+ <!-- [STALE] ### Analysis of `src/app/api/teacher/graph/route.ts` -->
- ### Analysis of `src/app/api/teacher/graph/route.ts`
+ <!-- [STALE] ### Analysis of `src/app/api/teacher/graph/route.ts` -->
```

### reports\THEME_CONSISTENCY_REPORT.md
```diff
- | `src/components/ui/chart.tsx` | 55 | `#ccc` |
+ <!-- [STALE] | `src/components/ui/chart.tsx` | 55 | `#ccc` | -->
- | `src/components/ui/chart.tsx` | 55 | `#fff` |
+ <!-- [STALE] | `src/components/ui/chart.tsx` | 55 | `#fff` | -->
- | `src/components/ui/chart.tsx` | 55 | `#ccc` |
+ <!-- [STALE] | `src/components/ui/chart.tsx` | 55 | `#ccc` | -->
- | `src/components/ui/chart.tsx` | 55 | `#ccc` |
+ <!-- [STALE] | `src/components/ui/chart.tsx` | 55 | `#ccc` | -->
- | `src/components/ui/chart.tsx` | 55 | `#fff` |
+ <!-- [STALE] | `src/components/ui/chart.tsx` | 55 | `#fff` | -->
```

### reports\THIRD_PARTY_EMBED_REPORT.md
```diff
- | `src/ai/flows/schema-regression.test.ts` | 83 | `https://example.com/1` |
+ <!-- [STALE] | `src/ai/flows/schema-regression.test.ts` | 83 | `https://example.com/1` | -->
- | `src/ai/flows/schema-regression.test.ts` | 84 | `https://example.com/2` |
+ <!-- [STALE] | `src/ai/flows/schema-regression.test.ts` | 84 | `https://example.com/2` | -->
- | `src/ai/flows/schema-regression.test.ts` | 85 | `https://example.com/3` |
+ <!-- [STALE] | `src/ai/flows/schema-regression.test.ts` | 85 | `https://example.com/3` | -->
- | `src/ai/flows/schema-regression.test.ts` | 86 | `https://example.com/4` |
+ <!-- [STALE] | `src/ai/flows/schema-regression.test.ts` | 86 | `https://example.com/4` | -->
- | `src/ai/flows/schema-regression.test.ts` | 87 | `https://example.com/5` |
+ <!-- [STALE] | `src/ai/flows/schema-regression.test.ts` | 87 | `https://example.com/5` | -->
- | `src/components/planner/AddStudyMaterial.tsx` | 194 | `https://example.com` |
+ <!-- [STALE] | `src/components/planner/AddStudyMaterial.tsx` | 194 | `https://example.com` | -->
```

### reports\TIME_DEPENDENCY_REPORT.md
```diff
- - `src/components/planner/ScheduleView.tsx`: The daily schedule view.
+ <!-- [STALE] - `src/components/planner/ScheduleView.tsx`: The daily schedule view. -->
- - `src/ml/features/student_features.ts`: ML feature extraction logic.
+ <!-- [STALE] - `src/ml/features/student_features.ts`: ML feature extraction logic. -->
- - **Evidence**: `src/ml/features/student_features.ts`: `referenceDate: Date = new Date()`
+ <!-- [STALE] - **Evidence**: `src/ml/features/student_features.ts`: `referenceDate: Date = new Date()` -->
```

### reports\type-safety-audit.md
```diff
- ### `src/ai/flows/custom-cognitive-chatbot.ts`
+ <!-- [STALE] ### `src/ai/flows/custom-cognitive-chatbot.ts` -->
- ### `src/ai/flows/smart-revision-planner.ts`
+ <!-- [STALE] ### `src/ai/flows/smart-revision-planner.ts` -->
- ### `src/ai/flows/speech-to-speech.ts`
+ <!-- [STALE] ### `src/ai/flows/speech-to-speech.ts` -->
- ### `src/ai/flows/text-to-speech.ts`
+ <!-- [STALE] ### `src/ai/flows/text-to-speech.ts` -->
- ### `src/app/actions/ai-error.ts`
+ <!-- [STALE] ### `src/app/actions/ai-error.ts` -->
- ### `src/app/actions/student-configuration.ts`
+ <!-- [STALE] ### `src/app/actions/student-configuration.ts` -->
- ### `src/app/api/activity/log/route.ts`
+ <!-- [STALE] ### `src/app/api/activity/log/route.ts` -->
- ### `src/app/api/activity/log/route.ts`
+ <!-- [STALE] ### `src/app/api/activity/log/route.ts` -->
- ### `src/app/api/intelligence/student/route.ts`
+ <!-- [STALE] ### `src/app/api/intelligence/student/route.ts` -->
- ### `src/app/api/intelligence/student/route.ts`
+ <!-- [STALE] ### `src/app/api/intelligence/student/route.ts` -->
- ### `src/app/api/planner/convert-to-node/route.ts`
+ <!-- [STALE] ### `src/app/api/planner/convert-to-node/route.ts` -->
- ### `src/app/api/planner/convert-to-node/route.ts`
+ <!-- [STALE] ### `src/app/api/planner/convert-to-node/route.ts` -->
- ### `src/app/api/student/onboard/route.ts`
+ <!-- [STALE] ### `src/app/api/student/onboard/route.ts` -->
- ### `src/app/api/student/onboard/route.ts`
+ <!-- [STALE] ### `src/app/api/student/onboard/route.ts` -->
- ### `src/app/api/test/seed/route.ts`
+ <!-- [STALE] ### `src/app/api/test/seed/route.ts` -->
- ### `src/app/api/test/seed/route.ts`
+ <!-- [STALE] ### `src/app/api/test/seed/route.ts` -->
- ### `src/components/planner/AddStudyMaterial.tsx`
+ <!-- [STALE] ### `src/components/planner/AddStudyMaterial.tsx` -->
- ### `src/components/planner/FocusTimer.tsx`
+ <!-- [STALE] ### `src/components/planner/FocusTimer.tsx` -->
- ### `src/lib/middleware/auth.ts`
+ ### `src\lib\auth.ts` (Proposed)
- ### `src/ml/inference/ml-bridge.ts`
+ <!-- [STALE] ### `src/ml/inference/ml-bridge.ts` -->
```

### reports\TYPE_SAFETY_VIOLATION_REPORT.md
```diff
- | src/app/actions/ai-error.ts | 13 | non-null-assertion | Use optional chaining `?.` or type guard. |
+ <!-- [STALE] | src/app/actions/ai-error.ts | 13 | non-null-assertion | Use optional chaining `?.` or type guard. | -->
- | src/app/actions/student-configuration.ts | 23 | any | Replace `any` with specific type or `unknown`. |
+ <!-- [STALE] | src/app/actions/student-configuration.ts | 23 | any | Replace `any` with specific type or `unknown`. | -->
- | src/app/api/activity/log/route.ts | 101 | any | Replace `any` with specific type or `unknown`. |
+ <!-- [STALE] | src/app/api/activity/log/route.ts | 101 | any | Replace `any` with specific type or `unknown`. | -->
- | src/app/api/activity/log/route.ts | 101 | any | Replace `any` with specific type or `unknown`. |
+ <!-- [STALE] | src/app/api/activity/log/route.ts | 101 | any | Replace `any` with specific type or `unknown`. | -->
- | src/app/api/chaos/route.ts | 34 | any | Replace `any` with specific type or `unknown`. |
+ <!-- [STALE] | src/app/api/chaos/route.ts | 34 | any | Replace `any` with specific type or `unknown`. | -->
- | src/app/api/chaos/route.ts | 34 | any | Replace `any` with specific type or `unknown`. |
+ <!-- [STALE] | src/app/api/chaos/route.ts | 34 | any | Replace `any` with specific type or `unknown`. | -->
- | src/app/api/chaos/route.ts | 35 | any | Replace `any` with specific type or `unknown`. |
+ <!-- [STALE] | src/app/api/chaos/route.ts | 35 | any | Replace `any` with specific type or `unknown`. | -->
- | src/app/api/chaos/route.ts | 35 | any | Replace `any` with specific type or `unknown`. |
+ <!-- [STALE] | src/app/api/chaos/route.ts | 35 | any | Replace `any` with specific type or `unknown`. | -->
- | src/app/api/chaos/route.ts | 36 | any | Replace `any` with specific type or `unknown`. |
+ <!-- [STALE] | src/app/api/chaos/route.ts | 36 | any | Replace `any` with specific type or `unknown`. | -->
- | src/app/api/chaos/route.ts | 36 | any | Replace `any` with specific type or `unknown`. |
+ <!-- [STALE] | src/app/api/chaos/route.ts | 36 | any | Replace `any` with specific type or `unknown`. | -->
- | src/app/api/chaos/route.ts | 37 | any | Replace `any` with specific type or `unknown`. |
+ <!-- [STALE] | src/app/api/chaos/route.ts | 37 | any | Replace `any` with specific type or `unknown`. | -->
- | src/app/api/chaos/route.ts | 37 | any | Replace `any` with specific type or `unknown`. |
+ <!-- [STALE] | src/app/api/chaos/route.ts | 37 | any | Replace `any` with specific type or `unknown`. | -->
- | src/app/api/intelligence/student/route.ts | 153 | non-null-assertion | Use optional chaining `?.` or type guard. |
+ <!-- [STALE] | src/app/api/intelligence/student/route.ts | 153 | non-null-assertion | Use optional chaining `?.` or type guard. | -->
- | src/app/api/intelligence/student/route.ts | 153 | non-null-assertion | Use optional chaining `?.` or type guard. |
+ <!-- [STALE] | src/app/api/intelligence/student/route.ts | 153 | non-null-assertion | Use optional chaining `?.` or type guard. | -->
- | src/app/api/intelligence/student/route.ts | 154 | non-null-assertion | Use optional chaining `?.` or type guard. |
+ <!-- [STALE] | src/app/api/intelligence/student/route.ts | 154 | non-null-assertion | Use optional chaining `?.` or type guard. | -->
- | src/app/api/intelligence/student/route.ts | 154 | non-null-assertion | Use optional chaining `?.` or type guard. |
+ <!-- [STALE] | src/app/api/intelligence/student/route.ts | 154 | non-null-assertion | Use optional chaining `?.` or type guard. | -->
- | src/app/api/planner/convert-to-node/route.ts | 26 | any | Replace `any` with specific type or `unknown`. |
+ <!-- [STALE] | src/app/api/planner/convert-to-node/route.ts | 26 | any | Replace `any` with specific type or `unknown`. | -->
- | src/app/api/planner/convert-to-node/route.ts | 26 | any | Replace `any` with specific type or `unknown`. |
+ <!-- [STALE] | src/app/api/planner/convert-to-node/route.ts | 26 | any | Replace `any` with specific type or `unknown`. | -->
- | src/app/api/student/onboard/route.ts | 17 | any | Replace `any` with specific type or `unknown`. |
+ <!-- [STALE] | src/app/api/student/onboard/route.ts | 17 | any | Replace `any` with specific type or `unknown`. | -->
- | src/app/api/student/onboard/route.ts | 17 | any | Replace `any` with specific type or `unknown`. |
+ <!-- [STALE] | src/app/api/student/onboard/route.ts | 17 | any | Replace `any` with specific type or `unknown`. | -->
- | src/app/api/test/seed/route.ts | 51 | any | Replace `any` with specific type or `unknown`. |
+ <!-- [STALE] | src/app/api/test/seed/route.ts | 51 | any | Replace `any` with specific type or `unknown`. | -->
- | src/app/api/test/seed/route.ts | 51 | any | Replace `any` with specific type or `unknown`. |
+ <!-- [STALE] | src/app/api/test/seed/route.ts | 51 | any | Replace `any` with specific type or `unknown`. | -->
- | src/components/app/sidebar-nav.tsx | 69 | non-null-assertion | Use optional chaining `?.` or type guard. |
+ <!-- [STALE] | src/components/app/sidebar-nav.tsx | 69 | non-null-assertion | Use optional chaining `?.` or type guard. | -->
- | src/components/planner/AddStudyMaterial.tsx | 86 | any | Replace `any` with specific type or `unknown`. |
+ <!-- [STALE] | src/components/planner/AddStudyMaterial.tsx | 86 | any | Replace `any` with specific type or `unknown`. | -->
- | src/components/planner/AddStudyMaterial.tsx | 123 | any | Replace `any` with specific type or `unknown`. |
+ <!-- [STALE] | src/components/planner/AddStudyMaterial.tsx | 123 | any | Replace `any` with specific type or `unknown`. | -->
- | src/components/planner/FocusTimer.tsx | 71 | any | Replace `any` with specific type or `unknown`. |
+ <!-- [STALE] | src/components/planner/FocusTimer.tsx | 71 | any | Replace `any` with specific type or `unknown`. | -->
```

### reports\TYPOGRAPHY_DRIFT_REPORT.md
```diff
- | src/app/test-accessibility/page.tsx | 10 | Heading <h1> uses inconsistent size: text-2xl. | Expected one of: text-4xl, text-5xl, text-6xl, font-headline |
+ | src\app\admin\dashboard\page.tsx | 10 | Heading <h1> uses inconsistent size: text-2xl. | Expected one of: text-4xl, text-5xl, text-6xl, font-headline | (Proposed)
- | src/app/test-accessibility/page.tsx | 13 | Heading <h2> uses inconsistent size: text-xl. | Expected one of: text-3xl, text-4xl, font-headline |
+ | src\app\admin\dashboard\page.tsx | 13 | Heading <h2> uses inconsistent size: text-xl. | Expected one of: text-3xl, text-4xl, font-headline | (Proposed)
- | src/app/test-accessibility/page.tsx | 25 | Heading <h2> uses inconsistent size: text-xl. | Expected one of: text-3xl, text-4xl, font-headline |
+ | src\app\admin\dashboard\page.tsx | 25 | Heading <h2> uses inconsistent size: text-xl. | Expected one of: text-3xl, text-4xl, font-headline | (Proposed)
- | src/app/test-accessibility/page.tsx | 39 | Heading <h2> uses inconsistent size: text-xl. | Expected one of: text-3xl, text-4xl, font-headline |
+ | src\app\admin\dashboard\page.tsx | 39 | Heading <h2> uses inconsistent size: text-xl. | Expected one of: text-3xl, text-4xl, font-headline | (Proposed)
- | src/app/test-accessibility/page.tsx | 51 | Heading <h2> uses inconsistent size: text-xl. | Expected one of: text-3xl, text-4xl, font-headline |
+ | src\app\admin\dashboard\page.tsx | 51 | Heading <h2> uses inconsistent size: text-xl. | Expected one of: text-3xl, text-4xl, font-headline | (Proposed)
- | src/app/test-charts/page.tsx | 30 | Heading <h1> uses inconsistent size: text-2xl. | Expected one of: text-4xl, text-5xl, text-6xl, font-headline |
+ | src\app\admin\dashboard\page.tsx | 30 | Heading <h1> uses inconsistent size: text-2xl. | Expected one of: text-4xl, text-5xl, text-6xl, font-headline | (Proposed)
- | src/components/app/header.tsx | 54 | Heading <h1> uses inconsistent size: text-xl. | Expected one of: text-4xl, text-5xl, text-6xl, font-headline |
+ <!-- [STALE] | src/components/app/header.tsx | 54 | Heading <h1> uses inconsistent size: text-xl. | Expected one of: text-4xl, text-5xl, text-6xl, font-headline | -->
- | src/components/app/sidebar-nav.tsx | 54 | Heading <h2> uses inconsistent size: text-xl. | Expected one of: text-3xl, text-4xl, font-headline |
+ <!-- [STALE] | src/components/app/sidebar-nav.tsx | 54 | Heading <h2> uses inconsistent size: text-xl. | Expected one of: text-3xl, text-4xl, font-headline | -->
- | src/components/app/sidebar-nav.tsx | 84 | Arbitrary text size used: text-[10px] | Consider text-xs or text-sm |
+ <!-- [STALE] | src/components/app/sidebar-nav.tsx | 84 | Arbitrary text size used: text-[10px] | Consider text-xs or text-sm | -->
- | src/components/app/teacher-sidebar-nav.tsx | 46 | Heading <h2> uses inconsistent size: text-xl. | Expected one of: text-3xl, text-4xl, font-headline |
+ <!-- [STALE] | src/components/app/teacher-sidebar-nav.tsx | 46 | Heading <h2> uses inconsistent size: text-xl. | Expected one of: text-3xl, text-4xl, font-headline | -->
- | src/components/app/teacher-sidebar-nav.tsx | 47 | Arbitrary text size used: text-[10px] | Consider text-xs or text-sm |
+ <!-- [STALE] | src/components/app/teacher-sidebar-nav.tsx | 47 | Arbitrary text size used: text-[10px] | Consider text-xs or text-sm | -->
- | src/components/app/teacher-sidebar-nav.tsx | 66 | Arbitrary text size used: text-[10px] | Consider text-xs or text-sm |
+ <!-- [STALE] | src/components/app/teacher-sidebar-nav.tsx | 66 | Arbitrary text size used: text-[10px] | Consider text-xs or text-sm | -->
- | src/components/app/teacher-sidebar-nav.tsx | 92 | Arbitrary text size used: text-[10px] | Consider text-xs or text-sm |
+ <!-- [STALE] | src/components/app/teacher-sidebar-nav.tsx | 92 | Arbitrary text size used: text-[10px] | Consider text-xs or text-sm | -->
- | src/components/planner/StudyLibrary.tsx | 104 | Heading <h3> uses inconsistent size: text-lg. | Expected one of: text-2xl, text-3xl, font-headline |
+ <!-- [STALE] | src/components/planner/StudyLibrary.tsx | 104 | Heading <h3> uses inconsistent size: text-lg. | Expected one of: text-2xl, text-3xl, font-headline | -->
- | src/components/planner/StudyLibrary.tsx | 201 | Heading <h4> uses inconsistent size: text-sm. | Expected one of: text-xl, text-2xl, font-headline |
+ <!-- [STALE] | src/components/planner/StudyLibrary.tsx | 201 | Heading <h4> uses inconsistent size: text-sm. | Expected one of: text-xl, text-2xl, font-headline | -->
- | src/components/planner/StudyLibrary.tsx | 229 | Heading <h4> uses inconsistent size: text-sm. | Expected one of: text-xl, text-2xl, font-headline |
+ <!-- [STALE] | src/components/planner/StudyLibrary.tsx | 229 | Heading <h4> uses inconsistent size: text-sm. | Expected one of: text-xl, text-2xl, font-headline | -->
- | src/components/profile/StudentProfile.tsx | 47 | Heading <h2> uses inconsistent size: text-2xl. | Expected one of: text-3xl, text-4xl, font-headline |
+ <!-- [STALE] | src/components/profile/StudentProfile.tsx | 47 | Heading <h2> uses inconsistent size: text-2xl. | Expected one of: text-3xl, text-4xl, font-headline | -->
- | src/components/profile/StudentProfile.tsx | 90 | Heading <h1> uses inconsistent size: text-3xl. | Expected one of: text-4xl, text-5xl, text-6xl, font-headline |
+ <!-- [STALE] | src/components/profile/StudentProfile.tsx | 90 | Heading <h1> uses inconsistent size: text-3xl. | Expected one of: text-4xl, text-5xl, text-6xl, font-headline | -->
- | src/components/profile/StudentProfile.tsx | 117 | Heading <h3> uses inconsistent size: text-lg. | Expected one of: text-2xl, text-3xl, font-headline |
+ <!-- [STALE] | src/components/profile/StudentProfile.tsx | 117 | Heading <h3> uses inconsistent size: text-lg. | Expected one of: text-2xl, text-3xl, font-headline | -->
- | src/components/profile/TeacherProfile.tsx | 45 | Heading <h2> uses inconsistent size: text-2xl. | Expected one of: text-3xl, text-4xl, font-headline |
+ <!-- [STALE] | src/components/profile/TeacherProfile.tsx | 45 | Heading <h2> uses inconsistent size: text-2xl. | Expected one of: text-3xl, text-4xl, font-headline | -->
- | src/components/profile/TeacherProfile.tsx | 75 | Heading <h1> uses inconsistent size: text-3xl. | Expected one of: text-4xl, text-5xl, text-6xl, font-headline |
+ <!-- [STALE] | src/components/profile/TeacherProfile.tsx | 75 | Heading <h1> uses inconsistent size: text-3xl. | Expected one of: text-4xl, text-5xl, text-6xl, font-headline | -->
- | src/components/profile/TeacherProfile.tsx | 104 | Heading <h3> uses inconsistent size: text-lg. | Expected one of: text-2xl, text-3xl, font-headline |
+ <!-- [STALE] | src/components/profile/TeacherProfile.tsx | 104 | Heading <h3> uses inconsistent size: text-lg. | Expected one of: text-2xl, text-3xl, font-headline | -->
- | src/components/profile/TeacherProfile.tsx | 125 | Heading <h4> uses inconsistent size: text-sm. | Expected one of: text-xl, text-2xl, font-headline |
+ <!-- [STALE] | src/components/profile/TeacherProfile.tsx | 125 | Heading <h4> uses inconsistent size: text-sm. | Expected one of: text-xl, text-2xl, font-headline | -->
- | src/components/profile/TeacherProfile.tsx | 139 | Heading <h4> uses inconsistent size: text-sm. | Expected one of: text-xl, text-2xl, font-headline |
+ <!-- [STALE] | src/components/profile/TeacherProfile.tsx | 139 | Heading <h4> uses inconsistent size: text-sm. | Expected one of: text-xl, text-2xl, font-headline | -->
- | src/components/ui/calendar.tsx | 37 | Arbitrary text size used: text-[0.8rem] | Use standard token |
+ <!-- [STALE] | src/components/ui/calendar.tsx | 37 | Arbitrary text size used: text-[0.8rem] | Use standard token | -->
```

### src\ml\ML_DRIFT_REPORT.md
```diff
- **Scope:** `src/ml/features/student_features.ts` (TS Feature Extraction) vs `src/ml/training/generate_data.py` (Python Training Data Generation)
+ <!-- [STALE] **Scope:** `src/ml/features/student_features.ts` (TS Feature Extraction) vs `src/ml/training/generate_data.py` (Python Training Data Generation) -->
- **Scope:** `src/ml/features/student_features.ts` (TS Feature Extraction) vs `src/ml/training/generate_data.py` (Python Training Data Generation)
+ <!-- [STALE] **Scope:** `src/ml/features/student_features.ts` (TS Feature Extraction) vs `src/ml/training/generate_data.py` (Python Training Data Generation) -->
- - **Source:** `src/ml/features/student_features.ts:119`
+ <!-- [STALE] - **Source:** `src/ml/features/student_features.ts:119` -->
- - **Source:** `src/ml/features/student_features.ts:133`
+ <!-- [STALE] - **Source:** `src/ml/features/student_features.ts:133` -->
- - **Source:** `src/ml/features/student_features.ts` vs `src/ai/flows/smart-revision-planner.ts`
+ <!-- [STALE] - **Source:** `src/ml/features/student_features.ts` vs `src/ai/flows/smart-revision-planner.ts` -->
- - **Source:** `src/ml/features/student_features.ts` vs `src/ai/flows/smart-revision-planner.ts`
+ <!-- [STALE] - **Source:** `src/ml/features/student_features.ts` vs `src/ai/flows/smart-revision-planner.ts` -->
```


## 3. Coverage Gaps
The following features or endpoints exist in the code but are NOT mentioned in any documentation.

### Undocumented API Endpoints

## 4. Next Steps
1. Review the "Update Proposals" above.
2. Manually verify ambiguous suggestions.
3. Apply changes to `.md` files.
4. Run this script again to verify resolution.
