import { NextRequest, NextResponse } from 'next/server';
import { addPlannerItem } from '@/lib/db-helpers-extended';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { studentId, subject, topic, content, type, date } = body;

        if (!studentId || !subject || !topic || !content || !type) {
            return NextResponse.json(
                { error: 'Missing required fields: studentId, subject, topic, content, type' },
                { status: 400 }
            );
        }

        const itemId = await addPlannerItem({
            studentId,
            subject,
            topic,
            date: date ? new Date(date) : new Date(),
            type,
            content,
            attachments: body.attachments || [],
            completed: false,
            reviewDates: [],
            reviewCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            itemId,
            message: 'Planner item added successfully',
        }, { status: 201 });
    } catch (error) {
        console.error('Error adding planner item:', error);
        return NextResponse.json(
            { error: 'Failed to add planner item' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get('studentId');
        const subject = searchParams.get('subject');
        const completed = searchParams.get('completed');

        if (!studentId) {
            return NextResponse.json(
                { error: 'Missing studentId parameter' },
                { status: 400 }
            );
        }

        const { getPlannerItems } = await import('@/lib/db-helpers-extended');

        const items = await getPlannerItems(studentId, {
            subject: subject || undefined,
            completed: completed ? completed === 'true' : undefined,
        });

        return NextResponse.json({
            success: true,
            items,
            count: items.length,
        });
    } catch (error) {
        console.error('Error getting planner items:', error);
        return NextResponse.json(
            { error: 'Failed to get planner items' },
            { status: 500 }
        );
    }
}
