# API Response Caching Strategy Proposal

**Date:** 2026-02-19
**Scope:** `src/ai/flows` (Syllabus, Quiz, Chatbot)
**Goal:** Reduce LLM costs and latency by caching high-value targets.

## 1. Flow Analysis & Caching Potential

| Flow File | Flow Name | Cache Potential | Reasoning | Proposed Strategy |
|---|---|---|---|---|
| `adaptive-quiz-engine.ts` | `adaptiveQuizPrompt` | **MEDIUM** | Quizzes can be reused for same topic/difficulty, but adaptive nature implies some variability is desired. | Cache with variants (e.g., key = topic:difficulty:variant_id) |
| `custom-cognitive-chatbot.ts` | `explainConceptCustomizedPrompt` | **LOW** | Highly conversational and context-dependent. | No cache (or short-term session cache only) |
| `mindful-mentor.ts` | `mindfulMentorPrompt` | **LOW** | Highly conversational and context-dependent. | No cache (or short-term session cache only) |
| `multilingual-cognitive-chatbot.ts` | `explainConceptPrompt` | **LOW** | Highly conversational and context-dependent. | No cache (or short-term session cache only) |
| `smart-revision-planner.ts` | `revisionExplanationPrompt` | **LOW** | High variability or user-specific. | No cache |
| `speech-to-speech.ts` | `speechToSpeechFlow` | **LOW** | High variability or user-specific. | No cache |
| `syllabus-generator.ts` | `syllabusGeneratorPrompt` | **HIGH** | Syllabi for standard exams (e.g., "AP Calculus") are static and requested frequently by multiple users. | Cache by query (normalized) |
| `text-to-speech.ts` | `textToSpeechFlow` | **LOW** | High variability or user-specific. | No cache |

## 2. Implementation Proposal

### A. Syllabus Caching (High Priority)
- **Target**: `src/ai/flows/syllabus-generator.ts`
- **Key**: `syllabus:{normalized_query}` (e.g., `syllabus:ap_calculus_bc`)
- **TTL**: 7 days (Syllabi rarely change mid-term)
- **Technology**: Next.js `unstable_cache` or Redis (if available)
- **Projected Impact**: Reduce LLM calls by ~40-60% for popular subjects.

### B. Quiz Caching (Medium Priority)
- **Target**: `src/ai/flows/adaptive-quiz-engine.ts`
- **Key**: `quiz:{topic}:{difficulty}:{level}:{variant}`
- **TTL**: 24 hours
- **Strategy**: Pre-generate 3-5 variants per topic/difficulty and rotate them. Fallback to live generation if cache miss.
- **Projected Impact**: Reduce latency from ~5s to <100ms for common topics.

### C. Cost Analysis
- **Estimated Savings**: Assuming 1000 users/day, 20% syllabus queries are duplicates -> significant token savings.
- **Latency**: Syllabus generation takes ~10s -> Cached takes <200ms.
