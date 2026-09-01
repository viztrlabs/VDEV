'use client';

import React, { useState } from 'react';
import {
  ClipboardList,
  Hexagon,
  MessageCircle,
  Save,
  CheckCircle2,
} from 'lucide-react';
import type { VtedFormStyle, VtedPolygonStyle, VtedPopupStyle } from '@/lib/vted-types';

interface ComponentStylesPanelProps {
  form: VtedFormStyle;
  polygon: VtedPolygonStyle;
  popup: VtedPopupStyle;
  onChangeForm: (next: VtedFormStyle) => void;
  onChangePolygon: (next: VtedPolygonStyle) => void;
  onChangePopup: (next: VtedPopupStyle) => void;
  onSave: () => void;
  saved: boolean;
}

function ColorField({
  label,
  value,
  onChange,
  placeholder = '#000000',
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
        {label}
      </label>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={(value || '#000000').slice(0, 7)}
          onChange={(e) => onChange(e.target.value + (value && value.length > 7 ? value.slice(7) : ''))}
          className="w-10 h-7 bg-transparent border border-[#27272A] rounded"
        />
        <input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
        />
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#27272A] bg-[#0c0c0f] p-3 space-y-3">
      <div className="text-[10px] font-mono uppercase tracking-wider text-[#3ECF8E] flex items-center gap-1.5">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

export default function ComponentStylesPanel({
  form,
  polygon,
  popup,
  onChangeForm,
  onChangePolygon,
  onChangePopup,
  onSave,
  saved,
}: ComponentStylesPanelProps) {
  const [tab, setTab] = useState<'form' | 'polygon' | 'popup'>('form');

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-mono font-bold text-[#3ECF8E] flex items-center gap-2">
          <ClipboardList className="w-4 h-4" />
          Component Styles
        </h2>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-[#3ECF8E]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Saved
            </span>
          )}
          <button
            type="button"
            onClick={onSave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#3ECF8E] hover:bg-[#34b876] text-black text-xs font-bold font-mono"
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </button>
        </div>
      </div>

      <div role="tablist" className="flex items-center gap-1 p-1 rounded-lg bg-[#09090B] border border-[#27272A]">
        <TabBtn id="form" active={tab} setActive={setTab} icon={<ClipboardList className="w-3 h-3" />}>Form</TabBtn>
        <TabBtn id="polygon" active={tab} setActive={setTab} icon={<Hexagon className="w-3 h-3" />}>Polygon</TabBtn>
        <TabBtn id="popup" active={tab} setActive={setTab} icon={<MessageCircle className="w-3 h-3" />}>Popup</TabBtn>
      </div>

      {tab === 'form' && (
        <Section title="Form Setup" icon={<ClipboardList className="w-3 h-3" />}>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
                Layout
              </label>
              <select
                value={form.layout}
                onChange={(e) => onChangeForm({ ...form, layout: e.target.value as 'dialog' | 'panel' })}
                className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
              >
                <option value="dialog">Dialog</option>
                <option value="panel">Panel</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
                Position
              </label>
              <select
                value={form.position || 'right'}
                onChange={(e) => onChangeForm({ ...form, position: e.target.value as 'left' | 'right' })}
                disabled={form.layout !== 'panel'}
                className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white disabled:opacity-40"
              >
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
          <ColorField
            label="Background color"
            value={form.backgroundColor}
            onChange={(v) => onChangeForm({ ...form, backgroundColor: v })}
            placeholder="#000000"
          />
          <ColorField
            label="Overlay color"
            value={form.overlayColor}
            onChange={(v) => onChangeForm({ ...form, overlayColor: v })}
            placeholder="#00000080"
          />
        </Section>
      )}

      {tab === 'polygon' && (
        <Section title="Polygon Setup" icon={<Hexagon className="w-3 h-3" />}>
          <div className="grid grid-cols-2 gap-3">
            <ColorField
              label="Background color"
              value={polygon.backgroundColor}
              onChange={(v) => onChangePolygon({ ...polygon, backgroundColor: v })}
              placeholder="#FFFFFF20"
            />
            <ColorField
              label="Background hover color"
              value={polygon.backgroundHoverColor}
              onChange={(v) => onChangePolygon({ ...polygon, backgroundHoverColor: v })}
              placeholder="#FFFFFF50"
            />
            <ColorField
              label="Border color"
              value={polygon.borderColor}
              onChange={(v) => onChangePolygon({ ...polygon, borderColor: v })}
              placeholder="#3ECF8E"
            />
            <ColorField
              label="Border hover color"
              value={polygon.borderHoverColor}
              onChange={(v) => onChangePolygon({ ...polygon, borderHoverColor: v })}
              placeholder="#3ECF8E"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-[#A1A1AA]">
              Border width {polygon.borderWidth ?? 2}px
            </label>
            <input
              type="range"
              min={0}
              max={8}
              value={polygon.borderWidth ?? 2}
              onChange={(e) => onChangePolygon({ ...polygon, borderWidth: Number(e.target.value) })}
              className="w-full accent-[#3ECF8E]"
            />
          </div>
        </Section>
      )}

      {tab === 'popup' && (
        <Section title="Popup Setup" icon={<MessageCircle className="w-3 h-3" />}>
          <ColorField
            label="Background color"
            value={popup.backgroundColor}
            onChange={(v) => onChangePopup({ ...popup, backgroundColor: v })}
            placeholder="#18181B"
          />
          <ColorField
            label="Text color"
            value={popup.textColor}
            onChange={(v) => onChangePopup({ ...popup, textColor: v })}
            placeholder="#FAFAFA"
          />
        </Section>
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
  id: 'form' | 'polygon' | 'popup';
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
      className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-[10px] font-mono transition-all ${
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
