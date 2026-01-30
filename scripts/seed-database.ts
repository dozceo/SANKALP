/**
 * Database Seed Script
 * 
 * Populates Firestore with test data for development.
 * Run with: npm run seed-db
 */

import { db } from '../src/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Test student data
const TEST_STUDENTS = [
    {
        id: 'test_student_1',
        email: 'alex@example.com',
        name: 'Alex Thompson',
    },
    {
        id: 'test_student_2',
        email: 'sarah@example.com',
        name: 'Sarah Martinez',
    },
];

// Test quiz results
const TEST_QUIZ_RESULTS = [
    // Alex's quiz history
    {
        studentId: 'test_student_1',
        topic: 'Algebra',
        score: 0.35,
        timeSpent: 180,
        questionsAttempted: 10,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
        studentId: 'test_student_1',
        topic: 'Algebra',
        score: 0.40,
        timeSpent: 200,
        questionsAttempted: 10,
        timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    },
    {
        studentId: 'test_student_1',
        topic: 'Geometry',
        score: 0.75,
        timeSpent: 150,
        questionsAttempted: 10,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
        studentId: 'test_student_1',
        topic: 'Calculus',
        score: 0.55,
        timeSpent: 240,
        questionsAttempted: 10,
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
        studentId: 'test_student_1',
        topic: 'Trigonometry',
        score: 0.80,
        timeSpent: 180,
        questionsAttempted: 10,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    // Sarah's quiz history
    {
        studentId: 'test_student_2',
        topic: 'Algebra',
        score: 0.90,
        timeSpent: 150,
        questionsAttempted: 10,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
        studentId: 'test_student_2',
        topic: 'Geometry',
        score: 0.85,
        timeSpent: 160,
        questionsAttempted: 10,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
        studentId: 'test_student_2',
        topic: 'Calculus',
        score: 0.88,
        timeSpent: 170,
        questionsAttempted: 10,
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
];

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...\n');

        // Create students
        console.log('Creating students...');
        for (const student of TEST_STUDENTS) {
            await db.collection('students').doc(student.id).set({
                email: student.email,
                name: student.name,
                registrationDate: FieldValue.serverTimestamp(),
                lastLoginDate: FieldValue.serverTimestamp(),
            });
            console.log(`  ✅ Created student: ${student.name} (${student.id})`);
        }

        // Create quiz results
        console.log('\nCreating quiz results...');
        for (const quiz of TEST_QUIZ_RESULTS) {
            await db.collection('quizResults').add({
                studentId: quiz.studentId,
                topic: quiz.topic,
                score: quiz.score,
                timeSpent: quiz.timeSpent,
                questionsAttempted: quiz.questionsAttempted,
                timestamp: quiz.timestamp,
            });
        }
        console.log(`  ✅ Created ${TEST_QUIZ_RESULTS.length} quiz results`);

        console.log('\n✨ Database seeding completed successfully!\n');
        console.log('Test accounts:');
        console.log('  - alex@example.com (ID: test_student_1)');
        console.log('  - sarah@example.com (ID: test_student_2)');
        console.log('\nYou can now test the API with: /api/intelligence/student?studentId=test_student_1');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seed function
seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
