# Gamification Quality Report

## Executive Summary
The platform's gamification elements are currently in a skeletal state. While UI components and data interfaces exist for Badges and Streaks, the underlying logic to award, track, and persist these elements is missing. The primary motivational driver currently implemented is "Mastery Visualization" (via the Brain Map), but explicit gamification rewards (points, badges) are non-functional.

## Inventory of Gamification Elements

| Element | Component / Interface | Status | Logic / Backend |
| :--- | :--- | :--- | :--- |
| **Badges** | `Badge` interface (`src/data/docsData.ts`)<br>`RewardsSkeleton.tsx` (Visual) | **Skeletal** | **Missing**. No logic found to award badges based on criteria. `getStudentBadges` simply returns existing badges from `StudentNode`. |
| **Streak** | `streak` field in `StudentNode`<br>`RewardsSkeleton.tsx` (Visual) | **Skeletal** | **Missing**. No logic found to calculate or update daily streaks. |
| **Mastery** | `masteryScores` field<br>`InteractiveGraph.tsx` (Visual) | **Partial** | **Implemented**. Mastery scores are calculated and visualized, but not tied to "Levels" or "XP". |
| **Rewards Page**| `src/app/(main)/rewards/page.tsx` | **Implemented (UI Only)** | **Partial**. The page exists and renders a skeletal UI, but relies on `StudentNode` data which lacks dynamic updates. |

## Detailed Analysis

### 1. Badges
*   **Current State:** The `Badge` interface defines `id`, `title`, `description`, `icon`, `earnedAt`, and `color`. The rewards page uses `getStudentBadges` from `src/lib/rewards/calculateRewards.ts`.
*   **Gap:** There is no service or function (e.g., `awardBadge(studentId, badgeId)`) that evaluates student activity against criteria to grant these badges.
*   **Impact:** Users will see empty badge lists or placeholders, leading to confusion and lack of motivation.

### 2. Streak
*   **Current State:** A `streak` number field exists in the student data model.
*   **Gap:** No scheduled task or event listener updates this field. A true streak system requires daily checks of user activity and logic to reset counters on inactivity.
*   **Impact:** The "Daily Streak" visual in `RewardsSkeleton` will likely display `0` or static mock data, failing to incentivize daily login.

### 3. Rewards Page
*   **Current State:** The `src/app/(main)/rewards/page.tsx` component provides a rich visual structure (Charts, Streak, Badges). It is accessible via the sidebar (implied).
*   **Gap:** While the UI is present, the data it consumes (`student.badges`, `student.streak`) is not being actively managed by the backend.
*   **Impact:** Users can view their "Achievements" page, but it will remain static.

## Recommendations
1.  **Implement Logic Layer:** Create a `GamificationService` to handle badge awarding and streak calculations based on `QuizResult` events.
2.  **Connect Rewards Page:** Ensure `src/app/(main)/rewards/page.tsx` receives live updates when a badge is earned.
3.  **Define Badge Criteria:** Create a configuration file (e.g., `badges.config.ts`) defining rules for each badge (e.g., "Complete 5 quizzes in a row").

## Verification
*   **Timestamp:** 2024-05-24
*   **Auditor:** Jules (AI Assistant)
