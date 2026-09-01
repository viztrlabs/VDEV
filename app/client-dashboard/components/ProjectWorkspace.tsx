'use client';

import React from 'react';
import { Folder, Download, HardDrive } from 'lucide-react';

export default function ProjectWorkspace() {
  const folders = [
    { name: '01_Approved_8K_Master_Renders', count: '14 Files', size: '1.2 GB', type: 'image' },
    { name: '02_Cinematic_4K_Animations', count: '3 Videos', size: '4.8 GB', type: 'video' },
    { name: '03_CAD_BIM_LOD400_Assets', count: '6 Models', size: '850 MB', type: 'cad' },
    { name: '04_Virtual_Tour_16K_Cubemaps', count: '24 Panoramas', size: '2.6 GB', type: 'xr' }
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-[#3ECF8E]" />
            <span>Master Deliverables & Workspace Vault</span>
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Cloud-synchronized production repository with high-speed direct downloads
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {folders.map((f, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] hover:border-[#3ECF8E]/40 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-[#09090B] border border-[#27272A] text-[#3ECF8E]">
                <Folder className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-[#A1A1AA]">{f.size}</span>
            </div>
            <div>
              <div className="text-xs font-bold text-white truncate" title={f.name}>{f.name}</div>
              <div className="text-[11px] font-mono text-[#71717A] mt-0.5">{f.count}</div>
            </div>
            <button
              type="button"
              className="w-full py-1.5 px-2.5 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-xs font-mono text-[#A1A1AA] hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3 text-[#3ECF8E]" />
              <span>Download Archive</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
