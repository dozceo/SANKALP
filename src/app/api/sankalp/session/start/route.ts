import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { studentId, targetDuration } = body;

        if (!studentId || !targetDuration) {
            return NextResponse.json(
                { error: 'Missing required fields: studentId, targetDuration' },
                { status: 400 }
            );
        }

        // Check for active session
        const activeSessionSnapshot = await db
            .collection('sankalpSessions')
            .where('studentId', '==', studentId)
            .where('status', '==', 'active')
            .limit(1)
            .get();

        if (!activeSessionSnapshot.empty) {
            return NextResponse.json(
                { error: 'Active session already exists' },
                { status: 400 }
            );
        }

        // Create new session
        const sessionRef = await db.collection('sankalpSessions').add({
            studentId,
            startTime: FieldValue.serverTimestamp(),
            duration: 0,
            targetDuration,
            status: 'active',
            activitiesCompleted: {
                addedClassData: false,
                reviewedTopics: false,
                checkedSchedule: false,
                chatWithMentor: false,
                updatedBrainMap: false,
            },
            timeBreakdown: {
                plannerTime: 0,
                brainMapTime: 0,
                chatTime: 0,
                reviewTime: 0,
                quizTime: 0,
            },
            dataEntryMetrics: {
                topicsAdded: 0,
                subjectsReviewed: 0,
                nodesCreated: 0,
                chatMessages: 0,
                keystrokesCount: 0,
                averageEntrySpeed: 0,
            },
            completionPercentage: 0,
            createdAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({
            success: true,
            sessionId: sessionRef.id,
            startTime: new Date().toISOString(),
            targetDuration,
        }, { status: 201 });
    } catch (error) {
        console.error('Error starting SANKALP session:', error);
        return NextResponse.json(
            { error: 'Failed to start session' },
            { status: 500 }
        );
    }
}
