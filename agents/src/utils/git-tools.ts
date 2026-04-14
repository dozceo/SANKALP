/**
 * SANKALP-AEI Agent System — Git Operations
 * Branch management, staging, committing, and diff generation.
 */

import { simpleGit, type SimpleGit } from 'simple-git';
import { logger } from './logger.js';

export class GitTools {
  private git: SimpleGit;
  private branchPrefix: string;

  constructor(projectRoot: string, branchPrefix: string = 'agent/') {
    this.git = simpleGit(projectRoot);
    this.branchPrefix = branchPrefix;
  }

  /** Create and checkout a feature branch for a task */
  async createBranch(taskName: string): Promise<string> {
    const safeName = taskName
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50);
    const timestamp = Date.now().toString(36);
    const branchName = `${this.branchPrefix}${safeName}-${timestamp}`;

    try {
      // Stash any uncommitted changes
      const status = await this.git.status();
      if (status.modified.length > 0 || status.not_added.length > 0) {
        await this.git.stash();
        logger.info(`Stashed ${status.modified.length} modified files`, 'system');
      }

      // Create and checkout new branch
      await this.git.checkoutLocalBranch(branchName);
      logger.info(`Created branch: ${branchName}`, 'system');
      return branchName;
    } catch (error) {
      logger.error(`Failed to create branch: ${(error as Error).message}`, 'system');
      throw error;
    }
  }

  /** Stage specific files */
  async stageFiles(filePaths: string[]): Promise<void> {
    if (filePaths.length === 0) return;
    await this.git.add(filePaths);
    logger.debug(`Staged ${filePaths.length} files`, 'system');
  }

  /** Commit staged changes */
  async commit(message: string): Promise<string> {
    try {
      const result = await this.git.commit(message);
      const sha = result.commit || 'unknown';
      logger.info(`Committed: ${sha.slice(0, 8)} — ${message}`, 'system');
      return sha;
    } catch (error) {
      logger.error(`Commit failed: ${(error as Error).message}`, 'system');
      throw error;
    }
  }

  /** Stage and commit in one operation */
  async stageAndCommit(filePaths: string[], message: string): Promise<string> {
    await this.stageFiles(filePaths);
    return this.commit(message);
  }

  /** Get the diff of staged changes */
  async getStagedDiff(): Promise<string> {
    return this.git.diff(['--cached']);
  }

  /** Get the diff of unstaged changes */
  async getUnstagedDiff(): Promise<string> {
    return this.git.diff();
  }

  /** Get the current branch name */
  async getCurrentBranch(): Promise<string> {
    const branch = await this.git.revparse(['--abbrev-ref', 'HEAD']);
    return branch.trim();
  }

  /** Switch back to main/master branch */
  async switchToMain(): Promise<void> {
    try {
      await this.git.checkout('main');
    } catch {
      try {
        await this.git.checkout('master');
      } catch (error) {
        logger.error(`Could not switch to main/master: ${(error as Error).message}`, 'system');
      }
    }
  }

  /** Get the status of the working tree */
  async getStatus(): Promise<{
    modified: string[];
    created: string[];
    deleted: string[];
    staged: string[];
  }> {
    const status = await this.git.status();
    return {
      modified: status.modified,
      created: status.not_added,
      deleted: status.deleted,
      staged: status.staged,
    };
  }

  /** Get the log of recent commits on the current branch */
  async getRecentCommits(count: number = 5): Promise<Array<{ hash: string; message: string; date: string }>> {
    const log = await this.git.log({ maxCount: count });
    return log.all.map(entry => ({
      hash: entry.hash.slice(0, 8),
      message: entry.message,
      date: entry.date,
    }));
  }
}
