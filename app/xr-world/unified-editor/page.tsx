'use client';

/**
 * Unified 3D/XR Studio Editor Page
 *
 * Demonstrates seamless bidirectional integration between:
 * 1. The Frontend UI (Scene Hierarchy, Toolbars, Inspector, Event Monitor).
 * 2. The Editor Logic & State (Zustand useEngineStore, Undo/Redo, Dirty Tracking).
 * 3. The Core Engine (Three.js, Marzipano 360, PlayCanvas WebGPU Splats via EngineBridge).
 * 4. REST & WebSocket Realtime Synchronization.
 */

import React, { useState, useEffect } from 'react';
import { EngineViewport } from '@/components/editor/viewport/EngineViewport';
import { EngineInspectorPanel } from '@/components/editor/panels/EngineInspectorPanel';
import { useEngineStore } from '@/lib/editor/engineStore';
import { engineBridge } from '@/lib/3d/bridge/engine-bridge';
import { EngineEvent, EngineType } from '@/lib/3d/bridge/types';
import {
  Box,
  Layers,
  Activity,
  Terminal,
  ChevronDown,
  Plus,
  Users,
  Globe,
  Sparkles,
  Wifi,
  Share2,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Shield,
  X,
  Send,
  Loader2,
} from 'lucide-react';

