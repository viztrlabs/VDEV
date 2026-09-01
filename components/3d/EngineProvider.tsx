'use client';

/**
 * EngineProvider — React context for the engine abstraction
 *
 * Wraps a portion of the tree with a chosen engine id. Children can read
 * the active engine via the `useActiveEngine` hook.
 *
 * Usage:
 *   <EngineProvider id="playcanvas">
 *     <PlayCanvasScene />
 *   </EngineProvider>
 *
 *   // somewhere in a child:
 *   const engine = useActiveEngine(); // returns the descriptor
 */

import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import { getEngine, type EngineDescriptor, type EngineId } from '@/lib/3d/engine';

const EngineContext = createContext<EngineDescriptor | null>(null);

export interface EngineProviderProps {
  /** Engine to use for this subtree. Defaults to `getDefaultEngine()`. */
  id?: EngineId;
  children: ReactNode;
}

export function EngineProvider({ id, children }: EngineProviderProps): React.ReactElement {
  const descriptor = useMemo(() => getEngine(id), [id]);
  return <EngineContext.Provider value={descriptor}>{children}</EngineContext.Provider>;
}

export function useActiveEngine(): EngineDescriptor {
  const ctx = useContext(EngineContext);
  if (!ctx) {
    // Outside a provider, fall back to the default. This keeps the hook
    // safe to call from any component.
    return getEngine();
  }
  return ctx;
}
