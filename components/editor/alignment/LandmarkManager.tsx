'use client';

/**
 * Landmark Manager Component
 *
 * Manages correspondence points for alignment calibration.
 * - List of placed landmarks with labels and delete button
 * - Add landmark button (enters placement mode)
 * - Auto-calibrate button (calls computePoseFromCorrespondences)
 * - Quality indicator based on count and spread
 * - Residual error display
 */

import React, { useState, useCallback } from 'react';
import { useEngineStore } from '@/lib/editor/engineStore';
import {
  computePoseFromCorrespondences,
  alignmentResidualAngularError,
} from '@/lib/3d/bridge/spatial';
import type { AlignmentMarker } from '@/lib/3d/bridge/types';
import { Plus, Trash2, Crosshair, AlertTriangle, CheckCircle } from 'lucide-react';

function getQualityInfo(count: number): { label: string; color: string; icon: React.ReactNode } {
  if (count < 4) return { label: 'Insufficient — need at least 4', color: 'text-red-400', icon: <AlertTriangle size={12} /> };
  if (count <= 5) return { label: 'Minimum — consider adding more', color: 'text-amber-400', icon: <AlertTriangle size={12} /> };
  return { label: 'Good calibration', color: 'text-emerald-400', icon: <CheckCircle size={12} /> };
}

export default function LandmarkManager() {
  const alignmentMarkers = useEngineStore((s) => s.alignmentMarkers);
  const spatialAlignment = useEngineStore((s) => s.spatialAlignment);
  const addAlignmentMarker = useEngineStore((s) => s.addAlignmentMarker);
  const removeAlignmentMarker = useEngineStore((s) => s.removeAlignmentMarker);
  const setSpatialAlignment = useEngineStore((s) => s.setSpatialAlignment);

  const [isPlacing, setIsPlacing] = useState(false);
  const [calibrationStatus, setCalibrationStatus] = useState<
    'idle' | 'solving' | 'solved' | 'invalid'
  >('idle');
  const [residualError, setResidualError] = useState<number | null>(null);

  const quality = getQualityInfo(alignmentMarkers.length);

  const handleAutoCalibrate = useCallback(() => {
    if (alignmentMarkers.length < 4) return;

    setCalibrationStatus('solving');

    // Use setTimeout to allow UI to update before heavy computation
    setTimeout(() => {
      const result = computePoseFromCorrespondences(alignmentMarkers);
      if (result) {
        setSpatialAlignment(result);
        const error = alignmentResidualAngularError(alignmentMarkers, result);
        setResidualError(error);
        setCalibrationStatus('solved');
      } else {
        setCalibrationStatus('invalid');
      }
    }, 50);
  }, [alignmentMarkers, setSpatialAlignment]);

  return (
    <div className="p-3">
      <h4 className="text-xs font-semibold text-[#E4E4E7] mb-3 font-mono">Landmarks</h4>

      {/* Quality indicator */}
      <div className={`flex items-center gap-1.5 text-xs mb-3 ${quality.color}`}>
        {quality.icon}
        <span className="font-mono">{quality.label}</span>
      </div>

      {/* Add landmark button */}
      <button
        onClick={() => setIsPlacing(!isPlacing)}
        className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs font-mono mb-3 ${
          isPlacing
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            : 'bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] border border-[#27272A]'
        }`}
      >
        <Crosshair size={12} />
        {isPlacing ? 'Click panorama then splat...' : 'Add Landmark'}
      </button>

      {/* Landmark list */}
      <div className="space-y-1.5 mb-3 max-h-40 overflow-y-auto">
        {alignmentMarkers.length === 0 && (
          <div className="text-xs text-[#71717A] text-center py-2">
            No landmarks placed yet
          </div>
        )}
        {alignmentMarkers.map((marker, idx) => (
          <div
            key={marker.id}
            className="flex items-center gap-2 px-2 py-1.5 rounded bg-[#18181B] border border-[#27272A]"
          >
            <span className="text-[10px] text-[#71717A] font-mono w-4">#{idx + 1}</span>
            <span className="text-xs text-[#A1A1AA] font-mono flex-1 truncate">
              {marker.label || `${marker.yaw.toFixed(1)}° / ${marker.pitch.toFixed(1)}°`}
            </span>
            <button
              onClick={() => removeAlignmentMarker(marker.id)}
              className="text-[#71717A] hover:text-red-400"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Auto-calibrate button */}
      <button
        onClick={handleAutoCalibrate}
        disabled={alignmentMarkers.length < 4 || calibrationStatus === 'solving'}
        className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs font-mono ${
          alignmentMarkers.length >= 4
            ? 'bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/30 hover:bg-[#3ECF8E]/20'
            : 'bg-[#18181B] text-[#52525B] border border-[#27272A] cursor-not-allowed'
        }`}
      >
        {calibrationStatus === 'solving' ? (
          <>Solving...</>
        ) : (
          <>
            <Crosshair size={12} />
            Auto-calibrate
          </>
        )}
      </button>

      {/* Calibration result */}
      {calibrationStatus === 'solved' && residualError !== null && (
        <div className="mt-2 p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
          <div className="text-[10px] text-emerald-400 font-mono">
            Auto-calibrate — Initial Estimate
          </div>
          <div className="text-xs text-[#A1A1AA] font-mono mt-1">
            Residual: {residualError.toFixed(2)}°
          </div>
        </div>
      )}

      {calibrationStatus === 'invalid' && (
        <div className="mt-2 p-2 rounded bg-red-500/10 border border-red-500/20">
          <div className="text-[10px] text-red-400 font-mono">
            Calibration failed — add landmarks with more spatial spread
          </div>
        </div>
      )}

      {/* Instructions */}
      {isPlacing && (
        <div className="mt-2 text-[10px] text-[#71717A] font-mono leading-relaxed">
          1. Click a feature in the panorama view (wall, door, window)
          <br />
          2. Click the same feature in the 3D splat view
          <br />
          3. Repeat for 4+ well-spread landmarks
        </div>
      )}
    </div>
  );
}
