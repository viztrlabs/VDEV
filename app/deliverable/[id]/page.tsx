'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Download, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';

const ModelCanvas = dynamic(
  () => import('@/components/viewers/ModelViewer').then((m) => m.ModelCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-[#09090b]">
        <Loader2 className="w-6 h-6 text-[#3ECF8E] animate-spin" />
      </div>
    ),
  }
);

interface DeliverableData {
  id: string;
  title: string;
  description: string;
  url: string;
  mime_type: string;
  file_size: number;
  type: string;
  project_name: string;
  created_at: string;
}

function formatFileSize(bytes: number): string {
  if (!bytes) return 'Unknown size';
  const units = ['B', 'KB', 'MB', 'GB'];
  let idx = 0;
  let size = bytes;
  while (size >= 1024 && idx < units.length - 1) {
    size /= 1024;
    idx++;
  }
  return `${size.toFixed(1)} ${units[idx]}`;
}

function MediaRenderer({ deliverable }: { deliverable: DeliverableData }) {
  const mime = deliverable.mime_type || '';
  const url = deliverable.url;

  if (mime.startsWith('model/') || url.endsWith('.glb') || url.endsWith('.gltf')) {
    return (
      <div className="relative w-full h-[60vh] min-h-[400px] bg-[#09090b] rounded-lg overflow-hidden">
        <ModelCanvas
          url={url}
          rotX={25}
          rotY={45}
          zoom={1}
          renderMode="pbr"
          lighting="sunset"
          showGrid={true}
        />
      </div>
    );
  }

  if (mime.startsWith('video/') || url.match(/\.(mp4|webm|ogg)$/i)) {
    return (
      <div className="relative w-full bg-black rounded-lg overflow-hidden">
        <video
          src={url}
          controls
          className="w-full max-h-[70vh] mx-auto"
          preload="metadata"
        >
          Your browser does not support video playback.
        </video>
      </div>
    );
  }

  if (mime.startsWith('audio/') || url.match(/\.(mp3|wav|ogg|flac|aac)$/i)) {
    return (
      <div className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-8">
        <audio src={url} controls className="w-full" preload="metadata" />
      </div>
    );
  }

  if (mime.startsWith('image/') || url.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i)) {
    return (
      <div className="relative w-full bg-[#09090b] rounded-lg overflow-hidden flex items-center justify-center">
        <img
          src={url}
          alt={deliverable.title}
          className="max-w-full max-h-[70vh] object-contain"
        />
      </div>
    );
  }

  return (
    <div className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-12 text-center">
      <AlertCircle className="w-12 h-12 text-[#71717a] mx-auto mb-4" />
      <p className="text-sm text-[#a1a1aa] font-mono">
        Preview not available for this file type ({mime || 'unknown'}).
      </p>
      <a
        href={url}
        download
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#3ECF8E] text-black text-sm font-mono font-bold rounded hover:bg-[#2fb875] transition-colors"
      >
        <Download className="w-4 h-4" />
        Download File
      </a>
    </div>
  );
}

export default function DeliverablePage({ params }: { params: Promise<{ id: string }> }) {
  const [deliverable, setDeliverable] = useState<DeliverableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ id }) => {
      fetch(`/api/deliverables/public/${id}`)
        .then(async (res) => {
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || `HTTP ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          setDeliverable(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Failed to load deliverable');
          setLoading(false);
        });
    });
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#3ECF8E] animate-spin" />
          <span className="text-xs text-[#71717a] font-mono">Loading deliverable...</span>
        </div>
      </div>
    );
  }

  if (error || !deliverable) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 max-w-md text-center px-4">
          <AlertCircle className="w-10 h-10 text-rose-400" />
          <h1 className="text-lg font-mono font-bold text-white">Deliverable Not Found</h1>
          <p className="text-sm text-[#a1a1aa]">{error || 'This deliverable does not exist or is not public.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-[#18181b] border border-[#27272a] rounded text-[10px] font-mono font-bold text-[#3ECF8E] uppercase tracking-wider">
              {deliverable.type || 'Deliverable'}
            </span>
            <span className="text-[10px] font-mono text-[#71717a]">
              {formatFileSize(deliverable.file_size)}
            </span>
          </div>
          <h1 className="text-xl font-mono font-bold text-white mt-2">
            {deliverable.title || 'Untitled Deliverable'}
          </h1>
          {deliverable.description && (
            <p className="text-sm text-[#a1a1aa] mt-1 max-w-2xl">{deliverable.description}</p>
          )}
          <p className="text-[10px] font-mono text-[#71717a] mt-2">
            Project: {deliverable.project_name}
          </p>
        </div>

        <MediaRenderer deliverable={deliverable} />

        <div className="mt-4 flex items-center gap-3">
          <a
            href={deliverable.url}
            download
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] rounded text-sm font-mono text-white transition-colors"
          >
            <Download className="w-4 h-4 text-[#3ECF8E]" />
            Download
          </a>
          {deliverable.url.startsWith('http') && (
            <a
              href={deliverable.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] rounded text-sm font-mono text-[#a1a1aa] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open Raw
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
