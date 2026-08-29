'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Eye,
  Sparkles,
  Users,
  Upload,
  FileCode,
  FileText,
  DollarSign,
  Calendar,
  Layers,
  ChevronRight,
  UserCheck,
  Check,
  AlertCircle,
  ExternalLink,
  Trash2,
  Edit3,
  HardDrive,
  Download,
  Share2,
  Tag,
  ArrowUpRight
} from 'lucide-react';
import {
  ManagedProject,
  ProjectType,
  ProjectStatus,
  PaymentStatus,
  PIPELINE_TEMPLATES
} from '@/lib/projects-data';
import { useAppStore } from '@/lib/store';

interface ProjectManagementSystemProps {
  projects: ManagedProject[];
  onAddProject: (project: ManagedProject) => void;
  onUpdateProject: (project: ManagedProject) => void;
  onDeleteProject: (projectId: string) => void;
}

interface ProjectAsset {
  id: string;
  name: string;
  category: 'BIM / CAD' | '3D Model' | 'Texture / Materials' | '8K Render' | 'Brief / Document';
  size: string;
  version: string;
  uploadedAt: string;
  uploadedBy: string;
  url: string;
  fileFormat: string;
}

const INITIAL_PROJECT_ASSETS: Record<string, ProjectAsset[]> = {
  'VIZTR-882': [
    {
      id: 'ast-882-1',
      name: 'Apex_Tower_LOD350_Architectural.ifc',
      category: 'BIM / CAD',
      size: '142 MB',
      version: 'v2.4',
      uploadedAt: '2026-08-10',
      uploadedBy: 'Foster & Partners BIM Lead',
      url: '/models/apex-tower-v3-draco.glb',
      fileFormat: 'IFC'
    },
    {
      id: 'ast-882-2',
      name: 'Apex_Tower_Optimized_Draco.glb',
      category: '3D Model',
      size: '8.4 MB',
      version: 'v3.1 (Draco)',
      uploadedAt: '2026-08-15',
      uploadedBy: 'Elena Rostova (Lead 3D)',
      url: '/models/apex-tower-v3-draco.glb',
      fileFormat: 'GLB'
    },
    {
      id: 'ast-882-3',
      name: 'Hero_Twilight_CGI_Cam01_8K.png',
      category: '8K Render',
      size: '34 MB',
      version: 'v1.0 Final',
      uploadedAt: '2026-08-20',
      uploadedBy: 'Julian Vance (Lighting)',
      url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      fileFormat: 'PNG'
    }
  ],
  'VIZTR-904': [
    {
      id: 'ast-904-1',
      name: 'Nordic_Monolith_Rhino7_NURBS.3dm',
      category: 'BIM / CAD',
      size: '88 MB',
      version: 'v1.2',
      uploadedAt: '2026-08-05',
      uploadedBy: 'Studio Snøhetta',
      url: '/models/nordic-monolith-hull.glb',
      fileFormat: '3DM'
    },
    {
      id: 'ast-904-2',
      name: 'Nordic_Monolith_WebAR_Anchor.glb',
      category: '3D Model',
      size: '14.2 MB',
      version: 'v2.0',
      uploadedAt: '2026-08-18',
      uploadedBy: 'Marcus Sterling',
      url: '/models/nordic-monolith-hull.glb',
      fileFormat: 'GLB'
    }
  ],
  'VIZTR-771': [
    {
      id: 'ast-771-1',
      name: 'Solarium_Revit_BIM_Architecture.rvt',
      category: 'BIM / CAD',
      size: '92 MB',
      version: 'v3.0',
      uploadedAt: '2026-08-12',
      uploadedBy: 'Zaha Hadid Architects BIM',
      url: '/models/solarium-suite-pbr.gltf',
      fileFormat: 'RVT'
    }
  ]
};

