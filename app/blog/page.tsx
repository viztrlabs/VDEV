'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { blogPosts } from '@/data/pages';
import {
  Search,
  Calendar,
  Clock,
  User,
  ArrowRight,
  Sparkles,
  BookOpen,
  ChevronRight,
  Share2,
  ChevronDown
} from 'lucide-react';

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const postsPerPage = 6;

  const categories = ['All', 'Technology & Real Estate', 'Visualization Craft', 'Engineering & Web3D'];

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogPosts[0];
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage) || 1;
  const displayedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  return (
    <main className="min-h-screen bg-[#09090B] text-[#FAFAFA] pb-24">
      {/* 1. HERO PRESENTATION AREA (Full Landing Page Presentation Aspect Ratio) */}
      <section
        id="hero-section"
        className="relative w-full h-screen min-h-[680px] flex flex-col justify-between items-center overflow-hidden text-white select-none transition-colors duration-300"
      >
        {/* MEDIA LAYER: Full Bleed High-Res Render */}
        <div className="hero-media-layer absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={featuredPost?.image || '/assets/hero/hero-02.jpg'}
              alt="Architectural CGI, XR & Cloud Innovation"
              fill
              priority
              quality={90}
              sizes="100vw"
              className="hero-bg-image object-cover object-center render-lighting-enhanced"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/40 to-[#0A0A0B]/65 pointer-events-none z-20" />
          <div className="absolute inset-0 bg-radial from-transparent via-[#0A0A0B]/25 to-[#0A0A0B]/80 pointer-events-none z-20" />
        </div>

        {/* TOP AREA: Clears floating header & hosts Eyebrow Badge (No directory breadcrumbs) */}
        <div className="relative z-20 w-full pt-16 sm:pt-20 shrink-0 flex justify-center px-2 sm:px-4">
          <div className="hero-eyebrow inline-flex items-center gap-1.5 sm:gap-2.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-[#0A0A0B] shadow-2xl transition-all border border-[#1E293B] text-[10px] sm:text-xs max-w-[95vw] sm:max-w-none">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#42CF8B] animate-pulse shrink-0" />
            <span className="font-bold text-[#42CF8B] tracking-wider uppercase shrink-0">RESEARCH & INSIGHTS</span>
            <span className="opacity-40 shrink-0">|</span>
            <span className="opacity-80 shrink-0">Architectural CGI & Real-Time WebXR</span>
          </div>
        </div>

        {/* BOTTOM HERO CONTENT: Fluid typography, original content & pill CTAs */}
        <div className="relative z-20 w-full container-ultrawide text-center flex flex-col items-center justify-end mt-auto px-4 sm:px-6 pb-6 sm:pb-8">
          <h1 className="hero-headline text-fluid-hero font-extrabold tracking-tight mb-2 sm:mb-3 font-sans">
            Architectural CGI, XR & Cloud Innovation
          </h1>

          <p className="hero-subheadline text-fluid-sub font-medium tracking-wide mb-3 max-w-3xl">
            Photorealistic Rendering, WebXR & Real-Time Interactive Architecture
          </p>

          <p className="hero-desc text-fluid-desc max-w-2xl 2xl:max-w-3xl text-center prose-readable font-normal leading-relaxed mb-6 text-[#E5E2E3]">
            Technical breakdowns, case studies, and insights on the convergence of photorealistic rendering, WebXR, and real-time interactive architecture.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none mb-6">
            <a
              href="#blog-posts"
              id="hero-primary-cta"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#00F0FF] hover:bg-[#33f3ff] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>Explore Research & Articles</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>

            <Link
              href="/portfolio"
              id="hero-secondary-cta"
              className="hero-secondary-btn w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider bg-[#131314] hover:bg-[#1E293B] transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-xl hover:scale-105 active:scale-95 border border-[#1E293B]"
            >
              <BookOpen className="w-4 h-4 text-[#42CF8B]" />
              <span>View Portfolio Cases</span>
            </Link>
          </div>

          {/* Bottom Bar: Scroll Indicator */}
          <div className="relative w-full flex items-center justify-center pt-2">
            <div className="sm:block">
              <a
                href="#blog-posts"
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById('blog-posts');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                  else window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
                }}
                className="hero-scroll-btn group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0A0A0B] text-[10px] font-mono uppercase tracking-widest transition-all cursor-pointer shadow-sm hover:bg-[#131314] border border-[#1E293B]"
                aria-label="Scroll down to explore"
              >
                <span>Scroll to explore</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#00F0FF] animate-bounce" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <div id="blog-posts" className="max-w-7xl mx-auto space-y-12 pt-16 px-4 sm:px-6 lg:px-8">

        {/* FEATURED HERO POST */}
        {featuredPost && selectedCategory === 'All' && !searchQuery && (
          <div className="p-6 sm:p-8 rounded-[2rem] bg-[#131314] border border-[#1E293B] relative overflow-hidden group hover:border-[#3ECF8E]/40 transition-all shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 relative h-64 sm:h-96 rounded-xl overflow-hidden bg-black">
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#0A0A0B] border border-[#1E293B] text-[10px] font-mono text-[#3ECF8E] uppercase tracking-wider font-bold">
                  Featured Insight
                </div>
              </div>

              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center gap-3 text-xs font-mono text-[#71717A]">
                  <span className="text-[#3ECF8E] font-semibold">{featuredPost.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {featuredPost.readTime}
                  </span>
                </div>

                <Link href={`/blog/${featuredPost.slug}`}>
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-white group-hover:text-[#3ECF8E] transition-colors leading-snug">
                    {featuredPost.title}
                  </h2>
                </Link>

                <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
                  {featuredPost.excerpt}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-[#27272A] text-xs font-mono">
                  <div className="flex items-center gap-2 text-[#FAFAFA]">
                    <User className="w-3.5 h-3.5 text-[#3ECF8E]" />
                    <span>{featuredPost.author}</span>
                  </div>
                  <span className="text-[#71717A]">{featuredPost.date}</span>
                </div>

                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#3ECF8E] hover:text-emerald-400 transition-colors pt-1"
                >
                  <span>Read In-Depth Article</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* SEARCH AND FILTER BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#131314] border border-[#1E293B]">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#3ECF8E] text-black font-bold shadow-md shadow-[#3ECF8E]/20'
                    : 'bg-[#09090B] text-[#A1A1AA] hover:text-white border border-[#27272A]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search articles, keywords..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-[#FAFAFA] placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E] transition-colors"
            />
          </div>
        </div>

        {/* POSTS GRID */}
        {displayedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedPosts.map((post) => (
              <article
                key={post.slug}
                className="rounded-2xl bg-[#131314] border border-[#1E293B] overflow-hidden flex flex-col hover:border-[#3ECF8E]/50 transition-all group shadow-sm"
              >
                <div className="relative h-48 w-full bg-black overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-md bg-[#0A0A0B] border border-[#1E293B] text-[10px] font-mono text-[#3ECF8E] uppercase tracking-wider">
                    {post.category}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-[#71717A]">
                      <Calendar className="w-3 h-3" />
                      <span>{post.date}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{post.readTime}</span>
                    </div>

                    <Link href={`/blog/${post.slug}`}>
                      <h3 className="text-base font-bold font-display text-white group-hover:text-[#3ECF8E] transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-[#A1A1AA] line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#27272A] flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-[#FAFAFA]">
                      <User className="w-3.5 h-3.5 text-[#3ECF8E]" />
                      <span className="text-[11px]">{post.author}</span>
                    </div>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3ECF8E] hover:underline"
                    >
                      <span>Read</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-3 bg-[#131314] rounded-2xl border border-[#1E293B]">
            <Search className="w-8 h-8 text-[#71717A] mx-auto" />
            <h3 className="text-sm font-bold text-white">No articles matched your criteria</h3>
            <p className="text-xs text-[#A1A1AA]">
              Try searching for different terms or clear the category filters.
            </p>
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className={`w-9 h-9 rounded-lg font-mono text-xs font-bold transition-colors cursor-pointer ${
                  currentPage === pg
                    ? 'bg-[#3ECF8E] text-black shadow-md'
                    : 'bg-[#131314] text-[#A1A1AA] hover:text-white border border-[#1E293B]'
                }`}
              >
                {pg}
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
