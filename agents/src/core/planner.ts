/**
 * SANKALP-AEI Agent System — Planner
 * Decomposes high-level tasks into subtask DAGs using LLM reasoning.
 */

import { type GeminiResponse, GeminiClient } from '../llm/gemini-client.js';
import { PoolManager } from '../llm/pool-manager.js';
import { ModelTier, AgentRole } from '../llm/models.js';
import { PromptBuilder } from '../llm/prompt-builder.js';
import { TaskGraphManager } from '../tasks/task-graph.js';
import { WikiReader } from '../context/wiki-reader.js';
import { FileScanner } from '../context/file-scanner.js';
import { TaskParser } from '../context/task-parser.js';
import { withRetry } from '../utils/retry.js';
import { logger } from '../utils/logger.js';

interface PlannedSubtask {
  name: string;
  description: string;
  agent: string;
  dependsOn: string[];
}

export class Planner {
  private pool: PoolManager;
  private promptBuilder: PromptBuilder;
  private wikiReader: WikiReader;
  private fileScanner: FileScanner;
  private taskParser: TaskParser;

  constructor(
    pool: PoolManager,
    promptBuilder: PromptBuilder,
    projectRoot: string,
  ) {
    this.pool = pool;
    this.promptBuilder = promptBuilder;
    this.wikiReader = new WikiReader(projectRoot);
    this.fileScanner = new FileScanner(projectRoot);
    this.taskParser = new TaskParser(projectRoot);
  }

  /** Decompose a high-level task into a task graph */
  async plan(taskDescription: string): Promise<TaskGraphManager> {
    logger.header('Planning Phase');
    logger.info('Analyzing task and building decomposition plan...', 'planner');

    // Gather context
    const projectStatus = this.taskParser.getProjectStatus();
    const overview = this.wikiReader.getOverview() ?? '';
    const roadmap = this.taskParser.getRoadmap() ?? '';
    const fileList = this.fileScanner.scanProject().map(f => f.path).join('\n');

    const prompt = `You are the Task Planner for SANKALP-AEI, an adaptive educational intelligence system.

## High-Level Task
${taskDescription}

## Current Project Status
${projectStatus.summary}

### Missing Items
${projectStatus.missingItems.join('\n')}

### Partial Items
${projectStatus.partialItems.join('\n')}

## Project Overview
${overview}

## Roadmap
${roadmap}

## Existing File Structure
${fileList}

## Available Agent Roles
- **frontend**: Next.js pages, React components, CSS, UX
- **backend**: Express routes, Firestore queries, services, core blocks
- **integration**: Cross-layer wiring, pipeline connections
- **testing**: Vitest/Pytest test generation
- **devops**: Firebase deploy, monitoring, CI/CD configs

## Instructions
Decompose the high-level task into specific, actionable subtasks. Each subtask should:
1. Be assignable to exactly ONE agent role
2. Have clear dependencies (which subtasks must complete first)
3. Be scoped to produce 1-5 files each
4. Include enough detail for the agent to know exactly what to build

Return your plan as JSON in this exact format:
{
  "taskName": "Human-readable task name",
  "taskDescription": "Overall description",
  "subtasks": [
    {
      "name": "Subtask name",
      "description": "Detailed description of what to build, including file paths",
      "agent": "frontend|backend|integration|testing|devops",
      "dependsOn": ["name of dependency subtask"]
    }
  ]
}

IMPORTANT: dependsOn references must use the exact "name" of another subtask in the array. Use empty array [] for tasks with no dependencies.`;

    const response = await withRetry(
      async () => {
        const client = this.pool.getClient(ModelTier.PRO);
        return client.call(prompt, {
          systemPrompt: 'You are a precise task planning agent. Return valid JSON only.',
          temperature: 0.3,
          maxOutputTokens: 8192,
        });
      },
      { maxRetries: 3 },
      'planner'
    );

    // Parse the plan
    const plan = GeminiClient.extractJSON<{
      taskName: string;
      taskDescription: string;
      subtasks: PlannedSubtask[];
    }>(response.text);

    if (!plan || !plan.subtasks || plan.subtasks.length === 0) {
      logger.error('Failed to parse planning response. Falling back to single-task mode.', 'planner');
      // Fallback: create a single task assigned to the most relevant agent
      const graph = new TaskGraphManager(taskDescription, taskDescription);
      graph.addTask(
        taskDescription,
        taskDescription,
        this.inferAgent(taskDescription),
      );
      return graph;
    }

    // Build the task graph
    const graph = new TaskGraphManager(plan.taskName, plan.taskDescription);
    const nameToId = new Map<string, string>();

    // First pass: create all tasks (without dependencies)
    for (const subtask of plan.subtasks) {
      const agentRole = this.parseAgentRole(subtask.agent);
      const id = graph.addTask(subtask.name, subtask.description, agentRole, []);
      nameToId.set(subtask.name, id);
    }

    // Second pass: wire up dependencies
    for (const subtask of plan.subtasks) {
      const taskId = nameToId.get(subtask.name);
      if (!taskId) continue;
      const task = graph.getTask(taskId);
      if (!task) continue;

      for (const depName of subtask.dependsOn) {
        const depId = nameToId.get(depName);
        if (depId) {
          task.dependencies.push(depId);
        }
      }
    }

    logger.info(`Plan created: ${plan.subtasks.length} subtasks in DAG`, 'planner');
    logger.separator();

    for (const task of graph.getAllTasks()) {
      logger.taskStatus(task.name, task.status, `→ ${task.assignedAgent}`);
    }

    logger.separator();
    return graph;
  }

  private parseAgentRole(role: string): AgentRole {
    const mapping: Record<string, AgentRole> = {
      frontend: AgentRole.FRONTEND,
      backend: AgentRole.BACKEND,
      integration: AgentRole.INTEGRATION,
      testing: AgentRole.TESTING,
      devops: AgentRole.DEVOPS,
    };
    return mapping[role.toLowerCase()] ?? AgentRole.BACKEND;
  }

  private inferAgent(description: string): AgentRole {
    const desc = description.toLowerCase();
    if (desc.includes('frontend') || desc.includes('component') || desc.includes('page') || desc.includes('ui')) {
      return AgentRole.FRONTEND;
    }
    if (desc.includes('test') || desc.includes('spec')) {
      return AgentRole.TESTING;
    }
    if (desc.includes('deploy') || desc.includes('firebase') || desc.includes('ci')) {
      return AgentRole.DEVOPS;
    }
    if (desc.includes('integrat') || desc.includes('wire') || desc.includes('connect')) {
      return AgentRole.INTEGRATION;
    }
    return AgentRole.BACKEND;
  }
}
