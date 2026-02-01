import { NextRequest, NextResponse } from 'next/server';
import { fetchTeacherGraphData } from '@/lib/graph-helpers';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get('teacherId');

        if (!teacherId) {
            return NextResponse.json(
                { error: 'Missing teacherId parameter' },
                { status: 400 }
            );
        }

        const graphData = await fetchTeacherGraphData(teacherId);

        return NextResponse.json({
            success: true,
            ...graphData
        });
    } catch (error) {
        console.error('Error fetching teacher graph:', error);
        return NextResponse.json(
            { error: 'Failed to fetch graph data' },
            { status: 500 }
        );
    }
}
