/**
 * Firebase Configuration and Initialization
 * 
 * This module initializes Firebase services and exports them for use throughout the application.
 * Services include: Authentication, Firestore, Storage, and Analytics.
 */

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
    getAuth,
    Auth,
    setPersistence,
    browserSessionPersistence
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAnalytics, Analytics } from "firebase/analytics";

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate Firebase configuration
const validateConfig = () => {
    const requiredKeys = [
        'apiKey',
        'authDomain',
        'projectId',
        'storageBucket',
        'messagingSenderId',
        'appId',
    ];

    const missingKeys = requiredKeys.filter(
        (key) => !firebaseConfig[key as keyof typeof firebaseConfig]
    );

    if (missingKeys.length > 0) {
        console.error(
            `Missing Firebase configuration keys: ${missingKeys.join(', ')}`
        );
        console.error('Please check your .env.local file and ensure all required Firebase environment variables are set.');
    }

    return missingKeys.length === 0;
};

// Initialize Firebase (singleton pattern)
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
let analytics: Analytics | null = null;

const initializeFirebase = () => {
    // Only initialize in browser environment
    if (typeof window === 'undefined') {
        console.log('⚠️ Firebase skipped (server-side rendering)');
        return { app: undefined, auth: undefined, db: undefined, storage: undefined, analytics: null };
    }

    // Check if Firebase is already initialized
    if (getApps().length === 0) {
        if (!validateConfig()) {
            throw new Error('Firebase configuration is incomplete. Check console for details.');
        }
        app = initializeApp(firebaseConfig);
        console.log('✅ Firebase initialized successfully');
    } else {
        app = getApps()[0];
    }

    // Initialize Firebase services
    auth = getAuth(app as FirebaseApp);

    /**
     * Session Isolation for Development
     *
     * In development mode, we use browserSessionPersistence to allow developers to
     * log in with different accounts (e.g., Student and Teacher) in different tabs
     * of the same browser. This prevents session coupling and role-switching issues.
     *
     * In production, we default to browserLocalPersistence (Firebase default)
     * to provide a smoother UX where users stay logged in across sessions.
     */
    if (process.env.NODE_ENV === 'development') {
        setPersistence(auth, browserSessionPersistence).catch((error) => {
            console.error('Failed to set Firebase auth persistence:', error);
        });
    }

    db = getFirestore(app as FirebaseApp);
    storage = getStorage(app as FirebaseApp);

    // Initialize Analytics only in production
    if (process.env.NODE_ENV === 'production') {
        try {
            analytics = getAnalytics(app as FirebaseApp);
            console.log('✅ Firebase Analytics initialized');
        } catch (error) {
            console.warn('Firebase Analytics initialization failed:', error);
        }
    }

    return { app, auth, db, storage, analytics };
};

// Initialize Firebase on module load (browser only)
const firebase = initializeFirebase();

// Export Firebase services
export { firebase };
export const {
    auth: firebaseAuth,
    db: firebaseDb,
    storage: firebaseStorage,
    analytics: firebaseAnalytics
} = firebase;

// Export individual services for convenience
export { auth, db, storage, analytics };

// Export app instance
export default app;
