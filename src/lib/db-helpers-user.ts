import { db } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Create a new student document
 */
export async function createStudent(data: {
    id: string;
    userId: string;
    name: string;
    email: string;
    grade?: string;
    registrationDate?: Date;
    lastLoginDate?: Date;
}): Promise<void> {
    try {
        await db.collection('students').doc(data.id).set({
            id: data.id,
            userId: data.userId,
            email: data.email,
            name: data.name,
            grade: data.grade || '',
            registrationDate: data.registrationDate || FieldValue.serverTimestamp(),
            lastLoginDate: data.lastLoginDate || FieldValue.serverTimestamp(),
        });
    } catch (error) {
        console.error('Error creating student:', error);
        throw error;
    }
}

/**
 * Create a new teacher document
 */
export async function createTeacher(data: {
    id: string;
    userId: string;
    name: string;
    email: string;
    school?: string;
    subject?: string;
}): Promise<void> {
    try {
        await db.collection('teachers').doc(data.id).set({
            id: data.id,
            userId: data.userId,
            name: data.name,
            email: data.email,
            school: data.school || '',
            subject: data.subject || '',
        });
    } catch (error) {
        console.error('Error creating teacher:', error);
        throw error;
    }
}
