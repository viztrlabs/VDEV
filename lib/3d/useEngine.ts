'use client';

/**
 * React hook for the engine abstraction. Returns the current engine
 * descriptor. If an explicit id is passed, returns that engine's descriptor
 * without consulting the default.
 *
 * Note: the engine is selected at module load and is NOT reactive. If you
 * need dynamic engine switching, lift the selection to component state and
 * pass the id explicitly.
 */

import { getDefaultEngine, getEngine, type EngineDescriptor, type EngineId } from './engine';

export function useEngine(id?: EngineId): EngineDescriptor {
  // getDefaultEngine() reads from process.env at module init, so calling it
  // here is safe to run on every render — it just re-reads the same value.
  const resolved = id ?? getDefaultEngine();
  return getEngine(resolved);
}
