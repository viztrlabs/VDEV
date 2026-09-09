'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Box, Lock, AlertTriangle, ShieldX } from 'lucide-react';
import XRViewer from '@/components/xr/XRViewer';

type LinkStatus =
  | { kind: 'loading' }
  | { kind: 'ready'; projectId?: string; mode: 'tour' | 'vr' | 'ar'; passwordProtected: boolean }
  | { kind: 'expired' }
  | { kind: 'revoked' }
  | { kind: 'notfound' }
  | { kind: 'error'; message: string };

export default function ViewSlugPage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';
  const [status, setStatus] = useState<LinkStatus>({ kind: 'loading' });
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [resolvedSlug, setResolvedSlug] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/xr-links/public/${encodeURIComponent(slug)}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setStatus(body?.error === 'Link not ready' ? { kind: 'notfound' } : { kind: 'notfound' });
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        setResolvedSlug(data.xrLink.slug);
        if (data.expired) { setStatus({ kind: 'expired' }); return; }
        if (data.revoked) { setStatus({ kind: 'revoked' }); return; }
        const genMode: string = data.xrLink.metadata?.engineType === 'playcanvas' ? 'webxr' : 'webxr';
        setStatus({
          kind: 'ready',
          projectId: data.xrLink.projectId,
          mode: genMode === 'webar' ? 'ar' : 'vr',
          passwordProtected: !!data.xrLink.passwordProtected,
        });
      } catch {
        if (!cancelled) setStatus({ kind: 'error', message: 'Unable to load this link.' });
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const handleUnlock = async () => {
    setAuthError('');
    try {
      const res = await fetch(`/api/xr-links/public/${encodeURIComponent(slug)}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setStatus((s) => (s.kind === 'ready' ? { ...s, passwordProtected: false } : s));
      } else {
        setAuthError('Incorrect password');
      }
    } catch {
      setAuthError('Verification failed. Try again.');
    }
  };

  if (status.kind === 'loading') {
    return (
      <Shell>
        <p className="text-xs font-mono text-[#3ECF8E]">Resolving spatial link…</p>
      </Shell>
    );
  }

  if (status.kind === 'notfound') {
    return (
      <Terminal state="notfound" title="Link not found" detail="This link may not exist or is still preparing." />
    );
  }

  if (status.kind === 'expired') {
    return <Terminal state="expired" title="Link expired" detail="This link's access window has passed." />;
  }

  if (status.kind === 'revoked') {
    return <Terminal state="revoked" title="Link revoked" detail="The publisher has revoked this link." />;
  }

  if (status.kind === 'error') {
    return <Terminal state="error" title="Something went wrong" detail={status.message} />;
  }

  // ready
  return (
    <Shell>
      {status.passwordProtected ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
          <Lock className="w-8 h-8 text-[#3ECF8E]" />
          <div>
            <p className="text-sm font-bold text-[#FAFAFA]">This link is password protected</p>
            <p className="text-[11px] text-[#71717A] mt-1">Enter the access password to continue.</p>
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              placeholder="Access password"
              className="px-3 py-2 rounded-lg bg-[#18181B] border border-[#3F3F46] text-sm text-white outline-none focus:border-[#3ECF8E]"
            />
            <button
              type="button"
              onClick={handleUnlock}
              className="px-4 py-2 rounded-lg bg-[#3ECF8E] text-black text-sm font-bold hover:bg-[#2fbf7c] transition-colors"
            >
              Unlock
            </button>
          </div>
          {authError && <p className="text-xs font-mono text-red-400">{authError}</p>}
        </div>
      ) : (
        <XRViewer projectId={status.projectId || 'apex-tower'} mode={status.mode} className="h-[75vh]" />
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-black text-[#FAFAFA] flex flex-col justify-between p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/xr-world" className="inline-flex items-center gap-2 text-xs font-mono text-[#A1A1AA] hover:text-[#3ECF8E] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to XR World Hub</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E]">
          <Box className="w-4 h-4" />
          <span>Published Spatial Link</span>
        </div>
      </div>
      <div className="flex-1 w-full flex items-center justify-center">{children}</div>
    </main>
  );
}

function Terminal({ state, title, detail }: { state: string; title: string; detail: string }) {
  const Icon = state === 'expired' || state === 'revoked' ? ShieldX : state === 'error' ? AlertTriangle : AlertTriangle;
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      <Icon className="w-10 h-10 text-[#A1A1AA]" />
      <div>
        <p className="text-base font-bold text-white">{title}</p>
        <p className="text-xs text-[#71717A] mt-1">{detail}</p>
      </div>
      <Link href="/xr-world" className="text-xs font-mono text-[#3ECF8E] hover:underline">
        Back to XR World Hub
      </Link>
    </div>
  );
}
