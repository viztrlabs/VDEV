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

export type HotspotType =
  | 'navigation'   // room-to-room link
  | 'info'         // information popup
  | 'image'        // opens an image
  | 'gallery'      // opens image gallery
  | 'video'        // plays video
  | 'audio'        // plays audio
  | 'link'         // external URL
  | 'floor'        // floor navigation
  | 'model3d'      // 3D model overlay
  | 'splat'        // gaussian splat trigger
  | 'experience'   // linked experience
  | 'custom';      // user-defined

export interface TourHotspot {
  id: string;
  yaw: number;
  pitch: number;
  type: HotspotType;

  // Navigation / floor
  targetSceneId?: string;
  targetYaw?: number;
  targetPitch?: number;

  // Content
  title: string;
  description: string;
  icon?: string;          // icon name or SVG path
  imageUrl?: string;      // for image/gallery types
  images?: string[];      // for gallery type (multiple images)
  captions?: string[];    // for gallery type
  videoUrl?: string;      // for video type
  audioUrl?: string;      // for audio type
  externalUrl?: string;   // for link type
  modelUrl?: string;      // for model3d type
  openMode?: 'new_tab' | 'same_tab'; // for link type

  // Appearance
  color?: string;         // hex color
  size?: number;          // scale factor (0.5-3.0)
  opacity?: number;       // 0-1
  label?: string;         // visible label text
  tooltip?: string;       // hover tooltip
  animation?: 'none' | 'pulse' | 'glow' | 'bounce';
  rotation?: number;

  // Direction
  directionMode?: 'auto' | 'manual' | 'look_at' | 'target';
  directionYaw?: number;
  directionPitch?: number;

  // Behavior
  autoplay?: boolean;     // for video/audio
  loop?: boolean;         // for video/audio
  muted?: boolean;        // for video
  volume?: number;        // for audio (0-1)
  posterUrl?: string;     // for video (thumbnail)

  // Metadata
  createdAt?: string;
  updatedAt?: string;
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

interface TourSettings {
  name: string;
  description: string;
  defaultFov: number;
  autoRotate: boolean;
  autoRotateSpeed: number;
}

interface TourClientState {
  scenes: TourScene[];
  currentSceneId: string;
  selectedSceneId: string;
  addMode: boolean;
  editingHotspotId: string | null;
  isLoading: boolean;
  currentView: { yaw: number; pitch: number; fov: number } | null;
  tourSettings: TourSettings;
  updateTourSettings: (patch: Partial<TourSettings>) => void;
  setScenes: (scenes: TourScene[]) => void;
  updateScene: (id: string, patch: Partial<TourScene>) => void;
  deleteScene: (id: string) => void;
  addRoom: (room: Partial<TourScene>) => string;
  renameRoom: (id: string, name: string) => void;
  duplicateRoom: (id: string) => string;
  reorderRoom: (id: string, direction: 'up' | 'down') => void;
  setCurrentScene: (id: string) => void;
  setView: (v: { yaw: number; pitch: number; fov: number }) => void;

