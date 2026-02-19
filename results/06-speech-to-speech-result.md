# Result: Speech-to-Speech Flow Analysis

**Prompt executed:** `prompts/06-speech-to-speech.md`  
**Date:** 2026-02-19  
**Source files read:**
- `src/ai/flows/speech-to-speech.ts`
- `src/ai/flows/text-to-speech.ts`

---

## Action 1: Review the flow implementation

**File read:** `src/ai/flows/speech-to-speech.ts`

### Input schema

```typescript
const SpeechToSpeechInputSchema = z.string().describe(
  "A user's speech recording, as a data URI that must include a MIME type and use Base64 encoding."
);
```

### Output schema

```typescript
const SpeechToSpeechOutputSchema = z.object({
  audioDataUri: z.string(),   // WAV audio response as base64 data URI
});
```

### Three-stage pipeline mapped from source (lines 60–92)

```
Stage 1 — STT (lines 62–65):
  ai.generate({ model: googleAI.model('gemini-2.5-flash-speech'), prompt: [{media: {url: audioDataUri}}] })
  → userQuery (text string)

Stage 2 — LLM (lines 68–73):
  ai.generate({ model: 'googleai/gemini-2.5-flash', prompt: `...Question: "${userQuery}"` })
  → botResponseText (text string)

Stage 3 — TTS (lines 76–87):
  ai.generate({ model: googleAI.model('gemini-2.5-flash-preview-tts'),
    config: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Algenib' } } } },
    prompt: botResponseText })
  → ttsResponse.media (PCM audio buffer)

Post-processing: toWav(audioBuffer) → 'data:audio/wav;base64,...'
```

---

## Action 2: Evaluate the audio processing pipeline

**How is the input audio encoded and transmitted?**  
As a base64 data URI string (e.g., `data:audio/webm;base64,...`). The URI is passed directly to Gemini's STT model with no format validation.

**How is PCM audio converted to WAV format?**  
A `toWav` helper function was found **duplicated** in two files:
- `src/ai/flows/speech-to-speech.ts` (lines 31–52)
- `src/ai/flows/text-to-speech.ts` (lines 27–52)

Both functions are identical. They use the `wav` npm package to wrap raw PCM bytes (24000 Hz, 16-bit, mono) into a WAV container.

**Are there audio format validation steps?**  
None found. The flow passes the raw data URI directly to the Gemini API without checking MIME type, maximum size, or encoding validity.

---

## Action 3: Assess the LLM interaction prompt

**Is the CognitoBot persona prompt adequate?**  
Found at lines 68–73:
```javascript
prompt: `You are CognitoBot, a friendly and helpful AI learning assistant.
A student just asked you the following question verbally.
Provide a concise and clear response. Question: "${userQuery}"`
```
The persona is minimal. No educational scope restriction, no age-appropriate guidance, no safety guardrails.

**Is the prompt context-free?**  
Yes. Each call is completely stateless. There is no conversation history or session context. Multi-turn educational dialogues are impossible with the current design.

**How does the prompt handle off-topic questions?**  
It does not restrict the topic. CognitoBot will answer any question, including non-educational ones.

---

## Action 4: Analyze model selection and configuration

**Models used:**

| Stage | Model | Note |
|-------|-------|------|
| STT | `gemini-2.5-flash-speech` | Dedicated speech recognition |
| LLM | `googleai/gemini-2.5-flash` | General purpose |
| TTS | `gemini-2.5-flash-preview-tts` | **Preview model** — not production stable |

**Is the `Algenib` voice appropriate?**  
Algenib is a prebuilt Gemini TTS voice. It is hardcoded with no mechanism for students or teachers to change it. For an educational platform targeting diverse Indian students, voice variety and regional language TTS would improve engagement.

**Are there configuration options for voice selection?**  
None. The voice name is hardcoded in the flow.

---

## Action 5: Identify latency and performance concerns

**End-to-end latency:**  
The three API calls execute sequentially:
```
Total ≈ STT(1–2s) + LLM(0.5–1s) + TTS(1–2s) ≈ 2.5–5s per voice turn
```

**Opportunities for parallelization:**  
None — each stage depends on the previous stage's output. The pipeline cannot be parallelized.

**Cost implications:**  
Approximately $0.002–0.005 per voice turn. At 1,000 daily active users with 10 turns/session: ~$20–50/day.

---

## Action 6: Recommend improvements — change applied

### Change: Extracted `toWav` to shared utility `src/lib/audio-utils.ts`

The duplicated `toWav` function was extracted to a new shared module:

**New file created:** `src/lib/audio-utils.ts`
```typescript
export async function toWav(pcmData: Buffer, channels = 1, rate = 24000, sampleWidth = 2): Promise<string>
```

**`src/ai/flows/speech-to-speech.ts` updated:**
- Removed: local `toWav` function definition (22 lines)
- Removed: `import wav from 'wav'`
- Added: `import {toWav} from '@/lib/audio-utils'`

**`src/ai/flows/text-to-speech.ts` updated:**
- Removed: local `toWav` function definition (26 lines)
- Removed: `import wav from 'wav'`
- Added: `import {toWav} from '@/lib/audio-utils'`

This eliminates the code duplication and ensures any future improvements (error handling, size limits, format options) are made in one place.

**Files modified:**
- `src/lib/audio-utils.ts` (created)
- `src/ai/flows/speech-to-speech.ts`
- `src/ai/flows/text-to-speech.ts`

**Remaining items (not implemented — require further design):**
- Conversation history support (stateful sessions)
- Audio input format validation and size limits
- Voice selection parameter for teachers/students
