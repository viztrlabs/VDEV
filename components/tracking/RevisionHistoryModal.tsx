'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  History,
  X,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Layers,
  FileEdit,
  ArrowUpDown,
  Plus,
  Send,
  Download,
  Copy,
  ExternalLink,
  MessageSquare,
  Shield,
  Eye,
  Sliders,
  Check,
  ChevronRight,
  Pin
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

export interface MarkupItem {
  id: string;
  versionLabel: string;
  stageName: string;
  dateKey: string;
  displayDate: string;
  relativeTime: string;
  author: {
    name: string;
    role: string;
    avatarInitials: string;
  };
  category: 'Markup' | 'Shader & PBR' | 'BIM & Structure' | 'Master Pass' | 'Milestone' | 'Timesheet';
  status: 'Approved' | 'Under Review' | 'Active' | 'Superseded' | 'Resolved';
  title: string;
  summary: string;
  imageUrl?: string;
  resolution?: string;
  renderEngine?: string;
  keyChanges: string[];
  annotations?: {
    id: string;
    label: string;
    color: string;
    comment: string;
  }[];
  ticketId?: string;
}

// Built-in rich chronological markups and revisions per project
export const PROJECT_MARKUPS_DATA: Record<string, MarkupItem[]> = {
  'VIZTR-882': [
    {
      id: 'mk-882-04',
      versionLabel: 'Rev 6.0 (Master 8K Ray-Trace)',
      stageName: 'Stage 06: Production Multi-Pass 8K Ray Tracing',
      dateKey: '2026-02-26',
      displayDate: 'Feb 26, 2026 • 02:45 PM',
      relativeTime: '2 hours ago',
      author: {
        name: 'Elena Rostova',
        role: 'Lead Architect (Foster & Partners)',
        avatarInitials: 'ER'
      },
      category: 'Master Pass',
      status: 'Approved',
      title: 'Full 8K ACEScg Final Production Output & Bloom Pass',
      summary: 'Master ray tracing complete across 128x RTX A6000 cloud GPUs with print-ready color grading and anamorphic bloom.',
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
      resolution: '7680x4320 (8K Ultra HD)',
      renderEngine: 'Distributed RTX A6000 Cloud Farm • ACEScg',
      keyChanges: [
        'Rendered at 4,096 samples per pixel with zero residual noise artifacts',
        'Micro-facet anisotropic specular highlights applied to facade spandrels',
        'ACEScg print color science calibrated for 300 DPI fine art brochure print',
        'Cryptomatte ID passes generated for multi-channel post production'
      ],
      annotations: [
        { id: 'a1', label: 'Pin #01', color: '#3ECF8E', comment: 'Crown beacon luminescence approved at 115% gain.' },
        { id: 'a2', label: 'Pin #02', color: '#60A5FA', comment: 'Triple glazing low-E reflections balanced against dusk sky.' }
      ],
      ticketId: 'REV-882-FIN'
    },
    {
      id: 'mk-882-03',
      versionLabel: 'Rev 4.2 (Client Twilight Revision)',
      stageName: 'Stage 05: Client Twilight Glazing Feedback',
      dateKey: '2026-02-25',
      displayDate: 'Feb 25, 2026 • 11:15 AM',
      relativeTime: 'Yesterday',
      author: {
        name: 'Marcus Vance',
        role: 'Senior Lighting Supervisor',
        avatarInitials: 'MV'
      },
      category: 'Shader & PBR',
      status: 'Under Review',
      title: 'Glazing Reflectance Calibration & Interior Cove Glow',
      summary: 'Increased curtain wall glass reflectivity and activated 2700K warm interior floorplate illumination across 40 floors.',
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=85',
      resolution: '7680x4320 (8K Preview)',
      renderEngine: 'Unreal Engine 5.5 Lumen + V-Ray 6',
      keyChanges: [
        'Curtain wall dielectric glass reflectance boosted from 25% to 45%',
        'Warm 2700K LED cove light fixtures activated across all office floorplates',
        'Enhanced dusk horizon sky gradient with anisotropic twilight sun flare',
        'Updated podium lobby double-height glass transparency'
      ],
      annotations: [
        { id: 'a3', label: 'Pin #03', color: '#F59E0B', comment: 'Client redline: Check lobby atrium illumination level.' }
      ],
      ticketId: 'REV-882-R03'
    },
    {
      id: 'mk-882-02',
      versionLabel: 'Rev 4.0 (Initial Daylight Pass)',
      stageName: 'Stage 04: PBR Glazing & Daylight Staging',
      dateKey: '2026-02-20',
      displayDate: 'Feb 20, 2026 • 04:30 PM',
      relativeTime: '6 days ago',
      author: {
        name: 'Sarah Chen',
        role: 'BIM & Material Artist',
        avatarInitials: 'SC'
      },
      category: 'BIM & Structure',
      status: 'Superseded',
      title: 'Dielectric Glass Ingestion & Structural Steel Texturing',
      summary: 'Low-E triple glazing materials assigned to curtain wall assemblies with dark matte coating on podium structural trusses.',
      imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=85',
      resolution: '5120x2880 (5K Staging)',
      renderEngine: 'Unreal Engine 5.5 Lumen',
      keyChanges: [
        'Imported Low-E triple glazing with physical Index of Refraction (IOR) 1.52',
        'Dark matte industrial powder coat applied to podium structural steel',
        'Surrounding city street environment scattering populated with 3D vehicles'
      ],
      ticketId: 'REV-882-L02'
    },
    {
      id: 'mk-882-01',
      versionLabel: 'Rev 3.0 (Monochromatic Clay Massing)',
      stageName: 'Stage 03: Monochromatic Clay Composition',
      dateKey: '2026-02-14',
      displayDate: 'Feb 14, 2026 • 10:00 AM',
      relativeTime: '12 days ago',
      author: {
        name: 'Foster & Partners BIM Studio',
        role: 'Client Architecture Team',
        avatarInitials: 'FP'
      },
      category: 'Markup',
      status: 'Approved',
      title: 'Architectural Volumetric Alignment & Camera Perspective',
      summary: 'Form validation and 24mm tilt-shift vertical convergence lock to match engineering DWG coordinates.',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85',
      resolution: '3840x2160 (4K Clay)',
      renderEngine: 'V-Ray 6 Neutral Matte Grey Clay',
      keyChanges: [
        'Volumetric shadow verification across 4 solar azimuth angles',
        '24mm tilt-shift optical perspective zeroed without vertical keystoning',
        'Cantilever steel truss structure aligned with structural engineer package'
      ],
      ticketId: 'REV-882-C01'
    }
  ],
  'VIZTR-904': [
    {
      id: 'mk-904-02',
      versionLabel: 'Rev 4.0 (Calacatta Marble & Delta Lights)',
      stageName: 'Stage 04: PBR Materiality & Photometric IES',
      dateKey: '2026-02-26',
      displayDate: 'Feb 26, 2026 • 01:20 PM',
      relativeTime: '3 hours ago',
      author: {
        name: 'Markus Weber',
        role: 'Principal Interior Designer',
        avatarInitials: 'MW'
      },
      category: 'Shader & PBR',
      status: 'Under Review',
      title: 'Calacatta Bookmatched Marble Scans & Fluted Walnut Panelling',
      summary: 'Applied 8K photogrammetry displacement height maps on island and integrated calibrated Delta Light candela distributions.',
      imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85',
      resolution: '7680x4320 (8K Master)',
      renderEngine: 'Unreal Engine 5.5 Lumen + LM-63 IES',
      keyChanges: [
        '8K photogrammetry displacement maps applied to Calacatta marble waterfall island',
        'Calibrated Delta Light LM-63 candela distribution profiles assigned to downlights',
        'Custom fluted walnut panelling stained to match client physical timber sample'
      ],
      ticketId: 'REV-904-M02'
    },
    {
      id: 'mk-904-01',
      versionLabel: 'Rev 2.0 (Clay Blockout & 360 Nodes)',
      stageName: 'Stage 02: Monochromatic Clay Millwork Pass',
      dateKey: '2026-02-16',
      displayDate: 'Feb 16, 2026 • 11:30 AM',
      relativeTime: '10 days ago',
      author: {
        name: 'Zaha Hadid Interior Studio',
        role: 'Lead Architect',
        avatarInitials: 'ZH'
      },
      category: 'Markup',
      status: 'Superseded',
      title: 'Initial Spatial Node & Camera Sightline Verification',
      summary: 'Verified furniture layout, ceiling trough depth, and 1500mm standard eye level panorama node placement.',
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
      resolution: '4096x2048 (4K Equirectangular)',
      renderEngine: 'V-Ray 6 Interior Clay Engine',
      keyChanges: [
        'Raw clay geometry verifying millwork spacing and dining clearance',
        'Camera heights fixed at 1500mm standard eye level for WebXR 360 nodes'
      ],
      ticketId: 'REV-904-C01'
    }
  ]
};

