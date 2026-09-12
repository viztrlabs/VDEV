/**
 * VizTR Feature Flag System
 * 
 * Enables gradual rollout of new features with zero regression.
 * Flags are loaded from environment variables with NEXT_PUBLIC_ prefix.
 */

import React from 'react';

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  defaultValue: boolean;
  envVar: string;
}

export const featureFlags: Record<string, FeatureFlag> = {
  'nav-v2': {
    key: 'nav-v2',
    name: 'Navigation v2',
    description: 'New brand hierarchy navigation with Creator, Solutions, and Pricing dropdowns',
    defaultValue: false,
    envVar: 'NEXT_PUBLIC_FLAG_NAV_V2',
  },
  'home-v2-hero': {
    key: 'home-v2-hero',
    name: 'Homepage v2 Hero',
    description: 'New hero section with animated scene transition',
    defaultValue: false,
    envVar: 'NEXT_PUBLIC_FLAG_HOME_V2_HERO',
  },
  'home-v2-anim': {
    key: 'home-v2-anim',
    name: 'Homepage v2 Animation',
    description: 'Animated scene transition (CAD → 3D → Render)',
    defaultValue: false,
    envVar: 'NEXT_PUBLIC_FLAG_HOME_V2_ANIM',
  },
  'home-v2-cta': {
    key: 'home-v2-cta',
    name: 'Homepage v2 CTA',
    description: 'Dual CTA buttons: Start a Project / Explore XR World',
    defaultValue: false,
    envVar: 'NEXT_PUBLIC_FLAG_HOME_V2_CTA',
  },
  'home-v2-studio': {
    key: 'home-v2-studio',
    name: 'Homepage v2 Studio Section',
    description: 'New VizTR Studio cards section',
    defaultValue: false,
    envVar: 'NEXT_PUBLIC_FLAG_HOME_V2_STUDIO',
  },
  'home-v2-xr': {
    key: 'home-v2-xr',
    name: 'Homepage v2 XR World Section',
    description: 'New XR World 6-card grid section',
    defaultValue: false,
    envVar: 'NEXT_PUBLIC_FLAG_HOME_V2_XR',
  },
  'home-v2-creator': {
    key: 'home-v2-creator',
    name: 'Homepage v2 Creator Section',
    description: 'New Creator showcase section',
    defaultValue: false,
    envVar: 'NEXT_PUBLIC_FLAG_HOME_V2_CREATOR',
  },
  'home-v2-solutions': {
    key: 'home-v2-solutions',
    name: 'Homepage v2 Solutions Section',
    description: 'New Solutions preview section',
    defaultValue: false,
    envVar: 'NEXT_PUBLIC_FLAG_HOME_V2_SOLUTIONS',
  },
  'saas-app': {
    key: 'saas-app',
    name: 'SaaS Application',
    description: 'New /app route group with role-based dashboards',
    defaultValue: true,
    envVar: 'NEXT_PUBLIC_FLAG_SAAS_APP',
  },
  'creator-v2': {
    key: 'creator-v2',
    name: 'Creator v2',
    description: 'New Creator hub and project workspace',
    defaultValue: false,
    envVar: 'NEXT_PUBLIC_FLAG_CREATOR_V2',
  },
  'pricing-v2': {
    key: 'pricing-v2',
    name: 'Pricing v2',
    description: 'New pricing page with tiered plans',
    defaultValue: false,
    envVar: 'NEXT_PUBLIC_FLAG_PRICING_V2',
  },
  'super-admin-consolidation': {
    key: 'super-admin-consolidation',
    name: 'Super Admin Dashboard Consolidation',
    description: 'Enable consolidated Super Admin dashboard at /admin/dashboard with lazy-loaded sections, repository-backed data layer, and typed API contracts',
    defaultValue: true,
    envVar: 'NEXT_PUBLIC_FLAG_SUPER_ADMIN_CONSOLIDATION',
  },
  'solutions-pages': {
    key: 'solutions-pages',
    name: 'Solutions Pages',
    description: 'New /solutions/* pages for architects, real estate, developers, interior designers, agencies',
    defaultValue: false,
    envVar: 'NEXT_PUBLIC_FLAG_SOLUTIONS_PAGES',
  },
};

/**
 * Check if a feature flag is enabled
 */
export function isEnabled(flagKey: string): boolean {
  const flag = featureFlags[flagKey];
  if (!flag) {
    console.warn(`Unknown feature flag: ${flagKey}`);
    return false;
  }

  if (typeof window === 'undefined') {
    return false;
  }

  const envValue = process.env[flag.envVar];
  if (envValue === undefined) {
    return flag.defaultValue;
  }

  return envValue === 'true' || envValue === '1';
}

/**
 * Get all feature flags and their current status (client-side only)
 */
export function getAllFlags(): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  Object.keys(featureFlags).forEach((key) => {
    result[key] = isEnabled(key);
  });
  return result;
}

/**
 * Server-side flag check (for use in server components / middleware)
 */
export function isEnabledServer(flagKey: string): boolean {
  const flag = featureFlags[flagKey];
  if (!flag) {
    return false;
  }

  const envValue = process.env[flag.envVar];
  if (envValue === undefined) {
    return flag.defaultValue;
  }

  return envValue === 'true' || envValue === '1';
}

/**
 * Get feature flags as headers for server-side rendering
 */
export function getFlagsHeader(): Record<string, string> {
  const flags = getAllFlags();
  return Object.fromEntries(
    Object.entries(flags).map(([key, value]) => [`x-flag-${key}`, String(value)])
  );
}

/**
 * React hook for feature flags
 */
export function useFeatureFlag(flagKey: string): boolean {
  const [enabled, setEnabled] = React.useState(isEnabled(flagKey));
  React.useEffect(() => {
    setEnabled(isEnabled(flagKey));
  }, [flagKey]);
  return enabled;
}

export const isFeatureEnabled = isEnabled;
