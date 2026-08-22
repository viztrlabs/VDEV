'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Shield,
  ArrowLeft,
  Cpu,
  Activity,
  Database,
  Users,
  Box,
  Server,
  Layers,
  Sparkles,
  Search,
  Bell,
  LogOut,
  Settings,
  FileText,
  Calendar,
  LifeBuoy,
  Globe,
  Sliders,
  Palette,
  Eye,
  Headset,
  Share2,
  TrendingUp,
  UserCheck,
  Building,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  MessageSquare
} from 'lucide-react';
import ModelManager from '@/components/admin/ModelManager';
import { useAppStore } from '@/lib/store';

// 6 Sections with all 20 specified admin routes / tabs
const SIDEBAR_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Platform Overview', icon: Activity, href: '/admin/dashboard' },
      { id: 'projects', label: 'All Projects', icon: Database, href: '/admin/projects' },
      { id: 'analytics', label: 'Analytics', icon: TrendingUp, href: '/admin/analytics' },
    ],
  },
  {
    title: 'Users',
    items: [
      { id: 'users', label: 'User Management', icon: Users, href: '/admin/users' },
      { id: 'clients', label: 'Client Access', icon: UserCheck, href: '/admin/clients' },
      { id: 'inquiries', label: 'Contact Inquiries', icon: MessageSquare, href: '/admin/inquiries' },
    ],
  },
  {
    title: 'XR Tools',
    items: [
      { id: 'vr-configurator', label: 'VR Tour Builder', icon: Headset, href: '/admin/vr-configurator' },
      { id: 'ar', label: 'AR Projects', icon: Box, href: '/admin/ar' },
      { id: 'streaming', label: 'GPU & Streaming', icon: Server, href: '/admin/streaming' },
    ],
  },
  {
    title: 'Content',
    items: [
      { id: 'blog', label: 'Blog Management', icon: FileText, href: '/admin/blog' },
      { id: 'cms-services', label: 'Services CMS', icon: Layers, href: '/admin/cms/services' },
      { id: 'cms-testimonials', label: 'Testimonials', icon: Sparkles, href: '/admin/cms/testimonials' },
      { id: 'media', label: 'Media Library', icon: Globe, href: '/admin/media' },
      { id: 'cms-navigation', label: 'Navigation Menus', icon: Sliders, href: '/admin/cms/navigation' },
      { id: 'forms', label: 'Form Builder', icon: FileText, href: '/admin/forms' },
      { id: 'design-themes', label: 'Theme Manager', icon: Palette, href: '/admin/design/themes' },
      { id: 'seo', label: 'SEO Settings', icon: Globe, href: '/admin/seo' },
    ],
  },
  {
    title: 'Bookings',
    items: [
      { id: 'bookings', label: 'All Bookings', icon: Calendar, href: '/admin/bookings' },
      { id: 'support', label: 'Support Tickets', icon: LifeBuoy, href: '/admin/support' },
    ],
  },
  {
    title: 'System',
    items: [
      { id: 'settings', label: 'Platform Settings', icon: Settings, href: '/admin/settings' },
      { id: 'ai-settings', label: 'AI Configuration', icon: Sparkles, href: '/admin/ai-settings' },
      { id: 'admins', label: 'Admin Management', icon: Shield, href: '/admin/admins' },
    ],
  },
];

