/**
 * TaskOrchestrator - Sophisticated task management inspired by Claude Code's workflow
 *
 * Key Features:
 * - Dependency-aware task execution (DAG resolution)
 * - Retry logic with exponential backoff
 * - Result caching for component reuse
 * - Parallel execution with concurrency limits
 * - Real-time progress tracking
 * - Error recovery and graceful degradation
 */

import { Task, FileItem } from '@/types';

interface TaskNode {
  task: Task;
  dependencies: Set<string>;
  dependents: Set<string>;
  retryCount: number;
  lastError?: Error;
}

interface CachedResult {
  taskId: string;
  output: FileItem[];
  timestamp: number;
  hash: string; // Content-based hash for similarity matching
}

interface ExecutionMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  cachedTasks: number;
  averageExecutionTime: number;
  totalTokensUsed?: number;
}

interface OrchestratorOptions {
  maxConcurrentTasks?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  enableCaching?: boolean;
  onTaskStart?: (task: Task) => void;
  onTaskComplete?: (task: Task, output: FileItem[]) => void;
  onTaskFail?: (task: Task, error: Error) => void;
  onProgress?: (metrics: ExecutionMetrics) => void;
}

/**
 * Priority Queue for task scheduling
 * Tasks with fewer dependencies get higher priority
 */
class PriorityQueue<T> {
  private items: Array<{ value: T; priority: number }> = [];

  enqueue(value: T, priority: number) {
    this.items.push({ value, priority });
    this.items.sort((a, b) => b.priority - a.priority);
  }

  dequeue(): T | undefined {
    return this.items.shift()?.value;
  }

  get length() {
    return this.items.length;
  }

  clear() {
    this.items = [];
  }
}

export class TaskOrchestrator {
  private taskGraph: Map<string, TaskNode>;
  private executionQueue: PriorityQueue<Task>;
  private resultCache: Map<string, CachedResult>;
  private metrics: ExecutionMetrics;
  private options: Required<OrchestratorOptions>;
  private activeTasks: Set<string>;
  private taskStartTimes: Map<string, number>;

  constructor(options: OrchestratorOptions = {}) {
    this.taskGraph = new Map();
    this.executionQueue = new PriorityQueue();
    this.resultCache = new Map();
    this.activeTasks = new Set();
    this.taskStartTimes = new Map();

    this.metrics = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      cachedTasks: 0,
      averageExecutionTime: 0,
    };

