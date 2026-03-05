import { extractMasteryFeatures, StudentHistory, RawQuizResult } from './student_features';
import assert from 'assert';

console.log('Running tests for student_features...');

const topic = 'test_topic';

// Test Case 1: Normal case
{
    console.log('Test Case 1: Normal case with multiple quizzes');
    const now = Date.now();
    const history: StudentHistory = {
        quizResults: [
            {
                topic: topic,
                score: 0.8,
                timestamp: new Date(now - 1000 * 60 * 60 * 24 * 5), // 5 days ago
                timeSpent: 60,
                questionsAttempted: 10
            },
            {
                topic: topic,
                score: 0.9,
                timestamp: new Date(now - 1000 * 60 * 60 * 24 * 2), // 2 days ago (LATEST)
                timeSpent: 60,
                questionsAttempted: 10
            },
            {
                topic: topic,
                score: 0.7,
                timestamp: new Date(now - 1000 * 60 * 60 * 24 * 10), // 10 days ago
                timeSpent: 60,
                questionsAttempted: 10
            }
        ],
        lastLoginDate: new Date(),
        registrationDate: new Date()
    };

    const features = extractMasteryFeatures(topic, history);

    // Check days_since_last_revision
    // Expected: 2 days
    assert.strictEqual(features.days_since_last_revision, 2, 'days_since_last_revision should be 2');

    // Check other fields just in case
    assert.strictEqual(features.attempts_per_topic, 3, 'attempts_per_topic should be 3');
    assert.ok(Math.abs(features.avg_quiz_score - 0.8) < 0.0001, 'avg_quiz_score should be 0.8');
}

// Test Case 2: Single quiz
{
    console.log('Test Case 2: Single quiz');
    const now = Date.now();
    const history: StudentHistory = {
        quizResults: [
            {
                topic: topic,
                score: 1.0,
                timestamp: new Date(now - 1000 * 60 * 60 * 24 * 1), // 1 day ago
                timeSpent: 120,
                questionsAttempted: 10
            }
        ],
        lastLoginDate: new Date(),
        registrationDate: new Date()
    };

    const features = extractMasteryFeatures(topic, history);
    assert.strictEqual(features.days_since_last_revision, 1, 'days_since_last_revision should be 1');
    assert.strictEqual(features.attempts_per_topic, 1);
}

// Test Case 3: No quizzes
{
    console.log('Test Case 3: No quizzes');
    const history: StudentHistory = {
        quizResults: [],
        lastLoginDate: new Date(),
        registrationDate: new Date()
    };

    const features = extractMasteryFeatures(topic, history);
    // Cold-start default is clamped to training data range [0, 30]
    assert.strictEqual(features.days_since_last_revision, 30, 'days_since_last_revision should be 30 (clamped to training range)');
    assert.strictEqual(features.attempts_per_topic, 0);
}

console.log('All tests passed!');
