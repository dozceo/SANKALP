
"use server";

import { syllabusGenerator } from "@/ai/flows/syllabus-generator";

export async function getSyllabus(query: string) {
    try {
        return await syllabusGenerator({ query });
    } catch (error) {
        console.error("Error fetching syllabus:", error);
        return null;
    }
}
