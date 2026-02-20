
"use server";

import { explainConcept } from "@/ai/flows/multilingual-cognitive-chatbot";
import { textToSpeech } from "@/ai/flows/text-to-speech";
import { speechToSpeech } from "@/ai/flows/speech-to-speech";
import { getChatbotFallback } from "@/lib/chat-fallback";

export async function getExplanation(concept: string, language: string) {
    // Truncation guard — keep prompts lean and prevent overflow
    const MAX_CONCEPT_CHARS = 2000;
    const safeConcept = concept.length > MAX_CONCEPT_CHARS
        ? concept.slice(0, MAX_CONCEPT_CHARS) + "..."
        : concept;

    try {
        const response = await explainConcept({
            concept: safeConcept,
            language,
            brainMapContext: "This concept is part of the introductory algebra syllabus, focusing on solving linear equations."
        });

        if (!response || !response.explanation) {
            throw new Error("Empty explanation returned from AI");
        }

        return {
            content: response.explanation,
            source: 'ai'
        };
    } catch (e) {
        console.error('[CHATBOT_ERROR] Flow execution failed:', {
            error: e instanceof Error ? e.message : 'Unknown error',
            stack: e instanceof Error ? e.stack : undefined,
            concept,
            language
        });
        // Serve a high-quality language-aware fallback
        return {
            content: getChatbotFallback(concept, language),
            source: 'fallback'
        };
    }
}

export async function getTextToSpeech(text: string) {
    try {
        const response = await textToSpeech(text);
        return response.audioDataUri;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function audioConversation(audioDataUri: string) {
    try {
        return await speechToSpeech(audioDataUri);
    } catch (e) {
        console.error("Error in audio conversation action:", e);
        return null;
    }
}
