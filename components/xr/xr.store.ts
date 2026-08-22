'use client';

import { create } from 'zustand';
import { XRMode, AnnotationItem, DeviceCapabilities, XRScene } from './xr.types';

interface XRStoreState {
  currentSceneId: string;
  currentMode: XRMode;
  activeAnnotation: AnnotationItem | null;
  viewedScenes: string[];
  isTransitioning: boolean;
  isEntryComplete: boolean;
  deviceCapabilities: DeviceCapabilities;
  scenes: XRScene[];

  // Actions
  setScene: (sceneId: string) => void;
  setMode: (mode: XRMode) => void;
  showAnnotation: (annotation: AnnotationItem) => void;
  hideAnnotation: () => void;
  markSceneViewed: (sceneId: string) => void;
  completeEntry: () => void;
  setDeviceCapabilities: (caps: DeviceCapabilities) => void;
  setScenes: (scenes: XRScene[]) => void;
}

export const useXRStore = create<XRStoreState>((set, get) => ({
  currentSceneId: 'scene-01',
  currentMode: 'tour',
  activeAnnotation: null,
  viewedScenes: ['scene-01'],
  isTransitioning: false,
  isEntryComplete: false,
  deviceCapabilities: {
    hasWebXR: true,
    hasVR: true,
    hasAR: true,
  },
  scenes: [],

  setScene: (sceneId: string) => {
    const { viewedScenes } = get();
    set({ isTransitioning: true });
    setTimeout(() => {
      set({
        currentSceneId: sceneId,
        isTransitioning: false,
        activeAnnotation: null,
        viewedScenes: viewedScenes.includes(sceneId) ? viewedScenes : [...viewedScenes, sceneId],
      });
    }, 300);
  },

  setMode: (mode: XRMode) => set({ currentMode: mode }),
  showAnnotation: (annotation: AnnotationItem) => set({ activeAnnotation: annotation }),
  hideAnnotation: () => set({ activeAnnotation: null }),
  markSceneViewed: (sceneId: string) => {
    const { viewedScenes } = get();
    if (!viewedScenes.includes(sceneId)) {
      set({ viewedScenes: [...viewedScenes, sceneId] });
    }
  },
  completeEntry: () => set({ isEntryComplete: true }),
  setDeviceCapabilities: (caps: DeviceCapabilities) => set({ deviceCapabilities: caps }),
  setScenes: (scenes: XRScene[]) => set({ scenes }),
}));
