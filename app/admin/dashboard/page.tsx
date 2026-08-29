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
  MessageSquare,
  HardDrive,
  Video,
  DollarSign,
  Filter,
  Plus,
  SlidersHorizontal,
  KeyRound,
  Zap,
  Box as Cube,
  Download
} from 'lucide-react';
import ModelManager from '@/components/admin/ModelManager';
import GoogleDriveAdminManager from '@/components/admin/GoogleDriveAdminManager';
import GoogleMeetAdminManager from '@/components/admin/GoogleMeetAdminManager';
import SuperAdminProjectManager from '@/components/admin/SuperAdminProjectManager';
import ProjectManagementSystem from '@/components/admin/ProjectManagementSystem';
import XRLinkGenerator from '@/components/admin/XRLinkGenerator';
import PixelStreamingSessionControl from '@/components/admin/PixelStreamingSessionControl';
import FileStorageManager from '@/components/admin/FileStorageManager';
import SuperAdminCMSManager from '@/components/admin/SuperAdminCMSManager';
import ApiCredentialsManager from '@/components/admin/ApiCredentialsManager';
import PlayCanvasEngineDashboardTile from '@/components/admin/PlayCanvasEngineDashboardTile';
import SuperAdminPanel from '@/components/admin/SuperAdminPanel';
import { ViztrLogoMark } from '@/components/ui/Logo';
import HermesButton from '@/components/admin/HermesButton';
import CollapsibleLeftFilterPanel from '@/components/dashboard/CollapsibleLeftFilterPanel';
import CollapsibleRightInspectorPanel from '@/components/dashboard/CollapsibleRightInspectorPanel';
import { useAppStore } from '@/lib/store';
import { clearAssetCache } from '@/lib/asset-pipeline';
import {
  INITIAL_MANAGED_PROJECTS,
  ManagedProject,
  ProjectType,
  ProjectStatus,
  PaymentStatus,
  TimesheetEntry
} from '@/lib/projects-data';
import { FolderKanban, QrCode } from 'lucide-react';

// Core Systems & Admin routes / tabs
type ActiveSection =
  | 'dashboard'
  | 'asset-pipeline'
  | 'super-admin-panel'
  | 'super-admin-users'
  | 'super-admin-analytics'
  | 'super-admin-revenue'
  | 'super-admin-gpu'
  | 'super-admin-toggles'
  | 'super-admin-health'
  | 'project-management'
  | 'xr-links'
  | 'pixel-streaming-control'
  | 'file-storage'
  | 'cms-manager'
  | 'pages'
  | 'blog'
  | 'cms-services'
  | 'media'
  | 'design-themes'
  | 'projects'
  | 'vr-configurator'
  | 'ar'
  | 'streaming'
  | 'google-meet'
  | 'bookings'
  | 'support'
  | 'google-drive'
  | 'ai-credentials'
  | 'settings'
  | 'super-admin-crud'
  | 'admins'
  | 'models'
  | 'seo'
  | 'testimonials'
  | 'navigation'
  | 'social'
  | 'users'
  | 'analytics'
  | 'revenue'
  | 'clients'
  | 'inquiries'
  | string;

const SIDEBAR_SECTIONS = [
  {
    title: 'Super Admin Governance',
    items: [
      { id: 'super-admin-panel', label: 'Master Super Admin Panel', icon: Shield },
      { id: 'super-admin-users', label: 'Manage Admins & Users', icon: Users },
      { id: 'super-admin-analytics', label: 'System Analytics', icon: TrendingUp },
      { id: 'super-admin-revenue', label: 'Revenue & MRR Tracking', icon: DollarSign },
      { id: 'super-admin-gpu', label: 'GPU Usage Monitoring', icon: Cpu },
      { id: 'super-admin-toggles', label: 'Feature Toggles Switchboard', icon: SlidersHorizontal },
      { id: 'super-admin-health', label: 'Global Health & Error Logs', icon: Activity },
    ],
  },
  {
    title: 'Core Systems Fleet',
    items: [
      { id: 'project-management', label: 'Project Management', icon: FolderKanban },
      { id: 'xr-links', label: 'XR Link Generator', icon: Box },
      { id: 'pixel-streaming-control', label: 'Pixel Streaming Control', icon: Server },
      { id: 'file-storage', label: 'Multi-Cloud File Storage', icon: HardDrive },
      { id: 'asset-pipeline', label: 'Asset Pipeline', icon: Box },
    ],
  },
  {
    title: 'Super Admin CMS Suite',
    items: [
      { id: 'cms-manager', label: 'Master CMS Engine', icon: Shield },
      { id: 'pages', label: 'Pages & Templates', icon: FileText },
      { id: 'blog', label: 'Blog Posts', icon: FileText },
      { id: 'cms-services', label: 'Services CMS', icon: Layers },
      { id: 'media', label: 'Media & Placeholders', icon: Globe },
      { id: 'design-themes', label: 'Theme & Layout', icon: Palette },
    ],
  },
  {
    title: 'Overview & Pipelines',
    items: [
      { id: 'dashboard', label: 'Platform Overview', icon: Activity },
      { id: 'projects', label: 'Commissions & Pipelines', icon: Database },
    ],
  },
  {
    title: 'XR Real-Time Engine',
    items: [
      { id: 'vr-configurator', label: 'VR Tour Builder', icon: Headset },
      { id: 'ar', label: 'AR QuickLook Assets', icon: Box },
      { id: 'streaming', label: 'GPU Pixel Streaming', icon: Server },
      { id: 'splat-engine', label: 'Gaussian Splat Engine', icon: Cube },
    ],
  },
  {
    title: 'Meetings & Bookings',
    items: [
      { id: 'google-meet', label: 'Google Meet Fleet', icon: Video },
      { id: 'bookings', label: 'All Bookings', icon: Calendar },
      { id: 'support', label: 'Support Tickets', icon: LifeBuoy },
    ],
  },
  {
    title: 'Cloud Infrastructure',
    items: [
      { id: 'google-drive', label: 'Google Drive Fleet', icon: HardDrive },
      { id: 'ai-credentials', label: 'AI & API Credentials', icon: KeyRound },
      { id: 'playcanvas-engine', label: 'PlayCanvas XR Engine', icon: Cube },
      { id: 'settings', label: 'Platform Settings', icon: Settings },
    ],
  },
];

