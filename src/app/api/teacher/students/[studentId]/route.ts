import { NextRequest, NextResponse } from 'next/server';
import { getStudentAnalytics } from '@/lib/student-analytics';

export async function GET(
    req: NextRequest,
    { params }: { params: { studentId: string } }
) {
    try {
        const { studentId } = params;

        if (!studentId) {
            return NextResponse.json(
                { error: 'Missing studentId' },
                { status: 400 }
            );
        }

        const data = await getStudentAnalytics(studentId);

        if (!data) {
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            ...data
        });
    } catch (error) {
        console.error('Error fetching student details:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
