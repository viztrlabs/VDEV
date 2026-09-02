/**
 * Resource Management — Phase 2C
 * CPU/bandwidth-aware task scheduling and quality-of-service for heavy work.
 */

type TaskPriority = 'critical' | 'high' | 'normal' | 'low' | 'idle';
type TaskStatus = 'pending' | 'running' | 'completed' | 'cancelled' | 'failed';

interface Task<T = unknown> {
  id: string;
  name: string;
  fn: () => Promise<T> | T;
  priority: TaskPriority;
  status: TaskStatus;
  retries: number;
  maxRetries: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  result?: T;
  error?: Error;
  cost?: number; // rough CPU cost hint 0..1
}

interface ResourceSnapshot {
  timestamp: number;
  cpuEstimate: number; // 0..1
  pendingTasks: number;
  runningTasks: number;
  completedTasks: number;
  failedTasks: number;
}

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  critical: 5,
  high: 4,
  normal: 3,
  low: 2,
  idle: 1,
};

const MAX_CONCURRENT = typeof navigator !== 'undefined' && navigator.hardwareConcurrency
  ? Math.max(2, Math.min(8, navigator.hardwareConcurrency - 1))
  : 4;

class ResourceManager {
  private queue: Task[] = [];
  private running = new Map<string, Task>();
  private history: ResourceSnapshot[] = [];
  private lastCpuSample = 0;
  private tickHandle: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.tickHandle = setInterval(() => this.sample(), 5_000);
    }
  }

  /**
   * Submit a task for execution. Returns a promise that resolves with the result.
   */
  submit<T>(
    name: string,
    fn: () => Promise<T> | T,
    opts: { priority?: TaskPriority; maxRetries?: number; cost?: number } = {},
  ): Promise<T> {
    const task: Task<T> = {
      id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      fn: fn as () => Promise<unknown> | unknown,
      priority: opts.priority ?? 'normal',
      status: 'pending',
      retries: 0,
      maxRetries: opts.maxRetries ?? 0,
      createdAt: Date.now(),
      cost: opts.cost,
    };
    this.queue.push(task as Task);
    this.sortQueue();
    queueMicrotask(() => this.pump());
    return new Promise<T>((resolve, reject) => {
      const tick = setInterval(() => {
        const t = this.findById(task.id);
        if (!t) { clearInterval(tick); return; }
        if (t.status === 'completed') { clearInterval(tick); resolve(t.result as T); }
        if (t.status === 'failed' || t.status === 'cancelled') { clearInterval(tick); reject(t.error); }
      }, 50);
    });
  }

  /**
   * Schedule work to run when the browser is idle.
   */
  whenIdle<T>(name: string, fn: () => Promise<T> | T): Promise<T> {
    return this.submit(name, fn, { priority: 'idle' });
  }

  /**
   * Throttle: coalesce calls so fn runs at most once per `windowMs`.
   */
  throttle<A extends unknown[]>(fn: (...args: A) => void, windowMs: number): (...args: A) => void {
    let last = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let pendingArgs: A | null = null;
    return (...args: A) => {
      const now = Date.now();
      const remaining = windowMs - (now - last);
      if (remaining <= 0) {
        last = now;
        fn(...args);
      } else {
        pendingArgs = args;
        if (!timer) {
          timer = setTimeout(() => {
            last = Date.now();
            timer = null;
            if (pendingArgs) { fn(...pendingArgs); pendingArgs = null; }
          }, remaining);
        }
      }
    };
  }

  /**
   * Debounce: defer fn until `waitMs` of quiet time.
   */
  debounce<A extends unknown[]>(fn: (...args: A) => void, waitMs: number): (...args: A) => void {
    let timer: ReturnType<typeof setTimeout> | null = null;
    return (...args: A) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => fn(...args), waitMs);
    };
  }

  /**
   * Get current resource snapshot.
   */
  snapshot(): ResourceSnapshot {
    const completed = this.history.length === 0 ? 0 : this.history[this.history.length - 1].completedTasks;
    const failed = this.history.length === 0 ? 0 : this.history[this.history.length - 1].failedTasks;
    return {
      timestamp: Date.now(),
      cpuEstimate: this.estimateCpu(),
      pendingTasks: this.queue.length,
      runningTasks: this.running.size,
      completedTasks: completed,
      failedTasks: failed,
    };
  }

  getHistory(): readonly ResourceSnapshot[] { return this.history; }

  dispose() {
    if (this.tickHandle) clearInterval(this.tickHandle);
    this.queue.length = 0;
    this.running.clear();
  }

  // ---------- internal ----------

  private findById(id: string): Task | undefined {
    return this.queue.find((t) => t.id === id) || this.running.get(id);
  }

  private sortQueue() {
    this.queue.sort((a, b) => {
      const p = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
      if (p !== 0) return p;
      return a.createdAt - b.createdAt;
    });
  }

  private pump() {
    while (this.running.size < MAX_CONCURRENT && this.queue.length > 0) {
      const task = this.queue.shift();
      if (!task) break;
      this.execute(task);
    }
  }

  private async execute(task: Task) {
    task.status = 'running';
    task.startedAt = Date.now();
    this.running.set(task.id, task);
    try {
      task.result = await task.fn();
      task.status = 'completed';
      task.completedAt = Date.now();
    } catch (err) {
      task.error = err instanceof Error ? err : new Error(String(err));
      if (task.retries < task.maxRetries) {
        task.retries++;
        task.status = 'pending';
        this.queue.push(task);
        this.sortQueue();
      } else {
        task.status = 'failed';
      }
    } finally {
      this.running.delete(task.id);
      this.pump();
    }
  }

  private estimateCpu(): number {
    // Heuristic: ratio of running tasks to capacity, with cost weighting.
    if (this.running.size === 0) return 0;
    let load = 0;
    for (const t of this.running.values()) load += t.cost ?? 0.5;
    return Math.min(1, load / MAX_CONCURRENT);
  }

  private sample() {
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
      this.history.push({ timestamp: Date.now(), cpuEstimate: 0, pendingTasks: this.queue.length, runningTasks: 0, completedTasks: this.history.at(-1)?.completedTasks ?? 0, failedTasks: this.history.at(-1)?.failedTasks ?? 0 });
      return;
    }
    this.history.push(this.snapshot());
    if (this.history.length > 240) this.history.shift(); // keep last 20 min at 5s sample
  }
}

export const resourceManager = new ResourceManager();
export default resourceManager;
