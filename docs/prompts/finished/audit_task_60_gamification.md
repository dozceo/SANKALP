# Task: Student Gamification Element Consistency

**Source:** `docs/03_Audit_Reports_&_Validation/AUDIT_REPORTS.md` (Task 60)

## Objective
Implement logic to ensure consistency and functionality for Student Gamification Elements (badges, streaks). Currently, UI elements exist but the logic to award or update them is missing.

## Context
- **Domain:** Design & UX
- **Scope:** UI elements related to motivation (points, badges, streaks)

## Findings (from Audit)
1.  **Missing Logic:** No logic exists to *award* badges or *increment* streaks based on user actions (e.g., finishing a quiz).
2.  **Mock Data Only:** The system relies on static fields in `StudentNode` which are often empty or default to 0.
3.  **Read-Only:** `calculateRewards.ts` only reads data, it doesn't calculate new rewards.

## Requirements
1.  **Implement Streak Logic:**
    - Create a backend service or hook to update streaks based on daily activity.
    - Ensure streaks reset if a day is missed (logic check on login or activity).
2.  **Implement Badge Awarding:**
    - Define specific criteria for awarding badges (e.g., "First Quiz Completed", "7 Day Streak").
    - Implement a check to award these badges after relevant actions.
3.  **Verify UI:**
    - Ensure the `RewardsPage` correctly displays the updated data.

## Constraints
- Use existing `Badge` and `StudentNode` interfaces in `src/data/docsData.ts` if possible, or extend them backward-compatibly.
- Ensure changes are persistent (if a DB is available) or correctly update the session state.
