'use client';

import React, { useState, useEffect, Suspense, lazy } from 'react';
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
  Download,
  Brain,
} from 'lucide-react';
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
import { FolderKanban, QrCode, FileCheck } from 'lucide-react';

import {
  DashboardOverview,
  SuperAdminGovernance,
  CoreSystemsFleet,
  SuperAdminCMS,
  DocStudioCRMSection,
  XRRealTimeEngine,
  MeetingsBookings,
  CloudInfrastructure,
  ClientDiscoveryForm,
} from '@/components/admin/sections';

// =====================================================================
// LAZY-LOADED HEAVY COMPONENTS
// =====================================================================

const SuperAdminPanel = lazy(() => import('@/components/admin/SuperAdminPanel').then(m => ({ default: m.default })));
const DocStudioCRMFull = lazy(() => import('@/components/admin/DocStudioCRM').then(m => ({ default: m.default })));
const SuperAdminCMSManager = lazy(() => import('@/components/admin/SuperAdminCMSManager').then(m => ({ default: m.default })));
const SuperAdminProjectManager = lazy(() => import('@/components/admin/SuperAdminProjectManager').then(m => ({ default: m.default })));
const ProjectManagementSystem = lazy(() => import('@/components/admin/ProjectManagementSystem').then(m => ({ default: m.default })));
const XRLinkGenerator = lazy(() => import('@/components/admin/XRLinkGenerator').then(m => ({ default: m.default })));
const VirtualTourAdminPanel = lazy(() => import('@/components/admin/VirtualTourAdminPanel').then(m => ({ default: m.default })));
const PixelStreamingSessionControl = lazy(() => import('@/components/admin/PixelStreamingSessionControl').then(m => ({ default: m.default })));
const FileStorageManager = lazy(() => import('@/components/admin/FileStorageManager').then(m => ({ default: m.default })));
const GoogleDriveAdminManager = lazy(() => import('@/components/admin/GoogleDriveAdminManager').then(m => ({ default: m.default })));
const GoogleMeetAdminManager = lazy(() => import('@/components/admin/GoogleMeetAdminManager').then(m => ({ default: m.default })));
const ModelManager = lazy(() => import('@/components/admin/ModelManager').then(m => ({ default: m.default })));
const PlayCanvasEngineDashboardTile = lazy(() => import('@/components/admin/PlayCanvasEngineDashboardTile').then(m => ({ default: m.default })));
const ApiCredentialsManager = lazy(() => import('@/components/admin/ApiCredentialsManager').then(m => ({ default: m.default })));
const AIDashboardPanel = lazy(() => import('@/components/admin/AIDashboardPanel').then(m => ({ default: m.default })));
const ClientDiscoveryManager = lazy(() => import('@/components/admin/ClientDiscoveryManager').then(m => ({ default: m.default })));

// =====================================================================
// SECTION TYPE DEFINITIONS
// =====================================================================

type ActiveSection =
  | 'dashboard'
  | 'client-discovery'
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
  | 'doc-studio-crm'
  | 'splat-engine'
  | 'virtual-tour-config'
  | 'playcanvas-engine'
  | 'ai-platform'
  | string;

const SIDEBAR_SECTIONS = [
  {
    title: 'Super Admin Governance',
    items: [
      { id: 'client-discovery', label: 'Client Discovery Form', icon: FileCheck },
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
    title: 'Doc Studio & CRM',
    items: [
      { id: 'doc-studio-crm', label: 'Doc Studio & CRM', icon: FileText },
    ],
  },
  {
    title: 'XR Real-Time Engine',
    items: [
      { id: 'vr-configurator', label: 'VR Tour Builder', icon: Headset },
      { id: 'ar', label: 'AR QuickLook Assets', icon: Box },
      { id: 'streaming', label: 'GPU Pixel Streaming', icon: Server },
      { id: 'splat-engine', label: 'Gaussian Splat Engine', icon: Cube },
      { id: 'virtual-tour-config', label: '360° Virtual Tour', icon: Globe },
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
      { id: 'ai-platform', label: 'AI Platform', icon: Brain },
    ],
  },
];

function SectionFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#3ECF8E]/30 border-t-[#3ECF8E] rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-[#71717A]">Loading section...</p>
      </div>
    </div>
  );
}

