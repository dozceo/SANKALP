import { NextRequest, NextResponse } from 'next/server';
import { addStudentToClass, getClassByCode } from '@/lib/db-helpers';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { studentId, classCode } = body;

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
