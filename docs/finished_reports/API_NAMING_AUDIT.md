# API Endpoint Naming & REST Convention Audit

## Executive Summary
Audit of 30 API endpoints for adherence to RESTful naming conventions.

## Findings

Found 26 potential violations:

- **/api/activity/log**: Singular resource name `log`. Consider pluralizing to `logs` if it represents a collection.
- **/api/classes/create**: Singular resource name `create`. Consider pluralizing to `creates` if it represents a collection.
- **/api/classes/create**: URL contains verb `create`. Use HTTP methods (GET, POST) instead of verbs in the path.
- **/api/classes/join**: Singular resource name `join`. Consider pluralizing to `joins` if it represents a collection.
- **/api/classes/leave**: Singular resource name `leave`. Consider pluralizing to `leaves` if it represents a collection.
- **/api/intelligence/student**: Singular resource name `student`. Consider pluralizing to `students` if it represents a collection.
- **/api/planner/convert-to-node**: Singular resource name `convert-to-node`. Consider pluralizing to `convert-to-nodes` if it represents a collection.
- **/api/planner/data**: Singular resource name `data`. Consider pluralizing to `datas` if it represents a collection.
- **/api/planner/review**: Singular resource name `review`. Consider pluralizing to `reviews` if it represents a collection.
- **/api/quiz/submit**: Singular resource name `submit`. Consider pluralizing to `submits` if it represents a collection.
- **/api/sankalp/session/end**: Singular resource name `end`. Consider pluralizing to `ends` if it represents a collection.
- **/api/sankalp/session/start**: Singular resource name `start`. Consider pluralizing to `starts` if it represents a collection.
- **/api/student/graph**: Singular resource name `graph`. Consider pluralizing to `graphs` if it represents a collection.
- **/api/student/onboard**: Singular resource name `onboard`. Consider pluralizing to `onboards` if it represents a collection.
- **/api/student**: Singular resource name `student`. Consider pluralizing to `students` if it represents a collection.
- **/api/students/create**: Singular resource name `create`. Consider pluralizing to `creates` if it represents a collection.
- **/api/students/create**: URL contains verb `create`. Use HTTP methods (GET, POST) instead of verbs in the path.
- **/api/syllabus/save**: Singular resource name `save`. Consider pluralizing to `saves` if it represents a collection.
- **/api/teacher/graph**: Singular resource name `graph`. Consider pluralizing to `graphs` if it represents a collection.
- **/api/teacher/onboard**: Singular resource name `onboard`. Consider pluralizing to `onboards` if it represents a collection.
- **/api/teacher**: Singular resource name `teacher`. Consider pluralizing to `teachers` if it represents a collection.
- **/api/teachers/create**: Singular resource name `create`. Consider pluralizing to `creates` if it represents a collection.
- **/api/teachers/create**: URL contains verb `create`. Use HTTP methods (GET, POST) instead of verbs in the path.
- **/api/test/seed**: Singular resource name `seed`. Consider pluralizing to `seeds` if it represents a collection.
- **/api/users/create**: Singular resource name `create`. Consider pluralizing to `creates` if it represents a collection.
- **/api/users/create**: URL contains verb `create`. Use HTTP methods (GET, POST) instead of verbs in the path.

## Recommendations

1. **Use Plural Nouns:** `/api/students` instead of `/api/student`.
2. **Avoid Verbs:** Use `GET /api/students` instead of `/api/getStudents`.
3. **Consistent Casing:** Use kebab-case for URLs (e.g., `/api/user-profiles`).
