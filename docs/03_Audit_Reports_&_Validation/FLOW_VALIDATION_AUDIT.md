# Genkit Flow Input Schema Validation Completeness Report

**Domain:** Engineering Core
**Scope:** src/ai/flows/
**Method:** AST Analysis (TypeScript Compiler API)
**Date:** 2026-02-19

## Executive Summary
This report validates strict input validation in Genkit flows. It checks for unbounded strings (DoS risk) and unsafe prompt construction (Injection risk).

## Detailed Findings

| File | Flow/Prompt | Validation Status | Prompt Risk | Issues |
| :--- | :--- | :--- | :--- | :--- |
| `adaptive-quiz-engine.ts` | **adaptiveQuizPrompt (Prompt)** | ⚠️ WEAK | ✅ LOW | <ul><li>Field 'root.topic': Unbounded string. Add .max() or specific validation.</li><li>Field 'root.educationLevel': Unbounded string. Add .max() or specific validation.</li></ul> |
| `adaptive-quiz-engine.ts` | **adaptiveQuizFlow** | ⚠️ WEAK | ✅ LOW | <ul><li>Field 'root.topic': Unbounded string. Add .max() or specific validation.</li><li>Field 'root.educationLevel': Unbounded string. Add .max() or specific validation.</li></ul> |
| `custom-cognitive-chatbot.ts` | **explainConceptCustomizedPrompt (Prompt)** | ⚠️ WEAK | 🟠 MEDIUM | <ul><li>Field 'root.concept': Unbounded string. Add .max() or specific validation.</li><li>Field 'root.brainMapContext': Unbounded string. Add .max() or specific validation.</li><li>Field 'root.language': Unbounded string. Add .max() or specific validation.</li><li>Field 'root.personality': Unbounded string. Add .max() or specific validation.</li><li>Field 'root.customInstructions': Unbounded string. Add .max() or specific validation.</li><li>Unescaped Handlebars usage (`{{{...}}}`). Ensure input is sanitized.</li></ul> |
| `custom-cognitive-chatbot.ts` | **customizedConceptFlow** | ⚠️ WEAK | ✅ LOW | <ul><li>Field 'root.concept': Unbounded string. Add .max() or specific validation.</li><li>Field 'root.brainMapContext': Unbounded string. Add .max() or specific validation.</li><li>Field 'root.language': Unbounded string. Add .max() or specific validation.</li><li>Field 'root.personality': Unbounded string. Add .max() or specific validation.</li><li>Field 'root.customInstructions': Unbounded string. Add .max() or specific validation.</li></ul> |
| `mindful-mentor.ts` | **mindfulMentorPrompt (Prompt)** | ⚠️ WEAK | 🟠 MEDIUM | <ul><li>Field 'root.studentConcern': Unbounded string. Add .max() or specific validation.</li><li>Field 'root.studentHistory': Unbounded string. Add .max() or specific validation.</li><li>Unescaped Handlebars usage (`{{{...}}}`). Ensure input is sanitized.</li></ul> |
| `mindful-mentor.ts` | **mindfulMentorFlow** | ⚠️ WEAK | ✅ LOW | <ul><li>Field 'root.studentConcern': Unbounded string. Add .max() or specific validation.</li><li>Field 'root.studentHistory': Unbounded string. Add .max() or specific validation.</li></ul> |
| `multilingual-cognitive-chatbot.ts` | **explainConceptPrompt (Prompt)** | ⚠️ WEAK | 🟠 MEDIUM | <ul><li>Field 'root.concept': Unbounded string. Add .max() or specific validation.</li><li>Field 'root.brainMapContext': Unbounded string. Add .max() or specific validation.</li><li>Field 'root.language': Unbounded string. Add .max() or specific validation.</li><li>Unescaped Handlebars usage (`{{{...}}}`). Ensure input is sanitized.</li></ul> |
| `multilingual-cognitive-chatbot.ts` | **explainConceptFlow** | ⚠️ WEAK | ✅ LOW | <ul><li>Field 'root.concept': Unbounded string. Add .max() or specific validation.</li><li>Field 'root.brainMapContext': Unbounded string. Add .max() or specific validation.</li><li>Field 'root.language': Unbounded string. Add .max() or specific validation.</li></ul> |
| `smart-revision-planner.ts` | **revisionExplanationPrompt (Prompt)** | ⚠️ WEAK | 🟠 MEDIUM | <ul><li>Field 'root.topicsToExplain': Unbounded string. Add .max() or specific validation.</li><li>Unescaped Handlebars usage (`{{{...}}}`). Ensure input is sanitized.</li></ul> |
| `smart-revision-planner.ts` | **smartRevisionPlannerFlow** | ⚠️ WEAK | ✅ LOW | <ul><li>Field 'root.brainMap': Unbounded string. Add .max() or specific validation.</li><li>Field 'root.studentId': Unbounded string. Add .max() or specific validation.</li></ul> |
| `speech-to-speech.ts` | **speechToSpeechFlow** | ⚠️ WEAK | 🔴 HIGH | <ul><li>Field 'root': Unbounded string. Add .max() or specific validation.</li><li>Critical: Direct Template Literal Injection (`${...}`) detected in `ai.generate` call.</li></ul> |
| `syllabus-generator.ts` | **syllabusGeneratorPrompt (Prompt)** | ⚠️ WEAK | 🟠 MEDIUM | <ul><li>Field 'root.query': Unbounded string. Add .max() or specific validation.</li><li>Unescaped Handlebars usage (`{{{...}}}`). Ensure input is sanitized.</li></ul> |
| `syllabus-generator.ts` | **syllabusGeneratorFlow** | ⚠️ WEAK | ✅ LOW | <ul><li>Field 'root.query': Unbounded string. Add .max() or specific validation.</li></ul> |
| `text-to-speech.ts` | **textToSpeechFlow** | ⚠️ WEAK | ✅ LOW | <ul><li>Field 'root': Unbounded string. Add .max() or specific validation.</li></ul> |

## Vulnerability Legend
- **Unbounded String**: `z.string()` without `.max()` allows potentially infinite input, leading to DoS or cost spikes.
- **Direct Template Literal**: `${input}` in prompts is a critical injection vulnerability.
- **Unescaped Handlebars**: `{{{input}}}` bypasses HTML escaping. Use with caution or sanitize input.

## Conclusion
⚠️ Found 37 issues requiring remediation.
