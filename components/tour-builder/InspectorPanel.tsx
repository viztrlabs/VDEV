'use client';

import React, { useState, useRef } from 'react';
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
  Trash2,
  Copy,
  Move,
  Eye,
  Navigation,
  Info,
  Images,
  ExternalLink,
  Box,
  Star,
  Sliders,
  Compass,
  Settings,
} from 'lucide-react';
import { useTourStore } from '@/lib/tourClientStore';
import type { TourScene, TourHotspot, HotspotType } from '@/lib/tourClientStore';
import { IconPicker } from './IconPicker';
import { getViewportView } from '@/lib/tour-builder/viewportView';

async function uploadAsset(file: File): Promise<{ url: string; tileUrl?: string | null }> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/tour/upload', { method: 'POST', body: form });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Upload failed');
  }
  return res.json();
}

function ImageInput({ onUpdate }: { onUpdate: (patch: Partial<TourHotspot>) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={inputRef}
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (!f) return;
          setBusy(true);
          setError(null);
          uploadAsset(f)
            .then(({ url, tileUrl }) => onUpdate({ imageUrl: url, tileUrl: tileUrl || undefined }))
            .catch((err) => setError(err.message))
            .finally(() => setBusy(false));
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="w-full px-2 py-1.5 rounded bg-[#27272A] text-[10px] font-mono text-[#A1A1AA] hover:bg-[#3F3F46] disabled:opacity-50 cursor-pointer"
      >
        {busy ? 'Uploading…' : 'Upload Image'}
      </button>
      {error && <div className="text-[9px] font-mono text-red-400">{error}</div>}
    </div>
  );
}

function ModelInput({ onUpdate }: { onUpdate: (patch: Partial<TourHotspot>) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1">
      <input
        type="file"
        accept=".glb,.gltf,model/gltf-binary"
        className="hidden"
        ref={inputRef}
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (!f) return;
          setBusy(true);
          setError(null);
          uploadAsset(f)
            .then(({ url }) => onUpdate({ modelUrl: url }))
            .catch((err) => setError(err.message))
            .finally(() => setBusy(false));
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="w-full px-2 py-1.5 rounded bg-[#27272A] text-[10px] font-mono text-[#A1A1AA] hover:bg-[#3F3F46] disabled:opacity-50 cursor-pointer"
      >
        {busy ? 'Uploading…' : 'Upload Model'}
      </button>
      {error && <div className="text-[9px] font-mono text-red-400">{error}</div>}
    </div>
  );
}

