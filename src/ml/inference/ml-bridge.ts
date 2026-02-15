/**
 * ML Bridge - Node.js to Python Inference
 * 
 * Spawns a persistent Python subprocess to run ML inference.
 * Manages communication via stdin/stdout streams for high performance.
 */

import { spawn, ChildProcess } from "child_process";
import path from "path";
import * as readline from "readline";
import { randomUUID } from "crypto";
import type {
    MasteryPredictionInput,
    MasteryPredictionOutput,
} from "./types";

const PYTHON_SCRIPT_PATH = process.env.ML_PYTHON_SCRIPT || path.join(
    process.cwd(),
    "src",
    "ml",
    "inference",
    "predict_mastery.py"
);

interface PendingRequest {
    resolve: (value: MasteryPredictionOutput) => void;
    reject: (reason?: any) => void;
    timeout: NodeJS.Timeout;
}

class PythonBridge {
    private process: ChildProcess | null = null;
    private pendingRequests = new Map<string, PendingRequest>();
    private rl: readline.Interface | null = null;

    private getProcess(): ChildProcess {
        if (!this.process || this.process.killed) {
            this.startProcess();
        }
        return this.process!;
    }

    private startProcess() {
        // Spawn Python process
        this.process = spawn("python", [PYTHON_SCRIPT_PATH]);

        // Setup Readline interface for stdout
        if (this.process.stdout) {
            this.rl = readline.createInterface({
                input: this.process.stdout,
                terminal: false
            });

            this.rl.on("line", (line) => this.handleLine(line));
        }

        // Handle stderr
        this.process.stderr?.on("data", (data) => {
             const msg = data.toString();
             // Filter out common harmless warnings if needed, or log everything
             if (msg.includes("UserWarning") && msg.includes("feature names")) return;
             console.error("Python inference stderr:", msg);
        });

        // Handle process exit
        this.process.on("close", (code) => {
            if (code !== 0 && code !== null) {
                console.warn(`Python process closed with code ${code}`);
            }
            this.cleanup(new Error(`Python process exited with code ${code}`));
        });

        this.process.on("error", (err) => {
            console.error("Python process error:", err);
            this.cleanup(err);
        });
    }

    private cleanup(error: Error) {
        this.process = null;
        if (this.rl) {
            this.rl.close();
            this.rl = null;
        }

        // Reject all pending requests
        for (const [id, req] of this.pendingRequests) {
            clearTimeout(req.timeout);
            req.reject(error);
        }
        this.pendingRequests.clear();
    }

    private handleLine(line: string) {
        if (!line.trim()) return;

        try {
            const data = JSON.parse(line);
            const id = data._id;

            if (id && this.pendingRequests.has(id)) {
                const req = this.pendingRequests.get(id)!;
                this.pendingRequests.delete(id);
                clearTimeout(req.timeout);

                // Clean up internal ID from result
                delete data._id;

                if (data.error) {
                    req.resolve({
                        mastery_probability: 0,
                        confidence: 0,
                        predicted_class: "error",
                        error: data.error
                    });
                } else {
                    req.resolve(data as MasteryPredictionOutput);
                }
            }
        } catch (e) {
            console.error("Error parsing Python output:", line, e);
            // If the output is not valid JSON, it's a critical protocol error.
            // Kill the process to fail fast and reset the state.
            this.process?.kill();
        }
    }

    public predict(features: MasteryPredictionInput): Promise<MasteryPredictionOutput> {
        return new Promise((resolve, reject) => {
            const id = randomUUID();
            let proc: ChildProcess;

            try {
                proc = this.getProcess();
            } catch (e) {
                return reject(e);
            }

            const payload = { ...features, _id: id };

            const timeout = setTimeout(() => {
                if (this.pendingRequests.has(id)) {
                    this.pendingRequests.delete(id);
                    reject(new Error("Timeout waiting for Python inference"));
                }
            }, 5000);

            this.pendingRequests.set(id, { resolve, reject, timeout });

            try {
                const success = proc.stdin?.write(JSON.stringify(payload) + "\n");
                if (success === false) {
                    // Backpressure handling could go here, but for now we just rely on buffering
                }
            } catch (e) {
                this.pendingRequests.delete(id);
                clearTimeout(timeout);
                reject(e);
            }
        });
    }
}

// Singleton instance
const bridge = new PythonBridge();

const API_URL = process.env.ML_API_URL || "http://localhost:8000/predict/mastery";

/**
 * Predict topic mastery using the trained ML model
 *
 * @param features - Student features for a specific topic
 * @returns Mastery prediction with probability and confidence
 */
export async function predictMastery(
    features: MasteryPredictionInput
): Promise<MasteryPredictionOutput> {
    // Optimization: Try to call the API first (persistent server is much faster)
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000); // 1s timeout for API

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(features),
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
            return (await response.json()) as MasteryPredictionOutput;
        }
    } catch (error) {
        // API not available or timeout, fall back to subprocess
    }

    return bridge.predict(features);
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
    if (topicFeatures.length === 0) {
        return [];
    }

    // Optimization: Use the persistent bridge for all predictions in parallel
    // This avoids spawning a new Python process for every batch request
    const promises = topicFeatures.map(async ({ topic, features }) => {
        try {
            const prediction = await bridge.predict(features);
            return { topic, prediction };
        } catch (error) {
            console.error(`Prediction failed for topic ${topic}:`, error);
            return {
                topic,
                prediction: {
                    mastery_probability: 0,
                    confidence: 0,
                    predicted_class: "error" as const,
                    error: error instanceof Error ? error.message : String(error),
                },
            };
        }
    });

    return Promise.all(promises);
}
