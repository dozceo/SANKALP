
import { describe, test } from 'node:test';
import assert from 'node:assert';
import { makeRevisionDecision } from './decision-engine';
import { DecisionAction, ContentStrategy, type MLSignals, type DecisionContext } from './types';

// Mock helper to create a base context (same as original test)
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
    studentId: "test-student-regression",
    topic: "Regression Test Topic",
    currentDate: new Date(),
    mlSignals: defaultSignals,
    daysUntilExam: 30,
    ...examDateOverrides
  };
};

describe('ADK Decision Engine Regression Tests', () => {

  describe('Boundary Cases', () => {
    test('Mastery exactly 0.59 (just below cramming threshold) with < 3 days to exam', () => {
      // Rule 0: daysUntilExam <= 3 && mastery < 0.6 => URGENT_REVISION
      const context = createMockContext(
        { mastery_probability: 0.59 },
        { daysUntilExam: 2 }
      );
      const decision = makeRevisionDecision(context);
      assert.strictEqual(decision.action, DecisionAction.URGENT_REVISION);
      assert.strictEqual(decision.priority, "HIGH");
      assert.ok(decision.adkFlags.includes("CRAMMING_MODE"));
    });

    test('Mastery exactly 0.60 (boundary for cramming) with < 3 days to exam', () => {
      // Rule 0 condition: mastery < 0.6. So 0.6 should FAIL Rule 0.
      // Next rule might trigger depending on other factors.
      // Let's assume other factors don't trigger Rule 1 or 2 (mastery < 0.4).
      // Here mastery is 0.6. Rule 3: mastery >= 0.4 && < 0.6 (FALSE, 0.6 is not < 0.6)
      // Wait, Rule 3 condition: mastery >= 0.4 && mastery < 0.6.
      // So 0.6 fails Rule 3.
      // Rule 4: mastery >= 0.7. (FALSE)
      // So it should fall through to Default.
      const context = createMockContext(
        { mastery_probability: 0.60, days_since_last_revision: 5 },
        { daysUntilExam: 2 }
      );
      const decision = makeRevisionDecision(context);
      assert.strictEqual(decision.action, DecisionAction.SCHEDULED_REVISION);
      assert.strictEqual(decision.priority, "MEDIUM");
      assert.ok(decision.adkFlags.includes("ROUTINE_REVISION"));
    });

    test('Mastery exactly 0.40 (boundary for Rule 1 & 2)', () => {
      // Rule 1: mastery < 0.4. So 0.4 fails.
      // Rule 2: mastery < 0.4. So 0.4 fails.
      // Rule 3: mastery >= 0.4 && < 0.6. So 0.4 passes Rule 3 if days > 7.
      const context = createMockContext({
        mastery_probability: 0.40,
        days_since_last_revision: 8
      });
      const decision = makeRevisionDecision(context);
      assert.strictEqual(decision.action, DecisionAction.SCHEDULED_REVISION);
      // It matches Rule 3
      assert.ok(decision.adkFlags.includes("SPACED_REPETITION"));
    });
  });

  describe('Edge Cases', () => {
    test('Days until exam is 0 (Exam Day)', () => {
      // Rule 0: daysUntilExam <= 3. 0 <= 3 is true.
      // If mastery < 0.6, it should be CRAMMING_MODE.
      const context = createMockContext(
        { mastery_probability: 0.5 },
        { daysUntilExam: 0 }
      );
      const decision = makeRevisionDecision(context);
      assert.strictEqual(decision.action, DecisionAction.URGENT_REVISION);
      assert.ok(decision.adkFlags.includes("CRAMMING_MODE"));
    });

    test('Negative days until exam (Exam passed)', () => {
        // Logic: daysUntilExam <= 3. -1 <= 3 is true.
        // This might be a logic "bug" or feature. Technically cramming mode still active?
        // Let's verify behavior. If user hasn't updated exam date, system might treat as ongoing cramming.
        const context = createMockContext(
          { mastery_probability: 0.5 },
          { daysUntilExam: -1 }
        );
        const decision = makeRevisionDecision(context);
        assert.strictEqual(decision.action, DecisionAction.URGENT_REVISION);
        assert.ok(decision.adkFlags.includes("CRAMMING_MODE"));
    });

    test('Mastery exactly 0', () => {
        const context = createMockContext({
            mastery_probability: 0.0,
            days_since_last_revision: 10
        });
        // Should hit Rule 1 or 2 if other conditions met, or Rule 3?
        // Rule 3 requires mastery >= 0.4.
        // Rule 1: mastery < 0.4 && days_until_forget < 3.
        // Let's force Rule 1
        context.mlSignals.days_until_forget = 1;
        const decision = makeRevisionDecision(context);
        assert.strictEqual(decision.action, DecisionAction.URGENT_REVISION);
        assert.ok(decision.adkFlags.includes("FORGETTING_RISK"));
    });

    test('Mastery exactly 1', () => {
        const context = createMockContext({
            mastery_probability: 1.0,
            days_since_last_revision: 5
        });
        // Rule 4: mastery >= 0.7 && days <= 14.
        const decision = makeRevisionDecision(context);
        assert.strictEqual(decision.action, DecisionAction.PROGRESS_ALLOWED);
        assert.ok(decision.adkFlags.includes("MASTERY_ACHIEVED"));
    });
  });

  describe('Combination Cases', () => {
    test('High mastery but high forgetting risk (Priority conflict)', () => {
        // Mastery 0.9 (Rule 4 candidate)
        // Forgetting risk < 3 (Rule 1 candidate, but Rule 1 requires mastery < 0.4)
        // So Rule 1 shouldn't trigger.
        // Should get Rule 4.
        const context = createMockContext({
            mastery_probability: 0.9,
            days_until_forget: 1,
            days_since_last_revision: 5
        });
        const decision = makeRevisionDecision(context);
        assert.strictEqual(decision.action, DecisionAction.PROGRESS_ALLOWED);
        assert.ok(decision.adkFlags.includes("MASTERY_ACHIEVED"));
    });

    test('Low mastery, exam far away, but high attention risk', () => {
        // Mastery 0.3
        // Exam 30 days
        // Attention HIGH
        // Should trigger Rule 2
        const context = createMockContext({
            mastery_probability: 0.3,
            attention_risk: "HIGH"
        }, { daysUntilExam: 30 });
        const decision = makeRevisionDecision(context);
        assert.strictEqual(decision.action, DecisionAction.ADAPTIVE_TEACHING);
        assert.ok(decision.adkFlags.includes("ATTENTION_RISK"));
    });
  });

});
