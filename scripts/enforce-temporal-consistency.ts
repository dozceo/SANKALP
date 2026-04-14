
import fs from 'fs';
import path from 'path';

// ==========================================
// Types
// ==========================================

export type Topic = string;

export interface LearningEvent {
    type: 'QUIZ' | 'REVISION' | 'SYSTEM_CHECK';
    studentId: string;
    topic: Topic;
    timestamp: Date;
    data: {
        score?: number; // 0.0 to 1.0
        masteryAfter?: number;
        attempts?: number;
        [key: string]: any;
    };
}

export interface StudentState {
    studentId: string;
    topics: Map<Topic, TopicState>;
    globalLastActive: Date;
    eventsProcessed: number;
}

export interface TopicState {
    mastery: number;
    lastQuizDate: Date | null;
    attempts: number;
    revisionCount: number;
    status: 'NEW' | 'LEARNING' | 'MASTERED' | 'FORGOTTEN';
}

export interface InvariantViolation {
    rule: string;
    studentId: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    message: string;
    timestamp: Date;
    details?: any;
}

// ==========================================
// State Machine & Validator
// ==========================================

export class TemporalConsistencyEnforcer {
    private violations: InvariantViolation[] = [];
    private state: StudentState;

    constructor(studentId: string) {
        this.state = {
            studentId,
            topics: new Map(),
            globalLastActive: new Date(0), // Epoch
            eventsProcessed: 0,
        };
    }

    public processEvent(event: LearningEvent) {
        // 1. Global Temporal Ordering Check
        if (event.timestamp < this.state.globalLastActive) {
            this.reportViolation({
                rule: 'TEMPORAL_ORDER_VIOLATION',
                studentId: this.state.studentId,
                severity: 'CRITICAL',
                message: `Time Travel Detected: Event at ${event.timestamp.toISOString()} occurred after global last active ${this.state.globalLastActive.toISOString()}`,
                timestamp: event.timestamp,
                details: { eventType: event.type, topic: event.topic }
            });
            // We continue processing but this is a major red flag
        } else {
            this.state.globalLastActive = event.timestamp;
        }

        // Initialize topic state if needed
        if (!this.state.topics.has(event.topic)) {
            this.state.topics.set(event.topic, {
                mastery: 0,
                lastQuizDate: null,
                attempts: 0,
                revisionCount: 0,
                status: 'NEW'
            });
        }

        const topicState = this.state.topics.get(event.topic)!;

        // 2. Event Specific Logic
        switch (event.type) {
            case 'QUIZ':
                this.handleQuiz(event, topicState);
                break;
            case 'REVISION':
                this.handleRevision(event, topicState);
                break;
            case 'SYSTEM_CHECK':
                // Just a checkpoint, no state change other than timestamp
                break;
        }

        this.state.eventsProcessed++;
    }

    private handleQuiz(event: LearningEvent, topicState: TopicState) {
        // Invariant: Monotonicity of attempts (if provided)
        if (event.data.attempts !== undefined) {
            if (event.data.attempts < topicState.attempts) {
                this.reportViolation({
                    rule: 'MONOTONICITY_VIOLATION',
                    studentId: this.state.studentId,
                    severity: 'HIGH',
                    message: `Quiz attempt count decreased from ${topicState.attempts} to ${event.data.attempts}`,
                    timestamp: event.timestamp,
                    details: { topic: event.topic }
                });
            }
            topicState.attempts = event.data.attempts;
        } else {
            topicState.attempts++;
        }

        // Invariant: Mastery Teleportation Check
        // If mastery jumps significantly without a quiz explanation (e.g. if we had a periodic check, but here we are IN a quiz)
        // Actually, for a QUIZ, the score updates the mastery.
        // But if the event reports "masteryAfter", we should check if it makes sense relative to the score.
        // Simple heuristic: If score is low (e.g. 0.2) but mastery jumps to 0.9, that's weird.
        if (event.data.score !== undefined && event.data.masteryAfter !== undefined) {
            const currentMastery = topicState.mastery;
            const score = event.data.score;
            const newMastery = event.data.masteryAfter;

            if (score < 0.4 && newMastery > currentMastery + 0.3) {
                this.reportViolation({
                    rule: 'MASTERY_TELEPORTATION',
                    studentId: this.state.studentId,
                    severity: 'HIGH',
                    message: `Mastery spiked from ${currentMastery.toFixed(2)} to ${newMastery.toFixed(2)} despite low quiz score ${score}`,
                    timestamp: event.timestamp,
                    details: { topic: event.topic }
                });
            }
        }

        // Update State
        if (event.data.masteryAfter !== undefined) {
             topicState.mastery = event.data.masteryAfter;
        } else if (event.data.score !== undefined) {
             // Simple weighted moving average if no explicit mastery provided
             topicState.mastery = topicState.mastery * 0.7 + event.data.score * 0.3;
        }

        topicState.lastQuizDate = event.timestamp;
        topicState.status = topicState.mastery > 0.8 ? 'MASTERED' : 'LEARNING';
    }

