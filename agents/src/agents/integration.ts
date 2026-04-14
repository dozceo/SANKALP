/**
 * SANKALP-AEI Agent System — Integration Agent
 * Specializes in cross-layer wiring: Brain Map ↔ ADK, Pipeline ↔ Services, etc.
 * Enhanced with dynamic skill injection for architecture, DDD, event sourcing, etc.
 */

import { BaseAgent, type AgentExecutionResult } from './base-agent.js';
import { type TaskNode } from '../llm/models.js';
import { logger } from '../utils/logger.js';

export class IntegrationAgent extends BaseAgent {
  async execute(task: TaskNode): Promise<AgentExecutionResult> {
    logger.info(`🔗 Starting: ${task.name}`, this.role);
    let totalTokens = 0;

    const { systemPrompt, userPrompt, skillsLoaded } = this.buildPrompt(
      `You are the Integration Specialist for SANKALP-AEI. Your job is to wire together different layers of the system.

## Task
${task.description}

## Key Integration Patterns
1. Brain Map™ → Feature Engineering Block: Every interaction triggers mastery update via Beta(α,β)
2. Feature Engineering → Prediction Block: 40+ extracted features flow to ML models
3. Prediction → Decision (ADK): Probabilistic outputs become deterministic pedagogical actions
4. Decision → Generation: ADK actions trigger LLM-based content via Genkit
5. Generation → Memory: All outputs recorded to academic memory
6. Services → API Routes: Dashboard services exposed via typed Express endpoints
7. Infrastructure → Core: Firestore listeners trigger pipeline re-execution

## Rules
- NEVER break existing interfaces in src/types/
- Import paths must be correct (relative, not absolute)
- Update barrel exports (index.ts) when adding new modules
- Ensure pipeline.ts orchestrator routes data through new integrations
- Test that type compatibility holds across boundaries

Generate COMPLETE file contents.`,
      {
        files: [
          'src/lib/pipeline.ts',
          'src/core/knowledge/brain-map.ts',
          'src/core/features/implementation.ts',
          'src/core/prediction/implementation.ts',
          'src/core/decision/implementation.ts',
        ],
        wikiPages: [
          'core-intelligence-engine',
          'core-intelligence-engine-core',
          'core-intelligence-engine-lib',
          'core-intelligence-engine-types',
        ],
      }
    );

    if (skillsLoaded.length > 0) {
      logger.info(`🔗 Skills loaded: ${skillsLoaded.join(', ')}`, this.role);
    }

    try {
      const response = await this.callLLM(userPrompt, systemPrompt, {
        maxOutputTokens: 65536,
        temperature: 0.2,
      });
      totalTokens += response.tokensUsed.total;

      const files = this.parseAndApplyFiles(response, task.id);
      logger.info(`🔗 Generated ${files.length} integration files`, this.role);
      return this.result(files.length > 0, files, `Generated ${files.length} integration files`, totalTokens, 1, skillsLoaded);
    } catch (error) {
      return this.result(false, [], (error as Error).message, totalTokens, 1, skillsLoaded);
    }
  }
}
