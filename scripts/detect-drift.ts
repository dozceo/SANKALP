import { extractMasteryFeatures, StudentHistory, RawQuizResult, MasteryFeatures } from "../src/ml/features/student_features";
import * as fs from 'fs';
import * as path from 'path';

/**
 * ML Drift Detector - Feature Extraction Validator
 *
 * This script programmatically validates feature extraction logic against the assumptions
 * baked into the training data generation script (`src/ml/training/generate_data.py`).
 *
 * It generates a drift report mapping feature names to type/range mismatches with severity classification.
 */

const TRAINING_DATA_PATH = path.join(process.cwd(), 'src/ml/training/training_data.csv');
const PROVENANCE_REPORT_PATH = path.join(process.cwd(), 'src/ml/models/provenance_report.json');
const DRIFT_REPORT_PATH = path.join(process.cwd(), 'FEATURE_DRIFT_REPORT.md');

// Types for Training Data Stats
interface FeatureStats {
    min: number;
    max: number;
    mean: number;
    std: number;
    count: number;
}

type FeatureConstraints = Record<string, FeatureStats>;

type Severity = 'CRITICAL' | 'WARNING' | 'INFO';

interface DriftFinding {
    feature: string;
    expected: string;
    actual: string;
    severity: Severity;
    scenario: string;
}

// Helper: Calculate standard deviation
function calculateStd(values: number[], mean: number): number {
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
}

// 1. Load Training Data Constraints
function loadTrainingConstraints(): FeatureConstraints {
    console.log(`📊 Loading training data from ${TRAINING_DATA_PATH}...`);
    try {
        const fileContent = fs.readFileSync(TRAINING_DATA_PATH, 'utf-8');
        const lines = fileContent.trim().split('\n');
        if (lines.length < 2) throw new Error("CSV file is empty or missing header");

        const headers = lines[0].split(',');
        const data: Record<string, number[]> = {};

        // Initialize arrays for each column
        headers.forEach(h => {
            if (h !== 'mastered') { // Exclude target
                data[h] = [];
            }
        });

        // Parse rows
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => parseFloat(v));
            headers.forEach((h, index) => {
                if (h !== 'mastered') {
                    data[h].push(values[index]);
                }
            });
        }

        // Calculate stats
        const constraints: FeatureConstraints = {};
        Object.keys(data).forEach(key => {
            const values = data[key];
            const sum = values.reduce((a, b) => a + b, 0);
            const mean = sum / values.length;
            const min = Math.min(...values);
            const max = Math.max(...values);
            const std = calculateStd(values, mean);

            constraints[key] = { min, max, mean, std, count: values.length };
        });

        console.log("✅ Training constraints loaded.");
        return constraints;
    } catch (error) {
        console.error("❌ Error loading training data:", error);
        process.exit(1);
    }
}

// 2. Load Expected Features from Provenance Report
function loadExpectedFeatures(): string[] {
    console.log(`📜 Loading provenance report from ${PROVENANCE_REPORT_PATH}...`);
    try {
        if (!fs.existsSync(PROVENANCE_REPORT_PATH)) {
            console.warn("⚠️ Provenance report not found. Skipping schema check.");
            return [];
        }
        const content = fs.readFileSync(PROVENANCE_REPORT_PATH, 'utf-8');
        const report = JSON.parse(content);
        if (report.metrics && report.metrics.feature_importance) {
            const features = Object.keys(report.metrics.feature_importance);
            console.log(`✅ Found ${features.length} expected features.`);
            return features;
        }
        return [];
    } catch (error) {
        console.warn("⚠️ Error parsing provenance report:", error);
        return [];
    }
}

