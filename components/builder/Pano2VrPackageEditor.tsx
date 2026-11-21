'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Package } from 'lucide-react';

/**
 * Pano2VR Package Editor — Phase 04 prototype.
 *
 * Flow (matches app/api/tour-packages POST contract):
 *   1. Artist selects the Pano2VR "output" folder (or a .zip of it)
 *   2. JSZip extracts archives in-browser; entry auto-detected (index.html)
 *   3. Files upload directly to viztr-assets under
 *      `{userId}/published/tours/{experienceId}/v{n}/<relative path>`
 *      (the `published` segment grants public read per existing storage RLS;
 *      playback iframe is cross-origin, isolating package scripts)
 *   4. Manifest POST registers the package (status: ready)
 *
 * Validated against a real Pano2VR 7 export: 174 files / 29.3 MB / 6-level
 * multires tiles under tiles/nodeN/, entry index.html, pano2vr_player.js at root.
 */

const BUCKET = 'viztr-assets';
const CONCURRENCY = 4;

const MIME_MAP: Record<string, string> = {
  html: 'text/html',
  htm: 'text/html',
  js: 'application/javascript',
  mjs: 'application/javascript',
  css: 'text/css',
  json: 'application/json',
  xml: 'application/xml',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  webp: 'image/webp',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
};

function mimeFor(path: string): string {
  const ext = path.slice(path.lastIndexOf('.') + 1).toLowerCase();
  return MIME_MAP[ext] || 'application/octet-stream';
}

interface UploadFile {
  relativePath: string;
  blob: Blob;
}

interface UploadState {
  phase: 'idle' | 'reading' | 'uploading' | 'registering' | 'done' | 'error';
  message?: string;
  total: number;
  uploaded: number;
  bytes: number;
  uploadedBytes: number;
  packageId?: string;
  version?: number;
  entryUrl?: string;
}

