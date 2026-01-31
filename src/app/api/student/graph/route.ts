import { NextRequest, NextResponse } from 'next/server';
import { fetchStudentGraphData } from '@/lib/graph-helpers';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get('studentId');

        if (!studentId) {
            return NextResponse.json(
                { error: 'Missing studentId parameter' },
                { status: 400 }
            );
        }

        const graphData = await fetchStudentGraphData(studentId);

        return NextResponse.json({
            success: true,
            ...graphData
        });
    } catch (error) {
        console.error('Error fetching student graph:', error);
        return NextResponse.json(
            { error: 'Failed to fetch graph data' },
            { status: 500 }
        );
    }
}