// 3. Check Constraint Logic
function checkConstraint(featureName: string, value: number, stats: FeatureStats): DriftFinding | null {
    // Range Check with Tolerance (e.g., 10% outside observed range is warning, 50% is critical)
    const range = stats.max - stats.min;
    // Handle constant features (range=0)
    const tolerance = range === 0 ? 0.1 : range * 0.2; // 20% tolerance for warning
    const criticalTolerance = range === 0 ? 1.0 : range * 2.0; // 200% tolerance for critical (outlier)

    // Special Logic: Variance vs StdDev
    // If feature is 'quiz_score_variance' and value > 0.5 (max theoretical variance for [0,1] is 0.25), it's suspicious
    // But max theoretical StdDev is 0.5. So if value is close to 0.5, it might be StdDev.
    if (featureName === 'quiz_score_variance') {
        if (value > 0.26 && stats.max <= 0.26) {
             return {
                feature: featureName,
                expected: `Variance (<= ~0.25)`,
                actual: `${value.toFixed(4)} (Likely StdDev)`,
                severity: 'CRITICAL',
                scenario: ''
            };
        }
    }

    // Special Logic: Days Since Last Revision
    // Training data is [0, 30]. If we see > 30, it's Out of Distribution.
    // If we see < 0, it's Impossible (Time Travel).
    if (featureName === 'days_since_last_revision') {
        if (value < 0) {
            return {
                feature: featureName,
                expected: `>= 0`,
                actual: `${value}`,
                severity: 'CRITICAL',
                scenario: ''
            };
        }
        if (value > stats.max * 1.5) { // 30 * 1.5 = 45
             // If significantly larger than max seen in training
             // 999 is a common default for "never revised"
             return {
                feature: featureName,
                expected: `Range [${stats.min}, ${stats.max}]`,
                actual: `${value}`,
                severity: 'WARNING',
                scenario: ''
            };
        }
    }

    // Generic Range Check
    if (value < stats.min - criticalTolerance || value > stats.max + criticalTolerance) {
         return {
            feature: featureName,
            expected: `Range [${stats.min}, ${stats.max}]`,
            actual: `${value}`,
            severity: 'WARNING', // Use Warning for general outliers unless specific rule makes it Critical
            scenario: ''
        };
    }

    return null;
}

// 4. Run Analysis
function runDriftAnalysis() {
    console.log("🔍 Starting ML Feature Drift Analysis...\n");
    const findings: DriftFinding[] = [];

    const constraints = loadTrainingConstraints();
    const expectedFeatures = loadExpectedFeatures();

    // Verify Schema
    if (expectedFeatures.length > 0) {
        // We'll check this against the first extracted feature set
    }

    // Scenario 1: New Student (No History)
    const newStudentHistory: StudentHistory = {
        quizResults: [],
        lastLoginDate: new Date(),
        registrationDate: new Date(),
    };
    const newFeatures = extractMasteryFeatures("math_101", newStudentHistory);
    validateFeatures(newFeatures, "New Student (0 Quizzes)", findings, constraints, expectedFeatures);

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
    validateFeatures(activeFeatures, "Active Student (Normal)", findings, constraints, expectedFeatures);

    // Scenario 3: Returning Student (Long Absence)
    // 60 days inactive -> Expect days_since_last_revision ~ 60 (Constraint is ~30)
    const returningHistory: StudentHistory = {
        quizResults: [
            { topic: "math_101", score: 0.8, timestamp: new Date(Date.now() - 60 * 86400000), timeSpent: 60, questionsAttempted: 10 },
        ],
        lastLoginDate: new Date(),
        registrationDate: new Date(),
    };
    const returningFeatures = extractMasteryFeatures("math_101", returningHistory);
    validateFeatures(returningFeatures, "Returning Student (60 Days Inactive)", findings, constraints, expectedFeatures);

    // Scenario 4: Variance vs StdDev Check
    // Scores: [0.0, 1.0]. Variance = 0.25. StdDev = 0.5.
    // If TS returns 0.5, and Training Max is 0.25, it's a drift.
    const varianceHistory: StudentHistory = {
        quizResults: [
            { topic: "math_101", score: 0.0, timestamp: new Date(), timeSpent: 60, questionsAttempted: 10 },
            { topic: "math_101", score: 1.0, timestamp: new Date(), timeSpent: 60, questionsAttempted: 10 },
        ],
        lastLoginDate: new Date(),
        registrationDate: new Date(),
    };
    const varianceFeatures = extractMasteryFeatures("math_101", varianceHistory);
    validateFeatures(varianceFeatures, "High Variance Student", findings, constraints, expectedFeatures);

    // Scenario 5: Future Date (Time Travel)
    const futureHistory: StudentHistory = {
        quizResults: [
            { topic: "math_101", score: 0.8, timestamp: new Date(Date.now() + 86400000), timeSpent: 60, questionsAttempted: 10 }
        ],
        lastLoginDate: new Date(),
        registrationDate: new Date()
    };
    const futureFeatures = extractMasteryFeatures("math_101", futureHistory);
    validateFeatures(futureFeatures, "Future Date Student", findings, constraints, expectedFeatures);


    // Generate Report
    generateReport(findings, constraints);
}

