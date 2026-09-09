'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { engineBridge } from './engine-bridge';
import {
  EngineCommand,
  EngineEvent,
  EngineType,
  TelemetryMetrics,
} from './types';

/**
 * Hook to dispatch typed commands from any React UI component to the active engine.
 */
export function useEngineCommand() {
  const dispatch = useCallback(async (command: EngineCommand): Promise<boolean> => {
    return engineBridge.dispatch(command);
  }, []);

  return { dispatch };
}

/**
 * Hook to subscribe to typed engine events with automatic unsubscription on unmount.
 */
export function useEngineEvent<T extends EngineEvent['type']>(
  type: T,
  handler: (event: Extract<EngineEvent, { type: T }>) => void,
  deps: React.DependencyList = []
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsub = engineBridge.on(type, (event) => {
      handlerRef.current(event as any);
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, ...deps]);
}

/**
 * Hook to poll or read telemetry metrics for HUD without React re-render thrashing.
 */
export function useEngineTelemetry(pollingIntervalMs = 500): TelemetryMetrics {
  const [metrics, setMetrics] = useState<TelemetryMetrics>(() =>
    engineBridge.getLatestTelemetry()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(engineBridge.getLatestTelemetry());
    }, pollingIntervalMs);

    return () => clearInterval(interval);
  }, [pollingIntervalMs]);

  return metrics;
}

/**
 * Hook to monitor the active engine type.
 */
export function useActiveEngineType(): EngineType | null {
  const [engineType, setEngineType] = useState<EngineType | null>(() =>
    engineBridge.getActiveEngineType()
  );

  useEffect(() => {
    const unsub = engineBridge.on('ENGINE_READY', (evt) => {
      setEngineType(evt.payload.engine);
    });

    return () => unsub();
  }, []);

  return engineType;
}
