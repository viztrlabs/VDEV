'use client';

/**
 * Engine Viewport Component
 *
 * Mounts the active 3D/XR engine into the DOM, manages the canvas lifecycle,
 * handles responsive viewport resize via ResizeObserver, and renders the HUD overlay
 * for telemetry, active transformation tools, and collaboration indicators.
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { engineBridge } from '@/lib/3d/bridge/engine-bridge';
import { useEngineStore } from '@/lib/editor/engineStore';
import { useEngineTelemetry } from '@/lib/3d/bridge/useEngineBridge';
import { ThreeEngineAdapter } from '@/lib/3d/bridge/adapters/ThreeEngineAdapter';
import { MarzipanoEngineAdapter } from '@/lib/3d/bridge/adapters/MarzipanoEngineAdapter';
import { SplatEngineAdapter } from '@/lib/3d/bridge/adapters/SplatEngineAdapter';
import { EngineType, ToolType } from '@/lib/3d/bridge/types';
import {
  MousePointer,
  Move,
  RotateCw,
  Maximize2,
  MapPin,
  Eye,
  Grid,
  RotateCcw,
  Save,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Activity,
} from 'lucide-react';

interface EngineViewportProps {
  engineType?: EngineType;
  className?: string;
  onReady?: () => void;
}

export function EngineViewport({
  engineType = 'three',
  className = '',
  onReady,
}: EngineViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store state
  const {
    activeTool,
    setActiveTool,
    gridVisible,
    setGridVisible,
    undoStack,
    redoStack,
    undo,
    redo,
    isDirty,
    isSaving,
    lastSavedAt,
    saveScene,
  } = useEngineStore();

  // Non-reactive high-speed telemetry
  const telemetry = useEngineTelemetry(500);

  // Initialize and mount adapter
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let adapter: any = null;

    const initEngine = async () => {
      try {
        setError(null);
        setIsReady(false);

        if (engineType === 'three') {
          adapter = new ThreeEngineAdapter();
        } else if (engineType === 'marzipano') {
          adapter = new MarzipanoEngineAdapter();
        } else {
          adapter = new SplatEngineAdapter();
        }

        await adapter.init({
          container: containerRef.current!,
          antialias: true,
          backgroundColor: '#09090b',
        });

        if (cancelled) {
          adapter.destroy();
          return;
        }

        engineBridge.attachAdapter(adapter);
        setIsReady(true);
        if (onReady) onReady();
      } catch (err: any) {
        if (!cancelled) {
          console.error('[EngineViewport] Init failed:', err);
          setError(err?.message || 'Failed to initialize 3D engine');
        }
      }
    };

    initEngine();

    // Resize handling
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (adapter && width > 0 && height > 0) {
          adapter.resize(width, height);
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      if (adapter) {
        engineBridge.detachAdapter();
        adapter.destroy();
      }
    };
  }, [engineType, onReady]);

const tools: { id: ToolType; label: string; icon: React.ReactNode }[] = [
     { id: 'select', label: 'Select (V)', icon: <MousePointer className="w-3.5 h-3.5" /> },
     { id: 'move', label: 'Move (W)', icon: <Move className="w-3.5 h-3.5" /> },
     { id: 'rotate', label: 'Rotate (E)', icon: <RotateCw className="w-3.5 h-3.5" /> },
     { id: 'scale', label: 'Scale (R)', icon: <Maximize2 className="w-3.5 h-3.5" /> },
     { id: 'hotspot', label: 'Hotspot (H)', icon: <MapPin className="w-3.5 h-3.5" /> },
   ];

  return (
    <div className={`relative w-full h-full bg-[#09090b] select-none overflow-hidden ${className}`}>
      {/* 3D Canvas Mount Point */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Loading Overlay */}
      {!isReady && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#09090b]/80 backdrop-blur-sm z-30">
          <Loader2 className="w-6 h-6 text-[#3ecf8e] animate-spin mb-2" />
          <p className="text-xs font-mono text-[#a1a1aa]">Initializing {engineType.toUpperCase()} engine…</p>
        </div>
      )}

