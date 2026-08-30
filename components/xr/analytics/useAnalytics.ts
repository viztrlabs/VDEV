'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AIRecommendation,
  AnalyticsEngine,
  AnalyticsEventType,
  createAnalytics,
  PerfSample,
} from './analyticsEngine';

/** React hook binding the AnalyticsEngine to a component lifecycle.
 *  Defaults to shipping events to the project's /api/analytics collector. */
export function useAnalytics(opts?: { endpoint?: string; sessionId?: string }) {
  const engineRef = useRef<AnalyticsEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = createAnalytics({
      endpoint: opts?.endpoint ?? '/api/analytics',
      sessionId: opts?.sessionId,
      flushIntervalMs: 5000,
    });
  }
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);

  const track = useCallback((type: AnalyticsEventType, properties?: Record<string, unknown>) => {
    engineRef.current?.track(type, properties);
  }, []);

  const recordPerf = useCallback((sample: PerfSample) => {
    engineRef.current?.recordPerf(sample);
  }, []);

  // refresh recommendations periodically from telemetry
  useEffect(() => {
    const t = setInterval(() => {
      setRecommendations(engineRef.current?.getRecommendations() ?? []);
    }, 4000);
    return () => {
      clearInterval(t);
      engineRef.current?.dispose();
    };
  }, []);

  const engine = useMemo(() => engineRef.current!, []);

  return { track, recordPerf, recommendations, engine };
}

export default useAnalytics;
