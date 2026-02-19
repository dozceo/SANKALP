# SANKALP AI Flows — Prompt Execution Results

This folder contains the results of executing analysis prompts from the `prompts/` folder against the SANKALP platform's AI flow implementations in `src/ai/flows/`.

**Execution Date:** 2026-02-19  
**Prompts Analyzed:** 7  
**Flows Analyzed:** 7

---

## Results Index

| # | Prompt File | Result File | Flow Analyzed | Key Finding |
|---|-------------|-------------|---------------|-------------|
| 1 | [01-adaptive-quiz-engine.md](../prompts/01-adaptive-quiz-engine.md) | [01-adaptive-quiz-engine-result.md](./01-adaptive-quiz-engine-result.md) | `adaptive-quiz-engine.ts` | Missing answer explanations; unimplemented `isFallback` |
| 2 | [02-mindful-mentor.md](../prompts/02-mindful-mentor.md) | [02-mindful-mentor-result.md](./02-mindful-mentor-result.md) | `mindful-mentor.ts` | **CRITICAL**: No crisis detection or escalation |
| 3 | [03-custom-cognitive-chatbot.md](../prompts/03-custom-cognitive-chatbot.md) | [03-custom-cognitive-chatbot-result.md](./03-custom-cognitive-chatbot-result.md) | `custom-cognitive-chatbot.ts` | **CRITICAL**: Prompt injection vulnerability |
| 4 | [04-multilingual-cognitive-chatbot.md](../prompts/04-multilingual-cognitive-chatbot.md) | [04-multilingual-cognitive-chatbot-result.md](./04-multilingual-cognitive-chatbot-result.md) | `multilingual-cognitive-chatbot.ts` | No language validation; best error handling pattern |
| 5 | [05-smart-revision-planner.md](../prompts/05-smart-revision-planner.md) | [05-smart-revision-planner-result.md](./05-smart-revision-planner-result.md) | `smart-revision-planner.ts` | Best architecture; cache race condition under load |
| 6 | [06-speech-to-speech.md](../prompts/06-speech-to-speech.md) | [06-speech-to-speech-result.md](./06-speech-to-speech-result.md) | `speech-to-speech.ts` | Stateless conversation; preview TTS model in production |
| 7 | [07-syllabus-generator.md](../prompts/07-syllabus-generator.md) | [07-syllabus-generator-result.md](./07-syllabus-generator-result.md) | `syllabus-generator.ts` | **HIGH**: URL hallucination with no validation |

---

## Cross-Flow Summary

### Critical Issues (Require Immediate Action)

1. **Prompt Injection — Custom Cognitive Chatbot** (`03`)  
   Teacher-supplied `personality` and `customInstructions` are injected directly into the LLM prompt without sanitization. A malicious teacher could override the AI's behavior.

2. **No Crisis Escalation — Mindful Mentor** (`02`)  
   Students expressing self-harm or suicidal ideation receive a standard motivational response with no escalation to teachers, parents, or crisis services. This is a **safety-critical gap** for a platform serving minors.

3. **URL Hallucination — Syllabus Generator** (`07`)  
   LLM-generated reference URLs are not validated for reachability. Students may be provided with broken or fabricated study resource links.

### High-Priority Issues

4. **Unimplemented Fallbacks** (`01`, `07`)  
   The `isFallback` flag exists in output schemas for both the quiz engine and syllabus generator, but fallback mechanisms have not been implemented. Users experience unhandled errors rather than graceful degradation.

5. **Missing Answer Explanations — Quiz Engine** (`01`)  
   Quiz questions lack explanations for correct answers, preventing learning from mistakes — a fundamental educational gap.

6. **Error Handling Inconsistency** (`03` vs `04`)  
   The Custom Cognitive Chatbot uses `output!` (non-null assertion) while the Multilingual Chatbot has proper null checks. The multilingual pattern should be adopted uniformly.

### Architecture Highlights

- **Best Architecture**: Smart Revision Planner (`05`) — Clean ML → ADK → LLM separation of concerns.
- **Best Error Handling**: Multilingual Cognitive Chatbot (`04`) — Should serve as the template for other flows.
- **Highest Security Risk**: Custom Cognitive Chatbot (`03`) — Direct injection of user-supplied content into LLM system prompt.
- **Highest Cost**: Speech-to-Speech (`06`) — Three API calls per turn; ~$0.002–0.005/turn at scale.

### Recommended Implementation Priority

| Priority | Action | Flows Affected |
|----------|--------|---------------|
| 🔴 Critical | Add crisis detection + escalation to Mindful Mentor | `02` |
| 🔴 Critical | Sanitize teacher inputs in Custom Chatbot | `03` |
| 🔴 High | Implement URL validation for Syllabus Generator | `07` |
| 🟠 High | Add answer explanations to Quiz Engine | `01` |
| 🟠 High | Implement fallback mechanisms where `isFallback` exists | `01`, `07` |
| 🟡 Medium | Add language validation to Multilingual Chatbot | `04` |
| 🟡 Medium | Add conversation history to Speech-to-Speech | `06` |
| 🟡 Medium | Replace preview TTS model in production | `06` |
| 🟢 Low | Extract `toWav` to shared utility module | `06` |
| 🟢 Low | Add Bloom's Taxonomy support to Quiz Engine | `01` |

---

## Files

```
prompts/
├── 01-adaptive-quiz-engine.md
├── 02-mindful-mentor.md
├── 03-custom-cognitive-chatbot.md
├── 04-multilingual-cognitive-chatbot.md
├── 05-smart-revision-planner.md
├── 06-speech-to-speech.md
└── 07-syllabus-generator.md

results/
├── README.md                              ← This file
├── 01-adaptive-quiz-engine-result.md
├── 02-mindful-mentor-result.md
├── 03-custom-cognitive-chatbot-result.md
├── 04-multilingual-cognitive-chatbot-result.md
├── 05-smart-revision-planner-result.md
├── 06-speech-to-speech-result.md
└── 07-syllabus-generator-result.md
```
