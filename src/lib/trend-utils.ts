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
    if (results.length < 2) return "STABLE";

    // Sort by timestamp descending (newest first)
    const sorted = skipSort ? results : [...results].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const count = sorted.length;
    let recentAvg: number;
    let previousAvg: number;

    if (count >= 4) {
        // Split into two halves
        const mid = Math.floor(count / 2);
        const compareCount = mid;

        // Optimization: Use loops instead of slice/reduce to avoid array allocation
        let recentSum = 0;
        for (let i = 0; i < compareCount; i++) {
            recentSum += sorted[i].score;
        }
        recentAvg = recentSum / compareCount;

        let previousSum = 0;
        for (let i = compareCount; i < compareCount * 2; i++) {
            previousSum += sorted[i].score;
        }
        previousAvg = previousSum / compareCount;
    } else {
        // 2 or 3 items
        // Compare most recent (1) vs average of the rest (1 or 2)
        recentAvg = sorted[0].score;

        let othersSum = 0;
        for (let i = 1; i < count; i++) {
            othersSum += sorted[i].score;
        }
        previousAvg = othersSum / (count - 1);
    }

    const diff = recentAvg - previousAvg;
    const THRESHOLD = 0.1; // 10% change is significant

    if (diff > THRESHOLD) return "IMPROVING";
    if (diff < -THRESHOLD) return "DECLINING";
    return "STABLE";
}
