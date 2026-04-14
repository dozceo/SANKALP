/**
 * SANKALP-AEI Agent System — Prompt Builder
 * Assembles full context (system prompt + rules + types + code) for agent invocations.
 */

import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { AgentRole } from './models.js';
import { logger } from '../utils/logger.js';

const KNOWLEDGE_DIR = resolve(import.meta.dirname, '../../knowledge');

export class PromptBuilder {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /** Build the full system prompt for an agent role */
  buildSystemPrompt(role: AgentRole): string {
    const parts: string[] = [];

    // 1. Agent persona
    const personaPath = join(KNOWLEDGE_DIR, 'system-prompts', `${role}.md`);
    if (existsSync(personaPath)) {
      parts.push(`# Agent Persona\n${readFileSync(personaPath, 'utf-8')}`);
    }

    // 2. Domain rules (always included)
    const rulesDir = join(KNOWLEDGE_DIR, 'rules');
    const ruleFiles = ['typescript.md', 'brain-map.md', 'python.md', 'bayesian-gotchas.md'];
    for (const rf of ruleFiles) {
      const rp = join(rulesDir, rf);
      if (existsSync(rp)) {
        parts.push(`# Rule: ${rf}\n${readFileSync(rp, 'utf-8')}`);
      }
    }

    // 3. Output format instructions
    parts.push(this.getOutputFormatInstructions());

    return parts.join('\n\n---\n\n');
  }

  /** Read type definitions from src/types/ */
  getTypeDefinitions(): string {
    const typesDir = join(this.projectRoot, 'src', 'types');
    const typeFiles = ['common.ts', 'learner-state.ts', 'knowledge-graph.ts', 'prediction.ts', 'decision.ts', 'intervention.ts', 'index.ts'];
    const parts: string[] = ['# SANKALP-AEI Type Definitions\n'];

    for (const tf of typeFiles) {
      const fp = join(typesDir, tf);
      if (existsSync(fp)) {
        const content = readFileSync(fp, 'utf-8');
        parts.push(`## ${tf}\n\`\`\`typescript\n${content}\n\`\`\``);
      }
    }

    return parts.join('\n\n');
  }

  /** Read existing code files for context */
  readFileContext(filePaths: string[]): string {
    const parts: string[] = ['# Existing Code Context\n'];

    for (const fp of filePaths) {
      const absPath = fp.startsWith('/') || fp.includes(':') ? fp : join(this.projectRoot, fp);
      if (existsSync(absPath)) {
        try {
          const content = readFileSync(absPath, 'utf-8');
          const ext = absPath.split('.').pop() || 'text';
          parts.push(`## ${fp}\n\`\`\`${ext}\n${content}\n\`\`\``);
        } catch (e) {
          logger.warn(`[PromptBuilder] Failed to read ${fp}: ${(e as Error).message}`);
        }
      }
    }

    return parts.join('\n\n');
  }

  /** Read wiki pages for architectural context */
  readWikiContext(wikiPages: string[]): string {
    const wikiDir = join(this.projectRoot, '.gitnexus', 'wiki');
    const parts: string[] = ['# Architecture Wiki Context\n'];

    for (const page of wikiPages) {
      const pagePath = join(wikiDir, page.endsWith('.md') ? page : `${page}.md`);
      if (existsSync(pagePath)) {
        const content = readFileSync(pagePath, 'utf-8');
        parts.push(`## ${page}\n${content}`);
      }
    }

    return parts.join('\n\n');
  }

  /** Build a complete task prompt for an agent */
  buildTaskPrompt(options: {
    role: AgentRole;
    taskDescription: string;
    contextFiles?: string[];
    wikiPages?: string[];
    includeTypes?: boolean;
    additionalContext?: string;
  }): { systemPrompt: string; userPrompt: string } {
    const systemPrompt = this.buildSystemPrompt(options.role);

    const userParts: string[] = [];

    // Task description
    userParts.push(`# Task\n\n${options.taskDescription}`);

    // Type definitions
    if (options.includeTypes !== false) {
      userParts.push(this.getTypeDefinitions());
    }

    // Wiki context
    if (options.wikiPages && options.wikiPages.length > 0) {
      userParts.push(this.readWikiContext(options.wikiPages));
    }

    // File context
    if (options.contextFiles && options.contextFiles.length > 0) {
      userParts.push(this.readFileContext(options.contextFiles));
    }

    // Additional context
    if (options.additionalContext) {
      userParts.push(`# Additional Context\n\n${options.additionalContext}`);
    }

    return {
      systemPrompt,
      userPrompt: userParts.join('\n\n---\n\n'),
    };
  }

  private getOutputFormatInstructions(): string {
    return `# Output Format

When generating code changes, use this EXACT format for each file:

<!-- FILE: create path/to/file.ts -->
\`\`\`typescript
// file contents here
\`\`\`

<!-- FILE: modify path/to/existing.ts -->
\`\`\`typescript
// complete new file contents
\`\`\`

<!-- FILE: delete path/to/remove.ts -->

Always provide COMPLETE file contents (not diffs or partial updates).
Follow all TypeScript rules: strict types, no \`any\`, Zod validation for API boundaries.
Follow Brain Map™ laws: Beta(α,β) distributions, CI width propagation, no point estimates.`;
  }
}
