'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastNotification() {
  const { toast, hideToast } = useAppStore();

  if (!toast) return null;

  return (
    <div
      id="global-toast-notification"
      className="fixed bottom-6 right-6 z-[1000] max-w-sm w-full px-5 py-3 rounded-full bg-surface text-on-surface border border-surface-variant shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <div className="flex items-center gap-2.5">
        {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />}
        {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-error shrink-0" />}
        {toast.type === 'info' && <Info className="w-4 h-4 text-primary shrink-0" />}
        <span className="text-xs text-on-surface font-medium">{toast.message}</span>
      </div>

      <button
        onClick={hideToast}
        className="p-1.5 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors cursor-pointer shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
