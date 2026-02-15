# API Endpoint Naming & REST Convention Compliance Audit

**Date:** 2024-05-23
**Scope:** src/app/api/

## Summary
The API follows a generally consistent structure but exhibits deviations from strict RESTful conventions, particularly in resource naming (singular vs plural) and action-based endpoints.

## Audit Findings

### Naming Inconsistencies
*   **Singular vs Plural:**
    *   `/api/student` (Singular) - likely fetches current student.
    *   `/api/teacher/students` (Plural) - fetches list of students.
    *   `/api/users/[userId]` (Plural) - standard REST.
    *   `/api/class` vs `/api/classes`. The codebase uses `/api/classes`.
    *   **Recommendation:** Standardize on plural nouns for resources (e.g., `/api/students/me` instead of `/api/student`).

### Action-Based Endpoints (RPC-style)
Several endpoints use action verbs in the URL path, which violates REST principles (resources should be nouns, HTTP methods should be verbs).

| Endpoint | Current Method | Issue | Recommended REST Pattern |
| :--- | :--- | :--- | :--- |
| `/api/classes/create` | POST | 'create' in path | `POST /api/classes` |
| `/api/classes/join` | POST | 'join' in path | `POST /api/classes/[id]/members` |
| `/api/classes/leave` | POST | 'leave' in path | `DELETE /api/classes/[id]/members` |
| `/api/users/create` | POST | 'create' in path | `POST /api/users` |
| `/api/sankalp/session/start` | POST | 'start' in path | `POST /api/sessions` |
| `/api/sankalp/session/end` | POST | 'end' in path | `PATCH /api/sessions/[id]` (status=ended) |
| `/api/quiz/submit` | POST | 'submit' in path | `POST /api/quizzes/[id]/submissions` |
| `/api/syllabus/save` | POST | 'save' in path | `PUT /api/syllabus/[id]` |

### HTTP Method Usage
*   `GET` and `POST` are used correctly for the most part.
*   `PUT` is used in `/api/student` and `/api/teacher`, which is good for updates.
*   `DELETE` is notably absent; deletions seem to be handled via `POST` to action endpoints (e.g., `leave`).

## Recommendations
1.  **Refactor Action Routes:** Move away from RPC-style URLs (`/create`, `/submit`) to resource-oriented URLs.
2.  **Standardize Resource Names:** Use plural nouns for all collections (e.g., `/students`, `/teachers`, `/classes`).
3.  **Implement DELETE:** Use the `DELETE` verb for removing resources or associations.
