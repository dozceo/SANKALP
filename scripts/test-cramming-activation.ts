
import { makeRevisionDecision } from '../src/ai/adk/decision-engine';
import { DecisionContext, MLSignals, DecisionAction } from '../src/ai/adk/types';

// Mock ML Signals
const mockMLSignals: MLSignals = {
    mastery_probability: 0.5,
    confidence: 0.8,
    days_since_last_revision: 5,
    attempts_count: 2,
    performance_trend: "STABLE",
    attention_risk: "LOW"
};

// Frontend Logic Simulation
function simulateFrontendLogic(today: Date, examDate: Date) {
    const timeDiff = examDate.getTime() - today.getTime();
    const daysUntilExam = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const isCrammingTime = daysUntilExam <= 3 && daysUntilExam >= 1;
    return { daysUntilExam, isCrammingTime };
}

// ADK Logic Simulation (using the actual function)
function simulateADKLogic(daysUntilExam: number) {
    const context: DecisionContext = {
        studentId: "test-student",
        topic: "Test Topic",
        currentDate: new Date(),
        examDate: new Date(), // irrelevant here as we pass daysUntilExam
        daysUntilExam: daysUntilExam,
        mlSignals: mockMLSignals
    };

    const decision = makeRevisionDecision(context);
    // Check if CRAMMING_MODE flag is set
    const isCrammingMode = decision.adkFlags.includes("CRAMMING_MODE");
    return { decision, isCrammingMode };
}

// Test Runner
function runTests() {
    console.log("=== Cramming Helper Activation Logic Test ===\n");

    const today = new Date("2023-10-25T12:00:00Z"); // Fixed reference date

    const testCases = [
        { name: "Exam Today (0 days)", daysOffset: 0 },
        { name: "Exam Tomorrow (1 day)", daysOffset: 1 },
        { name: "Exam in 3 days", daysOffset: 3 },
        { name: "Exam in 4 days", daysOffset: 4 },
        { name: "Exam Yesterday (-1 day)", daysOffset: -1 },
        { name: "Exam in 0.5 days (12 hours)", hoursOffset: 12 },
    ];

    testCases.forEach(test => {
        const examDate = new Date(today.getTime());
        if (test.daysOffset !== undefined) {
            examDate.setDate(examDate.getDate() + test.daysOffset);
        }
        if (test.hoursOffset !== undefined) {
            examDate.setTime(examDate.getTime() + (test.hoursOffset * 60 * 60 * 1000));
        }

        console.log(`Test Case: ${test.name}`);
        console.log(`  Today: ${today.toISOString()}`);
        console.log(`  Exam:  ${examDate.toISOString()}`);

        const frontend = simulateFrontendLogic(today, examDate);
        console.log(`  Frontend Calculation:`);
        console.log(`    daysUntilExam: ${frontend.daysUntilExam}`);
        console.log(`    isCrammingTime (Logic: <= 3 && >= 1): ${frontend.isCrammingTime}`);

        const adk = simulateADKLogic(frontend.daysUntilExam);
        console.log(`  ADK Decision Engine:`);
        console.log(`    Action: ${adk.decision.action}`);
        console.log(`    Flags: ${adk.decision.adkFlags.join(", ")}`);
        console.log(`    Cramming Mode Active: ${adk.isCrammingMode}`);

        if (frontend.daysUntilExam === 0) {
             if (!frontend.isCrammingTime) console.error("  [FAIL] Frontend logic fails for 0 days (Exam Day)!");
             if (!adk.isCrammingMode) console.error("  [FAIL] ADK logic fails for 0 days due to falsy check!");
        }

        console.log("\n---------------------------------------------------\n");
    });
}

runTests();
