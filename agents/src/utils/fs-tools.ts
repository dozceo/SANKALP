/**
 * SANKALP-AEI Agent System — File System Tools
 * Safe file operations with backup/restore capability.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, unlinkSync, readdirSync, statSync } from 'fs';
import { join, dirname, relative } from 'path';
import { logger } from './logger.js';

export class FsTools {
  private projectRoot: string;
  private backupDir: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.backupDir = join(projectRoot, 'agents', 'output', 'diffs');
    mkdirSync(this.backupDir, { recursive: true });
  }

  /** Read a file relative to project root */
  readFile(relativePath: string): string | null {
    const absPath = this.resolve(relativePath);
    if (!existsSync(absPath)) return null;
    try {
      return readFileSync(absPath, 'utf-8');
    } catch (e) {
      logger.error(`Failed to read ${relativePath}: ${(e as Error).message}`);
      return null;
    }
  }

  /** Write a file with automatic backup of existing content */
  writeFile(relativePath: string, content: string, taskId?: string): void {
    const absPath = this.resolve(relativePath);
    const dir = dirname(absPath);

    // Backup existing file
    if (existsSync(absPath)) {
      this.backup(relativePath, taskId ?? 'unknown');
    }

    // Ensure directory exists
    mkdirSync(dir, { recursive: true });

    // Write new content
    writeFileSync(absPath, content, 'utf-8');
    logger.info(`Wrote ${relativePath} (${content.length} bytes)`, 'system');
  }

  /** Delete a file with backup */
  deleteFile(relativePath: string, taskId?: string): boolean {
    const absPath = this.resolve(relativePath);
    if (!existsSync(absPath)) return false;

    this.backup(relativePath, taskId ?? 'unknown');
    unlinkSync(absPath);
    logger.info(`Deleted ${relativePath}`, 'system');
    return true;
  }

  /** Check if a file exists */
  exists(relativePath: string): boolean {
    return existsSync(this.resolve(relativePath));
  }

  /** List files in a directory recursively */
  listFiles(relativePath: string, extensions?: string[]): string[] {
    const absPath = this.resolve(relativePath);
    if (!existsSync(absPath)) return [];

    const results: string[] = [];
    const walk = (dir: string) => {
      try {
        const entries = readdirSync(dir);
        for (const entry of entries) {
          if (entry.startsWith('.') || entry === 'node_modules' || entry === 'dist') continue;
          const fullPath = join(dir, entry);
          const stat = statSync(fullPath);
          if (stat.isDirectory()) {
            walk(fullPath);
          } else if (!extensions || extensions.some(ext => entry.endsWith(ext))) {
            results.push(relative(this.projectRoot, fullPath).replace(/\\/g, '/'));
          }
        }
      } catch {
        // Permission errors, etc.
      }
    };

    walk(absPath);
    return results;
  }

  /** Create a backup of a file before modification */
  private backup(relativePath: string, taskId: string): void {
    const absPath = this.resolve(relativePath);
    if (!existsSync(absPath)) return;

    const timestamp = Date.now();
    const safePath = relativePath.replace(/[/\\]/g, '__');
    const backupPath = join(this.backupDir, `${taskId}__${timestamp}__${safePath}`);

    mkdirSync(dirname(backupPath), { recursive: true });
    copyFileSync(absPath, backupPath);
    logger.debug(`Backed up ${relativePath} → ${backupPath}`, 'system');
  }

  /** Resolve a relative path to absolute */
  resolve(relativePath: string): string {
    if (relativePath.startsWith('/') || relativePath.includes(':')) return relativePath;
    return join(this.projectRoot, relativePath);
  }

  /** Ensure output directories exist */
  ensureOutputDirs(): void {
    const dirs = [
      join(this.projectRoot, 'agents', 'output', 'logs'),
      join(this.projectRoot, 'agents', 'output', 'diffs'),
      join(this.projectRoot, 'agents', 'output', 'reports'),
    ];
    for (const d of dirs) {
      mkdirSync(d, { recursive: true });
    }
  }
}
