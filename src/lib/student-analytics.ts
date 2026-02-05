import { getStudent, getQuizResults } from './db-helpers';

export async function getStudentAnalytics(studentId: string) {
    // Get student details
    const student = await getStudent(studentId);
    if (!student) {
        return null;
    }

    // Get quiz results (last 50)
    const quizResults = await getQuizResults(studentId, 50);

    // Calculate metrics
    const avgScore = quizResults.length > 0
        ? quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length
        : 0;

    // Topic-wise performance
    const topicStats: Record<string, { sum: number; count: number; scores: number[] }> = {};
    for (const r of quizResults) {
        if (!topicStats[r.topic]) {
            topicStats[r.topic] = { sum: 0, count: 0, scores: [] };
        }
        topicStats[r.topic].sum += r.score;
        topicStats[r.topic].count += 1;
        topicStats[r.topic].scores.push(r.score);
    }

    const topicMastery: Record<string, { avg: number; count: number; trend: 'up' | 'down' | 'stable' }> = {};
    for (const topic in topicStats) {
        const avg = topicStats[topic].sum / topicStats[topic].count;
        const scores = topicStats[topic].scores;

        // Calculate trend (compare first half vs second half)
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (scores.length >= 4) {
            const mid = Math.floor(scores.length / 2);
            const firstHalf = scores.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
            const secondHalf = scores.slice(mid).reduce((a, b) => a + b, 0) / (scores.length - mid);
            if (secondHalf > firstHalf + 0.05) trend = 'up';
            else if (secondHalf < firstHalf - 0.05) trend = 'down';
        }

        topicMastery[topic] = {
            avg: Math.round(avg * 100),
            count: topicStats[topic].count,
            trend,
        };
    }

    // Recent activity
    const recentQuizzes = quizResults.slice(0, 10).map(r => ({
        id: r.id,
        topic: r.topic,
        score: Math.round(r.score * 100),
        timestamp: r.timestamp,
        questionsCount: r.questionsCount || 10,
    }));

    // Derive strengths and weaknesses
    const strengths = Object.entries(topicMastery)
        .filter(([_, data]) => data.avg >= 80)
        .map(([topic]) => topic);

    const weaknesses = Object.entries(topicMastery)
        .filter(([_, data]) => data.avg < 60)
        .map(([topic]) => topic);

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
