/**
 * SANKALP-AEI Agent System — API Key Pool Manager
 * Round-robin key rotation with rate-limit backoff across 30 keys.
 */

import { ModelTier, MODEL_CONFIGS, type ModelConfig } from './models.js';
import { GeminiClient } from './gemini-client.js';
import { logger } from '../utils/logger.js';

interface KeyState {
  key: string;
  index: number;
  tier: ModelTier;
  isRateLimited: boolean;
  cooldownUntil: number;
  totalCalls: number;
  totalTokens: number;
  lastUsed: number;
  errors: number;
}

export class PoolManager {
  private pools: Map<ModelTier, KeyState[]> = new Map();
  private cursors: Map<ModelTier, number> = new Map();
  private envVars: Record<string, string>;

  constructor(envVars?: Record<string, string>) {
    this.envVars = envVars ?? process.env as Record<string, string>;
    this.initPools();
  }

  private initPools(): void {
    for (const config of Object.values(MODEL_CONFIGS)) {
      const keys: KeyState[] = [];

      for (let i = 1; i <= config.keyCount; i++) {
        const envKey = `${config.keyPrefix}${i}`;
        const apiKey = this.envVars[envKey];

        if (apiKey && apiKey.trim().length > 0) {
          keys.push({
            key: apiKey.trim(),
            index: i,
            tier: config.tier,
            isRateLimited: false,
            cooldownUntil: 0,
            totalCalls: 0,
            totalTokens: 0,
            lastUsed: 0,
            errors: 0,
          });
        }
      }

      this.pools.set(config.tier, keys);
      this.cursors.set(config.tier, 0);

      logger.info(
        `[PoolManager] ${config.displayName}: ${keys.length}/${config.keyCount} keys loaded`
      );
    }
  }

  /** Get the next available client for a model tier */
  getClient(tier: ModelTier): GeminiClient {
    const pool = this.pools.get(tier);
    if (!pool || pool.length === 0) {
      throw new Error(
        `No API keys available for tier ${tier}. Check your .env.agents file.`
      );
    }

    const config = MODEL_CONFIGS[tier];
    const now = Date.now();

    // Try round-robin, skipping rate-limited keys
    let cursor = this.cursors.get(tier) ?? 0;
    const startCursor = cursor;
    let attempts = 0;

    while (attempts < pool.length) {
      const keyState = pool[cursor % pool.length];

      // Clear expired cooldowns
      if (keyState.isRateLimited && now >= keyState.cooldownUntil) {
        keyState.isRateLimited = false;
        keyState.cooldownUntil = 0;
        logger.debug(`[PoolManager] Key #${keyState.index} cooldown expired, back in rotation`);
      }

      if (!keyState.isRateLimited) {
        // Update cursor and state
        this.cursors.set(tier, (cursor + 1) % pool.length);
        keyState.totalCalls++;
        keyState.lastUsed = now;

        return new GeminiClient(keyState.key, config.modelId, keyState.index);
      }

      cursor++;
      attempts++;
    }

    // All keys rate-limited — find the one with nearest cooldown expiry
    const nearest = pool.reduce((min, ks) =>
      ks.cooldownUntil < min.cooldownUntil ? ks : min
    );
    const waitMs = nearest.cooldownUntil - now;
    logger.warn(
      `[PoolManager] All ${tier} keys rate-limited. Nearest recovery in ${waitMs}ms (key #${nearest.index})`
    );

    // Clear it and return anyway (the API call might still fail, but retry handles it)
    nearest.isRateLimited = false;
    this.cursors.set(tier, pool.indexOf(nearest));
    return new GeminiClient(nearest.key, config.modelId, nearest.index);
  }

  /** Mark a key as rate-limited with a cooldown period */
  markRateLimited(tier: ModelTier, keyIndex: number, cooldownMs: number = 60_000): void {
    const pool = this.pools.get(tier);
    if (!pool) return;

    const keyState = pool.find(k => k.index === keyIndex);
    if (keyState) {
      keyState.isRateLimited = true;
      keyState.cooldownUntil = Date.now() + cooldownMs;
      keyState.errors++;
      logger.warn(
        `[PoolManager] Key #${keyIndex} (${tier}) rate-limited for ${cooldownMs}ms`
      );
    }
  }

  /** Record token usage for a key */
  recordUsage(tier: ModelTier, keyIndex: number, tokens: number): void {
    const pool = this.pools.get(tier);
    if (!pool) return;

    const keyState = pool.find(k => k.index === keyIndex);
    if (keyState) {
      keyState.totalTokens += tokens;
    }
  }

  /** Get pool statistics */
  getStats(): Record<ModelTier, { loaded: number; available: number; rateLimited: number; totalCalls: number; totalTokens: number }> {
    const stats: Record<string, { loaded: number; available: number; rateLimited: number; totalCalls: number; totalTokens: number }> = {};
    const now = Date.now();

    for (const [tier, pool] of this.pools) {
      const available = pool.filter(k => !k.isRateLimited || now >= k.cooldownUntil).length;
      stats[tier] = {
        loaded: pool.length,
        available,
        rateLimited: pool.length - available,
        totalCalls: pool.reduce((sum, k) => sum + k.totalCalls, 0),
        totalTokens: pool.reduce((sum, k) => sum + k.totalTokens, 0),
      };
    }

    return stats as Record<ModelTier, typeof stats[string]>;
  }

  /** Total keys loaded across all tiers */
  get totalKeys(): number {
    let total = 0;
    for (const pool of this.pools.values()) {
      total += pool.length;
    }
    return total;
  }
}
