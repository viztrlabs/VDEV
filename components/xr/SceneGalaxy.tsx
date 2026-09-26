'use client';

import React, { useMemo } from 'react';
import type { ManifestScene, ManifestLink } from '@/lib/tourManifest';
import { layoutGalaxyNodes, layoutGalaxyEdges } from '@/lib/tourManifest';

interface SceneGalaxyProps {
  open: boolean;
  scenes: ManifestScene[];
  links: ManifestLink[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
  title?: string;
}

export default function SceneGalaxy({ open, scenes, links, currentId, onSelect, onClose, title }: SceneGalaxyProps) {
  const [w, setW] = React.useState(0);
  const [h, setH] = React.useState(0);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const measure = () => {
      const r = ref.current?.getBoundingClientRect();
      if (r) {
        setW(r.width);
        setH(r.height);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onEsc);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('keydown', onEsc);
    };
  }, [open, onClose]);

  const nodes = useMemo(() => (w && h ? layoutGalaxyNodes(scenes, w, h) : []), [scenes, w, h]);
  const edges = useMemo(() => layoutGalaxyEdges(nodes, links), [nodes, links]);
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n] as const)), [nodes]);

  if (!open) return null;

  const edgeLines = edges
    .map((e) => {
      const a = byId.get(e.from);
      const b = byId.get(e.to);
      if (!a || !b) return null;
      return (
        <line
          key={`${e.from}-${e.to}`}
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke="#3ECF8E"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          opacity={0.55}
        />
      );
    })
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-[60] bg-[#09090B]/95 backdrop-blur-sm flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#27272A]">
        <div className="text-xs font-mono font-bold text-white">{title || 'Tour map'}</div>
        <button onClick={onClose} className="text-[#71717A] hover:text-white text-xs px-1" aria-label="Close tour map">
          ✕
        </button>
      </div>
      <div ref={ref} className="flex-1 relative overflow-hidden">
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {edgeLines}
        </svg>
        {nodes.map((n) => {
          const active = n.id === currentId;
          return (
            <button
              key={n.id}
              onClick={() => onSelect(n.id)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group ${active ? 'scale-110' : ''}`}
              style={{ left: n.x, top: n.y }}
              aria-label={`Go to ${n.name}`}
            >
              <span
                className={`w-14 h-14 rounded-full bg-cover bg-center border-2 shadow-lg transition-transform group-hover:scale-105 ${
                  active ? 'border-[#3ECF8E] ring-2 ring-[#3ECF8E]/30' : 'border-[#3F3F46]'
                }`}
                style={{ backgroundImage: `url(${n.thumbnailUrl})` }}
              />
              <span className="max-w-24 truncate text-[10px] font-mono text-[#A1A1AA]">{n.name}</span>
            </button>
          );
        })}
        {scenes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-[#71717A]">
            No scenes to map yet.
          </div>
        )}
      </div>
    </div>
  );
}