// =====================================================================
// ADMIN TOP BAR COMPONENT
// =====================================================================

function AdminTopBar({ 
  searchQuery, 
  setSearchQuery, 
  leftPanelOpen, 
  setLeftPanelOpen, 
  rightPanelOpen, 
  setRightPanelOpen,
  setMobileSidebarOpen,
  showToast,
  user,
}: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  leftPanelOpen: boolean;
  setLeftPanelOpen: (v: boolean) => void;
  rightPanelOpen: boolean;
  setRightPanelOpen: (v: boolean) => void;
  setMobileSidebarOpen: (v: boolean) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  user: any;
}) {
  return (
    <header className="h-16 border-b border-[#27272A] bg-[#18181B] px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-40 w-full">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="md:hidden p-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white"
        >
          <Menu className="w-4 h-4" />
        </button>
        <Link href="/" className="flex items-center gap-2.5 group">
          <ViztrLogoMark className="w-7 h-7 group-hover:scale-105 transition-transform" />
          <span className="font-serif font-bold text-lg tracking-wider text-white">VizTR</span>
          <span className="hidden sm:inline px-2 py-0.5 rounded bg-[#09090B] border border-[#27272A] text-[#e2c073] text-[10px] font-mono font-bold uppercase">Super Admin Core v3.0</span>
        </Link>
      </div>
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
      <div className="flex items-center gap-2 sm:gap-3">
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
          <div className="w-8 h-8 rounded-full bg-[#3ECF8E]/20 border border-[#3ECF8E]/40 flex items-center justify-center text-xs font-mono font-bold text-[#3ECF8E]">SA</div>
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
          Client View &rarr;
        </Link>
      </div>
    </header>
  );
}

// =====================================================================
// ADMIN SIDEBAR COMPONENT
// =====================================================================

function AdminSidebar({
  activeSection,
  setActiveSection,
  mobileSidebarOpen,
  setMobileSidebarOpen,
}: {
  activeSection: ActiveSection;
  setActiveSection: (s: ActiveSection) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (v: boolean) => void;
}) {
  return (
    <>
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
      
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
    </>
  );
}

// =====================================================================
// MAIN LAYOUT COMPONENT
// =====================================================================

export default function AdminDashboardLayout() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [activeRoleView, setActiveRoleView] = useState<'super_admin' | 'admin' | 'user' | 'client'>('super_admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState<boolean>(true);
  const [rightPanelOpen, setRightPanelOpen] = useState<boolean>(true);
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
  const [projectsList, setProjectsList] = useState<ManagedProject[]>(INITIAL_MANAGED_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(INITIAL_MANAGED_PROJECTS[0]?.id || 'VIZTR-882');

  const selectedProject = projectsList.find((p) => p.id === selectedProjectId) || projectsList[0];

  // Sync activeSection from ?section=... query param (deep-link support)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    const section = sp.get('section');
    if (!section) return;
    const known = SIDEBAR_SECTIONS.some((g) => g.items.some((i) => i.id === section));
    if (known) {
      setActiveSection(section as ActiveSection);
    }
  }, []);

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

  const totalRevenue = projectsList.reduce((acc, p) => acc + p.bookingAmount, 0);
  const totalHoursLogged = projectsList.reduce((acc, p) => acc + p.hoursMonitoring.hoursSpent, 0);
  const totalEstimatedHours = projectsList.reduce((acc, p) => acc + p.hoursMonitoring.estimatedHours, 0);
  const activeProjectsCount = projectsList.filter((p) => p.status === 'Work in Progress' || p.status === 'Client Review').length;

  const sectionProps = {
    projectsList,
    selectedProjectId,
    setSelectedProjectId,
    onAddProject: handleAddProject,
    onUpdateProject: handleUpdateProject,
    onDeleteProject: handleDeleteProject,
    onLogHours: handleLogHours,
    selectedProject,
    filterCriteria,
    setFilterCriteria,
    handleResetFilters,
    activeRoleView,
    setActiveRoleView,
    showToast,
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col w-full">
      <AdminTopBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        leftPanelOpen={leftPanelOpen}
        setLeftPanelOpen={setLeftPanelOpen}
        rightPanelOpen={rightPanelOpen}
        setRightPanelOpen={setRightPanelOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
        showToast={showToast}
        user={user}
      />
      <div className="flex-1 flex overflow-hidden w-full max-w-[2400px] mx-auto">
        <AdminSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          mobileSidebarOpen={mobileSidebarOpen}
          setMobileSidebarOpen={setMobileSidebarOpen}
        />
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 min-w-0">
          {renderSection(activeSection, sectionProps)}
        </main>
        <CollapsibleRightInspectorPanel
          isOpen={rightPanelOpen}
          onToggle={() => setRightPanelOpen(!rightPanelOpen)}
          project={selectedProject}
          onLogHours={handleLogHours}
          userRole="SUPER_ADMIN"
        />
      </div>
      <HermesButton user={user} />
    </div>
  );
}

