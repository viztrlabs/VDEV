'use client';

/**
 * Split Viewport Component
 *
 * Renders Marzipano panorama and PlayCanvas/Splat 3D views side-by-side
 * for alignment calibration. Each side has its own container ref for
 * engine mounting. Camera synchronization is handled via useAlignmentSync
 * and useCameraHandoff.
 *
 * Sync direction defaults to 'off' — the user explicitly enables it.
 */

import React, { useRef, useState, useCallback } from 'react';
import { useAlignmentSync, SyncDirection } from './useAlignmentSync';
import { useCameraHandoff } from './useCameraHandoff';
import { useEngineStore } from '@/lib/editor/engineStore';
import { Eye, EyeOff, ArrowRight, ArrowLeft, ArrowLeftRight, Loader2 } from 'lucide-react';

interface SplitViewportProps {
  active?: boolean;
  projectId?: string;
}

export default function SplitViewport({ active = true, projectId }: SplitViewportProps) {
  const panoContainerRef = useRef<HTMLDivElement>(null);
  const splatContainerRef = useRef<HTMLDivElement>(null);

  const spatialAlignment = useEngineStore((s) => s.spatialAlignment);
  const alignmentMarkers = useEngineStore((s) => s.alignmentMarkers);

  const [syncDirection, setSyncDirection] = useState<SyncDirection>('off');
  const [panoReady, setPanoReady] = useState(false);
  const [splatReady, setSplatReady] = useState(false);

  const { scheduleUpdate } = useAlignmentSync(active && syncDirection !== 'off', syncDirection);
  const { convertMarzipanoToSplat, convertSplatToMarzipano, isOwnOrigin, generateOriginId } =
    useCameraHandoff(spatialAlignment);

  const syncOptions: { value: SyncDirection; label: string; icon: React.ReactNode }[] = [
    { value: 'off', label: 'Off', icon: <EyeOff size={12} /> },
    { value: 'panorama-to-splat', label: 'Pano → Splat', icon: <ArrowRight size={12} /> },
    { value: 'splat-to-panorama', label: 'Splat → Pano', icon: <ArrowLeft size={12} /> },
    { value: 'bidirectional', label: 'Both', icon: <ArrowLeftRight size={12} /> },
  ];

  const handleSyncChange = useCallback((dir: SyncDirection) => {
    setSyncDirection(dir);
  }, []);

  if (!active) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0c0c0f] text-[#71717A] text-sm">
        Alignment mode inactive
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sync direction toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#27272A] bg-[#0c0c0f]">
        <span className="text-xs text-[#A1A1AA] font-mono">Camera Sync:</span>
        <div className="flex gap-1">
          {syncOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSyncChange(opt.value)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-mono ${
                syncDirection === opt.value
                  ? 'bg-[#3ECF8E] text-black font-bold'
                  : 'bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA]'
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-[#71717A]">
          <span>Markers: {alignmentMarkers.length}</span>
        </div>
      </div>

      {/* Split view panels */}
      <div className="flex-1 flex min-h-0">
        {/* Panorama panel */}
        <div className="flex-1 min-w-0 relative border-r border-[#27272A]">
          <div className="absolute top-2 left-2 z-10 px-2 py-1 rounded bg-black/60 text-xs text-[#A1A1AA] font-mono">
            Panorama View
          </div>
          <div
            ref={panoContainerRef}
            className="w-full h-full bg-[#0a0a0a]"
            data-engine="marzipano"
          />
          {!panoReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
              <div className="flex items-center gap-2 text-[#71717A] text-sm">
                <Loader2 size={16} className="animate-spin" />
                Loading panorama...
              </div>
            </div>
          )}
        </div>

        {/* Splat/3D panel */}
        <div className="flex-1 min-w-0 relative">
          <div className="absolute top-2 left-2 z-10 px-2 py-1 rounded bg-black/60 text-xs text-[#A1A1AA] font-mono">
            3D Splat View
          </div>
          <div
            ref={splatContainerRef}
            className="w-full h-full bg-[#0a0a0a]"
            data-engine="playcanvas"
          />
          {!splatReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
              <div className="flex items-center gap-2 text-[#71717A] text-sm">
                <Loader2 size={16} className="animate-spin" />
                Loading 3D scene...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
