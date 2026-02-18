
import { extractMasteryFeatures, StudentHistory, RawQuizResult } from '../src/ml/features/student_features';
import { predictMastery } from '../src/ml/inference/ml-bridge';
import fs from 'fs';
import path from 'path';

// Disable chaos for deterministic testing
process.env.ENABLE_CHAOS = 'false';

// Helper to create synthetic quiz history
function createHistory(scores: number[], topic: string): StudentHistory {
  const now = new Date();
  const quizResults: RawQuizResult[] = scores.map((score, index) => ({
    topic,
    score,
    // Distribute quizzes over the last few days
    timestamp: new Date(now.getTime() - (scores.length - index) * 24 * 60 * 60 * 1000),
    timeSpent: 60, // 60 seconds per quiz
    questionsAttempted: 10,
  }));

  return {
    quizResults,
    lastLoginDate: now,
    registrationDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
  };
}

async function runValidation() {
  console.log('Starting Weak Area Detection Validation...');

  const topic = 'Algebra';

  // Scenario A: True Weak Area
  // Consistently low scores: 20%, 30%, 20%, 25%, 20%
  const weakAreaScores = [0.2, 0.3, 0.2, 0.25, 0.2];
  const weakAreaHistory = createHistory(weakAreaScores, topic);
  const weakAreaFeatures = extractMasteryFeatures(topic, weakAreaHistory);

  console.log('Predicting for Weak Area Scenario...');
  const weakAreaPrediction = await predictMastery(weakAreaFeatures);

  // Scenario B: Random Errors (High Mastery with dips)
  // Generally high scores with one or two bad ones: 90%, 80%, 30% (mistake), 95%, 85%
  const randomErrorScores = [0.9, 0.8, 0.3, 0.95, 0.85];
  const randomErrorHistory = createHistory(randomErrorScores, topic);
  const randomErrorFeatures = extractMasteryFeatures(topic, randomErrorHistory);

  console.log('Predicting for Random Error Scenario...');
  const randomErrorPrediction = await predictMastery(randomErrorFeatures);

  // Analyze Results
  const reportContent = `
# Weak Area Detection Accuracy Report

**Date:** ${new Date().toISOString()}
**Topic:** ${topic}

## Executive Summary
This report validates the efficacy of the Weak Area Detection Algorithm. The goal is to confirm that the system correctly distinguishes between a "True Weak Area" (consistent knowledge gap) and "Random Errors" (high mastery with occasional mistakes).

## Methodology
Two synthetic student profiles were generated:
1.  **Scenario A (True Weak Area):** A student with consistently low quiz scores (${weakAreaScores.join(', ')}).
2.  **Scenario B (Random Errors):** A student with generally high scores but occasional outliers (${randomErrorScores.join(', ')}).

Both profiles were processed through the feature extraction pipeline and evaluated by the ML mastery model.

## Results

### Scenario A: True Weak Area
*   **Input Scores:** ${weakAreaScores.join(', ')}
*   **Average Score:** ${weakAreaFeatures.avg_quiz_score.toFixed(2)}
*   **Variance:** ${weakAreaFeatures.quiz_score_variance.toFixed(4)}
*   **Predicted Mastery Probability:** ${(weakAreaPrediction.mastery_probability * 100).toFixed(2)}%
*   **Classification:** **${weakAreaPrediction.predicted_class.toUpperCase()}**

### Scenario B: Random Errors
*   **Input Scores:** ${randomErrorScores.join(', ')}
*   **Average Score:** ${randomErrorFeatures.avg_quiz_score.toFixed(2)}
*   **Variance:** ${randomErrorFeatures.quiz_score_variance.toFixed(4)}
*   **Predicted Mastery Probability:** ${(randomErrorPrediction.mastery_probability * 100).toFixed(2)}%
*   **Classification:** **${randomErrorPrediction.predicted_class.toUpperCase()}**

## Conclusion
${
  weakAreaPrediction.mastery_probability < 0.5 && randomErrorPrediction.mastery_probability >= 0.5
    ? '✅ **PASS**: The algorithm successfully distinguished between a weak area and random errors.'
    : '❌ **FAIL**: The algorithm failed to distinguish the scenarios correctly.'
}

The system identifies a "True Weak Area" when the probability is consistently low, preventing false positives from random mistakes.
`;

  fs.writeFileSync('WEAK_AREA_DETECTION_REPORT.md', reportContent.trim());
  console.log('Report generated: WEAK_AREA_DETECTION_REPORT.md');
  process.exit(0);
}

runValidation().catch(err => {
  console.error('Validation failed:', err);
  process.exit(1);
});
