'use client';

import { create } from 'zustand';
import { temporal } from 'zundo';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useStore } from 'zustand';
import type { Hotspot, TourRoom } from '@/data/tour-config';

// ============================================================================
// Types
// ============================================================================

export type SectionTab =
  | 'editor'
  | 'canvas'
  | 'design'
  | 'components'
  | 'floorplan'
  | 'map'
  | 'cta'
  | 'content'
  | 'model'
  | 'marketing'
  | 'settings';

export interface EditorState {
  // Tour data
  rooms: TourRoom[];
  selectedId: string;

  // Editor UI state (excluded from undo tracking)
  addMode: boolean;
  editingNodeId: string;
  sectionTab: SectionTab;
  saved: boolean;
  draggingOver: boolean;
  saving: boolean;
  uploading: boolean;
  error: string;

  // Basic setters
  setRooms: (rooms: TourRoom[]) => void;
  setSelectedId: (id: string) => void;
  setAddMode: (mode: boolean) => void;
  setEditingNodeId: (id: string) => void;
  setSectionTab: (tab: SectionTab) => void;
  setSaved: (saved: boolean) => void;
  setDraggingOver: (dragging: boolean) => void;
  setSaving: (saving: boolean) => void;
  setUploading: (uploading: boolean) => void;
  setError: (error: string) => void;

  // Room operations (tracked in undo history)
  addRoom: (room: TourRoom) => void;
  updateRoom: (id: string, updater: (room: TourRoom) => void) => void;
  deleteRoom: (id: string) => void;
  duplicateRoom: (id: string) => void;
  moveRoom: (id: string, direction: -1 | 1) => void;

  // Hotspot operations
  addHotspot: (roomId: string, hotspot: Hotspot) => void;
  updateHotspot: (roomId: string, hotspotId: string, patch: Partial<Hotspot>) => void;
  deleteHotspot: (roomId: string, hotspotId: string) => void;
  copyHotspot: (roomId: string, hotspotId: string) => void;

  // Bulk
  reset: () => void;
}

const initialState = {
  rooms: [] as TourRoom[],
  selectedId: '',
  addMode: false,
  editingNodeId: '',
  sectionTab: 'editor' as SectionTab,
  saved: true,
  draggingOver: false,
  saving: false,
  uploading: false,
  error: '',
};

// ============================================================================
// Store
// ============================================================================

