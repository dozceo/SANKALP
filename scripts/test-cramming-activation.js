
function isCrammingTime(today, examDate) {
    const timeDiff = examDate.getTime() - today.getTime();
    const daysUntilExam = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return {
        isCrammingTime: daysUntilExam <= 3 && daysUntilExam >= 1,
        daysUntilExam,
        timeDiffMs: timeDiff
    };
}

function runTest(name, todayStr, examDateStr) {
    const today = new Date(todayStr);
    const examDate = new Date(examDateStr);
    const result = isCrammingTime(today, examDate);
    console.log(`Test: ${name}`);
    console.log(`  Today: ${today.toISOString()}`);
    console.log(`  Exam:  ${examDate.toISOString()}`);
    console.log(`  Diff (days): ${result.daysUntilExam}`);
    console.log(`  Active: ${result.isCrammingTime}`);
    console.log('--------------------------------------------------');
}

console.log('--- Cramming Helper Activation Logic Tests ---\n');

// 1. Standard Case: 2 days before (Active)
runTest('Standard 2 Days Before', '2023-10-01T10:00:00Z', '2023-10-03T10:00:00Z');

// 2. Boundary: Exactly 3 days before (Active)
runTest('Boundary 3 Days Before', '2023-10-01T10:00:00Z', '2023-10-04T10:00:00Z');

// 3. Boundary: Just over 3 days before (Inactive)
// 3 days + 1 second
runTest('Boundary Just Over 3 Days', '2023-10-01T09:59:59Z', '2023-10-04T10:00:00Z');

// 4. Boundary: Exactly 1 day before (Active)
runTest('Boundary 1 Day Before', '2023-10-02T10:00:00Z', '2023-10-03T10:00:00Z');

// 5. Boundary: Less than 1 day before (e.g. 23 hours) (Active)
// 23 hours -> ceil -> 1 day
runTest('Less than 1 Day Before (23h)', '2023-10-02T11:00:00Z', '2023-10-03T10:00:00Z');

// 6. Same day (Inactive)
// 0 hours -> 0 days
runTest('Same Day', '2023-10-03T08:00:00Z', '2023-10-03T10:00:00Z');

// 7. Exam Passed (Inactive)
runTest('Exam Passed', '2023-10-04T10:00:00Z', '2023-10-03T10:00:00Z');

// 8. Timezone Edge Case: Late night vs Early morning
// User is at 23:00, Exam is next day 08:00 (9 hours diff) -> ceil(0.375) -> 1 -> Active
runTest('Late Night / Early Morning', '2023-10-02T23:00:00Z', '2023-10-03T08:00:00Z');

// 9. Timezone Edge Case: User thinks it's 4 days away, but strict time says 3.1 days
// User: 2023-10-01T08:00, Exam: 2023-10-04T10:00. Diff: 3 days 2 hours -> ceil -> 4 -> Inactive
runTest('Strict Time Check (3d 2h)', '2023-10-01T08:00:00Z', '2023-10-04T10:00:00Z');
