'use client';

import React, { useState, useEffect } from 'react';
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
  Box,
  Sparkles,
  Send
} from 'lucide-react';
import { ViztrLogoMark } from '@/components/ui/Logo';

export default function Header() {
  const pathname = usePathname();
  const { theme, resolvedTheme, setTheme, cycleLightDarkSystem } = useTheme();
  const { user } = useAppStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const [xrOpen, setXrOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [stillRendersSubOpen, setStillRendersSubOpen] = useState(true);
  const [mobileStudioOpen, setMobileStudioOpen] = useState(false);
  const [mobileStillRendersOpen, setMobileStillRendersOpen] = useState(true);
  const [mobileXrOpen, setMobileXrOpen] = useState(false);
  const [mobileContactOpen, setMobileContactOpen] = useState(false);

  // Timeout refs removed – dropdowns now stay open until a selection or another menu is activated.

  // Close dropdowns on outside clicks
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest('#nav-dropdown-studio') && !target?.closest('#studio-dropdown-menu')) {
        setStudioOpen(false);
      }
      if (!target?.closest('#nav-dropdown-xr') && !target?.closest('#xr-dropdown-menu')) {
        setXrOpen(false);
      }
      if (!target?.closest('#nav-dropdown-contact') && !target?.closest('#contact-dropdown-menu')) {
        setContactOpen(false);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, []);

  // Sticky header: visible at top, slides up on scroll down, slides down on scroll up or mouse at top
  const [isNavVisible, setIsNavVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const diff = currentScrollY - lastScrollY;

          // Always visible near top of page (within 64px)
          if (currentScrollY <= 64) {
            setIsNavVisible(true);
          } else if (diff > 6 && currentScrollY > 64) {
            // Scrolling down -> slide completely up out of view
            setIsNavVisible(false);
            setStudioOpen(false);
            setXrOpen(false);
            setContactOpen(false);
          } else if (diff < -6) {
            // Scrolling up -> slide smoothly down into view
            setIsNavVisible(true);
          }

          lastScrollY = Math.max(0, currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Reveal header if mouse enters top 64px of viewport
      if (e.clientY <= 64) {
        setIsNavVisible(true);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
    setStudioOpen(false);
    setXrOpen(false);
    setContactOpen(false);
  }

  // Close any open dropdowns when mobile menu is closed
  useEffect(() => {
    if (!mobileMenuOpen) {
      setStudioOpen(false);
      setXrOpen(false);
      setContactOpen(false);
      setMobileStudioOpen(false);
      setMobileXrOpen(false);
      setMobileContactOpen(false);
    }
  }, [mobileMenuOpen]);

  const handleStudioEnter = () => {
    setStudioOpen(true);
    setXrOpen(false);
    setContactOpen(false);
  }; // No automatic close on mouse leave

  const handleXrEnter = () => {
    setXrOpen(true);
    setStudioOpen(false);
    setContactOpen(false);
  }; // No automatic close on mouse leave

  const handleContactEnter = () => {
    setContactOpen(true);
    setStudioOpen(false);
    setXrOpen(false);
  }; // No automatic close on mouse leave

  const isHomeActive = pathname === '/';
  const isAnyMenuOpen = studioOpen || xrOpen || contactOpen || mobileMenuOpen;
  const shouldShowNav = isNavVisible || isAnyMenuOpen;

  return (
    <>
      <header
        id="main-header"
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ease-in-out ${
          shouldShowNav
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-full pointer-events-none'
        }`}
        style={{ height: '64px' }}
      >
        <div className="w-full h-full px-4 sm:px-6 lg:px-10 xl:px-14 flex flex-row items-center justify-between pointer-events-auto">
          {/* LEFT SECTION: Authentic VizTR Logo Mark */}
          <Link
            href="/"
            id="header-logo-link"
            className="flex items-center gap-2.5 group shrink-0 cursor-pointer flex-shrink-0"
          >
            <div className="header-logo-glass w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-105 transition-all shrink-0 p-1 shadow-[0_0_12px_rgba(0,240,255,0.25)]">
              <ViztrLogoMark className="w-5 h-5" variant="cyan" />
            </div>
            <div className="flex items-center font-display text-xl font-bold tracking-tight">
              <span className="text-white">Viz</span>
              <span className="text-[#00F0FF]">TR</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] -mt-2.5 ml-0.5 shadow-[0_0_8px_#00F0FF]" />
            </div>
          </Link>

          {/* CENTER SECTION: Single Unified Button Cluster: STUDIO, XR WORLD, CONTACT */}
          <nav
            id="header-mid-menu"
            className="header-mid-menu-nav header-mid-menu-cluster hidden md:flex flex-row items-center p-1 rounded-full transition-opacity duration-300 ease-in-out"
            aria-label="Main Navigation"
          >
            {/* 1. STUDIO PILL BUTTON */}
            <div
              className="relative"
              onMouseEnter={handleStudioEnter}
            >
              <button
                id="nav-dropdown-studio"
                className={`header-cluster-btn flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-all duration-300 font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider cursor-pointer select-none border ${
                  studioOpen
                    ? 'active bg-[#00F0FF]/20 border-[#00F0FF]/60 text-white shadow-[0_0_12px_rgba(0,240,255,0.3)] scale-[1.02]'
                    : 'border-transparent text-[#dce5ff] hover:text-[#00F0FF] hover:bg-white/5 opacity-75 hover:opacity-100'
                }`}
                onClick={() => { setStudioOpen(!studioOpen); setXrOpen(false); setContactOpen(false); }}
                aria-expanded={studioOpen}
              >
                <Box className={`w-3.5 h-3.5 transition-colors ${studioOpen ? 'text-[#00F0FF]' : 'opacity-60'}`} />
                <span className={studioOpen ? 'text-[#00F0FF]' : ''}>Studio</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-300 ${
                    studioOpen ? 'rotate-180 text-[#00F0FF]' : 'opacity-50'
                  }`}
                />
              </button>

              {/* STUDIO DROPDOWN (Hierarchy: Still Renders -> Exterior/Interior, Animation & Walkthrough) */}
              {studioOpen && (
                <div
                  id="studio-dropdown-menu"
                  className="header-mid-dropdown absolute top-full left-1/2 -translate-x-1/2 mt-2.5 w-64 rounded-2xl py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-150 before:content-[''] before:absolute before:-top-3.5 before:left-0 before:right-0 before:h-3.5"
                  // Keep dropdown open; closing handled by outside clicks or selection
                >
                  <div className="dropdown-label px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#a1abc4]">
                    Studio Pipelines
                  </div>

                  {/* Still Renders (Parent / Submenu) */}
                  <div className="mx-1 my-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setStillRendersSubOpen(!stillRendersSubOpen);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg text-[#dce5ff] hover:bg-white/10 transition-colors cursor-pointer group"
                      aria-expanded={stillRendersSubOpen}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                        <span className="item-title font-semibold text-white">Still Renders</span>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-cyan-400 transition-transform duration-200 ${
                          stillRendersSubOpen ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>

                    {/* Nested Items: Exterior & Interior */}
                    {stillRendersSubOpen && (
                      <div className="ml-3 pl-3 my-1 space-y-1 border-l-2 border-cyan-400/40 animate-in fade-in slide-in-from-top-1 duration-150">
                        <Link
                          href="/studio/exterior"
                          id="dropdown-item-exterior"
                          onClick={() => setStudioOpen(false)}
                          className="item-link block px-2.5 py-1.5 text-xs text-[#dce5ff] hover:bg-white/10 transition-colors rounded-md"
                        >
                          <div className="item-title font-semibold text-white flex items-center justify-between">
                            <span>Exterior</span>
                            <span className="text-[9px] font-mono text-cyan-400 bg-black/50 px-1.5 py-0.5 rounded">8K</span>
                          </div>
                          <div className="item-subtitle text-[11px] text-[#a1abc4] font-normal mt-0.5">
                            Photorealistic daylight & twilight CGI
                          </div>
                        </Link>

                        <Link
                          href="/studio/interior"
                          id="dropdown-item-interior"
                          onClick={() => setStudioOpen(false)}
                          className="item-link block px-2.5 py-1.5 text-xs text-[#dce5ff] hover:bg-white/10 transition-colors rounded-md"
                        >
                          <div className="item-title font-semibold text-white flex items-center justify-between">
                            <span>Interior</span>
                          </div>
                          <div className="item-subtitle text-[11px] text-[#a1abc4] font-normal mt-0.5">
                            Luxury staging & finishes
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Sibling: Animation & Walkthrough */}
                  <div className="mx-1 my-0.5">
                    <Link
                      href="/studio/walkthrough"
                      id="dropdown-item-walkthrough"
                      onClick={() => setStudioOpen(false)}
                      className="item-link block px-3 py-2 text-xs text-[#dce5ff] hover:bg-white/10 transition-colors rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                        <span className="item-title font-semibold text-white">Animation & Walkthrough</span>
                      </div>
                      <div className="item-subtitle text-[11px] text-[#a1abc4] font-normal mt-0.5 ml-3.5">
                        Cinematic 4K 60FPS architectural films
                      </div>
                    </Link>
                  </div>

                  <div className="border-t border-[#3e485e]/50 my-1.5" />
                  <Link
                    href="/studio"
                    onClick={() => setStudioOpen(false)}
                    className="block px-3.5 py-1 text-[11px] font-semibold text-cyan-400 hover:underline"
                  >
                    View All Studio Services →
                  </Link>
                </div>
              )}
            </div>

            {/* SUBTLE VERTICAL DIVIDER */}
            <div className="header-cluster-divider w-[1px] h-4 bg-[#3e485e]/50 mx-0.5 shrink-0" />

            {/* 2. XR WORLD PILL BUTTON */}
            <div
              className="relative"
              onMouseEnter={handleXrEnter}
            >
              <button
                id="nav-dropdown-xr"
                className={`header-cluster-btn flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-all duration-300 font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider cursor-pointer select-none border ${
                  xrOpen
                    ? 'active bg-[#00F0FF]/20 border-[#00F0FF]/60 text-white shadow-[0_0_12px_rgba(0,240,255,0.3)] scale-[1.02]'
                    : 'border-transparent text-[#dce5ff] hover:text-[#00F0FF] hover:bg-white/5 opacity-75 hover:opacity-100'
                }`}
                onClick={() => { setXrOpen(!xrOpen); setStudioOpen(false); setContactOpen(false); }}
                aria-expanded={xrOpen}
              >
                <Sparkles className={`w-3.5 h-3.5 transition-colors ${xrOpen ? 'text-[#00F0FF]' : 'opacity-60'}`} />
                <span className={xrOpen ? 'text-[#00F0FF]' : ''}>XR World</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-300 ${
                    xrOpen ? 'rotate-180 text-[#00F0FF]' : 'opacity-50'
                  }`}
                />
              </button>

              {/* XR WORLD DROPDOWN (Flat list: WebXR, WebAR, VR – Virtual Reality, Virtual Tour, VizSplat, Pixel Streaming) */}
              {xrOpen && (
                <div
                  id="xr-dropdown-menu"
                  className="header-mid-dropdown absolute top-full left-1/2 -translate-x-1/2 mt-2.5 w-72 rounded-2xl py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-150 before:content-[''] before:absolute before:-top-3.5 before:left-0 before:right-0 before:h-3.5"
                  // Keep dropdown open; closing handled by outside clicks or selection
                >
                  <div className="dropdown-label px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#a1abc4]">
                    Spatial Computing Stack
                  </div>

                  {/* 1. WebXR */}
                  <Link
                    href="/xr-world/webxr"
                    id="dropdown-item-webxr"
                    onClick={() => setXrOpen(false)}
                    className="item-link block px-3 py-2 text-xs text-[#dce5ff] hover:bg-white/10 transition-colors rounded-lg mx-1"
                  >
                    <div className="item-title font-semibold text-white flex items-center justify-between">
                      <span>WebXR</span>
                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/60 text-cyan-400">
                        Zero Install
                      </span>
                    </div>
                    <div className="item-subtitle text-[11px] text-[#a1abc4] font-normal mt-0.5">
                      Interactive 3D geometry & PBR material swap
                    </div>
                  </Link>

                  {/* 2. WebAR */}
                  <Link
                    href="/xr-world/webar"
                    id="dropdown-item-webar"
                    onClick={() => setXrOpen(false)}
                    className="item-link block px-3 py-2 text-xs text-[#dce5ff] hover:bg-white/10 transition-colors rounded-lg mx-1"
                  >
                    <div className="item-title font-semibold text-white">
                      WebAR
                    </div>
                    <div className="item-subtitle text-[11px] text-[#a1abc4] font-normal mt-0.5">
                      Tabletop & 1:1 real-world projection
                    </div>
                  </Link>

                  {/* 3. VR – Virtual Reality */}
                  <Link
                    href="/xr-world/virtual-reality"
                    id="dropdown-item-vr"
                    onClick={() => setXrOpen(false)}
                    className="item-link block px-3 py-2 text-xs text-[#dce5ff] hover:bg-white/10 transition-colors rounded-lg mx-1"
                  >
                    <div className="item-title font-semibold text-white">
                      VR – Virtual Reality
                    </div>
                    <div className="item-subtitle text-[11px] text-[#a1abc4] font-normal mt-0.5">
                      Meta Quest & Apple Vision Pro immersion
                    </div>
                  </Link>

                  {/* 4. Virtual Tour */}
                  <Link
                    href="/xr-world/virtual-tour"
                    id="dropdown-item-tour"
                    onClick={() => setXrOpen(false)}
                    className="item-link block px-3 py-2 text-xs text-[#dce5ff] hover:bg-white/10 transition-colors rounded-lg mx-1"
                  >
                    <div className="item-title font-semibold text-white">
                      Virtual Tour
                    </div>
                    <div className="item-subtitle text-[11px] text-[#a1abc4] font-normal mt-0.5">
                      16K 360° panoramic hotspot tours
                    </div>
                  </Link>

                  {/* 5. VizSplat */}
                  <Link
                    href="/xr-world/vizsplat"
                    id="dropdown-item-vizsplat"
                    onClick={() => setXrOpen(false)}
                    className="item-link block px-3 py-2 text-xs text-[#dce5ff] hover:bg-white/10 transition-colors rounded-lg mx-1"
                  >
                    <div className="item-title font-semibold text-white flex items-center justify-between">
                      <span>VizSplat</span>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-500 text-white font-mono">
                        NEW
                      </span>
                    </div>
                    <div className="item-subtitle text-[11px] text-[#a1abc4] font-normal mt-0.5">
                      Gaussian Splatting 3D capture & editing
                    </div>
                  </Link>

                  {/* 6. Pixel Streaming */}
                  <Link
                    href="/xr-world/pixel-streaming"
                    id="dropdown-item-pixel-streaming"
                    onClick={() => setXrOpen(false)}
                    className="item-link block px-3 py-2 text-xs text-[#dce5ff] hover:bg-white/10 transition-colors rounded-lg mx-1"
                  >
                    <div className="item-title font-semibold text-white flex items-center justify-between">
                      <span>Pixel Streaming</span>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-cyan-400 text-black font-mono">
                        FLAGSHIP
                      </span>
                    </div>
                    <div className="item-subtitle text-[11px] text-[#a1abc4] font-normal mt-0.5">
                      Unreal Engine 5.4 Lumen cloud GPU stream
                    </div>
                  </Link>

                  <div className="border-t border-[#3e485e]/50 my-1.5" />
                  <Link
                    href="/xr-world"
                    onClick={() => setXrOpen(false)}
                    className="block px-3.5 py-1 text-[11px] font-semibold text-cyan-400 hover:underline"
                  >
                    Explore XR World Hub →
                  </Link>
                </div>
              )}
            </div>

            {/* SUBTLE VERTICAL DIVIDER */}
            <div className="header-cluster-divider w-[1px] h-4 bg-[#3e485e]/50 mx-0.5 shrink-0" />

            {/* 3. CONTACT PILL BUTTON */}
            <div
              className="relative"
              onMouseEnter={handleContactEnter}
            >
              <button
                id="nav-dropdown-contact"
                className={`header-cluster-btn flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-all duration-300 font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider cursor-pointer select-none border ${
                  contactOpen
                    ? 'active bg-[#00F0FF]/20 border-[#00F0FF]/60 text-white shadow-[0_0_12px_rgba(0,240,255,0.3)] scale-[1.02]'
                    : 'border-transparent text-[#dce5ff] hover:text-[#00F0FF] hover:bg-white/5 opacity-75 hover:opacity-100'
                }`}
                onClick={() => { setContactOpen(!contactOpen); setStudioOpen(false); setXrOpen(false); }}
                aria-expanded={contactOpen}
              >
                <Send className={`w-3.5 h-3.5 transition-colors ${contactOpen ? 'text-[#00F0FF]' : 'opacity-60'}`} />
                <span className={contactOpen ? 'text-[#00F0FF]' : ''}>Contact</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-300 ${
                    contactOpen ? 'rotate-180 text-[#00F0FF]' : 'opacity-50'
                  }`}
                />
              </button>

              {/* CONTACT DROPDOWN */}
              {contactOpen && (
                <div
                  id="contact-dropdown-menu"
                  className="header-mid-dropdown absolute top-full left-1/2 -translate-x-1/2 mt-2.5 w-64 rounded-2xl py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-150 before:content-[''] before:absolute before:-top-3.5 before:left-0 before:right-0 before:h-3.5"
                  // Keep dropdown open; closing handled by outside clicks or selection
                >
                  <div className="dropdown-label px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#a1abc4]">
                    Get in Touch
                  </div>
                  <Link
                    href="/contact"
                    id="dropdown-item-contact-main"
                    onClick={() => setContactOpen(false)}
                    className="item-link block px-3 py-2 text-xs text-[#dce5ff] hover:bg-white/10 transition-colors rounded-lg mx-1"
                  >
                    <div className="item-title font-semibold text-white">Project Inquiry</div>
                    <div className="item-subtitle text-[11px] text-[#a1abc4] font-normal mt-0.5">
                      Discuss briefs, timelines & estimates
                    </div>
                  </Link>
                  <Link
                    href="/book-consultation"
                    id="dropdown-item-consultation"
                    onClick={() => setContactOpen(false)}
                    className="item-link block px-3 py-2 text-xs text-[#dce5ff] hover:bg-white/10 transition-colors rounded-lg mx-1"
                  >
                    <div className="item-title font-semibold text-white">Book Consultation</div>
                    <div className="item-subtitle text-[11px] text-[#a1abc4] font-normal mt-0.5">
                      Live 1-on-1 virtual architectural session
                    </div>
                  </Link>
                  <Link
                    href="/track-project"
                    id="dropdown-item-track"
                    onClick={() => setContactOpen(false)}
                    className="item-link block px-3 py-2 text-xs text-[#dce5ff] hover:bg-white/10 transition-colors rounded-lg mx-1"
                  >
                    <div className="item-title font-semibold text-white">Track Project</div>
                    <div className="item-subtitle text-[11px] text-[#a1abc4] font-normal mt-0.5">
                      Real-time pipeline render status
                    </div>
                  </Link>
                  <div className="border-t border-[#3e485e]/50 my-1.5" />
                  <div className="px-3.5 py-1.5 space-y-1">
                    <a
                      href="mailto:hello@viztr.com"
                      className="block text-[11px] font-mono text-cyan-400 hover:underline"
                    >
                      hello@viztr.com
                    </a>
                    <span className="item-subtitle block text-[11px] font-mono text-[#a1abc4]">
                      +1 (555) 123-4567
                    </span>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* RIGHT SECTION: Quick Controls Pill */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="header-quick-controls-glass hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-full transition-all">
              {/* Theme Toggle (Light / Dark Global Switcher) */}
              <button
                type="button"
                onClick={cycleLightDarkSystem}
                className="p-1 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer flex items-center justify-center"
                title={`Current theme: ${resolvedTheme.toUpperCase()} (Click to toggle Light / Dark)`}
                aria-label="Toggle Light and Dark theme"
              >
                {resolvedTheme === 'light' ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                  <Moon className="w-4 h-4 text-cyan-400" />
                )}
              </button>

              {/* Divider */}
              <div className="w-[1px] h-3.5 bg-white/15" />

              {/* Active Status Dot */}
              <div className="flex items-center justify-center" title="Platform Operational">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
              </div>

              {/* Divider */}
              <div className="w-[1px] h-3.5 bg-white/15" />

              {/* User Account / Profile */}
              <Link
                href={user ? '/client-dashboard' : '/client-access'}
                id="header-client-access-btn"
                className="p-0.5 rounded-full text-zinc-300 hover:text-white transition-colors flex items-center justify-center"
                title={user ? `Logged in as ${user.name}` : 'Client Access'}
                aria-label="Account"
              >
                <div className="w-5 h-5 rounded-full border border-white/25 flex items-center justify-center text-[10px] font-bold text-white hover:border-cyan-400 transition-colors bg-white/5">
                  {user ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5 text-zinc-300" />}
                </div>
              </Link>
            </div>

            {/* Mobile Hamburger Toggle Button */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="header-quick-controls-glass md:hidden p-2 rounded-full text-zinc-300 hover:text-white transition-all cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE FULL-SCREEN OVERLAY MENU - Rendered at root level via Fragment to escape stacking context */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop - catches outside clicks */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Mobile Menu Panel - Slides from right */}
          <div
            id="mobile-nav-overlay"
            className="header-mobile-drawer-glass fixed inset-y-0 right-0 z-50 w-full max-w-sm md:hidden animate-in slide-in-from-right-full duration-300 ease-out shadow-2xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {/* Header with close button */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Home Link */}
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 text-lg font-medium text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-900"
              >
                Home
              </Link>

              {/* Studio Mobile Accordion */}
              <div>
                <button
                  onClick={() => setMobileStudioOpen(!mobileStudioOpen)}
                  className="w-full flex items-center justify-between py-3 text-lg font-medium text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-900"
                >
                  <span>Studio</span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-200 ${
                      mobileStudioOpen ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </button>
                {mobileStudioOpen && (
                  <div className="pl-4 py-3 space-y-2.5 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg">
                    {/* Still Renders Sub-Accordion */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setMobileStillRendersOpen(!mobileStillRendersOpen)}
                        className="w-full flex items-center justify-between py-1.5 text-base font-semibold text-zinc-800 dark:text-zinc-200"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          <span>Still Renders</span>
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            mobileStillRendersOpen ? 'rotate-180 text-cyan-400' : ''
                          }`}
                        />
                      </button>
                      {mobileStillRendersOpen && (
                        <div className="pl-4 py-1 space-y-1.5 border-l-2 border-cyan-400/40 my-1">
                          <Link
                            href="/studio/exterior"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-1 text-sm text-zinc-700 dark:text-zinc-300 hover:text-cyan-400 flex items-center justify-between"
                          >
                            <span>Exterior</span>
                            <span className="text-[9px] font-mono text-cyan-400 bg-black/40 px-1 rounded">8K</span>
                          </Link>
                          <Link
                            href="/studio/interior"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-1 text-sm text-zinc-700 dark:text-zinc-300 hover:text-cyan-400"
                          >
                            Interior
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Sibling: Animation & Walkthrough */}
                    <Link
                      href="/studio/walkthrough"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-base text-zinc-700 dark:text-zinc-300 hover:text-cyan-400 flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>Animation & Walkthrough</span>
                    </Link>
                    <Link
                      href="/studio"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-sm font-semibold text-cyan-500 dark:text-cyan-400"
                    >
                      Studio Overview →
                    </Link>
                  </div>
                )}
              </div>

              {/* XR World Mobile Accordion (Flat list: WebXR, WebAR, VR – Virtual Reality, Virtual Tour, VizSplat, Pixel Streaming) */}
              <div>
                <button
                  onClick={() => setMobileXrOpen(!mobileXrOpen)}
                  className="w-full flex items-center justify-between py-3 text-lg font-medium text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-900"
                >
                  <span>XR World</span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-200 ${
                      mobileXrOpen ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </button>
                {mobileXrOpen && (
                  <div className="pl-4 py-3 space-y-2 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg">
                    {/* 1. WebXR */}
                    <Link
                      href="/xr-world/webxr"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-base text-zinc-700 dark:text-zinc-300 hover:text-cyan-400"
                    >
                      WebXR
                    </Link>
                    {/* 2. WebAR */}
                    <Link
                      href="/xr-world/webar"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-base text-zinc-700 dark:text-zinc-300 hover:text-cyan-400"
                    >
                      WebAR
                    </Link>
                    {/* 3. VR – Virtual Reality */}
                    <Link
                      href="/xr-world/virtual-reality"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-base text-zinc-700 dark:text-zinc-300 hover:text-cyan-400"
                    >
                      VR – Virtual Reality
                    </Link>
                    {/* 4. Virtual Tour */}
                    <Link
                      href="/xr-world/virtual-tour"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-base text-zinc-700 dark:text-zinc-300 hover:text-cyan-400"
                    >
                      Virtual Tour
                    </Link>
                    {/* 5. VizSplat */}
                    <Link
                      href="/xr-world/vizsplat"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-base text-zinc-700 dark:text-zinc-300 hover:text-cyan-400 flex items-center justify-between"
                    >
                      <span>VizSplat</span>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-500 text-white font-mono">
                        NEW
                      </span>
                    </Link>
                    {/* 6. Pixel Streaming */}
                    <Link
                      href="/xr-world/pixel-streaming"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-base text-zinc-700 dark:text-zinc-300 hover:text-cyan-400 flex items-center justify-between"
                    >
                      <span>Pixel Streaming</span>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-cyan-400 text-black font-mono">
                        FLAGSHIP
                      </span>
                    </Link>
                    <Link
                      href="/xr-world"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-sm font-semibold text-cyan-500 dark:text-cyan-400"
                    >
                      XR World Overview →
                    </Link>
                  </div>
                )}
              </div>


              {/* Portfolio Link */}
              <Link
                href="/portfolio"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 text-lg font-medium text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-900"
              >
                Portfolio
              </Link>

              {/* About Link */}
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 text-lg font-medium text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-900"
              >
                About Studio
              </Link>

              {/* Blog Link */}
              <Link
                href="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 text-lg font-medium text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-900"
              >
                Journal & Insights
              </Link>

              {/* Contact Mobile Accordion */}
              <div>
                <button
                  onClick={() => setMobileContactOpen(!mobileContactOpen)}
                  className="w-full flex items-center justify-between py-3 text-lg font-medium text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-900"
                >
                  <span>Contact</span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-200 ${
                      mobileContactOpen ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </button>
                {mobileContactOpen && (
                  <div className="pl-4 py-3 space-y-2 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg">
                    <Link
                      href="/contact"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-base text-zinc-700 dark:text-zinc-300 hover:text-cyan-400"
                    >
                      Project Inquiry
                    </Link>
                    <Link
                      href="/book-consultation"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-base text-zinc-700 dark:text-zinc-300 hover:text-cyan-400"
                    >
                      Book Consultation
                    </Link>
                    <Link
                      href="/track-project"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-base text-zinc-700 dark:text-zinc-300 hover:text-cyan-400"
                    >
                      Track Project
                    </Link>
                    <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
                      <a
                        href="mailto:hello@viztr.com"
                        className="block text-xs font-mono text-cyan-500 dark:text-cyan-400 hover:underline"
                      >
                        hello@viztr.com
                      </a>
                      <span className="block text-xs font-mono text-zinc-500 dark:text-zinc-400">
                        +1 (555) 123-4567
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">Appearance</span>
                <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <button
                    type="button"
                    onClick={() => { setTheme('light'); setMobileMenuOpen(false); }}
                    className={`px-3 py-2 rounded-md flex items-center gap-2 text-sm font-mono transition-all ${
                      theme === 'light'
                        ? 'bg-zinc-200 text-amber-500 font-bold border border-amber-500/30 dark:bg-zinc-700'
                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                    }`}
                    title="Light (Daylight)"
                  >
                    <Sun className="w-4 h-4" />
                    <span>Light</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTheme('dark'); setMobileMenuOpen(false); }}
                    className={`px-3 py-2 rounded-md flex items-center gap-2 text-sm font-mono transition-all ${
                      theme === 'dark'
                        ? 'bg-zinc-200 text-emerald-500 font-bold border border-emerald-500/30 dark:bg-zinc-700'
                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                    }`}
                    title="Dark (Cyber Emerald)"
                  >
                    <Moon className="w-4 h-4" />
                    <span>Dark</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTheme('system'); setMobileMenuOpen(false); }}
                    className={`px-3 py-2 rounded-md flex items-center gap-2 text-sm font-mono transition-all ${
                      theme === 'system'
                        ? 'bg-zinc-200 text-sky-500 font-bold border border-sky-500/30 dark:bg-zinc-700'
                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                    }`}
                    title="System Auto"
                  >
                    <Monitor className="w-4 h-4" />
                    <span>System</span>
                  </button>
                </div>
              </div>

              <Link
                href="/client-access"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 text-center block rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow"
              >
                Client Portal Access
              </Link>
              <div className="text-center text-xs text-zinc-500 dark:text-zinc-400">
                © 2026 VizTR Studio. All rights reserved.
              </div>
            </div>
          </div>
        </>
      )}
      {!isHomeActive && <div className="h-[56px] w-full shrink-0 pointer-events-none" aria-hidden="true" />}
    </>
  );
}
