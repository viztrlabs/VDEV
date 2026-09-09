'use client';

import React from 'react';
import Link from 'next/link';
import RoleLayout from '@/app/app/RoleLayout';
import { LayoutDashboard, FolderOpen, Plus, Box, Sparkles, Globe, Layers, Image, Users, Share2, Activity, CreditCard, Settings, FolderOpen as FolderIcon, Camera, ArrowRight, CheckCircle, Clock, AlertCircle, PenTool, File } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/app/user', icon: LayoutDashboard },
  { name: 'Projects', href: '/app/user/projects', icon: FolderOpen },
  { name: 'New Project', href: '/app/user/projects/new', icon: Plus },
  { name: 'Files', href: '/app/user/files', icon: File },
  { name: 'Assets', href: '/app/user/assets', icon: Box },
  { name: 'Renders', href: '/app/user/renders', icon: Image },
  { name: 'XR Experiences', href: '/app/user/xr-experiences', icon: Globe },
  { name: 'VizSplat', href: '/app/user/vizsplat', icon: Sparkles },
  { name: 'Editor', href: '/app/user/editor', icon: PenTool },
  { name: 'Shared', href: '/app/user/shared', icon: Share2 },
  { name: 'Team', href: '/app/user/team', icon: Users },
  { name: 'Usage', href: '/app/user/usage', icon: Activity },
  { name: 'Billing', href: '/app/user/billing', icon: CreditCard },
  { name: 'Settings', href: '/app/user/settings', icon: Settings },
];

export default function UserDashboard() {
  return (
    <RoleLayout role="user">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display">Welcome back, John</h1>
            <p className="text-zinc-400 mt-1">Create, manage, and publish your projects.</p>
          </div>
          <Link
            href="/app/user/projects/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Projects', value: '12', icon: FolderOpen, color: 'emerald' },
            { label: 'Renders', value: '48', icon: Image, color: 'rose' },
            { label: 'XR Experiences', value: '5', icon: Globe, color: 'purple' },
            { label: 'VizSplats', value: '3', icon: Sparkles, color: 'amber' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                <Icon className={`w-5 h-5 text-${stat.color}-400 mb-3`} />
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-zinc-400 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-white">Quick Actions</h3>
              <Link
                href="/creator/3d-editor"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-all border border-transparent hover:border-emerald-500/30"
              >
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <Box className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-sm font-medium">Open 3D Editor</span>
              </Link>
              <Link
                href="/creator/supersplat"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-all border border-transparent hover:border-rose-500/30"
              >
                <div className="p-2 rounded-lg bg-rose-500/20">
                  <Sparkles className="w-5 h-5 text-rose-400" />
                </div>
                <span className="text-sm font-medium">Open SuperSplat</span>
              </Link>
              <Link
                href="/app/user/assets"
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-all border border-transparent hover:border-cyan-500/30"
              >
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <Layers className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="text-sm font-medium">Manage Assets</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-zinc-800">
                <h2 className="text-xl font-bold font-display">Recent Projects</h2>
                <Link
                  href="/app/user/projects"
                  className="text-cyan-400 text-sm font-semibold flex items-center gap-1"
                >
                  View All
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-zinc-800">
                {[
                  { name: 'Riverside Tower', type: 'Exterior', status: 'Rendering', progress: 65, updated: '2 hours ago' },
                  { name: 'Parkview Residences', type: 'Interior', status: 'Complete', progress: 100, updated: '1 day ago' },
                  { name: 'Harbor Commercial', type: 'Walkthrough', status: 'In Review', progress: 80, updated: '3 days ago' },
                  { name: 'Mountain Retreat', type: 'XR', status: 'Draft', progress: 25, updated: '5 days ago' },
                ].map((project) => (
                  <div key={project.name} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <FolderOpen className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{project.name}</h4>
                        <p className="text-xs text-zinc-500">{project.type} • Updated {project.updated}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-1 sm:justify-end">
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-zinc-400">Progress</span>
                          <span className="font-semibold">{project.progress}%</span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${project.progress}%` }} />
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        project.status === 'Complete' ? 'bg-emerald-500/20 text-emerald-400' :
                        project.status === 'Rendering' ? 'bg-cyan-500/20 text-cyan-400' :
                        project.status === 'In Review' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-zinc-700 text-zinc-400'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}

