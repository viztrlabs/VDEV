'use client';

/**
 * Alignment Panel Component
 *
 * Main shell for Alignment Mode. Integrates SplitViewport, AlignmentControls,
 * and LandmarkManager into a cohesive alignment workflow.
 *
 * Accepts onAlignmentSave callback to sync alignment data back to TourRoom
 * for persistence through the existing save path.
 */

import React from 'react';
import SplitViewport from './SplitViewport';
import AlignmentControls from './AlignmentControls';
import LandmarkManager from './LandmarkManager';
import { useEngineStore } from '@/lib/editor/engineStore';
import { Save } from 'lucide-react';

interface AlignmentPanelProps {
  projectId?: string;
  experienceId?: string;
  onAlignmentSave?: (alignment: import('@/lib/3d/bridge/types').SpatialAlignment, markers: import('@/lib/3d/bridge/types').AlignmentMarker[]) => void;
}

export default function AlignmentPanel({ projectId, experienceId, onAlignmentSave }: AlignmentPanelProps) {
  const spatialAlignment = useEngineStore((s) => s.spatialAlignment);
  const alignmentMarkers = useEngineStore((s) => s.alignmentMarkers);
  const alignmentDirty = useEngineStore((s) => s.alignmentDirty);
  const clearAlignmentDirty = useEngineStore((s) => s.clearAlignmentDirty);

  const handleSaveAlignment = () => {
    if (onAlignmentSave) {
      onAlignmentSave(spatialAlignment, alignmentMarkers);
      clearAlignmentDirty();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#27272A] bg-[#0c0c0f]">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[#E4E4E7] font-mono">Alignment Mode</h3>
          {alignmentDirty && (
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-mono">
              Unsaved
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#71717A] font-mono">{alignmentMarkers.length} markers</span>
          {onAlignmentSave && (
            <button
              onClick={handleSaveAlignment}
              className="flex items-center gap-1 px-2 py-1 rounded bg-[#3ECF8E]/10 text-[#3ECF8E] text-xs font-mono border border-[#3ECF8E]/30 hover:bg-[#3ECF8E]/20"
            >
              <Save size={12} />
              Save Alignment
            </button>
          )}
        </div>
      </div>

      {/* Main content: split view + controls sidebar */}
      <div className="flex-1 flex min-h-0">
        {/* Split viewport - takes most space */}
        <div className="flex-1 min-w-0">
          <SplitViewport active={true} projectId={projectId} />
        </div>

        {/* Right sidebar: controls + landmarks */}
        <div className="w-72 border-l border-[#27272A] overflow-y-auto flex flex-col">
          <AlignmentControls />
          <div className="flex-1">
            <LandmarkManager />
          </div>
        </div>
      </div>
    </div>
  );
}
