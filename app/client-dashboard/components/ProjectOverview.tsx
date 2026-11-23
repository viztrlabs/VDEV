'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FolderGit2,
  Layers,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  Building,
  FileCode,
  Image as ImageIcon,
  Video,
  ExternalLink
} from 'lucide-react';

interface ProjectOverviewProps {
  projects?: Array<{
    id: string;
    name: string;
    status: string;
    projectType: string;
    category: string;
    progress: number;
    lastUpdate: string;
  }>;
}

export default function ProjectOverview({ projects = [] }: ProjectOverviewProps) {
  const stats = [
    {
      label: 'Active Commissions',
      value: '03',
      subtext: '2 In Review, 1 In Prod',
      trend: '+12% this mo.',
      icon: <Building2 className="w-5 h-5 text-[#dbfcff]" />,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40';
      case 'Work in Progress': return 'bg-blue-950/40 text-blue-400 border-blue-800/40';
      case 'Client Review': return 'bg-amber-950/40 text-amber-400 border-amber-800/40';
      case 'Awaited': return 'bg-violet-950/40 text-violet-400 border-violet-800/40';
      case 'Hold': return 'bg-red-950/40 text-red-400 border-red-800/40';
      default: return 'bg-[#353436] text-[#A1A1AA] border-[#3f3f46]';
    }
  };

  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case 'WebXR': return <Layers className="w-4 h-4 text-amber-400" />;
      case 'WebAR': return <Sparkles className="w-4 h-4 text-cyan-400" />;
      case 'Virtual Reality': return <Building className="w-4 h-4 text-violet-400" />;
      case 'Virtual Tour 360': return <ImageIcon className="w-4 h-4 text-sky-400" />;
      case 'Animation': return <Video className="w-4 h-4 text-rose-400" />;
      case 'Still Renders': return <ImageIcon className="w-4 h-4 text-emerald-400" />;
      default: return <FileCode className="w-4 h-4 text-[#dbfcff]" />;
    }
  };

  // Show first 5 projects as clickable cards
  const displayProjects = projects.slice(0, 5);

  return (
    <section className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#201f20] border border-[#353436] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#dbfcff]/20 text-[#dbfcff] text-[10px] font-mono font-bold uppercase border border-[#dbfcff]/30">
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
            className="p-5 rounded-xl bg-[#201f20] border border-[#353436] hover:border-[#dbfcff]/40 transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-lg bg-[#131314] border border-[#353436]">
                {stat.icon}
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#131314] border border-[#353436] text-[#A1A1AA]">
                {stat.badge}
              </span>
            </div>

            <div>
              <div className="text-3xl font-bold text-white font-mono tracking-tight group-hover:text-[#dbfcff] transition-colors">
                {stat.value}
              </div>
              <div className="text-xs font-bold text-[#A1A1AA] mt-1">{stat.label}</div>
              <div className="text-[11px] font-mono text-[#71717A] mt-0.5">{stat.subtext}</div>
            </div>

            <div className="pt-2 border-t border-[#353436] flex items-center justify-between text-[10px] font-mono text-[#dbfcff]">
              <span>{stat.trend}</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>

      {/* Project Cards - First 5 Clickable */}
      {displayProjects.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-[#dbfcff]" />
              <span>Your Active Commissions</span>
            </h3>
            <span className="text-xs text-[#71717A] font-mono">Showing {displayProjects.length} of {projects.length}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayProjects.map((project) => (
              <Link
                key={project.id}
                href={`/client-dashboard/projects/${project.id}`}
                className="block p-5 rounded-xl bg-[#201f20] border border-[#353436] hover:border-[#dbfcff]/40 hover:bg-[#201f20]/80 transition-all space-y-4 group"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-[#dbfcff]/10 border border-[#dbfcff]/30 text-[#dbfcff] text-[10px] font-mono font-bold">
                    {project.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#dbfcff] transition-colors">{project.name}</h3>
                  <p className="text-xs text-[#A1A1AA] mt-1">
                    {project.projectType} • {project.category}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#353436] flex items-center justify-between text-xs font-mono text-[#71717A]">
                  <span>{project.lastUpdate}</span>
                  <span className={`font-bold ${project.progress === 100 ? 'text-emerald-400' : project.progress >= 50 ? 'text-[#dbfcff]' : 'text-amber-400'}`}>{project.progress}% Complete</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
