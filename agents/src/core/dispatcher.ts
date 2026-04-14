/**
 * SANKALP-AEI Agent System — Dispatcher
 * Routes subtasks to domain agents, manages parallel execution, and collects results.
 */

import { type TaskNode, AgentRole, TaskStatus, type FileChange } from '../llm/models.js';
import { PoolManager } from '../llm/pool-manager.js';
import { PromptBuilder } from '../llm/prompt-builder.js';
import { FsTools } from '../utils/fs-tools.js';
import { TaskGraphManager } from '../tasks/task-graph.js';
import { BaseAgent, type AgentExecutionResult } from '../agents/base-agent.js';
import { FrontendAgent } from '../agents/frontend.js';
import { BackendAgent } from '../agents/backend.js';
import { IntegrationAgent } from '../agents/integration.js';
import { TestingAgent } from '../agents/testing.js';
import { DevOpsAgent } from '../agents/devops.js';
import { TokenOptimizerAgent } from '../agents/token-optimizer-agent.js';
import { logger } from '../utils/logger.js';

export class Dispatcher {
  private agents: Map<AgentRole, BaseAgent>;
  private pool: PoolManager;

  constructor(pool: PoolManager, promptBuilder: PromptBuilder, fs: FsTools, projectRoot: string) {
    this.pool = pool;
    this.agents = new Map();

    // Initialize all domain agents
    this.agents.set(AgentRole.FRONTEND, new FrontendAgent(AgentRole.FRONTEND, pool, promptBuilder, fs, projectRoot));
    this.agents.set(AgentRole.BACKEND, new BackendAgent(AgentRole.BACKEND, pool, promptBuilder, fs, projectRoot));
    this.agents.set(AgentRole.INTEGRATION, new IntegrationAgent(AgentRole.INTEGRATION, pool, promptBuilder, fs, projectRoot));
    this.agents.set(AgentRole.TESTING, new TestingAgent(AgentRole.TESTING, pool, promptBuilder, fs, projectRoot));
    this.agents.set(AgentRole.DEVOPS, new DevOpsAgent(AgentRole.DEVOPS, pool, promptBuilder, fs, projectRoot));
    this.agents.set(AgentRole.TOKEN_OPTIMIZER, new TokenOptimizerAgent(AgentRole.TOKEN_OPTIMIZER, pool, promptBuilder, fs, projectRoot));
  }

  /**
   * Execute all tasks in the graph, respecting dependencies.
   * Runs independent tasks in parallel where possible.
   */
  async executeGraph(graph: TaskGraphManager): Promise<{
    results: AgentExecutionResult[];
    totalTokens: number;
  }> {
    const results: AgentExecutionResult[] = [];
    let totalTokens = 0;
    let iterations = 0;
    const MAX_ITERATIONS = 50; // Safety limit

    logger.header('Execution Phase');

    while (!graph.isComplete() && iterations < MAX_ITERATIONS) {
      iterations++;
      const readyTasks = graph.getReadyTasks();

      if (readyTasks.length === 0) {
        // Check if we're stuck (all remaining tasks have unresolvable deps)
        const stats = graph.getStats();
        if (stats.running === 0 && stats.pending === 0) {
          logger.warn('No more tasks can be scheduled — possible circular dependency or all failed', 'system');
          break;
        }
        // Wait for running tasks to complete
        await this.sleep(1000);
        continue;
      }

      logger.info(`Dispatching ${readyTasks.length} ready task(s) — iteration ${iterations}`, 'system');
      logger.separator('─', 50);

      // Execute ready tasks (sequentially to manage API rate limits)
      for (const task of readyTasks) {
        graph.markRunning(task.id);
        logger.taskStatus(task.name, 'running', `→ ${task.assignedAgent}`);

        try {
          const result = await this.dispatchTask(task);
          results.push(result);
          totalTokens += result.tokensUsed;

          if (result.success) {
            graph.markCompleted(task.id, result.message, result.files);
          } else {
            graph.markFailed(task.id, result.message);
          }
        } catch (error) {
          const msg = (error as Error).message;
          logger.error(`Task "${task.name}" crashed: ${msg}`, task.assignedAgent);
          graph.markFailed(task.id, msg);
        }

        // Small delay between tasks to spread API load
        await this.sleep(500);
      }

      // Print progress
      const stats = graph.getStats();
      logger.info(
        `Progress: ${stats.completed}/${stats.total} completed, ${stats.failed} failed, ${stats.pending + stats.running} remaining`,
        'system'
      );
    }

    if (iterations >= MAX_ITERATIONS) {
      logger.error(`Execution halted: exceeded ${MAX_ITERATIONS} iterations`, 'system');
    }

    return { results, totalTokens };
  }

  /** Dispatch a single task to the appropriate agent */
  private async dispatchTask(task: TaskNode): Promise<AgentExecutionResult> {
    const agent = this.agents.get(task.assignedAgent);

    if (!agent) {
      // Fallback: use backend agent for unknown roles
      const fallback = this.agents.get(AgentRole.BACKEND)!;
      logger.warn(`No agent for role "${task.assignedAgent}", falling back to backend`, 'system');
      return fallback.execute(task);
    }

    return agent.execute(task);
  }

  /** Get pool statistics */
  getPoolStats() {
    return this.pool.getStats();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
