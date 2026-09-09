'use client';

import React from 'react';
import { isFeatureEnabled, FeatureFlag } from './feature-flags';

/**
 * Component wrapper for feature-gated rendering
 */
export function FeatureGate({
  flag,
  children,
  fallback = null,
}: {
  flag: string | FeatureFlag;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const flagKey = typeof flag === 'string' ? flag : flag.key;
  if (!isFeatureEnabled(flagKey)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
