import { extractMasteryFeatures, StudentHistory, RawQuizResult } from "../src/ml/features/student_features";

/**
 * ML Drift Detector - Feature Extraction Validator
 *
 * This script programmatically validates feature extraction logic against the assumptions
 * baked into the training data generation script (`src/ml/training/generate_data.py`).
 *
 * It serves as a regression test to prevent silent model degradation when features drift.
 */

// TRAINING DATA ASSUMPTIONS (Derived from generate_data.py)
const TRAINING_CONSTRAINTS = {
  avg_quiz_score: { min: 0.0, max: 1.0 },
  attempts_per_topic: { min: 1, max: 10 },
  days_since_last_revision: { min: 0, max: 30 },
  quiz_score_variance: { min: 0.0, max: 0.3 }, // Labeled "variance", implies value^2
  time_spent_per_question: { min: 10, max: 120 },
};

function checkConstraint(featureName: string, value: number, constraint: { min: number; max: number }) {
  if (value < constraint.min || value > constraint.max) {
    return `[DRIFT] ${featureName}: Value ${value} is outside training range [${constraint.min}, ${constraint.max}]`;
  }
  return null;
}

function runDriftAnalysis() {
  console.log("🔍 Starting ML Feature Drift Analysis...\n");
  const driftReport: string[] = [];

  // Scenario 1: New Student (No History)
  const newStudentHistory: StudentHistory = {
    quizResults: [],
    lastLoginDate: new Date(),
    registrationDate: new Date(),
  };

  const newFeatures = extractMasteryFeatures("math_101", newStudentHistory);
  console.log("Scenario 1: New Student (0 Quizzes)");
  console.log(JSON.stringify(newFeatures, null, 2));

  Object.entries(newFeatures).forEach(([key, value]) => {
    const constraint = TRAINING_CONSTRAINTS[key as keyof typeof TRAINING_CONSTRAINTS];
    if (constraint) {
      const error = checkConstraint(key, value, constraint);
      if (error) driftReport.push(`Scenario 1 (New Student) - ${error}`);
    }
  });

  // Scenario 2: Active Student (Normal Range)
  const activeHistory: StudentHistory = {
    quizResults: [
      { topic: "math_101", score: 0.8, timestamp: new Date(), timeSpent: 60, questionsAttempted: 10 },
      { topic: "math_101", score: 0.9, timestamp: new Date(Date.now() - 86400000), timeSpent: 60, questionsAttempted: 10 },
    ],
    lastLoginDate: new Date(),
    registrationDate: new Date(),
  };

  const activeFeatures = extractMasteryFeatures("math_101", activeHistory);
  console.log("\nScenario 2: Active Student (2 Quizzes)");
  console.log(JSON.stringify(activeFeatures, null, 2));

  Object.entries(activeFeatures).forEach(([key, value]) => {
    const constraint = TRAINING_CONSTRAINTS[key as keyof typeof TRAINING_CONSTRAINTS];
    if (constraint) {
      const error = checkConstraint(key, value, constraint);
      if (error) driftReport.push(`Scenario 2 (Active Student) - ${error}`);
    }
  });

  // Scenario 3: Returning Student (Long Absence)
  const returningHistory: StudentHistory = {
    quizResults: [
      { topic: "math_101", score: 0.8, timestamp: new Date(Date.now() - 60 * 86400000), timeSpent: 60, questionsAttempted: 10 },
    ],
    lastLoginDate: new Date(),
    registrationDate: new Date(),
  };

  const returningFeatures = extractMasteryFeatures("math_101", returningHistory);
  console.log("\nScenario 3: Returning Student (60 Days Inactive)");
  console.log(JSON.stringify(returningFeatures, null, 2));

  Object.entries(returningFeatures).forEach(([key, value]) => {
    const constraint = TRAINING_CONSTRAINTS[key as keyof typeof TRAINING_CONSTRAINTS];
    if (constraint) {
      const error = checkConstraint(key, value, constraint);
      if (error) driftReport.push(`Scenario 3 (Returning Student) - ${error}`);
    }
  });

  // Scenario 4: Variance vs StdDev Check
  // StdDev of [0.5, 0.5] is 0. Variance is 0.
  // StdDev of [0.0, 1.0] is 0.5. Variance is 0.25.
  const varianceHistory: StudentHistory = {
    quizResults: [
      { topic: "math_101", score: 0.0, timestamp: new Date(), timeSpent: 60, questionsAttempted: 10 },
      { topic: "math_101", score: 1.0, timestamp: new Date(), timeSpent: 60, questionsAttempted: 10 },
    ],
    lastLoginDate: new Date(),
    registrationDate: new Date(),
  };

  const varianceFeatures = extractMasteryFeatures("math_101", varianceHistory);
  console.log("\nScenario 4: Variance Check (Scores: [0.0, 1.0])");
  // Expected Variance: 0.25 (population) or 0.5 (sample depending on formula). Training data range: [0, 0.3].
  // Expected StdDev: 0.5.
  console.log(`Calculated quiz_score_variance: ${varianceFeatures.quiz_score_variance}`);

  if (varianceFeatures.quiz_score_variance > TRAINING_CONSTRAINTS.quiz_score_variance.max) {
     driftReport.push(`Scenario 4 (Variance Check) - [DRIFT] quiz_score_variance: Value ${varianceFeatures.quiz_score_variance} suggests Standard Deviation is being returned, but Training Data expects Variance (max 0.3).`);
  }


  // Output Report
  console.log("\n\n📊 DRIFT DETECTION REPORT");
  console.log("===========================");
  if (driftReport.length === 0) {
    console.log("✅ No drift detected! Feature extraction matches training assumptions.");
  } else {
    console.log(`❌ Found ${driftReport.length} potential drifts:\n`);
    driftReport.forEach((msg) => console.log(msg));
    process.exit(1); // Exit with error code to fail CI
  }
}

runDriftAnalysis();
