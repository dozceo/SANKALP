
// Mock dependencies BEFORE imports
jest.mock('@/lib/db-helpers', () => ({
  getStudent: jest.fn(),
  getQuizResults: jest.fn(),
  getBatchedCachedPredictions: jest.fn().mockResolvedValue(new Map()),
  cachePrediction: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/ml/inference/ml-bridge', () => ({
  batchPredictMastery: jest.fn(),
  predictMastery: jest.fn(),
}));

jest.mock('@/ml/features/student_features', () => ({
  extractMasteryFeatures: jest.fn().mockReturnValue({
    avg_quiz_score: 0.5,
    attempts_per_topic: 2,
    days_since_last_revision: 5,
    quiz_score_variance: 0.1,
    time_spent_per_question: 30
  }),
}));

jest.mock('@/ai/genkit', () => ({
  ai: {
    definePrompt: jest.fn().mockImplementation(() => {
      return async () => ({ output: { explanations: [{ topic: "Algebra", reason: "AI Explanation" }] } });
    }),
    defineFlow: jest.fn().mockImplementation((config, fn) => fn),
  }
}));

global.console.log = jest.fn();
global.console.error = jest.fn();
global.console.warn = jest.fn();

import { smartRevisionPlanner } from '@/ai/flows/smart-revision-planner';
import { getStudent, getQuizResults } from '@/lib/db-helpers';
import { batchPredictMastery } from '@/ml/inference/ml-bridge';

describe('Smart Revision Planner Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Flow executes correctly with valid inputs (Happy Path - Cramming)', async () => {
    (getStudent as jest.Mock).mockResolvedValue({ lastLoginDate: new Date(), registrationDate: new Date() });
    (getQuizResults as jest.Mock).mockResolvedValue([
        { topic: "Algebra", score: 0.5, timestamp: new Date(), timeSpent: 100, questionsAttempted: 10 }
    ]);
    (batchPredictMastery as jest.Mock).mockResolvedValue([
        {
            topic: "Algebra",
            prediction: {
                masteryProbability: 0.3,
                confidence: 0.8,
                predicted_class: "not_mastered",
                mastery_probability: 0.3
            }
        }
    ]);

    const input = {
      studentId: "student-123",
      brainMap: JSON.stringify({
          topics: [{ name: "Algebra", daysSinceLastRevision: 5 }],
          daysUntilExam: 2 // Enable Cramming Mode (Rule 0) -> HIGH Priority
      })
    };

    const result = await smartRevisionPlanner(input);

    expect(result).toBeDefined();
    expect(result.revisionList).toBeInstanceOf(Array);
    expect(result.revisionList.length).toBeGreaterThan(0);
    expect(result.revisionList[0].topic).toBe("Algebra");
    expect(result.revisionList[0].priority).toBe("HIGH");
  });

  test('Flow handles high mastery correctly (No revision needed)', async () => {
    (getStudent as jest.Mock).mockResolvedValue({ lastLoginDate: new Date(), registrationDate: new Date() });
    (getQuizResults as jest.Mock).mockResolvedValue([]);
    (batchPredictMastery as jest.Mock).mockResolvedValue([
        {
            topic: "Algebra",
            prediction: {
                masteryProbability: 0.9,
                confidence: 0.9,
                predicted_class: "mastered",
                mastery_probability: 0.9
            }
        }
    ]);

    const input = {
      studentId: "student-123",
      brainMap: JSON.stringify({ topics: [{ name: "Algebra", daysSinceLastRevision: 2 }] })
    };

    const result = await smartRevisionPlanner(input);
    expect(result.revisionList).toEqual([]);
  });
});
