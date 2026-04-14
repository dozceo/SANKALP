/**
 * SANKALP-AEI Agent System — Token Optimizer Agent
 *
 * A specialized domain agent whose sole responsibility is to **reduce the
 * token footprint** of prompts assembled by other agents before they reach
 * the LLM.  It is NOT a code-generation agent — it runs inline as a
 * transparent optimization pass.
 *
 * Capabilities:
 *   • Pre-flight prompt auditing (estimateTokens, context-window check)
 *   • Prompt compression (strip dead code, collapse whitespace, dedup context)
 *   • Thinking-level downgrade for simple tasks
 *   • Batch-eligibility tagging (50 % cost reduction for deferrable work)
 *   • Telemetry logging — tokens saved, compression ratio, cache hits
 *
 * This agent is invoked **automatically** by BaseAgent.callLLM — no changes
 * to the Dispatcher or existing domain agents are required.
 */

import { BaseAgent, type AgentExecutionResult } from './base-agent.js';
import { AgentRole, type TaskNode, type FileChange } from '../llm/models.js';
import { TokenOptimizer, type OptimizedPrompt } from '../llm/token-optimizer.js';
import { logger } from '../utils/logger.js';

export class TokenOptimizerAgent extends BaseAgent {
  private optimizer: TokenOptimizer;

  constructor(
    role: AgentRole,
    pool: import('../llm/pool-manager.js').PoolManager,
    promptBuilder: import('../llm/prompt-builder.js').PromptBuilder,
    fs: import('../utils/fs-tools.js').FsTools,
    projectRoot: string,
  ) {
    super(role, pool, promptBuilder, fs, projectRoot);
    const maxCtx = parseInt(process.env['AGENT_MAX_CONTEXT_TOKENS'] ?? '900000', 10);
    this.optimizer = new TokenOptimizer(maxCtx);
  }

  /**
   * This agent does NOT produce code.  Its `execute` method performs a
   * diagnostic scan of the current prompt-builder output and returns a
   *  report with optimization recommendations.
   */
  async execute(task: TaskNode): Promise<AgentExecutionResult> {
    logger.info('🔋 Running token-optimization diagnostic', this.role);

    const { systemPrompt, userPrompt } = this.buildPrompt(task.description);
    const optimized = this.optimizer.optimize(systemPrompt, userPrompt, this.tier);

    const report = this.buildDiagnosticReport(optimized);

    // Write the report to output
    const reportPath = `agents/output/reports/token-diagnostic-${Date.now()}.md`;
    this.fs.writeFile(reportPath, report, task.id);

    return this.result(
      true,
      [{ path: reportPath, action: 'create', content: report }],
      `Diagnostic complete — ${(optimized.compressionRatio * 100).toFixed(1)}% savings potential`,
      0, // No LLM tokens consumed
      1,
    );
  }

  /**
   * Public helper: optimize a prompt pair for any calling agent.
   * Called from BaseAgent.callLLM transparently.
   */
  optimizePrompt(
    systemPrompt: string,
    userPrompt: string,
    tier: import('../llm/models.js').ModelTier,
    options?: {
      jsonMode?: boolean;
      deferrable?: boolean;
    },
  ): OptimizedPrompt {
    return this.optimizer.optimize(systemPrompt, userPrompt, tier, options);
  }

  /** Get cache and savings telemetry */
  getTelemetry() {
    return this.optimizer.getCacheStats();
  }

  // ─── Diagnostic Report ────────────────────────────────────

  private buildDiagnosticReport(opt: OptimizedPrompt): string {
    const lines = [
      `# Token Optimization Diagnostic`,
      ``,
      `| Metric | Value |`,
      `| --- | --- |`,
      `| Estimated Input Tokens | ${opt.estimatedInputTokens.toLocaleString()} |`,
      `| Compression Ratio | ${(opt.compressionRatio * 100).toFixed(1)}% |`,
      `| Context Cache Hit | ${opt.cacheHit ? '✅ Yes' : '❌ No'} |`,
      `| Thinking Level | ${opt.thinkingConfig.level} (${opt.thinkingConfig.budgetTokens} tok budget) |`,
      `| Max Output Tokens | ${opt.maxOutputTokens.toLocaleString()} |`,
      `| Batch Eligible | ${opt.batchEligible ? '✅ Yes (50% cheaper)' : 'No'} |`,
      ``,
    ];

    if (opt.warnings.length > 0) {
      lines.push(`## ⚠️ Warnings`, ``);
      for (const w of opt.warnings) {
        lines.push(`- ${w}`);
      }
      lines.push(``);
    }

    const cacheStats = this.optimizer.getCacheStats();
    lines.push(
      `## Cache Statistics`,
      ``,
      `| Metric | Value |`,
      `| --- | --- |`,
      `| Cached Prompts | ${cacheStats.entries} |`,
      `| Total Hits | ${cacheStats.totalHits} |`,
      `| Cached Chars | ${cacheStats.totalCachedChars.toLocaleString()} |`,
    );

    return lines.join('\n');
  }
}