    this.options = {
      maxConcurrentTasks: options.maxConcurrentTasks ?? 5,
      maxRetries: options.maxRetries ?? 3,
      retryDelayMs: options.retryDelayMs ?? 1000,
      enableCaching: options.enableCaching ?? true,
      onTaskStart: options.onTaskStart ?? (() => {}),
      onTaskComplete: options.onTaskComplete ?? (() => {}),
      onTaskFail: options.onTaskFail ?? (() => {}),
      onProgress: options.onProgress ?? (() => {}),
    };
  }

  /**
   * Build task dependency graph
   * Similar to how Claude Code analyzes task dependencies before execution
   */
  buildGraph(tasks: Task[]): void {
    this.taskGraph.clear();
    this.metrics.totalTasks = tasks.length;

    // Phase 1: Create nodes
    for (const task of tasks) {
      this.taskGraph.set(task.id, {
        task,
        dependencies: new Set(task.dependencies || []),
        dependents: new Set(),
        retryCount: 0,
      });
    }

    // Phase 2: Build reverse dependencies (dependents)
    Array.from(this.taskGraph.entries()).forEach(([taskId, node]) => {
      Array.from(node.dependencies).forEach(depId => {
        const depNode = this.taskGraph.get(depId);
        if (depNode) {
          depNode.dependents.add(taskId);
        }
      });
    });
  }

  /**
   * Topological sort to find execution order
   * Ensures dependencies are executed before dependents
   */
  private topologicalSort(): Task[] {
    const visited = new Set<string>();
    const result: Task[] = [];
    const visiting = new Set<string>();

    const visit = (taskId: string): void => {
      if (visited.has(taskId)) return;

      // Cycle detection
      if (visiting.has(taskId)) {
        throw new Error(`Circular dependency detected involving task: ${taskId}`);
      }

      visiting.add(taskId);
      const node = this.taskGraph.get(taskId);

      if (node) {
        // Visit dependencies first
        Array.from(node.dependencies).forEach(depId => {
          visit(depId);
        });

        visited.add(taskId);
        visiting.delete(taskId);
        result.push(node.task);
      }
    };

    Array.from(this.taskGraph.keys()).forEach(taskId => {
      visit(taskId);
    });

    return result;
  }

  /**
   * Get tasks ready to execute (all dependencies completed)
   */
  private getReadyTasks(): Task[] {
    const ready: Task[] = [];

    Array.from(this.taskGraph.entries()).forEach(([taskId, node]) => {
      // Skip if already active, completed, or failed permanently
      if (
        this.activeTasks.has(taskId) ||
        node.task.status === 'completed' ||
        (node.task.status === 'failed' && node.retryCount >= this.options.maxRetries)
      ) {
        return;
      }

      // Check if all dependencies are completed
      const allDepsCompleted = Array.from(node.dependencies).every(depId => {
        const depNode = this.taskGraph.get(depId);
        return depNode?.task.status === 'completed';
      });

      if (allDepsCompleted) {
        ready.push(node.task);
      }
    });

    return ready;
  }

  /**
   * Calculate task priority based on number of dependents
   * Tasks that unblock more work get higher priority
   */
  private calculatePriority(task: Task): number {
    const node = this.taskGraph.get(task.id);
    if (!node) return 0;

    // Priority = number of tasks waiting on this one
    return node.dependents.size;
  }

  /**
   * Check cache for similar completed task
   * Mirrors how Claude Code reuses context from previous work
   */
  private checkCache(task: Task): CachedResult | null {
    if (!this.options.enableCaching) return null;

    const taskHash = this.hashTask(task);

    const cached = Array.from(this.resultCache.values()).find(c => c.hash === taskHash);
    return cached || null;
  }

  /**
   * Simple hash function for task content
   */
  private hashTask(task: Task): string {
    const content = `${task.type}:${task.title}:${task.description}`;
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  /**
   * Execute task with retry logic and exponential backoff
   * Mirrors Claude Code's error recovery approach
   */
  private async executeWithRetry(
    task: Task,
    executor: (task: Task) => Promise<FileItem[]>
  ): Promise<FileItem[]> {
    const node = this.taskGraph.get(task.id);
    if (!node) throw new Error(`Task not found: ${task.id}`);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.options.maxRetries; attempt++) {
      try {
        // Exponential backoff delay
        if (attempt > 0) {
          const delay = this.options.retryDelayMs * Math.pow(2, attempt - 1);
          await this.sleep(delay);
          console.log(`Retrying task ${task.id}, attempt ${attempt + 1}/${this.options.maxRetries + 1}`);
        }

        const result = await executor(task);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        node.lastError = lastError;
        node.retryCount = attempt + 1;

        if (attempt === this.options.maxRetries) {
          throw lastError;
        }
      }
    }

    throw lastError || new Error('Task execution failed');
  }

  /**
   * Main orchestration method - executes all tasks with dependency awareness
   * This is the heart of the "vibe coding" approach
   */
  async execute(
    tasks: Task[],
    executor: (task: Task) => Promise<FileItem[]>
  ): Promise<Task[]> {
    // Step 1: Build dependency graph
    this.buildGraph(tasks);

    // Step 2: Initialize metrics
    this.metrics = {
      totalTasks: tasks.length,
      completedTasks: 0,
      failedTasks: 0,
      cachedTasks: 0,
      averageExecutionTime: 0,
    };

    // Step 3: Validate no circular dependencies
    try {
      this.topologicalSort();
    } catch (error) {
      throw new Error(`Invalid task graph: ${error}`);
    }

    // Step 4: Execute tasks in waves (respecting dependencies)
    while (this.metrics.completedTasks + this.metrics.failedTasks < this.metrics.totalTasks) {
      // Get tasks ready to run
      const readyTasks = this.getReadyTasks();

      if (readyTasks.length === 0 && this.activeTasks.size === 0) {
        // No tasks ready and none active = stuck (shouldn't happen after validation)
        break;
      }

      // Execute ready tasks in parallel (up to concurrency limit)
      const tasksToExecute = readyTasks.slice(0, this.options.maxConcurrentTasks - this.activeTasks.size);

      const executionPromises = tasksToExecute.map(task => this.executeTask(task, executor));

      if (executionPromises.length > 0) {
        // Wait for at least one task to complete before checking for more ready tasks
        await Promise.race(executionPromises);
      } else {
        // Wait a bit if no tasks can execute yet
        await this.sleep(100);
      }
    }

    // Step 5: Return updated tasks
    return Array.from(this.taskGraph.values()).map(node => node.task);
  }

  /**
   * Execute individual task with full lifecycle management
   */
  private async executeTask(
    task: Task,
    executor: (task: Task) => Promise<FileItem[]>
  ): Promise<void> {
    const node = this.taskGraph.get(task.id);
    if (!node) return;

    try {
      // Mark as active
      this.activeTasks.add(task.id);
      this.taskStartTimes.set(task.id, Date.now());
      task.status = 'in_progress';
      this.options.onTaskStart(task);

      // Check cache first
      const cached = this.checkCache(task);
      if (cached) {
        console.log(`Cache hit for task: ${task.title}`);
        task.output = cached.output;
        task.status = 'completed';
        this.metrics.cachedTasks++;
        this.metrics.completedTasks++;
        this.options.onTaskComplete(task, cached.output);
        this.options.onProgress(this.metrics);
        return;
      }

      // Execute with retry logic
      const output = await this.executeWithRetry(task, executor);

      // Success!
      task.output = output;
      task.status = 'completed';
      this.metrics.completedTasks++;

      // Cache result
      if (this.options.enableCaching) {
        this.resultCache.set(task.id, {
          taskId: task.id,
          output,
          timestamp: Date.now(),
          hash: this.hashTask(task),
        });
      }

      // Update metrics
      const executionTime = Date.now() - (this.taskStartTimes.get(task.id) || 0);
      this.updateAverageExecutionTime(executionTime);

      this.options.onTaskComplete(task, output);
      this.options.onProgress(this.metrics);

    } catch (error) {
      // Failure after all retries
      task.status = 'failed';
      this.metrics.failedTasks++;

      const err = error instanceof Error ? error : new Error(String(error));
      this.options.onTaskFail(task, err);
      this.options.onProgress(this.metrics);

    } finally {
      // Always remove from active set
      this.activeTasks.delete(task.id);
      this.taskStartTimes.delete(task.id);
    }
  }

  /**
   * Update rolling average execution time
   */
  private updateAverageExecutionTime(newTime: number): void {
    const total = this.metrics.completedTasks + this.metrics.cachedTasks;
    if (total === 0) {
      this.metrics.averageExecutionTime = newTime;
    } else {
      this.metrics.averageExecutionTime =
        (this.metrics.averageExecutionTime * (total - 1) + newTime) / total;
    }
  }

  /**
   * Get current execution metrics
   */
  getMetrics(): ExecutionMetrics {
    return { ...this.metrics };
  }

  /**
   * Clear cache and reset state
   */
  reset(): void {
    this.taskGraph.clear();
    this.executionQueue.clear();
    this.resultCache.clear();
    this.activeTasks.clear();
    this.taskStartTimes.clear();

    this.metrics = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      cachedTasks: 0,
      averageExecutionTime: 0,
    };
  }

  /**
   * Utility: sleep function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get estimated time remaining based on average execution time
   */
  getEstimatedTimeRemaining(): number {
    const remainingTasks = this.metrics.totalTasks - this.metrics.completedTasks - this.metrics.failedTasks;
    return remainingTasks * this.metrics.averageExecutionTime;
  }

  /**
   * Get task execution details for visualization
   */
  getTaskDetails(taskId: string): {
    task: Task;
    dependencies: string[];
    dependents: string[];
    retryCount: number;
    isActive: boolean;
  } | null {
    const node = this.taskGraph.get(taskId);
    if (!node) return null;

    return {
      task: node.task,
      dependencies: Array.from(node.dependencies),
      dependents: Array.from(node.dependents),
      retryCount: node.retryCount,
      isActive: this.activeTasks.has(taskId),
    };
  }
}

/**
 * Example usage:
 *
 * const orchestrator = new TaskOrchestrator({
 *   maxConcurrentTasks: 3,
 *   maxRetries: 3,
 *   enableCaching: true,
 *   onTaskStart: (task) => console.log(`Starting: ${task.title}`),
 *   onTaskComplete: (task, output) => console.log(`Completed: ${task.title}`),
 *   onTaskFail: (task, error) => console.error(`Failed: ${task.title}`, error),
 *   onProgress: (metrics) => console.log(`Progress: ${metrics.completedTasks}/${metrics.totalTasks}`)
 * });
 *
 * const tasks = [
 *   { id: '1', title: 'Layout', dependencies: [] },
 *   { id: '2', title: 'Header', dependencies: ['1'] },
 *   { id: '3', title: 'Footer', dependencies: ['1'] },
 *   { id: '4', title: 'Content', dependencies: ['2', '3'] }
 * ];
 *
 * const results = await orchestrator.execute(tasks, async (task) => {
 *   // Your task execution logic
 *   return await executeTaskAPI(task);
 * });
 */
