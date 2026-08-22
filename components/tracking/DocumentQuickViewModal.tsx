'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCw,
  FileText,
  FileCode,
  HardDrive,
  Calendar,
  User,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Printer,
  Copy,
  ChevronLeft,
  ChevronRight,
  Layers,
  Box,
  Eye,
  Sliders,
  Grid,
  Sparkles,
  Info,
  ExternalLink,
  Sun,
  Moon
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { ProjectDocument } from './ProjectDocumentRepository';

interface DocumentQuickViewModalProps {
  document: ProjectDocument | null;
  projectName: string;
  projectId: string;
  onClose: () => void;
  onDownload: (doc: ProjectDocument) => void;
}

export default function DocumentQuickViewModal({
  document: doc,
  projectName,
  projectId,
  onClose,
  onDownload,
}: DocumentQuickViewModalProps) {
  const { showToast } = useAppStore();
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'preview' | 'inspector' | 'revisions'>('preview');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [blueprintTheme, setBlueprintTheme] = useState<'dark' | 'blueprint' | 'paper'>('blueprint');
  const [cadViewAngle, setCadViewAngle] = useState<'iso' | 'top' | 'front' | 'side'>('iso');
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  const totalPages = doc ? (doc.fileType === 'pdf' ? 4 : 1) : 1;

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 25, 50));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Keyboard shortcut handler (ESC to close, Left/Right for pages)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!doc) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        if (doc.fileType === 'pdf') {
          setCurrentPage((prev) => (prev < 4 ? prev + 1 : prev));
        }
      } else if (e.key === 'ArrowLeft') {
        if (doc.fileType === 'pdf') {
          setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [doc, onClose]);

  if (!doc) return null;

  const handleCopyChecksum = () => {
    if (doc.checksum) {
      navigator.clipboard.writeText(doc.checksum);
      setIsCopied(true);
      showToast('SHA-256 Checksum copied to clipboard', 'info');
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    showToast(`Sending ${doc.fileName} to browser print spooler...`, 'info');
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const toggleFullscreen = () => {
    if (!modalContainerRef.current) return;
    if (!isFullscreen) {
      if (modalContainerRef.current.requestFullscreen) {
        modalContainerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (window.document.exitFullscreen) {
        window.document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Mock sheets for architectural blueprints
  const getSheetTitle = (page: number) => {
    switch (page) {
      case 1:
        return 'Sheet A-101 · South & West Façade Structural Elevations';
      case 2:
        return 'Sheet A-102 · Spandrel Mullion & Dielectric Glazing Section';
      case 3:
        return 'Sheet S-204 · Cantilever Podium Node Coordinate Matrix (1:1)';
      case 4:
        return 'Sheet M-001 · Milestone Signoff & Engineering Verification Seal';
      default:
        return `Sheet 0${page} · General Architectural Drawing`;
    }
  };

  return (
    <div
      id="document-quickview-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={modalContainerRef}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-5xl rounded-2xl bg-[#121215] border border-[#27272A] shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ${
          isFullscreen ? 'h-full max-h-screen rounded-none' : 'max-h-[92vh] h-[850px]'
        }`}
      >
        {/* TOP TOOLBAR */}
        <div className="p-3.5 sm:px-5 sm:py-3.5 border-b border-[#27272A] bg-[#18181B] flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* LEFT: DOCUMENT META & BADGE */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border font-mono font-bold text-xs ${
                doc.fileType === 'pdf'
                  ? 'bg-rose-950/70 border-rose-800 text-rose-400'
                  : doc.fileType === 'cad'
                  ? 'bg-sky-950/70 border-sky-800 text-sky-400'
                  : doc.fileType === 'bim'
                  ? 'bg-violet-950/70 border-violet-800 text-violet-400'
                  : 'bg-emerald-950/70 border-emerald-800 text-emerald-400'
              }`}
            >
              {doc.extension}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold font-display text-white truncate" title={doc.title}>
                  {doc.title}
                </h3>
                <span className="hidden md:inline px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-[#09090B] border border-[#27272A] text-[#3ECF8E]">
                  Quick View
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#71717A] truncate">
                {doc.fileName} · {doc.fileSize} · {doc.version}
              </p>
            </div>
          </div>

          {/* CENTER: TAB TOGGLES */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#09090B] border border-[#27272A] text-xs font-mono">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'bg-[#18181B] text-white font-bold border border-[#3ECF8E]/40 text-[#3ECF8E]'
                  : 'text-[#71717A] hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Canvas</span>
            </button>
            <button
              onClick={() => setActiveTab('inspector')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'inspector'
                  ? 'bg-[#18181B] text-[#3ECF8E] font-bold border border-[#3ECF8E]/40'
                  : 'text-[#71717A] hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Inspector & Hash</span>
            </button>
          </div>

          {/* RIGHT: CONTROLS & CLOSE */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onDownload(doc)}
              className="px-3 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title="Download File"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
              title="Close (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SUB-TOOLBAR FOR PREVIEW MODE */}
        {activeTab === 'preview' && (
          <div className="px-4 py-2 bg-[#09090B] border-b border-[#27272A] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#A1A1AA]">
            {/* VIEWPORT CONTROLS: ZOOM & ROTATE */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-[#18181B] border border-[#27272A] rounded-lg p-0.5">
                <button
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 50}
                  className="p-1 hover:text-white disabled:opacity-30 cursor-pointer"
                  title="Zoom Out (-25%)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-[11px] font-bold text-white min-w-[50px] text-center">
                  {zoomLevel}%
                </span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 200}
                  className="p-1 hover:text-white disabled:opacity-30 cursor-pointer"
                  title="Zoom In (+25%)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleResetZoom}
                className="px-2 py-1 rounded bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[10px] text-zinc-300 hover:text-white cursor-pointer"
                title="Fit to Window (100%)"
              >
                Fit
              </button>

              <button
                onClick={handleRotate}
                className="p-1.5 rounded bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-zinc-300 hover:text-white cursor-pointer"
                title="Rotate 90° Clockwise"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              {doc.fileType === 'pdf' && (
                <div className="hidden sm:flex items-center gap-1 ml-2 pl-2 border-l border-[#27272A]">
                  <span className="text-[10px] text-[#71717A]">Palette:</span>
                  <button
                    onClick={() => setBlueprintTheme('blueprint')}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer ${
                      blueprintTheme === 'blueprint'
                        ? 'bg-cyan-950 text-cyan-400 border border-cyan-700'
                        : 'text-[#71717A] hover:text-white'
                    }`}
                  >
                    Blueprint
                  </button>
                  <button
                    onClick={() => setBlueprintTheme('dark')}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer ${
                      blueprintTheme === 'dark'
                        ? 'bg-zinc-800 text-white border border-zinc-700'
                        : 'text-[#71717A] hover:text-white'
                    }`}
                  >
                    CAD Dark
                  </button>
                  <button
                    onClick={() => setBlueprintTheme('paper')}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer ${
                      blueprintTheme === 'paper'
                        ? 'bg-amber-100 text-black font-bold'
                        : 'text-[#71717A] hover:text-white'
                    }`}
                  >
                    Paper
                  </button>
                </div>
              )}
            </div>

            {/* CAD / SPEC SPECIFIC TOGGLES */}
            {(doc.fileType === 'cad' || doc.fileType === 'bim') && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#71717A]">View:</span>
                {(['iso', 'top', 'front', 'side'] as const).map((angle) => (
                  <button
                    key={angle}
                    onClick={() => setCadViewAngle(angle)}
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono cursor-pointer ${
                      cadViewAngle === angle
                        ? 'bg-[#3ECF8E]/20 text-[#3ECF8E] border border-[#3ECF8E]/40 font-bold'
                        : 'text-[#71717A] hover:text-white'
                    }`}
                  >
                    {angle}
                  </button>
                ))}
              </div>
            )}

            {/* PAGE NAVIGATION FOR MULTI-SHEET PDFS */}
            {doc.fileType === 'pdf' && (
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-[#18181B] border border-[#27272A] rounded-lg p-0.5">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage <= 1}
                    className="p-1 hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Previous Sheet (Left Arrow)"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 text-[11px] font-mono font-bold text-white min-w-[70px] text-center">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages}
                    className="p-1 hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Next Sheet (Right Arrow)"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={handlePrint}
                  className="hidden md:flex p-1.5 rounded bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-zinc-300 hover:text-white cursor-pointer items-center gap-1 text-[10px]"
                  title="Print Drawing Set"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* MAIN BODY VIEW */}
        <div className="flex-1 overflow-y-auto bg-[#09090B] relative flex flex-col p-4">
          {activeTab === 'preview' ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[460px] overflow-auto">
              {/* PDF ARCHITECTURAL BLUEPRINT VIEWER */}
              {doc.fileType === 'pdf' && (
                <div
                  style={{
                    transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.15s ease-out',
                  }}
                  className={`w-full max-w-3xl rounded-xl border p-6 sm:p-8 relative shadow-2xl select-none ${
                    blueprintTheme === 'blueprint'
                      ? 'bg-[#081c2f] border-cyan-800 text-cyan-300'
                      : blueprintTheme === 'dark'
                      ? 'bg-[#121214] border-zinc-700 text-zinc-200'
                      : 'bg-[#faf8f5] border-zinc-400 text-zinc-900'
                  }`}
                >
                  {/* BACKGROUND CAD GRID PATTERN */}
                  <div
                    className="absolute inset-0 rounded-xl opacity-15 pointer-events-none"
                    style={{
                      backgroundImage: `radial-gradient(${
                        blueprintTheme === 'blueprint'
                          ? '#00ffff 1px'
                          : blueprintTheme === 'paper'
                          ? '#000000 1px'
                          : '#ffffff 1px'
                      }, transparent 1px)`,
                      backgroundSize: '24px 24px',
                    }}
                  />

                  {/* DRAWING HEADER & BORDER FRAME */}
                  <div className="border-2 border-dashed border-current/30 p-4 sm:p-6 rounded-lg space-y-6 relative">
                    {/* TOP TITLE STRIP */}
                    <div className="flex items-start justify-between border-b border-current/30 pb-4">
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono uppercase tracking-widest opacity-70">
                          {projectName} · Commission Document
                        </div>
                        <h2 className="text-base sm:text-lg font-bold font-display tracking-tight">
                          {getSheetTitle(currentPage)}
                        </h2>
                        <div className="text-[11px] font-mono opacity-80">
                          Project ID: {projectId} · Scale 1:50 @ A1 Metric · WGS84 Datum
                        </div>
                      </div>

                      {/* ARCHITECTURAL STAMP */}
                      <div className="p-2.5 rounded border border-current/60 text-right space-y-0.5 shrink-0">
                        <div className="text-[9px] font-mono uppercase font-bold tracking-wider text-emerald-400">
                          ✓ APPROVED FOR PRODUCTION
                        </div>
                        <div className="text-[10px] font-mono font-bold">
                          {doc.version}
                        </div>
                        <div className="text-[9px] font-mono opacity-70">
                          {doc.updatedAt}
                        </div>
                      </div>
                    </div>

                    {/* DYNAMIC ARCHITECTURAL VECTOR BLUEPRINT CANVAS */}
                    <div className="py-6 flex flex-col items-center justify-center">
                      <svg
                        viewBox="0 0 600 320"
                        className="w-full h-auto max-h-[300px] stroke-current fill-none stroke-[1.5]"
                      >
                        {/* Grid & Axis Markers */}
                        <line x1="50" y1="20" x2="50" y2="280" strokeDasharray="4 4" opacity="0.4" />
                        <line x1="150" y1="20" x2="150" y2="280" strokeDasharray="4 4" opacity="0.4" />
                        <line x1="250" y1="20" x2="250" y2="280" strokeDasharray="4 4" opacity="0.4" />
                        <line x1="350" y1="20" x2="350" y2="280" strokeDasharray="4 4" opacity="0.4" />
                        <line x1="450" y1="20" x2="450" y2="280" strokeDasharray="4 4" opacity="0.4" />
                        <line x1="550" y1="20" x2="550" y2="280" strokeDasharray="4 4" opacity="0.4" />

                        <circle cx="50" cy="295" r="10" />
                        <text x="50" y="299" fontSize="10" textAnchor="middle" fill="currentColor" stroke="none">A</text>
                        <circle cx="150" cy="295" r="10" />
                        <text x="150" y="299" fontSize="10" textAnchor="middle" fill="currentColor" stroke="none">B</text>
                        <circle cx="250" cy="295" r="10" />
                        <text x="250" y="299" fontSize="10" textAnchor="middle" fill="currentColor" stroke="none">C</text>
                        <circle cx="350" cy="295" r="10" />
                        <text x="350" y="299" fontSize="10" textAnchor="middle" fill="currentColor" stroke="none">D</text>
                        <circle cx="450" cy="295" r="10" />
                        <text x="450" y="299" fontSize="10" textAnchor="middle" fill="currentColor" stroke="none">E</text>
                        <circle cx="550" cy="295" r="10" />
                        <text x="550" y="299" fontSize="10" textAnchor="middle" fill="currentColor" stroke="none">F</text>

                        {/* Architectural Elevation Outline */}
                        {currentPage === 1 && (
                          <g>
                            {/* Tower Massing */}
                            <rect x="80" y="40" width="160" height="230" strokeWidth="2.5" />
                            <rect x="240" y="80" width="140" height="190" strokeWidth="2.5" />
                            <rect x="380" y="130" width="140" height="140" strokeWidth="2.5" />

                            {/* Spandrels & Horizontal Levels */}
                            <line x1="80" y1="70" x2="240" y2="70" opacity="0.6" />
                            <line x1="80" y1="100" x2="380" y2="100" opacity="0.6" />
                            <line x1="80" y1="130" x2="520" y2="130" opacity="0.6" />
                            <line x1="80" y1="160" x2="520" y2="160" opacity="0.6" />
                            <line x1="80" y1="190" x2="520" y2="190" opacity="0.6" />
                            <line x1="80" y1="220" x2="520" y2="220" opacity="0.6" />
                            <line x1="80" y1="250" x2="520" y2="250" opacity="0.6" />

                            {/* Cantilever Truss */}
                            <line x1="80" y1="130" x2="160" y2="40" strokeWidth="1.5" />
                            <line x1="160" y1="130" x2="240" y2="40" strokeWidth="1.5" />
                            <line x1="240" y1="190" x2="310" y2="80" strokeWidth="1.5" />
                            <line x1="310" y1="190" x2="380" y2="80" strokeWidth="1.5" />

                            {/* Elevation Tags */}
                            <text x="30" y="45" fontSize="9" fill="currentColor" stroke="none">+240.00m</text>
                            <text x="30" y="85" fontSize="9" fill="currentColor" stroke="none">+198.50m</text>
                            <text x="30" y="135" fontSize="9" fill="currentColor" stroke="none">+142.00m</text>
                            <text x="30" y="270" fontSize="9" fill="currentColor" stroke="none">±0.000 G.L.</text>
                          </g>
                        )}

                        {currentPage === 2 && (
                          <g>
                            {/* Glazing Section Detail */}
                            <rect x="120" y="30" width="360" height="240" strokeWidth="2" />
                            <line x1="120" y1="60" x2="480" y2="60" strokeWidth="3" />
                            <line x1="120" y1="240" x2="480" y2="240" strokeWidth="3" />

                            {/* Triple Glass Panes */}
                            <line x1="200" y1="60" x2="200" y2="240" strokeWidth="4" />
                            <line x1="220" y1="60" x2="220" y2="240" strokeWidth="3" />
                            <line x1="240" y1="60" x2="240" y2="240" strokeWidth="4" />

                            {/* Argon Cavity hatch lines */}
                            <line x1="200" y1="100" x2="220" y2="90" opacity="0.7" />
                            <line x1="200" y1="140" x2="220" y2="130" opacity="0.7" />
                            <line x1="200" y1="180" x2="220" y2="170" opacity="0.7" />

                            {/* Dimension Callouts */}
                            <line x1="200" y1="20" x2="240" y2="20" strokeWidth="1" />
                            <text x="220" y="15" fontSize="9" textAnchor="middle" fill="currentColor" stroke="none">48mm IGU</text>

                            <text x="300" y="110" fontSize="10" fill="currentColor" stroke="none">Low-E Solar Coating (Surface #2)</text>
                            <text x="300" y="140" fontSize="10" fill="currentColor" stroke="none">90% Argon Gas Cavity</text>
                            <text x="300" y="170" fontSize="10" fill="currentColor" stroke="none">Thermal Break Polyamide Strip</text>
                          </g>
                        )}

                        {currentPage >= 3 && (
                          <g>
                            {/* Structural Matrix & Node Coordinates */}
                            <circle cx="300" cy="150" r="90" strokeWidth="2" strokeDasharray="3 3" />
                            <polygon points="300,70 380,190 220,190" strokeWidth="2.5" />
                            <circle cx="300" cy="70" r="6" fill="currentColor" />
                            <circle cx="380" cy="190" r="6" fill="currentColor" />
                            <circle cx="220" cy="190" r="6" fill="currentColor" />
                            <circle cx="300" cy="150" r="4" fill="currentColor" />

                            <text x="300" y="55" fontSize="10" textAnchor="middle" fill="currentColor" stroke="none">Node #01 (X: 14820.5, Y: 8902.1, Z: 14000.0)</text>
                            <text x="400" y="210" fontSize="10" fill="currentColor" stroke="none">Node #02 (High-Strength Cast Steel)</text>
                            <text x="120" y="210" fontSize="10" fill="currentColor" stroke="none">Node #03 (1:1 Calibrated)</text>
                          </g>
                        )}
                      </svg>
                    </div>

                    {/* BOTTOM TITLE BLOCK / DRAWING METADATA */}
                    <div className="border-t border-current/30 pt-3 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono">
                      <div>
                        <span className="opacity-70">Author: </span>
                        <span className="font-bold">{doc.uploadedBy}</span>
                      </div>
                      <div>
                        <span className="opacity-70">Checksum: </span>
                        <span className="font-bold">{doc.checksum?.substring(0, 18)}...</span>
                      </div>
                      <div>
                        <span className="opacity-70">Sheet: </span>
                        <span className="font-bold">{currentPage} of {totalPages}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CAD & BIM 3D WIREFRAME VIEWPORT */}
              {(doc.fileType === 'cad' || doc.fileType === 'bim') && (
                <div className="w-full max-w-3xl rounded-xl bg-[#09090B] border border-[#27272A] p-6 space-y-4 shadow-2xl">
                  {/* 3D VIEWPORT HEADER */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#27272A] text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#3ECF8E] animate-pulse" />
                      <span className="text-white font-bold">Interactive CAD Wireframe Viewport</span>
                      <span className="text-[#71717A] text-[10px]">({doc.extension} Mesh)</span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-[#71717A]">
                      <span>Mesh: 148,920 Tris</span>
                      <span>·</span>
                      <span>Scale: 1:1 Metric mm</span>
                    </div>
                  </div>

                  {/* SIMULATED 3D WIREFRAME CANVAS */}
                  <div className="relative w-full h-[320px] bg-[#121215] rounded-lg border border-[#27272A] overflow-hidden flex items-center justify-center">
                    {/* Background Grid */}
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: 'linear-gradient(to right, #3ECF8E 1px, transparent 1px), linear-gradient(to bottom, #3ECF8E 1px, transparent 1px)',
                        backgroundSize: '30px 30px',
                      }}
                    />

                    {/* AXIS GIZMO IN CORNER */}
                    <div className="absolute bottom-3 left-3 p-2 rounded bg-black/70 border border-[#27272A] text-[9px] font-mono space-y-0.5">
                      <div className="text-red-400 font-bold">X: +14,820.5 mm</div>
                      <div className="text-emerald-400 font-bold">Y: +8,902.1 mm</div>
                      <div className="text-blue-400 font-bold">Z: +140,000.0 mm</div>
                    </div>

                    {/* ROTATING WIREFRAME GEOMETRY */}
                    <motion.svg
                      animate={{ rotateY: 360 }}
                      transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
                      viewBox="0 0 400 240"
                      className="w-72 h-72 stroke-[#3ECF8E] fill-[#3ECF8E]/5 stroke-[1.2]"
                    >
                      {/* Isometric Prism Box */}
                      <polygon points="200,40 320,100 200,160 80,100" />
                      <polygon points="80,100 200,160 200,220 80,160" />
                      <polygon points="320,100 200,160 200,220 320,160" />

                      {/* Internal Truss Lines */}
                      <line x1="80" y1="100" x2="320" y2="100" strokeDasharray="3 3" opacity="0.6" />
                      <line x1="200" y1="40" x2="200" y2="160" strokeDasharray="3 3" opacity="0.6" />
                      <line x1="80" y1="160" x2="320" y2="160" strokeDasharray="3 3" opacity="0.6" />

                      {/* Node markers */}
                      <circle cx="200" cy="40" r="3" fill="#3ECF8E" />
                      <circle cx="320" cy="100" r="3" fill="#3ECF8E" />
                      <circle cx="200" cy="160" r="3" fill="#3ECF8E" />
                      <circle cx="80" cy="100" r="3" fill="#3ECF8E" />
                      <circle cx="200" cy="220" r="3" fill="#3ECF8E" />
                      <circle cx="80" cy="160" r="3" fill="#3ECF8E" />
                      <circle cx="320" cy="160" r="3" fill="#3ECF8E" />
                    </motion.svg>
                  </div>

                  {/* CAD CONTROLS FOOTER */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#71717A]">
                    <div className="flex items-center gap-2">
                      <Box className="w-3.5 h-3.5 text-[#3ECF8E]" />
                      <span>Coordinate System: UTM WGS84 Zone 33N</span>
                    </div>
                    <div className="text-[#3ECF8E] font-bold">
                      Geometry Verified · 0 Non-Manifold Edges
                    </div>
                  </div>
                </div>
              )}

              {/* TECHNICAL SPEC & JSON VIEWER */}
              {doc.fileType === 'spec' && (
                <div className="w-full max-w-3xl rounded-xl bg-[#09090B] border border-[#27272A] p-5 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-[#27272A] text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-[#3ECF8E]" />
                      <span className="text-white font-bold">{doc.fileName}</span>
                      <span className="text-[10px] text-[#71717A]">(PBR Photometric Spec)</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`{\n  "specVersion": "2.0",\n  "materialIndex": {\n    "albedo_map": "Apex_Glazing_Albedo_8K.exr",\n    "refractive_index_ior": 1.52,\n    "specular_reflectance": 0.082,\n    "roughness_microfacet": 0.015\n  }\n}`);
                        showToast('Schema JSON copied to clipboard', 'info');
                      }}
                      className="px-2.5 py-1 rounded bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[10px] text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3 text-[#3ECF8E]" />
                      <span>Copy JSON</span>
                    </button>
                  </div>

                  {/* SYNTAX HIGHLIGHTED JSON CONTAINER */}
                  <div className="p-4 rounded-lg bg-[#121215] border border-[#27272A] font-mono text-xs overflow-x-auto space-y-1">
                    <div className="text-[#71717A]">{'// VizTR PBR Spectral Optical Profile v2026.1'}</div>
                    <div className="text-zinc-300">&#123;</div>
                    <div className="pl-4 text-emerald-400">
                      &quot;specVersion&quot;: <span className="text-amber-300">&quot;2.0-LUMEN-RAYTRACE&quot;</span>,
                    </div>
                    <div className="pl-4 text-emerald-400">
                      &quot;materialClass&quot;: <span className="text-amber-300">&quot;ArchitecturalDielectricGlazing&quot;</span>,
                    </div>
                    <div className="pl-4 text-emerald-400">
                      &quot;opticalProperties&quot;: &#123;
                    </div>
                    <div className="pl-8 text-sky-400">
                      &quot;refractiveIndexIOR&quot;: <span className="text-purple-400">1.5240</span>,
                    </div>
                    <div className="pl-8 text-sky-400">
                      &quot;solarHeatGainCoeff_SHGC&quot;: <span className="text-purple-400">0.28</span>,
                    </div>
                    <div className="pl-8 text-sky-400">
                      &quot;visibleLightTransmittance_VLT&quot;: <span className="text-purple-400">0.64</span>,
                    </div>
                    <div className="pl-8 text-sky-400">
                      &quot;dispersionAbbeNumber&quot;: <span className="text-purple-400">58.6</span>
                    </div>
                    <div className="pl-4 text-emerald-400">&#125;,</div>
                    <div className="pl-4 text-emerald-400">
                      &quot;photometricDistributionIES&quot;: &#123;
                    </div>
                    <div className="pl-8 text-sky-400">
                      &quot;candelaMultiplier&quot;: <span className="text-purple-400">1450.0</span>,
                    </div>
                    <div className="pl-8 text-sky-400">
                      &quot;colorTemperatureKelvin&quot;: <span className="text-purple-400">2700</span>,
                    </div>
                    <div className="pl-8 text-sky-400">
                      &quot;luminousFluxLumens&quot;: <span className="text-purple-400">3200</span>
                    </div>
                    <div className="pl-4 text-emerald-400">&#125;</div>
                    <div className="text-zinc-300">&#125;</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* TECHNICAL INSPECTOR & CRYPTOGRAPHIC VERIFICATION TAB */
            <div className="max-w-2xl mx-auto w-full py-4 space-y-5 text-xs font-mono">
              <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase text-[#71717A] font-bold tracking-wider">
                    Digital Asset Ledger & Signature
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cryptographically Authenticated</span>
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#71717A] uppercase">SHA-256 Checksum Hash</span>
                    <button
                      onClick={handleCopyChecksum}
                      className="text-[10px] text-[#3ECF8E] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{isCopied ? 'Copied!' : 'Copy Hash'}</span>
                    </button>
                  </div>
                  <div className="text-[11px] text-zinc-300 break-all select-all font-mono">
                    {doc.checksum || 'SHA-256: 7F88D92A0B3C14E59F672A8B3392E109AB47'}
                  </div>
                </div>
              </div>

              {/* METADATA GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A] space-y-1">
                  <span className="text-[10px] text-[#71717A] uppercase flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-[#3ECF8E]" />
                    <span>File Size</span>
                  </span>
                  <div className="text-white font-bold">{doc.fileSize}</div>
                </div>

                <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A] space-y-1">
                  <span className="text-[10px] text-[#71717A] uppercase flex items-center gap-1">
                    <Tag className="w-3 h-3 text-[#3ECF8E]" />
                    <span>Version Tag</span>
                  </span>
                  <div className="text-white font-bold">{doc.version}</div>
                </div>

                <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A] space-y-1">
                  <span className="text-[10px] text-[#71717A] uppercase flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#3ECF8E]" />
                    <span>Last Ingested</span>
                  </span>
                  <div className="text-white font-bold">{doc.updatedAt}</div>
                </div>

                <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A] space-y-1">
                  <span className="text-[10px] text-[#71717A] uppercase flex items-center gap-1">
                    <User className="w-3 h-3 text-[#3ECF8E]" />
                    <span>Uploading Author</span>
                  </span>
                  <div className="text-white font-bold truncate">{doc.uploadedBy}</div>
                </div>

                <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A] space-y-1">
                  <span className="text-[10px] text-[#71717A] uppercase flex items-center gap-1">
                    <Layers className="w-3 h-3 text-[#3ECF8E]" />
                    <span>Classification</span>
                  </span>
                  <div className="text-white font-bold">{doc.category}</div>
                </div>

                <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A] space-y-1">
                  <span className="text-[10px] text-[#71717A] uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#3ECF8E]" />
                    <span>Units / Scale</span>
                  </span>
                  <div className="text-white font-bold">{doc.pageCountOrUnits || 'Metric mm (1:1)'}</div>
                </div>
              </div>

              {/* SCOPE DESCRIPTION */}
              <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-1.5">
                <span className="text-[10px] uppercase text-[#71717A] font-bold tracking-wider">
                  Technical Scope & Architectural Notes
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {doc.description}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM FOOTER STATUS */}
        <div className="p-3 px-5 border-t border-[#27272A] bg-[#18181B] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-[#71717A] shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[#3ECF8E]">● Live In-Browser Preview</span>
            <span>·</span>
            <span>No local CAD / BIM workstation install required</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#A1A1AA]">Press [ESC] to exit</span>
            <button
              onClick={onClose}
              className="px-3 py-1 rounded bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-white cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
