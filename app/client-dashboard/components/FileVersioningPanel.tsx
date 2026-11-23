'use client';

import React, { useState, useCallback, useRef } from 'react';
import { FileCode, Download, History, Eye, ExternalLink, Upload, FileImage, FileVideo, FileText, FileArchive, Plus, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { FileDetailModal } from './FileDetailModal';

interface FileVersioningPanelProps {
  projectId?: string;
  project?: any;
  onFileClick?: (file: any) => void;
  onModelView?: (file: any) => void;
}

interface FileItem {
  id: string;
  fileName: string;
  version: string;
  size: string;
  updatedAt: string;
  author: string;
  status: string;
  type: string;
  format: string;
  url: string;
  description: string;
  tags: string[];
  category: string;
  checksum: string;
  source: 'viztr' | 'client';
  uploadedBy?: string;
  uploadedAt?: string;
}

const VIZTR_DELIVERABLES = [
  { id: 'ver-04', fileName: 'Apex_Tower_LOD400_Facade_Final_Lumen_v4.dwg', version: 'v4.0 (Latest)', size: '148.4 MB', updatedAt: 'Aug 28, 2026', author: 'VizTR BIM Engineering', status: 'Current Master', type: 'cad', format: 'dwg', url: '/models/apex-tower-v4.dwg', description: 'Final Lumen-engineered facade master file with all revisions integrated.', tags: ['BIM', 'Facade', 'LOD400', 'Final'], category: 'BIM / CAD', checksum: 'sha256:a1b2c3d4e5f6...', source: 'viztr', uploadedBy: 'VizTR BIM Engineering', uploadedAt: 'Aug 28, 2026' },
  { id: 'ver-03', fileName: 'Apex_Tower_LOD400_Facade_Engineering_Set_Rev3.dwg', version: 'v3.2', size: '142.1 MB', updatedAt: 'Aug 18, 2026', author: 'Alexander Wright', status: 'Superceded', type: 'cad', format: 'dwg', url: '/models/apex-tower-v3.dwg', description: 'Engineering set revision 3 with structural coordination updates.', tags: ['BIM', 'Facade', 'LOD400', 'Engineering'], category: 'BIM / CAD', checksum: 'sha256:b2c3d4e5f6a7...', source: 'viztr', uploadedBy: 'Alexander Wright', uploadedAt: 'Aug 18, 2026' },
  { id: 'ver-02', fileName: 'Apex_Tower_Structural_Steel_LOD350_Rev2.ifc', version: 'v2.0', size: '88.5 MB', updatedAt: 'Aug 10, 2026', author: 'Elena Rostova', status: 'Archived', type: '3d-model', format: 'ifc', url: '/models/apex-tower-structural-v2.ifc', description: 'Structural steel IFC export for coordination and clash detection.', tags: ['IFC', 'Structural', 'LOD350', 'Steel'], category: '3D Model', checksum: 'sha256:c3d4e5f6a7b8...', source: 'viztr', uploadedBy: 'Elena Rostova', uploadedAt: 'Aug 10, 2026' },
  { id: 'ver-01', fileName: 'Apex_Tower_Exterior_Rendering_v4_8K.exr', version: 'v4.0 (Final)', size: '245 MB', updatedAt: 'Aug 25, 2026', author: 'Julian Vance', status: 'Approved', type: 'render', format: 'exr', url: '/renders/apex-tower-ext-v4.exr', description: 'Final 8K exterior rendering with Lumen GI and path-traced reflections.', tags: ['Render', 'Exterior', '8K', 'Final'], category: '8K Render', checksum: 'sha256:d4e5f6a7b8c9...', source: 'viztr', uploadedBy: 'Julian Vance', uploadedAt: 'Aug 25, 2026' },
  { id: 'ver-00', fileName: 'Apex_Tower_Interior_Walkthrough_4K.mp4', version: 'v1.0 (Final)', size: '1.2 GB', updatedAt: 'Aug 20, 2026', author: 'Marcus Sterling', status: 'Approved', type: 'video', format: 'mp4', url: '/videos/apex-tower-walkthrough-4k.mp4', description: 'Cinematic 4K walkthrough animation at 60fps with spatial audio.', tags: ['Video', 'Walkthrough', '4K', '60fps'], category: 'Video', checksum: 'sha256:e5f6a7b8c9d0...', source: 'viztr', uploadedBy: 'Marcus Sterling', uploadedAt: 'Aug 20, 2026' },
];

const MOCK_CLIENT_UPLOADS = [
  { id: 'client-01', fileName: 'Apex_Tower_Revit_Model_v2.rvt', version: 'v2.1', size: '2.1 GB', updatedAt: 'Sep 1, 2026', author: 'Alexander Wright', status: 'Uploaded', type: 'cad', format: 'rvt', url: '', description: 'Updated Revit model with revised curtain wall system.', tags: ['Revit', 'Curtain Wall', 'LOD400'], category: 'BIM / CAD', checksum: '', source: 'client', uploadedBy: 'Alexander Wright (Foster + Partners)', uploadedAt: 'Sep 1, 2026' },
  { id: 'client-02', fileName: 'Site_Survey_Pointcloud.e57', version: 'v1.0', size: '4.3 GB', updatedAt: 'Aug 29, 2026', author: 'Elena Rostova', status: 'Processing', type: 'pointcloud', format: 'e57', url: '', description: 'High-density terrestrial LiDAR survey of site boundary.', tags: ['LiDAR', 'Survey', 'E57'], category: 'Point Cloud', checksum: '', source: 'client', uploadedBy: 'Elena Rostova (Foster + Partners)', uploadedAt: 'Aug 29, 2026' },
];

const FILE_ICONS: Record<string, any> = { cad: FileCode, dwg: FileCode, rvt: FileCode, ifc: FileCode, image: FileImage, render: FileImage, exr: FileImage, png: FileImage, jpg: FileImage, video: FileVideo, mp4: FileVideo, mov: FileVideo, pdf: FileText, '3d-model': FileCode, model: FileCode, glb: FileCode, gltf: FileCode, pointcloud: FileCode, e57: FileCode, default: FileCode };
const FILE_COLORS: Record<string, string> = { cad: 'bg-amber-950/40 text-amber-400', dwg: 'bg-amber-950/40 text-amber-400', rvt: 'bg-blue-950/40 text-blue-400', ifc: 'bg-violet-950/40 text-violet-400', image: 'bg-emerald-950/40 text-emerald-400', render: 'bg-emerald-950/40 text-emerald-400', exr: 'bg-emerald-950/40 text-emerald-400', png: 'bg-emerald-950/40 text-emerald-400', video: 'bg-violet-950/40 text-violet-400', mp4: 'bg-violet-950/40 text-violet-400', pdf: 'bg-red-950/40 text-red-400', '3d-model': 'bg-amber-950/40 text-amber-400', model: 'bg-amber-950/40 text-amber-400', glb: 'bg-amber-950/40 text-amber-400', pointcloud: 'bg-sky-950/40 text-sky-400', default: 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]' };
const STATUS_COLORS: Record<string, string> = { 'Current Master': 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40', 'Approved': 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40', 'Superceded': 'bg-amber-950/40 text-amber-400 border-amber-800/40', 'Archived': 'bg-zinc-800 text-zinc-400 border-zinc-700', 'Uploaded': 'bg-blue-950/40 text-blue-400 border-blue-800/40', 'Processing': 'bg-amber-950/40 text-amber-400 border-amber-800/40', default: 'bg-[#353436] text-[#A1A1AA] border-[#3f3f46]' };

const getFileIcon = (file: any) => { const ext = file.format.toLowerCase(); const type = file.type.toLowerCase(); return FILE_ICONS[file.format.toLowerCase()] || FILE_ICONS[file.type.toLowerCase()] || FILE_ICONS.default; };
const getColorClass = (file: any) => { const ext = file.format.toLowerCase(); const type = file.type.toLowerCase(); return FILE_COLORS[file.format.toLowerCase()] || FILE_COLORS[file.type.toLowerCase()] || FILE_COLORS.default; };
const getStatusColor = (status: string) => STATUS_COLORS[status] || STATUS_COLORS.default;

interface FileVersioningPanelProps { projectId?: string; project?: any; onFileClick?: (file: any) => void; onModelView?: (file: any) => void; }

export default function FileVersioningPanel({ projectId, project, onFileClick, onModelView }: any) {
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [activeSection, setActiveSection] = useState<'viztr' | 'client'>('viztr');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const clientFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileClick = useCallback((file: any) => { if (onFileClick) onFileClick(file); else { setSelectedFile(file); setFileModalOpen(true); } }, [onFileClick]);
  const handleModelView = useCallback((file: any) => { if (onModelView) onModelView(file); }, [onModelView]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploadingFiles(files);
    setUploadDialogOpen(true);
    for (const file of files) {
      setUploadProgress(p => ({ ...p, [file.name]: 0 }));
      for (let p = 0; p <= 100; p += 10) {
        await new Promise(r => setTimeout(r, 100));
        setUploadProgress(prev => ({ ...prev, [file.name]: p }));
      }
      setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
    }
    setUploadingFiles([]);
    setUploadProgress({});
    setUploadDialogOpen(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); const files = Array.from(e.dataTransfer.files); if (files.length > 0) handleFileUpload({ target: { files } } as any); }, []);

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><History className="w-5 h-5 text-[var(--primary)]" /> <span>Files & Documents</span></h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Manage project deliverables, upload assets, and track versions</p>
        </div>
        <button onClick={() => setUploadDialogOpen(true)} className="px-4 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-black font-mono font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-[0_0_20px_var(--accent-glow)]"><Upload className="w-4 h-4" /><span>Upload Files</span></button>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveSection('viztr')} className={`px-4 py-2 rounded-lg text-sm font-mono font-medium transition-all cursor-pointer ${activeSection === 'viztr' ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/40 font-bold shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/50 border border-transparent'}`}><Download className="w-4 h-4 mr-2" /><span>VizTR Deliverables</span><span className="ml-2 px-2 py-0.5 rounded-full bg-[var(--primary)]/20 text-[10px] font-mono text-[var(--primary)]">5 files</span></button>
        <button onClick={() => setActiveSection('client')} className={`px-4 py-2 rounded-lg text-sm font-mono font-medium transition-all cursor-pointer ${activeSection === 'client' ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/40 font-bold shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/50 border border-transparent'}`}><Upload className="w-4 h-4 mr-2" /><span>Client Uploads</span><span className="ml-2 px-2 py-0.5 rounded-full bg-amber-950/40 text-amber-400 text-[10px] font-mono font-bold">2 pending</span></button>
      </div>

      {activeSection === 'viztr' && (
        <section className="space-y-6" aria-labelledby="viztr-deliverables-heading">
          <h3 className="text-lg font-bold text-white flex items-center gap-2"><Download className="w-5 h-5 text-[var(--primary)]" /><span>VizTR Deliverables (Download)</span><span className="px-2 py-0.5 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] text-[10px] font-mono font-bold">5 files</span></h3>
          <p className="text-xs text-[var(--text-muted)]">Official VizTR deliverables ready for download. Click any file to preview or download.</p>
          <div className="space-y-3">{/* Render files */}</div>
        </section>
      )}

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div><h3 className="text-lg font-bold text-white flex items-center gap-2"><Upload className="w-5 h-5 text-amber-400" /><span>Client Uploads</span></h3><p className="text-xs text-[var(--text-muted)] mt-0.5">Upload project assets, reference files, and reference materials for the VizTR team</p></div>
          <button onClick={() => setUploadDialogOpen(true)} className="px-4 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-black font-mono font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_var(--accent-glow)]"><Upload className="w-4 h-4" /><span>Upload Files</span></button>
        </div>
        <div className="relative border-2 border-dashed border-[var(--border)] rounded-xl p-6 text-center hover:border-amber-400/50 hover:bg-amber-500/5 transition-all duration-300" onDragOver={e => { e.preventDefault(); e.stopPropagation(); }} onDrop={(e) => { e.preventDefault(); e.stopPropagation(); const files = Array.from(e.dataTransfer.files); if (files.length > 0) handleFileUpload({ target: { files } } as any); }}>
          <input type="file" id="client-file-upload" multiple accept=".dwg,.rvt,.ifc,.glb,.gltf,.exr,.png,.jpg,.mp4,.pdf,.e57,.dwg,.rvt,.ifc,.glb,.gltf,.exr,.png,.jpg,.mp4,.pdf,.e57" onChange={handleFileUpload} className="hidden" /><label htmlFor="client-file-upload" className="cursor-pointer block"><Upload className="w-10 h-10 text-amber-400/50 mx-auto mb-3" /><p className="text-sm font-medium text-[var(--text-secondary)] mb-1">Drag & drop files here, or click to browse</p><p className="text-xs text-[var(--text-muted)]">DWG, RVT, IFC, GLB, EXR, PNG, MP4, PDF, E57 (Max 5GB per file)</p></label>
        </div>
        <div className="space-y-3 mt-6"><h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2"><span>Your Uploads</span><span className="px-2 py-0.5 rounded-full bg-amber-950/40 text-amber-400 text-[10px] font-mono font-bold">2 pending</span></h4></div>
      </div>
    </section>
  );
}

export { FileVersioningPanel };
export type { FileItem };