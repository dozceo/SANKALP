/**
 * ML Bridge - Node.js to Python Inference
 * 
 * Spawns Python subprocess to run ML inference and returns predictions.
 * This allows the Next.js app to leverage Python ML models.
 */

import { spawn } from "child_process";
import path from "path";
import type {
    MasteryPredictionInput,
    MasteryPredictionOutput,
} from "./types";

const PYTHON_SCRIPT_PATH = path.join(
    process.cwd(),
    "src",
    "ml",
    "inference",
    "predict_mastery.py"
);

/**
 * Predict topic mastery using the trained ML model
 * 
 * @param features - Student features for a specific topic
 * @returns Mastery prediction with probability and confidence
 */
export async function predictMastery(
    features: MasteryPredictionInput
): Promise<MasteryPredictionOutput> {
    return new Promise((resolve, reject) => {
        // Spawn Python process
        const pythonProcess = spawn("python", [PYTHON_SCRIPT_PATH]);

        let outputData = "";
        let errorData = "";

        // Collect stdout
        pythonProcess.stdout.on("data", (data) => {
            outputData += data.toString();
        });

        // Collect stderr
        pythonProcess.stderr.on("data", (data) => {
            errorData += data.toString();
        });

        // Handle process completion
        pythonProcess.on("close", (code) => {
            if (code !== 0) {
                console.error("Python inference error:", errorData);
                reject(
                    new Error(`Python process exited with code ${code}: ${errorData}`)
                );
                return;
            }

            try {
                const result: MasteryPredictionOutput = JSON.parse(outputData);
                resolve(result);
            } catch (parseError) {
                reject(new Error(`Failed to parse Python output: ${outputData}`));
            }
        });

        // Send input to Python via stdin
        pythonProcess.stdin.write(JSON.stringify(features));
        pythonProcess.stdin.end();

        // Set timeout (prevent hanging)
        setTimeout(() => {
            pythonProcess.kill();
            reject(new Error("ML inference timeout after 5 seconds"));
        }, 5000);
    });
}

/**
 * Batch predict mastery for multiple topics
 * 
 * @param topicFeatures - Array of {topic, features} objects
 * @returns Array of predictions with topic names
 */
export async function batchPredictMastery(
    topicFeatures: Array<{ topic: string; features: MasteryPredictionInput }>
): Promise<Array<{ topic: string; prediction: MasteryPredictionOutput }>> {
    const predictions = await Promise.all(
        topicFeatures.map(async ({ topic, features }) => {
            try {
                const prediction = await predictMastery(features);
                return { topic, prediction };
            } catch (error) {
                console.error(`Failed to predict mastery for ${topic}:`, error);
                return {
                    topic,
                    prediction: {
                        mastery_probability: 0,
                        confidence: 0,
                        predicted_class: "error" as const,
                        error: error instanceof Error ? error.message : "Unknown error",
                    },
                };
            }
        })
    );

    return predictions;
}
