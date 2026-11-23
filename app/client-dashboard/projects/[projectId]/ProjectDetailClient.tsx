'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  FolderKanban,
  FileText,
  MessageSquare,
  CheckCircle2,
  DollarSign,
  Calendar,
  Users,
  Activity,
  Settings,
  ShieldCheck,
  Clock,
  AlertCircle,
  ExternalLink,
  Download,
  Eye,
  Share2,
  ChevronRight,
  Loader2,
  Building,
  Sparkles,
  Box,
  Globe,
  TrendingUp,
  Menu,
  X,
  DollarSign as DollarSignIcon,
  Sparkles as SparklesIcon,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useClientSession } from '@/lib/hooks/useClientSession';
import { useProjectRealtime } from '@/lib/useRealtime';
import { ManagedProject, ProjectType, ProjectStatus, PaymentStatus } from '@/lib/projects-data';
import FileVersioningPanel from '@/app/client-dashboard/components/FileVersioningPanel';
import VisualFeedbackSystem from '@/app/client-dashboard/components/VisualFeedbackSystem';
import ApprovalWorkflow from '@/app/client-dashboard/components/ApprovalWorkflow';
import FinancialsPanel from '@/app/client-dashboard/components/FinancialsPanel';
import MeetingsManager from '@/app/client-dashboard/components/MeetingsManager';
import ClientTeamManager from '@/app/client-dashboard/components/ClientTeamManager';
import ActivityLog from '@/app/client-dashboard/components/ActivityLog';
import DeadlineTracker from '@/app/client-dashboard/components/DeadlineTracker';
import FileDetailModal from '@/app/client-dashboard/components/FileDetailModal';
import ProjectOverview from '@/app/client-dashboard/components/ProjectOverview';

interface ProjectDetailClientProps {
  initialProject: ManagedProject;
  userEmail: string;
  userRole: string;
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: FolderKanban, description: 'Project summary, progress & key metrics' },
  { id: 'files', label: 'Files & Documents', icon: FileText, description: 'Deliverables, versions & downloads' },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare, description: 'Visual feedback & threaded comments' },
  { id: 'approvals', label: 'Approvals', icon: CheckCircle2, description: 'Review & approve deliverables' },
  { id: 'financials', label: 'Financials', icon: DollarSignIcon, description: 'Billing, payments & invoices' },
  { id: 'meetings', label: 'Meetings', icon: Calendar, description: 'Scheduled & past project meetings' },
  { id: 'team', label: 'Team', icon: Users, description: 'Project team & client contacts' },
  { id: 'activity', label: 'Activity', icon: Activity, description: 'Real-time project activity log' },
  { id: 'deadlines', label: 'Deadlines', icon: Clock, description: 'Upcoming milestones & due dates' },
];

const STATUS_COLORS: Record<ProjectStatus, string> = {
  'Complete': 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40',
  'Work in Progress': 'bg-blue-950/40 text-blue-400 border-blue-800/40',
  'Client Review': 'bg-amber-950/40 text-amber-400 border-amber-800/40',
  'Awaited': 'bg-violet-950/40 text-violet-400 border-violet-800/40',
  'Hold': 'bg-red-950/40 text-red-400 border-red-800/40',
};

const PAYMENT_COLORS: Record<PaymentStatus, string> = {
  'Paid': 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40',
  'Partial 50%': 'bg-amber-950/40 text-amber-400 border-amber-800/40',
  'Milestone Pending': 'bg-blue-950/40 text-blue-400 border-blue-800/40',
  'Invoiced': 'bg-violet-950/40 text-violet-400 border-violet-800/40',
  'Deposit Received': 'bg-sky-950/40 text-sky-400 border-sky-800/40',
};

const PROJECT_TYPE_COLORS: Record<ProjectType, string> = {
  'WebXR': 'bg-amber-950/40 text-amber-400 border-amber-800/40',
  'WebAR': 'bg-cyan-950/40 text-cyan-400 border-cyan-800/40',
  'Virtual Reality': 'bg-violet-950/40 text-violet-400 border-violet-800/40',
  'Virtual Tour 360': 'bg-sky-950/40 text-sky-400 border-sky-800/40',
  'Animation': 'bg-rose-950/40 text-rose-400 border-rose-800/40',
  'Still Renders': 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40',
  'Other': 'bg-gray-950/40 text-gray-400 border-gray-800/40',
};

