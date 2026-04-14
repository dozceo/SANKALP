/**
 * Personal Database Seed Script
 * 
 * Populates Firestore with realistic demo data for a SPECIFIC user.
 * Usage: npx ts-node scripts/seed-personal.ts <USER_ID>
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Load environment variables
const envPath = resolve(process.cwd(), '.env.local');
config({ path: envPath });

// Fallback project ID
if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'sankalp-prerollout';
}

async function seedPersonalData(userId: string) {
    if (!userId) {
        throw new Error('Please provide a User ID as an argument.\nUsage: npx ts-node scripts/seed-personal.ts <USER_ID>');
    }

    try {
        console.log(`Initializing for project: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);

        let app;
        if (getApps().length > 0) {
            app = getApps()[0];
        } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            app = initializeApp({
                credential: cert(serviceAccount),
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            });
        } else {
            app = initializeApp({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            });
        }

        const db = getFirestore(app);
        console.log(`🌱 Seeding data for User ID: ${userId} ...\n`);

        // 1. Create/Update Student Profile
        const studentRef = db.collection('students').doc(userId);
        await studentRef.set({
            name: 'Demo Student', // Will be overwritten if they sign in with Google usually, but good fallback
            email: 'demo@example.com',
            role: 'student',
            grade: 11,
            topics: ['Algebra', 'Mechanics', 'Organic Chemistry', 'Modern History'],
            strengths: ['Problem Solving', 'Calculus'],
            weaknesses: ['Organic Chemistry'],
            lastActive: new Date().toISOString(),
            masteryScores: {
                'Algebra': 0.85,
                'Mechanics': 0.65,
                'Organic Chemistry': 0.40,
                'Modern History': 0.90
            }
        }, { merge: true });
        console.log('✅ Updated student profile');

        // 2. Generate Quiz Results (Historical Data)
        const topics = ['Algebra', 'Mechanics', 'Organic Chemistry', 'Modern History'];
        let count = 0;

        const batch = db.batch();

        // Generate 10 random quiz results
        for (let i = 0; i < 10; i++) {
            const topic = topics[Math.floor(Math.random() * topics.length)];
            const score = 0.4 + Math.random() * 0.6; // Random score between 0.4 and 1.0

            const ref = db.collection('quizResults').doc();
            batch.set(ref, {
                studentId: userId,
                topic: topic,
                score: parseFloat(score.toFixed(2)),
                timeSpent: 120 + Math.floor(Math.random() * 200),
                questionsAttempted: 10,
                timestamp: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)), // Random time in last 30 days
            });
            count++;
        }

        await batch.commit();
        console.log(`✅ Created ${count} quiz results`);

        console.log('\n✨ Personal data seeding completed!');
        console.log('You can now log in and view your Brain Map.');

    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
}

// Get User ID from command line argument
const userIdArg = process.argv[2];
seedPersonalData(userIdArg)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
