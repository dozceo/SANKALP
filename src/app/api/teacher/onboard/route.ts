import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, name, subjects, gradeLevels, schoolName, expectedClassSize } = body;

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Prepare teacher data
        const teacherData = {
            name,
            subjects,
            gradeLevels,
            schoolName,
            expectedClassSize,
            onboardingCompleted: true,
            onboardingDate: new Date().toISOString(),
            role: 'teacher',
            classes: [], // Will be populated when they create classes
        };

        // Create/update teacher document
        await db.collection('teachers').doc(userId).set(teacherData, { merge: true });

        // Also update the users collection
        await db.collection('users').doc(userId).set({
            role: 'teacher',
            onboardingCompleted: true,
        }, { merge: true });

        return NextResponse.json({
            success: true,
            message: 'Teacher onboarding completed successfully'
        });

    } catch (error) {
        console.error('Teacher onboarding error:', error);
        return NextResponse.json(
            { error: 'Failed to complete onboarding' },
            { status: 500 }
        );
    }
}
