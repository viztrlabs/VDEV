'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { Mail, Phone, MapPin, Send, CheckCircle2, Instagram, Linkedin, Twitter, Youtube, ArrowRight, Palette } from 'lucide-react';
import { useTheme } from '@/lib/theme-provider';
import { ViztrFooterLogo } from '@/components/ui/Logo';

export default function Footer() {
  const { showToast } = useAppStore();
  const { resolvedTheme, cycleLightDarkSystem } = useTheme();
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
    <footer id="main-footer" className="bg-[#0A0A0B] text-[#A1A1AA] border-t border-[#1E293B] pt-12 pb-10 backdrop-blur-xl transition-colors relative">
      <div className="w-full container-ultrawide">
        {/* TELEMETRY TOP BAR - Glass Panel with maximum pill shape */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 rounded-full glass-panel text-xs font-mono mb-8 border border-[#1E293B]">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse shadow-[0_0_8px_#00F0FF]"></span>
              <span className="text-[#FAFAFA] font-bold">SYSTEMS OPERATIONAL</span>
            </div>
            <span className="text-white/20">|</span>
            <span className="text-[#a1abc4]">LATENCY: 12ms (US-EAST-1)</span>
            <span className="text-white/20">|</span>
            <span className="text-[#a1abc4]">UE5.4 LUMEN ENGINE: ONLINE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full glass text-[#00F0FF] text-[10px] font-bold border border-[#1E293B]">
              VIZTR COMPUTE v2.4.8
            </span>
          </div>
        </div>

        {/* 4 COLUMNS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 py-10 border-b border-[#1E293B]">
          
          {/* COLUMN 1: Brand & Bio */}
          <div className="space-y-3">
            <Link href="/" className="inline-block group" aria-label="VizTR Home">
              <ViztrFooterLogo className="w-48 sm:w-56 h-auto transition-transform group-hover:scale-[1.02]" />
            </Link>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              High-density architectural rendering, real-time WebXR spatial computing, and scalable cloud Unreal Engine 5 pixel streaming.
            </p>

            {/* Newsletter Inline Form */}
            <div className="pt-2">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#a1abc4] mb-2 font-mono">
                ENGINEERING JOURNAL
              </div>
              {subscribed ? (
                <div className="flex items-center gap-2 text-xs text-[#00F0FF] glass px-3 py-2 rounded-full border border-[#1E293B]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
                  <span>Subscribed to engineering briefs.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    id="newsletter-email"
                    placeholder="architect@firm.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="glass-input text-xs text-[#FAFAFA] placeholder-[#a1abc4] px-4 py-2.5 rounded-full focus:outline-none flex-1 font-mono border border-[#1E293B]"
                  />
                  <button
                    type="submit"
                    id="newsletter-submit-btn"
                    className="bg-[#00F0FF] hover:bg-[#33f3ff] text-black px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow-[0_0_16px_rgba(0,240,255,0.3)] hover:scale-105"
                    aria-label="Subscribe"
                  >
                    <Send className="w-3.5 h-3.5" />
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
                  className="text-[#A1A1AA] hover:text-[#00F0FF] transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#00F0FF]" />
                  Exterior Visualization (8K)
                </Link>
              </li>
              <li>
                <Link
                  href="/studio/interior"
                  className="text-[#A1A1AA] hover:text-[#00F0FF] transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#00F0FF]" />
                  Interior Architectural Staging
                </Link>
              </li>
              <li>
                <Link
                  href="/studio/walkthrough"
                  className="text-[#A1A1AA] hover:text-[#00F0FF] transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#00F0FF]" />
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
                  className="text-[#42CF8B] hover:text-emerald-300 transition-colors font-medium inline-flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#42CF8B] animate-pulse" />
                  Pixel Streaming (Cloud GPU)
                </Link>
              </li>
              <li>
                <Link
                  href="/xr-world/webxr"
                  className="text-[#A1A1AA] hover:text-[#00F0FF] transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#00F0FF]" />
                  WebXR In-Browser Spatial
                </Link>
              </li>
              <li>
                <Link
                  href="/xr-world/webar"
                  className="text-[#A1A1AA] hover:text-[#00F0FF] transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#00F0FF]" />
                  WebAR Surface Projection
                </Link>
              </li>
              <li>
                <Link
                  href="/xr-world/virtual-reality"
                  className="text-[#A1A1AA] hover:text-[#00F0FF] transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#00F0FF]" />
                  Virtual Reality (Quest & Vision Pro)
                </Link>
              </li>
              <li>
                <Link
                  href="/xr-world/virtual-tour"
                  className="text-[#A1A1AA] hover:text-[#00F0FF] transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#00F0FF]" />
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
            <ul className="space-y-1.5 text-xs text-[#A1A1AA] pb-2 border-b border-[#1E293B]">
              <li>
                <Link href="/about" className="hover:text-[#00F0FF] transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-[#00F0FF]" />
                  About VizTR Studio
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[#00F0FF] transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-[#00F0FF]" />
                  Perspectives & Research Blog
                </Link>
              </li>
              <li>
                <Link href="/book-consultation" className="hover:text-[#00F0FF] transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-[#00F0FF]" />
                  Book Project Consultation
                </Link>
              </li>
            </ul>
            <div className="space-y-2 text-xs text-[#A1A1AA]">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
                <a href="mailto:hello@viztr.com" className="hover:text-white transition-colors">
                  hello@viztr.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
                <a href="tel:+15551234567" className="hover:text-white transition-colors">
                  +1 (555) 123-4567
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#42CF8B] shrink-0 mt-0.5" />
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
                className="p-2 rounded-full bg-[#131314] border border-[#1E293B] hover:border-[#00F0FF] text-[#A1A1AA] hover:text-[#00F0FF] transition-all"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="p-2 rounded-full bg-[#131314] border border-[#1E293B] hover:border-[#00F0FF] text-[#A1A1AA] hover:text-[#00F0FF] transition-all"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                className="p-2 rounded-full bg-[#131314] border border-[#1E293B] hover:border-[#00F0FF] text-[#A1A1AA] hover:text-[#00F0FF] transition-all"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="p-2 rounded-full bg-[#131314] border border-[#1E293B] hover:border-[#00F0FF] text-[#A1A1AA] hover:text-[#00F0FF] transition-all"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#849495]">
          <div className="flex items-center gap-3">
            <span>© 2026 VizTR Architectural CGI & Spatial XR Engines.</span>
            <button
              type="button"
              onClick={cycleLightDarkSystem}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-[#1E293B] text-zinc-300 hover:text-white transition-colors cursor-pointer text-[10px] font-mono"
              title="Toggle Light / Dark theme"
            >
              <Palette className="w-3 h-3 text-[#00F0FF]" />
              <span>Theme: <strong className="text-[#00F0FF] capitalize">{resolvedTheme}</strong></span>
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/privacy-policy" className="hover:text-[#FAFAFA] transition-colors">
              Privacy
            </Link>
            <Link href="/terms-conditions" className="hover:text-[#FAFAFA] transition-colors">
              Terms
            </Link>
            <Link href="/client-access" className="hover:text-[#00F0FF] transition-colors font-medium">
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
