'use client';

import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface CollapsibleCardHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
  children: React.ReactNode;
}

export function CollapsibleCardHeader({
  collapsed,
  onToggle,
  className,
  children,
}: CollapsibleCardHeaderProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={!collapsed}
      title={collapsed ? 'Double-click to expand' : 'Double-click to collapse'}
      onDoubleClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onToggle();
        }
      }}
      className={`text-[10px] font-mono uppercase tracking-wider flex items-center justify-between gap-1.5 cursor-pointer select-none ${className ?? 'text-[#3ECF8E]'}`}
    >
      <span className="flex items-center gap-1.5">{children}</span>
      <span aria-label="Collapse indicator" data-collapsed={collapsed ? 'true' : 'false'}>
        {collapsed ? (
          <ChevronDown className="w-3.5 h-3.5 shrink-0" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 shrink-0" />
        )}
      </span>
    </div>
  );
}