function validateFeatures(
    features: MasteryFeatures,
    scenario: string,
    findings: DriftFinding[],
    constraints: FeatureConstraints,
    expectedFeatures: string[]
) {
    // Check for missing features
    expectedFeatures.forEach(expected => {
        if (!(expected in features)) {
            findings.push({
                feature: expected,
                expected: 'Present',
                actual: 'Missing',
                severity: 'CRITICAL',
                scenario
            });
        }
    });

    Object.keys(features).forEach((key) => {
        const k = key as keyof MasteryFeatures;
        const value = features[k];

        // Check for extra features (INFO)
        if (expectedFeatures.length > 0 && !expectedFeatures.includes(k)) {
             // Only report once per feature ideally, but here per scenario is fine
             // Just skip detailed validation for extra features as we don't have constraints
             return;
        }

        const stats = constraints[k];
        if (stats) {
            const finding = checkConstraint(key, value, stats);
            if (finding) {
                finding.scenario = scenario;
                findings.push(finding);
            }
        }
    });
}

function generateReport(findings: DriftFinding[], constraints: FeatureConstraints) {
    console.log("\n\n📊 DRIFT DETECTION REPORT");
    console.log("===========================");

    let reportContent = `# ML Feature Drift Report\n\n`;
    reportContent += `**Date:** ${new Date().toISOString()}\n`;
    reportContent += `**Status:** ${findings.length > 0 ? 'FAIL' : 'PASS'}\n\n`;

    // Add Training Data Stats Summary
    reportContent += `## Training Data Statistics (Ground Truth)\n`;
    reportContent += `| Feature | Min | Max | Mean | StdDev |\n`;
    reportContent += `|---|---|---|---|---|\n`;
    Object.keys(constraints).forEach(key => {
        const s = constraints[key];
        reportContent += `| \`${key}\` | ${s.min.toFixed(2)} | ${s.max.toFixed(2)} | ${s.mean.toFixed(2)} | ${s.std.toFixed(2)} |\n`;
    });
    reportContent += `\n`;

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
             reportContent += `- **Fix Variance Calculation:** TypeScript calculates Standard Deviation (\`Math.sqrt(variance)\`) but Python training data uses Variance (max ~0.25). Remove \`Math.sqrt\` in \`student_features.ts\` to align with training data distribution.\n`;
        }

        if (criticals.some(f => f.feature === 'days_since_last_revision')) {
             reportContent += `- **Fix Date Logic:** TypeScript allows negative days for future dates (Time Travel). Add clamp to 0 in \`extractMasteryFeatures\`.\n`;
        }

        const warnings = findings.filter(f => f.severity === 'WARNING');
        if (warnings.some(f => f.feature === 'days_since_last_revision' && f.actual === '999')) {
             reportContent += `- **Handle New Topics:** Default value for \`days_since_last_revision\` is 999, but training data max is ~30. This is a massive outlier. Use a value closer to the max seen in training (e.g., 30 or 60) or specific imputation strategy.\n`;
        }

        if (warnings.some(f => f.feature === 'attempts_per_topic' && f.actual === '0')) {
             reportContent += `- **Handle Zero Attempts:** Training data assumes at least 1 attempt (Min: 1). Inference sees 0 attempts for new topics. Ensure model can handle 0 or impute to 1.\n`;
        }
    }

    fs.writeFileSync(DRIFT_REPORT_PATH, reportContent);
    console.log(`\n📄 Report saved to ${DRIFT_REPORT_PATH}`);
}

runDriftAnalysis();
