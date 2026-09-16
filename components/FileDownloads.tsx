'use client';

import React, { useState, useEffect } from 'react';
import { Download, Eye, ExternalLink, Play, FileText, Image, Box, Video, Lock, CheckCircle2 } from 'lucide-react';
import { recordDownload } from '@/lib/download-tracker';

export interface ProjectFile {
  id: string;
  name: string;
  type: 'render' | '3d_model' | 'video' | 'pdf' | 'cad' | 'image' | 'other';
  format: string;
  size: string;
  sizeBytes: number;
  url: string;
  thumbnail?: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface FileDownloadsProps {
  projectId: string;
  files: ProjectFile[];
  onTrackEvent?: (event: { category: string; action: string; label?: string }) => void;
}

const FILE_TYPE_ICONS: Record<string, React.ElementType> = {
  render: Image,
  '3d_model': Box,
  video: Play,
  pdf: FileText,
  cad: FileText,
  image: Image,
  other: FileText,
};

const FILE_TYPE_COLORS: Record<string, string> = {
  render: 'text-emerald-400',
  '3d_model': 'text-sky-400',
  video: 'text-purple-400',
  pdf: 'text-rose-400',
  cad: 'text-amber-400',
  image: 'text-emerald-400',
  other: 'text-[#A1A1AA]',
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function FileDownloads({ projectId, files, onTrackEvent }: FileDownloadsProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('download')) {
      const fileId = params.get('download');
      if (fileId) handleDirectDownload(fileId);
    }
  }, []);

  const handleDirectDownload = async (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (!file) return;

    setDownloading(fileId);
    try {
      const res = await fetch(`/api/storage/${fileId}/signed-url`);
      const data = await res.json();
      if (data.success && data.data.url) {
        recordDownload({
          fileId: file.id,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.sizeBytes,
          projectId,
          downloadedBy: 'current-user',
        });
        onTrackEvent?.({ category: 'Download', action: 'download_started', label: file.type });
        window.open(data.data.url, '_blank');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownload = async (file: ProjectFile) => {
    setDownloading(file.id);
    try {
      const res = await fetch(`/api/storage/${file.id}/signed-url`);
      const data = await res.json();
      if (data.success && data.data.url) {
        recordDownload({
          fileId: file.id,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.sizeBytes,
          projectId,
          downloadedBy: 'current-user',
        });
        onTrackEvent?.({ category: 'Download', action: 'download_completed', label: file.type });
        window.open(data.data.url, '_blank');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(null);
    }
  };

  const handleView = (file: ProjectFile) => {
    window.open(file.url, '_blank');
    onTrackEvent?.({ category: 'Download', action: 'file_viewed', label: file.type });
  };

  const filteredFiles = filter === 'all' ? files : files.filter((f) => f.type === filter);

  const fileTypes = ['all', ...Array.from(new Set(files.map((f) => f.type)))];

  return (
    <div className="space-y-4">
      <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-[#3ECF8E]" />
            <h3 className="text-sm font-bold text-white">Project Files</h3>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white focus:outline-none focus:border-[#3ECF8E]"
          >
            {fileTypes.map((t) => (
              <option key={t} value={t}>
                {t === 'all' ? 'All Files' : t.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        {filteredFiles.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#09090B] border border-[#27272A] text-center">
            <Lock className="w-8 h-8 text-[#71717A] mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white">No files available</h4>
            <p className="text-xs text-[#A1A1AA] mt-1">Files will appear here when uploaded to this project.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFiles.map((file) => {
              const Icon = FILE_TYPE_ICONS[file.type] || FileText;
              const color = FILE_TYPE_COLORS[file.type] || 'text-[#A1A1AA]';
              const isDownloading = downloading === file.id;

              return (
                <div
                  key={file.id}
                  className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] hover:border-[#3f3f46] transition-all group"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg bg-[#18181B] border border-[#27272A] shrink-0 ${color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{file.name}</div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-[#71717A]">
                          <span>{file.format.toUpperCase()}</span>
                          <span>•</span>
                          <span>{formatBytes(file.sizeBytes)}</span>
                          <span>•</span>
                          <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleView(file)}
                        className="p-2 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                        title="View file"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDownload(file)}
                        disabled={isDownloading}
                        className="px-3 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] disabled:opacity-40 text-black font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {isDownloading ? (
                          <>
                            <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            <span>...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