const TEAM_MEMBERS_DIRECTORY = [
  { id: 'tm-1', name: 'Elena Rostova', role: 'Principal 3D Artist', discipline: '3D Modeling & CAD', avatar: 'ER' },
  { id: 'tm-2', name: 'Julian Vance', role: 'Lighting & Ray Tracing Lead', discipline: 'Spatial Engine / Lighting', avatar: 'JV' },
  { id: 'tm-3', name: 'Sarah Chen', role: 'Senior PBR Material Artist', discipline: 'PBR Materials & Shaders', avatar: 'SC' },
  { id: 'tm-4', name: 'Marcus Sterling', role: 'XR & Real-Time Engineer', discipline: 'WebXR & Pixel Streaming', avatar: 'MS' },
  { id: 'tm-5', name: 'Alex Thorne', role: 'QA & Client Deliverable Director', discipline: 'Client Review Prep', avatar: 'AT' }
];

export default function ProjectManagementSystem({
  projects,
  onAddProject,
  onUpdateProject,
  onDeleteProject
}: ProjectManagementSystemProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || 'VIZTR-882');
  const [activeTab, setActiveTab] = useState<'overview' | 'assign' | 'pipeline' | 'assets'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isCreatingModal, setIsCreatingModal] = useState(false);
  const [isUploadModal, setIsUploadModal] = useState(false);
  const [projectAssetsMap, setProjectAssetsMap] = useState<Record<string, ProjectAsset[]>>(INITIAL_PROJECT_ASSETS);
  const { showToast, openModelViewer } = useAppStore();

  // Create Project Form State
  const [newProjectData, setNewProjectData] = useState({
    name: '',
    clientName: '',
    clientEmail: '',
    clientCompany: '',
    category: 'Commercial High-Rise',
    projectType: 'WebXR' as ProjectType,
    status: 'Work in Progress' as ProjectStatus,
    paymentStatus: 'Deposit Received' as PaymentStatus,
    bookingAmount: 85000,
    leadArchitect: 'Elena Rostova',
    assignedTeam: ['Elena Rostova', 'Julian Vance'],
    estimatedHours: 140,
    targetDeliveryDate: '2026-10-15',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    notes: 'High-fidelity architectural CGI pipeline with WebXR client portal bridge.'
  });

  // Asset Upload Form State
  const [uploadFormData, setUploadFormData] = useState({
    name: '',
    category: '3D Model' as ProjectAsset['category'],
    version: 'v1.0',
    fileFormat: 'GLB',
    fileSize: '12.4 MB'
  });

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Filtering
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientCompany.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesType = typeFilter === 'all' || p.projectType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const currentProjectAssets = selectedProject ? projectAssetsMap[selectedProject.id] || [] : [];

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectData.name.trim() || !newProjectData.clientName.trim()) {
      showToast('Project name and client contact are required.', 'error');
      return;
    }

    const template = PIPELINE_TEMPLATES[newProjectData.projectType] || PIPELINE_TEMPLATES['WebXR'];
    const newId = `VIZTR-${Math.floor(100 + Math.random() * 900)}`;

    const newProj: ManagedProject = {
      id: newId,
      name: newProjectData.name,
      clientName: newProjectData.clientName,
      clientEmail: newProjectData.clientEmail || 'client@studio.com',
      clientCompany: newProjectData.clientCompany || 'Architectural Practice',
      category: newProjectData.category,
      projectType: newProjectData.projectType,
      status: newProjectData.status,
      paymentStatus: newProjectData.paymentStatus,
      bookingAmount: Number(newProjectData.bookingAmount) || 60000,
      progress: 15,
      leadArchitect: newProjectData.leadArchitect,
      image: newProjectData.image,
      lastUpdate: 'Created via Project Management System just now',
      xrAvailable: true,
      pixelStreamingAvailable: newProjectData.projectType === 'Pixel Streaming',
      pendingRevisionsCount: 0,
      revisionsSummary: 'No pending revisions',
      notes: newProjectData.notes,
      hoursMonitoring: {
        estimatedHours: Number(newProjectData.estimatedHours) || 120,
        hoursSpent: 8.0,
        hourlyRate: 175,
        disciplineBreakdown: [
          { discipline: '3D Modeling & CAD', hours: 5.0, budgetHours: 40.0, color: '#3ECF8E' },
          { discipline: 'PBR Materials & Shaders', hours: 3.0, budgetHours: 35.0, color: '#06B6D4' },
          { discipline: 'Spatial Engine / Lighting', hours: 0, budgetHours: 35.0, color: '#8B5CF6' },
          { discipline: 'Client Review Prep', hours: 0, budgetHours: 20.0, color: '#F59E0B' }
        ],
        timesheetEntries: [
          {
            id: `ts-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            teamMember: newProjectData.leadArchitect,
            role: 'Lead Architect',
            task: 'Initial CAD ingestion, site zoning analysis, and pipeline initialization.',
            hours: 8.0,
            stage: 'Stage 1: Kickoff'
          }
        ]
      },
      pipeline: {
        pipelineType: template.pipelineType,
        currentStageIndex: 0,
        stages: template.stages.map((st, idx) => ({
          ...st,
          status: idx === 0 ? 'in_progress' : 'pending',
          deliverablesApproved: 0
        }))
      },
      documents: []
    };

    onAddProject(newProj);
    setSelectedProjectId(newProj.id);
    setIsCreatingModal(false);
    showToast(`Project ${newProj.id} (${newProj.name}) successfully launched.`, 'success');
  };

  const handleUploadAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFormData.name.trim() || !selectedProject) {
      showToast('Asset name is required.', 'error');
      return;
    }

    const newAsset: ProjectAsset = {
      id: `ast-${Date.now()}`,
      name: uploadFormData.name,
      category: uploadFormData.category,
      size: uploadFormData.fileSize,
      version: uploadFormData.version,
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: 'Studio Administrator',
      url: '/models/apex-tower-v3-draco.glb',
      fileFormat: uploadFormData.fileFormat
    };

    setProjectAssetsMap((prev) => ({
      ...prev,
      [selectedProject.id]: [newAsset, ...(prev[selectedProject.id] || [])]
    }));

    setIsUploadModal(false);
    setUploadFormData({
      name: '',
      category: '3D Model',
      version: 'v1.0',
      fileFormat: 'GLB',
      fileSize: '15.0 MB'
    });
    showToast(`Asset "${newAsset.name}" attached to project ${selectedProject.id}.`, 'success');
  };

  const handleUpdateStatus = (newStatus: ProjectStatus) => {
    if (!selectedProject) return;
    const updated = { ...selectedProject, status: newStatus };
    onUpdateProject(updated);
    showToast(`Status updated to "${newStatus}" for ${selectedProject.id}.`, 'success');
  };

  const handleAdvanceStage = (stageIdx: number) => {
    if (!selectedProject) return;
    const updatedStages = selectedProject.pipeline.stages.map((st, idx) => {
      if (idx < stageIdx) return { ...st, status: 'completed' as const, deliverablesApproved: st.deliverablesCount };
      if (idx === stageIdx) return { ...st, status: 'in_progress' as const };
      return { ...st, status: 'pending' as const };
    });

    const calculatedProgress = Math.round(((stageIdx + 0.5) / updatedStages.length) * 100);

    const updated = {
      ...selectedProject,
      progress: Math.min(100, calculatedProgress),
      pipeline: {
        ...selectedProject.pipeline,
        currentStageIndex: stageIdx,
        stages: updatedStages
      }
    };

    onUpdateProject(updated);
    showToast(`Pipeline moved to Stage ${stageIdx + 1}: ${updatedStages[stageIdx].title}`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#18181B] via-[#121214] to-[#09090B] border border-[#27272A] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E] font-bold uppercase tracking-wider">
            <FolderKanban className="w-4 h-4" />
            <span>CORE SYSTEM 01 • PROJECT MANAGEMENT SYSTEM</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white">
            Architectural Project Studio & Lifecycle Engine
          </h2>
          <p className="text-xs text-[#A1A1AA] max-w-2xl">
            Create new commissions, assign multidisciplinary artists and lead architects, track real-time stage milestones, and upload production assets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCreatingModal(true)}
            className="px-4 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#3ECF8E]/90 text-black font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#3ECF8E]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Project</span>
          </button>
        </div>
      </div>

      {/* DUAL WORKSPACE: LEFT PROJECT LIST / RIGHT DETAIL MANAGER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: PROJECT SELECTOR & QUICK FILTERS (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#A1A1AA] uppercase">
                Active Projects ({filteredProjects.length})
              </span>
              <span className="text-[10px] font-mono text-[#3ECF8E] bg-[#3ECF8E]/10 px-2 py-0.5 rounded">
                Live Synced
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, name, client..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-[#A1A1AA] focus:border-[#3ECF8E] focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="Work in Progress">In Production</option>
                <option value="Client Review">Client Review</option>
                <option value="Complete">Complete</option>
                <option value="Awaited">Awaited</option>
                <option value="Hold">On Hold</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-[#A1A1AA] focus:border-[#3ECF8E] focus:outline-none"
              >
                <option value="all">All Disciplines</option>
                <option value="WebXR">WebXR</option>
                <option value="WebAR">WebAR</option>
                <option value="Exterior CGI">Exterior CGI</option>
                <option value="Interior CGI">Interior CGI</option>
                <option value="Pixel Streaming">Pixel Streaming</option>
                <option value="Walkthrough 4K">Walkthrough 4K</option>
              </select>
            </div>
          </div>

          {/* PROJECT LIST CARDS */}
          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredProjects.map((proj) => {
              const isSelected = selectedProjectId === proj.id;
              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#27272A]/80 border-[#3ECF8E] shadow-md shadow-[#3ECF8E]/10'
                      : 'bg-[#18181B] border-[#27272A] hover:border-[#71717A] hover:bg-[#18181B]/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold text-[#3ECF8E]">
                      {proj.id}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold flex items-center gap-1 ${
                        proj.status === 'Complete'
                          ? 'bg-emerald-950/85 text-emerald-300 border border-emerald-700/60'
                          : proj.status === 'Work in Progress'
                          ? 'bg-sky-950/85 text-sky-300 border border-sky-700/60'
                          : proj.status === 'Client Review'
                          ? 'bg-amber-950/85 text-amber-300 border border-amber-700/60'
                          : 'bg-purple-950/85 text-purple-300 border border-purple-700/60'
                      }`}
                    >
                      {proj.status === 'Complete' && <CheckCircle2 className="w-2.5 h-2.5" />}
                      {proj.status === 'Work in Progress' && <Clock className="w-2.5 h-2.5" />}
                      {proj.status === 'Client Review' && <Eye className="w-2.5 h-2.5" />}
                      {proj.status === 'Awaited' && <Sparkles className="w-2.5 h-2.5" />}
                      <span>{proj.status}</span>
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white truncate font-display">
                    {proj.name}
                  </h4>
                  <div className="text-[10px] text-[#A1A1AA] truncate mt-0.5">
                    {proj.clientCompany} • {proj.clientName}
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[9px] font-mono text-[#71717A]">
                    <span>Lead: {proj.leadArchitect.split(' ')[0]}</span>
                    <span>{proj.progress}% Complete</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1 rounded-full bg-[#09090B] mt-1 overflow-hidden">
                    <div
                      className="h-full bg-[#3ECF8E] rounded-full transition-all duration-300"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: SELECTED PROJECT DEEP CONTROL (8 Cols) */}
        {selectedProject ? (
          <div className="lg:col-span-8 space-y-5">
            {/* PROJECT HEADER CARD */}
            <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272A] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-[#3ECF8E] font-bold">{selectedProject.id}</span>
                    <span className="text-[#71717A]">•</span>
                    <span className="px-2 py-0.5 rounded bg-[#09090B] border border-[#27272A] text-[10px] text-white">
                      {selectedProject.projectType}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#09090B] border border-[#27272A] text-[10px] text-[#3ECF8E]">
                      ${selectedProject.bookingAmount.toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold font-display text-white">
                    {selectedProject.name}
                  </h3>
                  <div className="text-xs text-[#A1A1AA]">
                    Client: <span className="text-white font-medium">{selectedProject.clientName}</span> ({selectedProject.clientCompany})
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsUploadModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-[#27272A] hover:bg-[#3ECF8E] hover:text-black text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Asset</span>
                  </button>
                </div>
              </div>

              {/* TABS NAVIGATION */}
              <div className="flex items-center gap-2 border-b border-[#27272A] pb-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-[#3ECF8E] text-black font-bold'
                      : 'text-[#A1A1AA] hover:text-white hover:bg-[#27272A]'
                  }`}
                >
                  Project Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('pipeline')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'pipeline'
                      ? 'bg-[#3ECF8E] text-black font-bold'
                      : 'text-[#A1A1AA] hover:text-white hover:bg-[#27272A]'
                  }`}
                >
                  Pipeline & Milestones ({selectedProject.pipeline.stages.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('assign')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'assign'
                      ? 'bg-[#3ECF8E] text-black font-bold'
                      : 'text-[#A1A1AA] hover:text-white hover:bg-[#27272A]'
                  }`}
                >
                  Team & Assignments
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('assets')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'assets'
                      ? 'bg-[#3ECF8E] text-black font-bold'
                      : 'text-[#A1A1AA] hover:text-white hover:bg-[#27272A]'
                  }`}
                >
                  Assets & Deliverables ({currentProjectAssets.length})
                </button>
              </div>

              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-[#09090B] border border-[#27272A] space-y-1">
                      <div className="text-[#71717A]">CURRENT STATUS</div>
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedProject.status}
                          onChange={(e) => handleUpdateStatus(e.target.value as ProjectStatus)}
                          className="bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-white font-bold text-xs focus:outline-none focus:border-[#3ECF8E]"
                        >
                          <option value="Work in Progress">Work in Progress</option>
                          <option value="Client Review">Client Review</option>
                          <option value="Complete">Complete</option>
                          <option value="Awaited">Awaited</option>
                          <option value="Hold">On Hold</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#09090B] border border-[#27272A] space-y-1">
                      <div className="text-[#71717A]">HOURS LOGGED</div>
                      <div className="text-white font-bold">
                        {selectedProject.hoursMonitoring.hoursSpent}h / {selectedProject.hoursMonitoring.estimatedHours}h
                      </div>
                      <div className="text-[10px] text-[#3ECF8E]">
                        @ ${selectedProject.hoursMonitoring.hourlyRate}/hr billing
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#09090B] border border-[#27272A] space-y-1">
                      <div className="text-[#71717A]">PROGRESS & SIGN-OFFS</div>
                      <div className="text-[#3ECF8E] font-bold text-base">
                        {selectedProject.progress}%
                      </div>
                      <div className="text-[10px] text-[#A1A1AA]">
                        Stage {selectedProject.pipeline.currentStageIndex + 1} Active
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-2 text-xs">
                    <div className="font-mono text-[#71717A] uppercase text-[10px] font-bold">
                      Commission Brief & Architectural Scope
                    </div>
                    <p className="text-[#FAFAFA] leading-relaxed">
                      {selectedProject.notes || 'Full spatial architectural pipeline initialized with real-time WebXR delivery and 8K photorealistic lighting.'}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: PIPELINE & MILESTONES */}
              {activeTab === 'pipeline' && (
                <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-mono text-[#A1A1AA]">
                    <span>Pipeline Type: <strong className="text-white">{selectedProject.pipeline.pipelineType}</strong></span>
                    <span>Click stage button to advance active milestone</span>
                  </div>

                  <div className="space-y-2.5">
                    {selectedProject.pipeline.stages.map((stage, idx) => {
                      const isCurrent = selectedProject.pipeline.currentStageIndex === idx;
                      const isCompleted = stage.status === 'completed' || idx < selectedProject.pipeline.currentStageIndex;

                      return (
                        <div
                          key={stage.stageNumber || idx}
                          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isCurrent
                              ? 'bg-[#3ECF8E]/10 border-[#3ECF8E]'
                              : isCompleted
                              ? 'bg-[#09090B] border-emerald-900/60 text-[#A1A1AA]'
                              : 'bg-[#09090B] border-[#27272A] opacity-75'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                                isCompleted
                                  ? 'bg-emerald-500 text-black'
                                  : isCurrent
                                  ? 'bg-[#3ECF8E] text-black ring-4 ring-[#3ECF8E]/20 animate-pulse'
                                  : 'bg-[#27272A] text-[#71717A]'
                              }`}
                            >
                              {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-white font-mono">
                                  {stage.title}
                                </h4>
                                {isCurrent && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#3ECF8E] text-black font-bold uppercase">
                                    In Progress
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#A1A1AA]">{stage.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleAdvanceStage(idx)}
                              className={`px-3 py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                                isCurrent
                                  ? 'bg-[#3ECF8E] text-black hover:bg-[#34b27b]'
                                  : 'bg-[#27272A] text-[#A1A1AA] hover:text-white'
                              }`}
                            >
                              {isCompleted ? 'Reopen Stage' : isCurrent ? 'Active Stage' : 'Set Active'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: TEAM & ASSIGNMENTS */}
              {activeTab === 'assign' && (
                <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-mono text-[#A1A1AA]">
                    <span>Assigned Specialists ({TEAM_MEMBERS_DIRECTORY.length} in Studio Pool)</span>
                    <span className="text-[#3ECF8E]">Lead: {selectedProject.leadArchitect}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {TEAM_MEMBERS_DIRECTORY.map((member) => (
                      <div
                        key={member.id}
                        className="p-3 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#27272A] border border-[#3ECF8E]/40 flex items-center justify-center text-xs font-mono font-bold text-[#3ECF8E]">
                            {member.avatar}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{member.name}</div>
                            <div className="text-[10px] text-[#A1A1AA]">{member.role}</div>
                            <div className="text-[9px] font-mono text-[#3ECF8E]">{member.discipline}</div>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded bg-[#18181B] border border-[#27272A] text-[9px] font-mono text-emerald-400">
                          Assigned
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: ASSETS & DELIVERABLES */}
              {activeTab === 'assets' && (
                <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-mono text-[#A1A1AA]">
                    <span>Attached Deliverables & Source Geometry</span>
                    <button
                      type="button"
                      onClick={() => setIsUploadModal(true)}
                      className="text-[#3ECF8E] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Upload Asset</span>
                    </button>
                  </div>

                  {currentProjectAssets.length === 0 ? (
                    <div className="p-8 rounded-xl bg-[#09090B] border border-[#27272A] text-center space-y-2 font-mono text-xs text-[#71717A]">
                      <Upload className="w-8 h-8 mx-auto text-[#71717A]" />
                      <p>No production assets uploaded for this project yet.</p>
                      <button
                        type="button"
                        onClick={() => setIsUploadModal(true)}
                        className="px-3 py-1.5 rounded-lg bg-[#3ECF8E] text-black font-bold text-xs"
                      >
                        Upload First Asset
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {currentProjectAssets.map((asset) => (
                        <div
                          key={asset.id}
                          className="p-3 rounded-xl bg-[#09090B] border border-[#27272A] hover:border-[#71717A] transition-colors flex items-center justify-between gap-3 text-xs font-mono"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#3ECF8E]">
                              {asset.category === '3D Model' ? <FileCode className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="font-bold text-white">{asset.name}</div>
                              <div className="text-[10px] text-[#71717A] flex items-center gap-2">
                                <span>{asset.category}</span>
                                <span>•</span>
                                <span>{asset.size}</span>
                                <span>•</span>
                                <span>{asset.version}</span>
                                <span>•</span>
                                <span>By {asset.uploadedBy}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {asset.category === '3D Model' && (
                              <button
                                type="button"
                                onClick={() => openModelViewer(asset.url, asset.name)}
                                className="px-2.5 py-1 rounded bg-[#3ECF8E]/20 text-[#3ECF8E] hover:bg-[#3ECF8E] hover:text-black transition-colors font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                <span>View 3D</span>
                              </button>
                            )}
                            <a
                              href={asset.url}
                              download
                              className="p-1.5 rounded bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors"
                              title="Download Asset"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* CREATE NEW PROJECT MODAL */}
      {isCreatingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181B] border border-[#27272A] rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <div className="flex items-center gap-2 text-[#3ECF8E] font-mono font-bold text-xs uppercase">
                <FolderKanban className="w-4 h-4" />
                <span>Initialize New Architectural Commission</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingModal(false)}
                className="text-[#71717A] hover:text-white font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProjectSubmit} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[#A1A1AA]">Project / Commission Name *</label>
                  <input
                    type="text"
                    required
                    value={newProjectData.name}
                    onChange={(e) => setNewProjectData({ ...newProjectData, name: e.target.value })}
                    placeholder="e.g. The Elysium Tower & Sky Villas"
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#A1A1AA]">Project Discipline *</label>
                  <select
                    value={newProjectData.projectType}
                    onChange={(e) => setNewProjectData({ ...newProjectData, projectType: e.target.value as ProjectType })}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                  >
                    <option value="WebXR">WebXR Interactive</option>
                    <option value="WebAR">WebAR QuickLook</option>
                    <option value="Exterior CGI">Exterior Visualization 8K</option>
                    <option value="Interior CGI">Interior Staging CGI</option>
                    <option value="Pixel Streaming">Pixel Streaming (UE5 Lumen)</option>
                    <option value="Walkthrough 4K">Walkthrough Animation 4K</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#A1A1AA]">Client Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={newProjectData.clientName}
                    onChange={(e) => setNewProjectData({ ...newProjectData, clientName: e.target.value })}
                    placeholder="e.g. Lord Norman Foster"
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#A1A1AA]">Client Practice / Firm</label>
                  <input
                    type="text"
                    value={newProjectData.clientCompany}
                    onChange={(e) => setNewProjectData({ ...newProjectData, clientCompany: e.target.value })}
                    placeholder="e.g. Foster + Partners London"
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#A1A1AA]">Contract Value ($ USD)</label>
                  <input
                    type="number"
                    value={newProjectData.bookingAmount}
                    onChange={(e) => setNewProjectData({ ...newProjectData, bookingAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#A1A1AA]">Lead Architect / Lead Artist</label>
                  <select
                    value={newProjectData.leadArchitect}
                    onChange={(e) => setNewProjectData({ ...newProjectData, leadArchitect: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                  >
                    {TEAM_MEMBERS_DIRECTORY.map((tm) => (
                      <option key={tm.id} value={tm.name}>
                        {tm.name} ({tm.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#A1A1AA]">Scope & Project Notes</label>
                <textarea
                  rows={3}
                  value={newProjectData.notes}
                  onChange={(e) => setNewProjectData({ ...newProjectData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#27272A]">
                <button
                  type="button"
                  onClick={() => setIsCreatingModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#27272A] text-white hover:bg-[#3f3f46] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#3ECF8E] text-black font-bold hover:bg-[#34b27b] transition-colors"
                >
                  Initialize Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD ASSET MODAL */}
      {isUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181B] border border-[#27272A] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <div className="flex items-center gap-2 text-[#3ECF8E] font-mono font-bold text-xs uppercase">
                <Upload className="w-4 h-4" />
                <span>Upload Asset to {selectedProject?.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModal(false)}
                className="text-[#71717A] hover:text-white font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadAssetSubmit} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-[#A1A1AA]">Asset File Name *</label>
                <input
                  type="text"
                  required
                  value={uploadFormData.name}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, name: e.target.value })}
                  placeholder="e.g. Apex_Tower_Facade_LOD0.glb"
                  className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#A1A1AA]">Asset Category</label>
                  <select
                    value={uploadFormData.category}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, category: e.target.value as ProjectAsset['category'] })}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                  >
                    <option value="3D Model">3D Model (GLB/GLTF)</option>
                    <option value="BIM / CAD">BIM / CAD (IFC/RVT/DWG)</option>
                    <option value="8K Render">8K Render (EXR/PNG)</option>
                    <option value="Texture / Materials">Texture / Materials</option>
                    <option value="Brief / Document">Brief / Document (PDF)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#A1A1AA]">Version Tag</label>
                  <input
                    type="text"
                    value={uploadFormData.version}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, version: e.target.value })}
                    placeholder="e.g. v2.1 Draco"
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-dashed border-[#27272A] bg-[#09090B] text-center space-y-2 cursor-pointer hover:border-[#3ECF8E] transition-colors">
                <Upload className="w-6 h-6 mx-auto text-[#3ECF8E]" />
                <p className="text-white font-bold">Drag & drop asset file or browse</p>
                <p className="text-[10px] text-[#71717A]">Supports .glb, .gltf, .ifc, .rvt, .dwg, .exr, .png up to 500MB</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#27272A]">
                <button
                  type="button"
                  onClick={() => setIsUploadModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#27272A] text-white hover:bg-[#3f3f46] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#3ECF8E] text-black font-bold hover:bg-[#34b27b] transition-colors"
                >
                  Upload & Attach
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
