'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import HotspotStyleTabs from '@/components/editor/HotspotStyleTabs';
import OrientationBar from '@/components/editor/OrientationBar';
// Code-split heavy tab panels to keep initial bundle small.
const SceneConfigPanel = dynamic(
  () => import('@/components/editor/SceneConfigPanel'),
  { ssr: false, loading: () => <div className="p-3 text-[10px] font-mono text-[#71717A]">Loading scene…</div> },
);
const ViewConstraintsPanel = dynamic(
  () => import('@/components/editor/ViewConstraintsPanel'),
  { ssr: false },
);
const DesignTabPanel = dynamic(
  () => import('@/components/editor/DesignTabPanel'),
  { ssr: false, loading: () => <div className="p-4 text-[10px] font-mono text-[#71717A]">Loading design…</div> },
);
const ComponentStylesPanel = dynamic(
  () => import('@/components/editor/ComponentStylesPanel'),
  { ssr: false },
);
const FloorplanManager = dynamic(
  () => import('@/components/editor/FloorplanManager'),
  { ssr: false, loading: () => <div className="p-4 text-[10px] font-mono text-[#71717A]">Loading floorplan…</div> },
);
const MapManager = dynamic(
  () => import('@/components/editor/MapManager'),
  { ssr: false },
);
const CanvasTab = dynamic(
  () => import('@/components/editor/CanvasTab'),
  { ssr: false, loading: () => <div className="p-4 text-[10px] font-mono text-[#71717A]">Loading canvas…</div> },
);
const CtaControlBarPanel = dynamic(
  () => import('@/components/editor/CtaControlBarPanel'),
  { ssr: false },
);
const MarketingPanel = dynamic(
  () => import('@/components/editor/MarketingPanel'),
  { ssr: false, loading: () => <div className="p-4 text-[10px] font-mono text-[#71717A]">Loading marketing…</div> },
);
const ContentSettingsPanel = dynamic(
  () => import('@/components/editor/ContentSettingsPanel'),
  { ssr: false },
);
import { useAppStore } from '@/lib/store';
import { VTED_CONTROL_BAR_DEFAULTS } from '@/lib/vted-types';
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
  type: 'metadata' | 'room_link' | 'image' | 'video' | 'info' | 'audio' | 'link';
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
  externalUrl?: string;
  audioUrl?: string;
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
  featured?: boolean;
  backgroundAudioUrl?: string;
  nadirLogoUrl?: string;
  brightness?: number;
  contrast?: number;
  modelUrl?: string;
  lat?: number;
  lng?: number;
  floorPlanX?: number;
  floorPlanY?: number;
}

