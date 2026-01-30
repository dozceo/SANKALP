import { NextRequest, NextResponse } from 'next/server';
import { createStudent } from '@/lib/db-helpers-user';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, name, email, grade, userId } = body;

        if (!id || !name || !email || !userId) {
            return NextResponse.json(
                { error: 'Missing required fields: id, name, email, userId' },
                { status: 400 }
            );
        }

        await createStudent({
            id,
            name,
            email,
            userId,
            grade: grade || '',
            registrationDate: new Date(),
            lastLoginDate: new Date(),
        });

        return NextResponse.json({
            success: true,
            message: 'Student created successfully',
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating student:', error);
        return NextResponse.json(
            { error: 'Failed to create student' },
            { status: 500 }
        );
    }
}
