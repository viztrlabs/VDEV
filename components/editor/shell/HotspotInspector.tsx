'use client';

import React, { memo } from 'react';
import HotspotStyleTabs from '@/components/editor/HotspotStyleTabs';
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
}: HotspotInspectorItemProps) {
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

        {hotspot.type === 'room_link' && (
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

        {hotspot.type === 'image' && (
          <input
            value={hotspot.linkedImageUrl || ''}
            onChange={(e) => onUpdate({ linkedImageUrl: e.target.value })}
            placeholder="Image URL (https://…)"
            className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
          />
        )}
        {hotspot.type === 'video' && (
          <input
            value={hotspot.linkedImageUrl || ''}
            onChange={(e) => onUpdate({ linkedImageUrl: e.target.value })}
            placeholder="Video URL (YouTube/Vimeo/mp4)"
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
      </div>
    </div>
  );
}

export const HotspotInspectorItem = memo(HotspotInspectorItemBase);

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
}

export function HotspotInspector({
  selected,
  allRooms,
  onUpdateHotspot,
  onDeleteHotspot,
  onCopyHotspot,
  onSetPortalTarget,
}: HotspotInspectorProps) {
  const otherRooms = allRooms
    .filter((r) => r.id !== selected.id)
    .map((r) => ({ id: r.id, name: r.name }));

  return (
    <aside className="w-80 shrink-0 border-l border-[#27272A] overflow-y-auto p-3 space-y-3">
      <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
        Hotspots on &ldquo;{selected.name}&rdquo;
      </div>
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
        />
      ))}
    </aside>
  );
}
