'use server';

import { db } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

export async function saveChatbotConfiguration(
  studentId: string,
  personality: string,
  instructions: string
) {
  try {
    if (!studentId) {
      throw new Error('Student ID is required');
    }

    await db.collection('students').doc(studentId).update({
      chatbotPersonality: personality,
      chatbotInstructions: instructions,
    });

    revalidatePath(`/teacher/student/${studentId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error saving chatbot configuration:', error);
    return { success: false, error: error.message };
  }
}
