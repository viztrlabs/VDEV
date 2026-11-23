'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Download, Eye, BarChart2 } from 'lucide-react';

interface DocumentTelemetry {
  id: string;
  name: string;
  type: string;
  category: string;
  status: 'draft' | 'review' | 'approved' | 'archived';
  lastAccessed: string;
  viewCount: number;
  downloadCount: number;
  lastModifiedBy: string;
  lastModifiedAt: string;
  size: string;
  telemetry: {
    dailyViews: number;
    weeklyViews: number;
    monthlyViews: number;
    topViewers: { name: string; views: number }[];
    topDownloaders: { name: string; downloads: number }[];
  };
}

// Mock telemetry data (unchanged)
const MOCK_TELEMETRY_DOCS: DocumentTelemetry[] = [
  {
    id: 'doc-01',
    name: 'Apex_Tower_Facade_Specification_v4.pdf',
    type: 'pdf',
    category: 'Specifications',
    status: 'approved',
    lastAccessed: '2 hours ago',
    viewCount: 247,
    downloadCount: 89,
    lastModifiedBy: 'Elena Rostova',
    lastModifiedAt: 'Aug 28, 2026',
    size: '12.4 MB',
    telemetry: {
      dailyViews: 12,
      weeklyViews: 89,
      monthlyViews: 247,
      topViewers: [
        { name: 'Alexander Wright', views: 45 },
        { name: 'Marcus Chen', views: 32 },
        { name: 'Julian Vance', views: 28 },
      ],
      topDownloaders: [
        { name: 'Alexander Wright', downloads: 12 },
        { name: 'Elena Rostova', downloads: 8 },
      ],
    },
  },
  {
    id: 'doc-02',
    name: 'Apex_Tower_Structural_Calculations_v3.xlsx',
    type: 'xlsx',
    category: 'Calculations',
    status: 'review',
    lastAccessed: '1 day ago',
    viewCount: 156,
    downloadCount: 67,
    lastModifiedBy: 'Alexander Wright',
    lastModifiedAt: 'Aug 25, 2026',
    size: '8.7 MB',
    telemetry: {
      dailyViews: 8,
      weeklyViews: 45,
      monthlyViews: 156,
      topViewers: [
        { name: 'Alexander Wright', views: 38 },
        { name: 'Marcus Chen', views: 24 },
      ],
      topDownloaders: [
        { name: 'Marcus Chen', downloads: 15 },
        { name: 'Alexander Wright', downloads: 10 },
      ],
    },
  },
  {
    id: 'doc-03',
    name: 'Apex_Tower_Facade_Shop_Drawings_Rev2.dwg',
    type: 'dwg',
    category: 'Shop Drawings',
    status: 'draft',
    lastAccessed: '3 hours ago',
    viewCount: 89,
    downloadCount: 34,
    lastModifiedBy: 'Elena Rostova',
    lastModifiedAt: 'Aug 20, 2026',
    size: '42.1 MB',
    telemetry: {
      dailyViews: 15,
      weeklyViews: 67,
      monthlyViews: 89,
      topViewers: [
        { name: 'Elena Rostova', views: 34 },
        { name: 'Alexander Wright', views: 22 },
      ],
      topDownloaders: [
        { name: 'Elena Rostova', downloads: 8 },
        { name: 'Alexander Wright', downloads: 5 },
      ],
    },
  },
  {
    id: 'doc-04',
    name: 'Apex_Tower_Lighting_Design_Report.pdf',
    type: 'pdf',
    category: 'Reports',
    status: 'approved',
    lastAccessed: '5 days ago',
    viewCount: 203,
    downloadCount: 78,
    lastModifiedBy: 'Julian Vance',
    lastModifiedAt: 'Aug 15, 2026',
    size: '15.3 MB',
    telemetry: {
      dailyViews: 5,
      weeklyViews: 32,
      monthlyViews: 203,
      topViewers: [
        { name: 'Julian Vance', views: 56 },
        { name: 'Marcus Chen', views: 31 },
      ],
      topDownloaders: [
        { name: 'Julian Vance', downloads: 18 },
        { name: 'Alexander Wright', downloads: 12 },
      ],
    },
  },
  {
    id: 'doc-05',
    name: 'Apex_Tower_Interior_Finish_Schedule_v2.xlsx',
    type: 'xlsx',
    category: 'Schedules',
    status: 'review',
    lastAccessed: '1 week ago',
    viewCount: 134,
    downloadCount: 56,
    lastModifiedBy: 'Marcus Chen',
    lastModifiedAt: 'Aug 10, 2026',
    size: '4.2 MB',
    telemetry: {
      dailyViews: 3,
      weeklyViews: 18,
      monthlyViews: 134,
      topViewers: [
        { name: 'Marcus Chen', views: 42 },
        { name: 'Elena Rostova', views: 28 },
      ],
      topDownloaders: [
        { name: 'Marcus Chen', downloads: 14 },
        { name: 'Elena Rostova', downloads: 9 },
      ],
    },
  },
];

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-blue-950/40 text-blue-400 border-blue-800/40',
  review: 'bg-amber-950/40 text-amber-400 border-amber-800/40',
  approved: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40',
  archived: 'bg-zinc-800 text-zinc-400 border-zinc-700',
};

