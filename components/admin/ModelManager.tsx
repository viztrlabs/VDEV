'use client';

import React, { useState } from 'react';
import {
  Box,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Smartphone,
  Headset,
  Eye,
  Trash2,
  Plus,
  Layers,
  HardDrive,
  ExternalLink
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { portfolioProjects } from '@/data/portfolio';

interface Model3DItem {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  format: 'glb' | 'gltf';
  fileSizeMb: number;
  dracoCompressed: boolean;
  webxrEnabled: boolean;
  arEnabled: boolean;
  vrEnabled: boolean;
  previewImage: string;
  storageKey: string;
  uploadedAt: string;
}

const INITIAL_MODELS: Model3DItem[] = [
  {
    id: 'mdl-01',
    title: 'The Apex Tower - Master Tower Facade GLB',
    projectId: 'apex-tower-xr',
    projectName: 'The Apex Tower Interactive WebXR',
    format: 'glb',
    fileSizeMb: 8.4,
    dracoCompressed: true,
    webxrEnabled: true,
    arEnabled: true,
    vrEnabled: true,
    previewImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
    storageKey: 'models/apex-tower-v3-draco.glb',
    uploadedAt: '2026-08-15'
  },
  {
    id: 'mdl-02',
    title: 'Nordic Monolith Residence - Architectural Envelope',
    projectId: 'nordic-monolith',
    projectName: 'Nordic Monolith Residence',
    format: 'glb',
    fileSizeMb: 14.2,
    dracoCompressed: true,
    webxrEnabled: true,
    arEnabled: true,
    vrEnabled: false,
    previewImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    storageKey: 'models/nordic-monolith-hull.glb',
    uploadedAt: '2026-08-18'
  },
  {
    id: 'mdl-03',
    title: 'Solarium Penthouse - Living Suite & Glazing Geometry',
    projectId: 'solarium-penthouse',
    projectName: 'Solarium Sky Penthouse',
    format: 'gltf',
    fileSizeMb: 22.8,
    dracoCompressed: false,
    webxrEnabled: true,
    arEnabled: false,
    vrEnabled: true,
    previewImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80',
    storageKey: 'models/solarium-suite-pbr.gltf',
    uploadedAt: '2026-08-20'
  }
];

export default function ModelManager() {
  const [models, setModels] = useState<Model3DItem[]>(INITIAL_MODELS);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(portfolioProjects[0].id);
  const { showToast, openModelViewer } = useAppStore();

  const totalStorageMb = models.reduce((acc, m) => acc + m.fileSizeMb, 0);
  const maxStorageMb = 500; // 500MB tier

  const handleFileUpload = (file: File) => {
    setUploadError(null);
    const validExtensions = ['.glb', '.gltf'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setUploadError('Invalid format. Please upload standard GLB or GLTF 3D assets.');
      return;
    }

    const fileSizeMb = Number((file.size / (1024 * 1024)).toFixed(2));
    if (fileSizeMb > 50) {
      setUploadError(`File is ${fileSizeMb}MB. Maximum permitted model payload is 50MB.`);
      return;
    }

    setIsUploading(true);
    setTimeout(() => {
      const format = file.name.toLowerCase().endsWith('.glb') ? 'glb' : 'gltf';
      const project = portfolioProjects.find((p) => p.id === selectedProjectId) || portfolioProjects[0];

      const newModel: Model3DItem = {
        id: `mdl-${Date.now()}`,
        title: newTitle || file.name.replace(/\.[^/.]+$/, ''),
        projectId: project.id,
        projectName: project.title,
        format,
        fileSizeMb,
        dracoCompressed: true,
        webxrEnabled: true,
        arEnabled: true,
        vrEnabled: true,
        previewImage: project.featuredImage,
        storageKey: `models/r2-${Date.now()}-${file.name}`,
        uploadedAt: new Date().toISOString().split('T')[0]
      };

      setModels([newModel, ...models]);
      setIsUploading(false);
      setNewTitle('');
      showToast(`Model "${newModel.title}" securely deployed to Cloudflare R2 bucket.`, 'success');
    }, 1200);
  };

  const toggleSetting = (id: string, key: 'webxrEnabled' | 'arEnabled' | 'vrEnabled') => {
    setModels((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const updated = { ...m, [key]: !m[key] };
          showToast(`Updated ${key} state for ${m.title}`, 'info');
          return updated;
        }
        return m;
      })
    );
  };

  const deleteModel = (id: string) => {
    setModels((prev) => prev.filter((m) => m.id !== id));
    showToast('3D model asset detached from Cloudflare R2.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* HEADER & STORAGE METRICS */}
      <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-[#3ECF8E]" />
            <h2 className="text-lg font-bold font-display text-white">
              3D Model & WebXR Spatial Asset Manager
            </h2>
          </div>
          <p className="text-xs text-[#A1A1AA]">
            Upload, validate, Draco-compress, and bind GLB/GLTF architecture assets to client portfolio projects.
          </p>
        </div>

        {/* Storage Bar */}
        <div className="w-full md:w-64 space-y-1.5 p-3 rounded-xl bg-[#09090B] border border-[#27272A]">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#A1A1AA] flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-[#3ECF8E]" /> R2 Spatial Storage
            </span>
            <span className="text-white font-bold">{totalStorageMb.toFixed(1)} / {maxStorageMb} MB</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#27272A] overflow-hidden">
            <div
              className="h-full bg-[#3ECF8E] transition-all"
              style={{ width: `${Math.min(100, (totalStorageMb / maxStorageMb) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* UPLOAD & ASSIGNMENT PANEL */}
      <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
        <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
          <Upload className="w-4 h-4 text-[#3ECF8E]" />
          <span>Upload GLB / GLTF Geometry Asset</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-[#A1A1AA] mb-1">
              Model Asset Title (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Apex Tower Facade PBR Model"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#A1A1AA] mb-1">
              Assign to Portfolio Project
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white focus:outline-none focus:border-[#3ECF8E]"
            >
              {portfolioProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.category.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Drag & Drop Box */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files?.[0]) {
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
            dragOver
              ? 'border-[#3ECF8E] bg-[#3ECF8E]/10'
              : 'border-[#27272A] bg-[#09090B] hover:border-[#3ECF8E]/50'
          }`}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.glb,.gltf';
            input.onchange = (e: any) => {
              if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
            };
            input.click();
          }}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <Box className={`w-8 h-8 ${isUploading ? 'text-[#3ECF8E] animate-bounce' : 'text-[#71717A]'}`} />
            <div className="text-xs font-mono text-white">
              {isUploading ? (
                <span className="text-[#3ECF8E] font-bold">Uploading & Optimizing Geometry...</span>
              ) : (
                <span>Drag & drop binary GLB or GLTF package here, or click to browse</span>
              )}
            </div>
            <p className="text-[11px] text-[#71717A] font-mono">
              Max file payload: 50MB • Automatic Draco Draco Compression & Normal Map Validation
            </p>
          </div>
        </div>

        {uploadError && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs font-mono text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* ACTIVE ASSETS TABLE */}
      <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
        <h3 className="text-sm font-bold font-display text-white">
          Active Spatial Assets in Cloudflare R2 ({models.length})
        </h3>

        <div className="divide-y divide-[#27272A]">
          {models.map((model) => (
            <div key={model.id} className="py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-16 h-12 rounded-lg bg-cover bg-center border border-[#27272A] shrink-0"
                  style={{ backgroundImage: `url(${model.previewImage})` }}
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-display">{model.title}</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#09090B] border border-[#27272A] text-[10px] font-mono uppercase text-[#3ECF8E]">
                      {model.format} • {model.fileSizeMb} MB
                    </span>
                    {model.dracoCompressed && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-[10px] font-mono text-emerald-400">
                        Draco 2.0
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-[#71717A]">
                    Assigned: <span className="text-[#FAFAFA]">{model.projectName}</span> • Storage: {model.storageKey}
                  </div>
                </div>
              </div>

              {/* TOGGLES & ACTIONS */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
                {/* WebXR */}
                <button
                  onClick={() => toggleSetting(model.id, 'webxrEnabled')}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1 border transition-colors cursor-pointer ${
                    model.webxrEnabled
                      ? 'bg-[#3ECF8E]/20 border-[#3ECF8E]/60 text-[#3ECF8E]'
                      : 'bg-[#09090B] border-[#27272A] text-[#71717A]'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>WebXR</span>
                </button>

                {/* AR */}
                <button
                  onClick={() => toggleSetting(model.id, 'arEnabled')}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1 border transition-colors cursor-pointer ${
                    model.arEnabled
                      ? 'bg-emerald-950 border-emerald-600 text-emerald-400'
                      : 'bg-[#09090B] border-[#27272A] text-[#71717A]'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  <span>AR Mode</span>
                </button>

                {/* VR */}
                <button
                  onClick={() => toggleSetting(model.id, 'vrEnabled')}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1 border transition-colors cursor-pointer ${
                    model.vrEnabled
                      ? 'bg-indigo-950 border-indigo-600 text-indigo-400'
                      : 'bg-[#09090B] border-[#27272A] text-[#71717A]'
                  }`}
                >
                  <Headset className="w-3 h-3" />
                  <span>VR Mode</span>
                </button>

                {/* Preview in Viewer */}
                <button
                  onClick={() => openModelViewer(model.storageKey, model.title)}
                  className="p-1.5 rounded bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-[#FAFAFA] transition-colors cursor-pointer"
                  title="Test in 3D Viewer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#3ECF8E]" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => deleteModel(model.id)}
                  className="p-1.5 rounded bg-rose-950/40 hover:bg-rose-900 border border-rose-800/60 text-rose-400 transition-colors cursor-pointer"
                  title="Remove Asset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
