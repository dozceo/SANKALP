"use server";

import { syllabusGenerator } from "@/ai/flows/syllabus-generator";
import { unstable_cache } from "next/cache";

// Cache the syllabus generator result for improved performance
// Cache key depends on the query argument automatically
const getCachedSyllabus = unstable_cache(
    async (query: string) => {
        return await syllabusGenerator({ query });
    },
    ['syllabus-generator'],
    {
        revalidate: 86400, // 24 hours
        tags: ['syllabus']
    }
);

export async function getSyllabus(query: string) {
    try {
        return await getCachedSyllabus(query);
    } catch (error) {
        console.error("Error fetching syllabus:", error);
        return null;
    }
}
