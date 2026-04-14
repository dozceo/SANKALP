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
 * @param results List of quiz results containing score and timestamp OR array of scores (if sorted)
 * @param skipSort If true, assumes results are already sorted by timestamp descending (newest first)
 * @returns "IMPROVING" | "STABLE" | "DECLINING"
 */
export function calculateTrend(results: number[], skipSort: true): Trend;
export function calculateTrend(results: TrendInput[], skipSort?: boolean): Trend;
export function calculateTrend(results: (TrendInput | number)[], skipSort: boolean = false): Trend {
    const count = results.length;
    if (count < 2) return "STABLE";

    // Optimization: Use the input array directly if sorting is skipped or not needed
    let sorted: (TrendInput | number)[] = results;

    if (!skipSort) {
        // Only copy and sort if strictly necessary (TrendInput objects and not pre-sorted)
        // Check first element type to be safe, though TS types imply homogeneity
        if (typeof results[0] !== 'number') {
             sorted = (results as TrendInput[]).slice().sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        }
    }

    let recentSum = 0;
    let previousSum = 0;
    let recentCount = 0;
    let previousCount = 0;

    // Optimization: Check type once outside the loop
    const isNumberArray = typeof sorted[0] === 'number';

    if (count >= 4) {
        // Split into two halves: Recent (first half) vs Previous (second half)
        const mid = Math.floor(count / 2);

        recentCount = mid;
        previousCount = count - mid;

        if (isNumberArray) {
             const nums = sorted as number[];
             for (let i = 0; i < mid; i++) recentSum += nums[i];
             for (let i = mid; i < count; i++) previousSum += nums[i];
        } else {
             const objs = sorted as TrendInput[];
             for (let i = 0; i < mid; i++) recentSum += objs[i].score;
             for (let i = mid; i < count; i++) previousSum += objs[i].score;
        }
    } else {
        // 2 or 3 items: Compare most recent (1) vs average of the rest
        recentCount = 1;
        previousCount = count - 1;

        if (isNumberArray) {
             const nums = sorted as number[];
             recentSum = nums[0];
             for (let i = 1; i < count; i++) previousSum += nums[i];
        } else {
             const objs = sorted as TrendInput[];
             recentSum = objs[0].score;
             for (let i = 1; i < count; i++) previousSum += objs[i].score;
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
