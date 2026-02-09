import { NextRequest, NextResponse } from 'next/server';
import { addStudentToClass, getClassByCode } from '@/lib/db-helpers';
import { auth } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { studentId, classCode } = body;

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
        if (!studentId || !classCode) {
            return NextResponse.json(
                { error: 'Missing required fields: studentId, classCode' },
                { status: 400 }
            );
        }

        // Verify class exists
        const classDoc = await getClassByCode(classCode);
        if (!classDoc) {
            return NextResponse.json(
                { error: 'Invalid class code' },
                { status: 404 }
            );
        }

        // Add student to class
        await addStudentToClass(studentId, classCode);

        return NextResponse.json({
            success: true,
            class: {
                id: classDoc.id,
                className: classDoc.className,
                teacherName: classDoc.teacherName,
                subject: classDoc.subject,
                grade: classDoc.grade,
            },
        });
    } catch (error) {
        console.error('Error joining class:', error);
        return NextResponse.json(
            { error: 'Failed to join class' },
            { status: 500 }
        );
    }
}
