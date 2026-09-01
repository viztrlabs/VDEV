'use client';

import React, { useEffect, useState } from 'react';
import {
  Map as MapIcon,
  Plus,
  Upload,
  Save,
  X,
  CheckCircle2,
  Trash2,
  Eye,
  Edit3,
  Sparkles,
  BarChart3,
   Layers as LayersIcon,
   RotateCw,
 } from 'lucide-react';
import type { VtedFloorplan, VtedFloorplanDisplay, VtedFloorplanAI } from '@/lib/vted-types';

interface FloorplanManagerProps {
  display?: VtedFloorplanDisplay;
  onChangeDisplay: (next: VtedFloorplanDisplay) => void;
  onSave: () => void;
  saved: boolean;
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
        {label}
      </label>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={(value || '#000000').slice(0, 7)}
          onChange={(e) => onChange(e.target.value + (value && value.length > 7 ? value.slice(7) : ''))}
          className="w-10 h-7 bg-transparent border border-[#27272A] rounded"
        />
        <input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[10px] font-mono text-white"
        />
      </div>
    </div>
  );
}

export default function FloorplanManager({
  display,
  onChangeDisplay,
  onSave,
  saved,
}: FloorplanManagerProps) {
  const [floorplans, setFloorplans] = useState<VtedFloorplan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
   const [showCreator, setShowCreator] = useState(false);
  const [showAIWizard, setShowAIWizard] = useState(false);
  const [aiWizardStep, setAIWizardStep] = useState<'upload' | 'processing' | 'preview'>('upload');
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<VtedFloorplanAI | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [draft, setDraft] = useState<{ name: string; imageUrl: string }>({ name: '', imageUrl: '' });
  const [draggingImage, setDraggingImage] = useState(false);

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tour/floorplans');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'failed');
      setFloorplans(data.floorplans || []);
    } catch (e: any) {
      setError(e?.message || 'failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

   const uploadImage = async (file: File): Promise<string | null> => {
     try {
       const fd = new FormData();
       fd.append('file', file);
       const res = await fetch('/api/tour/upload', { method: 'POST', body: fd });
       if (!res.ok) throw new Error('upload failed');
       const data = await res.json();
       return data.url;
     } catch (e: any) {
       setError(e?.message || 'upload failed');
       return null;
     }
   };

  const openAIWizard = () => {
    setShowAIWizard(true);
    setAIWizardStep('upload');
    setAiFile(null);
    setAiResult(null);
    setAiError(null);
  };

  const closeAIWizard = () => {
    setShowAIWizard(false);
    setAIWizardStep('upload');
    setAiFile(null);
    setAiResult(null);
    setAiError(null);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAIFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setAiError('Please upload an image file (PNG, JPG, etc.)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setAiError('File size must be under 10MB');
      return;
    }
    setAiFile(file);
    setAiError(null);
    setAIWizardStep('processing');
    setAiLoading(true);

    try {
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/tour/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: base64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI processing failed');
      setAiResult(data.floorplan);
      setAIWizardStep('preview');
    } catch (e: any) {
      setAiError(e?.message || 'Processing failed');
      setAIWizardStep('upload');
    } finally {
      setAiLoading(false);
    }
  };

  const saveAIResult = async () => {
    if (!aiResult || !aiFile) return;

    try {
      const imageUrl = await uploadImage(aiFile);
      if (!imageUrl) return;

      const fp = await createFloorplan({
        name: `AI Floorplan - ${new Date().toLocaleString()}`,
        imageUrl,
        status: 'draft',
        draft: true,
        roomsLinked: [],
        aiData: aiResult,
      });

      setFloorplans((prev) => [fp, ...prev]);
      closeAIWizard();
    } catch (e: any) {
      setError(e?.message || 'failed to save floorplan');
    }
  };

  const create = async () => {
    if (!draft.name.trim() || !draft.imageUrl) {
      setError('Name and image required');
      return;
    }
    try {
      const res = await fetch('/api/tour/floorplans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: draft.name,
          imageUrl: draft.imageUrl,
          status: 'draft',
          draft: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'failed');
      setShowCreator(false);
      setDraft({ name: '', imageUrl: '' });
      fetchList();
    } catch (e: any) {
      setError(e?.message || 'create failed');
    }
  };

  const togglePublish = async (fp: VtedFloorplan) => {
    const newStatus = fp.status === 'published' ? 'draft' : 'published';
    try {
      await fetch('/api/tour/floorplans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fp.id, status: newStatus }),
      });
      fetchList();
    } catch (e: any) {
      setError(e?.message || 'failed');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this floorplan?')) return;
    try {
      await fetch(`/api/tour/floorplans?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      fetchList();
    } catch (e: any) {
      setError(e?.message || 'delete failed');
    }
  };

  const setD = (patch: Partial<VtedFloorplanDisplay>) => {
    onChangeDisplay({ ...(display || defaultDisplay()), ...patch });
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-mono font-bold text-[#3ECF8E] flex items-center gap-2">
          <MapIcon className="w-4 h-4" />
          Floorplans
        </h2>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-[#3ECF8E]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Saved
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowCreator(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#3ECF8E] hover:bg-[#34b876] text-black text-xs font-bold font-mono"
          >
            <Plus className="w-3.5 h-3.5" />
            New Floorplan
          </button>
          <button
            type="button"
            onClick={openAIWizard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold font-mono"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Generate
          </button>
        </div>
      </div>

      {error && (
        <div className="px-3 py-2 bg-rose-950/40 border border-rose-900 text-rose-300 text-xs font-mono rounded">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-rose-400 hover:text-rose-200">
            <X className="w-3.5 h-3.5 inline" />
          </button>
        </div>
      )}

      {/* Creator modal */}
      {showCreator && (
        <div className="rounded-xl border border-[#27272A] bg-[#0c0c0f] p-3 space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">
            New Floorplan
          </div>
          <input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Floorplan name (e.g. Lobby Level)"
            className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1.5 text-xs text-white"
          />
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDraggingImage(true);
            }}
            onDragLeave={() => setDraggingImage(false)}
            onDrop={async (e) => {
              e.preventDefault();
              setDraggingImage(false);
              const file = e.dataTransfer.files?.[0];
              if (file) {
                const url = await uploadImage(file);
                if (url) setDraft({ ...draft, imageUrl: url });
              }
            }}
            className={`rounded-lg border-2 border-dashed p-4 text-center text-[10px] font-mono transition-colors ${
              draggingImage
                ? 'border-[#3ECF8E] bg-[#3ECF8E]/10 text-[#3ECF8E]'
                : 'border-[#27272A] text-[#71717A]'
            }`}
          >
            {draft.imageUrl ? (
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={draft.imageUrl} alt="Preview" className="w-12 h-12 object-cover rounded border border-[#27272A]" />
                <span className="text-[10px] font-mono text-[#3ECF8E] truncate flex-1">
                  {draft.imageUrl.split('/').pop()}
                </span>
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, imageUrl: '' })}
                  className="text-rose-400 hover:text-rose-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              'Drop floorplan image or click upload'
            )}
          </div>
          <label className="flex items-center justify-center gap-1.5 w-full px-2 py-1.5 rounded bg-[#09090B] border border-[#27272A] hover:border-[#3ECF8E]/40 text-[10px] font-mono text-[#A1A1AA] cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            Upload image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = await uploadImage(file);
                  if (url) setDraft({ ...draft, imageUrl: url });
                }
              }}
            />
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={create}
              className="flex-1 px-3 py-1.5 rounded bg-[#3ECF8E] hover:bg-[#34b876] text-black text-xs font-bold font-mono"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreator(false);
                setDraft({ name: '', imageUrl: '' });
              }}
              className="px-3 py-1.5 rounded bg-[#27272A] hover:bg-[#3f3f46] text-white text-xs font-mono"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Floorplan list */}
      {loading ? (
        <div className="text-xs font-mono text-[#71717A] text-center py-6">Loading…</div>
      ) : floorplans.length === 0 ? (
        <div className="text-xs font-mono text-[#71717A] text-center py-6 border border-dashed border-[#27272A] rounded-lg">
          No floorplans yet. Click &quot;New Floorplan&quot; to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {floorplans.map((fp) => (
            <div key={fp.id} className="rounded-lg border border-[#27272A] bg-[#0c0c0f] overflow-hidden">
              {fp.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fp.imageUrl} alt={fp.name} className="w-full h-32 object-cover" />
              ) : (
                <div className="w-full h-32 bg-[#09090B] flex items-center justify-center">
                  <MapIcon className="w-8 h-8 text-[#27272A]" />
                </div>
              )}
              <div className="p-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-white truncate">{fp.name}</span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      fp.status === 'published'
                        ? 'bg-[#3ECF8E]/15 text-[#3ECF8E]'
                        : 'bg-amber-500/15 text-amber-400'
                    }`}
                  >
                    {fp.status}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => togglePublish(fp)}
                    className="flex-1 px-2 py-1 rounded bg-[#18181B] hover:bg-[#27272A] text-[10px] font-mono text-[#A1A1AA] hover:text-white flex items-center justify-center gap-1"
                  >
                    {fp.status === 'published' ? (
                      <>
                        <Eye className="w-3 h-3" /> Unpublish
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Publish
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(fp.id)}
                    className="px-2 py-1 rounded bg-[#18181B] hover:bg-rose-500/20 text-rose-400 text-[10px] font-mono"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Wizard Modal */}
      {showAIWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0c0c0f] border border-[#27272A] rounded-xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-[#27272A]">
              <div>
                <h3 className="text-sm font-mono font-bold text-[#3ECF8E]">AI Floorplan Generator</h3>
                <p className="text-[10px] font-mono text-[#71717A]">
                  Step: {aiWizardStep === 'upload' ? 'Upload' : aiWizardStep === 'processing' ? 'Processing' : 'Preview'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeAIWizard}
                className="p-1 rounded hover:bg-[#27272A] text-[#71717A] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {aiWizardStep === 'upload' && (
                <div className="space-y-3">
                  <div className="text-[10px] font-mono text-[#71717A]">
                    Upload a floorplan image to detect walls, rooms, doors, and windows.
                  </div>
                  <div
                    className={`rounded-lg border-2 border-dashed p-6 text-center text-[10px] font-mono transition-colors cursor-pointer ${
                      aiFile
                        ? 'border-[#3ECF8E] bg-[#3ECF8E]/5 text-[#3ECF8E]'
                        : 'border-[#27272A] text-[#71717A] hover:border-[#3ECF8E]/50'
                    }`}
                    onClick={() => document.getElementById('ai-upload-input')?.click()}
                  >
                    <Upload className="w-6 h-6 mx-auto mb-2" />
                    {aiFile ? (
                      <span>{aiFile.name}</span>
                    ) : (
                      <span>Drop image or click to upload (max 10MB)</span>
                    )}
                    <input
                      id="ai-upload-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleAIFileUpload(file);
                      }}
                    />
                  </div>
                  {aiError && (
                    <div className="px-3 py-2 bg-rose-950/40 border border-rose-900 text-rose-300 text-[10px] font-mono rounded">
                      {aiError}
                    </div>
                  )}
                </div>
              )}

              {aiWizardStep === 'processing' && (
                <div className="flex flex-col items-center justify-center py-8 gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-[#27272A]"></div>
                    <RotateCw className="absolute inset-0 m-auto w-5 h-5 text-[#3ECF8E] animate-spin" />
                  </div>
                  <div className="text-sm font-mono text-white">Processing floorplan with AI…</div>
                  <div className="text-[10px] font-mono text-[#71717A]">
                    Detecting walls, rooms, doors, and windows
                  </div>
                </div>
              )}

              {aiWizardStep === 'preview' && aiResult && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard label="Rooms" value={aiResult.rooms.length} icon={<LayersIcon className="w-4 h-4 text-cyan-400" />} />
                    <StatCard label="Walls" value={aiResult.walls.length} icon={<BarChart3 className="w-4 h-4 text-amber-400" />} />
                    <StatCard label="Doors" value={aiResult.doors.length} icon={<LayersIcon className="w-4 h-4 text-emerald-400" />} />
                    <StatCard label="Windows" value={aiResult.windows.length} icon={<LayersIcon className="w-4 h-4 text-blue-400" />} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">Detected Rooms</label>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {aiResult.rooms.map((room) => (
                        <div key={room.id} className="flex items-center justify-between px-2 py-1.5 rounded bg-[#18181B] border border-[#27272A]">
                          <span className="text-[10px] font-mono text-white">{room.name}</span>
                          <span className="text-[9px] font-mono text-[#71717A]">{room.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-[#71717A]">
                    Scale: {aiResult.scale.pixelsPerMeter.toFixed(1)} px/m · Confidence: {Math.round(aiResult.processingConfidence * 100)}%
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t border-[#27272A]">
              <button
                type="button"
                onClick={closeAIWizard}
                className="px-3 py-1.5 rounded font-mono text-xs text-[#71717A] hover:text-white"
              >
                Cancel
              </button>
              {aiWizardStep === 'upload' && (
                <button
                  type="button"
                  onClick={() => document.getElementById('ai-upload-input')?.click()}
                  disabled={!aiFile}
                  className="px-3 py-1.5 rounded bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-mono font-bold disabled:opacity-50"
                >
                  Select Image
                </button>
              )}
              {aiWizardStep === 'preview' && aiResult && (
                <button
                  type="button"
                  onClick={saveAIResult}
                  className="px-4 py-1.5 rounded bg-[#3ECF8E] hover:bg-[#34b876] text-black text-xs font-mono font-bold"
                >
                  Save Floorplan
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Display settings */}
      <div className="rounded-xl border border-[#27272A] bg-[#0c0c0f] p-3 space-y-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#3ECF8E]">
          Display Settings
        </div>

        <ToggleRow
          label="Show on start"
          value={!!display?.showOnStart}
          onChange={(v) => setD({ showOnStart: v })}
        />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
              Layout
            </label>
            <select
              value={display?.layout || 'box'}
              onChange={(e) => setD({ layout: e.target.value as 'box' | 'panel' })}
              className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
            >
              <option value="box">Box</option>
              <option value="panel">Panel</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
              Position
            </label>
            <select
              value={display?.position || 'left'}
              onChange={(e) => setD({ position: e.target.value as 'left' | 'right' })}
              className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>

        <ColorField label="Background" value={display?.backgroundColor} onChange={(v) => setD({ backgroundColor: v })} />

        <div className="space-y-2 pt-2 border-t border-[#27272A]">
          <ToggleRow
            label="Radar"
            value={!!display?.radar?.enabled}
            onChange={(v) =>
              setD({ radar: { enabled: v, backgroundColor: display?.radar?.backgroundColor || '#3ECF8E20', borderColor: display?.radar?.borderColor || '#3ECF8E', borderWidth: display?.radar?.borderWidth || 2, width: display?.radar?.width || 80 } })
            }
          />
          {display?.radar?.enabled && (
            <div className="grid grid-cols-2 gap-2 pl-2">
              <ColorField label="Radar BG" value={display.radar.backgroundColor} onChange={(v) => setD({ radar: { ...display.radar!, backgroundColor: v } })} />
              <ColorField label="Border" value={display.radar.borderColor} onChange={(v) => setD({ radar: { ...display.radar!, borderColor: v } })} />
              <div className="col-span-2">
                <label className="block text-[10px] font-mono text-[#A1A1AA]">
                  Border width {display.radar.borderWidth ?? 2}px
                </label>
                <input
                  type="range"
                  min={0}
                  max={6}
                  value={display.radar.borderWidth ?? 2}
                  onChange={(e) => setD({ radar: { ...display.radar!, borderWidth: Number(e.target.value) } })}
                  className="w-full accent-[#3ECF8E]"
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 pt-2 border-t border-[#27272A]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">Marker</div>
          <ColorField label="Marker BG" value={display?.marker?.backgroundColor} onChange={(v) => setD({ marker: { ...(display?.marker || {}), backgroundColor: v } })} />
          <ColorField label="Marker border" value={display?.marker?.borderColor} onChange={(v) => setD({ marker: { ...(display?.marker || {}), borderColor: v } })} />
        </div>

        <button
          type="button"
          onClick={onSave}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#3ECF8E] hover:bg-[#34b876] text-black text-xs font-bold font-mono"
        >
          <Save className="w-3.5 h-3.5" />
          Save Display
        </button>
      </div>
    </div>
  );
}

function defaultDisplay(): VtedFloorplanDisplay {
  return {
    showOnStart: false,
    layout: 'box',
    position: 'left',
    backgroundColor: '#18181B',
    radar: { enabled: false, backgroundColor: '#3ECF8E20', borderColor: '#3ECF8E', borderWidth: 2, width: 80 },
    marker: { backgroundColor: '#3ECF8E', borderColor: '#3ECF8E' },
  };
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-2 rounded bg-[#09090B] border border-[#27272A]">
      <span className="text-[10px] font-mono text-[#FAFAFA]">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-9 h-5 rounded-full relative transition-colors ${
          value ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
            value ? 'left-4' : 'left-0.5'
          }`}
        />
      </button>
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

// Duplicate removed: the outer-scope ToggleRow (defined above) is the canonical one.
// The inner-scoped declaration was intentionally left for the Display Settings section.
