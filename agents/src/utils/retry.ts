/**
 * SANKALP-AEI Agent System — Retry Utility
 * Exponential backoff with rate-limit awareness for Gemini API calls.
 */

import { logger } from './logger.js';

export interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  /** Called when a rate limit is detected — return cooldown ms */
  onRateLimit?: (error: Error) => number;
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelayMs: 2000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

function isRateLimitError(error: Error): boolean {
  const msg = error.message.toLowerCase();
  return (
    msg.includes('429') ||
    msg.includes('rate limit') ||
    msg.includes('quota') ||
    msg.includes('resource_exhausted') ||
    msg.includes('too many requests')
  );
}

function isRetryableError(error: Error): boolean {
  const msg = error.message.toLowerCase();
  return (
    isRateLimitError(error) ||
    msg.includes('500') ||
    msg.includes('503') ||
    msg.includes('internal') ||
    msg.includes('unavailable') ||
    msg.includes('timeout') ||
    msg.includes('econnreset') ||
    msg.includes('socket hang up')
  );
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {},
  label: string = 'operation'
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt >= opts.maxRetries) {
        logger.error(`[Retry] ${label} failed after ${attempt + 1} attempts: ${lastError.message}`);
        throw lastError;
      }

      if (!isRetryableError(lastError)) {
        logger.error(`[Retry] ${label} non-retryable error: ${lastError.message}`);
        throw lastError;
      }

      // Calculate delay
      let delay: number;
      if (isRateLimitError(lastError) && opts.onRateLimit) {
        delay = opts.onRateLimit(lastError);
      } else {
        delay = Math.min(
          opts.baseDelayMs * Math.pow(opts.backoffMultiplier, attempt),
          opts.maxDelayMs
        );
        // Add jitter (±25%)
        delay = delay * (0.75 + Math.random() * 0.5);
      }

      logger.warn(
        `[Retry] ${label} attempt ${attempt + 1}/${opts.maxRetries} failed, retrying in ${Math.round(delay)}ms: ${lastError.message}`
      );

      await sleep(delay);
    }
  }

  throw lastError ?? new Error(`${label} failed with no error captured`);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export { sleep, isRateLimitError, isRetryableError };