// =====================================================================
// SECTION RENDERER
// =====================================================================

function renderSection(section: ActiveSection, props: {
  projectsList: ManagedProject[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  onAddProject: (p: ManagedProject) => void;
  onUpdateProject: (p: ManagedProject) => void;
  onDeleteProject: (id: string) => void;
  onLogHours: (projectId: string, entry: Omit<TimesheetEntry, 'id'>) => void;
  selectedProject: ManagedProject | undefined;
  filterCriteria: any;
  setFilterCriteria: (f: any) => void;
  handleResetFilters: () => void;
  activeRoleView: 'super_admin' | 'admin' | 'user' | 'client';
  setActiveRoleView: (r: 'super_admin' | 'admin' | 'user' | 'client') => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}) {
  switch (section) {
    case 'dashboard':
      return (
        <Suspense fallback={<SectionFallback />}>
          <DashboardOverview />
        </Suspense>
      );
    case 'super-admin-panel':
    case 'super-admin-users':
    case 'super-admin-analytics':
    case 'super-admin-revenue':
    case 'super-admin-gpu':
    case 'super-admin-toggles':
    case 'super-admin-health':
    case 'users':
    case 'analytics':
    case 'revenue':
    case 'clients':
    case 'inquiries':
      return (
        <Suspense fallback={<SectionFallback />}>
          <SuperAdminPanel
            currentRoleView={props.activeRoleView}
            onSwitchRoleView={props.setActiveRoleView}
          />
        </Suspense>
      );
    case 'project-management':
    case 'projects':
    case 'admins':
      return (
        <Suspense fallback={<SectionFallback />}>
          <ProjectManagementSystem
            projects={props.projectsList}
            onAddProject={props.onAddProject}
            onUpdateProject={props.onUpdateProject}
            onDeleteProject={props.onDeleteProject}
          />
        </Suspense>
      );
    case 'xr-links':
      return (
        <Suspense fallback={<SectionFallback />}>
          <XRLinkGenerator projects={props.projectsList} />
        </Suspense>
      );
    case 'virtual-tour-config':
      return (
        <Suspense fallback={<SectionFallback />}>
          <VirtualTourAdminPanel />
        </Suspense>
      );
    case 'pixel-streaming-control':
    case 'streaming':
      return (
        <Suspense fallback={<SectionFallback />}>
          <PixelStreamingSessionControl />
        </Suspense>
      );
    case 'file-storage':
      return (
        <Suspense fallback={<SectionFallback />}>
          <FileStorageManager projects={props.projectsList} />
        </Suspense>
      );
    case 'super-admin-crud':
      return (
        <Suspense fallback={<SectionFallback />}>
          <SuperAdminProjectManager
            projects={props.projectsList}
            onAddProject={props.onAddProject}
            onUpdateProject={props.onUpdateProject}
            onDeleteProject={props.onDeleteProject}
          />
        </Suspense>
      );
    case 'cms-manager':
    case 'pages':
    case 'blog':
    case 'cms-services':
    case 'media':
    case 'design-themes':
    case 'seo':
    case 'testimonials':
    case 'navigation':
    case 'social':
      return (
        <Suspense fallback={<SectionFallback />}>
          <SuperAdminCMSManager />
        </Suspense>
      );
    case 'google-drive':
      return (
        <Suspense fallback={<SectionFallback />}>
          <GoogleDriveAdminManager />
        </Suspense>
      );
    case 'google-meet':
      return (
        <Suspense fallback={<SectionFallback />}>
          <GoogleMeetAdminManager isSuperAdmin={true} />
        </Suspense>
      );
    case 'doc-studio-crm':
      return (
        <Suspense fallback={<SectionFallback />}>
          <DocStudioCRMFull />
        </Suspense>
      );
    case 'playcanvas-engine':
      return (
        <Suspense fallback={<SectionFallback />}>
          <PlayCanvasEngineDashboardTile />
        </Suspense>
      );
    case 'ai-platform':
      return (
        <Suspense fallback={<SectionFallback />}>
          <AIDashboardPanel />
        </Suspense>
      );
    case 'client-discovery':
      return (
        <Suspense fallback={<SectionFallback />}>
          <ClientDiscoveryManager />
        </Suspense>
      );
    case 'asset-pipeline':
      return (
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
          <ModelManager />
        </div>
      );
    case 'vr-configurator':
    case 'ar':
    case 'models':
      return (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-display text-white">Spatial 3D & WebXR Asset Manager</h2>
            <p className="text-xs text-[#A1A1AA]">Upload GLB/GLTF geometry, inspect Draco polygon compression, and toggle WebXR surface anchoring.</p>
          </div>
          <ModelManager />
        </div>
      );
    case 'client-discovery':
      return (
        <Suspense fallback={<SectionFallback />}>
          <ClientDiscoveryForm />
        </Suspense>
      );
    case 'super-admin-governance':
      return (
        <Suspense fallback={<SectionFallback />}>
          <SuperAdminGovernance />
        </Suspense>
      );
    case 'core-systems-fleet':
      return (
        <Suspense fallback={<SectionFallback />}>
          <CoreSystemsFleet />
        </Suspense>
      );
    case 'super-admin-cms':
      return (
        <Suspense fallback={<SectionFallback />}>
          <SuperAdminCMS />
        </Suspense>
      );
    case 'doc-studio-crm':
      return (
        <Suspense fallback={<SectionFallback />}>
          <DocStudioCRMSection />
        </Suspense>
      );
    case 'xr-real-time-engine':
      return (
        <Suspense fallback={<SectionFallback />}>
          <XRRealTimeEngine />
        </Suspense>
      );
    case 'meetings-bookings':
      return (
        <Suspense fallback={<SectionFallback />}>
          <MeetingsBookings />
        </Suspense>
      );
    case 'cloud-infrastructure':
      return (
        <Suspense fallback={<SectionFallback />}>
          <CloudInfrastructure />
        </Suspense>
      );
    default:
      return (
        <div className="p-8 rounded-2xl bg-[#18181B] border border-[#27272A] text-center space-y-4 font-mono">
          <div className="w-12 h-12 rounded-full bg-[#3ECF8E]/10 border border-[#3ECF8E]/40 flex items-center justify-center mx-auto text-[#3ECF8E]">
            <Settings className="w-6 h-6 animate-spin-slow" />
          </div>
          <h3 className="text-lg font-bold font-display text-white capitalize">
            {section.replace('-', ' ')} Super Admin Workspace
          </h3>
          <p className="text-xs text-[#A1A1AA] max-w-md mx-auto">
            Prisma schema bindings configured. Live CRUD operations synchronized with Postgres database.
          </p>
          <button
            onClick={() => window.location.href = '/admin/dashboard?section=dashboard'}
            className="px-4 py-2 rounded-lg bg-[#3ECF8E] text-black font-bold text-xs uppercase"
          >
            Return to Overview
          </button>
        </div>
      );
  }
}