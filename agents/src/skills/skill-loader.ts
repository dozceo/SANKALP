/**
 * SANKALP-AEI Agent System — Skill Loader
 * Dynamically reads SKILL.md files from the /skills directory and injects
 * relevant skill content into agent context windows at execution time.
 *
 * Flow:
 *   1. SkillRegistry determines which skills belong to an agent (core + supplementary)
 *   2. SkillLoader reads the SKILL.md content from disk
 *   3. Keyword activation detects supplementary skills based on task description
 *   4. Content is truncated to fit within token budget and returned as prompt context
 */

import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { AgentRole } from '../llm/models.js';
import {
  AGENT_SKILL_REGISTRY,
  SKILL_ACTIVATION_KEYWORDS,
  type SkillMapping,
} from './skill-registry.js';
import { logger } from '../utils/logger.js';

/** Resolved skill with its content loaded from disk */
export interface LoadedSkill {
  skillId: string;
  relevance: string;
  priority: 'core' | 'supplementary';
  content: string;
  /** Byte size of the loaded content */
  sizeBytes: number;
}

export class SkillLoader {
  private skillsRoot: string;
  /** Fallback path for agent-local skills (e.g. design-system-sankalp) */
  private fallbackSkillsRoot: string;
  /** In-memory cache of loaded skills to avoid redundant disk reads */
  private cache: Map<string, string> = new Map();

  /**
   * @param projectRoot - The root of the SANKALP-AEI project
   */
  constructor(projectRoot: string) {
    // Primary skills location: {projectRoot}/skills/{skill-id}/SKILL.md
    this.skillsRoot = resolve(projectRoot, 'skills');
    // Secondary location: {projectRoot}/agents/knowledge/skills/{skill-id}/SKILL.md
    // This is where agent-specific skills (e.g. design-system-sankalp) live.
    this.fallbackSkillsRoot = resolve(projectRoot, 'agents', 'knowledge', 'skills');
  }

  /**
   * Load all relevant skills for a given agent role and task description.
   *
   * @param role - The agent role requesting skills
   * @param taskDescription - The natural language task (used for keyword activation)
   * @param maxTotalBytes - Maximum total bytes to inject (prevents context overflow)
   * @returns Array of loaded skills sorted by priority (core first)
   */
  loadSkillsForAgent(
    role: AgentRole,
    taskDescription: string,
    maxTotalBytes: number = 80_000,
  ): LoadedSkill[] {
    const registry = AGENT_SKILL_REGISTRY[role] ?? [];

    // Step 1: Collect core skills (always loaded)
    const coreSkills = registry.filter(s => s.priority === 'core');

    // Step 2: Collect supplementary skills activated by task keywords
    const activatedSupplementary = this.getKeywordActivatedSkills(
      taskDescription,
      registry.filter(s => s.priority === 'supplementary'),
    );

    // Step 3: Merge — core first, then keyword-activated supplementary
    const skillsToLoad = [...coreSkills, ...activatedSupplementary];

    // Step 4: Load content from disk with budget enforcement
    const loaded: LoadedSkill[] = [];
    let totalBytes = 0;

    for (const mapping of skillsToLoad) {
      const content = this.readSkillContent(mapping.skillId);
      if (!content) continue;

      // Budget check — stop loading if we'd exceed the limit
      if (totalBytes + content.length > maxTotalBytes) {
        logger.debug(
          `[SkillLoader] Budget exceeded at ${totalBytes}B, skipping remaining skills for ${role}`,
        );
        break;
      }

      loaded.push({
        skillId: mapping.skillId,
        relevance: mapping.relevance,
        priority: mapping.priority,
        content,
        sizeBytes: content.length,
      });

      totalBytes += content.length;
    }

    if (loaded.length > 0) {
      logger.info(
        `[SkillLoader] Loaded ${loaded.length} skills for ${role} (${(totalBytes / 1024).toFixed(1)}KB)`,
      );
    }

    return loaded;
  }

