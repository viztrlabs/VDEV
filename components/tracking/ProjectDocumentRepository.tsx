'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import {
  FileText,
  FileCode,
  Download,
  Eye,
  Search,
  Filter,
  Layers,
  Upload,
  CheckCircle2,
  FileSpreadsheet,
  FileCheck,
  HardDrive,
  Calendar,
  User,
  Tag,
  Sparkles,
  ChevronDown,
  ExternalLink,
  X,
  FileBox,
  FileBadge,
  Info,
  Maximize2
} from 'lucide-react';
import DocumentQuickViewModal from './DocumentQuickViewModal';

export type DocumentType = 'pdf' | 'cad' | 'spec' | 'bim';

export interface ProjectDocument {
  id: string;
  title: string;
  fileName: string;
  fileType: DocumentType;
  extension: string;
  fileSize: string;
  version: string;
  updatedAt: string;
  uploadedBy: string;
  category: 'Architectural Blueprint' | 'CAD / 3D Exchange' | 'Technical Specs' | 'Milestone Signoff' | 'BIM Model';
  description: string;
  status: 'Approved' | 'In Review' | 'Archival' | 'Superseded';
  checksum?: string;
  downloadUrl?: string;
  pageCountOrUnits?: string;
}

interface ProjectDocumentRepositoryProps {
  documents: ProjectDocument[];
  projectName: string;
  projectId: string;
  className?: string;
}

