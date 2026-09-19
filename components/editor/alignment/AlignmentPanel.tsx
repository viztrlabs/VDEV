'use client';

/**
 * Alignment Panel Component
 *
 * Main shell for Alignment Mode. Integrates SplitViewport, AlignmentControls,
 * and LandmarkManager into a cohesive alignment workflow.
 */

import React, { useState } from 'react';
import SplitViewport from './SplitViewport';
import AlignmentControls from './AlignmentControls';
import LandmarkManager from './LandmarkManager';
import { useEngineStore } from '@/lib/editor/engineStore';

interface AlignmentPanelProps {
  projectId?: string;
  experienceId?: string;
}

export default function AlignmentPanel({ projectId, experienceId }: AlignmentPanelProps) {
  const spatialAlignment = useEngineStore((s) => s.spatialAlignment);
  const alignmentMarkers = useEngineStore((s) => s.alignmentMarkers);
  const alignmentDirty = useEngineStore((s) => s.alignmentDirty);

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
        <div className="flex items-center gap-2 text-xs text-[#71717A] font-mono">
          <span>{alignmentMarkers.length} markers</span>
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