    private handleRevision(event: LearningEvent, topicState: TopicState) {
        // Invariant: Causality (Can't revise what you haven't learned)
        if (topicState.status === 'NEW' && topicState.mastery === 0 && topicState.attempts === 0) {
            this.reportViolation({
                rule: 'CAUSALITY_VIOLATION',
                studentId: this.state.studentId,
                severity: 'MEDIUM',
                message: `Revision recommended/performed for Topic '${event.topic}' before any learning activity`,
                timestamp: event.timestamp,
                details: { topic: event.topic }
            });
        }

        topicState.revisionCount++;
    }

    private reportViolation(violation: InvariantViolation) {
        this.violations.push(violation);
    }

    public getViolations(): InvariantViolation[] {
        return this.violations;
    }
}

// ==========================================
// Mock Data Generator
// ==========================================

class MockHistoryGenerator {
    static generateValidStudent(id: string): LearningEvent[] {
        const events: LearningEvent[] = [];
        const baseTime = new Date('2024-01-01T10:00:00Z');

        // Day 1: Learn Algebra
        events.push({
            type: 'QUIZ',
            studentId: id,
            topic: 'Algebra',
            timestamp: new Date(baseTime.getTime()),
            data: { score: 0.6, masteryAfter: 0.6, attempts: 1 }
        });

        // Day 2: Revise Algebra
        events.push({
            type: 'REVISION',
            studentId: id,
            topic: 'Algebra',
            timestamp: new Date(baseTime.getTime() + 86400000),
            data: {}
        });

        // Day 2: Quiz Algebra again
        events.push({
            type: 'QUIZ',
            studentId: id,
            topic: 'Algebra',
            timestamp: new Date(baseTime.getTime() + 86400000 + 3600000),
            data: { score: 0.9, masteryAfter: 0.85, attempts: 2 }
        });

        return events;
    }

    static generateTimeTravelStudent(id: string): LearningEvent[] {
        const events = this.generateValidStudent(id);

        // Inject Time Travel: Event 3 happens BEFORE Event 2
        events.push({
            type: 'QUIZ',
            studentId: id,
            topic: 'Geometry',
            timestamp: new Date('2023-12-31T10:00:00Z'), // Way before start
            data: { score: 0.5, masteryAfter: 0.5, attempts: 1 }
        });

        return events;
    }

    static generateTeleportingStudent(id: string): LearningEvent[] {
        const events: LearningEvent[] = [];
        const baseTime = new Date('2024-01-01T10:00:00Z');

        events.push({
            type: 'QUIZ',
            studentId: id,
            topic: 'Physics',
            timestamp: baseTime,
            data: { score: 0.1, masteryAfter: 0.1, attempts: 1 }
        });

        // Next quiz fails but mastery jumps to 0.95
        events.push({
            type: 'QUIZ',
            studentId: id,
            topic: 'Physics',
            timestamp: new Date(baseTime.getTime() + 86400000),
            data: { score: 0.2, masteryAfter: 0.95, attempts: 2 } // Suspicious!
        });

        return events;
    }

    static generateCausalityBreaker(id: string): LearningEvent[] {
        const events: LearningEvent[] = [];
        const baseTime = new Date('2024-01-01T10:00:00Z');

        // Revision before ever seeing the topic
        events.push({
            type: 'REVISION',
            studentId: id,
            topic: 'Calculus',
            timestamp: baseTime,
            data: {}
        });

        return events;
    }
}

// ==========================================
// Static Data Parser
// ==========================================

class StaticDataParser {
    static parseMarkdown(filePath: string): LearningEvent[] {
        const content = fs.readFileSync(filePath, 'utf-8');
        const events: LearningEvent[] = [];

        // Extract ID
        const idMatch = content.match(/id:\s*([\w-]+)/);
        const studentId = idMatch ? idMatch[1] : 'unknown';

        // Parse Recent Quiz Results
        // Format: - Algebra Quiz #12: 17/20 (85%)
        const quizRegex = /-\s*([\w\s]+)\s+Quiz\s*#(\d+):\s*(\d+)\/(\d+)\s*\((\d+)%\)/g;
        let match;

        // We have to invent timestamps because Markdown doesn't have them for the list
        // We'll assume they happened recently in reverse order (list is usually newest first)
        let timeOffset = 0;
        const now = new Date();

        const foundQuizzes = [];
        while ((match = quizRegex.exec(content)) !== null) {
            foundQuizzes.push(match);
        }

        // Process in reverse to simulate chronological order if the list is desc
        // But typically "Recent" lists are Descending. So index 0 is newest.
        // We want to generate events oldest to newest.
        for (let i = foundQuizzes.length - 1; i >= 0; i--) {
            const m = foundQuizzes[i];
            const topic = m[1].trim();
            const attemptNum = parseInt(m[2]);
            const scoreVal = parseInt(m[3]);
            const scoreMax = parseInt(m[4]);
            const percent = parseInt(m[5]);

            const score = scoreVal / scoreMax;

            events.push({
                type: 'QUIZ',
                studentId,
                topic,
                timestamp: new Date(now.getTime() - (i + 1) * 86400000), // 1 day apart
                data: {
                    score,
                    masteryAfter: score, // simplistic assumption for static data
                    attempts: attemptNum
                }
            });
        }

        return events;
    }
}

