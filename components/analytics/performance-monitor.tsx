'use client';

import { useEffect } from 'react';

type VitalPayload = {
  name: 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  id: string;
};

const REPORT_URL = '/api/analytics';
const SESSION_KEY = 'viztr_session_id';

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const id = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  sessionStorage.setItem(SESSION_KEY, id);
  return id;
}

function sendVitals(items: VitalPayload[]) {
  if (typeof navigator === 'undefined') return;
  const body = items.map((item) => ({
    kind: 'perf',
    sessionId: getSessionId(),
    ts: Date.now(),
    metric: item.name,
    value: item.value,
    rating: item.rating,
    id: item.id,
  }));

  const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(REPORT_URL, blob);
  } else {
    fetch(REPORT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: body }),
      keepalive: true,
    });
  }
}

function ratingFor(name: string, value: number): VitalPayload['rating'] {
  const thresholds: Record<string, [number, number]> = {
    LCP: [2500, 4000],
    FID: [100, 300],
    CLS: [0.1, 0.25],
    FCP: [1800, 3000],
    TTFB: [800, 1800],
  };
  const [good, poor] = thresholds[name] || [0, Infinity];
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

export function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const entries: VitalPayload[] = [];

    const trySend = () => {
      if (!entries.length) return;
      sendVitals(entries);
      entries.length = 0;
    };

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          entries.push({
            name: 'LCP',
            value: entry.startTime,
            rating: ratingFor('LCP', entry.startTime),
            id: entry.name || entry.entryType,
          });
        }
        if (entry.entryType === 'first-input') {
          entries.push({
            name: 'FID',
            value: (entry as any).processingStart - entry.startTime,
            rating: ratingFor('FID', (entry as any).processingStart - entry.startTime),
            id: entry.name || entry.entryType,
          });
        }
        if (entry.entryType === 'layout-shift') {
          const value = (entry as any).value ?? 0;
          entries.push({
            name: 'CLS',
            value,
            rating: ratingFor('CLS', value),
            id: entry.name || entry.entryType,
          });
        }
      }
    });

    try {
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      observer.observe({ type: 'first-input', buffered: true });
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch {
      // ignore unsupported metrics
    }

    const onHidden = () => {
      trySend();
    };
    window.addEventListener('visibilitychange', onHidden);

    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find((e) => e.name === 'first-contentful-paint');
    if (fcp) {
      entries.push({
        name: 'FCP',
        value: fcp.startTime,
        rating: ratingFor('FCP', fcp.startTime),
        id: fcp.name,
      });
    }

    const navEntries = performance.getEntriesByType('navigation');
    const nav = navEntries[0];
    if (nav) {
      entries.push({
        name: 'TTFB',
        value: nav.responseStart,
        rating: ratingFor('TTFB', nav.responseStart),
        id: 'navigation',
      });
      trySend();
    }

    return () => {
      window.removeEventListener('visibilitychange', onHidden);
      try {
        observer.disconnect();
      } catch {
        // ignore
      }
    };
  }, []);

  return null;
}
