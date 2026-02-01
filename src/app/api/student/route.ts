import { NextRequest, NextResponse } from 'next/server';
import { getStudent } from '@/lib/db-helpers';
import { db, auth } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get('studentId');

        console.log('[Student API] GET request for studentId:', studentId);

        if (!studentId || studentId === 'undefined') {
            console.error('[Student API] Invalid or missing studentId');
            return NextResponse.json(
                { error: 'Missing studentId' },
                { status: 400 }
            );
        }

        const student = await getStudent(studentId);
        console.log('[Student API] Student fetched:', student ? 'Found' : 'Not found');

        if (!student) {
            console.log('[Student API] Student not found in DB for ID:', studentId);
            // Return empty student object instead of 404 to prevent errors
            return NextResponse.json({
                success: true,
                student: null,
            });
        }

        console.log('[Student API] Returning student data:', {
            id: student.id,
            name: student.name,
            onboardingCompleted: student.onboardingCompleted
        });

        return NextResponse.json({
            success: true,
            student,
        });
    } catch (error) {
        console.error('[Student API] Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { studentId, ...updateData } = body;

        // Extract and verify token
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized: Missing or invalid token' },
                { status: 401 }
            );
        }
        const token = authHeader.split('Bearer ')[1];

        let decodedToken;
        try {
            decodedToken = await auth.verifyIdToken(token);
        } catch (error) {
            console.error('Token verification failed:', error);
            return NextResponse.json(
                { error: 'Unauthorized: Invalid token' },
                { status: 401 }
            );
        }

        // Verify ownership
        if (studentId !== decodedToken.uid) {
             return NextResponse.json(
                { error: 'Forbidden: You can only update your own profile' },
                { status: 403 }
            );
        }

        if (!studentId) {
            return NextResponse.json(
                { error: 'Missing studentId' },
                { status: 400 }
            );
        }

        await db.collection('students').doc(studentId).update(updateData);

        return NextResponse.json({
            success: true,
            message: 'Student profile updated successfully'
        });
    } catch (error) {
        console.error('[Student API] Update Error:', error);
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}
