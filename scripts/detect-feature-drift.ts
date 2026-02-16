
import fs from 'fs';
import path from 'path';
import {
  extractMasteryFeatures,
  MasteryFeatures,
  StudentHistory,
  RawQuizResult,
} from '../src/ml/features/student_features';

// --- Training Contract Definition ---
// Based on src/ml/training/generate_data.py
const TRAINING_CONTRACT = {
  avg_quiz_score: { min: 0.0, max: 1.0, severity: 'CRITICAL' },
  attempts_per_topic: { min: 1, max: 10, severity: 'CRITICAL' }, // Training data starts at 1
  days_since_last_revision: { min: 0, max: 30, severity: 'CRITICAL' }, // Huge drift potential
  quiz_score_variance: { min: 0.0, max: 0.3, severity: 'WARNING' }, // SD vs Variance check
  time_spent_per_question: { min: 10, max: 120, severity: 'WARNING' }, // Zero handling check
};

// --- Test Cases ---

const TEST_CASES: { name: string; history: StudentHistory; topic: string }[] = [
  {
    name: 'Cold Start (New Topic)',
    topic: 'Algebra',
    history: {
      quizResults: [],
      lastLoginDate: new Date(),
      registrationDate: new Date(),
    },
  },
  {
    name: 'Typical Student (Mastered)',
    topic: 'Algebra',
    history: {
      quizResults: [
        {
          topic: 'Algebra',
          score: 0.9,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          timeSpent: 600, // 10 mins
          questionsAttempted: 10,
        },
        {
          topic: 'Algebra',
          score: 0.85,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
          timeSpent: 500, // ~8 mins
          questionsAttempted: 10,
        },
        {
          topic: 'Algebra',
          score: 0.95,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
          timeSpent: 400, // ~6 mins
          questionsAttempted: 10,
        },
      ],
      lastLoginDate: new Date(),
      registrationDate: new Date(),
    },
  },
  {
    name: 'Inconsistent Student (High Variance/SD)',
    topic: 'Geometry',
    history: {
      quizResults: [
        {
          topic: 'Geometry',
          score: 0.0,
          timestamp: new Date(),
          timeSpent: 300,
          questionsAttempted: 10,
        },
        {
          topic: 'Geometry',
          score: 1.0,
          timestamp: new Date(),
          timeSpent: 300,
          questionsAttempted: 10,
        },
      ],
      lastLoginDate: new Date(),
      registrationDate: new Date(),
    },
  },
  {
    name: 'Speed Runner (Low Time Spent)',
    topic: 'Calculus',
    history: {
      quizResults: [
        {
          topic: 'Calculus',
          score: 0.5,
          timestamp: new Date(),
          timeSpent: 5, // 0.5s per question
          questionsAttempted: 10,
        },
      ],
      lastLoginDate: new Date(),
      registrationDate: new Date(),
    },
  },
];

// --- Report Generation ---

interface DriftViolation {
  feature: string;
  value: number;
  expectedMin: number;
  expectedMax: number;
  severity: string;
  testCase: string;
}

function generateReport(violations: DriftViolation[]): string {
  let report = `# ML Feature Engineering Drift Report\n\n`;
  report += `**Generated:** ${new Date().toISOString()}\n`;
  report += `**Source Analysis:** \`src/ml/features/student_features.ts\` vs \`src/ml/training/generate_data.py\`\n\n`;

  report += `## Summary\n`;
  if (violations.length === 0) {
    report += `✅ No significant drift detected between Feature Engineering and Training Data.\n`;
  } else {
    const critical = violations.filter((v) => v.severity === 'CRITICAL').length;
    const warning = violations.filter((v) => v.severity === 'WARNING').length;
    report += `⚠️ **Drift Detected:** ${critical} CRITICAL, ${warning} WARNING violations.\n\n`;
  }

  report += `## Training Contract (Assumptions)\n`;
  report += `| Feature | Expected Range | Severity |\n`;
  report += `|---|---|---|\n`;
  for (const [key, contract] of Object.entries(TRAINING_CONTRACT)) {
    report += `| \`${key}\` | ${contract.min} - ${contract.max} | ${contract.severity} |\n`;
  }
  report += `\n`;

  report += `## Detailed Violations\n`;
  if (violations.length === 0) {
    report += `No violations found.\n`;
  } else {
    // Group by Test Case
    const cases = [...new Set(violations.map((v) => v.testCase))];
    for (const testCase of cases) {
      report += `### Test Case: ${testCase}\n`;
      const caseViolations = violations.filter((v) => v.testCase === testCase);
      report += `| Feature | Value | Expected Range | Severity | Description |\n`;
      report += `|---|---|---|---|---|\n`;
      for (const v of caseViolations) {
        let desc = '';
        if (v.feature === 'days_since_last_revision' && v.value === 999) {
          desc = 'Cold Start default (999) far exceeds training max (30).';
        } else if (v.feature === 'quiz_score_variance' && v.value > 0.3) {
          desc = 'Calculated SD exceeds training Variance range (Likely SD vs Variance mismatch).';
        } else if (v.feature === 'time_spent_per_question' && v.value < 10) {
          desc = 'Time spent is below training minimum (10s).';
        } else if (v.feature === 'attempts_per_topic' && v.value === 0) {
           desc = 'Zero attempts (Cold Start) not covered in training data.';
        }
        report += `| \`${v.feature}\` | ${v.value.toFixed(4)} | ${v.expectedMin} - ${v.expectedMax} | **${v.severity}** | ${desc} |\n`;
      }
      report += `\n`;
    }
  }

  report += `## Recommendations\n`;
  report += `1. **Cold Start Handling:** The model is not trained on \`attempts_per_topic=0\` or \`days_since_last_revision=999\`. Retrain model with synthetic "new user" data or update feature extractor to normalize these values (e.g., clamp days to 30).\n`;
  report += `2. **Variance vs Standard Deviation:** TypeScript calculates SD (\`Math.sqrt(variance)\`) but Python generates low-range values labeled "variance" (0.0-0.3). If Python meant Variance, SD would be 0.0-0.55. Confirm definition and standardize.\n`;
  report += `3. **Time Spent Normalization:** Handle extremely low time-spent values (e.g., < 5s) to avoid outlier predictions.\n`;

  return report;
}

// --- Main Execution ---

async function run() {
  console.log('🔍 Running Feature Drift Detection...');
  const violations: DriftViolation[] = [];

  for (const testCase of TEST_CASES) {
    console.log(`Testing: ${testCase.name}`);
    const features = extractMasteryFeatures(testCase.topic, testCase.history);

    for (const [key, value] of Object.entries(features)) {
      if (key in TRAINING_CONTRACT) {
        // @ts-ignore
        const contract = TRAINING_CONTRACT[key];
        // @ts-ignore
        const val = value as number;

        if (val < contract.min || val > contract.max) {
            // Special handling: if attempts is 0, we expect days to be weird, but let's log it all
          violations.push({
            feature: key,
            value: val,
            expectedMin: contract.min,
            expectedMax: contract.max,
            severity: contract.severity,
            testCase: testCase.name,
          });
        }
      }
    }
  }

  const report = generateReport(violations);
  fs.writeFileSync('ML_DRIFT_REPORT.md', report);
  console.log('✅ Drift Report Generated: ML_DRIFT_REPORT.md');
}

run().catch(console.error);
