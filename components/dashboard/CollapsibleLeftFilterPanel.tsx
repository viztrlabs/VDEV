'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  PauseCircle,
  DollarSign,
  Layers,
  Sparkles,
  Box,
  Eye,
  Shield,
  CreditCard,
  Building,
  Headset,
  Video,
  Monitor,
  Camera,
  Compass,
  FolderOpen
} from 'lucide-react';
import { ManagedProject, ProjectType, ProjectStatus, PaymentStatus } from '@/lib/projects-data';

interface FilterCriteria {
  searchQuery: string;
  projectType: ProjectType | 'all';
  status: ProjectStatus | 'all';
  paymentStatus: PaymentStatus | 'all';
  category: string | 'all';
  budgetTier: 'all' | 'under50k' | '50kTo100k' | 'over100k';
}

interface CollapsibleLeftFilterPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  projects: ManagedProject[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  filters: FilterCriteria;
  onFilterChange: (filters: FilterCriteria) => void;
  onResetFilters: () => void;
  userRole?: 'SUPER_ADMIN' | 'ADMIN' | 'CLIENT' | 'USER';
}

export default function CollapsibleLeftFilterPanel({
  isOpen,
  onToggle,
  projects,
  selectedProjectId,
  onSelectProject,
  filters,
  onFilterChange,
  onResetFilters,
  userRole = 'CLIENT',
}: CollapsibleLeftFilterPanelProps) {
  const [activeTab, setActiveTab] = useState<'filter' | 'categories'>('filter');

  // Count active filters
  let activeFilterCount = 0;
  if (filters.searchQuery) activeFilterCount++;
  if (filters.projectType !== 'all') activeFilterCount++;
  if (filters.status !== 'all') activeFilterCount++;
  if (filters.paymentStatus !== 'all') activeFilterCount++;
  if (filters.category !== 'all') activeFilterCount++;
  if (filters.budgetTier !== 'all') activeFilterCount++;

  // Project Types list
  const PROJECT_TYPES: { id: ProjectType; label: string; icon: any }[] = [
    { id: 'WebXR', label: 'WebXR Spatial', icon: Eye },
    { id: 'WebAR', label: 'WebAR QuickLook', icon: Box },
    { id: 'Virtual Reality', label: 'Virtual Reality (6DOF)', icon: Headset },
    { id: 'Virtual Tour 360', label: 'Virtual Tour 360°', icon: Compass },
    { id: 'Pixel Streaming', label: 'Pixel Streaming (UE5)', icon: Monitor },
    { id: 'Animation', label: 'Cinematic Animation', icon: Video },
    { id: 'Still Renders', label: '8K Still Renders', icon: Camera },
  ];

  // Statuses list
  const STATUSES: { id: ProjectStatus; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
    { id: 'Complete', label: 'Complete', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-950/80 border-emerald-800/80' },
    { id: 'Work in Progress', label: 'Work in Progress', icon: Clock, color: 'text-sky-400 bg-sky-950/80 border-sky-800/80' },
    { id: 'Client Review', label: 'Client Review', icon: Eye, color: 'text-amber-400 bg-amber-950/80 border-amber-800/80' },
    { id: 'Awaited', label: 'Awaited', icon: Sparkles, color: 'text-purple-400 bg-purple-950/80 border-purple-800/80' },
    { id: 'Hold', label: 'On Hold', icon: PauseCircle, color: 'text-rose-400 bg-rose-950/80 border-rose-800/80' },
  ];

  // Payment Statuses list
  const PAYMENT_STATUSES: { id: PaymentStatus; label: string }[] = [
    { id: 'Paid', label: 'Paid (100%)' },
    { id: 'Partial 50%', label: 'Partial 50%' },
    { id: 'Milestone Pending', label: 'Milestone Pending' },
    { id: 'Deposit Received', label: 'Deposit Received' },
    { id: 'Invoiced', label: 'Awaited / Invoiced' },
  ];

  // Categories list extracted from projects
  const CATEGORIES = Array.from(new Set(projects.map((p) => p.category)));

  // Filtered projects
  const filteredList = projects.filter((p) => {
    // Search query matches project name, client name, id, or lead architect
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.clientCompany.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.leadArchitect.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (filters.projectType !== 'all' && p.projectType !== filters.projectType) return false;
    if (filters.status !== 'all' && p.status !== filters.status) return false;
    if (filters.paymentStatus !== 'all' && p.paymentStatus !== filters.paymentStatus) return false;
    if (filters.category !== 'all' && p.category !== filters.category) return false;

    if (filters.budgetTier === 'under50k' && p.bookingAmount >= 50000) return false;
    if (filters.budgetTier === '50kTo100k' && (p.bookingAmount < 50000 || p.bookingAmount > 100000)) return false;
    if (filters.budgetTier === 'over100k' && p.bookingAmount <= 100000) return false;

    return true;
  });

  return (
    <div
      className={`relative transition-all duration-300 ease-in-out shrink-0 z-30 ${
        isOpen ? 'w-80 md:w-84' : 'w-12 md:w-14'
      }`}
    >
      {/* COLLAPSED STATE ICON STRIP */}
      {!isOpen && (
        <aside className="w-12 md:w-14 h-full bg-[#18181B] border-r border-[#27272A] flex flex-col items-center py-4 justify-between select-none">
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={onToggle}
              className="p-2.5 rounded-xl bg-[#27272A] hover:bg-[#3ECF8E]/20 text-[#A1A1AA] hover:text-[#3ECF8E] transition-colors cursor-pointer"
              title="Expand Filter & Categorization Side Panel (Click to open)"
              aria-label="Expand Filter & Categorization Side Panel"
            >
              <ChevronRight className="w-4 h-4 text-[#3ECF8E]" />
            </button>

            <div className="w-8 h-px bg-[#27272A]" />

            <button
              onClick={onToggle}
              className="p-2 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#27272A] relative transition-colors"
              title="Active Filters"
            >
              <Filter className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#3ECF8E] text-black text-[9px] font-mono font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <button
              onClick={onToggle}
              className="p-2 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors"
              title="Categories & Pipelines"
            >
              <Layers className="w-4 h-4" />
            </button>

            <button
              onClick={onToggle}
              className="p-2 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors"
              title="Payment & Booking"
            >
              <DollarSign className="w-4 h-4" />
            </button>
          </div>

          <div className="writing-mode-vertical text-[10px] font-mono text-[#71717A] tracking-widest uppercase rotate-180 py-4">
            Filters & Pipeline
          </div>
        </aside>
      )}

      {/* EXPANDED FULL FILTER PANEL */}
      {isOpen && (
        <aside className="w-80 md:w-84 h-full bg-[#18181B] border-r border-[#27272A] flex flex-col justify-between overflow-hidden shadow-2xl">
          {/* HEADER & TOGGLE */}
          <div className="p-3.5 border-b border-[#27272A] bg-[#141416] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 text-[#3ECF8E]">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Pipeline Filter
                </h3>
                <p className="text-[10px] font-mono text-[#71717A]">
                  {filteredList.length} of {projects.length} matching
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="px-2 py-1 rounded-md bg-[#27272A] hover:bg-rose-950/80 hover:text-rose-400 text-[10px] font-mono text-[#A1A1AA] flex items-center gap-1 transition-colors cursor-pointer"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
              <button
                type="button"
                onClick={onToggle}
                className="p-1.5 rounded-md bg-[#27272A] hover:bg-[#3ECF8E]/20 text-[#A1A1AA] hover:text-[#3ECF8E] transition-colors cursor-pointer"
                title="Collapse Side Panel"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* TAB BAR: FILTERS VS CATEGORIES */}
          <div className="flex items-center px-3 pt-2.5 border-b border-[#27272A] bg-[#18181B] gap-2">
            <button
              onClick={() => setActiveTab('filter')}
              className={`flex-1 py-1.5 text-xs font-mono font-bold text-center border-b-2 transition-all cursor-pointer ${
                activeTab === 'filter'
                  ? 'border-[#3ECF8E] text-[#3ECF8E]'
                  : 'border-transparent text-[#71717A] hover:text-[#A1A1AA]'
              }`}
            >
              Filters ({activeFilterCount})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex-1 py-1.5 text-xs font-mono font-bold text-center border-b-2 transition-all cursor-pointer ${
                activeTab === 'categories'
                  ? 'border-[#3ECF8E] text-[#3ECF8E]'
                  : 'border-transparent text-[#71717A] hover:text-[#A1A1AA]'
              }`}
            >
              Commissions ({filteredList.length})
            </button>
          </div>

          {/* SCROLLABLE CONTENT BODY */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs font-mono">
            {activeTab === 'filter' && (
              <>
                {/* SEARCH INPUT (BY CLIENT NAME / PROJECT NAME) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-[#A1A1AA] font-bold block">
                    Search Client / Project
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={filters.searchQuery}
                      onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
                      placeholder="e.g. Foster, Apex, VIZTR-882..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
                    />
                    {filters.searchQuery && (
                      <button
                        onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#71717A] hover:text-white"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                {/* FILTER: STATUS (Complete, WIP, Review, Awaited, Hold) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-wider text-[#A1A1AA] font-bold">
                      Status Pipeline
                    </label>
                    <span className="text-[9px] text-[#71717A]">
                      {filters.status === 'all' ? 'All Statuses' : filters.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onFilterChange({ ...filters, status: 'all' })}
                      className={`px-2 py-1 rounded text-[11px] text-left transition-all cursor-pointer ${
                        filters.status === 'all'
                          ? 'bg-[#3ECF8E] text-black font-bold'
                          : 'bg-[#09090B] text-[#A1A1AA] hover:text-white border border-[#27272A]'
                      }`}
                    >
                      All ({projects.length})
                    </button>
                    {STATUSES.map((st) => {
                      const Icon = st.icon;
                      const count = projects.filter((p) => p.status === st.id).length;
                      const isSelected = filters.status === st.id;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => onFilterChange({ ...filters, status: isSelected ? 'all' : st.id })}
                          className={`px-2 py-1 rounded text-[10px] text-left transition-all border cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#3ECF8E] text-black border-[#3ECF8E] font-bold'
                              : 'bg-[#09090B] text-[#A1A1AA] border-[#27272A] hover:border-[#71717A]'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <Icon className="w-3 h-3 shrink-0" />
                            <span className="truncate">{st.label}</span>
                          </span>
                          <span className="text-[9px] font-bold shrink-0">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* FILTER: PROJECT TYPE (WebXR, WebAR, VR, 360, Pixel Streaming, Animation, Stills) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-wider text-[#A1A1AA] font-bold">
                      Project Type / Discipline
                    </label>
                    <span className="text-[9px] text-[#71717A]">
                      {filters.projectType === 'all' ? 'All Types' : filters.projectType}
                    </span>
                  </div>
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                    <button
                      type="button"
                      onClick={() => onFilterChange({ ...filters, projectType: 'all' })}
                      className={`w-full px-2 py-1 rounded text-[11px] flex items-center justify-between transition-all cursor-pointer ${
                        filters.projectType === 'all'
                          ? 'bg-[#3ECF8E] text-black font-bold'
                          : 'bg-[#09090B] text-[#A1A1AA] hover:text-white border border-[#27272A]'
                      }`}
                    >
                      <span>All Disciplines</span>
                      <span className="text-[9px] opacity-75">{projects.length}</span>
                    </button>
                    {PROJECT_TYPES.map((pt) => {
                      const Icon = pt.icon;
                      const count = projects.filter((p) => p.projectType === pt.id).length;
                      const isSelected = filters.projectType === pt.id;
                      return (
                        <button
                          key={pt.id}
                          type="button"
                          onClick={() => onFilterChange({ ...filters, projectType: isSelected ? 'all' : pt.id })}
                          className={`w-full px-2 py-1 rounded text-[10px] flex items-center justify-between transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-[#3ECF8E] text-black border-[#3ECF8E] font-bold'
                              : 'bg-[#09090B] text-[#A1A1AA] border-[#27272A] hover:border-[#71717A]'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <Icon className="w-3 h-3 shrink-0" />
                            <span className="truncate">{pt.label}</span>
                          </span>
                          <span className="text-[9px] font-bold shrink-0">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* FILTER: PAYMENT STATUS */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-wider text-[#A1A1AA] font-bold flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-[#3ECF8E]" />
                      <span>Payment Status</span>
                    </label>
                  </div>
                  <select
                    value={filters.paymentStatus}
                    onChange={(e) => onFilterChange({ ...filters, paymentStatus: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-xs text-white focus:outline-none focus:border-[#3ECF8E]"
                  >
                    <option value="all">All Payment Statuses</option>
                    {PAYMENT_STATUSES.map((ps) => (
                      <option key={ps.id} value={ps.id}>
                        {ps.label} ({projects.filter((p) => p.paymentStatus === ps.id).length})
                      </option>
                    ))}
                  </select>
                </div>

                {/* FILTER: BOOKING AMOUNT / BUDGET TIER */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-[#A1A1AA] font-bold flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-[#3ECF8E]" />
                    <span>Booking Tier</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { id: 'all', label: 'Any Amount' },
                      { id: 'under50k', label: '< $50,000' },
                      { id: '50kTo100k', label: '$50K - $100K' },
                      { id: 'over100k', label: '$100,000+' },
                    ].map((tier) => (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => onFilterChange({ ...filters, budgetTier: tier.id as any })}
                        className={`px-2 py-1 rounded text-[10px] text-center border cursor-pointer ${
                          filters.budgetTier === tier.id
                            ? 'bg-[#3ECF8E] text-black border-[#3ECF8E] font-bold'
                            : 'bg-[#09090B] text-[#A1A1AA] border-[#27272A] hover:text-white'
                        }`}
                      >
                        {tier.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* FILTER: SECTOR / CATEGORY */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-[#A1A1AA] font-bold flex items-center gap-1">
                    <Building className="w-3 h-3 text-[#3ECF8E]" />
                    <span>Sector / Category</span>
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-xs text-white focus:outline-none focus:border-[#3ECF8E]"
                  >
                    <option value="all">All Sectors</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat} ({projects.filter((p) => p.category === cat).length})
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {activeTab === 'categories' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#27272A]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                    Filtered Commissions ({filteredList.length})
                  </span>
                  <span className="text-[9px] text-[#71717A]">Click to inspect</span>
                </div>

                {filteredList.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] text-center space-y-2 text-[#71717A]">
                    <AlertCircle className="w-5 h-5 text-amber-400 mx-auto" />
                    <p className="text-[11px]">No projects match your active filter criteria.</p>
                    <button
                      onClick={onResetFilters}
                      className="text-xs text-[#3ECF8E] underline hover:text-[#3ECF8E]/80"
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                    {filteredList.map((project) => {
                      const isSelected = project.id === selectedProjectId;
                      return (
                        <button
                          key={project.id}
                          type="button"
                          onClick={() => onSelectProject(project.id)}
                          className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                            isSelected
                              ? 'bg-[#09090B] border-[#3ECF8E] ring-1 ring-[#3ECF8E]/50'
                              : 'bg-[#09090B]/60 border-[#27272A] hover:border-[#71717A] hover:bg-[#09090B]'
                          }`}
                        >
                          <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-black">
                            <Image
                              src={project.image}
                              alt={project.name}
                              fill
                              sizes="44px"
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] text-center text-white font-mono">
                              {project.progress}%
                            </div>
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-[#3ECF8E] truncate">
                                {project.id}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#27272A] text-white flex items-center gap-1">
                                {project.status === 'Complete' && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />}
                                {project.status === 'Work in Progress' && <Clock className="w-2.5 h-2.5 text-sky-400" />}
                                {project.status === 'Client Review' && <Eye className="w-2.5 h-2.5 text-amber-400" />}
                                {project.status === 'Awaited' && <Sparkles className="w-2.5 h-2.5 text-purple-400" />}
                                {project.status === 'Hold' && <PauseCircle className="w-2.5 h-2.5 text-rose-400" />}
                                <span>{project.projectType}</span>
                              </span>
                            </div>
                            <h4 className="text-[11px] font-bold text-white truncate">
                              {project.name}
                            </h4>
                            <div className="flex items-center justify-between text-[9px] text-[#A1A1AA]">
                              <span className="truncate">{project.clientCompany}</span>
                              <span className="text-[#3ECF8E] font-medium font-mono">
                                ${project.bookingAmount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* BOTTOM STATUS FOOTER */}
          <div className="p-3 border-t border-[#27272A] bg-[#141416] flex items-center justify-between text-[10px] font-mono text-[#71717A]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E] animate-pulse" />
              <span>Role: {userRole}</span>
            </span>
            <span className="text-white font-bold">
              {filteredList.length} Records
            </span>
          </div>
        </aside>
      )}
    </div>
  );
}
