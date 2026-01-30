import { NextRequest, NextResponse } from 'next/server';
import { saveSyllabus } from '@/lib/db-helpers';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { studentId, examName, title, structure, strategy } = body;

        // Validate required fields
        if (!studentId || !examName || !title || !structure || !strategy) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Save syllabus
        const syllabusId = await saveSyllabus({
            studentId,
            examName,
            title,
            structure,
            strategy,
            createdAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            syllabusId,
            message: 'Syllabus saved successfully',
        }, { status: 201 });
    } catch (error) {
        console.error('Error saving syllabus:', error);
        return NextResponse.json(
            { error: 'Failed to save syllabus' },
            { status: 500 }
        );
    }
}
