
/**
 * Simulates the Cramming Helper activation logic found in src/app/(main)/syllabus/page.tsx.
 *
 * Original Logic:
 * const examDate = new Date();
 * examDate.setDate(examDate.getDate() + 2);
 * const today = new Date();
 * const timeDiff = examDate.getTime() - today.getTime();
 * const daysUntilExam = Math.ceil(timeDiff / (1000 * 3600 * 24));
 * const isCrammingTime = daysUntilExam <= 3 && daysUntilExam >= 1;
 */

function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function subDays(date: Date, days: number): Date {
    return addDays(date, -days);
}

function checkCrammingActivation(currentDate: Date, targetExamDate: Date) {
  const timeDiff = targetExamDate.getTime() - currentDate.getTime();
  const daysUntilExam = Math.ceil(timeDiff / (1000 * 3600 * 24));
  const isCrammingTime = daysUntilExam <= 3 && daysUntilExam >= 1;

  return {
    currentDate: currentDate.toISOString(),
    examDate: targetExamDate.toISOString(),
    daysUntilExam,
    isCrammingTime,
    diffHours: timeDiff / (1000 * 3600)
  };
}

function runTests() {
  console.log("# Cramming Helper Activation Logic Edge Case Report\n");
  console.log("## Methodology");
  console.log("Simulating the time difference logic between `currentDate` and `examDate` to verify activation boundaries (1-3 days).");
  console.log("Logic under test: `Math.ceil((exam - now) / (24h))` in [1, 3]\n");

  const baseDate = new Date("2024-01-01T12:00:00Z"); // Reference "Now" (UTC)

  const scenarios = [
    {
      name: "Standard Activation (2 days out)",
      current: baseDate,
      exam: addDays(baseDate, 2),
      expected: true
    },
    {
      name: "Boundary Activation (3 days out - exact)",
      current: baseDate,
      exam: addDays(baseDate, 3),
      expected: true
    },
    {
      name: "Boundary Activation (1 day out - exact)",
      current: baseDate,
      exam: addDays(baseDate, 1),
      expected: true
    },
    {
      name: "Too Early (4 days out)",
      current: baseDate,
      exam: addDays(baseDate, 4),
      expected: false
    },
    {
      name: "Critical: Exam Day (0 days)",
      current: baseDate,
      exam: baseDate, // Exam is NOW
      expected: true // SHOULD be active on exam day!
    },
    {
      name: "Past Exam (-1 day)",
      current: baseDate,
      exam: subDays(baseDate, 1),
      expected: false
    },
    {
      name: "Just barely 3 days (3 days + 1 second)",
      current: baseDate,
      exam: new Date(baseDate.getTime() + (3 * 24 * 3600 * 1000) + 1000),
      expected: false
    },
    {
        name: "Just barely under 3 days (3 days - 1 second)",
        current: baseDate,
        exam: new Date(baseDate.getTime() + (3 * 24 * 3600 * 1000) - 1000),
        expected: true
    },
    {
      name: "Just barely 1 day (1 day - 1 second = 0.99 days)",
      current: baseDate,
      exam: new Date(baseDate.getTime() + (1 * 24 * 3600 * 1000) - 1000),
      expected: true
    },
    {
        name: "Timezone drift (Late night cramming)",
        current: new Date("2024-01-01T23:59:00Z"),
        exam: new Date("2024-01-03T09:00:00Z"), // ~1.4 days difference
        expected: true
    },
    // New Timezone Scenarios
    {
        name: "Timezone: Client ahead (Tokyo +9) - Morning cramming",
        // Client is 9AM Jan 2nd (UTC+9) = Jan 1st 24:00 UTC
        // Exam is Jan 4th 9AM (UTC+9) = Jan 3rd 24:00 UTC
        // Diff is exactly 2 days.
        current: new Date("2024-01-02T00:00:00Z"),
        exam: new Date("2024-01-04T00:00:00Z"),
        expected: true
    },
    {
        name: "Timezone: Client behind (LA -8) - Late night",
        // Client is 11PM Jan 1st (UTC-8) = Jan 2nd 07:00 UTC
        // Exam is Jan 4th 9AM (UTC-8) = Jan 4th 17:00 UTC
        // Diff is ~2.4 days
        current: new Date("2024-01-02T07:00:00Z"),
        exam: new Date("2024-01-04T17:00:00Z"),
        expected: true
    }
  ];

  console.log("## Test Results\n");
  console.log("| Scenario | Days Until | Active? | Expected | Status |");
  console.log("| :--- | :--- | :--- | :--- | :--- |");

  let passed = 0;
  for (const scenario of scenarios) {
    const result = checkCrammingActivation(scenario.current, scenario.exam);
    const isPass = result.isCrammingTime === scenario.expected;
    if (isPass) passed++;

    console.log(
      `| ${scenario.name} | ${result.daysUntilExam} | ${result.isCrammingTime} | ${scenario.expected} | ${isPass ? '✅ PASS' : '❌ FAIL'} |`
    );
  }

  console.log(`\n## Summary\n`);
  console.log(`- **Total Tests:** ${scenarios.length}`);
  console.log(`- **Passed:** ${passed}`);
  console.log(`- **Failed:** ${scenarios.length - passed}`);

  if (passed === scenarios.length) {
      console.log("\n✅ Logic covers all edge cases correctly.");
  } else {
      console.log("\n⚠️ **CRITICAL BUG DETECTED:** Logic fails on edge cases.");
      console.log("Specifically, the Exam Day (0 days) logic is flawed because `daysUntilExam >= 1` excludes 0.");
  }
}

runTests();
