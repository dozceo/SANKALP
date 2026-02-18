
import { DecisionContext, MLSignals, ADKDecision, DecisionAction, TeacherInterventionSignal } from "../src/ai/adk/types";
import { makeRevisionDecision, makeInterventionDecision } from "../src/ai/adk/decision-engine";

// --- Mock Domain ---
const DOMAIN = {
    daysUntilExam: [undefined, 0, 1, 3, 5, 10, 30], // Added 0
    mastery_probability: [0.2, 0.35, 0.45, 0.55, 0.65, 0.75, 0.9],
    days_until_forget: [undefined, 2, 3, 5, 999],
    attention_risk: ["LOW", "HIGH"] as const,
    days_since_last_revision: [5, 8, 14, 15, 30],
    attempts_count: [3, 6],
    dropout_probability: [undefined, 0.5, 0.7],
};

type Scenario = {
    daysUntilExam?: number;
    mastery_probability: number;
    days_until_forget?: number;
    attention_risk: "LOW" | "HIGH";
    days_since_last_revision: number;
    attempts_count: number;
    dropout_probability?: number;
};

// --- Rule Definitions ---
// These replicate the logic in src/ai/adk/decision-engine.ts
// We add expectedAction to verify against the actual implementation.

const REVISION_RULES = [
    {
        id: "R0_EXAM_CRAMMING",
        priority: 0,
        condition: (s: Scenario) => (s.daysUntilExam !== undefined && s.daysUntilExam <= 3) && s.mastery_probability < 0.6,
        description: "Exam imminent (<3 days) & low mastery (<0.6)",
        expectedAction: DecisionAction.URGENT_REVISION
    },
    {
        id: "R1_FORGETTING_RISK",
        priority: 1,
        condition: (s: Scenario) => s.mastery_probability < 0.4 && (s.days_until_forget ?? 999) < 3,
        description: "Low mastery (<0.4) & imminent forgetting (<3 days)",
        expectedAction: DecisionAction.URGENT_REVISION
    },
    {
        id: "R2_ATTENTION_RISK",
        priority: 2,
        condition: (s: Scenario) => s.mastery_probability < 0.4 && s.attention_risk === "HIGH",
        description: "Low mastery (<0.4) & high attention risk",
        expectedAction: DecisionAction.ADAPTIVE_TEACHING
    },
    {
        id: "R3_SPACED_REPETITION",
        priority: 3,
        condition: (s: Scenario) => s.mastery_probability >= 0.4 && s.mastery_probability < 0.6 && s.days_since_last_revision > 7,
        description: "Moderate mastery (0.4-0.6) & stale (>7 days)",
        expectedAction: DecisionAction.SCHEDULED_REVISION
    },
    {
        id: "R4_MASTERY_PROGRESS",
        priority: 4,
        condition: (s: Scenario) => s.mastery_probability >= 0.7 && s.days_since_last_revision <= 14,
        description: "High mastery (>=0.7) & recent (<14 days)",
        expectedAction: DecisionAction.PROGRESS_ALLOWED
    },
    // Default is implicit: SCHEDULED_REVISION
];

const INTERVENTION_RULES = [
    {
        id: "I1_CRITICAL_RISK",
        priority: 0,
        condition: (s: Scenario) => s.mastery_probability < 0.3 && s.attention_risk === "HIGH" && s.days_since_last_revision > 10,
        description: "Very low mastery (<0.3) & high attention & inactive (>10 days)"
    },
    {
        id: "I2_DROPOUT_RISK",
        priority: 1,
        condition: (s: Scenario) => s.attention_risk === "HIGH" && (s.dropout_probability ?? 0) > 0.6,
        description: "High attention risk & high dropout (>0.6)"
    },
    {
        id: "I3_PERSISTENT_FAILURE",
        priority: 2,
        condition: (s: Scenario) => s.mastery_probability < 0.4 && s.attempts_count > 5,
        description: "Low mastery (<0.4) & many attempts (>5)"
    },
    // Default is null
];

// --- Analysis Logic ---

