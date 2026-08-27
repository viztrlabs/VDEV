'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';
import {
  X,
  Cpu,
  Tv,
  Wifi,
  Activity,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Camera,
  Layers,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

export default function PixelStreamingTerminal() {
  const {
    pixelStreamModalOpen,
    closePixelStream,
    showToast
  } = useAppStore();

  const [connected, setConnected] = useState(true);
  const [latency, setLatency] = useState(19);
  const [bitrate, setBitrate] = useState(24.8);
  const [fps, setFps] = useState(60);
  const [activeCam, setActiveCam] = useState<'living' | 'balcony' | 'master' | 'pool'>('living');
  const [activeMaterial, setActiveMaterial] = useState<'calacatta' | 'marquina' | 'oak' | 'brass'>('calacatta');
  const [audioMuted, setAudioMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Simulate dynamic network fluctuation
  useEffect(() => {
    if (!pixelStreamModalOpen) return;
    const interval = setInterval(() => {
      setLatency(Math.floor(16 + Math.random() * 6));
      setBitrate(Number((24.2 + Math.random() * 1.2).toFixed(1)));
      setFps(Math.random() > 0.1 ? 60 : 59);
    }, 2000);
    return () => clearInterval(interval);
  }, [pixelStreamModalOpen]);

  if (!pixelStreamModalOpen) return null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const cameraFeeds = {
    living: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=85',
    balcony: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85',
    master: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=2000&q=85',
    pool: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=2000&q=85'
  };

  return (
    <div
      ref={containerRef}
      id="pixel-streaming-cloud-terminal"
      className="fixed inset-0 z-[999] bg-black text-white flex flex-col justify-between select-none animate-in fade-in duration-200"
    >
      {/* TOP TELEMETRY HUD BAR */}
      <div className="px-4 py-3 bg-[#09090B] border-b border-[#27272A] flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#18181B] border border-[#27272A] text-[#3ECF8E] text-[10px] font-mono font-bold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E] animate-pulse" />
            <span>UNREAL ENGINE 5.4 LUMEN STREAM</span>
          </div>
          <span className="text-[10px] text-[#71717A] font-mono hidden md:inline">
            NODE: FRA-EU-GPU-04 // NVIDIA RTX A6000
          </span>
        </div>

        {/* Live Network & GPU Telemetry */}
        <div className="flex items-center gap-2.5 text-[10px] font-mono">
          <div className="flex items-center gap-1.5 text-[#3ECF8E] bg-[#18181B] border border-[#27272A] px-2 py-1 rounded">
            <Wifi className="w-3 h-3" />
            <span>{latency} ms</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#3ECF8E] bg-[#18181B] border border-[#27272A] px-2 py-1 rounded hidden sm:flex">
            <Activity className="w-3 h-3" />
            <span>{bitrate} Mbps</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#3ECF8E] bg-[#18181B] border border-[#27272A] px-2 py-1 rounded">
            <Cpu className="w-3 h-3" />
            <span>{fps} FPS (4K)</span>
          </div>

          <button
            onClick={() => setAudioMuted(!audioMuted)}
            className="p-1.5 rounded bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#FAFAFA] transition-colors cursor-pointer"
            title="Toggle Spatial Audio"
          >
            {audioMuted ? <VolumeX className="w-3.5 h-3.5 text-[#3ECF8E]" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#FAFAFA] transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={closePixelStream}
            className="p-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white transition-colors ml-1 cursor-pointer"
            title="Disconnect Stream"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* STREAMING VIEWPORT VIDEO CANVAS */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center bg-black">
        <Image
          src={cameraFeeds[activeCam]}
          alt="Cloud Pixel Streaming Unreal Feed"
          fill
          priority
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-all duration-500 scale-100 filter brightness-105"
        />

        {/* Real-Time Interactive Material Swatch Overlay */}
        <div className="absolute top-4 left-4 z-20 p-3 rounded-lg bg-[#09090B]/90 border border-[#27272A] backdrop-blur-md max-w-xs space-y-2">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#3ECF8E] flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            <span>Real-Time Finish Switcher</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              onClick={() => {
                setActiveMaterial('calacatta');
                showToast('Shader updated: Calacatta Gold Marble applied.', 'info');
              }}
              className={`p-2 rounded text-left border transition-all cursor-pointer ${
                activeMaterial === 'calacatta'
                  ? 'border-[#3ECF8E] bg-[#3ECF8E]/10 text-white'
                  : 'border-[#27272A] bg-[#18181B] text-[#A1A1AA] hover:border-[#3f3f46]'
              }`}
            >
              <div className="font-semibold text-xs">Calacatta Gold</div>
              <div className="text-[9px] font-mono text-[#71717A]">Polished Marble</div>
            </button>

            <button
              onClick={() => {
                setActiveMaterial('marquina');
                showToast('Shader updated: Nero Marquina Marble applied.', 'info');
              }}
              className={`p-2 rounded text-left border transition-all cursor-pointer ${
                activeMaterial === 'marquina'
                  ? 'border-[#3ECF8E] bg-[#3ECF8E]/10 text-white'
                  : 'border-[#27272A] bg-[#18181B] text-[#A1A1AA] hover:border-[#3f3f46]'
              }`}
            >
              <div className="font-semibold text-xs">Nero Marquina</div>
              <div className="text-[9px] font-mono text-[#71717A]">Black Honed</div>
            </button>

            <button
              onClick={() => {
                setActiveMaterial('oak');
                showToast('Shader updated: Smoked Nordic Oak applied.', 'info');
              }}
              className={`p-2 rounded text-left border transition-all cursor-pointer ${
                activeMaterial === 'oak'
                  ? 'border-[#3ECF8E] bg-[#3ECF8E]/10 text-white'
                  : 'border-[#27272A] bg-[#18181B] text-[#A1A1AA] hover:border-[#3f3f46]'
              }`}
            >
              <div className="font-semibold text-xs">Smoked Oak</div>
              <div className="text-[9px] font-mono text-[#71717A]">Chevron Millwork</div>
            </button>

            <button
              onClick={() => {
                setActiveMaterial('brass');
                showToast('Shader updated: Brushed Champagne Brass applied.', 'info');
              }}
              className={`p-2 rounded text-left border transition-all cursor-pointer ${
                activeMaterial === 'brass'
                  ? 'border-[#3ECF8E] bg-[#3ECF8E]/10 text-white'
                  : 'border-[#27272A] bg-[#18181B] text-[#A1A1AA] hover:border-[#3f3f46]'
              }`}
            >
              <div className="font-semibold text-xs">Champagne Brass</div>
              <div className="text-[9px] font-mono text-[#71717A]">Satin Metal</div>
            </button>
          </div>
        </div>

        {/* Live Camera Trajectory Switcher (Bottom HUD) */}
        <div className="absolute bottom-4 inset-x-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-none">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#09090B]/90 border border-[#27272A] backdrop-blur-md pointer-events-auto">
            <button
              onClick={() => setActiveCam('living')}
              className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCam === 'living'
                  ? 'bg-[#3ECF8E] text-black'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Camera className="w-3 h-3" />
              <span>Living Saloon</span>
            </button>
            <button
              onClick={() => setActiveCam('balcony')}
              className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCam === 'balcony'
                  ? 'bg-[#3ECF8E] text-black'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Camera className="w-3 h-3" />
              <span>Fjord Balcony</span>
            </button>
            <button
              onClick={() => setActiveCam('master')}
              className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCam === 'master'
                  ? 'bg-[#3ECF8E] text-black'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Camera className="w-3 h-3" />
              <span>Master Suite</span>
            </button>
            <button
              onClick={() => setActiveCam('pool')}
              className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCam === 'pool'
                  ? 'bg-[#3ECF8E] text-black'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Camera className="w-3 h-3" />
              <span>Infinity Pool</span>
            </button>
          </div>

          <button
            onClick={() => setShowVipModal(true)}
            className="px-4 py-2 rounded bg-[#3ECF8E] hover:bg-[#34b27b] text-black text-xs font-mono font-bold uppercase tracking-wider shadow-lg transition-all pointer-events-auto flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Deploy Pixel Streaming</span>
          </button>
        </div>
      </div>

      {/* VIP DEMO INQUIRY MODAL */}
      {showVipModal && (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-xl bg-[#18181B] border border-[#27272A] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#FAFAFA]">
                Request Dedicated GPU Streaming Instance
              </h3>
              <button
                onClick={() => setShowVipModal(false)}
                className="p-1 rounded text-[#71717A] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#A1A1AA]">
              Provision high-bandwidth Unreal Engine 5.4 cloud streaming kiosks for your upcoming luxury sales launch or international investor presentations.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowVipModal(false);
                showToast('Your GPU streaming request has been received. Our XR director will contact you within 2 hours.', 'success');
              }}
              className="space-y-3"
            >
              <input
                type="text"
                placeholder="Developer / Studio Name"
                required
                className="w-full px-3 py-2 rounded bg-[#09090B] border border-[#27272A] text-xs text-white focus:outline-none focus:border-[#3ECF8E]"
              />
              <input
                type="email"
                placeholder="Executive Email Address"
                required
                className="w-full px-3 py-2 rounded bg-[#09090B] border border-[#27272A] text-xs text-white focus:outline-none focus:border-[#3ECF8E]"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs uppercase tracking-wider shadow-lg transition-colors cursor-pointer"
              >
                Submit Streaming Deployment Brief
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
