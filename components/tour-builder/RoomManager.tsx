'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  GripVertical,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Eye,
  FolderOpen,
  Upload,
} from 'lucide-react';
import { useTourStore } from '@/lib/tourClientStore';
import type { TourScene } from '@/lib/tourClientStore';

interface RoomManagerProps {
  selectedRoomId: string;
  onSelectRoom: (id: string) => void;
}

export function RoomManager({ selectedRoomId, onSelectRoom }: RoomManagerProps) {
  const scenes = useTourStore((s) => s.scenes);
  const addRoom = useTourStore((s) => s.addRoom);
  const deleteScene = useTourStore((s) => s.deleteScene);
  const renameRoom = useTourStore((s) => s.renameRoom);
  const duplicateRoom = useTourStore((s) => s.duplicateRoom);
  const reorderRoom = useTourStore((s) => s.reorderRoom);
  const setCurrentScene = useTourStore((s) => s.setCurrentScene);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedFloors, setExpandedFloors] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string>('');
  const [editName, setEditName] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    roomId: string;
    x: number;
    y: number;
  } | null>(null);
  const [dragOverId, setDragOverId] = useState<string>('');
  const dragIdRef = useRef<string>('');

  const floors = scenes.reduce<Record<string, TourScene[]>>((acc, room) => {
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

  const handleContextMenu = (e: React.MouseEvent, roomId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ roomId, x: e.clientX, y: e.clientY });
  };

  const handleDragStart = (e: React.DragEvent, roomId: string) => {
    dragIdRef.current = roomId;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, roomId: string) => {
    e.preventDefault();
    if (dragIdRef.current && dragIdRef.current !== roomId) {
      setDragOverId(roomId);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = dragIdRef.current;
    if (!sourceId || sourceId === targetId) return;

    const sourceIdx = scenes.findIndex((r) => r.id === sourceId);
    const targetIdx = scenes.findIndex((r) => r.id === targetId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    if (sourceIdx < targetIdx) {
      reorderRoom(sourceId, 'down');
    } else {
      reorderRoom(sourceId, 'up');
    }

    setDragOverId('');
    dragIdRef.current = '';
  };

  const handleDragEnd = () => {
    setDragOverId('');
    dragIdRef.current = '';
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const name = file.name.replace(/\.[^/.]+$/, '');
        const id = addRoom({
          name,
          type: '360',
          url,
          thumbnailUrl: url,
          initialYaw: 0,
          initialPitch: 0,
          initialFov: 75,
          hotspots: [],
        });
        onSelectRoom(id);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="h-full flex flex-col bg-[#09090B]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#27272A]">
        <span className="text-xs font-mono font-bold text-white">ROOMS</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const allExpanded = Object.values(expandedFloors).every(Boolean);
              const newExpanded: Record<string, boolean> = {};
              Object.keys(floors).forEach((f) => {
                newExpanded[f] = !allExpanded;
              });
              setExpandedFloors(newExpanded);
            }}
            className="p-1 rounded hover:bg-white/5"
            title="Toggle All"
          >
            <FolderOpen className="w-3.5 h-3.5 text-[#71717A]" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1 rounded hover:bg-white/5"
            title="Upload Panorama"
          >
            <Upload className="w-3.5 h-3.5 text-[#71717A]" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
          <button onClick={handleAddRoom} className="p-1 rounded hover:bg-white/5" title="Add Room">
            <Plus className="w-3.5 h-3.5 text-[#71717A]" />
          </button>
        </div>
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
                  draggable
                  onDragStart={(e) => handleDragStart(e, room.id)}
                  onDragOver={(e) => handleDragOver(e, room.id)}
                  onDrop={(e) => handleDrop(e, room.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => {
                    onSelectRoom(room.id);
                    setCurrentScene(room.id);
                  }}
                  onContextMenu={(e) => handleContextMenu(e, room.id)}
                  className={`flex items-center gap-2 px-3 py-2 cursor-pointer ${
                    selectedRoomId === room.id
                      ? 'bg-[#3ECF8E]/10 border-l-2 border-[#3ECF8E]'
                      : 'hover:bg-white/5 border-l-2 border-transparent'
                  } ${dragOverId === room.id ? 'border-t-2 border-[#3ECF8E]' : ''}`}
                >
                  <GripVertical className="w-3 h-3 text-[#71717A] cursor-grab flex-shrink-0" />
                  {room.thumbnailUrl ? (
                    <div className="w-8 h-8 rounded bg-[#18181B] flex-shrink-0 overflow-hidden">
                      <img
                        src={room.thumbnailUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded bg-[#18181B] flex-shrink-0 flex items-center justify-center">
                      <Eye className="w-3 h-3 text-[#71717A]" />
                    </div>
                  )}
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
                    <span className="text-[9px] font-mono text-[#71717A]">
                      {room.hotspots?.length || 0}
                    </span>
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

      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 bg-[#18181B] border border-[#27272A] rounded shadow-lg py-1 min-w-[160px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={() => {
                const room = scenes.find((r) => r.id === contextMenu.roomId);
                if (room) {
                  setEditingId(room.id);
                  setEditName(room.name);
                }
                setContextMenu(null);
              }}
              className="w-full px-3 py-1.5 text-xs font-mono text-left hover:bg-white/5"
            >
              Rename
            </button>
            <button
              onClick={() => {
                duplicateRoom(contextMenu.roomId);
                setContextMenu(null);
              }}
              className="w-full px-3 py-1.5 text-xs font-mono text-left hover:bg-white/5"
            >
              Duplicate
            </button>
            <div className="border-t border-[#27272A] my-1" />
            <button
              onClick={() => {
                reorderRoom(contextMenu.roomId, 'up');
                setContextMenu(null);
              }}
              className="w-full px-3 py-1.5 text-xs font-mono text-left hover:bg-white/5"
            >
              Move Up
            </button>
            <button
              onClick={() => {
                reorderRoom(contextMenu.roomId, 'down');
                setContextMenu(null);
              }}
              className="w-full px-3 py-1.5 text-xs font-mono text-left hover:bg-white/5"
            >
              Move Down
            </button>
            <div className="border-t border-[#27272A] my-1" />
            <button
              onClick={() => {
                if (confirm('Delete this room?')) {
                  deleteScene(contextMenu.roomId);
                }
                setContextMenu(null);
              }}
              className="w-full px-3 py-1.5 text-xs font-mono text-left text-red-500 hover:bg-white/5"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
