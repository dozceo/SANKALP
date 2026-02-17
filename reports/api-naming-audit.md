# API Endpoint Naming Audit

**Date:** 2026-02-17T19:27:07.268Z

## Analyzed Routes

### ⚠️ Naming Violations

- `/api/classes/create`: - Route ends with a verb (create). RESTful APIs should use nouns and HTTP methods.
- `/api/students/create`: - Route ends with a verb (create). RESTful APIs should use nouns and HTTP methods.
- `/api/teachers/create`: - Route ends with a verb (create). RESTful APIs should use nouns and HTTP methods.
- `/api/users/create`: - Route ends with a verb (create). RESTful APIs should use nouns and HTTP methods.
### compliant Routes

- `/api/activity/log`
- `/api/brainmap/nodes`
- `/api/chaos`
- `/api/classes/join`
- `/api/classes/leave`
- `/api/intelligence/student`
- `/api/planner/convert-to-node`
- `/api/planner/data`
- `/api/planner/review`
- `/api/quiz/submit`
- `/api/sankalp/session/end`
- `/api/sankalp/session/start`
- `/api/student/graph`
- `/api/student/onboard`
- `/api/student`
- `/api/syllabus/save`
- `/api/teacher/classes/[classId]`
- `/api/teacher/classes/[classId]/students`
- `/api/teacher/classes`
- `/api/teacher/graph`
- `/api/teacher/onboard`
- `/api/teacher`
- `/api/teacher/students/[studentId]`
- `/api/teacher/students`
- `/api/test/seed`
- `/api/users/[userId]`

## Recommendations
- Use **kebab-case** for all URL segments.
- Use **nouns** for resources (e.g., `/users` instead of `/getUsers`).
- Use **plural** nouns for collections (e.g., `/students` instead of `/student`).