export default function Pano2VrPackageEditor({ experienceId }: { experienceId: string }) {
  const { data: session } = useSession();
  const [state, setState] = useState<UploadState>({ phase: 'idle', total: 0, uploaded: 0, bytes: 0, uploadedBytes: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef(false);

  const token = (session?.user as any)?.supabaseAccessToken as string | undefined;

  // Browser Supabase client carrying the user's Supabase JWT so storage RLS
  // insert policy ((storage.foldername(name))[1] = auth.uid()) applies.
  const sbClient = useMemo<SupabaseClient | null>(() => {
    const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/^\uFEFF/, '');
    const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim().replace(/^\uFEFF/, '');
    if (!url || !anonKey) return null;
    return createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      ...(token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}),
    });
  }, [token]);

  const userId = (session?.user as any)?.id as string | undefined;

  const collectFolder = async (files: FileList): Promise<UploadFile[]> => {
    const out: UploadFile[] = [];
    for (const f of Array.from(files)) {
      // webkitRelativePath: "output/index.html" — strip the top folder name
      const rel = ((f as any).webkitRelativePath as string) || f.name;
      const parts = rel.split('/');
      parts.shift();
      const relativePath = parts.join('/');
      if (!relativePath) continue;
      out.push({ relativePath, blob: f });
    }
    return out;
  };

  const collectZip = async (file: File): Promise<UploadFile[]> => {
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(file);
    const out: UploadFile[] = [];
    const entries = Object.values(zip.files).filter((e) => !e.dir);
    // Strip a single top-level folder if the zip was created from a directory
    const topNames = new Set(entries.map((e) => e.name.split('/')[0]));
    const stripTop = topNames.size === 1 && !topNames.has('index.html');
    for (const entry of entries) {
      const name = stripTop ? entry.name.split('/').slice(1).join('/') : entry.name;
      if (!name || name.startsWith('__MACOSX') || name.includes('/.')) continue;
      const blob = await entry.async('blob');
      out.push({ relativePath: name, blob });
    }
    return out;
  };

  const autoDetectEntry = (files: UploadFile[]): string | null => {
    const candidates = ['index.html', 'pano.html', 'tour.html'];
    for (const c of candidates) {
      if (files.some((f) => f.relativePath === c)) return c;
    }
    const html = files.find((f) => f.relativePath.toLowerCase().endsWith('.html'));
    return html ? html.relativePath : null;
  };

  const uploadAll = useCallback(
    async (files: UploadFile[], prefix: string) => {
      if (!sbClient) throw new Error('Supabase is not configured');
      setState((s) => ({ ...s, phase: 'uploading', total: files.length, uploaded: 0 }));

      const totalBytes = files.reduce((acc, f) => acc + f.blob.size, 0);
      let uploadedCount = 0;
      let uploadedBytes = 0;

      // Bounded-concurrency upload queue
      const queue = [...files];
      const worker = async () => {
        while (queue.length > 0 && !cancelRef.current) {
          const item = queue.shift()!;
          const { error } = await sbClient.storage.from(BUCKET).upload(`${prefix}/${item.relativePath}`, item.blob, {
            contentType: mimeFor(item.relativePath),
            upsert: true,
            cacheControl: '31536000', // immutable tiles; content-addressed by version prefix
          });
          if (error) throw new Error(`Upload failed for ${item.relativePath}: ${error.message}`);
          uploadedCount++;
          uploadedBytes += item.blob.size;
          setState((s) => ({ ...s, uploaded: uploadedCount, uploadedBytes }));
        }
      };
      await Promise.all(Array.from({ length: CONCURRENCY }, worker));
      if (cancelRef.current) throw new Error('Upload cancelled');
      return { totalBytes };
    },
    [sbClient]
  );

  const sha256Hex = async (files: UploadFile[]): Promise<string> => {
    // Hash over sorted relative paths + sizes as a package fingerprint (cheap
    // and deterministic; full-content hashing of 30MB+ is unnecessary here).
    const enc = new TextEncoder();
    const summary = files
      .map((f) => `${f.relativePath}:${f.blob.size}`)
      .sort()
      .join('|');
    const digest = await crypto.subtle.digest('SHA-256', enc.encode(summary));
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const onFilesPicked = useCallback(
    async (fileList: FileList | null, mode: 'folder' | 'zip') => {
      if (!fileList || fileList.length === 0) return;
      if (!userId) {
        setState({ phase: 'error', message: 'Sign in to upload (missing session).', total: 0, uploaded: 0, bytes: 0, uploadedBytes: 0 });
        return;
      }
      cancelRef.current = false;
      setState({ phase: 'reading', message: 'Reading package…', total: 0, uploaded: 0, bytes: 0, uploadedBytes: 0 });
      try {
        const files = mode === 'zip' ? await collectZip(fileList[0]) : await collectFolder(fileList);
        const entry = autoDetectEntry(files);
        if (!entry) throw new Error('No entry .html found in the package (expected index.html from the Pano2VR Web Output).');

        setState((s) => ({ ...s, message: `Found ${files.length} files (entry: ${entry}). Uploading…` }));
        const prefix = `${userId}/published/tours/${experienceId}`;
        const { totalBytes } = await uploadAll(files, prefix);

        setState((s) => ({ ...s, phase: 'registering', message: 'Registering package…' }));
        const checksum = await sha256Hex(files);
        const res = await fetch('/api/tour-packages', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            experienceId,
            entryFile: entry,
            prefix,
            fileCount: files.length,
            totalBytes,
            checksum,
          }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Registration failed');

        const version = json.package?.version as number;
        const entryUrl = sbClient?.storage.from(BUCKET).getPublicUrl(`${prefix}/${entry}`).data.publicUrl || '';
        setState({
          phase: 'done',
          message: `Package v${version} registered (${files.length} files).`,
          total: files.length,
          uploaded: files.length,
          bytes: totalBytes,
          uploadedBytes: totalBytes,
          packageId: json.package?.id,
          version,
          entryUrl,
        });
      } catch (e: any) {
        setState((s) => ({ ...s, phase: 'error', message: e?.message || 'Upload failed' }));
      }
    },
    [experienceId, sbClient, uploadAll, userId]
  );

  const busy = state.phase === 'reading' || state.phase === 'uploading' || state.phase === 'registering';
  const pct = state.total > 0 ? Math.round((state.uploaded / state.total) * 100) : 0;

  return (
    <div className="rounded-xl border border-[#27272A] bg-[#111113] p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4 text-[#3ECF8E]" />
        <h3 className="text-sm font-bold text-white">Pano2VR Tour Package</h3>
      </div>
      <p className="text-[11px] text-zinc-500 leading-relaxed">
        Select the Pano2VR Web Output folder (the folder containing <code className="text-zinc-400">index.html</code>,{' '}
        <code className="text-zinc-400">pano2vr_player.js</code> and <code className="text-zinc-400">tiles/</code>) or a .zip of it.
        Upload goes directly to storage; nothing passes through the server.
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy || !experienceId}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#00F0FF] text-black text-xs font-mono font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
          Select output folder
        </button>
        {busy && (
          <button
            onClick={() => {
              cancelRef.current = true;
            }}
            className="px-4 py-2.5 rounded-lg border border-red-800/60 text-red-300 text-xs font-mono uppercase"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Hidden inputs: folder picker and zip picker */}
      <input
        ref={inputRef}
        type="file"
        multiple
        {...({ webkitdirectory: 'true', directory: 'true' } as any)}
        className="hidden"
        onChange={(e) => onFilesPicked(e.target.files, 'folder')}
      />
      <input
        type="file"
        accept=".zip"
        className="hidden"
        onChange={(e) => onFilesPicked(e.target.files, 'zip')}
        id="pano2vr-zip-input"
      />
      {!busy && state.phase !== 'done' && (
        <label
          htmlFor="pano2vr-zip-input"
          className="inline-block text-[11px] text-zinc-500 underline underline-offset-2 cursor-pointer hover:text-zinc-300"
        >
          …or select a .zip of the output folder
        </label>
      )}

      {(busy || state.phase === 'done' || state.phase === 'error') && (
        <div className="space-y-2">
          {busy && (
            <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full bg-[#00F0FF] transition-all" style={{ width: `${pct}%` }} />
            </div>
          )}
          <div className={`flex items-center gap-2 text-xs ${state.phase === 'error' ? 'text-red-300' : 'text-zinc-400'}`}>
            {state.phase === 'done' && <CheckCircle2 className="w-4 h-4 text-[#3ECF8E]" />}
            {state.phase === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
            {busy && <Loader2 className="w-4 h-4 animate-spin text-[#00F0FF]" />}
            <span>
              {state.message}
              {busy && state.total > 0 ? ` (${state.uploaded}/${state.total})` : ''}
            </span>
          </div>
          {state.phase === 'done' && state.entryUrl && (
            <div className="text-[11px] text-zinc-500 break-all">
              Entry URL: <a className="text-[#00F0FF] underline" href={state.entryUrl} target="_blank" rel="noreferrer">{state.entryUrl}</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
