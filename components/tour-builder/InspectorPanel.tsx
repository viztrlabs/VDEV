'use client';

import React from 'react';
import { useTourStore } from '@/lib/tourClientStore';

interface InspectorPanelProps {
  roomId: string;
  hotspotId: string;
}

export function InspectorPanel({ roomId, hotspotId }: InspectorPanelProps) {
  const scenes = useTourStore((s) => s.scenes);
  const updateScene = useTourStore((s) => s.updateScene);
  const room = scenes.find((r) => r.id === roomId);
  const hotspot = room?.hotspots?.find((h) => h.id === hotspotId);

  if (hotspot) {
    const handleUpdate = (patch: any) => {
      if (!room) return;
      const hotspots = room.hotspots.map((h) =>
        h.id === hotspot.id ? { ...h, ...patch } : h
      );
      updateScene(roomId, { hotspots });
    };

    return (
      <div className="h-full overflow-y-auto p-3 space-y-4">
        <div className="text-xs font-mono font-bold text-white">HOTSPOT INSPECTOR</div>

        <div>
          <label className="text-[10px] font-mono text-[#71717A] block mb-1">Type</label>
          <select
            value={hotspot.type}
            onChange={(e) => handleUpdate({ type: e.target.value })}
            className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1.5 text-xs font-mono text-white"
          >
            <option value="link">Navigation</option>
            <option value="info">Info</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-mono text-[#71717A] block mb-1">Title</label>
          <input
            value={hotspot.title}
            onChange={(e) => handleUpdate({ title: e.target.value })}
            className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1.5 text-xs font-mono text-white"
          />
        </div>

        <div>
          <label className="text-[10px] font-mono text-[#71717A] block mb-1">Description</label>
          <textarea
            value={hotspot.description}
            onChange={(e) => handleUpdate({ description: e.target.value })}
            className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1.5 text-xs font-mono text-white h-20"
          />
        </div>

        <div>
          <label className="text-[10px] font-mono text-[#71717A] block mb-1">Position</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-mono text-[#71717A]">Yaw</label>
              <input
                type="number"
                value={hotspot.yaw}
                onChange={(e) => handleUpdate({ yaw: Number(e.target.value) })}
                className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="text-[9px] font-mono text-[#71717A]">Pitch</label>
              <input
                type="number"
                value={hotspot.pitch}
                onChange={(e) => handleUpdate({ pitch: Number(e.target.value) })}
                className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs font-mono text-white"
              />
            </div>
          </div>
        </div>

        {hotspot.type === 'link' && (
          <div>
            <label className="text-[10px] font-mono text-[#71717A] block mb-1">Destination</label>
            <select
              value={hotspot.targetSceneId || ''}
              onChange={(e) => handleUpdate({ targetSceneId: e.target.value })}
              className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1.5 text-xs font-mono text-white"
            >
              <option value="">Select room...</option>
              {scenes.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  }

  if (room) {
    return (
      <div className="h-full overflow-y-auto p-3 space-y-4">
        <div className="text-xs font-mono font-bold text-white">ROOM INSPECTOR</div>

        <div>
          <label className="text-[10px] font-mono text-[#71717A] block mb-1">Name</label>
          <input
            value={room.name}
            onChange={(e) => updateScene(room.id, { name: e.target.value })}
            className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1.5 text-xs font-mono text-white"
          />
        </div>

        <div>
          <label className="text-[10px] font-mono text-[#71717A] block mb-1">Starting View</label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[9px] font-mono text-[#71717A]">Yaw</label>
              <input
                type="number"
                value={room.initialYaw}
                onChange={(e) => updateScene(room.id, { initialYaw: Number(e.target.value) })}
                className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="text-[9px] font-mono text-[#71717A]">Pitch</label>
              <input
                type="number"
                value={room.initialPitch}
                onChange={(e) => updateScene(room.id, { initialPitch: Number(e.target.value) })}
                className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="text-[9px] font-mono text-[#71717A]">FOV</label>
              <input
                type="number"
                value={room.initialFov}
                onChange={(e) => updateScene(room.id, { initialFov: Number(e.target.value) })}
                className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs font-mono text-white"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-mono text-[#71717A] block mb-1">Hotspots</label>
          <div className="text-xs font-mono text-[#A1A1AA]">{room.hotspots?.length || 0} hotspots</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center p-4">
      <p className="text-xs text-[#71717A] font-mono">Select a room or hotspot to inspect</p>
    </div>
  );
}
