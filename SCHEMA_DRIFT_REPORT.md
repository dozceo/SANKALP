# Schema Drift Report

Generated on: 2026-02-18T05:01:47.156Z

## Summary
| Metric | Count |
|--------|-------|
| Total Analyzed | 11 |
| 🔴 Critical Violations | 5 |
| 🟡 Warnings (Drift) | 1 |
| Unexpected Results | 0 |

## Detailed Analysis

| Severity | Flow | Timestamp | Status | Expected | Match | Details |
|----------|------|-----------|--------|----------|-------|---------|
| 🟢 Info | syllabusGeneratorFlow | 2025-05-20T10:00:00Z | valid | valid | ✅ | - |
| 🔴 Critical | syllabusGeneratorFlow | 2025-05-20T11:00:00Z | invalid_schema | invalid | ✅ | references: Expected array, received string |
| 🟡 Warning | syllabusGeneratorFlow | 2025-05-20T12:00:00Z | drift_extra_fields | drift | ✅ | : Unrecognized key(s) in object: 'metadata' |
| 🟢 Info | adaptiveQuizFlow | 2025-05-21T09:00:00Z | valid | valid | ✅ | - |
| 🔴 Critical | adaptiveQuizFlow | 2025-05-21T09:30:00Z | invalid_schema | invalid | ✅ | quiz.0.correctAnswer: Required |
| 🟢 Info | smartRevisionPlannerFlow | 2025-05-22T08:00:00Z | valid | valid | ✅ | - |
| 🔴 Critical | smartRevisionPlannerFlow | 2025-05-22T08:15:00Z | invalid_schema | invalid | ✅ | revisionList.0.priority: Invalid enum value. Expected 'HIGH' \| 'MEDIUM' \| 'LOW', received 'CRITICAL' |
| 🟢 Info | mindfulMentorFlow | 2025-05-23T14:00:00Z | valid | valid | ✅ | - |
| 🔴 Critical | mindfulMentorFlow | 2025-05-23T14:30:00Z | invalid_schema | invalid | ✅ | advice: Expected string, received object |
| 🟢 Info | explainConceptFlow | 2025-05-24T16:00:00Z | valid | valid | ✅ | - |
| 🔴 Critical | explainConceptFlow | 2025-05-24T16:30:00Z | invalid_schema | invalid | ✅ | explanation: Required |

## Recommendations

### 1. Critical Violations (Invalid Schema)
Responses marked as **🔴 Critical** violate the defined Zod schema.
- **Action:** Fix the LLM prompt or relax the schema constraints.
- **Action:** Verify if the schema correctly matches the production code expectations.

### 2. Warnings (Drift / Extra Fields)
Responses marked as **🟡 Warning** contain extra fields not in the schema.
- **Action:** If extra fields are useful, add them to the Zod schema as optional.
- **Action:** If irrelevant, consider using `.passthrough()` or ignoring them.

