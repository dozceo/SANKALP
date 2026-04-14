# Feature Activation Edge Case Report: Cramming Helper

## 1. Objective
To test the conditional feature activation logic for the "Cramming Helper" feature on the Syllabus page, specifically focusing on the "simulated exam date" logic and its handling of timezones, boundary conditions, and date formats.

## 2. Methodology
A standalone test script (`scripts/test-cramming-activation.js`) was created to simulate the activation logic used in `src/app/(main)/syllabus/page.tsx`. The logic under test is:

```javascript
const timeDiff = examDate.getTime() - today.getTime();
const daysUntilExam = Math.ceil(timeDiff / (1000 * 3600 * 24));
const isCrammingTime = daysUntilExam <= 3 && daysUntilExam >= 1;
```

The script tested various scenarios including standard activation windows, boundary conditions (exactly 3 days, < 1 day), past exams, and timezone-like offsets.

## 3. Findings

| Test Case | Scenario | Result (Days) | Activation Status | Analysis |
| :--- | :--- | :--- | :--- | :--- |
| **Standard** | 2 days before exam | 2 | **Active** | Expected behavior. |
| **Boundary Max** | Exactly 3 days (72h) before | 3 | **Active** | Expected behavior. Inclusive upper bound. |
| **Boundary Exceeded** | 3 days + 1 second before | 4 | **Inactive** | Expected behavior. `Math.ceil` pushes any fraction over 3 to 4. |
| **Boundary Min** | Exactly 1 day (24h) before | 1 | **Active** | Expected behavior. Inclusive lower bound. |
| **Intra-day** | 23 hours before exam | 1 | **Active** | **Note:** Any positive time difference <= 24h is rounded up to 1 day. This means the feature is active even 5 minutes before the exam. |
| **Same Time** | Exam time = Current time | 0 | **Inactive** | Expected behavior. Logic requires `>= 1`. |
| **Exam Passed** | Current time > Exam time | Negative | **Inactive** | Expected behavior. |
| **Timezones** | Late night user (23:00) vs Early exam (08:00) | 1 | **Active** | Correctly handles short durations across midnight boundaries. |

## 4. Observations & Recommendations

1.  **"Day" Definition:** The logic uses `Math.ceil` on the millisecond difference. This means "1 day" effectively translates to "any time in the future up to 24 hours". This is generally safe for a cramming helper, ensuring it stays active until the very moment of the exam.
2.  **Timezone Robustness:** Since `Date.getTime()` returns UTC timestamps, the logic is robust against timezone differences as long as the `examDate` and `today` objects are correctly instantiated with their respective timezones.
    *   *Recommendation:* Ensure the `examDate` stored in the database includes timezone information or is normalized to UTC to prevent "off-by-one-day" errors where a user might miss the activation window due to timezone misalignment.
3.  **Demonstration Logic:** The current implementation in `src/app/(main)/syllabus/page.tsx` uses hardcoded dates for demonstration:
    ```javascript
    const examDate = new Date();
    examDate.setDate(examDate.getDate() + 2);
    ```
    This must be replaced with real user data before production.

## 5. Conclusion
The activation logic is sound and handles edge cases safely. The use of `Math.ceil` ensures the feature remains available during the critical final hours before an exam. No logical bugs were found in the core calculation.
