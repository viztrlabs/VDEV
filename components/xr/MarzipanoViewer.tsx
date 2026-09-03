'use client';

/**
 * MarzipanoViewer — Adapter layer for existing XRScene consumers.
 * Internally uses isolated TourViewer (dynamic import).
 * Converts XRScene → TourScene format on the fly.
 */
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { XRScene, HotspotItem } from './xr.types';

// TourViewer is dynamically imported to keep Marzipano out of main bundle
const TourViewer = dynamic(
  () => import('./TourViewer').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-[#09090B] flex flex-col items-center justify-center gap-2 z-40">
        <div className="text-xs font-mono text-[#3ECF8E]">Loading 360° Tour…</div>
        <div className="w-48 h-1 bg-[#27272A] rounded-full overflow-hidden">
          <div className="h-full bg-[#3ECF8E] transition-all duration-300 rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>
      </div>
    ),
  }
);

// Type from TourViewer's internal expectations
interface TourScene {
  id: string;
  name: string;
  type: '360' | '3d';
  url: string;
  tileUrl?: string;
  thumbnailUrl: string;
  initialYaw: number;
  initialPitch: number;
  initialFov: number;
  hotspots: Array<{
    id: string;
    yaw: number;
    pitch: number;
    type: 'link' | 'info' | 'image' | 'video' | 'audio' | 'product';
    targetSceneId?: string;
    targetYaw?: number;
    title: string;
    description: string;
  }>;
  viewConstraints: {
    top: number;
    bottom: number;
    left: number;
    right: number;
    zoomMin: number;
    zoomMax: number;
    mobileZoomEnabled: boolean;
  };
  autorotateEnabled: boolean;
  autorotateSpeed: number;
}

interface MarzipanoViewerProps {
  scene: XRScene;
  onHotspotClick?: (hotspot: HotspotItem) => void;
}

export default function MarzipanoViewer({ scene, onHotspotClick }: MarzipanoViewerProps) {
  const [tourScene, setTourScene] = useState<TourScene | null>(null);

  // Convert XRScene → TourScene
  useEffect(() => {
    if (!scene) return;

    const converted: TourScene = {
      id: scene.id,
      name: scene.name,
      type: scene.type,
      url: scene.url,
      tileUrl: undefined, // Will use fallback full-res if no tileUrl
      thumbnailUrl: scene.thumbnail || scene.url,
      initialYaw: 0,
      initialPitch: 0,
      initialFov: 90,
      hotspots: (scene.hotspots || []).map((hs) => {
        const yaw = Array.isArray(hs.position) ? hs.position[0] : hs.position.yaw;
        const pitch = Array.isArray(hs.position) ? hs.position[1] : hs.position.pitch;
        const isLink = hs.action === 'teleport';
        return {
          id: hs.id,
          yaw,
          pitch,
          type: isLink ? 'link' as const : 'info' as const,
          targetSceneId: isLink ? hs.target : undefined,
          targetYaw: 0,
          title: hs.title || '',
          description: hs.icon || '',
        };
      }),
      viewConstraints: {
        top: -90,
        bottom: 90,
        left: -180,
        right: 180,
        zoomMin: 60,
        zoomMax: 120,
        mobileZoomEnabled: false,
      },
      autorotateEnabled: true,
      autorotateSpeed: 0.5,
    };

    setTourScene(converted);
  }, [scene]);

  if (!tourScene) {
    return (
      <div className="absolute inset-0 bg-[#09090B] flex items-center justify-center">
        <div className="text-xs font-mono text-[#3ECF8E]">Preparing tour…</div>
      </div>
    );
  }

  return (
    <TourViewer
      scene={tourScene}
      onHotspotClick={onHotspotClick}
    />
  );
}