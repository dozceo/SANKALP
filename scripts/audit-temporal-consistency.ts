import fs from 'fs';
import path from 'path';
import { makeRevisionDecision } from '../src/ai/adk/decision-engine';
import { MLSignals, DecisionContext, DecisionAction, ContentStrategy } from '../src/ai/adk/types';

// --- Types ---

type TopicName = string;

interface TopicState {
    mastery: number; // 0.0 to 1.0
    attempts: number;
    lastQuizDate: Date | null;
    lastRevisionDate: Date | null;
    consecutiveFailures: number;
}

interface StudentState {
    studentId: string;
    topics: Record<TopicName, TopicState>;
    lastActive: Date;
    // For tracking invariants
    history: Event[];
}

enum EventType {
    QUIZ_ATTEMPT = 'QUIZ_ATTEMPT',
    REVISION_SESSION = 'REVISION_SESSION',
    SYSTEM_CHECK = 'SYSTEM_CHECK', // Represents a periodic check (e.g. daily cron) where ADK runs
    MANUAL_OVERRIDE = 'MANUAL_OVERRIDE', // Simulates a manual intervention or data patch
}

interface Event {
    id: string;
    type: EventType;
    timestamp: Date;
    topic: TopicName;
    payload: any; // e.g. quiz score, revision duration
}

interface Violation {
    rule: string;
    description: string;
    timestamp: Date;
    studentId: string;
    topic?: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

// --- Constants ---
const TOPICS = ['Math', 'Science', 'History', 'Geography'];
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// --- Helper Functions ---

function randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * ONE_DAY_MS);
}

// --- State Machine ---

