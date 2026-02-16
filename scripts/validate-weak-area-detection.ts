
import { extractMasteryFeatures, StudentHistory, RawQuizResult } from "../src/ml/features/student_features";
import { predictMastery } from "../src/ml/inference/ml-bridge";
import fs from "fs";
import path from "path";

async function main() {
    console.log("Starting Weak Area Detection Validation...");

    const weakAreaScores = [0.2, 0.3, 0.2, 0.4, 0.2];
    const randomErrorScores = [0.9, 0.9, 0.8, 0.9, 0.2];

    const weakAreaHistory = generateQuizHistory(weakAreaScores);
    const randomErrorHistory = generateQuizHistory(randomErrorScores);

    console.log("Extracting features for Weak Area Scenario...");
    const weakAreaFeatures = extractMasteryFeatures("topic_math", weakAreaHistory);
    console.log("Weak Area Features:", JSON.stringify(weakAreaFeatures, null, 2));

    console.log("Extracting features for Random Error Scenario...");
    const randomErrorFeatures = extractMasteryFeatures("topic_math", randomErrorHistory);
    console.log("Random Error Features:", JSON.stringify(randomErrorFeatures, null, 2));

    console.log("Predicting Mastery for Weak Area...");
    const weakAreaPrediction = await predictMastery(weakAreaFeatures);
    console.log("Weak Area Prediction:", JSON.stringify(weakAreaPrediction, null, 2));

    console.log("Predicting Mastery for Random Error...");
    const randomErrorPrediction = await predictMastery(randomErrorFeatures);
    console.log("Random Error Prediction:", JSON.stringify(randomErrorPrediction, null, 2));

    // Validation Logic
    const isWeakAreaDetected = weakAreaPrediction.mastery_probability < 0.45;
    const isRandomErrorResilient = randomErrorPrediction.mastery_probability > 0.55;

    let report = `# Weak Area Detection Algorithm Validation

**Date:** ${new Date().toISOString()}

## Scenarios

### 1. True Weak Area
*   **Input Scores:** ${JSON.stringify(weakAreaScores)}
*   **Extracted Features:**
    \`\`\`json
    ${JSON.stringify(weakAreaFeatures, null, 2)}
    \`\`\`
*   **Prediction:**
    *   Mastery Probability: ${weakAreaPrediction.mastery_probability}
    *   Confidence: ${weakAreaPrediction.confidence}
    *   Class: ${weakAreaPrediction.predicted_class}
*   **Result:** ${isWeakAreaDetected ? "PASS (Correctly identified as weak)" : "FAIL (Failed to identify as weak)"}

### 2. Random Error (Resilience Test)
*   **Input Scores:** ${JSON.stringify(randomErrorScores)}
*   **Extracted Features:**
    \`\`\`json
    ${JSON.stringify(randomErrorFeatures, null, 2)}
    \`\`\`
*   **Prediction:**
    *   Mastery Probability: ${randomErrorPrediction.mastery_probability}
    *   Confidence: ${randomErrorPrediction.confidence}
    *   Class: ${randomErrorPrediction.predicted_class}
*   **Result:** ${isRandomErrorResilient ? "PASS (Correctly identified as mastered despite error)" : "FAIL (Incorrectly flagged as weak)"}

## Summary
*   **Weak Area Detection:** ${isWeakAreaDetected ? "✅ PASS" : "❌ FAIL"}
*   **Random Error Resilience:** ${isRandomErrorResilient ? "✅ PASS" : "❌ FAIL"}
`;

    fs.writeFileSync("WEAK_AREA_DETECTION_REPORT.md", report);
    console.log("Report generated: WEAK_AREA_DETECTION_REPORT.md");
    process.exit(0);
}

function generateQuizHistory(scores: number[]): StudentHistory {
    const now = Date.now();
    const quizResults: RawQuizResult[] = scores.map((score, index) => {
        // Distribute quizzes over the last 10 days
        const daysAgo = scores.length - 1 - index;
        return {
            topic: "topic_math",
            score: score,
            timestamp: new Date(now - daysAgo * 24 * 60 * 60 * 1000),
            timeSpent: 60, // 1 minute per quiz
            questionsAttempted: 10
        };
    });

    return {
        quizResults,
        lastLoginDate: new Date(),
        registrationDate: new Date(now - 30 * 24 * 60 * 60 * 1000)
    };
}

main().catch(err => {
    console.error("Error running validation:", err);
    process.exit(1);
});
