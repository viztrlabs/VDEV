'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import {
  Lock,
  User,
  Key,
  ArrowRight,
  ShieldCheck,
  Building,
  Mail,
  HelpCircle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function ClientAccessPage() {
  const router = useRouter();
  const { setUser, showToast } = useAppStore();
  const [activeTab, setActiveTab] = useState<'projectId' | 'email'>('projectId');

  // Tab 1 state
  const [projectId, setProjectId] = useState('VIZTR-882');
  const [projectPassword, setProjectPassword] = useState('••••••••');

  // Tab 2 state
  const [email, setEmail] = useState('elena.rostova@fosterpartners.com');
  const [emailPassword, setEmailPassword] = useState('••••••••');

  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleProjectLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setUser({
        id: 'usr_foster_01',
        name: 'Elena Rostova',
        email: 'elena.rostova@fosterpartners.com',
        role: 'CLIENT',
      });
      showToast('Client project verified. Redirecting to workspace...', 'success');
      router.push('/client-dashboard');
    }, 600);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setUser({
        id: 'usr_foster_01',
        name: 'Elena Rostova',
        email: email,
        role: 'CLIENT',
      });
      showToast('Client session authenticated. Welcome back.', 'success');
      router.push('/client-dashboard');
    }, 600);
  };

  const handleGoogleLogin = () => {
    showToast('Redirecting to Google Enterprise OAuth...', 'info');
    setTimeout(() => {
      setUser({
        id: 'usr_google_01',
        name: 'Marcus Sterling',
        email: 'marcus.sterling@architects.com',
        role: 'CLIENT',
      });
      showToast('Signed in via Google OAuth.', 'success');
      router.push('/client-dashboard');
    }, 800);
  };

  const handleForgotAccessCode = (e: React.FormEvent) => {
    e.preventDefault();
    setShowForgotModal(false);
    showToast(`Access recovery instructions dispatched to ${forgotEmail || 'your authorized email'}.`, 'info');
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center py-16 px-4 sm:px-6 bg-[#09090B] text-[#FAFAFA]">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-center mx-auto text-[#3ECF8E] shadow-xl">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">
            Client Access Portal
          </h1>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Review live photorealistic render milestones, interact with WebXR models, and download approved master assets.
          </p>
        </div>

        {/* CARD CONTAINER */}
        <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] shadow-2xl space-y-5">
          {/* TABS */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#09090B] border border-[#27272A]">
            <button
              onClick={() => setActiveTab('projectId')}
              className={`py-2 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'projectId'
                  ? 'bg-[#3ECF8E] text-black shadow-md'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              Project ID Login
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`py-2 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'email'
                  ? 'bg-[#3ECF8E] text-black shadow-md'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              Email Login
            </button>
          </div>

          {/* TAB 1: PROJECT ID LOGIN */}
          {activeTab === 'projectId' && (
            <form onSubmit={handleProjectLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA] mb-1.5">
                  Project ID *
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="e.g. VIZTR-882"
                    className="w-full bg-[#09090B] text-xs text-[#FAFAFA] pl-9 pr-3 py-2.5 rounded-lg border border-[#27272A] focus:outline-none focus:border-[#3ECF8E] font-mono transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA] mb-1.5">
                  Project Password / Access Key *
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={projectPassword}
                    onChange={(e) => setProjectPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#09090B] text-xs text-[#FAFAFA] pl-9 pr-3 py-2.5 rounded-lg border border-[#27272A] focus:outline-none focus:border-[#3ECF8E] font-mono transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Track Project</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: EMAIL LOGIN */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA] mb-1.5">
                  Corporate / Client Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="architect@firm.com"
                    className="w-full bg-[#09090B] text-xs text-[#FAFAFA] pl-9 pr-3 py-2.5 rounded-lg border border-[#27272A] focus:outline-none focus:border-[#3ECF8E] font-mono transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA] mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={emailPassword}
                    onChange={(e) => setEmailPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#09090B] text-xs text-[#FAFAFA] pl-9 pr-3 py-2.5 rounded-lg border border-[#27272A] focus:outline-none focus:border-[#3ECF8E] font-mono transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Login to Client Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* SOCIAL LOGIN & FORGOT PASSWORD */}
          <div className="space-y-3 pt-2">
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#27272A]"></div>
              <span className="flex-shrink mx-3 text-[10px] font-mono uppercase text-[#71717A]">
                or connect with
              </span>
              <div className="flex-grow border-t border-[#27272A]"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full py-2.5 px-4 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-white font-mono text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                />
              </svg>
              <span>Continue with Google Workspace</span>
            </button>

            <div className="flex items-center justify-between text-[11px] font-mono text-[#71717A] pt-2 border-t border-[#27272A]">
              <button
                onClick={() => setShowForgotModal(true)}
                className="hover:text-[#3ECF8E] transition-colors cursor-pointer"
              >
                Forgot access code?
              </button>
              <Link href="/client-view/VIZTR-882" className="text-[#3ECF8E] hover:underline">
                Public Shared View Demo →
              </Link>
            </div>
          </div>
        </div>

        {/* FORGOT ACCESS MODAL */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] max-w-sm w-full space-y-4">
              <h3 className="text-sm font-bold font-display text-white">Reset Access Token</h3>
              <p className="text-xs text-[#A1A1AA]">
                Enter your firm email to request an automated security token or admin dispatch.
              </p>
              <input
                type="email"
                placeholder="architect@firm.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white focus:outline-none focus:border-[#3ECF8E]"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono text-[#A1A1AA] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleForgotAccessCode}
                  className="px-3 py-1.5 rounded-lg bg-[#3ECF8E] text-black font-mono text-xs font-bold"
                >
                  Send Recovery Link
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
