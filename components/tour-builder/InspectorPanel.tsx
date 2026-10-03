'use client';

import React, { useState } from 'react';
import {
  Image,
  FileText,
  MapPin,
  Layers,
  RotateCcw,
  ZoomIn,
  Trash2,
  Copy,
  Move,
  Eye,
  Sliders,
  Compass,
  Settings,
} from 'lucide-react';
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
import { getViewportView } from '@/lib/tour-builder/viewportView';

interface InspectorPanelProps {
  roomId: string;
  hotspotId: string;
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
