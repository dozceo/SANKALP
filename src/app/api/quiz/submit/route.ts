import { NextRequest, NextResponse } from 'next/server';
import { saveQuizResult } from '@/lib/db-helpers';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { studentId, topic, score, timeSpent, questionsAttempted } = body;

        // Validate required fields
        if (!studentId || !topic || score === undefined || !timeSpent || !questionsAttempted) {
            return NextResponse.json(
                { error: 'Missing required fields: studentId, topic, score, timeSpent, questionsAttempted' },
                { status: 400 }
            );
        }

        // Validate score range
        if (score < 0 || score > 1) {
            return NextResponse.json(
                { error: 'Score must be between 0 and 1' },
                { status: 400 }
            );
        }

        // Save quiz result
        const resultId = await saveQuizResult({
            studentId,
            topic,
            score,
            timeSpent,
            questionsAttempted,
            timestamp: new Date(),
        });

        return NextResponse.json({
            success: true,
            resultId,
            message: 'Quiz result saved successfully',
        }, { status: 201 });
    } catch (error) {
        console.error('Error saving quiz result:', error);
        return NextResponse.json(
            { error: 'Failed to save quiz result' },
            { status: 500 }
        );
    }
}
