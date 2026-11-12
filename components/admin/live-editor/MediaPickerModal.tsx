'use client';

import React, { useEffect, useState } from 'react';
import { X, Link as LinkIcon, ImageIcon } from 'lucide-react';
import { useCMSStore } from '@/lib/cms-store';

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  filter: 'image' | 'video' | 'all';
  onPick: (url: string) => void;
}

export default function MediaPickerModal({ open, onClose, filter, onPick }: MediaPickerModalProps) {
  const { mediaLibrary } = useCMSStore();
  const [urlInput, setUrlInput] = useState('');

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const items = mediaLibrary.filter(
    (item) => (filter === 'all' || item.type === filter) && item.url,
  );

  return (
    <div
      data-testid="media-picker-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Select media"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl bg-[#131314] border border-[#27272A] p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#3ECF8E]" />
            Select Media ({filter})
          </h3>
          <button onClick={onClose} aria-label="Close" className="text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste image or video URL..."
            className="flex-1 px-3 py-2 rounded-lg bg-[#18181B] border border-[#27272A] text-xs text-white placeholder:text-zinc-500"
          />
          <button
            onClick={() => {
              if (urlInput.trim()) onPick(urlInput.trim());
              setUrlInput('');
            }}
            className="px-3 py-2 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Use URL</span>
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-xs text-zinc-500 py-6 text-center">No {filter} items in the media library yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => onPick(item.url)}
                className="group rounded-xl overflow-hidden border border-[#27272A] hover:border-[#3ECF8E] bg-[#18181B] cursor-pointer text-left"
              >
                {item.type === 'image' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.name} className="w-full h-20 object-cover" />
                ) : (
                  <div className="w-full h-20 flex items-center justify-center bg-black/40 text-zinc-400 text-[10px] font-mono uppercase">
                    {item.format || 'video'}
                  </div>
                )}
                <div className="px-2 py-1.5 text-[11px] text-zinc-300 group-hover:text-white truncate">{item.name}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
