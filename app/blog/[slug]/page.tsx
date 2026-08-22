'use client';

import React, { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { blogPosts } from '@/data/pages';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Share2,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { showToast } = useAppStore();

  const post = blogPosts.find((p) => p.slug === resolvedParams.slug);

  if (!post) {
    return notFound();
  }

  const relatedPosts = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Article URL copied to clipboard.', 'success');
    } else {
      showToast('Sharing link prepared.', 'info');
    }
  };

  return (
    <main className="min-h-screen bg-[#09090B] text-[#FAFAFA] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* TOP BREADCRUMB & BACK LINK */}
        <div className="flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#A1A1AA] hover:text-[#3ECF8E] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Perspectives & Research</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#FAFAFA] transition-colors cursor-pointer"
              title="Share Article"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => showToast('Article saved to client reading list.', 'info')}
              className="p-2 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#FAFAFA] transition-colors cursor-pointer"
              title="Bookmark"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* HEADER SECTION */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-xs font-mono text-[#3ECF8E] flex-wrap">
            <span className="px-2.5 py-0.5 rounded bg-[#18181B] border border-[#27272A] uppercase font-bold">
              {post.category}
            </span>
            <span>•</span>
            <span className="text-[#A1A1AA] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight text-white leading-tight">
            {post.title}
          </h1>

          <p className="text-base sm:text-lg text-[#A1A1AA] leading-relaxed">
            {post.excerpt}
          </p>

          {/* AUTHOR PROFILE BAR */}
          <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#09090B] border border-[#3ECF8E]/40 flex items-center justify-center text-[#3ECF8E] font-bold font-display">
                {post.author.charAt(0)}
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{post.author}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3ECF8E]" />
                </div>
                <div className="text-[11px] font-mono text-[#71717A]">
                  {post.authorRole} • VizTR Labs
                </div>
              </div>
            </div>

            <div className="text-right text-xs font-mono text-[#71717A]">
              <div className="flex items-center gap-1 justify-end">
                <Calendar className="w-3.5 h-3.5" />
                <span>{post.date}</span>
              </div>
            </div>
          </div>
        </div>

        {/* HERO IMAGE */}
        <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-[#18181B] border border-[#27272A] shadow-2xl">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            priority
            referrerPolicy="no-referrer"
          />
        </div>

        {/* ARTICLE BODY */}
        <div className="p-6 sm:p-10 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-6 text-[#E4E4E7] text-sm sm:text-base leading-relaxed">
          {post.content.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('### ')) {
              return (
                <h3
                  key={index}
                  className="text-xl sm:text-2xl font-bold font-display text-white pt-4 pb-1 border-b border-[#27272A]"
                >
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('1. ') || paragraph.startsWith('2. ') || paragraph.startsWith('3. ')) {
              return (
                <div key={index} className="p-3 rounded-lg bg-[#09090B] border border-[#27272A] text-xs sm:text-sm font-mono text-[#FAFAFA]">
                  {paragraph}
                </div>
              );
            }
            return (
              <p key={index} className="text-[#A1A1AA] leading-relaxed">
                {paragraph}
              </p>
            );
          })}
        </div>

        {/* RELATED ARTICLES */}
        {relatedPosts.length > 0 && (
          <div className="space-y-4 pt-6">
            <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#3ECF8E]" />
              <span>Related Architectural & XR Research</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/blog/${rel.slug}`}
                  className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] hover:border-[#3ECF8E]/50 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[#3ECF8E] uppercase">
                      {rel.category}
                    </span>
                    <h4 className="text-sm font-bold font-display text-white group-hover:text-[#3ECF8E] transition-colors line-clamp-2">
                      {rel.title}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#71717A] pt-2 border-t border-[#27272A]">
                    <span>{rel.readTime}</span>
                    <span className="text-[#3ECF8E] flex items-center gap-0.5">
                      Read <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
