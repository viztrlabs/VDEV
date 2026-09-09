'use client';

/**
 * Unified Editor & Engine Zustand Store
 *
 * Provides transactional state management for the 3D/XR scene,
 * manages undo/redo history, selection state, active tools,
 * and maintains continuous bidirectional sync with the EngineBridge.
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { engineBridge } from '@/lib/3d/bridge/engine-bridge';
import {
  SceneSnapshot,
  SceneEntity,
  PBRMaterialData,
  HotspotData,
  ToolType,
  Vector3D,
  EulerRotation,
  EngineEvent,
} from '@/lib/3d/bridge/types';

export interface HistoryCommand {
  description: string;
  undo: () => void;
  redo: () => void;
}

export interface EngineStoreState {
  // Scene Data
  sceneId: string;
  sceneName: string;
  entities: SceneEntity[];
  materials: PBRMaterialData[];
  hotspots: HotspotData[];
  selectedEntityId: string | null;
  hoveredEntityId: string | null;
  activeTool: ToolType;
  gridVisible: boolean;

  // Persistence & Dirty State
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
  error: string | null;
  saveRetryCount: number;

  // History (Undo / Redo)
  undoStack: HistoryCommand[];
  redoStack: HistoryCommand[];

  // Actions
  loadSnapshot: (snapshot: SceneSnapshot) => void;
  selectEntity: (id: string | null) => void;
  setActiveTool: (tool: ToolType) => void;
  setGridVisible: (visible: boolean) => void;

  // Entity Mutations
  updateEntityTransform: (
    id: string,
    transform: { position?: Vector3D; rotation?: EulerRotation; scale?: Vector3D },
    recordHistory?: boolean
  ) => void;
  setEntityVisibility: (id: string, visible: boolean) => void;

  // Material Mutations
  updateMaterial: (
    materialId: string,
    patch: Partial<PBRMaterialData>,
    recordHistory?: boolean
  ) => void;

  // Hotspot Mutations
  addHotspot: (hotspot: HotspotData) => void;
  updateHotspot: (id: string, patch: Partial<HotspotData>) => void;
  deleteHotspot: (id: string) => void;

  // History Actions
  undo: () => void;
  redo: () => void;

  // Persistence
  saveScene: () => Promise<boolean>;
  resetDirty: () => void;
}

export const useEngineStore = create<EngineStoreState>()(
  immer((set, get) => ({
    sceneId: 'default-scene',
    sceneName: 'Untitled 3D Scene',
    entities: [
      {
        id: 'ent-cube-1',
        name: 'Hero Cube',
        type: 'mesh',
        position: { x: 0, y: 1, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        visible: true,
        materialId: 'mat-arch-cube',
      },
      {
        id: 'ent-sphere-1',
        name: 'Accent Sphere',
        type: 'mesh',
        position: { x: 3, y: 0.8, z: 1 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        visible: true,
        materialId: 'mat-accent-sphere',
      },
    ],
    materials: [
      {
        id: 'mat-arch-cube',
        name: 'Architectural Emerald',
        color: '#3ecf8e',
        roughness: 0.3,
        metalness: 0.2,
        opacity: 1,
        wireframe: false,
      },
      {
        id: 'mat-accent-sphere',
        name: 'Electric Indigo',
        color: '#6366f1',
        roughness: 0.1,
        metalness: 0.8,
        opacity: 1,
        wireframe: false,
      },
    ],
    hotspots: [],
    selectedEntityId: 'ent-cube-1',
    hoveredEntityId: null,
    activeTool: 'move',
    gridVisible: true,

    isDirty: false,
    isSaving: false,
    lastSavedAt: null,
    error: null,
    saveRetryCount: 0,

    undoStack: [],
    redoStack: [],

    loadSnapshot: (snapshot) => {
      set((state) => {
        state.sceneId = snapshot.id;
        state.sceneName = snapshot.name;
        state.entities = snapshot.entities;
        state.materials = snapshot.materials;
        state.hotspots = snapshot.hotspots;
        state.isDirty = false;
        state.undoStack = [];
        state.redoStack = [];
      });

      engineBridge.dispatch({
        type: 'LOAD_SCENE',
        payload: { snapshot },
      });
    },

    selectEntity: (id) => {
      set((state) => {
        state.selectedEntityId = id;
      });
      engineBridge.dispatch({
        type: 'SELECT_ENTITY',
        payload: { entityId: id },
      });
    },

    setActiveTool: (tool) => {
      set((state) => {
        state.activeTool = tool;
      });
      engineBridge.dispatch({
        type: 'SET_ACTIVE_TOOL',
        payload: { tool },
      });
    },

    setGridVisible: (visible) => {
      set((state) => {
        state.gridVisible = visible;
      });
      engineBridge.dispatch({
        type: 'SET_GRID_VISIBLE',
        payload: { visible },
      });
    },

    updateEntityTransform: (id, transform, recordHistory = true) => {
      const entity = get().entities.find((e) => e.id === id);
      if (!entity) return;

      const previous = {
        position: { ...entity.position },
        rotation: { ...entity.rotation },
        scale: { ...entity.scale },
      };

      if (recordHistory) {
        const next = {
          position: transform.position ? { ...transform.position } : previous.position,
          rotation: transform.rotation ? { ...transform.rotation } : previous.rotation,
          scale: transform.scale ? { ...transform.scale } : previous.scale,
        };

        const cmd: HistoryCommand = {
          description: `Transform ${entity.name}`,
          undo: () => {
            get().updateEntityTransform(id, previous, false);
          },
          redo: () => {
            get().updateEntityTransform(id, next, false);
          },
        };

        set((state) => {
          state.undoStack.push(cmd);
          state.redoStack = [];
        });
      }

      set((state) => {
        const ent = state.entities.find((e) => e.id === id);
        if (ent) {
          if (transform.position) ent.position = { ...transform.position };
          if (transform.rotation) ent.rotation = { ...transform.rotation };
          if (transform.scale) ent.scale = { ...transform.scale };
          state.isDirty = true;
        }
      });

      // Synchronize with active engine
      engineBridge.dispatch({
        type: 'TRANSFORM_ENTITY',
        payload: {
          entityId: id,
          position: transform.position,
          rotation: transform.rotation,
          scale: transform.scale,
        },
      });
    },

    setEntityVisibility: (id, visible) => {
      set((state) => {
        const ent = state.entities.find((e) => e.id === id);
        if (ent) {
          ent.visible = visible;
          state.isDirty = true;
        }
      });
      engineBridge.dispatch({
        type: 'SET_ENTITY_VISIBILITY',
        payload: { entityId: id, visible },
      });
    },

    updateMaterial: (materialId, patch, recordHistory = true) => {
      const mat = get().materials.find((m) => m.id === materialId);
      if (!mat) return;

      const previousPatch: Partial<PBRMaterialData> = {};
      Object.keys(patch).forEach((key) => {
        (previousPatch as any)[key] = (mat as any)[key];
      });

      if (recordHistory) {
        const cmd: HistoryCommand = {
          description: `Update material ${mat.name || materialId}`,
          undo: () => get().updateMaterial(materialId, previousPatch, false),
          redo: () => get().updateMaterial(materialId, patch, false),
        };
        set((state) => {
          state.undoStack.push(cmd);
          state.redoStack = [];
        });
      }

      set((state) => {
        const target = state.materials.find((m) => m.id === materialId);
        if (target) {
          Object.assign(target, patch);
          state.isDirty = true;
        }
      });

      engineBridge.dispatch({
        type: 'UPDATE_MATERIAL',
        payload: { materialId, updates: patch },
      });
    },

    addHotspot: (hotspot) => {
      set((state) => {
        state.hotspots.push(hotspot);
        state.isDirty = true;
      });
      engineBridge.dispatch({
        type: 'ADD_HOTSPOT',
        payload: hotspot,
      });
    },

    updateHotspot: (id, patch) => {
      set((state) => {
        const spot = state.hotspots.find((h) => h.id === id);
        if (spot) {
          Object.assign(spot, patch);
          state.isDirty = true;
        }
      });
      engineBridge.dispatch({
        type: 'UPDATE_HOTSPOT',
        payload: { id, patch },
      });
    },

    deleteHotspot: (id) => {
      set((state) => {
        state.hotspots = state.hotspots.filter((h) => h.id !== id);
        state.isDirty = true;
      });
      engineBridge.dispatch({
        type: 'DELETE_HOTSPOT',
        payload: { id },
      });
    },

    undo: () => {
      const { undoStack } = get();
      if (undoStack.length === 0) return;
      const cmd = undoStack[undoStack.length - 1];
      cmd.undo();
      set((state) => {
        state.undoStack.pop();
        state.redoStack.push(cmd);
      });
    },

    redo: () => {
      const { redoStack } = get();
      if (redoStack.length === 0) return;
      const cmd = redoStack[redoStack.length - 1];
      cmd.redo();
      set((state) => {
        state.redoStack.pop();
        state.undoStack.push(cmd);
      });
    },

    saveScene: async () => {
      const MAX_RETRIES = 3;
      const BASE_DELAY_MS = 1000;

      set((state) => {
        state.isSaving = true;
        state.error = null;
        state.saveRetryCount = 0;
      });

      const currentSnapshot: SceneSnapshot = {
        id: get().sceneId,
        version: 1,
        name: get().sceneName,
        engine: engineBridge.getActiveEngineType() || 'three',
        camera: {
          position: { x: 5, y: 5, z: 5 },
          target: { x: 0, y: 0, z: 0 },
          fov: 60,
        },
        entities: get().entities,
        materials: get().materials,
        hotspots: get().hotspots,
        updatedAt: new Date().toISOString(),
      };

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          if (attempt > 0) {
            set((state) => { state.saveRetryCount = attempt; });
            const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
            console.warn(`[EngineStore] Save retry ${attempt}/${MAX_RETRIES} in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }

          const res = await fetch('/api/editor/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentSnapshot),
          });

          if (!res.ok) {
            // Try to read detailed error from the response body
            let serverMessage = `HTTP ${res.status}`;
            try {
              const body = await res.json();
              if (body?.error) serverMessage = `${serverMessage}: ${body.error}`;
            } catch { /* body not JSON, use status only */ }
            throw new Error(`Sync request failed — ${serverMessage}`);
          }

          // Success
          set((state) => {
            state.isSaving = false;
            state.isDirty = false;
            state.lastSavedAt = new Date().toLocaleTimeString();
            state.saveRetryCount = 0;
            state.error = null;
          });
          return true;
        } catch (err: any) {
          console.error(`[EngineStore] Save attempt ${attempt + 1} failed:`, err);

          // If this was the last attempt, surface the error
          if (attempt >= MAX_RETRIES) {
            set((state) => {
              state.isSaving = false;
              state.error = err.message || 'Failed to save scene after retries';
              state.saveRetryCount = 0;
            });
            return false;
          }
          // Otherwise loop continues to next retry
        }
      }

      return false;
    },

    resetDirty: () => {
      set((state) => {
        state.isDirty = false;
      });
    },
  }))
);

