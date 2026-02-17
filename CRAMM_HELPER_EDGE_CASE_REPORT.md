# Cramming Helper Activation Logic Edge Case Report

## Methodology
Simulating the time difference logic between `currentDate` and `examDate` to verify activation boundaries (1-3 days).
Logic under test: `Math.ceil((exam - now) / (24h))` in [1, 3]

## Test Results

| Scenario | Days Until | Active? | Expected | Status |
| :--- | :--- | :--- | :--- | :--- |
| Standard Activation (2 days out) | 2 | true | true | ✅ PASS |
| Boundary Activation (3 days out - exact) | 3 | true | true | ✅ PASS |
| Boundary Activation (1 day out - exact) | 1 | true | true | ✅ PASS |
| Too Early (4 days out) | 4 | false | false | ✅ PASS |
| Critical: Exam Day (0 days) | 0 | false | true | ❌ FAIL |
| Past Exam (-1 day) | -1 | false | false | ✅ PASS |
| Just barely 3 days (3 days + 1 second) | 4 | false | false | ✅ PASS |
| Just barely under 3 days (3 days - 1 second) | 3 | true | true | ✅ PASS |
| Just barely 1 day (1 day - 1 second = 0.99 days) | 1 | true | true | ✅ PASS |
| Timezone drift (Late night cramming) | 2 | true | true | ✅ PASS |

## Summary

- **Total Tests:** 10
- **Passed:** 9
- **Failed:** 1

⚠️ **CRITICAL BUG DETECTED:** Logic fails on edge cases.
Specifically, the Exam Day (0 days) logic is flawed because `daysUntilExam >= 1` excludes 0.
