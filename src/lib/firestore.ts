/**
 * Firebase Firestore Helper Functions
 * 
 * Provides convenient helper functions for common Firestore operations.
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    QueryConstraint,
    DocumentData,
    CollectionReference,
    DocumentReference,
    addDoc,
    onSnapshot,
    Unsubscribe,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// Generic type for Firestore documents with ID
export type FirestoreDocument<T = DocumentData> = T & {
    id: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
};

// Get a document by ID
export const getDocument = async <T = DocumentData>(
    collectionName: string,
    documentId: string
): Promise<FirestoreDocument<T> | null> => {
    if (!db) {
        throw new Error('Firestore is not initialized. This function must be called in the browser.');
    }
    try {
        const docRef = doc(db, collectionName, documentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data(),
            } as FirestoreDocument<T>;
        }

        return null;
    } catch (error: any) {
        console.error('Error getting document:', error.message);
        throw error;
    }
};

// Get all documents from a collection
export const getDocuments = async <T = DocumentData>(
    collectionName: string,
    ...queryConstraints: QueryConstraint[]
): Promise<FirestoreDocument<T>[]> => {
    if (!db) {
        throw new Error('Firestore is not initialized. This function must be called in the browser.');
    }
    try {
        const collectionRef = collection(db, collectionName);
        const q = queryConstraints.length > 0
            ? query(collectionRef, ...queryConstraints)
            : collectionRef;

        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as FirestoreDocument<T>[];
    } catch (error: any) {
        console.error('Error getting documents:', error.message);
        throw error;
    }
};

// Create a new document with auto-generated ID
export const createDocument = async <T = DocumentData>(
    collectionName: string,
    data: T
): Promise<string> => {
    try {
        if (!db) {
            throw new Error('Firestore is not initialized. This function must be called in the browser.');
        }
        const collectionRef = collection(db, collectionName);
        const dataWithTimestamp = {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(collectionRef, dataWithTimestamp);
        return docRef.id;
    } catch (error: any) {
        console.error('Error creating document:', error.message);
        throw error;
    }
};

// Set a document with a specific ID (creates or overwrites)
export const setDocument = async <T = DocumentData>(
    collectionName: string,
    documentId: string,
    data: T,
    merge: boolean = false
): Promise<void> => {
    if (!db) {
        throw new Error('Firestore is not initialized. This function must be called in the browser.');
    }
    try {
        const docRef = doc(db, collectionName, documentId);
        const dataWithTimestamp = {
            ...data,
            updatedAt: serverTimestamp(),
            ...(merge ? {} : { createdAt: serverTimestamp() }),
        };

        await setDoc(docRef, dataWithTimestamp, { merge });
    } catch (error: any) {
        console.error('Error setting document:', error.message);
        throw error;
    }
};

// Update a document
export const updateDocument = async <T = Partial<DocumentData>>(
    collectionName: string,
    documentId: string,
    data: T
): Promise<void> => {
    if (!db) {
        throw new Error('Firestore is not initialized. This function must be called in the browser.');
    }
    try {
        const docRef = doc(db, collectionName, documentId);
        const dataWithTimestamp = {
            ...data,
            updatedAt: serverTimestamp(),
        };

        await updateDoc(docRef, dataWithTimestamp);
    } catch (error: any) {
        console.error('Error updating document:', error.message);
        throw error;
    }
};

// Delete a document
export const deleteDocument = async (
    collectionName: string,
    documentId: string
): Promise<void> => {
    if (!db) {
        throw new Error('Firestore is not initialized. This function must be called in the browser.');
    }
    try {
        const docRef = doc(db, collectionName, documentId);
        await deleteDoc(docRef);
    } catch (error: any) {
        console.error('Error deleting document:', error.message);
        throw error;
    }
};

// Subscribe to real-time updates for a document
export const subscribeToDocument = <T = DocumentData>(
    collectionName: string,
    documentId: string,
    callback: (data: FirestoreDocument<T> | null) => void
): Unsubscribe => {
    if (!db) {
        throw new Error('Firestore is not initialized. This function must be called in the browser.');
    }
    const docRef = doc(db, collectionName, documentId);

    return onSnapshot(
        docRef,
        (docSnap) => {
            if (docSnap.exists()) {
                callback({
                    id: docSnap.id,
                    ...docSnap.data(),
                } as FirestoreDocument<T>);
            } else {
                callback(null);
            }
        },
        (error) => {
            console.error('Error in document subscription:', error.message);
        }
    );
};

// Subscribe to real-time updates for a collection
export const subscribeToCollection = <T = DocumentData>(
    collectionName: string,
    callback: (data: FirestoreDocument<T>[]) => void,
    ...queryConstraints: QueryConstraint[]
): Unsubscribe => {
    if (!db) {
        throw new Error('Firestore is not initialized. This function must be called in the browser.');
    }
    const collectionRef = collection(db, collectionName);
    const q = queryConstraints.length > 0
        ? query(collectionRef, ...queryConstraints)
        : collectionRef;

    return onSnapshot(
        q,
        (querySnapshot) => {
            const documents = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as FirestoreDocument<T>[];
            callback(documents);
        },
        (error) => {
            console.error('Error in collection subscription:', error.message);
        }
    );
};

// Export Firestore query helpers for convenience
export { where, orderBy, limit, serverTimestamp };

// Export types
export type { Timestamp, QueryConstraint };
