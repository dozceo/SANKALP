import { NextRequest, NextResponse } from 'next/server';
import { createTeacher } from '@/lib/db-helpers-user';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, name, email, school, subject } = body;

        if (!id || !name || !email) {
            return NextResponse.json(
                { error: 'Missing required fields: id, name, email' },
                { status: 400 }
            );
        }

        await createTeacher({
            id,
            userId: id, // userId same as id for teachers
            name,
            email,
            school: school || '',
            subject: subject || '',
        });

        return NextResponse.json({
            success: true,
            message: 'Teacher created successfully',
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating teacher:', error);
        return NextResponse.json(
            { error: 'Failed to create teacher' },
            { status: 500 }
        );
    }
}