const HOTSPOT_TYPES: { type: HotspotType; label: string; icon: React.ComponentType<any>; description: string }[] = [
  { type: 'navigation', label: 'Navigation', icon: Navigation, description: 'Link to another room' },
  { type: 'info', label: 'Info', icon: Info, description: 'Show information popup' },
  { type: 'image', label: 'Image', icon: Image, description: 'Display an image' },
  { type: 'gallery', label: 'Gallery', icon: Images, description: 'Image gallery slideshow' },
  { type: 'video', label: 'Video', icon: Video, description: 'Play a video' },
  { type: 'audio', label: 'Audio', icon: Music, description: 'Play audio' },
  { type: 'link', label: 'External Link', icon: ExternalLink, description: 'Open external URL' },
  { type: 'floor', label: 'Floor', icon: Layers, description: 'Navigate to floor' },
  { type: 'model3d', label: '3D Model', icon: Box, description: 'Show 3D model' },
  { type: 'splat', label: 'Splat', icon: Eye, description: 'Trigger Gaussian Splat' },
  { type: 'experience', label: 'Experience', icon: Globe, description: 'Linked experience' },
  { type: 'custom', label: 'Custom', icon: Star, description: 'Custom hotspot' },
];

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

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-mono text-[#A1A1AA]">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-8 h-4 rounded-full transition-colors ${
          value ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'
        }`}
      >
        <div
          className={`w-3 h-3 rounded-full bg-white transform transition-transform ${
            value ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1.5 text-xs font-mono text-white"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

function TypeSpecificFields({
  hotspot,
  scenes,
  roomId,
  onUpdate,
}: {
  hotspot: TourHotspot;
  scenes: TourScene[];
  roomId: string;
  onUpdate: (patch: Partial<TourHotspot>) => void;
}) {
  const room = scenes.find((r) => r.id === roomId);

  switch (hotspot.type) {
    case 'navigation':
      return (
        <Section title="Navigation Target" icon={Navigation}>
          <Field label="Destination Room">
            <select
              value={hotspot.targetSceneId || ''}
              onChange={(e) => onUpdate({ targetSceneId: e.target.value })}
              className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1.5 text-xs font-mono text-white"
            >
              <option value="">Select room...</option>
              {scenes
                .filter((s) => s.id !== roomId)
                .map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </select>
          </Field>
          <Field label="Target Yaw">
            <NumberInput
              value={hotspot.targetYaw || 0}
              onChange={(v) => onUpdate({ targetYaw: v })}
              min={-360}
              max={360}
              step={0.1}
              unit="deg"
            />
          </Field>
          <Field label="Target Pitch">
            <NumberInput
              value={hotspot.targetPitch || 0}
              onChange={(v) => onUpdate({ targetPitch: v })}
              min={-90}
              max={90}
              step={0.1}
              unit="deg"
            />
          </Field>
        </Section>
      );

    case 'info':
      return (
        <Section title="Info Content" icon={Info}>
          <Field label="Title">
            <TextInput value={hotspot.title} onChange={(v) => onUpdate({ title: v })} />
          </Field>
          <Field label="Description">
            <textarea
              value={hotspot.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1.5 text-xs font-mono text-white h-20 resize-none"
              placeholder="Info popup content..."
            />
          </Field>
          <Field label="Icon">
            <TextInput
              value={hotspot.icon || ''}
              onChange={(v) => onUpdate({ icon: v })}
              placeholder="Icon name or SVG path"
            />
          </Field>
        </Section>
      );

    case 'image':
      return (
        <Section title="Image" icon={Image}>
          <Field label="Image URL">
            <TextInput
              value={hotspot.imageUrl || ''}
              onChange={(v) => onUpdate({ imageUrl: v })}
              placeholder="https://..."
            />
          </Field>
          <ImageInput onUpdate={onUpdate} />
        </Section>
      );

    case 'gallery':
      return (
        <Section title="Gallery" icon={Images}>
          {(hotspot.images || []).map((url, i) => (
            <div key={i} className="flex items-center gap-2">
              <TextInput
                value={url}
                onChange={(v) => {
                  const images = [...(hotspot.images || [])];
                  images[i] = v;
                  onUpdate({ images });
                }}
                placeholder="https://..."
              />
              <button
                onClick={() => {
                  const images = (hotspot.images || []).filter((_, idx) => idx !== i);
                  const captions = (hotspot.captions || []).filter((_, idx) => idx !== i);
                  onUpdate({ images, captions });
                }}
                className="p-1 rounded hover:bg-white/5 shrink-0"
              >
                <Trash2 className="w-3 h-3 text-[#71717A]" />
              </button>
            </div>
          ))}
          <button
            onClick={() => onUpdate({ images: [...(hotspot.images || []), ''] })}
            className="w-full px-2 py-1.5 rounded bg-[#27272A] text-[10px] font-mono text-[#A1A1AA] hover:bg-[#3F3F46]"
          >
            + Add Image
          </button>
          {(hotspot.images || []).length > 0 && (
            <>
              <Field label="Captions">
                {(hotspot.images || []).map((_, i) => (
                  <TextInput
                    key={i}
                    value={(hotspot.captions || [])[i] || ''}
                    onChange={(v) => {
                      const captions = [...(hotspot.captions || [])];
                      captions[i] = v;
                      onUpdate({ captions });
                    }}
                    placeholder={`Caption ${i + 1}`}
                  />
                ))}
              </Field>
            </>
          )}
        </Section>
      );

    case 'video':
      return (
        <Section title="Video" icon={Video}>
          <Field label="Video URL">
            <TextInput
              value={hotspot.videoUrl || ''}
              onChange={(v) => onUpdate({ videoUrl: v })}
              placeholder="https://..."
            />
          </Field>
          <Field label="Poster URL">
            <TextInput
              value={hotspot.posterUrl || ''}
              onChange={(v) => onUpdate({ posterUrl: v })}
              placeholder="Thumbnail image URL"
            />
          </Field>
          <Toggle label="Autoplay" value={hotspot.autoplay || false} onChange={(v) => onUpdate({ autoplay: v })} />
          <Toggle label="Loop" value={hotspot.loop || false} onChange={(v) => onUpdate({ loop: v })} />
          <Toggle label="Muted" value={hotspot.muted || false} onChange={(v) => onUpdate({ muted: v })} />
        </Section>
      );

    case 'audio':
      return (
        <Section title="Audio" icon={Music}>
          <Field label="Audio URL">
            <TextInput
              value={hotspot.audioUrl || ''}
              onChange={(v) => onUpdate({ audioUrl: v })}
              placeholder="https://..."
            />
          </Field>
          <Field label="Title">
            <TextInput value={hotspot.title} onChange={(v) => onUpdate({ title: v })} />
          </Field>
          <Toggle label="Autoplay" value={hotspot.autoplay || false} onChange={(v) => onUpdate({ autoplay: v })} />
          <Toggle label="Loop" value={hotspot.loop || false} onChange={(v) => onUpdate({ loop: v })} />
          <Field label="Volume">
            <NumberInput
              value={hotspot.volume ?? 1}
              onChange={(v) => onUpdate({ volume: v })}
              min={0}
              max={1}
              step={0.1}
            />
          </Field>
        </Section>
      );

    case 'link':
      return (
        <Section title="External Link" icon={ExternalLink}>
          <Field label="URL">
            <TextInput
              value={hotspot.externalUrl || ''}
              onChange={(v) => onUpdate({ externalUrl: v })}
              placeholder="https://..."
            />
          </Field>
          <Field label="Label">
            <TextInput value={hotspot.label || ''} onChange={(v) => onUpdate({ label: v })} />
          </Field>
          <Field label="Open Mode">
            <SelectInput
              value={hotspot.openMode || 'new_tab'}
              onChange={(v) => onUpdate({ openMode: v as 'new_tab' | 'same_tab' })}
              options={[
                { value: 'new_tab', label: 'New Tab' },
                { value: 'same_tab', label: 'Same Tab' },
              ]}
            />
          </Field>
        </Section>
      );

    case 'floor':
      return (
        <Section title="Floor" icon={Layers}>
          <Field label="Target Floor">
            <TextInput
              value={hotspot.targetSceneId || ''}
              onChange={(v) => onUpdate({ targetSceneId: v })}
              placeholder="Floor ID"
            />
          </Field>
        </Section>
      );

    case 'model3d':
      return (
        <Section title="3D Model" icon={Box}>
          <Field label="Model URL">
            <TextInput
              value={hotspot.modelUrl || ''}
              onChange={(v) => onUpdate({ modelUrl: v })}
              placeholder="https://...glb"
            />
          </Field>
          <ModelInput onUpdate={onUpdate} />
          <Field label="Position X">
            <NumberInput value={0} onChange={() => {}} step={0.1} unit="m" />
          </Field>
          <Field label="Position Y">
            <NumberInput value={0} onChange={() => {}} step={0.1} unit="m" />
          </Field>
          <Field label="Position Z">
            <NumberInput value={0} onChange={() => {}} step={0.1} unit="m" />
          </Field>
          <Field label="Rotation">
            <NumberInput value={0} onChange={() => {}} step={1} unit="deg" />
          </Field>
          <Field label="Scale">
            <NumberInput value={1} onChange={() => {}} min={0.01} step={0.1} />
          </Field>
        </Section>
      );

    case 'splat':
      return (
        <Section title="Gaussian Splat" icon={Eye}>
          <Field label="Splat Asset">
            <TextInput
              value={hotspot.description}
              onChange={(v) => onUpdate({ description: v })}
              placeholder="Splat asset identifier"
            />
          </Field>
        </Section>
      );

    case 'experience':
      return (
        <Section title="Experience" icon={Globe}>
          <Field label="Experience ID">
            <TextInput
              value={hotspot.description}
              onChange={(v) => onUpdate({ description: v })}
              placeholder="Linked experience ID"
            />
          </Field>
        </Section>
      );

    case 'custom':
      return (
        <Section title="Custom Hotspot" icon={Star}>
          <Field label="Title">
            <TextInput value={hotspot.title} onChange={(v) => onUpdate({ title: v })} />
          </Field>
          <Field label="Description">
            <textarea
              value={hotspot.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1.5 text-xs font-mono text-white h-20 resize-none"
              placeholder="Custom content..."
            />
          </Field>
          <Field label="External URL">
            <TextInput
              value={hotspot.externalUrl || ''}
              onChange={(v) => onUpdate({ externalUrl: v })}
              placeholder="https://..."
            />
          </Field>
        </Section>
      );

    default:
      return null;
  }
}

export function InspectorPanel({ roomId, hotspotId }: InspectorPanelProps) {
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const scenes = useTourStore((s) => s.scenes);
  const updateScene = useTourStore((s) => s.updateScene);
  const updateHotspot = useTourStore((s) => s.updateHotspot);
  const deleteScene = useTourStore((s) => s.deleteScene);
  const duplicateRoom = useTourStore((s) => s.duplicateRoom);
  const room = scenes.find((r) => r.id === roomId);
  const hotspot = room?.hotspots?.find((h) => h.id === hotspotId);

  const tourSettings = useTourStore((s) => s.tourSettings);
  const updateTourSettings = useTourStore((s) => s.updateTourSettings);

  if (hotspot && room) {
    const handleHotspotUpdate = (patch: Partial<TourHotspot>) => {
      updateHotspot(room.id, hotspot.id, patch);
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
          <div className="grid grid-cols-2 gap-1">
            {HOTSPOT_TYPES.map((t) => {
              const Icon = t.icon;
              const isActive = hotspot.type === t.type;
              return (
                <button
                  key={t.type}
                  onClick={() => handleHotspotUpdate({ type: t.type })}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors ${
                    isActive
                      ? 'bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 text-[#3ECF8E]'
                      : 'bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:bg-[#27272A]'
                  }`}
                  title={t.description}
                >
                  <Icon className="w-3 h-3 shrink-0" />
                  <span className="text-[10px] font-mono truncate">{t.label}</span>
                </button>
              );
            })}
          </div>
        </Section>

        <TypeSpecificFields
          hotspot={hotspot}
          scenes={scenes}
          roomId={roomId}
          onUpdate={handleHotspotUpdate}
        />

        <Section title="Content" icon={FileText} defaultOpen={false}>
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
          <div className="grid grid-cols-2 gap-2">
            <Field label="Yaw">
              <NumberInput
                value={(hotspot.yaw * 180) / Math.PI}
                onChange={(v) => handleHotspotUpdate({ yaw: (v * Math.PI) / 180 })}
                min={-360}
                max={360}
                step={0.1}
                unit="deg"
              />
            </Field>
            <Field label="Pitch">
              <NumberInput
                value={(hotspot.pitch * 180) / Math.PI}
                onChange={(v) => handleHotspotUpdate({ pitch: (v * Math.PI) / 180 })}
                min={-90}
                max={90}
                step={0.1}
                unit="deg"
              />
            </Field>
          </div>
          <button
            onClick={() => handleHotspotUpdate({ yaw: 0, pitch: 0 })}
            className="w-full px-2 py-1.5 rounded bg-[#27272A] text-[10px] font-mono text-[#A1A1AA] hover:bg-[#3F3F46] cursor-pointer"
          >
            Reset Position
          </button>
        </Section>

        <Section title="Appearance" icon={Sliders}>
          <Field label="Icon">
            <div className="flex items-center gap-2 relative">
              <div className="w-8 h-8 rounded bg-[#18181B] border border-[#27272A] flex items-center justify-center">
                {hotspot.icon ? (
                  <span className="text-xs text-[#3ECF8E]">{hotspot.icon}</span>
                ) : (
                  <span className="text-[10px] text-[#71717A]">None</span>
                )}
              </div>
              <button
                onClick={() => setIconPickerOpen(!iconPickerOpen)}
                className="px-2 py-1 rounded bg-[#18181B] border border-[#27272A] text-[10px] font-mono text-[#A1A1AA] hover:text-white"
              >
                Change
              </button>
              {iconPickerOpen && (
                <IconPicker
                  value={hotspot.icon}
                  onChange={(icon) => {
                    handleHotspotUpdate({ icon });
                    setIconPickerOpen(false);
                  }}
                  onClose={() => setIconPickerOpen(false)}
                />
              )}
            </div>
          </Field>
          <Field label="Size">
            <NumberInput
              value={hotspot.size ?? 1}
              onChange={(v) => handleHotspotUpdate({ size: v })}
              min={0.5}
              max={3.0}
              step={0.1}
            />
          </Field>
          <Field label="Color">
            <TextInput
              value={hotspot.color || '#3ECF8E'}
              onChange={(v) => handleHotspotUpdate({ color: v })}
              placeholder="#hex"
            />
          </Field>
          <Field label="Opacity">
            <NumberInput
              value={hotspot.opacity ?? 1}
              onChange={(v) => handleHotspotUpdate({ opacity: v })}
              min={0}
              max={1}
              step={0.1}
            />
          </Field>
          <Field label="Label">
            <TextInput
              value={hotspot.label || ''}
              onChange={(v) => handleHotspotUpdate({ label: v })}
              placeholder="Visible label text"
            />
          </Field>
          <Field label="Tooltip">
            <TextInput
              value={hotspot.tooltip || ''}
              onChange={(v) => handleHotspotUpdate({ tooltip: v })}
              placeholder="Hover tooltip"
            />
          </Field>
          <Field label="Animation">
            <SelectInput
              value={hotspot.animation || 'none'}
              onChange={(v) => handleHotspotUpdate({ animation: v as any })}
              options={[
                { value: 'none', label: 'None' },
                { value: 'pulse', label: 'Pulse' },
                { value: 'glow', label: 'Glow' },
                { value: 'bounce', label: 'Bounce' },
              ]}
            />
          </Field>
        </Section>

        <Section title="Direction" icon={Compass} defaultOpen={false}>
          <Field label="Mode">
            <SelectInput
              value={hotspot.directionMode || 'auto'}
              onChange={(v) => handleHotspotUpdate({ directionMode: v as any })}
              options={[
                { value: 'auto', label: 'Auto' },
                { value: 'manual', label: 'Manual' },
                { value: 'look_at', label: 'Look At' },
                { value: 'target', label: 'Target' },
              ]}
            />
          </Field>
          {hotspot.directionMode === 'manual' && (
            <>
              <Field label="Direction Yaw">
                <NumberInput
                  value={hotspot.directionYaw || 0}
                  onChange={(v) => handleHotspotUpdate({ directionYaw: v })}
                  min={-3.14}
                  max={3.14}
                  step={0.01}
                  unit="rad"
                />
              </Field>
              <Field label="Direction Pitch">
                <NumberInput
                  value={hotspot.directionPitch || 0}
                  onChange={(v) => handleHotspotUpdate({ directionPitch: v })}
                  min={-1.57}
                  max={1.57}
                  step={0.01}
                  unit="rad"
                />
              </Field>
            </>
          )}
        </Section>
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
          <button
            onClick={() => {
              const v = getViewportView();
              updateScene(room.id, { initialYaw: v.yaw, initialPitch: v.pitch, initialFov: v.fov });
            }}
            className="w-full px-2 py-1.5 rounded bg-[#27272A] text-[10px] font-mono text-[#A1A1AA] hover:bg-[#3F3F46] cursor-pointer"
          >
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
    <div className="h-full overflow-y-auto">
      <div className="px-3 py-2 border-b border-[#27272A]">
        <span className="text-xs font-mono font-bold text-white">TOUR SETTINGS</span>
      </div>
      <Section title="General" icon={Settings}>
        <Field label="Tour Name">
          <TextInput value={tourSettings.name} onChange={(v) => updateTourSettings({ name: v })} />
        </Field>
        <Field label="Description">
          <textarea
            value={tourSettings.description}
            onChange={(e) => updateTourSettings({ description: e.target.value })}
            className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1.5 text-xs text-white placeholder:text-[#71717A] min-h-[60px]"
          />
        </Field>
        <Field label="Default FOV">
          <NumberInput value={tourSettings.defaultFov} onChange={(v) => updateTourSettings({ defaultFov: v })} min={30} max={120} unit="°" />
        </Field>
        <Field label="Auto-Rotate">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={tourSettings.autoRotate} onChange={(e) => updateTourSettings({ autoRotate: e.target.checked })} />
            <span className="text-[10px] font-mono text-[#A1A1AA]">Enable</span>
          </label>
        </Field>
        {tourSettings.autoRotate && (
          <Field label="Rotate Speed">
            <NumberInput value={tourSettings.autoRotateSpeed} onChange={(v) => updateTourSettings({ autoRotateSpeed: v })} min={0.01} max={1} step={0.01} />
          </Field>
        )}
      </Section>
    </div>
  );
}
