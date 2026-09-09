'use client';

import React from 'react';
import Link from 'next/link';
import {
  Box,
  Layers,
  Camera,
  Sparkles,
  FolderOpen,
  Users,
  CreditCard,
  Settings,
  ArrowRight,
  Plus
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Top Bar */}
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/app/dashboard" className="text-xl font-bold font-display">
            VizTR Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/app/dashboard"
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Project
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold font-display">Welcome to VizTR</h1>
          <p className="text-zinc-400 mt-1">Create, manage, and publish your projects.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Projects', value: '12', icon: FolderOpen, color: 'cyan' },
            { label: 'Renders', value: '48', icon: Camera, color: 'rose' },
            { label: 'XR Experiences', value: '5', icon: Box, color: 'purple' },
            { label: 'VizSplats', value: '3', icon: Sparkles, color: 'amber' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`bg-zinc-900/50 border border-zinc-800 rounded-xl p-4`}
              >
                <Icon className={`w-5 h-5 text-${stat.color}-400 mb-2`} />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-zinc-400">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold font-display mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/creator/3d-editor"
              className="group bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-cyan-500/50 transition-all"
            >
              <Box className="w-6 h-6 text-cyan-400 mb-3" />
              <h3 className="font-semibold">Open 3D Editor</h3>
              <p className="text-xs text-zinc-400 mt-1">Edit GLB, GLTF, FBX, OBJ</p>
            </Link>
            <Link
              href="/creator/supersplat"
              className="group bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-rose-500/50 transition-all"
            >
              <Sparkles className="w-6 h-6 text-rose-400 mb-3" />
              <h3 className="font-semibold">Open SuperSplat</h3>
              <p className="text-xs text-zinc-400 mt-1">Edit Gaussian Splats</p>
            </Link>
            <Link
              href="/creator/assets"
              className="group bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-emerald-500/50 transition-all"
            >
              <Layers className="w-6 h-6 text-emerald-400 mb-3" />
              <h3 className="font-semibold">Manage Assets</h3>
              <p className="text-xs text-zinc-400 mt-1">Upload and organize</p>
            </Link>
          </div>
        </div>

        {/* Recent Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-display">Recent Projects</h2>
            <Link
              href="/app/dashboard"
              className="text-cyan-400 text-sm font-semibold flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-3"
              >
                <div className="aspect-video bg-zinc-800 rounded-lg flex items-center justify-center">
                  <Box className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="font-semibold">Project {i}</h3>
                <p className="text-xs text-zinc-400">Last edited 2 days ago</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
