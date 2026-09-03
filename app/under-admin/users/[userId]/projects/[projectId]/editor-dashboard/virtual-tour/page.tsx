'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Plus,
  Upload,
  ChevronLeft,
  Settings,
  Image as ImageIcon,
  Wand2,
} from 'lucide-react';

const TourViewer = dynamic(() => import('@/components/xr/TourViewer'), { ssr: false });

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

export default function VirtualTourEditorPage() {
  const params = useParams<{ userId: string; projectId: string }>();
  const userId = params?.userId;
  const projectId = params?.projectId;

  const [rooms, setRooms] = useState<TourRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [addMode, setAddMode] = useState(false);
  const [mediaAssets, setMediaAssets] = useState<{ name: string; url: string }[]>([]);
  const [viewerSettings, setViewerSettings] = useState({
    mouseViewMode: 'drag' as 'drag' | 'qtvr',
    autorotateEnabled: false,
    fullscreenButton: true,
    viewControlButtons: true,
  });

  const imgRef = React.useRef<HTMLImageElement>(null);
  const dragHpRef = React.useRef<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!userId || !projectId) {
    notFound();
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    async function load() {
      try {
        const res = await fetch(`/api/tour?tour=${encodeURIComponent(projectId)}`);
        if (!res.ok) throw new Error('failed to load tour');
        const data = await res.json();
        if (cancelled) return;
        const rooms = (data.rooms || []).map((r: any) => ({
          ...r,
          defaultHotspots: r.defaultHotspots || r.hotspots || [],
        }));
        setRooms(rooms);
        setSelectedId((prev) => prev || rooms[0]?.id || '');
        setSaved(false);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'failed to load tour');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  useEffect(() => {
    let cancelled = false;
    async function loadMedia() {
      try {
        const res = await fetch('/api/tour/media');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setMediaAssets(Array.isArray(data.assets) ? data.assets : []);
      } catch {
        // media is optional
      }
    }
    loadMedia();
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = rooms.find((r) => r.id === selectedId) || rooms[0];

  const updateRoom = (roomId: string, updater: (r: TourRoom) => TourRoom) => {
    setRooms((prev) => prev.map((r) => (r.id === roomId ? updater(r) : r)));
    setSaved(false);
  };

  const persistRooms = async (nextRooms: TourRoom[]) => {
    setRooms(nextRooms);
    setSaved(false);
    try {
      const res = await fetch(`/api/tour?tour=${encodeURIComponent(projectId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rooms: nextRooms, version: 1 }),
      });
      if (!res.ok) throw new Error('save failed');
      setSaved(true);
    } catch (e: any) {
      setError(e?.message || 'save failed');
    }
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !selected) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/tour/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('upload failed');
      const { url } = await res.json();
      updateRoom(selected.id, (r) => ({ ...r, panoramaUrl: url, thumbnailUrl: url }));
      await persistRooms(
        rooms.map((r) => (r.id === selected.id ? { ...r, panoramaUrl: url, thumbnailUrl: url } : r)),
      );
    } catch (e: any) {
      setError(e?.message || 'upload failed');
    } finally {
      setUploading(false);
    }
  };

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
    const next = rooms.map((r) =>
      r.id === selected.id ? { ...r, defaultHotspots: [...r.defaultHotspots, newHp] } : r,
    );
    void persistRooms(next);
    setAddMode(false);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#27272A]">
        <div className="flex items-center gap-3">
          <Link
            href={`/under-admin/users/${userId}/projects/${projectId}/editor-dashboard`}
            className="inline-flex items-center gap-1 text-[10px] font-mono text-[#A1A1AA] hover:text-white"
          >
            <ChevronLeft className="w-3 h-3" />
            Back
          </Link>
          <div>
            <h1 className="text-sm font-mono font-bold text-white">Virtual Tour Editor</h1>
            <p className="text-[10px] font-mono text-[#71717A]">
              {userId} / {projectId} / virtual-tour
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-[10px] font-mono ${saved ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-400'}`}>
            {saved ? 'Saved' : 'Unsaved'}
          </span>
          <span className="px-2 py-1 rounded bg-amber-500/15 text-amber-400 text-[10px] font-mono">Phase 2 wired shell</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
        {error && (
          <div className="px-3 py-2 bg-rose-950/40 border border-rose-900 text-rose-300 text-xs font-mono rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-xs font-mono text-[#71717A] py-12">Loading virtual tour editor…</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-lg border border-[#27272A] bg-[#0c0c0f] overflow-hidden">
              <div className="p-3 border-b border-[#27272A] flex items-center justify-between">
                <div className="text-xs font-mono text-[#A1A1AA]">Viewer</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAddMode((v) => !v)}
                    className={`px-3 py-1.5 rounded text-xs font-mono border ${addMode ? 'bg-[#3ECF8E] text-black border-[#3ECF8E]' : 'bg-[#18181B] border-[#27272A] text-white hover:border-[#3ECF8E]'}`}
                  >
                    {addMode ? 'Placing hotspot…' : 'Add hotspot'}
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded bg-[#18181B] border border-[#27272A] text-xs font-mono text-white hover:border-[#3ECF8E]"
                  >
                    <Upload className="w-3 h-3 inline mr-1" />
                    {uploading ? 'Uploading…' : 'Upload 360'}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileSelected} />
                </div>
              </div>
              <div className="aspect-video bg-black">
                {selected && selected.panoramaUrl ? (
                  <img
                    ref={imgRef}
                    src={selected.panoramaUrl}
                    alt={selected.name}
                    className={`w-full h-full object-contain ${addMode ? 'cursor-crosshair' : ''}`}
                    onClick={handleImageClick}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-[#71717A]">
                    Upload a panorama or select a scene to preview.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-[#27272A] bg-[#0c0c0f] p-4 space-y-3">
              <div className="text-xs font-mono text-[#A1A1AA]">Editor context</div>
              <div className="text-[10px] font-mono text-[#71717A]">
                User: <span className="text-white">{userId}</span>
                <br />
                Project: <span className="text-white">{projectId}</span>
                <br />
                Service: <span className="text-white">virtual-tour</span>
                <br />
                Scenes: <span className="text-white">{rooms.length}</span>
              </div>
              <div className="pt-2 text-[10px] font-mono text-[#71717A]">
                This shell is now wired to the existing tour API. Existing `/api/tour/*` behavior is preserved; new project/service-aware APIs can replace this backend path in a later phase.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
