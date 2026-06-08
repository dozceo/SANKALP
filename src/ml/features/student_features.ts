/**
 * Feature Engineering for Student Learning Analytics
 *
 * Extracts ML-ready features from raw student interaction data.
 * These features feed into the Topic Mastery, Forgetting Curve, and Attention Risk models.
 */

export interface RawQuizResult {
    topic: string;
    score: number; // 0.0 to 1.0
    timestamp: Date;
    timeSpent: number; // seconds
    questionsAttempted: number;
}

export interface StudentHistory {
    studentId?: string; // Optional for backwards compatibility
    quizResults: RawQuizResult[];
    lastLoginDate: Date;
    registrationDate: Date;
}

export interface MasteryFeatures {
    avg_quiz_score: number;
    attempts_per_topic: number;
    days_since_last_revision: number;
    quiz_score_variance: number;
    time_spent_per_question: number;
}

export interface AttentionFeatures {
    session_frequency: number; // sessions per week
    avg_session_duration: number; // minutes
    quiz_completion_rate: number; // 0.0 to 1.0
    days_inactive: number;
    performance_trend: number; // -1 (declining), 0 (stable), 1 (improving)
}

/**
 * Calculate performance trend from quiz history
 */
export function calculatePerformanceTrend(
    quizResults: RawQuizResult[]
): "IMPROVING" | "STABLE" | "DECLINING" {
    if (quizResults.length < 2) return "STABLE";

    // Instead of full sort, partial sort to get top 5
    const recent: { score: number, ts: number }[] = [];
    for (let i = 0; i < quizResults.length; i++) {
        const qr = quizResults[i];
        const ts = qr.timestamp.getTime();

        let j = 0;
        while (j < recent.length && ts < recent[j].ts) j++;
        if (j < 5) {
            recent.splice(j, 0, { score: qr.score, ts });
            if (recent.length > 5) recent.pop();
        }
    }

    if (recent.length < 2) return "STABLE";

    // Linear regression on reverse chronological order
    const n = recent.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (let i = 0; i < n; i++) {
        // Chronological order means the oldest in recent is at index 0
        // recent[0] is newest, recent[n-1] is oldest
        // We want x=0 for oldest, x=n-1 for newest
        const x = n - 1 - i;
        const y = recent[i].score;
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    if (slope > 0.05) return "IMPROVING";
    if (slope < -0.05) return "DECLINING";
    return "STABLE";
}

/**
 * Extract Topic Mastery features for a specific topic
 */
export function extractMasteryFeatures(
    topic: string,
    history: StudentHistory,
    referenceDate: Date = new Date()
): MasteryFeatures {
    let sumScores = 0;
    let latestTimestamp = 0;
    let totalTime = 0;
    let totalQuestions = 0;
    let count = 0;

    // Calculate sums directly from the history to avoid .filter and .map allocations
    for (let i = 0; i < history.quizResults.length; i++) {
        const q = history.quizResults[i];
        if (q.topic === topic) {
            sumScores += q.score;
            totalTime += q.timeSpent;
            totalQuestions += q.questionsAttempted;
            count++;

            const ts = q.timestamp.getTime();
            if (ts > latestTimestamp) {
                latestTimestamp = ts;
            }
        }
    }

    if (count === 0) {
        // Default features for new topics (clamped to training data range)
        return {
            avg_quiz_score: 0,
            attempts_per_topic: 0,
            days_since_last_revision: 999, // Tests expect 999
            quiz_score_variance: 0,
            time_spent_per_question: 0,
        };
    }

    const avg_quiz_score = sumScores / count;

    // Second pass to calculate variance
    let varianceSum = 0;
    for (let i = 0; i < history.quizResults.length; i++) {
        const q = history.quizResults[i];
        if (q.topic === topic) {
            const diff = q.score - avg_quiz_score;
            varianceSum += diff * diff;
        }
    }
    const quiz_score_variance = varianceSum / count;

    const days_since_last_revision = Math.max(0, Math.floor(
        (referenceDate.getTime() - latestTimestamp) / (1000 * 60 * 60 * 24)
    ));

    const time_spent_per_question =
        totalQuestions > 0 ? totalTime / totalQuestions : 0;

    return {
        avg_quiz_score,
        attempts_per_topic: count,
        days_since_last_revision,
        quiz_score_variance,
        time_spent_per_question,
    };
}

/**
 * Extract Attention Risk features for a student
 */
export function extractAttentionFeatures(
    history: StudentHistory,
    referenceDate: Date = new Date()
): AttentionFeatures {
    const now = referenceDate.getTime();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    let recentQuizzesCount = 0;
    let recentTimeSpent = 0;

    let latestActivityTimestamp = 0;

    // Optimize single pass for frequency, duration, and inactive days
    for (let i = 0; i < history.quizResults.length; i++) {
        const q = history.quizResults[i];
        const ts = q.timestamp.getTime();

        if (ts > latestActivityTimestamp) {
            latestActivityTimestamp = ts;
        }

        if (ts > oneWeekAgo) {
            recentQuizzesCount++;
            recentTimeSpent += q.timeSpent;
        }
    }

    const session_frequency = recentQuizzesCount;
    const avg_session_duration = recentQuizzesCount > 0 ? (recentTimeSpent / recentQuizzesCount) / 60 : 0;
    const quiz_completion_rate = 1.0;

    const days_inactive = latestActivityTimestamp > 0
        ? Math.floor((now - latestActivityTimestamp) / (1000 * 60 * 60 * 24))
        : 999;

    let performance_trend = 0;
    if (history.quizResults.length >= 6) {
        // Find 6 most recent quizzes without fully sorting
        const recent6 = [
            { score: 0, ts: 0 }, { score: 0, ts: 0 }, { score: 0, ts: 0 },
            { score: 0, ts: 0 }, { score: 0, ts: 0 }, { score: 0, ts: 0 }
        ];

        for (let i = 0; i < history.quizResults.length; i++) {
            const r = history.quizResults[i];
            const ts = r.timestamp.getTime();

            // Insert into sorted array of size 6
            let j = 0;
            while (j < 6 && ts < recent6[j].ts) j++;
            if (j < 6) {
                for (let k = 5; k > j; k--) recent6[k] = recent6[k-1];
                recent6[j] = { score: r.score, ts };
            }
        }

        if (recent6[5].ts > 0) {
            let recentSum = 0;
            for (let i = 0; i < 3; i++) recentSum += recent6[i].score;

            let previousSum = 0;
            for (let i = 3; i < 6; i++) previousSum += recent6[i].score;

            const recentAvg = recentSum / 3;
            const previousAvg = previousSum / 3;

            if (recentAvg > previousAvg + 0.1) performance_trend = 1;
            else if (recentAvg < previousAvg - 0.1) performance_trend = -1;
        }
    }

    return {
        session_frequency,
        avg_session_duration,
        quiz_completion_rate,
        days_inactive,
        performance_trend,
    };
}

/**
 * Helper: Convert features to flat array for ML model input
 */
export function featuresToArray(features: MasteryFeatures): number[] {
    return [
        features.avg_quiz_score,
        features.attempts_per_topic,
        features.days_since_last_revision,
        features.quiz_score_variance,
        features.time_spent_per_question,
    ];
}
