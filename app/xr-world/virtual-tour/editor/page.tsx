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
import { EditorHeader } from '@/components/editor/shell/EditorHeader';
import { SectionTabs } from '@/components/editor/shell/SectionTabs';
import { NodeListSidebar } from '@/components/editor/shell/NodeListSidebar';
import { EditorRightSidebar } from '@/components/editor/shell/EditorRightSidebar';
import PanoramaPreview from '@/components/editor/PanoramaPreview';
import ImportPreviewModal from '@/components/editor/ImportPreviewModal';
import {
  useEditorStore,
  useEditorHistory,
  type SectionTab,
} from '@/lib/editorStore';
import { analyzeZip, importTourFromZip } from '@/lib/marzipano/importer';
import { exportTourToZip, makeExportFilename } from '@/lib/marzipano/exporter';
import type { ImportAnalysis } from '@/lib/marzipano/importer';
import { useAppStore } from '@/lib/store';
import { VTED_CONTROL_BAR_DEFAULTS } from '@/lib/vted-types';
import {
  Save,
  Plus,
  MapPin,
  DoorOpen,
  Loader2,
  CheckCircle2,
  PanelLeftOpen,
  PanelRightOpen,
  Info,
  FilePlus,
  Upload,
  FolderUp,
  Compass,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  useEffect(() => {
    router.replace('/under-admin/users/demo-user/projects/demo-project/editor-dashboard/virtual-tour');
  }, [router]);
  const { showToast } = useAppStore();
  const { undo, redo, canUndo, canRedo } = useEditorHistory();

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inEditable =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      if (inEditable) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      } else if (
        mod &&
        (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))
      ) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  const [rooms, setRooms] = useState<TourRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>('');
  const [addMode, setAddMode] = useState(false);
  const [addHotspotKind, setAddHotspotKind] = useState<'metadata' | 'info' | 'room_link' | null>(null);
  const [linkTargetId, setLinkTargetId] = useState<string>('');
  const [currentYaw, setCurrentYaw] = useState(0);
  const [currentPitch, setCurrentPitch] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [draggingOver, setDraggingOver] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string>('');
  const [sectionTab, setSectionTab] = useState<'editor' | 'design' | 'components' | 'content' | 'settings' | 'model' | 'marketing' | 'floorplan' | 'map' | 'canvas' | 'cta'>('editor');
  const [mediaAssets, setMediaAssets] = useState<{ name: string; url: string }[]>([]);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragHpRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const settingsRequestIdRef = useRef(0);
  const [importModal, setImportModal] = useState<ImportAnalysis | null>(null);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const [pendingImportHadCubes, setPendingImportHadCubes] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [viewerSettings, setViewerSettings] = useState({
    mouseViewMode: 'drag' as 'drag' | 'qtvr',
    autorotateEnabled: false,
    fullscreenButton: true,
    viewControlButtons: true,
  });

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
    const requestId = ++settingsRequestIdRef.current;
    setSettingsLoading(true);
    try {
      const res = await fetch('/api/tour/settings');
      if (requestId !== settingsRequestIdRef.current) return;
      if (!res.ok) {
        setSettings(null);
        return;
      }
      const data = await res.json();
      if (requestId !== settingsRequestIdRef.current) return;
      if (!data || typeof data !== 'object') {
        setSettings(null);
        return;
      }
      setSettings({
        live: data.live !== false,
        publicUrl: data.publicUrl || '/xr-world/virtual-tour',
        theme: {
          accentColor: '#3ECF8E',
          logoUrl: '',
          title: 'VizTR Virtual Tour',
          ...(data.theme || {}),
        },
        accessLevel: data.accessLevel === 'private' ? 'private' : 'public',
        version: typeof data.version === 'number' ? data.version : 1,
      });
    } catch {
      if (requestId !== settingsRequestIdRef.current) return;
      setSettings(null);
    } finally {
      if (requestId === settingsRequestIdRef.current) setSettingsLoading(false);
    }
  }, []);

  const persistSettings = useCallback(async (next: any) => {
    try {
      const res = await fetch('/api/tour/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
      if (!res.ok) {
        setError(`Save failed (${res.status})`);
        return;
      }
      setSettings(next);
    } catch (e: any) {
      setError(e?.message || 'save failed');
    }
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
          {settings ? (
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
          ) : (
            <SettingsUnavailable loading={settingsLoading} onRetry={loadSettings} />
          )}
        </div>
      );
    }
    if (sectionTab === 'model') {
      return (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-xl mx-auto space-y-4">
            <h2 className="text-sm font-mono font-bold text-[#3ECF8E]">Model — 3D Embed</h2>
            {selected ? (
              <div className="rounded-lg border border-[#27272A] bg-[#0c0c0f] p-3 space-y-2">
                <div className="text-[10px] font-mono text-[#A1A1AA]">
                  Scene: <span className="text-white">{selected.name}</span>
                </div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">
                  3D model URL (GLB / GLTF)
                </label>
                <input
                  value={selected.modelUrl || ''}
                  onChange={(e) => setRoomField('modelUrl', e.target.value)}
                  placeholder="https://…/model.glb"
                  className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1.5 text-xs font-mono text-white"
                />
                <p className="text-[10px] font-mono text-[#71717A]">
                  The viewer overlays the model on the panorama. Saved as part of the room.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[#27272A] bg-[#0c0c0f] p-6 text-center text-xs font-mono text-[#71717A]">
                Select a scene to attach a 3D model.
              </div>
            )}
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

          <h2 className="text-sm font-mono font-bold text-[#3ECF8E] pt-4">Tour Viewer</h2>
          <div className="rounded-lg border border-[#27272A] bg-[#0c0c0f] p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-white">Mouse view mode</span>
              <select
                value={viewerSettings.mouseViewMode}
                onChange={(e) =>
                  setViewerSettings((s) => ({
                    ...s,
                    mouseViewMode: e.target.value as 'drag' | 'qtvr',
                  }))
                }
                className="bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs font-mono text-white"
              >
                <option value="drag">Drag (click and look)</option>
                <option value="qtvr">QTVR</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-white">Autorotate</span>
              <button
                type="button"
                onClick={() =>
                  setViewerSettings((s) => ({ ...s, autorotateEnabled: !s.autorotateEnabled }))
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono ${
                  viewerSettings.autorotateEnabled
                    ? 'bg-[#3ECF8E] text-black'
                    : 'bg-[#18181B] border border-[#27272A] text-[#A1A1AA]'
                }`}
              >
                {viewerSettings.autorotateEnabled ? 'On' : 'Off'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-white">Fullscreen button</span>
              <button
                type="button"
                onClick={() =>
                  setViewerSettings((s) => ({ ...s, fullscreenButton: !s.fullscreenButton }))
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono ${
                  viewerSettings.fullscreenButton
                    ? 'bg-[#3ECF8E] text-black'
                    : 'bg-[#18181B] border border-[#27272A] text-[#A1A1AA]'
                }`}
              >
                {viewerSettings.fullscreenButton ? 'On' : 'Off'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-white">View control buttons</span>
              <button
                type="button"
                onClick={() =>
                  setViewerSettings((s) => ({ ...s, viewControlButtons: !s.viewControlButtons }))
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono ${
                  viewerSettings.viewControlButtons
                    ? 'bg-[#3ECF8E] text-black'
                    : 'bg-[#18181B] border border-[#27272A] text-[#A1A1AA]'
                }`}
              >
                {viewerSettings.viewControlButtons ? 'On' : 'Off'}
              </button>
            </div>
            <p className="text-[10px] font-mono text-[#71717A]">
              These settings are embedded in the exported Marzipano tour ZIP and used by the public viewer.
            </p>
          </div>
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

  const openFilePicker = () => fileInputRef.current?.click();

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImporting(true);
    try {
      const analysis = await analyzeZip(file);
      if (!analysis.ok) {
        showToast(analysis.fatal || 'Import failed.', 'error');
        return;
      }
      if (analysis.cubeCount === 0) {
        await commitImport(file, false);
        return;
      }
      setPendingImportFile(file);
      setPendingImportHadCubes(true);
      setImportModal(analysis);
    } finally {
      setImporting(false);
    }
  };

  const commitImport = async (file: File, hadCubes: boolean) => {
    setImporting(true);
    try {
      const result = await importTourFromZip(file);
      if (!result.ok || !result.tour) {
        showToast(result.fatal || 'Import failed.', 'error');
        return;
      }
      setRooms(result.tour.rooms);
      setSelectedId(result.tour.rooms[0]?.id || '');
      setSaved(false);
      const importedCount = result.tour.rooms.length;
      if (hadCubes) {
        showToast(
          `Imported ${importedCount} scene(s), skipped cube scene(s).`,
          'success',
        );
      } else {
        showToast(`Imported ${importedCount} scene(s).`, 'success');
      }
      if (result.warnings.length > 0) {
        const summary = result.warnings
          .slice(0, 3)
          .map((w) => w.message)
          .join(' · ');
        showToast(summary, 'info');
      }
    } catch (err: any) {
      showToast(err?.message || 'Import failed.', 'error');
    } finally {
      setImporting(false);
      setImportModal(null);
      setPendingImportFile(null);
      setPendingImportHadCubes(false);
    }
  };

  const cancelImport = () => {
    setImportModal(null);
    setPendingImportFile(null);
    setPendingImportHadCubes(false);
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const blob = await exportTourToZip(rooms as any, {
        tourName: tourName || 'tour',
        viewerSettings,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = makeExportFilename(tourName || 'tour');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Exported ${a.download}`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Export failed.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleNewTour = () => {
    if (rooms.length > 0 && !saved) {
      const ok = typeof window !== 'undefined'
        ? window.confirm('Start a new tour? Unsaved changes will be lost.')
        : true;
      if (!ok) return;
    }
    setRooms([]);
    setSelectedId('');
    setSaved(true);
    setError('');
    setAddMode(false);
    setAddHotspotKind(null);
    setLinkTargetId('');
    showToast('New tour started. Upload panoramas to begin.', 'info');
  };

  const tourName = rooms[0]?.name?.split(' - ')[0] || 'tour';

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
        body: JSON.stringify({ version: settings?.version ?? 1, rooms }),
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
      <EditorHeader
        roomsCount={rooms.length}
        hotspotsCount={rooms.reduce((a, r) => a + r.defaultHotspots.length, 0)}
        saved={saved}
        saving={saving}
        canUndo={canUndo}
        canRedo={canRedo}
        onSave={save}
        onUndo={undo}
        onRedo={redo}
        onImportTour={openFilePicker}
        onExportTour={handleExport}
        onNewTour={handleNewTour}
        busy={importing || uploading || exporting}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".zip,application/zip"
        onChange={onFileSelected}
        className="hidden"
        aria-hidden="true"
      />

      <ImportPreviewModal
        open={importModal !== null}
        tourName={importModal?.tourName || ''}
        totalScenes={importModal?.sceneCount || 0}
        equirectCount={importModal?.equirectCount || 0}
        cubeCount={importModal?.cubeCount || 0}
        hotspotCount={importModal?.hotspotCount || 0}
        onConfirm={() => pendingImportFile && commitImport(pendingImportFile, pendingImportHadCubes)}
        onCancel={cancelImport}
      />

      <SectionTabs active={sectionTab} onChange={setSectionTab} />

      {error && (
        <div className="px-4 py-2 bg-rose-950/40 border-b border-rose-900 text-rose-300 text-xs font-mono flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError('')}
            className="text-rose-400 hover:text-rose-200 text-xs"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {settingsLoading && settings === null && sectionTab !== 'editor' && sectionTab !== 'model' && (
        <div className="px-4 py-2 border-b border-[#27272A] bg-[#0c0c0f] text-[#A1A1AA] text-xs font-mono flex items-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin" />
          Loading settings…
        </div>
      )}

      {sectionTab === 'editor' ? (
      <div className="flex flex-1 min-h-0">
        <div
          className={
            leftOpen
              ? 'shrink-0 overflow-hidden transition-[width] duration-200'
              : 'w-0 shrink-0 overflow-hidden border-r border-[#27272A] transition-[width] duration-200'
          }
        >
          <NodeListSidebar
            rooms={rooms}
            selectedId={selectedId}
            featuredId={rooms.find((r) => r.featured)?.id || ''}
            editingNodeId={editingNodeId}
            mediaAssets={mediaAssets}
            draggingOver={draggingOver}
            uploading={uploading}
            onSelect={setSelectedId}
            onStartRename={setEditingNodeId}
            onCommitRename={(id, name) => renameNode(id, name)}
            onMove={moveNode}
            onDuplicate={duplicateNode}
            onDelete={deleteNode}
            onAddFromLibrary={addFromLibrary}
            onUploadFiles={uploadFiles}
            onSetDraggingOver={setDraggingOver}
            onCollapse={() => setLeftOpen(false)}
          />
        </div>
        {!leftOpen && (
          <button
            type="button"
            onClick={() => setLeftOpen(true)}
            aria-label="Expand nodes panel"
            aria-pressed="true"
            title="Expand nodes panel"
            className="w-6 shrink-0 border-r border-[#27272A] flex items-center justify-center text-[#71717A] hover:text-white hover:bg-[#18181B]"
          >
            <PanelLeftOpen className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Preview + placement */}
        <main className="flex-1 flex flex-col min-w-0" onPointerMove={onHpPointerMove} onPointerUp={onHpPointerUp}>
          {selected ? (
            <>
              <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
                <PanoramaPreview
                  panoramaUrl={selected.panoramaUrl}
                  hotspots={selected.defaultHotspots.map((h) => ({
                    id: h.id,
                    xPercent: h.xPercent,
                    yPercent: h.yPercent,
                    title: h.title,
                    type: h.type as any,
                  }))}
                  initialYaw={selected.initialYaw}
                  initialPitch={selected.initialPitch}
                  addMode={addMode}
                  onViewChange={(yawDeg, pitchDeg) => {
                    setCurrentYaw(yawDeg);
                    setCurrentPitch(pitchDeg);
                  }}
                  onHotspotClick={(id) => {
                    // Scroll the hotspot into view in the inspector
                    const el = document.querySelector(`[data-hotspot-inspector="${id}"]`);
                    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  onHotspotPositionChange={(id, xPct, yPct) => {
                    updateHotspot(id, {
                      xPercent: xPct,
                      yPercent: yPct,
                    });
                  }}
                  onRequestAddHotspot={(xPct, yPct) => {
                    const kind = addHotspotKind || 'metadata';
                    let newHp: Hotspot;
                    if (kind === 'room_link') {
                      if (!linkTargetId) {
                        showToast('Pick a target scene before placing a link hotspot.', 'error');
                        return;
                      }
                      const target = rooms.find((r) => r.id === linkTargetId);
                      newHp = {
                        id: `hp-${Date.now()}-${Math.random()}`,
                        xPercent: xPct,
                        yPercent: yPct,
                        title: target ? `→ ${target.name}` : 'Portal',
                        type: 'room_link',
                        category: 'portal',
                        description: '',
                        targetRoomId: linkTargetId,
                        targetRoomName: target?.name,
                        targetPanoramaUrl: target?.panoramaUrl,
                        targetYaw: 180,
                        color: 'emerald',
                        icon: 'door',
                      };
                    } else if (kind === 'info') {
                      newHp = {
                        id: `hp-${Date.now()}-${Math.random()}`,
                        xPercent: xPct,
                        yPercent: yPct,
                        title: 'Info',
                        type: 'info',
                        category: 'custom',
                        description: '',
                        article: '',
                        color: 'cyan',
                        icon: 'info',
                      };
                    } else {
                      newHp = {
                        id: `hp-${Date.now()}-${Math.random()}`,
                        xPercent: xPct,
                        yPercent: yPct,
                        title: 'New Hotspot',
                        type: 'metadata',
                        category: 'custom',
                        description: '',
                        color: 'emerald',
                        icon: 'info',
                      };
                    }
                    updateRoom(selected.id, (r) => ({
                      ...r,
                      defaultHotspots: [...r.defaultHotspots, newHp],
                    }));
                    setAddMode(false);
                    setAddHotspotKind(null);
                  }}
                  className="w-full h-full"
                />

                {/* Phase 3: Orientation bar + mini-map overlay */}
                <OrientationBar
                  yaw={currentYaw}
                  pitch={currentPitch}
                  roll={0}
                  initialYaw={selected.initialYaw}
                  initialPitch={selected.initialPitch}
                  hotspotCount={selected.defaultHotspots.length}
                  panoramaUrl={selected.panoramaUrl}
                  hotspots={selected.defaultHotspots.map((h) => ({ id: h.id, xPercent: h.xPercent, yPercent: h.yPercent }))}
                  onSaveDefault={() => {
                    updateRoom(selected.id, (r) => ({
                      ...r,
                      initialYaw: Math.round(currentYaw * 10) / 10,
                      initialPitch: Math.round(currentPitch * 10) / 10,
                    }));
                    showToast(
                      `Default view set: ${Math.round(currentYaw)}° / ${Math.round(currentPitch)}°.`,
                      'success',
                    );
                  }}
                  onSetNorth={() => {
                    setRoomField('initialYaw', 0);
                    setRoomField('initialPitch', 0);
                    showToast('North set to 0°.', 'success');
                  }}
                />

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
                  {addMode && addHotspotKind === 'room_link' && (
                    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-full bg-[#18181B]/95 border border-[#27272A] shadow-xl backdrop-blur">
                      <span className="text-[10px] font-mono text-[#A1A1AA]">Target:</span>
                      <select
                        value={linkTargetId}
                        onChange={(e) => setLinkTargetId(e.target.value)}
                        className="bg-[#09090B] border border-[#27272A] rounded px-1.5 py-0.5 text-[10px] font-mono text-white max-w-[180px]"
                      >
                        <option value="">Select scene…</option>
                        {rooms
                          .filter((r) => r.id !== selected.id)
                          .map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 px-1.5 py-1.5 rounded-full bg-[#18181B]/95 border border-[#27272A] shadow-xl backdrop-blur">
                    <button
                      type="button"
                      onClick={() => {
                        const next = addMode && addHotspotKind === 'metadata' ? false : true;
                        setAddMode(next);
                        setAddHotspotKind(next ? 'metadata' : null);
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                        addMode && addHotspotKind === 'metadata'
                          ? 'bg-emerald-500 text-black'
                          : 'text-[#A1A1AA] hover:text-white'
                      }`}
                      title="Add metadata hotspot"
                    >
                      <MapPin className="w-3 h-3" /> Metadata
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const next = addMode && addHotspotKind === 'info' ? false : true;
                        setAddMode(next);
                        setAddHotspotKind(next ? 'info' : null);
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                        addMode && addHotspotKind === 'info'
                          ? 'bg-cyan-500 text-black'
                          : 'text-[#A1A1AA] hover:text-white'
                      }`}
                      title="Add info hotspot"
                    >
                      <Info className="w-3 h-3" /> Info
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const next = addMode && addHotspotKind === 'room_link' ? false : true;
                        setAddMode(next);
                        setAddHotspotKind(next ? 'room_link' : null);
                        if (!next) setLinkTargetId('');
                      }}
                      disabled={rooms.filter((r) => r.id !== selected.id).length === 0}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                        addMode && addHotspotKind === 'room_link'
                          ? 'bg-violet-500 text-black'
                          : 'text-[#A1A1AA] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed'
                      }`}
                      title="Add link hotspot to another scene"
                    >
                      <DoorOpen className="w-3 h-3" /> Link
                    </button>
                    {addMode && (
                      <button
                        type="button"
                        onClick={() => {
                          setAddMode(false);
                          setAddHotspotKind(null);
                          setLinkTargetId('');
                        }}
                        className="ml-1 px-2 py-1 rounded-full text-[10px] font-mono text-[#A1A1AA] hover:text-white"
                        title="Cancel"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  {addMode && (
                    <div className="px-3 py-1 rounded-full bg-[#3ECF8E] text-black text-[10px] font-mono font-bold animate-pulse shadow-xl">
                      Click on the panorama to place a{' '}
                      {addHotspotKind === 'room_link' ? 'link' : addHotspotKind} hotspot
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : rooms.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="max-w-md w-full text-center space-y-4 rounded-xl border border-[#27272A] bg-[#0c0c0f] p-6">
                <Compass className="w-10 h-10 text-[#3ECF8E] mx-auto" />
                <h2 className="text-sm font-mono font-bold text-white">
                  Create your first virtual tour
                </h2>
                <p className="text-[11px] font-mono text-[#A1A1AA]">
                  Upload one or more 360° panoramas to get started. You can add hotspots,
                  set initial views, and connect scenes with link hotspots.
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#3ECF8E] hover:bg-[#34b876] text-black text-xs font-bold font-mono cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    Upload panoramas
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => e.target.files && uploadFiles(e.target.files)}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={openFilePicker}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#27272A] bg-[#18181B] text-[#A1A1AA] hover:text-white text-xs font-mono font-bold"
                  >
                    <FolderUp className="w-3.5 h-3.5" />
                    Import ZIP
                  </button>
                </div>
                <p className="text-[10px] font-mono text-[#71717A] pt-2">
                  Recommended: 4096×2048 equirectangular JPG, 80–90% quality.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-[#71717A] font-mono">
              Upload or select a node to begin.
            </div>
          )}
        </main>

        {/* Hotspot inspector */}
        {selected && rightOpen && (
          <EditorRightSidebar
            selected={selected}
            allRooms={rooms}
            onUpdateRoom={(patch) => updateRoom(selected.id, (r) => ({ ...r, ...patch }))}
            onReplacePanorama={replacePanorama}
            onUploadAudio={uploadAudio}
            onSetFeatured={setFeaturedScene}
            uploading={uploading}
            onUpdateHotspot={updateHotspot}
            onDeleteHotspot={deleteHotspot}
            onCopyHotspot={(hpId) => {
              const hp = selected.defaultHotspots.find((h) => h.id === hpId);
              if (hp) {
                updateRoom(selected.id, (r) => ({
                  ...r,
                  defaultHotspots: [
                    ...r.defaultHotspots,
                    { ...hp, id: `hp-${Date.now()}-${Math.random()}` },
                  ],
                }));
              }
            }}
            onSetPortalTarget={setPortalTarget}
            onCollapse={() => setRightOpen(false)}
          />
        )}
        {selected && !rightOpen && (
          <button
            type="button"
            onClick={() => setRightOpen(true)}
            aria-label="Expand inspector panel"
            aria-pressed="true"
            title="Expand inspector panel"
            className="w-6 shrink-0 border-l border-[#27272A] flex items-center justify-center text-[#71717A] hover:text-white hover:bg-[#18181B]"
          >
            <PanelRightOpen className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      ) : sectionTab === 'design' ? (
        <div className="flex-1 overflow-y-auto">
          {settings ? (
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
          ) : (
            <SettingsUnavailable loading={settingsLoading} onRetry={loadSettings} />
          )}
        </div>
      ) : sectionTab === 'components' ? (
        <div className="flex-1 overflow-y-auto">
          {settings ? (
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
          ) : (
            <SettingsUnavailable loading={settingsLoading} onRetry={loadSettings} />
          )}
        </div>
      ) : sectionTab === 'floorplan' ? (
        <div className="flex-1 overflow-y-auto">
          {settings ? (
            <FloorplanManager
              display={(settings as any).vted?.floorplanDisplay}
              onChangeDisplay={(floorplanDisplay) => {
                setSettings({ ...settings, vted: { ...(settings as any).vted, floorplanDisplay } } as any);
                setSaved(false);
              }}
              onSave={() => persistSettings(settings)}
              saved={saved}
            />
          ) : (
            <SettingsUnavailable loading={settingsLoading} onRetry={loadSettings} />
          )}
        </div>
      ) : sectionTab === 'map' ? (
        <div className="flex-1 overflow-y-auto">
          {settings ? (
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
          ) : (
            <SettingsUnavailable loading={settingsLoading} onRetry={loadSettings} />
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
          {settings ? (
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
          ) : (
            <SettingsUnavailable loading={settingsLoading} onRetry={loadSettings} />
          )}
        </div>
      ) : sectionTab === 'content' ? (
        <div className="flex-1 overflow-y-auto">
          {settings ? (
            <>
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
            </>
          ) : (
            <SettingsUnavailable loading={settingsLoading} onRetry={loadSettings} />
          )}
        </div>
      ) : (
        renderNonEditorTab()
      )}
    </div>
  );
}

function SettingsUnavailable({
  loading,
  onRetry,
}: {
  loading: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-3 rounded-xl border border-[#27272A] bg-[#0c0c0f] p-6">
        <div className="text-[#3ECF8E] text-sm font-mono font-bold">
          {loading ? 'Loading settings…' : 'Settings unavailable'}
        </div>
        <p className="text-[10px] font-mono text-[#A1A1AA]">
          {loading
            ? 'Fetching the latest tour configuration.'
            : 'Could not load tour settings. Check your connection and retry.'}
        </p>
        {!loading && (
          <button
            type="button"
            onClick={onRetry}
            className="px-3 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34b876] text-black text-xs font-bold font-mono"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

