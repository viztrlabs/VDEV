'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  RotateCcw,
  Expand,
  Minimize,
  Download,
  ExternalLink,
  Cube,
  Layers,
  Grid,
  Settings,
  HelpCircle,
  Info,
  Eye,
  EyeOff,
  Maximize,
  Minimize2,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

// Heavy Three.js/WebGL viewer - SSR disabled
const ModelViewer = dynamic(
  () => import('@/components/viewers/ModelViewer').then((mod) => ({ default: mod.ModelViewer })),
  { ssr: false, loading: () => <ViewerSkeleton /> }
);

function ViewerSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[var(--bg-secondary)]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[var(--text-muted)]">Loading 3D Viewer...</p>
        <p className="text-xs text-[var(--text-muted)]/50 mt-1">Initializing Three.js engine</p>
      </div>
    </div>
  );
}

export default function ModelViewerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openModelViewer, closeModelViewer } = useAppStore();
  
  const fileUrl = searchParams.get('file');
  const fileName = searchParams.get('name') || '3D Model';
  const projectId = searchParams.get('projectId');

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [viewerMode, setViewerMode] = useState<'orbit' | 'fly' | 'first-person'>('orbit');
  const [environment, setEnvironment] = useState<'studio' | 'outdoor' | 'indoor' | 'none'>('studio');
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!fileUrl) {
      setLoadError('No file URL provided');
      return;
    }
    const timer = setTimeout(() => {
      if (!modelLoaded) {
        setLoadError('Model taking too long to load. The file may be corrupted or unsupported.');
      }
    }, 30000);
    return () => clearTimeout(timer);
  }, [fileUrl, modelLoaded]);

  useEffect(() => {
    if (isFullscreen && viewerRef.current) {
      viewerRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  }, [isFullscreen]);

  const handleModelLoad = () => {
    setModelLoaded(true);
    setLoadError(null);
  };

  const handleModelError = (error: Error) => {
    setLoadError(error.message || 'Failed to load model');
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (isFullscreen) setIsFullscreen(false);
      else router.back();
    }
    if (e.key === 'f') setIsFullscreen(!isFullscreen);
    if (e.key === 'h') setShowControls(!showControls);
    if (e.key === 'i') setShowInfo(!showInfo);
    if (e.key === 'g') setShowGrid(!showGrid);
    if (e.key === 'a') setShowAxes(!showAxes);
    if (e.key === '1') setViewerMode('orbit');
    if (e.key === '2') setViewerMode('fly');
    if (e.key === '3') setViewerMode('first-person');
    if (['1','2','3','f','h','i','g','a'].includes(e.key)) e.preventDefault();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, router]);

  const handleControlsHover = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  if (!fileUrl) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <Cube className="w-16 h-16 text-[var(--text-muted)]/50 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">No Model Specified</h1>
          <p className="text-[var(--text-muted)] mb-6">Please navigate to this page from a project file list with a valid model URL.</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-black font-bold transition-colors cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative">
      <div
        ref={viewerRef}
        className="w-full h-screen relative"
        onMouseEnter={handleControlsHover}
        onMouseLeave={handleControlsHover}
      >
        {/* MODEL VIEWER */}
        <ModelViewer
          url={fileUrl}
          onLoad={handleModelLoad}
          onError={handleModelError}
          cameraControls={viewerMode}
          environment={environment}
          showGrid={showGrid}
          showAxes={showAxes}
          className="w-full h-full"
        />

        {/* LOADING / ERROR OVERLAY */}
        <AnimatePresence mode="wait">
          {!modelLoaded && !loadError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            >
              <ViewerSkeleton />
            </motion.div>
          )}
          {loadError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              <div className="bg-[var(--bg-card)] border border-red-800/40 rounded-2xl p-8 max-w-md mx-4 text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-red-300 mb-2">Failed to Load Model</h2>
                <p className="text-[var(--text-muted)] mb-6">{loadError}</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => { setModelLoaded(false); setLoadError(null); }}
                    className="px-4 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-black font-bold transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retry
                  </button>
                  <button
                    onClick={() => router.back()}
                    className="px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border)] text-[var(--text-primary)] font-bold transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TOP BAR */}
        <AnimatePresence mode="wait">
          {showControls && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="fixed top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-none"
            >
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4 bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border)] rounded-xl px-4 py-2 pointer-events-auto">
                  <Cube className="w-5 h-5 text-[var(--primary)]" />
                  <span className="font-medium truncate max-w-xs">{fileName}</span>
                  {projectId && (
                    <span className="px-2 py-0.5 rounded bg-[var(--bg-tertiary)] text-[10px] font-mono text-[var(--text-muted)]">
                      {projectId}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 pointer-events-auto">
                  <button
                    onClick={() => router.back()}
                    className="p-2 rounded-lg bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                    title="Close viewer (Esc)"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOTTOM CONTROLS */}
        <AnimatePresence mode="wait">
          {showControls && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="fixed bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"
            >
              <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 pointer-events-auto">
                {/* PRIMARY CONTROLS */}
                <div className="flex items-center gap-2 bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border)] rounded-xl px-4 py-3">
                  {/* VIEWER MODE */}
                  <div className="flex items-center gap-2 border-r border-[var(--border)] pr-4 mr-4">
                    <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Mode</span>
                    <div className="flex gap-1 bg-[var(--bg-tertiary)] rounded-lg p-1">
                      {(['orbit', 'fly', 'first-person'] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setViewerMode(mode)}
                          className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
                            viewerMode === mode
                              ? 'bg-[var(--primary)] text-black font-bold'
                              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                          }`}
                          title={`${mode} (${mode === 'orbit' ? '1' : mode === 'fly' ? '2' : '3'})`}
                        >
                          {mode === 'orbit' && <Cube className="w-4 h-4" />}
                          {mode === 'fly' && <Layers className="w-4 h-4" />}
                          {mode === 'first-person' && <Eye className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ENVIRONMENT */}
                  <div className="flex items-center gap-2 border-r border-[var(--border)] pr-4 mr-4">
                    <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Environment</span>
                    <select
                      value={environment}
                      onChange={(e) => setEnvironment(e.target.value as any)}
                      className="px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-mono focus:outline-none focus:border-[var(--primary)] cursor-pointer"
                    >
                      <option value="studio">Studio</option>
                      <option value="outdoor">Outdoor</option>
                      <option value="indoor">Indoor</option>
                      <option value="none">None</option>
                    </select>
                  </div>

                  {/* TOGGLES */}
                  <div className="flex items-center gap-2 border-r border-[var(--border)] pr-4 mr-4">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showGrid}
                        onChange={(e) => setShowGrid(e.target.checked)}
                        className="w-4 h-4 rounded border-[var(--border)] bg-[var(--bg-tertiary)] text-[var(--primary)] focus:ring-[var(--primary)]"
                      />
                      <span className="text-xs text-[var(--text-muted)]">Grid</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={showAxes}
                        onChange={(e) => setShowAxes(e.target.checked)}
                        className="w-4 h-4 rounded border-[var(--border)] bg-[var(--bg-tertiary)] text-[var(--primary)] focus:ring-[var(--primary)]"
                      />
                      <span className="text-xs text-[var(--text-muted)]">Axes</span>
                    </label>
                  </div>

                  {/* FULLSCREEN */}
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    title={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
                  >
                    {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  </button>
                </div>

                {/* KEYBOARD SHORTCUTS HINT */}
                <div className="flex items-center gap-4 text-[10px] font-mono text-[var(--text-muted)]/60 bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border)] rounded-xl px-4 py-2">
                  <kbd className="px-2 py-0.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border)]">Esc</kbd> Close
                  <kbd className="px-2 py-0.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border)]">F</kbd> Fullscreen
                  <kbd className="px-2 py-0.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border)]">H</kbd> Hide UI
                  <kbd className="px-2 py-0.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border)]">I</kbd> Info
                  <kbd className="px-2 py-0.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border)]">G</kbd> Grid
                  <kbd className="px-2 py-0.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border)]">1/2/3</kbd> Modes
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* INFO PANEL */}
        <AnimatePresence mode="wait">
          {showInfo && (
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              className="fixed top-20 right-4 z-20 w-80 max-h-[60vh] overflow-auto bg-[var(--bg-card)]/95 backdrop-blur-md border border-[var(--border)] rounded-2xl p-4 pointer-events-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Info className="w-5 h-5 text-[var(--primary)]" />
                  Model Information
                </h3>
                <button
                  onClick={() => setShowInfo(false)}
                  className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <dl className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <dt className="text-[var(--text-muted)] font-mono text-[10px] uppercase">Name</dt>
                  <dd className="text-[var(--text-primary)] font-medium truncate col-span-2">{fileName}</dd>
                  <dt className="text-[var(--text-muted)] font-mono text-[10px] uppercase">Project</dt>
                  <dd className="text-[var(--text-secondary)] col-span-2">{projectId || 'N/A'}</dd>
                  <dt className="text-[var(--text-muted)] font-mono text-[10px] uppercase">URL</dt>
                  <dd className="text-[var(--text-secondary)] font-mono text-[10px] truncate col-span-2">{fileUrl}</dd>
                  <dt className="text-[var(--text-muted)] font-mono text-[10px] uppercase">Status</dt>
                  <dd className="text-[var(--text-secondary)]">
                    {modelLoaded ? 'Loaded' : loadError ? 'Error' : 'Loading...'}
                  </dd>
                  <dt className="text-[var(--text-muted)] font-mono text-[10px] uppercase">Viewer Mode</dt>
                  <dd className="text-[var(--text-secondary)] capitalize">{viewerMode}</dd>
                  <dt className="text-[var(--text-muted)] font-mono text-[10px] uppercase">Environment</dt>
                  <dd className="text-[var(--text-secondary)] capitalize">{environment}</dd>
                </div>
              </dl>
              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <h4 className="font-medium text-[var(--text-primary)] mb-2">Mouse Controls</h4>
                <ul className="space-y-1 text-xs text-[var(--text-muted)]">
                  <li>Left Click + Drag: Orbit / Rotate</li>
                  <li>Right Click + Drag: Pan</li>
                  <li>Scroll: Zoom</li>
                  <li>Shift + Left Click: Rotate Light</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FULLSCREEN INDICATOR */}
        {isFullscreen && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-30 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-mono animate-in fade-in duration-200">
            Fullscreen Mode — Press <kbd className="px-1.5 py-0.5 bg-white/20 rounded">Esc</kbd> or <kbd className="px-1.5 py-0.5 bg-white/20 rounded">F</kbd> to exit
          </div>
        )}
      </div>
    </div>
  );
}