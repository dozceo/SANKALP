
import { describe, test } from 'node:test';
import assert from 'node:assert';
import { SmartRevisionPlannerOutputSchema } from './smart-revision-planner';

describe('Smart Revision Planner Schema', () => {

  test('Valid schema payload should parse successfully', () => {
    const validPayload = {
      revisionList: [
        {
          topic: "Algebra",
          reason: "Low mastery detected",
          priority: "HIGH",
          masteryScore: 0.3
        },
        {
          topic: "Geometry",
          reason: "Spaced repetition",
          priority: "MEDIUM"
        }
      ]
    };

    const result = SmartRevisionPlannerOutputSchema.safeParse(validPayload);
    assert.strictEqual(result.success, true);
  });

  test('Invalid schema: missing required fields', () => {
    const invalidPayload = {
      revisionList: [
        {
          topic: "Algebra"
          // missing reason and priority
        }
      ]
    };

    const result = SmartRevisionPlannerOutputSchema.safeParse(invalidPayload);
    assert.strictEqual(result.success, false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      // revisionList is an array, errors are nested
      // But Zod's error structure for arrays can be complex to assert exactly without more helpers
      // Just asserting failure is enough for this test
    }
  });

  test('Invalid schema: wrong types', () => {
    const invalidPayload = {
      revisionList: [
        {
          topic: 123, // should be string
          reason: "reason",
          priority: "HIGH"
        }
      ]
    };

    const result = SmartRevisionPlannerOutputSchema.safeParse(invalidPayload);
    assert.strictEqual(result.success, false);
  });

  test('Invalid schema: invalid priority enum', () => {
    const invalidPayload = {
      revisionList: [
        {
          topic: "Topic",
          reason: "Reason",
          priority: "URGENT" // Invalid enum value (should be HIGH/MEDIUM/LOW)
        }
      ]
    };

    const result = SmartRevisionPlannerOutputSchema.safeParse(invalidPayload);
    assert.strictEqual(result.success, false);
  });

  test('Edge case: empty revision list', () => {
    const payload = {
      revisionList: []
    };
    const result = SmartRevisionPlannerOutputSchema.safeParse(payload);
    assert.strictEqual(result.success, true);
  });
});
