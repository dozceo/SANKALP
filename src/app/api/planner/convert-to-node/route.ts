import { NextRequest, NextResponse } from 'next/server';
import { convertPlannerToBrainMapNode } from '@/lib/db-helpers-extended';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { plannerItemId, parentNodeId } = body;

        if (!plannerItemId) {
            return NextResponse.json(
                { error: 'Missing plannerItemId' },
                { status: 400 }
            );
        }

        const nodeId = await convertPlannerToBrainMapNode(
            plannerItemId,
            parentNodeId
        );

        return NextResponse.json({
            success: true,
            nodeId,
            message: 'Successfully converted planner item to brain map node',
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error converting to brain map:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to convert to brain map node' },
            { status: 500 }
        );
    }
}
