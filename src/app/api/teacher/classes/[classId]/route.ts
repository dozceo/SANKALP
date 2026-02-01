import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET(
    req: NextRequest,
    { params }: { params: { classId: string } }
) {
    try {
        const { classId } = params;

        if (!classId) {
            return NextResponse.json(
                { error: 'Missing classId' },
                { status: 400 }
            );
        }

        const classDoc = await db.collection('classes').doc(classId).get();

        if (!classDoc.exists) {
            return NextResponse.json(
                { error: 'Class not found' },
                { status: 404 }
            );
        }

        const data = classDoc.data();

        return NextResponse.json({
            success: true,
            class: {
                id: classDoc.id,
                classCode: data?.classCode,
                className: data?.className,
                teacherId: data?.teacherId,
                teacherName: data?.teacherName,
                subject: data?.subject,
                grade: data?.grade,
                studentIds: data?.studentIds || [],
                createdAt: data?.createdAt?.toDate(),
                isActive: data?.isActive,
            },
        });
    } catch (error) {
        console.error('Error fetching class:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
