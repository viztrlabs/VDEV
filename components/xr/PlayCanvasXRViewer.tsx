'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Box, Activity, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { useCredentialsStore } from '@/lib/credentials-store';

export interface PlayCanvasEngineStatus {
  isInitialized: boolean;
  isVRSupported: boolean;
  isARSupported: boolean;
  activeMode: 'desktop' | 'vr' | 'ar' | 'none';
  fps: number;
  drawCalls: number;
  triangles: number;
  error?: string;
}

export default function PlayCanvasXRViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<PlayCanvasEngineStatus>({
    isInitialized: false,
    isVRSupported: false,
    isARSupported: false,
    activeMode: 'none',
    fps: 0,
    drawCalls: 0,
    triangles: 0,
  });

  const { getCredential } = useCredentialsStore();
  const streamControllerUrl = getCredential('STREAM_CONTROLLER_URL') || 'http://localhost:3001';

  // Fetch status from stream controller
  const fetchStatus = async () => {
    try {
      const response = await fetch(`${streamControllerUrl}/status`);
      if (!response.ok) throw new Error('Failed to fetch status');
      const data = await response.json();
      setStatus({
        isInitialized: data.initialized || false,
        isVRSupported: data.isVRSupported || false,
        isARSupported: data.isARSupported || false,
        activeMode: data.activeMode || 'none',
        fps: data.fps || 0,
        drawCalls: data.drawCalls || 0,
        triangles: data.triangles || 0,
      });
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to connect',
      }));
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [streamControllerUrl]);

  // Initialize PlayCanvas
  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://cdn.playcanvas.com/engine/v181/playcanvas.min.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      // @ts-ignore
      const pc = (window as any).pc;

      const container = containerRef.current;
      if (!container) return;

      // Create application
      const app = new pc.Application(container, {
        graphicsDeviceOptions: {
          antialias: true,
          powerPreference: 'high-performance',
        },
        width: container.clientWidth,
        height: container.clientHeight,
        assetPrefix: '/assets/',
        scripts: [],
      });

      // Set up camera
      const camera = new pc.Camera({
        position: new pc.Vec3(0, 0, 5),
        nearClip: 0.1,
        farClip: 1000,
      });
      app.scene.root.addChild(camera);
      app.start();

      // WebXR setup
      if (app.xr) {
        const supported = app.xr.isAvailable();
        setStatus(prev => ({
          ...prev,
          isVRSupported: supported.vr || false,
          isARSupported: supported.ar || false,
        }));

        // Handle XR session changes
        app.xr.on('start', (session: any) => {
          setStatus(prev => ({
            ...prev,
            activeMode: session.isImmersiveVR ? 'vr' : session.isImmersiveAR ? 'ar' : 'none',
          }));
        });

        app.xr.on('end', () => {
          setStatus(prev => ({
            ...prev,
            activeMode: 'none',
          }));
        });
      }

      // Store references for cleanup
      (window as any).playcanvasApp = app;
    };

    return () => {
      if ((window as any).playcanvasApp) {
        (window as any).playcanvasApp.destroy();
        delete (window as any).playcanvasApp;
      }
    };
  }, [streamControllerUrl]);

  const getStatusColor = () => {
    if (status.error) return 'text-red-400';
    if (!status.isInitialized) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getStatusIcon = () => {
    if (status.error) return <AlertCircle className="w-4 h-4" />;
    if (!status.isInitialized) return <AlertCircle className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  return (
    <div className="relative w-full h-full bg-[#09090B]">
      <div ref={containerRef} className="absolute inset-0" />

      {/* Overlay UI */}
      <div className="absolute top-4 left-4 z-10 bg-[#18181B]/80 backdrop-blur-sm rounded-xl p-4 border border-[#27272A] space-y-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-center ${getStatusColor()}`}>
            {getStatusIcon()}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-display">PlayCanvas Engine</h3>
            <p className="text-[10px] text-[#A1A1AA]">WebXR Runtime</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-[#71717A] font-mono">STATUS</div>
            <div className={`font-bold ${getStatusColor()}`}>{status.isInitialized ? 'INITIALIZED' : 'NOT INITIALIZED'}</div>
          </div>
          <div>
            <div className="text-[#71717A] font-mono">MODE</div>
            <div className="font-bold text-white capitalize">{status.activeMode}</div>
          </div>
          <div>
            <div className="text-[#71717A] font-mono">FPS</div>
            <div className="font-bold text-white">{status.fps}</div>
          </div>
          <div>
            <div className="text-[#71717A] font-mono">GEO</div>
            <div className="font-bold text-white">
              DC: {status.drawCalls} | Tris: {status.triangles}
            </div>
          </div>
        </div>

        {status.error && (
          <div className="p-2 rounded-lg bg-red-950/30 border border-red-700/30">
            <div className="text-[10px] text-red-300 font-mono">ERROR: {status.error}</div>
          </div>
        )}
      </div>
    </div>
  );
}
