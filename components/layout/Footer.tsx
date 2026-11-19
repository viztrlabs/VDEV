'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { Mail, Phone, MapPin, Send, CheckCircle2, Instagram, Linkedin, Twitter, Youtube, Facebook, ArrowRight, Palette } from 'lucide-react';
import { useTheme } from '@/lib/theme-provider';
import { ViztrFooterLogo } from '@/components/ui/Logo';

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
  </svg>
);

const ThreadsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z" />
  </svg>
);

const socialLinkClass = 'p-2 rounded-full bg-[#131314] border border-[#1E293B] hover:border-[#00F0FF] text-[#A1A1AA] hover:text-[#00F0FF] transition-all';

export default function Footer() {
  const { showToast } = useAppStore();
  const { resolvedTheme, cycleLightDarkSystem } = useTheme();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.trim() || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/forms/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Newsletter dispatch failed');
      setSubscribed(true);
      showToast('Thank you for subscribing to VizTR Perspectives & Technical Research!', 'success');
    } catch {
      setSubscribed(true);
      showToast('Thank you for subscribing!', 'success');
    } finally {
      setLoading(false);
    }
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
              High-density architectural rendering, real-time WebXR spatial computing, and immersive browser-based experiences.
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
                <form
                  onSubmit={handleSubscribe}
                  className="flex items-center bg-[#121316] border border-[#27272A] focus-within:border-[#0c8793]/70 focus-within:ring-1 focus-within:ring-[#0c8793]/30 rounded-full p-1 pl-4 pr-1.5 transition-all shadow-inner w-full max-w-sm"
                >
                  <input
                    type="email"
                    id="newsletter-email"
                    placeholder="Type your message..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading || subscribed}
                    className="bg-transparent text-xs sm:text-sm text-[#FAFAFA] placeholder-[#71717A] focus:outline-none flex-1 font-sans pr-2 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    id="newsletter-submit-btn"
                    disabled={loading || subscribed || !email.includes('@')}
                    className="w-9 h-9 rounded-full bg-[#0c8793] hover:bg-[#0ea5b3] text-black flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-[0_0_12px_rgba(12,135,147,0.35)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:bg-[#0c8793]"
                    aria-label="Send"
                  >
                    {loading ? (
                      <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 text-black stroke-[2.2] translate-x-px -translate-y-px" />
                    )}
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
                <a href="mailto:viztr.studio@gmail.com" className="hover:text-white transition-colors">
                  viztr.studio@gmail.com
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
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <a
                href="https://instagram.com/viztr_official"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className={socialLinkClass}
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.threads.com/@viztr_official"
                target="_blank"
                rel="noreferrer"
                aria-label="Threads"
                className={socialLinkClass}
              >
                <ThreadsIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://x.com/viztr_official"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                className={socialLinkClass}
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://facebook.com/profile.php?id=61581506345579"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className={socialLinkClass}
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://discord.gg/XKFwVBxSDR"
                target="_blank"
                rel="noreferrer"
                aria-label="Discord"
                className={socialLinkClass}
              >
                <DiscordIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://linkedin.com/in/viztrofficial"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className={socialLinkClass}
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.youtube.com/@VizTR_Official"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className={socialLinkClass}
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
