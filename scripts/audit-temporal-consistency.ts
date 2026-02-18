
import {
    extractMasteryFeatures,
    StudentHistory,
    RawQuizResult,
    MasteryFeatures
} from '../src/ml/features/student_features';

// ==========================================
// Types
// ==========================================

interface StudentState {
    lastTimestamp: number;
    mastery: number;
    totalAttempts: number;
    lastQuizScore: number;
}

interface InvariantViolation {
    studentId: string;
    timestamp: string;
    rule: string;
    details: string;
}

type ConsistencyRule = (
    prevState: StudentState,
    currentState: StudentState,
    event: RawQuizResult
) => InvariantViolation | null;

// ==========================================
// Mock ML Logic (Proxy for Python Model)
// ==========================================

function mockPredictMastery(features: MasteryFeatures): number {
    let mastery_prob = features.avg_quiz_score;

    // Penalize for high variance
    mastery_prob -= features.quiz_score_variance * 0.5;

    // Penalize for long time since revision (Forgetting Curve)
    if (features.days_since_last_revision > 14) {
        mastery_prob -= 0.2;
    }

    // Hard cutoff for low scores
    if (features.avg_quiz_score < 0.5) {
        mastery_prob = 0;
    }

    // Clamp to 0-1
    return Math.max(0, Math.min(1, mastery_prob));
}

// ==========================================
// Scenario Generators
// ==========================================

function generateNormalFlow(studentId: string): StudentHistory {
    const baseTime = new Date('2023-01-01T10:00:00Z').getTime();
    const quizzes: RawQuizResult[] = [];

    // 5 quizzes over 5 days, improving scores
    for (let i = 0; i < 5; i++) {
        quizzes.push({
            topic: 'Math',
            score: 0.6 + (i * 0.05), // 0.6, 0.65, 0.7...
            timestamp: new Date(baseTime + i * 24 * 60 * 60 * 1000),
            timeSpent: 60,
            questionsAttempted: 5
        });
    }

    return {
        studentId,
        quizResults: quizzes,
        lastLoginDate: new Date(),
        registrationDate: new Date(baseTime)
    };
}

function generateTimeTravel(studentId: string): StudentHistory {
    const baseTime = new Date('2023-01-01T10:00:00Z').getTime();
    const quizzes: RawQuizResult[] = [];

    // Day 1
    quizzes.push({
        topic: 'Math',
        score: 0.7,
        timestamp: new Date(baseTime),
        timeSpent: 60,
        questionsAttempted: 5
    });

    // Day 0 (Time Travel Paradox)
    quizzes.push({
        topic: 'Math',
        score: 0.8,
        timestamp: new Date(baseTime - 24 * 60 * 60 * 1000),
        timeSpent: 60,
        questionsAttempted: 5
    });

    return {
        studentId,
        quizResults: quizzes,
        lastLoginDate: new Date(),
        registrationDate: new Date(baseTime)
    };
}

function generateZombieState(studentId: string): StudentHistory {
    const baseTime = new Date('2023-01-01T10:00:00Z').getTime();
    const quizzes: RawQuizResult[] = [];

    // Day 1: Good score
    quizzes.push({
        topic: 'Math',
        score: 0.9,
        timestamp: new Date(baseTime),
        timeSpent: 60,
        questionsAttempted: 5
    });

    // Day 30: Good score (But should have decayed in between if we track continuous state)
    // Here we simulate a history where the student returns after 30 days.
    // The violation to check is: Does the mastery calculation respect the gap?
    quizzes.push({
        topic: 'Math',
        score: 0.9,
        timestamp: new Date(baseTime + 30 * 24 * 60 * 60 * 1000),
        timeSpent: 60,
        questionsAttempted: 5
    });

    return {
        studentId,
        quizResults: quizzes,
        lastLoginDate: new Date(),
        registrationDate: new Date(baseTime)
    };
}

function generateMasteryTeleportation(studentId: string): StudentHistory {
     const baseTime = new Date('2023-01-01T10:00:00Z').getTime();
    const quizzes: RawQuizResult[] = [];

    // Day 1: Low score
    quizzes.push({
        topic: 'Math',
        score: 0.2,
        timestamp: new Date(baseTime),
        timeSpent: 60,
        questionsAttempted: 5
    });

    // Day 2: Sudden jump without intermediate steps (simulated by immediate high score)
    // In a real system, teleportation is state changing without an event.
    // In event sourcing, it's a huge delta between two events that exceeds realistic learning rate.
    quizzes.push({
        topic: 'Math',
        score: 0.95,
        timestamp: new Date(baseTime + 24 * 60 * 60 * 1000),
        timeSpent: 60,
        questionsAttempted: 5
    });

    return {
        studentId,
        quizResults: quizzes,
        lastLoginDate: new Date(),
        registrationDate: new Date(baseTime)
    };
}


// ==========================================
// Audit Logic
// ==========================================

