'use client';

/**
 * Alignment Controls Component
 *
 * Manual transform controls for alignment calibration.
 * Provides X/Y/Z translation, Yaw/Pitch/Roll rotation, and uniform scale.
 * All changes dispatch through EngineBridge via the engineStore.
 */

import React, { useCallback } from 'react';
import { useEngineStore } from '@/lib/editor/engineStore';
import { IDENTITY_ALIGNMENT } from '@/lib/3d/bridge/spatial';
import { eulerDegreesToQuaternion } from '@/lib/3d/bridge/spatial';
import type { SpatialAlignment, Vector3D } from '@/lib/3d/bridge/types';
import { RotateCcw, Save, X } from 'lucide-react';

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="w-6 text-[#71717A] font-mono">{label}</span>
      <input
        type="number"
        value={Number(value.toFixed(3))}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
        className="flex-1 bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-[#E4E4E7] font-mono focus:outline-none focus:border-[#3ECF8E]"
      />
    </label>
  );
}

export default function AlignmentControls() {
  const spatialAlignment = useEngineStore((s) => s.spatialAlignment);
  const alignmentMarkers = useEngineStore((s) => s.alignmentMarkers);
  const alignmentDirty = useEngineStore((s) => s.alignmentDirty);
  const setSpatialAlignment = useEngineStore((s) => s.setSpatialAlignment);
  const resetAlignment = useEngineStore((s) => s.resetAlignment);

  const { position, rotation, scale } = spatialAlignment;

  // Convert quaternion to euler degrees for display
  const euler = (() => {
    const n = rotation;
    const sinX = 2 * (n.w * n.x + n.y * n.z);
    const cosX = 1 - 2 * (n.x * n.x + n.y * n.y);
    const sinY = 2 * (n.w * n.y - n.z * n.x);
    const sinZ = 2 * (n.w * n.z + n.x * n.y);
    const cosZ = 1 - 2 * (n.y * n.y + n.z * n.z);
    return {
      x: Math.atan2(sinX, cosX) * (180 / Math.PI),
      y: Math.asin(Math.min(1, Math.max(-1, sinY))) * (180 / Math.PI),
      z: Math.atan2(sinZ, cosZ) * (180 / Math.PI),
    };
  })();

  const updatePosition = useCallback(
    (axis: keyof Vector3D, value: number) => {
      setSpatialAlignment({
        ...spatialAlignment,
        position: { ...position, [axis]: value },
      });
    },
    [spatialAlignment, position, setSpatialAlignment],
  );

  const updateRotation = useCallback(
    (axis: 'x' | 'y' | 'z', value: number) => {
      const newEuler = { x: euler.x, y: euler.y, z: euler.z, [axis]: value };
      const newRotation = eulerDegreesToQuaternion(newEuler.x, newEuler.y, newEuler.z);
      setSpatialAlignment({
        ...spatialAlignment,
        rotation: newRotation,
      });
    },
    [spatialAlignment, euler, setSpatialAlignment],
  );

  const updateScale = useCallback(
    (value: number) => {
      setSpatialAlignment({
        ...spatialAlignment,
        scale: Math.max(0.01, value),
      });
    },
    [spatialAlignment, setSpatialAlignment],
  );

  return (
    <div className="p-3 border-b border-[#27272A]">
      <h4 className="text-xs font-semibold text-[#E4E4E7] mb-3 font-mono">Transform</h4>

      {/* Translation */}
      <div className="space-y-1.5 mb-3">
        <div className="text-[10px] text-[#71717A] uppercase tracking-wider mb-1">Translation</div>
        <NumberInput label="X" value={position.x} onChange={(v) => updatePosition('x', v)} step={0.1} />
        <NumberInput label="Y" value={position.y} onChange={(v) => updatePosition('y', v)} step={0.1} />
        <NumberInput label="Z" value={position.z} onChange={(v) => updatePosition('z', v)} step={0.1} />
      </div>

      {/* Rotation */}
      <div className="space-y-1.5 mb-3">
        <div className="text-[10px] text-[#71717A] uppercase tracking-wider mb-1">Rotation (degrees)</div>
        <NumberInput label="Y" value={euler.y} onChange={(v) => updateRotation('y', v)} step={1} />
        <NumberInput label="P" value={euler.x} onChange={(v) => updateRotation('x', v)} step={1} />
        <NumberInput label="R" value={euler.z} onChange={(v) => updateRotation('z', v)} step={1} />
      </div>

      {/* Scale */}
      <div className="space-y-1.5 mb-3">
        <div className="text-[10px] text-[#71717A] uppercase tracking-wider mb-1">Scale</div>
        <NumberInput label="S" value={scale} onChange={updateScale} min={0.01} step={0.05} />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={resetAlignment}
          className="flex items-center gap-1 px-2 py-1.5 rounded bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] text-xs font-mono"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>

      {/* Status */}
      {alignmentDirty && (
        <div className="mt-2 text-[10px] text-amber-400 font-mono">Unsaved changes</div>
      )}
    </div>
  );
}
