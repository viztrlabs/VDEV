import { useState, useEffect, useCallback } from 'react';

export interface TourPreferences {
  motionIntensity: 'off' | 'low' | 'high';
  autoRotateSpeed: number;
  defaultZoom: number;
  theme: 'dark' | 'light' | 'system';
  showHotspots: boolean;
  autoRotate: boolean;
  gyroscopeEnabled: boolean;
  language: string;
  // Layout & UI
  hideTopBar: boolean;
  showBottomControls: boolean;
  showBottomControlsOnHover: boolean;
  showHotspotButton: boolean;
  showZoomControls: boolean;
  showSceneCounter: boolean;
  ctrlAxisRotationEnabled: boolean;
  ctrlAxisRotationStep: number;
  scrollZoomEnabled: boolean;
  scrollZoomStep: number;
  // Branding & Assets
  clientLogoUrl: string;
  viztrLogoUrl: string;
  floorPlanImageUrl: string;
  showFloorPlan: boolean;
  // Audio
  backgroundMusicUrl: string;
  musicEnabled: boolean;
  musicVolume: number;
  // AI Assistant
  aiAssistantEnabled: boolean;
  aiAssistantAvatarUrl: string;
  // Google Drive
  googleDriveFolderId: string;
  showGoogleDriveSection: boolean;
}

const DEFAULT_PREFERENCES: TourPreferences = {
  motionIntensity: 'high',
  autoRotateSpeed: 2,
  defaultZoom: 1,
  theme: 'dark',
  showHotspots: true,
  autoRotate: false,
  gyroscopeEnabled: true,
  language: 'en',
  // Layout & UI defaults
  hideTopBar: false,
  showBottomControls: true,
  showBottomControlsOnHover: true,
  showHotspotButton: true,
  showZoomControls: true,
  showSceneCounter: true,
  ctrlAxisRotationEnabled: true,
  ctrlAxisRotationStep: 15,
  scrollZoomEnabled: true,
  scrollZoomStep: 10,
  // Branding & Assets defaults
  clientLogoUrl: '',
  viztrLogoUrl: '',
  floorPlanImageUrl: '',
  showFloorPlan: true,
  // Audio defaults
  backgroundMusicUrl: '',
  musicEnabled: false,
  musicVolume: 0.5,
  // AI Assistant defaults
  aiAssistantEnabled: false,
  aiAssistantAvatarUrl: '',
  // Google Drive defaults
  googleDriveFolderId: '',
  showGoogleDriveSection: false,
};

const STORAGE_KEY = 'viztr-tour-preferences';

export function useTourPreferences() {
  const [preferences, setPreferences] = useState<TourPreferences>(() => {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
    try {
      const stored = localStorage.getItem('viztr-tour-preferences');
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch {
      // Ignore parsing errors
    }
    return DEFAULT_PREFERENCES;
  });

  const updatePreferences = useCallback((updates: Partial<TourPreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...updates };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('viztr-tour-preferences', JSON.stringify(updated));
        } catch {
          // Ignore storage errors
        }
      }
      return updated;
    });
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('viztr-tour-preferences');
      } catch {
        // Ignore storage errors
      }
    }
  }, []);

  return { preferences, updatePreferences, resetPreferences, DEFAULT_PREFERENCES };
}

export function useTheme(preferences: TourPreferences) {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark';
    if (preferences.theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return preferences.theme;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return { theme, setTheme };
}

export function useReducedMotion(preferences: TourPreferences) {
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (preferences.motionIntensity === 'off') return true;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (preferences.motionIntensity === 'off') {
        setReducedMotion(true);
      } else {
        setReducedMotion(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preferences.motionIntensity]);

  return { reducedMotion, setReducedMotion };
}