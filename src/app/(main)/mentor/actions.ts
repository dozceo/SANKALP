
"use server";

import { getMotivationalCounseling } from "@/ai/flows/mindful-mentor";

export async function getMotivationalAdvice(studentConcern: string) {
    try {
        const response = await getMotivationalCounseling({
            studentConcern,
            studentHistory: "The student has been feeling overwhelmed with their chemistry coursework and has an upcoming exam."
        });
        return response.advice;
    } catch(e) {
        console.error(e);
        return "I'm sorry, I'm having a little trouble right now. Could you please try again in a moment?"
    }
}
