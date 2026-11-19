const STORAGE_KEY = 'viztr_editor_saved';
const API_URL = '/api/editor/sync';

export async function saveEditorSnapshot(snapshot: any): Promise<{ success: boolean; id?: string; version?: number; updatedAt?: string; error?: string }> {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(snapshot),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err?.error || 'Save failed' };
    }
    const data = await res.json();
    // Notify other tabs via localStorage event
    try {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
      window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEY,
        newValue: Date.now().toString(),
      }));
    } catch {}
    return {
      success: true,
      id: data.id,
      version: data.version,
      updatedAt: data.updatedAt,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Save failed' };
  }
}

export async function loadEditorSnapshot(): Promise<{ snapshot: any; version?: number; updatedAt?: string; cached?: boolean } | null> {
  try {
    const res = await fetch(API_URL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      snapshot: data.snapshot,
      version: data.version,
      updatedAt: data.updatedAt,
      cached: data.cached,
    };
  } catch {
    return null;
  }
}

export function notifyEditorSave() {
  try {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: Date.now().toString(),
    }));
  } catch {}
}

export function onEditorSave(callback: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback();
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
