import { NextRequest, NextResponse } from 'next/server';
import { getTeacher } from '@/lib/db-helpers';
import { db, auth } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get('teacherId');

        if (!teacherId || teacherId === 'undefined') {
            console.error('[Teacher API] Invalid or missing teacherId');
            return NextResponse.json(
                { error: 'Missing teacherId' },
                { status: 400 }
            );
        }

        const teacher = await getTeacher(teacherId);

        if (!teacher) {
            // Return empty teacher object instead of 404 to prevent routing errors
            return NextResponse.json({
                success: true,
                teacher: null,
            });
        }

        return NextResponse.json({
            success: true,
            teacher,
        });
    } catch (error) {
        console.error('[Teacher API] Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { teacherId, ...updateData } = body;

        // Extract and verify token
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized: Missing or invalid token' },
                { status: 401 }
            );
        }
        const token = authHeader.split('Bearer ')[1];

        let decodedToken;
        try {
            decodedToken = await auth.verifyIdToken(token);
        } catch (error) {
            console.error('Token verification failed:', error);
            return NextResponse.json(
                { error: 'Unauthorized: Invalid token' },
                { status: 401 }
            );
        }

        // Verify ownership
        if (teacherId !== decodedToken.uid) {
             return NextResponse.json(
                { error: 'Forbidden: You can only update your own profile' },
                { status: 403 }
            );
        }

        if (!teacherId) {
            return NextResponse.json(
                { error: 'Missing teacherId' },
                { status: 400 }
            );
        }

        await db.collection('teachers').doc(teacherId).update(updateData);

        return NextResponse.json({
            success: true,
            message: 'Teacher profile updated successfully'
        });
    } catch (error) {
        console.error('[Teacher API] Update Error:', error);
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}
