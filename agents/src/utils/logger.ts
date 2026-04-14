/**
 * SANKALP-AEI Agent System — Structured Logger
 * Colored, leveled logging with file output support.
 */

import chalk from 'chalk';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

const LEVEL_LABELS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: chalk.gray('DEBUG'),
  [LogLevel.INFO]: chalk.cyan('INFO '),
  [LogLevel.WARN]: chalk.yellow('WARN '),
  [LogLevel.ERROR]: chalk.red('ERROR'),
  [LogLevel.SILENT]: '',
};

const AGENT_COLORS: Record<string, (s: string) => string> = {
  orchestrator: chalk.magentaBright,
  planner: chalk.blueBright,
  frontend: chalk.greenBright,
  backend: chalk.cyanBright,
  integration: chalk.yellowBright,
  testing: chalk.white,
  devops: chalk.gray,
  reviewer: chalk.redBright,
  debugger: chalk.red,
  visual_validator: chalk.green,
  system: chalk.whiteBright,
};

class Logger {
  private level: LogLevel = LogLevel.INFO;
  private logs: string[] = [];

  setLevel(level: string): void {
    const mapping: Record<string, LogLevel> = {
      debug: LogLevel.DEBUG,
      info: LogLevel.INFO,
      warn: LogLevel.WARN,
      error: LogLevel.ERROR,
      silent: LogLevel.SILENT,
    };
    this.level = mapping[level.toLowerCase()] ?? LogLevel.INFO;
  }

  private formatTime(): string {
    return chalk.gray(new Date().toISOString().slice(11, 23));
  }

  private log(level: LogLevel, message: string, agent?: string): void {
    if (level < this.level) return;

    const time = this.formatTime();
    const label = LEVEL_LABELS[level];
    const agentTag = agent
      ? (AGENT_COLORS[agent] ?? chalk.white)(`[${agent.toUpperCase()}]`)
      : chalk.gray('[SYSTEM]');

    const formatted = `${time} ${label} ${agentTag} ${message}`;
    console.log(formatted);

    // Store raw log for file output
    const raw = `${new Date().toISOString()} ${LogLevel[level]} [${agent ?? 'SYSTEM'}] ${message}`;
    this.logs.push(raw);
  }

  debug(message: string, agent?: string): void {
    this.log(LogLevel.DEBUG, message, agent);
  }

  info(message: string, agent?: string): void {
    this.log(LogLevel.INFO, message, agent);
  }

  warn(message: string, agent?: string): void {
    this.log(LogLevel.WARN, message, agent);
  }

  error(message: string, agent?: string): void {
    this.log(LogLevel.ERROR, message, agent);
  }

  /** Pretty-print a task status update */
  taskStatus(taskId: string, status: string, details?: string): void {
    const statusColors: Record<string, (s: string) => string> = {
      pending: chalk.gray,
      assigned: chalk.blue,
      running: chalk.yellow,
      reviewing: chalk.magenta,
      debugging: chalk.red,
      validating: chalk.cyan,
      improving: chalk.yellowBright,
      completed: chalk.green,
      failed: chalk.redBright,
    };

    const colorFn = statusColors[status.toLowerCase()] ?? chalk.white;
    const statusTag = colorFn(`[${status.toUpperCase()}]`);
    const detailStr = details ? chalk.gray(` — ${details}`) : '';
    console.log(`  ${chalk.gray('→')} ${chalk.white(taskId)} ${statusTag}${detailStr}`);
  }

  /** Print a separator line */
  separator(char: string = '─', width: number = 60): void {
    console.log(chalk.gray(char.repeat(width)));
  }

  /** Print a header */
  header(title: string): void {
    this.separator('═');
    console.log(chalk.bold.whiteBright(`  🧠 ${title}`));
    this.separator('═');
  }

  /** Get all logs for file output */
  getLogs(): string[] {
    return [...this.logs];
  }

  /** Clear stored logs */
  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = new Logger();
