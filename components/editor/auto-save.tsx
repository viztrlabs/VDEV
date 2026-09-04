'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

type AutoSaveOptions = {
  delay?: number;
  storageKey?: string;
  onSave?: (data: any) => Promise<void> | void;
  enabled?: boolean;
};

type UseAutoSaveResult = {
  data: any;
  setData: React.Dispatch<React.SetStateAction<any>>;
  saving: boolean;
  lastSaved: Date | null;
  error: string | null;
};

export function useAutoSave(initialData: any, options: AutoSaveOptions = {}): UseAutoSaveResult {
  const delay = options.delay ?? 1200;
  const storageKey = options.storageKey;
  const onSave = options.onSave;
  const enabled = options.enabled ?? true;

  const [data, setData] = useState<any>(() => {
    if (typeof window === 'undefined') return initialData;
    if (!storageKey) return initialData;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return initialData;
  });
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const persistLocal = useCallback(
    (value: any) => {
      if (!storageKey || typeof window === 'undefined') return;
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(value));
      } catch {
        // ignore storage errors
      }
    },
    [storageKey],
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setSaving(true);
      setError(null);
      try {
        if (onSave) {
          await onSave(data);
        }
        persistLocal(data);
        if (mountedRef.current) {
          setLastSaved(new Date());
        }
      } catch (err: any) {
        if (mountedRef.current) {
          setError(err?.message || 'Auto-save failed');
        }
      } finally {
        if (mountedRef.current) {
          setSaving(false);
        }
      }
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [data, delay, enabled, onSave, persistLocal]);

  return {
    data,
    setData,
    saving,
    lastSaved,
    error,
  };
}
