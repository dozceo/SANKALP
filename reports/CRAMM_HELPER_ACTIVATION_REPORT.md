# Cramming Helper Activation Logic Edge Case Report

## Logic Tested

```javascript
const timeDiff = examDate.getTime() - today.getTime();
const daysUntilExam = Math.ceil(timeDiff / (1000 * 3600 * 24));
const isCrammingTime = daysUntilExam <= 3 && daysUntilExam >= 1;
```

## Test Cases

| Test Case | Days Until Exam (Calc) | Expected | Actual | Status |
|---|---|---|---|---|
| Standard Activation Window (2 days before) | 2 | true | true | PASS |
| Boundary Condition: 3 days before | 3 | true | true | PASS |
| Boundary Condition: 1 day before | 1 | true | true | PASS |
| Too Early (4 days before) | 4 | false | false | PASS |
| Too Late (Same day) | 0 | false | false | PASS |
| Past Exam | -1 | false | false | PASS |
| Timezone Edge Case: Late Night vs Early Morning | 4 | false | false | PASS |
| Timezone Edge Case: Just inside window | 3 | true | true | PASS |

## Summary

- **Total Tests**: 8
- **Passed**: 8
- **Failed**: 0

## Recommendations

1. **Timezone Handling**: The current implementation uses `new Date()` (local time) mixed with potential UTC dates from props/API. Ensure strict UTC handling or consistent local time usage.
2. **Partial Days**: `Math.ceil` behavior means any fraction of a day pushes the count up. E.g., 3.01 days becomes 4 days (Inactive). This might exclude users late at night before the 3-day window starts.
3. **Same Day**: Currently strictly `>= 1`. If a user is cramming on the morning of the exam (0 days away), the feature disables itself. Consider changing to `>= 0`.
