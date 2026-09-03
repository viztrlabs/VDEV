'use client';

import React, { useState } from 'react';
import {
  Palette,
  Type as TypeIcon,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  VTED_THEME_PRESETS, VtedDesign, VtedThemePreset,
  VtedFormStyle, VtedPolygonStyle, VtedPopupStyle,
} from '@/lib/vted-types';
import PolygonStylePanel from './PolygonStylePanel';
import PopupStylePanel from './PopupStylePanel';
import FormStylePanel from './FormStylePanel';

interface DesignTabPanelProps {
  value: VtedDesign;
  onChange: (next: VtedDesign) => void;
  onSave: () => void;
  saved: boolean;
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

const FONT_OPTIONS = [
  'Inter',
  'Roboto',
  'Helvetica',
  'Georgia',
  'Merriweather',
  'Lora',
  'Courier',
  'JetBrains Mono',
  'Playfair Display',
];

export default function DesignTabPanel({ value, onChange, onSave, saved }: DesignTabPanelProps) {
  const [local, setLocal] = useState<VtedDesign>(value);

  React.useEffect(() => {
    setLocal(value);
  }, [value]);

  const set = (patch: Partial<VtedDesign>) => {
    const next = { ...local, ...patch };
    setLocal(next);
    onChange(next);
  };

  const setDisplay = (patch: Partial<VtedDesign['display']>) => {
    set({ display: { ...(local.display || {}), ...patch } });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-mono font-bold text-[#3ECF8E] flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Design — Branding & Theme
        </h2>
        {saved && (
          <span className="flex items-center gap-1 text-[10px] font-mono text-[#3ECF8E]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Saved
          </span>
        )}
      </div>

      {/* Theme Presets */}
      <div className="space-y-2">
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">
          Theme Preset
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {VTED_THEME_PRESETS.map((p) => {
            const active = local.preset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => set({ preset: p.id as VtedThemePreset })}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  active
                    ? 'bg-[#3ECF8E]/15 border-[#3ECF8E]/50 text-[#3ECF8E]'
                    : 'bg-[#09090B] border-[#27272A] text-[#A1A1AA] hover:text-white'
                }`}
              >
                <div className="text-[11px] font-mono font-bold">{p.name}</div>
                <div className="text-[9px] font-mono opacity-70 mt-0.5">{p.subtitle}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
            Primary color
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={(local.primaryColor || '#3ECF8E').slice(0, 7)}
              onChange={(e) => set({ primaryColor: e.target.value })}
              className="w-10 h-8 bg-transparent border border-[#27272A] rounded"
            />
            <input
              value={local.primaryColor || ''}
              onChange={(e) => set({ primaryColor: e.target.value })}
              placeholder="#3ECF8E"
              className="flex-1 bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
            />
          </div>
          <p className="text-[9px] text-[#71717A] mt-0.5">Supports hex + alpha (e.g. #3ECF8E50)</p>
        </div>
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
            Text color
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={(local.textColor || '#FAFAFA').slice(0, 7)}
              onChange={(e) => set({ textColor: e.target.value })}
              className="w-10 h-8 bg-transparent border border-[#27272A] rounded"
            />
            <input
              value={local.textColor || ''}
              onChange={(e) => set({ textColor: e.target.value })}
              placeholder="#FAFAFA"
              className="flex-1 bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
            />
          </div>
        </div>
      </div>

      {/* Fonts */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
            <TypeIcon className="w-3 h-3" />
            Primary font
          </label>
          <select
            value={local.primaryFont || 'Inter'}
            onChange={(e) => set({ primaryFont: e.target.value })}
            className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1.5 text-xs font-mono text-white"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
            <TypeIcon className="w-3 h-3" />
            Secondary font
          </label>
          <select
            value={local.secondaryFont || 'Inter'}
            onChange={(e) => set({ secondaryFont: e.target.value })}
            className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1.5 text-xs font-mono text-white"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Display toggles */}
      <div className="space-y-2">
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] flex items-center gap-1">
          <Eye className="w-3 h-3" />
          Display Toggles
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <ToggleRow
            label="Hide project title"
            value={!!local.display?.hideProjectTitle}
            onChange={(v) => setDisplay({ hideProjectTitle: v })}
          />
          <ToggleRow
            label="Hide scene title on card"
            value={!!local.display?.hideSceneTitleOnCard}
            onChange={(v) => setDisplay({ hideSceneTitleOnCard: v })}
          />
          <ToggleRow
            label="Hide scene title"
            value={!!local.display?.hideSceneTitle}
            onChange={(v) => setDisplay({ hideSceneTitle: v })}
          />
          <ToggleRow
            label="Auto open scene list"
            value={!!local.display?.autoOpenSceneList}
            onChange={(v) => setDisplay({ autoOpenSceneList: v })}
          />
          <ToggleRow
            label="Show scene title in scene list"
            value={!!local.display?.showSceneTitleInList}
            onChange={(v) => setDisplay({ showSceneTitleInList: v })}
          />
        </div>
      </div>

      {/* Polygon style */}
      <div className="space-y-2">
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">
          Polygon Style
        </label>
        <PolygonStylePanel style={local.polygonStyle || {}} onChangeStyle={set} />
      </div>

      {/* Popup style */}
      <div className="space-y-2">
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">
          Popup Style
        </label>
        <PopupStylePanel style={local.popupStyle || {}} onChangeStyle={set} />
      </div>

      {/* Form style */}
      <div className="space-y-2">
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">
          Form Style
        </label>
        <FormStylePanel style={local.formStyle || {}} onChangeStyle={set} />
      </div>

      {/* Live preview chip */}
      <div className="rounded-lg border border-[#27272A] bg-[#0c0c0f] p-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] mb-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#3ECF8E]" />
          Preview
        </div>
        <div
          className="rounded-md p-3"
          style={{
            background: local.primaryColor || '#3ECF8E',
            color: local.textColor || '#FAFAFA',
            fontFamily: local.primaryFont || 'Inter',
          }}
        >
          <div className="text-[11px] font-bold">The Solarium Sky Penthouse</div>
          <div className="text-[9px] opacity-80 mt-0.5">
            Primary accent + {(local.secondaryFont || 'Inter')} secondary
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onSave}
        className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#3ECF8E] hover:bg-[#34b876] text-black text-xs font-bold font-mono"
      >
        <Save className="w-3.5 h-3.5" />
        Save Branding
      </button>
    </div>
  );
}
