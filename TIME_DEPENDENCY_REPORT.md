# Time Dependency Report

## Executive Summary
The application currently relies on direct system time access (`Date.now()`, `new Date()`) and hardcoded date logic, particularly for exam scheduling. This tight coupling makes testing time-sensitive features (e.g., spaced repetition, forgetting curves) difficult and prevents the reliable simulation of student progression scenarios.

## Identified Issues

### 1. Hardcoded Exam Date
*   **Location:** `src/app/(main)/syllabus/page.tsx`
*   **Code:** `examDate.setDate(examDate.getDate() + 2); // Set exam date to 2 days from now for demonstration`
*   **Impact:** The "Exam Date" is permanently fixed to 2 days in the future relative to the user's visit. This prevents testing "Cramming Mode" scenarios (triggered < 24h before exam) or long-term planning. It also confuses real users who expect persistent exam dates.

### 2. Direct System Time Usage
*   **Locations:**
    *   `src/ml/features/student_features.ts`: `const now = referenceDate.getTime();` where `referenceDate` defaults to `new Date()`. This allows for dependency injection during testing, but the *default* behavior is still tied to system time.
    *   `src/components/planner/ScheduleView.tsx`: `new Date()` used for sorting and review due status.
    *   `src/lib/db-helpers-extended.ts`: `nextReviewDate.setDate(...)` calculations.
*   **Impact:** Unit tests for these components cannot reliably simulate "past" or "future" states without mocking the global `Date` object or explicitly passing the reference date.

### 3. Lack of Simulation Capabilities
*   **Issue:** The system cannot run "faster than real-time" simulations or "time travel" to debug historical data issues because time is fetched directly from the system clock.
*   **Impact:** Verifying long-term learning patterns (e.g., spaced repetition effectiveness over months) requires waiting real-time or risky manual DB manipulation.

## Recommendations

### 1. Implement Time Service
Introduce a `TimeProvider` or `TimeService` abstraction:

```typescript
interface ITimeProvider {
    now(): Date;
    today(): Date;
}

class SystemTimeProvider implements ITimeProvider {
    now() { return new Date(); }
    today() { ... }
}

class SimulatedTimeProvider implements ITimeProvider {
    constructor(private fixedTime: Date) {}
    now() { return this.fixedTime; }
    // ...
}
```

### 2. Configurable Exam Dates
*   Remove the hardcoded logic in `syllabus/page.tsx`.
*   Fetch the exam date from the student's profile or a specific `ExamSchedule` collection.
*   Allow users (or admins/devs) to set this date via UI or API.

### 3. Refactor Time-Sensitive Logic
*   Ensure callers of `extractMasteryFeatures` and `extractAttentionFeatures` utilize the `referenceDate` parameter for testing scenarios.
*   Refactor `ScheduleView.tsx` and other UI components to accept `Date` props or use the `TimeProvider` instead of `new Date()`.

## Verification
*   **Timestamp:** 2024-05-24
*   **Auditor:** Jules (AI Assistant)
