'use client';

import React, { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';

export type ThemeId = 'dark' | 'light' | 'system';

/**
 * Full Material 3 token maps — mirrors `theme-light.md` / `theme-dark.md`.
 * These are the single runtime source of truth; ThemeProvider publishes each
 * token as a --color-* CSS variable for the active .light / .dark mode.
 */
export const lightTheme = {
  'surface': '#fcf8f9',
  'surface-dim': '#dcd9da',
  'surface-bright': '#fcf8f9',
  'surface-container-lowest': '#ffffff',
  'surface-container-low': '#f6f3f4',
  'surface-container': '#f0edee',
  'surface-container-high': '#ebe7e8',
  'surface-container-highest': '#e5e2e3',
  'on-surface': '#1c1b1c',
  'on-surface-variant': '#3b494b',
  'inverse-surface': '#313031',
  'inverse-on-surface': '#f3f0f1',
  'outline': '#6a7a7b',
  'outline-variant': '#b9cacb',
  'surface-tint': '#006970',
  'primary': '#006970',
  'on-primary': '#ffffff',
  'primary-container': '#00f0ff',
  'on-primary-container': '#006970',
  'inverse-primary': '#00dbe9',
  'secondary': '#006d43',
  'on-secondary': '#ffffff',
  'secondary-container': '#74fcb3',
  'on-secondary-container': '#007347',
  'tertiary': '#545f73',
  'on-tertiary': '#ffffff',
  'tertiary-container': '#cfdaf2',
  'on-tertiary-container': '#545f73',
  'error': '#ba1a1a',
  'on-error': '#ffffff',
  'error-container': '#ffdad6',
  'on-error-container': '#93000a',
  'primary-fixed': '#7df4ff',
  'primary-fixed-dim': '#00dbe9',
  'on-primary-fixed': '#002022',
  'on-primary-fixed-variant': '#004f54',
  'secondary-fixed': '#74fcb3',
  'secondary-fixed-dim': '#54de99',
  'on-secondary-fixed': '#002111',
  'on-secondary-fixed-variant': '#005231',
  'tertiary-fixed': '#d8e3fb',
  'tertiary-fixed-dim': '#bcc7de',
  'on-tertiary-fixed': '#111c2d',
  'on-tertiary-fixed-variant': '#3c475a',
  'background': '#fcf8f9',
  'on-background': '#1c1b1c',
  'surface-variant': '#e5e2e3',
} as const;

export const darkTheme = {
  'surface': '#131314',
  'surface-dim': '#131314',
  'surface-bright': '#3a393a',
  'surface-container-lowest': '#0e0e0f',
  'surface-container-low': '#1c1b1c',
  'surface-container': '#201f20',
  'surface-container-high': '#2a2a2b',
  'surface-container-highest': '#353436',
  'on-surface': '#e5e2e3',
  'on-surface-variant': '#b9cacb',
  'inverse-surface': '#e5e2e3',
  'inverse-on-surface': '#313031',
  'outline': '#849495',
  'outline-variant': '#3b494b',
  'surface-tint': '#00dbe9',
  'primary': '#dbfcff',
  'on-primary': '#00363a',
  'primary-container': '#00f0ff',
  'on-primary-container': '#006970',
  'inverse-primary': '#006970',
  'secondary': '#54de99',
  'on-secondary': '#003920',
  'secondary-container': '#00ac6c',
  'on-secondary-container': '#00361f',
  'tertiary': '#f4f6ff',
  'on-tertiary': '#263143',
  'tertiary-container': '#cfdaf2',
  'on-tertiary-container': '#545f73',
  'error': '#ffb4ab',
  'on-error': '#690005',
  'error-container': '#93000a',
  'on-error-container': '#ffdad6',
  'primary-fixed': '#7df4ff',
  'primary-fixed-dim': '#00dbe9',
  'on-primary-fixed': '#002022',
  'on-primary-fixed-variant': '#004f54',
  'secondary-fixed': '#74fcb3',
  'secondary-fixed-dim': '#54de99',
  'on-secondary-fixed': '#002111',
  'on-secondary-fixed-variant': '#005231',
  'tertiary-fixed': '#d8e3fb',
  'tertiary-fixed-dim': '#bcc7de',
  'on-tertiary-fixed': '#111c2d',
  'on-tertiary-fixed-variant': '#3c475a',
  'background': '#131314',
  'on-background': '#e5e2e3',
  'surface-variant': '#353436',
} as const;

export type ThemeTokens = typeof darkTheme;

export function getThemeTokens(mode: 'light' | 'dark'): ThemeTokens {
  return mode === 'light' ? lightTheme : darkTheme;
}

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
    description: 'Deep #0E0E0F foundation with electric cyan #00F0FF primary actions, fresh green #54DE99 accents, dark blue-gray #1E293B depth, and pill-shaped geometry. Material Design 3 compliant.',
    resolvedMode: 'dark',
    colors: {
      bg: darkTheme.background,
      card: darkTheme['surface-container'],
      border: darkTheme['outline-variant'],
      text: darkTheme['on-surface'],
      primary: darkTheme['primary-container'],
      accent: darkTheme.secondary,
      badgeBg: darkTheme['surface-container-highest'],
      badgeText: darkTheme.primary,
    },
    contrastRatio: '18.5:1',
    tags: ['Cyan Spark', 'Electric Cyan', 'Fresh Green', 'Pill-Shaped', 'Material 3'],
  },
  {
    id: 'light',
    name: 'Vibrant Sky (Light)',
    subtitle: 'Crisp Daylight & Deep Cerulean',
    category: 'Light Mode',
    description: 'Clean architectural titanium white and light cool grey with deep sky blue branding and high readability.',
    resolvedMode: 'light',
    colors: {
      bg: lightTheme.background,
      card: lightTheme['surface-container'],
      border: lightTheme['outline-variant'],
      text: lightTheme['on-surface'],
      primary: lightTheme.primary,
      accent: lightTheme.secondary,
      badgeBg: lightTheme['surface-container-highest'],
      badgeText: lightTheme.primary,
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
      bg: darkTheme.background,
      card: darkTheme['surface-container'],
      border: darkTheme['outline-variant'],
      text: darkTheme['on-surface'],
      primary: darkTheme['primary-container'],
      accent: darkTheme.secondary,
      badgeBg: darkTheme['surface-container-highest'],
      badgeText: darkTheme.primary,
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

    // Publish every Material token for the resolved mode. The .light/.dark
    // classes select the palette; these variables keep inline styles, CSS
    // and Tailwind var() utilities in agreement with theme-*.md.
    const tokens = getThemeTokens(resolvedMode);
    for (const [token, value] of Object.entries(tokens)) {
      root.style.setProperty(`--color-${token}`, value);
    }
    root.style.setProperty('--bg-primary', tokens.background);
    root.style.setProperty('--bg-card', tokens['surface-container']);
    root.style.setProperty('--border', tokens['outline-variant']);
    root.style.setProperty('--text-primary', tokens['on-surface']);
    root.style.setProperty('--primary', tokens['primary-container']);
    root.style.setProperty('--accent', tokens.secondary);
    root.style.setProperty('--color-primary', tokens.primary);
    root.style.setProperty('--color-secondary', tokens.secondary);
    root.style.setProperty('--color-surface', tokens['surface-container']);
    root.style.setProperty('--color-background', tokens.background);
    root.style.setProperty('--color-on-background', tokens['on-surface']);
    root.style.setProperty('--color-on-surface', tokens['on-surface']);
  }, [activeEffectiveId, effectiveThemeId, resolvedMode, systemDark]);

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
