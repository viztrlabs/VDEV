'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Info,
  Image,
  Video,
  Music,
  Package,
  Link,
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
} from 'lucide-react';
import { useTourStore } from '@/lib/tourClientStore';
import type { TourScene } from '@/lib/tourClientStore';

interface TourGraphViewProps {
  selectedRoomId: string;
  onSelectRoom: (id: string) => void;
  onClose: () => void;
}

interface RoomNode {
  room: TourScene;
  x: number;
  y: number;
}

export function TourGraphView({ selectedRoomId, onSelectRoom, onClose }: TourGraphViewProps) {
  const scenes = useTourStore((s) => s.scenes);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const nodes = useMemo<RoomNode[]>(() => {
    const count = scenes.length;
    if (count === 0) return [];

    const radius = Math.max(120, count * 30);
    return scenes.map((room, i) => {
      const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
      return {
        room,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      };
    });
  }, [scenes]);

  const connections = useMemo(() => {
    const conns: { from: RoomNode; to: RoomNode; type: string }[] = [];
    nodes.forEach((fromNode) => {
      fromNode.room.hotspots?.forEach((hs) => {
        if (hs.type === 'link' && hs.targetSceneId) {
          const toNode = nodes.find((n) => n.room.id === hs.targetSceneId);
          if (toNode) {
            conns.push({ from: fromNode, to: toNode, type: 'link' });
          }
        }
      });
    });
    return conns;
  }, [nodes]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.max(0.3, Math.min(3, z * delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).classList.contains('graph-bg')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  }, [offset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const getHotspotIcon = (type: string) => {
    switch (type) {
      case 'link': return Navigation;
      case 'info': return Info;
      case 'image': return Image;
      case 'video': return Video;
      case 'audio': return Music;
      case 'product': return Package;
      default: return MapPin;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#09090B]">
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-white">TOUR MAP</span>
          <span className="text-[10px] font-mono text-[#71717A]">
            {scenes.length} rooms, {connections.length} links
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom((z) => Math.min(3, z * 1.2))} className="p-1.5 rounded bg-[#18181B] hover:bg-[#27272A]" title="Zoom In">
            <ZoomIn className="w-4 h-4 text-white" />
          </button>
          <button onClick={() => setZoom((z) => Math.max(0.3, z * 0.8))} className="p-1.5 rounded bg-[#18181B] hover:bg-[#27272A]" title="Zoom Out">
            <ZoomOut className="w-4 h-4 text-white" />
          </button>
          <button onClick={handleReset} className="p-1.5 rounded bg-[#18181B] hover:bg-[#27272A]" title="Reset View">
            <RotateCcw className="w-4 h-4 text-white" />
          </button>
          <button onClick={onClose} className="px-3 py-1.5 rounded bg-[#27272A] hover:bg-[#3F3F46] text-xs font-mono text-white">
            Close
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="graph-bg absolute inset-0" />

        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#3ECF8E" />
            </marker>
          </defs>

          {connections.map((conn, i) => (
            <g key={i}>
              <line
                x1={conn.from.x}
                y1={conn.from.y}
                x2={conn.to.x}
                y2={conn.to.y}
                stroke="#3ECF8E"
                strokeWidth="2"
                strokeDasharray="6 3"
                opacity="0.5"
                markerEnd="url(#arrowhead)"
              />
            </g>
          ))}
        </svg>

        <div
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(${offset.x}px, ${offset.y}px)`,
          }}
        >
          {nodes.map((node) => (
            <div
              key={node.room.id}
              className={`absolute cursor-pointer transition-all ${
                selectedRoomId === node.room.id ? 'z-10' : 'z-0'
              }`}
              style={{
                left: node.x - 40,
                top: node.y - 40,
                transform: `scale(${zoom})`,
              }}
              onClick={() => onSelectRoom(node.room.id)}
            >
              <div
                className={`w-20 h-20 rounded-xl flex flex-col items-center justify-center transition-all ${
                  selectedRoomId === node.room.id
                    ? 'bg-[#3ECF8E] shadow-lg shadow-[#3ECF8E]/30'
                    : 'bg-[#18181B] border border-[#27272A] hover:border-[#3ECF8E]'
                }`}
              >
                {node.room.thumbnailUrl ? (
                  <div className="w-full h-full rounded-xl overflow-hidden">
                    <img
                      src={node.room.thumbnailUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <MapPin className={`w-6 h-6 ${selectedRoomId === node.room.id ? 'text-black' : 'text-[#71717A]'}`} />
                )}
              </div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <span className="text-[10px] font-mono text-[#A1A1AA]">{node.room.name}</span>
              </div>
              {node.room.hotspots && node.room.hotspots.length > 0 && (
                <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#3ECF8E] flex items-center justify-center">
                  <span className="text-[8px] font-mono text-black font-bold">{node.room.hotspots.length}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 bg-[#18181B]/80 backdrop-blur-sm rounded px-3 py-2 text-[10px] font-mono text-[#71717A]">
        Drag to pan • Scroll to zoom • Click room to select
      </div>
    </div>
  );
}
