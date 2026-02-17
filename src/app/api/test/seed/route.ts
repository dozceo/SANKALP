
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

// Only allow in development/test
const isTest = process.env.NODE_ENV !== 'production' || process.env.USE_MOCK_DB === 'true';

export async function POST() {
  if (!isTest) {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  }

  try {
    console.log('🌱 Seeding Mock DB via API...');

    const mockTimestamp = (isoString?: string) => {
        const date = isoString ? new Date(isoString) : new Date();
        return {
            toDate: () => date,
            toMillis: () => date.getTime(),
            seconds: Math.floor(date.getTime() / 1000),
            nanoseconds: (date.getTime() % 1000) * 1000000,
        };
    };

    // Seed Student
    await db.collection('students').doc('test_student_1').set({
        id: 'test_student_1',
        email: 'alex@example.com',
        name: 'Alex Thompson',
        registrationDate: mockTimestamp(),
        lastLoginDate: mockTimestamp(),
        grade: '10th',
        chatbotPersonality: 'Friendly',
        chatbotInstructions: 'Help me learn',
        joinedClassAt: mockTimestamp(),
    });

    // Seed Quiz Results
    await db.collection('quizResults').add({
        studentId: 'test_student_1',
        topic: 'Algebra',
        score: 0.8,
        timeSpent: 120,
        questionsAttempted: 10,
        timestamp: mockTimestamp(), // Some parts might use .toDate() on this too
    });

    console.log('✅ Mock DB Seeded');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Seeding failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