export default function DocumentsTelemetry({ projectId }: { projectId?: string }) {
  const [documents, setDocuments] = useState<DocumentTelemetry[]>(MOCK_TELEMETRY_DOCS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'views' | 'downloads' | 'lastAccessed'>('lastAccessed');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const updateDocumentTelemetry = (doc: DocumentTelemetry): DocumentTelemetry => ({
    ...doc,
    telemetry: {
      ...doc.telemetry,
      dailyViews: doc.telemetry.dailyViews + Math.floor(Math.random() * 3),
      weeklyViews: doc.telemetry.weeklyViews + Math.floor(Math.random() * 2),
      monthlyViews: doc.telemetry.monthlyViews + Math.floor(Math.random() * 1),
    },
    viewCount: doc.viewCount + Math.floor(Math.random() * 2),
    downloadCount: doc.downloadCount + Math.floor(Math.random() * 1),
    lastAccessed: 'just now',
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setDocuments((prev) => prev.map((doc) => updateDocumentTelemetry(doc)));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredDocs = useMemo(() => {
    return documents
      .filter((doc) => {
        const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        const aVal = a[sortBy as keyof DocumentTelemetry];
        const bVal = b[sortBy as keyof DocumentTelemetry];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortOrder === 'asc'
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      });
  }, [documents, searchQuery, statusFilter, categoryFilter, sortBy, sortOrder]);

  const getStatusBadge = (status: DocumentTelemetry['status']) => {
    const colors = STATUS_COLORS[status];
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${colors}`}>{status}</span>
    );
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredDocs.map((doc) => (
        <div
          key={doc.id}
          className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-[var(--primary)]/40 hover:bg-[var(--bg-secondary)]/80 transition-all"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2.5 rounded-lg bg-[var(--bg-tertiary)]">
              <FileText className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">{doc.name}</p>
              <p className="text-xs text-[var(--text-muted)] font-mono">
                {doc.type.toUpperCase()} • {doc.size}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-tertiary)]">
              {doc.category}
            </span>
            {getStatusBadge(doc.status)}
          </div>
          <div className="grid grid-cols-3 gap-2 text-center mb-3 p-3 bg-[var(--bg-tertiary)] rounded-lg">
            <div>
              <p className="text-2xl font-bold font-mono text-white">{formatNumber(doc.viewCount)}</p>
              <p className="text-[10px] text-[var(--text-muted)]">Views</p>
            </div>
            <div className="border-x border-[var(--border)]">
              <p className="text-2xl font-bold font-mono text-emerald-400">{formatNumber(doc.downloadCount)}</p>
              <p className="text-[10px] text-[var(--text-muted)]">Downloads</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-blue-400">
                {doc.telemetry.dailyViews} / {doc.telemetry.weeklyViews} / {doc.telemetry.monthlyViews}
              </p>
              <p className="text-[10px] text-[var(--text-muted)]">D / W / M</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
            <span className="text-xs text-[var(--text-muted)]">Last: {doc.lastAccessed}</span>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-white" title="Preview">
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-white" title="Download">
                <Download className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-white" title="Telemetry">
                <BarChart2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
