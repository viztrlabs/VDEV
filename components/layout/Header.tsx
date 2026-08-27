'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/lib/theme-provider';
import { useAppStore } from '@/lib/store';
import {
  Sun,
  Moon,
  Monitor,
  User,
  ChevronDown,
  Menu,
  X,
  Layers,
  Sparkles,
  Search,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import NotificationCenter from '@/components/ui/NotificationCenter';
import ThemeSwitcherDropdown from '@/components/ui/ThemeSwitcherDropdown';
import ThemePreviewModal from '@/components/ui/ThemePreviewModal';

export default function Header() {
  const pathname = usePathname();
  const { theme, cycleTheme } = useTheme();
  const { user } = useAppStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const [xrOpen, setXrOpen] = useState(false);
  const [mobileStudioOpen, setMobileStudioOpen] = useState(false);
  const [mobileXrOpen, setMobileXrOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const studioTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const xrTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  const handleStudioEnter = () => {
    if (studioTimeoutRef.current) clearTimeout(studioTimeoutRef.current);
    setStudioOpen(true);
  };
  const handleStudioLeave = () => {
    studioTimeoutRef.current = setTimeout(() => setStudioOpen(false), 150);
  };

  const handleXrEnter = () => {
    if (xrTimeoutRef.current) clearTimeout(xrTimeoutRef.current);
    setXrOpen(true);
  };
  const handleXrLeave = () => {
    xrTimeoutRef.current = setTimeout(() => setXrOpen(false), 150);
  };

  const isStudioActive = pathname.startsWith('/studio');
  const isXrActive = pathname.startsWith('/xr-world');
  const isContactActive = pathname === '/contact';
  const isHomeActive = pathname === '/';

  // Header visibility & glassmorphism theme logic
  const isHiddenOnLanding = isHomeActive && !scrolled;

  return (
    <>
      <header
        id="main-header"
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ease-out ${
          isHiddenOnLanding
            ? 'opacity-0 -translate-y-full pointer-events-none'
            : isHomeActive
            ? 'opacity-100 translate-y-0 pointer-events-auto bg-[#09090B]/75 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/80'
            : 'opacity-100 translate-y-0 pointer-events-auto bg-[#09090B]/85 backdrop-blur-xl border-b border-[#27272A] shadow-md'
        }`}
        style={{ height: '56px' }}
      >
      <div className="max-w-[1400px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        {/* LEFT SECTION: Logo & Live Status */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/"
            id="header-logo-link"
            className="flex items-center gap-2.5 group"
          >
            <div className="w-7 h-7 bg-[#3ECF8E] rounded flex items-center justify-center text-black font-extrabold text-sm shadow-sm group-hover:scale-105 transition-transform">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-[#FAFAFA]">
                VizTR
              </span>
              <span className="hidden sm:inline-flex px-1.5 py-0.5 bg-[#18181B] text-[#3ECF8E] text-[10px] font-mono font-bold rounded border border-[#27272A]">
                STUDIO v2.4
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-[#27272A]">
            <div className="w-2 h-2 rounded-full bg-[#3ECF8E] animate-pulse"></div>
            <span className="text-[11px] text-[#A1A1AA] font-mono uppercase tracking-wider">GPU Cluster: Active (12ms)</span>
          </div>
        </div>

        {/* CENTER SECTION: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {/* Home Link */}
          <Link
            href="/"
            id="nav-link-home"
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors rounded-md ${
              isHomeActive
                ? 'bg-[#18181B] text-[#3ECF8E] border border-[#27272A]'
                : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B]/60'
            }`}
          >
            Home
          </Link>

          {/* Studio Dropdown */}
          <div
            className="relative"
            onMouseEnter={handleStudioEnter}
            onMouseLeave={handleStudioLeave}
          >
            <button
              id="nav-dropdown-studio"
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors rounded-md cursor-pointer ${
                isStudioActive
                  ? 'bg-[#18181B] text-[#3ECF8E] border border-[#27272A]'
                  : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B]/60'
              }`}
              onClick={() => setStudioOpen(!studioOpen)}
              aria-expanded={studioOpen}
            >
              <span>Studio</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  studioOpen ? 'rotate-180 text-[#3ECF8E]' : 'text-[#71717A]'
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {studioOpen && (
              <div
                id="studio-dropdown-menu"
                className="absolute top-full left-0 mt-1 w-64 rounded-xl bg-[#18181B] border border-[#27272A] shadow-2xl py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#71717A]">
                  Studio Pipelines
                </div>
                <Link
                  href="/studio/exterior"
                  id="dropdown-item-exterior"
                  className="block px-3 py-2 text-xs text-[#FAFAFA] hover:bg-[#27272A] transition-colors rounded mx-1"
                >
                  <div className="font-semibold text-white flex items-center justify-between">
                    <span>Exterior Visualization</span>
                    <span className="text-[9px] font-mono text-[#3ECF8E] bg-[#09090B] px-1 rounded">8K</span>
                  </div>
                  <div className="text-[11px] text-[#A1A1AA] font-normal mt-0.5">
                    Photorealistic daylight & twilight CGI
                  </div>
                </Link>
                <Link
                  href="/studio/interior"
                  id="dropdown-item-interior"
                  className="block px-3 py-2 text-xs text-[#FAFAFA] hover:bg-[#27272A] transition-colors rounded mx-1"
                >
                  <div className="font-semibold text-white">Interior Visualization</div>
                  <div className="text-[11px] text-[#A1A1AA] font-normal mt-0.5">
                    Bespoke luxury staging & finishes
                  </div>
                </Link>
                <Link
                  href="/studio/walkthrough"
                  id="dropdown-item-walkthrough"
                  className="block px-3 py-2 text-xs text-[#FAFAFA] hover:bg-[#27272A] transition-colors rounded mx-1"
                >
                  <div className="font-semibold text-white">Walkthrough Animation</div>
                  <div className="text-[11px] text-[#A1A1AA] font-normal mt-0.5">
                    Cinematic 4K 60FPS architectural films
                  </div>
                </Link>
                <div className="border-t border-[#27272A] my-1.5" />
                <Link
                  href="/studio"
                  className="block px-3 py-1 text-[11px] font-semibold text-[#3ECF8E] hover:underline"
                >
                  View All Studio Services →
                </Link>
              </div>
            )}
          </div>

          {/* XR World Dropdown */}
          <div
            className="relative"
            onMouseEnter={handleXrEnter}
            onMouseLeave={handleXrLeave}
          >
            <button
              id="nav-dropdown-xr"
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors rounded-md cursor-pointer ${
                isXrActive
                  ? 'bg-[#18181B] text-[#3ECF8E] border border-[#27272A]'
                  : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B]/60'
              }`}
              onClick={() => setXrOpen(!xrOpen)}
              aria-expanded={xrOpen}
            >
              <span>XR World</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  xrOpen ? 'rotate-180 text-[#3ECF8E]' : 'text-[#71717A]'
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {xrOpen && (
              <div
                id="xr-dropdown-menu"
                className="absolute top-full left-0 mt-1 w-72 rounded-xl bg-[#18181B] border border-[#27272A] shadow-2xl py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#71717A]">
                  Spatial Computing Stack
                </div>
                <Link
                  href="/xr-world/pixel-streaming"
                  id="dropdown-item-pixel-streaming"
                  className="block px-3 py-2 text-xs bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 text-[#FAFAFA] hover:bg-[#3ECF8E]/20 transition-colors rounded mx-1 my-1"
                >
                  <div className="font-bold flex items-center justify-between text-white">
                    <span>Pixel Streaming</span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#3ECF8E] text-black font-mono">
                      FLAGSHIP
                    </span>
                  </div>
                  <div className="text-[11px] text-[#A1A1AA] font-normal mt-0.5">
                    Unreal Engine 5.4 Lumen cloud GPU stream
                  </div>
                </Link>
                <Link
                  href="/xr-world/webxr"
                  id="dropdown-item-webxr"
                  className="block px-3 py-2 text-xs text-[#FAFAFA] hover:bg-[#27272A] transition-colors rounded mx-1"
                >
                  <div className="font-semibold text-white flex items-center justify-between">
                    <span>WebXR</span>
                    <span className="text-[9px] uppercase font-mono px-1 rounded bg-[#09090B] text-[#3ECF8E]">
                      Zero Install
                    </span>
                  </div>
                  <div className="text-[11px] text-[#A1A1AA] font-normal mt-0.5">
                    Interactive 3D geometry & PBR material swap
                  </div>
                </Link>
                <Link
                  href="/xr-world/webar"
                  id="dropdown-item-webar"
                  className="block px-3 py-2 text-xs text-[#FAFAFA] hover:bg-[#27272A] transition-colors rounded mx-1"
                >
                  <div className="font-semibold text-white">WebAR</div>
                  <div className="text-[11px] text-[#A1A1AA] font-normal mt-0.5">
                    Tabletop & 1:1 real-world projection
                  </div>
                </Link>
                <Link
                  href="/xr-world/virtual-reality"
                  id="dropdown-item-vr"
                  className="block px-3 py-2 text-xs text-[#FAFAFA] hover:bg-[#27272A] transition-colors rounded mx-1"
                >
                  <div className="font-semibold text-white">Virtual Reality</div>
                  <div className="text-[11px] text-[#A1A1AA] font-normal mt-0.5">
                    Meta Quest & Apple Vision Pro immersion
                  </div>
                </Link>
                <Link
                  href="/xr-world/virtual-tour"
                  id="dropdown-item-tour"
                  className="block px-3 py-2 text-xs text-[#FAFAFA] hover:bg-[#27272A] transition-colors rounded mx-1"
                >
                  <div className="font-semibold text-white">Virtual Tour</div>
                  <div className="text-[11px] text-[#A1A1AA] font-normal mt-0.5">
                    16K 360° panoramic hotspot tours
                  </div>
                </Link>
                <div className="border-t border-[#27272A] my-1.5" />
                <Link
                  href="/xr-world"
                  className="block px-3 py-1 text-[11px] font-semibold text-[#3ECF8E] hover:underline"
                >
                  Explore XR World Hub →
                </Link>
              </div>
            )}
          </div>

          {/* Portfolio Link */}
          <Link
            href="/portfolio"
            id="nav-link-portfolio"
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors rounded-md ${
              pathname.startsWith('/portfolio')
                ? 'bg-[#18181B] text-[#3ECF8E] border border-[#27272A]'
                : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B]/60'
            }`}
          >
            Portfolio
          </Link>

          {/* Contact Link */}
          <Link
            href="/contact"
            id="nav-link-contact"
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors rounded-md ${
              isContactActive
                ? 'bg-[#18181B] text-[#3ECF8E] border border-[#27272A]'
                : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B]/60'
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* RIGHT SECTION: Actions (User, Theme, Track, Notification) */}
        <div className="flex items-center space-x-2">
          {/* 1. Client Access / User Profile Icon */}
          <Link
            href={user ? '/client-dashboard' : '/client-access'}
            id="header-client-access-btn"
            suppressHydrationWarning
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-md text-[#A1A1AA] hover:text-white bg-[#18181B] border border-[#27272A] hover:bg-[#27272A] transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title={user ? `Logged in as ${user.name} (${user.role})` : 'Client Access Login'}
          >
            {user ? (
              <>
                <div className="w-5 h-5 rounded bg-[#3ECF8E] text-black font-bold text-xs flex items-center justify-center shrink-0">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden sm:inline text-white font-medium max-w-[100px] truncate">
                  {user.name.split(' ')[0]}
                </span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-[#3ECF8E]" />
                <span className="hidden sm:inline text-zinc-300">Account</span>
              </>
            )}
          </Link>

          {/* 2. Theme Switcher Dropdown & Live Previews */}
          <ThemeSwitcherDropdown />

          {/* 3. Quick Track Link */}
          <Link
            href="/track-project"
            id="header-track-btn"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-[#18181B] hover:bg-[#27272A] text-[#FAFAFA] transition-colors border border-[#27272A]"
            title="Track project by ID & Access Code"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#3ECF8E]" />
            <span className="hidden sm:inline">Track</span>
          </Link>

          {/* 4. Real-time Project Notifications Center */}
          <NotificationCenter />

          {/* Mobile Hamburger Toggle Button */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-md text-[#A1A1AA] hover:text-white bg-[#18181B] border border-[#27272A]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* MOBILE FULL-SCREEN OVERLAY MENU */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-overlay"
          className="fixed inset-0 top-[64px] bg-white dark:bg-[#09090b] z-50 overflow-y-auto px-6 py-6 border-t border-zinc-200 dark:border-zinc-800 md:hidden flex flex-col justify-between"
        >
          <div className="space-y-4">
            {/* Home Link */}
            <Link
              href="/"
              className="block py-2.5 text-lg font-medium text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-900"
            >
              Home
            </Link>

            {/* Studio Mobile Accordion */}
            <div>
              <button
                onClick={() => setMobileStudioOpen(!mobileStudioOpen)}
                className="w-full flex items-center justify-between py-2.5 text-lg font-medium text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-900"
              >
                <span>Studio</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    mobileStudioOpen ? 'rotate-180 text-rose-500' : ''
                  }`}
                />
              </button>
              {mobileStudioOpen && (
                <div className="pl-4 py-2 space-y-2.5 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg mt-2">
                  <Link
                    href="/studio/exterior"
                    className="block py-1.5 text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    Exterior Visualization
                  </Link>
                  <Link
                    href="/studio/interior"
                    className="block py-1.5 text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    Interior Visualization
                  </Link>
                  <Link
                    href="/studio/walkthrough"
                    className="block py-1.5 text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    Walkthrough Animation
                  </Link>
                  <Link
                    href="/studio"
                    className="block py-1 text-xs font-semibold text-rose-600 dark:text-rose-400"
                  >
                    Studio Overview →
                  </Link>
                </div>
              )}
            </div>

            {/* XR World Mobile Accordion */}
            <div>
              <button
                onClick={() => setMobileXrOpen(!mobileXrOpen)}
                className="w-full flex items-center justify-between py-2.5 text-lg font-medium text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-900"
              >
                <span>XR World</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    mobileXrOpen ? 'rotate-180 text-rose-500' : ''
                  }`}
                />
              </button>
              {mobileXrOpen && (
                <div className="pl-4 py-2 space-y-2.5 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg mt-2">
                  <Link
                    href="/xr-world/webxr"
                    className="block py-1.5 text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    WebXR (Zero Install)
                  </Link>
                  <Link
                    href="/xr-world/webar"
                    className="block py-1.5 text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    WebAR (Augmented Reality)
                  </Link>
                  <Link
                    href="/xr-world/virtual-reality"
                    className="block py-1.5 text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    Virtual Reality (VR)
                  </Link>
                  <Link
                    href="/xr-world/virtual-tour"
                    className="block py-1.5 text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    Virtual Tour (360°)
                  </Link>
                  <Link
                    href="/xr-world/pixel-streaming"
                    className="block py-1.5 text-sm font-semibold text-rose-600 dark:text-rose-400"
                  >
                    Pixel Streaming (Flagship)
                  </Link>
                  <Link
                    href="/xr-world"
                    className="block py-1 text-xs font-semibold text-rose-600 dark:text-rose-400"
                  >
                    XR World Overview →
                  </Link>
                </div>
              )}
            </div>

            {/* Portfolio Link */}
            <Link
              href="/portfolio"
              className="block py-2.5 text-lg font-medium text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-900"
            >
              Portfolio
            </Link>

            {/* About Link */}
            <Link
              href="/about"
              className="block py-2.5 text-lg font-medium text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-900"
            >
              About Studio
            </Link>

            {/* Blog Link */}
            <Link
              href="/blog"
              className="block py-2.5 text-lg font-medium text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-900"
            >
              Journal & Insights
            </Link>

            {/* Contact Link */}
            <Link
              href="/contact"
              className="block py-2.5 text-lg font-medium text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-900"
            >
              Contact
            </Link>

            {/* Track Project Mobile */}
            <Link
              href="/track-project"
              className="block py-2.5 text-lg font-medium text-rose-600 dark:text-rose-400"
            >
              Track Your Project →
            </Link>
          </div>

          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            <Link
              href="/client-access"
              className="w-full py-3 text-center block rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium shadow"
            >
              Client Portal Access
            </Link>
            <div className="text-center text-xs text-zinc-500">
              © 2026 VizTR Studio. All rights reserved.
            </div>
          </div>
        </div>
      )}
    </header>
    {!isHomeActive && <div className="h-[56px] w-full shrink-0 pointer-events-none" aria-hidden="true" />}
    </>
  );
}