export const useEditorStore = create<EditorState>()(
  temporal(
    persist(
      immer((set) => ({
        ...initialState,

        // ---------- Setters ----------
        setRooms: (rooms) =>
          set((state) => {
            state.rooms = rooms;
            state.saved = false;
          }),
        setSelectedId: (id) =>
          set((state) => {
            state.selectedId = id;
          }),
        setAddMode: (mode) =>
          set((state) => {
            state.addMode = mode;
          }),
        setEditingNodeId: (id) =>
          set((state) => {
            state.editingNodeId = id;
          }),
        setSectionTab: (tab) =>
          set((state) => {
            state.sectionTab = tab;
          }),
        setSaved: (saved) =>
          set((state) => {
            state.saved = saved;
          }),
        setDraggingOver: (dragging) =>
          set((state) => {
            state.draggingOver = dragging;
          }),
        setSaving: (saving) =>
          set((state) => {
            state.saving = saving;
          }),
        setUploading: (uploading) =>
          set((state) => {
            state.uploading = uploading;
          }),
        setError: (error) =>
          set((state) => {
            state.error = error;
          }),

        // ---------- Room ops ----------
        addRoom: (room) =>
          set((state) => {
            state.rooms.push(room);
            state.selectedId = room.id;
            state.saved = false;
          }),

        updateRoom: (id, updater) =>
          set((state) => {
            const room = state.rooms.find((r) => r.id === id);
            if (room) {
              updater(room);
              state.saved = false;
            }
          }),

        deleteRoom: (id) =>
          set((state) => {
            const index = state.rooms.findIndex((r) => r.id === id);
            if (index < 0) return;
            state.rooms.splice(index, 1);
            if (state.selectedId === id) {
              state.selectedId = state.rooms[0]?.id ?? '';
            }
            state.saved = false;
          }),

        duplicateRoom: (id) =>
          set((state) => {
            const index = state.rooms.findIndex((r) => r.id === id);
            if (index < 0) return;
            const source = state.rooms[index];
            const copy: TourRoom = {
              ...source,
              id: `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              name: `${source.name} (copy)`,
              defaultHotspots: source.defaultHotspots.map((h) => ({
                ...h,
                id: `hp-${Date.now()}-${Math.random()}`,
              })),
            };
            state.rooms.splice(index + 1, 0, copy);
            state.selectedId = copy.id;
            state.saved = false;
          }),

        moveRoom: (id, direction) =>
          set((state) => {
            const index = state.rooms.findIndex((r) => r.id === id);
            if (index < 0) return;
            const target = index + direction;
            if (target < 0 || target >= state.rooms.length) return;
            const tmp = state.rooms[index];
            state.rooms[index] = state.rooms[target];
            state.rooms[target] = tmp;
            state.saved = false;
          }),

        // ---------- Hotspot ops ----------
        addHotspot: (roomId, hotspot) =>
          set((state) => {
            const room = state.rooms.find((r) => r.id === roomId);
            if (room) {
              room.defaultHotspots.push(hotspot);
              state.saved = false;
            }
          }),

        updateHotspot: (roomId, hotspotId, patch) =>
          set((state) => {
            const room = state.rooms.find((r) => r.id === roomId);
            if (room) {
              const hotspot = room.defaultHotspots.find((h) => h.id === hotspotId);
              if (hotspot) {
                Object.assign(hotspot, patch);
                state.saved = false;
              }
            }
          }),

        deleteHotspot: (roomId, hotspotId) =>
          set((state) => {
            const room = state.rooms.find((r) => r.id === roomId);
            if (room) {
              room.defaultHotspots = room.defaultHotspots.filter(
                (h) => h.id !== hotspotId,
              );
              state.saved = false;
            }
          }),

        copyHotspot: (roomId, hotspotId) =>
          set((state) => {
            const room = state.rooms.find((r) => r.id === roomId);
            if (room) {
              const source = room.defaultHotspots.find((h) => h.id === hotspotId);
              if (source) {
                room.defaultHotspots.push({
                  ...source,
                  id: `hp-${Date.now()}-${Math.random()}`,
                });
                state.saved = false;
              }
            }
          }),

        reset: () => set(() => ({ ...initialState })),
      })),
      {
        name: 'viztr-editor-storage',
        storage: createJSONStorage(() => {
          if (typeof window === 'undefined') {
            // SSR no-op storage
            return {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            };
          }
          return window.localStorage;
        }),
        // Only persist the heavy data, not transient UI state.
        partialize: (state) => ({
          rooms: state.rooms,
          selectedId: state.selectedId,
        }),
      },
    ),
    {
      // Only undo/redo the `rooms` tree (skip UI state).
      partialize: (state) => {
        return { rooms: state.rooms } as unknown as EditorState;
      },
      limit: 50,
      equality: (a, b) => {
        // Custom equality to avoid tracking non-data changes.
        const aRooms = (a as { rooms?: TourRoom[] }).rooms;
        const bRooms = (b as { rooms?: TourRoom[] }).rooms;
        return aRooms === bRooms;
      },
    },
  ),
);

// ============================================================================
// Selectors (use these in components to avoid unnecessary re-renders)
// ============================================================================

export const useEditorSelected = () =>
  useEditorStore((s) => s.rooms.find((r) => r.id === s.selectedId) || s.rooms[0]);

export const useEditorRooms = () => useEditorStore((s) => s.rooms);
export const useEditorSelectedId = () => useEditorStore((s) => s.selectedId);
export const useEditorSectionTab = () => useEditorStore((s) => s.sectionTab);
export const useEditorSaved = () => useEditorStore((s) => s.saved);
export const useEditorAddMode = () => useEditorStore((s) => s.addMode);

// ============================================================================
// Undo/Redo hooks (typed)
// ============================================================================

export const useEditorHistory = () => {
  // zundo's temporal state is exposed via the .temporal store.
  const temporalState = useStore(useEditorStore.temporal);
  return {
    undo: () => useEditorStore.temporal.getState().undo(),
    redo: () => useEditorStore.temporal.getState().redo(),
    clear: () => useEditorStore.temporal.getState().clear(),
    pastCount: temporalState.pastStates.length,
    futureCount: temporalState.futureStates.length,
    canUndo: temporalState.pastStates.length > 0,
    canRedo: temporalState.futureStates.length > 0,
  };
};
