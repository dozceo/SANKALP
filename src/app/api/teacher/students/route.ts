import { NextRequest, NextResponse } from 'next/server';
import { getTeacherStudents, getTeacherClasses, getStudent, getQuizResults } from '@/lib/db-helpers';
import { calculateStudentRisk } from '@/lib/generateStudentIntelligence';

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

        // Enrich student data with quiz results and risk assessment
        const enrichedStudents = await Promise.all(
            students.map(async (student) => {
                const quizResults = await getQuizResults(student.id, 20);

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
            })
        );

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
