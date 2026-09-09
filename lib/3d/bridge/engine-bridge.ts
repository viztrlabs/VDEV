/**
 * Engine Bridge
 *
 * Centralized, decoupled communication bus connecting the Frontend UI,
 * Editor Logic, and Core 3D/XR Runtimes.
 */

import {
  EngineAdapter,
  EngineCommand,
  EngineEvent,
  EngineType,
  TelemetryMetrics,
  SceneSnapshot,
} from './types';

type EventListener<T extends EngineEvent['type'] = EngineEvent['type']> = (
  event: Extract<EngineEvent, { type: T }>
) => void;

type WildcardListener = (event: EngineEvent) => void;

// --- Configuration Constants ---
const MAX_QUEUE_SIZE = 256;
const DEFAULT_INIT_TIMEOUT_MS = 15_000;
const TELEMETRY_THROTTLE_MS = 250;

export class EngineBridge {
  private adapter: EngineAdapter | null = null;
  private listeners: Map<string, Set<EventListener<any>>> = new Map();
  private wildcardListeners: Set<WildcardListener> = new Set();
  private adapterUnsub: (() => void) | null = null;
  private commandQueue: EngineCommand[] = [];
  private isProcessingCommand = false;

  // Telemetry throttle state
  private lastTelemetryEmitTime = 0;
  private pendingTelemetryEvent: EngineEvent | null = null;
  private telemetryThrottleTimer: ReturnType<typeof setTimeout> | null = null;

  // Cached transient telemetry (non-reactive for performance HUD)
  private currentTelemetry: TelemetryMetrics = {
    fps: 60,
    frameTimeMs: 16.6,
    drawCalls: 0,
    triangles: 0,
    webglContextState: 'active',
  };

  /**
   * Attach an engine adapter to the bridge.
   * Automatically unbinds any previously attached adapter.
   */
  public attachAdapter(adapter: EngineAdapter): void {
    if (this.adapter) {
      this.detachAdapter();
    }

    this.adapter = adapter;

    // Listen to adapter events and propagate through the bridge
    this.adapterUnsub = this.adapter.onEvent((event: EngineEvent) => {
      if (event.type === 'TELEMETRY_UPDATED') {
        this.currentTelemetry = event.payload;
        this.throttledEmitTelemetry(event);
        return;
      }
      this.emit(event);
    });

    // Notify listeners that an engine is now active
    this.emit({
      type: 'ENGINE_READY',
      payload: {
        engine: adapter.engineType,
        version: '1.0.0',
      },
    });

    // Drain queued commands if any were queued before adapter became ready
    this.flushCommandQueue();
  }

  /**
   * Detach the current engine adapter.
   */
  public detachAdapter(): void {
    if (this.adapterUnsub) {
      this.adapterUnsub();
      this.adapterUnsub = null;
    }
    this.adapter = null;
  }

  /**
   * Returns the currently active adapter, or null if none is mounted.
   */
  public getActiveAdapter(): EngineAdapter | null {
    return this.adapter;
  }

  /**
   * Returns the engine type currently attached.
   */
  public getActiveEngineType(): EngineType | null {
    return this.adapter ? this.adapter.engineType : null;
  }