export default function ProjectDetailClient({ initialProject, userEmail, userRole }: ProjectDetailClientProps) {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  const { clientId, isAuthenticated } = useClientSession();
  const { showToast, openModelViewer, openPanorama } = useAppStore();
  
  const [project, setProject] = useState<ManagedProject | null>(initialProject);
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProject = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/client?id=${encodeURIComponent(projectId)}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          setProject(data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to refresh project:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/client-access');
      return;
    }
    if (userRole === 'client' && project?.clientEmail?.toLowerCase() !== userEmail.toLowerCase()) {
      router.push('/client-dashboard?error=unauthorized');
    }
  }, [isAuthenticated, project, userRole, userEmail, router]);

  useProjectRealtime(projectId, () => {
    refreshProject();
  });

  useEffect(() => {
    const interval = setInterval(refreshProject, 30000);
    return () => clearInterval(interval);
  }, [refreshProject]);

  const handleFileClick = (file: any) => {
    setSelectedFile(file);
    setFileModalOpen(true);
  };

  const handleModelView = (file: any) => {
    if (file.url) {
      router.push(`/client-dashboard/projects/${projectId}/viewer?file=${encodeURIComponent(file.url)}&name=${encodeURIComponent(file.name)}`);
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--primary)] mx-auto mb-4" />
          <p className="text-[var(--text-muted)]">Loading project details...</p>
        </div>
      </div>
    );
  }

  const progressColor = project.progress === 100 ? 'text-emerald-400' : project.progress >= 50 ? 'text-[var(--primary)]' : 'text-amber-400';

  const statusColor = STATUS_COLORS[project.status as ProjectStatus] || 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]';
  const paymentColor = PAYMENT_COLORS[project.paymentStatus as PaymentStatus] || 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]';
  const typeColor = PROJECT_TYPE_COLORS[project.projectType as ProjectType] || 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]';

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col">
      {/* HEADER */}
      <header className="h-16 border-b border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className={typeColor}>
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)] truncate max-w-md">{project.name}</h1>
              <div className="flex items-center gap-2 text-xs">
                <span className={statusColor + ' px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase'}>
                  {project.status}
                </span>
                <span className={paymentColor + ' px-2 py-0.5 rounded text-[10px] font-mono font-bold'}>
                  {project.paymentStatus}
                </span>
                <span className={typeColor + ' px-2 py-0.5 rounded text-[10px] font-mono'}>
                  {project.projectType}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Link
          href="/client-dashboard"
          className="p-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </header>

      {/* MOBILE TABS */}
      <div className="lg:hidden border-b border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-md sticky top-16 z-30">
        <div className="overflow-x-auto px-4 py-2 no-scrollbar">
          <div className="flex gap-1 min-w-max">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/40 font-bold shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/50 border border-transparent'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* SIDEBAR - Project Info */}
        <aside className={`hidden lg:block w-72 border-r border-[var(--border)] bg-[var(--bg-card)]/60 backdrop-blur-md shrink-0 overflow-y-auto p-4 ${sidebarOpen ? '' : 'hidden'}`}>
          <div className="space-y-5">
            {/* Progress Ring */}
            <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase text-[var(--text-muted)]">Overall Progress</span>
                <span className={`text-xl font-bold font-mono ${progressColor}`}>{project.progress}%</span>
              </div>
              <div className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Key Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                <DollarSign className="w-5 h-5 text-[var(--secondary)] shrink-0" />
                <div>
                  <p className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Booking Value</p>
                  <p className="text-sm font-bold text-[var(--text-primary)]">${project.bookingAmount.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                <SparklesIcon className="w-5 h-5 text-[var(--primary)] shrink-0" />
                <div>
                  <p className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Project Type</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{project.projectType}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                <Globe className="w-5 h-5 text-[var(--accent)] shrink-0" />
                <div>
                  <p className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Category</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{project.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Last Update</p>
                  <p className="text-sm font-mono text-[var(--text-secondary)]">{project.lastUpdate}</p>
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="pt-4 border-t border-[var(--border)] space-y-2">
              <p className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Client</p>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                <div className="w-8 h-8 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] font-bold text-sm">
                  {project.clientName?.charAt(0) || 'C'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{project.clientName}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{project.clientCompany}</p>
                  <p className="text-xs font-mono text-[var(--text-muted)]">{project.clientEmail}</p>
                </div>
              </div>
            </div>

            {/* Lead Architect */}
            <div className="pt-4 border-t border-[var(--border)] space-y-2">
              <p className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Lead Architect</p>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                <ShieldCheck className="w-5 h-5 text-[var(--secondary)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{project.leadArchitect}</p>
                  <p className="text-xs text-[var(--text-muted)]">Primary Point of Contact</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-[var(--border)] space-y-2">
              <p className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Quick Actions</p>
              <button
                onClick={() => setActiveTab('files')}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--text-primary)] text-sm font-medium transition-colors flex items-center gap-2 justify-start"
              >
                <Download className="w-4 h-4" />
                Download All Files
              </button>
              <button
                onClick={() => setActiveTab('approvals')}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--text-primary)] text-sm font-medium transition-colors flex items-center gap-2 justify-start"
              >
                <CheckCircle2 className="w-4 h-4" />
                Review Pending Approvals
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 min-w-0">
          {/* DESKTOP TABS */}
          <div className="hidden lg:flex lg:overflow-x-auto lg:gap-1 lg:pb-4 lg:border-b lg:border-[var(--border)] lg:mb-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-mono font-medium flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/40 font-bold shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/50 border border-transparent'
                }`}
                title={tab.description}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB CONTENT */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <ProjectOverview projects={[project]} />
              </motion.div>
            )}

            {activeTab === 'files' && (
              <motion.div key="files" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <FileVersioningPanel 
                  projectId={projectId} 
                  project={project}
                  onFileClick={handleFileClick}
                  onModelView={handleModelView}
                />
              </motion.div>
            )}

            {activeTab === 'feedback' && (
              <motion.div key="feedback" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <VisualFeedbackSystem 
                  projectId={projectId}
                  assets={[
                    { id: 'asset-1', name: 'Exterior Rendering v4', type: 'image', url: '/assets/exterior_v4.jpg', thumbnail: '/assets/exterior_v4_thumb.jpg' },
                    { id: 'asset-2', name: 'Interior Walkthrough', type: '3d-model', url: '/models/interior.glb', thumbnail: '/assets/interior_thumb.jpg' },
                    { id: 'asset-3', name: 'Site Plan PDF', type: 'pdf', url: '/docs/site_plan.pdf', thumbnail: '/assets/pdf_thumb.jpg' }
                  ]}
                />
              </motion.div>
            )}

            {activeTab === 'approvals' && (
              <motion.div key="approvals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <ApprovalWorkflow projectId={projectId} />
              </motion.div>
            )}

            {activeTab === 'financials' && (
              <motion.div key="financials" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <FinancialsPanel project={project} />
              </motion.div>
            )}

            {activeTab === 'meetings' && (
              <motion.div key="meetings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <MeetingsManager projectId={projectId} />
              </motion.div>
            )}

            {activeTab === 'team' && (
              <motion.div key="team" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <ClientTeamManager projectId={projectId} project={project} />
              </motion.div>
            )}

            {activeTab === 'activity' && (
              <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <ActivityLog projectId={projectId} />
              </motion.div>
            )}

            {activeTab === 'deadlines' && (
              <motion.div key="deadlines" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <DeadlineTracker projectId={projectId} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* FILE DETAIL MODAL */}
      <FileDetailModal
        isOpen={fileModalOpen}
        onClose={() => { setFileModalOpen(false); setSelectedFile(null); }}
        file={selectedFile}
        projectId={projectId}
        onModelView={handleModelView}
      />

      {error && (
        <div className="fixed bottom-4 right-4 z-50 p-4 rounded-xl bg-red-950/80 border border-red-800/40 text-red-300 text-sm font-mono max-w-md shadow-2xl animate-in slide-in-from-right-4">
          {error}
        </div>
      )}
    </div>
  );
}