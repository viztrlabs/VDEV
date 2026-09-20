'use client';

import React, { createContext, useContext } from 'react';
import { create } from 'zustand';

export type ExperienceEngine = 'tour' | 'splat' | 'playcanvas';

export interface SharedExperienceState {
  yaw: number;
  pitch: number;
  activeEngine: ExperienceEngine;
  setOrientation: (yaw: number, pitch: number) => void;
  setActiveEngine: (engine: ExperienceEngine) => void;
}

export const useSharedExperienceStore = create<SharedExperienceState>((set) => ({
  yaw: 0,
  pitch: 0,
  activeEngine: 'tour',
  setOrientation: (yaw, pitch) =>
    set({ yaw, pitch: Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch)) }),
  setActiveEngine: (engine) => set({ activeEngine: engine }),
}));

const SharedExperienceContext = createContext<SharedExperienceState | null>(null);

export function SharedExperienceProvider({ children }: { children: React.ReactNode }) {
  const store = useSharedExperienceStore();
  return (
    <SharedExperienceContext.Provider value={store}>
      {children}
    </SharedExperienceContext.Provider>
  );
}

export function useSharedExperience(): SharedExperienceState {
  const ctx = useContext(SharedExperienceContext);
  if (!ctx) {
    return useSharedExperienceStore();
  }
  return ctx;
}
