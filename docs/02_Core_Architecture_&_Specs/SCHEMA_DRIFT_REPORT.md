# Schema Drift Report

Generated on: 2026-02-17T19:17:26.360Z

## Summary
Total Responses Analyzed: 11
Drift Detected (Extra Fields): 1
Schema Violations (Invalid): 5
Unexpected Results: 0

## Detailed Analysis

| Flow | Timestamp | Status | Expected | Match | Details |
|------|-----------|--------|----------|-------|---------|
| syllabusGeneratorFlow | 2025-05-20T10:00:00Z | valid | valid | ✅ | - |
| syllabusGeneratorFlow | 2025-05-20T11:00:00Z | invalid_schema | invalid | ✅ | references: Expected array, received string |
| syllabusGeneratorFlow | 2025-05-20T12:00:00Z | drift_extra_fields | drift | ✅ | : Unrecognized key(s) in object: 'metadata' |
| adaptiveQuizFlow | 2025-05-21T09:00:00Z | valid | valid | ✅ | - |
| adaptiveQuizFlow | 2025-05-21T09:30:00Z | invalid_schema | invalid | ✅ | quiz.0.correctAnswer: Required |
| smartRevisionPlannerFlow | 2025-05-22T08:00:00Z | valid | valid | ✅ | - |
| smartRevisionPlannerFlow | 2025-05-22T08:15:00Z | invalid_schema | invalid | ✅ | revisionList.0.priority: Invalid enum value. Expected 'HIGH' | 'MEDIUM' | 'LOW', received 'CRITICAL' |
| mindfulMentorFlow | 2025-05-23T14:00:00Z | valid | valid | ✅ | - |
| mindfulMentorFlow | 2025-05-23T14:30:00Z | invalid_schema | invalid | ✅ | advice: Expected string, received object |
| explainConceptFlow | 2025-05-24T16:00:00Z | valid | valid | ✅ | - |
| explainConceptFlow | 2025-05-24T16:30:00Z | invalid_schema | invalid | ✅ | explanation: Required |

## Recommendations

### 1. Handling Extra Fields (Drift)
For responses marked as **drift_extra_fields**, the LLM is returning more data than defined in the Zod schema.
- **Recommendation:** If the extra fields are useful (e.g., `metadata`, `reasoning`), update the Zod schema to include them as optional fields.
- **Recommendation:** If the extra fields are irrelevant, use `.passthrough()` in the schema to allow them without validation errors (if strict validation is enforced elsewhere), or explicitly strip them (default Zod behavior).

### 2. Handling Invalid Schemas
For responses marked as **invalid_schema**, the LLM output violates the contract.
- **Recommendation:** Loosen constraints if the drift is acceptable (e.g., change `z.array()` to `z.array().or(z.string())` if the LLM sometimes returns a single string).
- **Recommendation:** Improve prompt engineering to enforce the schema more strictly.
- **Recommendation:** Add fallback logic or retry mechanisms in the flow.

