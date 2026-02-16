
import { makeRevisionDecision } from '../src/ai/adk/decision-engine';
import { DecisionContext, MLSignals, ADKDecision, DecisionAction } from '../src/ai/adk/types';

// Define partitions for symbolic execution
const masteryProbabilities = [0.2, 0.39, 0.45, 0.55, 0.65, 0.75, 0.9];
const daysUntilForgetValues = [1, 2, 4, 10, undefined];
const attentionRisks = ["HIGH", "MEDIUM", "LOW", undefined] as ("HIGH" | "MEDIUM" | "LOW" | undefined)[];
const daysSinceLastRevisionValues = [2, 6, 8, 13, 15, 30];
const daysUntilExamValues = [1, 2, 4, 10, undefined];

// Initialize counters
const ruleHits: Record<string, number> = {};
const actionHits: Record<string, number> = {};
let totalCombinations = 0;

// Iterate through Cartesian product
for (const mastery of masteryProbabilities) {
    for (const daysUntilForget of daysUntilForgetValues) {
        for (const attention of attentionRisks) {
            for (const daysSinceRevision of daysSinceLastRevisionValues) {
                for (const daysUntilExam of daysUntilExamValues) {

                    const mlSignals: MLSignals = {
                        mastery_probability: mastery,
                        confidence: 0.8, // Fixed for simplicity
                        days_until_forget: daysUntilForget,
                        attention_risk: attention,
                        days_since_last_revision: daysSinceRevision,
                        attempts_count: 5, // Fixed
                    };

                    const context: DecisionContext = {
                        studentId: 'test-student',
                        topic: 'test-topic',
                        currentDate: new Date(),
                        daysUntilExam: daysUntilExam,
                        mlSignals
                    };

                    const decision = makeRevisionDecision(context);

                    // Record hits
                    const ruleName = decision.adkFlags[0] || "DEFAULT";
                    ruleHits[ruleName] = (ruleHits[ruleName] || 0) + 1;

                    const actionName = decision.action;
                    actionHits[actionName] = (actionHits[actionName] || 0) + 1;

                    totalCombinations++;

                    // Check for potential contradictions / shadowed rules
                    // Example: Exam imminent but not flagged as CRAMMING_MODE
                    if (daysUntilExam !== undefined && daysUntilExam <= 3 && mastery < 0.6) {
                        if (!decision.adkFlags.includes("CRAMMING_MODE")) {
                            console.log(`[Shadowed Rule Warning] Exam in ${daysUntilExam} days, Mastery ${mastery}, but got ${ruleName}`);
                        }
                    }
                }
            }
        }
    }
}

// Output Report
console.log("# ADK Decision Logic Validation Report\n");
console.log(`Total Combinations Tested: ${totalCombinations}\n`);

console.log("## Rule Coverage Matrix");
console.log("| Rule Flag | Hits | Percentage |");
console.log("|---|---|---|");
for (const [rule, hits] of Object.entries(ruleHits).sort((a, b) => b[1] - a[1])) {
    console.log(`| ${rule} | ${hits} | ${((hits / totalCombinations) * 100).toFixed(2)}% |`);
}

console.log("\n## Action Distribution");
console.log("| Action | Hits | Percentage |");
console.log("|---|---|---|");
for (const [action, hits] of Object.entries(actionHits).sort((a, b) => b[1] - a[1])) {
    console.log(`| ${action} | ${hits} | ${((hits / totalCombinations) * 100).toFixed(2)}% |`);
}

console.log("\n## Unreachable Rules");
// List known rules and check if they were hit
const expectedRules = [
    "URGENT_REVISION", // Rule 1
    "ADAPTIVE_TEACHING", // Rule 2
    "SPACED_REPETITION", // Rule 3
    "MASTERY_ACHIEVED", // Rule 4
    "CRAMMING_MODE", // Rule 5
    "ROUTINE_REVISION" // Default
];

const unreachable = expectedRules.filter(r => !ruleHits[r] && !Object.keys(ruleHits).some(k => k.includes(r)));

if (unreachable.length > 0) {
    console.log("The following rules were never triggered:");
    unreachable.forEach(r => console.log(`- ${r}`));
} else {
    console.log("All expected rules were triggered at least once.");
}
