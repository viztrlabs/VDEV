'use client';

/**
 * Engine Inspector Panel Component
 *
 * Provides property inspection and live mutation controls for the selected entity
 * or material in the 3D scene. Synchronizes changes bidirectionally between
 * the React UI and the core engine via the EngineStore and EngineBridge.
 *
 * Features:
 * - Input clamping (position ±10000, rotation ±360, scale 0.001–1000)
 * - 150ms debounce on transform dispatches
 * - 3-decimal display rounding
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useEngineStore } from '@/lib/editor/engineStore';
import { engineBridge } from '@/lib/3d/bridge/engine-bridge';
import {
  Box,
  Eye,
  EyeOff,
  Crosshair,
  Layers,
  Palette,
  Sliders,
  Sparkles,
} from 'lucide-react';

// --- Validation Constants ---
const POS_MIN = -10_000;
const POS_MAX = 10_000;
const ROT_MIN = -360;
const ROT_MAX = 360;
const SCALE_MIN = 0.001;
const SCALE_MAX = 1_000;
const DEBOUNCE_MS = 150;

/** Clamp a value between min and max, round to 3 decimals */
function clampRound(value: number, min: number, max: number): number {
  return Math.round(Math.max(min, Math.min(max, value)) * 1000) / 1000;
}

export function EngineInspectorPanel() {
  const {
    entities,
    materials,
    selectedEntityId,
    updateEntityTransform,
    setEntityVisibility,
    updateMaterial,
  } = useEngineStore();

  const selectedEntity = entities.find((e) => e.id === selectedEntityId);
  const selectedMaterial = selectedEntity?.materialId
    ? materials.find((m) => m.id === selectedEntity.materialId)
    : null;

  // Local draft states for inputs to prevent jitter during fast typing
  const [localPos, setLocalPos] = useState({ x: 0, y: 0, z: 0 });
  const [localRot, setLocalRot] = useState({ x: 0, y: 0, z: 0 });
  const [localScale, setLocalScale] = useState({ x: 1, y: 1, z: 1 });

  // Debounce timer refs
  const posTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scaleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (selectedEntity) {
      setLocalPos({
        x: clampRound(selectedEntity.position.x, POS_MIN, POS_MAX),
        y: clampRound(selectedEntity.position.y, POS_MIN, POS_MAX),
        z: clampRound(selectedEntity.position.z, POS_MIN, POS_MAX),
      });
      setLocalRot({
        x: clampRound((selectedEntity.rotation.x * 180) / Math.PI, ROT_MIN, ROT_MAX),
        y: clampRound((selectedEntity.rotation.y * 180) / Math.PI, ROT_MIN, ROT_MAX),
        z: clampRound((selectedEntity.rotation.z * 180) / Math.PI, ROT_MIN, ROT_MAX),
      });
      setLocalScale({
        x: clampRound(selectedEntity.scale.x, SCALE_MIN, SCALE_MAX),
        y: clampRound(selectedEntity.scale.y, SCALE_MIN, SCALE_MAX),
        z: clampRound(selectedEntity.scale.z, SCALE_MIN, SCALE_MAX),
      });
    }
  }, [selectedEntity]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (posTimerRef.current) clearTimeout(posTimerRef.current);
      if (rotTimerRef.current) clearTimeout(rotTimerRef.current);
      if (scaleTimerRef.current) clearTimeout(scaleTimerRef.current);
    };
  }, []);

  if (!selectedEntity) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center bg-[#0e0e11] border-l border-[#27272a]">
        <Crosshair className="w-8 h-8 text-[#3f3f46] mb-2 animate-pulse" />
        <h4 className="text-xs font-mono font-medium text-[#a1a1aa] mb-1">No Entity Selected</h4>
        <p className="text-[10px] font-mono text-[#71717a] max-w-[200px]">
          Click any 3D object in the viewport to inspect its transforms, materials, and properties.
        </p>
      </div>
    );
  }

  const handlePosChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const clamped = clampRound(value, POS_MIN, POS_MAX);
    const updated = { ...localPos, [axis]: clamped };
    setLocalPos(updated);

    if (posTimerRef.current) clearTimeout(posTimerRef.current);
    posTimerRef.current = setTimeout(() => {
      updateEntityTransform(selectedEntity.id, { position: updated });
    }, DEBOUNCE_MS);
  };

  const handleRotChange = (axis: 'x' | 'y' | 'z', degValue: number) => {
    const clamped = clampRound(degValue, ROT_MIN, ROT_MAX);
    const updatedDeg = { ...localRot, [axis]: clamped };
    setLocalRot(updatedDeg);

    if (rotTimerRef.current) clearTimeout(rotTimerRef.current);
    rotTimerRef.current = setTimeout(() => {
      const radRot = {
        x: (updatedDeg.x * Math.PI) / 180,
        y: (updatedDeg.y * Math.PI) / 180,
        z: (updatedDeg.z * Math.PI) / 180,
      };
      updateEntityTransform(selectedEntity.id, { rotation: radRot });
    }, DEBOUNCE_MS);
  };

  const handleScaleChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const clamped = clampRound(value, SCALE_MIN, SCALE_MAX);
    const updated = { ...localScale, [axis]: clamped };
    setLocalScale(updated);

    if (scaleTimerRef.current) clearTimeout(scaleTimerRef.current);
    scaleTimerRef.current = setTimeout(() => {
      updateEntityTransform(selectedEntity.id, { scale: updated });
    }, DEBOUNCE_MS);
  };

  const focusEntity = () => {
    engineBridge.dispatch({
      type: 'FOCUS_ENTITY',
      payload: { entityId: selectedEntity.id },
    });
  };

  return (
    <div className="h-full w-full bg-[#0e0e11] border-l border-[#27272a] flex flex-col overflow-y-auto text-white">
      {/* Header */}
      <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-[#3ecf8e]" />
          <div>
            <h3 className="text-xs font-mono font-bold text-white leading-tight">
              {selectedEntity.name}
            </h3>
            <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider">
              {selectedEntity.type}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={focusEntity}
            title="Focus Camera (F)"
            className="p-1.5 rounded text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition text-xs"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setEntityVisibility(selectedEntity.id, !selectedEntity.visible)}
            title={selectedEntity.visible ? 'Hide Entity' : 'Show Entity'}
            className="p-1.5 rounded text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition text-xs"
          >
            {selectedEntity.visible ? (
              <Eye className="w-3.5 h-3.5" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-rose-400" />
            )}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Transform Section */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-[#a1a1aa] mb-3">
            <Layers className="w-3.5 h-3.5 text-[#3ecf8e]" />
            <span>TRANSFORM</span>
          </div>

          <div className="space-y-3">
            {/* Position */}
            <div>
              <label className="text-[10px] font-mono text-[#71717a] block mb-1">Position</label>
              <div className="grid grid-cols-3 gap-2">
                {(['x', 'y', 'z'] as const).map((axis) => (
                  <div
                    key={axis}
                    className="flex items-center bg-[#18181b] rounded border border-[#27272a] px-2 py-1"
                  >
                    <span className="text-[10px] font-mono font-bold text-[#71717a] uppercase mr-1.5">
                      {axis}
                    </span>
                    <input
                      type="number"
                      step="0.1"
                      min={POS_MIN}
                      max={POS_MAX}
                      value={localPos[axis]}
                      onChange={(e) => handlePosChange(axis, parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Rotation */}
            <div>
              <label className="text-[10px] font-mono text-[#71717a] block mb-1">
                Rotation (Deg)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['x', 'y', 'z'] as const).map((axis) => (
                  <div
                    key={axis}
                    className="flex items-center bg-[#18181b] rounded border border-[#27272a] px-2 py-1"
                  >
                    <span className="text-[10px] font-mono font-bold text-[#71717a] uppercase mr-1.5">
                      {axis}
                    </span>
                    <input
                      type="number"
                      step="5"
                      min={ROT_MIN}
                      max={ROT_MAX}
                      value={localRot[axis]}
                      onChange={(e) => handleRotChange(axis, parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Scale */}
            <div>
              <label className="text-[10px] font-mono text-[#71717a] block mb-1">Scale</label>
              <div className="grid grid-cols-3 gap-2">
                {(['x', 'y', 'z'] as const).map((axis) => (
                  <div
                    key={axis}
                    className="flex items-center bg-[#18181b] rounded border border-[#27272a] px-2 py-1"
                  >
                    <span className="text-[10px] font-mono font-bold text-[#71717a] uppercase mr-1.5">
                      {axis}
                    </span>
                    <input
                      type="number"
                      step="0.1"
                      min={SCALE_MIN}
                      max={SCALE_MAX}
                      value={localScale[axis]}
                      onChange={(e) => handleScaleChange(axis, parseFloat(e.target.value) || 1)}
                      className="w-full bg-transparent text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Material & PBR Section */}
        {selectedMaterial && (
          <div className="border-t border-[#27272a] pt-4">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-[#a1a1aa] mb-3">
              <Palette className="w-3.5 h-3.5 text-[#3ecf8e]" />
              <span>PBR MATERIAL ({selectedMaterial.name || selectedMaterial.id})</span>
            </div>

            <div className="space-y-4">
              {/* Albedo Color */}
              <div>
                <label className="text-[10px] font-mono text-[#71717a] block mb-1">Albedo Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={selectedMaterial.color}
                    onChange={(e) =>
                      updateMaterial(selectedMaterial.id, { color: e.target.value })
                    }
                    className="w-7 h-7 rounded border border-[#27272a] bg-transparent cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={selectedMaterial.color}
                    onChange={(e) =>
                      updateMaterial(selectedMaterial.id, { color: e.target.value })
                    }
                    className="flex-1 bg-[#18181b] rounded border border-[#27272a] px-2.5 py-1 text-xs font-mono text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Roughness */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-mono text-[#71717a]">Roughness</label>
                  <span className="text-[10px] font-mono text-[#a1a1aa]">
                    {selectedMaterial.roughness.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={selectedMaterial.roughness}
                  onChange={(e) =>
                    updateMaterial(selectedMaterial.id, {
                      roughness: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-[#3ecf8e] h-1.5 bg-[#27272a] rounded cursor-pointer"
                />
              </div>

              {/* Metalness */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-mono text-[#71717a]">Metalness</label>
                  <span className="text-[10px] font-mono text-[#a1a1aa]">
                    {selectedMaterial.metalness.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={selectedMaterial.metalness}
                  onChange={(e) =>
                    updateMaterial(selectedMaterial.id, {
                      metalness: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-[#3ecf8e] h-1.5 bg-[#27272a] rounded cursor-pointer"
                />
              </div>

              {/* Wireframe toggle */}
              <div className="flex items-center justify-between pt-1">
                <label className="text-[10px] font-mono text-[#71717a]">Wireframe</label>
                <input
                  type="checkbox"
                  checked={selectedMaterial.wireframe ?? false}
                  onChange={(e) =>
                    updateMaterial(selectedMaterial.id, { wireframe: e.target.checked })
                  }
                  className="accent-[#3ecf8e] rounded cursor-pointer w-4 h-4"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
