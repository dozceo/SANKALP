
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
      const context = createMockContext(
        { mastery_probability: 0.60, days_since_last_revision: 5 },
        { daysUntilExam: 2 }
      );
      const decision = makeRevisionDecision(context);
      // Fall through to Default or Rule 3 check
      assert.strictEqual(decision.action, DecisionAction.SCHEDULED_REVISION);
      assert.strictEqual(decision.priority, "MEDIUM");
      assert.ok(decision.adkFlags.includes("ROUTINE_REVISION") || decision.adkFlags.includes("SPACED_REPETITION"));
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

    test('Mastery exactly 0.69 (just below Rule 4 threshold)', () => {
        // Rule 4: mastery >= 0.7. So 0.69 fails.
        // Assuming days <= 14.
        const context = createMockContext({
            mastery_probability: 0.69,
            days_since_last_revision: 5
        });
        const decision = makeRevisionDecision(context);
        // Should fall through to Default (ROUTINE_REVISION) as it's > 0.6 but < 0.7
        // (Rule 3 is < 0.6, Rule 4 is >= 0.7)
        assert.strictEqual(decision.action, DecisionAction.SCHEDULED_REVISION);
        assert.ok(decision.adkFlags.includes("ROUTINE_REVISION"));
    });

    test('Mastery exactly 0.70 (threshold for Rule 4)', () => {
        // Rule 4: mastery >= 0.7. So 0.70 passes.
        const context = createMockContext({
            mastery_probability: 0.70,
            days_since_last_revision: 5
        });
        const decision = makeRevisionDecision(context);
        assert.strictEqual(decision.action, DecisionAction.PROGRESS_ALLOWED);
        assert.ok(decision.adkFlags.includes("MASTERY_ACHIEVED"));
    });

    test('Mastery exactly 0.71 (just above threshold)', () => {
        const context = createMockContext({
            mastery_probability: 0.71,
            days_since_last_revision: 5
        });
        const decision = makeRevisionDecision(context);
        assert.strictEqual(decision.action, DecisionAction.PROGRESS_ALLOWED);
        assert.ok(decision.adkFlags.includes("MASTERY_ACHIEVED"));
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

    test('Undefined days_until_forget', () => {
        // Rule 1 checks: (mlSignals.days_until_forget ?? 999) < 3
        // So undefined becomes 999.
        // If mastery < 0.4, Rule 1 should FAIL (999 < 3 is false).
        // Then Rule 2 checks attention_risk.
        const context = createMockContext({
            mastery_probability: 0.3,
            attention_risk: "LOW"
        });
        // Ensure days_until_forget is undefined (it is by default in createMock unless overridden, but let's be explicit)
        context.mlSignals.days_until_forget = undefined;

        const decision = makeRevisionDecision(context);
        // Rule 1 failed. Rule 2 failed (risk LOW). Rule 3 failed (<0.4). Rule 4 failed.
        // Default.
        assert.strictEqual(decision.action, DecisionAction.SCHEDULED_REVISION);
        assert.ok(decision.adkFlags.includes("ROUTINE_REVISION"));
    });

    test('Negative mastery probability (Invalid Input handling)', () => {
        // If mastery is negative (e.g. -0.5), it is < 0.6, < 0.4.
        // Should trigger Rule 1 or 2 if other conditions met.
        // Let's trigger Rule 1.
        const context = createMockContext({
            mastery_probability: -0.5,
            days_until_forget: 2
        });
        const decision = makeRevisionDecision(context);
        assert.strictEqual(decision.action, DecisionAction.URGENT_REVISION);
        assert.ok(decision.adkFlags.includes("FORGETTING_RISK"));
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

    test('High mastery (0.8) + High Attention Risk', () => {
        // Mastery 0.8. Attention HIGH.
        // Rule 2 requires mastery < 0.4. So Rule 2 fails.
        // Rule 4 requires mastery >= 0.7. So Rule 4 passes (if recent revision).
        const context = createMockContext({
            mastery_probability: 0.8,
            attention_risk: "HIGH",
            days_since_last_revision: 5
        });
        const decision = makeRevisionDecision(context);
        assert.strictEqual(decision.action, DecisionAction.PROGRESS_ALLOWED);
        assert.ok(decision.adkFlags.includes("MASTERY_ACHIEVED"));
    });
  });

});
