'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Download, Eye, CheckCircle2, MessageSquare, Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface ActivityLogEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  user_name: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return 'Yesterday';
  return `${diffDay} days ago`;
}

function getIcon(type: string) {
  switch (type) {
    case 'download':
      return <Download className="w-3.5 h-3.5" />;
    case 'approval':
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    case 'feedback':
      return <MessageSquare className="w-3.5 h-3.5 text-amber-400" />;
    default:
      return <Eye className="w-3.5 h-3.5 text-sky-400" />;
  }
}

export default function ActivityLog({ projectId }: { projectId?: string }) {
  // Render from the canonical store slice. The initial fetch below is the
  // hydration path; useActivityRealtime (subscribed at the dashboard level)
  // pushes every later change via addActivity.
  const activityFeed = useAppStore((s) => s.activityFeed);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (projectId) params.set('projectId', projectId);
    params.set('limit', '50');

    fetch(`/api/activity?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.logs)) {
          useAppStore.getState().setActivityFeed(data.logs);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  const logs = (projectId
    ? activityFeed.filter((l) => !l.project_id || l.project_id === projectId)
    : activityFeed) as unknown as ActivityLogEntry[];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#3ECF8E]" />
            <span>Audit Trail & Project Activity History</span>
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Immutable log of all reviews, downloads, approvals, and model uploads
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-[#71717A]">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span className="text-xs font-mono">Loading activity...</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-[#71717A]">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-xs font-mono">No activity recorded yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="p-3.5 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#09090B] border border-[#27272A] text-[#3ECF8E] shrink-0">
                  {getIcon(log.entity_type)}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{log.action}</div>
                  <div className="text-[10px] font-mono text-[#71717A]">
                    Performed by {log.user_name || 'System'}
                  </div>
                </div>
              </div>

              <span className="text-[10px] font-mono text-[#71717A]">{timeAgo(log.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
