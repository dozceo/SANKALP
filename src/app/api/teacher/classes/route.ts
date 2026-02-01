import { NextRequest, NextResponse } from 'next/server';
import { getTeacherClasses } from '@/lib/db-helpers';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get('teacherId');

        if (!teacherId || teacherId === 'undefined') {
            return NextResponse.json(
                { error: 'Missing or invalid teacherId' },
                { status: 400 }
            );
        }

        const classes = await getTeacherClasses(teacherId);

        return NextResponse.json({
            success: true,
            classes,
            total: classes.length
        });
    } catch (error) {
        console.error('Error fetching teacher classes:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
