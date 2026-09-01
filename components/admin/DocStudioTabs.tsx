// components/admin/DocStudioTabs.tsx
'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import { DOCUMENT_TABS, DocumentType } from './types/doc-studio';
import { useDocStudioStore } from './DocStudioStore';

interface DocStudioTabsProps {
  readOnly?: boolean;
}

export default function DocStudioTabs({ readOnly = false }: DocStudioTabsProps) {
  const { activeTab, setActiveTab } = useDocStudioStore();
  
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 border-b border-[var(--border)] px-1 -mx-1 scrollbar-thin">
      {DOCUMENT_TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => !readOnly && setActiveTab(tab.id as DocumentType)}
          disabled={readOnly}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium 
            whitespace-nowrap transition-all shrink-0 cursor-pointer
            ${activeTab === tab.id
              ? 'bg-[var(--primary)] text-black font-bold shadow-sm'
              : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
            }
            ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}
          `}
        >
          <FileText className="w-3.5 h-3.5 shrink-0" />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
