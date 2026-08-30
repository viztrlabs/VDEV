'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  MapPin,
  DoorOpen,
  Loader2,
  CheckCircle2,
  Upload,
  Copy,
  ChevronUp,
  ChevronDown,
  Pencil,
} from 'lucide-react';

type HotspotColor = 'rose' | 'emerald' | 'cyan' | 'amber' | 'violet' | 'blue';
type HotspotCategory =
  | 'material'
  | 'furniture'
  | 'spatial'
  | 'lighting'
  | 'architecture'
  | 'acoustic'
  | 'portal'
  | 'custom';

interface Hotspot {
  id: string;
  xPercent: number;
  yPercent: number;
  title: string;
  type: 'metadata' | 'room_link' | 'image' | 'video' | 'info';
  category: HotspotCategory;
  description: string;
  targetRoomId?: string;
  targetRoomName?: string;
  targetPanoramaUrl?: string;
  targetYaw?: number;
  icon?: string;
  color?: HotspotColor;
  mediaUrl?: string;
  article?: string;
}

interface TourRoom {
  id: string;
  name: string;
  subtitle: string;
  panoramaUrl: string;
  thumbnailUrl: string;
  initialYaw: number;
  initialPitch: number;
  defaultHotspots: Hotspot[];
}

export default function TourEditorPage() {
  const [rooms, setRooms] = useState<TourRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>('');
  const [addMode, setAddMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [draggingOver, setDraggingOver] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const dragHpRef = useRef<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/tour');
      const data = await res.json();
      setRooms(data.rooms || []);
      setSelectedId((prev) => prev || data.rooms?.[0]?.id || '');
    } catch (e: any) {
      setError(e?.message || 'failed to load tour');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selected = rooms.find((r) => r.id === selectedId) || rooms[0];

  const updateRoom = (roomId: string, updater: (r: TourRoom) => TourRoom) => {
    setRooms((prev) => prev.map((r) => (r.id === roomId ? updater(r) : r)));
    setSaved(false);
  };

  // ---- Upload 360 image and create a node ----
  const uploadFiles = async (files: FileList | File[]) => {
    setUploading(true);
    setError('');
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/tour/upload', { method: 'POST', body: fd });
        if (!res.ok) throw new Error('upload failed');
        const { url } = await res.json();
        const id = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newRoom: TourRoom = {
          id,
          name: file.name.replace(/\.[^.]+$/, '').slice(0, 40) || 'New Scene',
          subtitle: 'User Upload',
          panoramaUrl: url,
          thumbnailUrl: url,
          initialYaw: 180,
          initialPitch: 0,
          defaultHotspots: [],
        };
        setRooms((prev) => [...prev, newRoom]);
        setSelectedId(id);
      }
      setSaved(false);
    } catch (e: any) {
      setError(e?.message || 'upload failed');
    } finally {
      setUploading(false);
    }
  };

  // ---- Node ops ----
  const renameNode = (id: string, name: string) =>
    updateRoom(id, (r) => ({ ...r, name }));

  const deleteNode = (id: string) => {
    setRooms((prev) => {
      const next = prev.filter((r) => r.id !== id);
      if (selectedId === id) setSelectedId(next[0]?.id || '');
      return next;
    });
    setSaved(false);
  };

  const duplicateNode = (id: string) => {
    const src = rooms.find((r) => r.id === id);
    if (!src) return;
    const copy: TourRoom = {
      ...src,
      id: `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: `${src.name} (copy)`,
      defaultHotspots: src.defaultHotspots.map((h) => ({ ...h, id: `hp-${Date.now()}-${Math.random()}` })),
    };
    setRooms((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
    setSelectedId(copy.id);
    setSaved(false);
  };

  const moveNode = (id: string, dir: -1 | 1) => {
    setRooms((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      const target = idx + dir;
      if (idx < 0 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
    setSaved(false);
  };

  // ---- Hotspot ops ----
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!addMode || !selected) return;
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
    const newHp: Hotspot = {
      id: `hp-${Date.now()}-${Math.random()}`,
      xPercent: Math.round(xPercent * 10) / 10,
      yPercent: Math.round(yPercent * 10) / 10,
      title: 'New Hotspot',
      type: 'metadata',
      category: 'custom',
      description: '',
      color: 'emerald',
      icon: 'info',
    };
    updateRoom(selected.id, (r) => ({
      ...r,
      defaultHotspots: [...r.defaultHotspots, newHp],
    }));
    setAddMode(false);
  };

  const updateHotspot = (hpId: string, patch: Partial<Hotspot>) => {
    if (!selected) return;
    updateRoom(selected.id, (r) => ({
      ...r,
      defaultHotspots: r.defaultHotspots.map((h) => (h.id === hpId ? { ...h, ...patch } : h)),
    }));
  };

  const deleteHotspot = (hpId: string) => {
    if (!selected) return;
    updateRoom(selected.id, (r) => ({
      ...r,
      defaultHotspots: r.defaultHotspots.filter((h) => h.id !== hpId),
    }));
  };

  const setPortalTarget = (hpId: string, targetId: string) => {
    const target = rooms.find((r) => r.id === targetId);
    if (!target) return;
    updateHotspot(hpId, {
      type: 'room_link',
      category: 'portal',
      targetRoomId: target.id,
      targetRoomName: target.name,
      targetPanoramaUrl: target.panoramaUrl,
      targetYaw: 180,
      icon: 'door',
      color: 'emerald',
    });
  };

  // ---- Drag hotspot to reposition ----
  const onHpPointerDown = (e: React.PointerEvent, hpId: string) => {
    e.stopPropagation();
    dragHpRef.current = hpId;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onHpPointerMove = (e: React.PointerEvent) => {
    if (!dragHpRef.current || !selected || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const xPercent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const yPercent = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    updateHotspot(dragHpRef.current, {
      xPercent: Math.round(xPercent * 10) / 10,
      yPercent: Math.round(yPercent * 10) / 10,
    });
  };
  const onHpPointerUp = () => {
    dragHpRef.current = null;
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/tour', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: 1, rooms }),
      });
      if (!res.ok) throw new Error('save failed');
      setSaved(true);
    } catch (e: any) {
      setError(e?.message || 'save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] text-white flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#3ECF8E]" /> Loading tour editor…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#27272A] bg-[#0c0c0f]">
        <div className="flex items-center gap-3">
          <Link
            href="/xr-world/virtual-tour"
            className="flex items-center gap-1.5 text-xs font-mono text-[#A1A1AA] hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> Virtual Tour
          </Link>
          <span className="text-sm font-bold font-mono text-[#3ECF8E]">360° TOUR EDITOR</span>
          <span className="text-[10px] font-mono text-[#71717A]">
            {rooms.length} nodes · {rooms.reduce((a, r) => a + r.defaultHotspots.length, 0)} hotspots
          </span>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-[#3ECF8E]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved
            </span>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34b876] text-black text-xs font-bold font-mono disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Tour
          </button>
        </div>
      </header>

      {error && (
        <div className="px-4 py-2 bg-rose-950/40 border-b border-rose-900 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        {/* Node list + upload */}
        <aside className="w-60 shrink-0 border-r border-[#27272A] overflow-y-auto p-2 space-y-1">
          <div className="flex items-center justify-between px-1 pb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">Nodes</span>
            <label className="flex items-center gap-1 px-2 py-1 rounded bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#3ECF8E] text-[10px] font-mono cursor-pointer">
              <Upload className="w-3 h-3" /> Upload
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && uploadFiles(e.target.files)}
              />
            </label>
          </div>

          {/* Drag-drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDraggingOver(true);
            }}
            onDragLeave={() => setDraggingOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDraggingOver(false);
              if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
            }}
            className={`rounded-xl border-2 border-dashed p-3 text-center text-[10px] font-mono transition-colors ${
              draggingOver
                ? 'border-[#3ECF8E] bg-[#3ECF8E]/10 text-[#3ECF8E]'
                : 'border-[#27272A] text-[#71717A]'
            }`}
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Uploading…
              </span>
            ) : (
              'Drag 360° images here'
            )}
          </div>

          {rooms.map((r, idx) => (
            <div
              key={r.id}
              className={`group rounded-lg border transition-colors ${
                r.id === selectedId
                  ? 'bg-[#18181B] border-[#3ECF8E]/30'
                  : 'border-transparent hover:bg-[#18181B]'
              }`}
            >
              <div className="flex items-center gap-2 px-2 py-1.5">
                <div
                  className="w-8 h-8 rounded bg-cover bg-center shrink-0 border border-[#27272A] cursor-pointer"
                  style={{ backgroundImage: `url(${r.thumbnailUrl})` }}
                  onClick={() => setSelectedId(r.id)}
                />
                <div className="min-w-0 flex-1" onClick={() => setSelectedId(r.id)}>
                  {editingNodeId === r.id ? (
                    <input
                      autoFocus
                      defaultValue={r.name}
                      onBlur={(e) => {
                        renameNode(r.id, e.target.value || r.name);
                        setEditingNodeId('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                      }}
                      className="w-full bg-[#0c0c0f] border border-[#3ECF8E]/40 rounded px-1 text-xs text-white"
                    />
                  ) : (
                    <div className="text-xs font-medium truncate">{r.name}</div>
                  )}
                  <div className="text-[10px] text-[#71717A]">{r.defaultHotspots.length} hotspots</div>
                </div>
              </div>
              {/* node action row */}
              <div className="flex items-center justify-end gap-0.5 px-1.5 pb-1.5 opacity-60 group-hover:opacity-100">
                <button
                  onClick={() => setEditingNodeId(r.id)}
                  className="p-1 rounded text-[#A1A1AA] hover:text-white hover:bg-white/10"
                  title="Rename"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={() => moveNode(r.id, -1)}
                  disabled={idx === 0}
                  className="p-1 rounded text-[#A1A1AA] hover:text-white hover:bg-white/10 disabled:opacity-20"
                  title="Move up"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => moveNode(r.id, 1)}
                  disabled={idx === rooms.length - 1}
                  className="p-1 rounded text-[#A1A1AA] hover:text-white hover:bg-white/10 disabled:opacity-20"
                  title="Move down"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
                <button
                  onClick={() => duplicateNode(r.id)}
                  className="p-1 rounded text-[#A1A1AA] hover:text-white hover:bg-white/10"
                  title="Duplicate"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={() => deleteNode(r.id)}
                  className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </aside>

        {/* Preview + placement */}
        <main className="flex-1 flex flex-col min-w-0" onPointerMove={onHpPointerMove} onPointerUp={onHpPointerUp}>
          {selected ? (
            <>
              <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={selected.panoramaUrl}
                  alt={selected.name}
                  onClick={handleImageClick}
                  className={`max-w-full max-h-full object-contain select-none ${
                    addMode ? 'cursor-crosshair' : 'cursor-default'
                  }`}
                  draggable={false}
                />
                {/* hotspot markers (draggable) */}
                {selected.defaultHotspots.map((hp) => (
                  <button
                    key={hp.id}
                    onPointerDown={(e) => onHpPointerDown(e, hp.id)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-move touch-none"
                    style={{ left: `${hp.xPercent}%`, top: `${hp.yPercent}%` }}
                    title={`${hp.title} (drag to move)`}
                  >
                    <span
                      className={`flex items-center justify-center w-5 h-5 rounded-full text-white shadow-lg ${
                        hp.type === 'room_link' ? 'bg-[#3ECF8E]' : 'bg-[#ec4899]'
                      }`}
                    >
                      {hp.type === 'room_link' ? (
                        <DoorOpen className="w-3 h-3" />
                      ) : (
                        <MapPin className="w-3 h-3" />
                      )}
                    </span>
                  </button>
                ))}

                <button
                  onClick={() => setAddMode((v) => !v)}
                  className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-mono font-bold shadow-xl ${
                    addMode ? 'bg-rose-600 text-white' : 'bg-[#18181B] text-[#3ECF8E] border border-[#27272A]'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {addMode ? 'Click image to place…' : 'Add Hotspot'}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-[#71717A] font-mono">
              Upload or select a node to begin.
            </div>
          )}
        </main>

        {/* Hotspot inspector */}
        <aside className="w-80 shrink-0 border-l border-[#27272A] overflow-y-auto p-3 space-y-3">
          {selected && (
            <>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
                Hotspots on “{selected.name}”
              </div>
              {selected.defaultHotspots.length === 0 && (
                <div className="text-xs text-[#71717A] font-mono">
                  No hotspots. Click “Add Hotspot” then click the image, or drag existing ones to move.
                </div>
              )}
              {selected.defaultHotspots.map((hp) => (
                <div key={hp.id} className="rounded-xl border border-[#27272A] bg-[#0c0c0f] p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#71717A]">
                      {hp.xPercent}% , {hp.yPercent}%
                    </span>
                    <button
                      onClick={() => deleteHotspot(hp.id)}
                      className="text-rose-400 hover:text-rose-300"
                      title="Delete hotspot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    value={hp.title}
                    onChange={(e) => updateHotspot(hp.id, { title: e.target.value })}
                    placeholder="Title"
                    className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
                  />
                  <textarea
                    value={hp.description}
                    onChange={(e) => updateHotspot(hp.id, { description: e.target.value })}
                    placeholder="Description"
                    rows={2}
                    className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white resize-none"
                  />

                  <select
                    value={hp.type}
                    onChange={(e) => {
                      const t = e.target.value as Hotspot['type'];
                      if (t === 'room_link') {
                        setPortalTarget(hp.id, rooms.find((r) => r.id !== selected.id)?.id || '');
                      } else {
                        updateHotspot(hp.id, {
                          type: t,
                          category: 'custom',
                          targetRoomId: undefined,
                          targetRoomName: undefined,
                          targetPanoramaUrl: undefined,
                        });
                      }
                    }}
                    className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
                  >
                    <option value="metadata">Metadata / Info tag</option>
                    <option value="room_link">Portal (link to node)</option>
                    <option value="image">Image popup</option>
                    <option value="video">Video popup</option>
                    <option value="info">Article / Text panel</option>
                  </select>

                  {hp.type === 'room_link' && (
                    <select
                      value={hp.targetRoomId || ''}
                      onChange={(e) => setPortalTarget(hp.id, e.target.value)}
                      className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
                    >
                      {rooms
                        .filter((r) => r.id !== selected.id)
                        .map((r) => (
                          <option key={r.id} value={r.id}>
                            → {r.name}
                          </option>
                        ))}
                    </select>
                  )}

                  {hp.type === 'image' && (
                    <input
                      value={hp.mediaUrl || ''}
                      onChange={(e) => updateHotspot(hp.id, { mediaUrl: e.target.value })}
                      placeholder="Image URL (https://…)"
                      className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
                    />
                  )}
                  {hp.type === 'video' && (
                    <input
                      value={hp.mediaUrl || ''}
                      onChange={(e) => updateHotspot(hp.id, { mediaUrl: e.target.value })}
                      placeholder="Video URL (YouTube/Vimeo/mp4)"
                      className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
                    />
                  )}
                  {hp.type === 'info' && (
                    <textarea
                      value={hp.article || ''}
                      onChange={(e) => updateHotspot(hp.id, { article: e.target.value })}
                      placeholder="Article / long text content"
                      rows={3}
                      className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white resize-none"
                    />
                  )}

                  <div className="flex items-center gap-2">
                    <select
                      value={hp.category}
                      onChange={(e) =>
                        updateHotspot(hp.id, { category: e.target.value as HotspotCategory })
                      }
                      className="flex-1 bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
                    >
                      {(['material', 'furniture', 'spatial', 'lighting', 'architecture', 'acoustic', 'portal', 'custom'] as HotspotCategory[]).map(
                        (c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        )
                      )}
                    </select>
                    <select
                      value={hp.color || 'emerald'}
                      onChange={(e) =>
                        updateHotspot(hp.id, { color: e.target.value as HotspotColor })
                      }
                      className="flex-1 bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
                    >
                      {(['rose', 'emerald', 'cyan', 'amber', 'violet', 'blue'] as HotspotColor[]).map(
                        (c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              ))}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
