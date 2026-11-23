'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { notFound } from 'next/navigation';
import Pano2VrPackageEditor from '@/components/builder/Pano2VrPackageEditor';

export default function Pano2VrUploadPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const experienceId = params.experienceId as string;

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      // Not authenticated — redirect to login with callback
      signIn('credentials', { callbackUrl: window.location.href });
      return;
    }
    // Authenticated — can proceed (the editor component uses the session token for upload)
    setAuthorized(true);
    setLoading(false);
  }, [status, session]);

  if (loading || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#131314] text-white">
        <div className="flex flex-col items-center gap-4 p-4">
          <Loader2 className="w-8 h-8 text-[#dbfcff] animate-spin" />
          <p className="text-zinc-400 text-sm font-mono">Loading editor…</p>
        </div>
      </div>
    );
  }

  return <Pano2VrPackageEditor experienceId={params.experienceId as string} />;
}