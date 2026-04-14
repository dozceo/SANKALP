# Server Action Security Matrix

**Date:** 2026-02-17T19:27:25.727Z
**Scope:** `src/**` (Files with `"use server"`)

## Summary
Found 15 Server Action files.
- High Risk: 15
- Medium Risk: 0
- Low Risk: 0

## Detailed Matrix

| File | Risk | Auth Check Found | Exported Actions | Notes |
|------|------|------------------|------------------|-------|
| `src/app/actions/student-configuration.ts` | **HIGH** | ❌ | `saveChatbotConfiguration` | Missing explicit authentication check |
| `src/app/actions/ai-error.ts` | **HIGH** | ❌ | `generateFriendlyErrorMessage` | Missing explicit authentication check |
| `src/app/(main)/syllabus/actions.ts` | **HIGH** | ❌ | `getSyllabus` | Missing explicit authentication check |
| `src/app/(main)/quiz/actions.ts` | **HIGH** | ❌ | `createQuiz` | Missing explicit authentication check |
| `src/app/(main)/planner/actions.ts` | **HIGH** | ❌ | `getRevisionPlan` | Missing explicit authentication check |
| `src/app/(main)/mentor/actions.ts` | **HIGH** | ❌ | `getMotivationalAdvice` | Missing explicit authentication check |
| `src/app/(main)/chat/actions.ts` | **HIGH** | ❌ | `getExplanation, getTextToSpeech, audioConversation` | Missing explicit authentication check |
| `src/ai/flows/text-to-speech.ts` | **HIGH** | ❌ | `textToSpeech` | Missing explicit authentication check |
| `src/ai/flows/syllabus-generator.ts` | **HIGH** | ❌ | `SyllabusOutputSchema, syllabusGenerator` | Missing explicit authentication check |
| `src/ai/flows/speech-to-speech.ts` | **HIGH** | ❌ | `speechToSpeech` | Missing explicit authentication check |
| `src/ai/flows/smart-revision-planner.ts` | **HIGH** | ❌ | `SmartRevisionPlannerOutputSchema, smartRevisionPlanner` | Missing explicit authentication check |
| `src/ai/flows/multilingual-cognitive-chatbot.ts` | **HIGH** | ❌ | `ExplainConceptOutputSchema, explainConcept` | Missing explicit authentication check |
| `src/ai/flows/mindful-mentor.ts` | **HIGH** | ❌ | `MotivationalCounselingOutputSchema, getMotivationalCounseling` | Missing explicit authentication check |
| `src/ai/flows/custom-cognitive-chatbot.ts` | **HIGH** | ❌ | `explainConceptWithCustomization` | Missing explicit authentication check |
| `src/ai/flows/adaptive-quiz-engine.ts` | **HIGH** | ❌ | `AdaptiveQuizOutputSchema, generateQuiz` | Missing explicit authentication check |

## Recommendations
1. **Implement Middleware:** Ensure strict middleware covers all Server Action routes.
2. **Explicit Auth Checks:** Add `await auth()` or equivalent at the start of every protected Server Action.
3. **Input Validation:** Use Zod to validate all inputs to Server Actions.