{/* Error Overlay */}
       {error && (
         <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#09090b]/90 p-6 z-40">
           <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
           <h3 className="text-sm font-mono font-bold text-white mb-1">Engine Initialization Error</h3>
           <p className="text-xs font-mono text-rose-300 max-w-md text-center mb-4">{error}</p>
           <button
             onClick={() => {
               setError(null);
               setIsReady(false);
             }}
             className="px-4 py-2 rounded-lg bg-[#3ecf8e] text-black text-xs font-mono font-semibold hover:bg-[#34b27b] transition shadow-lg shadow-[#3ecf8e]/20"
           >
             ⟳ Retry Initialization
           </button>
         </div>
       )}

      {/* Top Floating HUD Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
        {/* Left: Engine & Telemetry Stats */}
        <div className="flex items-center gap-2 bg-[#121216]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#27272a] pointer-events-auto">
          <span className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-[#3ecf8e]">
            <span className="w-2 h-2 rounded-full bg-[#3ecf8e] animate-pulse" />
            {engineType.toUpperCase()}
          </span>
          <span className="text-[#3f3f46]">|</span>
          <span className="text-[11px] font-mono text-[#a1a1aa] flex items-center gap-1">
            <Activity className="w-3 h-3 text-[#71717a]" />
            {telemetry.fps} FPS
          </span>
          <span className="text-[10px] font-mono text-[#71717a]">
            {telemetry.triangles.toLocaleString()} tris
          </span>
          <span className="text-[10px] font-mono text-[#71717a]">
            {telemetry.drawCalls} calls
          </span>
        </div>

        {/* Right: Save & History Status */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Undo / Redo */}
          <div className="flex items-center bg-[#121216]/80 backdrop-blur-md rounded-lg border border-[#27272a] p-1 gap-1">
            <button
              onClick={undo}
              disabled={undoStack.length === 0}
              className={`p-1 rounded text-xs transition ${
                undoStack.length > 0
                  ? 'text-white hover:bg-[#27272a]'
                  : 'text-[#3f3f46] cursor-not-allowed'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={redo}
              disabled={redoStack.length === 0}
              className={`p-1 rounded text-xs transition ${
                redoStack.length > 0
                  ? 'text-white hover:bg-[#27272a]'
                  : 'text-[#3f3f46] cursor-not-allowed'
              }`}
              title="Redo (Ctrl+Y)"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Grid Toggle */}
          <button
            onClick={() => setGridVisible(!gridVisible)}
            className={`p-2 rounded-lg border text-xs transition flex items-center gap-1.5 ${
              gridVisible
                ? 'bg-[#121216]/80 text-[#3ecf8e] border-[#3ecf8e]/40'
                : 'bg-[#121216]/80 text-[#71717a] border-[#27272a] hover:text-white'
            }`}
            title="Toggle Grid"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          {/* Reset View */}
          <button
            onClick={() => engineBridge.dispatch({ type: 'RESET_VIEW' })}
            className="p-2 rounded-lg border border-[#27272a] bg-[#121216]/80 text-[#a1a1aa] hover:text-white text-xs transition"
            title="Reset Camera View"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Save Button */}
          <button
            onClick={() => saveScene()}
            disabled={isSaving || !isDirty}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition ${
              isSaving
                ? 'bg-[#121216] text-[#71717a] border-[#27272a]'
                : isDirty
                ? 'bg-[#3ecf8e] text-black border-[#3ecf8e] hover:bg-[#34b27b] shadow-lg shadow-[#3ecf8e]/20'
                : 'bg-[#121216]/80 text-[#a1a1aa] border-[#27272a]'
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving…</span>
              </>
            ) : isDirty ? (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save *</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3ecf8e]" />
                <span>Saved</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Floating Toolbar (Left Side) */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 bg-[#121216]/85 backdrop-blur-md p-1.5 rounded-xl border border-[#27272a] z-20 shadow-xl">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            title={tool.label}
            className={`p-2 rounded-lg text-xs transition flex items-center justify-center ${
              activeTool === tool.id
                ? 'bg-[#3ecf8e] text-black shadow-md shadow-[#3ecf8e]/25'
                : 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]'
            }`}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* Viewport Bottom Hint */}
      <div className="absolute bottom-3 left-3 text-[10px] font-mono text-[#52525b] pointer-events-none z-10">
        Left-drag to rotate • Wheel to zoom • Click entity to inspect
      </div>
    </div>
  );
}
