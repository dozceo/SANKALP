import { extractMasteryFeatures, StudentHistory, MasteryFeatures } from "../src/ml/features/student_features";
import * as fs from 'fs';
import * as path from 'path';

/**
 * ML Drift Detector - Production Grade
 *
 * Validates feature extraction logic against training data assumptions.
 * Supports structured logging, configuration loading, and CI/CD integration.
 */

// --- Configuration ---
const CONFIG_PATH = path.join(process.cwd(), 'config', 'ml-constraints.json');
const REPORT_MD_PATH = 'FEATURE_DRIFT_REPORT.md';
const REPORT_JUNIT_PATH = 'drift-report.xml';

interface Constraint {
  min: number;
  max: number;
  type: string;
}

interface ConstraintsConfig {
  [key: string]: Constraint;
}

type Severity = 'CRITICAL' | 'WARNING' | 'INFO';

interface DriftFinding {
  feature: string;
  expected: string;
  actual: string;
  severity: Severity;
  scenario: string;
}

// --- Logging ---
class Logger {
  info(message: string, context?: object) {
    console.log(JSON.stringify({ level: 'INFO', message, ...context }));
  }
  warn(message: string, context?: object) {
    console.log(JSON.stringify({ level: 'WARN', message, ...context }));
  }
  error(message: string, context?: object) {
    console.error(JSON.stringify({ level: 'ERROR', message, ...context }));
  }
}
const logger = new Logger();

// --- Core Logic ---

function loadConfig(): ConstraintsConfig {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      throw new Error(`Config file not found at ${CONFIG_PATH}`);
    }
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (error: any) {
    logger.error("Failed to load configuration", { error: error.message });
    process.exit(1);
  }
}

