'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface ContactFormProps {
  initialService?: string;
}

export default function ContactForm({ initialService = 'Exterior Visualization' }: ContactFormProps) {
  const { showToast } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: initialService,
    message: '',
    consent: false,
    honeypot: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.honeypot) return; // Anti-spam

    if (!formData.name || !formData.email || !formData.message || !formData.consent) {
      showToast('Please complete all required fields and accept terms.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/forms/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('submit failed');
      setLoading(false);
      setSubmitted(true);
      showToast('Thank you! Your project inquiry has been dispatched to our architectural directors.', 'success');
    } catch (err) {
      setLoading(false);
      showToast('Something went wrong. Please try again.', 'error');
    }
  };

  if (submitted) {
    return (
      <div className="p-6 rounded-xl bg-[#201f20] border border-[#dbfcff]/40 text-center space-y-4 animate-in fade-in">
        <div className="w-10 h-10 rounded-full bg-[#dbfcff]/10 text-[#dbfcff] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-[#e5e2e3]">Inquiry Received</h3>
        <p className="text-xs text-[#A1A1AA] max-w-md mx-auto">
          Thank you, <strong className="text-[#e5e2e3]">{formData.name}</strong>. Our senior visual directors will review your project parameters and respond to <strong className="text-[#e5e2e3]">{formData.email}</strong> within 24 hours.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setFormData({
              name: '',
              email: '',
              phone: '',
              service: initialService,
              message: '',
              consent: false,
              honeypot: ''
            });
          }}
          className="mt-3 px-5 py-2 rounded bg-[#201f20] hover:bg-[#353436] border border-[#353436] text-xs font-mono text-[#e5e2e3] transition-colors cursor-pointer"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form id="contact-inquiry-form" onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot hidden field for anti-spam */}
      <input
        type="text"
        name="honeypot"
        value={formData.honeypot}
        onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA] mb-1.5">
            Full Name <span className="text-[#00F0FF]">*</span>
          </label>
          <input
            type="text"
            required
            id="contact-name"
            placeholder="e.g. Sarah Sterling"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-full bg-[#131314] border border-[#3b494b] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#00F0FF] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA] mb-1.5">
            Work Email <span className="text-[#00F0FF]">*</span>
          </label>
          <input
            type="email"
            required
            id="contact-email"
            placeholder="s.sterling@architects.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-full bg-[#131314] border border-[#3b494b] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#00F0FF] transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA] mb-1.5">
            Phone / WhatsApp
          </label>
          <input
            type="tel"
            id="contact-phone"
            placeholder="+1 (555) 000-0000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-full bg-[#131314] border border-[#3b494b] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#00F0FF] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA] mb-1.5">
            Service of Interest <span className="text-[#00F0FF]">*</span>
          </label>
          <select
            id="contact-service"
            value={formData.service}
            onChange={(e) => setFormData({ ...formData, service: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-full bg-[#131314] border border-[#3b494b] text-xs text-white focus:outline-none focus:border-[#00F0FF] transition-colors cursor-pointer"
          >
            <option value="Exterior Visualization">Exterior Visualization</option>
            <option value="Interior Visualization">Interior Visualization</option>
            <option value="Walkthrough Animation">Walkthrough Animation</option>
            <option value="WebXR (Zero-Install 3D)">WebXR (Zero-Install 3D)</option>
            <option value="WebAR Augmented Reality">WebAR Augmented Reality</option>
            <option value="Virtual Reality (VR)">Virtual Reality (VR)</option>
            <option value="360° Virtual Tour">360° Virtual Tour</option>
            <option value="Comprehensive Master Package">Comprehensive Master Package</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA] mb-1.5">
          Project Details & Scope <span className="text-[#00F0FF]">*</span>
        </label>
        <textarea
          required
          rows={4}
          id="contact-message"
          placeholder="Please describe your development type, location, approximate square meters, timeline requirements, and available CAD/BIM assets..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-2xl bg-[#131314] border border-[#3b494b] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#00F0FF] transition-colors"
        />
      </div>

      {/* Consent Checkbox */}
      <div className="flex items-start gap-2 pt-1">
        <input
          type="checkbox"
          id="contact-consent"
          required
          checked={formData.consent}
          onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
          className="mt-0.5 h-3.5 w-3.5 rounded border-[#3b494b] bg-[#131314] text-[#00F0FF] focus:ring-[#00F0FF] cursor-pointer"
        />
        <label htmlFor="contact-consent" className="text-[11px] text-[#A1A1AA] leading-normal">
          I agree to allow VizTR to process my inquiry data and contact me regarding architectural visualization proposals.
        </label>
      </div>

      <button
        type="submit"
        id="contact-submit-btn"
        disabled={loading}
        className="w-full py-3.5 rounded-full bg-[#00F0FF] hover:bg-[#33f3ff] text-black font-display font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
      >
        {loading ? (
          <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Send className="w-3.5 h-3.5" />
            <span>Submit Architectural Brief</span>
          </>
        )}
      </button>
    </form>
  );
}
