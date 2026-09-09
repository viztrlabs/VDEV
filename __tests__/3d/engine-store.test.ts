/**
 * Unit tests for EngineStore and transactional mutations
 */

import { useEngineStore } from '../../lib/editor/engineStore';
import { engineBridge } from '../../lib/3d/bridge/engine-bridge';
import { EngineAdapter, EngineCommand, EngineEvent, SceneSnapshot, TelemetryMetrics } from '../../lib/3d/bridge/types';

class TestAdapter implements EngineAdapter {
  public readonly engineType = 'three';
  public isInitialized = true;
  public dispatchedCommands: EngineCommand[] = [];
  private handlers: Set<(e: EngineEvent) => void> = new Set();

  async init() { this.isInitialized = true; }
  destroy() { this.isInitialized = false; }
  resize() {}

  async dispatchCommand(cmd: EngineCommand): Promise<boolean> {
    this.dispatchedCommands.push(cmd);
    return true;
  }

  onEvent(h: (e: EngineEvent) => void) {
    this.handlers.add(h);
    return () => this.handlers.delete(h);
  }

  getSceneSnapshot(): SceneSnapshot {
    return {} as any;
  }

  async loadSceneSnapshot() {}

  getTelemetry(): TelemetryMetrics {
    return { fps: 60, frameTimeMs: 16.6, drawCalls: 1, triangles: 100, webglContextState: 'active' };
  }
}

describe('EngineStore & History', () => {
  let adapter: TestAdapter;

  beforeEach(() => {
    adapter = new TestAdapter();
    engineBridge.attachAdapter(adapter);

    // Reset store to known state
    useEngineStore.setState({
      entities: [
        {
          id: 'test-cube',
          name: 'Test Cube',
          type: 'mesh',
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          visible: true,
          materialId: 'test-mat',
        },
      ],
      materials: [
        {
          id: 'test-mat',
          name: 'Test Material',
          color: '#3ecf8e',
          roughness: 0.5,
          metalness: 0.1,
          opacity: 1,
        },
      ],
      selectedEntityId: 'test-cube',
      undoStack: [],
      redoStack: [],
      isDirty: false,
    });
  });

  afterEach(() => {
    engineBridge.detachAdapter();
  });

  it('updates entity transform and records undo history', () => {
    const store = useEngineStore.getState();
    store.updateEntityTransform('test-cube', { position: { x: 10, y: 5, z: 2 } });

    const updated = useEngineStore.getState().entities[0];
    expect(updated.position).toEqual({ x: 10, y: 5, z: 2 });
    expect(useEngineStore.getState().undoStack).toHaveLength(1);
    expect(useEngineStore.getState().isDirty).toBe(true);

    // Verify command dispatched to engine
    const lastCmd = adapter.dispatchedCommands[adapter.dispatchedCommands.length - 1];
    expect(lastCmd.type).toBe('TRANSFORM_ENTITY');
    expect((lastCmd as any).payload.entityId).toBe('test-cube');
  });

  it('performs undo and redo on entity transforms', () => {
    const store = useEngineStore.getState();
    store.updateEntityTransform('test-cube', { position: { x: 20, y: 0, z: 0 } });
    expect(useEngineStore.getState().entities[0].position.x).toBe(20);

    // Undo
    useEngineStore.getState().undo();
    expect(useEngineStore.getState().entities[0].position.x).toBe(0);
    expect(useEngineStore.getState().redoStack).toHaveLength(1);

    // Redo
    useEngineStore.getState().redo();
    expect(useEngineStore.getState().entities[0].position.x).toBe(20);
  });

  it('updates material and dispatches command to engine', () => {
    const store = useEngineStore.getState();
    store.updateMaterial('test-mat', { color: '#ff0000', roughness: 0.9 });

    const mat = useEngineStore.getState().materials[0];
    expect(mat.color).toBe('#ff0000');
    expect(mat.roughness).toBe(0.9);

    const matCmd = adapter.dispatchedCommands.find((c) => c.type === 'UPDATE_MATERIAL');
    expect(matCmd).toBeDefined();
    expect((matCmd as any).payload.materialId).toBe('test-mat');
    expect((matCmd as any).payload.updates.color).toBe('#ff0000');
  });
});