export default function AdminDashboardPage() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [activeRoleView, setActiveRoleView] = useState<'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'CLIENT'>('SUPER_ADMIN');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Managed Projects State (Super Admin / Admin CRUD)
  const [projectsList, setProjectsList] = useState<ManagedProject[]>(INITIAL_MANAGED_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(INITIAL_MANAGED_PROJECTS[0]?.id || 'VIZTR-882');

  // Collapsible Left and Right Panels
  const [leftPanelOpen, setLeftPanelOpen] = useState<boolean>(true);
  const [rightPanelOpen, setRightPanelOpen] = useState<boolean>(true);

  // Left Filter State
  const [filterCriteria, setFilterCriteria] = useState<{
    searchQuery: string;
    projectType: ProjectType | 'all';
    status: ProjectStatus | 'all';
    paymentStatus: PaymentStatus | 'all';
    category: string | 'all';
    budgetTier: 'all' | 'under50k' | '50kTo100k' | 'over100k';
  }>({
    searchQuery: '',
    projectType: 'all',
    status: 'all',
    paymentStatus: 'all',
    category: 'all',
    budgetTier: 'all',
  });

  const { user, showToast } = useAppStore();

  const selectedProject = projectsList.find((p) => p.id === selectedProjectId) || projectsList[0];

  // Super Admin CRUD Handlers
  const handleAddProject = (newProject: ManagedProject) => {
    setProjectsList((prev) => [newProject, ...prev]);
    setSelectedProjectId(newProject.id);
  };

  const handleUpdateProject = (updated: ManagedProject) => {
    setProjectsList((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeleteProject = (id: string) => {
    setProjectsList((prev) => prev.filter((p) => p.id !== id));
  };

  // Hours logging handler
  const handleLogHours = (projectId: string, entry: Omit<TimesheetEntry, 'id'>) => {
    const newEntry: TimesheetEntry = {
      ...entry,
      id: `ts-${Date.now()}`,
    };
    setProjectsList((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const updatedHoursSpent = p.hoursMonitoring.hoursSpent + entry.hours;
          return {
            ...p,
            hoursMonitoring: {
              ...p.hoursMonitoring,
              hoursSpent: updatedHoursSpent,
              timesheetEntries: [newEntry, ...p.hoursMonitoring.timesheetEntries],
            },
          };
        }
        return p;
      })
    );
  };

  const handleResetFilters = () => {
    setFilterCriteria({
      searchQuery: '',
      projectType: 'all',
      status: 'all',
      paymentStatus: 'all',
      category: 'all',
      budgetTier: 'all',
    });
    showToast('Filters reset.', 'info');
  };

  // Computed summary metrics
  const totalRevenue = projectsList.reduce((acc, p) => acc + p.bookingAmount, 0);
  const totalHoursLogged = projectsList.reduce((acc, p) => acc + p.hoursMonitoring.hoursSpent, 0);
  const totalEstimatedHours = projectsList.reduce((acc, p) => acc + p.hoursMonitoring.estimatedHours, 0);
  const activeProjectsCount = projectsList.filter((p) => p.status === 'Work in Progress' || p.status === 'Client Review').length;

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col w-full">
      {/* ADMIN TOP BAR */}
      <header className="h-16 border-b border-[#27272A] bg-[#18181B] px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-40 w-full">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden p-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white"
          >
            {mobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            <ViztrLogoMark className="w-7 h-7 group-hover:scale-105 transition-transform" />
            <span className="font-serif font-bold text-lg tracking-wider text-white">
              VizTR
            </span>
            <span className="hidden sm:inline px-2 py-0.5 rounded bg-[#09090B] border border-[#27272A] text-[#e2c073] text-[10px] font-mono font-bold uppercase">
              Super Admin Core v3.0
            </span>
          </Link>
        </div>

        {/* Global Admin Search & View Controls */}
        <div className="hidden md:flex items-center gap-4 max-w-lg w-full">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, client tokens, assets, hour logs..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
            />
          </div>
        </div>

        {/* User Info & Panel Toggles */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Panel Toggle Buttons */}
          <button
            type="button"
            onClick={() => setLeftPanelOpen(!leftPanelOpen)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-colors flex items-center gap-1.5 cursor-pointer ${
              leftPanelOpen
                ? 'bg-[#3ECF8E]/20 text-[#3ECF8E] border-[#3ECF8E]/40'
                : 'bg-[#09090B] text-[#A1A1AA] border-[#27272A] hover:text-white'
            }`}
            title="Toggle Left Filter Panel"
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Filters</span>
          </button>

          <button
            type="button"
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-colors flex items-center gap-1.5 cursor-pointer ${
              rightPanelOpen
                ? 'bg-[#3ECF8E]/20 text-[#3ECF8E] border-[#3ECF8E]/40'
                : 'bg-[#09090B] text-[#A1A1AA] border-[#27272A] hover:text-white'
            }`}
            title="Toggle Right Hours & Pipeline Inspector"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Hours & Pipeline</span>
          </button>

          <button
            onClick={() => showToast('Cluster healthy: 0 critical pipeline alerts.', 'info')}
            className="p-2 rounded-lg bg-[#09090B] border border-[#27272A] text-[#A1A1AA] hover:text-white relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-[#3ECF8E] absolute top-1.5 right-1.5" />
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-[#27272A]">
            <div className="w-8 h-8 rounded-full bg-[#3ECF8E]/20 border border-[#3ECF8E]/40 flex items-center justify-center text-xs font-mono font-bold text-[#3ECF8E]">
              SA
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-mono font-bold text-white">SuperAdmin Master</div>
              <div className="text-[10px] font-mono text-[#3ECF8E]">Full Authority</div>
            </div>
          </div>

          <Link
            href="/client-dashboard"
            className="px-3 py-1.5 rounded-lg bg-[#27272A] hover:bg-[#3ECF8E] hover:text-black border border-[#27272A] text-xs font-mono font-bold text-white transition-all"
            title="Switch to Client Portal View"
          >
            Client View →
          </Link>
        </div>
      </header>

      {/* MAIN CONTAINER (FLUID WIDE SCREEN ADAPTABILITY) */}
      <div className="flex-1 flex overflow-hidden w-full max-w-[2400px] mx-auto">
        {/* SIDEBAR NAVIGATION (240px desktop) */}
        <aside
          className={`w-[240px] bg-[#18181B] border-r border-[#27272A] flex flex-col justify-between overflow-y-auto shrink-0 transition-all z-30 ${
            mobileSidebarOpen ? 'fixed inset-y-16 left-0 shadow-2xl z-50' : 'hidden md:flex'
          }`}
        >
          <div className="p-3.5 space-y-5">
            {SIDEBAR_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-1">
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
                        className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 transition-all text-left cursor-pointer ${
                          isActive
                            ? 'bg-[#09090B] text-[#3ECF8E] font-bold border-l-2 border-[#3ECF8E] pl-2'
                            : 'text-[#A1A1AA] hover:text-white hover:bg-[#09090B]/50'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#3ECF8E]' : 'text-[#71717A]'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-[#27272A] text-[10px] font-mono text-[#71717A] flex items-center justify-between">
            <span>Prisma 5.x DB Sync</span>
            <span className="text-[#3ECF8E] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E] animate-pulse" />
              Live Connected
            </span>
          </div>
        </aside>

        {/* COLLAPSIBLE LEFT FILTER PANEL */}
        <CollapsibleLeftFilterPanel
          isOpen={leftPanelOpen}
          onToggle={() => setLeftPanelOpen(!leftPanelOpen)}
          projects={projectsList}
          selectedProjectId={selectedProjectId}
          onSelectProject={(id) => {
            setSelectedProjectId(id);
            setActiveSection('projects');
          }}
          filters={filterCriteria}
          onFilterChange={setFilterCriteria}
          onResetFilters={handleResetFilters}
          userRole="SUPER_ADMIN"
        />

        {/* CENTRAL WORKSPACE (EXPANDS ON WIDESCREEN) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 min-w-0">
          {/* SECTION 1: PLATFORM OVERVIEW & TELEMETRY */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* TOP HEADER */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E] font-bold uppercase">
                  <Shield className="w-4 h-4" />
                  <span>SUPER ADMIN EXECUTIVE COMMAND CONSOLE</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
                  Platform Operations, Hours Telemetry & Pipeline Cluster
                </h1>
                <p className="text-xs text-[#A1A1AA]">
                  Full-stack project monitoring, real-time hours burn tracking, WebRTC streaming telemetry, and client deliverable sign-offs.
                </p>
              </div>

              {/* STATS CARDS WITH LIVE AGGREGATIONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-1">
                  <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-mono">
                    <span>TOTAL COMMISSIONS</span>
                    <Database className="w-4 h-4 text-[#3ECF8E]" />
                  </div>
                  <div className="text-2xl font-bold text-white font-mono">{projectsList.length} Projects</div>
                  <div className="text-[10px] text-[#3ECF8E]">{activeProjectsCount} In Active Production</div>
                </div>

                <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-1">
                  <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-mono">
                    <span>CONTRACT VALUE</span>
                    <DollarSign className="w-4 h-4 text-[#3ECF8E]" />
                  </div>
                  <div className="text-2xl font-bold text-[#3ECF8E] font-mono">
                    ${totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-[#A1A1AA]">Across All Disciplines</div>
                </div>

                <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-1">
                  <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-mono">
                    <span>HOURS LOGGED</span>
                    <Clock className="w-4 h-4 text-[#3ECF8E]" />
                  </div>
                  <div className="text-2xl font-bold text-white font-mono">
                    {totalHoursLogged.toFixed(1)} / {totalEstimatedHours.toFixed(1)}h
                  </div>
                  <div className="text-[10px] text-[#3ECF8E]">
                    {Math.round((totalHoursLogged / Math.max(totalEstimatedHours, 1)) * 100)}% Global Burn Rate
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-1">
                  <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-mono">
                    <span>GPU CLUSTER STATUS</span>
                    <Server className="w-4 h-4 text-[#3ECF8E]" />
                  </div>
                  <div className="text-2xl font-bold text-white font-mono">32 Nodes Active</div>
                  <div className="text-[10px] text-[#3ECF8E]">14.2ms WebRTC Latency</div>
                </div>
              </div>

              {/* CURRENTLY SELECTED COMMISSION SPOTLIGHT */}
              {selectedProject && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#18181B] to-[#121214] border border-[#27272A] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272A] pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#3ECF8E]">
                          Active Focus: {selectedProject.id}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#27272A] text-[10px] font-mono text-white">
                          {selectedProject.projectType}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#27272A] text-[10px] font-mono text-[#3ECF8E]">
                          ${selectedProject.bookingAmount.toLocaleString()}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold font-display text-white">
                        {selectedProject.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveSection('super-admin-crud')}
                        className="px-3.5 py-1.5 rounded-lg bg-[#3ECF8E] text-black font-mono font-bold text-xs"
                      >
                        Open Super Admin Authority →
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-[#09090B] border border-[#27272A]">
                      <div className="text-[#71717A]">CLIENT & PRACTICE</div>
                      <div className="text-white font-bold">{selectedProject.clientName}</div>
                      <div className="text-[10px] text-[#A1A1AA]">{selectedProject.clientCompany}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#09090B] border border-[#27272A]">
                      <div className="text-[#71717A]">HOURS MONITORING</div>
                      <div className="text-white font-bold">
                        {selectedProject.hoursMonitoring.hoursSpent}h logged ({selectedProject.hoursMonitoring.estimatedHours}h budget)
                      </div>
                      <div className="text-[10px] text-[#3ECF8E]">
                        @ ${selectedProject.hoursMonitoring.hourlyRate}/hr
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#09090B] border border-[#27272A]">
                      <div className="text-[#71717A]">TAILORED PIPELINE</div>
                      <div className="text-white font-bold truncate">
                        {selectedProject.pipeline.pipelineType}
                      </div>
                      <div className="text-[10px] text-[#3ECF8E]">
                        Stage {selectedProject.pipeline.currentStageIndex + 1} of {selectedProject.pipeline.stages.length}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUPER ADMIN GOVERNANCE COMMAND HERO */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#18181B] to-[#121214] border border-purple-800/40 shadow-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold font-display text-white">
                        Super Admin Governance & System Infrastructure
                      </h3>
                      <p className="text-xs text-[#A1A1AA]">
                        RBAC user & admin management, MRR revenue tracking, global GPU telemetry, feature switchboard & diagnostics.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSection('super-admin-panel')}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
                  >
                    <span>Open Super Admin Console</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
                  {[
                    { id: 'super-admin-users', label: 'Admins & Users', icon: Users, desc: 'Role management & 2FA' },
                    { id: 'super-admin-analytics', label: 'System Analytics', icon: TrendingUp, desc: 'Growth & project counts' },
                    { id: 'super-admin-revenue', label: 'Revenue & MRR', icon: DollarSign, desc: '$156.5k MRR & ARR' },
                    { id: 'super-admin-gpu', label: 'GPU Cluster Fleet', icon: Cpu, desc: 'Global regional load' },
                    { id: 'super-admin-toggles', label: 'Feature Toggles', icon: SlidersHorizontal, desc: 'Global switchboard' },
                    { id: 'super-admin-health', label: 'System Health', icon: Activity, desc: 'Uptime & error logs' },
                  ].map((tile) => {
                    const TileIcon = tile.icon;
                    return (
                      <button
                        key={tile.id}
                        onClick={() => setActiveSection(tile.id)}
                        className="p-3 rounded-xl bg-[#09090B] hover:bg-[#18181B] border border-[#27272A] hover:border-purple-500/50 text-left transition-all group cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <TileIcon className="w-3.5 h-3.5 text-purple-400" />
                          <ChevronRight className="w-3 h-3 text-[#71717A] group-hover:text-white" />
                        </div>
                        <div className="font-bold text-xs text-white font-display truncate">
                          {tile.label}
                        </div>
                        <div className="text-[9px] text-[#71717A] font-mono truncate">
                          {tile.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4 CORE SYSTEMS QUICK LAUNCH TILES */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#3ECF8E]" />
                    <span>Studio Core Systems Command Fleet</span>
                  </h3>
                  <span className="text-[10px] font-mono text-[#3ECF8E]">v3.2 Production Fleet</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div
                    onClick={() => setActiveSection('project-management')}
                    className="p-4 rounded-xl bg-gradient-to-br from-[#18181B] to-[#121214] border border-[#27272A] hover:border-[#3ECF8E] transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-[#3ECF8E]/10 border border-[#3ECF8E]/40 flex items-center justify-center text-[#3ECF8E] group-hover:scale-105 transition-transform">
                        <FolderKanban className="w-4 h-4" />
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#71717A] group-hover:text-[#3ECF8E] transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white font-display">Project Management</h4>
                      <p className="text-[10px] text-[#A1A1AA] mt-0.5">Create, assign team roles, track pipeline status & assets.</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveSection('xr-links')}
                    className="p-4 rounded-xl bg-gradient-to-br from-[#18181B] to-[#121214] border border-[#27272A] hover:border-[#3ECF8E] transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-sky-950/80 border border-sky-800 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                        <Box className="w-4 h-4" />
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#71717A] group-hover:text-sky-400 transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white font-display">XR Link Generator</h4>
                      <p className="text-[10px] text-[#A1A1AA] mt-0.5">Generate unique tokens, map 3D models & QR codes.</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveSection('pixel-streaming-control')}
                    className="p-4 rounded-xl bg-gradient-to-br from-[#18181B] to-[#121214] border border-[#27272A] hover:border-[#3ECF8E] transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-800 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                        <Server className="w-4 h-4" />
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#71717A] group-hover:text-purple-400 transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white font-display">Pixel Streaming Control</h4>
                      <p className="text-[10px] text-[#A1A1AA] mt-0.5">Manage WebRTC URLs, GPU nodes & live VRAM telemetry.</p>
                      </div>
                      </div>

                      <div
                      onClick={() => setActiveSection('file-storage')}
                      className="p-4 rounded-xl bg-gradient-to-br from-[#18181B] to-[#121214] border border-[#27272A] hover:border-[#3ECF8E] transition-all cursor-pointer space-y-2 group"
                      >
                      <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                        <HardDrive className="w-4 h-4" />
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#71717A] group-hover:text-amber-400 transition-colors" />
                      </div>
                      <div>
                      <h4 className="text-xs font-bold text-white font-display">Multi-Cloud File Storage</h4>
                      <p className="text-[10px] text-[#A1A1AA] mt-0.5">AWS S3, Cloudflare R2, Google Drive Local symlinks.</p>
                      </div>
                      </div>

                      <div
                      onClick={() => setActiveSection('splat-engine')}
                      className="p-4 rounded-xl bg-gradient-to-br from-[#18181B] to-[#121214] border border-[#27272A] hover:border-[#3ECF8E] transition-all cursor-pointer space-y-2 group"
                      >
                      <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-800 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
                        <Cube className="w-4 h-4" />
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#71717A] group-hover:text-rose-400 transition-colors" />
                      </div>
                      <div>
                      <h4 className="text-xs font-bold text-white font-display">Gaussian Splat Engine</h4>
                      <p className="text-[10px] text-[#A1A1AA] mt-0.5">Multi-scene viewer, load progress, visibility toggles.</p>
                      </div>
                      </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-950/80 border border-purple-800 flex items-center justify-center text-purple-400">
                    <Cube className="w-3 h-3" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-white font-display">PlayCanvas XR Engine</h5>
                    <p className="text-[9px] text-[#A1A1AA]">WebXR native VR/AR runtime with real-time GLTF loading and material editing.</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#71717A]" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#09090B] border border-[#27272A] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
                    <Globe className="w-3 h-3" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-white font-display">Virtual Tours</h5>
                    <p className="text-[9px] text-[#A1A1AA]">Interactive 360° panoramas with hotspots and navigation.</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#71717A]" />
              </div>
            </div>
          </div>

          {/* SUPER ADMIN CMS QUICK SUITE BAR */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#18181B] via-[#14161D] to-[#121214] border border-[#27272A] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#3ECF8E]" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Super Admin CMS Quick Access Hub
                </h3>
              </div>
              <button
                onClick={() => setActiveSection('cms-manager')}
                className="text-[11px] font-mono text-[#3ECF8E] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Open Master CMS Engine</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {[
                { id: 'pages', label: 'Pages & SEO', icon: FileText, desc: 'CRUD & Templates' },
                { id: 'blog', label: 'Blog Posts', icon: FileText, desc: 'Articles & Drafts' },
                { id: 'cms-services', label: 'Services CMS', icon: Layers, desc: 'Tiers & Specs' },
                { id: 'media', label: 'Media Library', icon: Globe, desc: 'Uploads & Placeholders' },
                { id: 'design-themes', label: 'Theme & Order', icon: Palette, desc: 'Colors & Reordering' },
                { id: 'cms-manager', label: 'Social & Menus', icon: Share2, desc: 'Navigation & Links' },
              ].map((tile) => {
                const TileIcon = tile.icon;
                return (
                  <button
                    key={tile.id}
                    onClick={() => setActiveSection(tile.id)}
                    className="p-3 rounded-xl bg-[#09090B] hover:bg-[#18181B] border border-[#27272A] hover:border-[#3ECF8E]/40 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <TileIcon className="w-3.5 h-3.5 text-[#3ECF8E]" />
                      <ChevronRight className="w-3 h-3 text-[#71717A] group-hover:text-white" />
                    </div>
                    <div className="font-bold text-xs text-white font-display truncate">
                      {tile.label}
                    </div>
                    <div className="text-[9px] text-[#71717A] font-mono truncate">
                      {tile.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3D MODEL & ASSET MANAGEMENT SECTION EMBED */}
          <div className="space-y-3">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#A1A1AA]">
              Spatial Model Inventory & Draco Compression Pipeline
            </h3>
            <ModelManager />
          </div>

          {/* ASSET PIPELINE SECTION */}
          {activeSection.includes('asset-pipeline') && (
           <div className="space-y-6">
           </div>
          )}

          {/* SUPER ADMIN CMS QUICK SUITE BAR */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#18181B] via-[#14161D] to-[#121214] border border-[#27272A] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#3ECF8E]" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                      Super Admin CMS Quick Access Hub
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveSection('cms-manager')}
                    className="text-[11px] font-mono text-[#3ECF8E] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Master CMS Engine</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {[
                    { id: 'pages', label: 'Pages & SEO', icon: FileText, desc: 'CRUD & Templates' },
                    { id: 'blog', label: 'Blog Posts', icon: FileText, desc: 'Articles & Drafts' },
                    { id: 'cms-services', label: 'Services CMS', icon: Layers, desc: 'Tiers & Specs' },
                    { id: 'media', label: 'Media Library', icon: Globe, desc: 'Uploads & Placeholders' },
                    { id: 'design-themes', label: 'Theme & Order', icon: Palette, desc: 'Colors & Reordering' },
                    { id: 'cms-manager', label: 'Social & Menus', icon: Share2, desc: 'Navigation & Links' },
                  ].map((tile) => {
                    const TileIcon = tile.icon;
                    return (
                      <button
                        key={tile.id}
                        onClick={() => setActiveSection(tile.id)}
                        className="p-3 rounded-xl bg-[#09090B] hover:bg-[#18181B] border border-[#27272A] hover:border-[#3ECF8E]/40 text-left transition-all group cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <TileIcon className="w-3.5 h-3.5 text-[#3ECF8E]" />
                          <ChevronRight className="w-3 h-3 text-[#71717A] group-hover:text-white" />
                        </div>
                        <div className="font-bold text-xs text-white font-display truncate">
                          {tile.label}
                        </div>
                        <div className="text-[9px] text-[#71717A] font-mono truncate">
                          {tile.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3D MODEL & ASSET MANAGEMENT SECTION EMBED */}
              <div className="space-y-3">
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#A1A1AA]">
                  Spatial Model Inventory & Draco Compression Pipeline
                </h3>
                <ModelManager />
              </div>

              {/* ASSET PIPELINE SECTION */}
              {activeSection.includes('asset-pipeline') && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E] font-bold uppercase">
                      <Box className="w-4 h-4" />
                      <span>ASSET PIPELINE</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
                      3D Asset Loading & Compression Pipeline
                    </h2>
                    <p className="text-xs text-[#A1A1AA]">
                      Auto-detects GLB/GLTF formats with Draco geometry compression, KTX2 texture transcoding, and Meshopt mesh optimization.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-800 flex items-center justify-center text-blue-400">
                            <Box className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white font-display">Draco Compression</h4>
                            <p className="text-[10px] text-[#A1A1AA]">Geometry compression</p>
                          </div>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-[#3ECF8E]" />
                      </div>
                      <div className="text-xs text-[#A1A1AA] space-y-1">
                        <p>Binary (.drc) mesh decoding</p>
                        <p>WebAssembly accelerated</p>
                        <p>Multi-threaded workers</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-800 flex items-center justify-center text-purple-400">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white font-display">KTX2 Transcoding</h4>
                            <p className="text-[10px] text-[#A1A1AA]">GPU texture formats</p>
                          </div>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-[#3ECF8E]" />
                      </div>
                      <div className="text-xs text-[#A1A1AA] space-y-1">
                        <p>Basis Universal transcoder</p>
                        <p>ASTC, BC, ETC fallbacks</p>
                        <p>Mipmap generation</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400">
                            <Zap className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white font-display">Meshopt Optimization</h4>
                            <p className="text-[10px] text-[#A1A1AA]">Mesh optimization</p>
                          </div>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-[#3ECF8E]" />
                      </div>
                      <div className="text-xs text-[#A1A1AA] space-y-1">
                        <p>Vertex cache optimization</p>
                        <p>Overdraw reduction</p>
                        <p>Index buffer compression</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#18181B] to-[#121214] border border-[#27272A] space-y-4">
                    <h3 className="text-sm font-bold text-white">Cache Management</h3>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => {
                          clearAssetCache();
                          showToast('Asset cache cleared', 'success');
                        }}
                        className="px-4 py-2 rounded-lg bg-red-950/80 border border-red-800 text-red-400 text-xs font-mono font-bold hover:bg-red-950 hover:text-red-300 transition-all cursor-pointer flex items-center gap-2"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Clear Asset Cache</span>
                      </button>
                      <span className="text-xs text-[#71717A]">
                        Clears Three.js LoadingManager cache and decoder worker pool
                      </span>
                    </div>
                    <div className="text-xs text-[#A1A1AA] font-mono">
                      Supported: .glb, .gltf &nbsp;|&nbsp; Auto-detect &nbsp;|&nbsp; Streaming load with progress
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION: SUPER ADMIN GOVERNANCE PANEL */}
          {(activeSection === 'super-admin-panel' ||
            activeSection === 'super-admin-users' ||
            activeSection === 'super-admin-analytics' ||
            activeSection === 'super-admin-revenue' ||
            activeSection === 'super-admin-gpu' ||
            activeSection === 'super-admin-toggles' ||
            activeSection === 'super-admin-health' ||
            activeSection === 'users' ||
            activeSection === 'analytics' ||
            activeSection === 'revenue' ||
            activeSection === 'clients' ||
            activeSection === 'inquiries') && (
            <SuperAdminPanel
              currentRoleView={activeRoleView}
              onSwitchRoleView={setActiveRoleView}
            />
          )}

          {/* SECTION: PROJECT MANAGEMENT SYSTEM */}
          {activeSection === 'project-management' && (
            <ProjectManagementSystem
              projects={projectsList}
              onAddProject={handleAddProject}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
            />
          )}

          {/* SECTION: XR LINK GENERATOR */}
          {activeSection === 'xr-links' && (
            <XRLinkGenerator projects={projectsList} />
          )}

          {/* SECTION: PIXEL STREAMING CONTROL */}
          {(activeSection === 'pixel-streaming-control' || activeSection === 'streaming') && (
            <PixelStreamingSessionControl />
          )}

          {/* SECTION: MULTI-CLOUD & LOCAL FILE STORAGE */}
          {activeSection === 'file-storage' && (
            <FileStorageManager projects={projectsList} />
          )}

          {/* SECTION 2: SUPER ADMIN MASTER CRUD */}
          {(activeSection === 'super-admin-crud' || activeSection === 'projects' || activeSection === 'admins') && (
            <SuperAdminProjectManager
              projects={projectsList}
              onAddProject={handleAddProject}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
            />
          )}

          {/* SECTION 3: XR & REAL-TIME ENGINE */}
          {(activeSection === 'ar' || activeSection === 'vr-configurator' || activeSection === 'models') && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold font-display text-white">Spatial 3D & WebXR Asset Manager</h2>
                <p className="text-xs text-[#A1A1AA]">Upload GLB/GLTF geometry, inspect Draco polygon compression, and toggle WebXR surface anchoring.</p>
              </div>
              <ModelManager />
            </div>
          )}

          {/* SECTION: SUPER ADMIN MASTER CMS SUITE */}
          {(activeSection === 'cms-manager' ||
            activeSection === 'pages' ||
            activeSection === 'blog' ||
            activeSection === 'cms-services' ||
            activeSection === 'media' ||
            activeSection === 'design-themes' ||
            activeSection === 'seo' ||
            activeSection === 'testimonials' ||
            activeSection === 'navigation' ||
            activeSection === 'social') && (
            <SuperAdminCMSManager />
          )}

          {/* SECTION 5: GOOGLE DRIVE */}
          {activeSection === 'google-drive' && <GoogleDriveAdminManager />}

          {/* SECTION 6: GOOGLE MEET */}
          {activeSection === 'google-meet' && <GoogleMeetAdminManager isSuperAdmin={true} />}

          {/* SECTION: PLAYCANVAS ENGINE */}
          {activeSection === 'playcanvas-engine' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E] font-bold uppercase">
                  <Cube className="w-4 h-4" />
                  <span>PLAYCANVAS XR ENGINE</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">PlayCanvas WebXR Runtime</h2>
                <p className="text-xs text-[#A1A1AA]">
                  WebXR native VR/AR engine with real-time GLTF loading, material editing, and GPU-accelerated rendering. Access immersive 3D experiences directly from the browser.
                </p>
              </div>
              <PlayCanvasEngineDashboardTile />
            </div>
          )}

          {/* FALLBACK / OTHER CMS VIEWS */}
          {activeSection !== 'dashboard' &&
            activeSection !== 'super-admin-panel' &&
            activeSection !== 'super-admin-users' &&
            activeSection !== 'super-admin-analytics' &&
            activeSection !== 'super-admin-revenue' &&
            activeSection !== 'super-admin-gpu' &&
            activeSection !== 'super-admin-toggles' &&
            activeSection !== 'super-admin-health' &&
            activeSection !== 'users' &&
            activeSection !== 'analytics' &&
            activeSection !== 'revenue' &&
            activeSection !== 'clients' &&
            activeSection !== 'inquiries' &&
            activeSection !== 'project-management' &&
            activeSection !== 'xr-links' &&
            activeSection !== 'pixel-streaming-control' &&
            activeSection !== 'file-storage' &&
            activeSection !== 'super-admin-crud' &&
            activeSection !== 'projects' &&
            activeSection !== 'admins' &&
            activeSection !== 'google-drive' &&
            activeSection !== 'google-meet' &&
            activeSection !== 'ar' &&
            activeSection !== 'vr-configurator' &&
            activeSection !== 'models' &&
            activeSection !== 'streaming' &&
            activeSection !== 'cms-manager' &&
            activeSection !== 'pages' &&
            activeSection !== 'blog' &&
            activeSection !== 'cms-services' &&
            activeSection !== 'media' &&
            activeSection !== 'design-themes' &&
            activeSection !== 'seo' &&
            activeSection !== 'testimonials' &&
            activeSection !== 'navigation' &&
            activeSection !== 'social' && (
              <div className="p-8 rounded-2xl bg-[#18181B] border border-[#27272A] text-center space-y-4 font-mono">
                <div className="w-12 h-12 rounded-full bg-[#3ECF8E]/10 border border-[#3ECF8E]/40 flex items-center justify-center mx-auto text-[#3ECF8E]">
                  <Settings className="w-6 h-6 animate-spin-slow" />
                </div>
                <h3 className="text-lg font-bold font-display text-white capitalize">
                  {activeSection.replace('-', ' ')} Super Admin Workspace
                </h3>
                <p className="text-xs text-[#A1A1AA] max-w-md mx-auto">
                  Prisma schema bindings configured. Live CRUD operations synchronized with Postgres database.
                </p>
                <button
                  onClick={() => setActiveSection('dashboard')}
                  className="px-4 py-2 rounded-lg bg-[#3ECF8E] text-black font-bold text-xs uppercase"
                >
                  Return to Overview
                </button>
              </div>
            )}
        </main>

        {/* COLLAPSIBLE RIGHT INSPECTOR & HOURS MONITORING PANEL */}
        {selectedProject && (
          <CollapsibleRightInspectorPanel
            isOpen={rightPanelOpen}
            onToggle={() => setRightPanelOpen(!rightPanelOpen)}
            project={selectedProject}
            onLogHours={handleLogHours}
            userRole="SUPER_ADMIN"
          />
        )}
      </div>

      {/* Hermes AI Assistant Button */}
      <HermesButton user={user} />
    </div>
  );
}
