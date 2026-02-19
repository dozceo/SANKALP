
import { writeFileSync } from 'fs';
import path from 'path';

// --- Configuration ---

interface ChatbotResponse {
    id: string;
    timestamp: string;
    topic: string; // Internal topic label for the checker
    question: string;
    response: string;
    source: "simulation" | "log";
}

interface FactCheckRule {
    requiredKeywords: string[];
    forbiddenKeywords: string[];
    minLength?: number;
}

const KNOWLEDGE_BASE: Record<string, FactCheckRule> = {
    "capital_france": {
        requiredKeywords: ["Paris"],
        forbiddenKeywords: ["London", "Berlin", "Madrid", "Rome"]
    },
    "photosynthesis": {
        requiredKeywords: ["sunlight", "light", "energy"],
        forbiddenKeywords: ["darkness", "moonlight"]
    },
    "water_boiling_point": {
        requiredKeywords: ["100", "Celsius", "212", "Fahrenheit"],
        forbiddenKeywords: ["0", "50", "frozen"]
    },
    "python_programming": {
        requiredKeywords: ["programming", "language", "code"],
        forbiddenKeywords: ["snake", "reptile", "zoo"] // Unless context is specific, but assuming educational context about coding
    }
};

// --- Simulated History ---

const HISTORY: ChatbotResponse[] = [
    {
        id: "msg_001",
        timestamp: "2025-05-20T10:00:00Z",
        topic: "capital_france",
        question: "What is the capital of France?",
        response: "The capital of France is Paris, a city known for its art and culture.",
        source: "simulation"
    },
    {
        id: "msg_002",
        timestamp: "2025-05-20T10:05:00Z",
        topic: "capital_france",
        question: "Capital of France?",
        response: "I believe the capital of France is London.", // Hallucination
        source: "simulation"
    },
    {
        id: "msg_003",
        timestamp: "2025-05-21T14:00:00Z",
        topic: "photosynthesis",
        question: "Explain photosynthesis.",
        response: "Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to create oxygen and energy in the form of sugar.",
        source: "simulation"
    },
    {
        id: "msg_004",
        timestamp: "2025-05-21T14:05:00Z",
        topic: "photosynthesis",
        question: "How do plants eat?",
        response: "Plants consume food through their roots from the soil, similar to how animals eat.", // Misconception/Hallucination (ignoring photosynthesis)
        source: "simulation"
    },
    {
        id: "msg_005",
        timestamp: "2025-05-22T09:00:00Z",
        topic: "water_boiling_point",
        question: "At what temperature does water boil?",
        response: "Water boils at 100 degrees Celsius at sea level.",
        source: "simulation"
    },
    {
        id: "msg_006",
        timestamp: "2025-05-22T09:10:00Z",
        topic: "water_boiling_point",
        question: "Boiling point of water?",
        response: "Water typically boils at around 50 degrees Celsius.", // Hallucination
        source: "simulation"
    }
];

// --- Analysis Logic ---

interface DetectionResult {
    id: string;
    question: string;
    response: string;
    isHallucination: boolean;
    reason?: string;
}

function checkResponse(entry: ChatbotResponse): DetectionResult {
    const rule = KNOWLEDGE_BASE[entry.topic];
    if (!rule) {
        return {
            id: entry.id,
            question: entry.question,
            response: entry.response,
            isHallucination: false,
            reason: "No fact-checking rule for this topic."
        };
    }

    const normalizedResponse = entry.response.toLowerCase();

    // Check required keywords
    // Use regex with word boundaries to avoid partial matches (e.g. "0" in "100")
    const hasRequired = rule.requiredKeywords.some(k => {
        const regex = new RegExp(`\\b${k.toLowerCase()}\\b`, 'i');
        return regex.test(normalizedResponse);
    });

    if (!hasRequired) {
        return {
            id: entry.id,
            question: entry.question,
            response: entry.response,
            isHallucination: true,
            reason: `Missing required keywords: ${rule.requiredKeywords.join(", ")}`
        };
    }

    // Check forbidden keywords
    const presentForbidden = rule.forbiddenKeywords.filter(k => {
        const regex = new RegExp(`\\b${k.toLowerCase()}\\b`, 'i');
        return regex.test(normalizedResponse);
    });

    if (presentForbidden.length > 0) {
        return {
            id: entry.id,
            question: entry.question,
            response: entry.response,
            isHallucination: true,
            reason: `Contains forbidden keywords: ${presentForbidden.join(", ")}`
        };
    }

    return {
        id: entry.id,
        question: entry.question,
        response: entry.response,
        isHallucination: false
    };
}

function runDetection() {
    console.log("Starting Hallucination Detection...");

    const results = HISTORY.map(checkResponse);
    const hallucinations = results.filter(r => r.isHallucination);

    let reportContent = "# Cognitive Chatbot Hallucination Detection Report\n\n";
    reportContent += `**Date:** ${new Date().toISOString()}\n`;
    reportContent += `**Total Analyzed:** ${results.length}\n`;
    reportContent += `**Detected Hallucinations:** ${hallucinations.length}\n\n`;

    reportContent += "## Detected Hallucinations\n\n";
    if (hallucinations.length === 0) {
        reportContent += "No hallucinations detected in the sample set.\n";
    } else {
        reportContent += "| ID | Question | Response | Reason |\n";
        reportContent += "|---|---|---|---|\n";
        hallucinations.forEach(h => {
            reportContent += `| ${h.id} | ${h.question} | ${h.response} | ${h.reason} |\n`;
        });
    }

    reportContent += "\n## Validated Responses (Sample)\n\n";
    const valid = results.filter(r => !r.isHallucination).slice(0, 5);
    reportContent += "| ID | Question | Response |\n";
    reportContent += "|---|---|---|\n";
    valid.forEach(v => {
        reportContent += `| ${v.id} | ${v.question} | ${v.response} |\n`;
    });

    reportContent += "\n## Methodology\n\n";
    reportContent += "This report was generated by analyzing a simulated history of chatbot interactions against a predefined Knowledge Base of fact-checking rules.\n";
    reportContent += "- **Rule-based Matching**: Responses are checked for mandatory keywords (e.g., 'Paris' for France Capital) and forbidden keywords (e.g., 'London').\n";
    reportContent += "- **Scope**: Covers basic factual queries (Capitals, Science definitions).\n";

    const reportPath = path.join(process.cwd(), 'reports', 'HALLUCINATION_DETECTION_REPORT.md');
    writeFileSync(reportPath, reportContent);
    console.log(`Report generated at ${reportPath}`);
}

runDetection();