// Generic fallback markup list for any other project ID
export const DEFAULT_MARKUPS_LIST: MarkupItem[] = [
  {
    id: 'mk-gen-03',
    versionLabel: 'Rev 3.2 (Client Redline Adjustment)',
    stageName: 'Stage 04: Lighting & PBR Material Refinement',
    dateKey: '2026-02-26',
    displayDate: 'Feb 26, 2026 • 03:10 PM',
    relativeTime: 'Just now',
    author: {
      name: 'Elena Rostova',
      role: 'Lead Architecture Director',
      avatarInitials: 'ER'
    },
    category: 'Markup',
    status: 'Under Review',
    title: 'Glazing Anisotropic Reflectance & Color Temperature Tune',
    summary: 'Adjusted low-E glass specular roughness, warmed interior downlights to 2700K, and locked final 8K camera angle.',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
    resolution: '7680x4320 (8K Ultra HD)',
    renderEngine: 'Unreal Engine 5.5 Lumen Ray-Tracing',
    keyChanges: [
      'Increased curtain wall glazing reflectivity to 45% for high-contrast dusk sky reflections',
      'Interior lighting warm balance adjusted to 2700K calibrated Planckian locus',
      'Fine-tuned landscaping foliage subsurface scattering shaders'
    ],
    annotations: [
      { id: 'g1', label: 'Markup #01', color: '#3ECF8E', comment: 'Reflective facade highlights aligned to horizon line.' }
    ],
    ticketId: 'REV-GEN-32'
  },
  {
    id: 'mk-gen-02',
    versionLabel: 'Rev 2.0 (PBR Material Ingestion)',
    stageName: 'Stage 03: Texture Maps & Photometric IES Lights',
    dateKey: '2026-02-22',
    displayDate: 'Feb 22, 2026 • 02:00 PM',
    relativeTime: '4 days ago',
    author: {
      name: 'VizTR 3D Team',
      role: 'Lighting & Material Supervisor',
      avatarInitials: 'VZ'
    },
    category: 'Shader & PBR',
    status: 'Approved',
    title: 'High-Res Texture Scans & Micro-Imperfection Layer',
    summary: 'Ingested 8K PBR displacement maps, roughness variation, and architectural concrete board seams.',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=85',
    resolution: '5120x2880 (5K Render)',
    renderEngine: 'V-Ray 6 Spectral Engine',
    keyChanges: [
      'Applied 8K procedural concrete textures with subtle micro-weathering',
      'Configured realistic brushed bronze metallic properties on window mullions'
    ],
    ticketId: 'REV-GEN-20'
  },
  {
    id: 'mk-gen-01',
    versionLabel: 'Rev 1.0 (Clay Volumetric Blockout)',
    stageName: 'Stage 01: CAD Mesh Ingestion & Camera Angles',
    dateKey: '2026-02-15',
    displayDate: 'Feb 15, 2026 • 09:30 AM',
    relativeTime: '11 days ago',
    author: {
      name: 'Foster & Partners BIM Studio',
      role: 'Project Manager',
      avatarInitials: 'FP'
    },
    category: 'BIM & Structure',
    status: 'Approved',
    title: 'Architectural Mesh Ingestion & 24mm Tilt-Shift Calibration',
    summary: 'Cleaned Rhino/Revit IFC geometry, zeroed camera vertical keystoning, and verified solar angles.',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85',
    resolution: '3840x2160 (4K Clay)',
    renderEngine: 'Neutral 18% Gray Clay Pass',
    keyChanges: [
      'Ingested master BIM model with 0.1mm coordinate precision',
      'Locked 5 primary perspective camera focal lengths for director signoff'
    ],
    ticketId: 'REV-GEN-10'
  }
];

