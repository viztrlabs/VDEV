'use client';

import React from 'react';
import { FileCode, Download, History } from 'lucide-react';

export default function FileVersioningPanel() {
  const versions = [
    {
      id: 'ver-04',
      fileName: 'Apex_Tower_LOD400_Facade_Final_Lumen_v4.dwg',
      version: 'v4.0 (Latest)',
      size: '148.4 MB',
      updatedAt: 'Aug 28, 2026',
      author: 'VizTR BIM Engineering',
      status: 'Current Master'
    },
    {
      id: 'ver-03',
      fileName: 'Apex_Tower_LOD400_Facade_Engineering_Set_Rev3.dwg',
      version: 'v3.2',
      size: '142.1 MB',
      updatedAt: 'Aug 18, 2026',
      author: 'Alexander Wright',
      status: 'Superceded'
    },
    {
      id: 'ver-02',
      fileName: 'Apex_Tower_Structural_Steel_LOD350_Rev2.ifc',
      version: 'v2.0',
      size: '88.5 MB',
      updatedAt: 'Aug 10, 2026',
      author: 'Elena Rostova',
      status: 'Archived'
    }
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-[#3ECF8E]" />
            <span>Master Asset & BIM File Versioning</span>
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Cryptographically tracked CAD, IFC, DWG, and Unreal Engine deliverables
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {versions.map((v) => (
          <div key={v.id} className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#09090B] border border-[#27272A] text-[#3ECF8E] shrink-0">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>{v.fileName}</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#3ECF8E]/20 text-[#3ECF8E] text-[10px] font-mono font-bold">
                    {v.version}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#71717A] flex items-center gap-3 mt-1">
                  <span>Size: {v.size}</span>
                  <span>•</span>
                  <span>Modified: {v.updatedAt}</span>
                  <span>•</span>
                  <span>By: {v.author}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#3ECF8E]" />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