function auditHistory(history: StudentHistory): InvariantViolation[] {
    const violations: InvariantViolation[] = [];
    const quizzes = history.quizResults; // Don't sort, trust the input order to detect issues

    // Initial State
    let prevState: StudentState = {
        lastTimestamp: 0,
        mastery: 0,
        totalAttempts: 0,
        lastQuizScore: 0
    };

    // We need to simulate the cumulative history for feature extraction
    // because extractMasteryFeatures takes the whole history.
    const cumulativeHistory: RawQuizResult[] = [];

    for (const quiz of quizzes) {
        // 1. Check Temporal Ordering (Immediate check)
        if (prevState.totalAttempts > 0 && quiz.timestamp.getTime() < prevState.lastTimestamp) {
            violations.push({
                studentId: history.studentId || 'unknown',
                timestamp: quiz.timestamp.toISOString(),
                rule: 'TemporalOrdering',
                details: `Event timestamp (${quiz.timestamp.toISOString()}) is before previous event (${new Date(prevState.lastTimestamp).toISOString()})`
            });
        }

        // 2. Check Forgetting Curve Compliance (Pre-Event)
        // Check "Implied State at Start of Event" (just before the quiz)
        const daysSinceLast = prevState.totalAttempts > 0
            ? (quiz.timestamp.getTime() - prevState.lastTimestamp) / (1000 * 60 * 60 * 24)
            : 0;

        if (daysSinceLast > 14 && prevState.mastery > 0.5) {
             // Calculate mastery JUST BEFORE this new quiz
             // using the OLD cumulative history (which doesn't have current quiz yet)
             // but using the CURRENT time (quiz.timestamp) as reference date.
             const featuresPre = extractMasteryFeatures(
                 quiz.topic,
                 { ...history, quizResults: [...cumulativeHistory] },
                 quiz.timestamp
             );

             const masteryPre = mockPredictMastery(featuresPre);

             // If masteryPre is still high, it means the model is NOT decaying properly with time.
             if (masteryPre > 0.8) {
                  violations.push({
                      studentId: history.studentId || 'unknown',
                      timestamp: quiz.timestamp.toISOString(),
                      rule: 'ForgettingCurve',
                      details: `Mastery pre-quiz (${masteryPre.toFixed(2)}) did not decay despite ${daysSinceLast.toFixed(1)} days inactivity.`
                  });
             }
        }

        // Add to cumulative history to calculate mastery at this point in time
        cumulativeHistory.push(quiz);

        // Calculate features based on history UP TO THIS POINT
        const features = extractMasteryFeatures(
            quiz.topic,
            { ...history, quizResults: cumulativeHistory },
            quiz.timestamp // Use current quiz time as reference
        );

        // Predict Mastery
        const currentMastery = mockPredictMastery(features);

        const currentState: StudentState = {
            lastTimestamp: quiz.timestamp.getTime(),
            mastery: currentMastery,
            totalAttempts: prevState.totalAttempts + 1,
            lastQuizScore: quiz.score
        };

        // 3. Check Mastery Teleportation (Unrealistic Learning Rate)
        // If mastery jumps from 0.2 to 0.9 in one step (1 day), is it possible?
        // Only applicable if we have history (not the first quiz)
        if (prevState.totalAttempts > 0 && currentState.mastery - prevState.mastery > 0.6 && daysSinceLast < 2) {
             violations.push({
                studentId: history.studentId || 'unknown',
                timestamp: quiz.timestamp.toISOString(),
                rule: 'MasteryTeleportation',
                details: `Mastery jumped by ${(currentState.mastery - prevState.mastery).toFixed(2)} in ${daysSinceLast.toFixed(1)} days. Unrealistic learning rate.`
            });
        }

        // Update state
        prevState = currentState;
    }

    return violations;
}

// ==========================================
// Main Execution
// ==========================================

function runAudit() {
    console.log("# Temporal Consistency Audit Report\n");
    console.log(`Generated at: ${new Date().toISOString()}\n`);

    const scenarios = [
        { name: "Normal Learner", data: generateNormalFlow("student_normal") },
        { name: "Time Traveler", data: generateTimeTravel("student_time_traveler") },
        { name: "Zombie State (Forgetful)", data: generateZombieState("student_zombie") },
        { name: "Mastery Teleporter", data: generateMasteryTeleportation("student_teleporter") }
    ];

    let totalViolations = 0;

    for (const scenario of scenarios) {
        console.log(`## Scenario: ${scenario.name}`);
        const violations = auditHistory(scenario.data);

        if (violations.length === 0) {
            console.log("✅ No violations detected.\n");
        } else {
            console.log("❌ Violations Detected:");
            for (const v of violations) {
                console.log(`- [${v.rule}] ${v.timestamp}: ${v.details}`);
            }
            console.log("");
            totalViolations += violations.length;
        }
    }

    console.log("## Risk Assessment");
    if (totalViolations > 0) {
        console.log("⚠️  CRITICAL: Invariants violated in synthetic scenarios. The system logic or data pipeline permits invalid states.");
        console.log("- Time Travel bugs indicate potential DB sync issues or client-side clock trust.");
        console.log("- Mastery Teleportation indicates feature extraction might be over-weighting recent events.");
        console.log("- Forgetting Curve failures indicate the ML model may not be penalizing inactivity correctly.");
    } else {
        console.log("✅ System logic appears consistent across tested scenarios.");
    }
}

// Run if main
runAudit();
