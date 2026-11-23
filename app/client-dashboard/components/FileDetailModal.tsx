'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  ExternalLink,
  Copy,
  Check,
  FileCode,
  FileImage,
  FileVideo,
  FileText,
  FileArchive,
  Share2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  RotateCcw,
  Expand,
  FolderKanban,
  Tag,
} from 'lucide-react';

interface FileDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: any;
  projectId: string;
  onModelView: (file: any) => void;
}

const FILE_ICONS: Record<string, React.ElementType> = {
  image: FileImage,
  video: FileVideo,
  pdf: FileText,
  '3d-model': FileCode,
  model: FileCode,
  glb: FileCode,
  ifc: FileCode,
  cad: FileCode,
  bim: FileCode,
  zip: FileArchive,
  archive: FileArchive,
  document: FileText,
  default: FileText,
};

const FILE_COLORS: Record<string, string> = {
  image: 'bg-emerald-950/40 text-emerald-400',
  video: 'bg-violet-950/40 text-violet-400',
  pdf: 'bg-red-950/40 text-red-400',
  '3d-model': 'bg-amber-950/40 text-amber-400',
  model: 'bg-amber-950/40 text-amber-400',
  glb: 'bg-amber-950/40 text-amber-400',
  ifc: 'bg-blue-950/40 text-blue-400',
  cad: 'bg-blue-950/40 text-blue-400',
  bim: 'bg-blue-950/40 text-blue-400',
  zip: 'bg-gray-950/40 text-gray-400',
  archive: 'bg-gray-950/40 text-gray-400',
  document: 'bg-sky-950/40 text-sky-400',
  default: 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]',
};

