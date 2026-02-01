import { NextRequest, NextResponse } from 'next/server';
import { getSpacedReviewItems } from '@/lib/db-helpers-extended';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get('studentId');
        const date = searchParams.get('date');

        if (!studentId) {
            return NextResponse.json(
                { error: 'Missing studentId parameter' },
                { status: 400 }
            );
        }

        const reviewDate = date ? new Date(date) : new Date();
        const items = await getSpacedReviewItems(studentId, reviewDate);

        return NextResponse.json({
            success: true,
            items,
            count: items.length,
            date: reviewDate.toISOString(),
        });
    } catch (error) {
        console.error('Error getting spaced review items:', error);
        return NextResponse.json(
            { error: 'Failed to get spaced review items' },
            { status: 500 }
        );
    }
}
