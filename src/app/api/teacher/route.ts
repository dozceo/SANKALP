import { NextRequest, NextResponse } from 'next/server';
import { getTeacher } from '@/lib/db-helpers';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get('teacherId');

        if (!teacherId || teacherId === 'undefined') {
            return NextResponse.json(
                { error: 'Missing teacherId' },
                { status: 400 }
            );
        }

        const teacher = await getTeacher(teacherId);

        if (!teacher) {
            return NextResponse.json(
                { error: 'Teacher not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            teacher,
        });
    } catch (error) {
        console.error('Error in teacher API:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
