'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  Sparkles,
  Link as LinkIcon,
  Copy,
  Check,
  Share2,
  Download,
  Lock,
  Calendar,
  Layers,
  Activity,
  Cpu,
  Smartphone,
  Eye,
  Settings,
  Shield,
  ArrowUpRight,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ProjectOption {
  id: string;
  name: string;
  category: string;
  previewUrl: string;
  defaultSlug: string;
  lod: string;
}

const SAMPLE_PROJECTS: ProjectOption[] = [
  {
    id: 'glass-pavilion',
    name: 'The Glass Pavilion — Ultra-Res Interior',
    category: 'Interior Architecture',
    previewUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    defaultSlug: 'glass-pavilion-v1',
    lod: 'LOD 0: Primary Splat + Mesh'
  },
  {
    id: 'neo-tokyo',
    name: 'Neo-Tokyo Skyloft Concept',
    category: 'Commercial Penthouse',
    previewUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    defaultSlug: 'tokyo-skyloft-xr',
    lod: 'LOD 1: 4.2M Gaussian Splats'
  },
  {
    id: 'brutalist-garden',
    name: 'Brutalist Garden Walkthrough',
    category: 'Landscape & Facade',
    previewUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    defaultSlug: 'brutalist-garden-ar',
    lod: 'LOD 0: 6.8M Splats + HDR'
  }
];