export default function TourEditorPage() {
  const { showToast } = useAppStore();
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
  const [sectionTab, setSectionTab] = useState<'editor' | 'design' | 'components' | 'content' | 'settings' | 'model' | 'marketing' | 'floorplan' | 'map' | 'canvas' | 'cta'>('editor');
  const [mediaAssets, setMediaAssets] = useState<{ name: string; url: string }[]>([]);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragHpRef = useRef<string | null>(null);

  const load = useCallback(async () => {
    try {
      const url = new URL(typeof window !== 'undefined' ? window.location.href : 'http://localhost/');
      const queryTour = url.searchParams.get('tour');
      const lsTour = typeof window !== 'undefined' ? localStorage.getItem('viztr_active_tour') : null;
      const tourId = queryTour || lsTour || '';
      const res = await fetch(`/api/tour${tourId ? `?tour=${tourId}` : ''}`);
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

  const loadMedia = useCallback(async () => {
    try {
      const res = await fetch('/api/tour/media');
      const data = await res.json();
      setMediaAssets(Array.isArray(data.assets) ? data.assets : []);
    } catch {
      setMediaAssets([]);
    }
  }, []);

  const addFromLibrary = (url: string) => {
    const name = url.split('/').pop()?.split('.')[0] || `Node ${rooms.length + 1}`;
    const id = `node-${Date.now().toString(36)}`;
    setRooms((prev) => [
      ...prev,
      {
        id,
        name,
        subtitle: 'New scene',
        panoramaUrl: url,
        thumbnailUrl: url,
        initialYaw: 0,
        initialPitch: 0,
        defaultHotspots: [],
      },
    ]);
    setSelectedId(id);
    setSaved(false);
  };

  const selected = rooms.find((r) => r.id === selectedId) || rooms[0];

  const [settings, setSettings] = useState<{
    live: boolean;
    publicUrl: string;
    theme: { accentColor: string; logoUrl: string; title: string };
    accessLevel: 'public' | 'private';
    version: number;
    vted?: Record<string, unknown>;
  } | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/tour/settings');
      const data = await res.json();
      setSettings({
        live: data.live !== false,
        publicUrl: data.publicUrl || '/xr-world/virtual-tour',
        theme: { ...data.theme },
        accessLevel: data.accessLevel === 'private' ? 'private' : 'public',
        version: typeof data.version === 'number' ? data.version : 1,
      });
    } catch {
      setSettings(null);
    }
  }, []);

  const persistSettings = useCallback(async (next: any) => {
    await fetch('/api/tour/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    });
    setSettings(next);
  }, []);

  useEffect(() => {
    if (sectionTab === 'design' || sectionTab === 'settings') loadSettings();
    if (sectionTab === 'editor') loadMedia();
  }, [sectionTab, loadSettings, loadMedia]);

  const updateRoom = (roomId: string, updater: (r: TourRoom) => TourRoom) => {
    setRooms((prev) => prev.map((r) => (r.id === roomId ? updater(r) : r)));
    setSaved(false);
  };

  const setRoomField = (field: keyof TourRoom, value: any) => {
    if (!selected) return;
    updateRoom(selected.id, (r) => ({ ...r, [field]: value }));
  };

  const setFeaturedScene = () => {
    if (!selected) return;
    setRooms((prev) => prev.map((r) => ({ ...r, featured: r.id === selected.id })));
    setSaved(false);
  };

  // Non-editor tabs (settings / model / marketing) extracted to a plain
  // function-returning-JSX to avoid deeply-nested ternary brace fragility.
  const renderNonEditorTab = () => {
    if (sectionTab === 'marketing') {
      return (
        <div className="flex-1 overflow-y-auto">
          {settings && (
            <MarketingPanel
              value={
                (settings as any).vted?.marketing || {
                  forms: [],
                  scripts: [],
                }
              }
              onChange={(marketing) => {
                setSettings({ ...settings, vted: { ...(settings as any).vted, marketing } } as any);
                setSaved(false);
              }}
              onSave={() => persistSettings(settings)}
              saved={saved}
              roomOptions={rooms.map((r) => ({ id: r.id, name: r.name }))}
              hotspotOptions={rooms.flatMap((r) =>
                r.defaultHotspots.map((h) => ({ id: h.id, name: h.title || '(untitled)' })),
              )}
            />
          )}
        </div>
      );
    }
    if (sectionTab === 'model') {
      return (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-xl mx-auto space-y-4">
            <h2 className="text-sm font-mono font-bold text-[#3ECF8E]">Model — 3D Embed</h2>
            <label className="block text-xs font-mono text-[#A1A1AA]">3D model URL (GLB/GLTF)</label>
            <input
              value={selected?.modelUrl || ''}
              onChange={(e) => selected && setRoomField('modelUrl', e.target.value)}
              placeholder="https://…/model.glb"
              className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
            />
            <p className="text-[10px] font-mono text-[#71717A]">
              Attach a 3D model to the selected scene. The viewer overlays the model on the panorama.
            </p>
          </div>
        </div>
      );
    }
    // settings (default)
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-xl mx-auto space-y-4">
          <h2 className="text-sm font-mono font-bold text-[#3ECF8E]">Settings — Publish</h2>
          {settings && (
            <>
              <div className="flex items-center justify-between rounded-lg border border-[#27272A] bg-[#0c0c0f] p-3">
                <span className="text-xs font-mono text-white">Tour is {settings.live ? 'LIVE' : 'OFFLINE'}</span>
                <button
                  onClick={() => persistSettings({ ...settings, live: !settings.live })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono ${settings.live ? 'bg-rose-500/20 text-rose-300' : 'bg-[#3ECF8E] text-black'}`}
                >
                  {settings.live ? 'Take Offline' : 'Go Live'}
                </button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-[#27272A] bg-[#0c0c0f] p-3">
                <span className="text-xs font-mono text-white">Access: {settings.accessLevel}</span>
                <button
                  onClick={() => persistSettings({ ...settings, accessLevel: settings.accessLevel === 'private' ? 'public' : 'private' })}
                  className="px-3 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-xs font-mono text-white"
                >
                  Toggle {settings.accessLevel === 'private' ? 'Public' : 'Private'}
                </button>
              </div>
              <button
                onClick={() => persistSettings({ ...settings, version: (settings.version || 1) + 1 })}
                className="px-3 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-xs font-mono text-white"
              >
                Clear Cache (v{settings.version || 1})
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const replacePanorama = async (file: File) => {
    if (!selected) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/tour/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('upload failed');
      const { url } = await res.json();
      updateRoom(selected.id, (r) => ({ ...r, panoramaUrl: url, thumbnailUrl: url }));
    } catch (e: any) {
      setError(e?.message || 'upload failed');
    } finally {
      setUploading(false);
    }
  };

  const uploadAudio = async (file: File) => {
    if (!selected) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('kind', 'audio');
      const res = await fetch('/api/tour/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('audio upload failed');
      const { url } = await res.json();
      updateRoom(selected.id, (r) => ({ ...r, backgroundAudioUrl: url }));
    } catch (e: any) {
      setError(e?.message || 'audio upload failed');
    } finally {
      setUploading(false);
    }
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
      const url = new URL(typeof window !== 'undefined' ? window.location.href : 'http://localhost/');
      const queryTour = url.searchParams.get('tour');
      const lsTour = typeof window !== 'undefined' ? localStorage.getItem('viztr_active_tour') : null;
      const tourId = queryTour || lsTour || '';
      const res = await fetch(`/api/tour${tourId ? `?tour=${tourId}` : ''}`, {
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

      {/* SECTION NAV TABS */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-[#27272A] bg-[#0c0c0f] overflow-x-auto">
        {([
          ['editor', 'Tour Editor'],
          ['canvas', 'Canvas'],
          ['design', 'Design'],
          ['components', 'Components'],
          ['floorplan', 'Floorplan'],
          ['map', 'Map'],
          ['cta', 'CTA & Bar'],
          ['content', 'Content'],
          ['model', 'Model'],
          ['marketing', 'Marketing'],
          ['settings', 'Settings'],
        ] as const).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setSectionTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono ${
              sectionTab === tab
                ? 'bg-[#3ECF8E] text-black font-bold'
                : 'bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="px-4 py-2 bg-rose-950/40 border-b border-rose-900 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      {sectionTab === 'editor' ? (
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

          {/* MEDIA LIBRARY */}
          <details className="group">
            <summary className="cursor-pointer text-[10px] font-mono uppercase tracking-wider text-[#71717A] px-1 py-1 select-none">
              Media Library ({mediaAssets.length})
            </summary>
            <div className="mt-1 space-y-1 max-h-48 overflow-y-auto">
              {mediaAssets.length === 0 ? (
                <div className="text-[10px] font-mono text-[#555] px-1">No assets yet</div>
              ) : (
                mediaAssets.map((a) => (
                  <button
                    key={a.url}
                    onClick={() => addFromLibrary(a.url)}
                    className="w-full flex items-center gap-2 rounded border border-[#27272A] hover:border-[#3ECF8E]/40 p-1"
                    title={`Add ${a.name} as new node`}
                  >
                    <div
                      className="w-7 h-7 rounded bg-cover bg-center shrink-0 border border-[#27272A]"
                      style={{ backgroundImage: `url(${a.url})` }}
                    />
                    <span className="text-[10px] font-mono text-[#A1A1AA] truncate">{a.name}</span>
                  </button>
                ))
              )}
            </div>
          </details>

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
                  style={{
                    filter: `brightness(${(selected.brightness ?? 100) / 100}) contrast(${(selected.contrast ?? 100) / 100})`,
                  }}
                />

                {/* Phase 3: Orientation bar + mini-map overlay */}
                <OrientationBar
                  yaw={selected.initialYaw}
                  pitch={selected.initialPitch}
                  roll={0}
                  initialYaw={selected.initialYaw}
                  initialPitch={selected.initialPitch}
                  hotspotCount={selected.defaultHotspots.length}
                  panoramaUrl={selected.panoramaUrl}
                  hotspots={selected.defaultHotspots.map((h) => ({ id: h.id, xPercent: h.xPercent, yPercent: h.yPercent }))}
                  onSaveDefault={() => {
                    showToast('Default view set to current orientation.', 'success');
                  }}
                  onSetNorth={() => {
                    setRoomField('initialYaw', 0);
                    setRoomField('initialPitch', 0);
                    showToast('North set to 0°.', 'success');
                  }}
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
              {/* SCENE CONFIGURATION PANEL (VTDF: Identity / Nadir / Staging / Filter) */}
              <SceneConfigPanel
                room={selected}
                onUpdate={(patch) => updateRoom(selected.id, (r) => ({ ...r, ...patch }))}
                onReplacePanorama={replacePanorama}
                onUploadAudio={uploadAudio}
                onSetFeatured={setFeaturedScene}
                isFeatured={!!selected.featured}
                uploading={uploading}
                audioUploading={uploading}
              />

              {/* Phase 3: View Constraints */}
              <ViewConstraintsPanel
                value={
                  (selected as any).viewConstraints || {
                    top: -90,
                    bottom: 90,
                    left: -180,
                    right: 180,
                    zoomMin: 60,
                    zoomMax: 150,
                    mobileZoomEnabled: false,
                  }
                }
                onChange={(vc) => updateRoom(selected.id, (r) => ({ ...r, viewConstraints: vc } as any))}
              />

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
                  {/* Coordinates row */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#71717A]">
                      {hp.xPercent}% , {hp.yPercent}%
                    </span>
                  </div>

                  {/* VTDF Hotspot Style / Label / Point / Global tabs */}
                  <HotspotStyleTabs
                    hotspot={hp}
                    onChange={(patch) => updateHotspot(hp.id, patch)}
                    onDelete={() => deleteHotspot(hp.id)}
                    onCopy={() => {
                      const copy = { ...hp, id: `hp-${Date.now()}-${Math.random()}` };
                      updateRoom(selected.id, (r) => ({
                        ...r,
                        defaultHotspots: [...r.defaultHotspots, copy],
                      }));
                    }}
                  />

                  {/* Legacy core fields (title, description, media) kept for backward compat */}
                  <div className="pt-2 mt-2 border-t border-[#27272A] space-y-2">
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
                    {hp.type === 'audio' && (
                      <input
                        value={hp.audioUrl || ''}
                        onChange={(e) => updateHotspot(hp.id, { audioUrl: e.target.value })}
                        placeholder="Audio URL (mp3/wav)"
                        className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
                      />
                    )}
                    {hp.type === 'link' && (
                      <input
                        value={hp.externalUrl || ''}
                        onChange={(e) => updateHotspot(hp.id, { externalUrl: e.target.value })}
                        placeholder="https://… (product / external link)"
                        className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
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
                </div>
              ))}
            </>
          )}
        </aside>
      </div>
      ) : sectionTab === 'design' ? (
        <div className="flex-1 overflow-y-auto">
          {settings && (
            <DesignTabPanel
              value={
                (settings as any).vted?.design || {
                  preset: 'default',
                  primaryColor: settings.theme.accentColor,
                  textColor: '#FAFAFA',
                  primaryFont: 'Inter',
                  secondaryFont: 'Inter',
                }
              }
              onChange={(design) => {
                const next = { ...settings, vted: { ...(settings as any).vted, design } } as any;
                // Also keep the legacy `theme.accentColor` in sync
                next.theme = { ...settings.theme, accentColor: design.primaryColor || settings.theme.accentColor };
                setSettings(next);
                setSaved(false);
              }}
              onSave={() => persistSettings(settings)}
              saved={saved}
            />
          )}
        </div>
      ) : sectionTab === 'components' ? (
        <div className="flex-1 overflow-y-auto">
          {settings && (
            <ComponentStylesPanel
              form={
                (settings as any).vted?.formStyle || {
                  layout: 'dialog',
                  position: 'right',
                  backgroundColor: '#18181B',
                  overlayColor: '#00000080',
                }
              }
              polygon={
                (settings as any).vted?.polygonStyle || {
                  backgroundColor: '#FFFFFF20',
                  backgroundHoverColor: '#FFFFFF50',
                  borderColor: '#3ECF8E',
                  borderHoverColor: '#3ECF8E',
                  borderWidth: 2,
                }
              }
              popup={
                (settings as any).vted?.popupStyle || {
                  backgroundColor: '#18181B',
                  textColor: '#FAFAFA',
                }
              }
              onChangeForm={(formStyle) => {
                setSettings({ ...settings, vted: { ...(settings as any).vted, formStyle } } as any);
                setSaved(false);
              }}
              onChangePolygon={(polygonStyle) => {
                setSettings({ ...settings, vted: { ...(settings as any).vted, polygonStyle } } as any);
                setSaved(false);
              }}
              onChangePopup={(popupStyle) => {
                setSettings({ ...settings, vted: { ...(settings as any).vted, popupStyle } } as any);
                setSaved(false);
              }}
              onSave={() => persistSettings(settings)}
              saved={saved}
            />
          )}
        </div>
      ) : sectionTab === 'floorplan' ? (
        <div className="flex-1 overflow-y-auto">
          {settings && (
            <FloorplanManager
              display={(settings as any).vted?.floorplanDisplay}
              onChangeDisplay={(floorplanDisplay) => {
                setSettings({ ...settings, vted: { ...(settings as any).vted, floorplanDisplay } } as any);
                setSaved(false);
              }}
              onSave={() => persistSettings(settings)}
              saved={saved}
            />
          )}
        </div>
      ) : sectionTab === 'map' ? (
        <div className="flex-1 overflow-y-auto">
          {settings && (
            <MapManager
              rooms={rooms}
              onUpdateRoom={(roomId, lat, lng) =>
                updateRoom(roomId, (r) => ({ ...r, lat, lng } as any))
              }
              display={(settings as any).vted?.googleMap}
              onChangeDisplay={(googleMap) => {
                setSettings({ ...settings, vted: { ...(settings as any).vted, googleMap } } as any);
                setSaved(false);
              }}
              onSave={() => persistSettings(settings)}
              saved={saved}
            />
          )}
        </div>
      ) : sectionTab === 'canvas' ? (
        <CanvasTab
          rooms={rooms}
          onUpdateRoom={(roomId, x, y) =>
            updateRoom(roomId, (r) => ({ ...r, floorPlanX: x, floorPlanY: y } as any))
          }
          onAutoLink={() => {
            // Create portal hotspots between scenes within ~0.02 degree lat/lng
            const radius = 0.02;
            const updates: Record<string, any> = {};
            rooms.forEach((r) => {
              const rLat = (r as any).lat;
              const rLng = (r as any).lng;
              if (typeof rLat !== 'number' || typeof rLng !== 'number') return;
              rooms.forEach((o) => {
                if (o.id === r.id) return;
                const oLat = (o as any).lat;
                const oLng = (o as any).lng;
                if (typeof oLat !== 'number' || typeof oLng !== 'number') return;
                const dLat = Math.abs(rLat - oLat);
                const dLng = Math.abs(rLng - oLng);
                if (dLat <= radius && dLng <= radius) {
                  const existing = r.defaultHotspots.find(
                    (h) => h.type === 'room_link' && (h as any).targetRoomId === o.id,
                  );
                  if (!existing) {
                    const hp = {
                      id: `hp-${Date.now()}-${Math.random()}`,
                      xPercent: 50,
                      yPercent: 50,
                      title: `→ ${o.name}`,
                      type: 'room_link' as const,
                      category: 'portal' as const,
                      description: '',
                      targetRoomId: o.id,
                      targetRoomName: o.name,
                      targetPanoramaUrl: o.panoramaUrl,
                      targetYaw: 180,
                      icon: 'door',
                      color: 'emerald',
                    };
                    updates[r.id] = {
                      ...r,
                      defaultHotspots: [...r.defaultHotspots, hp],
                    };
                  }
                }
              });
            });
            if (Object.keys(updates).length > 0) {
              setRooms((prev) => prev.map((r) => updates[r.id] || r));
              setSaved(false);
              showToast(`Auto-linked ${Object.keys(updates).length} scene(s).`, 'success');
            } else {
              showToast('No scenes within GPS radius.', 'info');
            }
          }}
          onSave={save}
          saved={saved}
        />
      ) : sectionTab === 'cta' ? (
        <div className="flex-1 overflow-y-auto">
          {settings && (
            <CtaControlBarPanel
              cta={
                (settings as any).vted?.callToAction || {
                  layout: 'bubble',
                  position: 'right',
                  offsetLeft: 0,
                  offsetRight: 24,
                  offsetBottom: 96,
                }
              }
              onChangeCta={(callToAction) => {
                setSettings({ ...settings, vted: { ...(settings as any).vted, callToAction } } as any);
                setSaved(false);
              }}
              controlBar={(settings as any).vted?.controlBar || { items: VTED_CONTROL_BAR_DEFAULTS }}
              onChangeControlBar={(controlBar) => {
                setSettings({ ...settings, vted: { ...(settings as any).vted, controlBar } } as any);
                setSaved(false);
              }}
              onSave={() => persistSettings(settings)}
              saved={saved}
            />
          )}
        </div>
      ) : sectionTab === 'content' ? (
        <div className="flex-1 overflow-y-auto">
          {settings && (
            <ContentSettingsPanel
              value={
                (settings as any).vted?.content || {
                  multiLanguage: false,
                }
              }
              onChange={(content) => {
                setSettings({ ...settings, vted: { ...(settings as any).vted, content } } as any);
                setSaved(false);
              }}
              onSave={() => persistSettings(settings)}
              saved={saved}
              sceneOptions={rooms.map((r) => ({ id: r.id, name: r.name }))}
            />
          )}

          <div className="max-w-3xl mx-auto px-4 pb-4 space-y-3">
            <h2 className="text-sm font-mono font-bold text-[#3ECF8E]">All Hotspots</h2>
            {rooms.map((r) => (
              <div key={r.id} className="rounded-lg border border-[#27272A] bg-[#0c0c0f] p-3">
                <div className="text-xs font-mono text-white mb-1">{r.name}</div>
                {r.defaultHotspots.length === 0 ? (
                  <div className="text-[10px] font-mono text-[#71717A]">No hotspots</div>
                ) : (
                  r.defaultHotspots.map((h) => (
                    <div key={h.id} className="text-[10px] font-mono text-[#A1A1AA] flex justify-between">
                      <span>{h.title || '(untitled)'}</span>
                      <span className="text-[#71717A]">{h.type}</span>
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        renderNonEditorTab()
      )}
    </div>
  );
}

