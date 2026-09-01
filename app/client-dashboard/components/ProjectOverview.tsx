'use client';

import React from 'react';
import {
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FolderGit2,
  Layers,
  Sparkles,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';

export default function ProjectOverview() {
  const stats = [
    {
      label: 'Active Commissions',
      value: '03',
      subtext: '2 In Review, 1 In Prod',
      trend: '+12% this mo.',
      icon: <Building2 className="w-5 h-5 text-[#3ECF8E]" />,
      badge: 'Active'
    },
    {
      label: 'Awaiting Your Sign-Off',
      value: '02',
      subtext: 'Milestone 03 & 04',
      trend: 'Action Required',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      badge: 'Urgent'
    },
    {
      label: 'Completed Deliverables',
      value: '24',
      subtext: '8K Renders & WebXR',
      trend: '100% On Time',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      badge: 'Archived'
    },
    {
      label: 'GPU Cluster Render Hours',
      value: '142h',
      subtext: 'NVIDIA RTX 4090 Nodes',
      trend: 'Photometric PBR',
      icon: <Sparkles className="w-5 h-5 text-sky-400" />,
      badge: 'Lumen 5.4'
    }
  ];

  return (
    <section className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#3ECF8E]/20 text-[#3ECF8E] text-[10px] font-mono font-bold uppercase border border-[#3ECF8E]/30">
              Verified Client Portal
            </span>
            <span className="text-xs font-mono text-[#71717A]">VIZTR-882 • Apex Tower Commission</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1.5 font-serif">
            Welcome to Your Production Workspace
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-1 max-w-xl">
            Live pipeline synchronization, 7-stage architectural milestones, and encrypted 8K deliverable vault.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl bg-[#18181B] border border-[#27272A] hover:border-[#3ECF8E]/40 transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-lg bg-[#09090B] border border-[#27272A]">
                {stat.icon}
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#09090B] border border-[#27272A] text-[#A1A1AA]">
                {stat.badge}
              </span>
            </div>

            <div>
              <div className="text-3xl font-bold text-white font-mono tracking-tight group-hover:text-[#3ECF8E] transition-colors">
                {stat.value}
              </div>
              <div className="text-xs font-bold text-[#A1A1AA] mt-1">{stat.label}</div>
              <div className="text-[11px] font-mono text-[#71717A] mt-0.5">{stat.subtext}</div>
            </div>

            <div className="pt-2 border-t border-[#27272A] flex items-center justify-between text-[10px] font-mono text-[#3ECF8E]">
              <span>{stat.trend}</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
