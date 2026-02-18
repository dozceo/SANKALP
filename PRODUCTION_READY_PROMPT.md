# Production-Ready Implementation Prompt

Based on the audit reports (`GAMIFICATION_QUALITY_REPORT.md`, `MOCK_DATA_CONSISTENCY_REPORT.md`, `TIME_DEPENDENCY_REPORT.md`, `MINDFUL_MENTOR_ROADMAP.md`), please implement the following features to bring the codebase to a production-ready state:

## 1. Gamification Backend & UI Connection
**Context:** The `src/app/(main)/rewards/page.tsx` UI exists but displays static or incomplete data.
**Tasks:**
- Create a `GamificationService` (e.g., in `src/lib/gamification.ts`) to handle:
  - **Streak Tracking:** Logic to increment streaks on daily activity and reset on inactivity.
  - **Badge Awarding:** Evaluate rules (e.g., "5 Day Streak", "Mastery > 90%") after quiz completion.
- Connect the Rewards page to fetch live data (streaks, badges) from the database/service.
- Ensure the `Badge` interface in `src/data/docsData.ts` is fully supported by the backend.

## 2. Mock Data Consistency
**Context:** Seed scripts are missing fields required by the frontend `StudentNode` interface.
**Tasks:**
- Update `scripts/seed-database.ts` and `scripts/seed-personal.ts`:
  - Add `badges: []` and `streak: 0` (or realistic mock values) to student documents.
  - Ensure all fields defined in `StudentNode` are populated.
- Populate `src/data/studentsDataStatic.ts` with a comprehensive mock dataset for offline development.

## 3. Time Dependency Refactoring
**Context:** ML feature extraction relies on `new Date()`, making historical simulation difficult.
**Tasks:**
- Refactor `src/ml/features/student_features.ts`:
  - Ensure `extractMasteryFeatures` and `extractAttentionFeatures` consistently use the `referenceDate` parameter.
  - Remove default `new Date()` usage where it obscures dependency injection in tests.
- Update `src/components/planner/ScheduleView.tsx` to accept a time provider or prop for current date.

## 4. Mindful Mentor Persistence & Context
**Context:** The feature is functional but lacks memory and context awareness.
**Tasks:**
- **Persistence:** Create a `chatSessions` collection in Firestore. Store messages with timestamps.
- **Context Injection:** Update `src/app/(main)/mentor/actions.ts` to:
  - Fetch the student's recent `quizResults` and `masteryScores`.
  - Summarize this context (e.g., "Struggling with Algebra") and pass it to the Genkit prompt.
- **UI Update:** Update `mentor/page.tsx` to load previous chat history on mount.
