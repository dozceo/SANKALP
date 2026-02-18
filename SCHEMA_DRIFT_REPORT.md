# Schema Drift Report

Generated on: 2026-02-18T19:05:26.315Z

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

## Detailed Failures & Recommendations

This section provides specific examples of schema drift and actionable recommendations for updates.

### syllabusGeneratorFlow (2025-05-20T11:00:00Z)
**Status:** invalid_schema
**Error Details:** references: Expected array, received string

**Response Snippet:**
```json
{
  "title": "Introduction to Psychology",
  "structure": "Chapter 1...",
  "strategy": "Read the book",
  "references": "https://psychology.org"
}
```

**Recommendation:**
Update schema to `z.union([z.array(originalType), z.string()])` or refine prompt to ensure array output.

---
### syllabusGeneratorFlow (2025-05-20T12:00:00Z)
**Status:** drift_extra_fields
**Error Details:** : Unrecognized key(s) in object: 'metadata'

**Response Snippet:**
```json
{
  "title": "Biology 101",
  "structure": "Cells...",
  "strategy": "Memorize terms",
  "references": [],
  "metadata": {
    "generatedBy": "model-v2"
  }
}
```

**Recommendation:**
Add `metadata: z.any().optional()` to the schema or use `.passthrough()` to allow unknown keys.

---
### adaptiveQuizFlow (2025-05-21T09:30:00Z)
**Status:** invalid_schema
**Error Details:** quiz.0.correctAnswer: Required

**Response Snippet:**
```json
{
  "quiz": [
    {
      "question": "Capital of France?",
      "options": [
        "London",
        "Berlin",
        "Paris",
        "Madrid"
      ]
    }
  ]
}
```

**Recommendation:**
Make the field optional with `.optional()` or ensure the prompt explicitly requires it.

---
### smartRevisionPlannerFlow (2025-05-22T08:15:00Z)
**Status:** invalid_schema
**Error Details:** revisionList.0.priority: Invalid enum value. Expected 'HIGH' | 'MEDIUM' | 'LOW', received 'CRITICAL'

**Response Snippet:**
```json
{
  "revisionList": [
    {
      "topic": "Geometry",
      "reason": "Upcoming exam",
      "priority": "CRITICAL"
    }
  ]
}
```

**Recommendation:**
Add the received value to the Zod enum definition or validate the prompt constraints.

---
### mindfulMentorFlow (2025-05-23T14:30:00Z)
**Status:** invalid_schema
**Error Details:** advice: Expected string, received object

**Response Snippet:**
```json
{
  "advice": {
    "text": "Take a deep breath."
  }
}
```

**Recommendation:**
Update schema to allow object (e.g. `z.union([z.string(), z.object(...)])`) or check if a specific field (e.g., `.text`) should be extracted.

---
### explainConceptFlow (2025-05-24T16:30:00Z)
**Status:** invalid_schema
**Error Details:** explanation: Required

**Response Snippet:**
```json
{
  "text": "Photosynthesis is..."
}
```

**Recommendation:**
Make the field optional with `.optional()` or ensure the prompt explicitly requires it.

---

## General Recommendations

### 1. Handling Extra Fields (Drift)
- Use `.passthrough()` on Zod schemas if you want to allow extra fields without validation errors.
- Use `.strict()` only if you want to enforce strict schema compliance and reject unknown fields.

### 2. Handling Invalid Schemas
- Review the prompt engineering to ensure the LLM understands the output format.
- Use `z.union()` or `.optional()` to accommodate variability in LLM responses.
