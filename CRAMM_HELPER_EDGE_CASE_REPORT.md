# Cramming Helper Activation Logic Edge Case Report

## Executive Summary
An automated simulation of the Cramming Helper activation logic was performed to test edge cases related to exam dates, timezones, and boundary conditions. The test revealed critical logic flaws in both the Frontend component and the ADK Decision Engine that prevent the feature from activating on the day of the exam and erroneously activate it for past exams.

## Methodology
A test script (`scripts/test-cramming-activation.ts`) was created to replicate:
1.  **Frontend Logic**: The `isCrammingTime` calculation from `src/app/(main)/syllabus/page.tsx`.
2.  **ADK Logic**: The Policy Rule 0 (Cramming Mode) from `src/ai/adk/decision-engine.ts`.

The script simulated `daysUntilExam` values of 0, 1, 3, 4, -1, and fractional days (12 hours).

## Findings

### 1. Exam Day Failure (Critical)
**Scenario:** The exam is today (`daysUntilExam = 0`).
-   **Frontend Behavior:** `isCrammingTime` evaluates to `false`.
    -   *Logic:* `daysUntilExam <= 3 && daysUntilExam >= 1`.
    -   *Result:* 0 is not >= 1.
-   **ADK Behavior:** Decision defaults to `SCHEDULED_REVISION`.
    -   *Logic:* `if (daysUntilExam && daysUntilExam <= 3 ...)`
    -   *Result:* `daysUntilExam` (0) evaluates as falsy in JavaScript, causing the condition to fail immediately.
-   **Impact:** Students cannot access cramming tools on the most critical day.

### 2. Past Exam Activation (ADK Bug)
**Scenario:** The exam was yesterday (`daysUntilExam = -1`).
-   **Frontend Behavior:** `isCrammingTime` evaluates to `false` (Correct).
-   **ADK Behavior:** Decision activates `URGENT_REVISION` (Cramming Mode).
    -   *Logic:* `-1` is truthy and `-1 <= 3`.
    -   *Result:* The system recommends cramming for an exam that has already passed.
-   **Impact:** Irrelevant recommendations for completed topics.

### 3. Boundary Conditions
-   **12 Hours Until Exam:**
    -   Calculated as `daysUntilExam = 1` (due to `Math.ceil`).
    -   Correctly activates Cramming Mode.
-   **4 Days Until Exam:**
    -   Correctly identified as Routine Revision (not Cramming).

## Recommendations

### Frontend Fix
Update the condition in `src/app/(main)/syllabus/page.tsx`:
```typescript
// Current
const isCrammingTime = daysUntilExam <= 3 && daysUntilExam >= 1;

// Recommended
const isCrammingTime = daysUntilExam <= 3 && daysUntilExam >= 0;
```

### ADK Logic Fix
Update the Policy Rule 0 in `src/ai/adk/decision-engine.ts`:
```typescript
// Current
if (daysUntilExam && daysUntilExam <= 3 && mastery_probability < 0.6)

// Recommended
if (daysUntilExam !== undefined && daysUntilExam >= 0 && daysUntilExam <= 3 && mastery_probability < 0.6)
```

## Conclusion
The current logic implementation contains off-by-one errors and truthy/falsy evaluation pitfalls that compromise the feature's reliability during the critical exam window. Immediate remediation is recommended.
