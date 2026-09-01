'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Key, Lock, ArrowRight, Sparkles, Building, CheckCircle2, AlertCircle } from 'lucide-react';
import { mockTrackedProjects } from '@/data/projects-tracking';
import { ViztrLogoMark } from '@/components/ui/Logo';

interface ProjectIdAccessCodeAuthProps {
  onAuthenticated: () => void;
}

export default function ProjectIdAccessCodeAuth({ onAuthenticated }: ProjectIdAccessCodeAuthProps) {
  const [projectId, setProjectId] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanId = projectId.trim().toUpperCase();
    const cleanCode = accessCode.trim().toUpperCase();

    // Check against mockTrackedProjects or allow demo credentials
    const found = mockTrackedProjects.find(
      (p) => p.id.toUpperCase() === cleanId && p.accessCode.toUpperCase() === cleanCode
    );

    if (found || (cleanId.startsWith('VIZTR') && cleanCode.length >= 4) || cleanId === 'DEMO') {
      setTimeout(() => {
        setLoading(false);
        onAuthenticated();
      }, 400);
    } else {
      setTimeout(() => {
        setLoading(false);
        setError('Invalid Project ID or Access Code. Use the 1-click Demo credentials below to test.');
      }, 300);
    }
  };

  const handleDemoFill = (demoId: string, demoCode: string) => {
    setProjectId(demoId);
    setAccessCode(demoCode);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#3ECF8E]/10 via-rose-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-[#18181B] border border-[#27272A] shadow-2xl">
            <ViztrLogoMark className="w-10 h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-white">
            Client Portal Access
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-sm mx-auto">
            Enter your Commission ID and encrypted Access Key to enter your live architectural production workspace.
          </p>
        </div>

        {/* Access Form Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#18181B] border border-[#27272A] shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[#A1A1AA] mb-1.5 uppercase tracking-wider">
                Project ID / Commission Reference
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="e.g. VIZTR-DEMO or VZ-9021"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-sm text-white font-mono placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E] transition-colors uppercase"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#A1A1AA] mb-1.5 uppercase tracking-wider">
                Encrypted Access Code
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="e.g. DEMO-2026 or ALPHA-99"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-sm text-white font-mono placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E] transition-colors uppercase"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !projectId || !accessCode}
              className="w-full py-3 px-4 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-[#3ECF8E]/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Authenticating Workspace...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Enter Project Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Tokens Section */}
          <div className="pt-4 border-t border-[#27272A] space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#3ECF8E]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Demo Credentials:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('VIZTR-DEMO', 'DEMO-2026')}
                className="p-2.5 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] hover:border-[#3ECF8E]/50 text-left transition-all group cursor-pointer"
              >
                <div className="text-xs font-bold text-white group-hover:text-[#3ECF8E] flex items-center justify-between">
                  <span>Horizon Pavilion</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-normal">Active</span>
                </div>
                <div className="text-[10px] font-mono text-[#A1A1AA] mt-0.5">
                  ID: <span className="text-white">VIZTR-DEMO</span> | Code: <span className="text-white">DEMO-2026</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('VZ-9021', 'ALPHA-99')}
                className="p-2.5 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] hover:border-[#3ECF8E]/50 text-left transition-all group cursor-pointer"
              >
                <div className="text-xs font-bold text-white group-hover:text-[#3ECF8E] flex items-center justify-between">
                  <span>Solarium Penthouse</span>
                  <span className="text-[10px] font-mono text-amber-400 font-normal">Review</span>
                </div>
                <div className="text-[10px] font-mono text-[#A1A1AA] mt-0.5">
                  ID: <span className="text-white">VZ-9021</span> | Code: <span className="text-white">ALPHA-99</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('VZ-8410', 'VIP-2026')}
                className="p-2.5 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] hover:border-[#3ECF8E]/50 text-left transition-all group cursor-pointer"
              >
                <div className="text-xs font-bold text-white group-hover:text-[#3ECF8E] flex items-center justify-between">
                  <span>Nordic Villa</span>
                  <span className="text-[10px] font-mono text-sky-400 font-normal">Final</span>
                </div>
                <div className="text-[10px] font-mono text-[#A1A1AA] mt-0.5">
                  ID: <span className="text-white">VZ-8410</span> | Code: <span className="text-white">VIP-2026</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('VZ-7732', 'SKY-404')}
                className="p-2.5 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] hover:border-[#3ECF8E]/50 text-left transition-all group cursor-pointer"
              >
                <div className="text-xs font-bold text-white group-hover:text-[#3ECF8E] flex items-center justify-between">
                  <span>Apex Tower WebXR</span>
                  <span className="text-[10px] font-mono text-purple-400 font-normal">WebXR</span>
                </div>
                <div className="text-[10px] font-mono text-[#A1A1AA] mt-0.5">
                  ID: <span className="text-white">VZ-7732</span> | Code: <span className="text-white">SKY-404</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-[#71717A] flex items-center justify-center gap-4">
          <Link href="/" className="hover:text-white transition-colors">
            ← Return to Studio Homepage
          </Link>
          <span>•</span>
          <Link href="/track-project" className="hover:text-[#3ECF8E] transition-colors">
            Track Pipeline Milestones
          </Link>
        </div>
      </div>
    </div>
  );
}
