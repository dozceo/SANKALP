# Gamification Quality Report

## Executive Summary
The platform's gamification elements are currently in a skeletal state. While UI components and data interfaces exist for Badges and Streaks, the underlying logic to award, track, and persist these elements is missing. The primary motivational driver currently implemented is "Mastery Visualization" (via the Brain Map), but explicit gamification rewards (points, badges) are non-functional.

## Inventory of Gamification Elements

| Element | Component / Interface | Status | Logic / Backend |
| :--- | :--- | :--- | :--- |
| **Badges** | `Badge` interface (`src/data/docsData.ts`)<br>`RewardsSkeleton.tsx` (Visual) | **Skeletal** | **Missing**. No logic found to award badges based on criteria. |
| **Streak** | `streak` field in `StudentNode`<br>`RewardsSkeleton.tsx` (Visual) | **Skeletal** | **Missing**. No logic found to calculate or update daily streaks. |
| **Mastery** | `masteryScores` field<br>`InteractiveGraph.tsx` (Visual) | **Partial** | **Implemented**. Mastery scores are calculated and visualized, but not tied to "Levels" or "XP". |
| **Rewards Page**| `src/app/(main)/rewards/page.tsx` | **Missing** | **Missing**. Route does not exist; only the skeleton component is present. |

## Detailed Analysis

### 1. Badges
*   **Current State:** The `Badge` interface defines `id`, `title`, `description`, `icon`, `earnedAt`, and `color`.
*   **Gap:** There is no service or function (e.g., `awardBadge(studentId, badgeId)`) that evaluates student activity against criteria to grant these badges.
*   **Impact:** Users will see empty badge lists or placeholders, leading to confusion and lack of motivation.

### 2. Streak
*   **Current State:** A `streak` number field exists in the student data model.
*   **Gap:** No scheduled task or event listener updates this field. A true streak system requires daily checks of user activity and logic to reset counters on inactivity.
*   **Impact:** The "Daily Streak" visual in `RewardsSkeleton` will likely display `0` or static mock data, failing to incentivize daily login.

### 3. Rewards Page
*   **Current State:** The `RewardsSkeleton.tsx` component provides a rich visual structure (Charts, Streak, Badges).
*   **Gap:** The actual page `src/app/(main)/rewards/page.tsx` is missing from the codebase.
*   **Impact:** Users cannot access a dedicated "Achievements" or "Rewards" view.

## Recommendations
1.  **Implement Logic Layer:** Create a `GamificationService` to handle badge awarding and streak calculations based on `QuizResult` events.
2.  **Create Rewards Page:** Implement `src/app/(main)/rewards/page.tsx` utilizing the existing `RewardsSkeleton` and connecting it to real data.
3.  **Define Badge Criteria:** Create a configuration file (e.g., `badges.config.ts`) defining rules for each badge (e.g., "Complete 5 quizzes in a row").
