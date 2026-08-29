'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  HardDrive,
  Cloud,
  Folder,
  Upload,
  Search,
  Filter,
  CheckCircle2,
  FileCode,
  FileText,
  Video,
  Image as ImageIcon,
  Layers,
  Copy,
  Check,
  Download,
  Trash2,
  Eye,
  ExternalLink,
  Plus,
  RefreshCw,
  Sparkles,
  Link2,
  Database,
  Tag,
  FolderPlus
} from 'lucide-react';
import { StorageFileItem, INITIAL_STORAGE_FILES } from '@/lib/core-systems-data';
import { ManagedProject } from '@/lib/projects-data';
import { useAppStore } from '@/lib/store';

interface FileStorageManagerProps {
  projects: ManagedProject[];
}

export default function FileStorageManager({ projects }: FileStorageManagerProps) {
  const [files, setFiles] = useState<StorageFileItem[]>(INITIAL_STORAGE_FILES);
  const [selectedFile, setSelectedFile] = useState<StorageFileItem>(INITIAL_STORAGE_FILES[0]);
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [isUploadModal, setIsUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { showToast, openModelViewer, openLightbox } = useAppStore();

  // Upload Form State
  const [newFileData, setNewFileData] = useState({
    fileName: '',
    fileType: '3d_model' as StorageFileItem['fileType'],
    format: 'glb',
    provider: 'cloudflare_r2' as StorageFileItem['provider'],
    projectId: projects[0]?.id || 'VIZTR-882',
    tags: 'Draco, LOD0, WebXR',
    dimensions: '1.2M Polygons • 12 MB'
  });

  const filteredFiles = files.filter((f) => {
    const matchesSearch =
      !searchQuery ||
      f.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.projectName && f.projectName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      f.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesProvider = providerFilter === 'all' || f.provider === providerFilter;
    const matchesCategory = categoryFilter === 'all' || f.fileType === categoryFilter;

    return matchesSearch && matchesProvider && matchesCategory;
  });

  // Calculate storage metrics
  const totalBytes = files.reduce((acc, f) => acc + f.fileSize, 0);
  const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);
  const modelsBytes = files.filter((f) => f.fileType === '3d_model').reduce((acc, f) => acc + f.fileSize, 0);
  const rendersBytes = files.filter((f) => f.fileType === 'render').reduce((acc, f) => acc + f.fileSize, 0);
  const videosBytes = files.filter((f) => f.fileType === 'video').reduce((acc, f) => acc + f.fileSize, 0);
  const cadBytes = files.filter((f) => f.fileType === 'cad_bim').reduce((acc, f) => acc + f.fileSize, 0);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
    showToast('Link copied to clipboard.', 'success');
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileData.fileName.trim()) {
      showToast('File name is required.', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      setIsUploading(false);

      const matchedProject = projects.find((p) => p.id === newFileData.projectId);
      const tagList = newFileData.tags.split(',').map((t) => t.trim()).filter(Boolean);

      let providerBucket = 'viztr-spatial-models-prod';
      let cdnUrl = `https://cdn.viztr.io/storage/${newFileData.fileName}`;
      let symbolicPath = `/var/storage/${newFileData.fileType}/${newFileData.projectId}/${newFileData.fileName}`;

      if (newFileData.provider === 'aws_s3') {
        providerBucket = 'viztr-studio-assets-prod-us-east-1';
        cdnUrl = `https://s3.amazonaws.com/viztr-studio-assets-prod-us-east-1/${newFileData.fileName}`;
      } else if (newFileData.provider === 'google_drive') {
        providerBucket = 'Google Drive Fleet / Architectural Archival';
        cdnUrl = `https://drive.google.com/file/d/arch-${Date.now()}/view`;
      } else if (newFileData.provider === 'local_fs') {
        providerBucket = 'Local NVMe High-Speed Mount (/mnt/studio-nvme)';
        cdnUrl = `/storage/local/${newFileData.fileName}`;
        symbolicPath = `/mnt/studio-nvme/cache/${newFileData.projectId}/${newFileData.fileName}`;
      }

      const newFile: StorageFileItem = {
        id: `file-${Date.now()}`,
        fileName: newFileData.fileName,
        fileSize: 14500000,
        fileType: newFileData.fileType,
        format: newFileData.format,
        provider: newFileData.provider,
        providerBucket,
        cdnUrl,
        symbolicPath,
        projectId: newFileData.projectId,
        projectName: matchedProject?.name || 'Commission',
        thumbnailUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80',
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'Studio Principal (Admin)',
        tags: tagList.length > 0 ? tagList : ['Uploaded Asset'],
        dimensions: newFileData.dimensions || '14.5 MB'
      };

      setFiles([newFile, ...files]);
      setSelectedFile(newFile);
      setIsUploadModal(false);
      setUploadProgress(0);
      showToast(`Asset "${newFile.fileName}" stored to ${newFile.provider.toUpperCase()}.`, 'success');
    }, 1200);
  };

  const handleDeleteFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (selectedFile.id === id) {
      const remaining = files.filter((f) => f.id !== id);
      setSelectedFile(remaining[0] || files[0]);
    }
    showToast('File removed from cloud storage index.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* BANNER */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#18181B] via-[#121214] to-[#09090B] border border-[#27272A] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E] font-bold uppercase tracking-wider">
            <HardDrive className="w-4 h-4" />
            <span>CORE SYSTEM 04 • CLOUD & LOCAL FILE STORAGE</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white">
            Universal 3D, Render & Video Storage System
          </h2>
          <p className="text-xs text-[#A1A1AA] max-w-2xl">
            Integrate AWS S3, Cloudflare R2 (zero egress), Google Drive Fleet, and Local NVMe Filesystem with symbolic links, automated CDN distribution, and real-time WebXR preview bridges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsUploadModal(true)}
            className="px-4 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#3ECF8E]/90 text-black font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#3ECF8E]/20 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload to Cloud / Local Storage</span>
          </button>
        </div>
      </div>

      {/* STORAGE TIERS & CAPACITY BREAKDOWN CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-1">
          <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-mono">
            <span>TOTAL INDEXED FILES</span>
            <HardDrive className="w-4 h-4 text-[#3ECF8E]" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{files.length} Assets</div>
          <div className="text-[10px] text-[#3ECF8E]">{totalMb} MB Stored in Cluster</div>
        </div>

        <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-1">
          <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-mono">
            <span>CLOUDFLARE R2 (ZERO EGRESS)</span>
            <Cloud className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400 font-mono">
            {files.filter((f) => f.provider === 'cloudflare_r2').length} Files
          </div>
          <div className="text-[10px] text-[#A1A1AA]">Primary 3D GLB & Video CDN</div>
        </div>

        <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-1">
          <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-mono">
            <span>AWS S3 ARCHIVAL</span>
            <Database className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {files.filter((f) => f.provider === 'aws_s3').length} Files
          </div>
          <div className="text-[10px] text-amber-400">8K EXR Master Renders</div>
        </div>

        <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-1">
          <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-mono">
            <span>LOCAL NVME / SYMLINKS</span>
            <Link2 className="w-4 h-4 text-[#3ECF8E]" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {files.filter((f) => f.provider === 'local_fs').length} Files
          </div>
          <div className="text-[10px] text-[#3ECF8E]">Zero-Latency Studio Mount</div>
        </div>
      </div>

      {/* DUAL WORKSPACE: LEFT FILE EXPLORER & RIGHT ASSET INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: FILE EXPLORER (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#A1A1AA] uppercase">
                Storage Explorer ({filteredFiles.length})
              </span>
              <span className="text-[10px] font-mono text-[#3ECF8E] bg-[#3ECF8E]/10 px-2 py-0.5 rounded">
                Multi-Cloud Linked
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search file name, tag, or project..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                className="px-2 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-[#A1A1AA] focus:border-[#3ECF8E] focus:outline-none"
              >
                <option value="all">All Storage Providers</option>
                <option value="cloudflare_r2">Cloudflare R2</option>
                <option value="aws_s3">AWS S3 Bucket</option>
                <option value="google_drive">Google Drive Fleet</option>
                <option value="local_fs">Local NVMe Filesystem</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-[#A1A1AA] focus:border-[#3ECF8E] focus:outline-none"
              >
                <option value="all">All File Types</option>
                <option value="3d_model">3D Models (.glb/.gltf)</option>
                <option value="render">8K Photorealistic Renders</option>
                <option value="video">Cinematic 4K Videos</option>
                <option value="cad_bim">CAD & BIM Geometry</option>
              </select>
            </div>
          </div>

          {/* FILES LIST */}
          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredFiles.map((file) => {
              const isSelected = selectedFile.id === file.id;
              return (
                <div
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#27272A]/80 border-[#3ECF8E] shadow-md shadow-[#3ECF8E]/10'
                      : 'bg-[#18181B] border-[#27272A] hover:border-[#71717A]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-center text-[#3ECF8E]">
                        {file.fileType === '3d_model' && <FileCode className="w-3.5 h-3.5 text-[#3ECF8E]" />}
                        {file.fileType === 'render' && <ImageIcon className="w-3.5 h-3.5 text-amber-400" />}
                        {file.fileType === 'video' && <Video className="w-3.5 h-3.5 text-sky-400" />}
                        {file.fileType === 'cad_bim' && <Layers className="w-3.5 h-3.5 text-purple-400" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white font-mono truncate max-w-[240px]">
                          {file.fileName}
                        </h4>
                        <div className="text-[10px] text-[#71717A]">
                          {file.projectName} ({file.projectId})
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        file.provider === 'cloudflare_r2'
                          ? 'bg-sky-950/80 text-sky-400 border border-sky-800'
                          : file.provider === 'aws_s3'
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                          : file.provider === 'google_drive'
                          ? 'bg-blue-950/80 text-blue-400 border border-blue-800'
                          : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {file.provider.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[9px] font-mono text-[#71717A] border-t border-[#27272A] pt-2">
                    <span>{file.dimensions}</span>
                    <div className="flex items-center gap-1">
                      {file.tags.slice(0, 2).map((t, idx) => (
                        <span key={idx} className="bg-[#09090B] px-1.5 py-0.2 rounded text-[8px] text-[#A1A1AA]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: ASSET INSPECTOR & PREVIEW (6 Cols) */}
        {selectedFile && (
          <div className="lg:col-span-6 space-y-5">
            <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272A] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-[#3ECF8E] font-bold">FORMAT: {selectedFile.format.toUpperCase()}</span>
                    <span className="text-[#71717A]">•</span>
                    <span className="text-white">{selectedFile.dimensions}</span>
                  </div>
                  <h3 className="text-lg font-bold font-display text-white break-all">
                    {selectedFile.fileName}
                  </h3>
                  <div className="text-xs text-[#A1A1AA]">
                    Project: <strong className="text-white">{selectedFile.projectName}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteFile(selectedFile.id)}
                    className="p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800 transition-colors cursor-pointer"
                    title="Delete File"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* STORAGE METADATA SPECS */}
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-[#09090B] border border-[#27272A] space-y-1">
                  <div className="text-[#71717A] text-[10px]">PUBLIC CDN URL</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={selectedFile.cdnUrl}
                      className="flex-1 bg-transparent text-[#3ECF8E] text-[11px] select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedFile.cdnUrl, 'cdn')}
                      className="p-1 rounded bg-[#18181B] hover:bg-[#27272A] text-white"
                      title="Copy CDN Link"
                    >
                      {copiedLink === 'cdn' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {selectedFile.symbolicPath && (
                  <div className="p-2.5 rounded-lg bg-[#09090B] border border-[#27272A] space-y-1">
                    <div className="text-[#71717A] text-[10px]">LOCAL FILESYSTEM SYMBOLIC LINK</div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={selectedFile.symbolicPath}
                        className="flex-1 bg-transparent text-white text-[11px] select-all focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedFile.symbolicPath || '', 'symlink')}
                        className="p-1 rounded bg-[#18181B] hover:bg-[#27272A] text-white"
                        title="Copy Symbolic Link"
                      >
                        {copiedLink === 'symlink' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="p-2.5 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-between">
                  <span className="text-[#71717A]">Storage Bucket:</span>
                  <span className="text-white font-bold truncate max-w-[200px]">{selectedFile.providerBucket}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-between">
                  <span className="text-[#71717A]">Uploaded By:</span>
                  <span className="text-white">{selectedFile.uploadedBy}</span>
                </div>
              </div>

              {/* ACTION BUTTONS & PREVIEW */}
              <div className="pt-2 flex items-center gap-3">
                {selectedFile.fileType === '3d_model' && (
                  <button
                    type="button"
                    onClick={() => openModelViewer(selectedFile.cdnUrl, selectedFile.fileName)}
                    className="flex-1 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Launch 3D WebXR Preview</span>
                  </button>
                )}

                {selectedFile.fileType === 'render' && (
                  <button
                    type="button"
                    onClick={() =>
                      openLightbox([
                        {
                          url: selectedFile.thumbnailUrl || selectedFile.cdnUrl,
                          title: selectedFile.fileName,
                          type: 'image',
                          caption: `Photorealistic Render • ${selectedFile.dimensions}`
                        }
                      ])
                    }
                    className="flex-1 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Inspect 8K Master</span>
                  </button>
                )}

                <a
                  href={selectedFile.cdnUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-4 py-2 rounded-xl bg-[#27272A] hover:bg-[#3f3f46] text-white font-mono font-bold text-xs flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* UPLOAD MODAL */}
      {isUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181B] border border-[#27272A] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <div className="flex items-center gap-2 text-[#3ECF8E] font-mono font-bold text-xs uppercase">
                <Upload className="w-4 h-4" />
                <span>Upload Asset to Multi-Cloud / Local</span>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModal(false)}
                className="text-[#71717A] hover:text-white font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-[#A1A1AA]">File Name *</label>
                <input
                  type="text"
                  required
                  value={newFileData.fileName}
                  onChange={(e) => setNewFileData({ ...newFileData, fileName: e.target.value })}
                  placeholder="e.g. apex_tower_night_facade_draco.glb"
                  className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#A1A1AA]">Asset Type</label>
                  <select
                    value={newFileData.fileType}
                    onChange={(e) => setNewFileData({ ...newFileData, fileType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                  >
                    <option value="3d_model">3D Model (.glb/.gltf/.fbx)</option>
                    <option value="render">8K Render (.exr/.png)</option>
                    <option value="video">Cinematic Video (.mp4/.mov)</option>
                    <option value="cad_bim">CAD & BIM (.dwg/.ifc/.rvt)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#A1A1AA]">Storage Destination</label>
                  <select
                    value={newFileData.provider}
                    onChange={(e) => setNewFileData({ ...newFileData, provider: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                  >
                    <option value="cloudflare_r2">Cloudflare R2 (CDN)</option>
                    <option value="aws_s3">AWS S3 (Archival)</option>
                    <option value="google_drive">Google Drive Fleet</option>
                    <option value="local_fs">Local NVMe (/mnt/studio-nvme)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#A1A1AA]">Attach to Commission</label>
                <select
                  value={newFileData.projectId}
                  onChange={(e) => setNewFileData({ ...newFileData, projectId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[#A1A1AA]">Tags (Comma separated)</label>
                <input
                  type="text"
                  value={newFileData.tags}
                  onChange={(e) => setNewFileData({ ...newFileData, tags: e.target.value })}
                  placeholder="e.g. Draco, LOD0, WebXR Ready"
                  className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#3ECF8E]"
                />
              </div>

              {isUploading && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-[#A1A1AA]">
                    <span>Uploading & generating CDN bindings...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#09090B] overflow-hidden">
                    <div
                      className="h-full bg-[#3ECF8E] transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

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
                  disabled={isUploading}
                  className="px-5 py-2 rounded-lg bg-[#3ECF8E] text-black font-bold hover:bg-[#34b27b] disabled:opacity-50 transition-colors"
                >
                  {isUploading ? 'Uploading...' : 'Save & Publish Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
