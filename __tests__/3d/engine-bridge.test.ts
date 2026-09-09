/**
 * Unit tests for Engine Bridge and State Synchronization
 */

import { EngineBridge } from '../../lib/3d/bridge/engine-bridge';
import { EngineAdapter, EngineCommand, EngineEvent, SceneSnapshot, TelemetryMetrics } from '../../lib/3d/bridge/types';

class MockAdapter implements EngineAdapter {
  public readonly engineType = 'three';
  public isInitialized = true;
  public receivedCommands: EngineCommand[] = [];
  private handlers: Set<(event: EngineEvent) => void> = new Set();

  async init(): Promise<void> {
    this.isInitialized = true;
  }
  destroy(): void {
    this.isInitialized = false;
  }
  resize(): void {}

  async dispatchCommand(command: EngineCommand): Promise<boolean> {
    this.receivedCommands.push(command);
    return true;
  }

  onEvent(handler: (event: EngineEvent) => void): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  emitMockEvent(event: EngineEvent): void {
    this.handlers.forEach((h) => h(event));
  }

  getSceneSnapshot(): SceneSnapshot {
    return {
      id: 'mock-snapshot',
      version: 1,
      name: 'Mock Scene',
      engine: 'three',
      camera: { position: { x: 0, y: 0, z: 5 }, target: { x: 0, y: 0, z: 0 } },
      entities: [],
      materials: [],
      hotspots: [],
      updatedAt: new Date().toISOString(),
    };
  }

  async loadSceneSnapshot(): Promise<void> {}

  getTelemetry(): TelemetryMetrics {
    return {
      fps: 60,
      frameTimeMs: 16.6,
      drawCalls: 10,
      triangles: 1000,
      webglContextState: 'active',
    };
  }
}

describe('EngineBridge', () => {
  let bridge: EngineBridge;
  let adapter: MockAdapter;

  beforeEach(() => {
    bridge = new EngineBridge();
    adapter = new MockAdapter();
  });

  it('attaches adapter and dispatches ready event', (done) => {
    bridge.on('ENGINE_READY', (event) => {
      expect(event.payload.engine).toBe('three');
      done();
    });

    bridge.attachAdapter(adapter);
    expect(bridge.getActiveAdapter()).toBe(adapter);
    expect(bridge.getActiveEngineType()).toBe('three');
  });

  it('routes commands to active adapter', async () => {
    bridge.attachAdapter(adapter);

    const cmd: EngineCommand = {
      type: 'SELECT_ENTITY',
      payload: { entityId: 'cube-1' },
    };

    const success = await bridge.dispatch(cmd);
    expect(success).toBe(true);
    expect(adapter.receivedCommands).toHaveLength(1);
    expect(adapter.receivedCommands[0]).toEqual(cmd);
  });

  it('propagates adapter events to bridge subscribers', (done) => {
    bridge.attachAdapter(adapter);

    bridge.on('SELECTION_CHANGED', (event) => {
      expect(event.payload.selectedIds).toEqual(['cube-1']);
      done();
    });

    adapter.emitMockEvent({
      type: 'SELECTION_CHANGED',
      payload: { selectedIds: ['cube-1'] },
    });
  });

  it('tracks non-reactive telemetry without losing latest snapshot', () => {
    bridge.attachAdapter(adapter);

    adapter.emitMockEvent({
      type: 'TELEMETRY_UPDATED',
      payload: {
        fps: 120,
        frameTimeMs: 8.3,
        drawCalls: 45,
        triangles: 50000,
        webglContextState: 'active',
      },
    });

    const latest = bridge.getLatestTelemetry();
    expect(latest.fps).toBe(120);
    expect(latest.triangles).toBe(50000);
  });

  it('detaches adapter and cleans up listeners', () => {
    bridge.attachAdapter(adapter);
    expect(bridge.getActiveAdapter()).toBe(adapter);

    bridge.detachAdapter();
    expect(bridge.getActiveAdapter()).toBeNull();
    expect(bridge.getActiveEngineType()).toBeNull();
  });
});
