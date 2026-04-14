/**
 * Firebase Authentication Helper Functions
 * 
 * Provides convenient helper functions and hooks for Firebase Authentication.
 */

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    sendPasswordResetEmail,
    updateProfile,
    User,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    UserCredential,
} from 'firebase/auth';
import { auth } from './firebase';
import { useEffect, useState } from 'react';

// Sign in with email and password
export const signInWithEmail = async (
    email: string,
    password: string
): Promise<UserCredential> => {
    if (!auth) {
        throw new Error('Firebase Auth is not initialized. This function must be called in the browser.');
    }
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential;
    } catch (error: any) {
        console.error('Error signing in:', error.message);
        throw error;
    }
};

// Sign up with email and password
export const signUpWithEmail = async (
    email: string,
    password: string,
    displayName?: string
): Promise<UserCredential> => {
    if (!auth) {
        throw new Error('Firebase Auth is not initialized. This function must be called in the browser.');
    }
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Update display name if provided
        if (displayName && userCredential.user) {
            await updateProfile(userCredential.user, { displayName });
        }

        return userCredential;
    } catch (error: any) {
        console.error('Error signing up:', error.message);
        throw error;
    }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<UserCredential> => {
    if (!auth) {
        throw new Error('Firebase Auth is not initialized. This function must be called in the browser.');
    }
    try {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        return userCredential;
    } catch (error: any) {
        console.error('Error signing in with Google:', error.message);
        throw error;
    }
};

// Sign out
export const signOut = async (): Promise<void> => {
    if (!auth) {
        throw new Error('Firebase Auth is not initialized. This function must be called in the browser.');
    }
    try {
        await firebaseSignOut(auth);
    } catch (error: any) {
        console.error('Error signing out:', error.message);
        throw error;
    }
};

// Send password reset email
export const resetPassword = async (email: string): Promise<void> => {
    if (!auth) {
        throw new Error('Firebase Auth is not initialized. This function must be called in the browser.');
    }
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
        console.error('Error sending password reset email:', error.message);
        throw error;
    }
};

// Update user profile
export const updateUserProfile = async (
    user: User,
    profile: { displayName?: string; photoURL?: string }
): Promise<void> => {
    try {
        await updateProfile(user, profile);
    } catch (error: any) {
        console.error('Error updating profile:', error.message);
        throw error;
    }
};

// Custom hook to get current user
export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!auth) {
            setError(new Error('Firebase Auth is not initialized'));
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(
            auth,
            (currentUser) => {
                setUser(currentUser);
                setLoading(false);
            },
            (err) => {
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return { user, loading, error };
};

// Get current user (sync)
export const getCurrentUser = (): User | null => {
    return auth?.currentUser || null;
};
