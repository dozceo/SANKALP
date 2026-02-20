# Prompt: Speech-to-Speech Flow Analysis

## Objective
Analyze the Speech-to-Speech AI flow in the SANKALP platform. This flow enables real-time voice conversations using a three-stage pipeline (STT → LLM → TTS). Examine the pipeline architecture, audio handling, and user experience considerations.

## Actions to Execute

1. **Review the flow implementation** at `src/ai/flows/speech-to-speech.ts`
   - Document the input schema (audio data URI)
   - Document the output schema (audio data URI)
   - Map the three-stage pipeline: STT (Gemini) → LLM response → TTS (Gemini)

2. **Evaluate the audio processing pipeline**
   - How is the input audio encoded and transmitted?
   - How is PCM audio converted to WAV format?
   - Are there audio format validation steps?

3. **Assess the LLM interaction prompt**
   - Is the CognitoBot persona prompt adequate?
   - Is the prompt context-free (no session/conversation history)?
   - How does the prompt handle educational queries vs. off-topic questions?

4. **Analyze model selection and configuration**
   - Which Gemini models are used for STT, LLM, and TTS?
   - Is the `Algenib` voice appropriate for an educational assistant?
   - Are there configuration options for voice selection?

5. **Identify latency and performance concerns**
   - What is the expected end-to-end latency of the three-stage pipeline?
   - Are there opportunities for parallelization?
   - What are the cost implications per conversation turn?

6. **Recommend improvements**
   - Suggest conversation history support
   - Identify error handling gaps in audio processing
   - Propose voice selection customization

## Expected Output
A comprehensive analysis report covering pipeline architecture, audio quality, latency, and UX recommendations.
