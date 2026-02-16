# Student Data Privacy Compliance Audit Report

## Executive Summary
This report identifies potential PII (Personally Identifiable Information) handling across the codebase to ensure compliance with GDPR/COPPA.
**Scope:** `src/lib`, `src/app/api`, `src/ml`.

## Findings by Category

### Data Collection (API Layer)
Files in `src/app/api` that handle PII.
| File | Line | Keyword | Context |
|---|---|---|---|
| src/app/api/classes/create/route.ts | 29 | name | `teacherName: teacher.name,` |
| src/app/api/classes/join/route.ts | 23 | uid | `if (studentId !== decodedToken.uid) {` |
| src/app/api/classes/leave/route.ts | 23 | uid | `if (studentId !== decodedToken.uid) {` |
| src/app/api/student/onboard/route.ts | 7 | name | `const { userId, name, grade, subjects, goals, dailyStudyTime, classCode } = body;` |
| src/app/api/student/onboard/route.ts | 18 | name | `name,` |
| src/app/api/student/route.ts | 34 | name | `name: student.name,` |
| src/app/api/student/route.ts | 78 | uid | `if (studentId !== decodedToken.uid) {` |
| src/app/api/students/create/route.ts | 7 | email | `const { id, name, email, grade, userId } = body;` |
| src/app/api/students/create/route.ts | 9 | email | `if (!id  !name  !email  !userId) {` |
| src/app/api/students/create/route.ts | 11 | email | `{ error: 'Missing required fields: id, name, email, userId' },` |
| src/app/api/students/create/route.ts | 18 | name | `name,` |
| src/app/api/students/create/route.ts | 19 | email | `email,` |
| src/app/api/teacher/onboard/route.ts | 7 | name | `const { userId, name, subjects, gradeLevels, schoolName, expectedClassSize } = body;` |
| src/app/api/teacher/onboard/route.ts | 18 | name | `name,` |
| src/app/api/teacher/route.ts | 68 | uid | `if (teacherId !== decodedToken.uid) {` |
| src/app/api/teacher/students/route.ts | 19 | email | `select: ['userId', 'name', 'email', 'className', 'grade', 'lastLoginDate']` |
| src/app/api/teacher/students/route.ts | 61 | name | `name: student.name,` |
| src/app/api/teacher/students/route.ts | 62 | email | `email: student.email,` |
| src/app/api/teachers/create/route.ts | 7 | email | `const { id, name, email, school, subject } = body;` |
| src/app/api/teachers/create/route.ts | 9 | email | `if (!id  !name  !email) {` |
| ... | ... | ... | (7 more) |

### Data Storage (Persistence Layer)
Files in `src/lib` (db-helpers, firebase) that persist PII.
| File | Line | Keyword | Context |
|---|---|---|---|
| src/lib/db-helpers-user.ts | 10 | name | `name: string;` |
| src/lib/db-helpers-user.ts | 11 | email | `email: string;` |
| src/lib/db-helpers-user.ts | 20 | email | `email: data.email,` |
| src/lib/db-helpers-user.ts | 21 | name | `name: data.name,` |
| src/lib/db-helpers-user.ts | 38 | name | `name: string;` |
| src/lib/db-helpers-user.ts | 39 | email | `email: string;` |
| src/lib/db-helpers-user.ts | 47 | name | `name: data.name,` |
| src/lib/db-helpers-user.ts | 48 | email | `email: data.email,` |
| src/lib/db-helpers.ts | 16 | uid | `uid: string;` |
| src/lib/db-helpers.ts | 17 | email | `email: string;` |
| src/lib/db-helpers.ts | 18 | name | `name: string;` |
| src/lib/db-helpers.ts | 28 | name | `name: string;` |
| src/lib/db-helpers.ts | 29 | email | `email: string;` |
| src/lib/db-helpers.ts | 52 | email | `email: string;` |
| src/lib/db-helpers.ts | 53 | name | `name: string;` |
| src/lib/db-helpers.ts | 314 | email | `email: data?.email  '',` |
| src/lib/db-helpers.ts | 315 | name | `name: data?.name  '',` |
| src/lib/db-helpers.ts | 340 | email | `email: string;` |
| src/lib/db-helpers.ts | 341 | name | `name: string;` |
| src/lib/db-helpers.ts | 353 | email | `email: student.email,` |

### Data Processing (ML Layer)
Files in `src/ml` that process PII.
**Risk:** ML models should generally train on anonymized data.
No PII found in ML layer (Good).

## Regulatory Compliance Analysis

### GDPR (Right to be Forgotten)
- **Observation:** `db-helpers.ts` contains `createStudent` and `getStudent` but no visible `deleteStudent` function.
- **Risk:** High. Inability to delete user data upon request.

### COPPA (Children's Privacy)
- **Observation:** Email and Name are collected without visible parental consent flow in the API.
- **Risk:** High if users are under 13.

### Data Minimization
- **Observation:** The ML layer (if findings exist) processes raw student data.
- **Recommendation:** Anonymize `studentId` and remove `name`/`email` before passing to Python scripts.
