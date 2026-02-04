
"use server";

import { getMotivationalCounseling } from "@/ai/flows/mindful-mentor";
import { getMentorFallback } from "@/lib/chat-fallback";

export async function getMotivationalAdvice(studentConcern: string) {
    try {
        const response = await getMotivationalCounseling({
            studentConcern,
            studentHistory: "The student has been feeling overwhelmed with their chemistry coursework and has an upcoming exam."
        });

        if (!response || !response.advice) {
            throw new Error("Empty advice returned from AI");
        }

        return {
            content: response.advice,
            source: 'ai'
        };
    } catch(e) {
        console.error("[MentorAction] AI counseling failed:", e);
        // Serve an empathetic randomized fallback
        return {
            content: getMentorFallback(),
            source: 'fallback'
        };
    }
}
