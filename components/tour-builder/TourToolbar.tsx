'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Eye,
  PanelLeftOpen,
  PanelRightOpen,
  Map,
  CheckCircle,
  Upload,
  Download,
  FolderOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTourStore } from '@/lib/tourClientStore';
import { TourGraphView } from './TourGraphView';
import { validateTour } from './ValidationPanel';
import { resolveExperienceId } from '@/lib/experienceResolver';

interface TourToolbarProps {
  projectId: string;
  experienceId?: string;
  leftOpen: boolean;
  rightOpen: boolean;
  validationOpen: boolean;
  onToggleLeft: () => void;
  onToggleRight: () => void;
  onToggleValidation: () => void;
  selectedRoomId?: string;
  onSelectRoom?: (id: string) => void;
}

export function TourToolbar({
  projectId,
  experienceId,
  leftOpen,
  rightOpen,
  validationOpen,
  onToggleLeft,
  onToggleRight,
  onToggleValidation,
  selectedRoomId = '',
  onSelectRoom = () => {},
}: TourToolbarProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishUrl, setPublishUrl] = useState('');
  const scenes = useTourStore((s) => s.scenes);
  const setScenes = useTourStore((s) => s.setScenes);
  const addRoom = useTourStore((s) => s.addRoom);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevScenesRef = useRef<string>('');

  useEffect(() => {
    const scenesStr = JSON.stringify(scenes);
    if (prevScenesRef.current && scenesStr !== prevScenesRef.current) {
      setDirty(true);
    }
    prevScenesRef.current = scenesStr;
  }, [scenes]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const scenes = useTourStore.getState().scenes;
      const url = new URL(window.location.href);
      const tourId = url.searchParams.get('tour') || localStorage.getItem('viztr_active_tour') || '';
      const res = await fetch(`/api/tour${tourId ? `?tour=${encodeURIComponent(tourId)}` : ''}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: 1,
          rooms: scenes,
          title: scenes[0]?.name || 'Tour',
          projectId,
          experienceId: experienceId || undefined,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      const saved = await res.json();
      const slug = saved?.slug || tourId;
      localStorage.setItem('viztr_active_tour', slug);
      const next = new URL(window.location.href);
      next.searchParams.set('tour', slug);
      if (projectId) next.searchParams.set('project', projectId);
      if (experienceId) next.searchParams.set('experience', experienceId);
      window.history.replaceState({}, '', next.toString());
      setSaved(true);
      setDirty(false);
      toast.success('Tour saved');
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      setError(e?.message || 'Save failed');
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    const scenes = useTourStore.getState().scenes;
    const errors = validateTour(scenes).filter((i) => i.type === 'error');
    if (errors.length > 0) {
      onToggleValidation();
      alert(`Fix ${errors.length} issue(s) before publishing:\n${errors.map((e) => e.message).join('\n')}`);
      return;
    }

    if (!confirm('Publish this tour? This will make it live.')) return;
    setPublishing(true);
    try {
      await handleSave();

      // Experience Config sync — surfaced, non-blocking.
      const expId = experienceId || (await resolveExperienceId({ projectId })).experienceId || undefined;
      if (expId) {
        try {
          const { serializeTourForExperienceConfig } = await import('@/lib/marzipano/tour-config-serializer');
          const config = serializeTourForExperienceConfig(scenes as any, null, projectId, expId);
          const res = await fetch('/api/experience-configs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              experience_id: expId,
              config: { tour: config.tour },
              assets: config.assets,
              settings: {
                tour: config.settings,
                assets: config.assets,
                metadata: config.metadata,
              },
            }),
          });
          if (!res.ok && res.status !== 401) {
            toast.error('Tour saved, but Experience Config sync failed.');
          }
        } catch {
          toast.error('Tour saved, but Experience Config sync failed.');
        }
      }

      const url = new URL(window.location.href);
      const tourParam = url.searchParams.get('tour') || localStorage.getItem('viztr_active_tour') || '';
      const setRes = await fetch(`/api/tour/settings${tourParam ? `?tour=${encodeURIComponent(tourParam)}` : ''}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ live: true, accessLevel: 'public' }),
      });
      if (!setRes.ok) {
        const body = await setRes.json().catch(() => null);
        throw new Error(body?.error || `Publish failed (${setRes.status})`);
      }
      const setData = await setRes.json();
      const slug = setData?.slug || tourParam;
      if (slug) localStorage.setItem('viztr_active_tour', slug);
      const publicUrl = `/virtual-tour/${slug}`;
      setPublished(true);
      setPublishUrl(publicUrl);
      toast.success('Tour published!');
    } catch (e: any) {
      toast.error(e?.message || 'Publish failed');
      alert(e?.message || 'Publish failed');
    } finally {
      setPublishing(false);
    }
  };

  useEffect(() => {
    const handleSaveEvent = () => {
      handleSave();
    };
    window.addEventListener('tour-builder-save', handleSaveEvent);
    return () => window.removeEventListener('tour-builder-save', handleSaveEvent);
  }, []);

  const handleLoad = async () => {
    try {
      const url = new URL(window.location.href);
      const tourId = url.searchParams.get('tour') || localStorage.getItem('viztr_active_tour') || '';
      const res = await fetch(`/api/tour${tourId ? `?tour=${encodeURIComponent(tourId)}` : ''}`);
      if (!res.ok) throw new Error('Load failed');
      const data = await res.json();
      if (data.rooms) {
        setScenes(data.rooms);
      }
      if (data.slug) {
        localStorage.setItem('viztr_active_tour', data.slug);
        const next = new URL(window.location.href);
        next.searchParams.set('tour', data.slug);
        if (projectId) next.searchParams.set('project', projectId);
        window.history.replaceState({}, '', next.toString());
      }
    } catch (e) {
      console.error('Failed to load tour:', e);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const name = file.name.replace(/\.[^/.]+$/, '');
        addRoom({
          name,
          type: '360',
          url,
          thumbnailUrl: url,
          initialYaw: 0,
          initialPitch: 0,
          initialFov: 75,
          hotspots: [],
        });
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExport = () => {
    const data = useTourStore.getState().scenes;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tour-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFromDirectory = () => {
    const images = [
      '00.jpg', '01.jpg', '02.jpg', '03.jpg', '04.jpg',
      '05.jpg', '06.jpg', '07.jpg', '08.jpg', '09.jpg',
      '10.jpg', '11.jpg', '12.jpg', '13.jpg', '14.jpg',
      '15.jpg', '16.jpg', '17.jpg',
    ];
    images.forEach((img, index) => {
      addRoom({
        name: `Room ${index + 1}`,
        type: '360',
        url: `/360-images/${img}`,
        thumbnailUrl: `/360-images/${img}`,
        initialYaw: 0,
        initialPitch: 0,
        initialFov: 75,
        hotspots: [],
      });
    });
  };

  return (
    <>
      <div className="h-12 border-b border-[#27272A] flex items-center justify-between px-4 bg-[#09090B]">
        <div className="flex items-center gap-2">
          <button onClick={onToggleLeft} className="p-1.5 rounded hover:bg-white/5" title="Toggle Left Panel">
            <PanelLeftOpen className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-[#27272A]" />
          <button onClick={handleLoad} className="p-1.5 rounded hover:bg-white/5" title="Load Saved Tour">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={handleExport} className="p-1.5 rounded hover:bg-white/5" title="Export Tour">
            <Upload className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#71717A]">Tour Builder</span>
          <span className="text-[10px] font-mono text-[#52525B]">&bull;</span>
          <span className="text-[10px] font-mono text-[#52525B]">{scenes.length} rooms</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGraph(true)}
            className="p-1.5 rounded hover:bg-white/5"
            title="Tour Map"
          >
            <Map className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleValidation}
            className={`p-1.5 rounded hover:bg-white/5 ${validationOpen ? 'text-[#3ECF8E]' : ''}`}
            title="Validate"
          >
            <CheckCircle className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-[#27272A]" />
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#27272A] hover:bg-[#3F3F46] text-xs font-mono"
          >
            {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
            {dirty && !saved && <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />}
            {error && <span className="text-red-500 text-[10px]">{error}</span>}
          </button>
          <button
            onClick={handleImportFromDirectory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#27272A] hover:bg-[#3F3F46] text-xs font-mono"
            title="Import 360 Images"
          >
            <FolderOpen className="w-3.5 h-3.5" /> Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#27272A] hover:bg-[#3F3F46] text-xs font-mono"
            title="Upload Images"
          >
            <Upload className="w-3.5 h-3.5" /> Upload
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-black text-xs font-mono font-bold ${publishing ? 'bg-[#34BF7D] cursor-wait' : published ? 'bg-[#22C55E]' : 'bg-[#3ECF8E] hover:bg-[#34BF7D]'}`}
          >
            {publishing ? 'Publishing...' : published ? 'Published ✓' : 'Publish'}
          </button>
          {published && publishUrl && (
            <a
              href={publishUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono text-[#3ECF8E] underline hover:text-[#34BF7D]"
            >
              View Live
            </a>
          )}
          <button onClick={onToggleRight} className="p-1.5 rounded hover:bg-white/5">
            <PanelRightOpen className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showGraph && (
        <TourGraphView
          selectedRoomId={selectedRoomId}
          onSelectRoom={onSelectRoom}
          onClose={() => setShowGraph(false)}
        />
      )}
    </>
  );
}
