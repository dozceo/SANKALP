/**
 * SANKALP-AEI Agent System — Base Agent
 * Abstract class that all domain agents extend.
 * Handles: LLM invocation, context assembly, file writing, retry logic,
 * and **dynamic skill injection** from the /skills directory.
 */

import { type AgentRole, type AgentMessage, type FileChange, type TaskNode, ModelTier, AGENT_MODEL_MAPPING } from '../llm/models.js';
import { type GeminiResponse, GeminiClient } from '../llm/gemini-client.js';
import { PoolManager } from '../llm/pool-manager.js';
import { PromptBuilder } from '../llm/prompt-builder.js';
import { TokenOptimizer } from '../llm/token-optimizer.js';
import { SkillLoader } from '../skills/skill-loader.js';
import { FsTools } from '../utils/fs-tools.js';
import { withRetry, isRateLimitError } from '../utils/retry.js';
import { logger } from '../utils/logger.js';

export interface AgentExecutionResult {
  success: boolean;
  files: FileChange[];
  message: string;
  tokensUsed: number;
  attempts: number;
  agentRole: AgentRole;
  /** Skills that were loaded into the context window for this execution */
  skillsLoaded?: string[];
}

export abstract class BaseAgent {
  readonly role: AgentRole;
  protected pool: PoolManager;
  protected promptBuilder: PromptBuilder;
  protected tokenOptimizer: TokenOptimizer;
  protected skillLoader: SkillLoader;
  protected fs: FsTools;
  protected projectRoot: string;
  protected tier: ModelTier;

  constructor(
    role: AgentRole,
    pool: PoolManager,
    promptBuilder: PromptBuilder,
    fs: FsTools,
    projectRoot: string
  ) {
    this.role = role;
    this.pool = pool;
    this.promptBuilder = promptBuilder;
    const maxCtx = parseInt(process.env['AGENT_MAX_CONTEXT_TOKENS'] ?? '900000', 10);
    this.tokenOptimizer = new TokenOptimizer(maxCtx);
    this.skillLoader = new SkillLoader(projectRoot);
    this.fs = fs;
    this.projectRoot = projectRoot;
    this.tier = AGENT_MODEL_MAPPING[role];
  }

  /** Execute a task — each domain agent implements this */
  abstract execute(task: TaskNode): Promise<AgentExecutionResult>;

  /** Call the LLM with retry, rate-limit handling, and automatic token optimization */
  protected async callLLM(
    prompt: string,
    systemPrompt?: string,
    options?: { temperature?: number; maxOutputTokens?: number; jsonMode?: boolean }
  ): Promise<GeminiResponse> {
    // ── Token Optimization Pass ──────────────────────────────
    const optimized = this.tokenOptimizer.optimize(
      systemPrompt ?? '',
      prompt,
      this.tier,
      { jsonMode: options?.jsonMode },
    );

    const finalSystem = optimized.systemPrompt;
    const finalPrompt = optimized.userPrompt;
    const finalMaxTokens = options?.maxOutputTokens
      ? Math.min(options.maxOutputTokens, optimized.maxOutputTokens)
      : optimized.maxOutputTokens;

    return withRetry(
      async () => {
        const client = this.pool.getClient(this.tier);
        try {
          const response = await client.call(finalPrompt, {
            systemPrompt: finalSystem,
            temperature: options?.temperature,
            maxOutputTokens: finalMaxTokens,
            jsonMode: options?.jsonMode,
            thinkingBudget: optimized.thinkingConfig.budgetTokens,
          });

          // Record usage
          this.pool.recordUsage(this.tier, response.keyIndex, response.tokensUsed.total);
          return response;
        } catch (error) {
          if (isRateLimitError(error as Error)) {
            this.pool.markRateLimited(this.tier, (error as Error & { keyIndex?: number }).keyIndex ?? 0, 60_000);
          }
          throw error;
        }
      },
      {
        maxRetries: 3,
        baseDelayMs: 2000,
        onRateLimit: () => 30_000,
      },
      `${this.role}-llm-call`
    );
  }

  /** Parse LLM response into file changes and apply them */
  protected parseAndApplyFiles(response: GeminiResponse, taskId: string): FileChange[] {
    const rawChanges = GeminiClient.parseFileChanges(response.text);
    const fileChanges: FileChange[] = [];

    for (const raw of rawChanges) {
      const change: FileChange = {
        path: raw.path,
        action: raw.action as FileChange['action'],
        content: raw.content,
        originalContent: this.fs.readFile(raw.path) ?? undefined,
      };

      // Apply the change
      if (change.action === 'delete') {
        this.fs.deleteFile(change.path, taskId);
      } else {
        this.fs.writeFile(change.path, change.content ?? '', taskId);
      }

      fileChanges.push(change);
      logger.info(`${change.action.toUpperCase()} ${change.path}`, this.role);
    }

    return fileChanges;
  }

  /**
   * Build context-rich prompt for this agent's domain.
   * Now includes dynamic skill injection from /skills directory.
   *
   * @param taskDescription - The task to perform
   * @param extraContext - Additional context files, wiki pages, and text
   */
  protected buildPrompt(taskDescription: string, extraContext?: {
    files?: string[];
    wikiPages?: string[];
    additionalText?: string;
  }): { systemPrompt: string; userPrompt: string; skillsLoaded: string[] } {
    // Load relevant skills based on role + task keywords
    const skills = this.skillLoader.loadSkillsForAgent(this.role, taskDescription);
    const skillContext = this.skillLoader.formatSkillsAsContext(skills);
    const skillsLoaded = skills.map(s => s.skillId);

    // Merge skill context into the additional text
    const combinedAdditionalContext = [
      skillContext,
      extraContext?.additionalText ?? '',
    ].filter(Boolean).join('\n\n');

    const { systemPrompt, userPrompt } = this.promptBuilder.buildTaskPrompt({
      role: this.role,
      taskDescription,
      contextFiles: extraContext?.files,
      wikiPages: extraContext?.wikiPages,
      includeTypes: true,
      additionalContext: combinedAdditionalContext || undefined,
    });

    return { systemPrompt, userPrompt, skillsLoaded };
  }

  /** Create a result object */
  protected result(
    success: boolean,
    files: FileChange[],
    message: string,
    tokensUsed: number,
    attempts: number,
    skillsLoaded?: string[]
  ): AgentExecutionResult {
    return { success, files, message, tokensUsed, attempts, agentRole: this.role, skillsLoaded };
  }
}
