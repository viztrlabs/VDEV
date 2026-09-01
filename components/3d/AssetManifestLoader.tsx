'use client';

/**
 * AssetManifestLoader — client component that loads and validates an
 * asset manifest, then reports critical-assets loaded status to the
 * caller via render prop or children-as-function.
 *
 * Used by the Viewer Dashboard (Phase 3) to preflight an experience
 * before handing off to the engine.
 *
 * Usage:
 *   <AssetManifestLoader url="/experiences/villa/manifest.json">
 *     {({ manifest, isLoading, error }) => ...}
 *   </AssetManifestLoader>
 */

import { useEffect, useState } from 'react';
import { validateManifest, type AssetManifest } from '@/lib/3d/manifest';

export interface AssetManifestLoaderProps {
  url: string;
  children: (state: ManifestLoaderState) => React.ReactNode;
}

export interface ManifestLoaderState {
  manifest: AssetManifest | null;
  isLoading: boolean;
  error: string | null;
}

export function AssetManifestLoader({ url, children }: AssetManifestLoaderProps): React.ReactElement {
  const [state, setState] = useState<ManifestLoaderState>({
    manifest: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState({ manifest: null, isLoading: true, error: null });
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status} fetching manifest`);
        return r.json() as Promise<unknown>;
      })
      .then((raw) => {
        if (cancelled) return;
        const errors = validateManifest(raw);
        if (errors.length > 0) {
          setState({ manifest: null, isLoading: false, error: errors.join('; ') });
          return;
        }
        setState({ manifest: raw as AssetManifest, isLoading: false, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          manifest: null,
          isLoading: false,
          error: err instanceof Error ? err.message : 'manifest fetch failed',
        });
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return <>{children(state)}</>;
}
