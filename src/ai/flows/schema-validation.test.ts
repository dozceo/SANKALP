import { z } from 'genkit';
import { AdaptiveQuizOutputSchema } from './adaptive-quiz-engine';
import { SyllabusOutputSchema } from './syllabus-generator';

describe('LLM Schema Validation (Jest)', () => {

  describe('AdaptiveQuizOutputSchema', () => {
    test('Valid payload passes validation', () => {
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
      expect(result.success).toBe(true);
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
      expect(result.success).toBe(false);
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
      expect(result.success).toBe(false);
    });
  });

  describe('SyllabusOutputSchema', () => {
    test('Valid payload passes validation', () => {
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
      expect(result.success).toBe(true);
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
      expect(result.success).toBe(false);
    });
  });
});
