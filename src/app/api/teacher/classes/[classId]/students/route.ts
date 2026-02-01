import { NextRequest, NextResponse } from 'next/server';
import { getStudentsInClass } from '@/lib/db-helpers';

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

        const students = await getStudentsInClass(classId);

        return NextResponse.json({
            success: true,
            students,
            total: students.length,
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
