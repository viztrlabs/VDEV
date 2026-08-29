'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  useCMSStore,
  CMSPageItem,
  CMSBlogPost,
  CMSService,
  CMSProject,
  CMSTestimonial,
  CMSMediaItem,
  CMSNavItem,
  CMSSocialLink,
  CMSThemeCustomization
} from '@/lib/cms-store';
import { useAppStore } from '@/lib/store';
import {
  FileText,
  BookOpen,
  Layers,
  FolderKanban,
  MessageSquareQuote,
  Palette,
  Compass,
  Image as ImageIcon,
  Share2,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Search,
  ArrowUp,
  ArrowDown,
  Sparkles,
  RefreshCw,
  Upload,
  Globe,
  Sliders,
  Shield,
  FileCode,
  Tag,
  Check,
  X,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Save,
  AlertCircle,
  HelpCircle,
  FolderOpen
} from 'lucide-react';

type CMSTab =
  | 'pages'
  | 'blog'
  | 'services'
  | 'projects'
  | 'testimonials'
  | 'theme-layout'
  | 'navigation'
  | 'media'
  | 'social';

export default function SuperAdminCMSManager() {
  const { showToast } = useAppStore();
  const cms = useCMSStore();

  const [activeTab, setActiveTab] = useState<CMSTab>('pages');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals / Editor States
  const [pageModalOpen, setPageModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CMSPageItem | null>(null);

  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<CMSBlogPost | null>(null);

  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<CMSService | null>(null);

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<CMSProject | null>(null);

  const [testimonialModalOpen, setTestimonialModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<CMSTestimonial | null>(null);

  const [navModalOpen, setNavModalOpen] = useState(false);
  const [editingNav, setEditingNav] = useState<CMSNavItem | null>(null);

  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [editingSocial, setEditingSocial] = useState<CMSSocialLink | null>(null);

  const [uploadMediaModalOpen, setUploadMediaModalOpen] = useState(false);
  const [mediaViewMode, setMediaViewMode] = useState<'grid' | 'table'>('grid');

  // Helper copy to clipboard
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard!`, 'success');
  };

  return (
    <div className="space-y-6" id="super-admin-cms-workspace">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#18181B] via-[#151518] to-[#121214] border border-[#27272A] shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#3ECF8E]/20 border border-[#3ECF8E]/40 flex items-center justify-center text-[#3ECF8E]">
              <Shield className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold font-display text-white">
              Super Admin Content Management Engine
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 text-[#3ECF8E] text-[10px] font-mono font-bold">
              CMS v3.0 ACTIVE
            </span>
          </div>
          <p className="text-xs text-[#A1A1AA]">
            Full lifecycle control over pages, templates, SEO metadata, blogs, services, media, menu hierarchy, and design customizer.
          </p>
        </div>

        {/* Global Action Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              if (confirm('Reset all CMS content, menus, and themes to factory studio presets?')) {
                cms.resetToDefaults();
                showToast('Reset CMS to default architectural presets.', 'info');
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-[#27272A]/70 hover:bg-[#27272A] border border-[#3F3F46] text-zinc-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset to initial studio configuration"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <Link
            href="/"
            target="_blank"
            className="px-3.5 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black text-xs font-bold font-mono flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Website Preview</span>
          </Link>
        </div>
      </div>

      {/* HORIZONTAL TAB NAVIGATION */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#27272A] scrollbar-thin">
        {[
          { id: 'pages', label: 'Pages & Templates', icon: FileText, count: cms.pages.length },
          { id: 'blog', label: 'Blog Posts', icon: BookOpen, count: cms.blogPosts.length },
          { id: 'services', label: 'Services CMS', icon: Layers, count: cms.services.length },
          { id: 'projects', label: 'Projects & Showcase', icon: FolderKanban, count: cms.projects.length },
          { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote, count: cms.testimonials.length },
          { id: 'theme-layout', label: 'Theme & Layout Engine', icon: Palette },
          { id: 'navigation', label: 'Menu & Navigation', icon: Compass, count: cms.navigationMenu.length },
          { id: 'media', label: 'Media Library', icon: ImageIcon, count: cms.mediaLibrary.length },
          { id: 'social', label: 'Social Links', icon: Share2, count: cms.socialLinks.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as CMSTab);
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#3ECF8E] text-black shadow-lg shadow-[#3ECF8E]/20'
                  : 'bg-[#18181B] text-[#A1A1AA] hover:text-white hover:bg-[#27272A] border border-[#27272A]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-black/20 text-black' : 'bg-[#27272A] text-[#A1A1AA]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. PAGES & TEMPLATES TAB */}
      {/* ========================================================================= */}
      {activeTab === 'pages' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#18181B] p-3 rounded-xl border border-[#27272A]">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
              <input
                type="text"
                placeholder="Search pages, slugs or SEO titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#09090B] border border-[#27272A] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E] font-mono"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => {
                  setEditingPage({
                    id: '',
                    title: '',
                    slug: '/custom-page',
                    status: 'draft',
                    category: 'custom',
                    publishedAt: '',
                    updatedAt: new Date().toISOString(),
                    author: 'Super Admin',
                    seo: {
                      metaTitle: '',
                      metaDescription: '',
                      keywords: ['architecture', 'cgi', 'viztr'],
                      canonicalUrl: 'https://viztr.studio/custom-page',
                      noIndex: false,
                    },
                    contentSummary: 'Custom created page with architectural modular blocks.',
                    sectionsCount: 3,
                    viewCount: 0,
                  });
                  setPageModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Page</span>
              </button>
            </div>
          </div>

          {/* Quick Template Picker Bar */}
          <div className="p-3 bg-[#14171F] rounded-xl border border-[#27272A] flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono font-bold text-[#A1A1AA] flex items-center gap-1">
              <FolderOpen className="w-3.5 h-3.5 text-[#3ECF8E]" />
              <span>Load Page as Template:</span>
            </span>
            {[
              { label: 'Homepage Master', key: 'pg-home' },
              { label: 'Studio Overview', key: 'pg-studio' },
              { label: 'Exterior 8K', key: 'pg-exterior' },
              { label: 'Interior Staging', key: 'pg-interior' },
              { label: 'Walkthrough Cinema', key: 'pg-walkthrough' },
              { label: 'XR World Hub', key: 'pg-xr-world' },
              { label: 'Pixel Streaming', key: 'pg-pixel-streaming' },
            ].map((tmpl) => (
              <button
                key={tmpl.key}
                onClick={() => {
                  const duplicated = cms.loadPageTemplate(tmpl.key);
                  if (duplicated) {
                    cms.addPage(duplicated);
                    showToast(`Created new page from template: "${tmpl.label}"`, 'success');
                  }
                }}
                className="px-2.5 py-1 rounded-md bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] hover:border-[#3ECF8E]/40 text-xs text-zinc-300 hover:text-white transition-all font-mono flex items-center gap-1"
              >
                <Copy className="w-3 h-3 text-[#3ECF8E]" />
                <span>{tmpl.label}</span>
              </button>
            ))}
          </div>

          {/* Pages Table */}
          <div className="rounded-xl border border-[#27272A] overflow-hidden bg-[#18181B]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0D0F14] text-[#A1A1AA] uppercase text-[10px] tracking-wider border-b border-[#27272A]">
                  <tr>
                    <th className="py-3 px-4">Page Title & Summary</th>
                    <th className="py-3 px-4">Slug / URL Path</th>
                    <th className="py-3 px-4">Status & Category</th>
                    <th className="py-3 px-4">SEO Metadata Health</th>
                    <th className="py-3 px-4">Last Updated</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272A]">
                  {cms.pages
                    .filter(
                      (p) =>
                        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.seo.metaTitle.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((page) => (
                      <tr key={page.id} className="hover:bg-[#1F2128] transition-colors group">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white text-xs">{page.title}</div>
                          <div className="text-[11px] text-[#A1A1AA] line-clamp-1 mt-0.5">
                            {page.contentSummary}
                          </div>
                          {page.templateName && (
                            <span className="inline-block mt-1 text-[9px] px-1.5 py-0.2 rounded bg-[#09090B] text-cyan-400 border border-cyan-900/50">
                              Template: {page.templateName}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#3ECF8E] font-bold">{page.slug}</span>
                            <button
                              onClick={() => handleCopy(`https://viztr.studio${page.slug}`, 'URL')}
                              className="text-[#71717A] hover:text-white p-0.5"
                              title="Copy URL"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-[10px] text-[#71717A]">{page.viewCount.toLocaleString()} Views</span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                page.status === 'published'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : page.status === 'draft'
                                  ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                              }`}
                            >
                              {page.status}
                            </span>
                            <span className="text-[10px] text-[#A1A1AA] uppercase">
                              [{page.category}]
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[11px]">
                              {page.seo.metaTitle && page.seo.metaDescription ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3ECF8E]" />
                                  <span className="text-zinc-300">SEO Configured</span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                                  <span className="text-amber-400">Missing SEO Meta</span>
                                </>
                              )}
                            </div>
                            <div className="text-[10px] text-[#71717A] truncate max-w-xs">
                              {page.seo.keywords.join(', ') || 'No keywords'}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-[#A1A1AA] text-[11px]">
                          <div>{new Date(page.updatedAt).toLocaleDateString()}</div>
                          <div className="text-[10px] text-[#71717A]">{page.author}</div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={page.slug}
                              target="_blank"
                              className="p-1.5 rounded-lg bg-[#09090B] hover:bg-[#27272A] text-zinc-300 hover:text-white border border-[#27272A]"
                              title="Preview Page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              onClick={() => {
                                setEditingPage(page);
                                setPageModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-[#09090B] hover:bg-[#27272A] text-[#3ECF8E] hover:text-emerald-300 border border-[#27272A]"
                              title="Edit Page & SEO"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`Delete page "${page.title}" (${page.slug})?`)) {
                                  cms.deletePage(page.id);
                                  showToast('Page deleted.', 'info');
                                }
                              }}
                              className="p-1.5 rounded-lg bg-[#09090B] hover:bg-rose-950 text-[#71717A] hover:text-rose-400 border border-[#27272A]"
                              title="Delete Page"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. BLOG POSTS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'blog' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#18181B] p-3 rounded-xl border border-[#27272A]">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
              <input
                type="text"
                placeholder="Search blog articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#09090B] border border-[#27272A] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E] font-mono"
              />
            </div>

            <button
              onClick={() => {
                setEditingBlog({
                  id: '',
                  title: '',
                  slug: 'new-architectural-essay',
                  category: 'Visualization Craft',
                  excerpt: '',
                  content: ['## Introduction\n\nDeep dive into photorealistic architectural rendering workflows...'],
                  author: 'Super Admin',
                  authorRole: 'Visualization Research Lead',
                  date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                  readTime: '6 min read',
                  image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
                  status: 'published',
                  featured: false,
                  tags: ['Rendering', 'Lighting', 'Optics'],
                  seo: {
                    metaTitle: '',
                    metaDescription: '',
                    keywords: ['architectural cgi', 'rendering'],
                    canonicalUrl: '',
                  },
                });
                setBlogModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Write New Article</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cms.blogPosts
              .filter(
                (post) =>
                  post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  post.category.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((post) => (
                <div
                  key={post.id}
                  className="rounded-xl bg-[#18181B] border border-[#27272A] overflow-hidden flex flex-col justify-between hover:border-[#3ECF8E]/40 transition-all group"
                >
                  <div>
                    <div className="relative h-44 w-full bg-[#09090B]">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[#3ECF8E] text-[10px] font-mono font-bold border border-[#3ECF8E]/30">
                          {post.category}
                        </span>
                        {post.featured && (
                          <span className="px-2 py-0.5 rounded bg-amber-500 text-black text-[10px] font-mono font-bold">
                            FEATURED
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-2.5 right-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            post.status === 'published'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                              : 'bg-amber-950 text-amber-400 border border-amber-700'
                          }`}
                        >
                          {post.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="text-[10px] font-mono text-[#71717A] flex items-center justify-between">
                        <span>{post.date}</span>
                        <span>{post.readTime}</span>
                      </div>
                      <h3 className="font-bold text-sm text-white font-display line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                      <div className="text-[10px] font-mono text-[#3ECF8E]">
                        Slug: /blog/{post.slug}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-[#27272A]/60 flex items-center justify-between mt-2">
                    <span className="text-[11px] text-[#71717A] font-mono">{post.author}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingBlog(post);
                          setBlogModalOpen(true);
                        }}
                        className="p-1.5 rounded bg-[#09090B] hover:bg-[#27272A] text-[#3ECF8E] border border-[#27272A]"
                        title="Edit Article"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete post "${post.title}"?`)) {
                            cms.deleteBlogPost(post.id);
                            showToast('Blog article deleted.', 'info');
                          }
                        }}
                        className="p-1.5 rounded bg-[#09090B] hover:bg-rose-950 text-[#71717A] hover:text-rose-400 border border-[#27272A]"
                        title="Delete Article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SERVICES CMS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#18181B] p-3 rounded-xl border border-[#27272A]">
            <div className="text-xs text-[#A1A1AA] font-mono">
              Manage Studio & XR Pipeline service offerings, pricing tiers, and capabilities.
            </div>
            <button
              onClick={() => {
                setEditingService({
                  id: '',
                  name: '',
                  slug: 'new-service',
                  category: 'studio',
                  heroBadge: 'New Service',
                  tagline: '',
                  description: '',
                  heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
                  status: 'published',
                  priceStartingFrom: '$2,000 / milestone',
                  timeline: '5-7 Days',
                  capabilities: ['High-poly geometry modeling', 'Spectral lighting simulation'],
                  deliverables: ['8K TIFF Master Stills', 'Print-ready formats'],
                  seo: {
                    metaTitle: '',
                    metaDescription: '',
                    keywords: ['service', 'cgi'],
                  },
                });
                setServiceModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Service Offering</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cms.services.map((service) => (
              <div
                key={service.id}
                className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4 hover:border-[#3ECF8E]/40 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded bg-[#09090B] text-[#3ECF8E] text-[10px] font-mono font-bold border border-[#3ECF8E]/30">
                      {service.heroBadge}
                    </span>
                    <h3 className="text-base font-bold font-display text-white mt-1">
                      {service.name}
                    </h3>
                    <p className="text-xs text-[#A1A1AA] leading-relaxed">
                      {service.tagline}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setEditingService(service);
                        setServiceModalOpen(true);
                      }}
                      className="p-1.5 rounded bg-[#09090B] hover:bg-[#27272A] text-[#3ECF8E] border border-[#27272A]"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete service "${service.name}"?`)) {
                          cms.deleteService(service.id);
                          showToast('Service deleted.', 'info');
                        }
                      }}
                      className="p-1.5 rounded bg-[#09090B] hover:bg-rose-950 text-[#71717A] hover:text-rose-400 border border-[#27272A]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono">
                  <div>
                    <span className="text-[#71717A] text-[10px] block">Starting Rate:</span>
                    <span className="text-[#3ECF8E] font-bold">{service.priceStartingFrom}</span>
                  </div>
                  <div>
                    <span className="text-[#71717A] text-[10px] block">Turnaround:</span>
                    <span className="text-white font-bold">{service.timeline}</span>
                  </div>
                </div>

                {/* Capabilities list preview */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#71717A] uppercase font-bold">
                    Key Deliverables ({service.deliverables.length})
                  </span>
                  <ul className="text-xs text-zinc-300 space-y-1">
                    {service.deliverables.slice(0, 3).map((d, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-[#3ECF8E] shrink-0" />
                        <span className="truncate">{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. PROJECTS & SHOWCASE TAB */}
      {/* ========================================================================= */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#18181B] p-3 rounded-xl border border-[#27272A]">
            <div className="text-xs text-[#A1A1AA] font-mono">
              Manage showcase master portfolio projects, high-res galleries, and 3D Draco models.
            </div>
            <button
              onClick={() => {
                setEditingProject({
                  id: '',
                  title: '',
                  slug: 'new-architectural-commission',
                  client: 'Architecture Firm',
                  category: 'Exterior',
                  year: '2026',
                  coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
                  gallery: [
                    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
                  ],
                  status: 'published',
                  featured: true,
                  model3dUrl: '/models/apex-tower-v3-draco.glb',
                  description: 'High-density architectural visualization commission.',
                  location: 'London, UK',
                  seo: {
                    metaTitle: '',
                    metaDescription: '',
                    keywords: ['project', 'case study'],
                  },
                });
                setProjectModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Portfolio Project</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cms.projects.map((project) => (
              <div
                key={project.id}
                className="rounded-xl bg-[#18181B] border border-[#27272A] overflow-hidden group hover:border-[#3ECF8E]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full bg-[#09090B]">
                    <Image
                      src={project.coverImage}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[#3ECF8E] text-[10px] font-mono font-bold border border-[#3ECF8E]/30">
                        {project.category} · {project.year}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <div className="text-[10px] font-mono text-[#71717A]">{project.location}</div>
                    <h3 className="font-bold text-sm text-white font-display line-clamp-1">
                      {project.title}
                    </h3>
                    <div className="text-xs text-[#3ECF8E] font-mono font-semibold">
                      {project.client}
                    </div>
                    <p className="text-xs text-[#A1A1AA] line-clamp-2 mt-1">
                      {project.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-[#27272A]/60 flex items-center justify-between mt-3">
                  <span className="text-[10px] font-mono text-[#71717A]">
                    {project.gallery.length} Images {project.model3dUrl ? '· 3D Model' : ''}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingProject(project);
                        setProjectModalOpen(true);
                      }}
                      className="p-1.5 rounded bg-[#09090B] hover:bg-[#27272A] text-[#3ECF8E] border border-[#27272A]"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete project "${project.title}"?`)) {
                          cms.deleteProject(project.id);
                          showToast('Project deleted.', 'info');
                        }
                      }}
                      className="p-1.5 rounded bg-[#09090B] hover:bg-rose-950 text-[#71717A] hover:text-rose-400 border border-[#27272A]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TESTIMONIALS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'testimonials' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#18181B] p-3 rounded-xl border border-[#27272A]">
            <div className="text-xs text-[#A1A1AA] font-mono">
              Manage client social proof, executive quotes, star ratings, and toggle visibility.
            </div>
            <button
              onClick={() => {
                setEditingTestimonial({
                  id: '',
                  clientName: '',
                  role: 'Managing Director',
                  company: 'Global Architecture Atelier',
                  quote: 'VizTR delivered an exceptional architectural rendering pipeline...',
                  rating: 5,
                  isVisible: true,
                  createdAt: new Date().toISOString(),
                });
                setTestimonialModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Testimonial</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cms.testimonials.map((test) => (
              <div
                key={test.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                  test.isVisible
                    ? 'bg-[#18181B] border-[#27272A]'
                    : 'bg-[#121214] border-zinc-800 opacity-60'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: test.rating }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        cms.toggleTestimonialVisibility(test.id);
                        showToast(`Toggled visibility for ${test.clientName}`, 'info');
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-colors ${
                        test.isVisible
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {test.isVisible ? 'Visible (Active)' : 'Hidden'}
                    </button>
                  </div>

                  <p className="text-xs text-zinc-300 italic leading-relaxed">
                    &quot;{test.quote}&quot;
                  </p>
                </div>

                <div className="pt-2 border-t border-[#27272A] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-xs font-display">{test.clientName}</div>
                    <div className="text-[10px] text-[#A1A1AA] font-mono">
                      {test.role}, {test.company}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingTestimonial(test);
                        setTestimonialModalOpen(true);
                      }}
                      className="p-1 rounded bg-[#09090B] hover:bg-[#27272A] text-[#3ECF8E] border border-[#27272A]"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete testimonial from "${test.clientName}"?`)) {
                          cms.deleteTestimonial(test.id);
                          showToast('Testimonial removed.', 'info');
                        }
                      }}
                      className="p-1 rounded bg-[#09090B] hover:bg-rose-950 text-[#71717A] hover:text-rose-400 border border-[#27272A]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. THEME & LAYOUT ENGINE TAB */}
      {/* ========================================================================= */}
      {activeTab === 'theme-layout' && (
        <div className="space-y-6">
          {/* Top 3 Config Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 1. PALETTE CUSTOMIZER */}
            <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#3ECF8E]" />
                <h3 className="font-bold text-sm text-white font-display">
                  Color Palette Customizer
                </h3>
              </div>
              <p className="text-xs text-[#A1A1AA]">
                Fine-tune primary studio accent colors, dark/light canvas surfaces, and border contrasts.
              </p>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="text-[11px] text-[#A1A1AA] flex items-center justify-between mb-1">
                    <span>Primary Accent Color</span>
                    <span className="text-[#3ECF8E] font-bold">
                      {cms.themeCustomization.colorPalette.primary}
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={cms.themeCustomization.colorPalette.primary}
                      onChange={(e) =>
                        cms.updateThemeCustomization({
                          colorPalette: {
                            ...cms.themeCustomization.colorPalette,
                            primary: e.target.value,
                          },
                        })
                      }
                      className="w-8 h-8 rounded border border-[#27272A] bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={cms.themeCustomization.colorPalette.primary}
                      onChange={(e) =>
                        cms.updateThemeCustomization({
                          colorPalette: {
                            ...cms.themeCustomization.colorPalette,
                            primary: e.target.value,
                          },
                        })
                      }
                      className="flex-1 bg-[#09090B] border border-[#27272A] rounded px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-[#A1A1AA] flex items-center justify-between mb-1">
                    <span>Secondary Accent</span>
                    <span className="text-[#34B27B] font-bold">
                      {cms.themeCustomization.colorPalette.accent}
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={cms.themeCustomization.colorPalette.accent}
                      onChange={(e) =>
                        cms.updateThemeCustomization({
                          colorPalette: {
                            ...cms.themeCustomization.colorPalette,
                            accent: e.target.value,
                          },
                        })
                      }
                      className="w-8 h-8 rounded border border-[#27272A] bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={cms.themeCustomization.colorPalette.accent}
                      onChange={(e) =>
                        cms.updateThemeCustomization({
                          colorPalette: {
                            ...cms.themeCustomization.colorPalette,
                            accent: e.target.value,
                          },
                        })
                      }
                      className="flex-1 bg-[#09090B] border border-[#27272A] rounded px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-[#A1A1AA] flex items-center justify-between mb-1">
                    <span>Background Base</span>
                    <span className="text-zinc-400 font-bold">
                      {cms.themeCustomization.colorPalette.background}
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={cms.themeCustomization.colorPalette.background}
                      onChange={(e) =>
                        cms.updateThemeCustomization({
                          colorPalette: {
                            ...cms.themeCustomization.colorPalette,
                            background: e.target.value,
                          },
                        })
                      }
                      className="w-8 h-8 rounded border border-[#27272A] bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={cms.themeCustomization.colorPalette.background}
                      onChange={(e) =>
                        cms.updateThemeCustomization({
                          colorPalette: {
                            ...cms.themeCustomization.colorPalette,
                            background: e.target.value,
                          },
                        })
                      }
                      className="flex-1 bg-[#09090B] border border-[#27272A] rounded px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. TYPOGRAPHY PAIRINGS */}
            <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#3ECF8E]" />
                <h3 className="font-bold text-sm text-white font-display">
                  Typography & Font Pairings
                </h3>
              </div>
              <p className="text-xs text-[#A1A1AA]">
                Pair distinctive architectural display fonts with high-legibility body fonts.
              </p>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="text-[11px] text-[#A1A1AA] block mb-1">
                    Heading Display Font
                  </label>
                  <select
                    value={cms.themeCustomization.typography.headingFont}
                    onChange={(e) =>
                      cms.updateThemeCustomization({
                        typography: {
                          ...cms.themeCustomization.typography,
                          headingFont: e.target.value as any,
                        },
                      })
                    }
                    className="w-full bg-[#09090B] border border-[#27272A] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#3ECF8E]"
                  >
                    <option value="Space Grotesk">Space Grotesk (Default CAD Monospace)</option>
                    <option value="Cabinet Grotesk">Cabinet Grotesk (Modern Architectural)</option>
                    <option value="Syne">Syne (Avant-Garde Architectural)</option>
                    <option value="Playfair Display">Playfair Display (Luxury Editorial)</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans (Ultra-clean Tech)</option>
                    <option value="Outfit">Outfit (Geometric Minimalist)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#A1A1AA] block mb-1">
                    Body & Data Font
                  </label>
                  <select
                    value={cms.themeCustomization.typography.bodyFont}
                    onChange={(e) =>
                      cms.updateThemeCustomization({
                        typography: {
                          ...cms.themeCustomization.typography,
                          bodyFont: e.target.value as any,
                        },
                      })
                    }
                    className="w-full bg-[#09090B] border border-[#27272A] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#3ECF8E]"
                  >
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans (Crisp Body)</option>
                    <option value="Inter">Inter (Standard Enterprise)</option>
                    <option value="Space Mono">Space Mono (High-density Telemetry)</option>
                    <option value="DM Sans">DM Sans (Friendly Geometric)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#A1A1AA] block mb-1">
                    Typographic Scale Contrast
                  </label>
                  <select
                    value={cms.themeCustomization.typography.headingScale}
                    onChange={(e) =>
                      cms.updateThemeCustomization({
                        typography: {
                          ...cms.themeCustomization.typography,
                          headingScale: e.target.value as any,
                        },
                      })
                    }
                    className="w-full bg-[#09090B] border border-[#27272A] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#3ECF8E]"
                  >
                    <option value="High (1.333)">High Contrast (Perfect Fourth 1.333)</option>
                    <option value="Medium (1.25)">Medium Contrast (Major Third 1.250)</option>
                    <option value="Dense (1.125)">Dense Studio (Major Second 1.125)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. LAYOUT PRESETS */}
            <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#3ECF8E]" />
                <h3 className="font-bold text-sm text-white font-display">
                  Layout Density Presets
                </h3>
              </div>
              <p className="text-xs text-[#A1A1AA]">
                Switch between compact studio viewport density and expansive architectural white-space.
              </p>

              <div className="space-y-2 font-mono text-xs">
                {[
                  {
                    id: 'High Density (Studio)',
                    desc: 'Compact margins, instant data viewports, cyber telemetry header.',
                  },
                  {
                    id: 'Spaced Architectural',
                    desc: 'Generous negative space, large typography, editorial pacing.',
                  },
                  {
                    id: 'Ultra-wide 1600px',
                    desc: 'Full-bleed monitor grids tailored for 4K CAD workbenches.',
                  },
                ].map((mode) => {
                  const isSelected = cms.themeCustomization.layoutMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => {
                        cms.updateThemeCustomization({ layoutMode: mode.id as any });
                        showToast(`Switched layout mode to ${mode.id}`, 'success');
                      }}
                      className={`w-full p-3 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#09090B] border-[#3ECF8E] text-white font-bold'
                          : 'bg-[#09090B]/60 border-[#27272A] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{mode.id}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#3ECF8E]" />}
                      </div>
                      <p className="text-[10px] text-[#71717A] mt-1 font-normal">
                        {mode.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION REORDERING & VISIBILITY TOGGLE ENGINE */}
          <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#27272A] pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#3ECF8E]" />
                  <h3 className="font-bold text-sm text-white font-display">
                    Homepage Section Order & Visibility Controller
                  </h3>
                </div>
                <p className="text-xs text-[#A1A1AA]">
                  Reorder modules up/down or toggle individual sections on/off to instantly curate the client experience.
                </p>
              </div>

              <div className="text-xs font-mono text-[#3ECF8E] bg-[#09090B] px-3 py-1 rounded-lg border border-[#27272A]">
                {cms.themeCustomization.sectionOrder.filter((s) => s.isVisible).length} /{' '}
                {cms.themeCustomization.sectionOrder.length} Active Sections
              </div>
            </div>

            <div className="space-y-2">
              {cms.themeCustomization.sectionOrder.map((section, idx) => (
                <div
                  key={section.id}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    section.isVisible
                      ? 'bg-[#09090B] border-[#27272A] hover:border-[#3ECF8E]/40'
                      : 'bg-[#09090B]/40 border-zinc-800 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-[#18181B] text-[#A1A1AA] text-xs font-mono font-bold flex items-center justify-center border border-[#27272A]">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-xs text-white font-display">
                        {section.name}
                      </div>
                      <div className="text-[10px] text-[#71717A] font-mono">
                        {section.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Move Up / Down Buttons */}
                    <div className="flex items-center gap-1 bg-[#18181B] p-1 rounded-lg border border-[#27272A]">
                      <button
                        disabled={idx === 0}
                        onClick={() => cms.reorderSections(idx, idx - 1)}
                        className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                        title="Move Section Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={idx === cms.themeCustomization.sectionOrder.length - 1}
                        onClick={() => cms.reorderSections(idx, idx + 1)}
                        className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                        title="Move Section Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Toggle Visibility Switch */}
                    <button
                      onClick={() => {
                        cms.toggleSectionVisibility(section.id);
                        showToast(`Toggled ${section.name} section`, 'info');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        section.isVisible
                          ? 'bg-emerald-950 text-[#3ECF8E] border border-emerald-800 hover:bg-emerald-900'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                      }`}
                    >
                      {section.isVisible ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Visible</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. NAVIGATION & MENU EDITOR TAB */}
      {/* ========================================================================= */}
      {activeTab === 'navigation' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#18181B] p-3 rounded-xl border border-[#27272A]">
            <div className="text-xs text-[#A1A1AA] font-mono">
              Configure Header and Footer navigation menus, dropdown hierarchy, badges, and targets.
            </div>
            <button
              onClick={() => {
                setEditingNav({
                  id: '',
                  label: '',
                  url: '/new-link',
                  isExternal: false,
                  isVisible: true,
                  order: cms.navigationMenu.length + 1,
                  badge: '',
                  children: [],
                });
                setNavModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Navigation Link</span>
            </button>
          </div>

          <div className="space-y-3">
            {cms.navigationMenu.map((item, idx) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-3 hover:border-[#3ECF8E]/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-[#09090B] p-1 rounded-lg border border-[#27272A]">
                      <button
                        disabled={idx === 0}
                        onClick={() => cms.reorderNavItems(idx, idx - 1)}
                        className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        disabled={idx === cms.navigationMenu.length - 1}
                        onClick={() => cms.reorderNavItems(idx, idx + 1)}
                        className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white font-display">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="px-1.5 py-0.2 rounded bg-[#09090B] text-[#3ECF8E] text-[9px] font-mono border border-[#3ECF8E]/30">
                            {item.badge}
                          </span>
                        )}
                        {item.isExternal && (
                          <span className="text-[10px] text-zinc-500 font-mono">(External)</span>
                        )}
                      </div>
                      <span className="text-xs text-[#3ECF8E] font-mono">{item.url}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => cms.toggleNavItemVisibility(item.id)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold flex items-center gap-1 ${
                        item.isVisible
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {item.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{item.isVisible ? 'Visible' : 'Hidden'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingNav(item);
                        setNavModalOpen(true);
                      }}
                      className="p-1.5 rounded bg-[#09090B] hover:bg-[#27272A] text-[#3ECF8E] border border-[#27272A]"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete nav item "${item.label}"?`)) {
                          cms.deleteNavItem(item.id);
                          showToast('Navigation item deleted.', 'info');
                        }
                      }}
                      className="p-1.5 rounded bg-[#09090B] hover:bg-rose-950 text-[#71717A] hover:text-rose-400 border border-[#27272A]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Submenu Children preview */}
                {item.children && item.children.length > 0 && (
                  <div className="pl-6 pt-2 border-t border-[#27272A] space-y-1.5">
                    <span className="text-[10px] font-mono text-[#71717A] uppercase font-bold">
                      Submenu Dropdown Items ({item.children.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {item.children.map((child) => (
                        <div
                          key={child.id}
                          className="p-2 rounded bg-[#09090B] border border-[#27272A] text-xs font-mono flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-white text-[11px]">{child.label}</div>
                            <div className="text-[10px] text-[#3ECF8E] truncate max-w-[140px]">
                              {child.url}
                            </div>
                          </div>
                          {child.badge && (
                            <span className="text-[8px] px-1 rounded bg-[#18181B] text-cyan-400 border border-cyan-800">
                              {child.badge}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MEDIA LIBRARY WITH PLACEHOLDER ENGINE TAB */}
      {/* ========================================================================= */}
      {activeTab === 'media' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#18181B] p-3 rounded-xl border border-[#27272A]">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
              <input
                type="text"
                placeholder="Search assets, formats, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#09090B] border border-[#27272A] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E] font-mono"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <div className="flex items-center bg-[#09090B] p-1 rounded-lg border border-[#27272A]">
                <button
                  onClick={() => setMediaViewMode('grid')}
                  className={`p-1.5 rounded ${mediaViewMode === 'grid' ? 'bg-[#3ECF8E] text-black font-bold' : 'text-zinc-400'}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setMediaViewMode('table')}
                  className={`p-1.5 rounded ${mediaViewMode === 'table' ? 'bg-[#3ECF8E] text-black font-bold' : 'text-zinc-400'}`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => setUploadMediaModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Media Asset</span>
              </button>
            </div>
          </div>

          {/* Media Grid View */}
          {mediaViewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cms.mediaLibrary
                .filter(
                  (item) =>
                    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.format.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl bg-[#18181B] border border-[#27272A] overflow-hidden flex flex-col justify-between hover:border-[#3ECF8E]/40 transition-all group"
                  >
                    <div>
                      <div className="relative h-40 w-full bg-[#09090B] flex items-center justify-center">
                        {item.type === 'image' ? (
                          <Image
                            src={item.url}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                        ) : item.type === 'video' ? (
                          <div className="w-full h-full bg-purple-950/30 flex flex-col items-center justify-center text-purple-400 space-y-1">
                            <span className="text-2xl">🎬</span>
                            <span className="text-[10px] font-mono font-bold">4K AV1 Video</span>
                          </div>
                        ) : (
                          <div className="w-full h-full bg-cyan-950/30 flex flex-col items-center justify-center text-cyan-400 space-y-1">
                            <span className="text-2xl">📦</span>
                            <span className="text-[10px] font-mono font-bold">Draco 3D GLB</span>
                          </div>
                        )}

                        <div className="absolute top-2 left-2 flex items-center gap-1">
                          <span className="px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[#3ECF8E] text-[9px] font-mono font-bold border border-[#3ECF8E]/30">
                            {item.format}
                          </span>
                          {item.isPlaceholder && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500 text-black text-[9px] font-mono font-bold">
                              PLACEHOLDER
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-3 space-y-1.5">
                        <h4 className="font-bold text-xs text-white font-mono truncate" title={item.name}>
                          {item.name}
                        </h4>
                        <div className="text-[10px] font-mono text-[#71717A] flex items-center justify-between">
                          <span>{(item.sizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                          <span>{item.dimensions || 'Dynamic'}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {item.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="text-[9px] px-1 rounded bg-[#09090B] text-[#A1A1AA] border border-[#27272A]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 pt-0 border-t border-[#27272A]/60 flex items-center justify-between mt-2">
                      <button
                        onClick={() => handleCopy(item.url, 'CDN URL')}
                        className="text-[10px] text-[#3ECF8E] font-mono font-bold hover:underline flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy URL</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            if (item.isPlaceholder) {
                              cms.restoreOriginalMedia(item.id, item.url);
                              showToast('Restored original media asset.', 'success');
                            } else {
                              cms.replaceWithPlaceholder(item.id);
                              showToast('Replaced with architectural placeholder.', 'info');
                            }
                          }}
                          className={`p-1.5 rounded text-xs font-mono ${
                            item.isPlaceholder
                              ? 'bg-amber-950 text-amber-400 hover:bg-amber-900 border border-amber-800'
                              : 'bg-[#09090B] text-zinc-400 hover:text-white border border-[#27272A]'
                          }`}
                          title={item.isPlaceholder ? 'Restore original asset' : 'Replace with standard placeholder asset'}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Delete media item "${item.name}"?`)) {
                              cms.deleteMediaItem(item.id);
                              showToast('Media asset removed.', 'info');
                            }
                          }}
                          className="p-1.5 rounded bg-[#09090B] hover:bg-rose-950 text-[#71717A] hover:text-rose-400 border border-[#27272A]"
                          title="Delete media"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Media Table View */}
          {mediaViewMode === 'table' && (
            <div className="rounded-xl border border-[#27272A] overflow-hidden bg-[#18181B]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0D0F14] text-[#A1A1AA] uppercase text-[10px] border-b border-[#27272A]">
                  <tr>
                    <th className="py-3 px-4">Asset Name</th>
                    <th className="py-3 px-4">Type & Format</th>
                    <th className="py-3 px-4">File Size</th>
                    <th className="py-3 px-4">Dimensions</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272A]">
                  {cms.mediaLibrary.map((item) => (
                    <tr key={item.id} className="hover:bg-[#1F2128]">
                      <td className="py-3 px-4 font-bold text-white max-w-xs truncate">
                        {item.name}
                      </td>
                      <td className="py-3 px-4 text-[#3ECF8E]">{item.format}</td>
                      <td className="py-3 px-4 text-zinc-300">
                        {(item.sizeBytes / (1024 * 1024)).toFixed(1)} MB
                      </td>
                      <td className="py-3 px-4 text-zinc-400">{item.dimensions || 'N/A'}</td>
                      <td className="py-3 px-4">
                        {item.isPlaceholder ? (
                          <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 text-[10px] border border-amber-800">
                            Placeholder
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] border border-emerald-800">
                            Original Master
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => handleCopy(item.url, 'URL')}
                          className="p-1 rounded bg-[#09090B] text-[#3ECF8E] border border-[#27272A]"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => cms.replaceWithPlaceholder(item.id)}
                          className="p-1 rounded bg-[#09090B] text-zinc-300 border border-[#27272A]"
                          title="Replace with placeholder"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => cms.deleteMediaItem(item.id)}
                          className="p-1 rounded bg-[#09090B] text-rose-400 border border-[#27272A]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. SOCIAL MEDIA LINKS MANAGEMENT TAB */}
      {/* ========================================================================= */}
      {activeTab === 'social' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#18181B] p-3 rounded-xl border border-[#27272A]">
            <div className="text-xs text-[#A1A1AA] font-mono">
              Manage social networks displayed across Footer, Header, and Studio Contact channels.
            </div>
            <button
              onClick={() => {
                setEditingSocial({
                  id: '',
                  platform: 'Instagram',
                  url: 'https://instagram.com/viztr.studio',
                  handle: '@viztr.studio',
                  isVisible: true,
                  order: cms.socialLinks.length + 1,
                });
                setSocialModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Social Channel</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cms.socialLinks.map((link, idx) => (
              <div
                key={link.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                  link.isVisible
                    ? 'bg-[#18181B] border-[#27272A]'
                    : 'bg-[#121214] border-zinc-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-center text-[#3ECF8E] font-bold text-xs">
                      {link.platform.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white font-display">
                        {link.platform}
                      </div>
                      <div className="text-[11px] text-[#3ECF8E] font-mono truncate max-w-[160px]">
                        {link.handle}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      cms.toggleSocialVisibility(link.id);
                      showToast(`Toggled ${link.platform} visibility`, 'info');
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                      link.isVisible
                        ? 'bg-emerald-950 text-[#3ECF8E] border border-emerald-800 hover:bg-emerald-900'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                    }`}
                  >
                    {link.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{link.isVisible ? 'Visible' : 'Hidden'}</span>
                  </button>
                </div>

                <div className="text-[11px] text-[#71717A] font-mono truncate">
                  {link.url}
                </div>

                <div className="pt-2 border-t border-[#27272A] flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-[#09090B] p-1 rounded-lg border border-[#27272A]">
                    <button
                      disabled={idx === 0}
                      onClick={() => cms.reorderSocialLinks(idx, idx - 1)}
                      className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      disabled={idx === cms.socialLinks.length - 1}
                      onClick={() => cms.reorderSocialLinks(idx, idx + 1)}
                      className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded bg-[#09090B] hover:bg-[#27272A] text-zinc-300 hover:text-white border border-[#27272A]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => {
                        setEditingSocial(link);
                        setSocialModalOpen(true);
                      }}
                      className="p-1.5 rounded bg-[#09090B] hover:bg-[#27272A] text-[#3ECF8E] border border-[#27272A]"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${link.platform} channel?`)) {
                          cms.deleteSocialLink(link.id);
                          showToast('Social link removed.', 'info');
                        }
                      }}
                      className="p-1.5 rounded bg-[#09090B] hover:bg-rose-950 text-[#71717A] hover:text-rose-400 border border-[#27272A]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT PAGE & SEO METADATA CONTROLS */}
      {/* ========================================================================= */}
      {pageModalOpen && editingPage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#18181B] border border-[#27272A] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl text-white font-mono">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#3ECF8E]" />
                <h3 className="text-base font-bold font-display text-white">
                  {editingPage.id ? 'Edit Page & SEO Metadata' : 'Create New Page'}
                </h3>
              </div>
              <button
                onClick={() => setPageModalOpen(false)}
                className="text-[#71717A] hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[#A1A1AA] block mb-1">Page Title *</label>
                <input
                  type="text"
                  value={editingPage.title}
                  onChange={(e) =>
                    setEditingPage({
                      ...editingPage,
                      title: e.target.value,
                      slug: editingPage.id ? editingPage.slug : `/${e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
                    })
                  }
                  className="w-full bg-[#09090B] border border-[#27272A] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#3ECF8E]"
                  placeholder="e.g. Luxury Penthouse Visualizations"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[#A1A1AA] block mb-1">Slug / URL Path *</label>
                  <input
                    type="text"
                    value={editingPage.slug}
                    onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                    className="w-full bg-[#09090B] border border-[#27272A] rounded-lg px-3 py-2 text-[#3ECF8E] focus:outline-none focus:border-[#3ECF8E]"
                    placeholder="/custom-path"
                  />
                </div>

                <div>
                  <label className="text-[#A1A1AA] block mb-1">Status Workflow *</label>
                  <select
                    value={editingPage.status}
                    onChange={(e) =>
                      setEditingPage({ ...editingPage, status: e.target.value as any })
                    }
                    className="w-full bg-[#09090B] border border-[#27272A] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#3ECF8E]"
                  >
                    <option value="draft">Draft (Private)</option>
                    <option value="published">Published (Live Index)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#A1A1AA] block mb-1">Content Summary / Description</label>
                <textarea
                  rows={2}
                  value={editingPage.contentSummary}
                  onChange={(e) => setEditingPage({ ...editingPage, contentSummary: e.target.value })}
                  className="w-full bg-[#09090B] border border-[#27272A] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#3ECF8E]"
                  placeholder="Brief overview of the architectural page purpose..."
                />
              </div>

              {/* SEO CONTROLS FIELDSET */}
              <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#3ECF8E]">
                  <Globe className="w-4 h-4" />
                  <span>SEO & Metadata Controls</span>
                </div>

                <div>
                  <label className="text-[11px] text-[#A1A1AA] block mb-1">
                    Meta Title (Google / Social Display)
                  </label>
                  <input
                    type="text"
                    value={editingPage.seo.metaTitle}
                    onChange={(e) =>
                      setEditingPage({
                        ...editingPage,
                        seo: { ...editingPage.seo, metaTitle: e.target.value },
                      })
                    }
                    className="w-full bg-[#18181B] border border-[#27272A] rounded px-3 py-1.5 text-xs text-white"
                    placeholder="e.g. 8K Luxury Architectural CGI | VizTR Studio"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#A1A1AA] block mb-1">
                    Meta Description (150-160 characters optimal)
                  </label>
                  <textarea
                    rows={2}
                    value={editingPage.seo.metaDescription}
                    onChange={(e) =>
                      setEditingPage({
                        ...editingPage,
                        seo: { ...editingPage.seo, metaDescription: e.target.value },
                      })
                    }
                    className="w-full bg-[#18181B] border border-[#27272A] rounded px-3 py-1.5 text-xs text-white"
                    placeholder="Concise overview for search engine result snippets..."
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#A1A1AA] block mb-1">
                    Keywords (comma-separated tags)
                  </label>
                  <input
                    type="text"
                    value={editingPage.seo.keywords.join(', ')}
                    onChange={(e) =>
                      setEditingPage({
                        ...editingPage,
                        seo: {
                          ...editingPage.seo,
                          keywords: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        },
                      })
                    }
                    className="w-full bg-[#18181B] border border-[#27272A] rounded px-3 py-1.5 text-xs text-white"
                    placeholder="exterior rendering, 3d archviz, webxr"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#27272A]">
              <button
                type="button"
                onClick={() => setPageModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#27272A] text-white text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editingPage.title) {
                    showToast('Please specify a page title.', 'error');
                    return;
                  }
                  if (editingPage.id) {
                    cms.updatePage(editingPage.id, editingPage);
                    showToast(`Updated page "${editingPage.title}"`, 'success');
                  } else {
                    cms.addPage(editingPage);
                    showToast(`Created page "${editingPage.title}"`, 'success');
                  }
                  setPageModalOpen(false);
                }}
                className="px-5 py-2 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black text-xs font-bold flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Page & SEO</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT BLOG ARTICLE */}
      {/* ========================================================================= */}
      {blogModalOpen && editingBlog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#18181B] border border-[#27272A] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl text-white font-mono">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <h3 className="text-base font-bold font-display text-white">
                {editingBlog.id ? 'Edit Blog Article' : 'Write New Article'}
              </h3>
              <button onClick={() => setBlogModalOpen(false)}>
                <X className="w-5 h-5 text-[#71717A]" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#A1A1AA] block mb-1">Article Title *</label>
                <input
                  type="text"
                  value={editingBlog.title}
                  onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                  className="w-full bg-[#09090B] border border-[#27272A] rounded px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#A1A1AA] block mb-1">Category</label>
                  <input
                    type="text"
                    value={editingBlog.category}
                    onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })}
                    className="w-full bg-[#09090B] border border-[#27272A] rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-[#A1A1AA] block mb-1">Slug</label>
                  <input
                    type="text"
                    value={editingBlog.slug}
                    onChange={(e) => setEditingBlog({ ...editingBlog, slug: e.target.value })}
                    className="w-full bg-[#09090B] border border-[#27272A] rounded px-3 py-2 text-[#3ECF8E]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#A1A1AA] block mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={editingBlog.image}
                  onChange={(e) => setEditingBlog({ ...editingBlog, image: e.target.value })}
                  className="w-full bg-[#09090B] border border-[#27272A] rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-[#A1A1AA] block mb-1">Excerpt</label>
                <textarea
                  rows={2}
                  value={editingBlog.excerpt}
                  onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                  className="w-full bg-[#09090B] border border-[#27272A] rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-[#A1A1AA] block mb-1">Markdown Body Content</label>
                <textarea
                  rows={6}
                  value={editingBlog.content.join('\n')}
                  onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value.split('\n') })}
                  className="w-full bg-[#09090B] border border-[#27272A] rounded px-3 py-2 text-white font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#27272A]">
              <button
                onClick={() => setBlogModalOpen(false)}
                className="px-4 py-2 rounded bg-[#27272A] text-white text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editingBlog.id) {
                    cms.updateBlogPost(editingBlog.id, editingBlog);
                    showToast('Article updated.', 'success');
                  } else {
                    cms.addBlogPost(editingBlog);
                    showToast('Article published.', 'success');
                  }
                  setBlogModalOpen(false);
                }}
                className="px-5 py-2 rounded bg-[#3ECF8E] text-black text-xs font-bold"
              >
                Save Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT SERVICE OFFERING */}
      {/* ========================================================================= */}
      {serviceModalOpen && editingService && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#18181B] border border-[#27272A] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl text-white font-mono">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <h3 className="text-base font-bold font-display text-white">
                {editingService.id ? 'Edit Service Offering' : 'Add Service'}
              </h3>
              <button onClick={() => setServiceModalOpen(false)}>
                <X className="w-5 h-5 text-[#71717A]" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#A1A1AA] block mb-1">Service Name *</label>
                <input
                  type="text"
                  value={editingService.name}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  className="w-full bg-[#09090B] border border-[#27272A] rounded px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#A1A1AA] block mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={editingService.heroBadge}
                    onChange={(e) => setEditingService({ ...editingService, heroBadge: e.target.value })}
                    className="w-full bg-[#09090B] border border-[#27272A] rounded px-3 py-2 text-[#3ECF8E]"
                  />
                </div>
                <div>
                  <label className="text-[#A1A1AA] block mb-1">Starting Price</label>
                  <input
                    type="text"
                    value={editingService.priceStartingFrom}
                    onChange={(e) => setEditingService({ ...editingService, priceStartingFrom: e.target.value })}
                    className="w-full bg-[#09090B] border border-[#27272A] rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#A1A1AA] block mb-1">Tagline</label>
                <input
                  type="text"
                  value={editingService.tagline}
                  onChange={(e) => setEditingService({ ...editingService, tagline: e.target.value })}
                  className="w-full bg-[#09090B] border border-[#27272A] rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-[#A1A1AA] block mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={editingService.description}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  className="w-full bg-[#09090B] border border-[#27272A] rounded px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#27272A]">
              <button
                onClick={() => setServiceModalOpen(false)}
                className="px-4 py-2 rounded bg-[#27272A] text-white text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editingService.id) {
                    cms.updateService(editingService.id, editingService);
                    showToast('Service offering saved.', 'success');
                  } else {
                    cms.addService(editingService);
                    showToast('Service added.', 'success');
                  }
                  setServiceModalOpen(false);
                }}
                className="px-5 py-2 rounded bg-[#3ECF8E] text-black text-xs font-bold"
              >
                Save Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EDIT TESTIMONIAL */}
      {/* ========================================================================= */}
      {testimonialModalOpen && editingTestimonial && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181B] border border-[#27272A] rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl text-white font-mono">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <h3 className="text-base font-bold font-display text-white">
                {editingTestimonial.id ? 'Edit Testimonial' : 'Add Testimonial'}
              </h3>
              <button onClick={() => setTestimonialModalOpen(false)}>
                <X className="w-5 h-5 text-[#71717A]" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#A1A1AA] block mb-1">Client Full Name *</label>
                <input
                  type="text"
                  value={editingTestimonial.clientName}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, clientName: e.target.value })}
                  className="w-full bg-[#09090B] border border-[#27272A] rounded px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#A1A1AA] block mb-1">Executive Role</label>
                  <input
                    type="text"
                    value={editingTestimonial.role}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                    className="w-full bg-[#09090B] border border-[#27272A] rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-[#A1A1AA] block mb-1">Company / Atelier</label>
                  <input
                    type="text"
                    value={editingTestimonial.company}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, company: e.target.value })}
                    className="w-full bg-[#09090B] border border-[#27272A] rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#A1A1AA] block mb-1">Quote Text *</label>
                <textarea
                  rows={3}
                  value={editingTestimonial.quote}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })}
                  className="w-full bg-[#09090B] border border-[#27272A] rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-[#A1A1AA] block mb-1">Star Rating (1-5)</label>
                <select
                  value={editingTestimonial.rating}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, rating: Number(e.target.value) })}
                  className="w-full bg-[#09090B] border border-[#27272A] rounded px-3 py-2 text-amber-400 font-bold"
                >
                  <option value={5}>★★★★★ (5 Stars)</option>
                  <option value={4}>★★★★☆ (4 Stars)</option>
                  <option value={3}>★★★☆☆ (3 Stars)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#27272A]">
              <button
                onClick={() => setTestimonialModalOpen(false)}
                className="px-4 py-2 rounded bg-[#27272A] text-white text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editingTestimonial.id) {
                    cms.updateTestimonial(editingTestimonial.id, editingTestimonial);
                    showToast('Testimonial saved.', 'success');
                  } else {
                    cms.addTestimonial(editingTestimonial);
                    showToast('Testimonial added.', 'success');
                  }
                  setTestimonialModalOpen(false);
                }}
                className="px-5 py-2 rounded bg-[#3ECF8E] text-black text-xs font-bold"
              >
                Save Testimonial
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: EDIT SOCIAL MEDIA CHANNEL */}
      {/* ========================================================================= */}
      {socialModalOpen && editingSocial && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181B] border border-[#27272A] rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl text-white font-mono">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <h3 className="text-base font-bold font-display text-white">
                {editingSocial.id ? 'Edit Social Channel' : 'Add Social Network'}
              </h3>
              <button onClick={() => setSocialModalOpen(false)}>
                <X className="w-5 h-5 text-[#71717A]" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#A1A1AA] block mb-1">Platform Network</label>
                <select
                  value={editingSocial.platform}
                  onChange={(e) => setEditingSocial({ ...editingSocial, platform: e.target.value as any })}
                  className="w-full bg-[#09090B] border border-[#27272A] rounded px-3 py-2 text-white"
                >
                  {['Instagram', 'LinkedIn', 'Twitter', 'YouTube', 'GitHub', 'ArtStation', 'Behance', 'Discord', 'Facebook', 'Pinterest', 'Vimeo'].map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#A1A1AA] block mb-1">Profile URL *</label>
                <input
                  type="text"
                  value={editingSocial.url}
                  onChange={(e) => setEditingSocial({ ...editingSocial, url: e.target.value })}
                  className="w-full bg-[#09090B] border border-[#27272A] rounded px-3 py-2 text-[#3ECF8E]"
                  placeholder="https://instagram.com/viztr.studio"
                />
              </div>

              <div>
                <label className="text-[#A1A1AA] block mb-1">Handle / Label</label>
                <input
                  type="text"
                  value={editingSocial.handle}
                  onChange={(e) => setEditingSocial({ ...editingSocial, handle: e.target.value })}
                  className="w-full bg-[#09090B] border border-[#27272A] rounded px-3 py-2 text-white"
                  placeholder="@viztr.studio"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#27272A]">
              <button
                onClick={() => setSocialModalOpen(false)}
                className="px-4 py-2 rounded bg-[#27272A] text-white text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editingSocial.id) {
                    cms.updateSocialLink(editingSocial.id, editingSocial);
                    showToast('Social channel updated.', 'success');
                  } else {
                    cms.addSocialLink(editingSocial);
                    showToast('Social channel added.', 'success');
                  }
                  setSocialModalOpen(false);
                }}
                className="px-5 py-2 rounded bg-[#3ECF8E] text-black text-xs font-bold"
              >
                Save Social Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: SIMULATED MEDIA UPLOADER */}
      {/* ========================================================================= */}
      {uploadMediaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181B] border border-[#27272A] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-white font-mono">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#3ECF8E]" />
                <h3 className="text-base font-bold font-display text-white">
                  Upload Media Asset to CDN
                </h3>
              </div>
              <button onClick={() => setUploadMediaModalOpen(false)}>
                <X className="w-5 h-5 text-[#71717A]" />
              </button>
            </div>

            {/* Drag and drop target */}
            <div className="p-8 border-2 border-dashed border-[#27272A] hover:border-[#3ECF8E] rounded-xl text-center space-y-3 bg-[#09090B]/60 transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-[#3ECF8E]/10 border border-[#3ECF8E]/40 flex items-center justify-center mx-auto text-[#3ECF8E]">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-white font-bold">
                  Drag and drop 8K TIFFs, EXRs, GLB 3D files, or 4K MP4 reels
                </p>
                <p className="text-[10px] text-[#71717A] mt-1">
                  Supported formats: TIFF, PNG, EXR, GLB, GLTF, USDZ, MP4 (up to 2GB)
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#27272A]">
              <button
                onClick={() => setUploadMediaModalOpen(false)}
                className="px-4 py-2 rounded bg-[#27272A] text-white text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  cms.addMediaItem({
                    name: `New Architectural Master ${Date.now().toString(36)}.tiff`,
                    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85',
                    placeholderUrl: 'https://picsum.photos/seed/new-upload/1920/1080',
                    isPlaceholder: false,
                    type: 'image',
                    format: 'TIFF (8K)',
                    sizeBytes: 195000000,
                    dimensions: '7680 x 4320 (300 DPI)',
                    category: 'renders',
                    tags: ['new-upload', '8k', 'hero'],
                  });
                  showToast('Uploaded asset to VizTR Cloud CDN.', 'success');
                  setUploadMediaModalOpen(false);
                }}
                className="px-5 py-2 rounded bg-[#3ECF8E] text-black text-xs font-bold flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simulate Complete Upload</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
