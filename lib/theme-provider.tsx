'use client';

import React, { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';

export type ThemeId = 'dark' | 'light' | 'system';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  subtitle: string;
  category: 'Dark Mode' | 'Light Mode' | 'Adaptive';
  description: string;
  resolvedMode: 'dark' | 'light';
  colors: {
    bg: string;
    card: string;
    border: string;
    text: string;
    primary: string;
    accent: string;
    badgeBg: string;
    badgeText: string;
  };
  contrastRatio: string;
  tags: string[];
}

export const AVAILABLE_THEMES: ThemeConfig[] = [
  {
    id: 'dark',
    name: 'Cyan Spark (Dark)',
    subtitle: 'Electric Cyan & Deep Midnight Shadow',
    category: 'Dark Mode',
    description: 'Deep #0A0A0B foundation with electric cyan #00F0FF primary actions, fresh green #42CF8B accents, dark blue-gray #1E293B depth, and pill-shaped geometry.',
    resolvedMode: 'dark',
    colors: {
      bg: '#0A0A0B',
      card: '#131314',
      border: '#1E293B',
      text: '#E5E2E3',
      primary: '#00F0FF',
      accent: '#42CF8B',
      badgeBg: '#1E293B',
      badgeText: '#00F0FF',
    },
    contrastRatio: '18.5:1',
    tags: ['Cyan Spark', 'Electric Cyan', 'Fresh Green', 'Pill-Shaped'],
  },
  {
    id: 'light',
    name: 'Vibrant Sky (Light)',
    subtitle: 'Crisp Daylight & Deep Cerulean',
    category: 'Light Mode',
    description: 'Clean architectural titanium white and light cool grey with deep sky blue branding and high readability.',
    resolvedMode: 'light',
    colors: {
      bg: '#F9F9FF',
      card: '#E9EDFF',
      border: '#BEC8CE',
      text: '#111B2F',
      primary: '#006686',
      accent: '#376479',
      badgeBg: '#E0E8FF',
      badgeText: '#006686',
    },
    contrastRatio: '15.4:1',
    tags: ['Vibrant Sky', 'Daylight Studio', 'Clean Editorial'],
  },
  {
    id: 'system',
    name: 'System Auto',
    subtitle: 'Dynamic OS Synchronization',
    category: 'Adaptive',
    description: 'Automatically switches between Cyan Spark Dark and Light mode matching device preferences.',
    resolvedMode: 'dark',
    colors: {
      bg: '#0A0A0B',
      card: '#131314',
      border: '#1E293B',
      text: '#E5E2E3',
      primary: '#00F0FF',
      accent: '#42CF8B',
      badgeBg: '#1E293B',
      badgeText: '#00F0FF',
    },
    contrastRatio: 'Adaptive',
    tags: ['Auto Detect', 'OS Sync', 'Cyan Spark'],
  },
];

interface ThemeContextType {
  theme: ThemeId;
  resolvedTheme: 'light' | 'dark';
  activeThemeConfig: ThemeConfig;
  previewThemeId: ThemeId | null;
  setTheme: (theme: ThemeId) => void;
  previewTheme: (theme: ThemeId | null) => void;
  cycleTheme: () => void;
  cycleLightDarkSystem: () => void;
  toggleTheme: () => void;
  availableThemes: ThemeConfig[];
  themeModalOpen: boolean;
  setThemeModalOpen: (open: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'viztr-theme';

let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getStoredTheme(): ThemeId {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
    if (saved && AVAILABLE_THEMES.some((t) => t.id === saved)) {
      return saved;
    }
  } catch {
    // ignore
  }
  return 'dark';
}

function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return true;
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore<ThemeId>(
    subscribe,
    getStoredTheme,
    () => 'dark'
  );

  const [previewThemeId, setPreviewThemeId] = useState<ThemeId | null>(null);
  const [themeModalOpen, setThemeModalOpen] = useState(false);

  const systemDark = useSyncExternalStore<boolean>(
    (callback) => {
      if (typeof window === 'undefined') return () => {};
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', callback);
      return () => mq.removeEventListener('change', callback);
    },
    getSystemPrefersDark,
    () => true
  );

  const activeEffectiveId = previewThemeId || theme;

  let resolvedMode: 'light' | 'dark' = 'dark';
  if (activeEffectiveId === 'system') {
    resolvedMode = systemDark ? 'dark' : 'light';
  } else if (activeEffectiveId === 'light') {
    resolvedMode = 'light';
  } else {
    resolvedMode = 'dark';
  }

  const effectiveThemeId =
    activeEffectiveId === 'system' ? (systemDark ? 'dark' : 'light') : activeEffectiveId;

  const currentConfig =
    AVAILABLE_THEMES.find((t) => t.id === activeEffectiveId) ||
    AVAILABLE_THEMES.find((t) => t.id === effectiveThemeId) ||
    AVAILABLE_THEMES[0];

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all previous theme classes
    root.classList.remove(
      'light',
      'dark',
      'theme-dark',
      'theme-light',
      'theme-system'
    );
    
    // Add base resolved mode class (light/dark)
    root.classList.add(resolvedMode);
    
    // Set data-theme attributes
    root.setAttribute('data-theme', effectiveThemeId);
    root.setAttribute('data-theme-setting', activeEffectiveId);
    root.setAttribute('data-theme-mode', resolvedMode);
    root.classList.add(`theme-${effectiveThemeId}`);
    if (activeEffectiveId === 'system') {
      root.classList.add('theme-system');
    }
    root.style.colorScheme = resolvedMode;

    // Synchronize document.body theme classes
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.remove('light', 'dark');
      document.body.classList.add(resolvedMode);
    }

    // Update dynamic root CSS variables based on active theme
    const activeColorsConfig =
      AVAILABLE_THEMES.find((t) => t.id === effectiveThemeId) || currentConfig;
    if (activeColorsConfig) {
      root.style.setProperty('--bg-primary', activeColorsConfig.colors.bg);
      root.style.setProperty('--bg-card', activeColorsConfig.colors.card);
      root.style.setProperty('--border', activeColorsConfig.colors.border);
      root.style.setProperty('--text-primary', activeColorsConfig.colors.text);
      root.style.setProperty('--primary', activeColorsConfig.colors.primary);
      root.style.setProperty('--accent', activeColorsConfig.colors.accent);
    }
  }, [activeEffectiveId, effectiveThemeId, resolvedMode, systemDark, currentConfig]);

  const setTheme = (newTheme: ThemeId) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // ignore
    }
    setPreviewThemeId(null);
    emitChange();
  };

  const previewTheme = (previewId: ThemeId | null) => {
    setPreviewThemeId(previewId);
  };

  const cycleTheme = () => {
    const current = getStoredTheme();
    const order: ThemeId[] = ['dark', 'light', 'system'];
    const currentIndex = order.indexOf(current);
    const nextIndex = (currentIndex + 1) % order.length;
    setTheme(order[nextIndex]);
  };

  const toggleTheme = () => {
    const next = resolvedMode === 'light' ? 'dark' : 'light';
    setTheme(next);
  };

  const cycleLightDarkSystem = () => {
    const next = resolvedMode === 'light' ? 'dark' : 'light';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme: resolvedMode,
        activeThemeConfig: currentConfig,
        previewThemeId,
        setTheme,
        previewTheme,
        cycleTheme,
        cycleLightDarkSystem,
        toggleTheme,
        availableThemes: AVAILABLE_THEMES,
        themeModalOpen,
        setThemeModalOpen,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
