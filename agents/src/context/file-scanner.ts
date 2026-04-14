/**
 * SANKALP-AEI Agent System — File Scanner
 * Scans the project tree to build context for agents.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, relative, extname } from 'path';
import { logger } from '../utils/logger.js';

export interface FileInfo {
  path: string;
  extension: string;
  sizeBytes: number;
  category: 'frontend' | 'backend' | 'core' | 'ml' | 'types' | 'tests' | 'config' | 'other';
}

export class FileScanner {
  private projectRoot: string;
  private ignorePatterns = [
    'node_modules', '.git', '.gitnexus', 'dist', '.next', '.venv',
    '__pycache__', '.obsidian', 'output', 'dataset', 'agents',
  ];

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /** Scan the entire project and return a file inventory */
  scanProject(): FileInfo[] {
    const files: FileInfo[] = [];
    this.walkDir(this.projectRoot, files);
    return files;
  }

  /** Get files by category */
  getFilesByCategory(category: FileInfo['category']): FileInfo[] {
    return this.scanProject().filter(f => f.category === category);
  }

  /** Read multiple files and combine their content for context */
  readFilesForContext(filePaths: string[], maxTotalBytes: number = 500_000): string {
    const parts: string[] = [];
    let totalBytes = 0;

    for (const fp of filePaths) {
      const absPath = fp.startsWith('/') || fp.includes(':') ? fp : join(this.projectRoot, fp);

      if (!existsSync(absPath)) continue;

      try {
        const content = readFileSync(absPath, 'utf-8');
        if (totalBytes + content.length > maxTotalBytes) {
          logger.warn(`[FileScanner] Context budget exceeded at ${fp}, truncating`);
          break;
        }
        const ext = extname(fp).slice(1) || 'text';
        parts.push(`### ${fp}\n\`\`\`${ext}\n${content}\n\`\`\``);
        totalBytes += content.length;
      } catch {
        logger.debug(`[FileScanner] Could not read ${fp}`);
      }
    }

    return parts.join('\n\n');
  }

  /** Get all TypeScript interface files from src/types/ */
  getTypeFiles(): string[] {
    const typesDir = join(this.projectRoot, 'src', 'types');
    if (!existsSync(typesDir)) return [];

    return readdirSync(typesDir)
      .filter(f => f.endsWith('.ts'))
      .map(f => `src/types/${f}`);
  }

  /** Get all core block index files (interfaces) */
  getCoreInterfaces(): string[] {
    const coreDir = join(this.projectRoot, 'src', 'core');
    if (!existsSync(coreDir)) return [];

    const interfaces: string[] = [];
    for (const block of readdirSync(coreDir)) {
      const indexPath = join(coreDir, block, 'index.ts');
      if (existsSync(indexPath)) {
        interfaces.push(`src/core/${block}/index.ts`);
      }
    }
    return interfaces;
  }

  /** Get all existing API route files */
  getApiRoutes(): string[] {
    const routesDir = join(this.projectRoot, 'src', 'api', 'routes');
    if (!existsSync(routesDir)) return [];

    return readdirSync(routesDir)
      .filter(f => f.endsWith('.ts'))
      .map(f => `src/api/routes/${f}`);
  }

  /** Get all frontend component files */
  getFrontendComponents(): string[] {
    const feDir = join(this.projectRoot, 'frontend', 'src');
    if (!existsSync(feDir)) return [];

    const files: string[] = [];
    this.walkDir(feDir, files as unknown as FileInfo[], ['.tsx', '.jsx', '.ts', '.css']);
    return files.map(f => (f as unknown as FileInfo).path);
  }

  /** Get files relevant to a specific domain */
  getContextForDomain(domain: 'frontend' | 'backend' | 'integration' | 'testing' | 'devops'): string[] {
    const common = this.getTypeFiles();

    switch (domain) {
      case 'frontend':
        return [...common, ...this.getFrontendFiles()];
      case 'backend':
        return [...common, ...this.getBackendFiles()];
      case 'integration':
        return [...common, ...this.getCoreInterfaces(), 'src/lib/pipeline.ts'];
      case 'testing':
        return [...common, ...this.getTestFiles()];
      case 'devops':
        return ['firebase.json', 'firestore.rules', 'package.json', '.env.example'];
      default:
        return common;
    }
  }

  private getFrontendFiles(): string[] {
    const results: string[] = [];
    const feDir = join(this.projectRoot, 'frontend', 'src');
    if (existsSync(feDir)) {
      this.walkDirPaths(feDir, results, ['.tsx', '.jsx', '.ts', '.css']);
    }
    return results;
  }

  private getBackendFiles(): string[] {
    const results: string[] = [];
    const dirs = ['src/api', 'src/services', 'src/infrastructure'];
    for (const d of dirs) {
      const absDir = join(this.projectRoot, d);
      if (existsSync(absDir)) {
        this.walkDirPaths(absDir, results, ['.ts']);
      }
    }
    return results;
  }

  private getTestFiles(): string[] {
    const results: string[] = [];
    const testsDir = join(this.projectRoot, 'tests');
    if (existsSync(testsDir)) {
      this.walkDirPaths(testsDir, results, ['.ts', '.test.ts']);
    }
    return results;
  }

  private walkDir(dir: string, files: FileInfo[], allowedExts?: string[]): void {
    try {
      const entries = readdirSync(dir);
      for (const entry of entries) {
        if (this.ignorePatterns.includes(entry) || entry.startsWith('.')) continue;
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          this.walkDir(fullPath, files, allowedExts);
        } else {
          const ext = extname(entry);
          if (allowedExts && !allowedExts.includes(ext)) continue;
          const relPath = relative(this.projectRoot, fullPath).replace(/\\/g, '/');
          files.push({
            path: relPath,
            extension: ext,
            sizeBytes: stat.size,
            category: this.categorize(relPath),
          });
        }
      }
    } catch {
      // Skip inaccessible directories
    }
  }

  private walkDirPaths(dir: string, paths: string[], extensions: string[]): void {
    try {
      const entries = readdirSync(dir);
      for (const entry of entries) {
        if (this.ignorePatterns.includes(entry) || entry.startsWith('.')) continue;
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          this.walkDirPaths(fullPath, paths, extensions);
        } else {
          if (extensions.some(ext => entry.endsWith(ext))) {
            paths.push(relative(this.projectRoot, fullPath).replace(/\\/g, '/'));
          }
        }
      }
    } catch {
      // Skip inaccessible directories
    }
  }

  private categorize(path: string): FileInfo['category'] {
    if (path.startsWith('frontend/')) return 'frontend';
    if (path.startsWith('src/api/') || path.startsWith('src/services/') || path.startsWith('src/infrastructure/')) return 'backend';
    if (path.startsWith('src/core/') || path.startsWith('src/lib/')) return 'core';
    if (path.startsWith('ml/')) return 'ml';
    if (path.startsWith('src/types/')) return 'types';
    if (path.startsWith('tests/') || path.includes('.test.')) return 'tests';
    if (path.endsWith('.json') || path.endsWith('.rules') || path.startsWith('.env')) return 'config';
    return 'other';
  }
}
