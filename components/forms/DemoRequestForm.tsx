'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Sparkles, CheckCircle2, X } from 'lucide-react';

interface DemoRequestFormProps {
  onClose?: () => void;
}

export default function DemoRequestForm({ onClose }: DemoRequestFormProps = {}) {
  const { showToast, openPixelStream } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    useCase: 'Real Estate Sales Center',
    message: '',
    consent: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.consent) {
      showToast('Please provide your name, email, and consent.', 'error');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      showToast('VIP Demo authorization granted! Launching Cloud Stream...', 'success');
      setTimeout(() => {
        openPixelStream();
      }, 600);
    }, 600);
  };

  if (submitted) {
    return (
      <div className="p-5 rounded-xl bg-[#18181B] border border-[#3ECF8E]/40 text-center space-y-3">
        <div className="w-9 h-9 rounded-full bg-[#3ECF8E]/10 text-[#3ECF8E] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <h4 className="text-sm font-bold text-[#FAFAFA]">Instant Access Granted</h4>
        <p className="text-xs text-[#A1A1AA]">
          Your cloud GPU session is active. If the stream did not launch automatically, click below.
        </p>
        <button
          onClick={openPixelStream}
          className="px-4 py-2 rounded bg-[#3ECF8E] hover:bg-[#34b27b] text-black text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          Open Unreal Stream Window
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 relative">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-2 -right-2 p-1.5 rounded-full bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA] mb-1">
            Name *
          </label>
          <input
            type="text"
            required
            placeholder="Johnathan Davis"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-1.5 rounded bg-[#09090B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA] mb-1">
            Work Email *
          </label>
          <input
            type="email"
            required
            placeholder="j.davis@mori.co.jp"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-1.5 rounded bg-[#09090B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA] mb-1">
            Company
          </label>
          <input
            type="text"
            placeholder="Mori Building Development"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-3 py-1.5 rounded bg-[#09090B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA] mb-1">
            Primary Use Case
          </label>
          <select
            value={formData.useCase}
            onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
            className="w-full px-3 py-1.5 rounded bg-[#09090B] border border-[#27272A] text-xs text-white focus:outline-none focus:border-[#3ECF8E] cursor-pointer"
          >
            <option value="Real Estate Sales Center">Real Estate Sales Center</option>
            <option value="Architectural Competition">Architectural Competition</option>
            <option value="Investor Remote Walkthrough">Investor Remote Walkthrough</option>
            <option value="Design Validation">Design Validation</option>
          </select>
        </div>
      </div>

      <div className="flex items-start gap-2 pt-0.5">
        <input
          type="checkbox"
          id="demo-consent"
          required
          checked={formData.consent}
          onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
          className="mt-0.5 h-3.5 w-3.5 rounded border-[#27272A] bg-[#09090B] text-[#3ECF8E] focus:ring-[#3ECF8E] cursor-pointer"
        />
        <label htmlFor="demo-consent" className="text-[10px] font-mono text-[#A1A1AA]">
          I understand this test launches an active cloud GPU stream with WebRTC low-latency streaming.
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Live Pixel Streaming Demo</span>
          </>
        )}
      </button>
    </form>
  );
}
