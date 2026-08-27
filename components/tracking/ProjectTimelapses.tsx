'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Sliders,
  Maximize2,
  Minimize2,
  Download,
  Info,
  Layers,
  Sparkles,
  Camera,
  Cpu,
  Clock,
  CheckCircle2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Film
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

export interface TimelapseFrame {
  id: string;
  stageNumber: number;
  stageName: string;
  stageCategory: string;
  timestamp: string;
  imageUrl: string;
  renderEngine: string;
  cameraLens: string;
  sampleCount: string;
  resolution: string;
  supervisor: string;
  progressPercentage: number;
  status?: 'completed' | 'in-progress' | 'master';
  notes: string;
  keyChanges: string[];
}

export interface ProjectTimelapseData {
  projectId: string;
  projectName: string;
  totalDurationDays: number;
  totalGpuHours: number;
  fpsLabel: string;
  frames: TimelapseFrame[];
}

const PROJECT_TIMELAPSE_COLLECTIONS: Record<string, ProjectTimelapseData> = {
  'VIZTR-882': {
    projectId: 'VIZTR-882',
    projectName: 'The Apex Tower - Master Tower Facade & XR World',
    totalDurationDays: 24,
    totalGpuHours: 148.5,
    fpsLabel: '60 FPS 8K Master Reel',
    frames: [
      {
        id: 'apex-frame-1',
        stageNumber: 1,
        stageName: 'Stage 01: CAD & BIM Geometry Ingestion',
        stageCategory: 'Data Ingestion & Calibration',
        timestamp: 'Feb 02, 2026 · 10:15 GMT',
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85',
        renderEngine: 'BIM IFC4 / Rhino 8 Wireframe Mesh',
        cameraLens: '24mm Tilt-Shift · 0° Keystoning',
        sampleCount: '1:1 Metric Coordinate Grid',
        resolution: 'Vector CAD Overlay',
        supervisor: 'Foster & Partners BIM Studio',
        progressPercentage: 15,
        status: 'completed',
        notes: '48-sheet architectural permit package ingested. Structural floorplate datums aligned with 0.5mm engineering tolerance.',
        keyChanges: [
          'Aligned 40 podium cantilever nodes with Revit structural grid',
          'Calibrated site North azimuth coordinate system',
          'Established 1:1 true-scale millimeter boundary'
        ]
      },
      {
        id: 'apex-frame-2',
        stageNumber: 2,
        stageName: 'Stage 02: High-Poly SubD Modeling & Context Staging',
        stageCategory: 'Geometric Construction',
        timestamp: 'Feb 08, 2026 · 14:40 GMT',
        imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=85',
        renderEngine: 'Subdivision Surface Modeler · 12M Polygons',
        cameraLens: '35mm Architectural Prime',
        sampleCount: 'Raw Shaded Wireframe + Ambient Occlusion',
        resolution: '3840x2160 Preview Draft',
        supervisor: 'VizTR Senior 3D Modeler',
        progressPercentage: 35,
        notes: 'Constructed custom spandrel mullions, street-level entrance canopy, and surrounding city urban context geometry.',
        keyChanges: [
          'High-poly steel truss nodes constructed at cantilever',
          'City context topography and surrounding towers placed',
          'Subdivision smoothing applied to curved glass corners'
        ]
      },
      {
        id: 'apex-frame-3',
        stageNumber: 3,
        stageName: 'Stage 03: Monochromatic Clay Massing & Camera Lock',
        stageCategory: 'Volumetric & Compositional Study',
        timestamp: 'Feb 14, 2026 · 18:20 GMT',
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85',
        renderEngine: 'V-Ray 6 Neutral Matte Grey Clay',
        cameraLens: '28mm Shift Prime · Eye-Level Hero Angle',
        sampleCount: '512 SPP Clay Ambient Pass',
        resolution: '3840x2160 Form Study',
        supervisor: 'Elena Rostova & CGI Art Director',
        progressPercentage: 50,
        notes: 'Client reviewed and locked 6 master camera positions. Solar path shadows verified for winter and summer solstice.',
        keyChanges: [
          'Shift lens configured to eliminate vertical perspective keystoning',
          'Shadow angles calibrated to 17:30 golden hour sun',
          'Client signoff received for master eye-level composition'
        ]
      },
      {
        id: 'apex-frame-4',
        stageNumber: 4,
        stageName: 'Stage 04: Physical Sun/Sky & Twilight Lighting Pass',
        stageCategory: 'Atmospheric & Photometric Staging',
        timestamp: 'Feb 20, 2026 · 16:10 GMT',
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85',
        renderEngine: 'Unreal Engine 5.5 Lumen & Spectral Skylight',
        cameraLens: '35mm Cinematic Anamorphic (1.33x)',
        sampleCount: '1,024 SPP Volumetric Path Tracing',
        resolution: '5120x2880 Lighting Proof',
        supervisor: 'VizTR Optics & Material Lab',
        progressPercentage: 70,
        notes: 'Simulated 32-bit HDRI twilight sky with low-angle warm solar luminance and 2700K interior office floorplate lighting.',
        keyChanges: [
          'Spectrophotometer measured low-E glass coatings applied',
          'Warm 2700K floorplate cove lighting energized',
          'Atmospheric twilight fog haze balanced across horizon'
        ]
      },
      {
        id: 'apex-frame-5',
        stageNumber: 5,
        stageName: 'Stage 05: Client Collaborative Review & Markup Signoff',
        stageCategory: 'Interactive Markups & Refinements',
        timestamp: 'Feb 25, 2026 · 11:30 GMT',
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
        renderEngine: 'Multi-Pass Render Composite with Live Pins',
        cameraLens: '35mm Shift Lens · Review Overlay',
        sampleCount: '2,048 SPP Refined Pass',
        resolution: '7680x4320 8K Client Review',
        supervisor: 'Elena Rostova (Lead Architect Signoff)',
        progressPercentage: 85,
        notes: 'Client reviewed glass reflection warmth and requested 15% increase in penthouse rooftop illumination.',
        keyChanges: [
          'Reflective dielectric glazing adjusted to 45% specular reflectivity',
          'Rooftop crown beacon intensity boosted by 15%',
          'Street pavement specular wetness refined after feedback'
        ]
      },
      {
        id: 'apex-frame-6',
        stageNumber: 6,
        stageName: 'Stage 06: Multi-Pass 8K Ray Tracing & Cryptomatte',
        stageCategory: 'Cloud GPU Production Farm',
        timestamp: 'Active Now (Feb 26, 2026)',
        imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=85',
        renderEngine: 'Distributed 128x NVIDIA RTX A6000 Ada Cloud Farm',
        cameraLens: '35mm Master Cine Prime (T1.5)',
        sampleCount: '4,096 SPP 32-bit Floating EXR',
        resolution: '7680x4320 (8K Ultra HD)',
        supervisor: 'VizTR Render Farm Dispatch',
        progressPercentage: 95,
        status: 'in-progress',
        notes: 'Full multi-pass computation including diffuse, specular, normal, cryptomatte ID, and volumetric emission buffers.',
        keyChanges: [
          '32-bit floating point high dynamic range EXR output',
          'Draco-compressed WebXR 3D interactive asset compiled',
          'Final 8K print master rendering 95% completed'
        ]
      },
      {
        id: 'apex-frame-7',
        stageNumber: 7,
        stageName: 'Stage 07: Final Master Grading & Archival Packaging',
        stageCategory: 'Color Science & Archival Master',
        timestamp: 'Scheduled for March 02, 2026',
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85',
        renderEngine: 'ACEScg Color Managed Master Output',
        cameraLens: '35mm Anamorphic Master Reel',
        sampleCount: 'Lossless TIFF 16-bit ProPhoto RGB',
        resolution: '7680x4320 Master Package',
        supervisor: 'Archival & Asset Packaging Team',
        progressPercentage: 100,
        status: 'master',
        notes: 'Archival ZIP bundle with full commercial IP transfer license and lifetime cloud repository backup.',
        keyChanges: [
          'Final color science grading calibrated for print and digital displays',
          'ProRes 4444 XQ video clips exported',
          'Archival vault encryption hash signed'
        ]
      }
    ]
  },
  'VIZTR-904': {
    projectId: 'VIZTR-904',
    projectName: 'Solarium Sky Penthouse - Interior & 360 Nodes',
    totalDurationDays: 18,
    totalGpuHours: 86.0,
    fpsLabel: '360° Spherical 8K Node Stream',
    frames: [
      {
        id: 'sol-frame-1',
        stageNumber: 1,
        stageName: 'Stage 01: Architectural Floorplan & Joinery Ingestion',
        stageCategory: 'Data Ingestion',
        timestamp: 'Feb 10, 2026 · 09:00 EST',
        imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85',
        renderEngine: 'AutoCAD 2026 DWG + Rhino 8 Joinery Models',
        cameraLens: '18mm Wide Architectural Prime',
        sampleCount: '1:1 Millimeter Metric Space',
        resolution: '2D/3D Hybrid Layout',
        supervisor: 'Markus Weber Studio',
        progressPercentage: 20,
        status: 'completed',
        notes: '24-sheet interior joinery package imported. Custom millwork and recessed lighting tracks aligned.',
        keyChanges: [
          'Calculated ceiling plenum depth for hidden LED troughs',
          'Positioned floor-to-ceiling glass partition boundaries',
          'Established 8 spherical panoramic camera node positions'
        ]
      },
      {
        id: 'sol-frame-2',
        stageNumber: 2,
        stageName: 'Stage 02: Monochromatic Clay Blockout & Spatial Nodes',
        stageCategory: 'Clay & Volumetrics',
        timestamp: 'Feb 16, 2026 · 15:30 EST',
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
        renderEngine: 'Clay Shader Pass · V-Ray 6',
        cameraLens: '20mm Tilt-Shift Interior',
        sampleCount: '512 SPP Clay Pass',
        resolution: '4096x2048 Equirectangular Clay',
        supervisor: 'VizTR Senior Interior Artist',
        progressPercentage: 45,
        status: 'completed',
        notes: 'Verified spatial volume, sightlines toward Central Park, and daylight penetration across living room.',
        keyChanges: [
          'Locked 8 spherical panorama nodes with zero blindspots',
          'Adjusted ceiling cove height by 40mm for optimal lighting throw',
          'Confirmed bespoke furniture proportions against CAD plans'
        ]
      },
      {
        id: 'sol-frame-3',
        stageNumber: 3,
        stageName: 'Stage 03: Calacatta Marble & Walnut PBR Texturing',
        stageCategory: 'Materiality & Surface Scanning',
        timestamp: 'Feb 22, 2026 · 11:00 EST',
        imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85',
        renderEngine: 'Substance 3D Designer + 8K Photogrammetry Scans',
        cameraLens: '24mm Prime · Interior Eye-Level',
        sampleCount: '1,024 SPP Material Pass',
        resolution: '5120x2880 Texture Proof',
        supervisor: 'VizTR Surface Division',
        progressPercentage: 65,
        status: 'completed',
        notes: 'Bookmatched Italian Calacatta marble slab scans with micro-displacement and fluted walnut panelling.',
        keyChanges: [
          'Applied 8K roughness & normal maps to marble island',
          'Fine-tuned walnut stain to match client physical wood swatch',
          'Added subtle anisotropic grain reflection on brushed brass fixtures'
        ]
      },
      {
        id: 'sol-frame-4',
        stageNumber: 4,
        stageName: 'Stage 04: Delta Light Photometric IES Staging',
        stageCategory: 'Physical Lighting & Caustics',
        timestamp: 'Active Now (Feb 26, 2026)',
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85',
        renderEngine: 'Unreal Engine 5.5 Lumen with LM-63 IES Profiles',
        cameraLens: '24mm Prime · 2700K Evening Lighting',
        sampleCount: '2,048 SPP Path Tracing',
        resolution: '7680x4320 8K Staging',
        supervisor: 'Surface & Lighting Division',
        progressPercentage: 80,
        status: 'in-progress',
        notes: 'Real-world Delta Light candela curves applied to recessed ceiling spots, wall washers, and under-cabinet glow.',
        keyChanges: [
          'Integrated calibrated LM-63 candela curves for all luminaires',
          'Tuned evening sunset ambient exterior sky through glass wall',
          'Client reviewing 3 active revision tickets on walnut grain saturation'
        ]
      }
    ]
  },
  'VIZTR-771': {
    projectId: 'VIZTR-771',
    projectName: 'Nordic Monolith Residence - 8K Photorealistic Stills',
    totalDurationDays: 28,
    totalGpuHours: 210.0,
    fpsLabel: '8K Print Master TIFF Vault',
    frames: [
      {
        id: 'nordic-frame-1',
        stageNumber: 1,
        stageName: 'Stage 01: Topography LIDAR & Concrete Formwork',
        stageCategory: 'Terrain & Ingestion',
        timestamp: 'Jan 15, 2026 · 11:20 CET',
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
        renderEngine: 'Rhino 8 NURBS + LIDAR Fjord Mesh',
        cameraLens: '24mm Shift Lens',
        sampleCount: '1:1 Metric Elevation Grid',
        resolution: 'Vector Site CAD',
        supervisor: 'Snøhetta BIM Team',
        progressPercentage: 25,
        status: 'completed',
        notes: 'High-density drone LIDAR terrain mesh aligned with fjord water level and coastal rock contours.',
        keyChanges: [
          'Anchored building massing directly to coastal granite cliff geometry',
          'Simulated accurate sea-level tide elevation',
          'Constructed board-formed concrete retaining walls'
        ]
      },
      {
        id: 'nordic-frame-2',
        stageNumber: 2,
        stageName: 'Stage 02: Atmospheric Fog, Snow & Water Reflections',
        stageCategory: 'Atmospheric Physics',
        timestamp: 'Feb 04, 2026 · 15:40 CET',
        imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=85',
        renderEngine: 'Unreal Engine 5.5 Volumetric Scattering',
        cameraLens: '35mm Architectural Prime',
        sampleCount: '2,048 SPP Fog Scattering',
        resolution: '5120x2880 Atmospheric Proof',
        supervisor: 'Atmosphere & VFX Team',
        progressPercentage: 65,
        status: 'completed',
        notes: 'Simulated low-altitude winter sun, water wave micro-ripples, and volumetric coastal mist.',
        keyChanges: [
          'Physical water shader created with fjord salinity index',
          'Volumetric mist layer layered over water surface',
          'Warm 2400K fireplace hearth glow added to interior core'
        ]
      },
      {
        id: 'nordic-frame-3',
        stageNumber: 3,
        stageName: 'Stage 03: Final 8K Master Production & Archival Signoff',
        stageCategory: 'Archival Master Delivery',
        timestamp: 'Feb 20, 2026 · 14:00 CET',
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
        renderEngine: 'Lossless 8K Multi-Pass TIFF · ACEScg',
        cameraLens: '35mm Cine Master Prime',
        sampleCount: '8,192 SPP Supreme Clarity',
        resolution: '7680x4320 (8K Print Ready)',
        supervisor: 'Soren Lindqvist (Snøhetta)',
        progressPercentage: 100,
        status: 'master',
        notes: 'Commission signed off with zero revisions. Full commercial rights transferred and archived.',
        keyChanges: [
          '22 master 8K render passes delivered to client cloud vault',
          'Signed archival certificate and intellectual property license issued',
          'Master TIFF and high-bitrate video ProRes packages archived'
        ]
      }
    ]
  }
};

