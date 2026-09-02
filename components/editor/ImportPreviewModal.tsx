'use client';

import React, { useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

interface ImportPreviewModalProps {
  open: boolean;
  tourName: string;
  totalScenes: number;
  equirectCount: number;
  cubeCount: number;
  hotspotCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ImportPreviewModal({
  open,
  tourName,
  totalScenes,
  equirectCount,
  cubeCount,
  hotspotCount,
  onConfirm,
  onCancel,
}: ImportPreviewModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const importable = equirectCount;
  const dropped = cubeCount;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-preview-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-md mx-4 rounded-xl border border-[#27272A] bg-[#0c0c0f] shadow-2xl">
        <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-[#27272A]">
          <div>
            <h2
              id="import-preview-title"
              className="text-sm font-mono font-bold text-white"
            >
              Import preview
            </h2>
            <p className="text-[10px] font-mono text-[#71717A] mt-1">
              {tourName}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="p-1 rounded text-[#71717A] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3 text-xs font-mono text-[#A1A1AA]">
          <p>
            Found <span className="text-white font-bold">{totalScenes}</span> scene(s) and{' '}
            <span className="text-white font-bold">{hotspotCount}</span> hotspot(s).
          </p>
          <div className="rounded-lg border border-[#27272A] bg-[#18181B] p-3 space-y-2">
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                <span className="font-bold">{importable}</span> equirectangular scene(s) will be imported.
              </span>
            </div>
            {dropped > 0 && (
              <div className="flex items-center gap-2 text-amber-300">
                <XCircle className="w-4 h-4" />
                <span>
                  <span className="font-bold">{dropped}</span> cube-tile scene(s) will be skipped (not supported).
                </span>
              </div>
            )}
          </div>
          {importable === 0 && (
            <p className="text-[10px] text-rose-300">
              No importable scenes found. The tour only contains cube-format panoramas.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#27272A]">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg border border-[#27272A] text-xs font-mono text-[#A1A1AA] hover:text-white"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={importable === 0}
            className="px-3 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34b876] text-black text-xs font-bold font-mono disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Import {importable} scene{importable === 1 ? '' : 's'}
          </button>
        </div>
      </div>
    </div>
  );
}