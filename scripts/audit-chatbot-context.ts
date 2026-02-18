
import * as fs from 'fs';
import { z } from 'zod'; // Using zod directly as genkit might need setup

const REPORT_FILE = process.env.REPORT_FILE || 'CHATBOT_CONTEXT_HEALTH_REPORT.md';

// Simulation Configuration
const MAX_CONTEXT_TOKENS = parseInt(process.env.MAX_CONTEXT_TOKENS || '8192', 10);
const AVG_CHARS_PER_TOKEN = parseInt(process.env.AVG_CHARS_PER_TOKEN || '4', 10);
const CRITICAL_THRESHOLD_PERCENT = 0.9; // 90% of max tokens

async function runAudit() {
    console.log(`[Audit] Starting Chatbot Context Audit (Limit: ${MAX_CONTEXT_TOKENS} tokens)...`);

    let report = `# Chatbot Context Window Health Report

## Executive Summary
This audit evaluates the conversational AI's handling of context windows, specifically focusing on the "Mindful Mentor" and "Cognitive Chatbot" flows.
The goal is to detect potential token overflow risks and verify session persistence strategies.

## Findings

### 1. Stateless Architecture (Cognitive Chatbot)
The \`Multilingual Cognitive Chatbot\` (\`src/ai/flows/multilingual-cognitive-chatbot.ts\`) and \`Custom Cognitive Chatbot\` (\`src/ai/flows/custom-cognitive-chatbot.ts\`) appear to be **stateless** at the AI flow level.
*   **Input Schema**: Accepts \`concept\` and \`brainMapContext\`.
*   **History Handling**: No explicit \`history\` or \`messages\` array is passed to the LLM.
*   **Implication**: The chatbot relies entirely on the client (UI) to provide context. If the client does not concatenate history into \`brainMapContext\`, the bot has **no memory** of previous turns.
*   **Risk**: Low risk of "overflow" in the traditional sense (since history isn't accumulating in the flow), but **high risk of conversational incoherence**.

### 2. Unbounded Input Field (Mindful Mentor)
The \`Mindful Mentor\` (\`src/ai/flows/mindful-mentor.ts\`) accepts a \`studentHistory\` string.
*   **Input Schema**: \`studentHistory: z.string()\`
*   **Mechanism**: This string is injected directly into the prompt: \`Relevant background: "{{{studentHistory}}}"\`.
*   **Overflow Simulation**:
`;

    // Simulation: Constructing a long history
    // Simulate growing history
    const simulatedHistorySteps = [10, 50, 100, 500, 1000]; // number of turns

    report += `\n| Turns | Est. Characters | Est. Tokens | Risk Level | Status |\n|---|---|---|---|---|\n`;

    let maxRiskLevel = 'LOW';
    let failed = false;

    for (const n of simulatedHistorySteps) {
        const historyStr = generateHistory(n);
        const chars = historyStr.length;
        const tokens = Math.ceil(chars / AVG_CHARS_PER_TOKEN);

        let risk = 'LOW';
        let status = 'SAFE';

        if (tokens > MAX_CONTEXT_TOKENS) {
            risk = '**CRITICAL**';
            status = 'OVERFLOW';
            maxRiskLevel = 'CRITICAL';
            failed = true;
        } else if (tokens > MAX_CONTEXT_TOKENS * CRITICAL_THRESHOLD_PERCENT) {
            risk = 'HIGH';
            status = 'WARNING';
            if (maxRiskLevel !== 'CRITICAL') maxRiskLevel = 'HIGH';
        }

        report += `| ${n} | ${chars} | ${tokens} | ${risk} | ${status} |\n`;
    }

    report += `
### 3. Missing Truncation Logic
Review of \`src/ai/flows/mindful-mentor.ts\` and other flows reveals **no explicit truncation logic**.
The \`studentHistory\` or \`brainMapContext\` is passed directly to the LLM prompt.
If the client application sends a very long history string (e.g., from a long-running session), the LLM call will eventually **fail** with a "context length exceeded" error from the provider (e.g., OpenAI, Gemini).

## Recommendations

1.  **Implement Sliding Window**:
    *   Limit the history passed to the most recent N turns (e.g., last 10) or last K tokens (e.g., 2000).
    *   Summarize older history into a concise "context" string.

2.  **Add Token Counting**:
    *   Before sending the request, calculate the token count of the prompt.
    *   If > limit, truncate the oldest messages.

3.  **State Management**:
    *   Move history management from Client-side (localStorage) to Server-side (Database) for better control and persistence.
    *   Currently, \`src/app/(main)/chat/page.tsx\` uses \`localStorage\`, which is fragile and local-only.

## Conclusion
The current implementation is vulnerable to context overflow in the \`Mindful Mentor\` flow if \`studentHistory\` grows unbounded. The \`Cognitive Chatbot\` is safe from overflow but likely suffers from lack of continuity due to statelessness.
`;

    fs.writeFileSync(REPORT_FILE, report);
    console.log(`[Audit] Report generated at ${REPORT_FILE}`);

    if (failed) {
        console.error(`[Audit] FAIL: Context overflow detected (Risk Level: ${maxRiskLevel})`);
        process.exit(1);
    } else {
        console.log(`[Audit] PASS: Context window health acceptable (Risk Level: ${maxRiskLevel})`);
        process.exit(0);
    }
}

function generateHistory(turns: number): string {
    let history = "";
    for (let i = 0; i < turns; i++) {
        history += `User: I am struggling with question ${i}.\nBot: Let's break it down. What part is confusing?\n`;
    }
    return history;
}

runAudit().catch((err) => {
    console.error(err);
    process.exit(2);
});
