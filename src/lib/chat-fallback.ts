
/**
 * Provides empathetic and professional fallback responses for the Mindful Mentor and Chatbot.
 */

export const MENTOR_FALLBACKS = [
    "I hear you, and I want you to know that it's completely normal to feel this way. Take a deep breath—we can work through this together.",
    "That sounds like a lot to handle. Remember that progress isn't always linear. What's one small thing you can do for yourself right now?",
    "I'm here for you. Sometimes just acknowledging how we feel is the first step toward feeling better. Tell me more about what's on your mind.",
    "It's okay to feel overwhelmed. Your well-being is just as important as your grades. Let's focus on one step at a time.",
    "I'm listening. You've handled tough situations before, and you have the strength to get through this one too."
];

export function getMentorFallback(): string {
    const index = Math.floor(Math.random() * MENTOR_FALLBACKS.length);
    return MENTOR_FALLBACKS[index];
}

export function getChatbotFallback(concept: string, language: string): string {
    const fallbacks: Record<string, string> = {
        "English": `I'm currently having a bit of trouble connecting to my full knowledge base, but "${concept}" is a very interesting topic. Could you try asking me about it again in a moment?`,
        "Hindi": `क्षमा करें, मुझे अभी जानकारी प्राप्त करने में थोड़ी समस्या हो रही है। क्या आप थोड़ी देर बाद "${concept}" के बारे में फिर से पूछ सकते हैं?`,
        "Spanish": `Lo siento, tengo problemas para conectarme en este momento. ¿Podrías preguntar sobre "${concept}" de nuevo en un momento?`,
        "French": `Désolé, j'ai du mal à me connecter pour le moment. Pourriez-vous me redemander à propos de "${concept}" dans un instant ?`
    };

    return fallbacks[language] || fallbacks["English"];
}
