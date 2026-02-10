import { NextRequest, NextResponse } from 'next/server';
import { getTeacherStudents, getTeacherClasses, getBatchedQuizResults } from '@/lib/db-helpers';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get('teacherId');

        if (!teacherId) {
            return NextResponse.json(
                { error: 'Missing teacherId parameter' },
                { status: 400 }
            );
        }

        // Optimization: Fetch classes and students in parallel, and start quiz results fetch as soon as students are known
        const classesPromise = getTeacherClasses(teacherId);
        const students = await getTeacherStudents(teacherId, {
            select: ['userId', 'name', 'email', 'className', 'grade', 'lastLoginDate']
        });

        // Batch fetch quiz results for all students (optimization)
        const studentIds = students.map(s => s.id);
        const quizResultsPromise = getBatchedQuizResults(studentIds, 20, {
            select: ['studentId', 'score', 'topic', 'timestamp']
        });

        const [classes, quizResultsMap] = await Promise.all([classesPromise, quizResultsPromise]);

        // Enrich student data with quiz results and risk assessment
        const enrichedStudents = students.map((student) => {
            const quizResults = quizResultsMap.get(student.id) || [];

            // Calculate basic metrics
            const avgScore = quizResults.length > 0
                ? quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length
                : 0;

            const topicStats: Record<string, { sum: number; count: number }> = {};

            for (const r of quizResults) {
                if (!topicStats[r.topic]) {
                    topicStats[r.topic] = { sum: 0, count: 0 };
                }
                topicStats[r.topic].sum += r.score;
                topicStats[r.topic].count += 1;
            }

            const topicMastery: Record<string, number> = {};
            for (const topic in topicStats) {
                topicMastery[topic] = topicStats[topic].sum / topicStats[topic].count;
            }

            const avgMastery = Math.round(avgScore * 100);
            let dropoutRisk = 'Low';
            if (avgMastery < 40) dropoutRisk = 'High';
            else if (avgMastery < 60) dropoutRisk = 'Medium';

            return {
                id: student.id,
                name: student.name,
                email: student.email,
                className: student.className,
                grade: student.grade,
                progress: avgMastery,
                avgMastery: avgMastery,
                dropoutRisk: dropoutRisk,
                quizzesTaken: quizResults.length,
                topicMastery,
                lastActivity: quizResults[0]?.timestamp || student.lastLoginDate,
            };
        });

        return NextResponse.json({
            success: true,
            classes,
            students: enrichedStudents,
            totalStudents: students.length,
            totalClasses: classes.length,
        });
    } catch (error) {
        console.error('Error fetching teacher data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch teacher data' },
            { status: 500 }
        );
    }
}
