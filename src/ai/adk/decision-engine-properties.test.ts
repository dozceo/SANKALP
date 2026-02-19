
import { describe, test } from 'node:test';
import assert from 'node:assert';
import { makeRevisionDecision } from './decision-engine';
import { DecisionAction, MLSignals, DecisionContext } from './types';

// Helper to generate random MLSignals
const generateRandomSignals = (): MLSignals => {
  return {
    mastery_probability: Math.random(), // 0 to 1
    confidence: Math.random(),
    days_since_last_revision: Math.floor(Math.random() * 30), // 0 to 30 days
    attempts_count: Math.floor(Math.random() * 10), // 0 to 10
    attention_risk: Math.random() > 0.6 ? "HIGH" : (Math.random() > 0.3 ? "MEDIUM" : "LOW"),
    days_until_forget: Math.floor(Math.random() * 10), // 0 to 10
    dropout_probability: Math.random()
  };
};

const createRandomContext = (): DecisionContext => {
  return {
    studentId: `student-${Math.floor(Math.random() * 1000)}`,
    topic: "Property Test Topic",
    currentDate: new Date(),
    mlSignals: generateRandomSignals(),
    daysUntilExam: Math.floor(Math.random() * 40) - 5 // -5 to 35 days (some past/exam day)
  };
};

describe('ADK Decision Engine Property-Based Tests', () => {

  test('Invariant: Urgency should never be LOW if mastery < 0.3', () => {
    for (let i = 0; i < 100; i++) {
      const context = createRandomContext();
      // Force mastery low
      context.mlSignals.mastery_probability = Math.random() * 0.29;

      const decision = makeRevisionDecision(context);

      if (decision.priority === "LOW") {
        console.error("Violation context:", JSON.stringify(context, null, 2));
        console.error("Decision:", JSON.stringify(decision, null, 2));
      }

      assert.notStrictEqual(decision.priority, "LOW", `Urgency was LOW for mastery ${context.mlSignals.mastery_probability}`);
    }
  });

  test('Invariant: Reasoning string should never be empty', () => {
    for (let i = 0; i < 100; i++) {
      const context = createRandomContext();
      const decision = makeRevisionDecision(context);
      assert.ok(decision.reasoning && decision.reasoning.length > 0, "Reasoning string is empty");
    }
  });

  test('Invariant: Cramming Mode is always triggered if exam is imminent (< 3 days) and mastery < 0.6', () => {
    for (let i = 0; i < 100; i++) {
      const context = createRandomContext();
      // Force exam imminent
      context.daysUntilExam = Math.floor(Math.random() * 3); // 0, 1, 2
      // Force mastery < 0.6
      context.mlSignals.mastery_probability = Math.random() * 0.59;

      const decision = makeRevisionDecision(context);

      assert.strictEqual(decision.action, DecisionAction.URGENT_REVISION);
      assert.ok(decision.adkFlags.includes("CRAMMING_MODE"), `Cramming mode not triggered. Days: ${context.daysUntilExam}, Mastery: ${context.mlSignals.mastery_probability}`);
    }
  });

});
