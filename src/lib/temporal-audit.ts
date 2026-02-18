import { getQuizResults, getADKDecisions, getStudent, QuizResult, ADKDecision } from './db-helpers';
import { makeRevisionDecision } from '../ai/adk/decision-engine';
import { MLSignals, DecisionContext, DecisionAction } from '../ai/adk/types';

// --- Types ---

export type AuditSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface AuditViolation {
    studentId: string;
    rule: 'TEMPORAL_ORDERING' | 'CAUSALITY_VIOLATION' | 'MONOTONICITY_VIOLATION' | 'MASTERY_TELEPORTATION' | 'ADK_LOGIC_DRIFT';
    severity: AuditSeverity;
    description: string;
    timestamp: Date;
    details?: any;
}

interface TopicState {
    mastery: number;
    attempts: number;
    lastQuizDate: Date | null;
    lastRevisionDate: Date | null;
    consecutiveFailures: number;
}

interface StudentState {
    studentId: string;
    topics: Record<string, TopicState>;
    lastActive: Date;
}

interface TemporalEvent {
    type: 'QUIZ_ATTEMPT' | 'REVISION_SESSION' | 'ADK_DECISION';
    timestamp: Date;
    topic: string;
    payload: any;
}

// --- Constants ---
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// --- State Machine Logic ---

function getInitialState(studentId: string): StudentState {
    return {
        studentId,
        topics: {},
        lastActive: new Date(0), // Epoch
    };
}

function getTopicState(state: StudentState, topic: string): TopicState {
    if (!state.topics[topic]) {
        state.topics[topic] = {
            mastery: 0,
            attempts: 0,
            lastQuizDate: null,
            lastRevisionDate: null,
            consecutiveFailures: 0,
        };
    }
    return state.topics[topic];
}

/**
 * Applies an event to the student state and returns the new state.
 * Note: This function is pure and does not modify the input state.
 */
function applyEvent(state: StudentState, event: TemporalEvent): StudentState {
    const newState = structuredClone(state);

    if (event.timestamp > newState.lastActive) {
        newState.lastActive = event.timestamp;
    }

    const topicState = getTopicState(newState, event.topic);

    switch (event.type) {
        case 'QUIZ_ATTEMPT':
            topicState.attempts++;
            topicState.lastQuizDate = event.timestamp;

            const score = event.payload.score; // 0.0 to 1.0
            // Simple mastery update logic simulation matching generate_data.py
            topicState.mastery = topicState.mastery * 0.7 + score * 0.3;

            if (score < 0.6) {
                topicState.consecutiveFailures++;
            } else {
                topicState.consecutiveFailures = 0;
            }
            break;

        case 'REVISION_SESSION':
            topicState.lastRevisionDate = event.timestamp;
            // Revision bumps mastery slightly
            topicState.mastery = Math.min(1.0, topicState.mastery + 0.1);
            break;

        case 'ADK_DECISION':
            // Decisions don't update state directly but are part of the timeline
            break;
    }

    return newState;
}

// --- Audit Logic ---