function analyze() {
    let scenarioCount = 0;
    const revisionStats = {
        triggered: {} as Record<string, number>,
        shadowed: {} as Record<string, Record<string, number>>,
        overlaps: {} as Record<string, Record<string, number>>,
        gaps: 0,
        mismatches: 0
    };
    const interventionStats = {
        triggered: {} as Record<string, number>,
        shadowed: {} as Record<string, Record<string, number>>,
        overlaps: {} as Record<string, Record<string, number>>,
        gaps: 0,
        mismatches: 0
    };

    // Initialize counters
    REVISION_RULES.forEach(r => {
        revisionStats.triggered[r.id] = 0;
        revisionStats.shadowed[r.id] = {};
        revisionStats.overlaps[r.id] = {};
        REVISION_RULES.forEach(other => {
            if (r.id !== other.id) {
                revisionStats.shadowed[r.id][other.id] = 0;
                revisionStats.overlaps[r.id][other.id] = 0;
            }
        });
    });

    INTERVENTION_RULES.forEach(r => {
        interventionStats.triggered[r.id] = 0;
        interventionStats.shadowed[r.id] = {};
        interventionStats.overlaps[r.id] = {};
        INTERVENTION_RULES.forEach(other => {
            if (r.id !== other.id) {
                interventionStats.shadowed[r.id][other.id] = 0;
                interventionStats.overlaps[r.id][other.id] = 0;
            }
        });
    });

    // Cartesian Product Iteration
    const scenarios: Scenario[] = [];

    for (const dExam of DOMAIN.daysUntilExam) {
        for (const mastery of DOMAIN.mastery_probability) {
            for (const dForget of DOMAIN.days_until_forget) {
                for (const att of DOMAIN.attention_risk) {
                    for (const dRev of DOMAIN.days_since_last_revision) {
                        for (const attCount of DOMAIN.attempts_count) {
                            for (const drop of DOMAIN.dropout_probability) {
                                scenarios.push({
                                    daysUntilExam: dExam,
                                    mastery_probability: mastery,
                                    days_until_forget: dForget,
                                    attention_risk: att as any,
                                    days_since_last_revision: dRev,
                                    attempts_count: attCount,
                                    dropout_probability: drop,
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    scenarioCount = scenarios.length;

    for (const s of scenarios) {
        // Construct DecisionContext for Actual Code
        const context: DecisionContext = {
            studentId: "test-student",
            topic: "test-topic",
            currentDate: new Date(),
            daysUntilExam: s.daysUntilExam,
            mlSignals: {
                mastery_probability: s.mastery_probability,
                confidence: 0.8, // Default
                days_until_forget: s.days_until_forget,
                attention_risk: s.attention_risk,
                dropout_probability: s.dropout_probability,
                days_since_last_revision: s.days_since_last_revision,
                attempts_count: s.attempts_count,
            }
        };

        // --- Revision Analysis ---
        let triggeredRule: any = null;
        const matchingRules: string[] = [];

        for (const rule of REVISION_RULES) {
            if (rule.condition(s)) {
                matchingRules.push(rule.id);
                if (!triggeredRule) {
                    triggeredRule = rule;
                }
            }
        }

        // Run Actual Code
        const actualDecision = makeRevisionDecision(context);

        if (triggeredRule) {
            revisionStats.triggered[triggeredRule.id]++;

            // Validate Model vs Code
            if (actualDecision.action !== triggeredRule.expectedAction) {
                console.warn(`MISMATCH [Revision]: Scenario matches ${triggeredRule.id} (Expected ${triggeredRule.expectedAction}) but code returned ${actualDecision.action}`);
                revisionStats.mismatches++;
            }

            // Check for shadowing
            for (const matchId of matchingRules) {
                if (matchId !== triggeredRule.id) {
                    revisionStats.shadowed[matchId][triggeredRule.id]++;
                }
            }
            // Check for overlaps
            for (const m1 of matchingRules) {
                for (const m2 of matchingRules) {
                    if (m1 !== m2) {
                        revisionStats.overlaps[m1][m2]++;
                    }
                }
            }
        } else {
            revisionStats.gaps++;
            // Default case check
            if (actualDecision.action !== DecisionAction.SCHEDULED_REVISION) {
                 console.warn(`MISMATCH [Revision Default]: Scenario matches no rule (Expected SCHEDULED_REVISION) but code returned ${actualDecision.action}`);
                 revisionStats.mismatches++;
            }
        }

        // --- Intervention Analysis ---
        let triggeredInterventionRule: any = null;
        const matchingInterventions: string[] = [];

        for (const rule of INTERVENTION_RULES) {
            if (rule.condition(s)) {
                matchingInterventions.push(rule.id);
                if (!triggeredInterventionRule) {
                    triggeredInterventionRule = rule;
                }
            }
        }

        // Run Actual Code
        const actualIntervention = makeInterventionDecision(context);

        if (triggeredInterventionRule) {
            interventionStats.triggered[triggeredInterventionRule.id]++;

            // Validate Model vs Code
            if (actualIntervention === null) {
                console.warn(`MISMATCH [Intervention]: Scenario matches ${triggeredInterventionRule.id} but code returned null`);
                interventionStats.mismatches++;
            }

             for (const matchId of matchingInterventions) {
                if (matchId !== triggeredInterventionRule.id) {
                    interventionStats.shadowed[matchId][triggeredInterventionRule.id]++;
                }
            }
            for (const m1 of matchingInterventions) {
                for (const m2 of matchingInterventions) {
                    if (m1 !== m2) {
                        interventionStats.overlaps[m1][m2]++;
                    }
                }
            }
        } else {
            interventionStats.gaps++;
            if (actualIntervention !== null) {
                 console.warn(`MISMATCH [Intervention Default]: Scenario matches no rule (Expected null) but code returned intervention`);
                 interventionStats.mismatches++;
            }
        }
    }

    // Output Generation
    console.log("# ADK Decision Logic Validation Report");
    console.log(`\n**Total Scenarios Tested:** ${scenarioCount}`);

    console.log("\n## Revision Decision Logic");
    if (revisionStats.mismatches > 0) {
        console.log(`\n⚠️ **WARNING: ${revisionStats.mismatches} Mismatches detected between Model and Implementation!**\n`);
    } else {
        console.log(`\n✅ **Model matches Implementation perfectly.**\n`);
    }

    console.log("| Rule ID | Description | Triggered Count | Coverage % |");
    console.log("|---|---|---|---|");
    REVISION_RULES.forEach(r => {
        const count = revisionStats.triggered[r.id];
        const pct = ((count / scenarioCount) * 100).toFixed(2);
        console.log(`| ${r.id} | ${r.description} | ${count} | ${pct}% |`);
    });
    console.log(`| DEFAULT | Routine Revision | ${revisionStats.gaps} | ${((revisionStats.gaps / scenarioCount) * 100).toFixed(2)}% |`);

    console.log("\n### Overlap Analysis (Potential Contradictions)");
    console.log("These pairs of rules are satisfied simultaneously. The higher priority (earlier) rule wins.");
    console.log("| Winner Rule | Shadowed Rule | Count |");
    console.log("|---|---|---|");
    let hasOverlap = false;
    for (const [ruleId, counts] of Object.entries(revisionStats.shadowed)) {
        for (const [shadowingId, count] of Object.entries(counts)) {
            if (count > 0) {
                console.log(`| ${shadowingId} | ${ruleId} | ${count} |`);
                hasOverlap = true;
            }
        }
    }
    if (!hasOverlap) console.log("| None | None | 0 |");

    console.log("\n## Intervention Decision Logic");
    if (interventionStats.mismatches > 0) {
        console.log(`\n⚠️ **WARNING: ${interventionStats.mismatches} Mismatches detected between Model and Implementation!**\n`);
    } else {
        console.log(`\n✅ **Model matches Implementation perfectly.**\n`);
    }

    console.log("| Rule ID | Description | Triggered Count | Coverage % |");
    console.log("|---|---|---|---|");
    INTERVENTION_RULES.forEach(r => {
        const count = interventionStats.triggered[r.id];
        const pct = ((count / scenarioCount) * 100).toFixed(2);
        console.log(`| ${r.id} | ${r.description} | ${count} | ${pct}% |`);
    });
    console.log(`| NO_INTERVENTION | - | ${interventionStats.gaps} | ${((interventionStats.gaps / scenarioCount) * 100).toFixed(2)}% |`);

    console.log("\n### Overlap Analysis (Intervention)");
    console.log("| Winner Rule | Shadowed Rule | Count |");
    console.log("|---|---|---|");
    hasOverlap = false;
    for (const [ruleId, counts] of Object.entries(interventionStats.shadowed)) {
        for (const [shadowingId, count] of Object.entries(counts)) {
            if (count > 0) {
                console.log(`| ${shadowingId} | ${ruleId} | ${count} |`);
                hasOverlap = true;
            }
        }
    }
    if (!hasOverlap) console.log("| None | None | 0 |");

    // Unreachable Code Check
    console.log("\n## Unreachable/Dead Rules");
    const deadRules = [...REVISION_RULES.filter(r => revisionStats.triggered[r.id] === 0).map(r => r.id),
                       ...INTERVENTION_RULES.filter(r => interventionStats.triggered[r.id] === 0).map(r => r.id)];

    if (deadRules.length > 0) {
        deadRules.forEach(id => console.log(`- ${id}`));
    } else {
        console.log("- None (All rules are reachable)");
    }
}

analyze();
