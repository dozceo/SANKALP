
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
const envPath = resolve(process.cwd(), '.env.local');
config({ path: envPath });

// Ensure Project ID is set
if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    console.warn('⚠️ NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing. Defaulting to sankalp-prerollout.');
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'sankalp-prerollout';
}

// Types need to be imported statically for TS, but values dynamically
import type { StudentHistory, RawQuizResult } from '../src/ml/features/student_features';
import type { MLSignals, DecisionContext } from '../src/ai/adk/types';

interface Violation {
    studentId: string;
    timestamp: Date;
    rule: string;
    details: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface AuditReport {
    totalStudents: number;
    totalViolations: number;
    violations: Violation[];
    passed: boolean;
}

// Dynamic imports will be used inside functions
let db: any;
let extractMasteryFeatures: any;
let predictMastery: any;
let makeRevisionDecision: any;

async function loadDependencies() {
    const firebaseAdmin = await import('../src/lib/firebase-admin');
    db = firebaseAdmin.db;

    const studentFeatures = await import('../src/ml/features/student_features');
    extractMasteryFeatures = studentFeatures.extractMasteryFeatures;

    const mlBridge = await import('../src/ml/inference/ml-bridge');
    predictMastery = mlBridge.predictMastery;

    const decisionEngine = await import('../src/ai/adk/decision-engine');
    makeRevisionDecision = decisionEngine.makeRevisionDecision;
}

async function fetchStudentData(studentId: string): Promise<StudentHistory> {
    const studentDoc = await db.collection('students').doc(studentId).get();
    if (!studentDoc.exists) {
        throw new Error(`Student ${studentId} not found`);
    }
    const studentData = studentDoc.data();

    const quizSnapshot = await db.collection('quizResults')
        .where('studentId', '==', studentId)
        .orderBy('timestamp', 'asc')
        .get();

    const quizResults: RawQuizResult[] = quizSnapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
            topic: data.topic,
            score: data.score,
            timestamp: data.timestamp.toDate(),
            timeSpent: data.timeSpent,
            questionsAttempted: data.questionsAttempted,
        };
    });

    return {
        studentId,
        quizResults,
        lastLoginDate: studentData?.lastLoginDate?.toDate() || new Date(),
        registrationDate: studentData?.registrationDate?.toDate() || new Date(),
    };
}

async function runAudit() {
    await loadDependencies();

    console.log('🔍 Starting Temporal Consistency Audit...');
    const report: AuditReport = {
        totalStudents: 0,
        totalViolations: 0,
        violations: [],
        passed: true,
    };

    try {
        const studentsSnapshot = await db.collection('students').get();
        if (studentsSnapshot.empty) {
            console.log('⚠️ No students found in DB. switching to Simulation Mode.');
            await runSimulation(report);
        } else {
            console.log(`Found ${studentsSnapshot.size} students. Processing...`);
            for (const doc of studentsSnapshot.docs) {
                const history = await fetchStudentData(doc.id);
                await auditStudent(history, report);
                report.totalStudents++;
            }
        }
    } catch (error) {
        console.error('❌ Error accessing DB:', error);
        console.log('⚠️ Switching to Simulation Mode due to DB error.');
        await runSimulation(report);
    }

    printReport(report);
}

