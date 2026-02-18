import { extractMasteryFeatures, StudentHistory, RawQuizResult, MasteryFeatures } from "../src/ml/features/student_features";
import * as fs from 'fs';

/**
 * ML Drift Detector - Feature Extraction Validator
 *
 * This script programmatically validates feature extraction logic against the assumptions
 * baked into the training data generation script (`src/ml/training/generate_data.py`).
 *
 * It generates a drift report mapping feature names to type/range mismatches with severity classification.
 */

// TRAINING DATA ASSUMPTIONS (Derived from generate_data.py)
const TRAINING_CONSTRAINTS = {
  avg_quiz_score: { min: 0.0, max: 1.0, type: 'float' },
  attempts_per_topic: { min: 1, max: 10, type: 'int' }, // Generated range: 1-10
  days_since_last_revision: { min: 0, max: 30, type: 'int' }, // Generated range: 0-30
  quiz_score_variance: { min: 0.0, max: 0.5, type: 'float' }, // Generated range: 0-0.5
  time_spent_per_question: { min: 10, max: 120, type: 'float' }, // Generated range: 10-120
};

type Severity = 'CRITICAL' | 'WARNING' | 'INFO';

interface DriftFinding {
  feature: string;
  expected: string;
  actual: string;
  severity: Severity;
  scenario: string;
}

function checkConstraint(featureName: string, value: number, constraint: { min: number; max: number; type: string }): DriftFinding | null {
  // Range Check
  if (value < constraint.min || value > constraint.max) {
    // Severity logic:
    // If variance exceeds 0.5, it's a semantic mismatch (StdDev vs Variance) -> CRITICAL
    // If days_since_last_revision is negative -> CRITICAL (Invalid Logic)
    // If days_since_last_revision > max -> WARNING (Out of distribution)
    // If time_spent is out of range -> WARNING (Out of distribution)

    let severity: Severity = 'WARNING';
    if (featureName === 'quiz_score_variance' && value > 0.5) severity = 'CRITICAL';
    if (featureName === 'days_since_last_revision' && value < 0) severity = 'CRITICAL';
    if (featureName === 'avg_quiz_score' && (value < 0 || value > 1)) severity = 'CRITICAL';

    return {
      feature: featureName,
      expected: `Range [${constraint.min}, ${constraint.max}]`,
      actual: `${value}`,
      severity,
      scenario: '' // Filled by caller
    };
  }
  return null;
}

function runDriftAnalysis() {
  console.log("🔍 Starting ML Feature Drift Analysis...\n");
  const findings: DriftFinding[] = [];

  // Scenario 1: New Student (No History)
  const newStudentHistory: StudentHistory = {
    quizResults: [],
    lastLoginDate: new Date(),
    registrationDate: new Date(),
  };
  const newFeatures = extractMasteryFeatures("math_101", newStudentHistory);
  validateFeatures(newFeatures, "New Student (0 Quizzes)", findings);

  // Scenario 2: Active Student (Normal Range)
  const activeHistory: StudentHistory = {
    quizResults: [
      { topic: "math_101", score: 0.8, timestamp: new Date(), timeSpent: 60, questionsAttempted: 10 },
      { topic: "math_101", score: 0.9, timestamp: new Date(Date.now() - 86400000), timeSpent: 60, questionsAttempted: 10 },
    ],
    lastLoginDate: new Date(),
    registrationDate: new Date(),
  };
  const activeFeatures = extractMasteryFeatures("math_101", activeHistory);
  validateFeatures(activeFeatures, "Active Student (Normal)", findings);

  // Scenario 3: Returning Student (Long Absence)
  // 60 days inactive -> Expect days_since_last_revision ~ 60 (Constraint is 0-30)
  const returningHistory: StudentHistory = {
    quizResults: [
      { topic: "math_101", score: 0.8, timestamp: new Date(Date.now() - 60 * 86400000), timeSpent: 60, questionsAttempted: 10 },
    ],
    lastLoginDate: new Date(),
    registrationDate: new Date(),
  };
  const returningFeatures = extractMasteryFeatures("math_101", returningHistory);
  validateFeatures(returningFeatures, "Returning Student (60 Days Inactive)", findings);

  // Scenario 4: Variance vs StdDev Check
  // Scores: [0.0, 1.0]. Mean 0.5. Variance 0.25. StdDev 0.5.
  // Constraint max is 0.5. So 0.5 is acceptable numerically, but semantically risky.
  // Let's force a case that exceeds 0.5 if possible. Max StdDev for [0,1] is 0.5.
  // So StdDev will never exceed 0.5.
  // BUT, if training data uses Variance (0.25 max), and we return StdDev (0.5 max),
  // we are consistently inflating the "inconsistency" metric.
  // A variance of 0.04 (StdDev 0.2) is small.
  // If we feed 0.2 to a model trained on 0.04, it sees 5x the value.
  const varianceHistory: StudentHistory = {
    quizResults: [
      { topic: "math_101", score: 0.0, timestamp: new Date(), timeSpent: 60, questionsAttempted: 10 },
      { topic: "math_101", score: 1.0, timestamp: new Date(), timeSpent: 60, questionsAttempted: 10 },
    ],
    lastLoginDate: new Date(),
    registrationDate: new Date(),
  };
  const varianceFeatures = extractMasteryFeatures("math_101", varianceHistory);
  validateFeatures(varianceFeatures, "High Variance Student", findings);

  // Custom check for Variance/StdDev naming ambiguity
  if (varianceFeatures.quiz_score_variance > 0.25) {
      findings.push({
          feature: 'quiz_score_variance',
          expected: 'Variance (<= 0.25 for [0,1])',
          actual: `${varianceFeatures.quiz_score_variance} (Likely StdDev)`,
          severity: 'CRITICAL', // High severity because it alters model inputs significantly
          scenario: 'High Variance Student'
      });
  }

  // Scenario 5: Future Date (Time Travel)
  const futureHistory: StudentHistory = {
      quizResults: [
          { topic: "math_101", score: 0.8, timestamp: new Date(Date.now() + 86400000), timeSpent: 60, questionsAttempted: 10 }
      ],
      lastLoginDate: new Date(),
      registrationDate: new Date()
  };
  const futureFeatures = extractMasteryFeatures("math_101", futureHistory);
  validateFeatures(futureFeatures, "Future Date Student", findings);


  // Generate Report
  generateReport(findings);
}

