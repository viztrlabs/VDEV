'use client';

import React, { memo } from 'react';
import type { SectionTab } from '@/lib/editorStore';

interface SectionTabsProps {
  active: SectionTab;
  onChange: (tab: SectionTab) => void;
}

const TABS: ReadonlyArray<readonly [SectionTab, string]> = [
  ['editor', 'Tour Editor'],
  ['canvas', 'Canvas'],
  ['design', 'Design'],
  ['components', 'Components'],
  ['floorplan', 'Floorplan'],
  ['map', 'Map'],
  ['cta', 'CTA & Bar'],
  ['content', 'Content'],
  ['model', 'Model'],
  ['marketing', 'Marketing'],
  ['settings', 'Settings'],
] as const;

function SectionTabsBase({ active, onChange }: SectionTabsProps) {
  return (
    <div
      role="tablist"
      className="flex items-center gap-1 px-4 py-2 border-b border-[#27272A] bg-[#0c0c0f] overflow-x-auto"
    >
      {TABS.map(([tab, label]) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={active === tab}
          onClick={() => onChange(tab)}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap ${
            active === tab
              ? 'bg-[#3ECF8E] text-black font-bold'
              : 'bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA]'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export const SectionTabs = memo(SectionTabsBase);
