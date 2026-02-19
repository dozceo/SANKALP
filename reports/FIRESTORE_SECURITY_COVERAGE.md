# Firestore Security Rules Coverage Simulation

**Date:** 2026-02-19T19:07:02.175Z

This report details the results of simulating Firestore security rules against various access scenarios.

| Scenario | Path | Method | User Role | Expected | Actual | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Student reads own profile | `users/student1` | `get` | Student | ALLOW | ALLOW | ✅ PASS |
| Student reads other profile | `users/student2` | `get` | Student | DENY | DENY | ✅ PASS |
| Teacher reads student profile (users) | `users/student1` | `get` | Teacher | DENY | DENY | ✅ PASS |
| Student reads class | `classes/class1` | `get` | Student | ALLOW | ALLOW | ✅ PASS |
| Teacher creates class | `classes/newClass` | `create` | Teacher | ALLOW | ALLOW | ✅ PASS |
| Student creates class | `classes/newClass` | `create` | Student | DENY | DENY | ✅ PASS |
| Teacher updates own class | `classes/class1` | `update` | Teacher | ALLOW | ALLOW | ✅ PASS |
| Teacher updates other class | `classes/class1` | `update` | Teacher | DENY | DENY | ✅ PASS |
| Student reads own student data | `students/student1` | `get` | Student | ALLOW | ALLOW | ✅ PASS |
| Student reads other student data | `students/student2` | `get` | Student | DENY | DENY | ✅ PASS |
| Teacher reads own student data | `students/student1` | `get` | Teacher | ALLOW | ALLOW | ✅ PASS |
| Teacher reads other student data | `students/student2` | `get` | Teacher | DENY | DENY | ✅ PASS |
| Student reads own quiz result | `quizResults/q1` | `get` | Student | ALLOW | ALLOW | ✅ PASS |
| Student reads other quiz result | `quizResults/q2` | `get` | Student | DENY | DENY | ✅ PASS |
| Teacher reads student quiz result | `quizResults/q1` | `get` | Teacher | ALLOW | ALLOW | ✅ PASS |
| Student creates quiz result for self | `quizResults/new` | `create` | Student | ALLOW | ALLOW | ✅ PASS |
| Student creates quiz result for other | `quizResults/new` | `create` | Student | DENY | DENY | ✅ PASS |

## Summary

- **Total Scenarios:** 17
- **Passed:** 17
- **Failed:** 0

**Conclusion:** The security rules logic appears consistent with the intended access control model.
