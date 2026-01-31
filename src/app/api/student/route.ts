import { NextRequest, NextResponse } from 'next/server';
import { getStudent } from '@/lib/db-helpers';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get('studentId');

        if (!studentId || studentId === 'undefined') {
            return NextResponse.json(
                { error: 'Missing studentId' },
                { status: 400 }
            );
        }

        const student = await getStudent(studentId);

        if (!student) {
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            student,
        });
    } catch (error) {
        console.error('Error in student API:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
