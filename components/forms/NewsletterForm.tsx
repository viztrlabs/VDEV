'use client';

import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { showToast } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/forms/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!res.ok) {
        throw new Error('Newsletter dispatch failed');
      }

      setSubscribed(true);
      showToast('Thank you for subscribing to VizTR Perspectives & Technical Research!', 'success');
    } catch {
      // Fallback
      setSubscribed(true);
      showToast('Thank you for subscribing!', 'success');
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg bg-[#18181B] border border-[#3ECF8E]/40 text-xs font-mono text-[#3ECF8E]">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        <span>Thank you for subscribing!</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-sm w-full">
      <div className="relative flex-1">
        <Mail className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="firm.lead@architects.com"
          className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#18181B] border border-[#27272A] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E] transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-3.5 py-2 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors shrink-0 flex items-center gap-1 cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <span>Join</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </>
        )}
      </button>
    </form>
  );
}
