'use client';

import React, { useState, useRef } from 'react';
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
import { useTourStore } from '@/lib/tourClientStore';
import { TourGraphView } from './TourGraphView';

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
  const [showGraph, setShowGraph] = useState(false);
  const scenes = useTourStore((s) => s.scenes);
  const setScenes = useTourStore((s) => s.setScenes);
  const addRoom = useTourStore((s) => s.addRoom);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setSaving(true);
    const data = useTourStore.getState().scenes;
    localStorage.setItem('viztr-tour-builder', JSON.stringify(data));
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLoad = () => {
    const saved = localStorage.getItem('viztr-tour-builder');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setScenes(data);
      } catch (e) {
        console.error('Failed to load tour:', e);
      }
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
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#3ECF8E] hover:bg-[#34BF7D] text-black text-xs font-mono font-bold">
            Publish
          </button>
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
