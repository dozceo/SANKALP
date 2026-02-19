
import { describe, test } from 'node:test';
import assert from 'node:assert';
import { AdaptiveQuizOutputSchema } from './adaptive-quiz-engine';
import { SyllabusOutputSchema } from './syllabus-generator';

describe('LLM Schema Regression Tests', () => {

  describe('AdaptiveQuizOutputSchema', () => {
    test('Valid payload', () => {
      const payload = {
        quiz: [
          {
            question: "What is 2+2?",
            options: ["3", "4", "5", "6"],
            correctAnswer: "4"
          }
        ],
        isFallback: false
      };
      const result = AdaptiveQuizOutputSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test('Invalid payload: Missing options', () => {
      const payload = {
        quiz: [
          {
            question: "What is 2+2?",
            correctAnswer: "4"
          }
        ]
      };
      const result = AdaptiveQuizOutputSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    test('Invalid payload: Options not an array of strings', () => {
      const payload = {
        quiz: [
          {
            question: "What is 2+2?",
            options: [1, 2, 3, 4], // numbers instead of strings
            correctAnswer: "4"
          }
        ]
      };
      const result = AdaptiveQuizOutputSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    test('Edge case: Empty quiz array', () => {
      const payload = {
        quiz: []
      };
      const result = AdaptiveQuizOutputSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test('Edge case: Huge question text', () => {
        const hugeText = "a".repeat(10000);
        const payload = {
            quiz: [
                {
                    question: hugeText,
                    options: ["a", "b", "c", "d"],
                    correctAnswer: "a"
                }
            ]
        };
        const result = AdaptiveQuizOutputSchema.safeParse(payload);
        assert.strictEqual(result.success, true);
    });

    test('Extra fields are stripped or allowed (default Zod behavior is strip)', () => {
        const payload = {
            quiz: [],
            extraField: "should be ignored"
        };
        const result = AdaptiveQuizOutputSchema.safeParse(payload);
        assert.strictEqual(result.success, true);
        // If we want to test strictness, we'd check if output has extraField.
        // Usually safeParse returns data with stripped fields unless .strict() is used.
        if (result.success) {
            assert.strictEqual((result.data as any).extraField, undefined);
        }
    });

    test('Missing quiz array (should fail)', () => {
        const payload = {
            isFallback: true
        };
        const result = AdaptiveQuizOutputSchema.safeParse(payload);
        assert.strictEqual(result.success, false);
    });
  });

  describe('SyllabusOutputSchema', () => {
    test('Valid payload', () => {
      const payload = {
        title: "Calculus",
        structure: "Chapter 1: Limits...",
        strategy: "Study hard",
        references: [
          "https://example.com/1",
          "https://example.com/2",
          "https://example.com/3",
          "https://example.com/4",
          "https://example.com/5"
        ]
      };
      const result = SyllabusOutputSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test('Invalid payload: Invalid URL in references', () => {
      const payload = {
        title: "Calculus",
        structure: "...",
        strategy: "...",
        references: [
          "not-a-url"
        ]
      };
      const result = SyllabusOutputSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    test('Invalid payload: Missing structure', () => {
      const payload = {
        title: "Calculus",
        strategy: "...",
        references: []
      };
      const result = SyllabusOutputSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    test('Edge case: Empty references array', () => {
      const payload = {
        title: "Calculus",
        structure: "...",
        strategy: "...",
        references: []
      };
      const result = SyllabusOutputSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });
  });

});
