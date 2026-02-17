
import fs from "fs";

interface ChatbotInteraction {
    id: string;
    concept: string;
    context: string;
    output: string;
    expectedFact: string;
    type: "FACTUAL" | "HALLUCINATION";
}

const mockHistory: ChatbotInteraction[] = [
    {
        id: "1",
        concept: "Photosynthesis",
        context: "Biology: Plant processes",
        output: "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods from carbon dioxide and water. It generally involves the green pigment chlorophyll and generates oxygen as a byproduct.",
        expectedFact: "sunlight",
        type: "FACTUAL"
    },
    {
        id: "2",
        concept: "French Revolution",
        context: "History: European History",
        output: "The French Revolution was a period of radical political and societal change in France that began with the Estates General of 1789 and ended with the formation of the French Consulate in November 1799.",
        expectedFact: "1789",
        type: "FACTUAL"
    },
    {
        id: "3",
        concept: "Moon Landing",
        context: "History: Space Race",
        output: "The first manned moon landing took place on July 20, 1969, by the Apollo 11 mission. Neil Armstrong was the first person to walk on the moon.",
        expectedFact: "1969",
        type: "FACTUAL"
    },
    {
        id: "4",
        concept: "Water Molecule",
        context: "Chemistry: Molecules",
        output: "A water molecule is composed of two hydrogen atoms and one oxygen atom.",
        expectedFact: "two hydrogen",
        type: "FACTUAL"
    },
    {
        id: "5",
        concept: "Great Wall of China",
        context: "History: China",
        output: "The Great Wall of China was built solely during the Ming Dynasty and is visible from the moon with the naked eye.",
        expectedFact: "not visible", // The truth is it's NOT visible. The output claims it IS. So 'not visible' is missing.
        type: "HALLUCINATION"
    },
    {
        id: "6", // Specific hallucination example
        concept: "Pythagorean Theorem",
        context: "Math: Geometry",
        output: "The Pythagorean theorem states that a^2 + b^2 = c^3.", // Wrong formula
        expectedFact: "c^2", // Truth is c^2. Output has c^3.
        type: "HALLUCINATION"
    }
];

function auditHallucinations() {
    console.log("Starting Chatbot Hallucination Audit...");

    let report = `# Hallucination Detection Report

**Date:** ${new Date().toISOString()}

## Methodology
The audit checks chatbot outputs against a set of expected key facts (Ground Truth).
- **Pass:** Output contains the expected fact.
- **Fail (Potential Hallucination):** Output misses the expected fact or contains contradictory information.

## Findings

`;

    let passedCount = 0;
    let failedCount = 0;

    for (const interaction of mockHistory) {
        const { id, concept, output, expectedFact, type } = interaction;
        const isFactPresent = output.toLowerCase().includes(expectedFact.toLowerCase());

        // Validation Logic:
        // We want to verify that the system behaves correctly.
        // 1. If the content is FACTUAL, it SHOULD contain the expected fact.
        //    - If present: PASS (Valid Factual Response)
        //    - If missing: FAIL (False Negative - missed valid fact)
        // 2. If the content is HALLUCINATION, it SHOULD MISS the expected fact (because it's wrong).
        //    - If missing: DETECTED (System correctly flagged it as suspicious/wrong because it deviated from truth)
        //    - If present: MISSED (False Positive - System thought it was right but it was wrong? Or maybe the hallucination was subtle?)
        //      Actually, if the output contains the TRUTH, it's not a hallucination.
        //      But here 'type=HALLUCINATION' means "This output IS a hallucination".
        //      So we expect it NOT to match the truth.

        let status = "UNKNOWN";
        let detail = "";

        if (type === "FACTUAL") {
            if (isFactPresent) {
                status = "PASS";
                detail = "Correctly verified factual content.";
                passedCount++;
            } else {
                status = "FAIL";
                detail = "Failed to verify factual content (False Negative).";
                failedCount++;
            }
        } else {
            // HALLUCINATION
            if (!isFactPresent) {
                status = "DETECTED";
                detail = "System correctly flagged potential hallucination (missing/wrong fact).";
                passedCount++;
            } else {
                status = "MISSED";
                detail = "System failed to flag hallucination (False Positive).";
                failedCount++;
            }
        }

        report += `### Interaction ${id}: ${concept}
- **Context:** ${interaction.context}
- **Output:** "${output}"
- **Expected Fact (Truth):** "${expectedFact}"
- **Type:** ${type}
- **Is Fact Present?** ${isFactPresent}
- **Status:** **${status}**
- **Detail:** ${detail}
\n`;
    }

    report += `
## Summary
- **Total Interactions Audited:** ${mockHistory.length}
- **Successful Validations (True Positives + True Negatives):** ${passedCount}
- **Failed Validations:** ${failedCount}
- **Detection Accuracy:** ${Math.round((passedCount / mockHistory.length) * 100)}%
`;

    fs.writeFileSync("HALLUCINATION_DETECTION_REPORT.md", report);
    console.log("Report generated: HALLUCINATION_DETECTION_REPORT.md");
}

auditHallucinations();