  // Hotspot operations
  addHotspot: (sceneId: string, hotspot: Omit<TourHotspot, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateHotspot: (sceneId: string, hotspotId: string, patch: Partial<TourHotspot>) => void;
  deleteHotspot: (sceneId: string, hotspotId: string) => void;
  duplicateHotspot: (sceneId: string, hotspotId: string) => string | null;
  reorderHotspot: (sceneId: string, hotspotId: string, direction: 'up' | 'down') => void;

  // Selection state
  selectedHotspotId: string | null;
  setSelectedHotspot: (id: string | null) => void;
}

export const useTourStore = create<TourClientState>()(
  temporal(
    persist(
      immer((set, get) => ({
        scenes: [],
        currentSceneId: '',
        selectedSceneId: '',
        addMode: false,
        editingHotspotId: null,
        isLoading: false,
        currentView: null,
        selectedHotspotId: null,
        tourSettings: {
          name: 'My Virtual Tour',
          description: '',
          defaultFov: 80,
          autoRotate: false,
          autoRotateSpeed: 0.1,
        },
        updateTourSettings: (patch) => set((s) => { Object.assign(s.tourSettings, patch); }),
        setScenes: (scenes) =>
          set((s) => {
            s.scenes = (scenes ?? []).map(normalizeLoadedRoom);
            s.currentSceneId = (scenes ?? [])[0]?.id ?? '';
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
        reorderRoom: (id, direction) =>
          set((s) => {
            const idx = s.scenes.findIndex((x) => x.id === id);
            if (idx === -1) return;
            const newIdx = direction === 'up' ? idx - 1 : idx + 1;
            if (newIdx < 0 || newIdx >= s.scenes.length) return;
            const [moved] = s.scenes.splice(idx, 1);
            s.scenes.splice(newIdx, 0, moved);
          }),
        setCurrentScene: (id) => set({ currentSceneId: id }),
        setView: (v) => set({ currentView: v }),

        // Hotspot operations
        addHotspot: (sceneId, hotspot) => {
          const id = `hs-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          const newHs: TourHotspot = {
            ...hotspot,
            id,
            createdAt: new Date().toISOString(),
          };
          set((state) => {
            const scene = state.scenes.find((s) => s.id === sceneId);
            if (scene) scene.hotspots.push(newHs);
          });
          return id;
        },

        updateHotspot: (sceneId, hotspotId, patch) => {
          set((state) => {
            const scene = state.scenes.find((s) => s.id === sceneId);
            const hs = scene?.hotspots.find((h) => h.id === hotspotId);
            if (hs) Object.assign(hs, patch, { updatedAt: new Date().toISOString() });
          });
        },

        deleteHotspot: (sceneId, hotspotId) => {
          set((state) => {
            const scene = state.scenes.find((s) => s.id === sceneId);
            if (scene) scene.hotspots = scene.hotspots.filter((h) => h.id !== hotspotId);
          });
        },

        duplicateHotspot: (sceneId, hotspotId) => {
          const scene = get().scenes.find((s) => s.id === sceneId);
          const hs = scene?.hotspots.find((h) => h.id === hotspotId);
          if (!hs) return null;
          const id = `hs-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          const dup = { ...hs, id, title: `${hs.title} (copy)`, createdAt: new Date().toISOString() };
          set((state) => {
            const s = state.scenes.find((sc) => sc.id === sceneId);
            if (s) s.hotspots.push(dup);
          });
          return id;
        },

        reorderHotspot: (sceneId, hotspotId, direction) => {
          set((state) => {
            const scene = state.scenes.find((s) => s.id === sceneId);
            if (!scene) return;
            const idx = scene.hotspots.findIndex((h) => h.id === hotspotId);
            if (idx < 0) return;
            const newIdx = direction === 'up' ? idx - 1 : idx + 1;
            if (newIdx < 0 || newIdx >= scene.hotspots.length) return;
            const [item] = scene.hotspots.splice(idx, 1);
            scene.hotspots.splice(newIdx, 0, item);
          });
        },

        setSelectedHotspot: (id) => set({ selectedHotspotId: id }),
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

/** Normalize a room loaded from the API: map legacy panoramaUrl -> url,
 *  preserve unknown API fields, keep legacy defaultHotspots when the
 *  canonical hotspots array is empty. */
export function normalizeLoadedRoom(room: any): TourScene {
  if (!room || typeof room !== 'object') {
    return {
      url: '', thumbnailUrl: '', name: '', type: '360' as const,
      initialYaw: 0, initialPitch: 0, initialFov: 75, hotspots: [],
      viewConstraints: { top: -90, bottom: 90, left: -180, right: 180, zoomMin: 60, zoomMax: 120, mobileZoomEnabled: false },
      autorotateEnabled: false, autorotateSpeed: 1,
    } as unknown as TourScene;
  }
  const url = room.url ?? room.panoramaUrl ?? '';
  const hotspots = room.hotspots && room.hotspots.length > 0
    ? room.hotspots
    : ((room.defaultHotspots ?? []) as any[]).filter((h: any) => h && h.id);
  return {
    ...room,
    url,
    panoramaUrl: room.panoramaUrl ?? url,
    hotspots,
  } as TourScene;
}

/** Migrate old hotspot types to new expanded types */
export function migrateHotspotType(oldType: string): HotspotType {
  const map: Record<string, HotspotType> = {
    link: 'navigation',
    product: 'model3d',
  };
  return map[oldType] || oldType as HotspotType;
}