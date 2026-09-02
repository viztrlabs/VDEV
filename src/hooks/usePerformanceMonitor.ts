'use client';
/**
 * usePerformanceMonitor — Phase 2C
 * React hook that wires the performance monitor into a component lifecycle
 * and reports a summary at unmount.
 */
import { useEffect, useRef } from 'react';
import { performanceMonitor } from '@/src/services/performance';

export function usePerformanceMonitor(componentName: string) {
  const startRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = performance.now();
    performanceMonitor.track('custom', 0, {
      unit: 'count',
      context: { event: 'mount', component: componentName },
    });
    return () => {
      const lifetime = performance.now() - startRef.current;
      performanceMonitor.track('custom', lifetime, {
        unit: 'ms',
        context: { event: 'unmount', component: componentName },
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentName]);
}

export default usePerformanceMonitor;
