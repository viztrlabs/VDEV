'use client';

import React, { useState, useRef } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Image,
  Video,
  Music,
  Globe,
  Layers,
  Trash2,
  Navigation,
  Info,
  Images,
  ExternalLink,
  Box,
  Eye,
  Star,
} from 'lucide-react';
import type { TourScene, TourHotspot, HotspotType } from '@/lib/tourClientStore';

export async function uploadAsset(file: File): Promise<{ url: string; tileUrl?: string | null }> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/tour/upload', { method: 'POST', body: form });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Upload failed');
  }
  return res.json();
}

export function ImageInput({ onUpdate }: { onUpdate: (patch: Partial<TourHotspot>) => void }) {
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
            .then(({ url }) => onUpdate({ imageUrl: url }))
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

export function ModelInput({ onUpdate }: { onUpdate: (patch: Partial<TourHotspot>) => void }) {
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

export const HOTSPOT_TYPES: { type: HotspotType; label: string; icon: React.ComponentType<any>; description: string }[] = [
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

export function Section({ title, icon: Icon, defaultOpen = true, children }: {
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

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-mono text-[#71717A] block mb-1">{label}</label>
      {children}
    </div>
  );
}

export function TextInput({ value, onChange, placeholder, type = 'text' }: {
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

export function NumberInput({ value, onChange, min, max, step = 1, unit }: {
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

export function Toggle({ label, value, onChange }: {
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

export function SelectInput({ value, onChange, options }: {
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

export function TypeSpecificFields({ hotspot, scenes, roomId, onUpdate }: {
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