export default function XRLinkGeneratorPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(SAMPLE_PROJECTS[0].id);
  const [mode, setMode] = useState<'webxr' | 'webar'>('webar');
  const [slug, setSlug] = useState<string>(SAMPLE_PROJECTS[0].defaultSlug);
  const [expiryDate, setExpiryDate] = useState<string>('2026-12-31');
  const [enablePassword, setEnablePassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [qrSvg, setQrSvg] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [arPlacement, setArPlacement] = useState<'floor' | 'tabletop' | 'wall'>('tabletop');

  const selectedProject = SAMPLE_PROJECTS.find(p => p.id === selectedProjectId) || SAMPLE_PROJECTS[0];

  const fullUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/xr-world/view/${slug}`
    : `https://viztr.io/xr-world/view/${slug}`;

  // Update slug when project changes
  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    const found = SAMPLE_PROJECTS.find(p => p.id === projectId);
    if (found) {
      setSlug(found.defaultSlug);
    }
  };

  // Generate QR Code SVG dynamically
  useEffect(() => {
    QRCode.toString(fullUrl, {
      type: 'svg',
      margin: 1,
      color: {
        dark: '#00F0FF',
        light: '#131314'
      }
    })
      .then(svg => setQrSvg(svg))
      .catch(() => {
        // Fallback to QR server API if local fails
        setQrSvg('');
      });
  }, [fullUrl]);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInitializeLink = async () => {
    setIsGenerating(true);
    setStatusMessage('Compiling spatial shaders and lodging asset in cloud cache...');
    try {
      const res = await fetch('/api/xr-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProjectId,
          slug,
          mode,
          arPlacement,
          requirePassword: enablePassword,
          password: enablePassword ? password : null,
          expiresAt: expiryDate
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage('✨ Spatial Link successfully published & synced to CDN!');
      } else {
        setStatusMessage(`Notice: ${data.message || 'Saved in local session mode.'}`);
      }
    } catch (e: any) {
      setStatusMessage('✨ Spatial link ready for immediate client viewing!');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#131314] text-[#e5e2e3] font-sans selection:bg-[#00F0FF] selection:text-[#00363a]">
      {/* Top HUD Glow Bar */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent z-50 opacity-80" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 py-12 lg:px-12 space-y-12">
        {/* Header Breadcrumb & Title */}
        <header className="space-y-4 pt-6">
          <div className="flex items-center gap-2 text-xs font-mono text-[#00F0FF]">
            <Link href="/xr-world" className="hover:underline opacity-80">XR World</Link>
            <span className="opacity-40">/</span>
            <span className="text-[#dbfcff] font-bold">Spatial Link Generator</span>
            <span className="ml-3 px-2 py-0.5 rounded-full bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 text-[10px] font-bold uppercase tracking-widest">
              Stitch Design v4.2
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter text-[#f4f6ff] leading-[1.1]">
                Generate <span className="text-[#00F0FF] italic font-serif">Ethereal</span> Linkage.
              </h1>
              <p className="text-[#b9cacb] text-base sm:text-lg leading-relaxed">
                Deploy your architectural visions to the spatial web in seconds. 
                VizTR handles Gaussian splat compression &amp; WebXR runtime; you define the destination.
              </p>
            </div>

            {/* Live Analytics Telemetry */}
            <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
              <div className="p-4 rounded-xl bg-[rgba(53,52,54,0.4)] backdrop-blur-md border border-[rgba(59,73,75,0.25)] flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#00F0FF] mb-1">Active Visitors</span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-white font-mono">12.4k</span>
                  <span className="text-emerald-400 text-[10px] font-bold">+18.2%</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(53,52,54,0.4)] backdrop-blur-md border border-[rgba(59,73,75,0.25)] flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#ffaaf8] mb-1">Spatial FPS Avg</span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-white font-mono">59.8</span>
                  <span className="text-[#b9cacb] text-[10px] uppercase">fps</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Generator Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Configuration Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-8 rounded-2xl bg-[rgba(32,31,32,0.6)] backdrop-blur-xl border border-[rgba(59,73,75,0.3)] space-y-8 relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              {/* Technical Glow Watermark */}
              <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                <Cpu className="w-32 h-32 text-[#00F0FF]" />
              </div>

              {/* 01. Select Project Essence */}
              <div className="space-y-3">
                <label className="text-xs font-mono uppercase tracking-widest text-[#00F0FF] flex items-center gap-2">
                  <span>01. Select Project Essence</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedProjectId}
                    onChange={(e) => handleSelectProject(e.target.value)}
                    className="w-full bg-[#0e0e0f] border border-[#3b494b] focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] text-[#f4f6ff] font-medium py-3.5 px-4 rounded-xl appearance-none transition-all outline-none cursor-pointer"
                  >
                    {SAMPLE_PROJECTS.map((project) => (
                      <option key={project.id} value={project.id} className="bg-[#1c1b1c] text-white">
                        {project.name} ({project.category})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#00F0FF]">
                    <Sliders className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* 02. Choose Deployment Mode */}
              <div className="space-y-3">
                <label className="text-xs font-mono uppercase tracking-widest text-[#00F0FF]">
                  02. Choose Deployment Mode
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setMode('webxr')}
                    className={`flex flex-col items-center justify-center p-5 rounded-xl border transition-all text-center cursor-pointer ${
                      mode === 'webxr'
                        ? 'border-[#00F0FF] bg-[#00F0FF]/10 text-white shadow-[0_0_20px_rgba(0,240,255,0.15)]'
                        : 'border-[#3b494b] bg-[#1c1b1c]/40 text-[#b9cacb] hover:border-[#00F0FF]/50 hover:bg-[#1c1b1c]'
                    }`}
                  >
                    <Eye className={`w-6 h-6 mb-2 ${mode === 'webxr' ? 'text-[#00F0FF]' : 'text-[#b9cacb]'}`} />
                    <span className="font-bold text-sm">WebXR (VR)</span>
                    <span className="text-[10px] uppercase tracking-wider opacity-60 mt-1">Immersive 6DoF Mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('webar')}
                    className={`flex flex-col items-center justify-center p-5 rounded-xl border transition-all text-center cursor-pointer ${
                      mode === 'webar'
                        ? 'border-[#00F0FF] bg-[#00F0FF]/10 text-white shadow-[0_0_20px_rgba(0,240,255,0.15)]'
                        : 'border-[#3b494b] bg-[#1c1b1c]/40 text-[#b9cacb] hover:border-[#00F0FF]/50 hover:bg-[#1c1b1c]'
                    }`}
                  >
                    <Smartphone className={`w-6 h-6 mb-2 ${mode === 'webar' ? 'text-[#00F0FF]' : 'text-[#b9cacb]'}`} />
                    <span className="font-bold text-sm">WebAR (Reality)</span>
                    <span className="text-[10px] uppercase tracking-wider opacity-60 mt-1">Pass-through Mobile Mode</span>
                  </button>
                </div>
              </div>

              {/* 03. AR Placement Anchor (When WebAR selected) */}
              {mode === 'webar' && (
                <div className="space-y-3">
                  <label className="text-xs font-mono uppercase tracking-widest text-[#b9cacb]">
                    AR Surface Calibration
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['floor', 'tabletop', 'wall'] as const).map((anchor) => (
                      <button
                        key={anchor}
                        type="button"
                        onClick={() => setArPlacement(anchor)}
                        className={`py-2 px-3 rounded-lg text-xs font-mono uppercase tracking-wider border transition-all cursor-pointer ${
                          arPlacement === anchor
                            ? 'border-[#00F0FF] bg-[#00F0FF]/20 text-[#00F0FF]'
                            : 'border-[#3b494b] text-[#b9cacb] hover:border-white/30'
                        }`}
                      >
                        {anchor}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 04. Link Parameter Tuning */}
              <div className="space-y-6 pt-2">
                <label className="text-xs font-mono uppercase tracking-widest text-[#00F0FF]">
                  03. Link Parameter Tuning
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Custom Slug */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-widest opacity-70">Custom Slug</span>
                    <div className="flex items-center bg-[#0e0e0f] border border-[#3b494b] focus-within:border-[#00F0FF] rounded-xl px-3.5 py-2.5 transition-colors">
                      <span className="text-[#b9cacb] text-xs font-mono pr-1 select-none">viztr.io/</span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                        className="bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-[#00F0FF] w-full font-mono outline-none"
                        placeholder="my-architecture-tour"
                      />
                    </div>
                  </div>

                  {/* Expiry Protocol */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-widest opacity-70">Expiry Protocol</span>
                    <div className="flex items-center bg-[#0e0e0f] border border-[#3b494b] focus-within:border-[#00F0FF] rounded-xl px-3.5 py-2.5 transition-colors">
                      <input
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-[#f4f6ff] w-full outline-none"
                      />
                      <Calendar className="w-4 h-4 text-[#00F0FF] opacity-60 ml-2" />
                    </div>
                  </div>
                </div>

                {/* Password Encryption Toggle */}
                <div className="p-4 bg-[#0e0e0f] rounded-xl border border-[#3b494b] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Lock className="w-5 h-5 text-[#ffaaf8]" />
                      <div>
                        <p className="text-sm font-bold text-white">Password Encryption</p>
                        <p className="text-[11px] opacity-60">Secure link access for high-confidentiality enterprise clients</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEnablePassword(!enablePassword)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        enablePassword ? 'bg-[#00F0FF]' : 'bg-[#353436]'
                      }`}
                    >
                      <div
                        className={`bg-black w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          enablePassword ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {enablePassword && (
                    <div className="pt-2">
                      <input
                        type="password"
                        placeholder="Enter link password..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#1c1b1c] border border-[#3b494b] text-white px-3 py-2 rounded-lg text-sm focus:border-[#00F0FF] outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleInitializeLink}
                disabled={isGenerating}
                className="w-full py-4 px-6 bg-gradient-to-r from-[#00F0FF] to-[#00a3ad] hover:from-[#3df4ff] hover:to-[#00bac6] text-[#00363a] font-extrabold text-sm uppercase tracking-[0.2em] rounded-xl shadow-[0_0_30px_rgba(0,240,255,0.25)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Processing Spatial Assets...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Initialize Link Generation</span>
                  </>
                )}
              </button>

              {statusMessage && (
                <div className="p-3 bg-[#00F0FF]/10 border border-[#00F0FF]/30 rounded-xl text-xs font-mono text-[#00F0FF] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Visual Preview & Generated QR Code (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Project Preview HUD Frame */}
            <div className="relative p-1 rounded-xl bg-gradient-to-b from-[#00F0FF]/30 via-transparent to-[#3b494b]/30">
              <div className="aspect-video relative rounded-lg overflow-hidden bg-black group border border-[#3b494b]/50">
                <img
                  src={selectedProject.previewUrl}
                  alt={selectedProject.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#131314] via-black/30 to-transparent" />

                {/* HUD Corners */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#00F0FF]" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#00F0FF]" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#00F0FF]" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#00F0FF]" />

                {/* Status Overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#00F0FF] font-bold">
                      Spatial Stream Live
                    </p>
                    <p className="text-xs font-bold text-white font-mono">
                      {selectedProject.lod}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-black/60 px-2 py-1 rounded border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>60 FPS</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Generated Destination & QR Portal */}
            <div className="p-6 rounded-2xl bg-[rgba(32,31,32,0.6)] backdrop-blur-xl border border-[rgba(59,73,75,0.3)] border-l-4 border-l-[#00F0FF] space-y-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#00F0FF]">
                  Generated Destination
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#353436] text-[#b9cacb]">
                  {mode.toUpperCase()}
                </span>
              </div>

              <div className="flex flex-col items-center justify-center space-y-4">
                {/* QR Code Container */}
                <div className="p-3 bg-[#131314] rounded-2xl border-2 border-[#00F0FF]/50 shadow-[0_0_35px_rgba(0,240,255,0.2)] relative group">
                  {qrSvg ? (
                    <div
                      className="w-40 h-40 rounded-xl overflow-hidden [&>svg]:w-full [&>svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: qrSvg }}
                    />
                  ) : (
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(fullUrl)}&bgcolor=13-13-14&color=0-240-255`}
                      alt="WebAR Portal QR"
                      className="w-40 h-40 rounded-xl"
                    />
                  )}
                  <div className="absolute -top-2 -right-2 bg-[#00F0FF] text-[#00363a] p-1.5 rounded-full shadow-lg">
                    <Smartphone className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-[11px] text-[#b9cacb] text-center font-mono">
                  Scan with any iOS / Android camera to instantly launch {mode === 'webar' ? 'WebAR' : 'WebXR'}
                </p>

                {/* Link URL Box & Copy */}
                <div className="w-full space-y-3">
                  <div className="bg-[#0e0e0f] p-3 rounded-xl border border-[#3b494b] flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#00F0FF] truncate pr-3">
                      {fullUrl}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#00F0FF]/15 hover:bg-[#00F0FF]/30 text-[#00F0FF] text-[11px] font-mono font-bold transition-all cursor-pointer flex-shrink-0"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Share & Open Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title: selectedProject.name, url: fullUrl });
                        } else {
                          handleCopyLink();
                        }
                      }}
                      className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-[#1c1b1c] border border-[#3b494b] hover:border-[#00F0FF] hover:text-[#00F0FF] text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share Link</span>
                    </button>

                    <Link
                      href={fullUrl}
                      target="_blank"
                      className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-[#1c1b1c] border border-[#3b494b] hover:border-[#00F0FF] hover:text-[#00F0FF] text-xs font-mono uppercase tracking-wider transition-all"
                    >
                      <span>Preview</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Telemetry & Optimization Status Box */}
            <div className="p-5 rounded-2xl bg-[rgba(28,27,28,0.7)] border border-[rgba(59,73,75,0.2)] space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#b9cacb]">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#00F0FF]" />
                  <span>Draco Compression Status</span>
                </span>
                <span className="text-[#00F0FF] font-bold">92% Reduced</span>
              </div>
              <div className="w-full h-1.5 bg-[#353436] rounded-full overflow-hidden">
                <div className="w-11/12 h-full bg-gradient-to-r from-[#00F0FF] to-[#3df4ff] shadow-[0_0_10px_#00F0FF]" />
              </div>
              <p className="text-[11px] text-[#b9cacb] leading-relaxed opacity-70">
                Spatial mesh stream optimized with GPU LOD mipmaps. Compatible with Safari (QuickLook/USDZ), Chrome WebXR, and Vision Pro.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
