'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, LogOut, Search, ShieldCheck } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useAppStore } from '@/lib/store';
import { useClientSession } from '@/lib/hooks/useClientSession';
import { useClientProjects } from '@/lib/hooks/useClientProjects';
import ThemeSwitcherDropdown from '@/components/ui/ThemeSwitcherDropdown';

// Import all dashboard subcomponents
import ProjectIdAccessCodeAuth from './components/ProjectIdAccessCodeAuth';
import ProjectOverview from './components/ProjectOverview';
import ActionRequiredPanel from './components/ActionRequiredPanel';
import PhaseProgressTracker from './components/PhaseProgressTracker';
import VisualFeedbackSystem from './components/VisualFeedbackSystem';
import FileVersioningPanel from './components/FileVersioningPanel';
import ApprovalWorkflow from './components/ApprovalWorkflow';
import NotificationsCenter from './components/NotificationsCenter';
import MeetingsManager from './components/MeetingsManager';
import FinancialsPanel from './components/FinancialsPanel';
import SupportSystem from './components/SupportSystem';
import ClientTeamManager from './components/ClientTeamManager';
import ActivityLog from './components/ActivityLog';
import ClientSearch from './components/ClientSearch';
import ExperiencePanels from './components/ExperiencePanels';
import ProjectWorkspace from './components/ProjectWorkspace';
import DeadlineTracker from './components/DeadlineTracker';