export default function AdminDashboardPage() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, showToast } = useAppStore();

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col">
      {/* ADMIN TOP BAR */}
      <header className="h-16 border-b border-[#27272A] bg-[#18181B] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden p-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white"
          >
            {mobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <Link href="/" className="flex items-center gap-2">
            <span className="font-display font-black text-lg tracking-wider text-white">
              VIZ<span className="text-[#3ECF8E]">TR</span>
            </span>
            <span className="hidden sm:inline px-2 py-0.5 rounded bg-[#09090B] border border-[#27272A] text-[#3ECF8E] text-[10px] font-mono font-bold uppercase">
              Admin CMS v2.5
            </span>
          </Link>
        </div>

        {/* Global Admin Search */}
        <div className="hidden sm:flex items-center relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, client tokens, assets..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
          />
        </div>

        {/* User Info & Notifications */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => showToast('No pending critical cluster alerts.', 'info')}
            className="p-2 rounded-lg bg-[#09090B] border border-[#27272A] text-[#A1A1AA] hover:text-white relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-[#3ECF8E] absolute top-1.5 right-1.5" />
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-[#27272A]">
            <div className="w-8 h-8 rounded-full bg-[#3ECF8E]/20 border border-[#3ECF8E]/40 flex items-center justify-center text-xs font-mono font-bold text-[#3ECF8E]">
              AD
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-mono font-bold text-white">VizTR SuperAdmin</div>
              <div className="text-[10px] font-mono text-[#71717A]">admin@viztr.com</div>
            </div>
          </div>

          <Link
            href="/"
            className="p-2 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors"
            title="Return to Public Site"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR NAVIGATION (260px desktop, 6 sections, 20 items) */}
        <aside
          className={`w-[260px] bg-[#18181B] border-r border-[#27272A] flex flex-col justify-between overflow-y-auto shrink-0 transition-all z-30 ${
            mobileSidebarOpen ? 'fixed inset-y-16 left-0 shadow-2xl' : 'hidden md:flex'
          }`}
        >
          <div className="p-4 space-y-6">
            {SIDEBAR_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-1.5">
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#71717A] px-2">
                  {section.title}
                </h4>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id);
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full px-2.5 py-2 rounded-lg text-xs font-mono flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                          isActive
                            ? 'bg-[#09090B] text-[#3ECF8E] font-bold border-l-2 border-[#3ECF8E] pl-2'
                            : 'text-[#A1A1AA] hover:text-white hover:bg-[#09090B]/50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#3ECF8E]' : 'text-[#71717A]'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-[#27272A] text-[10px] font-mono text-[#71717A] flex items-center justify-between">
            <span>Prisma 5.x DB Sync</span>
            <span className="text-[#3ECF8E] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E] animate-pulse" />
              Connected
            </span>
          </div>
        </aside>

        {/* MAIN ADMIN WORKSPACE */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl">
          {/* SECTION: PLATFORM OVERVIEW (HOME) */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* TOP SUMMARY */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E]">
                  <Shield className="w-4 h-4" />
                  <span>EXECUTIVE CMS CONTROL TOWER</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
                  Platform Operations & Asset Telemetry
                </h1>
                <p className="text-xs text-[#A1A1AA]">
                  Real-time pipeline monitoring, Cloudflare R2 object storage tracker, WebRTC stream capacity, and client engagement analytics.
                </p>
              </div>

              {/* STATS CARDS: Total Leads, Total Bookings, Total Projects, Active Projects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-1">
                  <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-mono">
                    <span>TOTAL LEADS</span>
                    <TrendingUp className="w-4 h-4 text-[#3ECF8E]" />
                  </div>
                  <div className="text-2xl font-bold text-[#FAFAFA] font-mono">148</div>
                  <div className="text-[10px] text-[#3ECF8E]">+24% vs last month</div>
                </div>

                <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-1">
                  <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-mono">
                    <span>TOTAL BOOKINGS</span>
                    <Calendar className="w-4 h-4 text-[#3ECF8E]" />
                  </div>
                  <div className="text-2xl font-bold text-[#FAFAFA] font-mono">36</div>
                  <div className="text-[10px] text-[#3ECF8E]">9 Scheduled this week</div>
                </div>

                <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-1">
                  <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-mono">
                    <span>TOTAL PROJECTS</span>
                    <Database className="w-4 h-4 text-[#3ECF8E]" />
                  </div>
                  <div className="text-2xl font-bold text-[#FAFAFA] font-mono">52</div>
                  <div className="text-[10px] text-[#71717A]">44 Archival Master Deliveries</div>
                </div>

                <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-1">
                  <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-mono">
                    <span>ACTIVE PROJECTS</span>
                    <Activity className="w-4 h-4 text-[#3ECF8E]" />
                  </div>
                  <div className="text-2xl font-bold text-[#FAFAFA] font-mono">8</div>
                  <div className="text-[10px] text-[#3ECF8E]">3 in Final Stage Review</div>
                </div>
              </div>

              {/* DUAL COLUMN: RECENT ACTIVITY & QUICK LINKS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity List */}
                <div className="lg:col-span-2 p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                    <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#3ECF8E]" />
                      <span>Recent Platform Activity Log</span>
                    </h3>
                    <span className="text-[10px] font-mono text-[#71717A]">Live Socket Feed</span>
                  </div>

                  <div className="space-y-3 text-xs font-mono">
                    <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#3ECF8E] shrink-0" />
                        <div>
                          <div className="text-white font-bold">The Apex Tower - WebXR Asset Approved</div>
                          <div className="text-[10px] text-[#71717A]">Elena Rostova (Foster & Partners) · 12 min ago</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#3ECF8E] font-bold">Stage 4 Complete</span>
                    </div>

                    <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Cpu className="w-4 h-4 text-[#3ECF8E] shrink-0" />
                        <div>
                          <div className="text-white font-bold">Unreal Engine 5.4 Pixel Stream Instance Allocated</div>
                          <div className="text-[10px] text-[#71717A]">Frankfurt EU-Central Node #12 · 45 min ago</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#A1A1AA]">60 FPS · 14ms</span>
                    </div>

                    <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-[#3ECF8E] shrink-0" />
                        <div>
                          <div className="text-white font-bold">New Architectural Consultation Booked</div>
                          <div className="text-[10px] text-[#71717A]">Marcus Weber (Zaha Hadid Architects) · 2 hours ago</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#3ECF8E]">$50K-$100K Tier</span>
                    </div>
                  </div>
                </div>

                {/* Quick Links & Health Cards */}
                <div className="space-y-4">
                  {/* Theme Status Card */}
                  <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-white font-bold flex items-center gap-1.5">
                        <Palette className="w-4 h-4 text-[#3ECF8E]" />
                        <span>Theme Status</span>
                      </span>
                      <span className="text-[#3ECF8E]">Active</span>
                    </div>
                    <p className="text-[11px] text-[#A1A1AA]">
                      Primary Accent: <span className="text-[#3ECF8E] font-mono">#3ECF8E</span> (Emerald) • Base: Zinc Dark #09090B
                    </p>
                    <button
                      onClick={() => setActiveSection('design-themes')}
                      className="text-xs font-mono text-[#3ECF8E] hover:underline pt-1 block"
                    >
                      Theme Manager →
                    </button>
                  </div>

                  {/* SEO Health Card */}
                  <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-white font-bold flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-[#3ECF8E]" />
                        <span>SEO Health</span>
                      </span>
                      <span className="text-[#3ECF8E] font-bold">98 / 100</span>
                    </div>
                    <p className="text-[11px] text-[#A1A1AA]">
                      Dynamic Sitemap & Schema markup active on all 21 service and portfolio routes.
                    </p>
                    <button
                      onClick={() => setActiveSection('seo')}
                      className="text-xs font-mono text-[#3ECF8E] hover:underline pt-1 block"
                    >
                      Audit Meta Tags →
                    </button>
                  </div>
                </div>
              </div>

              {/* 3D MODEL & ASSET MANAGEMENT SECTION EMBED */}
              <div className="space-y-3">
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#A1A1AA]">
                  Spatial Model Inventory & Draco Compression Pipeline
                </h3>
                <ModelManager />
              </div>
            </div>
          )}

          {/* SECTION: XR & 3D TOOLS */}
          {(activeSection === 'ar' || activeSection === 'vr-configurator' || activeSection === 'models') && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold font-display text-white">Spatial 3D & WebXR Asset Manager</h2>
                <p className="text-xs text-[#A1A1AA]">Upload GLB/GLTF geometry, inspect Draco polygon compression, and toggle WebXR surface anchoring.</p>
              </div>
              <ModelManager />
            </div>
          )}

          {/* SECTION: STREAMING */}
          {activeSection === 'streaming' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold font-display text-white">NVIDIA GPU Cluster & Pixel Streaming Fleet</h2>
                <p className="text-xs text-[#A1A1AA]">Manage WebRTC signaling servers, adjust bitrate limits, and inspect real-time frame timings.</p>
              </div>
              <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-1">
                    <div className="text-[#71717A]">Active WebRTC Sessions</div>
                    <div className="text-2xl font-bold text-[#3ECF8E]">14 Instances</div>
                    <div className="text-[10px] text-[#A1A1AA]">Peak Capacity: 64</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-1">
                    <div className="text-[#71717A]">Average Roundtrip Latency</div>
                    <div className="text-2xl font-bold text-white">14.2 ms</div>
                    <div className="text-[10px] text-[#3ECF8E]">Optimal &lt; 20ms</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-1">
                    <div className="text-[#71717A]">GPU Cluster Power</div>
                    <div className="text-2xl font-bold text-white">32x RTX 4090</div>
                    <div className="text-[10px] text-[#3ECF8E]">100% Hydro-Cooled</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: ALL PROJECTS */}
          {activeSection === 'projects' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-display text-white">Architectural Project Pipelines</h2>
                  <p className="text-xs text-[#A1A1AA]">Track milestone proofs, 3D deliverables, and client feedback.</p>
                </div>
                <Link
                  href="/client-dashboard"
                  className="px-3.5 py-2 rounded-lg bg-[#3ECF8E] text-black font-mono font-bold text-xs uppercase"
                >
                  Open Client Portal View
                </Link>
              </div>

              <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-3">
                <div className="space-y-2 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold">The Apex Tower (VIZTR-882)</div>
                      <div className="text-[10px] text-[#71717A]">Foster & Partners · WebXR + 8K Stills</div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#3ECF8E]/20 text-[#3ECF8E] text-[10px]">Client Review (75%)</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold">Solarium Sky Penthouse (VIZTR-904)</div>
                      <div className="text-[10px] text-[#71717A]">Zaha Hadid Architects · Interior 360 Tour</div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#3ECF8E]/20 text-[#3ECF8E] text-[10px]">In Production (50%)</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold">Nordic Monolith Residence (VIZTR-771)</div>
                      <div className="text-[10px] text-[#71717A]">Snøhetta Studio · 8K Stills & Animations</div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px]">Completed (100%)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FALLBACK / OTHER CMS VIEWS */}
          {activeSection !== 'dashboard' && activeSection !== 'ar' && activeSection !== 'vr-configurator' && activeSection !== 'models' && activeSection !== 'streaming' && activeSection !== 'projects' && (
            <div className="p-8 rounded-2xl bg-[#18181B] border border-[#27272A] text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#3ECF8E]/10 border border-[#3ECF8E]/40 flex items-center justify-center mx-auto text-[#3ECF8E]">
                <Settings className="w-6 h-6 animate-spin-slow" />
              </div>
              <h3 className="text-lg font-bold font-display text-white capitalize">
                {activeSection.replace('-', ' ')} Module
              </h3>
              <p className="text-xs text-[#A1A1AA] max-w-md mx-auto font-mono">
                Prisma schema bindings configured. Live CRUD operations synchronized with Postgres database.
              </p>
              <button
                onClick={() => setActiveSection('dashboard')}
                className="px-4 py-2 rounded-lg bg-[#3ECF8E] text-black font-mono font-bold text-xs uppercase"
              >
                Return to Overview
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
