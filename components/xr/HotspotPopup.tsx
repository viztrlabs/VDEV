'use client';

/**
 * HotspotPopup — typed popup for info / metadata / media hotspots.
 * Extracted from the public viewer page so the builder preview can reuse it.
 */
import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { ManifestHotspot } from '@/lib/tourManifest';

interface HotspotPopupProps {
  hotspot: ManifestHotspot;
  onClose: () => void;
}

export function HotspotPopup({ hotspot, onClose }: HotspotPopupProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-[min(92vw,420px)] bg-[#09090B]/95 backdrop-blur rounded-xl border border-[#27272A] shadow-2xl overflow-hidden max-h-[70vh] flex flex-col">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#27272A]">
        <div className="text-xs font-mono font-bold text-white truncate">{hotspot.title}</div>
        <button onClick={onClose} className="text-[#71717A] hover:text-white text-xs px-1 cursor-pointer" aria-label="Close popup">
          ✕
        </button>
      </div>
      <div className="overflow-y-auto p-4 space-y-3">
        {hotspot.description && (
          <p className="text-xs text-[#A1A1AA] whitespace-pre-wrap">{hotspot.description}</p>
        )}
        {!!hotspot.images?.length && (
          <div className={`grid gap-2 ${hotspot.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {hotspot.images.map((src, i) => (
              <button
                key={src + i}
                onClick={() => window.open(src, '_blank', 'noopener,noreferrer')}
                className="block aspect-video w-full rounded-lg overflow-hidden border border-[#27272A] cursor-pointer"
                aria-label={`Open photo ${i + 1} in new tab`}
              >
                <img
                  src={src}
                  alt={`${hotspot.title} photo ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </button>
            ))}
          </div>
        )}
        {hotspot.externalUrl && (
          <a
            href={hotspot.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3ECF8E] text-black text-xs font-mono font-bold"
          >
            {hotspot.type === 'link' ? 'Open Link' : 'Learn more'} <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
