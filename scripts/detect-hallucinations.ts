
// Mock Knowledge Base (Trusted Educational Source)
const KNOWLEDGE_BASE: Record<string, string> = {
    "capital of france": "Paris",
    "photosynthesis output": "Oxygen and Glucose",
    "photosynthesis input": "Carbon Dioxide and Water",
    "mitochondria function": "Powerhouse of the cell",
    "speed of light": "299,792,458 m/s",
    "pythagorean theorem": "a^2 + b^2 = c^2"
};

interface ChatResponse {
    id: string;
    prompt: string;
    response: string;
    timestamp: Date;
}

// Synthetic "Historical" Responses
const historicalResponses: ChatResponse[] = [
    {
        id: "msg-001",
        prompt: "What is the capital of France?",
        response: "The capital of France is Paris.",
        timestamp: new Date('2023-10-01T10:00:00Z')
    },
    {
        id: "msg-002",
        prompt: "What does photosynthesis produce?",
        response: "Photosynthesis produces Oxygen and Glucose.",
        timestamp: new Date('2023-10-01T10:05:00Z')
    },
    {
        id: "msg-003", // HALLUCINATION
        prompt: "What is the capital of France?",
        response: "The capital of France is Berlin.",
        timestamp: new Date('2023-10-02T09:00:00Z')
    },
    {
        id: "msg-004", // INACCURACY
        prompt: "What does photosynthesis produce?",
        response: "Photosynthesis produces Carbon Dioxide.",
        timestamp: new Date('2023-10-02T09:15:00Z')
    },
    {
        id: "msg-005",
        prompt: "What is the function of mitochondria?",
        response: "Mitochondria is often called the powerhouse of the cell.",
        timestamp: new Date('2023-10-03T14:20:00Z')
    }
];

// Simple Fact-Checking Logic (Mock Implementation of an LLM-based checker)
function checkFact(prompt: string, response: string): { isHallucination: boolean; reason?: string } {
    const promptLower = prompt.toLowerCase();
    const responseLower = response.toLowerCase();

    // Check against Knowledge Base
    if (promptLower.includes("capital of france")) {
        const expected = KNOWLEDGE_BASE["capital of france"].toLowerCase();
        if (!responseLower.includes(expected)) {
            return { isHallucination: true, reason: `Expected "${expected}" in response, but found inconsistent info.` };
        }
    }

    if (promptLower.includes("photosynthesis produce")) {
        // Simple check: Response should mention Oxygen
        if (!responseLower.includes("oxygen") && responseLower.includes("carbon dioxide")) {
             return { isHallucination: true, reason: `Expected output "Oxygen", but response claims "Carbon Dioxide" (which is an input).` };
        }
    }

    return { isHallucination: false };
}

console.log("Starting Hallucination Detection on Historical Responses...\n");

let detectedCount = 0;
const report: any[] = [];

for (const msg of historicalResponses) {
    console.log(`Analyzing Message ID: ${msg.id}`);
    console.log(`Prompt: "${msg.prompt}"`);
    console.log(`Response: "${msg.response}"`);

    const result = checkFact(msg.prompt, msg.response);

    if (result.isHallucination) {
        console.warn(`[ALERT] Hallucination Detected! Reason: ${result.reason}`);
        detectedCount++;
        report.push({
            id: msg.id,
            prompt: msg.prompt,
            response: msg.response,
            issue: result.reason
        });
    } else {
        console.log(`[OK] Response verified.`);
    }
    console.log("-".repeat(40));
}

console.log(`\nAnalysis Complete.`);
console.log(`Total Responses Analyzed: ${historicalResponses.length}`);
console.log(`Hallucinations Detected: ${detectedCount}`);

if (detectedCount > 0) {
    console.log("\nSummary of Issues:");
    report.forEach(r => {
        console.log(`- ID ${r.id}: ${r.issue}`);
    });
}