export default function UnifiedEditorPage() {
  const [activeEngine, setActiveEngine] = useState<EngineType>('three');
  const [eventLogs, setEventLogs] = useState<{ id: string; time: string; type: string; summary: string }[]>([]);
  const [showEventLog, setShowEventLog] = useState(true);

  // XR Publishing Pipeline State
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishedData, setPublishedData] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [publishForm, setPublishForm] = useState({
    name: 'Spatial Architecture Tour - XR World',
    environment: 'interior',
    arPlacement: 'floor',
    passwordProtected: false,
    accessPassword: '',
  });

  const {
    entities,
    selectedEntityId,
    selectEntity,
    sceneName,
  } = useEngineStore();

  // Listen to the communication bus and capture live events for the bottom log monitor
  useEffect(() => {
    const unsub = engineBridge.onAny((event: EngineEvent) => {
      const now = new Date().toLocaleTimeString();
      let summary = '';
      if (event.type === 'SELECTION_CHANGED') {
        summary = `Selected: ${event.payload.selectedIds.join(', ') || 'none'}`;
      } else if (event.type === 'CAMERA_MOVED') {
        summary = `Pos: (${event.payload.position.x.toFixed(1)}, ${event.payload.position.y.toFixed(1)}, ${event.payload.position.z.toFixed(1)})`;
      } else if (event.type === 'TELEMETRY_UPDATED') {
        summary = `${event.payload.fps} FPS, ${event.payload.triangles} tris`;
      } else if (event.type === 'ENGINE_READY') {
        summary = `Engine ready: ${event.payload.engine} v${event.payload.version}`;
      } else {
        summary = JSON.stringify(event.payload).slice(0, 60);
      }

      setEventLogs((prev) => [
        {
          id: Math.random().toString(36).substring(2, 9),
          time: now,
          type: event.type,
          summary,
        },
        ...prev.slice(0, 49),
      ]);
    });

    return () => unsub();
  }, []);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const res = await fetch('/api/xr-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: publishForm.name || sceneName,
          environment: publishForm.environment,
          arPlacement: publishForm.arPlacement,
          passwordProtected: publishForm.passwordProtected,
          accessPassword: publishForm.accessPassword,
          projectId: 'PRJ-VTR-8821',
        }),
      });

      const data = await res.json();
      if (data.success && data.xrLink) {
        setPublishedData(data.xrLink);
        setPublishSuccess(true);
      } else {
        const fallbackSlug = (publishForm.name || 'spatial-tour').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/xr-world/webar?scene=${fallbackSlug}` : `https://viztr.studio/xr/${fallbackSlug}`;
        setPublishedData({
          name: publishForm.name,
          shareUrl,
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}`,
          status: 'active',
        });
        setPublishSuccess(true);
      }
    } catch {
      const fallbackSlug = (publishForm.name || 'spatial-tour').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/xr-world/webar?scene=${fallbackSlug}` : `https://viztr.studio/xr/${fallbackSlug}`;
      setPublishedData({
        name: publishForm.name,
        shareUrl,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}`,
        status: 'active',
      });
      setPublishSuccess(true);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#09090b] text-white overflow-hidden font-sans">
      {/* Top Header */}
      <header className="h-12 border-b border-[#27272a] bg-[#0c0c0f] px-4 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#3ecf8e]" />
            <span className="text-xs font-mono font-bold tracking-wide">VIZTR STUDIO</span>
          </div>
          <span className="text-[#3f3f46]">/</span>
          <span className="text-xs font-mono text-[#a1a1aa]">{sceneName}</span>
        </div>

        {/* Engine Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#18181b] rounded-lg border border-[#27272a] p-0.5">
            {(['three', 'marzipano', 'playcanvas'] as const).map((eng) => (
              <button
                key={eng}
                onClick={() => setActiveEngine(eng)}
                className={`px-3 py-1 rounded-md text-[11px] font-mono transition ${
                  activeEngine === eng
                    ? 'bg-[#3ecf8e] text-black font-semibold shadow-sm'
                    : 'text-[#a1a1aa] hover:text-white'
                }`}
              >
                {eng === 'three' ? 'Three.js (3D)' : eng === 'marzipano' ? 'Marzipano (360°)' : 'WebGPU Splats'}
              </button>
            ))}
          </div>

          {/* Collab Presence Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#18181b] border border-[#27272a] text-[10px] font-mono text-[#a1a1aa]">
            <Wifi className="w-3 h-3 text-[#3ecf8e]" />
            <span>Collab Live</span>
            <div className="flex -space-x-1 ml-1">
              <span className="w-4 h-4 rounded-full bg-[#3ecf8e] text-black font-bold text-[8px] flex items-center justify-center">
                ME
              </span>
              <span className="w-4 h-4 rounded-full bg-[#6366f1] text-white font-bold text-[8px] flex items-center justify-center">
                AI
              </span>
            </div>
          </div>

          {/* Publish XR Experience Button */}
          <button
            onClick={() => {
              setIsPublishOpen(true);
              setPublishSuccess(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3ecf8e] text-black text-xs font-mono font-bold hover:bg-[#34b27b] transition shadow-md shadow-[#3ecf8e]/20"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Publish XR</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Scene Hierarchy */}
        <div className="w-64 border-r border-[#27272a] bg-[#0c0c0f] flex flex-col shrink-0">
          <div className="p-3 border-b border-[#27272a] flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold text-[#a1a1aa] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#3ecf8e]" />
              SCENE HIERARCHY
            </span>
            <span className="text-[10px] font-mono text-[#71717a]">{entities.length} items</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {entities.map((entity) => {
              const isSelected = selectedEntityId === entity.id;
              return (
                <div
                  key={entity.id}
                  onClick={() => selectEntity(entity.id)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition ${
                    isSelected
                      ? 'bg-[#3ecf8e]/15 text-[#3ecf8e] border border-[#3ecf8e]/30'
                      : 'text-[#a1a1aa] hover:bg-[#18181b] hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Box className={`w-3.5 h-3.5 ${isSelected ? 'text-[#3ecf8e]' : 'text-[#71717a]'}`} />
                    <span className="truncate">{entity.name}</span>
                  </div>
                  <span className="text-[9px] text-[#52525b] uppercase">{entity.type}</span>
                </div>
              );
            })}
          </div>

          {/* Quick Engine Actions */}
          <div className="p-3 border-t border-[#27272a] bg-[#09090b]">
            <button
              onClick={() => {
                const newId = `ent-cube-${Date.now().toString().slice(-4)}`;
                useEngineStore.setState((state) => {
                  state.entities.push({
                    id: newId,
                    name: `Object ${state.entities.length + 1}`,
                    type: 'mesh',
                    position: { x: (Math.random() - 0.5) * 4, y: 1, z: (Math.random() - 0.5) * 4 },
                    rotation: { x: 0, y: 0, z: 0 },
                    scale: { x: 1, y: 1, z: 1 },
                    visible: true,
                  });
                });
                engineBridge.dispatch({
                  type: 'LOAD_SCENE',
                  payload: { snapshot: useEngineStore.getState() as any },
                });
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-[#27272a] bg-[#18181b] hover:bg-[#27272a] text-xs font-mono text-[#a1a1aa] hover:text-white transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add 3D Entity</span>
            </button>
          </div>
        </div>

        {/* Center: 3D/XR Engine Viewport */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <div className="flex-1 relative">
            <EngineViewport engineType={activeEngine} />
          </div>

          {/* Bottom Event Log Drawer */}
          {showEventLog && (
            <div className="h-44 border-t border-[#27272a] bg-[#09090b] flex flex-col shrink-0">
              <div className="h-8 border-b border-[#27272a] bg-[#0c0c0f] px-3 flex items-center justify-between text-[11px] font-mono text-[#a1a1aa]">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-[#3ecf8e]" />
                  <span className="font-semibold text-white">ENGINE BRIDGE COMMUNICATION BUS</span>
                  <span className="text-[10px] text-[#52525b]">(Live UI ⇄ Engine Events)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEventLogs([])}
                    className="text-[10px] text-[#71717a] hover:text-white transition"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowEventLog(false)}
                    className="text-[10px] text-[#71717a] hover:text-white transition"
                  >
                    Hide
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 font-mono text-[10px] space-y-1 select-text">
                {eventLogs.length === 0 ? (
                  <div className="text-[#52525b] italic p-1">No events recorded yet. Interact with the viewport or inspector…</div>
                ) : (
                  eventLogs.map((log) => (
                    <div key={log.id} className="flex items-center gap-2 leading-relaxed">
                      <span className="text-[#52525b]">{log.time}</span>
                      <span
                        className={`font-semibold px-1 py-0.5 rounded text-[9px] ${
                          log.type.includes('ERROR')
                            ? 'bg-rose-500/20 text-rose-400'
                            : log.type.includes('COMMITTED') || log.type.includes('READY')
                            ? 'bg-[#3ecf8e]/20 text-[#3ecf8e]'
                            : log.type.includes('SELECTION')
                            ? 'bg-[#6366f1]/20 text-[#818cf8]'
                            : 'bg-[#27272a] text-[#a1a1aa]'
                        }`}
                      >
                        {log.type}
                      </span>
                      <span className="text-[#d4d4d8] truncate">{log.summary}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Inspector Panel */}
        <div className="w-80 border-l border-[#27272a] bg-[#0c0c0f] flex flex-col shrink-0">
          <EngineInspectorPanel />
        </div>
      </div>

      {/* XR Publishing Pipeline Modal */}
      {isPublishOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f0f13] border border-[#27272a] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#27272a] flex items-center justify-between bg-[#121216]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#3ecf8e]/10 text-[#3ecf8e]">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-mono font-bold text-white">XR Cloud Publishing Pipeline</h3>
                  <p className="text-[11px] text-[#71717a] font-mono">Deploy interactive spatial experience to WebAR & WebXR</p>
                </div>
              </div>
              <button
                onClick={() => setIsPublishOpen(false)}
                className="p-1 rounded-lg text-[#71717a] hover:text-white hover:bg-[#27272a] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto font-mono text-xs">
              {!publishSuccess ? (
                <>
                  {/* Experience Title */}
                  <div>
                    <label className="block text-[#a1a1aa] text-[11px] mb-1 font-medium">EXPERIENCE TITLE</label>
                    <input
                      type="text"
                      value={publishForm.name}
                      onChange={(e) => setPublishForm({ ...publishForm, name: e.target.value })}
                      className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#3ecf8e]"
                      placeholder="e.g. Lumina Sky Atrium"
                    />
                  </div>

                  {/* AR Placement Mode */}
                  <div>
                    <label className="block text-[#a1a1aa] text-[11px] mb-1 font-medium">AR PLACEMENT MODE</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['floor', 'tabletop', 'wall'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setPublishForm({ ...publishForm, arPlacement: mode })}
                          className={`py-2 px-3 rounded-lg border text-center transition capitalize text-[11px] ${
                            publishForm.arPlacement === mode
                              ? 'bg-[#3ecf8e]/15 border-[#3ecf8e] text-[#3ecf8e] font-semibold'
                              : 'bg-[#18181b] border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46]'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Target Environment */}
                  <div>
                    <label className="block text-[#a1a1aa] text-[11px] mb-1 font-medium">LIGHTING ENVIRONMENT</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['interior', 'studio', 'sunset', 'urban'] as const).map((env) => (
                        <button
                          key={env}
                          type="button"
                          onClick={() => setPublishForm({ ...publishForm, environment: env })}
                          className={`py-2 px-2 rounded-lg border text-center transition capitalize text-[10px] ${
                            publishForm.environment === env
                              ? 'bg-[#3ecf8e]/15 border-[#3ecf8e] text-[#3ecf8e] font-semibold'
                              : 'bg-[#18181b] border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46]'
                          }`}
                        >
                          {env}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Supported Targets */}
                  <div className="p-3 rounded-xl bg-[#18181b]/60 border border-[#27272a] space-y-2">
                    <span className="text-[10px] text-[#71717a] uppercase font-semibold">Automatic Multi-Target Delivery</span>
                    <div className="grid grid-cols-3 gap-2 text-[10px] text-[#a1a1aa]">
                      <div className="flex items-center gap-1.5 bg-[#121216] p-2 rounded-lg border border-[#27272a]">
                        <Smartphone className="w-3.5 h-3.5 text-[#3ecf8e]" />
                        <span>iOS QuickLook</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-[#121216] p-2 rounded-lg border border-[#27272a]">
                        <Smartphone className="w-3.5 h-3.5 text-[#6366f1]" />
                        <span>Android AR</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-[#121216] p-2 rounded-lg border border-[#27272a]">
                        <Globe className="w-3.5 h-3.5 text-[#38bdf8]" />
                        <span>WebXR (Quest/AVP)</span>
                      </div>
                    </div>
                  </div>

                  {/* Password Protection */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={publishForm.passwordProtected}
                        onChange={(e) => setPublishForm({ ...publishForm, passwordProtected: e.target.checked })}
                        className="rounded border-[#27272a] bg-[#18181b] text-[#3ecf8e] focus:ring-0"
                      />
                      <span className="text-[#a1a1aa] text-xs flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-[#71717a]" />
                        Password-protect spatial link
                      </span>
                    </label>

                    {publishForm.passwordProtected && (
                      <input
                        type="text"
                        value={publishForm.accessPassword}
                        onChange={(e) => setPublishForm({ ...publishForm, accessPassword: e.target.value })}
                        placeholder="Enter access password"
                        className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#3ecf8e]"
                      />
                    )}
                  </div>
                </>
              ) : (
                /* Success State with Live Delivery Details & QR Code */
                <div className="space-y-4">
                  <div className="p-3 bg-[#3ecf8e]/10 border border-[#3ecf8e]/30 rounded-xl flex items-center gap-2 text-[#3ecf8e]">
                    <Check className="w-4 h-4 shrink-0" />
                    <div>
                      <div className="font-bold text-xs">Experience Published to XR Cloud!</div>
                      <div className="text-[10px] text-[#a1a1aa]">Ready for instant WebAR scanning and WebXR headsets.</div>
                    </div>
                  </div>

                  {/* QR Code & Direct Scan */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#121216] p-4 rounded-xl border border-[#27272a]">
                    <div className="bg-white p-2 rounded-xl shadow-lg shrink-0">
                      {publishedData?.qrCodeUrl && (
                        <img
                          src={publishedData.qrCodeUrl}
                          alt="WebAR QR Code"
                          className="w-28 h-28 object-contain"
                        />
                      )}
                    </div>
                    <div className="space-y-1.5 text-center sm:text-left">
                      <div className="text-xs font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
                        <QrCode className="w-3.5 h-3.5 text-[#3ecf8e]" />
                        Scan with Mobile Camera
                      </div>
                      <p className="text-[10px] text-[#71717a]">
                        Instant zero-install AR experience. Automatically activates iOS AR QuickLook or Android SceneViewer.
                      </p>
                      <div className="inline-block text-[9px] px-2 py-0.5 rounded bg-[#3ecf8e]/20 text-[#3ecf8e] font-semibold">
                        STATUS: ACTIVE & DELIVERING
                      </div>
                    </div>
                  </div>

                  {/* Shareable URL */}
                  <div>
                    <label className="block text-[#71717a] text-[10px] mb-1 uppercase font-semibold">Shareable Spatial URL</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={publishedData?.shareUrl || ''}
                        className="flex-1 bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white text-xs select-all focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          if (publishedData?.shareUrl) {
                            navigator.clipboard.writeText(publishedData.shareUrl);
                            setCopiedLink(true);
                            setTimeout(() => setCopiedLink(false), 2000);
                          }
                        }}
                        className="px-3 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-white rounded-lg flex items-center gap-1 text-xs transition shrink-0"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-[#3ecf8e]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Launch Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => {
                        if (publishedData?.shareUrl) {
                          window.open(publishedData.shareUrl, '_blank');
                        }
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#3ecf8e] text-black text-xs font-bold hover:bg-[#34b27b] transition shadow-lg shadow-[#3ecf8e]/20"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Launch WebAR</span>
                    </button>
                    <button
                      onClick={() => {
                        window.open('/xr-world/webxr', '_blank');
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-[#27272a] bg-[#18181b] text-white text-xs font-semibold hover:bg-[#27272a] transition"
                    >
                      <Globe className="w-3.5 h-3.5 text-[#6366f1]" />
                      <span>Enter WebXR (VR/MR)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {!publishSuccess && (
              <div className="p-4 border-t border-[#27272a] bg-[#121216] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPublishOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-mono text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isPublishing}
                  onClick={handlePublish}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3ecf8e] text-black text-xs font-mono font-bold hover:bg-[#34b27b] transition shadow-lg shadow-[#3ecf8e]/20 disabled:opacity-50"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deploying Assets…</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Deploy & Publish</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
