'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';

const EDITOR_ORIGIN = process.env.NEXT_PUBLIC_EDITOR_URL || 'http://localhost:3487';

export default function AdminGaussianSplatEditorPage() {
  const params = useParams<{ userId: string; projectId: string }>();
  const [status, setStatus] = useState('Opening editor…');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const openEditor = async () => {
      try {
        const userId = params?.userId;
        const projectId = params?.projectId;

        if (!userId || !projectId) {
          throw new Error('Missing userId or projectId');
        }

        setStatus('Requesting editor access…');

        const res = await fetch('/api/editor/launch-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId, projectId })
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to create editor session');
        }

        const data = await res.json();

        if (cancelled) {
          return;
        }

        const url = new URL(EDITOR_ORIGIN);
        url.searchParams.set('token', data.token);
        url.searchParams.set('projectId', projectId);
        url.searchParams.set('userId', userId);

        setStatus('Opening editor in a new tab…');
        window.open(url.toString(), '_blank', 'noopener,noreferrer');
        setStatus('Editor opened in a separate tab.');
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Failed to open editor');
          setStatus('Failed to open editor');
        }
      }
    };

    openEditor();

    return () => {
      cancelled = true;
    };
  }, [params?.userId, params?.projectId]);

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <div className="px-4 sm:px-6 py-3 border-b border-[#27272A]">
        <h1 className="text-sm font-mono font-bold text-white">Gaussian Splat Editor</h1>
        <p className="text-[10px] font-mono text-[#71717A]">
          {params?.userId} / {params?.projectId}
        </p>
      </div>

      <div className="p-4 sm:p-6">
        {error && (
          <div className="mb-4 rounded border border-rose-500/40 bg-rose-500/10 p-3 text-[11px] font-mono text-rose-300">
            {error}
          </div>
        )}

        <div className="rounded border border-[#27272A] bg-[#0F0F11] p-4">
          <div className="flex items-center gap-2 text-[#3ECF8E]">
            <div className="w-4 h-4 border-2 border-[#3ECF8E] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono">{status}</span>
          </div>
          <p className="mt-3 text-[11px] font-mono text-[#71717A]">
            This editor opens as a separate white-labeled application. If it does not open automatically, check your
            popup blocker.
          </p>
        </div>
      </div>
    </div>
  );
}
