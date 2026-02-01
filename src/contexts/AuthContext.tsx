'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User,
    Auth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
    user: User | null;
    role: 'student' | 'teacher' | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string, role: 'student' | 'teacher', additionalData?: any) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    loading: true,
    signIn: async () => { },
    signUp: async () => { },
    signInWithGoogle: async () => { },
    signOut: async () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<'student' | 'teacher' | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);

                // Fetch user role from Firestore
                try {
                    if (firebaseUser?.uid) {
                        const response = await fetch(`/api/users/${firebaseUser.uid}`);
                        if (response.ok) {
                            const userData = await response.json();
                            setRole(userData.role);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching user role:', error);
                }
            } else {
                setUser(null);
                setRole(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signIn = async (email: string, password: string) => {
        if (!auth) throw new Error('Auth not initialized'); // Added guard
        await signInWithEmailAndPassword(auth as Auth, email, password); // Cast auth to Auth
    };

    const signUp = async (
        email: string,
        password: string,
        name: string,
        userRole: 'student' | 'teacher',
        additionalData?: any
    ) => {
        if (!auth) throw new Error('Auth not initialized'); // Added guard
        const userCredential = await createUserWithEmailAndPassword(auth as Auth, email, password); // Cast auth to Auth

        // Create user document in Firestore
        await fetch('/api/users/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                uid: userCredential.user.uid,
                email,
                name,
                role: userRole,
            }),
        });

        // Create role-specific document
        if (userRole === 'student') {
            await fetch('/api/students/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: userCredential.user.uid,
                    name,
                    email,
                    grade: additionalData?.grade || '',
                    userId: userCredential.user.uid,
                }),
            });
        } else if (userRole === 'teacher') {
            await fetch('/api/teachers/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: userCredential.user.uid,
                    name,
                    email,
                    school: additionalData?.school || '',
                    subject: additionalData?.subject || '',
                }),
            });
        }

        setRole(userRole);
    };

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        setUser(null);
        setRole(null);
    };

    const value = {
        user,
        role,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
