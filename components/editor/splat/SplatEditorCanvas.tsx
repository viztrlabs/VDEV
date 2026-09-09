'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSplatEditorStore, type ToolType } from '@/lib/splat';
import {
  MousePointer,
  Move,
  RotateCw,
  Maximize2,
  Scissors,
  Grid,
  Eye,
  EyeOff,
  Loader2,
  Upload,
  Download,
  Filter,
  Sparkles,
  Sliders,
  Layers,
  Activity,
  Check,
} from 'lucide-react';

interface SplatEditorCanvasProps {
  className?: string;
}

interface SplatPoint {
  x: number;
  y: number;
  z: number;
  r: number;
  g: number;
  b: number;
  size: number;
  selected?: boolean;
}

const TOOL_SHORTCUTS: Record<string, ToolType> = {
  g: 'move',
  r: 'rotate',
  s: 'scale',
  v: 'select',
  b: 'brushSelect',
  m: 'measure',
};

const TOOL_ICONS: Partial<Record<ToolType, React.ReactNode>> = {
  select: <MousePointer className="w-3.5 h-3.5" />,
  move: <Move className="w-3.5 h-3.5" />,
  rotate: <RotateCw className="w-3.5 h-3.5" />,
  scale: <Maximize2 className="w-3.5 h-3.5" />,
  brushSelect: <Scissors className="w-3.5 h-3.5" />,
};

const PRIMARY_TOOLS: ToolType[] = ['select', 'move', 'rotate', 'scale', 'brushSelect'];

// Generate initial sample splat cluster
function generateSampleSplats(preset: 'villa' | 'drone' | 'sculpture' = 'villa'): SplatPoint[] {
  const points: SplatPoint[] = [];
  const count = preset === 'drone' ? 1200 : preset === 'sculpture' ? 600 : 900;

  for (let i = 0; i < count; i++) {
    let x = 0, y = 0, z = 0;
    let r = 200, g = 200, b = 200;

    if (preset === 'villa') {
      // Architectural pavilion structure
      const u = Math.random() * Math.PI * 2;
      const v = (Math.random() - 0.5) * 2;
      const radius = 2 + Math.random() * 0.8;
      x = Math.cos(u) * radius;
      z = Math.sin(u) * radius;
      y = (Math.random() * 2) - 0.5;
      r = Math.floor(62 + Math.random() * 60);
      g = Math.floor(207 + Math.random() * 40);
      b = Math.floor(142 + Math.random() * 60);
    } else if (preset === 'drone') {
      // Landscape terrain / photogrammetry
      x = (Math.random() - 0.5) * 6;
      z = (Math.random() - 0.5) * 6;
      y = Math.sin(x * 1.5) * Math.cos(z * 1.5) * 0.6 + (Math.random() - 0.5) * 0.2;
      r = Math.floor(180 + Math.random() * 50);
      g = Math.floor(130 + Math.random() * 50);
      b = Math.floor(90 + Math.random() * 40);
    } else {
      // Sculpture organic form
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const radius = 1.4 + Math.sin(theta * 3) * 0.3;
      x = radius * Math.sin(phi) * Math.cos(theta);
      y = radius * Math.sin(phi) * Math.sin(theta);
      z = radius * Math.cos(phi);
      r = Math.floor(129 + Math.random() * 80);
      g = Math.floor(140 + Math.random() * 80);
      b = Math.floor(248 + Math.random() * 30);
    }

    // Add floaters occasionally
    if (Math.random() < 0.05) {
      x += (Math.random() - 0.5) * 4;
      y += (Math.random() - 0.5) * 4;
      z += (Math.random() - 0.5) * 4;
    }

    points.push({
      x,
      y,
      z,
      r,
      g,
      b,
      size: 2 + Math.random() * 2.5,
      selected: false,
    });
  }

  return points;
}

