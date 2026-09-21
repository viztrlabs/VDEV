'use client';

import React, { useState } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import type { TourRoom, Hotspot } from '@/app/xr-world/virtual-tour/editor/page';

interface ValidationIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  roomId?: string;
  hotspotId?: string;
}

interface EditorValidationPanelProps {
  rooms: TourRoom[];
  onSelectRoom?: (id: string) => void;
  onSelectHotspot?: (roomId: string, hotspotId: string) => void;
}

export function EditorValidationPanel({
  rooms,
  onSelectRoom,
  onSelectHotspot,
}: EditorValidationPanelProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const validate = (): ValidationIssue[] => {
    const issues: ValidationIssue[] = [];

    if (rooms.length === 0) {
      issues.push({
        id: 'tour-empty',
        type: 'error',
        category: 'Tour Structure',
        message: 'Tour has no rooms — upload panoramas to begin',
      });
      return issues;
    }

    if (rooms.length === 1) {
      issues.push({
        id: 'tour-single',
        type: 'info',
        category: 'Tour Structure',
        message: 'Tour has only one room — consider adding more for navigation',
      });
    }

    rooms.forEach((room) => {
      if (!room.panoramaUrl) {
        issues.push({
          id: `room-${room.id}-no-panorama`,
          type: 'error',
          category: 'Panorama Images',
          message: `Room "${room.name}" has no panorama image`,
          roomId: room.id,
        });
      }

      if (!room.name || room.name === 'Untitled' || room.name === 'New Scene') {
        issues.push({
          id: `room-${room.id}-no-name`,
          type: 'warning',
          category: 'Room Names',
          message: `Room has a default name — rename it for clarity`,
          roomId: room.id,
        });
      }

      room.defaultHotspots.forEach((hs: Hotspot) => {
        if (!hs.title || hs.title === 'New Hotspot') {
          issues.push({
            id: `hs-${hs.id}-no-title`,
            type: 'warning',
            category: 'Hotspot Content',
            message: `Hotspot in "${room.name}" has no title`,
            roomId: room.id,
            hotspotId: hs.id,
          });
        }

        if (hs.type === 'room_link') {
          if (!hs.targetRoomId) {
            issues.push({
              id: `hs-${hs.id}-no-target`,
              type: 'error',
              category: 'Navigation',
              message: `Portal in "${room.name}" has no destination`,
              roomId: room.id,
              hotspotId: hs.id,
            });
          } else {
            const targetExists = rooms.some((r) => r.id === hs.targetRoomId);
            if (!targetExists) {
              issues.push({
                id: `hs-${hs.id}-broken-link`,
                type: 'error',
                category: 'Navigation',
                message: `Portal in "${room.name}" links to deleted room`,
                roomId: room.id,
                hotspotId: hs.id,
              });
            }
          }
        }

        if (hs.type === 'image' && !hs.mediaUrl) {
          issues.push({
            id: `hs-${hs.id}-no-media`,
            type: 'error',
            category: 'Media',
            message: `Image hotspot in "${room.name}" has no image URL`,
            roomId: room.id,
            hotspotId: hs.id,
          });
        }
      });

      const navHotspots = room.defaultHotspots.filter((h) => h.type === 'room_link');
      if (rooms.length > 1 && navHotspots.length === 0) {
        issues.push({
          id: `room-${room.id}-no-nav`,
          type: 'warning',
          category: 'Navigation',
          message: `Room "${room.name}" has no portals — visitors cannot leave`,
          roomId: room.id,
        });
      }

      if (rooms.length > 1) {
        const hasIncomingLinks = rooms.some((r) =>
          r.defaultHotspots.some((h) => h.type === 'room_link' && h.targetRoomId === room.id)
        );
        if (!hasIncomingLinks && room.id !== rooms[0]?.id) {
          issues.push({
            id: `room-${room.id}-orphan`,
            type: 'info',
            category: 'Navigation',
            message: `Room "${room.name}" has no incoming portals`,
            roomId: room.id,
          });
        }
      }
    });

    return issues;
  };

  const issues = validate();
  const errors = issues.filter((i) => i.type === 'error');
  const warnings = issues.filter((i) => i.type === 'warning');
  const infos = issues.filter((i) => i.type === 'info');

  const categories = issues.reduce<Record<string, ValidationIssue[]>>((acc, issue) => {
    if (!acc[issue.category]) acc[issue.category] = [];
    acc[issue.category].push(issue);
    return acc;
  }, {});

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#09090B]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#27272A]">
        <span className="text-xs font-mono font-bold text-white">VALIDATION</span>
        <div className="flex items-center gap-2">
          {errors.length > 0 && (
            <span className="text-[10px] font-mono text-red-500">{errors.length} errors</span>
          )}
          {warnings.length > 0 && (
            <span className="text-[10px] font-mono text-amber-500">{warnings.length} warnings</span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {issues.length === 0 ? (
          <div className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-[#3ECF8E] mx-auto mb-2" />
            <p className="text-xs font-mono text-[#3ECF8E]">Tour is valid!</p>
            <p className="text-[10px] font-mono text-[#71717A] mt-1">No issues found</p>
          </div>
        ) : (
          Object.entries(categories).map(([cat, catIssues]) => (
            <div key={cat}>
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-mono text-[#71717A] hover:bg-white/5"
              >
                {expandedCategories[cat] === false ? (
                  <ChevronRight className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
                {cat}
                <span className="ml-auto opacity-50">{catIssues.length}</span>
              </button>

              {expandedCategories[cat] !== false &&
                catIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-start gap-2 px-3 py-2 hover:bg-white/5"
                  >
                    {getStatusIcon(issue.type)}
                    <div className="flex-1">
                      <p className="text-xs font-mono text-[#A1A1AA]">{issue.message}</p>
                      <div className="flex gap-2 mt-1">
                        {issue.roomId && onSelectRoom && (
                          <button
                            onClick={() => onSelectRoom(issue.roomId!)}
                            className="text-[10px] font-mono text-[#3ECF8E] hover:underline"
                          >
                            Go to room
                          </button>
                        )}
                        {issue.roomId && issue.hotspotId && onSelectHotspot && (
                          <button
                            onClick={() => onSelectHotspot(issue.roomId!, issue.hotspotId!)}
                            className="text-[10px] font-mono text-[#3ECF8E] hover:underline"
                          >
                            Select hotspot
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ))
        )}
      </div>

      <div className="border-t border-[#27272A] p-3">
        <div className="flex items-center justify-between text-[10px] font-mono text-[#71717A]">
          <span>{rooms.length} rooms, {rooms.reduce((a, r) => a + r.defaultHotspots.length, 0)} hotspots</span>
        </div>
      </div>
    </div>
  );
}
