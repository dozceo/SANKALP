# Mock Data Consistency Report

## Executive Summary
There is a significant structural mismatch between the mock data generation scripts (`scripts/seed-database.ts`, `scripts/seed-personal.ts`) and the frontend data interfaces (`src/data/docsData.ts`). While the seed scripts populate core student data (Mastery, Quiz Results), they fail to include gamification-specific fields (`badges`, `streak`) required by the frontend visualization components (`StudentNode` interface). Additionally, the client-side mock data file (`src/data/studentsDataStatic.ts`) is currently empty, rendering offline/demo modes non-functional.

## Data Source Inventory

| Source | Role | Status | Consistency Issue |
| :--- | :--- | :--- | :--- |
| `src/data/studentsDataStatic.ts` | **Client-Side Mock** | **Empty** | Exports `[]`. Fails to provide any data for `InteractiveGraph.tsx` or `RewardsPage.tsx`. |
| `scripts/seed-database.ts` | **Global Seed** | **Minimal** | Populates only basic `User` and `QuizResult` collections. Missing `masteryScores`, `topics`, `badges`, `streak`. |
| `scripts/seed-personal.ts` | **Personal Seed** | **Partial** | Populates `User` with `masteryScores`, `topics`, `strengths`, `weaknesses`, `lastActive`. **Missing** `badges`, `streak`. |
| `src/data/docsData.ts` | **Interface Definition** | **Comprehensive** | Defines `StudentNode` with `badges: Badge[]` and `streak: number`. |

## Detailed Analysis

### 1. Missing Gamification Fields
*   **Issue:** The `StudentNode` interface expects `badges` and `streak` to be present on student objects.
*   **Seed Scripts:** Neither `seed-database.ts` nor `seed-personal.ts` include these fields when creating `students` documents in Firestore. `seed-database.ts` only sets `email`, `name`, `registrationDate`, `lastLoginDate`.
*   **Impact:** Frontend components attempting to render student profiles or graphs will encounter `undefined` values for badges/streaks, potentially causing rendering errors or empty states.

### 2. Empty Client-Side Mock
*   **Issue:** `src/data/studentsDataStatic.ts` is intended to provide static data for demos or offline development.
*   **Current State:** It exports an empty array: `export const studentsData: StudentNode[] = [];`.
*   **Impact:** The application cannot function in a purely client-side mode or showcase features without a live database connection and seeded data.

## Recommendations
1.  **Update Seed Scripts:** Modify `scripts/seed-personal.ts` and `scripts/seed-database.ts` to include default values for missing fields:
    ```typescript
    // In seed script
    badges: [],
    streak: 0,
    ```
2.  **Populate Client-Side Mock:** Fill `src/data/studentsDataStatic.ts` with a rich set of mock data that mirrors the structure of `seed-personal.ts` but includes all fields defined in `StudentNode`.
3.  **Strict Typing in Seeds:** Use shared TypeScript interfaces (e.g., `StudentNode` from `docsData.ts`) within seed scripts to enforce schema consistency at compile time.
