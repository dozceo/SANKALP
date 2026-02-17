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
import { chaos } from '@/lib/chaos-config';
import { MockFirestore } from '@/lib/mock-db';

let adminApp: App | undefined;
let adminDb: Firestore | any | undefined;
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
        // For production: Use individual env vars (alternative to JSON)
        else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
            const serviceAccount = {
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            };

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

        // Use Mock DB if configured (e.g. for Chaos Tests)
        if (process.env.USE_MOCK_DB === 'true') {
            console.log('⚠️ Using In-Memory Mock Firestore');
            adminDb = new MockFirestore();
        } else {
            adminDb = getFirestore(adminApp);
        }

        adminAuth = getAuth(adminApp);

        console.log('✅ Firebase Admin SDK initialized');
        return { app: adminApp, db: adminDb, auth: adminAuth };
    } catch (error) {
        console.error('❌ Firebase Admin initialization failed:', error);
        // Fallback to mock if initialization failed but we need to run tests
        if (process.env.USE_MOCK_DB === 'true') {
             console.log('⚠️ Firebase Init Failed, Using In-Memory Mock Firestore');
             adminDb = new MockFirestore();
             return { app: adminApp, db: adminDb, auth: adminAuth };
        }
        throw error;
    }
};

// Initialize on module load
const firebaseAdmin = initializeFirebaseAdmin();

// Chaos Proxy for Firestore
function createChaosFirestore(realDb: Firestore | any): Firestore {
    const handler: ProxyHandler<any> = {
        get(target, prop, receiver) {
            const value = Reflect.get(target, prop, receiver);

            // If it's a function, we might need to wrap it
            if (typeof value === 'function') {
                const funcName = String(prop);

                // Read operations
                if (funcName === 'get') {
                    return async (...args: any[]) => {
                        await chaos.checkChaos('firestoreRead');
                        return value.apply(target, args);
                    };
                }

                // Write operations
                if (['set', 'update', 'delete', 'create', 'add', 'runTransaction'].includes(funcName)) {
                    return async (...args: any[]) => {
                        await chaos.checkChaos('firestoreWrite');
                        return value.apply(target, args);
                    };
                }

                // Batch/Transaction commit
                if (funcName === 'commit') {
                    return async (...args: any[]) => {
                         await chaos.checkChaos('firestoreWrite');
                         return value.apply(target, args);
                    }
                }

                // Chaining methods - return a proxy of the result
                // We need to be careful not to wrap things that aren't Firestore objects
                // A heuristic: if it returns an object with 'firestore' property or is a Query/Collection/Doc
                if (['collection', 'doc', 'where', 'orderBy', 'limit', 'batch', 'query'].includes(funcName)) {
                    return (...args: any[]) => {
                        const result = value.apply(target, args);
                        if (result && typeof result === 'object') {
                            return new Proxy(result, handler);
                        }
                        return result;
                    };
                }
            }

            return value;
        }
    };

    return new Proxy(realDb, handler);
}

// Export services
export const db = (process.env.NODE_ENV === 'production' && !process.env.ENABLE_CHAOS)
    ? firebaseAdmin.db
    : createChaosFirestore(firebaseAdmin.db);

export const auth = firebaseAdmin.auth;
export const app = firebaseAdmin.app;

export default firebaseAdmin;
