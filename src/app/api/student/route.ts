import { NextRequest, NextResponse } from 'next/server';
import { getStudent } from '@/lib/db-helpers';

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
