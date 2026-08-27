'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Shield,
  Plus,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Clock,
  Layers,
  Database,
  Search,
  RotateCcw,
  Copy,
  Download,
  Check,
  Building,
  User,
  CreditCard,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { ManagedProject, ProjectType, ProjectStatus, PaymentStatus, PIPELINE_TEMPLATES } from '@/lib/projects-data';
import { useAppStore } from '@/lib/store';

interface SuperAdminProjectManagerProps {
  projects: ManagedProject[];
  onAddProject: (project: ManagedProject) => void;
  onUpdateProject: (project: ManagedProject) => void;
  onDeleteProject: (projectId: string) => void;
}

export default function SuperAdminProjectManager({
  projects,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
}: SuperAdminProjectManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<ManagedProject | null>(projects[0] || null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [viewJsonModal, setViewJsonModal] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { showToast } = useAppStore();

  // Edit / Create Form State
  const [formData, setFormData] = useState<Partial<ManagedProject>>({
    id: '',
    name: '',
    clientName: '',
    clientEmail: '',
    clientCompany: '',
    category: 'Commercial High-Rise',
    projectType: 'WebXR',
    status: 'Work in Progress',
    paymentStatus: 'Partial 50%',
    bookingAmount: 100000,
    progress: 50,
    leadArchitect: '',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    notes: '',
  });

  const filteredProjects = projects.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.clientName.toLowerCase().includes(q) ||
      p.clientCompany.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    );
  });

  const handleStartCreate = () => {
    const newId = `VIZTR-${Math.floor(100 + Math.random() * 900)}`;
    setFormData({
      id: newId,
      name: '',
      clientName: '',
      clientEmail: '',
      clientCompany: '',
      category: 'Commercial High-Rise',
      projectType: 'WebXR',
      status: 'Work in Progress',
      paymentStatus: 'Deposit Received',
      bookingAmount: 75000,
      progress: 10,
      leadArchitect: 'Lead Architectural Principal',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      notes: 'New commissioned spatial pipeline.',
    });
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleStartEdit = (p: ManagedProject) => {
    setFormData({ ...p });
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.clientName?.trim()) {
      showToast('Project name and Client name are required.', 'error');
      return;
    }

    if (isCreating) {
      const pType = (formData.projectType || 'WebXR') as ProjectType;
      const template = PIPELINE_TEMPLATES[pType] || PIPELINE_TEMPLATES['WebXR'];

      const newProj: ManagedProject = {
        id: formData.id || `VIZTR-${Math.floor(100 + Math.random() * 900)}`,
        name: formData.name || 'Untitled Commission',
        clientName: formData.clientName || 'Client Name',
        clientEmail: formData.clientEmail || 'client@studio.com',
        clientCompany: formData.clientCompany || 'Architectural Practice',
        category: formData.category || 'Commercial High-Rise',
        projectType: pType,
        status: (formData.status as ProjectStatus) || 'Work in Progress',
        paymentStatus: (formData.paymentStatus as PaymentStatus) || 'Deposit Received',
        bookingAmount: Number(formData.bookingAmount) || 50000,
        progress: Number(formData.progress) || 10,
        leadArchitect: formData.leadArchitect || 'Lead Architect',
        image: formData.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
        lastUpdate: 'Created by SuperAdmin just now',
        xrAvailable: pType === 'WebXR' || pType === 'WebAR' || pType === 'Virtual Reality' || pType === 'Virtual Tour 360',
        pixelStreamingAvailable: pType === 'Pixel Streaming',
        pendingRevisionsCount: 0,
        revisionsSummary: 'No pending revisions',
        notes: formData.notes || '',
        hoursMonitoring: {
          estimatedHours: 120.0,
          hoursSpent: 12.0,
          hourlyRate: 175,
          disciplineBreakdown: [
            { discipline: '3D Modeling & CAD', hours: 8.0, budgetHours: 35.0, color: '#3ECF8E' },
            { discipline: 'PBR Materials & Shaders', hours: 4.0, budgetHours: 35.0, color: '#06B6D4' },
            { discipline: 'Spatial Engine / Lighting', hours: 0, budgetHours: 30.0, color: '#8B5CF6' },
            { discipline: 'Client Review Prep', hours: 0, budgetHours: 20.0, color: '#F59E0B' },
          ],
          timesheetEntries: [
            {
              id: `ts-${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              teamMember: 'SuperAdmin Master',
              role: 'Studio Director',
              task: 'Project kickoff, BIM data ingestion, and pipeline configuration',
              hours: 12.0,
              stage: 'Stage 1: Kickoff',
            },
          ],
        },
        pipeline: {
          pipelineType: template.pipelineType,
          currentStageIndex: 0,
          stages: template.stages.map((st, idx) => ({
            ...st,
            status: idx === 0 ? 'in_progress' : 'pending',
            deliverablesApproved: 0,
          })),
        },
        documents: [],
      };

      onAddProject(newProj);
      setSelectedProject(newProj);
      setIsCreating(false);
      showToast(`Commission ${newProj.id} initialized with ${pType} pipeline.`, 'success');
    } else if (isEditing && selectedProject) {
      const updated: ManagedProject = {
        ...selectedProject,
        ...formData,
        bookingAmount: Number(formData.bookingAmount) || selectedProject.bookingAmount,
        progress: Number(formData.progress) || selectedProject.progress,
      } as ManagedProject;

      onUpdateProject(updated);
      setSelectedProject(updated);
      setIsEditing(false);
      showToast(`Commission ${updated.id} updated successfully.`, 'success');
    }
  };

  const handleDeleteConfirm = (id: string) => {
    onDeleteProject(id);
    setDeleteConfirmId(null);
    if (selectedProject?.id === id) {
      const remaining = projects.filter((p) => p.id !== id);
      setSelectedProject(remaining[0] || null);
    }
    showToast(`Project ${id} and associated telemetry deleted.`, 'info');
  };

  const handleCopyJson = () => {
    if (!selectedProject) return;
    navigator.clipboard.writeText(JSON.stringify(selectedProject, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
    showToast('Project telemetry copied to clipboard.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* SUPER ADMIN MASTER BAR */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#18181B] to-[#121214] border border-[#27272A] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E] font-bold uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>SuperAdmin Master Authority Console</span>
          </div>
          <h2 className="text-xl font-bold font-display text-white">
            Full Commission Lifecycle & Telemetry Management
          </h2>
          <p className="text-xs text-[#A1A1AA]">
            Read, write, edit, delete, and real-time schema manipulation across all {projects.length} architectural pipelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleStartCreate}
            className="px-4 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#3ECF8E]/90 text-black font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#3ECF8E]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Commission</span>
          </button>
        </div>
      </div>

      {/* DUAL WORKSPACE: PROJECT LIST & MANAGEMENT INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: ALL PROJECTS (5 cols) */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#A1A1AA]">
              Commissions Directory ({filteredProjects.length})
            </h3>
            <span className="text-[10px] font-mono text-[#3ECF8E]">CRUD Enabled</span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project, client, ID..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
            />
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredProjects.map((proj) => {
              const isSelected = selectedProject?.id === proj.id;
              return (
                <div
                  key={proj.id}
                  onClick={() => {
                    setSelectedProject(proj);
                    setIsEditing(false);
                    setIsCreating(false);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#09090B] border-[#3ECF8E] ring-1 ring-[#3ECF8E]/40'
                      : 'bg-[#09090B]/60 border-[#27272A] hover:border-[#71717A]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-black shrink-0">
                      <Image
                        src={proj.image}
                        alt={proj.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#3ECF8E]">{proj.id}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#27272A] font-mono text-[#A1A1AA]">
                          {proj.projectType}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white truncate">{proj.name}</div>
                      <div className="text-[10px] text-[#71717A] font-mono truncate">
                        {proj.clientCompany} · ${proj.bookingAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                        proj.status === 'Complete'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                          : proj.status === 'Work in Progress'
                          ? 'bg-sky-950/80 text-sky-400 border border-sky-800'
                          : 'bg-amber-950/80 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {proj.status}
                    </span>
                    <div className="text-[10px] font-mono text-[#3ECF8E] font-bold">
                      {proj.progress}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: INSPECTOR & EDIT/CREATE FORM (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {isCreating || isEditing ? (
            /* EDIT / CREATE FORM */
            <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-5">
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#3ECF8E]" />
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                    {isCreating ? 'Initialize New Commission' : `Edit Commission ${formData.id}`}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setIsEditing(false);
                  }}
                  className="text-xs font-mono text-[#A1A1AA] hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#A1A1AA] uppercase">Commission ID</label>
                    <input
                      type="text"
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-[#A1A1AA] uppercase">Project Type / Discipline</label>
                    <select
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                    >
                      <option value="WebXR">WebXR Spatial Engine</option>
                      <option value="WebAR">WebAR QuickLook</option>
                      <option value="Virtual Reality">Virtual Reality (6DOF)</option>
                      <option value="Virtual Tour 360">Virtual Tour 360°</option>
                      <option value="Pixel Streaming">Pixel Streaming (UE 5.4)</option>
                      <option value="Animation">Cinematic Animation</option>
                      <option value="Still Renders">8K Still Renders</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#A1A1AA] uppercase">Project Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. The Apex Tower - Master Tower Facade & XR World"
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#A1A1AA] uppercase">Client Lead Name</label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      placeholder="e.g. Elena Rostova"
                      className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-[#A1A1AA] uppercase">Company / Practice</label>
                    <input
                      type="text"
                      value={formData.clientCompany}
                      onChange={(e) => setFormData({ ...formData, clientCompany: e.target.value })}
                      placeholder="e.g. Foster & Partners"
                      className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-[#A1A1AA] uppercase">Client Email</label>
                    <input
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                      placeholder="client@fosterpartners.com"
                      className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#A1A1AA] uppercase">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                    >
                      <option value="Work in Progress">Work in Progress</option>
                      <option value="Client Review">Client Review</option>
                      <option value="Complete">Complete</option>
                      <option value="Awaited">Awaited</option>
                      <option value="Hold">Hold</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-[#A1A1AA] uppercase">Payment Status</label>
                    <select
                      value={formData.paymentStatus}
                      onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                    >
                      <option value="Paid">Paid (100%)</option>
                      <option value="Partial 50%">Partial 50%</option>
                      <option value="Milestone Pending">Milestone Pending</option>
                      <option value="Deposit Received">Deposit Received</option>
                      <option value="Invoiced">Invoiced</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-[#A1A1AA] uppercase">Booking Amount ($)</label>
                    <input
                      type="number"
                      value={formData.bookingAmount}
                      onChange={(e) => setFormData({ ...formData, bookingAmount: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#A1A1AA] uppercase">Progress (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.progress}
                      onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-[#A1A1AA] uppercase">Lead Architect / Supervisor</label>
                    <input
                      type="text"
                      value={formData.leadArchitect}
                      onChange={(e) => setFormData({ ...formData, leadArchitect: e.target.value })}
                      placeholder="e.g. Elena Rostova, Foster & Partners"
                      className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#A1A1AA] uppercase">Cover Image URL</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#A1A1AA] uppercase">Production Notes & NDA Terms</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E] resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#27272A]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-white font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#3ECF8E]/90 text-black font-bold shadow-lg shadow-[#3ECF8E]/20 cursor-pointer"
                  >
                    {isCreating ? 'Initialize Commission' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          ) : selectedProject ? (
            /* PROJECT DETAILS VIEW WITH EDIT / DELETE / RAW JSON ACTIONS */
            <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-6">
              {/* TOP ACTION HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272A] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-[#3ECF8E]">
                      {selectedProject.id}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#27272A] text-[10px] font-mono text-white">
                      {selectedProject.projectType}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#27272A] text-[10px] font-mono text-[#3ECF8E]">
                      ${selectedProject.bookingAmount.toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold font-display text-white mt-1">
                    {selectedProject.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewJsonModal(true)}
                    className="p-2 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white"
                    title="View Raw Telemetry JSON"
                  >
                    <FileText className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartEdit(selectedProject)}
                    className="px-3 py-1.5 rounded-lg bg-[#27272A] hover:bg-[#3ECF8E] hover:text-black text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {deleteConfirmId === selectedProject.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDeleteConfirm(selectedProject.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs cursor-pointer"
                      >
                        Confirm Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1.5 rounded-lg bg-[#27272A] text-[#A1A1AA] text-xs font-mono"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(selectedProject.id)}
                      className="p-2 rounded-lg bg-[#09090B] hover:bg-rose-950/80 border border-[#27272A] text-[#71717A] hover:text-rose-400 hover:border-rose-800 transition-colors"
                      title="Delete Commission"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* STATS OVERVIEW GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#09090B] border border-[#27272A]">
                  <div className="text-[10px] text-[#71717A]">STATUS</div>
                  <div className="text-white font-bold mt-0.5">{selectedProject.status}</div>
                </div>

                <div className="p-3 rounded-xl bg-[#09090B] border border-[#27272A]">
                  <div className="text-[10px] text-[#71717A]">PAYMENT</div>
                  <div className="text-[#3ECF8E] font-bold mt-0.5">{selectedProject.paymentStatus}</div>
                </div>

                <div className="p-3 rounded-xl bg-[#09090B] border border-[#27272A]">
                  <div className="text-[10px] text-[#71717A]">HOURS LOGGED</div>
                  <div className="text-white font-bold mt-0.5">
                    {selectedProject.hoursMonitoring.hoursSpent} / {selectedProject.hoursMonitoring.estimatedHours}h
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#09090B] border border-[#27272A]">
                  <div className="text-[10px] text-[#71717A]">PIPELINE STAGE</div>
                  <div className="text-white font-bold mt-0.5">
                    Stage {selectedProject.pipeline.currentStageIndex + 1} of {selectedProject.pipeline.stages.length}
                  </div>
                </div>
              </div>

              {/* CLIENT & LEAD ARCHITECT INFO */}
              <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-2 text-xs font-mono">
                <h4 className="text-[10px] uppercase font-bold text-[#A1A1AA]">
                  Client Stakeholders & Practice
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[#71717A]">Client Lead: </span>
                    <span className="text-white font-bold">{selectedProject.clientName}</span>
                    <div className="text-[10px] text-[#A1A1AA]">{selectedProject.clientEmail}</div>
                  </div>
                  <div>
                    <span className="text-[#71717A]">Practice: </span>
                    <span className="text-white font-bold">{selectedProject.clientCompany}</span>
                    <div className="text-[10px] text-[#A1A1AA]">{selectedProject.leadArchitect}</div>
                  </div>
                </div>
              </div>

              {/* PIPELINE STAGES SUMMARY */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] uppercase font-bold text-[#A1A1AA]">
                    Pipeline Stages Checklist ({selectedProject.pipeline.stages.length} Stages)
                  </h4>
                  <span className="text-[10px] text-[#3ECF8E]">
                    {selectedProject.pipeline.pipelineType}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {selectedProject.pipeline.stages.map((st) => (
                    <div
                      key={st.stageNumber}
                      className="p-2.5 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#27272A] text-white text-[10px] font-bold flex items-center justify-center">
                          {st.stageNumber}
                        </span>
                        <div>
                          <div className="text-white font-bold">{st.title}</div>
                          <div className="text-[10px] text-[#71717A]">{st.eta}</div>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          st.status === 'completed'
                            ? 'bg-emerald-950/80 text-emerald-400'
                            : st.status === 'in_progress'
                            ? 'bg-sky-950/80 text-sky-400'
                            : 'bg-[#18181B] text-[#71717A]'
                        }`}
                      >
                        {st.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#18181B] border border-[#27272A] text-center text-[#71717A] space-y-3 font-mono">
              <Database className="w-8 h-8 mx-auto text-[#3ECF8E]" />
              <p className="text-sm">Select a commission from the directory to inspect or edit telemetry.</p>
              <button
                type="button"
                onClick={handleStartCreate}
                className="px-4 py-2 rounded-xl bg-[#3ECF8E] text-black font-bold text-xs"
              >
                + Create Commission
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RAW JSON TELEMETRY MODAL */}
      {viewJsonModal && selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#18181B] border border-[#27272A] rounded-2xl p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <div className="flex items-center gap-2 font-mono text-sm text-white font-bold">
                <FileText className="w-4 h-4 text-[#3ECF8E]" />
                <span>Raw Pipeline Telemetry JSON · {selectedProject.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setViewJsonModal(false)}
                className="text-[#71717A] hover:text-white text-lg"
              >
                ×
              </button>
            </div>

            <pre className="flex-1 overflow-y-auto p-4 rounded-xl bg-[#09090B] border border-[#27272A] text-[11px] font-mono text-[#3ECF8E] leading-relaxed select-all">
              {JSON.stringify(selectedProject, null, 2)}
            </pre>

            <div className="flex items-center justify-between pt-2 border-t border-[#27272A]">
              <span className="text-[10px] font-mono text-[#71717A]">
                Schema standard: VIZTR-BIM-XR-2026.1
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="px-3 py-1.5 rounded-lg bg-[#27272A] hover:bg-[#3ECF8E] hover:text-black text-white font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewJsonModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-[#3ECF8E] text-black font-mono font-bold text-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