export default function ProjectDocumentRepository({
  documents: initialDocuments,
  projectName,
  projectId,
  className = '',
}: ProjectDocumentRepositoryProps) {
  const { showToast } = useAppStore();
  const [customDocsByProject, setCustomDocsByProject] = useState<Record<string, ProjectDocument[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePreviewDoc, setActivePreviewDoc] = useState<ProjectDocument | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const customDocs = customDocsByProject[projectId] || [];
  const allDocuments = [...customDocs, ...initialDocuments];

  // Filter logic
  const filteredDocuments = allDocuments.filter((doc) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'pdf' && doc.fileType === 'pdf') ||
      (selectedCategory === 'cad' && (doc.fileType === 'cad' || doc.fileType === 'bim')) ||
      (selectedCategory === 'spec' && doc.fileType === 'spec');

    const matchesSearch =
      searchQuery.trim() === '' ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.extension.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleDownload = (doc: ProjectDocument) => {
    showToast(`Downloading "${doc.fileName}" (${doc.fileSize})...`, 'info');
    // Simulated instant file download trigger
    const link = document.createElement('a');
    link.href = '#';
    link.setAttribute('download', doc.fileName);
    setTimeout(() => {
      showToast(`Completed download of ${doc.fileName}`, 'success');
    }, 1200);
  };

  const handleBatchDownload = () => {
    showToast(`Packaging ${filteredDocuments.length} document assets into secure ZIP archive...`, 'success');
  };

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setTimeout(() => {
      const ext = file.name.split('.').pop()?.toUpperCase() || 'PDF';
      let type: DocumentType = 'pdf';
      if (['DWG', 'DXF', 'RVT', 'SKP', '3DM'].includes(ext)) type = 'cad';
      else if (['IFC', 'BIM'].includes(ext)) type = 'bim';
      else if (['JSON', 'XML', 'TXT', 'IES'].includes(ext)) type = 'spec';

      const newDoc: ProjectDocument = {
        id: `doc-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        fileName: file.name,
        fileType: type,
        extension: ext,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        version: 'v1.0 (Client Upload)',
        updatedAt: 'Just now',
        uploadedBy: 'Client Portal User',
        category: type === 'cad' ? 'CAD / 3D Exchange' : type === 'spec' ? 'Technical Specs' : 'Architectural Blueprint',
        description: 'Uploaded reference document for studio pipeline ingestion and calibration.',
        status: 'In Review',
        checksum: 'SHA-256:' + Math.random().toString(36).substring(2, 12).toUpperCase(),
      };

      setCustomDocsByProject((prev) => ({
        ...prev,
        [projectId]: [newDoc, ...(prev[projectId] || [])],
      }));
      setIsUploading(false);
      setUploadSuccess(true);
      showToast(`Successfully ingested "${file.name}" into ${projectId} repository!`, 'success');
      setTimeout(() => setUploadSuccess(false), 4000);
    }, 1400);
  };

  const getBadgeStyle = (fileType: DocumentType, extension: string) => {
    switch (fileType) {
      case 'pdf':
        return {
          bg: 'bg-rose-950/60 border-rose-800/60 text-rose-400',
          icon: <FileText className="w-4 h-4" />,
          label: extension,
        };
      case 'cad':
        return {
          bg: 'bg-blue-950/60 border-blue-800/60 text-blue-400',
          icon: <FileCode className="w-4 h-4" />,
          label: extension,
        };
      case 'bim':
        return {
          bg: 'bg-cyan-950/60 border-cyan-800/60 text-cyan-400',
          icon: <FileBox className="w-4 h-4" />,
          label: extension,
        };
      case 'spec':
        return {
          bg: 'bg-amber-950/60 border-amber-800/60 text-amber-400',
          icon: <FileSpreadsheet className="w-4 h-4" />,
          label: extension,
        };
      default:
        return {
          bg: 'bg-zinc-800 border-zinc-700 text-zinc-300',
          icon: <FileCheck className="w-4 h-4" />,
          label: extension,
        };
    }
  };

  return (
    <div
      id={`project-document-repository-${projectId}`}
      className={`rounded-2xl bg-[#18181B] border border-[#27272A] overflow-hidden space-y-0 ${className}`}
    >
      {/* HEADER & ACTION BAR */}
      <div className="p-5 border-b border-[#27272A] bg-[#18181B] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-center text-[#3ECF8E]">
                <FileBox className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold font-display text-white">
                Technical Document & CAD Repository
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#09090B] border border-[#27272A] text-[#3ECF8E]">
                {projectId} Vault
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA]">
              Direct access to architectural blueprint PDFs, BIM/CAD geometry files, and PBR photometric technical specs.
            </p>
          </div>

          {/* ACTION BUTTONS: UPLOAD & BATCH DOWNLOAD */}
          <div className="flex items-center gap-2">
            <label
              role="button"
              tabIndex={0}
              aria-label="Upload reference blueprint or CAD document"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  (e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement)?.click();
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] hover:border-[#3ECF8E]/40 text-xs font-mono text-white flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 focus:outline-none focus:ring-1 focus:ring-[#3ECF8E]"
            >
              <Upload className="w-3.5 h-3.5 text-[#3ECF8E]" />
              <span>{isUploading ? 'Ingesting...' : 'Upload Reference'}</span>
              <input
                type="file"
                className="hidden"
                aria-label="Upload reference document file"
                accept=".pdf,.dwg,.dxf,.rvt,.ifc,.skp,.3dm,.json,.ies"
                onChange={handleSimulatedUpload}
                disabled={isUploading}
              />
            </label>

            <button
              type="button"
              onClick={handleBatchDownload}
              aria-label={`Export all ${filteredDocuments.length} repository documents as ZIP`}
              className="px-3 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow focus:outline-none focus:ring-2 focus:ring-white"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All (ZIP)</span>
            </button>
          </div>
        </div>

        {/* SEARCH AND CATEGORY FILTER TABS */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
          {/* CATEGORY TABS */}
          <div
            role="tablist"
            aria-label="Document Category Filter"
            className="flex items-center gap-1.5 p-1 rounded-xl bg-[#09090B] border border-[#27272A] overflow-x-auto text-xs font-mono"
          >
            <button
              type="button"
              role="tab"
              aria-selected={selectedCategory === 'all'}
              aria-label={`View all ${allDocuments.length} document assets`}
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#18181B] text-white font-bold border border-[#3ECF8E]/40 text-[#3ECF8E]'
                  : 'text-[#71717A] hover:text-white'
              }`}
            >
              All Assets ({allDocuments.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={selectedCategory === 'pdf'}
              aria-label="Filter to PDF Blueprints"
              onClick={() => setSelectedCategory('pdf')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'pdf'
                  ? 'bg-[#18181B] text-rose-400 font-bold border border-rose-800/60'
                  : 'text-[#71717A] hover:text-rose-300'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF Blueprints</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={selectedCategory === 'cad'}
              aria-label="Filter to CAD and BIM exchange files"
              onClick={() => setSelectedCategory('cad')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'cad'
                  ? 'bg-[#18181B] text-blue-400 font-bold border border-blue-800/60'
                  : 'text-[#71717A] hover:text-blue-300'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>CAD & BIM</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={selectedCategory === 'spec'}
              aria-label="Filter to Technical Specification sheets"
              onClick={() => setSelectedCategory('spec')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'spec'
                  ? 'bg-[#18181B] text-amber-400 font-bold border border-amber-800/60'
                  : 'text-[#71717A] hover:text-amber-300'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Technical Specs</span>
            </button>
          </div>

          {/* SEARCH INPUT */}
          <div className="relative flex-1 md:max-w-xs">
            <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              aria-label="Search repository documents by title, format, or keyword"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, format, or tag..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#09090B] border border-[#27272A] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear document search query"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* UPLOAD SUCCESS ALERT */}
      {uploadSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="p-3 mx-5 mt-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs font-mono text-emerald-400 flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>New document ingested into the studio pipeline index and staged for review.</span>
        </div>
      )}

      {/* DOCUMENT GRID */}
      <div className="p-5">
        {filteredDocuments.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <FileBox className="w-8 h-8 text-[#71717A] mx-auto" />
            <div className="space-y-1">
              <p className="text-xs font-mono text-white font-bold">No matching documents found</p>
              <p className="text-[11px] text-[#71717A]">
                Try adjusting your search criteria or switch category filter tabs.
              </p>
            </div>
            <button
              type="button"
              aria-label="Reset document search and category filters"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-xs font-mono text-[#3ECF8E] hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredDocuments.map((doc) => {
              const badge = getBadgeStyle(doc.fileType, doc.extension);

              return (
                <div
                  key={doc.id}
                  id={`doc-item-${doc.id}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Document ${doc.title}, format ${doc.extension}, size ${doc.fileSize}, status ${doc.status}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActivePreviewDoc(doc);
                    }
                  }}
                  onClick={() => setActivePreviewDoc(doc)}
                  className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] hover:border-[#3ECF8E]/50 transition-all flex flex-col justify-between space-y-3 group cursor-pointer hover:bg-[#121215] focus:outline-none focus:ring-1 focus:ring-[#3ECF8E]"
                >
                  <div className="space-y-2.5">
                    {/* TOP ROW: ICON + TITLE + BADGES */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${badge.bg}`}
                        >
                          {badge.icon}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="text-xs font-bold font-display text-white truncate group-hover:text-[#3ECF8E] transition-colors" title={doc.title}>
                            {doc.title}
                          </h4>
                          <div className="text-[10px] font-mono text-[#71717A] truncate">
                            {doc.fileName}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          role="status"
                          aria-label={`Document approval status: ${doc.status}`}
                          className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                            doc.status === 'Approved'
                              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                              : doc.status === 'In Review'
                              ? 'bg-amber-950/60 border-amber-800 text-amber-400'
                              : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                          }`}
                        >
                          {doc.status}
                        </span>
                      </div>
                    </div>

                    {/* DESCRIPTION */}
                    <p className="text-[11px] text-[#A1A1AA] leading-relaxed line-clamp-2">
                      {doc.description}
                    </p>
                  </div>

                  {/* METADATA STRIP */}
                  <div className="pt-2.5 border-t border-[#27272A]/70 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
                    <div className="flex items-center gap-3 text-[#71717A]">
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3 text-[#3ECF8E]" />
                        <span>{doc.fileSize}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-[#3ECF8E]" />
                        <span>{doc.version}</span>
                      </span>
                      <span className="hidden sm:inline text-[#71717A]">
                        {doc.updatedAt}
                      </span>
                    </div>

                    {/* ACTIONS: PREVIEW & DOWNLOAD */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-label={`Quick View preview for ${doc.title}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePreviewDoc(doc);
                        }}
                        className="px-2.5 py-1 rounded bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[10px] font-mono text-white flex items-center gap-1 transition-colors cursor-pointer hover:border-[#3ECF8E]/40 focus:outline-none focus:ring-1 focus:ring-[#3ECF8E]"
                      >
                        <Eye className="w-3 h-3 text-[#3ECF8E]" />
                        <span>Quick View</span>
                      </button>

                      <button
                        type="button"
                        aria-label={`Download ${doc.fileName}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(doc);
                        }}
                        className="p-1 px-2 rounded bg-[#3ECF8E]/10 hover:bg-[#34b27b] text-[#3ECF8E] hover:text-black border border-[#3ECF8E]/30 text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#3ECF8E]"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FOOTER INFO BAR */}
      <div className="p-3 bg-[#09090B] border-t border-[#27272A] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-[#71717A]">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#3ECF8E]" />
          <span>All CAD models & PDFs are calibrated to WGS84 coordinates and photorealistic physical scale (1:1).</span>
        </div>
        <div className="text-[#A1A1AA]">
          Secure Vault Revision Control · In-Browser PDF/CAD Quick View
        </div>
      </div>

      {/* QUICK VIEW PREVIEW MODAL */}
      <DocumentQuickViewModal
        document={activePreviewDoc}
        projectName={projectName}
        projectId={projectId}
        onClose={() => setActivePreviewDoc(null)}
        onDownload={handleDownload}
      />
    </div>
  );
}
