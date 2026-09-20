import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { temporal } from 'zundo';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AlignmentMarker, SpatialAlignment } from '@/lib/3d/bridge/types';

export interface ViewConstraints {
  top: number;
  bottom: number;
  left: number;
  right: number;
  zoomMin: number;
  zoomMax: number;
  mobileZoomEnabled: boolean;
}

export interface TourHotspot {
  id: string;
  yaw: number;
  pitch: number;
  type: 'link' | 'info' | 'image' | 'video' | 'audio' | 'product';
  targetSceneId?: string;
  targetYaw?: number;
  title: string;
  description: string;
}

export interface TourScene {
  id: string;
  name: string;
  type: '360' | '3d';
  url: string;
  tileUrl?: string;
  thumbnailUrl: string;
  initialYaw: number;
  initialPitch: number;
  initialFov: number;
  hotspots: TourHotspot[];
  viewConstraints: ViewConstraints;
  autorotateEnabled: boolean;
  autorotateSpeed: number;
  spatialAlignment?: SpatialAlignment;
  alignmentMarkers?: AlignmentMarker[];
}

interface TourClientState {
  scenes: TourScene[];
  currentSceneId: string;
  selectedSceneId: string;
  addMode: boolean;
  editingHotspotId: string | null;
  isLoading: boolean;
  currentView: { yaw: number; pitch: number; fov: number } | null;
  setScenes: (scenes: TourScene[]) => void;
  updateScene: (id: string, patch: Partial<TourScene>) => void;
  deleteScene: (id: string) => void;
  addRoom: (room: Partial<TourScene>) => string;
  renameRoom: (id: string, name: string) => void;
  duplicateRoom: (id: string) => string;
  setCurrentScene: (id: string) => void;
  setView: (v: { yaw: number; pitch: number; fov: number }) => void;
}

export const useTourStore = create<TourClientState>()(
  temporal(
    persist(
      immer((set) => ({
        scenes: [],
        currentSceneId: '',
        selectedSceneId: '',
        addMode: false,
        editingHotspotId: null,
        isLoading: false,
        currentView: null,
        setScenes: (scenes) =>
          set((s) => {
            s.scenes = scenes;
            s.currentSceneId = scenes[0]?.id ?? '';
          }),
        updateScene: (id, patch) =>
          set((s) => {
            const sc = s.scenes.find((x) => x.id === id);
            if (sc) Object.assign(sc, patch);
          }),
        deleteScene: (id) =>
          set((s) => {
            s.scenes = s.scenes.filter((x) => x.id !== id);
            if (s.currentSceneId === id) s.currentSceneId = s.scenes[0]?.id ?? '';
          }),
        addRoom: (room) => {
          const id = `room-${Date.now().toString(36)}`;
          set((s) => {
            s.scenes.push({
              id,
              name: room.name || 'New Room',
              type: room.type || '360',
              url: room.url || '',
              tileUrl: room.tileUrl,
              thumbnailUrl: room.thumbnailUrl || '',
              initialYaw: room.initialYaw || 0,
              initialPitch: room.initialPitch || 0,
              initialFov: room.initialFov || 75,
              hotspots: room.hotspots || [],
              viewConstraints: room.viewConstraints || {
                top: -90, bottom: 90, left: -180, right: 180,
                zoomMin: 60, zoomMax: 120, mobileZoomEnabled: false,
              },
              autorotateEnabled: room.autorotateEnabled ?? true,
              autorotateSpeed: room.autorotateSpeed || 0.5,
              spatialAlignment: room.spatialAlignment,
              alignmentMarkers: room.alignmentMarkers,
            } as TourScene);
          });
          return id;
        },
        renameRoom: (id, name) =>
          set((s) => {
            const sc = s.scenes.find((x) => x.id === id);
            if (sc) sc.name = name;
          }),
        duplicateRoom: (id) => {
          const newId = `room-${Date.now().toString(36)}`;
          set((s) => {
            const original = s.scenes.find((x) => x.id === id);
            if (original) {
              const clone = { ...original, id: newId, name: `${original.name} (copy)` };
              s.scenes.push(clone as TourScene);
            }
          });
          return newId;
        },
        setCurrentScene: (id) => set({ currentSceneId: id }),
        setView: (v) => set({ currentView: v }),
      })),
      {
        name: 'viztr-tour-client',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          scenes: state.scenes,
          currentSceneId: state.currentSceneId,
        }),
      }
    ),
    {
      partialize: (state) => ({ scenes: state.scenes }),
      limit: 50,
    }
  )
);

// Backward-compat selectors for existing imports
export const useEditorScenes = () => useTourStore((s) => s.scenes);
export const useViewerCurrentScene = () =>
  useTourStore((s) => s.scenes.find((sc) => sc.id === s.currentSceneId));
export const useEditorSelectedScene = () =>
  useTourStore((s) => s.scenes.find((sc) => sc.id === s.selectedSceneId));