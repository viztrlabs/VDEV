'use client';

import React, { useState } from 'react';
import { Search, FileText } from 'lucide-react';

export default function ClientSearch() {
  const [query, setQuery] = useState('');

  const searchItems = [
    { title: 'Apex_Tower_LOD400_Facade_Final_Lumen_v4.dwg', type: 'CAD Model', category: 'Files', date: 'Aug 28, 2026' },
    { title: 'Render Cam 04 — North Elevation Sunset 8K.png', type: '8K Render', category: 'Deliverables', date: 'Aug 27, 2026' },
    { title: 'Stage 02 Milestone Sign-off Certificate.pdf', type: 'Contract', category: 'Approvals', date: 'Feb 15, 2026' },
    { title: 'Interactive WebXR Gaussian Splat Model', type: '3D Splat', category: 'Experiences', date: 'Aug 24, 2026' }
  ];

  const results = searchItems.filter(item =>
    !query || item.title.toLowerCase().includes(query.toLowerCase()) || item.type.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-[#3ECF8E]" />
            <span>Unified Commission Asset Search</span>
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Instant search across deliverables, blueprints, contracts, and render sets
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by file name, asset type, camera angle, or approval state..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#18181B] border border-[#27272A] text-sm text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
        />
      </div>

      <div className="space-y-2">
        {results.map((item, idx) => (
          <div key={idx} className="p-3.5 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#09090B] border border-[#27272A] text-[#3ECF8E] shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">{item.title}</div>
                <div className="text-[10px] font-mono text-[#71717A] flex items-center gap-2 mt-0.5">
                  <span className="text-[#3ECF8E]">{item.category}</span>
                  <span>•</span>
                  <span>{item.type}</span>
                  <span>•</span>
                  <span>{item.date}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
