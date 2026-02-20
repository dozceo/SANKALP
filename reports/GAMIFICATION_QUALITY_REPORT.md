# Gamification Quality Report

## Executive Summary
This report audits the gamification elements (points, badges, streaks) within the Student Intelligence Platform. The primary findings indicate that while the UI components for gamification exist, the underlying logic is largely static, inconsistent, or simulated, lacking a robust "engine" to drive genuine user engagement.

## Scope
- **Components Audited**:
    - `src/app/(main)/rewards/page.tsx`: The main rewards dashboard.
    - `src/lib/rewards/calculateRewards.ts`: Utility functions for calculating progress.
    - `src/data/docsData.ts`: Definition of `Badge` and `StudentNode` types.
- **Features Audited**: Badges, Streaks, Progress Projections, Daily Motivation.

## Findings

### 1. Inconsistent Badge Awarding Logic
- **Issue**: Badges are defined in the static data (`docsData.ts`) and displayed in the UI, but there is no visible event-driven logic to "award" these badges dynamically based on user actions (e.g., completing a quiz, maintaining a streak).
- **Evidence**: `getStudentBadges` in `calculateRewards.ts` simply returns `student?.badges || []`. There is no "BadgeService" or event listener that updates this array.
- **Impact**: Users may complete tasks but not receive immediate feedback or rewards, leading to demotivation.

### 2. Static Streak Implementation
- **Issue**: The "Streak" is represented as a simple number field (`streak`) on the `StudentNode` object.
- **Evidence**: `src/app/(main)/rewards/page.tsx` displays `{currentStudent?.streak || 0}`. There is no logic to reset the streak if a day is missed or increment it upon daily activity.
- **Impact**: The streak metric is unreliable and easily manipulated or broken, losing its value as a habit-building tool.

### 3. Simulated Progress Projections
- **Issue**: The "Projected You" chart, intended to motivate users by showing potential growth, is based on hardcoded simulation logic rather than a predictive model using historical data.
- **Evidence**: `getProgressProjection` in `calculateRewards.ts` uses hardcoded decrements (e.g., `averageMastery - 30`) to generate "Past" and "Projected" data points.
- **Impact**: Misleading visualization that does not reflect the user's actual learning trajectory.

### 4. Hardcoded Motivation
- **Issue**: The "Daily Motivation" section displays a static quote.
- **Evidence**: `src/app/(main)/rewards/page.tsx` hardcodes: `"The secret to getting ahead is getting started." - Mark Twain`.
- **Impact**: Repetitive content quickly loses its motivational effect.

## Recommendations

### Short Term
1.  **Implement Streak Logic**: Create a daily job or login hook to check `lastActive` date. If `today - lastActive > 1 day`, reset streak. If `today - lastActive == 1 day`, increment.
2.  **Dynamic Motivation**: Create a small library of quotes and cycle them daily, or use an LLM to generate context-aware encouragement.

### Long Term
1.  **Event-Driven Badge System**: Implement a `BadgeService` that listens for events (e.g., `QUIZ_COMPLETED`, `TOPIC_MASTERED`) and evaluates conditions to award badges.
2.  **Real Predictive Modeling**: Connect the "Projected You" chart to the ML model's mastery predictions over time, using the `mastery_score` history.

## Conclusion
The current gamification features are "skeletal" UI elements without the necessary backend logic to function as true behavioral reinforcements. Prioritizing the implementation of a real Streak and Badge engine is critical for sustained student engagement.
