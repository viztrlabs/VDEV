'use client';

import React, { useEffect, useState } from 'react';

export type Tab = {
  key: string;
  label: string;
  columns: { key: string; label: string; render?: (value: any, row: any) => React.ReactNode }[];
};

type Props = {
  projectId: string;
  tabs: Tab[];
  tabData: Record<string, any[]>;
};

export function RelatedTables({ projectId, tabs, tabData }: Props) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.key || 'experiences');

  return (
    <div className="space-y-3">
      <div className="flex gap-2 border-b border-[#27272A]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 text-xs font-mono border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.key
                ? 'border-[#3ECF8E] text-white'
                : 'border-transparent text-[#A1A1AA] hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-[#27272A] bg-[#0c0c0f]">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#27272A] text-[#A1A1AA]">
                {tabs
                  .find((tab) => tab.key === activeTab)
                  ?.columns.map((col) => (
                    <th key={col.key} className="text-left px-4 py-3 font-mono">
                      {col.label}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {((tabData[activeTab] || []).length === 0) && (
                <tr>
                  <td
                    colSpan={tabs.find((tab) => tab.key === activeTab)?.columns.length || 1}
                    className="px-4 py-6 text-center text-[#71717A]"
                  >
                    No data.
                  </td>
                </tr>
              )}
              {tabData[activeTab]?.map((row, index) => (
                <tr key={row.id || index} className="border-b border-[#27272A]/60 last:border-0">
                  {tabs
                    .find((tab) => tab.key === activeTab)
                    ?.columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-[#FAFAFA]">
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
