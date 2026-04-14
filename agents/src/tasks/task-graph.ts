/**
 * SANKALP-AEI Agent System — Task Graph
 * DAG-based task management with dependency resolution and status tracking.
 */

import { type TaskNode, type TaskGraph, TaskStatus, AgentRole } from '../llm/models.js';
import { logger } from '../utils/logger.js';

let taskIdCounter = 0;

function generateTaskId(): string {
  return `task_${Date.now().toString(36)}_${(++taskIdCounter).toString(36)}`;
}

export class TaskGraphManager {
  private graph: TaskGraph;

  constructor(name: string, description: string) {
    this.graph = {
      id: `graph_${Date.now().toString(36)}`,
      name,
      description,
      nodes: new Map(),
      createdAt: Date.now(),
    };
  }

  /** Add a task node to the graph */
  addTask(
    name: string,
    description: string,
    assignedAgent: AgentRole,
    dependencies: string[] = [],
    maxAttempts: number = 3
  ): string {
    const id = generateTaskId();
    const node: TaskNode = {
      id,
      name,
      description,
      assignedAgent,
      status: dependencies.length > 0 ? TaskStatus.WAITING : TaskStatus.PENDING,
      dependencies,
      files: [],
      attempts: 0,
      maxAttempts,
    };
    this.graph.nodes.set(id, node);
    return id;
  }

  /** Get all tasks that are ready to execute (dependencies met) */
  getReadyTasks(): TaskNode[] {
    const ready: TaskNode[] = [];

    for (const node of this.graph.nodes.values()) {
      if (node.status === TaskStatus.PENDING || node.status === TaskStatus.WAITING) {
        const depsCompleted = node.dependencies.every(depId => {
          const dep = this.graph.nodes.get(depId);
          return dep && dep.status === TaskStatus.COMPLETED;
        });

        if (depsCompleted) {
          node.status = TaskStatus.PENDING;
          ready.push(node);
        }
      }
    }

    return ready;
  }

  /** Update a task's status */
  updateStatus(taskId: string, status: TaskStatus): void {
    const node = this.graph.nodes.get(taskId);
    if (node) {
      node.status = status;
      if (status === TaskStatus.RUNNING && !node.startedAt) {
        node.startedAt = Date.now();
      }
      if (status === TaskStatus.COMPLETED || status === TaskStatus.FAILED) {
        node.completedAt = Date.now();
      }
      logger.taskStatus(node.name, status, undefined);
    }
  }

  /** Mark a task as running */
  markRunning(taskId: string): void {
    const node = this.graph.nodes.get(taskId);
    if (node) {
      node.status = TaskStatus.RUNNING;
      node.attempts++;
      node.startedAt = Date.now();
    }
  }

  /** Mark a task as completed with result */
  markCompleted(taskId: string, result: string, files: import('../llm/models.js').FileChange[]): void {
    const node = this.graph.nodes.get(taskId);
    if (node) {
      node.status = TaskStatus.COMPLETED;
      node.result = result;
      node.files = files;
      node.completedAt = Date.now();
      logger.taskStatus(node.name, 'completed', result);
    }
  }

  /** Mark a task as failed */
  markFailed(taskId: string, error: string): void {
    const node = this.graph.nodes.get(taskId);
    if (node) {
      if (node.attempts < node.maxAttempts) {
        node.status = TaskStatus.PENDING; // retry
        node.error = error;
        logger.taskStatus(node.name, 'pending', `Retry ${node.attempts}/${node.maxAttempts}: ${error}`);
      } else {
        node.status = TaskStatus.FAILED;
        node.error = error;
        node.completedAt = Date.now();
        logger.taskStatus(node.name, 'failed', error);
      }
    }
  }

  /** Check if all tasks are completed or failed */
  isComplete(): boolean {
    for (const node of this.graph.nodes.values()) {
      if (node.status !== TaskStatus.COMPLETED && node.status !== TaskStatus.FAILED) {
        return false;
      }
    }
    return true;
  }

  /** Get completion statistics */
  getStats(): { total: number; completed: number; failed: number; pending: number; running: number } {
    let total = 0, completed = 0, failed = 0, pending = 0, running = 0;
    for (const node of this.graph.nodes.values()) {
      total++;
      switch (node.status) {
        case TaskStatus.COMPLETED: completed++; break;
        case TaskStatus.FAILED: failed++; break;
        case TaskStatus.RUNNING:
        case TaskStatus.REVIEWING:
        case TaskStatus.DEBUGGING:
        case TaskStatus.VALIDATING:
        case TaskStatus.IMPROVING:
          running++; break;
        default: pending++; break;
      }
    }
    return { total, completed, failed, pending, running };
  }

  /** Get all tasks */
  getAllTasks(): TaskNode[] {
    return Array.from(this.graph.nodes.values());
  }

  /** Get a specific task */
  getTask(taskId: string): TaskNode | undefined {
    return this.graph.nodes.get(taskId);
  }

  /** Get the graph object */
  getGraph(): TaskGraph {
    return this.graph;
  }

  /** Get all modified file paths across all completed tasks */
  getAllModifiedFiles(): string[] {
    const files = new Set<string>();
    for (const node of this.graph.nodes.values()) {
      if (node.status === TaskStatus.COMPLETED) {
        for (const f of node.files) {
          files.add(f.path);
        }
      }
    }
    return Array.from(files);
  }

  /** Generate a summary report */
  generateReport(): string {
    const stats = this.getStats();
    const lines: string[] = [
      `# Task Execution Report`,
      ``,
      `**Task:** ${this.graph.name}`,
      `**Description:** ${this.graph.description}`,
      `**Created:** ${new Date(this.graph.createdAt).toISOString()}`,
      ``,
      `## Statistics`,
      `- Total: ${stats.total}`,
      `- Completed: ${stats.completed}`,
      `- Failed: ${stats.failed}`,
      `- Pending: ${stats.pending}`,
      `- Running: ${stats.running}`,
      ``,
      `## Task Details`,
    ];

    for (const node of this.graph.nodes.values()) {
      const duration = node.startedAt && node.completedAt
        ? `${((node.completedAt - node.startedAt) / 1000).toFixed(1)}s`
        : 'N/A';
      const emoji = node.status === TaskStatus.COMPLETED ? '✅'
        : node.status === TaskStatus.FAILED ? '❌' : '⏳';

      lines.push(`### ${emoji} ${node.name}`);
      lines.push(`- Agent: ${node.assignedAgent}`);
      lines.push(`- Status: ${node.status}`);
      lines.push(`- Attempts: ${node.attempts}/${node.maxAttempts}`);
      lines.push(`- Duration: ${duration}`);
      if (node.files.length > 0) {
        lines.push(`- Files: ${node.files.map(f => `${f.action} ${f.path}`).join(', ')}`);
      }
      if (node.error) {
        lines.push(`- Error: ${node.error}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }
}
