import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { temporal } from 'zundo';
import { persist, createJSONStorage } from 'zustand/middleware';

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