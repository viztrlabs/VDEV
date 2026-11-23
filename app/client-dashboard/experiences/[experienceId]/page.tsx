'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Box,
  ScanLine,
  Headset,
  Compass,
  Cpu,
  Sparkles,
  Play,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Globe,
  Layers,
  Share2,
  Download,
  Eye,
  Settings,
  Info,
  X,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useClientSession } from '@/lib/hooks/useClientSession';
import { useExperienceRealtime } from '@/lib/useRealtime';

const EXPERIENCE_TYPES = {
  webxr: { name: 'WebXR', icon: Box, color: 'text-amber-400', bg: 'bg-amber-500/10', description: 'Immersive WebXR experiences in your browser', viewer: 'XRViewer' },
  webar: { name: 'WebAR', icon: ScanLine, color: 'text-cyan-400', bg: 'bg-cyan-500/10', description: 'Browser-based augmented reality experiences', viewer: 'ARViewer' },
  'virtual-reality': { name: 'Virtual Reality', icon: Headset, color: 'text-violet-400', bg: 'bg-violet-500/10', description: 'Full VR experience with headset support', viewer: 'VRViewer' },
  'virtual-tour': { name: 'Virtual Tour', icon: Compass, color: 'text-sky-400', bg: 'bg-sky-500/10', description: '360° interactive panoramic tours', viewer: 'TourViewer' },
  'gaussian-splat': { name: 'Gaussian Splat', icon: Cpu, color: 'text-emerald-400', bg: 'bg-emerald-500/10', description: '3D Gaussian Splatting viewer', viewer: 'SplatViewer' },
} as const;

interface ExperienceDetailPageProps {
  params: Promise<{ experienceId: string }>;
}