interface RevisionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  projectName?: string;
  onSelectRevisionForCompare?: (versionAId: string, versionBId: string) => void;
}

export default function RevisionHistoryModal({
  isOpen,
  onClose,
  projectId = 'VIZTR-882',
  projectName = 'The Apex Tower - Master Tower Facade & XR World',
  onSelectRevisionForCompare
}: RevisionHistoryModalProps) {
  const { showToast } = useAppStore();

  // Local state for interactive additions and filtering
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedMarkup, setSelectedMarkup] = useState<MarkupItem | null>(null);

  // New Markup addition form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newCategory, setNewCategory] = useState<MarkupItem['category']>('Markup');
  const [newChangesText, setNewChangesText] = useState('');
  const [newTicketId, setNewTicketId] = useState('MK-8842');

  // Local additions store
  const [customMarkups, setCustomMarkups] = useState<MarkupItem[]>([]);

  // Base markups for this project
  const baseMarkups = useMemo(() => {
    const list = PROJECT_MARKUPS_DATA[projectId] || DEFAULT_MARKUPS_DATA_FOR(projectId, projectName);
    return [...customMarkups, ...list];
  }, [projectId, projectName, customMarkups]);

  // Filtered and sorted markups
  const displayedMarkups = useMemo(() => {
    let result = [...baseMarkups];

    // Category Filter
    if (activeCategory !== 'All') {
      result = result.filter((m) => m.category === activeCategory);
    }

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.summary.toLowerCase().includes(q) ||
          m.versionLabel.toLowerCase().includes(q) ||
          m.stageName.toLowerCase().includes(q) ||
          m.author.name.toLowerCase().includes(q) ||
          (m.ticketId && m.ticketId.toLowerCase().includes(q)) ||
          m.keyChanges.some((c) => c.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.dateKey).getTime() - new Date(a.dateKey).getTime();
      } else {
        return new Date(a.dateKey).getTime() - new Date(b.dateKey).getTime();
      }
    });

    return result;
  }, [baseMarkups, activeCategory, searchQuery, sortOrder]);

  const handleAddMarkup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Please enter a markup title or change request description.', 'error');
      return;
    }

    const changesList = newChangesText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newEntry: MarkupItem = {
      id: `custom-mk-${Date.now()}`,
      versionLabel: `Rev Delta (${newCategory})`,
      stageName: 'Active Client Review & Markup Stream',
      dateKey: new Date().toISOString().split('T')[0],
      displayDate: `Active Now • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      relativeTime: 'Just now',
      author: {
        name: 'Client Reviewer',
        role: 'Verified Stakeholder',
        avatarInitials: 'CR'
      },
      category: newCategory,
      status: 'Active',
      title: newTitle,
      summary: newSummary || 'Client annotation and architectural adjustment logged.',
      imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=85',
      resolution: 'Real-Time Markup Layer',
      renderEngine: 'VizTR Interactive Markup Engine',
      keyChanges: changesList.length > 0 ? changesList : [newTitle],
      ticketId: newTicketId
    };

    setCustomMarkups((prev) => [newEntry, ...prev]);
    setNewTitle('');
    setNewSummary('');
    setNewChangesText('');
    setShowAddForm(false);
    showToast(`Markup ticket ${newTicketId} logged to chronological history.`, 'success');
  };

  const handleCopyLog = () => {
    const textLog = displayedMarkups
      .map(
        (m, idx) =>
          `[${idx + 1}] ${m.versionLabel} (${m.displayDate})\n` +
          `Category: ${m.category} | Status: ${m.status} | Author: ${m.author.name} (${m.author.role})\n` +
          `Title: ${m.title}\n` +
          `Summary: ${m.summary}\n` +
          `Key Changes:\n` +
          m.keyChanges.map((c) => `  - ${c}`).join('\n') +
          `\nTicket ID: ${m.ticketId || 'N/A'}\n`
      )
      .join('\n----------------------------------------\n\n');

    navigator.clipboard.writeText(`VIZTR REVISION & MARKUP HISTORY LOG\nProject: ${projectName} (${projectId})\nExported: ${new Date().toLocaleString()}\n\n${textLog}`);
    showToast('Chronological markup log copied to clipboard.', 'success');
  };

  const categories = ['All', 'Markup', 'Shader & PBR', 'BIM & Structure', 'Master Pass'];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="modal-revision-history-backdrop"
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          id="modal-revision-history-container"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="hd-card w-full max-w-4xl max-h-[92vh] bg-[#121215] border-[#27272A] shadow-2xl rounded-2xl flex flex-col overflow-hidden text-[#FAFAFA] font-sans"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER BAR */}
          <div className="p-4 sm:p-6 border-b border-[#27272A] bg-[#18181B]/80 flex items-start justify-between gap-4 shrink-0">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 text-[#3ECF8E] text-[11px] font-mono font-bold uppercase tracking-wider">
                  <History className="w-3.5 h-3.5" />
                  <span>Revision History & Markups</span>
                </span>
                <span className="text-xs font-mono text-[#71717A]">• {projectId}</span>
                <span className="px-2 py-0.5 rounded bg-[#27272A] text-[10px] font-mono text-zinc-300 font-semibold">
                  {displayedMarkups.length} logged events
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-white tracking-tight truncate">
                {projectName}
              </h2>
              <p className="text-xs text-[#A1A1AA]">
                Chronological record of 3D architectural markups, shader calibrations, client redlines, and 8K ray-tracing passes.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyLog}
                title="Copy formatted revision log"
                className="p-2 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono"
              >
                <Copy className="w-3.5 h-3.5 text-[#3ECF8E]" />
                <span className="hidden sm:inline">Export Log</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  showAddForm
                    ? 'bg-[#3ECF8E] text-black border-[#3ECF8E]'
                    : 'bg-[#18181B] hover:bg-[#27272A] text-white border-[#27272A] hover:border-[#3ECF8E]/50'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Markup</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close revision history dialog"
                className="p-2 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ADD NEW MARKUP FORM (COLLAPSIBLE) */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-b border-[#27272A] bg-[#09090B] overflow-hidden shrink-0"
              >
                <form onSubmit={handleAddMarkup} className="p-4 sm:p-6 space-y-4 text-xs font-sans">
                  <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
                    <span className="font-bold text-white text-sm flex items-center gap-2">
                      <FileEdit className="w-4 h-4 text-[#3ECF8E]" />
                      <span>Log Architectural Markup / Change Request</span>
                    </span>
                    <span className="text-[11px] font-mono text-[#71717A]">
                      Ticket: {newTicketId}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-[11px] text-[#A1A1AA] uppercase font-mono font-bold">
                        Markup Title / Key Request
                      </label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g. Adjust curtain wall corner reflectance to 40%"
                        className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#27272A] text-white placeholder-[#71717A] text-xs focus:outline-none focus:border-[#3ECF8E]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] text-[#A1A1AA] uppercase font-mono font-bold">
                        Discipline / Category
                      </label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value as MarkupItem['category'])}
                        className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#27272A] text-white text-xs focus:outline-none focus:border-[#3ECF8E]"
                      >
                        <option value="Markup">Client Markup & Redline</option>
                        <option value="Shader & PBR">Shader & PBR Material</option>
                        <option value="BIM & Structure">BIM & Engineering Geometry</option>
                        <option value="Master Pass">8K Ray-Trace Master Pass</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-[#A1A1AA] uppercase font-mono font-bold">
                      Detailed Description & Client Context
                    </label>
                    <textarea
                      rows={2}
                      value={newSummary}
                      onChange={(e) => setNewSummary(e.target.value)}
                      placeholder="Describe the architectural reasons, sun angle requirements, or client feedback notes..."
                      className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#27272A] text-white placeholder-[#71717A] text-xs focus:outline-none focus:border-[#3ECF8E]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-[#A1A1AA] uppercase font-mono font-bold">
                      Specific Bulleted Changes (one per line)
                    </label>
                    <textarea
                      rows={2}
                      value={newChangesText}
                      onChange={(e) => setNewChangesText(e.target.value)}
                      placeholder="Reflectance boosted from 25% to 45%&#10;Interior lights warmed to 2700K&#10;Zeroed camera keystoning"
                      className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#27272A] text-white placeholder-[#71717A] text-xs focus:outline-none focus:border-[#3ECF8E] font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 rounded-lg bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-bold transition-all text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Markup to Timeline</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SEARCH & CATEGORY FILTER BAR */}
          <div className="p-3 sm:px-6 sm:py-3 border-b border-[#27272A] bg-[#141417] flex flex-wrap items-center justify-between gap-3 shrink-0">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search markups, materials, tickets..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-white placeholder-[#71717A] text-xs focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-[#3ECF8E] text-black shadow-sm font-bold'
                      : 'bg-[#18181B] text-[#A1A1AA] hover:text-white border border-[#27272A] hover:border-[#3ECF8E]/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort Toggle */}
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="p-1.5 px-2.5 rounded-md bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white text-xs font-mono flex items-center gap-1.5 cursor-pointer ml-auto"
              title="Toggle sort order"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#3ECF8E]" />
              <span className="hidden sm:inline">
                {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
              </span>
            </button>
          </div>

          {/* CHRONOLOGICAL TIMELINE STREAM */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {displayedMarkups.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center mx-auto text-[#71717A]">
                  <History className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white font-display">No Markups Found</h4>
                <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto">
                  No revision history events match your search criteria. Try clearing filters or create a new markup.
                </p>
                <button
                  onClick={() => {
                    setActiveCategory('All');
                    setSearchQuery('');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#3ECF8E] text-black font-bold text-xs"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-[#3ECF8E] before:via-[#27272A] before:to-transparent">
                {displayedMarkups.map((item, index) => {
                  const isApproved = item.status === 'Approved';
                  const isUnderReview = item.status === 'Under Review' || item.status === 'Active';

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.04 }}
                      className="relative group"
                    >
                      {/* TIMELINE NODE DOT */}
                      <div
                        className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${
                          isApproved
                            ? 'bg-[#09090B] border-[#3ECF8E] text-[#3ECF8E] shadow-[0_0_12px_rgba(62,207,142,0.4)]'
                            : isUnderReview
                            ? 'bg-[#09090B] border-amber-500 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                            : 'bg-[#09090B] border-[#71717A] text-[#71717A]'
                        }`}
                      >
                        {isApproved ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : isUnderReview ? (
                          <Clock className="w-3.5 h-3.5" />
                        ) : (
                          <Layers className="w-3.5 h-3.5" />
                        )}
                      </div>

                      {/* MARKUP CARD */}
                      <div className="hd-card p-4 sm:p-5 bg-[#18181B]/80 hover:bg-[#18181B] border-[#27272A] hover:border-[#3ECF8E]/50 rounded-xl space-y-4 transition-all shadow-md">
                        {/* CARD TOP META */}
                        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#27272A] pb-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-display font-bold text-white text-base">
                                {item.versionLabel}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#09090B] border border-[#27272A] text-[#3ECF8E]">
                                {item.category}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                  isApproved
                                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                                    : isUnderReview
                                    ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                                    : 'bg-zinc-800 text-zinc-400'
                                }`}
                              >
                                {item.status}
                              </span>
                              {item.ticketId && (
                                <span className="text-[10px] font-mono text-[#71717A]">
                                  #{item.ticketId}
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-[#A1A1AA] font-mono">
                              {item.stageName}
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="text-xs font-mono font-semibold text-white">
                              {item.displayDate}
                            </div>
                            <div className="text-[10px] font-mono text-[#71717A]">
                              {item.relativeTime}
                            </div>
                          </div>
                        </div>

                        {/* AUTHOR & DISCIPLINE BAR */}
                        <div className="flex items-center justify-between text-xs bg-[#09090B]/60 p-2.5 rounded-lg border border-[#27272A]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-[#3ECF8E]/20 border border-[#3ECF8E]/40 text-[#3ECF8E] font-bold text-[10px] flex items-center justify-center shrink-0">
                              {item.author.avatarInitials}
                            </div>
                            <div>
                              <span className="text-white font-semibold block leading-tight">
                                {item.author.name}
                              </span>
                              <span className="text-[10px] text-[#71717A] leading-tight">
                                {item.author.role}
                              </span>
                            </div>
                          </div>

                          {item.resolution && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#18181B] text-[#A1A1AA] border border-[#27272A]">
                              {item.resolution}
                            </span>
                          )}
                        </div>

                        {/* TITLE & SUMMARY */}
                        <div className="space-y-1.5">
                          <h4 className="text-sm font-bold text-white leading-snug">
                            {item.title}
                          </h4>
                          <p className="text-xs text-[#A1A1AA] leading-relaxed">
                            {item.summary}
                          </p>
                        </div>

                        {/* THUMBNAIL & KEY CHANGES GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                          {item.imageUrl && (
                            <div className="relative rounded-lg overflow-hidden border border-[#27272A] bg-black aspect-video group/img">
                              <Image
                                src={item.imageUrl}
                                alt={item.title}
                                fill
                                className="object-cover group-hover/img:scale-105 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                                <span className="text-[10px] font-mono text-zinc-300 font-semibold truncate">
                                  {item.renderEngine || 'Render Pass View'}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className={`space-y-2 ${item.imageUrl ? 'md:col-span-2' : 'md:col-span-3'}`}>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] font-bold block">
                              Key Modifications & Parameter Deltas
                            </span>
                            <ul className="space-y-1.5 text-xs">
                              {item.keyChanges.map((change, cIdx) => (
                                <li
                                  key={cIdx}
                                  className="flex items-start gap-2 text-zinc-300"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E] mt-1.5 shrink-0" />
                                  <span>{change}</span>
                                </li>
                              ))}
                            </ul>

                            {/* SPATIAL ANNOTATIONS IF ANY */}
                            {item.annotations && item.annotations.length > 0 && (
                              <div className="pt-2 flex flex-wrap gap-1.5">
                                {item.annotations.map((ann) => (
                                  <span
                                    key={ann.id}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#09090B] border border-[#27272A] text-zinc-300"
                                    title={ann.comment}
                                  >
                                    <Pin className="w-3 h-3 text-[#3ECF8E]" />
                                    <strong className="text-white">{ann.label}:</strong> {ann.comment}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* FOOTER ACTION BAR */}
          <div className="p-4 border-t border-[#27272A] bg-[#18181B] flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs text-[#71717A] font-mono">
              <Shield className="w-3.5 h-3.5 text-[#3ECF8E]" />
              <span>Immutable audit trail secured with cryptographic timestamp.</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function DEFAULT_MARKUPS_DATA_FOR(id: string, name: string): MarkupItem[] {
  return [
    {
      id: `mk-${id}-02`,
      versionLabel: 'Rev 4.0 (PBR & Lighting Calibration)',
      stageName: 'Stage 04: PBR Glazing & Photometric Tuning',
      dateKey: '2026-02-26',
      displayDate: 'Feb 26, 2026 • 01:15 PM',
      relativeTime: 'Today',
      author: {
        name: 'Elena Rostova',
        role: 'Lead Architect',
        avatarInitials: 'ER'
      },
      category: 'Shader & PBR',
      status: 'Under Review',
      title: `${name} — Facade & Lighting Calibration`,
      summary: 'Adjusted reflectance curves, lighting colour temperatures, and camera focal convergence.',
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
      resolution: '7680x4320 (8K Ultra HD)',
      renderEngine: 'Unreal Engine 5.5 Lumen Ray-Tracing',
      keyChanges: [
        'Curtain wall glass reflectance calibrated against dusk sky horizon',
        'Interior lighting color temperature balanced at 2700K',
        'Zeroed 24mm tilt-shift vertical camera keystoning'
      ],
      ticketId: `REV-${id}-04`
    },
    {
      id: `mk-${id}-01`,
      versionLabel: 'Rev 1.0 (Clay Form & Geometry)',
      stageName: 'Stage 01: BIM Ingestion & Volumetric Pass',
      dateKey: '2026-02-18',
      displayDate: 'Feb 18, 2026 • 10:00 AM',
      relativeTime: '8 days ago',
      author: {
        name: 'VizTR BIM Studio',
        role: 'Senior Modeler',
        avatarInitials: 'VZ'
      },
      category: 'BIM & Structure',
      status: 'Approved',
      title: 'Architectural Mesh Ingestion & Volumetric Validation',
      summary: 'Imported IFC structural geometry and validated volumetric sightlines.',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85',
      resolution: '3840x2160 (4K Clay)',
      renderEngine: 'Neutral Gray Clay Engine',
      keyChanges: [
        'Cleaned Revit / Rhino mesh topology and created LOD levels',
        'Verified sun shadow studies across morning and afternoon angles'
      ],
      ticketId: `REV-${id}-01`
    }
  ];
}
