'use client';

import React, { useState } from 'react';
import { useTourStore } from '@/lib/tourClientStore';
import { Link, ArrowRight, X, Check, RotateCcw } from 'lucide-react';

interface ConnectorSystemProps {
  sourceSceneId: string;
  targetSceneId?: string;
  yaw: number;
  pitch: number;
  onConnect: (sourceId: string, targetId: string, yaw: number, pitch: number, reverse?: boolean) => void;
  onCancel: () => void;
}

export function ConnectorSystem({ sourceSceneId, targetSceneId, yaw, pitch, onConnect, onCancel }: ConnectorSystemProps) {
  const scenes = useTourStore((s) => s.scenes);
  const [selectedTarget, setSelectedTarget] = useState(targetSceneId || '');
  const [createReverse, setCreateReverse] = useState(false);
  const [label, setLabel] = useState('');

  const source = scenes.find((s) => s.id === sourceSceneId);
  const target = scenes.find((s) => s.id === selectedTarget);
  const availableRooms = scenes.filter((s) => s.id !== sourceSceneId);

  const handleConnect = () => {
    if (!selectedTarget) return;
    onConnect(sourceSceneId, selectedTarget, yaw, pitch, createReverse);
  };

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 bg-[#09090B] border border-[#27272A] rounded-xl p-4 w-96 shadow-2xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Link className="w-4 h-4 text-[#3ECF8E]" />
          <span className="text-xs font-mono font-bold text-white">Connect Rooms</span>
        </div>
        <button onClick={onCancel} className="text-[#71717A] hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="text-[#A1A1AA]">From:</span>
          <span className="text-white px-2 py-0.5 bg-[#18181B] rounded">{source?.name || 'Unknown'}</span>
          <ArrowRight className="w-3 h-3 text-[#3ECF8E]" />
          <span className="text-[#A1A1AA]">To:</span>
        </div>

        <select
          value={selectedTarget}
          onChange={(e) => setSelectedTarget(e.target.value)}
          className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#3ECF8E]"
        >
          <option value="">Select destination...</option>
          {availableRooms.map((room) => (
            <option key={room.id} value={room.id}>{room.name}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Label (optional)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
        />

        <label className="flex items-center gap-2 text-[10px] font-mono text-[#A1A1AA] cursor-pointer">
          <input
            type="checkbox"
            checked={createReverse}
            onChange={(e) => setCreateReverse(e.target.checked)}
            className="rounded border-[#27272A]"
          />
          <RotateCcw className="w-3 h-3" />
          Create reverse link ({target?.name} → {source?.name})
        </label>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 px-3 py-1.5 rounded-lg border border-[#27272A] bg-[#18181B] text-[#A1A1AA] text-xs font-mono hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleConnect}
            disabled={!selectedTarget}
            className="flex-1 px-3 py-1.5 rounded-lg bg-[#3ECF8E] text-black text-xs font-mono font-bold disabled:opacity-40"
          >
            <Check className="w-3 h-3 inline mr-1" />
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}
