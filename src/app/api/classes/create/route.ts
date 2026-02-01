import { NextRequest, NextResponse } from 'next/server';
import { createClass, getTeacher } from '@/lib/db-helpers';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { teacherId, className, subject, grade } = body;

        // Validate required fields
        if (!teacherId || !className || !subject || !grade) {
            return NextResponse.json(
                { error: 'Missing required fields: teacherId, className, subject, grade' },
                { status: 400 }
            );
        }

        // Verify teacher exists
        const teacher = await getTeacher(teacherId);
        if (!teacher) {
            return NextResponse.json(
                { error: 'Teacher not found' },
                { status: 404 }
            );
        }

        // Create the class
        const newClass = await createClass({
            teacherId,
            teacherName: teacher.name,
            className,
            subject,
            grade,
        });

        return NextResponse.json({
            success: true,
            class: {
                id: newClass.id,
                classCode: newClass.classCode,
                className: newClass.className,
                subject: newClass.subject,
                grade: newClass.grade,
                teacherId: newClass.teacherId,
                teacherName: newClass.teacherName,
                studentIds: newClass.studentIds,
                isActive: newClass.isActive,
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating class:', error);
        return NextResponse.json(
            { error: 'Failed to create class' },
            { status: 500 }
        );
    }
}