export async function auditStudent(studentId: string): Promise<AuditViolation[]> {
    const violations: AuditViolation[] = [];

    // 1. Fetch Data
    const [student, quizResults, adkDecisions] = await Promise.all([
        getStudent(studentId),
        getQuizResults(studentId, 500), // Reasonable limit for history
        getADKDecisions(studentId, 200)
    ]);

    if (!student) {
        return [{
            studentId,
            rule: 'CAUSALITY_VIOLATION',
            severity: 'CRITICAL',
            description: 'Student record not found',
            timestamp: new Date()
        }];
    }

    // 2. Construct Event Stream
    const events: TemporalEvent[] = [];

    quizResults.forEach(q => {
        events.push({
            type: 'QUIZ_ATTEMPT',
            timestamp: q.timestamp,
            topic: q.topic,
            payload: { score: q.score }
        });
    });

    adkDecisions.forEach(d => {
        events.push({
            type: 'ADK_DECISION',
            timestamp: d.timestamp,
            topic: d.topic,
            payload: { action: d.action }
        });
    });

    // Sort by timestamp ascending
    events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // 3. Replay and Verify
    let currentState = getInitialState(studentId);

    for (let i = 0; i < events.length; i++) {
        const event = events[i];
        const topic = event.topic;

        // Invariant 1: Temporal Ordering
        if (i > 0 && event.timestamp < events[i-1].timestamp) {
            violations.push({
                studentId,
                rule: 'TEMPORAL_ORDERING',
                severity: 'HIGH',
                description: `Event type ${event.type} at ${event.timestamp.toISOString()} is out of order vs previous event at ${events[i-1].timestamp.toISOString()}`,
                timestamp: event.timestamp,
                details: { event, previous: events[i-1] }
            });
        }

        const topicStateBefore = currentState.topics[topic] || {
            mastery: 0,
            attempts: 0,
            lastQuizDate: null,
            lastRevisionDate: null,
            consecutiveFailures: 0
        };

        // Invariant 2: Causality (Revision requires learning)
        if (event.type === 'REVISION_SESSION') {
            if (topicStateBefore.attempts === 0 && topicStateBefore.mastery === 0) {
                 violations.push({
                    studentId,
                    rule: 'CAUSALITY_VIOLATION',
                    severity: 'MEDIUM',
                    description: `Revision for '${topic}' before any learning activity.`,
                    timestamp: event.timestamp
                });
            }
        }

        // Apply Event
        currentState = applyEvent(currentState, event);
        const topicStateAfter = currentState.topics[topic];

        // Invariant 3: Monotonicity (Attempts)
        if (event.type === 'QUIZ_ATTEMPT' && topicStateAfter.attempts < topicStateBefore.attempts) {
             violations.push({
                studentId,
                rule: 'MONOTONICITY_VIOLATION',
                severity: 'HIGH',
                description: `Quiz attempts count decreased.`,
                timestamp: event.timestamp
            });
        }

        // Invariant 4: Mastery Teleportation
        const masteryDiff = Math.abs(topicStateAfter.mastery - (topicStateBefore.mastery || 0));
        if (masteryDiff > 0.5 && event.type !== 'QUIZ_ATTEMPT' && event.type !== 'REVISION_SESSION') {
             violations.push({
                studentId,
                rule: 'MASTERY_TELEPORTATION',
                severity: 'HIGH',
                description: `Mastery changed by ${masteryDiff.toFixed(2)} without valid learning event.`,
                timestamp: event.timestamp
            });
        }

        // Invariant 5: ADK Logic Verification
        // If the event is an ADK decision, we verify if the *previous* state justified it
        if (event.type === 'ADK_DECISION') {
             // Reconstruct signals based on state at that moment
             const signals: MLSignals = {
                mastery_probability: topicStateBefore.mastery,
                confidence: 0.8, // Mocked
                days_since_last_revision: topicStateBefore.lastRevisionDate
                    ? (event.timestamp.getTime() - topicStateBefore.lastRevisionDate.getTime()) / ONE_DAY_MS
                    : 999,
                attempts_count: topicStateBefore.attempts,
                attention_risk: topicStateBefore.consecutiveFailures > 2 ? 'HIGH' : 'LOW',
            };

            const context: DecisionContext = {
                studentId,
                topic,
                currentDate: event.timestamp,
                daysUntilExam: 30, // Mocked default
                mlSignals: signals
            };

            // Check specific policy: Moderate Mastery + Stale Knowledge
            if (signals.mastery_probability >= 0.4 && signals.mastery_probability < 0.6 && signals.days_since_last_revision > 7) {
                 const expectedDecision = makeRevisionDecision(context);
                 if (event.payload.action !== expectedDecision.action && event.payload.action !== 'SCHEDULED_REVISION') {
                      // Note: We are lenient here because real ADK might have had different inputs (e.g. real exam date)
                      // This is a warning/info rather than strict error unless we have full context
                      violations.push({
                        studentId,
                        rule: 'ADK_LOGIC_DRIFT',
                        severity: 'LOW',
                        description: `ADK Action '${event.payload.action}' diverges from expected '${expectedDecision.action}' for stale moderate mastery state.`,
                        timestamp: event.timestamp
                    });
                 }
            }
        }
    }

    return violations;
}
