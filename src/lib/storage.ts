/**
 * Firebase Storage Helper Functions
 * 
 * Provides convenient helper functions for Firebase Storage operations.
 */

import {
    ref,
    uploadBytes,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
    listAll,
    StorageReference,
    UploadTaskSnapshot,
    UploadTask,
} from 'firebase/storage';
import { storage } from './firebase';

// Upload a file to Firebase Storage
export const uploadFile = async (
    path: string,
    file: File | Blob
): Promise<string> => {
    if (!storage) {
        throw new Error('Firebase Storage is not initialized. This function must be called in the browser.');
    }
    try {
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error: any) {
        console.error('Error uploading file:', error.message);
        throw error;
    }
};

// Upload a file with progress tracking
export const uploadFileWithProgress = (
    path: string,
    file: File | Blob,
    onProgress?: (progress: number) => void,
    onComplete?: (downloadURL: string) => void,
    onError?: (error: Error) => void
): UploadTask => {
    if (!storage) {
        throw new Error('Firebase Storage is not initialized. This function must be called in the browser.');
    }
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
        'state_changed',
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) {
                onProgress(progress);
            }
        },
        (error) => {
            console.error('Error uploading file:', error.message);
            if (onError) {
                onError(error);
            }
        },
        async () => {
            try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                if (onComplete) {
                    onComplete(downloadURL);
                }
            } catch (error: any) {
                console.error('Error getting download URL:', error.message);
                if (onError) {
                    onError(error);
                }
            }
        }
    );

    return uploadTask;
};

// Delete a file from Firebase Storage
export const deleteFile = async (path: string): Promise<void> => {
    try {
        const storageRef = ref(storage, path);
        await deleteObject(storageRef);
    } catch (error: any) {
        console.error('Error deleting file:', error.message);
        throw error;
    }
};

// Get download URL for a file
export const getFileURL = async (path: string): Promise<string> => {
    try {
        const storageRef = ref(storage, path);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    } catch (error: any) {
        console.error('Error getting file URL:', error.message);
        throw error;
    }
};

// List all files in a directory
export const listFiles = async (
    path: string
): Promise<{ name: string; fullPath: string; url: string }[]> => {
    try {
        const storageRef = ref(storage, path);
        const result = await listAll(storageRef);

        const filesWithURLs = await Promise.all(
            result.items.map(async (itemRef) => {
                const url = await getDownloadURL(itemRef);
                return {
                    name: itemRef.name,
                    fullPath: itemRef.fullPath,
                    url,
                };
            })
        );

        return filesWithURLs;
    } catch (error: any) {
        console.error('Error listing files:', error.message);
        throw error;
    }
};

// Helper function to generate a storage path for user uploads
export const getUserUploadPath = (
    userId: string,
    folder: string,
    fileName: string
): string => {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `users/${userId}/${folder}/${timestamp}_${sanitizedFileName}`;
};

// Helper function to upload user file with automatic path generation
export const uploadUserFile = async (
    userId: string,
    folder: string,
    file: File,
    onProgress?: (progress: number) => void
): Promise<{ url: string; path: string }> => {
    const path = getUserUploadPath(userId, folder, file.name);

    return new Promise((resolve, reject) => {
        uploadFileWithProgress(
            path,
            file,
            onProgress,
            (url) => resolve({ url, path }),
            reject
        );
    });
};

// Export storage reference creator for advanced usage
export const createStorageRef = (path: string): StorageReference => {
    return ref(storage, path);
};
