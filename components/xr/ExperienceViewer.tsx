'use client';

import React, { useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { SharedExperienceProvider } from './SharedExperienceContext';
import { ExperienceLayout } from './ExperienceLayout';
import TourViewer from './TourViewer';
import GaussianSplatViewer from './GaussianSplatViewer';
import { PlayCanvasPublicViewer } from './PlayCanvasPublicViewer';
import { useAppStore } from '@/lib/store';

// Pano2VR package playback (browser-only iframe host)
const Pano2VrPlayer = dynamic(() => import('@/components/experience/Pano2VrPlayer'), { ssr: false });

// IWSDK Engine (browser-only dynamic import)
const IWSDKViewer = dynamic(
  () => import('@/components/xr/IWSDKViewer').then((m) => m.IWSDKViewer),
  { ssr: false }
);

interface ExperienceViewerProps {
  experience: { id: string; title: string; description?: string };
  config: { config: Record<string, any> };
}

export type ResolvedEngine = 'iwSDK' | 'playcanvas' | 'pano2vr' | 'tour' | 'splat' | 'none';

/**
 * Single source of truth mapping an experience `config` to a runtime viewer.
 * Order matters: a Pano2VR package owns the whole viewport, an explicit
 * `engine` wins next, then a tour, then a splat-only experience.
 */
export function resolveEngine(config: Record<string, any> | null | undefined): ResolvedEngine {
  if (!config) return 'none';
  if (config.tour?.mode === 'pano2vr') return 'pano2vr';
  const engine = (config.engine as string) || '';
  if (engine === 'iwSDK') return 'iwSDK';
  if (engine === 'playcanvas') return 'playcanvas';
  if (config.tour) return 'tour';
  if (config.splat?.url) return 'splat';
  return 'none';
}

function ExperienceViewerInner({
  experience,
  config,
}: {
  experience: { id: string; title: string };
  config: Record<string, any>;
}) {
  const xrMode = useAppStore((s) => s.xrMode);
  const xrSession = useAppStore((s) => s.xrSession);
  const xrError = useAppStore((s) => s.xrError);
  const endXR = useAppStore((s) => s.endXR);

  // End the store session when the headset/browser ends it (e.g. user exits AR).
  useEffect(() => {
    if (!xrSession || typeof xrSession.addEventListener !== 'function') return;
    const onEnd = () => endXR();
    xrSession.addEventListener('end', onEnd);
    return () => {
      try {
        xrSession.removeEventListener?.('end', onEnd);
      } catch {
        /* ignore */
      }
    };
  }, [xrSession, endXR]);

  const baseEngine = resolveEngine(config);
  // Launching an immersive session always runs through the IWSDK runtime.
  const arActive = xrMode === 'immersive-ar' || xrMode === 'immersive-vr';
  const engine: ResolvedEngine = arActive ? 'iwSDK' : baseEngine;

  // Changing engine / mode / session presence forces a clean remount so the
  // previous WebGL/Three.js/PlayCanvas context is disposed before the new one.
  const sessionFlag = xrSession ? 'session' : 'preview';
  const viewerKey = `${engine}-${xrMode ?? 'preview'}-${sessionFlag}`;

  const tourScene = useMemo(() => {
    if (!config.tour) return null;
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
  }, [config]);

  const pano2vrEntryUrl =
    config.tour?.mode === 'pano2vr'
      ? config.tour?.pano2vr?.entryUrl || config.tour?.entryUrl || ''
      : '';

  const left = useMemo(() => {
    switch (engine) {
      case 'iwSDK':
        return (
          <IWSDKViewer
            key={viewerKey}
            experienceId={config.experienceId || experience.id}
            config={config}
            mode={xrMode}
            xrSession={xrSession}
          />
        );
      case 'pano2vr':
        return pano2vrEntryUrl ? (
          <Pano2VrPlayer entryUrl={pano2vrEntryUrl} title="Virtual Tour" className="w-full h-full border-0" />
        ) : null;
      case 'tour':
        return tourScene ? <TourViewer key={viewerKey} scene={tourScene} /> : null;
      case 'playcanvas':
        return (
          <PlayCanvasPublicViewer
            key={viewerKey}
            scene={config.scene || {}}
            camera={config.camera || { position: [0, 0, 5], target: [0, 0, 0], fov: 60 }}
          />
        );
      default:
        return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, viewerKey, pano2vrEntryUrl, tourScene, config]);

  const right = useMemo(() => {
    // Don't spin up a second splat context while immersed / on IWSDK (it owns splats).
    if (arActive || engine === 'iwSDK') return null;
    if (config.splat?.url) {
      return <GaussianSplatViewer key={`splat-${config.splat.url}`} scenes={[{ id: 'splat-0', name: 'Splat', url: config.splat.url }]} />;
    }
    return null;
  }, [arActive, engine, config]);

  if (!right && left) return left;
  if (!left && right) return right;

  if (left && right) {
    return <ExperienceLayout left={left} right={right} />;
  }

  return (
    <div className="flex items-center justify-center h-full text-[#71717A] font-mono text-sm px-6 text-center">
      {baseEngine === 'none'
        ? 'No published experience content for this project type yet.'
        : `Unsupported engine type: ${baseEngine}. No content available for this experience.`}
    </div>
  );
}

export function ExperienceViewer({ experience, config }: ExperienceViewerProps) {
  const xrError = useAppStore((s) => s.xrError);
  const endXR = useAppStore((s) => s.endXR);

  return (
    <SharedExperienceProvider>
      <div className="relative w-full h-full">
        <ExperienceViewerInner experience={experience} config={config.config} />
        {xrError && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100%-2rem)] rounded-lg border border-rose-500/50 bg-rose-950/90 backdrop-blur px-4 py-2.5 shadow-lg">
            <div className="flex items-start gap-2">
              <span className="text-rose-300 text-sm mt-0.5">⚠</span>
              <div className="flex-1">
                <p className="text-xs font-mono text-rose-200 leading-snug">{xrError}</p>
                <p className="text-[10px] text-rose-300/70 mt-1">
                  Showing the interactive 3D preview instead.
                </p>
              </div>
              <button
                onClick={endXR}
                className="text-rose-300 hover:text-white text-xs px-1 shrink-0"
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </SharedExperienceProvider>
  );
}