export default function ClientDashboardPage() {
  const { user, showToast, openModelViewer, openPanorama, openPixelStream } = useAppStore();
  const { status: nextAuthStatus } = useSession();
  const { clientId, clientFirm, assignedDirector, isAuthenticated } = useClientSession();
  const { projects: apiProjects, loading: projectsLoading, error: projectsError, refresh: refreshProjects } = useClientProjects();

  // Authentication states
  const [isAuthenticatedWithProject, setIsAuthenticatedWithProject] = useState(false);
  const [authStep, setAuthStep] = useState<'auth' | 'email' | 'password'>('auth');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [activeDashboardTab, setActiveDashboardTab] = useState('overview');

  // Authentication handlers
  const handleProjectAuthentication = () => {
    setIsAuthenticatedWithProject(true);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authEmail) {
      setAuthStep('password');
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticatedWithProject(true);
    setAuthStep('auth');
  };

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/client-access' });
    } catch {
      setIsAuthenticatedWithProject(false);
      setAuthStep('auth');
    }
  };

  // Reset auth if user signs out
  useEffect(() => {
    if (nextAuthStatus === 'unauthenticated') {
      setIsAuthenticatedWithProject(false);
      setAuthStep('auth');
    }
  }, [nextAuthStatus]);

  // If not authenticated with project, show auth component
  if (!isAuthenticatedWithProject) {
    return <ProjectIdAccessCodeAuth onAuthenticated={handleProjectAuthentication} />;
  }

  // Show email setup step
  if (authStep === 'email') {
    return (
      <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Set Up Your Email</h1>
              <p className="text-[#A1A1AA] text-sm">
                Enter your email to complete project access setup
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#A1A1AA] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 bg-[#09090B] border border-[#27272A] rounded-lg text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E] transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-3 bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Continue → Add Password
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setAuthStep('auth')}
                className="text-sm text-[#3ECF8E] hover:text-[#34b27b] transition-colors cursor-pointer"
              >
                ← Back to Project ID
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show password setup step
  if (authStep === 'password') {
    return (
      <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Add Password (Optional)</h1>
              <p className="text-[#A1A1AA] text-sm">
                Create a password for future login
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#A1A1AA] mb-2">
                  Password (Optional)
                </label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Leave blank for no password"
                  className="w-full px-4 py-3 bg-[#09090B] border border-[#27272A] rounded-lg text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E] transition-colors"
                />
                <p className="text-xs text-[#71717A] mt-1">
                  You can skip this and use email-only login
                </p>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-3 bg-gradient-to-r from-[#3ECF8E] to-[#14B8A6] hover:from-[#34b27b] hover:to-[#0f9faa] text-black font-semibold rounded-lg transition-all cursor-pointer"
              >
                Complete Setup
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setAuthStep('email')}
                className="text-sm text-[#3ECF8E] hover:text-[#34b27b] transition-colors cursor-pointer"
              >
                ← Back to Email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'projects', label: 'My Projects', icon: '🏗️' },
    { id: 'action-required', label: 'Action Required', icon: '⚠️' },
    { id: 'experience', label: 'Experience', icon: '🎯' },
    { id: 'files', label: 'Files & Documents', icon: '📁' },
    { id: 'feedback', label: 'Feedback', icon: '💬' },
    { id: 'approvals', label: 'Approvals', icon: '✅' },
    { id: 'financials', label: 'Financials', icon: '💰' },
    { id: 'meetings', label: 'Meetings', icon: '📅' },
    { id: 'team', label: 'Team', icon: '👥' },
    { id: 'support', label: 'Support', icon: '🆘' },
    { id: 'activity', label: 'Activity', icon: '📊' },
    { id: 'search', label: 'Search', icon: '🔍' },
    { id: 'deadlines', label: 'Deadlines', icon: '⏰' },
    { id: 'documents', label: 'Documents', icon: '📄' }
  ];

  return (
    <main className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col w-full">
      {/* AUTHENTICATED HEADER */}
      <header className="h-16 border-b border-[#27272A] bg-[#18181B] px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-40 w-full">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 bg-gradient-to-r from-[#3ECF8E] to-[#14B8A6] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-black font-bold text-sm">V</span>
            </div>
            <span className="font-serif font-bold text-lg tracking-wider text-white">
              VizTR
            </span>
          </Link>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-[#09090B] border border-[#27272A] text-[10px] font-mono text-[#3ECF8E]">
            Client Workspace
          </span>
        </div>

        <div className="hidden md:flex items-center gap-4 max-w-md w-full">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects, files, assets, milestones..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* THEME SWITCHER DROPDOWN */}
          <ThemeSwitcherDropdown />

          {/* NOTIFICATION BUTTON */}
          <button
            onClick={() => showToast('Cluster healthy: 0 critical pipeline alerts.', 'info')}
            className="p-2 rounded-lg bg-[#09090B] border border-[#27272A] text-[#A1A1AA] hover:text-white relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-[#3ECF8E] absolute top-1.5 right-1.5" />
          </button>

          {/* USER ACCOUNT BADGE */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#27272A]">
            <div className="w-8 h-8 rounded-full bg-[#3ECF8E]/20 border border-[#3ECF8E]/40 flex items-center justify-center text-xs font-mono font-bold text-[#3ECF8E]">
              {user?.name?.charAt(0) || 'C'}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-mono font-bold text-white">
                {user?.name || 'Client User'}
              </div>
              <div className="text-[10px] font-mono text-[#3ECF8E]">
                Authorized Client Portal
              </div>
            </div>
          </div>

          {/* SIGN OUT */}
          <button
            onClick={handleSignOut}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono border bg-[#09090B] hover:bg-red-950/60 border-[#27272A] hover:border-red-700/60 text-[#A1A1AA] hover:text-red-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Sign out of client workspace"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* DASHBOARD TAB NAVIGATION */}
      <nav className="border-b border-[#27272A] bg-[#18181B]/80 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-[2400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-1 py-2 no-scrollbar">
            {TABS.map((tab) => {
              const isActive = activeDashboardTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveDashboardTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#27272A] text-white border border-[#3ECF8E]/40 font-bold shadow-sm'
                      : 'text-[#A1A1AA] hover:text-white hover:bg-[#27272A]/50 border border-transparent'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* CONDITIONAL RENDERING BASED ON ACTIVE TAB */}
      <div className="flex-1 w-full max-w-[2400px] mx-auto p-4 sm:p-6 lg:p-8">
        {activeDashboardTab === 'overview' && (
          <div className="space-y-8">
            <ProjectOverview />
            <ActionRequiredPanel />
            <PhaseProgressTracker />
          </div>
        )}

        {activeDashboardTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#27272A]">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🏗️ Assigned Architectural Commissions</span>
                </h2>
                <p className="text-xs text-[#A1A1AA] mt-0.5">
                  High-poly 3D models, camera angles, and rendering pipelines
                </p>
              </div>
              <button
                onClick={() => refreshProjects()}
                className="px-3 py-1.5 rounded-lg text-xs font-mono border bg-[#09090B] border-[#27272A] hover:border-[#3ECF8E]/60 text-[#A1A1AA] hover:text-[#3ECF8E] transition-colors flex items-center gap-2 cursor-pointer"
              >
                Refresh
              </button>
            </div>

            {projectsLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-[#3ECF8E] border-t-transparent rounded-full" />
                <span className="ml-3 text-[#A1A1AA] text-sm font-mono">Loading projects...</span>
              </div>
            )}

            {projectsError && (
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-800/40 text-red-400 text-sm font-mono">
                Error: {projectsError}
              </div>
            )}

            {!projectsLoading && !projectsError && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {apiProjects.length === 0 ? (
                  <div className="col-span-full p-8 text-center text-[#71717A] text-sm font-mono">
                    No projects found. Please contact your account manager.
                  </div>
                ) : (
                  apiProjects.map((project) => (
                    <div key={project.id} className="p-5 rounded-xl bg-[#18181B] border border-[#27272A] hover:border-[#3ECF8E]/40 transition-all space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 text-[#3ECF8E] text-[10px] font-mono font-bold">
                          {project.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                          project.status === 'Complete' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' :
                          project.status === 'Client Review' ? 'bg-amber-950/40 text-amber-400 border-amber-800/40' :
                          project.status === 'Work in Progress' ? 'bg-blue-950/40 text-blue-400 border-blue-800/40' :
                          'bg-[#27272A] text-[#A1A1AA] border-[#3f3f46]'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{project.name}</h3>
                        <p className="text-xs text-[#A1A1AA] mt-1">
                          {project.projectType} • {project.category}
                        </p>
                      </div>
                      <div className="pt-3 border-t border-[#27272A] flex items-center justify-between text-xs font-mono text-[#71717A]">
                        <span>{project.lastUpdate}</span>
                        <span className={`font-bold ${
                          project.progress === 100 ? 'text-emerald-400' :
                          project.progress >= 50 ? 'text-[#3ECF8E]' :
                          'text-amber-400'
                        }`}>{project.progress}% Complete</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {activeDashboardTab === 'action-required' && <ActionRequiredPanel />}
        {activeDashboardTab === 'experience' && <ExperiencePanels />}
        {activeDashboardTab === 'files' && (
          <div className="space-y-8">
            <FileVersioningPanel />
            <ProjectWorkspace />
          </div>
        )}
        {activeDashboardTab === 'feedback' && <VisualFeedbackSystem />}
        {activeDashboardTab === 'approvals' && <ApprovalWorkflow />}
        {activeDashboardTab === 'financials' && <FinancialsPanel />}
        {activeDashboardTab === 'meetings' && <MeetingsManager />}
        {activeDashboardTab === 'team' && <ClientTeamManager />}
        {activeDashboardTab === 'support' && <SupportSystem />}
        {activeDashboardTab === 'activity' && <ActivityLog />}
        {activeDashboardTab === 'search' && <ClientSearch />}
        {activeDashboardTab === 'deadlines' && <DeadlineTracker />}
        {activeDashboardTab === 'documents' && <div className="p-8 text-center"><p className="text-[var(--text-muted)] text-xs">Documents view coming soon...</p></div>}
      </div>
    </main>
  );
}