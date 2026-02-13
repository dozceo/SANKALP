/**
 * Utility functions for analyzing student performance trends.
 */

export interface TrendInput {
    score: number;
    timestamp: Date;
}

export type Trend = "IMPROVING" | "STABLE" | "DECLINING";

// Optimization: Shared comparator to avoid function re-creation
const sortByDateDesc = (a: TrendInput, b: TrendInput) => b.timestamp.getTime() - a.timestamp.getTime();

/**
 * Calculates the performance trend based on historical quiz results.
 *
 * Logic:
 * - If fewer than 2 results, returns "STABLE".
 * - If >= 4 results, compares the average of the recent half vs the previous half.
 * - If 2-3 results, compares the most recent result vs the average of the rest.
 * - Uses a 10% threshold (0.1) to determine significant change.
 *
 * @param results List of quiz results containing score and timestamp
 * @param skipSort If true, assumes results are already sorted by timestamp descending
 * @param threshold The difference threshold to determine trend (default 0.1)
 * @returns "IMPROVING" | "STABLE" | "DECLINING"
 */
export function calculateTrend(results: TrendInput[], skipSort: boolean = false, threshold: number = 0.1): Trend {
    const count = results.length;
    if (count < 2) return "STABLE";

    // Sort by timestamp descending (newest first) only if needed
    const sorted = skipSort ? results : [...results].sort(sortByDateDesc);

    let recentSum = 0;
    let previousSum = 0;
    let recentCount = 0;
    let previousCount = 0;

    if (count >= 4) {
        // Split into two halves: Recent (first half) vs Previous (second half)
        // mid is the start index of the second half
        const mid = Math.floor(count / 2);

        // Single pass loop for O(N) efficiency
        for (let i = 0; i < count; i++) {
            if (i < mid) {
                recentSum += sorted[i].score;
                recentCount++;
            } else {
                previousSum += sorted[i].score;
                previousCount++;
            }
        }
    } else {
        // 2 or 3 items: Compare most recent (1) vs average of the rest
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

    if (diff > threshold) return "IMPROVING";
    if (diff < -threshold) return "DECLINING";
    return "STABLE";
}

/**
 * Calculates trend from raw scores array (assumed sorted descending/newest first).
 * Optimized for cases where scores are already extracted and sorted.
 *
 * @param scores Array of scores (0.0 to 1.0), newest first
 * @param threshold The difference threshold to determine trend (default 0.1)
 * @returns "IMPROVING" | "STABLE" | "DECLINING"
 */
export function calculateTrendFromScores(scores: number[], threshold: number = 0.1): Trend {
    const count = scores.length;
    if (count < 2) return "STABLE";

    let recentSum = 0;
    let previousSum = 0;
    let recentCount = 0;
    let previousCount = 0;

    if (count >= 4) {
        const mid = Math.floor(count / 2);
        for (let i = 0; i < count; i++) {
            if (i < mid) {
                recentSum += scores[i];
                recentCount++;
            } else {
                previousSum += scores[i];
                previousCount++;
            }
        }
    } else {
        recentSum = scores[0];
        recentCount = 1;
        for (let i = 1; i < count; i++) {
            previousSum += scores[i];
            previousCount++;
        }
    }

    const recentAvg = recentSum / recentCount;
    const previousAvg = previousSum / previousCount;
    const diff = recentAvg - previousAvg;

    if (diff > threshold) return "IMPROVING";
    if (diff < -threshold) return "DECLINING";
    return "STABLE";
}
