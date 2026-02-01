"use server";

import { updateStudentChatbotConfig, getStudent } from "@/lib/db-helpers";
import { revalidatePath } from "next/cache";

export async function saveChatbotConfigAction(
  studentId: string,
  personality: string,
  instructions: string
) {
  try {
    await updateStudentChatbotConfig(studentId, {
      personality,
      instructions,
    });

    // Revalidate the student page to reflect changes
    revalidatePath(`/teacher/student/${studentId}`);

    return { success: true };
  } catch (error) {
    console.error("Error saving chatbot configuration:", error);
    return { success: false, error: "Failed to save configuration" };
  }
}

export async function getChatbotConfigAction(studentId: string) {
  try {
    const student = await getStudent(studentId);
    if (!student) {
      // If student doesn't exist in DB (static only), we return nulls so UI can use defaults
      return {
        success: true,
        data: {
          personality: undefined,
          instructions: undefined,
        }
      };
    }

    return {
      success: true,
      data: {
        personality: student.chatbotPersonality,
        instructions: student.customInstructions,
      },
    };
  } catch (error) {
    console.error("Error fetching chatbot configuration:", error);
    return { success: false, error: "Failed to fetch configuration" };
  }
}
