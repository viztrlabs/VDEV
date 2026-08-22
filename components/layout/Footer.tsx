'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { Mail, Phone, MapPin, Send, CheckCircle2, Instagram, Linkedin, Twitter, Youtube, ArrowRight } from 'lucide-react';

export default function Footer() {
  const { showToast } = useAppStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    setSubscribed(true);
    showToast('Thank you for subscribing to VizTR Journal!', 'success');
  };

  return (
    <footer id="main-footer" className="bg-[#09090B] text-[#A1A1AA] border-t border-[#27272A] pt-12 pb-10 transition-colors">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* TELEMETRY TOP BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-8 border-b border-[#27272A] text-xs font-mono">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#3ECF8E] animate-pulse"></span>
              <span className="text-[#FAFAFA] font-bold">SYSTEMS OPERATIONAL</span>
            </div>
            <span className="text-[#27272A]">|</span>
            <span className="text-[#71717A]">LATENCY: 12ms (US-EAST-1)</span>
            <span className="text-[#27272A]">|</span>
            <span className="text-[#71717A]">UE5.4 LUMEN ENGINE: ONLINE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#18181B] text-[#3ECF8E] text-[10px] border border-[#27272A] font-bold">
              VIZTR COMPUTE v2.4.8
            </span>
          </div>
        </div>

        {/* 4 COLUMNS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 py-10 border-b border-[#27272A]">
          
          {/* COLUMN 1: Brand & Bio */}
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#3ECF8E] flex items-center justify-center text-black font-extrabold text-xs">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-[#FAFAFA]">
                VizTR
              </span>
            </Link>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              High-density architectural rendering, real-time WebXR spatial computing, and scalable cloud Unreal Engine 5 pixel streaming.
            </p>

            {/* Newsletter Inline Form */}
            <div className="pt-2">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#71717A] mb-2 font-mono">
                ENGINEERING JOURNAL
              </div>
              {subscribed ? (
                <div className="flex items-center gap-2 text-xs text-[#3ECF8E] bg-[#18181B] border border-[#27272A] p-2 rounded">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3ECF8E] shrink-0" />
                  <span>Subscribed to engineering briefs.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-1.5">
                  <input
                    type="email"
                    id="newsletter-email"
                    placeholder="architect@firm.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-[#18181B] text-xs text-[#FAFAFA] placeholder-[#71717A] px-3 py-1.5 rounded border border-[#27272A] focus:outline-none focus:border-[#3ECF8E] flex-1 font-mono"
                  />
                  <button
                    type="submit"
                    id="newsletter-submit-btn"
                    className="bg-[#3ECF8E] hover:bg-[#34b27b] text-black px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center justify-center cursor-pointer"
                    aria-label="Subscribe"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* COLUMN 2: Studio Services */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#FAFAFA] font-mono">
              STUDIO PIPELINES
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/studio/exterior"
                  className="text-[#A1A1AA] hover:text-[#3ECF8E] transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#3ECF8E]" />
                  Exterior Visualization (8K)
                </Link>
              </li>
              <li>
                <Link
                  href="/studio/interior"
                  className="text-[#A1A1AA] hover:text-[#3ECF8E] transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#3ECF8E]" />
                  Interior Architectural Staging
                </Link>
              </li>
              <li>
                <Link
                  href="/studio/walkthrough"
                  className="text-[#A1A1AA] hover:text-[#3ECF8E] transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#3ECF8E]" />
                  Cinematic Walkthrough (60 FPS)
                </Link>
              </li>
              <li>
                <Link
                  href="/studio"
                  className="text-[#71717A] hover:text-[#FAFAFA] transition-colors text-[11px] font-semibold pt-1 block"
                >
                  Studio Overview →
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: XR World */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#FAFAFA] font-mono">
              SPATIAL COMPUTING
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/xr-world/pixel-streaming"
                  className="text-[#3ECF8E] hover:text-emerald-300 transition-colors font-medium inline-flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E] animate-pulse" />
                  Pixel Streaming (Cloud GPU)
                </Link>
              </li>
              <li>
                <Link
                  href="/xr-world/webxr"
                  className="text-[#A1A1AA] hover:text-[#3ECF8E] transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#3ECF8E]" />
                  WebXR In-Browser Spatial
                </Link>
              </li>
              <li>
                <Link
                  href="/xr-world/webar"
                  className="text-[#A1A1AA] hover:text-[#3ECF8E] transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#3ECF8E]" />
                  WebAR Surface Projection
                </Link>
              </li>
              <li>
                <Link
                  href="/xr-world/virtual-reality"
                  className="text-[#A1A1AA] hover:text-[#3ECF8E] transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#3ECF8E]" />
                  Virtual Reality (Quest & Vision Pro)
                </Link>
              </li>
              <li>
                <Link
                  href="/xr-world/virtual-tour"
                  className="text-[#A1A1AA] hover:text-[#3ECF8E] transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#3ECF8E]" />
                  16K Panoramic Virtual Tour
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: Connect & Studio Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#FAFAFA] font-mono">
              STUDIO & DISPATCH
            </h3>
            <ul className="space-y-1.5 text-xs text-[#A1A1AA] pb-2 border-b border-[#27272A]">
              <li>
                <Link href="/about" className="hover:text-[#3ECF8E] transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-[#3ECF8E]" />
                  About VizTR Studio
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[#3ECF8E] transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-[#3ECF8E]" />
                  Perspectives & Research Blog
                </Link>
              </li>
              <li>
                <Link href="/book-consultation" className="hover:text-[#3ECF8E] transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-[#3ECF8E]" />
                  Book Project Consultation
                </Link>
              </li>
            </ul>
            <div className="space-y-2 text-xs text-[#A1A1AA]">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#3ECF8E] shrink-0" />
                <a href="mailto:hello@viztr.com" className="hover:text-white transition-colors">
                  hello@viztr.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#3ECF8E] shrink-0" />
                <a href="tel:+15551234567" className="hover:text-white transition-colors">
                  +1 (555) 123-4567
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#3ECF8E] shrink-0 mt-0.5" />
                <span>123 Spatial Boulevard, Silicon District</span>
              </div>
            </div>

            {/* Social Icons Row */}
            <div className="pt-2 flex items-center space-x-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="p-1.5 rounded bg-[#18181B] border border-[#27272A] hover:border-[#3ECF8E] text-[#A1A1AA] hover:text-white transition-all"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="p-1.5 rounded bg-[#18181B] border border-[#27272A] hover:border-[#3ECF8E] text-[#A1A1AA] hover:text-white transition-all"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                className="p-1.5 rounded bg-[#18181B] border border-[#27272A] hover:border-[#3ECF8E] text-[#A1A1AA] hover:text-white transition-all"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="p-1.5 rounded bg-[#18181B] border border-[#27272A] hover:border-[#3ECF8E] text-[#A1A1AA] hover:text-white transition-all"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#71717A]">
          <div>
            © 2026 VizTR Architectural CGI & Spatial XR Engines.
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/privacy-policy" className="hover:text-[#FAFAFA] transition-colors">
              Privacy
            </Link>
            <Link href="/terms-conditions" className="hover:text-[#FAFAFA] transition-colors">
              Terms
            </Link>
            <Link href="/client-access" className="hover:text-[#3ECF8E] transition-colors font-medium">
              Client Access
            </Link>
            <Link href="/admin/dashboard" className="hover:text-[#FAFAFA] transition-colors">
              Admin CMS
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