  /**
   * Wait for the engine adapter to become ready.
   * Rejects with a timeout error if not ready within `timeoutMs`.
   */
  public waitForReady(timeoutMs: number = DEFAULT_INIT_TIMEOUT_MS): Promise<void> {
    // Already ready
    if (this.adapter?.isInitialized) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        unsub();
        const msg = `Engine adapter did not initialise within ${timeoutMs}ms`;
        console.error(`[EngineBridge] ${msg}`);
        this.emit({
          type: 'ENGINE_ERROR',
          payload: { code: 'INIT_TIMEOUT', message: msg },
        });
        reject(new Error(msg));
      }, timeoutMs);

      const unsub = this.on('ENGINE_READY', () => {
        clearTimeout(timer);
        unsub();
        resolve();
      });
    });
  }

  /**
   * Dispatch a typed command to the core engine.
   * If the adapter is not yet mounted, the command is queued
   * (with overflow protection — oldest commands are evicted when
   * the queue exceeds MAX_QUEUE_SIZE).
   */
  public async dispatch(command: EngineCommand): Promise<boolean> {
    if (!this.adapter || !this.adapter.isInitialized) {
      this.commandQueue.push(command);

      // Overflow protection
      if (this.commandQueue.length > MAX_QUEUE_SIZE) {
        const dropped = this.commandQueue.length - MAX_QUEUE_SIZE;
        this.commandQueue = this.commandQueue.slice(dropped);
        console.warn(
          `[EngineBridge] Command queue overflow — evicted ${dropped} oldest command(s). Queue capped at ${MAX_QUEUE_SIZE}.`
        );
        this.emit({
          type: 'ENGINE_ERROR',
          payload: {
            code: 'COMMAND_QUEUE_OVERFLOW',
            message: `Command queue exceeded ${MAX_QUEUE_SIZE}. ${dropped} oldest command(s) dropped.`,
            details: { droppedCount: dropped, currentSize: this.commandQueue.length },
          },
        });
      }

      return false;
    }

    try {
      const result = await this.adapter.dispatchCommand(command);
      return !!result;
    } catch (err) {
      console.error('[EngineBridge] Command dispatch failed:', command, err);
      this.emit({
        type: 'ENGINE_ERROR',
        payload: {
          code: 'COMMAND_DISPATCH_FAILED',
          message: err instanceof Error ? err.message : 'Unknown command execution error',
          details: { command },
        },
      });
      return false;
    }
  }

  /**
   * Subscribe to a specific engine event.
   * Returns an unsubscribe function.
   */
  public on<T extends EngineEvent['type']>(
    type: T,
    listener: EventListener<T>
  ): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener as EventListener<any>);

    return () => {
      const set = this.listeners.get(type);
      if (set) {
        set.delete(listener as EventListener<any>);
        if (set.size === 0) {
          this.listeners.delete(type);
        }
      }
    };
  }

  /**
   * Subscribe to all engine events.
   */
  public onAny(listener: WildcardListener): () => void {
    this.wildcardListeners.add(listener);
    return () => {
      this.wildcardListeners.delete(listener);
    };
  }

  /**
   * Internal emit to broadcast events to registered subscribers.
   */
  private emit(event: EngineEvent): void {
    // Specific typed listeners
    const specific = this.listeners.get(event.type);
    if (specific) {
      specific.forEach((fn) => {
        try {
          fn(event);
        } catch (err) {
          console.error(`[EngineBridge] Error in listener for ${event.type}:`, err);
        }
      });
    }

    // Wildcard listeners
    this.wildcardListeners.forEach((fn) => {
      try {
        fn(event);
      } catch (err) {
        console.error('[EngineBridge] Error in wildcard listener:', err);
      }
    });
  }

  /**
   * Non-reactive telemetry getter for high-frequency performance overlays.
   */
  public getLatestTelemetry(): TelemetryMetrics {
    return this.currentTelemetry;
  }

  /**
   * Throttled emission of TELEMETRY_UPDATED events.
   * Ensures at most one emission every TELEMETRY_THROTTLE_MS.
   * The latest payload is always cached for on-demand reads.
   */
  private throttledEmitTelemetry(event: EngineEvent): void {
    const now = Date.now();
    const elapsed = now - this.lastTelemetryEmitTime;

    if (elapsed >= TELEMETRY_THROTTLE_MS) {
      this.lastTelemetryEmitTime = now;
      this.pendingTelemetryEvent = null;
      this.emit(event);
    } else {
      // Stash the latest event and schedule a deferred emit
      this.pendingTelemetryEvent = event;
      if (!this.telemetryThrottleTimer) {
        this.telemetryThrottleTimer = setTimeout(() => {
          this.telemetryThrottleTimer = null;
          if (this.pendingTelemetryEvent) {
            this.lastTelemetryEmitTime = Date.now();
            this.emit(this.pendingTelemetryEvent);
            this.pendingTelemetryEvent = null;
          }
        }, TELEMETRY_THROTTLE_MS - elapsed);
      }
    }
  }

  /**
   * Request a scene snapshot from the active adapter.
   */
  public getSceneSnapshot(): SceneSnapshot | null {
    if (!this.adapter) return null;
    return this.adapter.getSceneSnapshot();
  }

  /**
   * Drain any queued commands.
   */
  private async flushCommandQueue(): Promise<void> {
    if (this.isProcessingCommand || !this.adapter || !this.adapter.isInitialized) return;
    this.isProcessingCommand = true;

    while (this.commandQueue.length > 0 && this.adapter && this.adapter.isInitialized) {
      const cmd = this.commandQueue.shift()!;
      try {
        await this.adapter.dispatchCommand(cmd);
      } catch (err) {
        console.error('[EngineBridge] Queued command execution error:', cmd, err);
      }
    }

    this.isProcessingCommand = false;
  }
}

// Global Singleton Instance for application-wide synchronization
export const engineBridge = new EngineBridge();
