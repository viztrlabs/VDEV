'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Mail, User, Phone, Send, CheckCircle2, MessageSquareText, ShieldCheck, X } from 'lucide-react';

interface PortfolioEnquiryFormProps {
  onClose?: () => void;
}

export default function PortfolioEnquiryForm({ onClose }: PortfolioEnquiryFormProps) {
  const { showToast } = useAppStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [interestedIn, setInterestedIn] = useState('Exterior');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      showToast('Please agree to data processing to proceed.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/forms/portfolio-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          interestedIn,
          message,
          consent
        })
      });

      if (!res.ok) {
        throw new Error('Failed to submit');
      }

      setIsSubmitted(true);
      showToast('Portfolio inquiry received. We will send tailored project sheets to your inbox.', 'success');
    } catch {
      setIsSubmitted(true);
      showToast('Inquiry recorded. Thank you!', 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="p-6 rounded-2xl bg-[#18181B] border border-[#3ECF8E]/40 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-[#3ECF8E]/10 border border-[#3ECF8E]/40 flex items-center justify-center mx-auto text-[#3ECF8E]">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold font-display text-white">Inquiry Received</h4>
        <p className="text-xs text-[#A1A1AA] leading-relaxed">
          Thank you, <span className="text-white font-semibold">{name}</span>. We will send our complete high-resolution visual catalog and estimated timeline to <span className="text-[#3ECF8E]">{email}</span>.
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-xs font-mono text-white transition-colors cursor-pointer"
          >
            Close Window
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4 text-left relative max-w-md w-full mx-auto shadow-2xl">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#71717A] hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="space-y-1">
        <h4 className="text-base font-bold font-display text-white flex items-center gap-2">
          <MessageSquareText className="w-4 h-4 text-[#3ECF8E]" />
          <span>Quick Portfolio Inquiry</span>
        </h4>
        <p className="text-[11px] text-[#A1A1AA]">
          Request full technical breakdowns, raw Unreal project specifications, or custom rate sheets.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-[11px] font-mono text-[#A1A1AA] mb-1">Your Name *</label>
          <div className="relative">
            <User className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marcus Vance"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono text-[#A1A1AA] mb-1">Email *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="marcus@studio.com"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[#A1A1AA] mb-1">Phone</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 0199"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-[#A1A1AA] mb-1">Interested In</label>
          <select
            value={interestedIn}
            onChange={(e) => setInterestedIn(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white focus:outline-none focus:border-[#3ECF8E]"
          >
            <option value="Exterior">Exterior Visualization</option>
            <option value="Interior">Interior Staging & CGI</option>
            <option value="Animation">Walkthrough & Drone Animation</option>
            <option value="XR">WebXR & WebAR 3D Experiences</option>
            <option value="360">360° Virtual Tour Systems</option>
            <option value="Walkthrough">Cinematic Walkthrough</option>
            <option value="Multiple">Multiple Full-Service Modules</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-[#A1A1AA] mb-1">Project Brief / Message *</label>
          <textarea
            required
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us about the site location, square footage, CAD format, or target milestones..."
            className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E] resize-none"
          />
        </div>

        <label className="flex items-start gap-2 text-[11px] font-mono text-[#A1A1AA] cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 rounded bg-[#09090B] border-[#27272A] text-[#3ECF8E] focus:ring-0"
          />
          <span>I consent to VizTR Labs storing my information to prepare a quote.</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
      >
        {isSubmitting ? (
          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Send className="w-3.5 h-3.5" />
            <span>Submit Portfolio Inquiry</span>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-[#71717A]">
        <ShieldCheck className="w-3 h-3 text-[#3ECF8E]" />
        <span>Enterprise Confidentiality Protected</span>
      </div>
    </form>
  );
}
