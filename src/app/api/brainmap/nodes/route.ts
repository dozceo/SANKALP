import { NextRequest, NextResponse } from 'next/server';
import { getBrainMapNodes, getBrainMapNodeWithChildren } from '@/lib/db-helpers-extended';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get('studentId');
        const nodeId = searchParams.get('nodeId');

        if (!studentId && !nodeId) {
            return NextResponse.json(
                { error: 'Missing studentId or nodeId parameter' },
                { status: 400 }
            );
        }

        // Get single node with children
        if (nodeId) {
            const result = await getBrainMapNodeWithChildren(nodeId);
            return NextResponse.json({
                success: true,
                ...result,
            });
        }

        // Get all nodes for student
        if (studentId) {
            const nodes = await getBrainMapNodes(studentId);
            return NextResponse.json({
                success: true,
                nodes,
                count: nodes.length,
            });
        }
    } catch (error) {
        console.error('Error getting brain map:', error);
        return NextResponse.json(
            { error: 'Failed to get brain map' },
            { status: 500 }
        );
    }
}
