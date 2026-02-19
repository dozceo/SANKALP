
import fs from 'fs';
import path from 'path';

const REPORT_PATH = path.join(process.cwd(), 'reports', 'CRAMM_HELPER_ACTIVATION_REPORT.md');

// Replicated Logic from src/app/(main)/syllabus/page.tsx
function isCrammingActive(today: Date, examDate: Date): { isActive: boolean, daysUntilExam: number } {
  const timeDiff = examDate.getTime() - today.getTime();
  const daysUntilExam = Math.ceil(timeDiff / (1000 * 3600 * 24));
  const isActive = daysUntilExam <= 3 && daysUntilExam >= 1;
  return { isActive, daysUntilExam };
}

interface TestCase {
  name: string;
  today: string; // ISO string
  examDate: string; // ISO string
  expectedActive: boolean;
  description: string;
}

const testCases: TestCase[] = [
  {
    name: "Standard Activation Window (2 days before)",
    today: "2023-10-01T10:00:00.000Z",
    examDate: "2023-10-03T10:00:00.000Z",
    expectedActive: true,
    description: "Exam is exactly 2 days away. Should be active."
  },
  {
    name: "Boundary Condition: 3 days before",
    today: "2023-10-01T10:00:00.000Z",
    examDate: "2023-10-04T10:00:00.000Z",
    expectedActive: true,
    description: "Exam is exactly 3 days away. Should be active (<= 3)."
  },
  {
    name: "Boundary Condition: 1 day before",
    today: "2023-10-01T10:00:00.000Z",
    examDate: "2023-10-02T10:00:00.000Z",
    expectedActive: true,
    description: "Exam is exactly 1 day away. Should be active (>= 1)."
  },
  {
    name: "Too Early (4 days before)",
    today: "2023-10-01T10:00:00.000Z",
    examDate: "2023-10-05T10:00:00.000Z",
    expectedActive: false,
    description: "Exam is 4 days away. Should be inactive (> 3)."
  },
  {
    name: "Too Late (Same day)",
    today: "2023-10-01T10:00:00.000Z",
    examDate: "2023-10-01T10:00:00.000Z",
    expectedActive: false,
    description: "Exam is today (0 days away). Should be inactive (< 1)."
  },
  {
    name: "Past Exam",
    today: "2023-10-02T10:00:00.000Z",
    examDate: "2023-10-01T10:00:00.000Z",
    expectedActive: false,
    description: "Exam was yesterday. Should be inactive."
  },
  {
    name: "Timezone Edge Case: Late Night vs Early Morning",
    today: "2023-10-01T23:00:00.000Z", // 11 PM
    examDate: "2023-10-05T01:00:00.000Z", // 1 AM, 4 days later roughly
    expectedActive: false, // Diff is 3 days + 2 hours = 3.08 days -> ceil(3.08) = 4 days
    description: "3 days + 2 hours difference. ceil(3.08) is 4. Should be inactive."
  },
  {
    name: "Timezone Edge Case: Just inside window",
    today: "2023-10-01T23:00:00.000Z",
    examDate: "2023-10-04T22:00:00.000Z", // Diff is nearly 3 days
    expectedActive: true, // Diff is < 3 days.
    description: "Less than 3 days difference. Should be active."
  }
];

function runTests() {
  let report = `# Cramming Helper Activation Logic Edge Case Report\n\n`;
  report += `## Logic Tested\n\n`;
  report += `\`\`\`javascript
const timeDiff = examDate.getTime() - today.getTime();
const daysUntilExam = Math.ceil(timeDiff / (1000 * 3600 * 24));
const isCrammingTime = daysUntilExam <= 3 && daysUntilExam >= 1;
\`\`\`\n\n`;

  report += `## Test Cases\n\n`;
  report += `| Test Case | Days Until Exam (Calc) | Expected | Actual | Status |\n`;
  report += `|---|---|---|---|---|\n`;

  let passed = 0;
  testCases.forEach(tc => {
    const today = new Date(tc.today);
    const examDate = new Date(tc.examDate);
    const result = isCrammingActive(today, examDate);

    const status = result.isActive === tc.expectedActive ? "PASS" : "FAIL";
    if (status === "PASS") passed++;

    report += `| ${tc.name} | ${result.daysUntilExam} | ${tc.expectedActive} | ${result.isActive} | ${status} |\n`;
  });

  report += `\n## Summary\n\n`;
  report += `- **Total Tests**: ${testCases.length}\n`;
  report += `- **Passed**: ${passed}\n`;
  report += `- **Failed**: ${testCases.length - passed}\n`;

  report += `\n## Recommendations\n\n`;
  report += `1. **Timezone Handling**: The current implementation uses \`new Date()\` (local time) mixed with potential UTC dates from props/API. Ensure strict UTC handling or consistent local time usage.\n`;
  report += `2. **Partial Days**: \`Math.ceil\` behavior means any fraction of a day pushes the count up. E.g., 3.01 days becomes 4 days (Inactive). This might exclude users late at night before the 3-day window starts.\n`;
  report += `3. **Same Day**: Currently strictly \`>= 1\`. If a user is cramming on the morning of the exam (0 days away), the feature disables itself. Consider changing to \`>= 0\`.\n`;

  // Create directory if it doesn't exist
  const dir = path.dirname(REPORT_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(REPORT_PATH, report);
  console.log(`Report generated at: ${REPORT_PATH}`);
}

runTests();
