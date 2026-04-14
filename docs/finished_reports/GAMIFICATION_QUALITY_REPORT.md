# Gamification Quality Report

## Executive Summary
The platform's gamification elements are in a mixed state. While the frontend visualization for rewards and progress is largely implemented (`src/app/(main)/rewards/page.tsx`), the underlying logic to award badges, calculate streaks, and persist these achievements is entirely missing. The system currently displays static or default data, meaning users will not see their progress reflected in the gamification elements, leading to potential disengagement.

## Inventory of Gamification Elements

| Element | Component / Interface | Status | Logic / Backend |
| :--- | :--- | :--- | :--- |
| **Badges** | `Badge` interface (`src/data/docsData.ts`)<br>`RewardsPage` (Visual) | **UI Implemented** | **Missing**. No logic found to award badges based on criteria. `calculateRewards.ts` only retrieves existing badges. |
| **Streak** | `streak` field in `StudentNode`<br>`RewardsPage` (Visual) | **UI Implemented** | **Missing**. No logic found to calculate or update daily streaks. |
| **Mastery** | `masteryScores` field<br>`InteractiveGraph.tsx` (Visual) | **Partial** | **Implemented**. Mastery scores are calculated and visualized, but not tied to "Levels" or "XP". |
| **Rewards Page**| `src/app/(main)/rewards/page.tsx` | **Implemented** | **Static**. The page exists and renders correctly, but the data source (`currentStudent`) lacks dynamic updates for gamification fields. |

## Detailed Analysis

### 1. Badges
*   **Current State:** The `Badge` interface defines the structure. The `RewardsPage` can render badges if they exist in the student object.
*   **Gap:** There is no service or function (e.g., `awardBadge(studentId, badgeId)`) that evaluates student activity against criteria to grant these badges. The `calculateRewards.ts` utility merely reads the `badges` array from the student object, which is currently empty in mock data.
*   **Impact:** Users will see an empty "Badges Earned" section regardless of their achievements.

### 2. Streak
*   **Current State:** A `streak` number field exists in the student data model. The `RewardsPage` displays this number.
*   **Gap:** No scheduled task or event listener updates this field. A true streak system requires daily checks of user activity and logic to reset counters on inactivity.
*   **Impact:** The "Current Streak" visual will likely display `0` or static mock data, failing to incentivize daily login.

### 3. Rewards Page
*   **Current State:** `src/app/(main)/rewards/page.tsx` provides a rich visual structure (Charts, Streak, Badges) using `recharts` and `lucide-react`.
*   **Gap:** The page relies on `useStudent()` hook which fetches data that lacks populated gamification fields.
*   **Impact:** The page looks good but is functionally inert regarding gamification.

## Recommendations
1.  **Implement Logic Layer:** Create a `GamificationService` to handle badge awarding and streak calculations based on `QuizResult` events.
2.  **Connect Data:** Ensure `scripts/seed-personal.ts` and `scripts/seed-database.ts` populate the `badges` and `streak` fields with initial data for testing.
3.  **Define Badge Criteria:** Create a configuration file (e.g., `badges.config.ts`) defining rules for each badge (e.g., "Complete 5 quizzes in a row").
