
'use server';
/**
 * @fileOverview A speech-to-speech flow for real-time audio conversations.
 *
 * - speechToSpeech - A function that takes user audio, gets a text response from an LLM, and converts it back to audio.
 * - SpeechToSpeechInput - The input type for the function.
 * - SpeechToSpeechOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';
import { googleAI } from '@genkit-ai/googleai';

const SpeechToSpeechInputSchema = z.string().max(10000000).describe(
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

// Helper function to convert PCM audio data to WAV format
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

    writer.write(pcmData);
    writer.end();
  });
}

const speechToSpeechFlow = ai.defineFlow(
  {
    name: 'speechToSpeechFlow',
    inputSchema: SpeechToSpeechInputSchema,
    outputSchema: SpeechToSpeechOutputSchema,
  },
  async (audioDataUri) => {
    console.log(`[FLOW:speechToSpeechFlow] Invoked`);
    try {
      // 1. Transcribe audio to text (STT)
      const sttResponse = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-speech'),
        prompt: [{ media: { url: audioDataUri } }],
      });
      const userQuery = sttResponse.text;
      console.log(`[FLOW:speechToSpeechFlow] STT complete, query length=${userQuery.length}`);

      // 2. Generate a text response from the transcribed text
      // Sanitize userQuery: truncate first, then escape to prevent prompt injection
      const sanitizedQuery = userQuery
        .substring(0, 2000)
        .replace(/[\\"]/g, '\\$&')
        .replace(/[\n\r]/g, ' ');
      const llmResponse = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt: `You are CognitoBot, a friendly and helpful AI learning assistant. A student just asked you the following question verbally. Provide a concise and clear response. Question: "${sanitizedQuery}"`,
      });
      const botResponseText = llmResponse.text;

      // 3. Convert the text response to speech (TTS)
      const ttsResponse = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-preview-tts'),
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Algenib' },
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

      console.log(`[FLOW:speechToSpeechFlow] Success`);
      return {
        audioDataUri: 'data:audio/wav;base64,' + wavBase64,
      };
    } catch (error) {
      console.error(`[FLOW:speechToSpeechFlow] Error:`, error);
      throw error;
    }
  }
);
