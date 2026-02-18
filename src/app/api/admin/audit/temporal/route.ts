import { NextRequest, NextResponse } from 'next/server';
import { auditStudent, AuditViolation } from '@/lib/temporal-audit';
import { getStudent } from '@/lib/db-helpers';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { studentId } = body;

        // 1. Audit Single Student
        if (studentId) {
            const student = await getStudent(studentId);
            if (!student) {
                return NextResponse.json(
                    { error: 'Student not found' },
                    { status: 404 }
                );
            }

            const violations = await auditStudent(studentId);

            return NextResponse.json({
                success: true,
                studentId,
                violationsCount: violations.length,
                violations,
                timestamp: new Date().toISOString()
            });
        }

        // 2. Batch Audit (Not implemented for MVP safety, returns error)
        return NextResponse.json(
            { error: 'Please provide a studentId. Batch audit not enabled in this endpoint.' },
            { status: 400 }
        );

    } catch (error) {
        console.error('Error running temporal audit:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
