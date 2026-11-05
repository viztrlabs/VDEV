const STORAGE_KEY = 'viztr_editor_saved';

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