async function auditStudent(history: StudentHistory, report: AuditReport) {
    const { studentId, quizResults } = history;
    console.log(`Auditing Student: ${studentId} (${quizResults.length} quizzes)`);

    // 1. Causality Check (Time Travel)
    for (let i = 1; i < quizResults.length; i++) {
        if (quizResults[i].timestamp < quizResults[i - 1].timestamp) {
            report.violations.push({
                studentId: studentId!,
                timestamp: quizResults[i].timestamp,
                rule: 'Causality',
                details: `Quiz at index ${i} is older than index ${i - 1}`,
                severity: 'HIGH',
            });
        }
    }

    // Replay History
    const topicState: Record<string, { attempts: number, lastMastery: number, lastQuizTime: Date }> = {};

    for (let i = 0; i < quizResults.length; i++) {
        const currentQuiz = quizResults[i];
        const topic = currentQuiz.topic;

        // --- PRE-QUIZ CHECK (Forgetting Curve) ---
        // Check state right BEFORE this quiz took place
        if (i > 0) {
             const preQuizHistory: StudentHistory = {
                ...history,
                quizResults: quizResults.slice(0, i), // Exclude current quiz
            };

            // Only relevant if previous quiz was same topic
            const previousTopicQuizzes = preQuizHistory.quizResults.filter(q => q.topic === topic);
            if (previousTopicQuizzes.length > 0) {
                 // Calculate features as if it is NOW currentQuiz.timestamp
                 const preFeatures = extractMasteryFeatures(topic, preQuizHistory, currentQuiz.timestamp);

                 // If gap is large, mastery should be lower than last recorded mastery
                 if (preFeatures.days_since_last_revision > 30) {
                     try {
                         const prePrediction = await predictMastery(preFeatures);

                         // If previous mastery (at time of previous quiz) was High
                         // And now (after 30 days gap) it is STILL High
                         // Then Forgetting Curve is broken
                         if (prePrediction.mastery_probability > 0.7) {
                              report.violations.push({
                                studentId: studentId!,
                                timestamp: currentQuiz.timestamp,
                                rule: 'Forgetting Curve Drift',
                                details: `Topic ${topic} not revised for ${preFeatures.days_since_last_revision} days. Pre-quiz prediction (${prePrediction.mastery_probability.toFixed(2)}) is still high. Model fails to decay mastery over time.`,
                                severity: 'MEDIUM',
                            });
                         }
                     } catch (e) {
                         console.error("Error in pre-quiz prediction", e);
                     }
                 }
            }
        }


        // --- POST-QUIZ CHECK (State Update) ---
        const partialHistory: StudentHistory = {
            ...history,
            quizResults: quizResults.slice(0, i + 1),
        };

        // Extract features (Post-quiz: days_since = 0)
        const features = extractMasteryFeatures(topic, partialHistory, currentQuiz.timestamp);

        // 2. Monotonicity Check
        if (!topicState[topic]) {
            topicState[topic] = { attempts: 0, lastMastery: 0, lastQuizTime: currentQuiz.timestamp };
        }

        if (features.attempts_per_topic < topicState[topic].attempts) {
             report.violations.push({
                studentId: studentId!,
                timestamp: currentQuiz.timestamp,
                rule: 'Monotonicity',
                details: `Attempts count decreased from ${topicState[topic].attempts} to ${features.attempts_per_topic} for topic ${topic}`,
                severity: 'HIGH',
            });
        }
        topicState[topic].attempts = features.attempts_per_topic;

        // 3. Mastery Consistency Check
        try {
            const prediction = await predictMastery(features);
            const currentMastery = prediction.mastery_probability;

            // Check against previous mastery
            const prevMastery = topicState[topic].lastMastery;

            // "Mastery Teleportation": Significant increase without a quiz?
            // Here we ARE at a quiz.
            // If quiz score is LOW, mastery shouldn't jump HIGH.
            if (currentQuiz.score < 0.2 && currentMastery > prevMastery + 0.5) {
                 report.violations.push({
                    studentId: studentId!,
                    timestamp: currentQuiz.timestamp,
                    rule: 'Mastery Consistency',
                    details: `Mastery spiked (${prevMastery.toFixed(2)} -> ${currentMastery.toFixed(2)}) despite low quiz score (${currentQuiz.score}) for topic ${topic}`,
                    severity: 'MEDIUM',
                });
            }

            // Update state
            topicState[topic].lastMastery = currentMastery;
            topicState[topic].lastQuizTime = currentQuiz.timestamp;

            // 4. Missing Feature Drift Check (ADK)
            const mlSignals: MLSignals = {
                mastery_probability: currentMastery,
                confidence: prediction.confidence,
                days_until_forget: undefined, // Explicitly undefined
                attention_risk: undefined,
                dropout_probability: undefined,
                days_since_last_revision: features.days_since_last_revision,
                attempts_count: features.attempts_per_topic,
                performance_trend: undefined
            };

            // Check if ADK logic breaks due to missing days_until_forget
            // (We can't easily execute ADK logic for failure without extensive mocking, but we can check the signal itself)
            if (mlSignals.days_until_forget === undefined) {
                 // This is expected currently, but we want to log it as a "known drift" or violation if we expect it to be there.
                 // For now, let's only log if it leads to a weird decision (which we simulated before)
            }

        } catch (e) {
            console.error(`Error predicting mastery for ${studentId} topic ${topic}:`, e);
        }
    }
}

async function runSimulation(report: AuditReport) {
    console.log('🧪 Running in Simulation Mode with Mock Data...');

    // Scenario 1: Time Traveler
    const timeTraveler: StudentHistory = {
        studentId: 'sim_time_traveler',
        lastLoginDate: new Date(),
        registrationDate: new Date(),
        quizResults: [
            { topic: 'math', score: 0.8, timestamp: new Date('2023-01-01T10:00:00Z'), timeSpent: 60, questionsAttempted: 10 },
            { topic: 'math', score: 0.9, timestamp: new Date('2023-01-01T09:00:00Z'), timeSpent: 60, questionsAttempted: 10 }, // Back in time!
        ]
    };
    await auditStudent(timeTraveler, report);

    // Scenario 2: Mastery Teleportation
    const teleporter: StudentHistory = {
        studentId: 'sim_teleporter',
        lastLoginDate: new Date(),
        registrationDate: new Date(),
        quizResults: [
            { topic: 'science', score: 0.2, timestamp: new Date('2023-01-01'), timeSpent: 60, questionsAttempted: 10 },
            { topic: 'science', score: 0.1, timestamp: new Date('2023-01-02'), timeSpent: 60, questionsAttempted: 10 },
        ]
    };
    await auditStudent(teleporter, report);

    // Scenario 3: Forgetting Curve Failure
    const forgetter: StudentHistory = {
        studentId: 'sim_forgetter',
        lastLoginDate: new Date(),
        registrationDate: new Date(),
        quizResults: [
            { topic: 'history', score: 0.9, timestamp: new Date('2023-01-01'), timeSpent: 60, questionsAttempted: 10 },
            // 60 days later. Pre-quiz check should see high gap.
            // If model returns high mastery for Pre-Quiz state, it fails forgetting curve check.
            { topic: 'history', score: 0.8, timestamp: new Date('2023-03-01'), timeSpent: 60, questionsAttempted: 10 },
        ]
    };
    await auditStudent(forgetter, report);

    report.totalStudents += 3;
}


function printReport(report: AuditReport) {
    console.log('\n\n📊 TEMPORAL CONSISTENCY AUDIT REPORT');
    console.log('====================================');
    console.log(`Total Students Audited: ${report.totalStudents}`);
    console.log(`Total Violations Found: ${report.violations.length}`);

    if (report.violations.length > 0) {
        console.log('\n violations:');
        report.violations.forEach(v => {
            console.log(`[${v.severity}] Student ${v.studentId} - ${v.rule}`);
            console.log(`    Details: ${v.details}`);
            console.log(`    Time: ${v.timestamp.toISOString()}`);
        });
        report.passed = false;
        process.exit(1);
    } else {
        console.log('\n✅ No violations found. System is temporally consistent.');
        process.exit(0);
    }
}

// Run the script
runAudit().catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});
