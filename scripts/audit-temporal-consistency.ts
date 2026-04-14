
import {
    extractMasteryFeatures,
    extractAttentionFeatures,
    RawQuizResult,
    StudentHistory,
    MasteryFeatures,
    AttentionFeatures,
    calculatePerformanceTrend
} from "../src/ml/features/student_features";
import {
    makeRevisionDecision
} from "../src/ai/adk/decision-engine";
import {
    DecisionContext,
    ADKDecision,
    DecisionAction,
    MLSignals
} from "../src/ai/adk/types";
import * as fs from 'fs';
import * as path from 'path';

// --- Mock ML Model ---
// Simulates the Python model behavior since we cannot run it in this environment.
// Key logic:
// - Mastery increases with score and attempts.
// - Mastery decays with days_since_last_revision (Forgetting Curve).
class MockMLModel {
    predictMastery(features: MasteryFeatures): { probability: number, confidence: number } {
        // Base mastery from quiz performance
        let baseMastery = features.avg_quiz_score * 0.8 + (Math.min(features.attempts_per_topic, 5) / 5) * 0.2;

        // Forgetting Curve Decay
        // If days_since_last_revision is high, mastery drops.
        // Ebbinghaus forgetting curve approximation: R = e^(-t/S)
        // We use a simplified decay factor.
        const days = features.days_since_last_revision === 999 ? 0 : features.days_since_last_revision;
        const decayFactor = Math.exp(-0.05 * days); // Decay by ~5% per day initially

        // Apply decay
        let probability = baseMastery * decayFactor;

        // Cap at 1.0, floor at 0.0
        probability = Math.max(0, Math.min(1, probability));

        // Confidence logic (simple heuristic)
        // High attempts + recent activity = high confidence
        const confidence = Math.min(1, (features.attempts_per_topic * 0.1) + (decayFactor * 0.5));

        return { probability, confidence };
    }
}

// --- Student Simulator ---
class StudentSimulator {
    history: StudentHistory;
    mlModel: MockMLModel;
    studentId: string;

    constructor(studentId: string) {
        this.studentId = studentId;
        this.history = {
            studentId,
            quizResults: [],
            lastLoginDate: new Date(),
            registrationDate: new Date()
        };
        this.mlModel = new MockMLModel();
    }

    addQuiz(topic: string, score: number, timestamp: Date) {
        const result: RawQuizResult = {
            topic,
            score,
            timestamp,
            timeSpent: 60, // 1 min per question avg
            questionsAttempted: 5
        };
        this.history.quizResults.push(result);
        // Update last login
        if (timestamp > this.history.lastLoginDate) {
            this.history.lastLoginDate = timestamp;
        }
    }

    getFeatures(topic: string, referenceDate: Date): { mastery: MasteryFeatures, attention: AttentionFeatures } {
        return {
            mastery: extractMasteryFeatures(topic, this.history, referenceDate),
            attention: extractAttentionFeatures(this.history, referenceDate)
        };
    }

    predict(topic: string, referenceDate: Date) {
        const { mastery, attention } = this.getFeatures(topic, referenceDate);
        const prediction = this.mlModel.predictMastery(mastery);
        return {
            masteryFeatures: mastery,
            attentionFeatures: attention,
            prediction
        };
    }

    getDecision(topic: string, referenceDate: Date): ADKDecision {
        const { masteryFeatures, attentionFeatures, prediction } = this.predict(topic, referenceDate);

        const mlSignals: MLSignals = {
            mastery_probability: prediction.probability,
            confidence: prediction.confidence,
            days_until_forget: Math.max(0, 30 - masteryFeatures.days_since_last_revision), // Mock logic
            attention_risk: attentionFeatures.days_inactive > 7 ? "HIGH" : "LOW", // Simple logic
            days_since_last_revision: masteryFeatures.days_since_last_revision,
            attempts_count: masteryFeatures.attempts_per_topic,
            performance_trend: calculatePerformanceTrend(this.history.quizResults)
        };

        const context: DecisionContext = {
            studentId: this.studentId,
            topic,
            currentDate: referenceDate,
            mlSignals
        };

        return makeRevisionDecision(context);
    }
}

