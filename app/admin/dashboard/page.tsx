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
  SlidersHorizontal
} from 'lucide-react';
import ModelManager from '@/components/admin/ModelManager';
import GoogleDriveAdminManager from '@/components/admin/GoogleDriveAdminManager';
import GoogleMeetAdminManager from '@/components/admin/GoogleMeetAdminManager';
import SuperAdminProjectManager from '@/components/admin/SuperAdminProjectManager';
import CollapsibleLeftFilterPanel from '@/components/dashboard/CollapsibleLeftFilterPanel';
import CollapsibleRightInspectorPanel from '@/components/dashboard/CollapsibleRightInspectorPanel';
import { useAppStore } from '@/lib/store';
import {
  INITIAL_MANAGED_PROJECTS,
  ManagedProject,
  ProjectType,
  ProjectStatus,
  PaymentStatus,
  TimesheetEntry
} from '@/lib/projects-data';

// 6 Sections with admin routes / tabs
const SIDEBAR_SECTIONS = [
  {
    title: 'Overview & Pipelines',
    items: [
      { id: 'dashboard', label: 'Platform Overview', icon: Activity },
      { id: 'projects', label: 'Commissions & Pipelines', icon: Database },
      { id: 'analytics', label: 'Analytics & Hours', icon: TrendingUp },
    ],
  },
  {
    title: 'Super Admin Authority',
    items: [
      { id: 'super-admin-crud', label: 'Master CRUD & Telemetry', icon: Shield },
      { id: 'users', label: 'User & Client Roles', icon: Users },
      { id: 'clients', label: 'Client Access Tokens', icon: UserCheck },
      { id: 'inquiries', label: 'Contact Inquiries', icon: MessageSquare },
    ],
  },
  {
    title: 'XR & Real-Time Engine',
    items: [
      { id: 'vr-configurator', label: 'VR Tour Builder', icon: Headset },
      { id: 'ar', label: 'AR QuickLook Assets', icon: Box },
      { id: 'streaming', label: 'GPU & Pixel Streaming', icon: Server },
    ],
  },
  {
    title: 'Content & Design',
    items: [
      { id: 'blog', label: 'Blog Management', icon: FileText },
      { id: 'cms-services', label: 'Services CMS', icon: Layers },
      { id: 'media', label: 'Media Library', icon: Globe },
      { id: 'design-themes', label: 'Theme Manager', icon: Palette },
      { id: 'seo', label: 'SEO Settings', icon: Globe },
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
      { id: 'settings', label: 'Platform Settings', icon: Settings },
    ],
  },
];

export default function AdminDashboardPage() {
  const [activeSection, setActiveSection] = useState('dashboard');
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

          <Link href="/" className="flex items-center gap-2">
            <span className="font-display font-black text-lg tracking-wider text-white">
              VIZ<span className="text-[#3ECF8E]">TR</span>
            </span>
            <span className="hidden sm:inline px-2 py-0.5 rounded bg-[#09090B] border border-[#27272A] text-[#3ECF8E] text-[10px] font-mono font-bold uppercase">
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

              {/* 3D MODEL & ASSET MANAGEMENT SECTION EMBED */}
              <div className="space-y-3">
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#A1A1AA]">
                  Spatial Model Inventory & Draco Compression Pipeline
                </h3>
                <ModelManager />
              </div>
            </div>
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

          {/* SECTION 4: STREAMING */}
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

          {/* SECTION 5: GOOGLE DRIVE */}
          {activeSection === 'google-drive' && <GoogleDriveAdminManager />}

          {/* SECTION 6: GOOGLE MEET */}
          {activeSection === 'google-meet' && <GoogleMeetAdminManager isSuperAdmin={true} />}

          {/* FALLBACK / OTHER CMS VIEWS */}
          {activeSection !== 'dashboard' &&
            activeSection !== 'super-admin-crud' &&
            activeSection !== 'projects' &&
            activeSection !== 'admins' &&
            activeSection !== 'google-drive' &&
            activeSection !== 'google-meet' &&
            activeSection !== 'ar' &&
            activeSection !== 'vr-configurator' &&
            activeSection !== 'models' &&
            activeSection !== 'streaming' && (
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
    </div>
  );
}
