'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { X, Smartphone, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { XRScene, HotspotItem, AnnotationItem, TeleportPointItem } from '@/components/xr/xr.types';

const XRViewer = dynamic(() => import('@/components/xr/XRViewer'), { ssr: false });

interface ARViewerProps {
  modelUrl: string;
  modelTitle: string;
  onClose: () => void;
}

export default function ARViewer({ modelUrl, modelTitle, onClose }: ARViewerProps) {
  const [arSupported, setArSupported] = useState(false);
  const [sessionState, setSessionState] = useState<'idle' | 'requesting' | 'active' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'xr' in navigator) {
      const xrNavigator = navigator as Navigator & { xr?: { isSessionSupported?: (mode: string) => Promise<boolean> } };
      xrNavigator.xr?.isSessionSupported?.('immersive-ar').then((res: boolean) => {
        setArSupported(res);
      });
    }
  }, []);

  const xrScenes = useMemo<XRScene[]>(() => [
    { id: 'ar-model', name: modelTitle, type: '3d', url: modelUrl, hotspots: [] as HotspotItem[], annotations: [] as AnnotationItem[], teleportPoints: [] as TeleportPointItem[] },
  ], [modelTitle, modelUrl]);

  const handleStartAR = useCallback(async () => {
    if (!arSupported) {
      setErrorMessage('WebXR AR is not supported on this device/browser. Try on mobile Chrome (Android) or Safari (iOS).');
      setSessionState('error');
      return;
    }
    setSessionState('requesting');
    setErrorMessage(null);
    setShowInstructions(false);
  }, [arSupported]);

  const handleClose = useCallback(() => { onClose(); }, [onClose]);
  const handleRetry = useCallback(() => { setSessionState('idle'); setErrorMessage(null); setShowInstructions(true); }, []);

  const isSecureContext = typeof window !== 'undefined' && window.isSecureContext;

  if (sessionState === 'idle' && showInstructions) {
    return (
      <div
        ref={containerRef}
        id="ar-viewer-modal"
        className="fixed inset-0 z-[999] bg-[#131314] text-white flex flex-col justify-between select-none animate-in fade-in duration-200"
      >
        <div className="px-4 py-3 bg-[#131314] border-b border-[#353436] flex items-center justify-between z-30">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#201f20] border border-[#353436] text-[#dbfcff] text-[10px] font-mono font-bold uppercase tracking-wider">
              <Smartphone className="w-3.5 h-3.5 text-[#54de99]" />
              <span>WEBAR VIEWER</span>
            </div>
            <h2 className="text-xs font-mono font-semibold text-[#e5e2e3] hidden sm:inline">{modelTitle}</h2>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer" title="Close AR Viewer"><X className="w-3.5 h-3.5" /></button>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-xl text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-[#54de99]/10 border border-[#54de99]/30 flex items-center justify-center"><Smartphone className="w-12 h-12 text-[#54de99]" /></div>
            <h3 className="text-2xl font-bold mb-2">Augmented Reality Mode</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">Point your camera at a flat surface to place the 3D model in your space at true scale.</p>

            <div className="mb-6 p-4 bg-[#201f20] border border-[#353436] rounded-xl text-left">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#54de99]" /> Requirements</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2"><span className={`w-4 h-4 rounded border ${isSecureContext ? 'border-[#54de99] text-[#54de99]' : 'border-rose-500 text-rose-500'}`}>{isSecureContext ? '✓' : '✗'}</span><span>HTTPS or localhost ({isSecureContext ? 'OK' : 'Required for camera access'})</span></li>
                <li className="flex items-center gap-2"><span className={`w-4 h-4 rounded border ${arSupported ? 'border-[#54de99] text-[#54de99]' : 'border-rose-500 text-rose-500'}`}>{arSupported ? '✓' : '✗'}</span><span>WebXR AR support ({arSupported ? 'Available' : 'Not supported on this browser'})</span></li>
                <li className="flex items-center gap-2"><span className="w-4 h-4 rounded border border-amber-500 text-amber-500">!</span><span>Camera permission will be requested</span></li>
                <li className="flex items-center gap-2"><span className="w-4 h-4 rounded border border-amber-500 text-amber-500">!</span><span>Best on mobile: Android Chrome or iOS Safari</span></li>
              </ul>
            </div>

            <button onClick={handleStartAR} disabled={!arSupported || !isSecureContext} className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#54de99] hover:bg-[#33d18a] text-black font-extrabold text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_0_24px_rgba(84,222,153,0.4)] hover:shadow-[0_0_36px_rgba(84,222,153,0.65)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"><Smartphone className="w-4 h-4" /><span>Launch AR Session</span></button>

            {!isSecureContext && <p className="mt-4 text-xs text-rose-400">⚠️ Camera access requires HTTPS. Use <code>localhost</code> or deploy to a secure domain.</p>}
            {!arSupported && isSecureContext && <p className="mt-4 text-xs text-amber-400">ℹ️ WebXR AR not detected. Try on a mobile device with Chrome (Android) or Safari (iOS 13+).</p>}
          </div>
        </div>

        <div className="px-4 py-3 bg-[#131314] border-t border-[#353436] text-center"><p className="text-[10px] font-mono text-[#71717A]">Model: {modelUrl}</p></div>
      </div>
    );
  }

  if (sessionState === 'error') {
    return (
      <div ref={containerRef} id="ar-viewer-modal" className="fixed inset-0 z-[999] bg-[#131314] text-white flex flex-col justify-between select-none animate-in fade-in duration-200">
        <div className="px-4 py-3 bg-[#131314] border-b border-[#353436] flex items-center justify-between z-30">
          <div className="flex items-center gap-3"><div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#201f20] border border-[#353436] text-[#dbfcff] text-[10px] font-mono font-bold uppercase tracking-wider"><Smartphone className="w-3.5 h-3.5 text-rose-400" /><span>WEBAR VIEWER</span></div></div>
          <button onClick={handleClose} className="p-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer"><X className="w-3.5 h-3.5" /></button>
        </div>
        <div className="flex-1 flex items-center justify-center p-6"><div className="w-full max-w-md text-center"><div className="w-20 h-20 mx-auto mb-4 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center"><AlertCircle className="w-10 h-10 text-rose-400" /></div><h3 className="text-xl font-bold mb-2 text-rose-300">AR Session Failed</h3><p className="text-gray-400 mb-6">{errorMessage}</p><button onClick={handleRetry} className="px-6 py-2.5 rounded-xl bg-[#54de99] hover:bg-[#33d18a] text-black font-bold text-sm uppercase tracking-wider transition-colors cursor-pointer"><RotateCcw className="w-4 h-4 inline mr-2" /> Try Again</button></div></div>
        <div className="px-4 py-3 bg-[#131314] border-t border-[#353436] text-center"><p className="text-[10px] font-mono text-[#71717A]">Need help? Ensure you're on HTTPS, using a supported browser, and grant camera permission.</p></div>
      </div>
    );
  }

  return (
    <div ref={containerRef} id="ar-viewer-modal" className="fixed inset-0 z-[999] bg-[#131314] text-white flex flex-col select-none animate-in fade-in duration-200">
      <div className="px-4 py-2 bg-[#131314]/95 backdrop-blur-sm border-b border-[#353436] flex items-center justify-between z-30">
        <div className="flex items-center gap-2"><div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#54de99]/20 border border-[#54de99]/50 text-[#54de99] text-[9px] font-mono font-bold uppercase tracking-wider animate-pulse"><span className="w-1.5 h-1.5 rounded-full bg-[#54de99]" /><span>AR ACTIVE</span></div></div>
        <div className="flex items-center gap-2"><button onClick={handleClose} className="p-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer" title="Exit AR"><X className="w-3.5 h-3.5" /></button></div>
      </div>
      <div className="flex-1 relative"><XRViewer projectId="ar-viewer" mode="ar" scenes={xrScenes} initialSceneId="ar-model" className="absolute inset-0" /></div>
      <div className="px-4 py-3 bg-[#131314]/95 backdrop-blur-sm border-t border-[#353436] text-center"><p className="text-[10px] font-mono text-[#71717A]">Point camera at a flat surface • Tap to place model • Drag to rotate • Pinch to scale</p></div>
    </div>
  );
}