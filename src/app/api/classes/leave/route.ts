import { NextRequest, NextResponse } from 'next/server';
import { removeStudentFromClass, getStudent } from '@/lib/db-helpers';
import { auth } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { studentId } = body;

        // Extract and verify token
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized: Missing or invalid token' },
                { status: 401 }
            );
        }
        const token = authHeader.split('Bearer ')[1];

        try {
            if (!auth) {
                return NextResponse.json(
                    { error: 'Auth service not initialized' },
                    { status: 500 }
                );
            }
            const decodedToken = await auth.verifyIdToken(token);
            // Verify ownership
            if (studentId !== decodedToken.uid) {
                return NextResponse.json(
                    { error: 'Forbidden: You can only perform this action for your own account' },
                    { status: 403 }
                );
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            return NextResponse.json(
                { error: 'Unauthorized: Invalid token' },
                { status: 401 }
            );
        }

        // Validate required fields
        if (!studentId) {
            return NextResponse.json(
                { error: 'Missing required field: studentId' },
                { status: 400 }
            );
        }

        // Get student to find their current class
        const student = await getStudent(studentId);
        if (!student || !student.classId) {
            return NextResponse.json(
                { error: 'Student is not currently in a class' },
                { status: 400 }
            );
        }

        // Remove student from class
        await removeStudentFromClass(studentId, student.classId);

        return NextResponse.json({
            success: true,
            message: 'Successfully left the class'
        });
    } catch (error) {
        console.error('Error leaving class:', error);
        return NextResponse.json(
            { error: 'Failed to leave class' },
            { status: 500 }
        );
    }
}
