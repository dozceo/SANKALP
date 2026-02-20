
import { makeRevisionDecision, makeInterventionDecision, selectContentStrategy } from './decision-engine';
import { DecisionAction, ContentStrategy, type MLSignals, type DecisionContext } from './types';
import * as fc from 'fast-check';

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
    studentId: "test-student-jest",
    topic: "Jest Topic",
    currentDate: new Date(),
    mlSignals: defaultSignals,
    daysUntilExam: 30,
    ...examDateOverrides
  };
};

describe('ADK Decision Engine', () => {

  describe('Rule-Based Logic', () => {
    test('Rule 0: Cramming Mode', () => {
      const context = createMockContext({ mastery_probability: 0.5 }, { daysUntilExam: 2 });
      const decision = makeRevisionDecision(context);
      expect(decision.action).toBe(DecisionAction.URGENT_REVISION);
      expect(decision.priority).toBe("HIGH");
      expect(decision.contentStrategy).toBe(ContentStrategy.SHORT_FORM);
      expect(decision.adkFlags).toContain("CRAMMING_MODE");
    });

    test('Rule 1: Forgetting Risk', () => {
      const context = createMockContext({ mastery_probability: 0.3, days_until_forget: 2 });
      const decision = makeRevisionDecision(context);
      expect(decision.action).toBe(DecisionAction.URGENT_REVISION);
      expect(decision.adkFlags).toContain("FORGETTING_RISK");
    });

    test('Rule 2: Attention Risk', () => {
      const context = createMockContext({ mastery_probability: 0.35, attention_risk: "HIGH" });
      const decision = makeRevisionDecision(context);
      expect(decision.action).toBe(DecisionAction.ADAPTIVE_TEACHING);
      expect(decision.adkFlags).toContain("ATTENTION_RISK");
    });

    test('Rule 3: Spaced Repetition', () => {
      const context = createMockContext({ mastery_probability: 0.5, days_since_last_revision: 8 });
      const decision = makeRevisionDecision(context);
      expect(decision.action).toBe(DecisionAction.SCHEDULED_REVISION);
      expect(decision.adkFlags).toContain("SPACED_REPETITION");
    });

    test('Rule 4: Mastery Achieved', () => {
      const context = createMockContext({ mastery_probability: 0.8, days_since_last_revision: 5 });
      const decision = makeRevisionDecision(context);
      expect(decision.action).toBe(DecisionAction.PROGRESS_ALLOWED);
      expect(decision.adkFlags).toContain("MASTERY_ACHIEVED");
    });
  });

  describe('Boundary Tests', () => {
    test('Mastery 0.59 with short exam deadline triggers Cramming', () => {
      const context = createMockContext({ mastery_probability: 0.59 }, { daysUntilExam: 3 });
      const decision = makeRevisionDecision(context);
      expect(decision.action).toBe(DecisionAction.URGENT_REVISION);
    });

    test('Mastery 0.60 with short exam deadline misses Cramming threshold', () => {
       // Assuming days_since_last_revision is low enough to avoid Rule 3
       const context = createMockContext({ mastery_probability: 0.60, days_since_last_revision: 2 }, { daysUntilExam: 3 });
       const decision = makeRevisionDecision(context);
       // Should fall to Default
       expect(decision.adkFlags).toContain("ROUTINE_REVISION");
    });
  });

  describe('Intervention Logic', () => {
    test('Critical Risk Intervention', () => {
        const context = createMockContext({
            mastery_probability: 0.2,
            attention_risk: "HIGH",
            days_since_last_revision: 11
        });
        const intervention = makeInterventionDecision(context);
        expect(intervention).not.toBeNull();
        expect(intervention?.severity).toBe("CRITICAL");
    });

    test('No Intervention for good student', () => {
        const context = createMockContext({ mastery_probability: 0.9 });
        expect(makeInterventionDecision(context)).toBeNull();
    });
  });

  describe('Property-Based Tests', () => {
    const arbSignals = fc.record({
        mastery_probability: fc.float({ min: 0, max: 1 }),
        confidence: fc.float({ min: 0, max: 1 }),
        days_since_last_revision: fc.integer({ min: 0, max: 365 }),
        attempts_count: fc.integer({ min: 0, max: 100 }),
        attention_risk: fc.constantFrom("LOW", "MEDIUM", "HIGH"),
        days_until_forget: fc.option(fc.integer({ min: 0, max: 100 })),
        dropout_probability: fc.option(fc.float({ min: 0, max: 1 }))
    });

    const arbContext = fc.record({
        studentId: fc.string(),
        topic: fc.string(),
        currentDate: fc.date(),
        // mlSignals will be generated separately
        daysUntilExam: fc.option(fc.integer({ min: -10, max: 365 })),
    });

    test('Decision action is always valid enum member', () => {
        fc.assert(
            fc.property(arbContext, arbSignals, (ctxBase, signals) => {
                const ctx = { ...ctxBase, mlSignals: signals as MLSignals } as DecisionContext;
                const decision = makeRevisionDecision(ctx);
                expect(Object.values(DecisionAction)).toContain(decision.action);
            })
        );
    });

    test('High mastery (>0.8) should never trigger URGENT_REVISION unless cramming', () => {
        fc.assert(
            fc.property(arbContext, arbSignals, (ctxBase, signals) => {
                const signalsHighMastery = { ...signals, mastery_probability: 0.85 };
                const ctx = { ...ctxBase, mlSignals: signalsHighMastery as MLSignals } as DecisionContext;

                // If not cramming (exam far away)
                if (ctx.daysUntilExam === undefined || ctx.daysUntilExam > 3) {
                    const decision = makeRevisionDecision(ctx);
                    expect(decision.action).not.toBe(DecisionAction.URGENT_REVISION);
                }
            })
        );
    });

    test('Strategy Selection returns non-empty string', () => {
         fc.assert(
            fc.property(arbContext, arbSignals, (ctxBase, signals) => {
                const ctx = { ...ctxBase, mlSignals: signals as MLSignals } as DecisionContext;
                const decision = makeRevisionDecision(ctx);
                const strategy = selectContentStrategy(decision);
                expect(typeof strategy).toBe('string');
                expect(strategy.length).toBeGreaterThan(0);
            })
        );
    });
  });

});
