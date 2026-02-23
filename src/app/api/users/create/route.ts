import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/db-helpers';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { uid, email, name, role } = body;

        if (!uid || !email || !name || !role) {
            return NextResponse.json(
                { error: 'Missing required fields: uid, email, name, role' },
                { status: 400 }
            );
        }

        if (role !== 'student' && role !== 'teacher') {
            return NextResponse.json(
                { error: 'Invalid role. Must be "student" or "teacher"' },
                { status: 400 }
            );
        }

        const user = await createUser({ uid, email, name, role });

        return NextResponse.json({
            success: true,
            user,
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
}
