
"use server";

import { getMotivationalCounseling } from "@/ai/flows/mindful-mentor";
import { getMentorFallback } from "@/lib/chat-fallback";
import { db } from "@/lib/firebase-admin";

/**
 * Build a dynamic student history string from real Firestore data.
 * Falls back to a generic message if no data is available.
 */
async function buildStudentHistory(studentId?: string): Promise<string> {
    if (!studentId) {
        return "No specific student data available. Provide general academic support.";
    }

    try {
        const studentDoc = await db.collection("students").doc(studentId).get();

        if (!studentDoc.exists) {
            return `Student ID ${studentId} not found in the database. Provide general academic support.`;
        }

        const data = studentDoc.data()!;
        const parts: string[] = [];

        // Name
        if (data.name) {
            parts.push(`The student's name is ${data.name}.`);
        }

        // Mastery scores
        if (data.masteryScores && typeof data.masteryScores === "object") {
            const scores = Object.entries(data.masteryScores as Record<string, number>)
                .map(([subject, score]) => `${subject}: ${Math.round(score * 100)}%`)
                .join(", ");
            parts.push(`Current mastery scores: ${scores}.`);
        }

        // Strengths & weaknesses
        if (data.strengths?.length) {
            parts.push(`Strengths: ${data.strengths.join(", ")}.`);
        }
        if (data.weaknesses?.length) {
            parts.push(`Areas needing improvement: ${data.weaknesses.join(", ")}.`);
        }

        // Streak
        if (typeof data.streak === "number") {
            parts.push(`Current study streak: ${data.streak} day(s).`);
        }

        // Last active
        if (data.lastActive) {
            parts.push(`Last active: ${data.lastActive}.`);
        }

        return parts.length > 0
            ? parts.join(" ")
            : "Student record exists but has limited data. Provide general academic support.";
    } catch (error) {
        console.error("[MENTOR_ACTIONS] Error fetching student data:", error);
        return "Could not retrieve student data. Provide general academic support.";
    }
}

export async function getMotivationalAdvice(studentConcern: string, studentId?: string) {
    // Truncation guard — prevent context window overflow (Gemini 2.0 Flash: 1M tokens, but keep prompts lean)
    const MAX_CONCERN_CHARS = 2000;
    const MAX_HISTORY_CHARS = 3000;
    const safeConcern = studentConcern.length > MAX_CONCERN_CHARS
        ? studentConcern.slice(0, MAX_CONCERN_CHARS) + "..."
        : studentConcern;

    try {
        const rawHistory = await buildStudentHistory(studentId);
        const safeHistory = rawHistory.length > MAX_HISTORY_CHARS
            ? rawHistory.slice(0, MAX_HISTORY_CHARS) + "..."
            : rawHistory;

        const response = await getMotivationalCounseling({
            studentConcern: safeConcern,
            studentHistory: safeHistory,
        });

        if (!response || !response.advice) {
            throw new Error("Empty advice returned from AI");
        }

        return {
            content: response.advice,
            source: 'ai'
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
            source: 'fallback'
        };
    }
}