interface ProjectTimelapsesProps {
  projectId?: string;
  projectName?: string;
  className?: string;
}

export default function ProjectTimelapses({
  projectId = 'VIZTR-882',
  projectName = 'The Apex Tower',
  className = '',
}: ProjectTimelapsesProps) {
  const { showToast } = useAppStore();

  const timelapseData = PROJECT_TIMELAPSE_COLLECTIONS[projectId] || PROJECT_TIMELAPSE_COLLECTIONS['VIZTR-882'];
  const frames = timelapseData.frames;

  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 0.5x, 1x, 2x
  const [showTechnicalHUD, setShowTechnicalHUD] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeFrame = frames[currentFrameIndex] || frames[0];

  // Auto-play interval
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.max(1000, 2400 / playbackSpeed);
      timerRef.current = setInterval(() => {
        setCurrentFrameIndex((prevIndex) => {
          if (prevIndex >= frames.length - 1) {
            if (isLooping) {
              return 0;
            } else {
              setIsPlaying(false);
              return prevIndex;
            }
          }
          return prevIndex + 1;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, isLooping, frames.length]);

  const [prevProjectId, setPrevProjectId] = useState<string>(projectId);

  if (prevProjectId !== projectId) {
    setPrevProjectId(projectId);
    setCurrentFrameIndex(0);
    setIsPlaying(false);
  }

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentFrameIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentFrameIndex((prev) => Math.min(frames.length - 1, prev + 1));
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === 'Home') {
        e.preventDefault();
        setCurrentFrameIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setCurrentFrameIndex(frames.length - 1);
      }
    },
    [frames.length]
  );

  const handleTogglePlay = () => {
    setIsPlaying((prev) => {
      const next = !prev;
      if (next && currentFrameIndex === frames.length - 1) {
        setCurrentFrameIndex(0);
      }
      showToast(next ? 'Timelapse auto-playback started.' : 'Timelapse playback paused.', 'info');
      return next;
    });
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    setCurrentFrameIndex((prev) => Math.max(0, prev - 1));
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setCurrentFrameIndex((prev) => Math.min(frames.length - 1, prev + 1));
  };

  const handleDownloadSnapshot = () => {
    showToast(
      `Archived progress snapshot downloaded: ${activeFrame.stageName} (${activeFrame.resolution})`,
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
      id={`project-timelapses-${projectId}`}
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={`Project Timelapse Viewer for ${projectName}`}
      className={`p-6 rounded-2xl bg-[#141416] border border-[#27272A] space-y-6 shadow-2xl relative overflow-hidden focus:outline-none focus:ring-1 focus:ring-[#3ECF8E]/50 ${
        isFullscreen ? 'p-8 bg-[#09090B] h-screen overflow-y-auto' : ''
      } ${className}`}
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#27272A] pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              role="status"
              aria-label="Component category: Chronological Production Timelapses"
              className="px-2.5 py-0.5 rounded-md bg-[#09090B] border border-[#3ECF8E]/40 text-[10px] font-mono font-bold uppercase text-[#3ECF8E] flex items-center gap-1.5"
            >
              <Film className="w-3 h-3 text-[#3ECF8E]" />
              <span>Project Timelapses & Render Progression</span>
            </span>
            <span
              role="status"
              aria-label={`Total pipeline duration: ${timelapseData.totalDurationDays} calendar days`}
              className="px-2 py-0.5 rounded bg-[#1C1C1F] border border-[#27272A] text-[10px] font-mono text-[#A1A1AA]"
            >
              {timelapseData.totalDurationDays} Days Pipeline
            </span>
            <span
              role="status"
              aria-label={`GPU Compute: ${timelapseData.totalGpuHours} cloud hours`}
              className="px-2 py-0.5 rounded bg-[#1C1C1F] border border-[#27272A] text-[10px] font-mono text-[#3ECF8E]"
            >
              ⚡ {timelapseData.totalGpuHours} GPU Hours
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold font-display text-white flex items-center gap-2">
            Archived Production Milestones & Visual Timelapse
          </h3>
          <p className="text-xs text-[#A1A1AA] max-w-2xl">
            Scrub through high-resolution chronological progress captures—from initial CAD wireframe massing and clay perspective lock to 8K multi-pass ray tracing. Use keyboard arrow keys or the slider controls below.
          </p>
        </div>

        {/* QUICK CONTROLS BAR */}
        <div className="flex items-center gap-2">
          {/* HUD TOGGLE */}
          <button
            type="button"
            onClick={() => setShowTechnicalHUD((prev) => !prev)}
            aria-label={showTechnicalHUD ? 'Hide technical HUD metadata overlay' : 'Show technical HUD metadata overlay'}
            aria-pressed={showTechnicalHUD}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showTechnicalHUD
                ? 'bg-[#18181B] border-[#3ECF8E]/40 text-[#3ECF8E]'
                : 'bg-[#18181B] border-[#27272A] text-[#71717A] hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showTechnicalHUD ? 'HUD Active' : 'HUD Hidden'}</span>
          </button>

          {/* DOWNLOAD SNAPSHOT */}
          <button
            type="button"
            onClick={handleDownloadSnapshot}
            aria-label={`Download snapshot of current frame: ${activeFrame.stageName}`}
            className="p-2 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Download frame snapshot"
          >
            <Download className="w-4 h-4 text-[#3ECF8E]" />
          </button>

          {/* FULLSCREEN TOGGLE */}
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen timelapse mode' : 'Enter fullscreen timelapse mode'}
            aria-pressed={isFullscreen}
            className="p-2 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Toggle fullscreen mode"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* MAIN TIMELAPSE SCREEN & CANVAS VIEWER */}
      <div
        id="timelapse-canvas-display"
        className="relative rounded-2xl overflow-hidden bg-black border border-[#27272A] aspect-[16/9] sm:aspect-[21/9] shadow-2xl group"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFrame.id}
            initial={{ opacity: 0.4, scale: 1.01 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.4 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative w-full h-full"
          >
            <Image
              src={activeFrame.imageUrl}
              alt={`${projectName} - ${activeFrame.stageName}`}
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* SUBTLE VIGNETTE GRADIENT */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />

        {/* TOP STATUS BAR OVERLAY */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2">
            <span
              role="status"
              aria-label={`Current milestone: Stage ${activeFrame.stageNumber} of ${frames.length}`}
              className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-xs font-mono font-bold text-white shadow-md flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-[#3ECF8E] animate-pulse" />
              <span>
                STAGE 0{activeFrame.stageNumber} / 0{frames.length}
              </span>
            </span>

            <span
              role="status"
              aria-label={`Category: ${activeFrame.stageCategory}`}
              className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono text-[#A1A1AA] hidden sm:inline-block"
            >
              {activeFrame.stageCategory}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              role="status"
              aria-label={`Resolution: ${activeFrame.resolution}`}
              className="px-2 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[11px] font-mono text-[#3ECF8E] font-bold"
            >
              {activeFrame.resolution}
            </span>
            <span
              role="status"
              aria-label={`Timestamp: ${activeFrame.timestamp}`}
              className="px-2 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[11px] font-mono text-zinc-300 hidden md:inline-block"
            >
              {activeFrame.timestamp}
            </span>
          </div>
        </div>

        {/* OPTIONAL TECHNICAL HUD METADATA (TOGGLEABLE) */}
        {showTechnicalHUD && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono text-white shadow-xl pointer-events-none"
          >
            <div className="space-y-0.5">
              <div className="text-[10px] text-[#71717A] uppercase font-bold flex items-center gap-1">
                <Cpu className="w-3 h-3 text-[#3ECF8E]" />
                <span>Render Pipeline / Engine</span>
              </div>
              <div className="text-white font-bold truncate text-[11px]">{activeFrame.renderEngine}</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[10px] text-[#71717A] uppercase font-bold flex items-center gap-1">
                <Camera className="w-3 h-3 text-[#3ECF8E]" />
                <span>Lens Specification</span>
              </div>
              <div className="text-white font-bold truncate text-[11px]">{activeFrame.cameraLens}</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[10px] text-[#71717A] uppercase font-bold flex items-center gap-1">
                <Gauge className="w-3 h-3 text-[#3ECF8E]" />
                <span>Sample Count & Precision</span>
              </div>
              <div className="text-white font-bold truncate text-[11px]">{activeFrame.sampleCount}</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[10px] text-[#71717A] uppercase font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#3ECF8E]" />
                <span>Supervising Architect</span>
              </div>
              <div className="text-white font-bold truncate text-[11px]">{activeFrame.supervisor}</div>
            </div>
          </motion.div>
        )}

        {/* LEFT / RIGHT QUICK CLICK OVERLAYS */}
        <button
          type="button"
          onClick={handleStepBackward}
          disabled={currentFrameIndex === 0}
          aria-label="Previous timelapse progress frame"
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-black border border-white/10 text-white disabled:opacity-0 transition-all opacity-0 group-hover:opacity-100 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={handleStepForward}
          disabled={currentFrameIndex === frames.length - 1}
          aria-label="Next timelapse progress frame"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-black border border-white/10 text-white disabled:opacity-0 transition-all opacity-0 group-hover:opacity-100 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* SCRUBBABLE TIMELINE SLIDER & PLAYBACK CONTROLLER */}
      <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-4">
        {/* TIMELINE RANGE SLIDER */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[#A1A1AA] uppercase font-bold text-[11px]">Milestone Scrubbing</span>
              <span className="text-white font-bold">{activeFrame.stageName}</span>
            </div>
            <div className="text-[#71717A] text-[11px]">
              Frame {currentFrameIndex + 1} of {frames.length} ({Math.round(((currentFrameIndex + 1) / frames.length) * 100)}%)
            </div>
          </div>

          <div className="relative flex items-center">
            <input
              type="range"
              min={0}
              max={frames.length - 1}
              step={1}
              value={currentFrameIndex}
              onChange={(e) => {
                setIsPlaying(false);
                setCurrentFrameIndex(parseInt(e.target.value, 10));
              }}
              aria-label="Timeline progress frame scrub slider"
              aria-valuenow={currentFrameIndex + 1}
              aria-valuemin={1}
              aria-valuemax={frames.length}
              aria-valuetext={activeFrame.stageName}
              className="w-full h-2 rounded-lg bg-[#18181B] accent-[#3ECF8E] cursor-pointer"
            />
          </div>

          {/* PROGRESS BAR UNDERNEATH */}
          <div
            role="progressbar"
            aria-valuenow={activeFrame.progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Pipeline milestone completion: ${activeFrame.progressPercentage}%`}
            className="w-full h-1 rounded-full bg-[#18181B] overflow-hidden"
          >
            <div
              className="h-full bg-[#3ECF8E] transition-all duration-300"
              style={{ width: `${activeFrame.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* PLAYBACK CONTROL BUTTONS BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1 border-t border-[#27272A]/70">
          {/* PLAY / PAUSE / STEP CONTROLS */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
            <button
              type="button"
              onClick={handleStepBackward}
              disabled={currentFrameIndex === 0}
              aria-label="Step to previous frame"
              className="p-2 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Previous frame (Left Arrow)"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleTogglePlay}
              aria-label={isPlaying ? 'Pause timelapse playback' : 'Start timelapse auto-playback'}
              aria-pressed={isPlaying}
              className="px-4 py-2 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black" />}
              <span>{isPlaying ? 'Pause' : 'Play Timelapse'}</span>
            </button>

            <button
              type="button"
              onClick={handleStepForward}
              disabled={currentFrameIndex === frames.length - 1}
              aria-label="Step to next frame"
              className="p-2 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Next frame (Right Arrow)"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentFrameIndex(0);
                setIsPlaying(false);
                showToast('Reset timelapse to Stage 01.', 'info');
              }}
              aria-label="Reset timelapse to initial stage"
              className="p-2 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#71717A] hover:text-white transition-colors cursor-pointer"
              title="Reset to beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* SPEED & LOOP OPTIONS */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end text-xs font-mono">
            <span className="text-[#71717A] text-[11px]">Playback Speed:</span>
            {[0.5, 1, 2].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => setPlaybackSpeed(spd)}
                aria-label={`Set playback speed to ${spd}x`}
                aria-pressed={playbackSpeed === spd}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
                  playbackSpeed === spd
                    ? 'bg-[#3ECF8E] text-black border-[#3ECF8E]'
                    : 'bg-[#18181B] text-[#A1A1AA] border-[#27272A] hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsLooping((prev) => !prev)}
              aria-label={isLooping ? 'Disable continuous looping' : 'Enable continuous looping'}
              aria-pressed={isLooping}
              className={`ml-2 px-2.5 py-1 rounded-md text-[11px] border font-bold transition-colors cursor-pointer ${
                isLooping
                  ? 'bg-[#18181B] border-[#3ECF8E]/40 text-[#3ECF8E]'
                  : 'bg-[#18181B] border-[#27272A] text-[#71717A]'
              }`}
            >
              Loop: {isLooping ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* CHRONOLOGICAL THUMBNAIL STRIP & STAGE SELECTOR */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#A1A1AA] uppercase font-bold text-[11px] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#3ECF8E]" />
            <span>Milestone Capture Sequence ({frames.length} Stages)</span>
          </span>
          <span className="text-[10px] text-[#71717A]">Click any thumbnail to jump to that milestone</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {frames.map((frame, idx) => {
            const isSelected = idx === currentFrameIndex;
            return (
              <button
                key={frame.id}
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentFrameIndex(idx);
                }}
                aria-label={`Jump to ${frame.stageName}, Progress: ${frame.progressPercentage}%`}
                aria-pressed={isSelected}
                className={`p-2 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#18181B] border-[#3ECF8E] ring-1 ring-[#3ECF8E] shadow-lg'
                    : 'bg-[#141416] border-[#27272A] hover:border-[#3F3F46] opacity-80 hover:opacity-100'
                }`}
              >
                <div className="relative h-16 rounded-lg overflow-hidden bg-black">
                  <Image
                    src={frame.imageUrl}
                    alt={frame.stageName}
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-black/80 text-[9px] font-mono text-white">
                    0{frame.stageNumber}
                  </div>
                  {isSelected && (
                    <div className="absolute inset-0 border-2 border-[#3ECF8E] rounded-lg pointer-events-none" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-mono font-bold text-white truncate">
                    Stage 0{frame.stageNumber}
                  </div>
                  <div className="text-[9px] font-mono text-[#71717A] truncate">
                    {frame.stageCategory}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* DETAILED ACTIVE STAGE NOTES & CHANGELOG CARD */}
      <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#27272A] pb-3">
          <div className="space-y-0.5">
            <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
              <span>{activeFrame.stageName}</span>
              <span className="text-[#3ECF8E]">•</span>
              <span className="text-[#71717A] text-[11px]">{activeFrame.timestamp}</span>
            </div>
            <p className="text-xs text-[#A1A1AA]">{activeFrame.notes}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              role="status"
              aria-label={`Milestone status: ${activeFrame.status}`}
              className="px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold uppercase"
            >
              ✓ Verified Milestone
            </span>
          </div>
        </div>

        {/* KEY ARCHITECTURAL MODIFICATIONS */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono uppercase font-bold text-[#71717A]">
            Milestone Key Changes & Architectural Parameters:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs font-mono">
            {activeFrame.keyChanges.map((change, cIdx) => (
              <div
                key={cIdx}
                className="p-2 rounded-lg bg-[#141416] border border-[#27272A] text-zinc-300 flex items-start gap-2"
              >
                <span className="text-[#3ECF8E] font-bold mt-0.5">•</span>
                <span className="text-[11px] leading-snug">{change}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
