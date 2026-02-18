# LLM Prompt Template Version History

**Date:** 2026-02-18
**Scope:** `src/ai/flows`

| Flow File | Prompt Name | Version Hash (SHA-256) | Output Quality Baseline |
|---|---|---|---|
| `adaptive-quiz-engine.ts` | `adaptiveQuizPrompt` | `ad269404db22` | [Link to Baseline](#) |
| `custom-cognitive-chatbot.ts` | `explainConceptCustomizedPrompt` | `83bb357029e9` | [Link to Baseline](#) |
| `mindful-mentor.ts` | `mindfulMentorPrompt` | `9768bc988ac5` | [Link to Baseline](#) |
| `multilingual-cognitive-chatbot.ts` | `explainConceptPrompt` | `1c143f70350a` | [Link to Baseline](#) |
| `syllabus-generator.ts` | `syllabusGeneratorPrompt` | `5b4f6c241d29` | [Link to Baseline](#) |

## Usage Guide
- **Prompt Change Detection:** Run this script on CI. If the hash changes, a new version entry should be created.
- **Quality Correlation:** When investigating output quality degradation, check if the active prompt hash matches the version that was tested.
