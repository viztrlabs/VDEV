'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search } from 'lucide-react';
import type { TourRoom } from '@/components/viewers/PanoramaViewer';

export interface SearchPanelProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
  currentRoom: TourRoom;
  rooms: TourRoom[];
  onNavigate: (room: TourRoom) => void;
}

export default function SearchPanel({
  searchQuery,
  setSearchQuery,
  showSearch,
  setShowSearch,
  currentRoom,
  rooms,
  onNavigate,
}: SearchPanelProps) {
  const filtered = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {showSearch && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm pt-20"
          onClick={() => setShowSearch(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -10 }}
            className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-4 max-w-lg w-full mx-4 shadow-2xl max-h-[70vh] overflow-hidden flex flex-col backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
                <input
                  type="text"
                  placeholder="Search rooms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-sm text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
                />
              </div>
              <button
                onClick={() => setShowSearch(false)}
                className="p-2 rounded-xl hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-2">
              {filtered.map((room) => (
                <button
                  key={room.id}
                  onClick={() => {
                    onNavigate(room);
                    setShowSearch(false);
                    setSearchQuery('');
                  }}
                  className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors text-left ${
                    room.id === currentRoom.id
                      ? 'bg-[#3ECF8E]/20 border border-[#3ECF8E]'
                      : 'bg-[#09090B] border border-[#27272A] hover:border-[#3ECF8E]/50'
                  }`}
                >
                  <img
                    src={room.thumbnailUrl}
                    alt={room.name}
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white truncate">{room.name}</div>
                    <div className="text-[10px] text-[#71717A] truncate">{room.subtitle}</div>
                  </div>
                  {room.id === currentRoom.id && (
                    <span className="text-[9px] font-mono text-[#3ECF8E] uppercase tracking-wider shrink-0">
                      Current
                    </span>
                  )}
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-8 text-[#71717A] text-xs">
                  No rooms found matching "{searchQuery}"
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
