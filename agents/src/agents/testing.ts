/**
 * SANKALP-AEI Agent System — Testing Agent
 * Generates Vitest (TS) and Pytest (Python) tests for all blocks.
 * Enhanced with dynamic skill injection for testing patterns, TDD, Playwright, etc.
 */

import { BaseAgent, type AgentExecutionResult } from './base-agent.js';
import { type TaskNode } from '../llm/models.js';
import { logger } from '../utils/logger.js';

export class TestingAgent extends BaseAgent {
  async execute(task: TaskNode): Promise<AgentExecutionResult> {
    logger.info(`🧪 Starting: ${task.name}`, this.role);
    let totalTokens = 0;

    const { systemPrompt, userPrompt, skillsLoaded } = this.buildPrompt(
      `You are the Test Generation Specialist for SANKALP-AEI.

## Task
${task.description}

## Testing Rules
1. TypeScript tests: Use Vitest with \`describe\`, \`it\`, \`expect\`
2. Python tests: Use Pytest with \`test_\` prefix functions
3. Edge cases to always include:
   - First-time student (no history)
   - Null/undefined mastery values
   - Empty event arrays
   - Boundary conditions (mastery = 0, mastery = 1)
   - Rate-limited API responses
4. No partial mocking of complex interfaces — use full mock objects
5. Use existing test helpers from tests/helpers/ (createTestLearnerState, createQuizEvent, createMockFirestore)
6. Bayesian tests: Verify Beta distribution properties (α+β invariants, CI width > 0)
7. Test file naming: \`{module}.test.ts\` in appropriate test directory
8. Integration tests go in tests/integration/, unit tests in tests/unit/

Generate COMPLETE test files.`,
      {
        files: [
          'vitest.config.ts',
          'tests/integration/pipeline-full.test.ts',
        ],
        wikiPages: [
          'core-intelligence-engine-unit',
          'core-intelligence-engine-integration',
          'api-infrastructure-helpers',
        ],
      }
    );

    if (skillsLoaded.length > 0) {
      logger.info(`🧪 Skills loaded: ${skillsLoaded.join(', ')}`, this.role);
    }

    try {
      const response = await this.callLLM(userPrompt, systemPrompt, {
        maxOutputTokens: 32768,
        temperature: 0.2,
      });
      totalTokens += response.tokensUsed.total;

      const files = this.parseAndApplyFiles(response, task.id);
      logger.info(`🧪 Generated ${files.length} test files`, this.role);
      return this.result(files.length > 0, files, `Generated ${files.length} test files`, totalTokens, 1, skillsLoaded);
    } catch (error) {
      return this.result(false, [], (error as Error).message, totalTokens, 1, skillsLoaded);
    }
  }
}
