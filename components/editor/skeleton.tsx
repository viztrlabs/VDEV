'use client';

import React from 'react';

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse rounded bg-[#27272A] ${className}`} />
  );
}

type TableSkeletonProps = {
  rows?: number;
  columns?: number;
};

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 border-b border-[#27272A] pb-2 mb-2">
        {Array.from({ length: columns }).map((_, idx) => (
          <div key={`header-${idx}`} className="h-3 flex-1 rounded bg-[#27272A]/60" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={`row-${rowIdx}`} className="flex items-center gap-2 py-2 border-b border-[#27272A]/50">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div key={`cell-${rowIdx}-${colIdx}`} className="h-3 flex-1 rounded bg-[#27272A]/40" />
          ))}
        </div>
      ))}
    </div>
  );
}

type PanelSkeletonProps = {
  tabs?: string[];
};

export function PanelSkeleton({ tabs = ['Experiences', 'Deliverables', 'Assets', 'Members'] }: PanelSkeletonProps) {
  return (
    <div className="rounded border border-[#27272A] bg-[#0F0F11]">
      <div className="flex items-center gap-1 border-b border-[#27272A] px-2 py-1.5">
        {tabs.map((tab) => (
          <div key={tab} className="h-6 w-24 rounded bg-[#27272A]/60" />
        ))}
      </div>
      <div className="p-4">
        <TableSkeleton rows={4} columns={4} />
      </div>
    </div>
  );
}
