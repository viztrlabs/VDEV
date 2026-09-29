'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Plus,
  Grid3X3,
  List as ListIcon,
  Search,
  Edit3,
  Eye,
  Trash2,
  Share2,
  Calendar,
  Layers,
  Cloud,
  Wrench,
  HardDrive,
  Lock,
  Clock,
  Tag,
  Crown,
  Star,
  Copy,
  Globe,
} from 'lucide-react';
import type { TourSummary } from '@/lib/tourCollaboration';

const AIFloorplanWizard = dynamic(() => import('@/components/editor/AIFloorplanWizard'), {
  ssr: false,
});

type Tab = 'projects' | 'media' | 'tools' | 'promotion' | 'enterprise';

const PROMOTION_CARDS = [
  { title: 'Survey', body: 'Do survey & get cashback/discount.', badge: 'ONLY FOR PAID USERS' },
  { title: 'Trustpilot', body: 'Join us for 20% Off Yearly.', badge: 'Submit screenshot' },
  { title: 'ProductHunt', body: 'Support us by rating & get 30% off.', badge: 'Submit URL' },
];

export default function TourDashboardPage() {
  const [tab, setTab] = useState<Tab>('projects');
  const [tours, setTours] = useState<TourSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showFloorplanWizard, setShowFloorplanWizard] = useState(false);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tours');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'failed');
      setTours(data.tours || []);
    } catch (e: any) {
      setError(e?.message || 'failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'projects') fetchTours();
  }, [tab]);

  const createTour = async () => {
    const title = prompt('Tour name?');
    if (!title) return;
    try {
      const res = await fetch('/api/tours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || `create failed (${res.status})`);
      setNotice(`Tour "${title}" created. Open it in the editor to add scenes.`);
      fetchTours();
    } catch (e: any) {
      setError(e?.message || 'create failed');
    }
  };

  const removeTour = async (t: TourSummary) => {
    if (!confirm(`Delete tour "${t.title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/tours?id=${encodeURIComponent(t.id)}`, { method: 'DELETE' });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || `delete failed (${res.status})`);
      setNotice(`Tour "${t.title}" deleted.`);
      fetchTours();
    } catch (e: any) {
      setError(e?.message || 'delete failed');
    }
  };

  const togglePublish = async (t: TourSummary) => {
    try {
      const res = await fetch(`/api/tours?id=${encodeURIComponent(t.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          t.is_live
            ? { is_live: false }
            : { is_live: true, access_level: 'public' },
        ),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || `update failed (${res.status})`);
      setNotice(t.is_live ? `"${t.title}" unpublished.` : `"${t.title}" is live at /virtual-tour/${t.slug || t.id}`);
      fetchTours();
    } catch (e: any) {
      setError(e?.message || 'update failed');
    }
  };

  const duplicateTour = async (t: TourSummary) => {
    try {
      const res = await fetch(`/api/tours?id=${encodeURIComponent(t.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'duplicate' }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || `duplicate failed (${res.status})`);
      setNotice(`Duplicated "${t.title}".`);
      fetchTours();
    } catch (e: any) {
      setError(e?.message || 'duplicate failed');
    }
  };

  const shareTour = async (t: TourSummary) => {
    const url = `${window.location.origin}/virtual-tour/${t.slug || t.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setNotice(`Public link copied: ${url}`);
    } catch {
      setNotice(`Public link: ${url}`);
    }
  };

  const filtered = tours.filter((t) => {
    const published = t.is_live;
    if (filter === 'published' && !published) return false;
    if (filter === 'draft' && published) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="h-screen bg-[#09090B] text-white flex flex-col">
      {/* Content (no top nav, no footer — fills the viewport) */}
      <div className="flex-1 min-h-0 overflow-auto">
        {tab === 'projects' && (
          <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            {error && (
              <div className="mb-3 px-3 py-2 bg-rose-950/40 border border-rose-900 text-rose-300 text-xs font-mono rounded flex items-center justify-between gap-2">
                <span>{error}</span>
                <button type="button" onClick={() => setError(null)} className="text-rose-400 hover:text-white">×</button>
              </div>
            )}
            {notice && (
              <div className="mb-3 px-3 py-2 bg-emerald-950/40 border border-emerald-900 text-emerald-300 text-xs font-mono rounded flex items-center justify-between gap-2">
                <span>{notice}</span>
                <button type="button" onClick={() => setNotice(null)} className="text-emerald-400 hover:text-white">×</button>
              </div>
            )}

            {/* Section title + tabs */}
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div>
                <h1 className="text-base font-mono font-bold text-white">Tour Projects</h1>
                <p className="text-[10px] font-mono text-[#71717A]">Manage your 360° virtual tours</p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['projects', 'media', 'tools', 'promotion', 'enterprise'] as Tab[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize ${
                      tab === t
                        ? 'bg-[#18181B] text-white border border-[#27272A]'
                        : 'text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={createTour}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold font-mono"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Tour
                </button>
                <button
                  type="button"
                  onClick={() => setView('grid')}
                  className={`p-1.5 rounded ${view === 'grid' ? 'bg-[#3ECF8E] text-black' : 'text-[#A1A1AA] hover:text-white'}`}
                  title="Grid view"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className={`p-1.5 rounded ${view === 'list' ? 'bg-[#3ECF8E] text-black' : 'text-[#A1A1AA] hover:text-white'}`}
                  title="List view"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="ml-2 bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-[10px] font-mono text-white"
                >
                  <option value="all">All</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
                <span className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-mono ml-2">
                  <Clock className="w-3 h-3" />
                  7d 9m Trial left
                </span>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-[#71717A]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tours…"
                  className="pl-7 pr-2 py-1.5 rounded bg-[#18181B] border border-[#27272A] text-xs font-mono text-white w-48"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center text-xs font-mono text-[#71717A] py-12">Loading tours…</div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-xs font-mono text-[#71717A] py-12 border border-dashed border-[#27272A] rounded-lg">
                {tours.length === 0 ? 'No tours yet. Click "New Tour" to start.' : 'No tours match the filter.'}
              </div>
            ) : view === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filtered.map((t) => (
                  <TourCard
                    key={t.id}
                    tour={t}
                    onTogglePublish={() => togglePublish(t)}
                    onDuplicate={() => duplicateTour(t)}
                    onShare={() => shareTour(t)}
                    onDelete={() => removeTour(t)}
                  />
                ))}
              </div>
            ) : (
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="text-[#71717A] border-b border-[#27272A]">
                    <th className="text-left p-2">Tour</th>
                    <th className="text-left p-2">Scenes</th>
                    <th className="text-left p-2">Views</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Modified</th>
                    <th className="text-right p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} className="border-b border-[#18181B] hover:bg-[#0c0c0f]">
                      <td className="p-2 flex items-center gap-2">
                        {t.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={t.thumbnailUrl} alt={t.title} className="w-8 h-8 rounded object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-[#27272A]" />
                        )}
                        <div>
                          <div className="text-white">{t.title}</div>
                          <div className="text-[9px] text-[#71717A]">{t.slug || t.id.slice(-8)}</div>
                        </div>
                      </td>
                      <td className="p-2 text-[#A1A1AA]">
                        <span className="px-1.5 py-0.5 rounded bg-[#27272A]">{t.sceneCount ?? 0} scene{(t.sceneCount ?? 0) === 1 ? '' : 's'}</span>
                      </td>
                      <td className="p-2 text-[#A1A1AA]">{t.views ?? 0}</td>
                      <td className="p-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            t.is_live
                              ? 'bg-[#3ECF8E]/15 text-[#3ECF8E]'
                              : 'bg-amber-500/15 text-amber-400'
                          }`}
                        >
                          {t.is_live ? 'Live' : 'Draft'}
                        </span>
                      </td>
                      <td className="p-2 text-[#A1A1AA]">
                        {t.updated_at ? new Date(t.updated_at).toLocaleString() : '—'}
                      </td>
                      <td className="p-2 text-right whitespace-nowrap">
                        <Link
                          href={`/xr-world/virtual-tour/editor?tour=${encodeURIComponent(t.id)}`}
                          className="inline-flex p-1 hover:text-[#3ECF8E]"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>
                        {t.is_live && (
                          <Link
                            href={`/virtual-tour/${t.slug || t.id}`}
                            className="inline-flex p-1 hover:text-[#3ECF8E]"
                            title="View public tour"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => togglePublish(t)}
                          className="inline-flex p-1 hover:text-[#3ECF8E]"
                          title={t.is_live ? 'Unpublish' : 'Publish'}
                        >
                          <Globe className={`w-3.5 h-3.5 ${t.is_live ? 'text-[#3ECF8E]' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicateTour(t)}
                          className="inline-flex p-1 hover:text-[#3ECF8E]"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => shareTour(t)}
                          className="inline-flex p-1 hover:text-[#3ECF8E]"
                          title="Copy public link"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeTour(t)}
                          className="inline-flex p-1 hover:text-rose-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'media' && <MediaSection />}
        {tab === 'tools' && <ToolsSection onOpenWizard={() => setShowFloorplanWizard(true)} />}
        {tab === 'promotion' && <PromotionSection />}
        {tab === 'enterprise' && <EnterpriseSection />}
      </div>

      {showFloorplanWizard && (
        <AIFloorplanWizard
          onGenerate={() => setShowFloorplanWizard(false)}
          onCancel={() => setShowFloorplanWizard(false)}
        />
      )}
    </div>
  );
}

function TourCard({
  tour,
  onTogglePublish,
  onDuplicate,
  onShare,
  onDelete,
}: {
  tour: TourSummary;
  onTogglePublish: () => void;
  onDuplicate: () => void;
  onShare: () => void;
  onDelete: () => void;
}) {
  const publicHref = `/virtual-tour/${tour.slug || tour.id}`;
  return (
    <div className="group rounded-lg border border-[#27272A] bg-[#0c0c0f] overflow-hidden hover:border-[#3ECF8E]/40 transition-colors">
      <div className="relative aspect-video bg-[#18181B]">
        {tour.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tour.thumbnailUrl} alt={tour.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#27272A]">
            <Layers className="w-12 h-12" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex items-center gap-1.5">
            <Link
              href={`/xr-world/virtual-tour/editor?tour=${encodeURIComponent(tour.id)}`}
              className="p-2 rounded bg-[#3ECF8E] text-black"
              title="Edit"
            >
              <Edit3 className="w-4 h-4" />
            </Link>
            {tour.is_live ? (
              <Link
                href={publicHref}
                className="p-2 rounded bg-white/10 backdrop-blur text-white border border-white/20"
                title="View public tour"
              >
                <Eye className="w-4 h-4" />
              </Link>
            ) : (
              <span
                className="p-2 rounded bg-white/10 backdrop-blur text-white/30 border border-white/10 cursor-not-allowed"
                title="Publish first to view"
              >
                <Eye className="w-4 h-4" />
              </span>
            )}
            <button
              type="button"
              onClick={onShare}
              className="p-2 rounded bg-white/10 backdrop-blur text-white border border-white/20"
              title={tour.is_live ? 'Copy public link' : 'Copy link (publish first to make it public)'}
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onDuplicate}
              className="p-2 rounded bg-white/10 backdrop-blur text-white border border-white/20"
              title="Duplicate"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="p-2 rounded bg-rose-500/80 text-white"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white flex items-center gap-1">
          <Tag className="w-2.5 h-2.5" />
          {tour.is_live ? 'Live' : 'Draft'}
        </div>
        <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white">
          {tour.sceneCount ?? 0} scene{(tour.sceneCount ?? 0) === 1 ? '' : 's'}
        </div>
      </div>
      <div className="p-2.5 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-mono text-white truncate" title={tour.title}>
            {tour.title}
          </span>
          <button
            type="button"
            onClick={onTogglePublish}
            className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
              tour.is_live
                ? 'bg-[#3ECF8E]/15 text-[#3ECF8E] hover:bg-[#3ECF8E]/25'
                : 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25'
            }`}
            title={tour.is_live ? 'Click to unpublish' : 'Click to publish'}
          >
            {tour.is_live ? 'Live' : 'Publish'}
          </button>
        </div>
        <div className="text-[10px] font-mono text-[#71717A] flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {tour.updated_at ? new Date(tour.updated_at).toLocaleDateString() : '—'}
          </span>
          <span className="flex items-center gap-1" title="Total public views">
            <Eye className="w-3 h-3" />
            {tour.views ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
}

// =============== Tools ===============
function ToolsSection({ onOpenWizard }: { onOpenWizard: () => void }) {
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4">
      <h2 className="text-base font-mono font-bold text-[#3ECF8E]">Tools</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ToolCard
          icon={<Wrench className="w-5 h-5" />}
          title="AI Floorplan Maker"
          body="3-step wizard: select 2D floorplan → configure style → generate."
          locked={false}
          onClick={onOpenWizard}
        />
        <ToolCard
          icon={<HardDrive className="w-5 h-5" />}
          title="Static Hosting"
          body="Connect AWS S3 credentials and host 360° tours 100× cheaper than SaaS."
          href="/xr-world/virtual-tour/hosting"
        />
        <ToolCard
          icon={<Layers className="w-5 h-5" />}
          title="Object 360 Creator"
          body="Convert a folder of frames into a 360° product spin."
        />
        <ToolCard
          icon={<Wrench className="w-5 h-5" />}
          title="Bulk Optimizer"
          body="Compress & re-encode all panoramas in one pass."
        />
      </div>
    </div>
  );
}

function ToolCard({
  icon,
  title,
  body,
  href,
  locked,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  href?: string;
  locked?: boolean;
  onClick?: () => void;
}) {
  const inner = (
    <div className="rounded-xl border border-[#27272A] bg-[#0c0c0f] p-4 hover:border-[#3ECF8E]/40 transition-colors cursor-pointer">
      <div className="flex items-center gap-2 mb-1 text-[#3ECF8E]">
        {icon}
        <span className="text-sm font-mono font-bold">{title}</span>
        {locked && <Lock className="w-3 h-3 text-amber-400 ml-auto" />}
      </div>
      <p className="text-[10px] font-mono text-[#A1A1AA] leading-relaxed">{body}</p>
    </div>
  );
  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  if (onClick) {
    return <div onClick={onClick}>{inner}</div>;
  }
  return inner;
}

// =============== Media placeholder ===============
function MediaSection() {
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto text-center text-xs font-mono text-[#71717A] py-12">
      <Cloud className="w-8 h-8 mx-auto mb-2 text-[#27272A]" />
      Media library — go to{' '}
      <Link href="/xr-world/virtual-tour/editor" className="text-[#3ECF8E] hover:underline">
        Tour Editor
      </Link>{' '}
      to upload panoramas.
    </div>
  );
}

// =============== Promotion ===============
function PromotionSection() {
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4">
      <h2 className="text-base font-mono font-bold text-[#3ECF8E]">Promotion</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PROMOTION_CARDS.map((c) => (
          <div key={c.title} className="rounded-xl border border-[#27272A] bg-[#0c0c0f] p-4 space-y-2">
            <div className="text-[10px] font-mono uppercase text-amber-400 tracking-wider">{c.badge}</div>
            <div className="text-sm font-mono font-bold text-white">{c.title}</div>
            <p className="text-[10px] font-mono text-[#A1A1AA]">{c.body}</p>
            <button className="w-full px-3 py-1.5 rounded bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-mono font-bold">
              Submit Result
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============== Enterprise ===============
function EnterpriseSection() {
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4">
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 flex items-center gap-2">
        <Crown className="w-4 h-4 text-amber-400" />
        <span className="text-[10px] font-mono text-amber-300">
          This is Enterprise feature, please upgrade the plan to use.
        </span>
        <button className="ml-auto px-2.5 py-1 rounded bg-amber-400 text-black text-[10px] font-mono font-bold flex items-center gap-1">
          <Star className="w-3 h-3" />
          Upgrade Now
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card title="White Label" locked>
          Branding name, title, description, studio URL, tour URL, primary color, logo, SEO image, favicon.
        </Card>
        <Card title="Users" locked>
          Team members, roles, and access policies.
        </Card>
        <Card title="Default Setup" locked>
          Default tour theme, language, and feature flags.
        </Card>
        <Card title="Domain Verification" locked>
          DNS verification for custom studio + tour URLs.
        </Card>
      </div>
    </div>
  );
}

function Card({ title, body, locked, children }: { title: string; body?: string; locked?: boolean; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#27272A] bg-[#0c0c0f] p-3 space-y-2">
      <div className="flex items-center gap-2 text-[#A1A1AA]">
        <span className="text-sm font-mono font-bold">{title}</span>
        {locked && <Lock className="w-3 h-3 ml-auto" />}
      </div>
      <p className="text-[10px] font-mono text-[#71717A]">{body ?? children}</p>
    </div>
  );
}