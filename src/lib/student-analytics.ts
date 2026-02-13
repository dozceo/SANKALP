import { getStudent, getQuizResults } from './db-helpers';
import { calculateTrendFromScores } from '@/lib/trend-utils';

export async function getStudentAnalytics(studentId: string) {
    // Get student details and quiz results in parallel
    const [student, quizResults] = await Promise.all([
        getStudent(studentId),
        getQuizResults(studentId, 50, {
            select: ['topic', 'score', 'timestamp', 'questionsCount']
        })
    ]);

    if (!student) {
        return null;
    }

    // Calculate metrics and topic stats in a single pass
    let totalScoreSum = 0;
    const topicStats: Record<string, { sum: number; count: number; scores: number[] }> = {};

    for (const r of quizResults) {
        totalScoreSum += r.score;

        if (!topicStats[r.topic]) {
            topicStats[r.topic] = { sum: 0, count: 0, scores: [] };
        }
        const stats = topicStats[r.topic];
        stats.sum += r.score;
        stats.count += 1;
        stats.scores.push(r.score);
    }

    const avgScore = quizResults.length > 0 ? totalScoreSum / quizResults.length : 0;

    // Calculate mastery and trends per topic
    const topicMastery: Record<string, { avg: number; count: number; trend: 'up' | 'down' | 'stable' }> = {};
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    for (const topic in topicStats) {
        const stats = topicStats[topic];
        const avg = stats.sum / stats.count;
        const scores = stats.scores;

        // Calculate trend using optimized utility
        // Using 0.05 threshold to match previous sensitivity
        const trendResult = calculateTrendFromScores(scores, 0.05);
        let trend: 'up' | 'down' | 'stable' = 'stable';

        if (trendResult === 'IMPROVING') trend = 'up';
        else if (trendResult === 'DECLINING') trend = 'down';

        const avgPercent = Math.round(avg * 100);

        topicMastery[topic] = {
            avg: avgPercent,
            count: stats.count,
            trend,
        };

        // Identify strengths and weaknesses in the same pass
        if (avgPercent >= 80) {
            strengths.push(topic);
        } else if (avgPercent < 60) {
            weaknesses.push(topic);
        }
    }

    // Recent activity
    const recentQuizzes = quizResults.slice(0, 10).map(r => ({
        id: r.id,
        topic: r.topic,
        score: Math.round(r.score * 100),
        timestamp: r.timestamp,
        questionsCount: r.questionsCount || 10,
    }));

    // Calculate risk level
    const avgMasteryPercent = Math.round(avgScore * 100);
    let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
    if (avgMasteryPercent < 50) riskLevel = 'High';
    else if (avgMasteryPercent < 70) riskLevel = 'Medium';

    return {
        student: {
            id: student.id,
            name: student.name,
            email: student.email,
            className: student.className,
            grade: student.grade,
            lastLoginDate: student.lastLoginDate,
            chatbotPersonality: student.chatbotPersonality || 'friendly-encouraging',
            chatbotInstructions: student.chatbotInstructions || '',
        },
        performance: {
            avgScore: avgMasteryPercent,
            quizzesTaken: quizResults.length,
            topicMastery,
            recentQuizzes,
            strengths,
            weaknesses,
            riskLevel,
        },
    };
}
