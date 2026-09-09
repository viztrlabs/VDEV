'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { isSupabaseConfigured } from '@/lib/supabase/client';

import { normalizeUserRole, getDefaultDashboard, UserRole } from '@/lib/rbac';

const DEMO_ACCOUNTS: Array<{ label: string; role: UserRole; email: string; pass: string; color: string }> = [
  { label: 'Super Admin', role: 'super_admin', email: 'admin@viztr.com', pass: 'password123', color: 'border-purple-500/40 text-purple-400 bg-purple-500/10' },
  { label: 'Admin', role: 'admin', email: 'manager@viztr.com', pass: 'password123', color: 'border-blue-500/40 text-blue-400 bg-blue-500/10' },
  { label: 'User', role: 'user', email: 'user@viztr.com', pass: 'password123', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
  { label: 'Client', role: 'client', email: 'client@viztr.com', pass: 'password123', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const urlError = searchParams.get('error');

  const [email, setEmail] = useState('admin@viztr.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState(
    urlError === 'unauthorized_access'
      ? 'Access restricted: Your role does not have permission to view that route.'
      : urlError === 'admin_only'
      ? 'Access restricted: Admin or Super Admin privileges required.'
      : urlError === 'forbidden'
      ? 'Access denied for this resource.'
      : ''
  );
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setNotice(
        'Using built-in demo accounts. For Supabase-backed auth, configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.',
      );
    }
  }, []);

  const selectDemoRole = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setError('');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setBusy(false);
      setError('Invalid email or password. Please use a valid role account or registered Supabase user.');
      return;
    }

    // Determine target dashboard based on authenticated user role
    let destination = '';
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        const userRole = normalizeUserRole(data?.user?.role);
        if (callbackUrl && !callbackUrl.startsWith('/login') && !callbackUrl.startsWith('/client-access')) {
          destination = callbackUrl;
        } else {
          destination = getDefaultDashboard(userRole);
        }
      }
    } catch (sessionErr) {
      console.error('Session fetch failed:', sessionErr);
    }

    if (!destination) {
      destination = '/app/super-admin';
    }

    setBusy(false);
    window.location.href = destination;
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#09090B] text-white px-4 py-8">
      <div className="w-full max-w-sm rounded-2xl border border-[#27272A] bg-[#0c0c0f] p-6 space-y-4 shadow-2xl">
        <div className="text-center">
          <div className="text-lg font-mono font-bold text-[#3ECF8E]">VizTR</div>
          <div className="text-xs text-[#71717A] font-mono mt-1">Role-Based Access Portal</div>
        </div>

        {/* Quick Role Selection Pills */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Select Role to Test:</div>
          <div className="grid grid-cols-2 gap-1.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => selectDemoRole(acc)}
                className={`px-2 py-1.5 rounded-lg border text-[11px] font-mono font-medium transition-all text-left flex items-center justify-between cursor-pointer ${
                  acc.color
                } ${email === acc.email ? 'ring-1 ring-white/50 font-bold' : 'opacity-80 hover:opacity-100'}`}
              >
                <span>{acc.label}</span>
                <span className="text-[9px] opacity-70">Fill</span>
              </button>
            ))}
          </div>
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
          <div>
            <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@studio.com"
              className="w-full bg-[#18181B] border border-[#27272A] rounded px-3 py-2 text-sm focus:border-[#3ECF8E] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-[#18181B] border border-[#27272A] rounded px-3 py-2 text-sm focus:border-[#3ECF8E] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-[#3ECF8E] hover:bg-[#34b876] text-black font-mono font-bold text-xs py-2.5 rounded disabled:opacity-50 transition-colors cursor-pointer"
          >
            {busy ? 'Authenticating…' : 'Sign In & Enter Dashboard'}
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

function LoginLoading() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#09090B] text-white">
      <div className="text-xs font-mono text-[#71717A]">Loading…</div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  );
}
