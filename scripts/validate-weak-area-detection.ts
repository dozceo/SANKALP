
import { writeFileSync } from 'fs';
import path from 'path';

// --- Replicated Logic from src/lib/student-analytics.ts & trend-utils.ts ---

interface QuizResult {
    topic: string;
    score: number;
    timestamp: Date;
}

interface TrendInput {
    score: number;
    timestamp: Date;
}

type Trend = "IMPROVING" | "STABLE" | "DECLINING";

function calculateTrend(results: TrendInput[], skipSort: boolean = false): Trend {
    const count = results.length;
    if (count < 2) return "STABLE";

    // Sort by timestamp descending (newest first) only if needed
    const sorted = skipSort ? results : [...results].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    let recentSum = 0;
    let previousSum = 0;
    let recentCount = 0;
    let previousCount = 0;

    if (count >= 4) {
        const mid = Math.floor(count / 2);
        for (let i = 0; i < mid; i++) {
            recentSum += sorted[i].score;
            recentCount++;
        }
        for (let i = mid; i < count; i++) {
            previousSum += sorted[i].score;
            previousCount++;
        }
    } else {
        recentSum = sorted[0].score;
        recentCount = 1;
        for (let i = 1; i < count; i++) {
            previousSum += sorted[i].score;
            previousCount++;
        }
    }

    const recentAvg = recentSum / recentCount;
    const previousAvg = previousSum / previousCount;
    const diff = recentAvg - previousAvg;
    const THRESHOLD = 0.1;

    if (diff > THRESHOLD) return "IMPROVING";
    if (diff < -THRESHOLD) return "DECLINING";
    return "STABLE";
}

function detectWeaknesses(quizResults: QuizResult[]): { weaknesses: string[], strengths: string[], mastery: Record<string, any> } {
    const topicStats: Record<string, { sum: number; count: number; results: TrendInput[] }> = {};

    for (const r of quizResults) {
        if (!topicStats[r.topic]) {
            topicStats[r.topic] = { sum: 0, count: 0, results: [] };
        }
        const stats = topicStats[r.topic];
        stats.sum += r.score;
        stats.count += 1;
        stats.results.push({ score: r.score, timestamp: r.timestamp });
    }

    const topicMastery: Record<string, { avg: number; count: number; trend: string }> = {};
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    for (const topic in topicStats) {
        const stats = topicStats[topic];
        const avg = stats.sum / stats.count;

        // Simulate DB sorted results by sorting here just in case, or assume passed in random order so we sort
        stats.results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

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

        if (avgPercent >= 80) {
            strengths.push(topic);
        } else if (avgPercent < 60) {
            weaknesses.push(topic);
        }
    }

    return { weaknesses, strengths, mastery: topicMastery };
}

// --- Test Data Generation ---

function generateQuizHistory(topic: string, count: number, baseScore: number, variability: number, errorRate: number = 0): QuizResult[] {
    const results: QuizResult[] = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
        let score = baseScore + (Math.random() * variability * 2 - variability);

        // Random error simulation: occasionally drop score significantly
        if (Math.random() < errorRate) {
            score = 0.2; // A bad score
        }

        // Clamp score
        score = Math.max(0, Math.min(1, score));

        results.push({
            topic,
            score,
            timestamp: new Date(now.getTime() - i * 86400000) // 1 day apart
        });
    }
    return results;
}

// --- Execution ---

function runValidation() {
    console.log("Starting Weak Area Detection Validation...");

    const scenarios = [
        {
            name: "Consistent Weakness",
            topic: "Calculus",
            data: generateQuizHistory("Calculus", 10, 0.4, 0.1, 0), // Avg ~0.4
            expectWeakness: true
        },
        {
            name: "Consistent Strength",
            topic: "Algebra",
            data: generateQuizHistory("Algebra", 10, 0.9, 0.05, 0), // Avg ~0.9
            expectWeakness: false
        },
        {
            name: "Random Errors (Strength)",
            topic: "Geometry",
            data: generateQuizHistory("Geometry", 10, 0.95, 0.05, 0.2), // 20% error rate. 8x~0.95, 2x0.2. Avg ~0.8
            expectWeakness: false
        },
        {
            name: "Improving Student (Weak Start)",
            topic: "Trigonometry",
            // 5 bad scores (old), 5 good scores (new). Avg ~0.65?
            data: [
                ...generateQuizHistory("Trigonometry", 5, 0.4, 0.1).map((r, i) => ({ ...r, timestamp: new Date(Date.now() - (i + 5) * 86400000) })),
                ...generateQuizHistory("Trigonometry", 5, 0.9, 0.1).map((r, i) => ({ ...r, timestamp: new Date(Date.now() - i * 86400000) }))
            ],
            expectWeakness: false // Should not be weak if they improved? Current algo uses simple avg.
                                  // (5*0.4 + 5*0.9)/10 = 0.65 -> 65%. Not < 60%. So it passes.
        }
    ];

    let reportContent = "# Weak Area Detection Algorithm Validation\n\n";
    reportContent += "| Scenario | Topic | Avg Score | Trend | Detected as Weakness | Expected | Status |\n";
    reportContent += "|---|---|---|---|---|---|---|\n";

    let allPassed = true;

    for (const scenario of scenarios) {
        const { weaknesses, mastery } = detectWeaknesses(scenario.data);
        const isWeakness = weaknesses.includes(scenario.topic);
        const stats = mastery[scenario.topic];
        const status = isWeakness === scenario.expectWeakness ? "PASS" : "FAIL";

        if (status === "FAIL") allPassed = false;

        reportContent += `| ${scenario.name} | ${scenario.topic} | ${stats.avg}% | ${stats.trend} | ${isWeakness ? "Yes" : "No"} | ${scenario.expectWeakness ? "Yes" : "No"} | ${status} |\n`;
    }

    reportContent += "\n## Analysis\n\n";
    if (allPassed) {
        reportContent += "The algorithm correctly identified weak areas and distinguished them from random errors and strong areas in the tested scenarios.\n";
    } else {
        reportContent += "The algorithm failed in some scenarios. See table above for details.\n";
    }

    reportContent += "\n## Methodology\n\n";
    reportContent += "- **Consistent Weakness**: 10 quizzes with scores ~40%.\n";
    reportContent += "- **Consistent Strength**: 10 quizzes with scores ~90%.\n";
    reportContent += "- **Random Errors**: 10 quizzes with scores ~95%, but with a 20% chance of a low score (0.2) simulating a mistake.\n";
    reportContent += "- **Improving Student**: 5 old bad scores (40%) followed by 5 recent good scores (90%).\n";

    const reportPath = path.join(process.cwd(), 'reports', 'WEAK_AREA_DETECTION_REPORT.md');
    writeFileSync(reportPath, reportContent);
    console.log(`Report generated at ${reportPath}`);
}

runValidation();
