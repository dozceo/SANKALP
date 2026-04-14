#!/usr/bin/env node
/**
 * SANKALP-AEI Agent System — CLI Entry Point
 * Usage:
 *   npx tsx src/index.ts "Build all missing API routes"
 *   npx tsx src/index.ts --dry-run "Build student portal pages"
 *   npx tsx src/index.ts --status
 */

import { Command } from 'commander';
import { resolve } from 'path';
import { Orchestrator } from './core/orchestrator.js';
import { type AgentConfig } from './llm/models.js';
import { logger } from './utils/logger.js';
import chalk from 'chalk';

const PROJECT_ROOT = resolve(import.meta.dirname, '..', '..');

const program = new Command();

program
  .name('sankalp-agents')
  .description('🧠 SANKALP-AEI Multi-Agent Orchestration System')
  .version('1.0.0');

program
  .command('run')
  .description('Execute a development task using the agent orchestra')
  .argument('<task>', 'Task description in natural language')
  .option('--dry-run', 'Plan only, no file writes', false)
  .option('--no-commit', 'Generate files but skip git commit', false)
  .option('--branch-prefix <prefix>', 'Git branch prefix', 'agent/')
  .option('--log-level <level>', 'Log level (debug|info|warn|error)', 'info')
  .option('--max-retries <n>', 'Max retries per API call', '3')
  .action(async (task: string, options: {
    dryRun: boolean;
    commit: boolean;
    branchPrefix: string;
    logLevel: string;
    maxRetries: string;
  }) => {
    logger.setLevel(options.logLevel);

    const config: AgentConfig = {
      maxRetries: parseInt(options.maxRetries),
      retryDelayMs: 2000,
      maxContextTokens: 900_000,
      autoCommit: options.commit && !options.dryRun,
      branchPrefix: options.branchPrefix,
      logLevel: options.logLevel,
      projectRoot: PROJECT_ROOT,
    };

    console.log('');
    console.log(chalk.bold.magentaBright('  ╔══════════════════════════════════════════════╗'));
    console.log(chalk.bold.magentaBright('  ║') + chalk.bold.whiteBright('  🧠 SANKALP-AEI Agent Orchestrator           ') + chalk.bold.magentaBright('║'));
    console.log(chalk.bold.magentaBright('  ║') + chalk.gray('  30 Gemini keys • 5 Domain Agents • 1 Brain  ') + chalk.bold.magentaBright('║'));
    console.log(chalk.bold.magentaBright('  ╚══════════════════════════════════════════════╝'));
    console.log('');

    const orchestrator = new Orchestrator(config);
    const result = await orchestrator.run(task, { dryRun: options.dryRun });

    if (result.success) {
      console.log('');
      console.log(chalk.greenBright('  ✅ Task completed successfully!'));
      if (result.branch) {
        console.log(chalk.gray(`     Branch: ${result.branch}`));
        console.log(chalk.gray(`     Commit: ${result.commitSha?.slice(0, 8)}`));
      }
      console.log(chalk.gray(`     Files:  ${result.filesChanged.length} changed`));
      console.log(chalk.gray(`     Tokens: ${result.totalTokens.toLocaleString()}`));
      console.log(chalk.gray(`     Time:   ${(result.durationMs / 1000).toFixed(1)}s`));
      console.log('');
    } else {
      console.log('');
      console.log(chalk.redBright('  ❌ Task failed.'));
      console.log(chalk.gray(`     ${result.report}`));
      console.log('');
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Show project status and missing items')
  .action(async () => {
    const { TaskParser } = await import('./context/task-parser.js');
    const parser = new TaskParser(PROJECT_ROOT);
    const status = parser.getProjectStatus();

    console.log('');
    console.log(chalk.bold.cyanBright('  📊 SANKALP-AEI Project Status'));
    console.log(chalk.gray('  ' + '─'.repeat(40)));
    console.log(chalk.whiteBright(`  Completion: ${status.completionPercent}%`));
    console.log('');

    if (status.missingItems.length > 0) {
      console.log(chalk.redBright('  ❌ Missing:'));
      for (const item of status.missingItems.slice(0, 20)) {
        console.log(chalk.gray(`     • ${item}`));
      }
      console.log('');
    }

    if (status.partialItems.length > 0) {
      console.log(chalk.yellowBright('  ⚠️ Partial:'));
      for (const item of status.partialItems) {
        console.log(chalk.gray(`     • ${item}`));
      }
      console.log('');
    }

    console.log(chalk.greenBright(`  ✅ Completed: ${status.completedItems.length} items`));
    console.log('');
  });

program
  .command('pool')
  .description('Show API key pool status')
  .action(() => {
    const config: AgentConfig = {
      maxRetries: 3,
      retryDelayMs: 2000,
      maxContextTokens: 900_000,
      autoCommit: false,
      branchPrefix: 'agent/',
      logLevel: 'info',
      projectRoot: PROJECT_ROOT,
    };

    const orchestrator = new Orchestrator(config);
    orchestrator.showStats();
  });

program
  .command('wiki')
  .description('List available wiki pages for context')
  .action(async () => {
    const { WikiReader } = await import('./context/wiki-reader.js');
    const reader = new WikiReader(PROJECT_ROOT);
    const pages = reader.listPages();

    console.log('');
    console.log(chalk.bold.cyanBright(`  📚 Wiki Pages (${pages.length})`));
    console.log(chalk.gray('  ' + '─'.repeat(40)));
    for (const page of pages) {
      console.log(chalk.gray(`     • ${page}`));
    }
    console.log('');
  });

// Default: treat positional arg as task
program
  .argument('[task]', 'Task description (shorthand for "run" command)')
  .option('--dry-run', 'Plan only', false)
  .action(async (task?: string, options?: { dryRun?: boolean }) => {
    if (task) {
      // Forward to run command
      await program.parseAsync(['node', 'index.ts', 'run', task, ...(options?.dryRun ? ['--dry-run'] : [])]);
    } else {
      program.help();
    }
  });

program.parse();
