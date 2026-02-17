# API Endpoint Naming Audit

## Executive Summary
**Date:** 2024-05-23
**Scope:** `src/app/api`

## Findings
The API endpoints exhibit inconsistencies in naming conventions (singular vs plural resources) and use of action verbs in paths instead of standard HTTP methods.

### 1. Singular vs Plural Resources
- **Inconsistent:** Both `teacher` and `teachers` are used as top-level resources.
    - `src/app/api/teacher` (GET?)
    - `src/app/api/teachers/create` (POST?)
- **Inconsistent:** Both `student` and `students` are used.
    - `src/app/api/student`
    - `src/app/api/students/create`
- **Recommendation:** Standardize on plural nouns for resource collections (e.g., `/api/teachers`, `/api/students`). Use `/api/users` consistently.

### 2. Action Verbs in Paths
- **Violation:** Endpoints use verbs in the URL path instead of leveraging HTTP methods (GET, POST, PUT, DELETE).
    - `src/app/api/classes/create` -> Should be `POST /api/classes`
    - `src/app/api/classes/join` -> Should be `POST /api/classes/:id/join` or `POST /api/enrollments`
    - `src/app/api/classes/leave` -> Should be `DELETE /api/classes/:id/join` or `DELETE /api/enrollments/:id`
    - `src/app/api/users/create` -> Should be `POST /api/users`
    - `src/app/api/teachers/create` -> Should be `POST /api/teachers`
    - `src/app/api/students/create` -> Should be `POST /api/students`
    - `src/app/api/syllabus/save` -> Should be `POST /api/syllabi` or `PUT /api/syllabi/:id`
    - `src/app/api/quiz/submit` -> Should be `POST /api/quizzes/:id/submissions`

### 3. Nesting & Clarity
- `src/app/api/sankalp/session/start` and `end`: Specific to "Sankalp" domain. Consider if `sankalp` is needed in the path if it's the app name. Maybe `/api/sessions`.
- `src/app/api/planner/convert-to-node`: Specific action. Consider `POST /api/planner/nodes`.

## Proposed Standardization
| Current Endpoint | Proposed Endpoint | Method |
| :--- | :--- | :--- |
| `/api/teacher` | `/api/teachers/me` or `/api/teachers/:id` | GET |
| `/api/teachers/create` | `/api/teachers` | POST |
| `/api/student` | `/api/students/me` or `/api/students/:id` | GET |
| `/api/students/create` | `/api/students` | POST |
| `/api/classes/create` | `/api/classes` | POST |
| `/api/users/create` | `/api/users` | POST |
| `/api/syllabus/save` | `/api/syllabi` | POST |
| `/api/quiz/submit` | `/api/quizzes/:id/submit` | POST |

## Next Steps
1.  **Refactor:** Rename directories to match plural convention.
2.  **Update Clients:** Update frontend API calls to use new endpoints and methods.
3.  **Documentation:** Document the API using OpenAPI/Swagger.
