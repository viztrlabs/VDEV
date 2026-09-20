'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';

interface ExperienceLayoutProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export function ExperienceLayout({ left, right }: ExperienceLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [splitPercent, setSplitPercent] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = (x / rect.width) * 100;
      setSplitPercent(Math.max(20, Math.min(80, pct)));
    };

    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const hasRight = right != null;

  return (
    <div ref={containerRef} className="relative w-full h-full flex bg-[#09090B]">
      {/* Left panel */}
      <div
        className="h-full overflow-hidden"
        style={{ width: hasRight ? `${splitPercent}%` : '100%' }}
      >
        {left}
      </div>

      {/* Divider */}
      {hasRight && (
        <div
          className="relative w-1 bg-[#27272A] cursor-col-resize hover:bg-[#3ECF8E] transition-colors shrink-0"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-8 rounded bg-[#3ECF8E]/30 flex items-center justify-center">
            <div className="w-0.5 h-4 bg-[#3ECF8E] rounded" />
          </div>
        </div>
      )}

      {/* Right panel */}
      {hasRight && (
        <div className="h-full overflow-hidden" style={{ width: `${100 - splitPercent}%` }}>
          {right}
        </div>
      )}
    </div>
  );
}