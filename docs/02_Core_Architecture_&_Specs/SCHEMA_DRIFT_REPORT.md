# Schema Drift Report

Generated on: 2026-02-19T19:32:58.629Z

## Summary
Total Responses Analyzed: 12
Drift Detected (Extra Fields): 2
Schema Violations (Invalid): 5
Unexpected Results: 0

## Detailed Analysis

| Flow | Timestamp | Status | Expected | Match | Details |
|------|-----------|--------|----------|-------|---------|
| syllabusGeneratorFlow | 2025-05-20T10:00:00Z | valid | valid | ✅ | - |
| syllabusGeneratorFlow | 2025-05-20T11:00:00Z | invalid_schema | invalid | ✅ | references: Expected array, received string |
| syllabusGeneratorFlow | 2025-05-20T12:00:00Z | drift_extra_fields | drift | ✅ | Extra fields detected: metadata |
| adaptiveQuizFlow | 2025-05-21T09:00:00Z | valid | valid | ✅ | - |
| adaptiveQuizFlow | 2025-05-21T09:30:00Z | invalid_schema | invalid | ✅ | quiz.0.correctAnswer: Required |
| adaptiveQuizFlow | 2025-05-21T10:00:00Z | drift_extra_fields | drift | ✅ | Extra fields detected: quiz.[0].explanation |
| smartRevisionPlannerFlow | 2025-05-22T08:00:00Z | valid | valid | ✅ | - |
| smartRevisionPlannerFlow | 2025-05-22T08:15:00Z | invalid_schema | invalid | ✅ | revisionList.0.priority: Invalid enum value. Expected 'HIGH' | 'MEDIUM' | 'LOW', received 'CRITICAL' |
| mindfulMentorFlow | 2025-05-23T14:00:00Z | valid | valid | ✅ | - |
| mindfulMentorFlow | 2025-05-23T14:30:00Z | invalid_schema | invalid | ✅ | advice: Expected string, received object |
| explainConceptFlow | 2025-05-24T16:00:00Z | valid | valid | ✅ | - |
| explainConceptFlow | 2025-05-24T16:30:00Z | invalid_schema | invalid | ✅ | explanation: Required |

## Automated Recommendations

### syllabusGeneratorFlow
- **Type Mismatch:** `references` expected `array`, received `string`.
  - *Suggestion:* Use `z.union([z.array(), z.string()])` or relax strictness.
- **Extra Field Detected:** `metadata`.
  - *Suggestion:* Update schema to include `metadata: z.any().optional()`

### adaptiveQuizFlow
- **Type Mismatch:** `quiz.0.correctAnswer` expected `string`, received `undefined`.
  - *Suggestion:* Use `z.union([z.string(), z.undefined()])` or relax strictness.
- **Extra Field Detected:** `quiz.[0].explanation`.
  - *Suggestion:* Update schema to include `explanation: z.any().optional()`

### smartRevisionPlannerFlow
- **Invalid Enum:** `revisionList.0.priority` received invalid value `CRITICAL`.
  - *Suggestion:* Add `CRITICAL` to `z.enum([...])`.

### mindfulMentorFlow
- **Type Mismatch:** `advice` expected `string`, received `object`.
  - *Suggestion:* Use `z.union([z.string(), z.object()])` or relax strictness.

### explainConceptFlow
- **Type Mismatch:** `explanation` expected `string`, received `undefined`.
  - *Suggestion:* Use `z.union([z.string(), z.undefined()])` or relax strictness.

