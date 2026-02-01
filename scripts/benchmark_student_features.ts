import { extractMasteryFeatures, StudentHistory, RawQuizResult } from '../src/ml/features/student_features';
import { performance } from 'perf_hooks';

function generateHistory(numQuizzes: number, topic: string): StudentHistory {
    const quizResults: RawQuizResult[] = [];
    const now = Date.now();
    for (let i = 0; i < numQuizzes; i++) {
        quizResults.push({
            topic: topic,
            score: Math.random(),
            timestamp: new Date(now - Math.floor(Math.random() * 1000000000)),
            timeSpent: Math.floor(Math.random() * 300),
            questionsAttempted: 10
        });
    }
    // Add some noise (other topics)
    for (let i = 0; i < numQuizzes / 10; i++) {
        quizResults.push({
            topic: 'other_topic',
            score: Math.random(),
            timestamp: new Date(now - Math.floor(Math.random() * 1000000000)),
            timeSpent: Math.floor(Math.random() * 300),
            questionsAttempted: 10
        });
    }

    return {
        quizResults,
        lastLoginDate: new Date(),
        registrationDate: new Date()
    };
}

function runBenchmark() {
    const topic = 'benchmark_topic';
    const numQuizzes = 100000;
    console.log(`Generating history with ${numQuizzes} quizzes...`);
    const history = generateHistory(numQuizzes, topic);

    console.log('Starting benchmark...');
    const iterations = 100;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
        extractMasteryFeatures(topic, history);
    }

    const end = performance.now();
    const duration = end - start;
    const avg = duration / iterations;

    console.log(`Total time for ${iterations} iterations: ${duration.toFixed(2)}ms`);
    console.log(`Average time per call: ${avg.toFixed(4)}ms`);
}

runBenchmark();
