
import {
    makeRevisionDecision,
    makeInterventionDecision,
} from "../src/ai/adk/decision-engine";
import {
    TeacherInterventionSignal,
    MLSignals,
    DecisionContext,
    DecisionAction,
    ContentStrategy,
    ADKDecision
} from "../src/ai/adk/types";
import fs from "fs";
import path from "path";

// 1. Define Input Ranges
const inputRanges = {
    mastery_probability: [0.0, 0.1, 0.2, 0.3, 0.39, 0.4, 0.41, 0.5, 0.59, 0.6, 0.61, 0.7, 0.8, 0.9, 1.0],
    daysUntilExam: [undefined, 1, 2, 3, 4, 10, 30, 100],
    days_until_forget: [undefined, 1, 2, 3, 4, 10, 30],
    attention_risk: [undefined, "LOW", "MEDIUM", "HIGH"] as ("LOW" | "MEDIUM" | "HIGH" | undefined)[],
    days_since_last_revision: [0, 1, 6, 7, 8, 13, 14, 15, 30],
    attempts_count: [0, 1, 4, 5, 6, 10],
    dropout_probability: [undefined, 0.0, 0.5, 0.6, 0.61, 0.7, 1.0]
};

// 2. Metrics Storage
interface ValidationMetrics {
    totalScenarios: number;
    ruleCoverage: Record<string, number>;
    unreachableRules: string[];
    contradictions: {
        scenario: string;
        revision: ADKDecision;
        intervention: TeacherInterventionSignal | null;
        reason: string;
    }[];
    edgeCaseFailures: string[];
}

const metrics: ValidationMetrics = {
    totalScenarios: 0,
    ruleCoverage: {},
    unreachableRules: [],
    contradictions: [],
    edgeCaseFailures: []
};

// Helper to generate Cartesian product
function* generateScenarios() {
    for (const mastery of inputRanges.mastery_probability) {
        for (const daysExam of inputRanges.daysUntilExam) {
            for (const daysForget of inputRanges.days_until_forget) {
                for (const attention of inputRanges.attention_risk) {
                    for (const daysRev of inputRanges.days_since_last_revision) {
                        for (const attempts of inputRanges.attempts_count) {
                            for (const dropout of inputRanges.dropout_probability) {
                                yield {
                                    mastery,
                                    daysExam,
                                    daysForget,
                                    attention,
                                    daysRev,
                                    attempts,
                                    dropout
                                };
                            }
                        }
                    }
                }
            }
        }
    }
}

// 3. Validation Logic
console.log("Starting ADK Logic Validation...");
const scenarios = generateScenarios();

for (const s of scenarios) {
    metrics.totalScenarios++;

    const mlSignals: MLSignals = {
        mastery_probability: s.mastery,
        confidence: 0.8, // Fixed for simplicity, could vary
        days_until_forget: s.daysForget,
        attention_risk: s.attention,
        dropout_probability: s.dropout,
        days_since_last_revision: s.daysRev,
        attempts_count: s.attempts
    };

    const context: DecisionContext = {
        studentId: "test-student",
        topic: "test-topic",
        currentDate: new Date(),
        daysUntilExam: s.daysExam,
        mlSignals
    };

    // Run Decision Engine
    let revisionDecision: ADKDecision;
    let interventionDecision: TeacherInterventionSignal | null;

    try {
        revisionDecision = makeRevisionDecision(context);
        interventionDecision = makeInterventionDecision(context);
    } catch (e) {
        metrics.edgeCaseFailures.push(`Crash on inputs: ${JSON.stringify(s)} - Error: ${e}`);
        continue;
    }

    // Track Coverage
    const ruleKey = revisionDecision.adkFlags.join("+");
    metrics.ruleCoverage[ruleKey] = (metrics.ruleCoverage[ruleKey] || 0) + 1;

    // Check Contradictions
    // Contradiction 1: CRITICAL intervention but PROGRESS_ALLOWED
    if (interventionDecision?.severity === "CRITICAL" && revisionDecision.action === DecisionAction.PROGRESS_ALLOWED) {
        metrics.contradictions.push({
            scenario: JSON.stringify(s),
            revision: revisionDecision,
            intervention: interventionDecision,
            reason: "Critical Intervention required but Progress Allowed"
        });
    }

    // Contradiction 2: High Mastery (Rule 4) but Remedial Strategy
    if (revisionDecision.adkFlags.includes("MASTERY_ACHIEVED") &&
        (revisionDecision.contentStrategy === ContentStrategy.REMEDIAL || revisionDecision.contentStrategy === ContentStrategy.SHORT_FORM)) {
         metrics.contradictions.push({
            scenario: JSON.stringify(s),
            revision: revisionDecision,
            intervention: interventionDecision,
            reason: "Mastery Achieved but Remedial/Short Strategy suggested"
        });
    }

    // Contradiction 3: Cramming Mode (Rule 0) with Long Duration
    if (revisionDecision.adkFlags.includes("CRAMMING_MODE") &&
        (revisionDecision.llmContext.targetDuration === "15-MIN" || revisionDecision.llmContext.targetDuration === "10-MIN")) {
         metrics.contradictions.push({
            scenario: JSON.stringify(s),
            revision: revisionDecision,
            intervention: interventionDecision,
            reason: "Cramming Mode suggests long duration content"
        });
    }
}

// 4. Generate Report
const reportLines: string[] = [];
reportLines.push("# ADK Decision Logic Coverage Report");
reportLines.push(`**Generated:** ${new Date().toISOString()}`);
reportLines.push(`**Total Scenarios Tested:** ${metrics.totalScenarios}`);
reportLines.push("");

reportLines.push("## Rule Coverage Matrix");
reportLines.push("| ADK Flags (Rule Signature) | Count | Percentage |");
reportLines.push("|---|---|---|");
Object.entries(metrics.ruleCoverage).sort((a, b) => b[1] - a[1]).forEach(([rule, count]) => {
    const pct = ((count / metrics.totalScenarios) * 100).toFixed(2);
    reportLines.push(`| \`${rule}\` | ${count} | ${pct}% |`);
});
reportLines.push("");

reportLines.push("## Contradictions Found");
if (metrics.contradictions.length === 0) {
    reportLines.push("No logical contradictions found.");
} else {
    reportLines.push(`Found ${metrics.contradictions.length} contradictions.`);
    // Group by reason to avoid massive file
    const grouped = metrics.contradictions.reduce((acc, curr) => {
        acc[curr.reason] = (acc[curr.reason] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    reportLines.push("| Contradiction Type | Count | Example Scenario |");
    reportLines.push("|---|---|---|");
    for (const [reason, count] of Object.entries(grouped)) {
        const example = metrics.contradictions.find(c => c.reason === reason);
        reportLines.push(`| ${reason} | ${count} | \`${example?.scenario.slice(0, 100)}...\` |`);
    }
}
reportLines.push("");

reportLines.push("## Edge Case Failures");
if (metrics.edgeCaseFailures.length === 0) {
    reportLines.push("No runtime errors or crashes.");
} else {
    metrics.edgeCaseFailures.forEach(f => reportLines.push(`- ${f}`));
}

fs.writeFileSync("ADK_DECISION_COVERAGE.md", reportLines.join("\n"));
console.log("Validation complete. Report written to ADK_DECISION_COVERAGE.md");
