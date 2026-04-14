/**
 * SANKALP-AEI Agent System — Task Parser
 * Reads tasks.md and project status to understand completion state.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger.js';

export interface ProjectStatus {
  completionPercent: number;
  completedItems: string[];
  partialItems: string[];
  missingItems: string[];
  summary: string;
}

export class TaskParser {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /** Parse tasks.md for current project status */
  getProjectStatus(): ProjectStatus {
    const tasksPath = join(this.projectRoot, 'tasks.md');
    if (!existsSync(tasksPath)) {
      return {
        completionPercent: 0,
        completedItems: [],
        partialItems: [],
        missingItems: [],
        summary: 'No tasks.md found',
      };
    }

    const content = readFileSync(tasksPath, 'utf-8');
    const lines = content.split('\n');

    const completed: string[] = [];
    const partial: string[] = [];
    const missing: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('✅') || trimmed.includes('[x]')) {
        completed.push(trimmed.replace(/^[✅\s\[x\]]+/, '').trim());
      } else if (trimmed.startsWith('⚠️') || trimmed.includes('PARTIAL')) {
        partial.push(trimmed.replace(/^[⚠️\s\[\]]+/, '').trim());
      } else if (trimmed.startsWith('❌') || trimmed.includes('NOT FOUND') || trimmed.includes('NOT STARTED')) {
        missing.push(trimmed.replace(/^[❌\s]+/, '').trim());
      }
    }

    const total = completed.length + partial.length + missing.length;
    const completionPercent = total > 0
      ? Math.round((completed.length + partial.length * 0.5) / total * 100)
      : 0;

    return {
      completionPercent,
      completedItems: completed,
      partialItems: partial,
      missingItems: missing,
      summary: `${completionPercent}% complete: ${completed.length} done, ${partial.length} partial, ${missing.length} missing`,
    };
  }

  /** Get the missing items as actionable task descriptions */
  getMissingAsTasks(): string[] {
    const status = this.getProjectStatus();
    return [
      ...status.missingItems.map(item => `[MISSING] ${item}`),
      ...status.partialItems.map(item => `[PARTIAL] ${item}`),
    ];
  }

  /** Read the geminiworks.md roadmap */
  getRoadmap(): string | null {
    const roadmapPath = join(this.projectRoot, 'geminiworks.md');
    if (!existsSync(roadmapPath)) return null;
    try {
      return readFileSync(roadmapPath, 'utf-8');
    } catch {
      return null;
    }
  }
}
