
import fs from 'fs';

const FLOW_FILE_PATH = 'src/ai/flows/smart-revision-planner.ts';
const REPORT_PATH = 'reports/REVISION_FLOW_INTEGRITY_REPORT.md';

// Mock types for simulation
interface MockTopic {
    name: string;
    daysSinceLastRevision: number;
}
interface MockPrediction {
    masteryProbability: number;
    confidence: number;
}
interface MockDecision {
    topic: string;
    action: string;
}

// Reconstructed Logic from smart-revision-planner.ts (Manual extraction/simulation)
// Since we can't import the internal function directly without complex mocking
function simulateRevisionDecision(
    topic: MockTopic,
    prediction: MockPrediction | null | undefined,
    adkLogic: (p: MockPrediction) => string
): { decision: string, reason: string } {

    // Logic from smart-revision-planner.ts lines ~120-135
    if (!prediction) {
        // Fallback: include topic if it hasn't been revised recently
        if (topic.daysSinceLastRevision > 10) {
            return { decision: "FALLBACK_REVISION", reason: "Fallback: Long time since revision" };
        }
        // Implicit "continue" - means topic is dropped
        return { decision: "DROPPED", reason: "Silent Failure: No prediction and recently revised" };
    }

    const adkAction = adkLogic(prediction);

    if (["URGENT_REVISION", "SCHEDULED_REVISION", "ADAPTIVE_TEACHING"].includes(adkAction)) {
        return { decision: adkAction, reason: "ADK Recommended" };
    }

    return { decision: "DROPPED", reason: "ADK: No Revision Needed" };
}

async function auditRevisionFlow() {
    console.log('Starting Revision Flow Integrity Check...');

    let report = `# Smart Revision Planner UX Flow Integrity Report\n\n`;
    report += `**Date:** ${new Date().toISOString()}\n\n`;

    // 1. Static Analysis of the Source File
    const fileContent = fs.readFileSync(FLOW_FILE_PATH, 'utf-8');
    const hasTryCatch = fileContent.includes('try {') && fileContent.includes('catch (error)');
    const hasContinue = fileContent.includes('continue;');
    const hasFallback = fileContent.includes('fallbackReason');

    report += `## 1. Static Code Analysis\n`;
    report += `- **Error Handling**: ${hasTryCatch ? '✅ Present' : '❌ Missing'}\n`;
    report += `- **Loop Control**: ${hasContinue ? '⚠️ Uses "continue" (risk of silent drops)' : '✅ Explicit handling'}\n`;
    report += `- **Fallback Logic**: ${hasFallback ? '✅ Present' : '❌ Missing'}\n\n`;

    // 2. State Machine Simulation
    report += `## 2. State Machine Simulation (Edge Cases)\n`;

    const scenarios = [
        {
            name: "Case A: ML Prediction Fails (null) + Recent Revision (2 days)",
            topic: { name: "Algebra", daysSinceLastRevision: 2 },
            prediction: null,
            expected: "DROPPED", // Based on code reading
            risk: "HIGH - Silent Failure if user actually needed revision but ML failed."
        },
        {
            name: "Case B: ML Prediction Fails (null) + Old Revision (15 days)",
            topic: { name: "Calculus", daysSinceLastRevision: 15 },
            prediction: null,
            expected: "FALLBACK_REVISION",
            risk: "LOW - Fallback captures it."
        },
        {
            name: "Case C: ML Success (Low Mastery) -> ADK Urgent",
            topic: { name: "Geometry", daysSinceLastRevision: 5 },
            prediction: { masteryProbability: 0.3, confidence: 0.9 },
            expected: "URGENT_REVISION",
            risk: "NONE"
        },
        {
            name: "Case D: ML Success (High Mastery) -> ADK Progress",
            topic: { name: "Stats", daysSinceLastRevision: 5 },
            prediction: { masteryProbability: 0.9, confidence: 0.9 },
            expected: "DROPPED",
            risk: "NONE - Correct behavior."
        }
    ];

    const mockAdk = (p: MockPrediction) => {
        if (p.masteryProbability < 0.4) return "URGENT_REVISION";
        if (p.masteryProbability < 0.6) return "SCHEDULED_REVISION";
        return "PROGRESS_ALLOWED";
    };

    report += `| Scenario | Prediction | Days Since Rev | Result | Risk Analysis |\n`;
    report += `|---|---|---|---|---|\n`;

    scenarios.forEach(scenario => {
        const result = simulateRevisionDecision(scenario.topic, scenario.prediction, mockAdk);
        const icon = result.decision === scenario.expected ? '✅' : '❓';
        report += `| ${scenario.name} | ${scenario.prediction ? 'OK' : 'NULL'} | ${scenario.topic.daysSinceLastRevision} | **${result.decision}** | ${scenario.risk} |\n`;
    });

    report += `\n## 3. Findings & Recommendations\n`;
    report += `### 🔴 Critical Gap: Silent Failure in Case A\n`;
    report += `- **Observation**: When ML prediction fails (returns null/undefined) for a topic revised recently (< 10 days), the system **silently drops** the topic.\n`;
    report += `- **Risk**: If the ML service is down or flaky, students who recently studied a topic but are struggling (low mastery) will NOT see it in their revision plan, because the fallback only catches "old" topics.\n`;
    report += `- **Recommendation**: Change the fallback logic to always include topics if prediction fails, perhaps with a "Unable to predict - Review recommended" flag, or at least log the drop.\n`;

    // Ensure reports directory exists
    if (!fs.existsSync('reports')) {
        fs.mkdirSync('reports');
    }

    fs.writeFileSync(REPORT_PATH, report);
    console.log(`Report generated at ${REPORT_PATH}`);
}

auditRevisionFlow();