export default function ExperienceDetailPage({ params }: ExperienceDetailPageProps) {
  const router = useRouter();
  const { isAuthenticated } = useClientSession();
  const { showToast } = useAppStore();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [experience, setExperience] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/client-access');
      return;
    }
    fetchExperience();
  }, [params, isAuthenticated, router]);

  const fetchExperience = async () => {
    const { experienceId } = await params;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/experiences?projectId=${projectId || ''}&id=${experienceId}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.experiences && data.experiences.length > 0) {
          setExperience(data.experiences[0]);
        } else if (data.data && data.data.length > 0) {
          setExperience(data.data[0]);
        } else {
          setError('Experience not found');
        }
      } else {
        setError('Failed to load experience');
      }
    } catch (err) {
      setError('Network error loading experience');
    } finally {
      setLoading(false);
    }
  };

  useExperienceRealtime(projectId || '', () => fetchExperience());

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--primary)] mx-auto mb-4" />
          <p className="text-[var(--text-muted)]">Loading experience...</p>
        </div>
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400/50 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Experience Not Found</h1>
          <p className="text-[var(--text-muted)] mb-6">{error || 'The requested experience could not be loaded.'}</p>
          <Link
            href="/client-dashboard?tab=experience"
            className="px-6 py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-black font-bold transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Experiences
          </Link>
        </div>
      </div>
    );
  }

  const expType = experience.type || experience.experienceType || 'webxr';
  const typeConfig = EXPERIENCE_TYPES[expType as keyof typeof EXPERIENCE_TYPES] || EXPERIENCE_TYPES.webxr;
  const status = experience.status || 'draft';
  const isPublished = status === 'published' || status === 'live' || status === 'active';

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col">
      <header className="h-16 border-b border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link
            href={`/client-dashboard?tab=experience${projectId ? `&projectId=${projectId}` : ''}`}
            className="p-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            aria-label="Back to experiences"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeConfig.bg}`}>
              <typeConfig.icon className={`w-6 h-6 ${typeConfig.color}`} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)] truncate max-w-md">{experience.title || experience.name || experience.id}</h1>
              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${typeConfig.bg.replace('bg-', 'bg-').replace('/10', '')} ${typeConfig.color}`}>
                  {typeConfig.name}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${isPublished 
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' 
                  : 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                } border`}>
                  {status}
                </span>
              </div>
            </div>
          </div>
        </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  {experience.description && (
                    <p className="text-[var(--text-secondary)] leading-relaxed">{experience.description}</p>
                  )}
                  {!experience.description && (
                    <p className="text-[var(--text-muted)] italic">No description provided.</p>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {isPublished && (
                    <button
                      onClick={() => {
                        const viewerUrl = `/experience-live/${projectId || experience.projectId || 'default'}?experienceId=${experience.id || experience.slug}`;
                        window.open(viewerUrl, '_blank', 'noopener,noreferrer');
                      }}
                      className="px-6 py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-black font-bold flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_var(--accent-glow)]"
                    >
                      <Play className="w-5 h-5" />
                      <span>Launch Experience</span>
                    </button>
                  )}
                  {!isPublished && (
                    <div className="px-4 py-2 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-300 text-sm font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>Not published yet — contact your project manager for access</span>
                    </div>
                  )}
                  <Link
                    href={`/experience-live/${projectId || experience.projectId || 'default'}?experienceId=${experience.id || experience.slug}`}
                    className="px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--text-primary)] font-medium flex items-center gap-2 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Viewer Page</span>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <p className="text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1">Slug / ID</p>
                  <p className="font-mono text-sm text-[var(--text-primary)] truncate">{experience.slug || experience.id}</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <p className="text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1">Project</p>
                  <p className="font-medium text-sm text-[var(--text-primary)] truncate">{projectId || experience.projectId || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <p className="text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1">Created</p>
                  <p className="font-mono text-sm text-[var(--text-secondary)]">{experience.created_at ? new Date(experience.created_at).toLocaleDateString() : 'Unknown'}</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <p className="text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1">Updated</p>
                  <p className="font-mono text-sm text-[var(--text-secondary)]">{experience.updated_at ? new Date(experience.updated_at).toLocaleDateString() : 'Unknown'}</p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                Features & Capabilities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: 'Cross-Platform', desc: 'Works on desktop, mobile, and VR headsets', icon: Globe },
                  { label: 'No Install Required', desc: 'Runs directly in the browser', icon: Box },
                  { label: 'Real-time Collaboration', desc: 'Multi-user sessions supported', icon: Layers },
                  { label: 'Spatial Audio', desc: 'Immersive 3D soundscapes', icon: Layers },
                  { label: 'Offline Support', desc: 'Cached for offline viewing', icon: Download },
                  { label: 'Analytics Tracking', desc: 'Engagement & heatmap data', icon: Sparkles },
                ].map((feature) => (
                  <div key={feature.label} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)]/50 border border-[var(--border)]/50">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeConfig.bg}`}>
                      <feature.icon className={`w-4 h-4 ${typeConfig.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{feature.label}</p>
                      <p className="text-xs text-[var(--text-muted)]">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {experience.specs && (
              <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[var(--primary)]" />
                  Technical Specifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(experience.specs).map(([key, value]) => (
                    <div key={key} className="p-3 rounded-lg bg-[var(--bg-tertiary)]/50 border border-[var(--border)]/50">
                      <p className="text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1">{key}</p>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {experience.tags && experience.tags.length > 0 && (
              <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-[var(--primary)]" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {experience.tags.map((tag: string, idx: number) => (
                    <span key={idx} className={`px-3 py-1 rounded-full text-xs font-mono ${typeConfig.bg} ${typeConfig.color} border border-current/20`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-[var(--border)] flex flex-wrap gap-3">
              <Link
                href={`/client-dashboard/projects/${projectId || experience.projectId}`}
                className="px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--text-primary)] font-medium flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Project</span>
              </Link>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('Experience link copied to clipboard!', 'success');
                }}
                className="px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--text-primary)] font-medium flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Link</span>
              </button>
              {isPublished && (
                <button
                  onClick={() => {
                    const viewerUrl = `/experience-live/${projectId || experience.projectId || 'default'}?experienceId=${experience.id || experience.slug}`;
                    window.open(viewerUrl, '_blank', 'noopener,noreferrer');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-black font-bold flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_var(--accent-glow)]"
                >
                  <Eye className="w-4 h-4" />
                  <span>Launch Now</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }