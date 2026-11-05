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
  Wrench,
} from 'lucide-react';
import { useTourStore } from '@/lib/tourClientStore';
import type { TourScene } from '@/lib/tourClientStore';

export interface ValidationIssue {
  id: string;
  type: 'error' | 'warning';
  message: string;
  roomId?: string;
  hotspotId?: string;
  fix?: () => void;
}

export function validateTour(scenes: TourScene[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  scenes.forEach((scene) => {
    if (!scene.url) {
      issues.push({ id: `${scene.id}-no-url`, type: 'error', message: `Room "${scene.name}" has no panorama URL`, roomId: scene.id });
    }
    if (scene.name === 'New Room') {
      issues.push({ id: `${scene.id}-default-name`, type: 'warning', message: `Room "${scene.name}" still has default name`, roomId: scene.id });
    }
    if (scene.initialYaw === 0 && scene.initialPitch === 0) {
      issues.push({ id: `${scene.id}-default-view`, type: 'warning', message: `Room "${scene.name}" has default starting view`, roomId: scene.id });
    }

    scene.hotspots.forEach((hs) => {
      if (!hs.title) {
        issues.push({ id: `${hs.id}-no-title`, type: 'warning', message: `Hotspot in "${scene.name}" has no title`, roomId: scene.id, hotspotId: hs.id });
      }
      if (hs.type === 'navigation' && !hs.targetSceneId) {
        issues.push({ id: `${hs.id}-no-target`, type: 'error', message: `Navigation hotspot in "${scene.name}" has no target room`, roomId: scene.id, hotspotId: hs.id });
      }
      if (hs.type === 'video' && !hs.videoUrl) {
        issues.push({ id: `${hs.id}-no-video`, type: 'error', message: `Video hotspot in "${scene.name}" has no video URL`, roomId: scene.id, hotspotId: hs.id });
      }
      if (hs.type === 'audio' && !hs.audioUrl) {
        issues.push({ id: `${hs.id}-no-audio`, type: 'error', message: `Audio hotspot in "${scene.name}" has no audio URL`, roomId: scene.id, hotspotId: hs.id });
      }
      if (hs.type === 'link' && !hs.externalUrl) {
        issues.push({ id: `${hs.id}-no-url`, type: 'error', message: `Link hotspot in "${scene.name}" has no URL`, roomId: scene.id, hotspotId: hs.id });
      }
      if (hs.type === 'gallery' && (!hs.images || hs.images.length === 0)) {
        issues.push({ id: `${hs.id}-no-images`, type: 'error', message: `Gallery hotspot in "${scene.name}" has no images`, roomId: scene.id, hotspotId: hs.id });
      }
      if (hs.type === 'image' && !hs.imageUrl) {
        issues.push({ id: `${hs.id}-no-image`, type: 'error', message: `Image hotspot in "${scene.name}" has no image URL`, roomId: scene.id, hotspotId: hs.id });
      }
    });
  });

  if (scenes.length === 0) {
    issues.push({ id: 'no-rooms', type: 'error', message: 'Tour has no rooms' });
  }
  if (scenes.length === 1) {
    issues.push({ id: 'single-room', type: 'warning', message: 'Tour has only one room' });
  }

  return issues;
}

export function ValidationPanel() {
  const scenes = useTourStore((s) => s.scenes);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const issues = validateTour(scenes);
  const errors = issues.filter((i) => i.type === 'error');
  const warnings = issues.filter((i) => i.type === 'warning');

  const totalChecks = scenes.length * 5 + scenes.reduce((acc, s) => acc + s.hotspots.length * 3, 0);
  const passed = totalChecks - errors.length - warnings.length * 0.5;
  const health = totalChecks > 0 ? Math.round((passed / totalChecks) * 100) : 100;

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleFix = (issue: ValidationIssue) => {
    if (issue.roomId) {
      useTourStore.getState().setCurrentScene(issue.roomId);
    }
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

  const groupedIssues = issues.reduce<Record<string, ValidationIssue[]>>((acc, issue) => {
    const cat = issue.type === 'error' ? 'Errors' : 'Warnings';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(issue);
    return acc;
  }, {});

  return (
    <div className="h-full flex flex-col bg-[#09090B]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#27272A]">
        <span className="text-xs font-mono font-bold text-white">VALIDATION</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-red-500">{errors.length} errors</span>
          <span className="text-[10px] font-mono text-amber-500">{warnings.length} warnings</span>
        </div>
      </div>

      <div className="px-3 py-2 border-b border-[#27272A]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono text-[#71717A]">Tour Health</span>
          <span className={`text-[10px] font-mono font-bold ${health > 80 ? 'text-[#3ECF8E]' : health > 50 ? 'text-amber-500' : 'text-red-500'}`}>
            {health}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-[#18181B] rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${health > 80 ? 'bg-[#3ECF8E]' : health > 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${health}%` }} />
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
          Object.entries(groupedIssues).map(([cat, catIssues]) => (
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
                          onClick={() => handleFix(issue)}
                          className="flex items-center gap-1 text-[10px] font-mono text-[#3ECF8E] hover:underline mt-1"
                        >
                          <Wrench className="w-3 h-3" />
                          Fix
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
