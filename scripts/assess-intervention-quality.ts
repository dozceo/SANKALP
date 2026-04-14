
import { makeInterventionDecision } from '../src/ai/adk/decision-engine';
import { DecisionContext, MLSignals, TeacherInterventionSignal } from '../src/ai/adk/types';

// Mock Data Generator
function createMockContext(
    scenarioName: string,
    mlOverrides: Partial<MLSignals>,
    daysInactive: number
): DecisionContext {
    const baseSignals: MLSignals = {
        mastery_probability: 0.5,
        confidence: 0.8,
        days_since_last_revision: daysInactive,
        attempts_count: 3,
        performance_trend: "STABLE",
        attention_risk: "LOW",
        dropout_probability: 0.1,
        ...mlOverrides
    };

    return {
        studentId: `student-${scenarioName.replace(/\s+/g, '-').toLowerCase()}`,
        topic: "Quadratic Equations",
        currentDate: new Date(),
        daysUntilExam: 30,
        mlSignals: baseSignals
    };
}

// Scenarios
const scenarios = [
    {
        name: "Critical Risk Student",
        ml: { mastery_probability: 0.2, attention_risk: "HIGH" },
        daysInactive: 15
    },
    {
        name: "High Dropout Risk",
        ml: { mastery_probability: 0.6, attention_risk: "HIGH", dropout_probability: 0.75 },
        daysInactive: 2
    },
    {
        name: "Persistent Struggle",
        ml: { mastery_probability: 0.35, attempts_count: 8 },
        daysInactive: 1
    },
    {
        name: "Doing Fine (Control)",
        ml: { mastery_probability: 0.85, attention_risk: "LOW" },
        daysInactive: 1
    },
    {
        name: "Borderline Case",
        ml: { mastery_probability: 0.45, attempts_count: 4, attention_risk: "MEDIUM" },
        daysInactive: 5
    }
];

// Assessment Logic
function assessInterventions() {
    console.log("# Teacher Intervention Quality Assessment Report\n");
    console.log(`Generated on: ${new Date().toISOString()}\n`);

    let interventionCount = 0;

    scenarios.forEach(scenario => {
        const context = createMockContext(scenario.name, scenario.ml as any, scenario.daysInactive); // cast needed for Partial
        const intervention = makeInterventionDecision(context);

        console.log(`## Scenario: ${scenario.name}`);
        console.log(`- **Input Signals**: Mastery=${context.mlSignals.mastery_probability}, Attention=${context.mlSignals.attention_risk}, Inactive=${context.mlSignals.days_since_last_revision} days, Attempts=${context.mlSignals.attempts_count}`);

        if (intervention) {
            interventionCount++;
            console.log(`- **Outcome**: INTERVENTION TRIGGERED`);
            console.log(`  - **Severity**: ${intervention.severity}`);
            console.log(`  - **Reason**: "${intervention.reason}"`);
            console.log(`  - **Suggested Action**: "${intervention.suggestedAction}"`);

            // Basic Quality Check
            const specific = intervention.suggestedAction.length > 20; // Crude heuristic
            const actionable = intervention.suggestedAction.includes("Consider") || intervention.suggestedAction.includes("Engage");
            console.log(`  - **Quality Check**: Specificity=${specific ? "PASS" : "FAIL"}, Actionability=${actionable ? "PASS" : "WARN"}`);
        } else {
            console.log(`- **Outcome**: No Intervention`);
        }
        console.log("\n---\n");
    });

    console.log(`Total Interventions Generated: ${interventionCount} / ${scenarios.length}`);
}

assessInterventions();
