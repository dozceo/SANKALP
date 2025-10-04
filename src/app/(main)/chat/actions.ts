
"use server";

import { explainConcept } from "@/ai/flows/multilingual-cognitive-chatbot";
import { textToSpeech } from "@/ai/flows/text-to-speech";
import { speechToSpeech } from "@/ai/flows/speech-to-speech";

export async function getExplanation(concept: string, language: string) {
    try {
        const response = await explainConcept({
            concept,
            language,
            brainMapContext: "This concept is part of the introductory algebra syllabus, focusing on solving linear equations."
        });
        return response.explanation;
    } catch(e) {
        console.error(e);
        return "Sorry, I encountered an error while generating an explanation. Please try again."
    }
}

export async function getTextToSpeech(text: string) {
    try {
        const response = await textToSpeech(text);
        return response.audioDataUri;
    } catch(e) {
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
