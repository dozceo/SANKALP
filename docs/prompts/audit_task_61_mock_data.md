# Task: Mock Data Provider Consistency Validation

**Source:** `docs/03_Audit_Reports_&_Validation/AUDIT_REPORTS.md` (Task 61)

## Objective
Fix potential crashes and empty states caused by missing fields in mock data files compared to the TypeScript interfaces.

## Context
- **Domain:** Data & APIs
- **Scope:** Mock data generation utilities (`src/data/docsData.ts`, `data/students/*.md`)

## Findings (from Audit)
1.  **Schema Mismatch:** `StudentNode` interface expects `badges`, `streak`, `subjects`, `studyMaterials`.
2.  **Missing Data:** Markdown files (e.g., `data/students/alex-kumar.md`) lack these fields.
3.  **Impact:** Components like `RewardsPage` may render empty or broken states.

## Requirements
1.  **Update Parser:** Modify `src/data/docsData.ts` to support defining `badges` and `streak` in the YAML frontmatter of student Markdown files.
2.  **Update Mock Data:** Add example badges and streak values to at least one mock student file (e.g., `alex-kumar.md`) to verify UI rendering.
3.  **Cleanup:** Deprecate or populate `src/data/studentsDataStatic.ts` if it is unused/confusing.

## Constraints
- Maintain valid YAML syntax in Markdown frontmatter.
- Ensure strict type safety in the parser.
