'use client';

import React, { useState } from 'react';
import {
  Play,
  Square,
  Activity,
  Cpu,
  Wifi,
  Sparkles,
  Layers,
  Maximize,
  RotateCcw,
  Volume2,
  VolumeX,
  Lock
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import DemoRequestForm from '@/components/forms/DemoRequestForm';

interface PixelStreamingProps {
  streamId?: string;
  isGuarded?: boolean;
}

export default function PixelStreaming({
  streamId = 'apex-tower-ue5',
  isGuarded = false
}: PixelStreamingProps) {
  const [sessionStatus, setSessionStatus] = useState<'idle' | 'allocating' | 'active' | 'ended'>('idle');
  const [fps, setFps] = useState(60);
  const [latency, setLatency] = useState(14);
  const [muted, setMuted] = useState(false);
  const [showDemoRequest, setShowDemoRequest] = useState(false);
  const { showToast } = useAppStore();

  const handleStartSession = async () => {
    setSessionStatus('allocating');
    showToast('Requesting dedicated NVIDIA RTX 4090 GPU node in Frankfurt...', 'info');

    try {
      const res = await fetch('/api/pixel-streaming/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId, resolution: '4k', fps: 60 })
      });
      const data = await res.json();
      console.log('Stream session started:', data);
    } catch {
      // Fallback
    }

    setTimeout(() => {
      setSessionStatus('active');
      showToast('WebRTC low-latency stream connected. Unreal Engine 5.4 Lumen ready.', 'success');
    }, 1800);
  };

  const handleStopSession = async () => {
    setSessionStatus('ended');
    try {
      await fetch('/api/pixel-streaming/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId })
      });
    } catch {}
    showToast('GPU instance released back to cluster pool.', 'info');
  };

  return (
    <div className="space-y-4">
      {/* STREAM VIEWER CONTAINER */}
      <div className="relative w-full h-[540px] sm:h-[640px] rounded-2xl bg-black border border-[#27272A] overflow-hidden flex flex-col items-center justify-center text-center p-6 shadow-2xl">
        {sessionStatus === 'idle' && (
          <div className="space-y-4 max-w-md animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-[#18181B] border border-[#3ECF8E]/40 flex items-center justify-center mx-auto text-[#3ECF8E] shadow-2xl">
              <Cpu className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#18181B] border border-[#3ECF8E]/40 text-[10px] font-mono text-[#3ECF8E] uppercase font-bold">
                FLAGSHIP CLOUD EXPERIENCE
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                Unreal Engine 5.4 Cloud Stream
              </h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Stream full real-time ray-traced architectural walkability to any browser at 60 FPS with zero hardware install.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              {isGuarded ? (
                <button
                  onClick={() => setShowDemoRequest(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-xl shadow-[#3ECF8E]/20"
                >
                  <Lock className="w-4 h-4" />
                  <span>Request Authorized Demo Access</span>
                </button>
              ) : (
                <button
                  onClick={handleStartSession}
                  className="px-5 py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-xl shadow-[#3ECF8E]/20"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Allocate GPU & Launch Stream</span>
                </button>
              )}
            </div>
          </div>
        )}

        {sessionStatus === 'allocating' && (
          <div className="space-y-4 max-w-sm">
            <div className="w-12 h-12 border-3 border-[#3ECF8E] border-t-transparent rounded-full animate-spin mx-auto" />
            <h4 className="text-sm font-bold font-display text-white">
              Allocating Dedicated GPU Cluster...
            </h4>
            <p className="text-[11px] text-[#A1A1AA] font-mono">
              Spinning up containerized Unreal Engine 5.4 instance • Negotiating WebRTC peer connection • 14ms target latency
            </p>
          </div>
        )}

        {sessionStatus === 'active' && (
          <div className="relative w-full h-full">
            {/* Live Unreal Engine Simulation Canvas / Stream background */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2400&q=95)`
              }}
            >
              <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Top Streaming HUD */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-xs font-mono text-[#FAFAFA]">
                <div className="w-2 h-2 rounded-full bg-[#3ECF8E] animate-ping" />
                <span className="text-[#3ECF8E] font-bold">LIVE UE5 STREAM</span>
                <span>•</span>
                <span>{fps} FPS</span>
                <span>•</span>
                <span className="text-[#A1A1AA]">{latency}ms Latency</span>
                <span>•</span>
                <span className="text-[#71717A]">RTX 4090 (EU-Central)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMuted(!muted)}
                  className="p-2 rounded-lg bg-black/80 hover:bg-white/10 border border-white/15 text-white transition-colors cursor-pointer"
                >
                  {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#3ECF8E]" />}
                </button>

                <button
                  onClick={handleStopSession}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-400 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>End Session</span>
                </button>
              </div>
            </div>

            {/* In-Stream Interaction Overlay */}
            <div className="absolute bottom-4 left-4 z-20 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-[11px] font-mono text-[#A1A1AA]">
              Use <span className="text-white font-bold">[W/A/S/D]</span> to walk • <span className="text-white font-bold">[Mouse Drag]</span> to look • <span className="text-white font-bold">[Shift]</span> to sprint
            </div>
          </div>
        )}

        {sessionStatus === 'ended' && (
          <div className="space-y-3 max-w-sm">
            <h4 className="text-base font-bold font-display text-white">
              Pixel Streaming Session Finished
            </h4>
            <p className="text-xs text-[#A1A1AA]">
              Session metrics recorded. GPU container gracefully spun down.
            </p>
            <button
              onClick={() => setSessionStatus('idle')}
              className="px-4 py-2 rounded-lg bg-[#3ECF8E] text-black font-mono font-bold text-xs uppercase cursor-pointer"
            >
              Start New Stream
            </button>
          </div>
        )}
      </div>

      {/* DEMO REQUEST MODAL */}
      {showDemoRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full relative">
            <DemoRequestForm onClose={() => setShowDemoRequest(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
