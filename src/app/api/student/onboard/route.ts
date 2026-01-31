import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, name, grade, subjects, goals, dailyStudyTime, classCode } = body;

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Prepare student data
        const studentData: any = {
            name,
            grade,
            subjects,
            goals,
            dailyStudyTime,
            onboardingCompleted: true,
            onboardingDate: new Date().toISOString(),
            role: 'student',
        };

        // If class code provided, attempt to join the class
        if (classCode) {
            const classesSnapshot = await db
                .collection('classes')
                .where('classCode', '==', classCode)
                .limit(1)
                .get();

            if (!classesSnapshot.empty) {
                const classDoc = classesSnapshot.docs[0];
                studentData.classId = classDoc.id;
                studentData.teacherId = classDoc.data().teacherId;
            } else {
                // Invalid class code, but don't fail - just skip joining
                console.warn(`Invalid class code: ${classCode}`);
            }
        }

        // Create/update student document
        await db.collection('students').doc(userId).set(studentData, { merge: true });

        // Also update the users collection
        await db.collection('users').doc(userId).set({
            role: 'student',
            onboardingCompleted: true,
        }, { merge: true });

        return NextResponse.json({
            success: true,
            message: 'Onboarding completed successfully'
        });

    } catch (error) {
        console.error('Onboarding error:', error);
        return NextResponse.json(
            { error: 'Failed to complete onboarding' },
            { status: 500 }
        );
    }
}
