'use server';
/**
 * @fileOverview Shared audio utility for converting raw PCM audio data to WAV format.
 * Used by speech-to-speech and text-to-speech flows.
 */

import wav from 'wav';

/**
 * Converts raw PCM audio data (as returned by Gemini TTS) to a WAV-encoded base64 string.
 *
 * @param pcmData - Buffer of raw PCM audio bytes
 * @param channels - Number of audio channels (default: 1 = mono)
 * @param rate - Sample rate in Hz (default: 24000)
 * @param sampleWidth - Bytes per sample (default: 2 = 16-bit)
 * @returns Base64-encoded WAV audio string
 */
export async function toWav(
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

    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (d: Buffer) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

    writer.write(pcmData);
    writer.end();
  });
}