// ==========================================
// Main Execution
// ==========================================

async function main() {
    console.log('Starting Temporal Consistency Audit...');
    const reportPath = 'TEMPORAL_CONSISTENCY_AUDIT.md';
    let reportContent = '# Temporal Consistency Audit Report\n\n';
    reportContent += `Generated at: ${new Date().toISOString()}\n\n`;

    const allViolations: InvariantViolation[] = [];

    // 1. Run Mock Scenarios
    const scenarios = [
        { name: 'Valid Student', events: MockHistoryGenerator.generateValidStudent('mock-valid') },
        { name: 'Time Traveler', events: MockHistoryGenerator.generateTimeTravelStudent('mock-time-traveler') },
        { name: 'Teleporter', events: MockHistoryGenerator.generateTeleportingStudent('mock-teleporter') },
        { name: 'Causality Breaker', events: MockHistoryGenerator.generateCausalityBreaker('mock-causality') }
    ];

    reportContent += '## Synthetic Data Stress Test\n\n';

    for (const scenario of scenarios) {
        const enforcer = new TemporalConsistencyEnforcer(scenario.events[0].studentId);
        // Sort events by timestamp? No, we want to test if the ENFORCER catches out-of-order input
        // IF the input source (Log) claims to be chronological.
        // But wait, logs might be chronological by ingestion, but the event timestamp inside might be wrong.
        // The enforcer checks `event.timestamp`.

        for (const event of scenario.events) {
            enforcer.processEvent(event);
        }

        const violations = enforcer.getViolations();
        allViolations.push(...violations);

        reportContent += `### Scenario: ${scenario.name}\n`;
        if (violations.length === 0) {
            reportContent += '- ✅ PASSED: No violations detected.\n';
        } else {
            reportContent += `- ❌ FAILED: ${violations.length} violations detected.\n`;
            for (const v of violations) {
                reportContent += `  - **[${v.severity}] ${v.rule}**: ${v.message} (Topic: ${v.details?.topic || 'N/A'})\n`;
            }
        }
        reportContent += '\n';
    }

    // 2. Run Static Data Audit
    reportContent += '## Static Student Data Audit\n\n';
    const studentsDir = path.join(process.cwd(), 'data/students');
    if (fs.existsSync(studentsDir)) {
        const files = fs.readdirSync(studentsDir).filter(f => f.endsWith('.md'));

        for (const file of files) {
            try {
                const events = StaticDataParser.parseMarkdown(path.join(studentsDir, file));
                if (events.length === 0) {
                    reportContent += `### File: ${file}\n- ⚠️ SKIPPED: No parseable quiz history found.\n\n`;
                    continue;
                }

                const enforcer = new TemporalConsistencyEnforcer(events[0].studentId);
                for (const event of events) {
                    enforcer.processEvent(event);
                }
                const violations = enforcer.getViolations();
                allViolations.push(...violations);

                reportContent += `### File: ${file}\n`;
                if (violations.length === 0) {
                    reportContent += '- ✅ PASSED: Consistent history derived from markdown.\n';
                } else {
                    reportContent += `- ❌ FAILED: ${violations.length} violations detected.\n`;
                    for (const v of violations) {
                        reportContent += `  - **[${v.severity}] ${v.rule}**: ${v.message}\n`;
                    }
                }
                reportContent += '\n';

            } catch (err) {
                reportContent += `### File: ${file}\n- ❌ ERROR: Failed to parse file. ${err}\n\n`;
            }
        }
    } else {
        reportContent += 'No data/students directory found.\n';
    }

    // 3. Summary
    reportContent += '## Violation Summary\n';
    const severityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    for (const v of allViolations) {
        severityCounts[v.severity]++;
    }

    reportContent += '| Severity | Count |\n|---|---|\n';
    for (const [sev, count] of Object.entries(severityCounts)) {
        reportContent += `| ${sev} | ${count} |\n`;
    }

    fs.writeFileSync(reportPath, reportContent);
    console.log(`Audit complete. Report written to ${reportPath}`);
}

main().catch(console.error);