export function FileDetailModal({ isOpen, onClose, file, projectId, onModelView }: FileDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const fileType = file?.type || 'default';
  const fileExtension = file?.format || file?.name?.split('.').pop()?.toLowerCase() || '';
  const IconComponent = FILE_ICONS[fileType] || FILE_ICONS[fileExtension] || FILE_ICONS.default;
  const colorClass = FILE_COLORS[fileType] || FILE_COLORS[fileExtension] || FILE_COLORS.default;

  const isImage = fileType === 'image' || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'exr', 'hdr'].includes(fileExtension);
  const isVideo = fileType === 'video' || ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(fileExtension);
  const isPDF = fileType === 'pdf' || fileExtension === 'pdf';
  const is3DModel = fileType === '3d-model' || ['glb', 'gltf', 'ifc', 'obj', 'fbx', 'dae'].includes(fileExtension);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleDownload = () => {
    if (!file?.url) return;
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewInNewTab = () => {
    if (!file?.url) return;
    window.open(file.url, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrentImageIndex(prev => Math.max(0, prev - 1));
      if (e.key === 'ArrowRight') setCurrentImageIndex(prev => Math.min((file?.images?.length || 1) - 1, prev + 1));
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, file?.images]);

  if (!isOpen || !file) return null;

  const images = file.images || (isImage && file.url ? [file.url] : []);
  const showGallery = images.length > 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="file-detail-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full max-w-4xl max-h-[90vh] bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden flex flex-col shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]/50">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <h2 id="file-detail-title" className="text-lg font-bold text-[var(--text-primary)] truncate max-w-md">
                  {file.name}
                </h2>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  {file.format?.toUpperCase() || fileExtension.toUpperCase()} • {file.size ? formatBytes(Number(file.size.replace(/[^0-9.]/g, '')) * 1024 * 1024) : 'Unknown size'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              aria-label="Close file details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* CONTENT */}
          <div className="flex-1 overflow-auto p-4 sm:p-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* MAIN PREVIEW */}
              <div className="lg:col-span-2 space-y-6">
                {/* IMAGE / VIDEO / PDF / 3D PREVIEW */}
                <div className="aspect-video rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] overflow-hidden relative">
                  {showGallery && (
                    <div className="w-full h-full relative">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={currentImageIndex}
                          src={images[currentImageIndex]}
                          alt={`${file.name} - view ${currentImageIndex + 1}`}
                          className="w-full h-full object-cover"
                          onLoad={() => setImageLoaded(true)}
                        />
                      </AnimatePresence>
                      {!imageLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-secondary)]">
                          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
                        </div>
                      )}
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentImageIndex === 0}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Previous image"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setCurrentImageIndex(prev => Math.min(images.length - 1, prev + 1))}
                            disabled={currentImageIndex === images.length - 1}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Next image"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                            {images.map((_: string, idx: number) => (
                              <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  idx === currentImageIndex
                                    ? 'bg-white w-6'
                                    : 'bg-white/50 hover:bg-white/70'
                                }`}
                                aria-label={`View image ${idx + 1}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {isVideo && !showGallery && file.url && (
                    <video
                      src={file.url}
                      controls
                      className="w-full h-full"
                      poster={file.thumbnail}
                    />
                  )}

                  {isPDF && file.url && (
                    <iframe
                      src={`${file.url}#toolbar=0`}
                      className="w-full h-full border-0"
                      title={`${file.name} - PDF Preview`}
                    />
                  )}

                  {is3DModel && (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8">
                      <IconComponent className="w-16 h-16 text-[var(--text-muted)]/50 mb-4" />
                      <p className="text-[var(--text-secondary)] text-center mb-4">
                        3D Model Preview Not Available
                      </p>
                      <p className="text-xs text-[var(--text-muted)] text-center max-w-xs mb-6">
                        Click "Open in Viewer" to launch the full 3D model viewer with orbit controls, measurements, and section cuts.
                      </p>
                      <button
                        onClick={() => onModelView(file)}
                        className="px-6 py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-black font-bold text-sm flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_var(--accent-glow)]"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Open in Model Viewer</span>
                      </button>
                    </div>
                  )}

                  {!isImage && !isVideo && !isPDF && !is3DModel && !showGallery && (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8">
                      <IconComponent className="w-16 h-16 text-[var(--text-muted)]/50 mb-4" />
                      <p className="text-[var(--text-secondary)] text-center">Preview not available for this file type</p>
                      <p className="text-xs text-[var(--text-muted)] text-center mt-2">
                        Click "Download" to save the file locally
                      </p>
                    </div>
                  )}
                </div>

                {/* VERSION HISTORY */}
                {file.versions && file.versions.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">Version History</h3>
                      <span className="px-2 py-0.5 rounded bg-[var(--bg-tertiary)] text-[10px] font-mono text-[var(--text-muted)]">
                        {file.versions.length} versions
                      </span>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-auto">
                      {file.versions.map((version: any, idx: number) => (
                        <div
                          key={version.id || idx}
                          className={`p-3 rounded-lg border transition-colors ${
                            version.isCurrent
                              ? 'bg-[var(--primary)]/10 border-[var(--primary)]/40'
                              : 'bg-[var(--bg-secondary)] border-[var(--border)] hover:border-[var(--primary)]/40'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                version.isCurrent
                                  ? 'bg-[var(--primary)] text-black'
                                  : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                              }`}>
                                v{version.version || idx + 1}
                              </span>
                              <span className="text-sm font-medium text-[var(--text-primary)]">
                                {version.name || file.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                              <span>{formatDate(version.date || version.uploadedAt)}</span>
                              <span>•</span>
                              <span>{version.uploadedBy || 'Unknown'}</span>
                              {version.size && <span>• {formatBytes(version.size)}</span>}
                            </div>
                          </div>
                          {version.changes && (
                            <p className="text-xs text-[var(--text-muted)] mt-1 ml-8 border-l-2 border-[var(--border)] pl-2">
                              {version.changes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ACTIONS */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-[var(--border)]">
                  <button
                    onClick={handleDownload}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--text-primary)] font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={handleViewInNewTab}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--text-primary)] font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open in New Tab</span>
                  </button>
                  {is3DModel && (
                    <button
                      onClick={() => onModelView(file)}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-black font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_var(--accent-glow)]"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Open in Viewer</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleCopy(file.url, 'File URL')}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--text-primary)] font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {copyFeedback ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copyFeedback ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              {/* SIDEBAR - METADATA */}
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[var(--primary)]" />
                    Details
                  </h3>
                  <dl className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <dt className="text-[var(--text-muted)] font-mono text-[10px] uppercase">Name</dt>
                      <dd className="text-[var(--text-primary)] font-medium truncate col-span-2">{file.name}</dd>
                      <dt className="text-[var(--text-muted)] font-mono text-[10px] uppercase">Type</dt>
                      <dd className="text-[var(--text-secondary)]">{file.format?.toUpperCase() || fileExtension.toUpperCase()}</dd>
                      <dt className="text-[var(--text-muted)] font-mono text-[10px] uppercase">Size</dt>
                      <dd className="text-[var(--text-secondary)]">{file.size ? formatBytes(Number(file.size.replace(/[^0-9.]/g, '')) * 1024 * 1024) : 'Unknown'}</dd>
                      <dt className="text-[var(--text-muted)] font-mono text-[10px] uppercase">Version</dt>
                      <dd className="text-[var(--text-secondary)]">{file.version || '1.0'}</dd>
                      <dt className="text-[var(--text-muted)] font-mono text-[10px] uppercase">Uploaded</dt>
                      <dd className="text-[var(--text-secondary)]">{formatDate(file.uploadedAt || file.createdAt)}</dd>
                      <dt className="text-[var(--text-muted)] font-mono text-[10px] uppercase">By</dt>
                      <dd className="text-[var(--text-secondary)]">{file.uploadedBy || 'Unknown'}</dd>
                      {file.checksum && (
                        <>
                          <dt className="text-[var(--text-muted)] font-mono text-[10px] uppercase">Checksum</dt>
                          <dd className="text-[var(--text-secondary)] font-mono text-[10px] truncate col-span-2">{file.checksum}</dd>
                        </>
                      )}
                    </div>
                  </dl>
                </div>

                {file.description && (
                  <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                    <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[var(--primary)]" />
                      Description
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{file.description}</p>
                  </div>
                )}

                {file.tags && file.tags.length > 0 && (
                  <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                    <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-[var(--primary)]" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {file.tags.map((tag: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs font-mono">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {file.category && (
                  <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                    <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                      <FolderKanban className="w-4 h-4 text-[var(--primary)]" />
                      Category
                    </h3>
                    <span className="px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-mono font-medium">
                      {file.category}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
      </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default FileDetailModal;