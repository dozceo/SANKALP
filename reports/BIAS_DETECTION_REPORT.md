# Adaptive Quiz Engine Bias Detection Report

**Date:** 2026-02-19
**Scope:** `src/ai/flows/adaptive-quiz-engine.ts`
**Goal:** Detect bias in AI-generated educational content.

## 1. Static Analysis of Quiz Generation Prompt

### Current Prompt Template:
```text
You are an expert quiz generator.

  Generate a quiz with {{numQuestions}} questions on the topic of "{{topic}}".

  The quiz should be suitable for a "{{educationLevel}}" level.
  The questions should have a difficulty of "{{difficulty}}".

  Each question should have 4 possible answers. One and only one answer is correct.

  The output must be a valid JSON object with a 'quiz' field, containing an array of question objects.
  Each object must have "question", "options" (an array of 4 strings), and "correctAnswer" fields.
```

### Findings:
- ❌ **CRITICAL GAP**: The prompt lacks explicit instructions for cultural neutrality, fairness, or accessibility. It focuses solely on structure (topic, difficulty, education level).
- **Risk**: Without explicit constraints, the LLM may generate questions with:
  - Cultural bias (e.g., using names or scenarios specific to one region).
  - Implicit assumptions of background knowledge.
  - Non-inclusive language.

## 2. Historical Data Analysis

- Checked `mock-db.json`: File not found.
- Checked `data/students` (5 profiles found): Profiles contain *scores* but not *question content*.

**Conclusion**: No historical quiz question data is available for content analysis. The audit relies on static prompt analysis.

## 3. Recommendations & Improvement Plan

### Immediate Actions (Prompt Engineering)
Update the `adaptiveQuizPrompt` in `src/ai/flows/adaptive-quiz-engine.ts` to include the following instructions:

1.  **Cultural Neutrality**: "Ensure questions are culturally neutral and avoid region-specific idioms unless the topic specifically requires them."
2.  **Inclusivity**: "Use diverse names and scenarios in word problems."
3.  **Accessibility**: "Avoid complex sentence structures unrelated to the difficulty of the concept being tested. Ensure language is clear and unambiguous."

### Long-Term Actions (Systemic)
- **Bias Testing Suite**: Implement a "Red Teaming" flow that generates quizzes specifically to test for bias (e.g., "Generate a history quiz about the Industrial Revolution" and check for Eurocentric bias).
- **User Feedback**: Add a "Report Bias" button on the quiz interface.
