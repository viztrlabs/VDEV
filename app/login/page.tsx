'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setNotice(
        'Supabase credentials are not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local to enable auth.',
      );
    }
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const supabase = createClient();
    if (!supabase) {
      setError('Auth is not configured.');
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push('/admin/dashboard');
    router.refresh();
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#09090B] text-white px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#27272A] bg-[#0c0c0f] p-6 space-y-4">
        <div className="text-center">
          <div className="text-lg font-mono font-bold text-[#3ECF8E]">VizTR</div>
          <div className="text-xs text-[#71717A] font-mono mt-1">Sign in to your studio</div>
        </div>

        {notice && (
          <div className="text-[10px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded p-2">
            {notice}
          </div>
        )}
        {error && (
          <div className="text-[10px] font-mono text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded p-2">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@studio.com"
            className="w-full bg-[#18181B] border border-[#27272A] rounded px-3 py-2 text-sm"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-[#18181B] border border-[#27272A] rounded px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-[#3ECF8E] hover:bg-[#34b876] text-black font-mono font-bold text-xs py-2 rounded disabled:opacity-50"
          >
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-[11px] text-[#71717A] font-mono">
          No account?{' '}
          <Link href="/signup" className="text-[#3ECF8E] hover:underline">
            Create one
          </Link>
        </div>
      </div>
    </main>
  );
}
