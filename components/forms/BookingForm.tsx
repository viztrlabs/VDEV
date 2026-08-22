'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Calendar, Clock, CheckCircle2, DollarSign, Building, Sparkles } from 'lucide-react';

export default function BookingForm() {
  const { showToast } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Set default min date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateString = tomorrow.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: 'Exterior & Interior Visualization',
    preferredDate: minDateString,
    preferredTime: '14:00 (EST / UTC-5)',
    budgetRange: '$15,000 – $50,000',
    projectDetails: '',
    consent: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.preferredDate || !formData.consent) {
      showToast('Please fill out all required fields and accept terms.', 'error');
      return;
    }

    // Verify date is in future
    const selected = new Date(formData.preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selected < today) {
      showToast('Please select a future date for the consultation.', 'error');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setConfirmed(true);
      showToast('Consultation successfully scheduled! A calendar invitation has been sent.', 'success');
    }, 700);
  };

  if (confirmed) {
    return (
      <div className="p-6 rounded-xl bg-[#18181B] border border-[#3ECF8E]/40 text-center space-y-4 animate-in fade-in">
        <div className="w-10 h-10 rounded-full bg-[#3ECF8E]/10 text-[#3ECF8E] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-[#FAFAFA]">Consultation Booked</h3>
        <p className="text-xs text-[#A1A1AA] max-w-md mx-auto">
          We have scheduled your architectural consultation with a VizTR Principal Director for <strong className="text-[#FAFAFA]">{formData.preferredDate}</strong> at <strong className="text-[#FAFAFA]">{formData.preferredTime}</strong>.
        </p>
        <div className="p-3.5 rounded bg-[#09090B] border border-[#27272A] text-xs text-[#A1A1AA] text-left max-w-md mx-auto space-y-1 font-mono">
          <div>CLIENT: <span className="text-[#FAFAFA]">{formData.name} ({formData.company || 'Private Client'})</span></div>
          <div>SERVICE: <span className="text-[#FAFAFA]">{formData.service}</span></div>
          <div>BUDGET: <span className="text-[#3ECF8E]">{formData.budgetRange}</span></div>
        </div>
        <button
          onClick={() => setConfirmed(false)}
          className="mt-3 px-5 py-2 rounded bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs font-mono text-[#FAFAFA] transition-colors cursor-pointer"
        >
          Book Another Session
        </button>
      </div>
    );
  }

  return (
    <form id="booking-consultation-form" onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA] mb-1.5">
            Full Name <span className="text-[#3ECF8E]">*</span>
          </label>
          <input
            type="text"
            required
            id="book-name"
            placeholder="e.g. David Sterling"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3.5 py-2 rounded bg-[#09090B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA] mb-1.5">
            Work Email <span className="text-[#3ECF8E]">*</span>
          </label>
          <input
            type="email"
            required
            id="book-email"
            placeholder="d.sterling@vanguard.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3.5 py-2 rounded bg-[#09090B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA] mb-1.5">
            Phone / Mobile <span className="text-[#3ECF8E]">*</span>
          </label>
          <input
            type="tel"
            required
            id="book-phone"
            placeholder="+1 (555) 234-5678"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3.5 py-2 rounded bg-[#09090B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA] mb-1.5">
            Company / Firm Name
          </label>
          <input
            type="text"
            id="book-company"
            placeholder="Vanguard Property Group"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-3.5 py-2 rounded bg-[#09090B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA] mb-1.5">
            Primary Service Focus <span className="text-[#3ECF8E]">*</span>
          </label>
          <select
            id="book-service"
            value={formData.service}
            onChange={(e) => setFormData({ ...formData, service: e.target.value })}
            className="w-full px-3.5 py-2 rounded bg-[#09090B] border border-[#27272A] text-xs text-white focus:outline-none focus:border-[#3ECF8E] cursor-pointer"
          >
            <option value="Exterior & Interior Visualization">Exterior & Interior Visualization</option>
            <option value="Cinematic Walkthrough Animation">Cinematic Walkthrough Animation</option>
            <option value="WebXR In-Browser Spatial 3D">WebXR In-Browser Spatial 3D</option>
            <option value="Cloud Pixel Streaming (Unreal 5.4)">Cloud Pixel Streaming (Unreal 5.4)</option>
            <option value="Complete Master Development Suite">Complete Master Development Suite</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA] mb-1.5">
            Estimated Budget Range <span className="text-[#3ECF8E]">*</span>
          </label>
          <select
            id="book-budget"
            value={formData.budgetRange}
            onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
            className="w-full px-3.5 py-2 rounded bg-[#09090B] border border-[#27272A] text-xs text-white focus:outline-none focus:border-[#3ECF8E] cursor-pointer"
          >
            <option value="Under $5,000">Under $5,000 (Single Render/Fast Track)</option>
            <option value="$5,000 – $15,000">$5,000 – $15,000 (Standard Residential)</option>
            <option value="$15,000 – $50,000">$15,000 – $50,000 (Tower / Masterplan)</option>
            <option value="$50,000 – $100,000">$50,000 – $100,000 (Full XR + Pixel Streaming)</option>
            <option value="$100,000+">$100,000+ (Enterprise Multi-Asset Suite)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA] mb-1.5">
            Preferred Date <span className="text-[#3ECF8E]">*</span>
          </label>
          <input
            type="date"
            required
            id="book-date"
            suppressHydrationWarning
            min={minDateString}
            value={formData.preferredDate}
            onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
            className="w-full px-3.5 py-2 rounded bg-[#09090B] border border-[#27272A] text-xs text-white focus:outline-none focus:border-[#3ECF8E]"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA] mb-1.5">
            Preferred Time Slot <span className="text-[#3ECF8E]">*</span>
          </label>
          <select
            id="book-time"
            value={formData.preferredTime}
            onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
            className="w-full px-3.5 py-2 rounded bg-[#09090B] border border-[#27272A] text-xs text-white focus:outline-none focus:border-[#3ECF8E] cursor-pointer"
          >
            <option value="10:00 (EST / UTC-5)">10:00 AM (EST / New York)</option>
            <option value="14:00 (EST / UTC-5)">02:00 PM (EST / New York)</option>
            <option value="16:30 (EST / UTC-5)">04:30 PM (EST / New York)</option>
            <option value="11:00 (GMT / London)">11:00 AM (GMT / London)</option>
            <option value="16:00 (GST / Dubai)">04:00 PM (GST / Dubai)</option>
            <option value="14:00 (SGT / Singapore)">02:00 PM (SGT / Singapore)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA] mb-1.5">
          Project Details & Objectives
        </label>
        <textarea
          rows={3}
          id="book-details"
          placeholder="Briefly describe your development goals, key milestones, and whether you require marketing renders, WebXR links, or sales center kiosk setups..."
          value={formData.projectDetails}
          onChange={(e) => setFormData({ ...formData, projectDetails: e.target.value })}
          className="w-full px-3.5 py-2 rounded bg-[#09090B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
        />
      </div>

      <div className="flex items-start gap-2 pt-1">
        <input
          type="checkbox"
          id="book-consent"
          required
          checked={formData.consent}
          onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
          className="mt-0.5 h-3.5 w-3.5 rounded border-[#27272A] bg-[#09090B] text-[#3ECF8E] focus:ring-[#3ECF8E] cursor-pointer"
        />
        <label htmlFor="book-consent" className="text-[11px] text-[#A1A1AA] leading-normal">
          I consent to scheduling a 30-minute architectural consultation call with the VizTR visualization team.
        </label>
      </div>

      <button
        type="submit"
        id="book-submit-btn"
        disabled={loading}
        className="w-full py-3 rounded bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Calendar className="w-3.5 h-3.5" />
            <span>Confirm Consultation Booking</span>
          </>
        )}
      </button>
    </form>
  );
}