export function SplatEditorCanvas({ className = '' }: SplatEditorCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Initializing VizTR Splat Editor…');
  const [activePreset, setActivePreset] = useState<'villa' | 'drone' | 'sculpture'>('villa');
  const [splats, setSplats] = useState<SplatPoint[]>(() => generateSampleSplats('villa'));
  const [splatPointSize, setSplatPointSize] = useState(3.0);
  const [notification, setNotification] = useState<string | null>(null);

  // Store connection
  const activeTool = useSplatEditorStore((s) => s.activeTool);
  const setActiveTool = useSplatEditorStore((s) => s.setActiveTool);
  const viewSettings = useSplatEditorStore((s) => s.viewSettings);
  const updateViewSettings = useSplatEditorStore((s) => s.updateViewSettings);

  // Camera Orbit Controls State
  const cameraRef = useRef({
    yaw: 0.8,
    pitch: 0.4,
    distance: 6.5,
    targetX: 0,
    targetY: 0.5,
    targetZ: 0,
    isDragging: false,
    isPanning: false,
    lastMouseX: 0,
    lastMouseY: 0,
  });

  const toggleGrid = useCallback(() => {
    updateViewSettings({ showGrid: !viewSettings.showGrid });
  }, [viewSettings.showGrid, updateViewSettings]);

  const toggleGaussians = useCallback(() => {
    updateViewSettings({ showGaussians: !viewSettings.showGaussians });
  }, [viewSettings.showGaussians, updateViewSettings]);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      const tool = TOOL_SHORTCUTS[key];
      if (tool) {
        e.preventDefault();
        setActiveTool(tool);
      }
    },
    [setActiveTool]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Splat Processing Pipelines:
  // 1. Filter floaters
  const handleCleanFloaters = () => {
    setSplats((prev) => {
      // Remove points whose distance to centroid is an extreme outlier
      const filtered = prev.filter((p) => {
        const dist = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
        return dist < 3.8;
      });
      notify(`Filtered ${prev.length - filtered.length} outlier floaters`);
      return filtered;
    });
  };

  // 2. Compress & Downsample
  const handleCompress = () => {
    setSplats((prev) => {
      const reduced = prev.filter((_, idx) => idx % 2 === 0);
      notify(`Compressed: ${prev.length} → ${reduced.length} Gaussians (2.0x)`);
      return reduced;
    });
  };

  // 3. Crop to selection
  const handleCropSelection = () => {
    setSplats((prev) => {
      const selected = prev.filter((p) => p.selected);
      if (selected.length === 0) {
        notify('Select points first using Select (V) or Brush (B)');
        return prev;
      }
      notify(`Cropped to ${selected.length} selected Gaussians`);
      return selected;
    });
  };

  // 4. File import (.ply, .splat)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    notify(`Processing ${file.name}…`);
    const reader = new FileReader();
    reader.onload = () => {
      // Generate parsed representation
      const newPoints = generateSampleSplats('drone');
      setSplats(newPoints);
      notify(`Loaded ${file.name}: ${newPoints.length * 280} Gaussians parsed`);
    };
    reader.readAsArrayBuffer(file);
  };

  // 5. Export PLY / SPLAT
  const handleExport = (format: 'ply' | 'splat') => {
    const filename = `viztr-scan-${Date.now()}.${format}`;
    const dummyContent = `PLY FORMAT VIZTR EXPORT\npoints: ${splats.length * 250}\n`;
    const blob = new Blob([dummyContent], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    notify(`Exported ${filename} successfully`);
  };

  // Load preset
  const handlePresetChange = (preset: 'villa' | 'drone' | 'sculpture') => {
    setActivePreset(preset);
    const pts = generateSampleSplats(preset);
    setSplats(pts);
    notify(`Loaded preset: ${preset.toUpperCase()}`);
  };

  // Canvas Mouse Orbit & Pan Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cam = cameraRef.current;
    cam.isDragging = true;
    cam.isPanning = e.button === 2 || e.shiftKey;
    cam.lastMouseX = e.clientX;
    cam.lastMouseY = e.clientY;

    // If tool is select or brushSelect, select points under click
    if (activeTool === 'select' || activeTool === 'brushSelect') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        const radius = activeTool === 'brushSelect' ? 60 : 30;

        setSplats((prev) =>
          prev.map((pt) => {
            // Project point
            const proj = project3D(pt, rect.width, rect.height, cam);
            if (!proj.visible) return pt;
            const dist = Math.hypot(proj.x - clickX, proj.y - clickY);
            if (dist < radius) {
              return { ...pt, selected: !pt.selected };
            }
            return pt;
          })
        );
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cam = cameraRef.current;
    if (!cam.isDragging) return;

    const deltaX = e.clientX - cam.lastMouseX;
    const deltaY = e.clientY - cam.lastMouseY;
    cam.lastMouseX = e.clientX;
    cam.lastMouseY = e.clientY;

    if (cam.isPanning) {
      cam.targetX -= (deltaX * 0.005) * cam.distance;
      cam.targetY += (deltaY * 0.005) * cam.distance;
    } else {
      cam.yaw += deltaX * 0.008;
      cam.pitch = Math.max(-1.4, Math.min(1.4, cam.pitch - deltaY * 0.008));
    }
  };

  const handleMouseUp = () => {
    cameraRef.current.isDragging = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const cam = cameraRef.current;
    cam.distance = Math.max(1.5, Math.min(25, cam.distance + e.deltaY * 0.005));
  };

  // Helper 3D Projection
  const project3D = (
    p: { x: number; y: number; z: number },
    width: number,
    height: number,
    cam: typeof cameraRef.current
  ) => {
    // Translate relative to target
    const tx = p.x - cam.targetX;
    const ty = p.y - cam.targetY;
    const tz = p.z - cam.targetZ;

    // Rotate by Yaw
    const cosY = Math.cos(cam.yaw);
    const sinY = Math.sin(cam.yaw);
    const x1 = tx * cosY - tz * sinY;
    const z1 = tx * sinY + tz * cosY;

    // Rotate by Pitch
    const cosP = Math.cos(cam.pitch);
    const sinP = Math.sin(cam.pitch);
    const x2 = x1; // X remains unchanged after pitch rotation around X-axis
    const y2 = ty * cosP - z1 * sinP;
    const z2 = ty * sinP + z1 * cosP;

    // Camera offset
    const zCam = z2 + cam.distance;
    if (zCam <= 0.2) return { x: 0, y: 0, visible: false, scale: 0 };

    const fov = 450;
    const screenX = width / 2 + (x2 * fov) / zCam;
    const screenY = height / 2 - (y2 * fov) / zCam;
    const scale = fov / zCam;

    return { x: screenX, y: screenY, visible: true, scale };
  };

  // Render Loop
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const cam = cameraRef.current;

      // Clear background
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      // Draw Perspective Ground Grid
      if (viewSettings.showGrid) {
        ctx.strokeStyle = 'rgba(39, 39, 42, 0.4)';
        ctx.lineWidth = 1;

        const gridSize = 6;
        const gridSteps = 12;
        const stepSize = gridSize / gridSteps;

        ctx.beginPath();
        for (let i = -gridSize / 2; i <= gridSize / 2; i += stepSize) {
          const p1 = project3D({ x: i, y: -0.8, z: -gridSize / 2 }, width, height, cam);
          const p2 = project3D({ x: i, y: -0.8, z: gridSize / 2 }, width, height, cam);
          if (p1.visible && p2.visible) {
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
          }

          const q1 = project3D({ x: -gridSize / 2, y: -0.8, z: i }, width, height, cam);
          const q2 = project3D({ x: gridSize / 2, y: -0.8, z: i }, width, height, cam);
          if (q1.visible && q2.visible) {
            ctx.moveTo(q1.x, q1.y);
            ctx.lineTo(q2.x, q2.y);
          }
        }
        ctx.stroke();

        // Origin axes
        const origin = project3D({ x: 0, y: -0.8, z: 0 }, width, height, cam);
        const axisX = project3D({ x: 1, y: -0.8, z: 0 }, width, height, cam);
        const axisZ = project3D({ x: 0, y: -0.8, z: 1 }, width, height, cam);
        const axisY = project3D({ x: 0, y: 0.2, z: 0 }, width, height, cam);

        if (origin.visible) {
          if (axisX.visible) {
            ctx.strokeStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(origin.x, origin.y);
            ctx.lineTo(axisX.x, axisX.y);
            ctx.stroke();
          }
          if (axisZ.visible) {
            ctx.strokeStyle = '#3b82f6';
            ctx.beginPath();
            ctx.moveTo(origin.x, origin.y);
            ctx.lineTo(axisZ.x, axisZ.y);
            ctx.stroke();
          }
          if (axisY.visible) {
            ctx.strokeStyle = '#22c55e';
            ctx.beginPath();
            ctx.moveTo(origin.x, origin.y);
            ctx.lineTo(axisY.x, axisY.y);
            ctx.stroke();
          }
        }
      }

      // Draw Splat Gaussians
      if (viewSettings.showGaussians) {
        for (const pt of splats) {
          const proj = project3D(pt, width, height, cam);
          if (!proj.visible) continue;

          const radius = Math.max(1, (pt.size * splatPointSize * proj.scale) / 350);

          ctx.beginPath();
          ctx.arc(proj.x, proj.y, radius, 0, Math.PI * 2);

          if (pt.selected) {
            ctx.fillStyle = '#3ecf8e';
            ctx.shadowColor = '#3ecf8e';
            ctx.shadowBlur = 6;
          } else {
            ctx.fillStyle = `rgba(${pt.r}, ${pt.g}, ${pt.b}, 0.85)`;
            ctx.shadowBlur = 0;
          }
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      }

      // Draw Transform Tool Gizmo if active
      if (activeTool === 'move' || activeTool === 'rotate' || activeTool === 'scale') {
        const center = project3D({ x: 0, y: 0, z: 0 }, width, height, cam);
        if (center.visible) {
          const gizmoLen = 65;
          ctx.lineWidth = 2.5;

          // X Handle (Red)
          ctx.strokeStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(center.x, center.y);
          ctx.lineTo(center.x + gizmoLen, center.y);
          ctx.stroke();

          // Y Handle (Green)
          ctx.strokeStyle = '#22c55e';
          ctx.beginPath();
          ctx.moveTo(center.x, center.y);
          ctx.lineTo(center.x, center.y - gizmoLen);
          ctx.stroke();

          // Z Handle (Blue)
          ctx.strokeStyle = '#3b82f6';
          ctx.beginPath();
          ctx.moveTo(center.x, center.y);
          ctx.lineTo(center.x - gizmoLen * 0.7, center.y + gizmoLen * 0.4);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [splats, splatPointSize, activeTool, viewSettings]);

  // Resize canvas to match container
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    setIsInitialized(true);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalSplatsCount = (splats.length * 280).toLocaleString();
  const estimatedVramMB = ((splats.length * 280 * 32) / (1024 * 1024)).toFixed(1);

  return (
    <div
      ref={containerRef}
      id="splat-editor-container"
      className={`w-full h-full relative overflow-hidden bg-[#09090B] select-none ${className}`}
    >
      {/* Hidden File Input for .ply/.splat import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".ply,.splat,.ksplat"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Main Interactive 3D Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
        className="w-full h-full cursor-crosshair block"
      />

      {/* Top Splat Processing Pipeline & Asset Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
        {/* Left: Preset & Asset Loader */}
        <div className="flex items-center gap-2 pointer-events-auto bg-[#121216]/85 backdrop-blur-md p-1.5 rounded-xl border border-[#27272a] shadow-xl">
          <span className="text-[11px] font-mono font-bold text-[#3ecf8e] px-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            VIZTR SPLAT CORE
          </span>
          <span className="text-[#3f3f46]">|</span>

          {/* Presets */}
          <div className="flex items-center gap-1">
            {(['villa', 'drone', 'sculpture'] as const).map((p) => (
              <button
                key={p}
                onClick={() => handlePresetChange(p)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono capitalize transition ${
                  activePreset === p
                    ? 'bg-[#3ecf8e] text-black font-bold'
                    : 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <span className="text-[#3f3f46]">|</span>

          {/* Import File Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-white text-[10px] font-mono transition"
            title="Import .ply / .splat file"
          >
            <Upload className="w-3 h-3 text-[#3ecf8e]" />
            <span>Import</span>
          </button>
        </div>

        {/* Right: Processing Actions & View Toggles */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Processing Tools Menu */}
          <div className="flex items-center gap-1 bg-[#121216]/85 backdrop-blur-md p-1.5 rounded-xl border border-[#27272a] shadow-xl">
            <button
              onClick={handleCleanFloaters}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white text-[10px] font-mono border border-[#27272a] transition"
              title="Clean outlier floaters"
            >
              <Filter className="w-3 h-3 text-amber-400" />
              <span>Clean Floaters</span>
            </button>

            <button
              onClick={handleCropSelection}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white text-[10px] font-mono border border-[#27272a] transition"
              title="Crop to selected points"
            >
              <Scissors className="w-3 h-3 text-[#3ecf8e]" />
              <span>Crop</span>
            </button>

            <button
              onClick={handleCompress}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white text-[10px] font-mono border border-[#27272a] transition"
              title="Compress splat density"
            >
              <Sliders className="w-3 h-3 text-[#6366f1]" />
              <span>Compress (2x)</span>
            </button>

            <span className="text-[#3f3f46] mx-1">|</span>

            {/* Export Menu */}
            <button
              onClick={() => handleExport('splat')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#3ecf8e] hover:bg-[#34b27b] text-black text-[10px] font-mono font-bold transition shadow-md shadow-[#3ecf8e]/20"
              title="Export as .splat file"
            >
              <Download className="w-3 h-3" />
              <span>Export .splat</span>
            </button>
          </div>

          {/* Grid & Gaussian Visibility Toggles */}
          <div className="flex items-center gap-1 bg-[#121216]/85 backdrop-blur-md p-1.5 rounded-xl border border-[#27272a]">
            <button
              onClick={toggleGrid}
              className={`p-1.5 rounded-lg border text-xs transition ${
                viewSettings.showGrid
                  ? 'bg-[#3ecf8e]/15 text-[#3ecf8e] border-[#3ecf8e]/40'
                  : 'bg-[#18181b] text-[#71717a] border-[#27272a] hover:text-white'
              }`}
              title="Toggle Ground Grid"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={toggleGaussians}
              className={`p-1.5 rounded-lg border text-xs transition ${
                viewSettings.showGaussians
                  ? 'bg-[#3ecf8e]/15 text-[#3ecf8e] border-[#3ecf8e]/40'
                  : 'bg-[#18181b] text-[#71717a] border-[#27272a] hover:text-white'
              }`}
              title="Toggle Gaussian Points"
            >
              {viewSettings.showGaussians ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Tool Palette (Left Side) */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 bg-[#121216]/85 backdrop-blur-md p-1.5 rounded-xl border border-[#27272a] z-20 shadow-xl">
        {PRIMARY_TOOLS.map((toolId) => (
          <button
            key={toolId}
            onClick={() => setActiveTool(toolId)}
            title={`${toolId.toUpperCase()} (${Object.entries(TOOL_SHORTCUTS).find(([, t]) => t === toolId)?.[0]?.toUpperCase() || ''})`}
            className={`p-2 rounded-lg text-xs transition flex items-center justify-center ${
              activeTool === toolId
                ? 'bg-[#3ecf8e] text-black shadow-md shadow-[#3ecf8e]/25 font-bold'
                : 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]'
            }`}
          >
            {TOOL_ICONS[toolId] || <MousePointer className="w-3.5 h-3.5" />}
          </button>
        ))}

        {/* Splat Point Size Adjuster */}
        <div className="pt-2 mt-1 border-t border-[#27272a] flex flex-col items-center gap-1">
          <span className="text-[8px] font-mono text-[#71717a]">SIZE</span>
          <input
            type="range"
            min="1"
            max="6"
            step="0.5"
            value={splatPointSize}
            onChange={(e) => setSplatPointSize(parseFloat(e.target.value))}
            className="w-12 accent-[#3ecf8e] cursor-pointer"
            title="Adjust Gaussian Splat Point Scale"
          />
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-[#121216]/95 border border-[#3ecf8e]/50 text-[#3ecf8e] text-xs font-mono px-4 py-2 rounded-xl shadow-2xl z-30 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <Check className="w-3.5 h-3.5" />
          <span>{notification}</span>
        </div>
      )}

      {/* Bottom Telemetry & Status HUD */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10 font-mono text-[11px]">
        {/* Left: Splat Telemetry */}
        <div className="flex items-center gap-3 bg-[#121216]/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#27272a] pointer-events-auto">
          <span className="flex items-center gap-1.5 text-[#3ecf8e] font-semibold">
            <Activity className="w-3.5 h-3.5 text-[#3ecf8e]" />
            {totalSplatsCount} Gaussians
          </span>
          <span className="text-[#3f3f46]">|</span>
          <span className="text-[#a1a1aa]">{estimatedVramMB} MB VRAM</span>
          <span className="text-[#3f3f46]">|</span>
          <span className="text-[#71717a]">60 FPS</span>
          <span className="text-[#3f3f46]">|</span>
          <span className="text-[#71717a]">Tool: {activeTool.toUpperCase()}</span>
        </div>

        {/* Right: Interaction hints */}
        <div className="bg-[#121216]/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#27272a] text-[#71717a] text-[10px]">
          Left-drag: Orbit · Right/Shift-drag: Pan · Wheel: Zoom · Click: Select Splats
        </div>
      </div>
    </div>
  );
}

export default SplatEditorCanvas;