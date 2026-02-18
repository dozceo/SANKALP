import { predictMastery } from "../src/ml/inference/ml-bridge";
import { makeRevisionDecision } from "../src/ai/adk/decision-engine";
import type { MasteryPredictionInput } from "../src/ml/inference/types";
import type { DecisionContext, MLSignals } from "../src/ai/adk/types";

// Helper to measure execution time
async function measure(name: string, fn: () => Promise<void> | void): Promise<number> {
    const start = performance.now();
    await fn();
    return performance.now() - start;
}

// Calculate percentiles
function getPercentiles(times: number[]) {
    if (times.length === 0) return { p50: 0, p90: 0, p99: 0 };
    times.sort((a, b) => a - b);
    const p50 = times[Math.floor(times.length * 0.5)];
    const p90 = times[Math.floor(times.length * 0.9)];
    const p99 = times[Math.floor(times.length * 0.99)];
    return { p50, p90, p99 };
}

async function runBenchmarks() {
    console.log("Starting latency benchmarks...");

    // 1. ML Prediction Benchmark
    const mlTimes: number[] = [];
    const mockFeatures: MasteryPredictionInput = {
        avg_quiz_score: 0.75,
        attempts_per_topic: 5,
        days_since_last_revision: 10,
        quiz_score_variance: 0.1,
        time_spent_per_question: 45
    };

    console.log("Benchmarking ML Prediction (predictMastery)...");

    for (let i = 0; i < 5; i++) { // Reduced iterations
        try {
            console.log(`ML Iteration ${i+1}...`);
            const duration = await measure("ML Prediction", async () => {
                const result = await predictMastery(mockFeatures);
                if (result.predicted_class === 'error') {
                    throw new Error(result.error || 'Unknown error');
                }
            });
            mlTimes.push(duration);
            console.log(`ML Iteration ${i+1} done: ${duration.toFixed(2)}ms`);
        } catch (e) {
            console.error(`\nML Prediction failed at iter ${i+1}:`, e);
        }
    }
    console.log("\n");

    // 2. ADK Decision Benchmark
    const adkTimes: number[] = [];
    const mockContext: DecisionContext = {
        studentId: "student-123",
        topic: "Linear Algebra",
        currentDate: new Date(),
        daysUntilExam: 5,
        mlSignals: {
            mastery_probability: 0.45,
            confidence: 0.8,
            days_since_last_revision: 10,
            attempts_count: 5,
            attention_risk: "MEDIUM",
            performance_trend: "STABLE"
        }
    };

    console.log("Benchmarking ADK Decision...");
    for (let i = 0; i < 100; i++) {
        const duration = await measure("ADK Decision", () => {
             makeRevisionDecision(mockContext);
        });
        adkTimes.push(duration);
    }
    console.log("Done.\n");

    // 3. Simulated LLM Generation
    const llmTimes: number[] = [];
    console.log("Benchmarking LLM Generation (Simulated)...");
     for (let i = 0; i < 5; i++) { // Reduced iterations
        const duration = await measure("LLM Gen", async () => {
             await new Promise(r => setTimeout(r, 1500 + Math.random() * 500));
        });
        llmTimes.push(duration);
         process.stdout.write(".");
    }
    console.log("\n");

    // Report
    const mlStats = getPercentiles(mlTimes);
    const adkStats = getPercentiles(adkTimes);
    const llmStats = getPercentiles(llmTimes);

    console.log(`
| Operation | P50 (ms) | P90 (ms) | P99 (ms) |
| :--- | :--- | :--- | :--- |
| **ML Inference** | ${mlStats.p50.toFixed(2)} | ${mlStats.p90.toFixed(2)} | ${mlStats.p99.toFixed(2)} |
| **ADK Decision** | ${adkStats.p50.toFixed(4)} | ${adkStats.p90.toFixed(4)} | ${adkStats.p99.toFixed(4)} |
| **LLM Response (Sim)**| ${llmStats.p50.toFixed(0)} | ${llmStats.p90.toFixed(0)} | ${llmStats.p99.toFixed(0)} |
`);

    process.exit(0);
}

runBenchmarks().catch((e) => {
    console.error(e);
    process.exit(1);
});
