/**
 * SANKALP-AEI Agent System — DevOps Agent
 * Handles Firebase deployment, monitoring configs, and CI/CD.
 * Enhanced with dynamic skill injection for Firebase, GitHub Actions, GCP, etc.
 */

import { BaseAgent, type AgentExecutionResult } from './base-agent.js';
import { type TaskNode } from '../llm/models.js';
import { logger } from '../utils/logger.js';

export class DevOpsAgent extends BaseAgent {
  async execute(task: TaskNode): Promise<AgentExecutionResult> {
    logger.info(`🚀 Starting: ${task.name}`, this.role);
    let totalTokens = 0;

    const { systemPrompt, userPrompt, skillsLoaded } = this.buildPrompt(
      `You are the DevOps & Infrastructure Specialist for SANKALP-AEI.

## Task
${task.description}

## Infrastructure Rules
1. Firebase Hosting for static frontend assets
2. Firebase Cloud Functions (Node 20) for backend API
3. Firestore RBAC rules must be updated when adding new collections
4. GCP Cloud Monitoring dashboards for system health
5. Environment management: .env.example must be kept in sync
6. CI/CD: GitHub Actions for build/test/deploy pipeline
7. Performance target: <500ms for all API responses

Generate COMPLETE file contents.`,
      {
        files: [
          'firebase.json',
          'firestore.rules',
          '.env.example',
          'package.json',
        ],
        wikiPages: [
          'api-infrastructure',
          'api-infrastructure-firebase-json',
          'api-infrastructure-monitoring',
          'api-infrastructure-scripts',
        ],
      }
    );

    if (skillsLoaded.length > 0) {
      logger.info(`🚀 Skills loaded: ${skillsLoaded.join(', ')}`, this.role);
    }

    try {
      const response = await this.callLLM(userPrompt, systemPrompt, {
        maxOutputTokens: 16384,
        temperature: 0.1,
      });
      totalTokens += response.tokensUsed.total;

      const files = this.parseAndApplyFiles(response, task.id);
      logger.info(`🚀 Generated ${files.length} devops files`, this.role);
      return this.result(files.length > 0, files, `Generated ${files.length} devops files`, totalTokens, 1, skillsLoaded);
    } catch (error) {
      return this.result(false, [], (error as Error).message, totalTokens, 1, skillsLoaded);
    }
  }
}
