# Time Dependency Report

## Executive Summary
This report identifies critical time dependencies and hardcoded date logic within the Student Intelligence Platform. Specifically, it highlights the use of `new Date()` directly in components and the presence of hardcoded exam dates, which compromise the platform's testability and the realism of time-sensitive simulations (e.g., "Exam Countdown").

## Scope
- **Components Audited**:
    - `src/app/(main)/syllabus/page.tsx`: The main syllabus and exam prep page.
    - `src/components/planner/ScheduleView.tsx`: The daily schedule view.
    - `src/ml/features/student_features.ts`: ML feature extraction logic.

## Findings

### 1. Hardcoded Exam Date Logic
- **Issue**: The Syllabus Page hardcodes the "Exam Date" to always be 2 days from the current date.
- **Evidence**: `src/app/(main)/syllabus/page.tsx`:
  ```typescript
  const examDate = new Date();
  examDate.setDate(examDate.getDate() + 2); // Set exam date to 2 days from now for demonstration
  ```
- **Impact**: This prevents users from setting their actual exam dates. Every time the page loads, the exam is perpetually "2 days away", making long-term planning features (like "Cramming Mode" activation logic) impossible to test realistically over time.

### 2. Direct `new Date()` Usage in Components
- **Issue**: Components rely directly on `new Date()` or `Date.now()`, making them difficult to test deterministically (e.g., verifying "Due Today" logic requires mocking the system clock).
- **Evidence**:
    - `ScheduleView.tsx`: `const upcomingDeadlines = ... new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime()`
    - `ScheduleView.tsx`: `const daysUntil = Math.ceil((new Date(material.nextReview).getTime() - Date.now()) ...)`
- **Impact**: Unit tests for time-sensitive logic (like "Overdue" badges) become flaky if run near midnight or in different time zones.

### 3. ML Feature Timestamping
- **Issue**: ML features use `new Date()` as a default value for reference dates.
- **Evidence**: `src/ml/features/student_features.ts`: `referenceDate: Date = new Date()`
- **Impact**: Feature generation is implicitly tied to execution time, which can lead to inconsistencies when backfilling historical data or re-running training pipelines.

## Recommendations

### Short Term
1.  **Injectable Date Provider**: Create a `useTime()` hook or context that provides `now` and methods like `getToday()`. In tests, this provider can be mocked to return a fixed date.
2.  **Configurable Exam Date**: Replace the hardcoded `examDate` in `SyllabusPage` with a state variable initialized from user preferences (stored in `StudentNode` or local storage).

### Long Term
1.  **Time Travel Debugging**: Implement a "Time Travel" developer tool that allows testing the application as if it were a future date. This is crucial for verifying long-term study plans (e.g., "Spaced Repetition" schedules).
2.  **Server-Side Time Authority**: Use a consistent server-side timestamp (e.g., Firestore server timestamp) for critical events to avoid client-side clock skew issues.

## Conclusion
Hardcoded dates and direct system clock usage are significant technical debt. Refactoring to use an injectable Time Provider is a high-priority task to enable robust testing and realistic user scheduling features.
