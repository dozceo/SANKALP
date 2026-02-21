# Task: Mindful Mentor Feature Completeness Gap Analysis

**Source:** `docs/03_Audit_Reports_&_Validation/AUDIT_REPORTS.md` (Task 63)

## Objective
Upgrade the "Mindful Mentor" feature from a skeletal demo to a functional, context-aware feature.

## Context
- **Domain:** Engineering Core
- **Scope:** Mindful Mentor feature (`src/app/(main)/mentor/`)

## Findings (from Audit)
1.  **Hardcoded Context:** `getMotivationalAdvice` uses a hardcoded student history ("feeling overwhelmed...").
2.  **No Persistence:** Chat history is lost on reload (local state only).
3.  **No Integration:** Mentor cannot trigger actions in the app.

## Requirements
1.  **Phase 1 (Data Integration):**
    - Update `getMotivationalAdvice` in `src/app/(main)/mentor/actions.ts`.
    - Fetch actual `studentId` and retrieve real data (`masteryScores`, `recentQuizResults`, `planner`) to construct the prompt context.
2.  **Phase 2 (Persistence):**
    - Implement a database schema (or mock equivalent if DB not ready) for `MentorSessions` and `Messages`.
    - Save and load conversation history.
3.  **Phase 3 (Actionability - Optional):**
    - Allow the Mentor to generate structured actions (e.g., "Add Review to Planner") that the user can confirm.

## Constraints
- Respect user privacy and data security when sending context to the LLM.
