'use client';

import React, { useState } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  MapPin,
  Image,
  Link,
  Eye,
} from 'lucide-react';
import { useTourStore } from '@/lib/tourClientStore';

interface ValidationIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  roomId?: string;
  hotspotId?: string;
  fix?: () => void;
}

export function ValidationPanel() {
  const scenes = useTourStore((s) => s.scenes);
  const updateScene = useTourStore((s) => s.updateScene);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const validate = (): ValidationIssue[] => {
    const issues: ValidationIssue[] = [];

    // Tour-level checks
    if (scenes.length === 0) {
      issues.push({
        id: 'tour-empty',
        type: 'error',
        category: 'Tour Structure',
        message: 'Tour has no rooms',
      });
    }

    if (scenes.length === 1) {
      issues.push({
        id: 'tour-single',
        type: 'info',
        category: 'Tour Structure',
        message: 'Tour has only one room - consider adding more rooms for a better experience',
      });
    }

    // Room-level checks
    scenes.forEach((room) => {
      if (!room.url) {
        issues.push({
          id: `room-${room.id}-no-url`,
          type: 'error',
          category: 'Panorama Images',
          message: `Room "${room.name}" has no panorama image URL`,
          roomId: room.id,
        });
      }

      if (!room.name || room.name === 'Untitled') {
        issues.push({
          id: `room-${room.id}-no-name`,
          type: 'warning',
          category: 'Room Names',
          message: `Room has no name or is named "Untitled"`,
          roomId: room.id,
        });
      }

      if (!room.thumbnailUrl) {
        issues.push({
          id: `room-${room.id}-no-thumb`,
          type: 'warning',
          category: 'Thumbnails',
          message: `Room "${room.name}" has no thumbnail image`,
          roomId: room.id,
        });
      }

      // Hotspot-level checks
      room.hotspots?.forEach((hs) => {
        if (!hs.title) {
          issues.push({
            id: `hs-${hs.id}-no-title`,
            type: 'warning',
            category: 'Hotspot Content',
            message: `Hotspot in "${room.name}" has no title`,
            roomId: room.id,
            hotspotId: hs.id,
          });
        }

        if (hs.type === 'link' && !hs.targetSceneId) {
          issues.push({
            id: `hs-${hs.id}-no-target`,
            type: 'error',
            category: 'Navigation',
            message: `Navigation hotspot in "${room.name}" has no destination`,
            roomId: room.id,
            hotspotId: hs.id,
          });
        }

        if (hs.type === 'link' && hs.targetSceneId) {
          const targetExists = scenes.some((s) => s.id === hs.targetSceneId);
          if (!targetExists) {
            issues.push({
              id: `hs-${hs.id}-broken-link`,
              type: 'error',
              category: 'Navigation',
              message: `Hotspot links to non-existent room`,
              roomId: room.id,
              hotspotId: hs.id,
            });
          }
        }

        if (hs.type === 'image' && !(hs as any).mediaUrl) {
          issues.push({
            id: `hs-${hs.id}-no-media`,
            type: 'error',
            category: 'Media',
            message: `Image hotspot in "${room.name}" has no media URL`,
            roomId: room.id,
            hotspotId: hs.id,
          });
        }

        if (hs.type === 'video' && !(hs as any).mediaUrl) {
          issues.push({
            id: `hs-${hs.id}-no-video`,
            type: 'error',
            category: 'Media',
            message: `Video hotspot in "${room.name}" has no video URL`,
            roomId: room.id,
            hotspotId: hs.id,
          });
        }
      });

      // Check for navigation completeness
      const navHotspots = room.hotspots?.filter((h) => h.type === 'link') || [];
      if (scenes.length > 1 && navHotspots.length === 0) {
        issues.push({
          id: `room-${room.id}-no-nav`,
          type: 'warning',
          category: 'Navigation',
          message: `Room "${room.name}" has no navigation hotspots - visitors cannot leave this room`,
          roomId: room.id,
        });
      }

      // Check for orphaned rooms (no incoming links)
      if (scenes.length > 1) {
        const hasIncomingLinks = scenes.some((s) =>
          s.hotspots?.some((h) => h.type === 'link' && h.targetSceneId === room.id)
        );
        if (!hasIncomingLinks && room.id !== scenes[0]?.id) {
          issues.push({
            id: `room-${room.id}-orphan`,
            type: 'info',
            category: 'Navigation',
            message: `Room "${room.name}" has no incoming navigation links`,
            roomId: room.id,
          });
        }
      }
    });

    // Check for circular navigation
    if (scenes.length > 1) {
      const visited = new Set<string>();
      const checkCircular = (roomId: string, path: string[]): boolean => {
        if (path.includes(roomId)) return true;
        if (visited.has(roomId)) return false;
        visited.add(roomId);
        const room = scenes.find((r) => r.id === roomId);
        if (!room) return false;
        for (const hs of room.hotspots || []) {
          if (hs.type === 'link' && hs.targetSceneId) {
            if (checkCircular(hs.targetSceneId, [...path, roomId])) return true;
          }
        }
        return false;
      };

      scenes.forEach((room) => {
        visited.clear();
        if (checkCircular(room.id, [])) {
          issues.push({
            id: `circular-${room.id}`,
            type: 'info',
            category: 'Navigation',
            message: `Circular navigation detected from "${room.name}"`,
            roomId: room.id,
          });
        }
      });
    }

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
          <span className="text-[10px] font-mono text-red-500">{errors.length} errors</span>
          <span className="text-[10px] font-mono text-amber-500">{warnings.length} warnings</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {issues.length === 0 ? (
          <div className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-[#3ECF8E] mx-auto mb-2" />
            <p className="text-xs font-mono text-[#3ECF8E]">Tour is valid!</p>
            <p className="text-[10px] font-mono text-[#71717A] mt-1">
              No issues found
            </p>
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
                      {issue.roomId && (
                        <button
                          onClick={() => {
                            // TODO: Select room in editor
                          }}
                          className="text-[10px] font-mono text-[#3ECF8E] hover:underline mt-1"
                        >
                          Go to room
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ))
        )}
      </div>

      <div className="border-t border-[#27272A] p-3">
        <div className="flex items-center justify-between text-[10px] font-mono text-[#71717A]">
          <span>{scenes.length} rooms, {scenes.reduce((a, r) => a + (r.hotspots?.length || 0), 0)} hotspots</span>
        </div>
      </div>
    </div>
  );
}
