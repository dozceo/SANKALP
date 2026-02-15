
import { calculateTrend } from '../src/lib/trend-utils';

// Mocks for types used in the original code
interface TrendInput {
    score: number;
    timestamp: Date;
}

interface TopicStats {
    sum: number;
    count: number;
    results: TrendInput[];
}

// Function to simulate the logic from src/lib/student-analytics.ts
function detectWeakAreas(quizResults: { topic: string, score: number, timestamp: Date }[]) {
    const topicStats: Record<string, TopicStats> = {};

    // Group by topic
    for (const r of quizResults) {
        if (!topicStats[r.topic]) {
            topicStats[r.topic] = { sum: 0, count: 0, results: [] };
        }
        const stats = topicStats[r.topic];
        stats.sum += r.score;
        stats.count += 1;
        stats.results.push({ score: r.score, timestamp: r.timestamp });
    }

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const topicMastery: Record<string, any> = {};

    for (const topic in topicStats) {
        const stats = topicStats[topic];
        const avg = stats.sum / stats.count;

        // The original code assumes results are sorted descending if skipSort=true.
        // We ensure our test data is sorted descending, so calculateTrend will work correctly.
        // @ts-ignore
        const trendResult = calculateTrend(stats.results, true);

        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (trendResult === 'IMPROVING') trend = 'up';
        else if (trendResult === 'DECLINING') trend = 'down';

        const avgPercent = Math.round(avg * 100);

        topicMastery[topic] = {
            avg: avgPercent,
            count: stats.count,
            trend,
        };

        // Logic from student-analytics.ts
        if (avgPercent >= 80) {
            strengths.push(topic);
        } else if (avgPercent < 60) {
            weaknesses.push(topic);
        }
    }

    return { strengths, weaknesses, topicMastery };
}

// Test Cases - All data sorted DESCENDING by timestamp (Newest -> Oldest)
const testCases = [
    {
        name: "Consistent Weakness",
        description: "Scores consistently around 40-50%",
        data: [
            { topic: "Algebra", score: 0.4, timestamp: new Date('2023-01-05') },
            { topic: "Algebra", score: 0.5, timestamp: new Date('2023-01-04') },
            { topic: "Algebra", score: 0.35, timestamp: new Date('2023-01-03') },
            { topic: "Algebra", score: 0.45, timestamp: new Date('2023-01-02') },
            { topic: "Algebra", score: 0.4, timestamp: new Date('2023-01-01') }
        ],
        expectedWeakness: true,
        expectedStrength: false
    },
    {
        name: "Consistent Strength",
        description: "Scores consistently around 85-95%",
        data: [
            { topic: "Geometry", score: 1.0, timestamp: new Date('2023-01-05') },
            { topic: "Geometry", score: 0.8, timestamp: new Date('2023-01-04') },
            { topic: "Geometry", score: 0.95, timestamp: new Date('2023-01-03') },
            { topic: "Geometry", score: 0.85, timestamp: new Date('2023-01-02') },
            { topic: "Geometry", score: 0.9, timestamp: new Date('2023-01-01') }
        ],
        expectedWeakness: false,
        expectedStrength: true
    },
    {
        name: "Random Errors (High Mastery)",
        description: "Generally high scores with one outlier low score",
        data: [
            { topic: "Calculus", score: 0.8, timestamp: new Date('2023-01-05') },
            { topic: "Calculus", score: 0.95, timestamp: new Date('2023-01-04') },
            { topic: "Calculus", score: 0.2, timestamp: new Date('2023-01-03') }, // Mistake
            { topic: "Calculus", score: 0.85, timestamp: new Date('2023-01-02') },
            { topic: "Calculus", score: 0.9, timestamp: new Date('2023-01-01') }
        ],
        // Average: 0.74 (74%)
        expectedWeakness: false,
        expectedStrength: false
    },
    {
        name: "Random Errors (Medium Mastery)",
        description: "Scores around 70% with one low outlier",
        data: [
            { topic: "Trig", score: 0.65, timestamp: new Date('2023-01-05') },
            { topic: "Trig", score: 0.7, timestamp: new Date('2023-01-04') },
            { topic: "Trig", score: 0.2, timestamp: new Date('2023-01-03') }, // Mistake
            { topic: "Trig", score: 0.75, timestamp: new Date('2023-01-02') },
            { topic: "Trig", score: 0.7, timestamp: new Date('2023-01-01') }
        ],
        // Average: 0.6 (60%)
        expectedWeakness: false,
        expectedStrength: false
    },
    {
        name: "Improvement Trend",
        description: "Starts low (oldest), ends high (newest) (learning happened)",
        data: [
            { topic: "Stats", score: 0.9, timestamp: new Date('2023-01-05') }, // Newest
            { topic: "Stats", score: 0.8, timestamp: new Date('2023-01-04') },
            { topic: "Stats", score: 0.6, timestamp: new Date('2023-01-03') },
            { topic: "Stats", score: 0.5, timestamp: new Date('2023-01-02') },
            { topic: "Stats", score: 0.4, timestamp: new Date('2023-01-01') } // Oldest
        ],
        // Average: 0.64 (64%)
        expectedWeakness: false,
        expectedStrength: false,
        expectedTrend: 'up'
    }
];

console.log("Running Weak Area Detection Validation...\n");

for (const testCase of testCases) {
    console.log(`Test Case: ${testCase.name}`);
    console.log(`Description: ${testCase.description}`);

    const result = detectWeakAreas(testCase.data);
    const topic = testCase.data[0].topic;
    const isWeakness = result.weaknesses.includes(topic);
    const isStrength = result.strengths.includes(topic);
    const mastery = result.topicMastery[topic];

    console.log(`Average Score: ${mastery.avg}%`);
    console.log(`Detected Trend: ${mastery.trend}`);
    console.log(`Classified as Weakness: ${isWeakness}`);
    console.log(`Classified as Strength: ${isStrength}`);

    let passed = true;
    if (testCase.expectedWeakness !== undefined && isWeakness !== testCase.expectedWeakness) {
        console.error(`FAILURE: Expected Weakness=${testCase.expectedWeakness}, got ${isWeakness}`);
        passed = false;
    }
    if (testCase.expectedStrength !== undefined && isStrength !== testCase.expectedStrength) {
        console.error(`FAILURE: Expected Strength=${testCase.expectedStrength}, got ${isStrength}`);
        passed = false;
    }
    if (testCase.expectedTrend && mastery.trend !== testCase.expectedTrend) {
        console.error(`FAILURE: Expected Trend=${testCase.expectedTrend}, got ${mastery.trend}`);
        passed = false;
    }

    if (passed) {
        console.log("RESULT: PASSED");
    } else {
        console.log("RESULT: FAILED");
    }
    console.log("-".repeat(40));
}
