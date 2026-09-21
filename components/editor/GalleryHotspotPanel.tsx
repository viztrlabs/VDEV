'use client';

import React, { useState } from 'react';
import { Image, X, Check } from 'lucide-react';

interface GalleryHotspotPanelProps {
  open: boolean;
  onClose: () => void;
  onSelectMedia: (url: string, title?: string) => void;
  mediaAssets: { name: string; url: string }[];
  onRefreshMedia: () => void;
}

export function GalleryHotspotPanel({
  open,
  onClose,
  onSelectMedia,
  mediaAssets,
  onRefreshMedia,
}: GalleryHotspotPanelProps) {
  const [selectedUrl, setSelectedUrl] = useState<string>('');

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#09090B] border border-[#27272A] rounded-lg w-[480px] max-h-[70vh] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#27272A]">
          <h2 className="text-sm font-mono font-bold text-white">Select Gallery Image</h2>
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
            mediaAssets.map((asset) => (
              <button
                key={asset.url}
                onClick={() => setSelectedUrl(asset.url)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedUrl === asset.url
                    ? 'border-[#3ECF8E]'
                    : 'border-transparent hover:border-[#27272A]'
                }`}
              >
                <img
                  src={asset.url}
                  alt={asset.name}
                  className="w-full h-full object-cover"
                />
                {selectedUrl === asset.url && (
                  <div className="absolute top-1 right-1">
                    <Check className="w-4 h-4 text-[#3ECF8E]" />
                  </div>
                )}
              </button>
            ))
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[#27272A]">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-[#18181B] border border-[#27272A] text-xs font-mono text-[#A1A1AA] hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (selectedUrl) {
                onSelectMedia(selectedUrl);
                onClose();
              }
            }}
            disabled={!selectedUrl}
            className="px-3 py-1.5 rounded bg-[#3ECF8E] text-black text-xs font-mono font-bold disabled:opacity-50"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}
