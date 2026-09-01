'use client';

import React, { useRef, useState } from 'react';
import {
  LayoutGrid,
  Move,
  Wand2,
  Link2,
  Save,
  CheckCircle2,
  Crosshair,
  MapPin,
  Image as ImageIcon,
} from 'lucide-react';
import type { TourRoom } from '@/data/tour-config';

interface CanvasTabProps {
  rooms: TourRoom[];
  onUpdateRoom: (roomId: string, x: number, y: number) => void;
  onAutoLink: () => void;
  onSave: () => void;
  saved: boolean;
}

const CANVAS_W = 1200;
const CANVAS_H = 700;
const COLS = 5;

export default function CanvasTab({ rooms, onUpdateRoom, onAutoLink, onSave, saved }: CanvasTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [spaceDown, setSpaceDown] = useState(false);
  const panStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        setSpaceDown(true);
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceDown(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const getInitialPos = (idx: number) => {
    const col = idx % COLS;
    const row = Math.floor(idx / COLS);
    return { x: 80 + col * 220, y: 80 + row * 180 };
  };

  const autoArrange = () => {
    rooms.forEach((r, idx) => {
      const { x, y } = getInitialPos(idx);
      onUpdateRoom(r.id, x, y);
    });
  };

  const onCardPointerDown = (e: React.PointerEvent, id: string) => {
    if (spaceDown) return;
    e.stopPropagation();
    setDragId(id);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (isPanning && panStart.current) {
      setPan({
        x: panStart.current.panX + (e.clientX - panStart.current.x),
        y: panStart.current.panY + (e.clientY - panStart.current.y),
      });
      return;
    }
    if (!dragId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(CANVAS_W - 180, e.clientX - rect.left - pan.x - 80));
    const y = Math.max(0, Math.min(CANVAS_H - 130, e.clientY - rect.top - pan.y - 60));
    onUpdateRoom(dragId, x, y);
  };

  const onPointerUp = () => {
    setDragId(null);
    setIsPanning(false);
    panStart.current = null;
  };

  const onCanvasPointerDown = (e: React.PointerEvent) => {
    if (!spaceDown) return;
    e.preventDefault();
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  };

  return (
    <div className="flex-1 flex flex-col bg-[#09090B] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#27272A] bg-[#0c0c0f]">
        <h2 className="text-sm font-mono font-bold text-[#3ECF8E] flex items-center gap-2">
          <LayoutGrid className="w-4 h-4" />
          Canvas — Tour Map
        </h2>
        <div className="flex items-center gap-1.5">
          {saved && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-[#3ECF8E]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Saved
            </span>
          )}
          <button
            type="button"
            onClick={autoArrange}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#18181B] hover:bg-[#27272A] text-[10px] font-mono text-white"
            title="Auto-arrange"
          >
            <Wand2 className="w-3 h-3" />
            Auto Arrange
          </button>
          <button
            type="button"
            onClick={onAutoLink}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#18181B] hover:bg-[#27272A] text-[10px] font-mono text-white"
            title="Create hotspot links between scenes within 200m"
          >
            <Link2 className="w-3 h-3" />
            Auto-link by GPS
          </button>
          <button
            type="button"
            onClick={onSave}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#3ECF8E] hover:bg-[#34b876] text-black text-[10px] font-bold font-mono"
          >
            <Save className="w-3 h-3" />
            Save Layout
          </button>
        </div>
      </div>

      <div className="px-4 py-1.5 text-[10px] font-mono text-[#71717A] border-b border-[#27272A]">
        Tip: Hold <kbd className="px-1 bg-[#27272A] rounded">Space</kbd> + drag to pan · Click + drag a card to move
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div
          ref={containerRef}
          onPointerDown={onCanvasPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className={`relative w-full h-full overflow-hidden ${
            spaceDown ? 'cursor-grab' : isPanning ? 'cursor-grabbing' : 'cursor-default'
          }`}
          style={{
            backgroundImage: 'radial-gradient(circle, #18181B 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        >
          <div
            className="absolute"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px)`,
              width: CANVAS_W,
              height: CANVAS_H,
              left: 0,
              top: 0,
            }}
          >
            {/* Connection lines between scenes with both lat & lng */}
            <svg className="absolute inset-0 pointer-events-none" width={CANVAS_W} height={CANVAS_H}>
              {rooms
                .filter((r) => typeof (r as any).lat === 'number' && typeof (r as any).lng === 'number')
                .map((r) => {
                  const others = rooms.filter(
                    (o) => o.id !== r.id && typeof (o as any).lat === 'number' && typeof (o as any).lng === 'number',
                  );
                  return others.map((o) => {
                    const dx = ((o as any).lng - (r as any).lng) * 10000;
                    const dy = ((r as any).lat - (o as any).lat) * 10000;
                    if (Math.sqrt(dx * dx + dy * dy) > 200) return null;
                    return (
                      <line
                        key={`${r.id}-${o.id}`}
                        x1={(r as any).floorPlanX ?? 80}
                        y1={(r as any).floorPlanY ?? 80}
                        x2={(o as any).floorPlanX ?? 80}
                        y2={(o as any).floorPlanY ?? 80}
                        stroke="#3ECF8E"
                        strokeOpacity={0.4}
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                      />
                    );
                  });
                })}
            </svg>

            {rooms.map((r, idx) => {
              const x = (r as any).floorPlanX ?? getInitialPos(idx).x;
              const y = (r as any).floorPlanY ?? getInitialPos(idx).y;
              return (
                <div
                  key={r.id}
                  onPointerDown={(e) => onCardPointerDown(e, r.id)}
                  className={`absolute w-44 rounded-lg border bg-[#0c0c0f] overflow-hidden cursor-move shadow-xl select-none ${
                    dragId === r.id
                      ? 'border-[#3ECF8E] shadow-[0_0_20px_rgba(62,207,142,0.4)]'
                      : 'border-[#27272A]'
                  }`}
                  style={{ left: x, top: y, touchAction: 'none' }}
                >
                  <div className="relative w-full h-20 bg-[#18181B]">
                    {r.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.thumbnailUrl} alt={r.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-[#27272A]" />
                      </div>
                    )}
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-mono text-white">
                      {String(idx).padStart(2, '0')}
                    </div>
                    {typeof (r as any).lat === 'number' && (
                      <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-[#3ECF8E] text-[9px] font-mono text-black flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" />
                        GPS
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <div className="text-[11px] font-mono text-white truncate">{r.name}</div>
                    <div className="text-[9px] font-mono text-[#71717A]">
                      {r.defaultHotspots.length} hotspot{r.defaultHotspots.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
