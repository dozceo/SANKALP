# Result: Speech-to-Speech Flow Analysis

**Prompt Source:** `prompts/06-speech-to-speech.md`  
**Execution Date:** 2026-02-19  
**Flow File:** `src/ai/flows/speech-to-speech.ts`

---

## 1. Flow Implementation Review

### Input Schema

| Field | Type | Description |
|-------|------|-------------|
| Input | `string` | Audio data URI (`data:<mimetype>;base64,<encoded_data>`) |

### Output Schema

| Field | Type | Description |
|-------|------|-------------|
| `audioDataUri` | `string` | WAV audio response as base64 data URI |

### Three-Stage Pipeline Architecture

```
User Audio (data URI)
        │
        ▼
[Stage 1: STT] Gemini 2.5 Flash Speech
gemini-2.5-flash-speech model
        │ userQuery (text)
        ▼
[Stage 2: LLM] Gemini 2.5 Flash
"You are CognitoBot..." + userQuery
        │ botResponseText (text)
        ▼
[Stage 3: TTS] Gemini 2.5 Flash Preview TTS
Voice: Algenib, WAV output
        │
        ▼
WAV Audio Data URI
```

---

## 2. Audio Processing Pipeline Evaluation

### Input Audio Handling

- The input is a raw base64 data URI string passed directly to Gemini's STT model.
- No MIME type validation is performed before the API call.
- No maximum size limit is enforced — large audio inputs could cause timeout or cost overruns.
- Supported MIME types are not documented in the code.

### WAV Conversion (`toWav` function)

The `toWav` helper converts raw PCM audio from the TTS model to WAV format:

```typescript
async function toWav(pcmData: Buffer, channels = 1, rate = 24000, sampleWidth = 2): Promise<string>
```

| Parameter | Value | Assessment |
|-----------|-------|------------|
| `channels` | 1 (mono) | Appropriate for voice |
| `rate` | 24000 Hz | Standard for Gemini TTS output |
| `sampleWidth` | 2 (16-bit) | Standard quality |
| Error handling | `writer.on('error', reject)` | Adequate |

**Gap**: The `toWav` function has no maximum buffer size check. An extremely long TTS response could cause memory issues on the server.

### Audio Format Validation

There is no validation that:
- The input data URI is a valid audio format
- The MIME type is supported by the STT model
- The base64 data is correctly encoded

---

## 3. LLM Interaction Prompt Assessment

### Current Prompt

```
You are CognitoBot, a friendly and helpful AI learning assistant.
A student just asked you the following question verbally.
Provide a concise and clear response. Question: "${userQuery}"
```

### Assessment

| Aspect | Status | Notes |
|--------|--------|-------|
| Persona definition | Minimal | "Friendly and helpful" is vague |
| Context memory | None | Each turn is stateless |
| Educational scope | Unrestricted | Can answer off-topic questions |
| Safety guardrails | None | No harmful content filtering |
| Response length | "Concise" | Not quantified; LLM interprets freely |
| Language handling | None | Responds in whatever language it detects |

**Critical gap**: The voice conversation is entirely stateless. Each query is independent with no conversation history, making multi-turn educational dialogues impossible.

**Template vs. Handlebars**: Notably, this prompt uses JavaScript template literal (`"${userQuery}"`) rather than the Handlebars pattern (`{{{userQuery}}}`) used by other flows. This is inconsistent with the rest of the codebase.

---

## 4. Model Selection and Configuration

### Models Used

| Stage | Model | Notes |
|-------|-------|-------|
| STT | `gemini-2.5-flash-speech` | Dedicated speech recognition model |
| LLM | `googleai/gemini-2.5-flash` | General purpose |
| TTS | `gemini-2.5-flash-preview-tts` | Preview model — not production stable |

### Voice Configuration

The `Algenib` voice (a prebuilt Gemini TTS voice) is hardcoded with no mechanism for teachers or students to change it. For an educational assistant targeting diverse Indian students, voice variety and localization would improve user experience.

**TTS model risk**: Using a `preview` model (`gemini-2.5-flash-preview-tts`) in production code introduces stability risk. Preview APIs can be deprecated or changed without notice.

---

## 5. Latency and Performance Analysis

### Sequential Pipeline Latency

The three API calls execute **sequentially** (not in parallel):

```
Total Latency = STT_latency + LLM_latency + TTS_latency
              ≈ 1-2s + 0.5-1s + 1-2s
              ≈ 2.5-5 seconds typical end-to-end
```

This sequential design is inherent to the pipeline (each stage depends on the previous output), but there are no streaming optimizations.

### Cost Implications

| Stage | Cost Driver | Estimated Cost per Turn |
|-------|-------------|------------------------|
| STT | Audio duration | ~$0.001/15-second clip |
| LLM | Token count (in + out) | ~$0.0005/query |
| TTS | Character count | ~$0.001/response |
| **Total** | | **~$0.002-0.005 per voice turn** |

At 1,000 daily active users with 10 turns/session: ~$20-50/day, or $600-1,500/month.

---

## 6. Comparison with Text-to-Speech Flow

A standalone `text-to-speech.ts` flow exists (`src/ai/flows/text-to-speech.ts`) that handles only Stage 3 (TTS). The `toWav` helper function is duplicated between `speech-to-speech.ts` and `text-to-speech.ts` — a code duplication issue.

**Recommendation**: Extract `toWav` to a shared audio utility module (`src/lib/audio-utils.ts`).

---

## 7. Recommendations

### High Priority
1. **Add conversation history support**: Maintain a session-based message array to enable multi-turn educational dialogues.
2. **Validate audio input format**: Check MIME type and size before API call; reject unsupported formats with clear error message.
3. **Replace preview TTS model**: Use a stable, production TTS model endpoint rather than `preview` variant.

### Medium Priority
4. **Deduplicate `toWav` function**: Extract to `src/lib/audio-utils.ts` and import in both speech-to-speech and text-to-speech flows.
5. **Add voice selection parameter**: Allow teachers or students to select from available voices.
6. **Add multilingual support**: Detect the student's language from the transcribed text and respond in the same language.
7. **Add response length guidance**: Specify target response duration (e.g., "Respond in 2-3 sentences, suitable for 10-15 second audio playback").

### Low Priority
8. **Add audio size limit**: Reject audio inputs exceeding a reasonable duration (e.g., 60 seconds) to prevent abuse and cost overruns.
9. **Standardize prompt to Handlebars**: Replace JavaScript template literal with Handlebars `{{{userQuery}}}` pattern for consistency.
10. **Add educational scope restriction**: Add prompt instruction to keep responses to academic/educational topics.

---

## Summary

The Speech-to-Speech flow implements a clean three-stage pipeline with appropriate audio processing. The primary weaknesses are the **stateless conversation design** (no multi-turn memory), use of a **preview TTS model** in production, and **code duplication** of the `toWav` helper. The sequential pipeline latency of 2.5–5 seconds may impact user experience for interactive educational conversations. Adding conversation history and multilingual response detection are the highest-value improvements.
