/**
 * Utility functions for analyzing student performance trends.
 */

export interface TrendInput {
    score: number;
    timestamp: Date;
}

export type Trend = "IMPROVING" | "STABLE" | "DECLINING";

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
 * @returns "IMPROVING" | "STABLE" | "DECLINING"
 */
export function calculateTrend(results: TrendInput[], skipSort: boolean = false): Trend {
    const count = results.length;
    if (count < 2) return "STABLE";

    // Sort by timestamp descending (newest first) only if needed
    const sorted = skipSort ? results : [...results].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

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
    const THRESHOLD = 0.1; // 10% change is significant

    if (diff > THRESHOLD) return "IMPROVING";
    if (diff < -THRESHOLD) return "DECLINING";
    return "STABLE";
}
