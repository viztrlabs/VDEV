'use client';

import React, { useState } from 'react';
import {
  Palette,
  Type as TypeIcon,
  Settings as SettingsIcon,
  Copy,
  RotateCcw,
  Trash2,
  Crosshair,
  Eye,
  EyeOff,
  Square,
  Circle as CircleIcon,
  Diamond,
  Sparkles,
  ChevronRight,
  Lock,
  Unlock,
  Link as LinkIcon,
  Image as ImageIcon,
  Newspaper,
  Video,
  Volume2,
  Shirt,
  ChevronsRight,
  Info,
  DoorOpen,
} from 'lucide-react';
import {
  VTED_DISTORTION_KEYS,
  VTED_HOTSPOT_ICONS,
  VTED_HOTSPOT_TYPES,
  VtedHotspotEffect,
  VtedHotspotGlobal,
  VtedHotspotShape,
  VtedHotspotStyle,
  VtedHotspotType,
  VtedHotspotLabel,
  VtedPointSetup,
} from '@/lib/vted-types';
import type { Hotspot } from '@/data/tour-config';

interface HotspotStyleTabsProps {
  hotspot: Hotspot;
  onChange: (patch: Partial<Hotspot>) => void;
  onDelete: () => void;
  onCopy: () => void;
}

const SHAPE_ICONS: Record<VtedHotspotShape, React.ReactNode> = {
  circle: <CircleIcon className="w-3.5 h-3.5" />,
  square: <Square className="w-3.5 h-3.5" />,
  diamond: <Diamond className="w-3.5 h-3.5" />,
  rounded: <Square className="w-3.5 h-3.5 rotate-45" />,
};

const TYPE_ICONS: Record<VtedHotspotType, React.ReactNode> = {
  point: <Crosshair className="w-3.5 h-3.5" />,
  chevron: <ChevronRight className="w-3.5 h-3.5" />,
  image: <ImageIcon className="w-3.5 h-3.5" />,
  article: <Newspaper className="w-3.5 h-3.5" />,
  video: <Video className="w-3.5 h-3.5" />,
  sound: <Volume2 className="w-3.5 h-3.5" />,
  link: <LinkIcon className="w-3.5 h-3.5" />,
  compact: <Info className="w-3.5 h-3.5" />,
  product: <Shirt className="w-3.5 h-3.5" />,
  // legacy aliases
  room_link: <DoorOpen className="w-3.5 h-3.5" />,
  metadata: <Info className="w-3.5 h-3.5" />,
  info: <Newspaper className="w-3.5 h-3.5" />,
  audio: <Volume2 className="w-3.5 h-3.5" />,
};

