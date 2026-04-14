/**
 * Database Cleanup Script
 * 
 * Removes all students and quiz results from Firestore.
 * Run with: npx ts-node scripts/cleanup-db.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Load environment variables from .env.local
const envPath = resolve(process.cwd(), '.env.local');
console.log('Loading env from:', envPath);
config({ path: envPath });

console.log('Project ID (from env):', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

// Fallback for local development if env not loaded
if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    console.log('⚠️ Env var missing, using fallback project ID');
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'sankalp-prerollout';
}

async function cleanupDatabase() {
    try {
        console.log('Initializing Firebase Admin...');

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

        console.log('🧹 Starting database cleanup...\n');

        // Delete students
        console.log('Deleting students...');
        const studentsSnapshot = await db.collection('students').get();
        if (studentsSnapshot.empty) {
            console.log('  No students found.');
        } else {
            const batch = db.batch();
            studentsSnapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
                console.log(`  Targeting student: ${doc.id}`);
            });
            await batch.commit();
            console.log(`  ✅ Deleted ${studentsSnapshot.size} students.`);
        }

        // Delete quiz results
        console.log('\nDeleting quiz results...');
        const quizSnapshot = await db.collection('quizResults').get();
        if (quizSnapshot.empty) {
            console.log('  No quiz results found.');
        } else {
            // Delete in batches of 500 (Firestore limit)
            const chunkSize = 500;
            const chunks = [];

            for (let i = 0; i < quizSnapshot.docs.length; i += chunkSize) {
                chunks.push(quizSnapshot.docs.slice(i, i + chunkSize));
            }

            for (const chunk of chunks) {
                const batch = db.batch();
                chunk.forEach(doc => batch.delete(doc.ref));
                await batch.commit();
            }
            console.log(`  ✅ Deleted ${quizSnapshot.size} quiz results.`);
        }

        console.log('\n✨ Database cleanup completed successfully!\n');
    } catch (error) {
        console.error('❌ Error cleaning database:', error);
        process.exit(1);
    }
}

// Run the cleanup function
cleanupDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