function checkConstraint(featureName: string, value: number, constraint: Constraint): DriftFinding | null {
  // Range Check
  if (value < constraint.min || value > constraint.max) {
    let severity: Severity = 'WARNING';

    // Severity Rules (Business Logic)
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

function validateFeatures(
  features: MasteryFeatures,
  scenario: string,
  constraints: ConstraintsConfig,
  findings: DriftFinding[]
) {
  Object.keys(features).forEach((key) => {
    const k = key as keyof MasteryFeatures;
    const value = features[k];
    const constraint = constraints[k];

    if (constraint) {
      const finding = checkConstraint(key, value, constraint);
      if (finding) {
        finding.scenario = scenario;
        findings.push(finding);
        // Log immediately for observability
        const logMethod = finding.severity === 'CRITICAL' ? logger.error.bind(logger) : logger.warn.bind(logger);
        logMethod(`Drift detected: ${finding.feature}`, finding);
      }
    } else {
       logger.warn(`No constraint found for feature: ${key}`);
    }
  });
}

function generateReports(findings: DriftFinding[]) {
  // 1. Markdown Report (Human Readable)
  let reportContent = `# ML Feature Drift Report\n\n`;
  reportContent += `**Date:** ${new Date().toISOString()}\n`;
  reportContent += `**Status:** ${findings.length > 0 ? 'FAIL' : 'PASS'}\n\n`;

  if (findings.length === 0) {
    reportContent += `## Summary\n✅ No drift detected! Feature extraction matches training assumptions.\n`;
  } else {
    reportContent += `## Summary\n❌ Found ${findings.length} potential drifts.\n\n`;
    reportContent += `| Severity | Feature | Expected | Actual | Scenario |\n`;
    reportContent += `|---|---|---|---|---|\n`;

    findings.forEach((f) => {
      const icon = f.severity === 'CRITICAL' ? '🔴' : (f.severity === 'WARNING' ? '🟠' : '🔵');
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
  }

  try {
    fs.writeFileSync(REPORT_MD_PATH, reportContent);
    logger.info(`Markdown report saved to ${REPORT_MD_PATH}`);
  } catch (err: any) {
    logger.error("Failed to write Markdown report", { error: err.message });
  }

  // 2. JUnit XML (CI/CD Integration)
  // Simple XML generation for test reporting
  let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n<testsuites>\n  <testsuite name="ML Feature Drift" tests="${findings.length || 1}" failures="${findings.length}">\n`;

  if (findings.length === 0) {
      xmlContent += `    <testcase name="Drift Check" classname="scripts.detect-drift" time="0.1"/>\n`;
  } else {
      findings.forEach((f, i) => {
          xmlContent += `    <testcase name="${f.feature} drift in ${f.scenario}" classname="scripts.detect-drift">\n`;
          xmlContent += `      <failure message="${f.expected} vs ${f.actual}">${f.severity} drift detected.</failure>\n`;
          xmlContent += `    </testcase>\n`;
      });
  }
  xmlContent += `  </testsuite>\n</testsuites>`;

  try {
    fs.writeFileSync(REPORT_JUNIT_PATH, xmlContent);
    logger.info(`JUnit XML report saved to ${REPORT_JUNIT_PATH}`);
  } catch (err: any) {
    logger.error("Failed to write JUnit report", { error: err.message });
  }
}

// --- Main Execution ---

function runDriftAnalysis() {
  logger.info("Starting ML Feature Drift Analysis");
  const constraints = loadConfig();
  const findings: DriftFinding[] = [];

  try {
    // Scenario 1: New Student (No History)
    const newStudentHistory: StudentHistory = {
        quizResults: [],
        lastLoginDate: new Date(),
        registrationDate: new Date(),
    };
    validateFeatures(extractMasteryFeatures("math_101", newStudentHistory), "New Student (0 Quizzes)", constraints, findings);

    // Scenario 2: Active Student (Normal Range)
    const activeHistory: StudentHistory = {
        quizResults: [
        { topic: "math_101", score: 0.8, timestamp: new Date(), timeSpent: 60, questionsAttempted: 10 },
        { topic: "math_101", score: 0.9, timestamp: new Date(Date.now() - 86400000), timeSpent: 60, questionsAttempted: 10 },
        ],
        lastLoginDate: new Date(),
        registrationDate: new Date(),
    };
    validateFeatures(extractMasteryFeatures("math_101", activeHistory), "Active Student (Normal)", constraints, findings);

    // Scenario 3: Returning Student (Long Absence)
    const returningHistory: StudentHistory = {
        quizResults: [
        { topic: "math_101", score: 0.8, timestamp: new Date(Date.now() - 60 * 86400000), timeSpent: 60, questionsAttempted: 10 },
        ],
        lastLoginDate: new Date(),
        registrationDate: new Date(),
    };
    validateFeatures(extractMasteryFeatures("math_101", returningHistory), "Returning Student (60 Days Inactive)", constraints, findings);

    // Scenario 4: Variance vs StdDev Check
    const varianceHistory: StudentHistory = {
        quizResults: [
        { topic: "math_101", score: 0.0, timestamp: new Date(), timeSpent: 60, questionsAttempted: 10 },
        { topic: "math_101", score: 1.0, timestamp: new Date(), timeSpent: 60, questionsAttempted: 10 },
        ],
        lastLoginDate: new Date(),
        registrationDate: new Date(),
    };
    validateFeatures(extractMasteryFeatures("math_101", varianceHistory), "High Variance Student", constraints, findings);

    // Scenario 5: Future Date (Time Travel)
    const futureHistory: StudentHistory = {
        quizResults: [
            { topic: "math_101", score: 0.8, timestamp: new Date(Date.now() + 86400000), timeSpent: 60, questionsAttempted: 10 }
        ],
        lastLoginDate: new Date(),
        registrationDate: new Date()
    };
    validateFeatures(extractMasteryFeatures("math_101", futureHistory), "Future Date Student", constraints, findings);

    generateReports(findings);

    if (findings.some(f => f.severity === 'CRITICAL')) {
        logger.error("Critical drift detected. Failing pipeline.");
        process.exit(1);
    } else if (findings.length > 0) {
        logger.warn("Drift detected but no critical failures. Pipeline proceeds (check warnings).");
        // Optional: fail on warning depending on strictness. Here we pass unless critical.
        process.exit(0);
    } else {
        logger.info("No drift detected.");
        process.exit(0);
    }

  } catch (error: any) {
      logger.error("Unexpected error during drift analysis", { error: error.message, stack: error.stack });
      process.exit(1);
  }
}

runDriftAnalysis();