function StyleTab({
  style,
  onChange,
}: {
  style: VtedHotspotStyle;
  onChange: (patch: Partial<VtedHotspotStyle>) => void;
}) {
  return (
    <div className="space-y-2.5">
      {/* Icon */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#71717A] mb-1">
          Icon (Font Awesome class)
        </label>
        <input
          value={style.icon || ''}
          onChange={(e) => onChange({ icon: e.target.value })}
          placeholder="fas fa-map-marker-alt"
          className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
        />
      </div>

      {/* Shape */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#71717A] mb-1">
          Shape
        </label>
        <div className="grid grid-cols-4 gap-1">
          {(Object.keys(SHAPE_ICONS) as VtedHotspotShape[]).map((shape) => (
            <button
              key={shape}
              type="button"
              onClick={() => onChange({ shape })}
              className={`flex items-center justify-center p-1.5 rounded border ${
                style.shape === shape
                  ? 'bg-[#3ECF8E]/15 border-[#3ECF8E]/40 text-[#3ECF8E]'
                  : 'bg-[#18181B] border-[#27272A] text-[#A1A1AA] hover:text-white'
              }`}
              title={shape}
            >
              {SHAPE_ICONS[shape]}
            </button>
          ))}
        </div>
      </div>

      {/* Background color */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#71717A] mb-1">
          Background color
        </label>
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={(style.backgroundColor || '#3ECF8E').slice(0, 7)}
            onChange={(e) => onChange({ backgroundColor: e.target.value })}
            className="w-8 h-7 bg-transparent border border-[#27272A] rounded"
          />
          <input
            value={style.backgroundColor || ''}
            onChange={(e) => onChange({ backgroundColor: e.target.value })}
            placeholder="#3ECF8E"
            className="flex-1 bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
          />
        </div>
      </div>

      {/* Size + Opacity */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-mono text-[#A1A1AA]">
            Size {style.size ?? 24}px
          </label>
          <input
            type="range"
            min={8}
            max={64}
            value={style.size ?? 24}
            onChange={(e) => onChange({ size: Number(e.target.value) })}
            className="w-full accent-[#3ECF8E]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono text-[#A1A1AA]">
            Opacity {style.opacity ?? 100}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={style.opacity ?? 100}
            onChange={(e) => onChange({ opacity: Number(e.target.value) })}
            className="w-full accent-[#3ECF8E]"
          />
        </div>
      </div>

      {/* Rotate + Effect */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-mono text-[#A1A1AA]">
            Rotate {style.rotate ?? 0}°
          </label>
          <input
            type="range"
            min={0}
            max={360}
            value={style.rotate ?? 0}
            onChange={(e) => onChange({ rotate: Number(e.target.value) })}
            className="w-full accent-[#3ECF8E]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono text-[#A1A1AA]">Effect</label>
          <select
            value={style.effect || 'normal'}
            onChange={(e) => onChange({ effect: e.target.value as VtedHotspotEffect })}
            className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
          >
            <option value="normal">Normal</option>
            <option value="radar">Radar</option>
            <option value="glowing">Glowing</option>
            <option value="subtle">Subtle</option>
          </select>
        </div>
      </div>

      {/* Distort */}
      <div className="flex items-center justify-between p-2 rounded bg-[#09090B] border border-[#27272A]">
        <div>
          <div className="text-[10px] font-mono uppercase text-[#A1A1AA]">Distorted</div>
          <div className="text-[9px] text-[#71717A]">Skew icon to follow panorama curve</div>
        </div>
        <button
          type="button"
          onClick={() => onChange({ distort: !style.distort })}
          className={`w-9 h-5 rounded-full relative transition-colors ${
            style.distort ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
              style.distort ? 'left-4' : 'left-0.5'
            }`}
          />
        </button>
      </div>
    </div>
  );
}

function LabelTab({
  label,
  onChange,
}: {
  label: VtedHotspotLabel;
  onChange: (patch: Partial<VtedHotspotLabel>) => void;
}) {
  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-mono text-[#A1A1AA]">Font</label>
          <select
            value={label.fontType || 'Inter'}
            onChange={(e) => onChange({ fontType: e.target.value })}
            className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
          >
            <option>Inter</option>
            <option>Roboto</option>
            <option>Helvetica</option>
            <option>Georgia</option>
            <option>Courier</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-mono text-[#A1A1AA]">
            Size {label.size ?? 12}px
          </label>
          <input
            type="range"
            min={8}
            max={32}
            value={label.size ?? 12}
            onChange={(e) => onChange({ size: Number(e.target.value) })}
            className="w-full accent-[#3ECF8E]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-mono text-[#A1A1AA]">
            Weight {label.weight ?? 500}
          </label>
          <input
            type="range"
            min={100}
            max={900}
            step={100}
            value={label.weight ?? 500}
            onChange={(e) => onChange({ weight: Number(e.target.value) })}
            className="w-full accent-[#3ECF8E]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono text-[#A1A1AA]">
            Letter spacing {label.letterSpacing ?? 0}px
          </label>
          <input
            type="range"
            min={-2}
            max={8}
            value={label.letterSpacing ?? 0}
            onChange={(e) => onChange({ letterSpacing: Number(e.target.value) })}
            className="w-full accent-[#3ECF8E]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-mono text-[#A1A1AA]">
            Pad X {label.paddingX ?? 6}px
          </label>
          <input
            type="range"
            min={0}
            max={24}
            value={label.paddingX ?? 6}
            onChange={(e) => onChange({ paddingX: Number(e.target.value) })}
            className="w-full accent-[#3ECF8E]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono text-[#A1A1AA]">
            Pad Y {label.paddingY ?? 2}px
          </label>
          <input
            type="range"
            min={0}
            max={24}
            value={label.paddingY ?? 2}
            onChange={(e) => onChange({ paddingY: Number(e.target.value) })}
            className="w-full accent-[#3ECF8E]"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-mono text-[#A1A1AA]">
          Border radius {label.borderRadius ?? 4}px
        </label>
        <input
          type="range"
          min={0}
          max={24}
          value={label.borderRadius ?? 4}
          onChange={(e) => onChange({ borderRadius: Number(e.target.value) })}
          className="w-full accent-[#3ECF8E]"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-mono text-[#A1A1AA]">Background</label>
          <input
            type="color"
            value={(label.backgroundColor || '#000000').slice(0, 7)}
            onChange={(e) => onChange({ backgroundColor: e.target.value })}
            className="w-full h-7 bg-transparent border border-[#27272A] rounded"
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono text-[#A1A1AA]">Text color</label>
          <input
            type="color"
            value={(label.textColor || '#ffffff').slice(0, 7)}
            onChange={(e) => onChange({ textColor: e.target.value })}
            className="w-full h-7 bg-transparent border border-[#27272A] rounded"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-mono text-[#A1A1AA]">Text shadow</label>
        <input
          value={label.textShadow || ''}
          onChange={(e) => onChange({ textShadow: e.target.value })}
          placeholder="0 1px 2px rgba(0,0,0,0.5)"
          className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <ToggleRow
          label="Upper"
          value={!!label.uppercase}
          onChange={(v) => onChange({ uppercase: v })}
        />
        <ToggleRow
          label="Italic"
          value={!!label.italic}
          onChange={(v) => onChange({ italic: v })}
        />
        <ToggleRow
          label="On hover"
          value={!!label.showOnHover}
          onChange={(v) => onChange({ showOnHover: v })}
        />
      </div>
    </div>
  );
}

function GlobalTab({
  global,
  onChange,
}: {
  global: VtedHotspotGlobal;
  onChange: (patch: Partial<VtedHotspotGlobal>) => void;
}) {
  return (
    <div className="space-y-2.5">
      <ToggleRow
        label="Lock hotspot"
        value={!!global.locked}
        onChange={(v) => onChange({ locked: v })}
        description="Prevent dragging"
      />
      <ToggleRow
        label="Keep position on zoom"
        value={!!global.keepPositionOnZoom}
        onChange={(v) => onChange({ keepPositionOnZoom: v })}
      />
      <ToggleRow
        label="Hide title on top"
        value={!!global.hideTitleOnTop}
        onChange={(v) => onChange({ hideTitleOnTop: v })}
      />
      <ToggleRow
        label="Hide preview box on hover"
        value={!!global.hidePreviewBoxOnHover}
        onChange={(v) => onChange({ hidePreviewBoxOnHover: v })}
      />
      <ToggleRow
        label="Hide title on preview box"
        value={!!global.hideTitleOnPreviewBox}
        onChange={(v) => onChange({ hideTitleOnPreviewBox: v })}
      />
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#71717A] mb-1">
          Article popup size
        </label>
        <select
          value={global.popupSize || 'custom'}
          onChange={(e) => onChange({ popupSize: e.target.value as 'custom' | 'fixed' })}
          className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
        >
          <option value="custom">Custom</option>
          <option value="fixed">Fixed</option>
        </select>
      </div>
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#71717A] mb-1">
          Article popup layout
        </label>
        <input
          value={global.popupLayout || ''}
          onChange={(e) => onChange({ popupLayout: e.target.value })}
          placeholder="default"
          className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
        />
      </div>
    </div>
  );
}

function PointSetupTab({
  setup,
  onChange,
}: {
  setup: VtedPointSetup;
  onChange: (patch: Partial<VtedPointSetup>) => void;
}) {
  return (
    <div className="space-y-2.5">
      <ToggleRow
        label="Transitioning"
        value={!!setup.transitioning}
        onChange={(v) => onChange({ transitioning: v })}
        description="Animate on hover/click"
      />
      <ToggleRow
        label="Hide preview"
        value={!!setup.hidePreview}
        onChange={(v) => onChange({ hidePreview: v })}
      />
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#71717A] mb-1">
          View mode
        </label>
        <select
          value={setup.viewMode || '360flat'}
          onChange={(e) => onChange({ viewMode: e.target.value as VtedPointSetup['viewMode'] })}
          className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
        >
          <option value="360flat">360 Flat</option>
          <option value="thumbnail">Thumbnail</option>
          <option value="upload">Upload</option>
        </select>
      </div>
    </div>
  );
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

export default function HotspotStyleTabs({ hotspot, onChange, onDelete, onCopy }: HotspotStyleTabsProps) {
  const [tab, setTab] = useState<'style' | 'label' | 'point' | 'global'>('style');

  // Read VTED sub-objects from the optional fields on Hotspot.
  // We use `as any` casts because the data layer is optional and the union of
  // legacy + VTED fields is loose.
  const vtedAny = hotspot as any;
  const style: VtedHotspotStyle = vtedAny.style || {};
  const label: VtedHotspotLabel = vtedAny.label || {};
  const point: VtedPointSetup = vtedAny.pointSetup || {};
  const global: VtedHotspotGlobal = vtedAny.global || {};

  const patchStyle = (p: Partial<VtedHotspotStyle>) =>
    onChange({ style: { ...style, ...p } } as any);
  const patchLabel = (p: Partial<VtedHotspotLabel>) =>
    onChange({ label: { ...label, ...p } } as any);
  const patchPoint = (p: Partial<VtedPointSetup>) =>
    onChange({ pointSetup: { ...point, ...p } } as any);
  const patchGlobal = (p: Partial<VtedHotspotGlobal>) =>
    onChange({ global: { ...global, ...p } } as any);

  // Auto-suggest icon when type changes
  const handleTypeChange = (newType: string) => {
    const suggestedIcon = VTED_HOTSPOT_ICONS[newType] || style.icon;
    onChange({ type: newType as any, icon: suggestedIcon } as any);
  };

  return (
    <div className="space-y-3">
      {/* Header: title + actions */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#3ECF8E]" />
          Hotspot ({hotspot.type})
        </span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={onCopy}
            className="p-1 rounded text-[#A1A1AA] hover:text-white hover:bg-white/10"
            title="Copy"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onChange({})}
            className="p-1 rounded text-[#A1A1AA] hover:text-white hover:bg-white/10"
            title="Revert"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Type + icon row */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-[#71717A] mb-1">
            Type
          </label>
          <select
            value={hotspot.type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
          >
            {VTED_HOTSPOT_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-[#71717A] mb-1">
            Icon
          </label>
          <div className="flex items-center gap-1.5">
            <span className="p-1.5 rounded bg-[#18181B] border border-[#27272A] text-[#3ECF8E]">
              {TYPE_ICONS[hotspot.type as VtedHotspotType] || <Info className="w-3.5 h-3.5" />}
            </span>
            <input
              value={style.icon || ''}
              onChange={(e) => patchStyle({ icon: e.target.value })}
              placeholder="fas fa-..."
              className="flex-1 bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[10px] font-mono text-white"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div role="tablist" className="flex items-center gap-1 p-1 rounded-lg bg-[#09090B] border border-[#27272A]">
        <TabButton id="style" active={tab} setActive={setTab} icon={<Palette className="w-3 h-3" />}>
          Style
        </TabButton>
        <TabButton id="label" active={tab} setActive={setTab} icon={<TypeIcon className="w-3 h-3" />}>
          Label
        </TabButton>
        <TabButton id="point" active={tab} setActive={setTab} icon={<Crosshair className="w-3 h-3" />}>
          Point
        </TabButton>
        <TabButton id="global" active={tab} setActive={setTab} icon={<SettingsIcon className="w-3 h-3" />}>
          Global
        </TabButton>
      </div>

      {tab === 'style' && <StyleTab style={style} onChange={patchStyle} />}
      {tab === 'label' && <LabelTab label={label} onChange={patchLabel} />}
      {tab === 'point' && <PointSetupTab setup={point} onChange={patchPoint} />}
      {tab === 'global' && <GlobalTab global={global} onChange={patchGlobal} />}

      {/* Per-type distortion toggles (compact) */}
      <details className="rounded border border-[#27272A] bg-[#09090B]">
        <summary className="cursor-pointer text-[10px] font-mono uppercase tracking-wider text-[#71717A] px-2 py-1.5 select-none">
          Per-type distortion
        </summary>
        <div className="grid grid-cols-2 gap-1.5 p-2">
          {VTED_DISTORTION_KEYS.map((t) => (
            <div key={t} className="flex items-center justify-between p-1 rounded bg-[#0c0c0f] border border-[#1f1f23]">
              <span className="text-[9px] font-mono text-[#A1A1AA] uppercase">{t}</span>
              <span className="text-[8px] text-[#71717A]">{style.distort ? 'on' : 'off'}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

function TabButton({
  id,
  active,
  setActive,
  icon,
  children,
}: {
  id: 'style' | 'label' | 'point' | 'global';
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
      className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded text-[10px] font-mono transition-all ${
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
