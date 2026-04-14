/**
 * SANKALP-AEI Agent System — Gemini API Client Wrapper
 * Unified interface for calling Gemini models with structured output.
 */

import { GoogleGenerativeAI, type GenerativeModel, type GenerateContentResult } from '@google/generative-ai';
import { logger } from '../utils/logger.js';

export interface GeminiCallOptions {
  systemPrompt?: string;
  temperature?: number;
  maxOutputTokens?: number;
  /** If true, expects JSON output and parses it */
  jsonMode?: boolean;
  /** Optional thinking budget in tokens (for models with reasoning) */
  thinkingBudget?: number;
  /** Optional context cache name from Gemini Caching API */
  cacheName?: string;
}

export interface GeminiResponse {
  text: string;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  modelId: string;
  keyIndex: number;
  latencyMs: number;
}

export class GeminiClient {
  private model: GenerativeModel;
  private modelId: string;
  private keyIndex: number;

  constructor(apiKey: string, modelId: string, keyIndex: number) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.modelId = modelId;
    this.keyIndex = keyIndex;
    this.model = genAI.getGenerativeModel({ model: modelId });
  }

  async call(prompt: string, options: GeminiCallOptions = {}): Promise<GeminiResponse> {
    const startTime = Date.now();
    const { systemPrompt, temperature = 0.3, maxOutputTokens = 32768, jsonMode = false } = options;

    const parts: string[] = [];
    if (systemPrompt) {
      parts.push(`<system>\n${systemPrompt}\n</system>\n\n`);
    }
    parts.push(prompt);

    const fullPrompt = parts.join('');

    try {
      const result: GenerateContentResult = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens,
          ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
        },
      });

      const response = result.response;
      const text = response.text();
      const usage = response.usageMetadata;

      const geminiResponse: GeminiResponse = {
        text,
        tokensUsed: {
          input: usage?.promptTokenCount ?? 0,
          output: usage?.candidatesTokenCount ?? 0,
          total: usage?.totalTokenCount ?? 0,
        },
        modelId: this.modelId,
        keyIndex: this.keyIndex,
        latencyMs: Date.now() - startTime,
      };

      logger.debug(
        `[GeminiClient] ${this.modelId} key#${this.keyIndex} → ${geminiResponse.tokensUsed.total} tokens, ${geminiResponse.latencyMs}ms`
      );

      return geminiResponse;
    } catch (error) {
      const err = error as Error;
      logger.error(`[GeminiClient] ${this.modelId} key#${this.keyIndex} failed: ${err.message}`);
      throw error;
    }
  }

  /** Extract code blocks from a response */
  static extractCodeBlocks(text: string): Array<{ language: string; code: string; filename?: string }> {
    const blocks: Array<{ language: string; code: string; filename?: string }> = [];
    const regex = /```(\w+)?(?:\s+(?:\/\/\s*)?(\S+))?\n([\s\S]*?)```/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        filename: match[2],
        code: match[3].trim(),
      });
    }

    return blocks;
  }

  /** Extract JSON from a response (handles markdown-wrapped JSON) */
  static extractJSON<T = unknown>(text: string): T | null {
    // Try direct parse first
    try {
      return JSON.parse(text) as T;
    } catch {
      // Try extracting from code block
      const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1].trim()) as T;
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  /** Extract file changes from structured agent output */
  static parseFileChanges(text: string): Array<{ path: string; action: string; content: string }> {
    const changes: Array<{ path: string; action: string; content: string }> = [];
    const fileRegex = /<!-- FILE: (create|modify|delete) (\S+) -->\n```[\w]*\n([\s\S]*?)```/g;
    let match;

    while ((match = fileRegex.exec(text)) !== null) {
      changes.push({
        action: match[1],
        path: match[2],
        content: match[3].trim(),
      });
    }

    // Fallback: try code blocks with filename comments
    if (changes.length === 0) {
      const blocks = GeminiClient.extractCodeBlocks(text);
      for (const block of blocks) {
        if (block.filename) {
          changes.push({
            action: 'create',
            path: block.filename,
            content: block.code,
          });
        }
      }
    }

    return changes;
  }
}
