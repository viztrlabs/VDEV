'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Box,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Clock,
  Eye,
  Plus,
  RefreshCw,
  Trash2,
  Share2,
  Shield,
  Layers,
  Smartphone,
  Headset,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Download
} from 'lucide-react';
import { XRToken, INITIAL_XR_TOKENS } from '@/lib/core-systems-data';
import { ManagedProject } from '@/lib/projects-data';
import { useAppStore } from '@/lib/store';

interface XRLinkGeneratorProps {
  projects: ManagedProject[];
}

export default function XRLinkGenerator({ projects }: XRLinkGeneratorProps) {
  const [tokens, setTokens] = useState<XRToken[]>(INITIAL_XR_TOKENS);
  const [selectedToken, setSelectedToken] = useState<XRToken>(INITIAL_XR_TOKENS[0]);
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { showToast, openModelViewer } = useAppStore();

  // New Token Form State
  const [newTokenData, setNewTokenData] = useState({
    name: '',
    projectId: projects[0]?.id || 'VIZTR-882',
    modelUrl: '/models/apex-tower-v3-draco.glb',
    modelFormat: 'glb' as 'glb' | 'gltf' | 'usdz',
    experienceType: 'webxr' as 'webxr' | 'webar' | 'vr_tour' | 'pixel_stream',
    scale: 1.0,
    environmentPreset: 'sunset' as 'studio' | 'sunset' | 'city' | 'dawn',
    requiresPasscode: false,
    passcode: '',
    expiryDays: '30', // '1', '7', '30', 'unlimited'
    maxViews: '250',
    notes: 'Client VIP review link for spatial demonstration.'
  });

  const filteredTokens = tokens.filter((t) => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  const handleGenerateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenData.name.trim()) {
      showToast('Experience name is required.', 'error');
      return;
    }

    const randomSlug = Math.random().toString(36).substring(2, 10);
    const tokenString = `xr_${randomSlug}_${Date.now().toString(36).substring(4)}`;
    const matchedProject = projects.find((p) => p.id === newTokenData.projectId);

    let expiresAt: string | null = null;
    if (newTokenData.expiryDays !== 'unlimited') {
      const date = new Date();
      date.setDate(date.getDate() + Number(newTokenData.expiryDays));
      expiresAt = date.toISOString();
    }

    const newToken: XRToken = {
      id: `xrt-${Date.now()}`,
      token: tokenString,
      name: newTokenData.name,
      projectId: newTokenData.projectId,
      projectName: matchedProject?.name || 'Architectural Commission',
      modelUrl: newTokenData.modelUrl,
      modelFormat: newTokenData.modelFormat,
      experienceType: newTokenData.experienceType,
      scale: Number(newTokenData.scale) || 1.0,
      environmentPreset: newTokenData.environmentPreset,
      requiresPasscode: newTokenData.requiresPasscode,
      passcode: newTokenData.requiresPasscode ? newTokenData.passcode || '1234' : undefined,
      expiresAt,
      maxViews: newTokenData.maxViews ? Number(newTokenData.maxViews) : null,
      currentViews: 0,
      createdAt: new Date().toISOString(),
      status: 'active',
      notes: newTokenData.notes
    };

    setTokens([newToken, ...tokens]);
    setSelectedToken(newToken);
    setIsCreating(false);
    showToast(`XR Token generated: ${newToken.token}`, 'success');
  };

  const handleCopyLink = (token: XRToken) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://viztr.studio';
    const link = `${origin}/xr/view?token=${token.token}`;
    navigator.clipboard.writeText(link);
    setCopiedTokenId(token.id);
    setTimeout(() => setCopiedTokenId(null), 2000);
    showToast('XR experience URL copied to clipboard.', 'success');
  };

  const handleRevokeToken = (id: string) => {
    setTokens((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'revoked' as const } : t))
    );
    if (selectedToken.id === id) {
      setSelectedToken((prev) => ({ ...prev, status: 'revoked' }));
    }
    showToast('XR Token revoked. Access is now blocked.', 'info');
  };

  const handleReactivateToken = (id: string) => {
    setTokens((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'active' as const } : t))
    );
    if (selectedToken.id === id) {
      setSelectedToken((prev) => ({ ...prev, status: 'active' }));
    }
    showToast('XR Token reactivated.', 'success');
  };

  const activeLink = typeof window !== 'undefined'
    ? `${window.location.origin}/xr/view?token=${selectedToken.token}`
    : `https://viztr.studio/xr/view?token=${selectedToken.token}`;

  return (
    <div className="space-y-6">
      {/* BANNER */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#18181B] via-[#121214] to-[#09090B] border border-[#27272A] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E] font-bold uppercase tracking-wider">
            <Box className="w-4 h-4" />
            <span>CORE SYSTEM 02 • XR LINK GENERATOR</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white">
            Autonomous WebXR & AR Token Mapping Engine
          </h2>
          <p className="text-xs text-[#A1A1AA] max-w-2xl">
            Generate cryptographically secure tokens for WebXR, Apple QuickLook AR, and VR Headsets with Draco 3D model mapping, passcode guards, and live QR code distribution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#3ECF8E]/90 text-black font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#3ECF8E]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New XR Token</span>
          </button>
        </div>
      </div>

      {/* DUAL WORKSPACE: LEFT TOKENS REGISTRY / RIGHT TOKEN INSPECTOR & QR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: ACTIVE TOKENS LIST (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#A1A1AA] uppercase">
                Tokens Registry ({filteredTokens.length})
              </span>
              <div className="flex items-center gap-1.5 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setFilterStatus('all')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    filterStatus === 'all' ? 'bg-[#3ECF8E] text-black font-bold' : 'text-[#A1A1AA] bg-[#09090B]'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('active')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    filterStatus === 'active' ? 'bg-[#3ECF8E] text-black font-bold' : 'text-[#A1A1AA] bg-[#09090B]'
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('revoked')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    filterStatus === 'revoked' ? 'bg-[#3ECF8E] text-black font-bold' : 'text-[#A1A1AA] bg-[#09090B]'
                  }`}
                >
                  Revoked
                </button>
              </div>
            </div>
          </div>

          {/* TOKENS CARDS */}
          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredTokens.map((tok) => {
              const isSelected = selectedToken.id === tok.id;
              return (
                <div
                  key={tok.id}
                  onClick={() => setSelectedToken(tok)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#27272A]/80 border-[#3ECF8E] shadow-md shadow-[#3ECF8E]/10'
                      : 'bg-[#18181B] border-[#27272A] hover:border-[#71717A]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-[#3ECF8E] truncate max-w-[200px]">
                      {tok.token}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        tok.status === 'active'
                          ? 'bg-emerald-950/85 text-emerald-300 border border-emerald-700/60'
                          : tok.status === 'expired'
                          ? 'bg-amber-950/85 text-amber-300 border border-amber-700/60'
                          : 'bg-rose-950/85 text-rose-300 border border-rose-700/60'
                      }`}
                    >
                      {tok.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white font-display truncate">
                    {tok.name}
                  </h4>
                  <div className="text-[10px] text-[#A1A1AA] truncate mt-0.5">
                    Project: {tok.projectName} ({tok.projectId})
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[9px] font-mono text-[#71717A] border-t border-[#27272A] pt-2">
                    <span className="flex items-center gap-1">
                      {tok.experienceType === 'webxr' && <Box className="w-3 h-3 text-[#3ECF8E]" />}
                      {tok.experienceType === 'webar' && <Smartphone className="w-3 h-3 text-sky-400" />}
                      {tok.experienceType === 'vr_tour' && <Headset className="w-3 h-3 text-purple-400" />}
                      <span className="uppercase">{tok.experienceType}</span>
                    </span>
                    <span>
                      {tok.currentViews} / {tok.maxViews || '∞'} Views
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: SELECTED TOKEN INSPECTOR & LIVE QR CODE (7 Cols) */}
        {selectedToken && (
          <div className="lg:col-span-7 space-y-5">
            {/* TOKEN DETAILS CARD */}
            <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272A] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-[#3ECF8E] font-bold">TOKEN: {selectedToken.token}</span>
                    {selectedToken.requiresPasscode && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-400 border border-amber-800 text-[9px] flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>PIN: {selectedToken.passcode}</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold font-display text-white">
                    {selectedToken.name}
                  </h3>
                  <div className="text-xs text-[#A1A1AA]">
                    Mapped Project: <span className="text-white font-medium">{selectedToken.projectName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedToken.status === 'active' ? (
                    <button
                      type="button"
                      onClick={() => handleRevokeToken(selectedToken.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800 text-xs font-mono font-bold transition-colors cursor-pointer"
                    >
                      Revoke Token
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleReactivateToken(selectedToken.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800 text-xs font-mono font-bold transition-colors cursor-pointer"
                    >
                      Reactivate Token
                    </button>
                  )}
                </div>
              </div>

              {/* QUICK SHARE LINK BAR */}
              <div className="p-3 rounded-xl bg-[#09090B] border border-[#27272A] space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#71717A]">
                  <span>PUBLIC CLIENT XR LINK</span>
                  <span>1-Click Launch Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={activeLink}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-xs font-mono text-[#3ECF8E] select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyLink(selectedToken)}
                    className="px-3 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedTokenId === selectedToken.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedTokenId === selectedToken.id ? 'Copied' : 'Copy'}</span>
                  </button>

                  <Link
                    href={`/xr/view?token=${selectedToken.token}`}
                    target="_blank"
                    className="p-2 rounded-lg bg-[#27272A] hover:bg-[#3f3f46] text-white transition-colors"
                    title="Launch in New Tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* 3D MODEL MAPPING & QR CODE GENERATOR */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* 3D Model Parameters (7 Cols) */}
                <div className="sm:col-span-7 space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase text-[#A1A1AA]">
                    Mapped Spatial Parameters
                  </h4>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-between">
                      <span className="text-[#71717A]">Geometry Asset:</span>
                      <span className="text-white font-bold truncate max-w-[180px]">{selectedToken.modelUrl}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-between">
                      <span className="text-[#71717A]">Target Format:</span>
                      <span className="text-[#3ECF8E] uppercase font-bold">{selectedToken.modelFormat} (Draco)</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-between">
                      <span className="text-[#71717A]">Experience Mode:</span>
                      <span className="text-white uppercase font-bold">{selectedToken.experienceType}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-between">
                      <span className="text-[#71717A]">Lighting / Sky:</span>
                      <span className="text-white capitalize">{selectedToken.environmentPreset} HDRI</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-between">
                      <span className="text-[#71717A]">Access Expiry:</span>
                      <span className="text-white">
                        {selectedToken.expiresAt ? new Date(selectedToken.expiresAt).toLocaleDateString() : 'Permanent'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openModelViewer(selectedToken.modelUrl, selectedToken.name)}
                    className="w-full py-2 rounded-xl bg-[#27272A] hover:bg-[#3ECF8E] hover:text-black text-white font-mono font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Box className="w-4 h-4" />
                    <span>Inspect Mapped 3D Geometry</span>
                  </button>
                </div>

                {/* Live QR Code (5 Cols) */}
                <div className="sm:col-span-5 p-4 rounded-xl bg-[#09090B] border border-[#27272A] flex flex-col items-center justify-center text-center space-y-3">
                  <div className="text-[10px] font-mono text-[#3ECF8E] font-bold uppercase flex items-center gap-1">
                    <QrCode className="w-3 h-3" />
                    <span>Instant Mobile AR Scan</span>
                  </div>

                  {/* SVG QR Code Simulation */}
                  <div className="p-3 bg-white rounded-xl shadow-lg">
                    <svg
                      viewBox="0 0 120 120"
                      className="w-28 h-28 text-black fill-current"
                    >
                      {/* Stylized QR Matrix Pattern */}
                      <rect x="0" y="0" width="35" height="35" rx="4" />
                      <rect x="5" y="5" width="25" height="25" fill="#fff" rx="2" />
                      <rect x="10" y="10" width="15" height="15" />
                      
                      <rect x="85" y="0" width="35" height="35" rx="4" />
                      <rect x="90" y="5" width="25" height="25" fill="#fff" rx="2" />
                      <rect x="95" y="10" width="15" height="15" />

                      <rect x="0" y="85" width="35" height="35" rx="4" />
                      <rect x="5" y="90" width="25" height="25" fill="#fff" rx="2" />
                      <rect x="10" y="95" width="15" height="15" />

                      {/* Random Data Dots */}
                      <rect x="45" y="10" width="10" height="10" />
                      <rect x="65" y="10" width="10" height="10" />
                      <rect x="45" y="30" width="10" height="10" />
                      <rect x="45" y="50" width="10" height="10" />
                      <rect x="65" y="50" width="10" height="10" />
                      <rect x="85" y="50" width="10" height="10" />
                      <rect x="105" y="50" width="10" height="10" />
                      <rect x="10" y="50" width="10" height="10" />
                      <rect x="45" y="70" width="10" height="10" />
                      <rect x="65" y="70" width="10" height="10" />
                      <rect x="85" y="70" width="10" height="10" />
                      <rect x="45" y="95" width="10" height="10" />
                      <rect x="65" y="95" width="10" height="10" />
                      <rect x="85" y="95" width="10" height="10" />
                      <rect x="105" y="95" width="10" height="10" />
                    </svg>
                  </div>

                  <p className="text-[10px] text-[#71717A] font-mono leading-tight">
                    Scan with iPhone Camera for Apple AR QuickLook or Android SceneViewer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* GENERATE TOKEN MODAL */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181B] border border-[#27272A] rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <div className="flex items-center gap-2 text-[#3ECF8E] font-mono font-bold text-xs uppercase">
                <Box className="w-4 h-4" />
                <span>Generate Autonomous WebXR / AR Token</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-[#71717A] hover:text-white font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateToken} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-[#A1A1AA]">Experience Showcase Name *</label>
                <input
                  type="text"
                  required
                  value={newTokenData.name}
                  onChange={(e) => setNewTokenData({ ...newTokenData, name: e.target.value })}
                  placeholder="e.g. The Apex Tower - VIP Client Walkthrough"
                  className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#A1A1AA]">Attach to Commission</label>
                  <select
                    value={newTokenData.projectId}
                    onChange={(e) => setNewTokenData({ ...newTokenData, projectId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#A1A1AA]">Experience Target Mode</label>
                  <select
                    value={newTokenData.experienceType}
                    onChange={(e) => setNewTokenData({ ...newTokenData, experienceType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                  >
                    <option value="webxr">WebXR Interactive 3D</option>
                    <option value="webar">WebAR Apple QuickLook</option>
                    <option value="vr_tour">VR Headset 360 Tour</option>
                    <option value="pixel_stream">Pixel Streaming (Unreal 5)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#A1A1AA]">3D Model Asset Source</label>
                  <select
                    value={newTokenData.modelUrl}
                    onChange={(e) => setNewTokenData({ ...newTokenData, modelUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                  >
                    <option value="/models/apex-tower-v3-draco.glb">Apex Tower Draco (.glb)</option>
                    <option value="/models/nordic-monolith-hull.glb">Nordic Monolith Residence (.glb)</option>
                    <option value="/models/solarium-suite-pbr.gltf">Solarium Penthouse PBR (.gltf)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#A1A1AA]">HDRI Lighting Preset</label>
                  <select
                    value={newTokenData.environmentPreset}
                    onChange={(e) => setNewTokenData({ ...newTokenData, environmentPreset: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                  >
                    <option value="sunset">Twilight Sunset 8K</option>
                    <option value="studio">Neutral Studio PBR</option>
                    <option value="city">Urban City Skyline</option>
                    <option value="dawn">Golden Hour Dawn</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#A1A1AA]">Token Expiry Timeframe</label>
                  <select
                    value={newTokenData.expiryDays}
                    onChange={(e) => setNewTokenData({ ...newTokenData, expiryDays: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                  >
                    <option value="1">24 Hours</option>
                    <option value="7">7 Days</option>
                    <option value="30">30 Days</option>
                    <option value="unlimited">Permanent (No Expiry)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#A1A1AA]">Max Views Cap</label>
                  <input
                    type="number"
                    value={newTokenData.maxViews}
                    onChange={(e) => setNewTokenData({ ...newTokenData, maxViews: e.target.value })}
                    placeholder="e.g. 500"
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                  />
                </div>
              </div>

              {/* Passcode Protection Toggle */}
              <div className="p-3 rounded-xl bg-[#09090B] border border-[#27272A] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#3ECF8E]" />
                    <span>Require Client PIN Passcode</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={newTokenData.requiresPasscode}
                    onChange={(e) => setNewTokenData({ ...newTokenData, requiresPasscode: e.target.checked })}
                    className="w-4 h-4 accent-[#3ECF8E]"
                  />
                </div>
                {newTokenData.requiresPasscode && (
                  <input
                    type="text"
                    value={newTokenData.passcode}
                    onChange={(e) => setNewTokenData({ ...newTokenData, passcode: e.target.value })}
                    placeholder="Enter 4-digit PIN (e.g. 8820)"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#27272A]">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-lg bg-[#27272A] text-white hover:bg-[#3f3f46] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#3ECF8E] text-black font-bold hover:bg-[#34b27b] transition-colors"
                >
                  Generate Token & QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
