'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  FolderKanban,
  AlertTriangle,
  Box,
  FileText,
  MessageSquare,
  CheckCircle2,
  DollarSign,
  Calendar,
  Users,
  LifeBuoy,
  Activity,
  Search,
  Clock,
  File,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Building2,
  Sparkles,
  FileCode,
  Image as ImageIcon,
  Video,
  Globe,
  Layers,
  Headset
} from 'lucide-react';

interface SidebarTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  description?: string;
}

const TABS: SidebarTab[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" />, href: '/client-dashboard', description: 'Project summary, KPIs, active commissions' },
  { id: 'projects', label: 'My Projects', icon: <FolderKanban className="w-5 h-5" />, href: '/client-dashboard?tab=projects', description: 'Assigned architectural commissions' },
  { id: 'action-required', label: 'Action Required', icon: <AlertTriangle className="w-5 h-5" />, href: '/client-dashboard?tab=action-required', description: 'Pending approvals and decisions' },
  { id: 'experience', label: 'Experience', icon: <Box className="w-5 h-5" />, href: '/client-dashboard?tab=experience', description: 'WebXR, WebAR, VR, Virtual Tour, Gaussian Splat' },
  { id: 'files', label: 'Files & Documents', icon: <FileText className="w-5 h-5" />, href: '/client-dashboard?tab=files', description: 'Versioned assets, BIM files, renders' },
  { id: 'feedback', label: 'Feedback', icon: <MessageSquare className="w-5 h-5" />, href: '/client-dashboard?tab=feedback', description: 'Visual feedback & threaded comments' },
  { id: 'approvals', label: 'Approvals', icon: <CheckCircle2 className="w-5 h-5" />, href: '/client-dashboard?tab=approvals', description: 'Deliverable approval workflow' },
  { id: 'financials', label: 'Financials', icon: <DollarSign className="w-5 h-5" />, href: '/client-dashboard?tab=financials', description: 'Billing, invoices, payments' },
  { id: 'meetings', label: 'Meetings', icon: <Calendar className="w-5 h-5" />, href: '/client-dashboard?tab=meetings', description: 'Scheduled & past project meetings' },
  { id: 'team', label: 'Team', icon: <Users className="w-5 h-5" />, href: '/client-dashboard?tab=team', description: 'Authorized team & stakeholders' },
  { id: 'support', label: 'Support', icon: <LifeBuoy className="w-5 h-5" />, href: '/client-dashboard?tab=support', description: 'Support tickets & help' },
  { id: 'activity', label: 'Activity', icon: <Activity className="w-5 h-5" />, href: '/client-dashboard?tab=activity', description: 'Real-time project activity log' },
  { id: 'search', label: 'Search', icon: <Search className="w-5 h-5" />, href: '/client-dashboard?tab=search', description: 'Cross-project search' },
  { id: 'deadlines', label: 'Deadlines', icon: <Clock className="w-5 h-5" />, href: '/client-dashboard?tab=deadlines', description: 'Upcoming milestones & due dates' },
  { id: 'documents', label: 'Documents', icon: <File className="w-5 h-5" />, href: '/client-dashboard?tab=documents', description: 'Telemetry documents & reports' },
];

interface CollapsibleSidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function CollapsibleSidebar({ activeTab, onTabChange }: CollapsibleSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Handle mobile drawer
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    if (window.innerWidth < 1024) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        <motion.aside
          initial={{ x: -280 }}
          animate={{ x: isCollapsed ? -72 : (isMobileOpen ? 0 : -280) }}
          exit={{ x: -280 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed left-0 top-0 z-50 h-full bg-[var(--bg-card)] border-r border-[var(--border)] flex flex-col overflow-y-auto lg:translate-x-0"
          style={{ width: isCollapsed ? '72px' : '280px', minWidth: isCollapsed ? '72px' : '280px' }}
          role="navigation"
          aria-label="Main navigation"
        >
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--border)] bg-[var(--bg-primary)]/80 backdrop-blur-md shrink-0">
            {!isCollapsed && (
              <Link href="/client-dashboard" className="flex items-center gap-2.5 group flex-1 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#dbfcff] to-[#14B8A6] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <Building2 className="w-5 h-5 text-black" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-serif font-bold text-lg tracking-tight text-white truncate">VizTR</span>
                  <span className="text-[10px] font-mono text-[#dbfcff]">Client Workspace</span>
                </div>
              </Link>
            )}
            {isCollapsed && (
              <Link href="/client-dashboard" className="flex items-center justify-center p-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors" aria-label="VizTR Client Workspace">
                <Building2 className="w-5 h-5 text-[#dbfcff]" />
              </Link>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!isCollapsed}
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Main navigation">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  onClick={() => handleTabClick(tab.id)}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer relative overflow-hidden ${
                    isActive
                      ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/40 font-bold shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/50 border border-transparent'
                  }`}
                  title={isCollapsed ? tab.label : undefined}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-lg bg-[var(--bg-tertiary)] group-hover:bg-[var(--primary)]/10 transition-colors">
                    {tab.icon}
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0 flex flex-col">
                      <span className="font-medium text-sm truncate">{tab.label}</span>
                      {tab.description && (
                        <span className="text-[10px] font-mono text-[var(--text-muted)] truncate">{tab.description}</span>
                      )}
                    </div>
                  )}
                  {isActive && !isCollapsed && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 4, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--primary)] rounded-r-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer - Collapse Toggle */}
          {!isCollapsed && (
            <div className="p-3 border-t border-[var(--border)] bg-[var(--bg-primary)]/50 backdrop-blur-md shrink-0">
              <button
                onClick={() => setIsCollapsed(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="text-xs font-mono font-medium">Collapse</span>
              </button>
            </div>
          )}
        </motion.aside>
      </AnimatePresence>

      {/* Mobile Menu Toggle Button (only visible on mobile) */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-6 right-4 z-40 p-3 rounded-full bg-[var(--primary)] text-black shadow-xl shadow-[var(--primary)]/30 z-50"
        aria-label="Open navigation menu"
      >
        <Menu className="w-6 h-6" />
      </button>
    </>
  );
}