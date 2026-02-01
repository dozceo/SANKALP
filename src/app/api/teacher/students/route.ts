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

        // Get teacher's classes
        const classes = await getTeacherClasses(teacherId);

        // Get all students
        const students = await getTeacherStudents(teacherId);

        // Get all student IDs
        const studentIds = students.map(s => s.id);

        // Fetch quiz results in batches (N+1 optimization)
        const quizResultsMap = await getBatchedQuizResults(studentIds);

        // Enrich student data with quiz results
        const enrichedStudents = students.map((student) => {
            const allQuizResults = quizResultsMap.get(student.id) || [];

            // Sort by timestamp desc and take top 20
            const quizResults = [...allQuizResults]
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .slice(0, 20);

            // Calculate basic metrics
            const avgScore = quizResults.length > 0
                ? quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length
                : 0;

            const topics = [...new Set(quizResults.map(r => r.topic))];
            const topicMastery: Record<string, number> = {};

            topics.forEach(topic => {
                const topicResults = quizResults.filter(r => r.topic === topic);
                const topicAvg = topicResults.reduce((sum, r) => sum + r.score, 0) / topicResults.length;
                topicMastery[topic] = topicAvg;
            });

            return {
                id: student.id,
                name: student.name,
                email: student.email,
                className: student.className,
                grade: student.grade,
                progress: Math.round(avgScore * 100),
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
