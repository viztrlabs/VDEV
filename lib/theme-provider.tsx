'use client';

import React, { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';

export type ThemeId = 'dark' | 'light' | 'glass' | 'obsidian' | 'bronze' | 'blueprint' | 'system';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  subtitle: string;
  category: 'Dark Mode' | 'Light Mode' | 'Specialty' | 'Adaptive';
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
    name: 'Cyber Emerald',
    subtitle: 'Default High-Density Studio',
    category: 'Dark Mode',
    description: 'Deep zinc tones with electric emerald accents tuned for UE5 Lumen pipelines and spatial rendering.',
    resolvedMode: 'dark',
    colors: {
      bg: '#09090B',
      card: '#18181B',
      border: '#27272A',
      text: '#FAFAFA',
      primary: '#3ECF8E',
      accent: '#34B27B',
      badgeBg: '#18181B',
      badgeText: '#3ECF8E',
    },
    contrastRatio: '15.8:1',
    tags: ['Cyberpunk', 'UE5 Flagship', 'High Contrast'],
  },
  {
    id: 'glass',
    name: 'Aero Glassmorphism',
    subtitle: 'Frosted Glass & Prismatic Cyan Glow',
    category: 'Specialty',
    description: 'Translucent frosted glass surfaces with high-performance backdrop blur, specular refraction edges, and glowing cyan-emerald optics.',
    resolvedMode: 'dark',
    colors: {
      bg: '#080D1A',
      card: 'rgba(15, 23, 42, 0.75)',
      border: 'rgba(56, 189, 248, 0.28)',
      text: '#F8FAFC',
      primary: '#06B6D4',
      accent: '#10B981',
      badgeBg: 'rgba(6, 182, 212, 0.18)',
      badgeText: '#22D3EE',
    },
    contrastRatio: '16.4:1',
    tags: ['Frosted Glass', 'Backdrop Blur', 'Prismatic Refraction', 'Specular Edge'],
  },
  {
    id: 'light',
    name: 'Architectural Daylight',
    subtitle: 'Crisp Studio Day Mode',
    category: 'Light Mode',
    description: 'Clean architectural titanium white and light cool grey with forest emerald branding for daylight presentations.',
    resolvedMode: 'light',
    colors: {
      bg: '#F4F4F5',
      card: '#FFFFFF',
      border: '#D4D4D8',
      text: '#09090B',
      primary: '#10B981',
      accent: '#059669',
      badgeBg: '#E4E4E7',
      badgeText: '#047857',
    },
    contrastRatio: '14.2:1',
    tags: ['Clean Studio', 'Daylight CAD', 'Editorial'],
  },
  {
    id: 'obsidian',
    name: 'Midnight Obsidian',
    subtitle: 'OLED Pure Black & Ultraviolet',
    category: 'Specialty',
    description: 'Pitch-black OLED background with sleek violet and cyber-cyan optics for ultra-luxury presentations.',
    resolvedMode: 'dark',
    colors: {
      bg: '#030305',
      card: '#0D0D12',
      border: '#1E1E28',
      text: '#F8FAFC',
      primary: '#8B5CF6',
      accent: '#06B6D4',
      badgeBg: '#181528',
      badgeText: '#A78BFA',
    },
    contrastRatio: '19.4:1',
    tags: ['OLED True Black', 'Spatial XR', 'Luxury'],
  },
  {
    id: 'bronze',
    name: 'Warm Clay & Bronze',
    subtitle: 'Architectural Terracotta & Gold',
    category: 'Specialty',
    description: 'Warm earth tones, charcoal shadows, and luminous amber highlights inspired by tactile physical models and masonry.',
    resolvedMode: 'dark',
    colors: {
      bg: '#120F0D',
      card: '#1C1714',
      border: '#2E2520',
      text: '#FDF8F6',
      primary: '#F59E0B',
      accent: '#D97706',
      badgeBg: '#2A2019',
      badgeText: '#FBBF24',
    },
    contrastRatio: '16.1:1',
    tags: ['Warm Materiality', 'Lumen Sunset', 'Tactile'],
  },
  {
    id: 'blueprint',
    name: 'Nordic Blueprint',
    subtitle: 'Technical CAD & Deep Navy',
    category: 'Specialty',
    description: 'Deep navy structural canvas with neon cyan laser vectors reflecting precision engineering drawings.',
    resolvedMode: 'dark',
    colors: {
      bg: '#070C18',
      card: '#0D1629',
      border: '#1B2C4E',
      text: '#F0F6FC',
      primary: '#38BDF8',
      accent: '#0EA5E9',
      badgeBg: '#0F2342',
      badgeText: '#38BDF8',
    },
    contrastRatio: '17.2:1',
    tags: ['CAD Blueprint', 'Structural Tech', 'Ice Vector'],
  },
  {
    id: 'system',
    name: 'System Auto',
    subtitle: 'Dynamic OS Synchronization',
    category: 'Adaptive',
    description: 'Automatically switches between Cyber Emerald (Dark) and Architectural Daylight (Light) matching device preferences.',
    resolvedMode: 'dark',
    colors: {
      bg: '#09090B',
      card: '#18181B',
      border: '#27272A',
      text: '#FAFAFA',
      primary: '#3ECF8E',
      accent: '#34B27B',
      badgeBg: '#18181B',
      badgeText: '#3ECF8E',
    },
    contrastRatio: 'Adaptive',
    tags: ['Auto Detect', 'OS Sync', 'Responsive'],
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

  const currentConfig =
    AVAILABLE_THEMES.find((t) => t.id === activeEffectiveId) || AVAILABLE_THEMES[0];

  let resolvedMode: 'light' | 'dark' = 'dark';
  if (activeEffectiveId === 'system') {
    resolvedMode = systemDark ? 'dark' : 'light';
  } else if (activeEffectiveId === 'light') {
    resolvedMode = 'light';
  } else {
    resolvedMode = 'dark';
  }

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all previous theme classes
    root.classList.remove('light', 'dark', 'theme-dark', 'theme-light', 'theme-glass', 'theme-obsidian', 'theme-bronze', 'theme-blueprint');
    
    // Add base resolved mode class (light/dark)
    root.classList.add(resolvedMode);
    
    // Set data-theme attribute
    const themeName = activeEffectiveId === 'system' ? (systemDark ? 'dark' : 'light') : activeEffectiveId;
    root.setAttribute('data-theme', themeName);
    root.classList.add(`theme-${themeName}`);

    // Update dynamic root CSS variables based on active theme
    const themeConfig = AVAILABLE_THEMES.find((t) => t.id === themeName) || currentConfig;
    if (themeConfig) {
      root.style.setProperty('--bg-primary', themeConfig.colors.bg);
      root.style.setProperty('--bg-card', themeConfig.colors.card);
      root.style.setProperty('--border', themeConfig.colors.border);
      root.style.setProperty('--text-primary', themeConfig.colors.text);
      root.style.setProperty('--primary', themeConfig.colors.primary);
      root.style.setProperty('--accent', themeConfig.colors.accent);
    }
  }, [activeEffectiveId, resolvedMode, systemDark, currentConfig]);

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
    const order: ThemeId[] = ['dark', 'glass', 'light', 'obsidian', 'bronze', 'blueprint', 'system'];
    const currentIndex = order.indexOf(current);
    const nextIndex = (currentIndex + 1) % order.length;
    setTheme(order[nextIndex]);
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
