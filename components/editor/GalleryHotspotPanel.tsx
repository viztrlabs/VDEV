'use client';

import React, { useEffect, useState } from 'react';
import { Image, X, Check } from 'lucide-react';

interface GalleryHotspotPanelProps {
  open: boolean;
  onClose: () => void;
  onSelectMedia: (url: string, title?: string) => void;
  onSelectMediaMulti?: (urls: string[]) => void;
  mediaAssets: { name: string; url: string }[];
  onRefreshMedia: () => void;
  multiple?: boolean;
}

export function GalleryHotspotPanel({
  open,
  onClose,
  onSelectMedia,
  onSelectMediaMulti,
  mediaAssets,
  onRefreshMedia,
  multiple = false,
}: GalleryHotspotPanelProps) {
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

  useEffect(() => {
    if (open) setSelectedUrls([]);
  }, [open]);

  if (!open) return null;

  const toggle = (url: string) => {
    setSelectedUrls((prev) =>
      multiple
        ? prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
        : [url],
    );
  };

  const confirm = () => {
    if (selectedUrls.length === 0) return;
    if (multiple) {
      if (onSelectMediaMulti) onSelectMediaMulti(selectedUrls);
    } else {
      onSelectMedia(selectedUrls[0]);
    }
    onClose();
  };

  const allSelected = mediaAssets.length > 0 && selectedUrls.length === mediaAssets.length;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#09090B] border border-[#27272A] rounded-lg w-[480px] max-h-[70vh] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#27272A]">
          <h2 className="text-sm font-mono font-bold text-white">
            {multiple ? 'Select Gallery Images' : 'Select Gallery Image'}
          </h2>
          <button onClick={onClose} className="text-[#71717A] hover:text-white text-xs">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 gap-2 max-h-[50vh]">
          {mediaAssets.length === 0 ? (
            <div className="col-span-3 text-center py-8">
              <Image className="w-8 h-8 text-[#71717A] mx-auto mb-2" />
              <p className="text-xs font-mono text-[#71717A]">No media assets found</p>
              <button
                onClick={onRefreshMedia}
                className="mt-2 px-3 py-1.5 rounded bg-[#18181B] border border-[#27272A] text-xs font-mono text-[#A1A1AA] hover:text-white"
              >
                Refresh
              </button>
            </div>
          ) : (
            mediaAssets.map((asset) => {
              const selected = selectedUrls.includes(asset.url);
              return (
                <button
                  key={asset.url}
                  onClick={() => toggle(asset.url)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    selected
                      ? 'border-[#3ECF8E]'
                      : 'border-transparent hover:border-[#27272A]'
                  }`}
                >
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                  {selected && (
                    <div className="absolute top-1 right-1">
                      <Check className="w-4 h-4 text-[#3ECF8E]" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-[#27272A]">
          {multiple && mediaAssets.length > 0 && (
            <button
              onClick={() => setSelectedUrls(allSelected ? [] : mediaAssets.map((a) => a.url))}
              className="px-2 py-1 rounded text-[10px] font-mono text-[#A1A1AA] hover:text-white"
            >
              {allSelected ? 'Clear' : 'Select all'}
            </button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-[#18181B] border border-[#27272A] text-xs font-mono text-[#A1A1AA] hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={confirm}
              disabled={selectedUrls.length === 0}
              className="px-3 py-1.5 rounded bg-[#3ECF8E] text-black text-xs font-mono font-bold disabled:opacity-50"
            >
              {multiple ? `Add (${selectedUrls.length})` : 'Select'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}