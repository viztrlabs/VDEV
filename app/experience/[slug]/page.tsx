'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ExperienceViewer } from '@/components/xr/ExperienceViewer';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getExperience(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/experiences/public/${slug}`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.success ? json : null;
}

export default function ExperiencePage({ params }: PageProps) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showChrome, setShowChrome] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    params.then(({ slug }) => {
      getExperience(slug)
        .then((d) => {
          setData(d);
          setLoading(false);
        })
        .catch(() => {
          setData(null);
          setLoading(false);
        });
    });
  }, [params]);

  // Auto-hide chrome after 3s
  useEffect(() => {
    if (!showChrome) return;
    const timer = setTimeout(() => setShowChrome(false), 3000);
    return () => clearTimeout(timer);
  }, [showChrome]);

  // Show chrome on mouse move — only setState when value changes
  const handleMouseMove = () => {
    setShowChrome((prev) => (prev ? prev : true));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="text-xs font-mono text-[#3ECF8E]">Loading experience…</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-white mb-2">Experience Not Found</h1>
          <p className="text-sm text-[#71717A]">This experience may not exist or has not been published.</p>
        </div>
      </div>
    );
  }

  const { experience, config } = data;

  return (
    <div className="min-h-screen bg-[#09090B]" onMouseMove={handleMouseMove}>
      {/* Full-screen viewer */}
      <div className="h-screen">
        <ExperienceViewer experience={experience} config={config} />
      </div>

      {/* Chrome overlay - back button + title */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-opacity duration-300 ${
          showChrome ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3 p-4 bg-gradient-to-b from-black/60 to-transparent">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <h1 className="text-sm font-mono text-white/80 truncate">{experience.title}</h1>
        </div>
      </div>

      {/* Collapsible metadata panel */}
      <div className="border-t border-[#27272A]">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-3 flex items-center justify-between text-xs font-mono text-[#71717A] hover:text-[#A1A1AA] transition-colors"
        >
          <span>Experience Details</span>
          <span>{expanded ? '−' : '+'}</span>
        </button>
        {expanded && (
          <div className="px-4 pb-4 space-y-2 text-xs font-mono text-[#A1A1AA]">
            {experience.description && (
              <p>{experience.description}</p>
            )}
            <p><strong>Status:</strong> {experience.status}</p>
            {experience.published_at && (
              <p><strong>Published:</strong> {new Date(experience.published_at).toLocaleDateString()}</p>
            )}
            {config && (
              <pre className="mt-2 p-2 bg-[#18181B] rounded text-[10px] overflow-auto max-h-48">
                {JSON.stringify(config.config, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
