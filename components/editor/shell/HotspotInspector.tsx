'use client';

import React, { memo, useState } from 'react';
import HotspotStyleTabs from '@/components/editor/HotspotStyleTabs';
import { IconPicker } from '@/components/tour-builder/IconPicker';
import { CollapsibleCardHeader } from '@/components/editor/shell/CollapsibleCardHeader';
import type { Hotspot, TourRoom, HotspotCategory, HotspotColor } from '@/data/tour-config';

// ============================================================================
// HotspotInspectorItem (memoized per hotspot card)
// ============================================================================

interface HotspotInspectorItemProps {
  hotspot: Hotspot;
  roomId: string;
  otherRooms: Array<{ id: string; name: string }>;
  onUpdate: (patch: Partial<Hotspot>) => void;
  onDelete: () => void;
  onCopy: () => void;
  onSetPortalTarget: (targetId: string) => void;
  onAddPhotos?: (hpId: string) => void;
}

const CATEGORY_OPTIONS: HotspotCategory[] = [
  'material', 'furniture', 'spatial', 'lighting', 'architecture', 'acoustic', 'portal', 'custom',
];
const COLOR_OPTIONS: HotspotColor[] = ['rose', 'emerald', 'cyan', 'amber', 'violet', 'blue'];

function HotspotInspectorItemBase({
  hotspot,
  otherRooms,
  onUpdate,
  onDelete,
  onCopy,
  onSetPortalTarget,
  onAddPhotos,
}: HotspotInspectorItemProps) {
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  return (
    <div className="rounded-xl border border-[#27272A] bg-[#0c0c0f] p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-[#71717A]">
          {hotspot.xPercent}% , {hotspot.yPercent}%
        </span>
      </div>

      <HotspotStyleTabs
        hotspot={hotspot}
        onChange={onUpdate}
        onDelete={onDelete}
        onCopy={onCopy}
      />

      <div className="pt-2 mt-2 border-t border-[#27272A] space-y-2">
        <input
          value={hotspot.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Title"
          className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
        />
        <textarea
          value={hotspot.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Description"
          rows={2}
          className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white resize-none"
        />

        {(hotspot.type === 'room_link' || hotspot.type === 'navigation') && (
          <select
            value={hotspot.targetRoomId || ''}
            onChange={(e) => onSetPortalTarget(e.target.value)}
            className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
          >
            {otherRooms.map((r) => (
              <option key={r.id} value={r.id}>
                → {r.name}
              </option>
            ))}
          </select>
        )}

        {(hotspot.type === 'image' || hotspot.type === 'image_overlay') && (
          <input
            value={hotspot.linkedImageUrl || hotspot.images?.[0] || ''}
            onChange={(e) => onUpdate({ linkedImageUrl: e.target.value, images: [e.target.value] } as any)}
            placeholder="Image URL (https://…)"
            className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
          />
        )}
        {(hotspot.type === 'video' || hotspot.type === 'gallery') && (
          <input
            value={hotspot.linkedImageUrl || hotspot.videoUrl || ''}
            onChange={(e) => onUpdate({ linkedImageUrl: e.target.value, videoUrl: e.target.value } as any)}
            placeholder="Video URL (YouTube/Vimeo/mp4)"
            className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
          />
        )}
        {hotspot.type === 'audio' && (
          <input
            value={hotspot.audioUrl || ''}
            onChange={(e) => onUpdate({ audioUrl: e.target.value })}
            placeholder="Audio URL (https://…)"
            className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
          />
        )}
        {hotspot.type === 'link' && (
          <input
            value={hotspot.externalUrl || ''}
            onChange={(e) => onUpdate({ externalUrl: e.target.value })}
            placeholder="External URL (https://…)"
            className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
          />
        )}
        {hotspot.type === 'model3d' && (
          <input
            value={hotspot.modelUrl || ''}
            onChange={(e) => onUpdate({ modelUrl: e.target.value })}
            placeholder="3D Model URL (.glb/.gltf)"
            className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
          />
        )}
        {hotspot.type === 'experience' && (
          <input
            value={(hotspot as any).experienceId || ''}
            onChange={(e) => onUpdate({ experienceId: e.target.value } as any)}
            placeholder="Experience ID"
            className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
          />
        )}

        <div className="flex items-center gap-2">
          <select
            value={hotspot.category}
            onChange={(e) => onUpdate({ category: e.target.value as HotspotCategory })}
            className="flex-1 bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={hotspot.color || 'emerald'}
            onChange={(e) => onUpdate({ color: e.target.value as HotspotColor })}
            className="flex-1 bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
          >
            {COLOR_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Icon Picker */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#71717A]">Icon</span>
          <div className="flex-1 flex items-center gap-2">
            <span className="text-xs text-[#3ECF8E]">{hotspot.icon || 'default'}</span>
            <button
              onClick={() => setIconPickerOpen(!iconPickerOpen)}
              className="px-2 py-0.5 rounded bg-[#18181B] border border-[#27272A] text-[10px] font-mono text-[#A1A1AA] hover:text-white"
            >
              Change
            </button>
          </div>
        </div>
        {iconPickerOpen && (
          <IconPicker
            value={hotspot.icon}
            onChange={(icon) => { onUpdate({ icon }); setIconPickerOpen(false); }}
            onClose={() => setIconPickerOpen(false)}
          />
        )}

        {(hotspot.type === 'info' || hotspot.type === 'metadata' || hotspot.type === 'image' || hotspot.type === 'gallery') && (
          <PhotoSetSection
            images={hotspot.images || []}
            onRemove={(url) => onUpdate({ images: (hotspot.images || []).filter((u) => u !== url) })}
            onAddPhotos={() => onAddPhotos?.(hotspot.id)}
            canAdd={!!onAddPhotos}
          />
        )}
      </div>

      {/* Appearance Section */}
      <div className="pt-2 mt-2 border-t border-[#27272A] space-y-2">
        <span className="text-[10px] font-mono text-[#71717A]">Appearance</span>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#71717A] w-12">Size</span>
          <input type="range" min="0.5" max="3" step="0.1" value={(hotspot as any).size || 1}
            onChange={(e) => onUpdate({ size: Number(e.target.value) } as any)} className="flex-1" />
          <span className="text-[10px] font-mono text-[#A1A1AA] w-8">{(hotspot as any).size || 1}x</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#71717A] w-12">Opacity</span>
          <input type="range" min="0" max="1" step="0.05" value={(hotspot as any).opacity ?? 1}
            onChange={(e) => onUpdate({ opacity: Number(e.target.value) } as any)} className="flex-1" />
          <span className="text-[10px] font-mono text-[#A1A1AA] w-8">{Math.round(((hotspot as any).opacity ?? 1) * 100)}%</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#71717A] w-12">Label</span>
          <input value={(hotspot as any).label || ''} onChange={(e) => onUpdate({ label: e.target.value } as any)}
            placeholder="Visible label" className="flex-1 bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#71717A] w-12">Tooltip</span>
          <input value={(hotspot as any).tooltip || ''} onChange={(e) => onUpdate({ tooltip: e.target.value } as any)}
            placeholder="Hover tooltip" className="flex-1 bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#71717A] w-12">Animate</span>
          <select value={(hotspot as any).animation || 'none'}
            onChange={(e) => onUpdate({ animation: e.target.value } as any)}
            className="flex-1 bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white">
            <option value="none">None</option>
            <option value="pulse">Pulse</option>
            <option value="glow">Glow</option>
            <option value="bounce">Bounce</option>
          </select>
        </div>
      </div>

      {/* Media Configuration */}
      {(hotspot.type === 'video' || hotspot.type === 'gallery') && (
        <div className="pt-2 mt-2 border-t border-[#27272A] space-y-2">
          <span className="text-[10px] font-mono text-[#71717A]">Video Settings</span>
          <input value={hotspot.posterUrl || ''} onChange={(e) => onUpdate({ posterUrl: e.target.value })}
            placeholder="Poster/thumbnail URL" className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white" />
          <div className="flex gap-4">
            <label className="flex items-center gap-1 text-[10px] font-mono text-[#A1A1AA]">
              <input type="checkbox" checked={hotspot.autoplay || false} onChange={(e) => onUpdate({ autoplay: e.target.checked })} />
              Autoplay
            </label>
            <label className="flex items-center gap-1 text-[10px] font-mono text-[#A1A1AA]">
              <input type="checkbox" checked={hotspot.muted || false} onChange={(e) => onUpdate({ muted: e.target.checked })} />
              Muted
            </label>
            <label className="flex items-center gap-1 text-[10px] font-mono text-[#A1A1AA]">
              <input type="checkbox" checked={hotspot.loop || false} onChange={(e) => onUpdate({ loop: e.target.checked })} />
              Loop
            </label>
          </div>
        </div>
      )}
      {hotspot.type === 'audio' && (
        <div className="pt-2 mt-2 border-t border-[#27272A] space-y-2">
          <span className="text-[10px] font-mono text-[#71717A]">Audio Settings</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-1 text-[10px] font-mono text-[#A1A1AA]">
              <input type="checkbox" checked={hotspot.autoplay || false} onChange={(e) => onUpdate({ autoplay: e.target.checked })} />
              Autoplay
            </label>
            <label className="flex items-center gap-1 text-[10px] font-mono text-[#A1A1AA]">
              <input type="checkbox" checked={hotspot.loop || false} onChange={(e) => onUpdate({ loop: e.target.checked })} />
              Loop
            </label>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#71717A] w-12">Volume</span>
            <input type="range" min="0" max="1" step="0.05" value={hotspot.volume ?? 1}
              onChange={(e) => onUpdate({ volume: Number(e.target.value) })} className="flex-1" />
            <span className="text-[10px] font-mono text-[#A1A1AA] w-8">{Math.round((hotspot.volume ?? 1) * 100)}%</span>
          </div>
        </div>
      )}

      {/* Direction Section */}
      {(hotspot.type === 'room_link' || hotspot.type === 'navigation' || hotspot.type === 'floor') && (
        <div className="pt-2 mt-2 border-t border-[#27272A] space-y-2">
          <span className="text-[10px] font-mono text-[#71717A]">Direction</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#71717A] w-16">Mode</span>
            <select value={(hotspot as any).directionMode || 'auto'}
              onChange={(e) => onUpdate({ directionMode: e.target.value } as any)}
              className="flex-1 bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white">
              <option value="auto">Auto</option>
              <option value="manual">Manual</option>
              <option value="look_at">Look At</option>
              <option value="target">Target</option>
            </select>
          </div>
          {(hotspot as any).directionMode === 'manual' && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#71717A] w-16">Yaw</span>
                <input type="number" value={hotspot.directionYaw || hotspot.targetYaw || 0} min={-3.14} max={3.14} step={0.01}
                  onChange={(e) => onUpdate({ directionYaw: Number(e.target.value), targetYaw: Number(e.target.value) } as any)}
                  className="flex-1 bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#71717A] w-16">Pitch</span>
                <input type="number" value={hotspot.directionPitch || hotspot.targetPitch || 0} min={-1.57} max={1.57} step={0.01}
                  onChange={(e) => onUpdate({ directionPitch: Number(e.target.value), targetPitch: Number(e.target.value) } as any)}
                  className="flex-1 bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white" />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export const HotspotInspectorItem = memo(HotspotInspectorItemBase);

function PhotoSetSection({
  images,
  onRemove,
  onAddPhotos,
  canAdd,
}: {
  images: string[];
  onRemove: (url: string) => void;
  onAddPhotos: () => void;
  canAdd: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="pt-2 mt-2 border-t border-[#27272A] space-y-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-[10px] font-mono text-[#71717A] hover:text-white"
      >
        Photos ({images.length})
      </button>
      {open && (
        <>
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-1.5">
              {images.map((url) => (
                <div key={url} className="relative aspect-square rounded overflow-hidden border border-[#27272A]">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => onRemove(url)}
                    aria-label="Remove photo"
                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 text-white text-[10px] leading-4 text-center hover:bg-black"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          {canAdd && (
            <button
              type="button"
              onClick={onAddPhotos}
              className="w-full px-2 py-1 rounded bg-[#18181B] border border-dashed border-[#3F3F46] text-[10px] font-mono text-[#A1A1AA] hover:text-white hover:border-[#3ECF8E]"
            >
              + Add photos from library
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================================
// HotspotInspector (right sidebar)
// ============================================================================

interface HotspotInspectorProps {
  selected: TourRoom;
  allRooms: TourRoom[];
  onUpdateHotspot: (hpId: string, patch: Partial<Hotspot>) => void;
  onDeleteHotspot: (hpId: string) => void;
  onCopyHotspot: (hpId: string) => void;
  onSetPortalTarget: (hpId: string, targetId: string) => void;
  onAddPhotos?: (hpId: string) => void;
}

export function HotspotInspector({
  selected,
  allRooms,
  onUpdateHotspot,
  onDeleteHotspot,
  onCopyHotspot,
  onSetPortalTarget,
  onAddPhotos,
}: HotspotInspectorProps) {
  const [collapsed, setCollapsed] = useState(false);
  const otherRooms = allRooms
    .filter((r) => r.id !== selected.id)
    .map((r) => ({ id: r.id, name: r.name }));

  return (
    <aside className="w-80 shrink-0 border-l border-[#27272A] overflow-y-auto p-3 space-y-3">
      <CollapsibleCardHeader
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        className="text-[#71717A]"
      >
        Hotspots on &ldquo;{selected.name}&rdquo;
      </CollapsibleCardHeader>
      {!collapsed && (
        <>
      {selected.defaultHotspots.length === 0 && (
        <div className="text-xs text-[#71717A] font-mono">
          No hotspots. Click &ldquo;Add Hotspot&rdquo; then click the image, or drag existing ones to move.
        </div>
      )}
      {selected.defaultHotspots.map((hp) => (
        <HotspotInspectorItem
          key={hp.id}
          hotspot={hp}
          roomId={selected.id}
          otherRooms={otherRooms}
          onUpdate={(patch) => onUpdateHotspot(hp.id, patch)}
          onDelete={() => onDeleteHotspot(hp.id)}
          onCopy={() => onCopyHotspot(hp.id)}
          onSetPortalTarget={(targetId) => onSetPortalTarget(hp.id, targetId)}
          onAddPhotos={onAddPhotos ? (hpId) => onAddPhotos(hpId) : undefined}
        />
      ))}
        </>
      )}
    </aside>
  );
}
