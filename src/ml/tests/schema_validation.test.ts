import { AdaptiveQuizOutputSchema } from '../../ai/flows/adaptive-quiz-engine';
import { SyllabusOutputSchema } from '../../ai/flows/syllabus-generator';

describe('LLM Schema Validation', () => {
  describe('AdaptiveQuizOutputSchema', () => {
    test('Valid Schema: accepts correct structure', () => {
      const validData = {
        quiz: [
          {
            question: 'What is 2+2?',
            options: ['3', '4', '5', '6'],
            correctAnswer: '4',
          },
        ],
        isFallback: false,
      };
      expect(() => AdaptiveQuizOutputSchema.parse(validData)).not.toThrow();
    });

    test('Invalid Schema: rejects missing required fields', () => {
      const invalidData = {
        quiz: [
          {
            question: 'What is 2+2?',
            options: ['3', '4', '5', '6'],
            // correctAnswer missing
          },
        ],
      };
      expect(() => AdaptiveQuizOutputSchema.parse(invalidData)).toThrow();
    });

    test('Invalid Schema: rejects wrong data types', () => {
      const invalidData = {
        quiz: 'not an array',
      };
      expect(() => AdaptiveQuizOutputSchema.parse(invalidData)).toThrow();
    });
  });

  describe('SyllabusOutputSchema', () => {
    test('Valid Schema: accepts correct structure', () => {
      const validData = {
        title: 'Basic Math',
        structure: 'Chapter 1: Numbers\nChapter 2: Algebra',
        strategy: 'Study hard for 2 weeks.',
        references: [
          'https://example.com/ref1',
          'https://example.com/ref2',
          'https://example.com/ref3',
          'https://example.com/ref4',
          'https://example.com/ref5',
        ],
      };
      expect(() => SyllabusOutputSchema.parse(validData)).not.toThrow();
    });

    test('Invalid Schema: rejects invalid URL in references', () => {
      const invalidData = {
        title: 'Basic Math',
        structure: 'Structure...',
        strategy: 'Strategy...',
        references: ['not a url'],
      };
      expect(() => SyllabusOutputSchema.parse(invalidData)).toThrow();
    });
  });
});
