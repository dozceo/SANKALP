import { NextRequest, NextResponse } from 'next/server';
import { getTeacher } from '@/lib/db-helpers';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get('teacherId');

        console.log('[Teacher API] GET request for teacherId:', teacherId);

        if (!teacherId || teacherId === 'undefined') {
            console.error('[Teacher API] Invalid or missing teacherId');
            return NextResponse.json(
                { error: 'Missing teacherId' },
                { status: 400 }
            );
        }

        const teacher = await getTeacher(teacherId);
        console.log('[Teacher API] Teacher fetched:', teacher ? 'Found' : 'Not found');

        if (!teacher) {
            console.log('[Teacher API] Teacher not found in DB for ID:', teacherId);
            // Return empty teacher object instead of 404 to prevent routing errors
            return NextResponse.json({
                success: true,
                teacher: null,
            });
        }

        console.log('[Teacher API] Returning teacher data:', {
            id: teacher.id,
            name: teacher.name,
            onboardingCompleted: teacher.onboardingCompleted
        });

        return NextResponse.json({
            success: true,
            teacher,
        });
    } catch (error) {
        console.error('[Teacher API] Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
