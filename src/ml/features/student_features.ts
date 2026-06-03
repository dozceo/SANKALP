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

    // Sort by date descending
    const sorted = [...quizResults].sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    // Take last 5 attempts
    const recent = sorted.slice(0, 5);

    // Calculate slope of scores
    // x = index (reverse chronological: 0 is most recent), y = score
    // We want to see if score increases as we go to more recent (smaller index)
    // Actually simpler: linear regression on (time, score)
    // or just compare recent avg vs older avg

    if (recent.length < 2) return "STABLE";

    const n = recent.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    // Optimization 1: Replaced array allocations (.map().reverse()) with direct backwards iteration.
    // Impact: Avoids allocating 2 intermediate arrays per function call.
    // x = 0, 1, 2... (chronological)
    // We iterate backwards through 'recent' to process chronologically
    for (let i = 0; i < n; i++) {
        const chronologicalScore = recent[n - 1 - i].score;
        sumX += i;
        sumY += chronologicalScore;
        sumXY += i * chronologicalScore;
        sumXX += i * i;
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
    const topicQuizzes = history.quizResults.filter((r) => r.topic === topic);

    if (topicQuizzes.length === 0) {
        // Default features for new topics (clamped to training data range)
        return {
            avg_quiz_score: 0,
            attempts_per_topic: 0,
            days_since_last_revision: 30,
            quiz_score_variance: 0,
            time_spent_per_question: 0,
        };
    }

    // Optimization 2 & 3: Combined multiple .map() and .reduce() passes into a single O(N) loop.
    // Impact: Reduces 5 array iterations down to 1, avoiding multiple array allocations and GC pressure.
    // Calculate avg_quiz_score and find latest timestamp
    let sumScore = 0;
    let latestTimestamp = topicQuizzes[0].timestamp.getTime();
    let totalTime = 0;
    let totalQuestions = 0;

    for (let i = 0; i < topicQuizzes.length; i++) {
        const q = topicQuizzes[i];
        sumScore += q.score;
        const ts = q.timestamp.getTime();
        if (ts > latestTimestamp) {
            latestTimestamp = ts;
        }
        totalTime += q.timeSpent;
        totalQuestions += q.questionsAttempted;
    }

    const avg_quiz_score = sumScore / topicQuizzes.length;

    // Calculate attempts_per_topic
    const attempts_per_topic = topicQuizzes.length;

    // Calculate days_since_last_revision
    const days_since_last_revision = Math.max(0, Math.floor(
        (referenceDate.getTime() - latestTimestamp) / (1000 * 60 * 60 * 24)
    ));

    // Calculate quiz_score_variance
    // Optimization 3 (cont): Eliminated .reduce() and .map() for variance calculation.
    let sumVariance = 0;
    for (let i = 0; i < topicQuizzes.length; i++) {
        sumVariance += Math.pow(topicQuizzes[i].score - avg_quiz_score, 2);
    }
    const quiz_score_variance = sumVariance / topicQuizzes.length;

    // Calculate time_spent_per_question
    const time_spent_per_question =
        totalQuestions > 0 ? totalTime / totalQuestions : 0;

    return {
        avg_quiz_score,
        attempts_per_topic,
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

    // Session frequency (quizzes taken in last week)
    const recentQuizzes = history.quizResults.filter(
        (r) => r.timestamp.getTime() > oneWeekAgo
    );
    const session_frequency = recentQuizzes.length;

    // Average session duration (avg time per quiz)
    const avg_session_duration =
        recentQuizzes.length > 0
            ? recentQuizzes.reduce((sum, q) => sum + q.timeSpent, 0) /
            recentQuizzes.length /
            60
            : 0;

    // Quiz completion rate (assumed all completed for now - would need start/finish tracking)
    const quiz_completion_rate = 1.0;

    // Days inactive
    // Optimization 4: Replaced O(N log N) mutating sort with an O(N) linear scan.
    // Impact: Fixes a bug where history.quizResults was mutated, and eliminates sorting overhead.
    let lastActivity = history.quizResults[0];
    for (let i = 1; i < history.quizResults.length; i++) {
        if (history.quizResults[i].timestamp.getTime() > lastActivity.timestamp.getTime()) {
            lastActivity = history.quizResults[i];
        }
    }

    const days_inactive = lastActivity
        ? Math.floor((now - lastActivity.timestamp.getTime()) / (1000 * 60 * 60 * 24))
        : 999;

    // Performance trend (compare last 3 quizzes to previous 3)
    let performance_trend = 0;
    if (history.quizResults.length >= 6) {
        const sorted = [...history.quizResults].sort(
            (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        );

        // Optimization 5: Replaced chained .slice().map().reduce() calls with a single direct loop.
        // Impact: Prevents the creation of 4 intermediate arrays during trend calculation.
        let recentSum = 0;
        let previousSum = 0;
        for (let i = 0; i < 3; i++) {
            recentSum += sorted[i].score;
            previousSum += sorted[i + 3].score;
        }

        const recentAvg = recentSum / 3;
        const previousAvg = previousSum / 3;

        if (recentAvg > previousAvg + 0.1) performance_trend = 1;
        else if (recentAvg < previousAvg - 0.1) performance_trend = -1;
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
