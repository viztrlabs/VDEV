'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkline, MetricCard } from '@/components/analytics/analytics-dashboard';
import {
  BarChart3,
  TrendingUp,
  MapPin,
  Laptop,
  Mobile,
  Desktop,
  Smartphone,
  Tablet,
  Palette,
  Watch,
  MousePointer,
  Mouse,
  Keyboard,
  Clock,
  Flag,
  Globe,
  Folder,
  FileText,
  MessageCircle,
  Mail,
  Phone,
  Search,
  RefreshCw,
  Loader2,
  Activity,
  Settings,
  Shield,
  Users,
  DollarSign,
  Trash2,
  LogOut,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Aid,
  ZoomIn,
  ZoomOut,
  Grid,
  LayerGroup,
  Users as Users2,
  Clipboard,
  Music,
  Tv,
  Eye,
  ExternalLink,
  MoreHorizontal,
  Calendar,
  CalendarDays,
} from 'lucide-react';

type DateRangeOption = 
  | 'today'
  | 'yesterday' 
  | 'last7' 
  | 'last30' 
  | 'last90' 
  | 'thisMonth' 
  | 'lastMonth' 
  | 'custom';

interface DateRangeOptionUI {
  value: DateRangeOption;
  label: string;
  icon: typeof Icon;
}

const DateRangeOptions: DateRangeOptionUI[] = [
  { value: 'today', label: 'Today', icon: CalendarDays },
  { value: 'yesterday', label: 'Yesterday', icon: Calendar },
  { value: 'last7', label: 'Last 7 Days', icon: Calendar },
  { value: 'last30', label: 'Last 30 Days', icon: Calendar },
  { value: 'last90', label: 'Last 90 Days', icon: Calendar },
  { value: 'thisMonth', label: 'This Month', icon: Calendar },
  { value: 'lastMonth', label: 'Last Month', icon: Calendar },
  { value: 'custom', label: 'Custom Range', icon: MoreHorizontal },
];

type KPIStats = {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  engagedSessions: number;
  engagementRate: number;
  avgEngagementTime: number;
  conversions: number;
};

type TrafficDataPoint = {
  date: string;
  users: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
};

type AcquisitionSourceMedium = {
  source: string;
  medium: string;
  sessions: number;
  users: number;
};

type AudienceDataPoint = {
  country?: string;
  region?: string;
  city?: string;
  deviceCategory?: string;
  operatingSystem?: string;
  browser?: string;
  newVsReturning?: string;
};

type PagePerformanceData = {
  pagePath: string;
  pageTitle: string;
  views: number;
  activeUsers: number;
  engagementRate: number;
  avgEngagementTime: number;
  eventCount: number;
};

type ConversionEvent = {
  name: string;
  count: number;
};

type BizPerformance = {
  serviceViews: Record<string, number>;
  formSubmissions: number;
  whatsappClicks: number;
  emailClicks: number;
  ctaClicks: number;
  clientDashboardAccesses: number;
};

interface SuperAdminGA4DashboardProps {
  initialSection?: 'overview' | 'traffic' | 'acquisition' | 'audience' | 'pages' | 'conversions';
}

