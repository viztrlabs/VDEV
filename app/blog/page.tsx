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
  Share2
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
    <main className="min-h-screen bg-[#09090B] text-[#FAFAFA] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* HERO SECTION */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181B] border border-[#27272A] text-xs font-mono text-[#3ECF8E]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>VIZTR PERSPECTIVES & RESEARCH</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white">
            Architectural CGI, XR & Cloud Innovation
          </h1>
          <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed">
            Technical breakdowns, case studies, and insights on the convergence of photorealistic rendering, WebXR, and real-time interactive architecture.
          </p>
        </div>

        {/* FEATURED HERO POST */}
        {featuredPost && selectedCategory === 'All' && !searchQuery && (
          <div className="p-6 sm:p-8 rounded-2xl bg-[#18181B] border border-[#27272A] relative overflow-hidden group hover:border-[#3ECF8E]/40 transition-all shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 relative h-64 sm:h-96 rounded-xl overflow-hidden bg-[#09090B]">
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-[#3ECF8E] uppercase tracking-wider font-bold">
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
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
                className="rounded-2xl bg-[#18181B] border border-[#27272A] overflow-hidden flex flex-col hover:border-[#3ECF8E]/50 transition-all group shadow-lg"
              >
                <div className="relative h-48 w-full bg-[#09090B] overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-md bg-black/80 backdrop-blur-sm border border-white/10 text-[10px] font-mono text-[#3ECF8E] uppercase tracking-wider">
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
          <div className="py-16 text-center space-y-3 bg-[#18181B] rounded-2xl border border-[#27272A]">
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
                    : 'bg-[#18181B] text-[#A1A1AA] hover:text-white border border-[#27272A]'
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
