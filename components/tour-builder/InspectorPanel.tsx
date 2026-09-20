'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Image,
  Video,
  Music,
  FileText,
  Globe,
  MapPin,
  Layers,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Trash2,
  Copy,
  Move,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useTourStore } from '@/lib/tourClientStore';
import type { TourScene, TourHotspot } from '@/lib/tourClientStore';

interface InspectorPanelProps {
  roomId: string;
  hotspotId: string;
}

function Section({
  title,
  icon: Icon,
  defaultOpen = true,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#27272A]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-mono font-bold text-[#71717A] hover:bg-white/5"
      >
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        <Icon className="w-3 h-3" />
        {title}
      </button>
      {open && <div className="px-3 pb-3 space-y-2">{children}</div>}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[10px] font-mono text-[#71717A] block mb-1">{label}</label>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1.5 text-xs font-mono text-white placeholder:text-[#71717A]"
    />
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="flex-1 bg-[#18181B] border border-[#27272A] rounded px-2 py-1.5 text-xs font-mono text-white"
      />
      {unit && <span className="text-[10px] font-mono text-[#71717A]">{unit}</span>}
    </div>
  );
}

export function InspectorPanel({ roomId, hotspotId }: InspectorPanelProps) {
  const scenes = useTourStore((s) => s.scenes);
  const updateScene = useTourStore((s) => s.updateScene);
  const deleteScene = useTourStore((s) => s.deleteScene);
  const duplicateRoom = useTourStore((s) => s.duplicateRoom);
  const room = scenes.find((r) => r.id === roomId);
  const hotspot = room?.hotspots?.find((h) => h.id === hotspotId);

  if (hotspot && room) {
    const handleHotspotUpdate = (patch: Partial<TourHotspot>) => {
      const hotspots = room.hotspots.map((h) =>
        h.id === hotspot.id ? { ...h, ...patch } : h
      );
      updateScene(room.id, { hotspots });
    };

    return (
      <div className="h-full overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#27272A]">
          <span className="text-xs font-mono font-bold text-white">HOTSPOT</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const hotspots = room.hotspots.filter((h) => h.id !== hotspot.id);
                updateScene(room.id, { hotspots });
              }}
              className="p-1 rounded hover:bg-white/5"
              title="Delete Hotspot"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#71717A]" />
            </button>
          </div>
        </div>

        <Section title="Type" icon={MapPin}>
          <select
            value={hotspot.type}
            onChange={(e) => handleHotspotUpdate({ type: e.target.value as any })}
            className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1.5 text-xs font-mono text-white"
          >
            <option value="link">Navigation (Link)</option>
            <option value="info">Info</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
            <option value="product">Product</option>
          </select>
        </Section>

        <Section title="Content" icon={FileText}>
          <Field label="Title">
            <TextInput value={hotspot.title} onChange={(v) => handleHotspotUpdate({ title: v })} />
          </Field>
          <Field label="Description">
            <textarea
              value={hotspot.description}
              onChange={(e) => handleHotspotUpdate({ description: e.target.value })}
              className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1.5 text-xs font-mono text-white h-20 resize-none"
              placeholder="Optional description..."
            />
          </Field>
        </Section>

        <Section title="Position" icon={Move}>
          <Field label="Yaw">
            <NumberInput
              value={hotspot.yaw}
              onChange={(v) => handleHotspotUpdate({ yaw: v })}
              min={-360}
              max={360}
              step={0.1}
              unit="deg"
            />
          </Field>
          <Field label="Pitch">
            <NumberInput
              value={hotspot.pitch}
              onChange={(v) => handleHotspotUpdate({ pitch: v })}
              min={-90}
              max={90}
              step={0.1}
              unit="deg"
            />
          </Field>
          <button className="w-full px-2 py-1.5 rounded bg-[#27272A] text-[10px] font-mono text-[#A1A1AA] hover:bg-[#3F3F46]">
            Reset Position
          </button>
        </Section>

        {hotspot.type === 'link' && (
          <Section title="Navigation Target" icon={Globe}>
            <Field label="Destination Room">
              <select
                value={hotspot.targetSceneId || ''}
                onChange={(e) => handleHotspotUpdate({ targetSceneId: e.target.value })}
                className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1.5 text-xs font-mono text-white"
              >
                <option value="">Select room...</option>
                {scenes
                  .filter((s) => s.id !== room.id)
                  .map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
              </select>
            </Field>
            <Field label="Target Yaw">
              <NumberInput
                value={hotspot.targetYaw || 0}
                onChange={(v) => handleHotspotUpdate({ targetYaw: v })}
                min={-360}
                max={360}
                step={0.1}
                unit="deg"
              />
            </Field>
          </Section>
        )}

        {(hotspot.type === 'image' || hotspot.type === 'video') && (
          <Section title="Media" icon={hotspot.type === 'image' ? Image : Video}>
            <Field label="URL">
              <TextInput
                value={(hotspot as any).mediaUrl || ''}
                onChange={(v) => handleHotspotUpdate({ mediaUrl: v } as any)}
                placeholder="https://..."
              />
            </Field>
            {hotspot.type === 'image' && (
              <>
                <Field label="Width">
                  <NumberInput
                    value={(hotspot as any).mediaWidth || 400}
                    onChange={(v) => handleHotspotUpdate({ mediaWidth: v } as any)}
                    unit="px"
                  />
                </Field>
                <Field label="Height">
                  <NumberInput
                    value={(hotspot as any).mediaHeight || 300}
                    onChange={(v) => handleHotspotUpdate({ mediaHeight: v } as any)}
                    unit="px"
                  />
                </Field>
              </>
            )}
          </Section>
        )}

        {hotspot.type === 'audio' && (
          <Section title="Audio" icon={Music}>
            <Field label="Audio URL">
              <TextInput
                value={(hotspot as any).audioUrl || ''}
                onChange={(v) => handleHotspotUpdate({ audioUrl: v } as any)}
                placeholder="https://..."
              />
            </Field>
          </Section>
        )}
      </div>
    );
  }

  if (room) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#27272A]">
          <span className="text-xs font-mono font-bold text-white">ROOM</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => duplicateRoom(room.id)}
              className="p-1 rounded hover:bg-white/5"
              title="Duplicate Room"
            >
              <Copy className="w-3.5 h-3.5 text-[#71717A]" />
            </button>
            <button
              onClick={() => {
                if (confirm('Delete this room?')) deleteScene(room.id);
              }}
              className="p-1 rounded hover:bg-white/5"
              title="Delete Room"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#71717A]" />
            </button>
          </div>
        </div>

        <Section title="General" icon={Layers}>
          <Field label="Name">
            <TextInput
              value={room.name}
              onChange={(v) => updateScene(room.id, { name: v })}
            />
          </Field>
          <Field label="Type">
            <select
              value={room.type}
              onChange={(e) => updateScene(room.id, { type: e.target.value as any })}
              className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1.5 text-xs font-mono text-white"
            >
              <option value="360">360 Panorama</option>
              <option value="3d">3D Scene</option>
            </select>
          </Field>
        </Section>

        <Section title="Panorama" icon={Image}>
          <Field label="Image URL">
            <TextInput
              value={room.url}
              onChange={(v) => updateScene(room.id, { url: v })}
              placeholder="https://..."
            />
          </Field>
          <Field label="Thumbnail URL">
            <TextInput
              value={room.thumbnailUrl}
              onChange={(v) => updateScene(room.id, { thumbnailUrl: v })}
              placeholder="https://..."
            />
          </Field>
        </Section>

        <Section title="Start View" icon={Eye}>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Yaw">
              <NumberInput
                value={room.initialYaw}
                onChange={(v) => updateScene(room.id, { initialYaw: v })}
                min={-360}
                max={360}
                step={1}
                unit="deg"
              />
            </Field>
            <Field label="Pitch">
              <NumberInput
                value={room.initialPitch}
                onChange={(v) => updateScene(room.id, { initialPitch: v })}
                min={-90}
                max={90}
                step={1}
                unit="deg"
              />
            </Field>
            <Field label="FOV">
              <NumberInput
                value={room.initialFov}
                onChange={(v) => updateScene(room.id, { initialFov: v })}
                min={30}
                max={120}
                step={1}
                unit="deg"
              />
            </Field>
          </div>
          <button className="w-full px-2 py-1.5 rounded bg-[#27272A] text-[10px] font-mono text-[#A1A1AA] hover:bg-[#3F3F46]">
            Reset to Current View
          </button>
        </Section>

        <Section title="View Constraints" icon={ZoomIn} defaultOpen={false}>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Min FOV">
              <NumberInput
                value={room.viewConstraints?.zoomMin || 60}
                onChange={(v) =>
                  updateScene(room.id, {
                    viewConstraints: { ...room.viewConstraints, zoomMin: v },
                  })
                }
                min={10}
                max={120}
                unit="deg"
              />
            </Field>
            <Field label="Max FOV">
              <NumberInput
                value={room.viewConstraints?.zoomMax || 120}
                onChange={(v) =>
                  updateScene(room.id, {
                    viewConstraints: { ...room.viewConstraints, zoomMax: v },
                  })
                }
                min={10}
                max={120}
                unit="deg"
              />
            </Field>
          </div>
        </Section>

        <Section title="Auto-Rotate" icon={RotateCcw} defaultOpen={false}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#A1A1AA]">Enabled</span>
            <button
              onClick={() =>
                updateScene(room.id, { autorotateEnabled: !room.autorotateEnabled })
              }
              className={`w-8 h-4 rounded-full transition-colors ${
                room.autorotateEnabled ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full bg-white transform transition-transform ${
                  room.autorotateEnabled ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
          {room.autorotateEnabled && (
            <Field label="Speed">
              <NumberInput
                value={room.autorotateSpeed || 0.5}
                onChange={(v) => updateScene(room.id, { autorotateSpeed: v })}
                min={0.1}
                max={5}
                step={0.1}
                unit="rev/min"
              />
            </Field>
          )}
        </Section>

        <Section title="Hotspots" icon={MapPin} defaultOpen={false}>
          <div className="text-xs font-mono text-[#A1A1AA]">
            {room.hotspots?.length || 0} hotspots
          </div>
          {room.hotspots?.map((hs) => (
            <div
              key={hs.id}
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5"
            >
              <MapPin className="w-3 h-3 text-[#71717A]" />
              <span className="text-xs font-mono text-[#A1A1AA] truncate">{hs.title || hs.type}</span>
            </div>
          ))}
        </Section>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="text-center">
        <MapPin className="w-8 h-8 text-[#27272A] mx-auto mb-2" />
        <p className="text-xs text-[#71717A] font-mono">Select a room or hotspot to inspect</p>
      </div>
    </div>
  );
}
