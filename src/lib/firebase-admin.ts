/**
 * Firebase Admin SDK Configuration (Server-Side Only)
 * 
 * This module initializes the Firebase Admin SDK for server-side operations.
 * Use this in API routes and server components for secure database access.
 * 
 * IMPORTANT: Never import this in client components!
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let adminApp: App | undefined;
let adminDb: Firestore | undefined;
let adminAuth: Auth | undefined;

/**
 * Initialize Firebase Admin SDK
 * 
 * For local development, uses environment variables.
 * For production (Vercel/Firebase), uses service account JSON.
 */
const initializeFirebaseAdmin = () => {
    // Check if already initialized
    if (getApps().length > 0) {
        adminApp = getApps()[0];
        adminDb = getFirestore(adminApp);
        adminAuth = getAuth(adminApp);
        return { app: adminApp, db: adminDb, auth: adminAuth };
    }

    try {
        // For production: Use service account JSON
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

            adminApp = initializeApp({
                credential: cert(serviceAccount),
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            });
        }
        // For development: Use project ID only (requires Firebase CLI auth)
        else if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
            adminApp = initializeApp({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            });
        } else {
            throw new Error('Missing Firebase Admin configuration');
        }

        adminDb = getFirestore(adminApp);
        adminAuth = getAuth(adminApp);

        console.log('✅ Firebase Admin SDK initialized');
        return { app: adminApp, db: adminDb, auth: adminAuth };
    } catch (error) {
        console.error('❌ Firebase Admin initialization failed:', error);
        throw error;
    }
};

// Initialize on module load
const firebaseAdmin = initializeFirebaseAdmin();

// Export services
export const db = firebaseAdmin.db;
export const auth = firebaseAdmin.auth;
export const app = firebaseAdmin.app;

export default firebaseAdmin;
