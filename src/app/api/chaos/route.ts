
import { NextResponse } from 'next/server';
import { chaos } from '@/lib/chaos-config';
import { db } from '@/lib/firebase-admin';

// Only allow in development or staging
const isChaosEnabled = process.env.NODE_ENV !== 'production' || process.env.ENABLE_CHAOS === 'true';

export async function GET() {
  if (!isChaosEnabled) {
    return NextResponse.json({ error: 'Chaos mode disabled' }, { status: 403 });
  }
  return NextResponse.json({
    state: chaos.getState(),
    metrics: chaos.getMetrics(),
  });
}

export async function POST(request: Request) {
  if (!isChaosEnabled) {
    return NextResponse.json({ error: 'Chaos mode disabled' }, { status: 403 });
  }
  try {
    const body = await request.json();

    if (body.action === 'seed') {
        // Ensure we only seed the Mock DB to avoid corrupting real data if misconfigured
        // (Though ENABLE_CHAOS should prevent prod usage, this is an extra safety check)
        if (process.env.USE_MOCK_DB !== 'true') {
             return NextResponse.json({ error: 'Seeding only allowed with USE_MOCK_DB=true' }, { status: 400 });
        }

        // Reset Mock DB (Clear Cache & Data)
        if ((db as any).data) {
             (db as any).data = {};
             if (typeof (db as any).save === 'function') {
                 (db as any).save();
             }
        }

        const studentId = 'student-chaos';
        console.log(`[Chaos API] Seeding mock database for student: ${studentId}`);

        // Seed Student
        await db.collection('students').doc(studentId).set({
            id: studentId,
            name: 'Chaos Student',
            email: 'chaos@example.com',
            lastLoginDate: new Date(),
            registrationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        });

        // Seed Quiz Results (20 quizzes)
        const topics = ['Algebra', 'Geometry', 'Calculus', 'Statistics'];
        for (let i = 0; i < 20; i++) {
            const topic = topics[i % topics.length];
            await db.collection('quizResults').add({
                studentId,
                topic,
                score: 0.4 + (Math.random() * 0.6), // 40-100%
                timestamp: new Date(Date.now() - i * 12 * 60 * 60 * 1000), // Every 12 hours
                timeSpent: 60 + Math.floor(Math.random() * 60),
                questionsAttempted: 10,
                difficulty: 'MEDIUM',
            });
        }

        console.log('[Chaos API] Seeding complete');
        return NextResponse.json({ success: true, message: 'Mock DB seeded with student-chaos and 20 quiz results' });
    }

    chaos.setState(body);
    return NextResponse.json({ success: true, state: chaos.getState() });
  } catch (error) {
    console.error('Chaos API Error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE() {
  if (!isChaosEnabled) {
    return NextResponse.json({ error: 'Chaos mode disabled' }, { status: 403 });
  }
  chaos.resetState();
  chaos.resetMetrics();
  return NextResponse.json({ success: true, message: 'Chaos state reset' });
}
