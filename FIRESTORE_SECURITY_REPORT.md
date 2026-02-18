# Firestore Security Rules Coverage Report

**Date:** 2026-02-18T19:11:08.271Z

## Critical Collections Audit

| Collection | Has Rules? | Authenticated Read? | Owner-Only Read? | Owner-Only Write? | Status |
|---|---|---|---|---|---|
| `users` | ✅ Yes | Yes | Yes | Yes | ✅ Pass |
| `teachers` | ✅ Yes | Yes | Yes | Yes | ✅ Pass |
| `classes` | ✅ Yes | Yes | No | No | ✅ Pass (Shared) |
| `students` | ✅ Yes | Yes | Yes | Yes | ✅ Pass |
| `quizResults` | ✅ Yes | Yes | Yes | Yes | ✅ Pass |
| `mlPredictions` | ✅ Yes | Yes | Yes | Yes | ✅ Pass |
| `adkDecisions` | ✅ Yes | Yes | Yes | Yes | ✅ Pass |
| `teacherInterventions` | ✅ Yes | Yes | No | Yes | ⚠️ Shared Read? |
| `syllabi` | ✅ Yes | Yes | Yes | Yes | ✅ Pass |
| `quizGenerations` | ✅ Yes | Yes | Yes | Yes | ✅ Pass |
| `sankalpSessions` | ✅ Yes | Yes | Yes | Yes | ✅ Pass |
| `activityLogs` | ✅ Yes | Yes | Yes | Yes | ✅ Pass |
| `chatHistory` | ✅ Yes | Yes | Yes | Yes | ✅ Pass |
| `brainMapNodes` | ✅ Yes | Yes | Yes | Yes | ✅ Pass |
| `plannerData` | ✅ Yes | Yes | Yes | Yes | ✅ Pass |
| `dailySummaries` | ✅ Yes | Yes | Yes | Yes | ✅ Pass |

## Simulation Scenarios (Regex-Based)

| Scenario | Expected Result | Analysis | Pass? |
|---|---|---|---|
| **Student reads own profile** | Allow | Owner access granted | ✅ |
| **Student reads other student profile** | Deny | Strict owner check found. | ✅ |
| **Teacher reads student data** | Allow | Owner access granted | ✅ |
| **Student reads own quiz results** | Allow | Owner access granted | ✅ |
| **Student reads other quiz results** | Deny | Strict owner check found. | ✅ |
| **Anonymous read classes** | Deny | Rules require authentication. | ✅ |

## Recommendations
- **classes**: Verify if students need to list classes. Current rules allow `read: if isAuthenticated()`. This lets any logged-in user see all classes.
- **teacherInterventions**: `allow write: if false`. This means no one can write? Check if server-side admin writes it (which bypasses rules).
