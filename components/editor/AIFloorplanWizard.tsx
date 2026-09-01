'use client';

import React, { useState, useCallback } from 'react';
import { Upload, Settings, Play, Check, X, Info, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import type { VtedFloorplanAI, VtedRoom, VtedWall, VtedOpening } from '@/lib/vted-types';

interface AIFloorplanWizardProps {
  onGenerate?: (floorplan: VtedFloorplanAI) => void;
  onCancel?: () => void;
}

type Step = 1 | 2 | 3;

interface Step1Data {
  imageFile: File | null;
  previewUrl: string | null;
  error: string | null;
}

interface Step2Data {
  autoDetectOpenings: boolean;
  doorWidth: number;
  windowWidth: number;
  wallThickness: number;
  roomNamingMode: 'auto' | 'manual';
}

interface Step3Data {
  status: 'processing' | 'success' | 'error';
  result: VtedFloorplanAI | null;
  error: string | null;
}

export default function AIFloorplanWizard({ onGenerate, onCancel }: AIFloorplanWizardProps) {
  const [step, setStep] = useState<Step>(1);
  const [step1Data, setStep1Data] = useState<Step1Data>({
    imageFile: null,
    previewUrl: null,
    error: null,
  });
  const [step2Data, setStep2Data] = useState<Step2Data>({
    autoDetectOpenings: true,
    doorWidth: 90,
    windowWidth: 80,
    wallThickness: 12,
    roomNamingMode: 'auto',
  });
  const [step3Data, setStep3Data] = useState<Step3Data>({
    status: 'processing',
    result: null,
    error: null,
  });

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStep1Data({ imageFile: file, previewUrl: null, error: 'Please upload an image file (PNG, JPG, etc.)' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setStep1Data({ imageFile: file, previewUrl: null, error: 'File size must be under 10MB' });
      return;
    }

    const url = URL.createObjectURL(file);
    setStep1Data({ imageFile: file, previewUrl: url, error: null });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0] || null;
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStep1Data({ imageFile: file, previewUrl: null, error: 'Please upload an image file' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setStep1Data({ imageFile: file, previewUrl: null, error: 'File size must be under 10MB' });
      return;
    }

    const url = URL.createObjectURL(file);
    setStep1Data({ imageFile: file, previewUrl: url, error: null });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleClearImage = useCallback(() => {
    if (step1Data.previewUrl) {
      URL.revokeObjectURL(step1Data.previewUrl);
    }
    setStep1Data({ imageFile: null, previewUrl: null, error: null });
  }, [step1Data.previewUrl]);

  const handleNext = useCallback(() => {
    if (step === 1 && !step1Data.imageFile) {
      setStep1Data((prev) => ({ ...prev, error: 'Please upload a floorplan image first' }));
      return;
    }
    setStep((prev) => (prev < 3 ? (prev + 1) as Step : prev) as Step);
  }, [step, step1Data.imageFile]);

  const handleBack = useCallback(() => {
    setStep((prev) => (prev > 1 ? (prev - 1) as Step : prev) as Step);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!step1Data.imageFile) return;

    setStep3Data({ status: 'processing', result: null, error: null });
    setStep(3);

    try {
      const base64 = await fileToBase64(step1Data.imageFile);
      const res = await fetch('/api/tour/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: base64 }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to process floorplan');
      }

      const floorplan: VtedFloorplanAI = data.floorplan;

      setStep3Data({ status: 'success', result: floorplan, error: null });
      onGenerate?.(floorplan);
    } catch (err: any) {
      setStep3Data({ status: 'error', result: null, error: err?.message || 'Processing failed' });
    }
  }, [step1Data.imageFile, onGenerate]);

  const handleRestart = useCallback(() => {
    if (step1Data.previewUrl) {
      URL.revokeObjectURL(step1Data.previewUrl);
    }
    setStep1Data({ imageFile: null, previewUrl: null, error: null });
    setStep2Data({
      autoDetectOpenings: true,
      doorWidth: 90,
      windowWidth: 80,
      wallThickness: 12,
      roomNamingMode: 'auto',
    });
    setStep3Data({ status: 'processing', result: null, error: null });
    setStep(1);
  }, [step1Data.previewUrl]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0c0c0f] border border-[#27272A] rounded-xl w-full max-w-3xl mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#27272A]">
          <div>
            <h2 className="text-lg font-mono font-bold text-white">AI Floorplan Wizard</h2>
            <p className="text-[10px] font-mono text-[#71717A]">
              Step {step} of 3: {step === 1 ? 'Upload Image' : step === 2 ? 'Configure Detection' : 'Preview & Generate'}
            </p>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="p-1 rounded hover:bg-[#27272A] text-[#71717A] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Progress */}
        <div className="flex items-center px-4 py-3 border-b border-[#27272A]">
          {(['Upload', 'Configure', 'Generate'] as const).map((label, i) => {
            const stepNum = (i + 1) as Step;
            const isActive = step === stepNum;
            const isComplete = step > stepNum;
            return (
              <div key={label} className="flex-1 flex items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono ${
                    isComplete
                      ? 'bg-[#3ECF8E] text-black'
                      : isActive
                        ? 'bg-[#3ECF8E]/20 text-[#3ECF8E] border border-[#3ECF8E]'
                        : 'bg-[#27272A] text-[#71717A]'
                  }`}
                >
                  {isComplete ? <Check className="w-3 h-3" /> : stepNum}
                </div>
                <span className={`ml-2 text-[10px] font-mono ${isActive ? 'text-white' : 'text-[#71717A]'}`}>
                  {label}
                </span>
                {stepNum < 3 && <div className="flex-1 h-px bg-[#27272A] ml-2" />}
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[#27272A]">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className={`px-3 py-1.5 rounded font-mono text-xs ${
              step === 1
                ? 'text-[#71717A] cursor-default'
                : 'text-[#A1A1AA] hover:text-white hover:bg-[#27272A]'
            }`}
          >
            Back
          </button>
          <div className="flex gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-1.5 rounded font-mono text-xs text-[#71717A] hover:text-white"
              >
                Cancel
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-1.5 rounded bg-[#3ECF8E] text-black font-mono text-xs font-bold hover:bg-[#3ECF8E]/90 transition"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGenerate}
                disabled={step3Data.status === 'processing' || !step3Data.result}
                className="px-4 py-1.5 rounded bg-[#3ECF8E] text-black font-mono text-xs font-bold hover:bg-[#3ECF8E]/90 transition disabled:opacity-50"
              >
                {step3Data.status === 'processing' && step3Data.result ? 'Processing...' : 'Use This Floorplan'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  function renderStep1() {
    return (
      <div className="space-y-3">
        <div className="text-xs font-mono text-[#71717A]">
          Upload a clear 2D floorplan image (PNG, JPG). The AI will detect walls, rooms, doors, and windows.
        </div>

        {!step1Data.previewUrl ? (
          <div
            className="border-2 border-dashed border-[#27272A] rounded-lg p-6 text-center cursor-pointer hover:border-[#3ECF8E]/50 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('ai-floorplan-upload')?.click()}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-[#71717A]" />
            <div className="text-sm font-mono text-white mb-1">Drop your floorplan image here</div>
            <div className="text-[10px] font-mono text-[#71717A]">or click to browse • Max 10MB</div>
            <input
              id="ai-floorplan-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        ) : (
          <div className="relative border border-[#27272A] rounded-lg p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={step1Data.previewUrl} alt="Floorplan preview" className="max-w-full max-h-64 mx-auto rounded" />
            <div className="absolute top-2 right-2 flex gap-1">
              <button
                type="button"
                onClick={handleClearImage}
                className="p-1 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                title="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="mt-2 text-[10px] font-mono text-[#71717A] flex items-center gap-2">
              <ZoomIn className="w-3 h-3" />
              <span>Drag to pan • Scroll to zoom (in editor preview)</span>
            </div>
          </div>
        )}

        {step1Data.error && (
          <div className="px-3 py-2 bg-rose-950/40 border border-rose-900 text-rose-300 text-[10px] font-mono rounded">
            {step1Data.error}
          </div>
        )}
      </div>
    );
  }

  function renderStep2() {
    return (
      <div className="space-y-3">
        <div className="text-xs font-mono text-[#71717A]">
          Configure how the AI detects rooms, walls, doors, and windows. Adjust settings before generating.
        </div>

        <div className="space-y-2">
          <ToggleRow
            label="Auto-detect openings"
            description="Automatically find doors and windows on walls"
            checked={step2Data.autoDetectOpenings}
            onChange={(v) => setStep2Data((prev) => ({ ...prev, autoDetectOpenings: v }))}
          />
          {!step2Data.autoDetectOpenings && (
            <div className="grid grid-cols-2 gap-3 ml-4">
              <NumberInput
                label="Door width (px)"
                value={step2Data.doorWidth}
                onChange={(v) => setStep2Data((prev) => ({ ...prev, doorWidth: v }))}
                min={20}
                max={200}
              />
              <NumberInput
                label="Window width (px)"
                value={step2Data.windowWidth}
                onChange={(v) => setStep2Data((prev) => ({ ...prev, windowWidth: v }))}
                min={20}
                max={200}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <ToggleRow
            label="Wall thickness detection"
            description="Use image contrast to estimate wall thickness"
            checked={step2Data.wallThickness > 0}
            onChange={(v) => setStep2Data((prev) => ({ ...prev, wallThickness: v ? 12 : 0 }))}
          />
          {step2Data.wallThickness > 0 && (
            <NumberInput
              label="Min thickness (px)"
              value={step2Data.wallThickness}
              onChange={(v) => setStep2Data((prev) => ({ ...prev, wallThickness: v }))}
              min={1}
              max={50}
              className="ml-4"
            />
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-mono text-[#A1A1AA]">
            <Settings className="w-3 h-3" />
            Room naming mode
          </label>
          <div className="flex gap-2 ml-4">
            <select
              value={step2Data.roomNamingMode}
              onChange={(e) => setStep2Data((prev) => ({ ...prev, roomNamingMode: e.target.value as 'auto' | 'manual' }))}
              className="bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-[10px] font-mono text-white"
            >
              <option value="auto">Auto (AI suggests names)</option>
              <option value="manual">Manual (edit later in editor)</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  function renderStep3() {
    const { status, result, error } = step3Data;

    if (status === 'processing') {
      return (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <RotateCw className="w-8 h-8 text-[#3ECF8E] animate-spin" />
          <div className="text-sm font-mono text-white">Processing floorplan with AI…</div>
          <div className="text-[10px] font-mono text-[#71717A]">
            Detecting walls, rooms, doors, and windows
          </div>
        </div>
      );
    }

    if (status === 'error' || error) {
      return (
        <div className="text-center py-8">
          <div className="text-rose-400 mb-2">Processing failed</div>
          <p className="text-[10px] font-mono text-[#71717A]">{error}</p>
          <button
            type="button"
            onClick={() => handleGenerate()}
            className="mt-3 px-3 py-1 rounded bg-[#3ECF8E]/20 text-[#3ECF8E] font-mono text-xs hover:bg-[#3ECF8E]/30"
          >
            Retry
          </button>
        </div>
      );
    }

    if (status === 'success' && result) {
      const { rooms, walls, doors, windows } = result;
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Rooms" value={rooms.length} icon={<Info className="w-4 h-4 text-cyan-400" />} />
            <StatCard label="Walls" value={walls.length} icon={<Info className="w-4 h-4 text-amber-400" />} />
            <StatCard label="Doors" value={doors.length} icon={<Info className="w-4 h-4 text-emerald-400" />} />
            <StatCard label="Windows" value={windows.length} icon={<Info className="w-4 h-4 text-blue-400" />} />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-[#A1A1AA]">Detected rooms</label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {rooms.map((room) => (
                <RoomRow key={room.id} room={room} />
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-[#A1A1AA]">Scale</label>
            <div className="text-[10px] font-mono text-[#71717A]">
              {result.scale.pixelsPerMeter.toFixed(1)} px/m · Confidence: {Math.round(result.processingConfidence * 100)}%
            </div>
          </div>

          <div className="pt-2 border-t border-[#27272A]">
            <button
              type="button"
              onClick={() => {
                if (result && step1Data.imageFile) {
                  onGenerate?.(result);
                }
              }}
              className="w-full px-4 py-2 rounded bg-[#3ECF8E] text-black font-mono text-sm font-bold hover:bg-[#3ECF8E]/90 transition"
            >
              Use This Floorplan
            </button>
            <button
              type="button"
              onClick={handleRestart}
              className="w-full mt-2 px-4 py-1.5 rounded bg-transparent border border-[#27272A] text-[#A1A1AA] font-mono text-xs hover:bg-[#27272A]"
            >
              Start Over
            </button>
          </div>
        </div>
      );
    }
    return null;
  }
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="text-xs font-mono text-white">{label}</div>
        <div className="text-[9px] font-mono text-[#71717A] mt-0.5">{description}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-8 h-4 rounded-full transition-colors ${
          checked ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'
        }`}
      >
        <div
          className={`absolute top-0.5 w-3 h-3 rounded-full transition-transform ${
            checked ? 'translate-x-4 bg-black' : 'bg-[#71717A]'
          }`}
        />
      </button>
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  className,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-[10px] font-mono text-[#71717A] mb-1 block">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
      <div className="text-[9px] font-mono text-[#A1A1AA] mt-0.5">{value}px</div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded bg-[#18181B] border border-[#27272A]">
      {icon}
      <div>
        <div className="text-xs font-mono text-white">{label}</div>
        <div className="text-[10px] font-mono text-[#71717A]">{value}</div>
      </div>
    </div>
  );
}

function RoomRow({ room }: { room: VtedRoom }) {
  const typeColors: Record<string, string> = {
    living: 'text-cyan-300',
    bedroom: 'text-purple-300',
    kitchen: 'text-amber-300',
    bathroom: 'text-emerald-300',
    office: 'text-blue-300',
    other: 'text-[#A1A1AA]',
  };
  const colorClass = typeColors[room.type || 'other'] || typeColors.other;

  return (
    <div className="flex items-center justify-between px-2 py-1 rounded bg-[#18181B] border border-[#27272A]">
      <span className="text-xs font-mono text-white">{room.name}</span>
      <span className={`text-[9px] font-mono ${colorClass}`}>{room.type}</span>
      <span className="text-[9px] font-mono text-[#71717A]">{Math.round(room.area)} px²</span>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const onLoad = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Failed to read file'));
    };
    reader.addEventListener('load', onLoad);
    reader.addEventListener('error', reject);
    reader.readAsDataURL(file);
  });
}
