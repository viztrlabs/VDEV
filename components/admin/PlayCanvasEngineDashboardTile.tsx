'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Layers, Play, Pause, Settings, Activity, AlertCircle, CheckCircle } from 'lucide-react';
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

export default function PlayCanvasEngineDashboardTile() {
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

  // Fetch engine status from controller
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
    <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-center ${getStatusColor()}`}>
            {getStatusIcon()}
          </div>
          <div>
            <h4 className="text-xs font-bold text-white font-display">PlayCanvas Engine</h4>
            <p className="text-[10px] text-[#A1A1AA]">WebXR / VR / AR Runtime</p>
          </div>
        </div>
        <div className={`text-xs font-mono ${getStatusColor()}`}>{
          status.isInitialized ? 'INITIALIZED' : 'NOT INITIALIZED'
        }</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A] space-y-1">
          <div className="text-[10px] text-[#71717A] font-mono">WEBXR SUPPORT</div>
          <div className={`text-xs font-bold ${status.isVRSupported || status.isARSupported ? 'text-green-400' : 'text-[#71717A]'}`}>
            VR: {status.isVRSupported ? 'YES' : 'NO'} | AR: {status.isARSupported ? 'YES' : 'NO'}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A] space-y-1">
          <div className="text-[10px] text-[#71717A] font-mono">ACTIVE MODE</div>
          <div className="text-xs font-bold text-white capitalize">{status.activeMode}</div>
        </div>
        <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A] space-y-1">
          <div className="text-[10px] text-[#71717A] font-mono">PERFORMANCE</div>
          <div className="text-xs font-bold text-white">FPS: {status.fps}</div>
        </div>
        <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A] space-y-1">
          <div className="text-[10px] text-[#71717A] font-mono">GEOMETRY</div>
          <div className="text-xs font-bold text-white">
            DC: {status.drawCalls} | Tris: {status.triangles}
          </div>
        </div>
      </div>

      {status.error && (
        <div className="p-2 rounded-lg bg-red-950/30 border border-red-700/30">
          <div className="text-[10px] text-red-300 font-mono">ERROR: {status.error}</div>
        </div>
      )}

      <div className="pt-2 border-t border-[#27272A]">
        <div className="text-[10px] text-[#71717A] font-mono">STATUS: {status.isInitialized ? 'Ready for XR sessions' : 'Waiting for initialization'}</div>
      </div>
    </div>
  );
}
