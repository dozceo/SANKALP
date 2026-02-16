# Schema Drift Report

Generated on: 2026-02-16T19:10:16.695Z

| Flow | Timestamp | Expected | Actual | Details | Recommendations |
|---|---|---|---|---|---|
| syllabusGeneratorFlow | 2025-05-20T10:00:00Z | valid | **valid** | None | <ul><li>None</li></ul> |
| syllabusGeneratorFlow | 2025-05-20T11:00:00Z | invalid | **invalid** | <ul><li>references: Expected array, received string</li></ul> | <ul><li>Update schema to allow `z.union([z.string(), z.array(z.string())])` or fix LLM prompt.</li></ul> |
| syllabusGeneratorFlow | 2025-05-20T12:00:00Z | drift | **drift** | <ul><li>Extra keys found: metadata, metadata.generatedBy</li></ul> | <ul><li>Consider adding optional field `metadata` to schema if it's useful.</li><li>Consider adding optional field `metadata.generatedBy` to schema if it's useful.</li></ul> |
| adaptiveQuizFlow | 2025-05-21T09:00:00Z | valid | **valid** | None | <ul><li>None</li></ul> |
| adaptiveQuizFlow | 2025-05-21T09:30:00Z | invalid | **invalid** | <ul><li>quiz.0.correctAnswer: Required</li></ul> | <ul><li>Mark field as optional in schema or ensure LLM always returns it.</li></ul> |
| smartRevisionPlannerFlow | 2025-05-22T08:00:00Z | valid | **valid** | None | <ul><li>None</li></ul> |
| smartRevisionPlannerFlow | 2025-05-22T08:15:00Z | invalid | **invalid** | <ul><li>revisionList.0.priority: Invalid enum value. Expected 'HIGH' | 'MEDIUM' | 'LOW', received 'CRITICAL'</li></ul> | <ul><li>Update schema enum to include the new value or constrain LLM prompt.</li></ul> |
| mindfulMentorFlow | 2025-05-23T14:00:00Z | valid | **valid** | None | <ul><li>None</li></ul> |
| mindfulMentorFlow | 2025-05-23T14:30:00Z | invalid | **invalid** | <ul><li>advice: Expected string, received object</li></ul> | <ul><li>Investigate schema definition for: advice: Expected string, received object</li></ul> |
| explainConceptFlow | 2025-05-24T16:00:00Z | valid | **valid** | None | <ul><li>None</li></ul> |
| explainConceptFlow | 2025-05-24T16:30:00Z | invalid | **invalid** | <ul><li>explanation: Required</li></ul> | <ul><li>Mark field as optional in schema or ensure LLM always returns it.</li></ul> |


## Summary

Total responses analyzed: 11
Issues/Drifts detected: 6
