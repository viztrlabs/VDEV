'use client';

import React, { useState } from 'react';
import { MapPin, FileText, Move, Sliders, Compass } from 'lucide-react';
import { useTourStore } from '@/lib/tourClientStore';
import type { TourHotspot } from '@/lib/tourClientStore';
import { IconPicker } from './IconPicker';
import {
  Section,
  Field,
  TextInput,
  NumberInput,
  SelectInput,
  HOTSPOT_TYPES,
  TypeSpecificFields,
} from './inspector-fields';

interface HotspotSettingsFormProps {
  roomId: string;
  hotspot: TourHotspot;
  onUpdate: (patch: Partial<TourHotspot>) => void;
}

export function HotspotSettingsForm({ roomId, hotspot, onUpdate }: HotspotSettingsFormProps) {
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const scenes = useTourStore((s) => s.scenes);

  return (
    <>
      <Section title="Type" icon={MapPin}>
        <div className="grid grid-cols-2 gap-1">
          {HOTSPOT_TYPES.map((t) => {
            const Icon = t.icon;
            const isActive = hotspot.type === t.type;
            return (
              <button
                key={t.type}
                onClick={() => onUpdate({ type: t.type })}
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

      <TypeSpecificFields hotspot={hotspot} scenes={scenes} roomId={roomId} onUpdate={onUpdate} />

      <Section title="Content" icon={FileText} defaultOpen={false}>
        <Field label="Title">
          <TextInput value={hotspot.title} onChange={(v) => onUpdate({ title: v })} />
        </Field>
        <Field label="Description">
          <textarea
            value={hotspot.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
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
              onChange={(v) => onUpdate({ yaw: (v * Math.PI) / 180 })}
              min={-360}
              max={360}
              step={0.1}
              unit="deg"
            />
          </Field>
          <Field label="Pitch">
            <NumberInput
              value={(hotspot.pitch * 180) / Math.PI}
              onChange={(v) => onUpdate({ pitch: (v * Math.PI) / 180 })}
              min={-90}
              max={90}
              step={0.1}
              unit="deg"
            />
          </Field>
        </div>
        <button
          onClick={() => onUpdate({ yaw: 0, pitch: 0 })}
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
                  onUpdate({ icon });
                  setIconPickerOpen(false);
                }}
                onClose={() => setIconPickerOpen(false)}
              />
            )}
          </div>
        </Field>
        <Field label="Rotation">
          <NumberInput
            value={hotspot.rotation ?? 0}
            onChange={(v) => onUpdate({ rotation: ((v % 360) + 360) % 360 })}
            min={0}
            max={359}
            step={1}
            unit="deg"
          />
        </Field>
        <Field label="Size">
          <NumberInput
            value={hotspot.size ?? 1}
            onChange={(v) => onUpdate({ size: v })}
            min={0.5}
            max={3.0}
            step={0.1}
          />
        </Field>
        <Field label="Color">
          <TextInput
            value={hotspot.color || '#3ECF8E'}
            onChange={(v) => onUpdate({ color: v })}
            placeholder="#hex"
          />
        </Field>
        <Field label="Opacity">
          <NumberInput
            value={hotspot.opacity ?? 1}
            onChange={(v) => onUpdate({ opacity: v })}
            min={0}
            max={1}
            step={0.1}
          />
        </Field>
        <Field label="Label">
          <TextInput
            value={hotspot.label || ''}
            onChange={(v) => onUpdate({ label: v })}
            placeholder="Visible label text"
          />
        </Field>
        <Field label="Tooltip">
          <TextInput
            value={hotspot.tooltip || ''}
            onChange={(v) => onUpdate({ tooltip: v })}
            placeholder="Hover tooltip"
          />
        </Field>
        <Field label="Animation">
          <SelectInput
            value={hotspot.animation || 'none'}
            onChange={(v) => onUpdate({ animation: v as any })}
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
            onChange={(v) => onUpdate({ directionMode: v as any })}
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
                onChange={(v) => onUpdate({ directionYaw: v })}
                min={-3.14}
                max={3.14}
                step={0.01}
                unit="rad"
              />
            </Field>
            <Field label="Direction Pitch">
              <NumberInput
                value={hotspot.directionPitch || 0}
                onChange={(v) => onUpdate({ directionPitch: v })}
                min={-1.57}
                max={1.57}
                step={0.01}
                unit="rad"
              />
            </Field>
          </>
        )}
      </Section>
    </>
  );
}
