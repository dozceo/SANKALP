
import { describe, test } from 'node:test';
import assert from 'node:assert';
import { makeRevisionDecision, makeInterventionDecision } from './decision-engine';
import { DecisionAction, ContentStrategy, type MLSignals, type DecisionContext } from './types';

// Mock helper to create a base context
const createMockContext = (overrides: Partial<MLSignals> = {}, examDateOverrides: Partial<DecisionContext> = {}): DecisionContext => {
  const defaultSignals: MLSignals = {
    mastery_probability: 0.5,
    confidence: 0.8,
    days_since_last_revision: 5,
    attempts_count: 2,
    attention_risk: "LOW",
    ...overrides
  };

  return {
    studentId: "test-student-1",
    topic: "Test Topic",
    currentDate: new Date(),
    mlSignals: defaultSignals,
    daysUntilExam: 30, // Default far away
    ...examDateOverrides
  };
};

describe('ADK Decision Engine Logic', () => {

  test('Rule 0: Exam Cramming Mode (< 3 days to exam, mastery < 0.6)', () => {
    const context = createMockContext(
      { mastery_probability: 0.5 },
      { daysUntilExam: 2 }
    );
    const decision = makeRevisionDecision(context);

    assert.strictEqual(decision.action, DecisionAction.URGENT_REVISION);
    assert.strictEqual(decision.priority, "HIGH");
    assert.strictEqual(decision.contentStrategy, ContentStrategy.SHORT_FORM);
    assert.ok(decision.adkFlags.includes("CRAMMING_MODE"));
  });

  test('Rule 1: Critical Mastery + Imminent Forgetting (mastery < 0.4, days_until_forget < 3)', () => {
    const context = createMockContext({
      mastery_probability: 0.3,
      days_until_forget: 2
    });
    const decision = makeRevisionDecision(context);

    assert.strictEqual(decision.action, DecisionAction.URGENT_REVISION);
    assert.strictEqual(decision.priority, "HIGH");
    assert.strictEqual(decision.contentStrategy, ContentStrategy.SHORT_FORM);
    assert.ok(decision.adkFlags.includes("FORGETTING_RISK"));
  });

  test('Rule 2: Low Mastery + High Attention Risk (mastery < 0.4, attention_risk = HIGH)', () => {
    const context = createMockContext({
      mastery_probability: 0.35,
      attention_risk: "HIGH"
    });
    const decision = makeRevisionDecision(context);

    assert.strictEqual(decision.action, DecisionAction.ADAPTIVE_TEACHING);
    assert.strictEqual(decision.priority, "HIGH");
    assert.strictEqual(decision.contentStrategy, ContentStrategy.INTERACTIVE);
    assert.ok(decision.adkFlags.includes("ATTENTION_RISK"));
  });

  test('Rule 3: Moderate Mastery + Stale Knowledge (mastery 0.4-0.6, days_since_last_revision > 7)', () => {
    const context = createMockContext({
      mastery_probability: 0.5,
      days_since_last_revision: 8
    });
    const decision = makeRevisionDecision(context);

    assert.strictEqual(decision.action, DecisionAction.SCHEDULED_REVISION);
    assert.strictEqual(decision.priority, "MEDIUM");
    assert.strictEqual(decision.contentStrategy, ContentStrategy.DEEP_DIVE);
    assert.ok(decision.adkFlags.includes("SPACED_REPETITION"));
  });

  test('Rule 4: High Mastery + Recent Revision (mastery >= 0.7, days_since_last_revision <= 14)', () => {
    const context = createMockContext({
      mastery_probability: 0.8,
      days_since_last_revision: 5
    });
    const decision = makeRevisionDecision(context);

    assert.strictEqual(decision.action, DecisionAction.PROGRESS_ALLOWED);
    assert.strictEqual(decision.priority, "LOW");
    assert.strictEqual(decision.contentStrategy, ContentStrategy.CHALLENGE);
    assert.ok(decision.adkFlags.includes("MASTERY_ACHIEVED"));
  });

  test('Default Case: Scheduled Revision', () => {
    // Falls through all rules (e.g. moderate mastery but recent revision)
    const context = createMockContext({
      mastery_probability: 0.5,
      days_since_last_revision: 2
    });
    const decision = makeRevisionDecision(context);

    assert.strictEqual(decision.action, DecisionAction.SCHEDULED_REVISION);
    assert.strictEqual(decision.priority, "MEDIUM");
    assert.strictEqual(decision.contentStrategy, ContentStrategy.DEEP_DIVE);
    assert.ok(decision.adkFlags.includes("ROUTINE_REVISION"));
  });

  test('Intervention Rule 1: Critical Risk', () => {
    const context = createMockContext({
      mastery_probability: 0.2,
      attention_risk: "HIGH",
      days_since_last_revision: 11
    });
    const intervention = makeInterventionDecision(context);

    assert.ok(intervention);
    assert.strictEqual(intervention?.severity, "CRITICAL");
    assert.match(intervention?.suggestedAction || "", /Immediate 1-on-1/);
  });

  test('Intervention Rule 2: High Attention Risk + Dropout Risk', () => {
    const context = createMockContext({
      mastery_probability: 0.5,
      attention_risk: "HIGH",
      dropout_probability: 0.7
    });
    const intervention = makeInterventionDecision(context);

    assert.ok(intervention);
    assert.strictEqual(intervention?.severity, "HIGH");
    assert.match(intervention?.reason || "", /High dropout risk/);
  });

  test('Intervention Rule 3: Persistent Low Mastery (attempts > 5)', () => {
    const context = createMockContext({
      mastery_probability: 0.3,
      attempts_count: 6
    });
    const intervention = makeInterventionDecision(context);

    assert.ok(intervention);
    assert.strictEqual(intervention?.severity, "MEDIUM");
    assert.match(intervention?.reason || "", /Repeated attempts/);
  });

  test('No Intervention Needed', () => {
    const context = createMockContext({
      mastery_probability: 0.8,
      attention_risk: "LOW"
    });
    const intervention = makeInterventionDecision(context);

    assert.strictEqual(intervention, null);
  });
});
