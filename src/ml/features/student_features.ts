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

    const scores = recent.map(r => r.score);

    // Simple linear regression slope
    // x = 0, 1, 2... (chronological)
    // We reverse the array to be chronological
    const chronoScores = scores.reverse();
    const n = chronoScores.length;

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += chronoScores[i];
        sumXY += i * chronoScores[i];
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

    // Calculate avg_quiz_score
    const scores = topicQuizzes.map((q) => q.score);
    const avg_quiz_score =
        scores.reduce((sum, score) => sum + score, 0) / scores.length;

    // Calculate attempts_per_topic
    const attempts_per_topic = topicQuizzes.length;

    // Calculate days_since_last_revision
    let latestTimestamp = topicQuizzes[0].timestamp.getTime();
    for (let i = 1; i < topicQuizzes.length; i++) {
        const ts = topicQuizzes[i].timestamp.getTime();
        if (ts > latestTimestamp) {
            latestTimestamp = ts;
        }
    }

    const days_since_last_revision = Math.max(0, Math.floor(
        (referenceDate.getTime() - latestTimestamp) / (1000 * 60 * 60 * 24)
    ));

    // Calculate quiz_score_variance
    const mean = avg_quiz_score;
    const variance =
        scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
        scores.length;
    const quiz_score_variance = variance;

    // Calculate time_spent_per_question
    const totalTime = topicQuizzes.reduce((sum, q) => sum + q.timeSpent, 0);
    const totalQuestions = topicQuizzes.reduce(
        (sum, q) => sum + q.questionsAttempted,
        0
    );
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

    // Session frequency (quizzes taken in last week) and duration
    let session_frequency = 0;
    let recentTimeSpent = 0;

    for (let i = 0; i < history.quizResults.length; i++) {
        const q = history.quizResults[i];
        if (q.timestamp.getTime() > oneWeekAgo) {
            session_frequency++;
            recentTimeSpent += q.timeSpent;
        }
    }

    // Average session duration (avg time per quiz in minutes)
    const avg_session_duration =
        session_frequency > 0
            ? (recentTimeSpent / session_frequency) / 60
            : 0;

    // Quiz completion rate (assumed all completed for now - would need start/finish tracking)
    const quiz_completion_rate = 1.0;

    // Days inactive
    const lastActivity = history.quizResults.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    )[0];
    const days_inactive = lastActivity
        ? Math.floor((now - lastActivity.timestamp.getTime()) / (1000 * 60 * 60 * 24))
        : 999;

    // Performance trend (compare last 3 quizzes to previous 3)
    let performance_trend = 0;
    if (history.quizResults.length >= 6) {
        const sorted = [...history.quizResults].sort(
            (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        );

        const recentAvg = (sorted[0].score + sorted[1].score + sorted[2].score) / 3;
        const previousAvg = (sorted[3].score + sorted[4].score + sorted[5].score) / 3;

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
