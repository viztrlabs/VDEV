'use client';

import React, { useState } from 'react';
import {
  Star,
  Upload,
  Music,
  Sun,
  Moon,
  Lightbulb,
  Contrast,
  Eye,
  Wand2,
  ImageIcon,
  Type as TypeIcon,
  Hash,
  Volume2,
  Settings as SettingsIcon,
  Aperture,
} from 'lucide-react';
import type { TourRoom } from '@/data/tour-config';
import type {
  VtedLightFilter,
  VtedNadirFix,
  VtedSharpenFilter,
  VtedStagingMode,
  VtedSunLight,
} from '@/lib/vted-types';

interface SceneConfigPanelProps {
  room: TourRoom;
  onUpdate: (patch: Partial<TourRoom>) => void;
  onReplacePanorama: (file: File) => void;
  onUploadAudio: (file: File) => void;
  onSetFeatured: () => void;
  isFeatured: boolean;
  uploading?: boolean;
  audioUploading?: boolean;
}

function ToggleRow({
  label,
  value,
  onChange,
  description,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between p-2 rounded bg-[#09090B] border border-[#27272A]">
      <div>
        <div className="text-[10px] font-mono text-[#FAFAFA]">{label}</div>
        {description && <div className="text-[9px] text-[#71717A]">{description}</div>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-9 h-5 rounded-full relative transition-colors shrink-0 ${
          value ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
            value ? 'left-4' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}

function SliderRow({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}) {
  return (
    <div>
      <label className="flex items-center justify-between text-[10px] font-mono text-[#A1A1AA]">
        <span>{label}</span>
        <span className="text-[#FAFAFA] font-bold">
          {value}
          {unit}
        </span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#3ECF8E]"
      />
    </div>
  );
}

function SceneIdentityTab({
  room,
  onUpdate,
  onReplacePanorama,
  onUploadAudio,
  onSetFeatured,
  isFeatured,
  uploading,
  audioUploading,
}: SceneConfigPanelProps) {
  return (
    <div className="space-y-2.5">
      {/* Title + ID + Featured */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-[#71717A] mb-1">
            Title
          </label>
          <div className="relative">
            <TypeIcon className="w-3 h-3 text-[#71717A] absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              value={room.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="w-full bg-[#09090B] border border-[#27272A] rounded pl-6 pr-2 py-1 text-[11px] font-mono text-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-[#71717A] mb-1">
            ID
          </label>
          <div className="relative">
            <Hash className="w-3 h-3 text-[#71717A] absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              value={room.id}
              onChange={(e) => onUpdate({ id: e.target.value })}
              className="w-full bg-[#09090B] border border-[#27272A] rounded pl-6 pr-2 py-1 text-[11px] font-mono text-white"
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onSetFeatured}
        className={`w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded border text-[10px] font-mono ${
          isFeatured
            ? 'bg-[#3ECF8E]/15 border-[#3ECF8E]/40 text-[#3ECF8E]'
            : 'bg-[#09090B] border-[#27272A] text-[#A1A1AA] hover:text-white'
        }`}
      >
        <Star className="w-3.5 h-3.5" />
        {isFeatured ? '★ Featured Scene' : 'Set Featured'}
      </button>

      {/* Replace panorama */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#71717A] mb-1">
          Replace panorama
        </label>
        <label className="flex items-center justify-center gap-1.5 w-full px-2 py-1.5 rounded bg-[#09090B] border border-[#27272A] hover:border-[#3ECF8E]/40 text-[10px] font-mono text-[#A1A1AA] cursor-pointer">
          <Upload className="w-3.5 h-3.5" />
          {uploading ? 'Uploading…' : 'Upload 360° image'}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && onReplacePanorama(e.target.files[0])}
            className="hidden"
          />
        </label>
      </div>

      {/* Background audio */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#71717A] mb-1">
          Background audio (.mp3)
        </label>
        <label className="flex items-center justify-center gap-1.5 w-full px-2 py-1.5 rounded bg-[#09090B] border border-[#27272A] hover:border-[#3ECF8E]/40 text-[10px] font-mono text-[#A1A1AA] cursor-pointer mb-1">
          <Upload className="w-3.5 h-3.5" />
          {audioUploading ? 'Uploading…' : room.backgroundAudioUrl ? 'Replace audio' : 'Upload audio'}
          <input
            type="file"
            accept="audio/mp3,audio/*"
            onChange={(e) => e.target.files?.[0] && onUploadAudio(e.target.files[0])}
            className="hidden"
          />
        </label>
        {room.backgroundAudioUrl && (
          <div className="flex items-center gap-1 text-[10px] font-mono text-[#71717A]">
            <Volume2 className="w-3 h-3 text-[#3ECF8E]" />
            <span className="truncate flex-1">{room.backgroundAudioUrl.split('/').pop()}</span>
            <button
              type="button"
              onClick={() => onUpdate({ backgroundAudioUrl: undefined })}
              className="text-rose-400 hover:text-rose-300"
            >
              remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function NadirTab({
  nadir,
  onChange,
  onUploadCustom,
  uploading,
}: {
  nadir: VtedNadirFix;
  onChange: (patch: Partial<VtedNadirFix>) => void;
  onUploadCustom: (file: File) => void;
  uploading?: boolean;
}) {
  return (
    <div className="space-y-2.5">
      <p className="text-[10px] text-[#71717A]">
        Hide the tripod / stand at the bottom of the panorama with an auto-generated patch or a custom image.
      </p>
      <div className="grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={() => onChange({ mode: 'none' })}
          className={`px-2 py-1.5 rounded border text-[10px] font-mono ${
            nadir.mode === 'none'
              ? 'bg-[#3ECF8E]/15 border-[#3ECF8E]/40 text-[#3ECF8E]'
              : 'bg-[#09090B] border-[#27272A] text-[#A1A1AA]'
          }`}
        >
          None
        </button>
        <button
          type="button"
          onClick={() => onChange({ mode: 'quick' })}
          className={`px-2 py-1.5 rounded border text-[10px] font-mono ${
            nadir.mode === 'quick'
              ? 'bg-[#3ECF8E]/15 border-[#3ECF8E]/40 text-[#3ECF8E]'
              : 'bg-[#09090B] border-[#27272A] text-[#A1A1AA]'
          }`}
        >
          Quick Fix
        </button>
        <button
          type="button"
          onClick={() => onChange({ mode: 'custom' })}
          className={`px-2 py-1.5 rounded border text-[10px] font-mono ${
            nadir.mode === 'custom'
              ? 'bg-[#3ECF8E]/15 border-[#3ECF8E]/40 text-[#3ECF8E]'
              : 'bg-[#09090B] border-[#27272A] text-[#A1A1AA]'
          }`}
        >
          Custom
        </button>
      </div>
      {nadir.mode === 'custom' && (
        <div>
          <label className="flex items-center justify-center gap-1.5 w-full px-2 py-1.5 rounded bg-[#09090B] border border-[#27272A] hover:border-[#3ECF8E]/40 text-[10px] font-mono text-[#A1A1AA] cursor-pointer">
          <Upload className="w-3.5 h-3.5" />
          {uploading ? 'Uploading…' : 'Upload custom patch'}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && onUploadCustom(e.target.files[0])}
              className="hidden"
            />
          </label>
          {nadir.customImageUrl && (
            <div className="mt-1 aspect-square max-w-[120px] rounded overflow-hidden border border-[#27272A]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={nadir.customImageUrl} alt="Nadir patch" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StagingTab({
  stagingMode,
  onChange,
  sunLight,
  onChangeSun,
}: {
  stagingMode: VtedStagingMode;
  onChange: (mode: VtedStagingMode) => void;
  sunLight: VtedSunLight;
  onChangeSun: (patch: Partial<VtedSunLight>) => void;
}) {
  return (
    <div className="space-y-2.5">
      <label className="block text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
        Staging mode
      </label>
      <select
        value={stagingMode}
        onChange={(e) => onChange(e.target.value as VtedStagingMode)}
        className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
      >
        <option value="none">None</option>
        <option value="staging">Staging</option>
        <option value="day_to_dusk">Day to Dusk</option>
      </select>

      <ToggleRow
        label="Sun Light"
        value={sunLight.enabled}
        onChange={(v) => onChangeSun({ enabled: v })}
        description="Drag sun on the panorama to position"
      />

      {sunLight.enabled && (
        <div className="space-y-2 p-2 rounded bg-[#09090B] border border-[#27272A]">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] font-mono text-[#A1A1AA]">Sun X (panorama)</label>
              <input
                type="range"
                min={-100}
                max={100}
                value={Math.round(sunLight.x * 100)}
                onChange={(e) => onChangeSun({ x: Number(e.target.value) / 100 })}
                className="w-full accent-[#3ECF8E]"
              />
            </div>
            <div>
              <label className="block text-[9px] font-mono text-[#A1A1AA]">Sun Y (panorama)</label>
              <input
                type="range"
                min={-100}
                max={100}
                value={Math.round(sunLight.y * 100)}
                onChange={(e) => onChangeSun({ y: Number(e.target.value) / 100 })}
                className="w-full accent-[#3ECF8E]"
              />
            </div>
          </div>
          <SliderRow label="Brightness Sun" value={sunLight.brightnessSun} onChange={(v) => onChangeSun({ brightnessSun: v })} />
          <SliderRow label="Effect" value={sunLight.effect} onChange={(v) => onChangeSun({ effect: v })} />
          <SliderRow label="Brightness Rainbow" value={sunLight.brightnessRainbow} onChange={(v) => onChangeSun({ brightnessRainbow: v })} />
          <SliderRow label="Exposure Bias" value={sunLight.exposureBias} min={-100} max={100} onChange={(v) => onChangeSun({ exposureBias: v })} />
        </div>
      )}
    </div>
  );
}

function FilterTab({
  light,
  onChangeLight,
  sharpen,
  onChangeSharpen,
  brightness,
  contrast,
  onUpdate,
}: {
  light: VtedLightFilter;
  onChangeLight: (patch: Partial<VtedLightFilter>) => void;
  sharpen: VtedSharpenFilter;
  onChangeSharpen: (patch: Partial<VtedSharpenFilter>) => void;
  brightness: number;
  contrast: number;
  onUpdate: (patch: Partial<TourRoom>) => void;
}) {
  return (
    <div className="space-y-3">
      {/* Brightness / Contrast (live CSS filters) */}
      <div className="space-y-2 p-2 rounded bg-[#09090B] border border-[#27272A]">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
          Quick Adjust
        </div>
        <SliderRow label="Brightness" value={brightness} min={40} max={160} onChange={(v) => onUpdate({ brightness: v })} unit="%" />
        <SliderRow label="Contrast" value={contrast} min={40} max={160} onChange={(v) => onUpdate({ contrast: v })} unit="%" />
      </div>

      {/* Light Filter */}
      <div className="p-2 rounded bg-[#09090B] border border-[#27272A] space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-400" />
            Light Filter
          </div>
          <button
            type="button"
            onClick={() => onChangeLight({ enabled: !light.enabled })}
            className={`w-9 h-5 rounded-full relative transition-colors ${
              light.enabled ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                light.enabled ? 'left-4' : 'left-0.5'
              }`}
            />
          </button>
        </div>
        {light.enabled && (
          <div className="space-y-1.5">
            <SliderRow label="Exposure" value={light.exposure} min={-100} max={100} onChange={(v) => onChangeLight({ exposure: v })} />
            <SliderRow label="Lights" value={light.lights} onChange={(v) => onChangeLight({ lights: v })} />
            <SliderRow label="Shadows" value={light.shadows} onChange={(v) => onChangeLight({ shadows: v })} />
            <SliderRow label="Filter Range" value={light.range} onChange={(v) => onChangeLight({ range: v })} />
            <SliderRow label="Masking" value={light.masking} onChange={(v) => onChangeLight({ masking: v })} />
            <SliderRow label="Quality" value={light.quality} onChange={(v) => onChangeLight({ quality: v })} />
          </div>
        )}
      </div>

      {/* Sharpen Filter */}
      <div className="p-2 rounded bg-[#09090B] border border-[#27272A] space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] flex items-center gap-1">
            <Contrast className="w-3 h-3 text-cyan-400" />
            Sharpen Filter
          </div>
          <button
            type="button"
            onClick={() => onChangeSharpen({ enabled: !sharpen.enabled })}
            className={`w-9 h-5 rounded-full relative transition-colors ${
              sharpen.enabled ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                sharpen.enabled ? 'left-4' : 'left-0.5'
              }`}
            />
          </button>
        </div>
        {sharpen.enabled && (
          <div className="space-y-1.5">
            <SliderRow label="Strength" value={sharpen.strength} onChange={(v) => onChangeSharpen({ strength: v })} />
            <SliderRow label="Range" value={sharpen.range} onChange={(v) => onChangeSharpen({ range: v })} />
            <SliderRow label="Quality" value={sharpen.quality} onChange={(v) => onChangeSharpen({ quality: v })} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function SceneConfigPanel(props: SceneConfigPanelProps) {
  const [tab, setTab] = useState<'identity' | 'nadir' | 'staging' | 'filter'>('identity');

  const vtedAny = props.room as any;
  const nadir: VtedNadirFix = vtedAny.nadirFix || { mode: 'none' };
  const light: VtedLightFilter = vtedAny.lightFilter || {
    enabled: false, exposure: 0, lights: 50, shadows: 50, range: 50, masking: 50, quality: 50,
  };
  const sharpen: VtedSharpenFilter = vtedAny.sharpenFilter || {
    enabled: false, strength: 50, range: 50, quality: 50,
  };
  const sunLight: VtedSunLight = vtedAny.sunLight || {
    enabled: false, x: 0, y: 0, brightnessSun: 50, effect: 50, brightnessRainbow: 0, exposureBias: 0,
  };
  const stagingMode: VtedStagingMode = vtedAny.stagingMode || 'none';

  const patchVted = (patch: Record<string, unknown>) =>
    props.onUpdate(patch as Partial<TourRoom>);

  return (
    <div className="rounded-xl border border-[#27272A] bg-[#0c0c0f] p-3 space-y-3">
      <div className="text-[10px] font-mono uppercase tracking-wider text-[#3ECF8E] flex items-center gap-1.5">
        <Aperture className="w-3 h-3" />
        Scene Configuration
      </div>

      <div role="tablist" className="flex items-center gap-1 p-1 rounded-lg bg-[#09090B] border border-[#27272A]">
        <TabBtn id="identity" active={tab} setActive={setTab} icon={<SettingsIcon className="w-3 h-3" />}>
          Scene
        </TabBtn>
        <TabBtn id="nadir" active={tab} setActive={setTab} icon={<ImageIcon className="w-3 h-3" />}>
          Nadir
        </TabBtn>
        <TabBtn id="staging" active={tab} setActive={setTab} icon={stagingMode === 'day_to_dusk' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}>
          Staging
        </TabBtn>
        <TabBtn id="filter" active={tab} setActive={setTab} icon={<Wand2 className="w-3 h-3" />}>
          Filter
        </TabBtn>
      </div>

      {tab === 'identity' && <SceneIdentityTab {...props} />}
      {tab === 'nadir' && (
        <NadirTab
          nadir={nadir}
          onChange={(p) => patchVted({ nadirFix: { ...nadir, ...p } })}
          onUploadCustom={(file) => {
            // Placeholder: in real impl this would upload via /api/tour/upload
            const url = URL.createObjectURL(file);
            patchVted({ nadirFix: { ...nadir, customImageUrl: url } });
          }}
        />
      )}
      {tab === 'staging' && (
        <StagingTab
          stagingMode={stagingMode}
          onChange={(m) => patchVted({ stagingMode: m })}
          sunLight={sunLight}
          onChangeSun={(p) => patchVted({ sunLight: { ...sunLight, ...p } })}
        />
      )}
      {tab === 'filter' && (
        <FilterTab
          light={light}
          onChangeLight={(p) => patchVted({ lightFilter: { ...light, ...p } })}
          sharpen={sharpen}
          onChangeSharpen={(p) => patchVted({ sharpenFilter: { ...sharpen, ...p } })}
          brightness={props.room.brightness ?? 100}
          contrast={props.room.contrast ?? 100}
          onUpdate={props.onUpdate}
        />
      )}
    </div>
  );
}

function TabBtn({
  id,
  active,
  setActive,
  icon,
  children,
}: {
  id: 'identity' | 'nadir' | 'staging' | 'filter';
  active: string;
  setActive: (id: any) => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active === id}
      onClick={() => setActive(id)}
      className={`flex-1 flex items-center justify-center gap-1 px-1.5 py-1 rounded text-[10px] font-mono transition-all ${
        active === id
          ? 'bg-[#3ECF8E]/15 text-[#3ECF8E] border border-[#3ECF8E]/30'
          : 'text-[#71717A] hover:text-white border border-transparent'
      }`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}
