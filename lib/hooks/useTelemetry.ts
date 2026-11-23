'use client';

import { useCallback, useRef, useEffect } from 'react';

interface TelemetryEvent {
  event: string;
  timestamp: number;
  metadata?: Record<string, any>;
  userId?: string;
  sessionId: string;
}

interface UseTelemetryOptions {
  endpoint?: string;
  batchSize?: number;
  flushInterval?: number;
  enabled?: boolean;
}

const DEFAULT_OPTIONS: Required<UseTelemetryOptions> = {
  endpoint: '/api/telemetry',
  batchSize: 10,
  flushInterval: 5000,
  enabled: true,
};

export function useTelemetry(options: UseTelemetryOptions = {}) {
  const optionsRef = useRef({ ...DEFAULT_OPTIONS, ...options });
  const eventQueueRef = useRef<TelemetryEvent[]>([]);
  const sessionIdRef = useRef<string>(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFlushingRef = useRef(false);

  const sessionId = sessionIdRef.current;

  const flush = useCallback(async () => {
    if (isFlushingRef.current || eventQueueRef.current.length === 0) return;
    
    if (!optionsRef.current.enabled) return;

    isFlushingRef.current = true;
    const eventsToSend = [...eventQueueRef.current];
    eventQueueRef.current = [];

    try {
      const response = await fetch(optionsRef.current.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          events: eventsToSend,
        }),
      });

      if (!response.ok) {
        throw new Error(`Telemetry flush failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Telemetry flush failed:', error);
      eventQueueRef.current.unshift(...eventsToSend);
    } finally {
      isFlushingRef.current = false;
    }
  }, []);

  const track = useCallback((event: string, metadata?: Record<string, any>) => {
    if (!optionsRef.current.enabled) return;

    const eventData: TelemetryEvent = {
      event,
      timestamp: Date.now(),
      metadata,
      sessionId,
    };

    eventQueueRef.current.push(eventData);

    if (eventQueueRef.current.length >= (optionsRef.current.batchSize || 10)) {
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
      flush();
    } else if (!flushTimeoutRef.current) {
      flushTimeoutRef.current = setTimeout(() => {
        flushTimeoutRef.current = null;
        flush();
      }, optionsRef.current.flushInterval || 5000);
    }
  }, []);

  const trackPageView = useCallback((pageName: string, metadata?: Record<string, any>) => {
    track('page_view', { page: pageName, ...metadata });
  }, []);

  const trackClick = useCallback((element: string, metadata?: Record<string, any>) => {
    track('click', { element, ...metadata });
  }, []);

  const trackFormSubmit = useCallback((formName: string, metadata?: Record<string, any>) => {
    track('form_submit', { form: formName, ...metadata });
  }, []);

  const trackError = useCallback((error: Error, context?: string) => {
    track('error', { 
      message: error.message, 
      stack: error.stack,
      context,
    });
  }, []);

  const trackPerformance = useCallback((metric: string, value: number, unit: string = 'ms') => {
    track('performance', { metric, value, unit });
  }, []);

  useEffect(() => {
    return () => {
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
      flush();
    };
  }, [flush]);

  return {
    track,
    trackPageView,
    trackClick,
    trackFormSubmit,
    trackError,
    trackPerformance,
    flush,
  };
}

export function usePageTelemetry(pageName: string) {
  const telemetry = useTelemetry();
  
  useEffect(() => {
    telemetry.trackPageView(pageName);
  }, [pageName, telemetry]);

  return telemetry;
}

export function useClickTelemetry(elementName: string, metadata?: Record<string, any>) {
  const telemetry = useTelemetry();
  
  return useCallback(() => {
    telemetry.trackClick(elementName, metadata);
  }, [telemetry, elementName, metadata]);
}

export function useFormTelemetry(formName: string) {
  const telemetry = useTelemetry();
  
  return useCallback((metadata?: Record<string, any>) => {
    telemetry.trackFormSubmit(formName, metadata);
  }, [telemetry, formName]);
}

export function useErrorTelemetry() {
  const telemetry = useTelemetry();
  
  return useCallback((error: Error, context?: string) => {
    telemetry.trackError(error, context);
  }, [telemetry]);
}

export function usePerformanceTelemetry() {
  const telemetry = useTelemetry();
  
  return useCallback((metric: string, value: number, unit?: string) => {
    telemetry.trackPerformance(metric, value, unit);
  }, [telemetry]);
}