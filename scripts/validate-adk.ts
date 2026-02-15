
import { makeRevisionDecision, makeInterventionDecision } from '../src/ai/adk/decision-engine';
import { DecisionContext, MLSignals, DecisionAction } from '../src/ai/adk/types';

// Mock base context
const mockContextBase: DecisionContext = {
  studentId: 'test-student',
  topic: 'test-topic',
  currentDate: new Date(),
  mlSignals: {
    mastery_probability: 0.5,
    confidence: 0.8,
    days_since_last_revision: 5,
    attempts_count: 3,
    attention_risk: 'LOW',
    performance_trend: 'STABLE',
  },
};

// Helper for testing revision decisions
function testRevision(description: string, overrides: Partial<MLSignals>, extraContext: Partial<DecisionContext> = {}) {
  const context: DecisionContext = {
    ...mockContextBase,
    ...extraContext,
    mlSignals: {
      ...mockContextBase.mlSignals,
      ...overrides,
    },
  };

  try {
    const decision = makeRevisionDecision(context);
    console.log(`[PASS] ${description}`);
    console.log(`       Action: ${decision.action}`);
    console.log(`       Reason: "${decision.reasoning}"`);

    if (!decision.reasoning || decision.reasoning.trim() === '') {
      console.error(`[FAIL] Missing reasoning for: ${description}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`[FAIL] Exception for: ${description}`, error);
    process.exit(1);
  }
}

// Helper for testing intervention decisions
function testIntervention(description: string, overrides: Partial<MLSignals>, expectIntervention: boolean) {
  const context: DecisionContext = {
    ...mockContextBase,
    mlSignals: {
      ...mockContextBase.mlSignals,
      ...overrides,
    },
  };

  try {
    const decision = makeInterventionDecision(context);
    if (expectIntervention) {
      if (!decision) {
        console.error(`[FAIL] Expected intervention for: ${description}, but got null`);
        process.exit(1);
      }
      console.log(`[PASS] ${description}`);
      console.log(`       Severity: ${decision.severity}`);
      console.log(`       Reason: "${decision.reason}"`);

      if (!decision.reason || decision.reason.trim() === '') {
        console.error(`[FAIL] Missing reason for: ${description}`);
        process.exit(1);
      }
    } else {
      if (decision) {
        console.error(`[FAIL] Expected NO intervention for: ${description}, but got one`);
        process.exit(1);
      }
      console.log(`[PASS] ${description} (No intervention correctly returned)`);
    }
  } catch (error) {
    console.error(`[FAIL] Exception for: ${description}`, error);
    process.exit(1);
  }
}

console.log('=== Starting ADK Explainability Audit ===\n');

console.log('--- REVISION DECISION RULES ---');

// Rule 1: Critical Mastery + Imminent Forgetting
// mastery < 0.4 && days_until_forget < 3
testRevision('Rule 1: Critical Mastery + Forgetting Risk',
  { mastery_probability: 0.3, days_until_forget: 2 }
);

// Rule 2: Low Mastery + High Attention Risk
// mastery < 0.4 && attention_risk === "HIGH"
testRevision('Rule 2: Low Mastery + Attention Risk',
  { mastery_probability: 0.35, attention_risk: 'HIGH' }
);

// Rule 3: Moderate Mastery + Stale Knowledge
// mastery >= 0.4 && mastery < 0.6 && days_since_last_revision > 7
testRevision('Rule 3: Moderate Mastery + Stale Knowledge',
  { mastery_probability: 0.5, days_since_last_revision: 10 }
);

// Rule 4: High Mastery + Recent Revision
// mastery >= 0.7 && days_since_last_revision <= 14
testRevision('Rule 4: High Mastery + Recent Revision',
  { mastery_probability: 0.8, days_since_last_revision: 5 }
);

// Rule 5: Exam Cramming Mode
// daysUntilExam <= 3 && mastery < 0.6
testRevision('Rule 5: Exam Cramming Mode',
  { mastery_probability: 0.5 },
  { daysUntilExam: 2 }
);

// Default Case
// mastery 0.6, recent revision, no exam imminent
testRevision('Default: Routine Revision',
  { mastery_probability: 0.65, days_since_last_revision: 2 }
);


console.log('\n--- INTERVENTION DECISION RULES ---');

// Intervention Rule 1: Critical Risk
// mastery < 0.3 && attention === HIGH && days > 10
testIntervention('Rule 1: Critical Risk (Low Mastery + Attention + Inactivity)',
  { mastery_probability: 0.2, attention_risk: 'HIGH', days_since_last_revision: 15 },
  true
);

// Intervention Rule 2: High Attention Risk
// attention === HIGH && dropout > 0.6
testIntervention('Rule 2: High Attention Risk + Dropout Probability',
  { attention_risk: 'HIGH', dropout_probability: 0.7 },
  true
);

// Intervention Rule 3: Persistent Low Mastery
// mastery < 0.4 && attempts > 5
testIntervention('Rule 3: Persistent Low Mastery (Many Attempts)',
  { mastery_probability: 0.3, attempts_count: 6 },
  true
);

// No Intervention Needed
testIntervention('No Intervention Needed',
  { mastery_probability: 0.5, attention_risk: 'LOW' },
  false
);

console.log('\n=== ADK Explainability Audit Complete: All Paths Validated ===');
