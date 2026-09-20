'use client';

import React, { useMemo } from 'react';
import { SharedExperienceProvider } from './SharedExperienceContext';
import { ExperienceLayout } from './ExperienceLayout';
import TourViewer from './TourViewer';
import GaussianSplatViewer from './GaussianSplatViewer';
import { PlayCanvasPublicViewer } from './PlayCanvasPublicViewer';

interface ExperienceViewerProps {
  experience: { id: string; title: string; description?: string };
  config: { config: Record<string, any> };
}

function ExperienceViewerInner({ config }: { config: Record<string, any> }) {
  const engine = config.engine as string;
  const hasSplat = !!config.splat?.url;
  const hasTour = !!config.tour;
  const hasPlayCanvas = engine === 'playcanvas';

  const tourScene = useMemo(() => {
    if (!hasTour) return null;
    const rooms = config.tour.rooms || [];
    if (rooms.length === 0) {
      return {
        id: 'room-0',
        name: 'Room',
        type: '360' as const,
        url: '',
        tileUrl: undefined,
        thumbnailUrl: '',
        initialYaw: 0,
        initialPitch: 0,
        initialFov: 90,
        hotspots: [],
        viewConstraints: { top: -90, bottom: 90, left: -180, right: 180, zoomMin: 60, zoomMax: 120, mobileZoomEnabled: false },
        autorotateEnabled: true,
        autorotateSpeed: 0.5,
      };
    }
    const room = rooms[0];
    return {
      id: room.id || 'room-0',
      name: room.name || 'Room',
      type: '360' as const,
      url: room.panorama || '',
      tileUrl: undefined,
      thumbnailUrl: room.thumbnail || '',
      initialYaw: (room.initialViewParameters?.yaw || 0) * (180 / Math.PI),
      initialPitch: (room.initialViewParameters?.pitch || 0) * (180 / Math.PI),
      initialFov: 90,
      hotspots: (room.linkHotspots || []).map((h: any, i: number) => ({
        id: `hs-${i}`,
        yaw: h.yaw,
        pitch: h.pitch,
        type: 'link' as const,
        targetSceneId: h.target,
        targetYaw: 0,
        title: h.target || 'Link',
        description: '',
      })),
      viewConstraints: { top: -90, bottom: 90, left: -180, right: 180, zoomMin: 60, zoomMax: 120, mobileZoomEnabled: false },
      autorotateEnabled: true,
      autorotateSpeed: 0.5,
      spatialAlignment: room.spatialAlignment,
      alignmentMarkers: room.alignmentMarkers,
    };
  }, [config, hasTour]);

  const left = useMemo(() => {
    if (hasTour && tourScene) {
      return <TourViewer scene={tourScene} />;
    }
    if (hasPlayCanvas) {
      return (
        <PlayCanvasPublicViewer
          scene={config.scene || {}}
          camera={config.camera || { position: [0, 0, 5], target: [0, 0, 0], fov: 60 }}
        />
      );
    }
    return null;
  }, [hasTour, hasPlayCanvas, tourScene, config]);

  const right = useMemo(() => {
    if (hasSplat) {
      return <GaussianSplatViewer scenes={[{ id: 'splat-0', name: 'Splat', url: config.splat.url }]} />;
    }
    return null;
  }, [hasSplat, config]);

  if (!right && left) return left;
  if (!left && right) return right;

  if (left && right) {
    return <ExperienceLayout left={left} right={right} />;
  }

  return (
    <div className="flex items-center justify-center h-full text-[#71717A] font-mono text-sm">
      Unsupported engine type: {engine || 'none'}. No content available for this experience.
    </div>
  );
}

export function ExperienceViewer({ experience, config }: ExperienceViewerProps) {
  return (
    <SharedExperienceProvider>
      <ExperienceViewerInner config={config.config} />
    </SharedExperienceProvider>
  );
}
