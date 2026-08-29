'use client';

import React, { useState, useEffect } from 'react';
import {
  Server,
  Activity,
  Cpu,
  Zap,
  Play,
  Square,
  RefreshCw,
  Sliders,
  Globe,
  Lock,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Maximize,
  Volume2,
  VolumeX,
  Layers,
  Sparkles,
  Wifi,
  Settings,
  Plus
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface StreamSession {
  id: string;
  streamName: string;
  projectId: string;
  clientIp: string;
  region: string;
  gpuNode: string;
  status: 'active' | 'allocating' | 'idle' | 'terminated';
  resolution: string;
  fps: number;
  bitrateMbps: number;
  latencyMs: number;
  vramUsedGb: number;
  vramTotalGb: number;
  startedAt: string;
  durationMinutes: number;
  signalingUrl: string;
}

const REGIONS = [
  { id: 'fra', name: 'eu-central-1 (Frankfurt)', ping: 12, nodes: 12, gpu: 'NVIDIA RTX 4090 Dedicated' },
  { id: 'iad', name: 'us-east-1 (N. Virginia)', ping: 68, nodes: 10, gpu: 'NVIDIA RTX 4090 Dedicated' },
  { id: 'sin', name: 'ap-southeast-1 (Singapore)', ping: 142, nodes: 6, gpu: 'NVIDIA RTX 4090 Dedicated' },
  { id: 'nrt', name: 'ap-northeast-1 (Tokyo)', ping: 180, nodes: 4, gpu: 'NVIDIA RTX 4090 Dedicated' }
];

const INITIAL_SESSIONS: StreamSession[] = [
  {
    id: 'ps-sess-01',
    streamName: 'The Apex Tower - Lumen 4K Master',
    projectId: 'VIZTR-882',
    clientIp: '194.26.29.110 (London, UK)',
    region: 'eu-central-1 (Frankfurt)',
    gpuNode: 'node-fra-gpu-04 (RTX 4090)',
    status: 'active',
    resolution: '3840 x 2160 (4K)',
    fps: 60.0,
    bitrateMbps: 38.4,
    latencyMs: 14.2,
    vramUsedGb: 18.4,
    vramTotalGb: 24.0,
    startedAt: '2026-08-27T06:12:00Z',
    durationMinutes: 18,
    signalingUrl: 'wss://stream-fra.viztr.io/ue5/signaling/apex-tower'
  },
  {
    id: 'ps-sess-02',
    streamName: 'Nordic Monolith - Real-Time Architectural Film',
    projectId: 'VIZTR-904',
    clientIp: '82.165.197.1 (Oslo, NO)',
    region: 'eu-central-1 (Frankfurt)',
    gpuNode: 'node-fra-gpu-07 (RTX 4090)',
    status: 'active',
    resolution: '2560 x 1440 (2K)',
    fps: 59.8,
    bitrateMbps: 24.0,
    latencyMs: 16.5,
    vramUsedGb: 14.2,
    vramTotalGb: 24.0,
    startedAt: '2026-08-27T06:20:00Z',
    durationMinutes: 10,
    signalingUrl: 'wss://stream-fra.viztr.io/ue5/signaling/nordic-monolith'
  },
  {
    id: 'ps-sess-03',
    streamName: 'Solarium Penthouse - Ray-Traced Night Tour',
    projectId: 'VIZTR-771',
    clientIp: '64.233.160.1 (New York, US)',
    region: 'us-east-1 (N. Virginia)',
    gpuNode: 'node-iad-gpu-02 (RTX 4090)',
    status: 'idle',
    resolution: '3840 x 2160 (4K)',
    fps: 60.0,
    bitrateMbps: 0,
    latencyMs: 68.0,
    vramUsedGb: 4.0,
    vramTotalGb: 24.0,
    startedAt: '2026-08-27T05:40:00Z',
    durationMinutes: 45,
    signalingUrl: 'wss://stream-iad.viztr.io/ue5/signaling/solarium'
  }
];

export default function PixelStreamingSessionControl() {
  const [sessions, setSessions] = useState<StreamSession[]>(INITIAL_SESSIONS);
  const [selectedSession, setSelectedSession] = useState<StreamSession>(INITIAL_SESSIONS[0]);
  const [selectedRegion, setSelectedRegion] = useState('fra');
  const [qualityProfile, setQualityProfile] = useState<'ultra' | 'high' | 'balanced'>('ultra');
  const [isAllocating, setIsAllocating] = useState(false);
  const [simulatorActive, setSimulatorActive] = useState(false);
  const [liveFps, setLiveFps] = useState(60);
  const [liveLatency, setLiveLatency] = useState(14.2);
  const { showToast } = useAppStore();

  // Simulated live telemetry tick
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveFps(Math.round(59 + Math.random() * 2));
      setLiveLatency(Number((13.5 + Math.random() * 1.8).toFixed(1)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const totalGpuNodes = REGIONS.reduce((acc, r) => acc + r.nodes, 0);
  const activeSessionsCount = sessions.filter((s) => s.status === 'active').length;
  const averageClusterVram = (
    sessions.reduce((acc, s) => acc + s.vramUsedGb, 0) / Math.max(sessions.length, 1)
  ).toFixed(1);

  const handleStartSession = async (session: StreamSession) => {
    setIsAllocating(true);
    showToast(`Requesting dedicated GPU node in ${session.region}...`, 'info');

    try {
      await fetch('/api/pixel-streaming/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamId: session.id,
          resolution: session.resolution,
          quality: qualityProfile
        })
      });
    } catch {}

    setTimeout(() => {
      setIsAllocating(false);
      setSessions((prev) =>
        prev.map((s) => (s.id === session.id ? { ...s, status: 'active' as const } : s))
      );
      if (selectedSession.id === session.id) {
        setSelectedSession((prev) => ({ ...prev, status: 'active' }));
      }
      setSimulatorActive(true);
      showToast('NVIDIA RTX 4090 node allocated. WebRTC stream linked.', 'success');
    }, 1200);
  };

  const handleTerminateSession = async (session: StreamSession) => {
    try {
      await fetch('/api/pixel-streaming/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId: session.id })
      });
    } catch {}

    setSessions((prev) =>
      prev.map((s) => (s.id === session.id ? { ...s, status: 'idle' as const } : s))
    );
    if (selectedSession.id === session.id) {
      setSelectedSession((prev) => ({ ...prev, status: 'idle' }));
    }
    setSimulatorActive(false);
    showToast('GPU instance released back to cluster pool.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* BANNER */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#18181B] via-[#121214] to-[#09090B] border border-[#27272A] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E] font-bold uppercase tracking-wider">
            <Server className="w-4 h-4" />
            <span>CORE SYSTEM 03 • PIXEL STREAMING SESSION CONTROL</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white">
            NVIDIA Cloud GPU & Pixel Streaming Commander
          </h2>
          <p className="text-xs text-[#A1A1AA] max-w-2xl">
            Directly orchestrate Unreal Engine 5.4 Lumen WebRTC streaming instances, configure signaling endpoints, and track real-time GPU VRAM telemetry across global edge nodes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleStartSession(selectedSession)}
            disabled={isAllocating}
            className="px-4 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#3ECF8E]/90 disabled:opacity-50 text-black font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#3ECF8E]/20 transition-all cursor-pointer"
          >
            {isAllocating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{isAllocating ? 'Allocating Node...' : 'Allocate GPU Node'}</span>
          </button>
        </div>
      </div>

      {/* GPU TELEMETRY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-1">
          <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-mono">
            <span>ACTIVE STREAM NODES</span>
            <Activity className="w-4 h-4 text-[#3ECF8E]" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {activeSessionsCount} / {totalGpuNodes} Nodes
          </div>
          <div className="text-[10px] text-[#3ECF8E]">
            {Math.round((activeSessionsCount / totalGpuNodes) * 100)}% Cluster Allocation
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-1">
          <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-mono">
            <span>VRAM UTILIZATION</span>
            <Cpu className="w-4 h-4 text-[#3ECF8E]" />
          </div>
          <div className="text-2xl font-bold text-[#3ECF8E] font-mono">
            {selectedSession.vramUsedGb} / 24.0 GB
          </div>
          <div className="text-[10px] text-[#A1A1AA]">GDDR6X Dedicated per Instance</div>
        </div>

        <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-1">
          <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-mono">
            <span>WEBRTC LATENCY</span>
            <Wifi className="w-4 h-4 text-[#3ECF8E]" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {liveLatency} ms
          </div>
          <div className="text-[10px] text-[#3ECF8E]">Optimal &lt; 20ms Edge Response</div>
        </div>

        <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-1">
          <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-mono">
            <span>FRAMERATE & BITRATE</span>
            <Zap className="w-4 h-4 text-[#3ECF8E]" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {liveFps} FPS @ {selectedSession.bitrateMbps} Mbps
          </div>
          <div className="text-[10px] text-[#3ECF8E]">AV1 / HEVC Hardware Encoded</div>
        </div>
      </div>

      {/* DUAL WORKSPACE: ACTIVE SESSIONS LIST & STREAMING CONTROLLER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: ACTIVE SESSIONS (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#A1A1AA] uppercase">
                Active Streaming Sessions ({sessions.length})
              </span>
              <span className="text-[10px] font-mono text-[#3ECF8E] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E] animate-pulse" />
                Signaling Online
              </span>
            </div>

            {/* Region Selector */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              {REGIONS.map((reg) => (
                <button
                  key={reg.id}
                  type="button"
                  onClick={() => setSelectedRegion(reg.id)}
                  className={`p-2 rounded-lg border text-left cursor-pointer transition-colors ${
                    selectedRegion === reg.id
                      ? 'bg-[#3ECF8E]/20 text-[#3ECF8E] border-[#3ECF8E]'
                      : 'bg-[#09090B] text-[#A1A1AA] border-[#27272A] hover:border-[#71717A]'
                  }`}
                >
                  <div className="font-bold truncate">{reg.name}</div>
                  <div className="text-[9px] text-[#71717A]">{reg.ping}ms • {reg.nodes} nodes</div>
                </button>
              ))}
            </div>
          </div>

          {/* SESSIONS CARDS */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {sessions.map((sess) => {
              const isSelected = selectedSession.id === sess.id;
              return (
                <div
                  key={sess.id}
                  onClick={() => setSelectedSession(sess)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#27272A]/80 border-[#3ECF8E] shadow-md shadow-[#3ECF8E]/10'
                      : 'bg-[#18181B] border-[#27272A] hover:border-[#71717A]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-[#3ECF8E] truncate">
                      {sess.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase flex items-center gap-1 ${
                        sess.status === 'active'
                          ? 'bg-emerald-950/85 text-emerald-300 border border-emerald-700/60'
                          : sess.status === 'allocating'
                          ? 'bg-sky-950/85 text-sky-300 border border-sky-700/60'
                          : 'bg-[#09090B] text-[#71717A] border-[#27272A]'
                      }`}
                    >
                      {sess.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                      <span>{sess.status}</span>
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white font-display truncate">
                    {sess.streamName}
                  </h4>
                  <div className="text-[10px] text-[#A1A1AA] truncate mt-0.5">
                    Client: {sess.clientIp}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[9px] font-mono text-[#71717A] border-t border-[#27272A] pt-2">
                    <span>{sess.gpuNode}</span>
                    <span className="text-[#3ECF8E]">{sess.resolution}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: STREAMING CONTROLLER & INTERACTIVE MONITOR (7 Cols) */}
        {selectedSession && (
          <div className="lg:col-span-7 space-y-5">
            {/* SESSION CONTROLLER CARD */}
            <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272A] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-[#3ECF8E] font-bold">INSTANCE: {selectedSession.id}</span>
                    <span className="text-[#71717A]">•</span>
                    <span className="text-white">{selectedSession.gpuNode}</span>
                  </div>
                  <h3 className="text-xl font-bold font-display text-white">
                    {selectedSession.streamName}
                  </h3>
                  <div className="text-xs text-[#A1A1AA]">
                    Signaling URL: <code className="text-[#3ECF8E]">{selectedSession.signalingUrl}</code>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedSession.status === 'active' ? (
                    <button
                      type="button"
                      onClick={() => handleTerminateSession(selectedSession)}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5" />
                      <span>Release Node</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartSession(selectedSession)}
                      disabled={isAllocating}
                      className="px-3.5 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Stream</span>
                    </button>
                  )}
                </div>
              </div>

              {/* STREAM CONFIGURATION PROFILE BUTTONS */}
              <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setQualityProfile('ultra')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                    qualityProfile === 'ultra'
                      ? 'bg-[#3ECF8E]/20 text-[#3ECF8E] border-[#3ECF8E]'
                      : 'bg-[#09090B] text-[#A1A1AA] border-[#27272A]'
                  }`}
                >
                  <div className="font-bold">Ultra 4K Lumen</div>
                  <div className="text-[10px] text-[#71717A]">45 Mbps • 60 FPS</div>
                </button>

                <button
                  type="button"
                  onClick={() => setQualityProfile('high')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                    qualityProfile === 'high'
                      ? 'bg-[#3ECF8E]/20 text-[#3ECF8E] border-[#3ECF8E]'
                      : 'bg-[#09090B] text-[#A1A1AA] border-[#27272A]'
                  }`}
                >
                  <div className="font-bold">High 1440p HDR</div>
                  <div className="text-[10px] text-[#71717A]">25 Mbps • 60 FPS</div>
                </button>

                <button
                  type="button"
                  onClick={() => setQualityProfile('balanced')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                    qualityProfile === 'balanced'
                      ? 'bg-[#3ECF8E]/20 text-[#3ECF8E] border-[#3ECF8E]'
                      : 'bg-[#09090B] text-[#A1A1AA] border-[#27272A]'
                  }`}
                >
                  <div className="font-bold">Balanced 1080p</div>
                  <div className="text-[10px] text-[#71717A]">15 Mbps • 60 FPS</div>
                </button>
              </div>

              {/* INTERACTIVE STREAMING SIMULATOR / MONITOR HUD */}
              <div className="relative w-full h-[320px] rounded-xl bg-black border border-[#27272A] overflow-hidden flex flex-col items-center justify-center p-6 text-center shadow-inner">
                {selectedSession.status === 'active' || simulatorActive ? (
                  <div className="w-full h-full flex flex-col justify-between">
                    {/* TOP HUD BAR */}
                    <div className="flex items-center justify-between text-[10px] font-mono bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[#3ECF8E] font-bold">WEBRTC LIVE</span>
                        <span>•</span>
                        <span>{selectedSession.resolution}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[#A1A1AA]">
                        <span>FPS: <strong className="text-white">{liveFps}</strong></span>
                        <span>RTT: <strong className="text-[#3ECF8E]">{liveLatency}ms</strong></span>
                        <span>GPU: <strong className="text-white">58°C (340W)</strong></span>
                      </div>
                    </div>

                    {/* CENTER GRAPHIC */}
                    <div className="space-y-2 text-center">
                      <div className="w-12 h-12 rounded-full bg-[#3ECF8E]/10 border border-[#3ECF8E]/40 flex items-center justify-center mx-auto text-[#3ECF8E]">
                        <Cpu className="w-6 h-6 animate-pulse" />
                      </div>
                      <div className="text-sm font-bold text-white font-mono">
                        Unreal Engine 5.4 Lumen Stream Active
                      </div>
                      <p className="text-[11px] text-[#A1A1AA] max-w-sm mx-auto">
                        Dedicated ray-traced pipeline running on {selectedSession.gpuNode}. Zero installation required on client hardware.
                      </p>
                    </div>

                    {/* BOTTOM HUD CONTROLS */}
                    <div className="flex items-center justify-between text-[10px] font-mono bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[#A1A1AA]">
                      <span>VRAM: {selectedSession.vramUsedGb} / 24 GB</span>
                      <span className="text-[#3ECF8E]">Codec: AV1 Hardware Encoded</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 max-w-sm">
                    <Server className="w-10 h-10 mx-auto text-[#71717A]" />
                    <div className="text-xs font-bold font-mono text-white">
                      GPU Node Currently in Standby Pool
                    </div>
                    <p className="text-[11px] text-[#71717A] font-mono">
                      Click &quot;Start Stream&quot; to allocate a dedicated RTX 4090 node and initiate WebRTC handshakes.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleStartSession(selectedSession)}
                      className="px-4 py-1.5 rounded-lg bg-[#3ECF8E] text-black font-mono font-bold text-xs"
                    >
                      Allocate & Launch
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
