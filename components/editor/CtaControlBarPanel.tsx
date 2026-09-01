'use client';

import React, { useState } from 'react';
import {
  Megaphone,
  Gamepad2,
  Save,
  CheckCircle2,
  Eye,
  EyeOff,
  Edit3,
  Image as ImageIcon,
} from 'lucide-react';
import {
  VTED_CONTROL_BAR_DEFAULTS,
  VtedCallToAction,
  VtedControlBar,
  VtedControlBarItem,
  VtedControlBarItemId,
} from '@/lib/vted-types';

interface CtaControlBarPanelProps {
  cta: VtedCallToAction;
  onChangeCta: (next: VtedCallToAction) => void;
  controlBar: VtedControlBar;
  onChangeControlBar: (next: VtedControlBar) => void;
  onSave: () => void;
  saved: boolean;
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-2 rounded bg-[#09090B] border border-[#27272A]">
      <span className="text-[10px] font-mono text-[#FAFAFA]">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-9 h-5 rounded-full relative transition-colors ${
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

const ITEM_LABELS: Record<VtedControlBarItemId, string> = {
  floorplan: 'Floorplan',
  sound_on: 'Sound on',
  sound_off: 'Sound off',
  auto_rotate_on: 'Auto rotate on',
  auto_rotate_off: 'Auto rotate off',
  home: 'Home',
  auto_change_scene_on: 'Auto change scene on',
  auto_change_scene_off: 'Auto change scene off',
  scene_sound_on: 'Scene sound on',
  scene_sound_off: 'Scene sound off',
  view_mode: 'View mode',
  multi_staging: 'Multi-Staging',
  gyro: 'Gyro',
  vr: 'VR',
  full_screen: 'Full screen',
  map: 'Map',
  info_scene: 'Info of Scene',
  info_tour: 'Info of Tour',
  group_auto_play: 'Group Auto Play',
  view_mode_normal: 'View mode normal',
  view_mode_little_planet: 'View mode little planet',
  view_mode_mirror: 'View mode mirror',
  snapshot: 'Snapshot',
  multi_language: 'Multi-Language',
  dollhouse: 'Dollhouse',
};

export default function CtaControlBarPanel({
  cta,
  onChangeCta,
  controlBar,
  onChangeControlBar,
  onSave,
  saved,
}: CtaControlBarPanelProps) {
  const [tab, setTab] = useState<'cta' | 'bar'>('cta');

  const setCta = (patch: Partial<VtedCallToAction>) => onChangeCta({ ...cta, ...patch });

  const items: VtedControlBarItem[] = controlBar.items || VTED_CONTROL_BAR_DEFAULTS;

  const setItem = (id: VtedControlBarItemId, patch: Partial<VtedControlBarItem>) => {
    const next = items.map((i) => (i.id === id ? { ...i, ...patch } : i));
    onChangeControlBar({ ...controlBar, items: next });
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-mono font-bold text-[#3ECF8E] flex items-center gap-2">
          <Megaphone className="w-4 h-4" />
          Call To Action & Control Bar
        </h2>
        {saved && (
          <span className="flex items-center gap-1 text-[10px] font-mono text-[#3ECF8E]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Saved
          </span>
        )}
      </div>

      <div role="tablist" className="flex items-center gap-1 p-1 rounded-lg bg-[#09090B] border border-[#27272A]">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'cta'}
          onClick={() => setTab('cta')}
          className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-[10px] font-mono transition-all ${
            tab === 'cta'
              ? 'bg-[#3ECF8E]/15 text-[#3ECF8E] border border-[#3ECF8E]/30'
              : 'text-[#71717A] hover:text-white border border-transparent'
          }`}
        >
          <Megaphone className="w-3 h-3" />
          Call To Action
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'bar'}
          onClick={() => setTab('bar')}
          className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-[10px] font-mono transition-all ${
            tab === 'bar'
              ? 'bg-[#3ECF8E]/15 text-[#3ECF8E] border border-[#3ECF8E]/30'
              : 'text-[#71717A] hover:text-white border border-transparent'
          }`}
        >
          <Gamepad2 className="w-3 h-3" />
          Control Bar ({items.filter((i) => !i.hidden).length} visible)
        </button>
      </div>

      {tab === 'cta' && (
        <div className="rounded-xl border border-[#27272A] bg-[#0c0c0f] p-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
                Layout
              </label>
              <div className="grid grid-cols-2 gap-1">
                {(['bubble', 'list'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setCta({ layout: l })}
                    className={`px-2 py-1.5 rounded border text-[10px] font-mono ${
                      cta.layout === l
                        ? 'bg-[#3ECF8E]/15 border-[#3ECF8E]/40 text-[#3ECF8E]'
                        : 'bg-[#09090B] border-[#27272A] text-[#A1A1AA]'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
                Position
              </label>
              <div className="grid grid-cols-2 gap-1">
                {(['left', 'right'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCta({ position: p })}
                    className={`px-2 py-1.5 rounded border text-[10px] font-mono ${
                      cta.position === p
                        ? 'bg-[#3ECF8E]/15 border-[#3ECF8E]/40 text-[#3ECF8E]'
                        : 'bg-[#09090B] border-[#27272A] text-[#A1A1AA]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <OffsetField
              label={cta.position === 'left' ? 'Offset Left' : 'Offset Right'}
              value={cta.position === 'left' ? cta.offsetLeft : cta.offsetRight}
              onChange={(v) =>
                setCta(cta.position === 'left' ? { offsetLeft: v } : { offsetRight: v })
              }
            />
            <OffsetField
              label="Offset Bottom"
              value={cta.offsetBottom}
              onChange={(v) => setCta({ offsetBottom: v })}
            />
          </div>
        </div>
      )}

      {tab === 'bar' && (
        <div className="rounded-xl border border-[#27272A] bg-[#0c0c0f] p-3 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">
            {items.length} control items
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px] font-mono">
              <thead>
                <tr className="text-[#71717A] border-b border-[#27272A]">
                  <th className="text-left px-2 py-1.5">ID</th>
                  <th className="text-left px-2 py-1.5">Label</th>
                  <th className="text-left px-2 py-1.5">Category</th>
                  <th className="text-left px-2 py-1.5">Source (FA)</th>
                  <th className="text-right px-2 py-1.5">Hide</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-[#18181B] hover:bg-[#09090B]">
                    <td className="px-2 py-1.5 text-[#71717A]">{item.id}</td>
                    <td className="px-2 py-1.5 text-white">{ITEM_LABELS[item.id] || item.id}</td>
                    <td className="px-2 py-1.5">
                      <select
                        value={item.category}
                        onChange={(e) => setItem(item.id, { category: e.target.value as 'icon' | 'text' })}
                        className="bg-[#09090B] border border-[#27272A] rounded px-1 py-0.5 text-[10px] text-white"
                      >
                        <option value="icon">icon</option>
                        <option value="text">text</option>
                      </select>
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        value={item.source}
                        onChange={(e) => setItem(item.id, { source: e.target.value })}
                        className="w-32 bg-[#09090B] border border-[#27272A] rounded px-1 py-0.5 text-[10px] text-white font-mono"
                      />
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      <button
                        type="button"
                        onClick={() => setItem(item.id, { hidden: !item.hidden })}
                        className={`p-1 rounded ${
                          item.hidden ? 'bg-rose-500/20 text-rose-400' : 'bg-[#3ECF8E]/15 text-[#3ECF8E]'
                        }`}
                        title={item.hidden ? 'Hidden' : 'Visible'}
                      >
                        {item.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onSave}
        className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#3ECF8E] hover:bg-[#34b876] text-black text-xs font-bold font-mono"
      >
        <Save className="w-3.5 h-3.5" />
        Save
      </button>
    </div>
  );
}

function OffsetField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-[10px] font-mono text-[#A1A1AA]">
        {label} {value}px
      </label>
      <input
        type="range"
        min={0}
        max={400}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#3ECF8E]"
      />
    </div>
  );
}
