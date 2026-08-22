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
      className="fixed bottom-6 right-6 z-[1000] max-w-sm w-full p-3 rounded-lg bg-[#18181B] text-[#FAFAFA] border border-[#27272A] shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <div className="flex items-center gap-2.5">
        {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#3ECF8E] shrink-0" />}
        {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
        {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
        <span className="text-xs font-mono text-[#FAFAFA]">{toast.message}</span>
      </div>

      <button
        onClick={hideToast}
        className="p-1 rounded text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A] transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
