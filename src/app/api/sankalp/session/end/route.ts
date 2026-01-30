import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { sessionId } = body;

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Missing sessionId' },
                { status: 400 }
            );
        }

        // Get session
        const sessionDoc = await db.collection('sankalpSessions').doc(sessionId).get();

        if (!sessionDoc.exists) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            );
        }

        const sessionData = sessionDoc.data();
        const startTime = sessionData?.startTime?.toDate();
        const endTime = new Date();
        const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000 / 60); // minutes

        // Calculate completion percentage
        const activities = sessionData?.activitiesCompleted || {};
        const completedCount = Object.values(activities).filter(Boolean).length;
        const completionPercentage = (completedCount / 5) * 100;

        // Update session
        await db.collection('sankalpSessions').doc(sessionId).update({
            endTime: FieldValue.serverTimestamp(),
            duration,
            status: 'completed',
            completionPercentage,
        });

        return NextResponse.json({
            success: true,
            sessionId,
            duration,
            completionPercentage,
            activitiesCompleted: activities,
        });
    } catch (error) {
        console.error('Error ending SANKALP session:', error);
        return NextResponse.json(
            { error: 'Failed to end session' },
            { status: 500 }
        );
    }
}
