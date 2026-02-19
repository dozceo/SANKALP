
'use server';
/**
 * @fileOverview A speech-to-speech flow for real-time audio conversations.
 *
 * - speechToSpeech - A function that takes user audio, gets a text response from an LLM, and converts it back to audio.
 * - SpeechToSpeechInput - The input type for the function.
 * - SpeechToSpeechOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {toWav} from '@/lib/audio-utils';

const SpeechToSpeechInputSchema = z.string().describe(
  "A user's speech recording, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
);
export type SpeechToSpeechInput = z.infer<typeof SpeechToSpeechInputSchema>;

const SpeechToSpeechOutputSchema = z.object({
  audioDataUri: z.string().describe('The generated audio response as a base64 encoded data URI.'),
});
export type SpeechToSpeechOutput = z.infer<typeof SpeechToSpeechOutputSchema>;

export async function speechToSpeech(input: SpeechToSpeechInput): Promise<SpeechToSpeechOutput> {
  return speechToSpeechFlow(input);
}

const speechToSpeechFlow = ai.defineFlow(
  {
    name: 'speechToSpeechFlow',
    inputSchema: SpeechToSpeechInputSchema,
    outputSchema: SpeechToSpeechOutputSchema,
  },
  async (audioDataUri) => {
    // 1. Transcribe audio to text (STT)
    const sttResponse = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-speech'),
      prompt: [{media: {url: audioDataUri}}],
    });
    const userQuery = sttResponse.text;
    
    // 2. Generate a text response from the transcribed text
    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: `You are CognitoBot, a friendly and helpful AI learning assistant. A student just asked you the following question verbally. Provide a concise and clear response. Question: "${userQuery}"`,
    });
    const botResponseText = llmResponse.text;

    // 3. Convert the text response to speech (TTS)
    const ttsResponse = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'},
          },
        },
      },
      prompt: botResponseText,
    });
    
    if (!ttsResponse.media) {
      throw new Error('No audio media was generated from text-to-speech.');
    }

    // 4. Convert the generated PCM audio to WAV format for browser playback
    const audioBuffer = Buffer.from(
      ttsResponse.media.url.substring(ttsResponse.media.url.indexOf(',') + 1),
      'base64'
    );
    const wavBase64 = await toWav(audioBuffer);

    return {
      audioDataUri: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);