// Automatic Engine -> Store synchronization listener
if (typeof window !== 'undefined') {
  engineBridge.on('SELECTION_CHANGED', (event: Extract<EngineEvent, { type: 'SELECTION_CHANGED' }>) => {
    const selectedId = event.payload.selectedIds[0] || null;
    if (useEngineStore.getState().selectedEntityId !== selectedId) {
      useEngineStore.setState({ selectedEntityId: selectedId });
    }
  });

  engineBridge.on('TRANSFORM_COMMITTED', (event: Extract<EngineEvent, { type: 'TRANSFORM_COMMITTED' }>) => {
    const { entityId, position, rotation, scale, previousState } = event.payload;
    const store = useEngineStore.getState();
    const entity = store.entities.find((e) => e.id === entityId);
    if (entity) {
      const cmd: HistoryCommand = {
        description: `Transform ${entity.name}`,
        undo: () => {
          useEngineStore.getState().updateEntityTransform(entityId, previousState, false);
        },
        redo: () => {
          useEngineStore.getState().updateEntityTransform(
            entityId,
            { position, rotation, scale },
            false
          );
        },
      };

      useEngineStore.setState((state) => {
        state.undoStack.push(cmd);
        state.redoStack = [];
        state.isDirty = true;
        const ent = state.entities.find((e) => e.id === entityId);
        if (ent) {
          ent.position = position;
          ent.rotation = rotation;
          ent.scale = scale;
        }
      });
    }
  });
}
