'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  Columns2,
  Sliders,
  Sparkles,
  Layers,
  Download,
  Info,
  CheckCircle2,
  Clock,
  ArrowLeftRight,
  Maximize2,
  Minimize2,
  Eye,
  Camera,
  Cpu,
  FileCode,
  Check,
  ChevronDown,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  HelpCircle,
  FileText
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { ProjectDocument } from './ProjectDocumentRepository';

export interface RenderRevisionItem {
  id: string;
  versionLabel: string;
  stageName: string;
  dateKey: string;
  displayDate: string;
  imageUrl: string;
  resolution: string;
  renderEngine: string;
  cameraLens?: string;
  lightingSetup: string;
  materialsNote: string;
  status: 'Approved' | 'Superseded' | 'Under Review' | 'Baseline';
  supervisor: string;
  ticketId?: string;
  keyDifferences: string[];
}

export interface ProjectRevisionCollection {
  projectId: string;
  projectName: string;
  revisions: RenderRevisionItem[];
}

const REVISION_COLLECTIONS: Record<string, ProjectRevisionCollection> = {
  'VIZTR-882': {
    projectId: 'VIZTR-882',
    projectName: 'The Apex Tower - Master Tower Facade & XR World',
    revisions: [
      {
        id: 'rev-apex-3.0',
        versionLabel: 'Rev 3.0 (Clay Massing)',
        stageName: 'Stage 03: Monochromatic Clay Composition',
        dateKey: '2026-02-14',
        displayDate: 'Feb 14, 2026',
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85',
        resolution: '3840x2160 (4K Clay)',
        renderEngine: 'V-Ray 6 Neutral Matte Grey Clay',
        lightingSetup: 'Neutral 5500K Studio Sun / Skylight',
        materialsNote: 'Untextured 18% neutral gray Lambertian diffuse clay blockout.',
        status: 'Superseded',
        supervisor: 'Foster & Partners BIM Studio',
        ticketId: 'REV-882-C01',
        keyDifferences: [
          'Untextured neutral gray geometry for volumetric shadow verification',
          '24mm tilt-shift perspective zeroed without vertical distortion',
          'Cantilever steel truss structure aligned to engineering drawings'
        ]
      },
      {
        id: 'rev-apex-4.0',
        versionLabel: 'Rev 4.0 (Initial Daylight Pass)',
        stageName: 'Stage 04: PBR Glazing & Daylight Staging',
        dateKey: '2026-02-20',
        displayDate: 'Feb 20, 2026',
        imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=85',
        resolution: '5120x2880 (5K Staging)',
        renderEngine: 'Unreal Engine 5.5 Lumen & Path Tracing',
        lightingSetup: 'Late Afternoon 4500K Sun + Sky Horizon',
        materialsNote: 'Initial low-E triple-glazing with 25% reflectivity and brushed spandrel metal.',
        status: 'Superseded',
        supervisor: 'VizTR Optics & Material Lab',
        ticketId: 'REV-882-L02',
        keyDifferences: [
          'Triple-glazed low-E dielectric glass with IOR 1.52 applied',
          'Podium steel structural trusses textured with dark matte paint',
          'Surrounding city street environment scattering populated'
        ]
      },
      {
        id: 'rev-apex-4.2',
        versionLabel: 'Rev 4.2 (Client Twilight Revision)',
        stageName: 'Stage 05: Client Twilight Glazing Feedback',
        dateKey: '2026-02-25',
        displayDate: 'Feb 25, 2026',
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85',
        resolution: '7680x4320 (8K Preview)',
        renderEngine: 'Unreal Engine 5.5 Lumen + V-Ray 6 Spectral',
        lightingSetup: 'Dusk Golden Hour + 2700K Interior Warm Glow',
        materialsNote: 'Enhanced 45% reflectivity glass with anisotropic sunset flare and warm interior cove lights.',
        status: 'Under Review',
        supervisor: 'Elena Rostova (Lead Architect)',
        ticketId: 'REV-882-R03',
        keyDifferences: [
          'Glazing reflectivity increased from 25% to 45% for dramatic sunset reflections',
          'Warm 2700K interior floorplate cove lighting activated across 40 floors',
          'Rooftop crown beacon intensity boosted by 15% per client markup'
        ]
      },
      {
        id: 'rev-apex-6.0',
        versionLabel: 'Rev 6.0 (Final 8K Master Ray-Trace)',
        stageName: 'Stage 06: Production Multi-Pass 8K Ray Tracing',
        dateKey: '2026-02-26',
        displayDate: 'Active Now (Feb 26, 2026)',
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
        resolution: '7680x4320 (8K Ultra HD Master)',
        renderEngine: 'Distributed 128x RTX A6000 GPU Cloud Farm',
        cameraLens: '35mm Cine Master Prime',
        lightingSetup: 'Full 32-bit HDR Spherical Panorama + Spectral Caustics',
        materialsNote: 'Lossless ACEScg multi-pass EXR with ambient occlusion and cryptomatte ID passes.',
        status: 'Approved',
        supervisor: 'VizTR Render Farm Dispatch',
        ticketId: 'REV-882-FIN',
        keyDifferences: [
          'Full 4,096 SPP multi-pass ray tracing with zero noise grain',
          'Micro-facet anisotropic specular highlights on curved curtain wall spandrels',
          'Final ACEScg print-calibrated color science and anamorphic bloom'
        ]
      }
    ]
  },
  'VIZTR-904': {
    projectId: 'VIZTR-904',
    projectName: 'Solarium Sky Penthouse - Interior & 360 Nodes',
    revisions: [
      {
        id: 'rev-sol-2.0',
        versionLabel: 'Rev 2.0 (Clay Blockout)',
        stageName: 'Stage 02: Monochromatic Clay Millwork Pass',
        dateKey: '2026-02-16',
        displayDate: 'Feb 16, 2026',
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
        resolution: '4096x2048 (4K Equirectangular Clay)',
        renderEngine: 'V-Ray 6 Interior Clay Engine',
        lightingSetup: 'Neutral Sky Dome',
        materialsNote: 'Matte gray finish for spatial node and sightline testing.',
        status: 'Superseded',
        supervisor: 'Zaha Hadid Interior Studio',
        ticketId: 'REV-904-C01',
        keyDifferences: [
          'Raw clay geometry verifying furniture layout and ceiling trough depth',
          'Camera heights fixed at 1500mm standard eye level',
          'Untextured millwork and marble island blockout'
        ]
      },
      {
        id: 'rev-sol-4.0',
        versionLabel: 'Rev 4.0 (Calacatta Marble & Delta Lights)',
        stageName: 'Stage 04: PBR Materiality & Photometric IES',
        dateKey: '2026-02-26',
        displayDate: 'Active Now (Feb 26, 2026)',
        imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85',
        resolution: '7680x4320 (8K Master)',
        renderEngine: 'Unreal Engine 5.5 Lumen + LM-63 IES Profiles',
        lightingSetup: '2700K Recessed Delta Lights + Evening Horizon Sky',
        materialsNote: 'Italian Calacatta bookmatched marble scans and fluted walnut panelling.',
        status: 'Under Review',
        supervisor: 'Markus Weber Studio',
        ticketId: 'REV-904-M02',
        keyDifferences: [
          '8K photogrammetry displacement height maps on Calacatta marble island',
          'Calibrated Delta Light candela distribution profiles applied',
          'Warm walnut veneer stain adjusted to physical studio sample'
        ]
      }
    ]
  },
  'VIZTR-771': {
    projectId: 'VIZTR-771',
    projectName: 'Nordic Monolith Residence - 8K Photorealistic Stills',
    revisions: [
      {
        id: 'rev-nordic-1.5',
        versionLabel: 'Rev 1.5 (Clay Topography)',
        stageName: 'Stage 01: LIDAR & Concrete Clay Study',
        dateKey: '2026-01-20',
        displayDate: 'Jan 20, 2026',
        imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=85',
        resolution: '3840x2160 (4K Clay)',
        renderEngine: 'Rhino 8 + V-Ray Clay Pass',
        lightingSetup: 'Winter Sun Altitude 15°',
        materialsNote: 'Monochromatic form study on cliff integration.',
        status: 'Superseded',
        supervisor: 'Snøhetta BIM Team',
        ticketId: 'REV-771-C01',
        keyDifferences: [
          'Cliff rock mesh integrated with concrete retaining foundation',
          'Low winter sun angle cast across fjord water surface',
          'Untextured cedar wood slats and glass facade openings'
        ]
      },
      {
        id: 'rev-nordic-3.0',
        versionLabel: 'Rev 3.0 (Final 8K Master Archival)',
        stageName: 'Stage 03: Final 8K Photorealistic Master',
        dateKey: '2026-02-20',
        displayDate: 'Feb 20, 2026',
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
        resolution: '7680x4320 (8K Print Ready)',
        renderEngine: 'Lossless 8K Multi-Pass TIFF · ACEScg',
        lightingSetup: 'Nordic Twilight Mist + 2400K Hearth Warmth',
        materialsNote: 'Yakisugi charred timber, board-formed concrete, and water surface shaders.',
        status: 'Approved',
        supervisor: 'Soren Lindqvist (Snøhetta)',
        ticketId: 'REV-771-FIN',
        keyDifferences: [
          'Volumetric coastal fog scattering layered across fjord',
          'Micro-displacement normal maps on board-formed concrete walls',
          'Archival master signoff with full commercial licensing transfer'
        ]
      }
    ]
  }
};

