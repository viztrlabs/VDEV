'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Copy, GripVertical, ChevronDown, ChevronRight } from 'lucide-react';
import { useTourStore } from '@/lib/tourClientStore';

interface RoomManagerProps {
  selectedRoomId: string;
  onSelectRoom: (id: string) => void;
}

export function RoomManager({ selectedRoomId, onSelectRoom }: RoomManagerProps) {
  const scenes = useTourStore((s) => s.scenes);
  const addRoom = useTourStore((s) => s.addRoom);
  const deleteRoom = useTourStore((s) => s.deleteRoom);
  const renameRoom = useTourStore((s) => s.renameRoom);
  const duplicateRoom = useTourStore((s) => s.duplicateRoom);
  const [expandedFloors, setExpandedFloors] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string>('');
  const [editName, setEditName] = useState('');

  const floors = scenes.reduce<Record<string, typeof scenes>>((acc, room) => {
    const floor = (room as any).floor || 'Default';
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(room);
    return acc;
  }, {});

  const handleAddRoom = () => {
    const id = addRoom({
      name: `Room ${scenes.length + 1}`,
      type: '360',
      url: '',
      thumbnailUrl: '',
      initialYaw: 0,
      initialPitch: 0,
      initialFov: 75,
      hotspots: [],
    });
    onSelectRoom(id);
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      renameRoom(id, editName.trim());
    }
    setEditingId('');
  };

  return (
    <div className="h-full flex flex-col bg-[#09090B]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#27272A]">
        <span className="text-xs font-mono font-bold text-white">ROOMS</span>
        <button onClick={handleAddRoom} className="p-1 rounded hover:bg-white/5" title="Add Room">
          <Plus className="w-3.5 h-3.5 text-[#71717A]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {Object.entries(floors).map(([floor, rooms]) => (
          <div key={floor}>
            <button
              onClick={() => setExpandedFloors((prev) => ({ ...prev, [floor]: !prev[floor] }))}
              className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-mono text-[#71717A] hover:bg-white/5"
            >
              {expandedFloors[floor] === false ? (
                <ChevronRight className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
              {floor}
              <span className="ml-auto opacity-50">{rooms.length}</span>
            </button>

            {expandedFloors[floor] !== false &&
              rooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  className={`flex items-center gap-2 px-3 py-2 cursor-pointer ${
                    selectedRoomId === room.id
                      ? 'bg-[#3ECF8E]/10 border-l-2 border-[#3ECF8E]'
                      : 'hover:bg-white/5 border-l-2 border-transparent'
                  }`}
                >
                  <GripVertical className="w-3 h-3 text-[#71717A] cursor-grab" />
                  {editingId === room.id ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => handleRename(room.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRename(room.id)}
                      className="flex-1 bg-[#18181B] border border-[#3F3F46] rounded px-2 py-0.5 text-xs font-mono text-white"
                      autoFocus
                    />
                  ) : (
                    <span
                      className="flex-1 text-xs font-mono text-[#A1A1AA] truncate"
                      onDoubleClick={() => {
                        setEditingId(room.id);
                        setEditName(room.name);
                      }}
                    >
                      {room.name || 'Untitled'}
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateRoom(room.id);
                      }}
                      className="p-0.5 rounded hover:bg-white/10"
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3 text-[#71717A]" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this room?')) deleteRoom(room.id);
                      }}
                      className="p-0.5 rounded hover:bg-white/10"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3 text-[#71717A]" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ))}

        {scenes.length === 0 && (
          <div className="p-4 text-center">
            <p className="text-xs text-[#71717A] mb-3">Your tour is empty.</p>
            <button
              onClick={handleAddRoom}
              className="px-3 py-1.5 rounded bg-[#27272A] text-xs font-mono text-white hover:bg-[#3F3F46]"
            >
              <Plus className="w-3 h-3 inline mr-1" />
              Add First Room
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