function validateFeatures(features: MasteryFeatures, scenario: string, findings: DriftFinding[]) {
  Object.keys(features).forEach((key) => {
    const k = key as keyof MasteryFeatures;
    const value = features[k];
    const constraint = TRAINING_CONSTRAINTS[k as keyof typeof TRAINING_CONSTRAINTS];

    if (constraint) {
      const finding = checkConstraint(key, value, constraint);
      if (finding) {
        finding.scenario = scenario;
        findings.push(finding);
      }
    }
  });
}

function generateReport(findings: DriftFinding[]) {
  console.log("\n\n📊 DRIFT DETECTION REPORT");
  console.log("===========================");

  let reportContent = `# ML Feature Drift Report\n\n`;
  reportContent += `**Date:** ${new Date().toISOString()}\n`;
  reportContent += `**Status:** ${findings.length > 0 ? 'FAIL' : 'PASS'}\n\n`;

  if (findings.length === 0) {
    console.log("✅ No drift detected! Feature extraction matches training assumptions.");
    reportContent += `## Summary\n✅ No drift detected! Feature extraction matches training assumptions.\n`;
  } else {
    console.log(`❌ Found ${findings.length} potential drifts:\n`);
    reportContent += `## Summary\n❌ Found ${findings.length} potential drifts.\n\n`;
    reportContent += `| Severity | Feature | Expected | Actual | Scenario |\n`;
    reportContent += `|---|---|---|---|---|\n`;

    findings.forEach((f) => {
      const icon = f.severity === 'CRITICAL' ? '🔴' : (f.severity === 'WARNING' ? '🟠' : '🔵');
      console.log(`${icon} [${f.severity}] ${f.feature}: Expected ${f.expected}, Got ${f.actual} (${f.scenario})`);
      reportContent += `| ${icon} ${f.severity} | \`${f.feature}\` | ${f.expected} | \`${f.actual}\` | ${f.scenario} |\n`;
    });

    // Recommendations
    reportContent += `\n## Recommendations\n`;
    const criticals = findings.filter(f => f.severity === 'CRITICAL');
    if (criticals.some(f => f.feature === 'quiz_score_variance')) {
        reportContent += `- **Fix Variance Calculation:** TypeScript calculates Standard Deviation (\`Math.sqrt(variance)\`) but Python model expects Variance. Remove \`Math.sqrt\` in \`student_features.ts\`.\n`;
    }
    if (criticals.some(f => f.feature === 'days_since_last_revision')) {
        reportContent += `- **Fix Date Logic:** TypeScript allows negative days for future dates. Add clamp to 0.\n`;
    }
    const warnings = findings.filter(f => f.severity === 'WARNING');
    if (warnings.some(f => f.feature === 'time_spent_per_question' || f.feature === 'days_since_last_revision')) {
        reportContent += `- **Review Training Data:** Synthetic data generation range [0-30] days and [10-120]s is too narrow for real-world usage. Update \`generate_data.py\`.\n`;
    }
  }

  fs.writeFileSync('FEATURE_DRIFT_REPORT.md', reportContent);
  console.log(`\n📄 Report saved to FEATURE_DRIFT_REPORT.md`);

  if (findings.some(f => f.severity === 'CRITICAL')) {
      process.exit(1);
  }
}

runDriftAnalysis();
