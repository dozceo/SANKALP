import type { StudentNode } from '@/data/docsData';
import type { StudentIntelligence, MasterySignal } from '@/types/intelligence';

/**
 * Generates StudentIntelligence from student markdown data
 * This bridges the gap between student profiles and the intelligence format
 */
export function generateStudentIntelligence(student: StudentNode): StudentIntelligence {
    const mastery: Record<string, MasterySignal> = {};

    // Convert mastery scores to intelligence signals
    if (student.masteryScores) {
        Object.entries(student.masteryScores).forEach(([topic, score]) => {
            // Simulate days since revision (random for demo, should come from quiz history)
            const daysSinceRevision = Math.floor(Math.random() * 14);
            const attempts = Math.floor(Math.random() * 10) + 1;

            // Determine trend based on score
            let trend: 'IMPROVING' | 'STABLE' | 'DECLINING' = 'STABLE';
            if (score > 0.75) trend = 'IMPROVING';
            else if (score < 0.5) trend = 'DECLINING';

            // Determine priority based on score and days since revision
            let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
            if (score < 0.5 || daysSinceRevision > 10) {
                priority = 'HIGH';
            } else if (score < 0.7 || daysSinceRevision > 5) {
                priority = 'MEDIUM';
            }

            mastery[topic] = {
                score: score,
                confidence: score > 0.7 ? 0.8 : 0.6,
                daysSinceRevision: daysSinceRevision,
                attempts: attempts,
                trend: trend,
                priority: priority,
                needsRevision: score < 0.7 || daysSinceRevision > 7,
            };
        });
    }

    // Calculate average mastery and priority counts in one pass
    let totalScore = 0;
    let highPriorityCount = 0;
    const masteryValues = Object.values(mastery);
    const count = masteryValues.length;

    if (count > 0) {
        for (let i = 0; i < count; i++) {
            const m = masteryValues[i];
            totalScore += m.score;
            if (m.priority === 'HIGH') highPriorityCount++;
        }
    }

    const avgMastery = count > 0 ? totalScore / count : 0.5;

    // Determine revision urgency
    let revisionUrgency: 'URGENT' | 'SCHEDULED' | 'NONE' = 'NONE';

    if (avgMastery < 0.5 || highPriorityCount >= 2) {
        revisionUrgency = 'URGENT';
    } else if (avgMastery < 0.7 || highPriorityCount >= 1) {
        revisionUrgency = 'SCHEDULED';
    }

    // Determine attention risk
    let attentionRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (avgMastery < 0.4) attentionRisk = 'HIGH';
    else if (avgMastery < 0.6) attentionRisk = 'MEDIUM';

    // Determine ADK decision
    let adkDecision: StudentIntelligence['adkDecision'] = 'PROGRESS_MODE';
    if (revisionUrgency === 'URGENT') adkDecision = 'INTERVENTION_REQUIRED';
    else if (avgMastery < 0.6) adkDecision = 'SHORT_REVISION_MODE';

    return {
        studentId: student.id,
        mastery: mastery,
        revisionUrgency: revisionUrgency,
        attentionRisk: attentionRisk,
        adkDecision: adkDecision,
        confidence: avgMastery > 0.7 ? 'HIGH' : avgMastery > 0.5 ? 'MEDIUM' : 'LOW',
        generatedAt: new Date().toISOString(),
        reasoning: [
            `Average mastery: ${Math.round(avgMastery * 100)}%`,
            `${highPriorityCount} high-priority topics`,
            student.weaknesses && student.weaknesses.length > 0
                ? `Struggling with: ${student.weaknesses.slice(0, 2).join(', ')}`
                : 'No specific weaknesses identified'
        ],
        flags: []
    };
}

/**
 * Calculate student risk level for teacher dashboard
 */
export function calculateStudentRisk(student: StudentNode): {
    avgMastery: number;
    riskLevel: 'Low' | 'Medium' | 'High';
    topWeaknesses: string[];
} {
    const scores = student.masteryScores
        ? Object.values(student.masteryScores)
        : [];

    // Optimization: Calculate average in a simple loop to avoid reduce() callback overhead
    let totalScore = 0;
    for (let i = 0; i < scores.length; i++) {
        totalScore += scores[i];
    }

    const avgMastery = scores.length > 0
        ? totalScore / scores.length
        : 0.5;

    let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
    if (avgMastery < 0.5) {
        riskLevel = 'High';
    } else if (avgMastery < 0.7) {
        riskLevel = 'Medium';
    }

    return {
        avgMastery: Math.round(avgMastery * 100),
        riskLevel,
        topWeaknesses: student.weaknesses?.slice(0, 3) || [],
    };
}