export function SuperAdminGA4Dashboard({ initialSection = 'overview' }: SuperAdminGA4DashboardProps = {}) {
  const [activeSection, setActiveSection] = useState<'overview' | 'traffic' | 'acquisition' | 'audience' | 'pages' | 'conversions'>(initialSection);
  const [dateRange, setDateRange] = useState<DateRangeOption>('last30');
  const [customStart, setCustomStart] = useState<Date | null>(null);
  const [customEnd, setCustomEnd] = useState<Date | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState<boolean>(true);
  const [propertyId, setPropertyId] = useState<string>('');

  // Fetch KPI stats
  const fetchKPIs = async (start: string, end: string) => {
    setLoading((prev) => ({ ...prev, overview: true }));
    setError(null);
    try {
      const res = await fetch(`/api/admin/analytics/overview?startDate=${start}&endDate=${end}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success) {
        return data.kpi;
      }
      throw new Error(data.error || 'Failed to fetch KPIs');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch KPIs');
      return null;
    } finally {
      setLoading((prev) => ({ ...prev, overview: false }));
    }
  };

  // Fetch traffic data
  const fetchTraffic = async (start: string, end: string) => {
    setLoading((prev) => ({ ...prev, traffic: true }));
    setError(null);
    try {
      const res = await fetch(`/api/admin/analytics/traffic?startDate=${start}&endDate=${end}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success) {
        return data.traffic;
      }
      throw new Error(data.error || 'Failed to fetch traffic');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch traffic');
      return [];
    } finally {
      setLoading((prev) => ({ ...prev, traffic: false }));
    }
  };

  // Fetch acquisition data
  const fetchAcquisition = async (start: string, end: string) => {
    setLoading((prev) => ({ ...prev, acquisition: true }));
    setError(null);
    try {
      const res = await fetch(`/api/admin/analytics/acquisition?startDate=${start}&endDate=${end}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success) {
        return data.acquisition;
      }
      throw new Error(data.error || 'Failed to fetch acquisition');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch acquisition');
      return [];
    } finally {
      setLoading((prev) => ({ ...prev, acquisition: false }));
    }
  };

  // Fetch audience data
  const fetchAudience = async (start: string, end: string) => {
    setLoading((prev) => ({ ...prev, audience: true }));
    setError(null);
    try {
      const res = await fetch(`/api/admin/analytics/audience?startDate=${start}&endDate=${end}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success) {
        return data.audience;
      }
      throw new Error(data.error || 'Failed to fetch audience');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch audience');
      return [];
    } finally {
      setLoading((prev) => ({ ...prev, audience: false }));
    }
  };

  // Fetch page performance data
  const fetchPages = async (start: string, end: string) => {
    setLoading((prev) => ({ ...prev, pages: true }));
    setError(null);
    try {
      const res = await fetch(`/api/admin/analytics/pages?startDate=${start}&endDate=${end}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success) {
        return data.pages;
      }
      throw new Error(data.error || 'Failed to fetch pages');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch pages');
      return [];
    } finally {
      setLoading((prev) => ({ ...prev, pages: false }));
    }
  };

  // Fetch conversion data
  const fetchConversions = async (start: string, end: string) => {
    setLoading((prev) => ({ ...prev, conversions: true }));
    setError(null);
    try {
      const res = await fetch(`/api/admin/analytics/conversions?startDate=${start}&endDate=${end}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success) {
        return data;
      }
      throw new Error(data.error || 'Failed to fetch conversions');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch conversions');
      return { conversions: [], bizPerformance: {} };
    } finally {
      setLoading((prev) => ({ ...prev, conversions: false }));
    }
  };

  // Format date range label
  const dateRangeLabel = useMemo(() => {
    const labels: Record<DateRangeOption, string> = {
      today: 'Today',
      yesterday: 'Yesterday',
      last7: 'Last 7 Days',
      last30: 'Last 30 Days',
      last90: 'Last 90 Days',
      thisMonth: 'This Month',
      lastMonth: 'Last Month',
      custom: customStart && customEnd 
        ? `${customStart.toLocaleDateString()} - ${customEnd.toLocaleDateString()}`
        : 'Custom Range',
    };
    return labels[dateRange];
  }, [dateRange, customStart, customEnd]);

  // Resolve date strings to API format
  const [apiStart, apiEnd] = useMemo(() => {
    const now = new Date();
    const resolve = (dr: DateRangeOption): [string, string] => {
      switch (dr) {
        case 'today': return [now.toISOString().split('T')[0], now.toISOString().split('T')[0]];
        case 'yesterday': return [
          new Date(now.getTime() - 86400000).toISOString().split('T')[0],
          new Date(now.getTime() - 86400000).toISOString().split('T')[0],
        ];
        case 'last7': {
          const d = new Date(now);
          d.setDate(d.getDate() - 6);
          return [d.toISOString().split('T')[0], now.toISOString().split('T')[0]];
        }
        case 'last30': {
          const d = new Date(now);
          d.setDate(d.getDate() - 29);
          return [d.toISOString().split('T')[0], now.toISOString().split('T')[0]];
        }
        case 'last90': {
          const d = new Date(now.getTime() - 86400000 * 89);
          return [d.toISOString().split('T')[0], now.toISOString().split('T')[0]];
        }
        case 'thisMonth': {
          const first = new Date(now.getFullYear(), now.getMonth(), 1);
          return [first.toISOString().split('T')[0], now.toISOString().split('T')[0]];
        }
        case 'lastMonth': {
          const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
          const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
          const first = new Date(year, lastMonth, 1);
          const last = new Date(year, lastMonth + 1, 0);
          return [first.toISOString().split('T')[0], last.toISOString().split('T')[0]];
        }
        case 'custom':
          if (customStart && customEnd) {
            return [
              customStart.toISOString().split('T')[0],
              customEnd.toISOString().split('T')[0],
            ];
          }
          return [now.toISOString().split('T')[0], now.toISOString().split('T')[0]];
        default: return [now.toISOString().split('T')[0], now.toISOString().split('T')[0]];
      }
    };
    return [resolve(dateRange), resolve(dateRange)];
  }, [dateRange, customStart, customEnd]);

  // Load data based on active section and date range
  const kpiData = useMemo(() => {
    if (activeSection === 'overview') {
      return fetchKPIs(apiStart, apiEnd);
    }
    return null;
  }, [activeSection, apiStart, apiEnd]);

  const trafficData = useMemo(() => {
    if (activeSection === 'traffic') {
      return fetchTraffic(apiStart, apiEnd);
    }
    return null;
  }, [activeSection, apiStart, apiEnd]);

  const acquisitionData = useMemo(() => {
    if (activeSection === 'acquisition') {
      return fetchAcquisition(apiStart, apiEnd);
    }
    return null;
  }, [activeSection, apiStart, apiEnd]);

  const audienceData = useMemo(() => {
    if (activeSection === 'audience') {
      return fetchAudience(apiStart, apiEnd);
    }
    return null;
  }, [activeSection, apiStart, apiEnd]);

  const pagesData = useMemo(() => {
    if (activeSection === 'pages') {
      return fetchPages(apiStart, apiEnd);
    }
    return null;
  }, [activeSection, apiStart, apiEnd]);

  const conversionData = useMemo(() => {
    if (activeSection === 'conversions') {
      return fetchConversions(apiStart, apiEnd);
    }
    return null;
  }, [activeSection, apiStart, apiEnd]);

  // Property ID from env
  useEffect(() => {
    const pid = process.env.GA_PROPERTY_ID;
    if (pid) setPropertyId(pid);
  }, []);

  if (!propertyId) {
    return (
      <div className="p-8 rounded-2xl bg-[#18181B] border border-[#27272A] text-center space-y-8">
        <div className="w-16 h-16 rounded-full bg-[#3ECF8E]/20 border border-[#3ECF8E]/40 flex items-center justify-center mx-auto text-[#3ECF8E]">
          <BarChart3 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold font-display text-white margin-top-8">GA4 Not Configured</h3>
        <p className="text-[#71717A]">Please set the GA_PROPERTY_ID environment variable to enable the Super Admin Google Analytics dashboard.</p>
        <div className="text-sm">
          <a href="/api/admin/analytics/overview" className="text-[10px] font-mono text-purple-400 hover:text-white">Check API configuration</a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#09090B] min-h-screen">
      {/* Header */}
      <header className="border-b border-[#27272A] pb-4 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#27272A] flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-[#3ECF8E]" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-white">Google Analytics 4</h2>
              <p className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider">Super Admin Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-[#71717A]" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-8 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>
            
            <div className="flex items-center gap-1.5 bg-[#27272A] border border-[#27272A] rounded-full px-3">
              <span className="text-[10px] font-mono text-[#71717A]">{dateRangeLabel}</span>
              <ChevronDown className="w-3 h-3 text-[#71717A]" />
            </div>
          </div>
        </div>
        
        {/* Comparison toggle */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-[10px] font-mono text-[#71717A] cursor-pointer">
            <input
              type="checkbox"
              checked={showComparison}
              onChange={(e) => setShowComparison(e.target.checked)}
              className="rounded bg-[#09090B] border border-[#27272A] p-1 cursor-pointer"
            />
            Compare with previous period
          </label>
        </div>
      </header>

      {/* Date Range Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {DateRangeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setDateRange(option.value)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
              dateRange === option.value
                ? 'bg-[#3ECF8E]/20 text-[#3ECF8E] border-[#3ECF8E]/40'
                : 'text-[#A1A1AA] hover:text-white hover:bg-[#09090B]/50'
            }`}
          >
            <option.icon className="w-3 h-3" />
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      {/* KPI Cards (Overview section) */}
      {activeSection === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kPIData && (
            <>
              <MetricCard
                title="Total Users"
                value={kPIData.totalUsers}
                color="#3ECF8E"
              />
              <MetricCard
                title="Active Users"
                value={kPIData.activeUsers}
                color="#60A5FA"
              />
              <MetricCard
                title="New Users"
                value={kPIData.newUsers}
                color="#A78BFA"
              />
              <MetricCard
                title="Sessions"
                value={kPIData.sessions}
                color="#F472B6"
              />
              <MetricCard
                title="Page Views"
                value={kPIData.pageViews}
                color="#FBBF24"
              />
              <MetricCard
                title="Engaged Sessions"
                value={kPIData.engagedSessions}
                color="#38BDF8"
              />
<MetricCard
                title="Engagement Rate"
                value={Math.round(kPIData.engagementRate * 100)}
                color="#FB923C"
              />
              <MetricCard
                title="Avg. Engagement Time"
                value={kPIData.avgEngagementTime > 0 ? `${Math.round(kPIData.avgEngagementTime / 60)}m ${Math.round(kPIData.avgEngagementTime % 60)}s` : '0m 0s'}
                color="#10B981"
              />
              <MetricCard
                title="Conversions"
                value={kPIData.conversions}
                color="#EC4899"
              />
            </>
          )}
        </div>
      )}

      {/* Section Content */}
      <main className="space-y-6">
        
        {/* Traffic Analytics */}
        {activeSection === 'traffic' && (
          <div>
            <h3 className="text-font text-white mb-4">Daily Visitors</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trafficData && trafficData.length > 0 && (
                <div className="space-y-4">
                  <p className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider">
                    Showing {trafficData.length} day(s)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {trafficData.map((point, idx) => (
                      <div
                        key={point.date}
                        className={`p-3 rounded-xl bg-[#18181B] border border-[#27272A] ${idx % 2 === 0 ? 'border-zinc-800' : 'border-zinc-700'} relative overflow-hidden`}
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        <div className="flex items-baseline justify-between">
                          <span className="text-[10px] font-mono text-[#71717A] capitalize">{point.date}</span>
                          <span className="text-xs font-mono text-[#3ECF8E]">{point.users} users</span>
                        </div>
                        <div className="mt-2 h-8">
                          <div
                            className={`h-full rounded-t bg-[#27272A] overflow-hidden transition-all duration-500 ${point.users > 0 ? 'bg-[#3ECF8E]' : 'bg-zinc-800'}`}
                            style={{ height: `${point.users > 0 ? Math.min((point.users / Math.max(...trafficData.map((p) => p.users)) || 1) * 100, 100) : 0}%` }}
                          />
                        </div>
                        <div className="mt-1 text-[10px] font-mono text-zinc-500">
                          {point.sessions} sessions
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {!trafficData || trafficData.length === 0 && (
                <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] text-center">
                  <div className="w-12 h-12 rounded-full bg-[#3ECF8E]/20 border border-[#3ECF8E]/40 flex items-center justify-center mx-auto text-[#3ECF8E]">
                    <Loader2 className="w-6 h-6" />
                  </div>
                  <p className="text-center text-[#71717A] margin-top-4">No traffic data available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Acquisition Analytics */}
        {activeSection === 'acquisition' && (
          <div>
            <h3 className="text-font text-white mb-4">Traffic Sources</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {acquisitionData && acquisitionData.length > 0 && (
                <div className="space-y-3">
                  {acquisitionData.map((src, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl bg-[#18181B] border border-[#27272A] ${idx % 2 === 0 ? 'border-zinc-800' : 'border-zinc-700'} relative overflow-hidden`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-[#27272A] flex items-center justify-center flex-shrink-0">
                          <Search className="w-3.5 h-3.5 text-[#3ECF8E]" />
                        </div>
                        <div>
                          <div className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider">{src.medium}</div>
                          <div className="text-sm font-medium text-white">{src.source}</div>
                        </div>
                        <span className="text-[10px] font-mono text-[#3ECF8E] ml-auto">{src.sessions} sessions</span>
                      </div>
                    </div>
                  ))}
                  {!acquisitionData.length && (
                    <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] text-center">
                      <div className="w-12 h-12 rounded-full bg-[#3ECF8E]/20 border border-[#3ECF8E]/40 flex items-center justify-center mx-auto text-[#3ECF8E]">
                        <Search className="w-6 h-6" />
                      </div>
                      <p className="text-center text-[#71717A] margin-top-4">No acquisition data available</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Audience Analytics */}
        {activeSection === 'audience' && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {audienceData && audienceData.length > 0 && (
                <>
                  {audienceData.map((aud, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl bg-[#18181B] border border-[#27272A] ${idx % 2 === 0 ? 'border-zinc-800' : 'border-zinc-700'}`}
                    >
                      <div className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider">{aud.deviceCategory || '—'}</div>
                      <div className="text-sm font-medium text-white">{aud.operatingSystem || '—'}</div>
                      <div className="text-[10px] font-mono text-zinc-500">{aud.browser || '—'}</div>
                      <div className="text-xs font-mono text-zinc-500">{aud.newVsReturning || '—'}</div>
                      {aud.country && (
                        <div className="text-[10px] font-mono text-amber-400 margin-top-1">
                          <Flag className="w-3 h-3 mr-1" /> {aud.country}
                        </div>
                      )}
                    </div>
                  ))}
                  {!audienceData.length && (
                    <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] text-center">
                      <div className="w-12 h-12 rounded-full bg-[#3ECF8E]/20 border border-[#3ECF8E]/40 flex items-center justify-center mx-auto text-[#3ECF8E]">
                        <UserCheck className="w-6 h-6" />
                      </div>
                      <p className="text-center text-[#71717A] margin-top-4">No audience data available</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Page Performance */}
        {activeSection === 'pages' && (
          <div>
            <h3 className="text-font text-white mb-4">Page Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px] font-mono text-[#A1A1AA]">
                <thead className="text-[#71717A]">
                  <tr>
                    <th className="py-3 px-4">Page URL</th>
                    <th className="py-3 px-4">Page Title</th>
                    <th className="py-3 px-4">Views</th>
                    <th className="py-3 px-4">Active Users</th>
                    <th className="py-3 px-4">Engagement Rate</th>
                    <th className="py-3 px-4">Avg. Eng. Time</th>
                    <th className="py-3 px-4">Events</th>
                  </tr>
                </thead>
                <tbody>
                  {pagesData && pagesData.length > 0 ? (
                    pagesData.map((page, idx) => (
                      <tr key={idx} className="border-t border-[#27272A]">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="text-[10px] font-mono text-white truncate" title={page.pagePath}>
                            {page.pagePath}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-[10px] font-mono text-white truncate" title={page.pageTitle}>
                            {page.pageTitle}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-[10px] font-mono text-white">{page.views}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-[10px] font-mono text-white">{page.activeUsers}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-[10px] font-mono text-white">{Math.round(page.engagementRate * 100)}%</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-[10px] font-mono text-white">{page.avgEngagementTime > 0 ? `${Math.round(page.avgEngagementTime / 60)}m` : '0m'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-[10px] font-mono text-white">{page.eventCount}</div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-3 py-3 text-[#71717A]" colSpan={7}>
                        No page performance data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Conversion Analytics */}
        {activeSection === 'conversions' && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">Total Leads</div>
                <div className="text-2xl font-bold font-display text-white">{conversionData?.conversions?.totalConversions || 0}</div>
                <div className="text-[10px] font-mono text-zinc-500">GA4-reported conversions</div>
              </div>
              <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">Contact Form</div>
                <div className="text-2xl font-bold font-display text-white">{conversionData?.conversions?.conversionEvents?.find((e: ConversionEvent) => e.name === 'contact_form_submit')?.count || 0}</div>
                <div className="text-[10px] font-mono text-zinc-500">form submissions</div>
              </div>
              <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">WhatsApp Clicks</div>
                <div className="text-2xl font-bold font-display text-white">{conversionData?.conversions?.conversionEvents?.find((e: ConversionEvent) => e.name === 'whatsapp_click')?.count || 0}</div>
                <div className="text-[10px] font-mono text-zinc-500">click events</div>
              </div>
              <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">Email Clicks</div>
                <div className="text-2xl font-bold font-display text-white">{conversionData?.conversions?.conversionEvents?.find((e: ConversionEvent) => e.name === 'email_click')?.count || 0}</div>
                <div className="text-[10px] font-mono text-zinc-500">click events</div>
              </div>
              <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">Service Views</div>
                <div className="text-2xl font-bold font-display text-white">{conversionData?.conversions?.conversionEvents?.find((e: ConversionEvent) => e.name === 'service_view')?.count || 0}</div>
                <div className="text-[10px] font-mono text-zinc-500">view events</div>
              </div>
              <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">Project Inquiries</div>
                <div className="text-2xl font-bold font-display text-white">{conversionData?.conversions?.conversionEvents?.find((e: ConversionEvent) => e.name === 'project_inquiry')?.count || 0}</div>
                <div className="text-[10px] font-mono text-zinc-500">inquiry events</div>
              </div>
              <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">CTA Clicks</div>
                <div className="text-2xl font-bold font-display text-white">{conversionData?.conversions?.conversionEvents?.find((e: ConversionEvent) => e.name === 'cta_click')?.count || 0}</div>
                <div className="text-[10px] font-mono text-zinc-500">click events</div>
              </div>
              <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">Client Dashboard</div>
                <div className="text-2xl font-bold font-display text-white">{conversionData?.conversions?.conversionEvents?.find((e: ConversionEvent) => e.name === 'client_dashboard_access')?.count || 0}</div>
                <div className="text-[10px] font-mono text-zinc-500">access events</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">Form Submissions</div>
                <div className="text-2xl font-bold font-display text-white">{conversionData?.bizPerformance?.formSubmissions || 0}</div>
                <div className="text-[10px] font-mono text-zinc-500">Custom biz events</div>
              </div>
              <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">WhatsApp Clicks</div>
                <div className="text-2xl font-bold font-display text-white">{conversionData?.bizPerformance?.whatsappClicks || 0}</div>
                <div className="text-[10px] font-mono text-zinc-500">Custom biz events</div>
              </div>
              <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">Email Clicks</div>
                <div className="text-2xl font-bold font-display text-white">{conversionData?.bizPerformance?.emailClicks || 0}</div>
                <div className="text-[10px] font-mono text-zinc-500">Custom biz events</div>
              </div>
              <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">CTA Clicks</div>
                <div className="text-2xl font-bold font-display text-white">{conversionData?.bizPerformance?.ctaClicks || 0}</div>
                <div className="text-[10px] font-mono text-zinc-500">Custom biz events</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default SuperAdminGA4Dashboard;