// --- Analysis Logic ---

interface Violation {
    type: string;
    description: string;
    details: any;
}

const violations: Violation[] = [];

function checkInvariant(condition: boolean, type: string, description: string, details: any) {
    if (!condition) {
        violations.push({ type, description, details });
    }
}

async function runAudit() {
    console.log("Starting Temporal Consistency Audit...");
    const reportLines: string[] = [];
    reportLines.push("# Temporal Consistency Audit Report");
    reportLines.push(`Date: ${new Date().toISOString()}`);
    reportLines.push("");

    // Scenario 1: Causality Violation (Revision before Learning)
    console.log("Running Scenario 1: Causality Check...");
    const s1 = new StudentSimulator("student_new");
    const decision1 = s1.getDecision("topic_never_seen", new Date());

    // Check if decision is URGENT_REVISION for unattempted topic
    const features1 = s1.getFeatures("topic_never_seen", new Date()).mastery;

    if (features1.attempts_per_topic === 0 &&
        (decision1.action === DecisionAction.URGENT_REVISION ||
         decision1.action === DecisionAction.SCHEDULED_REVISION)) {
        checkInvariant(false, "Causality Violation",
            "System recommended revision for a topic never attempted.",
            { decision: decision1.action, topic: "topic_never_seen", attempts: 0 }
        );
    }

    reportLines.push("## Scenario 1: Causality Check (Revision before Learning)");
    reportLines.push(`- Topic: "topic_never_seen"`);
    reportLines.push(`- Attempts: ${features1.attempts_per_topic}`);
    reportLines.push(`- Decision: ${decision1.action}`);
    if (features1.attempts_per_topic === 0 &&
        (decision1.action === DecisionAction.URGENT_REVISION || decision1.action === DecisionAction.SCHEDULED_REVISION)) {
        reportLines.push(`- **VIOLATION DETECTED**: Cannot recommend revision for unlearned topic.`);
    } else {
        reportLines.push(`- Status: PASSED`);
    }
    reportLines.push("");

    // Scenario 2: Temporal Ordering (Time Travel)
    console.log("Running Scenario 2: Time Travel Resilience...");
    const s2 = new StudentSimulator("student_time_travel");
    const t0 = new Date("2023-01-01T10:00:00Z");
    const t1 = new Date("2023-01-02T10:00:00Z"); // Future relative to t0
    const t_past = new Date("2023-01-01T09:00:00Z"); // Past relative to t0

    // Add quiz at T1 (Day 2)
    s2.addQuiz("topic_A", 0.8, t1);
    const features_t1 = s2.getFeatures("topic_A", t1).mastery;

    // Add quiz at T_past (Day 1 morning) - strictly earlier than existing max
    s2.addQuiz("topic_A", 0.5, t_past);
    const features_mixed = s2.getFeatures("topic_A", t1).mastery;

    // Check monotonicity of attempts
    checkInvariant(features_mixed.attempts_per_topic > features_t1.attempts_per_topic,
        "Monotonicity Violation", "Attempts count did not increase after adding past quiz.",
        { before: features_t1.attempts_per_topic, after: features_mixed.attempts_per_topic }
    );

    // Check if days_since_last_revision is still calculated from t1 (latest) not t_past (last inserted)
    // At t1 (reference date is t1), days_since should be 0 (since latest quiz is at t1).
    // If it uses t_past as latest, days_since would be ~1.

    // Note: extractMasteryFeatures logic:
    // referenceDate - latestTimestamp
    // If t1 is latest, result should be 0.

    // Let's verify specifically.
    const daysSince = features_mixed.days_since_last_revision;

    // The reference date passed to getFeatures is t1.
    // Latest timestamp in history is t1.
    // So daysSince should be 0.

    reportLines.push("## Scenario 2: Time Travel Resilience");
    reportLines.push(`- Added Quiz at T1 (Day 2)`);
    reportLines.push(`- Added Quiz at T_past (Day 1) - Out of order insertion`);
    reportLines.push(`- Attempts Count: ${features_mixed.attempts_per_topic} (Expected: 2)`);
    reportLines.push(`- Days Since Last Revision: ${daysSince} (Expected: 0)`);

    if (daysSince !== 0) {
         checkInvariant(false, "Temporal Ordering Violation",
            "Days since last revision calculated incorrectly after out-of-order insertion.",
            { expected: 0, actual: daysSince }
        );
        reportLines.push(`- **VIOLATION DETECTED**: Timestamp handling is order-dependent.`);
    } else {
        reportLines.push(`- Status: PASSED`);
    }
    reportLines.push("");

    // Scenario 3: Forgetting Curve Validation
    console.log("Running Scenario 3: Forgetting Curve...");
    const s3 = new StudentSimulator("student_forgetting");
    const start = new Date("2023-01-01T10:00:00Z");

    // Learn topic
    s3.addQuiz("topic_B", 0.9, start); // High score

    const predStart = s3.predict("topic_B", start);

    // Fast forward 30 days
    const future = new Date("2023-01-31T10:00:00Z");
    const predFuture = s3.predict("topic_B", future);

    reportLines.push("## Scenario 3: Forgetting Curve Validation");
    reportLines.push(`- Initial Mastery (Day 0): ${predStart.prediction.probability.toFixed(3)}`);
    reportLines.push(`- Future Mastery (Day 30): ${predFuture.prediction.probability.toFixed(3)}`);
    reportLines.push(`- Decay Observed: ${(predStart.prediction.probability - predFuture.prediction.probability).toFixed(3)}`);

    if (predFuture.prediction.probability >= predStart.prediction.probability) {
        checkInvariant(false, "Forgetting Curve Violation",
            "Mastery did not decay over 30 days of inactivity.",
            { start: predStart.prediction.probability, end: predFuture.prediction.probability }
        );
        reportLines.push(`- **VIOLATION DETECTED**: No mastery decay observed.`);
    } else {
        reportLines.push(`- Status: PASSED (Mastery decayed as expected)`);
    }
    reportLines.push("");

    // Scenario 4: Teleportation / Inconsistent State
    // Simulate "Mastery Teleportation": If we query at T and T+1min without events, mastery should be identical.
    console.log("Running Scenario 4: State Stability...");
    const s4 = new StudentSimulator("student_stability");
    const t_stable = new Date("2023-06-01T10:00:00Z");
    s4.addQuiz("topic_C", 0.7, t_stable);

    const p1 = s4.predict("topic_C", t_stable).prediction.probability;
    const t_stable_plus = new Date("2023-06-01T10:01:00Z"); // 1 min later
    const p2 = s4.predict("topic_C", t_stable_plus).prediction.probability;

    const diff = Math.abs(p1 - p2);
    reportLines.push("## Scenario 4: State Stability (Teleportation Check)");
    reportLines.push(`- Mastery at T: ${p1.toFixed(4)}`);
    reportLines.push(`- Mastery at T+1min: ${p2.toFixed(4)}`);
    reportLines.push(`- Difference: ${diff.toFixed(6)}`);

    if (diff > 0.01) { // Allow small float drift
         checkInvariant(false, "State Stability Violation",
            "Mastery changed significantly without new events.",
            { diff }
        );
        reportLines.push(`- **VIOLATION DETECTED**: Unexplained mastery jump.`);
    } else {
        reportLines.push(`- Status: PASSED`);
    }
    reportLines.push("");

    // Write Report
    reportLines.push("## Summary of Violations");
    if (violations.length === 0) {
        reportLines.push("No invariant violations detected.");
    } else {
        violations.forEach(v => {
            reportLines.push(`- **${v.type}**: ${v.description}`);
            reportLines.push(`  - Details: ${JSON.stringify(v.details)}`);
        });
    }

    fs.writeFileSync('TEMPORAL_CONSISTENCY_AUDIT.md', reportLines.join('\n'));
    console.log("Audit Complete. Report saved to TEMPORAL_CONSISTENCY_AUDIT.md");
}

runAudit().catch(err => console.error(err));