function getInitialState(studentId: string): StudentState {
    return {
        studentId,
        topics: {},
        lastActive: new Date(0), // Epoch
        history: [],
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

function applyEvent(state: StudentState, event: Event): StudentState {
    // structuredClone is available in Node 17+ and preserves Date objects
    const newState = structuredClone(state);
    newState.lastActive = new Date(Math.max(newState.lastActive.getTime(), event.timestamp.getTime()));
    newState.history.push(event);

    const topicState = getTopicState(newState, event.topic);

    switch (event.type) {
        case EventType.QUIZ_ATTEMPT:
            topicState.attempts++;
            topicState.lastQuizDate = event.timestamp;

            const score = event.payload.score; // 0.0 to 1.0
            // Simple mastery update logic (similar to generate_data.py)
            // Mastery moves towards score with some inertia
            topicState.mastery = topicState.mastery * 0.7 + score * 0.3;

            if (score < 0.6) {
                topicState.consecutiveFailures++;
            } else {
                topicState.consecutiveFailures = 0;
            }
            break;

        case EventType.REVISION_SESSION:
            topicState.lastRevisionDate = event.timestamp;
            // Revision bumps mastery slightly
            topicState.mastery = Math.min(1.0, topicState.mastery + 0.1);
            break;

        case EventType.SYSTEM_CHECK:
            // Simulate Forgetting Curve
            // In generate_data.py: if days_since_last_revision > 14: mastery_prob -= 0.2
            // Here we apply continuous decay if inactive
            const lastInteraction = topicState.lastRevisionDate || topicState.lastQuizDate || event.timestamp;
            const daysSince = (event.timestamp.getTime() - lastInteraction.getTime()) / ONE_DAY_MS;

            if (daysSince > 14) {
                 topicState.mastery = Math.max(0, topicState.mastery - 0.05); // Gradual decay
            }
            break;

        case EventType.MANUAL_OVERRIDE:
             if (event.payload.mastery !== undefined) {
                 topicState.mastery = event.payload.mastery;
             }
             break;
    }

    return newState;
}

// --- Data Generator ---

function generateValidHistory(studentId: string, days: number = 30): Event[] {
    const events: Event[] = [];
    let currentDate = new Date('2023-01-01');
    const learnedTopics = new Set<string>();

    // Initial learning phase
    for (let i = 0; i < days; i++) {
        currentDate = addDays(currentDate, 1);

        // Randomly pick a topic to work on
        const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

        // 70% chance of doing a quiz
        if (Math.random() < 0.7) {
            events.push({
                id: `evt_${studentId}_${i}_quiz`,
                type: EventType.QUIZ_ATTEMPT,
                timestamp: new Date(currentDate.getTime() + Math.random() * 3600000), // Add some time within the day
                topic: topic,
                payload: { score: Math.random() > 0.3 ? 0.8 : 0.4 } // Mostly passing
            });
            learnedTopics.add(topic);
        }

        // 30% chance of revision - ONLY IF LEARNED
        if (Math.random() < 0.3 && learnedTopics.has(topic)) {
             events.push({
                id: `evt_${studentId}_${i}_rev`,
                type: EventType.REVISION_SESSION,
                timestamp: new Date(currentDate.getTime() + Math.random() * 3600000 + 4000000), // Later in the day
                topic: topic,
                payload: { duration: 15 }
            });
        }

        // Daily system check
        events.push({
            id: `evt_${studentId}_${i}_check`,
            type: EventType.SYSTEM_CHECK,
            timestamp: new Date(currentDate.getTime() + 23 * 3600000), // End of day
            topic: topic, // Check runs for all, but event needs a topic field for simplicity in this model
            payload: {}
        });
    }

    return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

function injectCorruptions(events: Event[]): Event[] {
    const corrupted = [...events];

    // 1. Time Travel: Swap timestamps of two events far apart
    if (corrupted.length > 10) {
        const idx1 = 5;
        const idx2 = corrupted.length - 2;
        const temp = corrupted[idx1].timestamp;
        corrupted[idx1].timestamp = corrupted[idx2].timestamp; // Event 5 happens in future
        // We leave Event N-2 with original timestamp? No, swap them to create paradox
        corrupted[idx2].timestamp = temp; // Event N-2 happens in past

        // Mark them so we know where to look
        corrupted[idx1].payload._corruption = 'Time Travel (Future)';
        corrupted[idx2].payload._corruption = 'Time Travel (Past)';
    }

    // 2. Causality Violation: Revision before first quiz
    // Find a topic's first quiz and insert a revision before it
    const topic = TOPICS[0];
    const firstQuizIdx = corrupted.findIndex(e => e.topic === topic && e.type === EventType.QUIZ_ATTEMPT);
    if (firstQuizIdx > 0) {
        const firstQuiz = corrupted[firstQuizIdx];
        const badEvent: Event = {
            id: 'evt_corruption_causality',
            type: EventType.REVISION_SESSION,
            timestamp: new Date(firstQuiz.timestamp.getTime() - ONE_DAY_MS), // 1 day before
            topic: topic,
            payload: { duration: 30, _corruption: 'Causality Violation' }
        };
        corrupted.splice(firstQuizIdx, 0, badEvent);
    }

    // 3. Mastery Teleportation
    // Insert a Manual Override that jumps mastery
    const midPoint = Math.floor(corrupted.length / 2);
    corrupted.splice(midPoint, 0, {
        id: 'evt_corruption_teleport',
        type: EventType.MANUAL_OVERRIDE,
        timestamp: new Date(corrupted[midPoint].timestamp.getTime() + 1000),
        topic: TOPICS[1],
        payload: { mastery: 0.95, _corruption: 'Mastery Teleportation' }
    });

    return corrupted; // Note: Not re-sorting to preserve time travel bug
}

// --- Auditor ---

function auditStudentHistory(studentId: string, events: Event[]): Violation[] {
    const violations: Violation[] = [];
    let currentState = getInitialState(studentId);

    // Track previous state for "teleportation" check
    let previousMastery: Record<string, number> = {};

    for (let i = 0; i < events.length; i++) {
        const event = events[i];
        const topic = event.topic;

        // 1. Temporal Ordering Check
        if (i > 0 && event.timestamp < events[i-1].timestamp) {
            violations.push({
                rule: 'Temporal Ordering',
                description: `Event ${event.id} timestamp (${event.timestamp.toISOString()}) is earlier than previous event ${events[i-1].id} (${events[i-1].timestamp.toISOString()})`,
                timestamp: event.timestamp,
                studentId,
                topic,
                severity: 'HIGH'
            });
        }

        const topicStateBefore = currentState.topics[topic] || { mastery: 0, attempts: 0 };

        // 2. Causality Check
        if (event.type === EventType.REVISION_SESSION) {
            if (topicStateBefore.attempts === 0 && topicStateBefore.mastery === 0) {
                 violations.push({
                    rule: 'Causality Violation',
                    description: `Revision session for topic '${topic}' occurred before any learning activity (attempts=0, mastery=0).`,
                    timestamp: event.timestamp,
                    studentId,
                    topic,
                    severity: 'MEDIUM'
                });
            }
        }

        // Apply Event
        currentState = applyEvent(currentState, event);
        const topicStateAfter = currentState.topics[topic];

        // 3. Monotonicity Check (Attempts)
        if (topicStateAfter.attempts < topicStateBefore.attempts) {
             violations.push({
                rule: 'Monotonicity Violation',
                description: `Quiz attempts count decreased from ${topicStateBefore.attempts} to ${topicStateAfter.attempts}.`,
                timestamp: event.timestamp,
                studentId,
                topic,
                severity: 'HIGH'
            });
        }

        // 4. Mastery Teleportation Check
        // If mastery changed by > 0.3 without a quiz or huge revision, flag it
        const masteryDiff = Math.abs(topicStateAfter.mastery - (topicStateBefore.mastery || 0));
        if (masteryDiff > 0.4 && event.type !== EventType.QUIZ_ATTEMPT && event.type !== EventType.REVISION_SESSION) {
             violations.push({
                rule: 'Mastery Teleportation',
                description: `Mastery changed by ${masteryDiff.toFixed(2)} without valid learning event (Event Type: ${event.type}).`,
                timestamp: event.timestamp,
                studentId,
                topic,
                severity: 'HIGH'
            });
        }

        // 5. ADK Logic Validation (Run on SYSTEM_CHECK)
        if (event.type === EventType.SYSTEM_CHECK) {
            // Reconstruct signals
            const signals: MLSignals = {
                mastery_probability: topicStateAfter.mastery,
                confidence: 0.8,
                days_since_last_revision: topicStateAfter.lastRevisionDate
                    ? (event.timestamp.getTime() - topicStateAfter.lastRevisionDate.getTime()) / ONE_DAY_MS
                    : 999,
                attempts_count: topicStateAfter.attempts,
                attention_risk: topicStateAfter.consecutiveFailures > 2 ? 'HIGH' : 'LOW',
            };

            const context: DecisionContext = {
                studentId,
                topic,
                currentDate: event.timestamp,
                daysUntilExam: 30, // Default far away
                mlSignals: signals
            };

            // If we are close to exam (simulate based on date), check Cramming Logic
            // For now, let's just check the Forgetting Rule (Policy 3)
            // Policy 3: Moderate Mastery (0.4-0.6) + Stale (>7 days) -> SCHEDULED_REVISION

            if (signals.mastery_probability >= 0.4 && signals.mastery_probability < 0.6 && signals.days_since_last_revision > 7) {
                 const decision = makeRevisionDecision(context);
                 if (decision.action !== DecisionAction.SCHEDULED_REVISION) {
                      violations.push({
                        rule: 'ADK Logic Drift',
                        description: `ADK failed to recommend SCHEDULED_REVISION for stale moderate mastery. Recommended: ${decision.action}`,
                        timestamp: event.timestamp,
                        studentId,
                        topic,
                        severity: 'LOW' // It might be valid due to other rules, but worth noting in audit
                    });
                 }
            }
        }
    }

    return violations;
}


// --- Main Execution ---

async function runAudit() {
    console.log("Starting Temporal Consistency Audit...");

    // 1. Generate Clean Data
    console.log("Generating clean student history...");
    const cleanHistory = generateValidHistory('student_clean', 45);

    // 2. Generate Corrupted Data
    console.log("Generating corrupted student history...");
    const corruptedHistory = injectCorruptions(generateValidHistory('student_corrupted', 45));

    // 3. Run Audit
    const cleanViolations = auditStudentHistory('student_clean', cleanHistory);
    const corruptedViolations = auditStudentHistory('student_corrupted', corruptedHistory);

    console.log(`Clean History Violations: ${cleanViolations.length}`);
    console.log(`Corrupted History Violations: ${corruptedViolations.length}`);

    // 4. Generate Report
    const reportContent = `
# Temporal Consistency Audit Report

**Date:** ${new Date().toISOString()}

## Executive Summary
This audit enforces invariants on the student state machine across session boundaries. It simulates historical replay to detect anomalies such as time travel, causality violations, and mastery teleportation.

## Dataset Overview
- **Clean Dataset**: ${cleanHistory.length} events (Expect 0 violations)
- **Corrupted Dataset**: ${corruptedHistory.length} events (Injected faults)

## Violation Log

### Clean Dataset
${cleanViolations.length === 0 ? "✅ No violations found." : cleanViolations.map(v => `- [${v.severity}] ${v.rule}: ${v.description}`).join('\n')}

### Corrupted Dataset
${corruptedViolations.length === 0 ? "✅ No violations found." : corruptedViolations.map(v => `- [${v.severity}] **${v.rule}**: ${v.description} (Topic: ${v.topic})`).join('\n')}

## Detailed Analysis of Violations

${corruptedViolations.map(v => `
### ${v.rule}
- **Severity**: ${v.severity}
- **Timestamp**: ${v.timestamp.toISOString()}
- **Description**: ${v.description}
- **Root Cause Analysis**: ${v.rule === 'Temporal Ordering' ? 'Event timestamps are out of sequence. Likely caused by client-side clock drift or unsorted log ingestion.' : ''}${v.rule === 'Causality Violation' ? 'Revision occurred before learning. Likely caused by race condition in event logging or manual DB edits.' : ''}${v.rule === 'Mastery Teleportation' ? 'Sudden mastery shift without learning event. Likely caused by "Manual Override" or unstable ML prediction update.' : ''}
`).join('\n')}

## Recommendations
1. **Strict Ordering**: Enforce server-side timestamping for all critical learning events.
2. **Causality Guards**: Reject 'Revision' events for topics with 0 mastery/attempts at API level.
3. **Anomaly Detection**: Run this temporal audit as a nightly batch job on production data.
`;

    fs.writeFileSync('TEMPORAL_CONSISTENCY_AUDIT.md', reportContent);
    console.log("Audit Report generated: TEMPORAL_CONSISTENCY_AUDIT.md");
}

runAudit().catch(console.error);
