
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
            source: 'ai' as const,
            escalationRequired: response.escalationRequired,
            severityLevel: response.severityLevel,
        };
    } catch (e) {
        console.error('[MENTOR_ERROR] Flow execution failed:', {
            error: e instanceof Error ? e.message : 'Unknown error',
            stack: e instanceof Error ? e.stack : undefined,
            studentConcern
        });
        // Serve an empathetic randomized fallback
        return {
            content: getMentorFallback(),
            source: 'fallback' as const,
            escalationRequired: false,
            severityLevel: 'LOW' as const,
        };
    }
}
