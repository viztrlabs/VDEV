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
  type: 'metadata' | 'room_link';
  category: HotspotCategory;
  description: string;
  targetRoomId?: string;
  targetRoomName?: string;
  targetPanoramaUrl?: string;
  targetYaw?: number;
  icon?: string;
  color?: HotspotColor;
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
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/tour');
      const data = await res.json();
      setRooms(data.rooms || []);
      setSelectedId((prev) => prev || (data.rooms?.[0]?.id ?? ''));
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

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!addMode || !selected) return;
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
    const newHp: Hotspot = {
      id: `hp-${Date.now()}`,
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
        {/* Node list */}
        <aside className="w-56 shrink-0 border-r border-[#27272A] overflow-y-auto p-2 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] px-1 pb-1">
            Nodes
          </div>
          {rooms.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedId(r.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${
                r.id === selectedId
                  ? 'bg-[#18181B] text-[#3ECF8E] border border-[#3ECF8E]/30'
                  : 'hover:bg-[#18181B] text-zinc-300'
              }`}
            >
              <div
                className="w-8 h-8 rounded bg-cover bg-center shrink-0 border border-[#27272A]"
                style={{ backgroundImage: `url(${r.thumbnailUrl})` }}
              />
              <div className="min-w-0">
                <div className="text-xs font-medium truncate">{r.name}</div>
                <div className="text-[10px] text-[#71717A]">{r.defaultHotspots.length} hotspots</div>
              </div>
            </button>
          ))}
        </aside>

        {/* Preview + placement */}
        <main className="flex-1 flex flex-col min-w-0">
          {selected && (
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
                {/* hotspot markers */}
                {selected.defaultHotspots.map((hp) => (
                  <button
                    key={hp.id}
                    onClick={() => setSelectedId(selected.id)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                    style={{ left: `${hp.xPercent}%`, top: `${hp.yPercent}%` }}
                    title={hp.title}
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
                  No hotspots. Click “Add Hotspot” then click the image to place one.
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

                  <label className="flex items-center gap-2 text-[10px] font-mono text-[#A1A1AA]">
                    <input
                      type="checkbox"
                      checked={hp.type === 'room_link'}
                      onChange={(e) =>
                        e.target.checked
                          ? setPortalTarget(hp.id, rooms.find((r) => r.id !== selected.id)?.id || '')
                          : updateHotspot(hp.id, {
                              type: 'metadata',
                              category: 'custom',
                              targetRoomId: undefined,
                              targetRoomName: undefined,
                              targetPanoramaUrl: undefined,
                            })
                      }
                    />
                    Link to another node (portal)
                  </label>

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
