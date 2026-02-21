# Task: Exam Date Hardcoding & Time Simulation Audit

**Source:** `docs/03_Audit_Reports_&_Validation/AUDIT_REPORTS.md` (Task 62)

## Objective
Remove hardcoded dates that force specific app states (like "Cramming Helper" mode) and implement a proper time simulation or dynamic date system.

## Context
- **Domain:** Engineering Core
- **Scope:** Time-dependent logic (`SyllabusPage`, `StudentContext`)

## Findings (from Audit)
1.  **Hardcoded Date:** `src/app/(main)/syllabus/page.tsx` sets the exam date to `new Date() + 2 days`. This is a blocker for production.
2.  **Time Dependencies:** `StudentContext` and other components use `new Date()` directly, making testing difficult.

## Requirements
1.  **Refactor SyllabusPage:**
    - Remove the hardcoded `examDate`.
    - Accept `examDate` as a prop or fetch it from the student's planner/course settings.
2.  **Time Provider (Optional but Recommended):**
    - Introduce a global `TimeProvider` or utility to allow injecting a specific "now" timestamp for testing and demo purposes.
    - Update `SyllabusPage` and `StudentContext` to use this provider.

## Constraints
- Ensure the "Cramming Helper" still works when the (dynamic) date conditions are met.