  /**
   * Format loaded skills into a prompt-ready string block.
   * This is what gets injected into the agent's system prompt.
   */
  formatSkillsAsContext(skills: LoadedSkill[]): string {
    if (skills.length === 0) return '';

    const parts: string[] = [
      '# Injected Skills Knowledge',
      '',
      'The following expert skills are loaded to enhance your output quality.',
      'Apply the relevant patterns and best practices from these skills to your task.',
      '',
    ];

    for (const skill of skills) {
      parts.push(`## Skill: ${skill.skillId}`);
      parts.push(`> Relevance: ${skill.relevance}`);
      parts.push('');
      // Truncate individual skill content to prevent single skills from dominating
      const truncated = skill.content.length > 12_000
        ? skill.content.slice(0, 12_000) + '\n\n[... truncated for context budget ...]'
        : skill.content;
      parts.push(truncated);
      parts.push('');
      parts.push('---');
      parts.push('');
    }

    return parts.join('\n');
  }

  /**
   * Get a summary of which skills would be loaded for each agent role.
   * Useful for debugging and documentation.
   */
  getSkillManifest(): Record<string, { core: string[]; supplementary: string[] }> {
    const manifest: Record<string, { core: string[]; supplementary: string[] }> = {};

    for (const [role, mappings] of Object.entries(AGENT_SKILL_REGISTRY)) {
      manifest[role] = {
        core: mappings.filter(m => m.priority === 'core').map(m => m.skillId),
        supplementary: mappings.filter(m => m.priority === 'supplementary').map(m => m.skillId),
      };
    }

    return manifest;
  }

  // ─── Private Methods ─────────────────────────────────────────

  /**
   * Read the SKILL.md content for a given skill ID.
   * Searches primary path first, then fallback (agents/knowledge/skills/).
   * Returns null if the skill doesn't exist in either location.
   */
  private readSkillContent(skillId: string): string | null {
    // Check cache first
    if (this.cache.has(skillId)) {
      return this.cache.get(skillId)!;
    }

    // Try primary location
    const primaryPath = join(this.skillsRoot, skillId, 'SKILL.md');
    // Try fallback location (agents/knowledge/skills/)
    const fallbackPath = join(this.fallbackSkillsRoot, skillId, 'SKILL.md');

    const skillPath = existsSync(primaryPath) ? primaryPath
      : existsSync(fallbackPath) ? fallbackPath
      : null;

    if (!skillPath) {
      logger.debug(`[SkillLoader] Skill not found in primary or fallback: ${skillId}`);
      return null;
    }

    try {
      const content = readFileSync(skillPath, 'utf-8');
      this.cache.set(skillId, content);
      return content;
    } catch (error) {
      logger.warn(`[SkillLoader] Failed to read skill ${skillId}: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * Determine which supplementary skills should be activated
   * based on keyword matches in the task description.
   */
  private getKeywordActivatedSkills(
    taskDescription: string,
    supplementaryPool: SkillMapping[],
  ): SkillMapping[] {
    const taskLower = taskDescription.toLowerCase();
    const activatedIds = new Set<string>();

    // Check keyword activation map
    for (const [keyword, skillIds] of Object.entries(SKILL_ACTIVATION_KEYWORDS)) {
      if (taskLower.includes(keyword)) {
        for (const id of skillIds) {
          activatedIds.add(id);
        }
      }
    }

    // Filter supplementary pool to only include activated skills
    // Also include any supplementary skill whose relevance keywords match the task
    return supplementaryPool.filter(skill => {
      // Direct keyword activation
      if (activatedIds.has(skill.skillId)) return true;

      // Fuzzy match: check if skill's relevance text overlaps with task
      const relevanceWords = skill.relevance.toLowerCase().split(/\s+/);
      const matchCount = relevanceWords.filter(w =>
        w.length > 4 && taskLower.includes(w)
      ).length;

      return matchCount >= 2; // At least 2 relevance words must match
    });
  }
}
