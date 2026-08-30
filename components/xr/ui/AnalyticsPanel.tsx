'use client';

import React, { useEffect, useState } from 'react';
import { useAnalytics } from '../analytics/useAnalytics';
import { Activity, Cpu, Gauge, Sparkles, Triangle } from 'lucide-react';

/** Live performance HUD + AI recommendations from the analytics engine. */
export default function AnalyticsPanel({ className = '' }: { className?: string }) {
  const { track, recordPerf, recommendations } = useAnalytics();
  const [fps, setFps] = useState(60);
  const [triangles, setTriangles] = useState(0);

  // lightweight rAF-based fps sampler (client only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let raf = 0;
    let frames = 0;
    let last = performance.now();
    const loop = () => {
      frames++;
      const now = performance.now();
      if (now - last >= 1000) {
        const measured = Math.round((frames * 1000) / (now - last));
        setFps(measured);
        recordPerf({
          fps: measured,
          drawCalls: 0,
          triangles,
          memoryMB: Math.round(((performance as any).memory?.usedJSHeapSize ?? 0) / 1048576),
          frameMs: Math.round((now - last) / Math.max(1, frames)),
          timestamp: Date.now(),
        });
        track('render.frame', { fps: measured });
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [recordPerf, track, triangles]);

  return (
    <div className={`absolute bottom-4 right-4 z-40 w-60 rounded-xl bg-[#18181B]/85 backdrop-blur-sm border border-[#27272A] p-3 space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Activity className="w-3.5 h-3.5 text-[#3ECF8E]" />
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">Telemetry</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <Gauge className="w-3 h-3 text-[#71717A]" />
          <span className="text-white font-bold">{fps}</span>
          <span className="text-[#71717A]">fps</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Triangle className="w-3 h-3 text-[#71717A]" />
          <span className="text-white font-bold">{(triangles / 1e6).toFixed(1)}M</span>
          <span className="text-[#71717A]">tris</span>
        </div>
      </div>

      {recommendations.length > 0 ? (
        <div className="space-y-1.5 pt-1 border-t border-[#27272A]">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#A1A1AA]">
            <Sparkles className="w-3 h-3 text-[#F59E0B]" /> AI Insights
          </div>
          {recommendations.map((r) => (
            <div key={r.id} className="text-[10px] text-[#D4D4D8] leading-snug">
              <span className="text-[#3ECF8E]">›</span> {r.title}
              <span className="text-[#71717A]"> ({Math.round(r.confidence * 100)}%)</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
