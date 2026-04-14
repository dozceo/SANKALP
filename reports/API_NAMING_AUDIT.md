# API Naming & REST Convention Audit

| Path | Methods | Naming Convention |
|---|---|---|
| /api/planner/data | GET, POST | ✅ Clean |
| /api/planner/review | GET | ✅ Clean |
| /api/planner/convert-to-node | POST | ✅ Clean |
| /api/brainmap/nodes | GET | ✅ Clean |
| /api/teacher | GET, PUT | ✅ Clean |
| /api/teacher/graph | GET | ✅ Clean |
| /api/teacher/onboard | POST | ✅ Clean |
| /api/teacher/classes | GET | ✅ Clean |
| /api/teacher/classes/[classId] | GET | ⚠️ Uppercased segment: [classId] |
| /api/teacher/classes/[classId]/students | GET | ⚠️ Uppercased segment: [classId] |
| /api/teacher/students | GET | ✅ Clean |
| /api/teacher/students/[studentId] | GET | ⚠️ Uppercased segment: [studentId] |
| /api/student | GET, PUT | ✅ Clean |
| /api/student/graph | GET | ✅ Clean |
| /api/student/onboard | POST | ✅ Clean |
| /api/test/seed | POST | ✅ Clean |
| /api/sankalp/session/start | POST | ✅ Clean |
| /api/sankalp/session/end | POST | ✅ Clean |
| /api/classes/create | POST | ✅ Clean |
| /api/classes/join | POST | ✅ Clean |
| /api/classes/leave | POST | ✅ Clean |
| /api/activity/log | POST | ✅ Clean |
| /api/users/create | POST | ✅ Clean |
| /api/users/[userId] | GET | ⚠️ Uppercased segment: [userId] |
| /api/quiz/submit | POST | ✅ Clean |
| /api/teachers/create | POST | ✅ Clean |
| /api/intelligence/student | GET | ✅ Clean |
| /api/students/create | POST | ✅ Clean |
| /api/chaos | GET, POST, DELETE | ✅ Clean |
| /api/syllabus/save | POST | ✅ Clean |