interface ProjectRevisionCompareProps {
  projectId?: string;
  projectName?: string;
  documents?: ProjectDocument[];
  className?: string;
}

export default function ProjectRevisionCompare({
  projectId = 'VIZTR-882',
  projectName = 'The Apex Tower',
  documents = [],
  className = '',
}: ProjectRevisionCompareProps) {
  const { showToast } = useAppStore();

  const collection = REVISION_COLLECTIONS[projectId] || REVISION_COLLECTIONS['VIZTR-882'];
  const revisionsList = collection.revisions;

  // Selected Revisions (A = Baseline / Before, B = Revision / After)
  const [versionAId, setVersionAId] = useState<string>(revisionsList[0]?.id || '');
  const [versionBId, setVersionBId] = useState<string>(revisionsList[revisionsList.length - 1]?.id || '');

  // Comparison Mode: 'slider' (Image Overlay Split Slider), 'side-by-side' (Dual Sync View), 'opacity' (X-Ray Blend Crossfade)
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side' | 'opacity'>('slider');

  // Split Position (0 - 100%)
  const [splitPosition, setSplitPosition] = useState<number>(50);
  const [blendOpacity, setBlendOpacity] = useState<number>(50); // For opacity crossfade mode
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const sliderFrameRef = useRef<HTMLDivElement>(null);

  const [prevProjectId, setPrevProjectId] = useState<string>(projectId);

  if (prevProjectId !== projectId) {
    setPrevProjectId(projectId);
    const projRevs = REVISION_COLLECTIONS[projectId]?.revisions || REVISION_COLLECTIONS['VIZTR-882'].revisions;
    if (projRevs.length >= 2) {
      setVersionAId(projRevs[0].id);
      setVersionBId(projRevs[projRevs.length - 1].id);
    } else if (projRevs.length === 1) {
      setVersionAId(projRevs[0].id);
      setVersionBId(projRevs[0].id);
    }
    setSplitPosition(50);
    setZoomLevel(1);
  }

  const versionA = revisionsList.find((r) => r.id === versionAId) || revisionsList[0];
  const versionB = revisionsList.find((r) => r.id === versionBId) || revisionsList[revisionsList.length - 1] || revisionsList[0];

  // Mouse / Touch Dragging Logic for Overlay Split Slider
  const handlePointerMove = useCallback(
    (clientX: number) => {
      if (!sliderFrameRef.current) return;
      const rect = sliderFrameRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const newPos = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));
      setSplitPosition(Math.round(newPos * 10) / 10);
    },
    []
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handlePointerMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handlePointerMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handlePointerMove(e.clientX);
      }
    };
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, handlePointerMove]);

  // Keyboard navigation for split slider
  const handleSliderKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSplitPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSplitPosition((prev) => Math.min(100, prev + 5));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSplitPosition(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSplitPosition(100);
    }
  };

  const handleSwapVersions = () => {
    const temp = versionAId;
    setVersionAId(versionBId);
    setVersionBId(temp);
    showToast('Swapped comparison baseline and target revisions.', 'info');
  };

  const handleExportDiffReport = () => {
    showToast(
      `Revision comparison report generated: ${versionA.versionLabel} vs ${versionB.versionLabel}`,
      'success'
    );
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <section
      id={`project-revision-compare-${projectId}`}
      ref={containerRef}
      aria-label={`Compare Render Revisions for ${projectName}`}
      className={`p-6 rounded-2xl bg-[#141416] border border-[#27272A] space-y-6 shadow-2xl relative overflow-hidden ${
        isFullscreen ? 'p-8 bg-[#09090B] h-screen overflow-y-auto' : ''
      } ${className}`}
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#27272A] pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              role="status"
              aria-label="Component category: Interactive Revision Diff & Overlay Tool"
              className="px-2.5 py-0.5 rounded-md bg-[#09090B] border border-[#3ECF8E]/40 text-[10px] font-mono font-bold uppercase text-[#3ECF8E] flex items-center gap-1.5"
            >
              <ArrowLeftRight className="w-3 h-3 text-[#3ECF8E]" />
              <span>Compare Render Revisions & Shader Iterations</span>
            </span>
            <span
              role="status"
              aria-label={`Available archived iterations: ${revisionsList.length} revision versions`}
              className="px-2 py-0.5 rounded bg-[#1C1C1F] border border-[#27272A] text-[10px] font-mono text-[#A1A1AA]"
            >
              {revisionsList.length} Revisions Available
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold font-display text-white flex items-center gap-2">
            Side-by-Side & Overlay Split Slider Inspection
          </h3>
          <p className="text-xs text-[#A1A1AA] max-w-2xl">
            Select any two render passes from the project repository to evaluate architectural modifications, glazing specularity, shadow angles, and client markup signoffs with precision.
          </p>
        </div>

        {/* COMPARISON VIEW MODE SELECTOR */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-[#09090B] border border-[#27272A] text-xs font-mono">
            <button
              type="button"
              onClick={() => setViewMode('slider')}
              aria-label="Switch to Image Overlay Split Slider mode"
              aria-pressed={viewMode === 'slider'}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'slider'
                  ? 'bg-[#3ECF8E] text-black shadow-md'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Split Slider</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('side-by-side')}
              aria-label="Switch to Side-by-Side Dual View mode"
              aria-pressed={viewMode === 'side-by-side'}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'side-by-side'
                  ? 'bg-[#3ECF8E] text-black shadow-md'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>Side-by-Side</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('opacity')}
              aria-label="Switch to Opacity Crossfade Blend mode"
              aria-pressed={viewMode === 'opacity'}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'opacity'
                  ? 'bg-[#3ECF8E] text-black shadow-md'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>X-Ray Blend</span>
            </button>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen comparison mode' : 'Enter fullscreen comparison mode'}
            aria-pressed={isFullscreen}
            className="p-2 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* VERSION SELECTION TOOLBAR */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* VERSION A SELECTOR (LEFT / BASELINE) */}
        <div className="md:col-span-5 p-3 rounded-xl bg-[#09090B] border border-[#27272A] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#3ECF8E] font-bold uppercase text-[11px] flex items-center gap-1">
              <span>● Version A (Baseline / Before)</span>
            </span>
            <span className="text-[10px] text-[#71717A]">{versionA.displayDate}</span>
          </div>

          <select
            value={versionAId}
            onChange={(e) => setVersionAId(e.target.value)}
            aria-label="Select Version A baseline render version"
            className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#27272A] text-white text-xs font-mono focus:outline-none focus:border-[#3ECF8E] cursor-pointer"
          >
            {revisionsList.map((rev) => (
              <option key={`opt-a-${rev.id}`} value={rev.id}>
                {rev.versionLabel} — {rev.stageName}
              </option>
            ))}
          </select>

          <div className="flex items-center justify-between text-[10px] font-mono text-[#A1A1AA]">
            <span>{versionA.resolution}</span>
            <span className="text-zinc-400 font-bold">{versionA.status}</span>
          </div>
        </div>

        {/* SWAP BUTTON (CENTER) */}
        <div className="md:col-span-2 flex justify-center">
          <button
            type="button"
            onClick={handleSwapVersions}
            aria-label="Swap Version A and Version B positions"
            className="p-2.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] hover:border-[#3ECF8E] text-zinc-300 hover:text-[#3ECF8E] transition-all shadow-md cursor-pointer group"
            title="Swap Version A and B"
          >
            <ArrowLeftRight className="w-4 h-4 transition-transform group-hover:scale-110" />
          </button>
        </div>

        {/* VERSION B SELECTOR (RIGHT / MODIFIED) */}
        <div className="md:col-span-5 p-3 rounded-xl bg-[#09090B] border border-[#27272A] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#26A69A] font-bold uppercase text-[11px] flex items-center gap-1">
              <span>● Version B (Target / After)</span>
            </span>
            <span className="text-[10px] text-[#71717A]">{versionB.displayDate}</span>
          </div>

          <select
            value={versionBId}
            onChange={(e) => setVersionBId(e.target.value)}
            aria-label="Select Version B target render version"
            className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#27272A] text-white text-xs font-mono focus:outline-none focus:border-[#3ECF8E] cursor-pointer"
          >
            {revisionsList.map((rev) => (
              <option key={`opt-b-${rev.id}`} value={rev.id}>
                {rev.versionLabel} — {rev.stageName}
              </option>
            ))}
          </select>

          <div className="flex items-center justify-between text-[10px] font-mono text-[#A1A1AA]">
            <span>{versionB.resolution}</span>
            <span className="text-[#3ECF8E] font-bold">{versionB.status}</span>
          </div>
        </div>
      </div>

      {/* QUICK PRESET COMPARISONS BAR */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        <span className="text-[#71717A] text-[11px] uppercase font-bold">Quick Presets:</span>
        {revisionsList.length >= 2 && (
          <button
            type="button"
            onClick={() => {
              setVersionAId(revisionsList[0].id);
              setVersionBId(revisionsList[revisionsList.length - 1].id);
              setViewMode('slider');
              setSplitPosition(50);
              showToast('Loaded preset: Initial Clay Blockout vs Final 8K Master', 'info');
            }}
            aria-label="Load preset: Clay vs Final 8K Master"
            className="px-2.5 py-1 rounded-md bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-zinc-300 hover:text-white text-[11px] transition-colors cursor-pointer"
          >
            Clay vs Final 8K
          </button>
        )}

        {revisionsList.length >= 3 && (
          <button
            type="button"
            onClick={() => {
              setVersionAId(revisionsList[1].id);
              setVersionBId(revisionsList[2].id);
              setViewMode('slider');
              setSplitPosition(50);
              showToast('Loaded preset: Daylight Staging vs Client Twilight Markup', 'info');
            }}
            aria-label="Load preset: Daylight vs Twilight Pass"
            className="px-2.5 py-1 rounded-md bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-zinc-300 hover:text-white text-[11px] transition-colors cursor-pointer"
          >
            Daylight vs Twilight Pass
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          {/* ZOOM CONTROLS */}
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.max(0.75, prev - 0.25))}
            aria-label="Zoom out render view"
            disabled={zoomLevel <= 0.75}
            className="p-1 rounded bg-[#18181B] border border-[#27272A] text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-[#A1A1AA]">{Math.round(zoomLevel * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.min(2, prev + 0.25))}
            aria-label="Zoom in render view"
            disabled={zoomLevel >= 2}
            className="p-1 rounded bg-[#18181B] border border-[#27272A] text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(1)}
            aria-label="Reset zoom level to 100%"
            className="p-1 rounded bg-[#18181B] border border-[#27272A] text-zinc-400 hover:text-white cursor-pointer"
            title="Reset zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MAIN INTERACTIVE COMPARISON CANVAS */}
      <div
        id="revision-comparison-stage"
        ref={sliderFrameRef}
        className="relative rounded-2xl overflow-hidden bg-black border border-[#27272A] aspect-[16/9] sm:aspect-[21/9] select-none shadow-2xl group"
        onMouseDown={viewMode === 'slider' ? handleMouseDown : undefined}
        onTouchMove={viewMode === 'slider' ? handleTouchMove : undefined}
      >
        {/* VIEW MODE 1: INTERACTIVE IMAGE OVERLAY SPLIT SLIDER */}
        {viewMode === 'slider' && (
          <div className="relative w-full h-full cursor-ew-resize overflow-hidden">
            {/* UNDERLAY: VERSION B (RIGHT / TARGET) */}
            <div
              className="absolute inset-0 w-full h-full transition-transform duration-100"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
            >
              <Image
                src={versionB.imageUrl}
                alt={`${projectName} - ${versionB.versionLabel}`}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
                priority
              />
            </div>

            {/* OVERLAY: VERSION A (LEFT / BASELINE) CLIPPED BY SPLIT POSITION */}
            <div
              className="absolute inset-0 w-full h-full transition-transform duration-100"
              style={{
                clipPath: `inset(0 ${100 - splitPosition}% 0 0)`,
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center'
              }}
            >
              <Image
                src={versionA.imageUrl}
                alt={`${projectName} - ${versionA.versionLabel}`}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
                priority
              />
            </div>

            {/* SLIDER DIVIDER LINE & GRAB HANDLE */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-2xl z-20 pointer-events-none"
              style={{ left: `${splitPosition}%` }}
            >
              {/* CENTER DRAG PILL */}
              <div
                role="slider"
                tabIndex={0}
                onKeyDown={handleSliderKeyDown}
                aria-label="Interactive revision comparison split handle"
                aria-valuenow={Math.round(splitPosition)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuetext={`${splitPosition}% Version A, ${100 - splitPosition}% Version B`}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-black/90 border-2 border-white shadow-2xl flex items-center justify-center text-white pointer-events-auto cursor-ew-resize focus:outline-none focus:ring-2 focus:ring-[#3ECF8E]"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-[#3ECF8E]" />
              </div>
            </div>

            {/* FLOATING VERSION LABELS ON CORNERS */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
              <span
                role="status"
                aria-label={`Left frame version: ${versionA.versionLabel}`}
                className="px-3 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-xs font-mono font-bold text-white shadow-lg flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-[#3ECF8E]" />
                <span>{versionA.versionLabel}</span>
              </span>
            </div>

            <div className="absolute top-4 right-4 z-10 pointer-events-none">
              <span
                role="status"
                aria-label={`Right frame version: ${versionB.versionLabel}`}
                className="px-3 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-xs font-mono font-bold text-white shadow-lg flex items-center gap-2"
              >
                <span>{versionB.versionLabel}</span>
                <span className="w-2 h-2 rounded-full bg-[#26A69A]" />
              </span>
            </div>

            {/* BOTTOM SPLIT PERCENTAGE READOUT */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <span
                role="status"
                aria-label={`Split position: ${Math.round(splitPosition)}% Version A, ${100 - Math.round(splitPosition)}% Version B`}
                className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-[11px] font-mono text-zinc-300 shadow-lg"
              >
                {Math.round(splitPosition)}% A / {100 - Math.round(splitPosition)}% B
              </span>
            </div>
          </div>
        )}

        {/* VIEW MODE 2: SIDE-BY-SIDE DUAL VIEW */}
        {viewMode === 'side-by-side' && (
          <div className="grid grid-cols-2 h-full w-full gap-0.5 bg-[#27272A]">
            {/* LEFT FRAME (VERSION A) */}
            <div className="relative h-full overflow-hidden bg-black">
              <div
                className="relative w-full h-full"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
              >
                <Image
                  src={versionA.imageUrl}
                  alt={versionA.versionLabel}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute top-3 left-3 z-10">
                <span
                  role="status"
                  aria-label={`Baseline version: ${versionA.versionLabel}`}
                  className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-xs font-mono font-bold text-white flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-[#3ECF8E]" />
                  <span>{versionA.versionLabel}</span>
                </span>
              </div>
              <div className="absolute bottom-3 left-3 right-3 p-2 rounded-lg bg-black/80 backdrop-blur-md text-[10px] font-mono text-[#A1A1AA] truncate">
                {versionA.lightingSetup}
              </div>
            </div>

            {/* RIGHT FRAME (VERSION B) */}
            <div className="relative h-full overflow-hidden bg-black">
              <div
                className="relative w-full h-full"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
              >
                <Image
                  src={versionB.imageUrl}
                  alt={versionB.versionLabel}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute top-3 right-3 z-10">
                <span
                  role="status"
                  aria-label={`Target revision: ${versionB.versionLabel}`}
                  className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-xs font-mono font-bold text-white flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-[#26A69A]" />
                  <span>{versionB.versionLabel}</span>
                </span>
              </div>
              <div className="absolute bottom-3 left-3 right-3 p-2 rounded-lg bg-black/80 backdrop-blur-md text-[10px] font-mono text-[#A1A1AA] truncate">
                {versionB.lightingSetup}
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODE 3: OPACITY CROSSFADE BLEND MODE */}
        {viewMode === 'opacity' && (
          <div className="relative w-full h-full overflow-hidden">
            {/* BASE IMAGE (VERSION A) */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
            >
              <Image
                src={versionA.imageUrl}
                alt={versionA.versionLabel}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* BLEND OVERLAY (VERSION B) */}
            <div
              className="absolute inset-0 w-full h-full transition-opacity duration-75"
              style={{
                opacity: blendOpacity / 100,
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center'
              }}
            >
              <Image
                src={versionB.imageUrl}
                alt={versionB.versionLabel}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* FLOATING OPACITY CONTROL SLIDER */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 p-3 rounded-xl bg-black/85 backdrop-blur-md border border-white/10 flex items-center gap-3 text-xs font-mono text-white shadow-2xl z-10 w-80">
              <span className="text-[10px] text-[#A1A1AA]">A (0%)</span>
              <input
                type="range"
                min={0}
                max={100}
                value={blendOpacity}
                onChange={(e) => setBlendOpacity(parseInt(e.target.value, 10))}
                aria-label="Crossfade opacity slider between Version A and Version B"
                aria-valuenow={blendOpacity}
                aria-valuemin={0}
                aria-valuemax={100}
                className="w-full accent-[#3ECF8E] cursor-pointer"
              />
              <span className="text-[10px] text-[#3ECF8E] font-bold">B ({blendOpacity}%)</span>
            </div>
          </div>
        )}
      </div>

      {/* REVISION DIFFERENCE MATRIX & ARCHITECTURAL CHANGELOG TABLE */}
      <div className="p-5 rounded-xl bg-[#09090B] border border-[#27272A] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272A] pb-3">
          <div className="space-y-0.5">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#3ECF8E]" />
              <span>Architectural Parameter Diff Breakdown</span>
            </h4>
            <p className="text-xs text-[#A1A1AA]">
              Key lighting, specularity, and structural adjustments between {versionA.versionLabel} and {versionB.versionLabel}.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportDiffReport}
            aria-label="Export revision comparison and parameter diff summary"
            className="px-3 py-1.5 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] hover:border-[#3ECF8E] text-xs font-mono text-[#3ECF8E] font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Diff Summary</span>
          </button>
        </div>

        {/* COMPARISON METRIC GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {/* VERSION A SPECS */}
          <div className="p-3.5 rounded-xl bg-[#141416] border border-[#27272A] space-y-2.5">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
              <span className="text-[#3ECF8E] font-bold text-xs">{versionA.versionLabel}</span>
              <span
                role="status"
                aria-label={`Status: ${versionA.status}`}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1C1C1F] text-zinc-300 border border-[#27272A]"
              >
                {versionA.status}
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div>
                <span className="text-[#71717A]">Stage / Date: </span>
                <span className="text-white">{versionA.stageName} ({versionA.displayDate})</span>
              </div>
              <div>
                <span className="text-[#71717A]">Render Pipeline: </span>
                <span className="text-zinc-300">{versionA.renderEngine}</span>
              </div>
              <div>
                <span className="text-[#71717A]">Lighting Setup: </span>
                <span className="text-zinc-300">{versionA.lightingSetup}</span>
              </div>
              <div>
                <span className="text-[#71717A]">Materiality: </span>
                <span className="text-zinc-300">{versionA.materialsNote}</span>
              </div>
            </div>
          </div>

          {/* VERSION B SPECS */}
          <div className="p-3.5 rounded-xl bg-[#141416] border border-[#27272A] space-y-2.5">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
              <span className="text-[#26A69A] font-bold text-xs">{versionB.versionLabel}</span>
              <span
                role="status"
                aria-label={`Status: ${versionB.status}`}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00897B]/20 text-[#26A69A] border border-[#00897B]/40"
              >
                {versionB.status}
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div>
                <span className="text-[#71717A]">Stage / Date: </span>
                <span className="text-white">{versionB.stageName} ({versionB.displayDate})</span>
              </div>
              <div>
                <span className="text-[#71717A]">Render Pipeline: </span>
                <span className="text-zinc-300">{versionB.renderEngine}</span>
              </div>
              <div>
                <span className="text-[#71717A]">Lighting Setup: </span>
                <span className="text-zinc-300">{versionB.lightingSetup}</span>
              </div>
              <div>
                <span className="text-[#71717A]">Materiality: </span>
                <span className="text-zinc-300">{versionB.materialsNote}</span>
              </div>
            </div>
          </div>
        </div>

        {/* DELTA / CHANGELOG BULLETS */}
        <div className="space-y-2 pt-1">
          <div className="text-[10px] font-mono uppercase font-bold text-[#71717A]">
            Architectural Delta & Modification Log (Version B vs Version A):
          </div>
          <div className="space-y-1.5">
            {versionB.keyDifferences.map((diff, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-[#141416] border border-[#27272A] text-xs font-mono text-zinc-300 flex items-start gap-2"
              >
                <span className="text-[#3ECF8E] font-bold mt-0.5">•</span>
                <span className="text-[11px] leading-snug">{diff}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
