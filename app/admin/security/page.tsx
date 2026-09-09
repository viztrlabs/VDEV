'use client';

import React, { useState } from 'react';
import { FeatureFlagsDashboard } from '@/components/admin/FeatureFlagsDashboard';
import { Shield, BarChart2, Database, Settings, Users, AlertTriangle, RefreshCw, Loader2, Beaker } from 'lucide-react';

const tabs = [
  { id: 'security', label: 'Security & Audit', icon: Shield },
  { id: 'features', label: 'Feature Flags', icon: Beaker },
  { id: 'storage', label: 'Storage & Reliability', icon: Database },
  { id: 'sessions', label: 'Active Sessions', icon: Users },
  { id: 'audit', label: 'Audit Logs', icon: AlertTriangle },
  { id: 'performance', label: 'Performance', icon: BarChart2 },
];

export default function AdminSecurityPage() {
  const [activeTab, setActiveTab] = useState('security');
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold text-white">Security & Platform Administration</h1>
          <p className="text-sm text-[#71717a] font-mono mt-1">Monitor, configure, and secure the VizTR platform</p>
        </div>
        <button
          onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1000); }}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3ecf8e] text-black text-xs font-mono font-bold hover:bg-[#34b27b] transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh All</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-1 bg-[#121216]/85 border border-[#27272a] rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition ${
              activeTab === tab.id
                ? 'bg-[#3ecf8e] text-black shadow-sm'
                : 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Security Overview */}
        {activeTab === 'security' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Shield}
              value="12"
              label="Active Threats"
              color="rose-500"
              trend="+2 from last hour"
            />
            <StatCard
              icon={Users}
              value="247"
              label="Active Sessions"
              color="#3ecf8e"
              trend="Normal"
            />
            <StatCard
              icon={AlertTriangle}
              value="3"
              label="Blocked IPs (24h)"
              color="#f59e0b"
              trend="-1 from yesterday"
            />
            <StatCard
              icon={BarChart2}
              value="99.9%"
              label="Auth Success Rate"
              color="#6366f1"
              trend="+0.1%"
            />
          </div>
        )}

        {/* Feature Flags */}
        {activeTab === 'features' && (
          <FeatureFlagsDashboard />
        )}

        {/* Storage & Reliability */}
        {activeTab === 'storage' && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <StatCard
                icon={Database}
                value="48.6 TB"
                label="Used Storage"
                color="#3ecf8e"
                trend="75.9% capacity"
              />
              <StatCard
                icon={RefreshCw}
                value="99.99%"
                label="Upload Success Rate"
                color="#6366f1"
                trend="Chunked: 99.97%"
              />
              <StatCard
                icon={Loader2}
                value="2.3s"
                label="Avg Upload Time"
                color="#f59e0b"
                trend="Chunked: 1.8s"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-5 rounded-xl bg-[#121216]/85 border border-[#27272a]">
                <h3 className="font-mono font-bold text-white mb-4 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-[#3ecf8e]" />
                  Chunked Upload Configuration
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 rounded-lg bg-[#09090b]/50 border border-[#27272a]">
                    <div className="text-[10px] text-[#71717a]">Max File Size</div>
                    <div className="font-mono font-bold text-white">500 MB</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#09090b]/50 border border-[#27272a]">
                    <div className="text-[10px] text-[#71717a]">Chunk Size</div>
                    <div className="font-mono font-bold text-white">5 MB</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#09090b]/50 border border-[#27272a]">
                    <div className="text-[10px] text-[#71717a]">Max Retries</div>
                    <div className="font-mono font-bold text-white">3</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#09090b]/50 border border-[#27272a]">
                    <div className="text-[10px] text-[#71717a]">Retry Delay</div>
                    <div className="font-mono font-bold text-white">1s (exponential)</div>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#121216]/85 border border-[#27272a]">
                <h3 className="font-mono font-bold text-white mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#3ecf8e]" />
                  Multi-Cloud Providers
                </h3>
                <div className="space-y-3">
                  {[
                    { name: 'AWS S3 (US-East-1)', status: 'online', used: '24.8/32.0 TB' },
                    { name: 'Cloudflare R2 (Global CDN)', status: 'online', used: '15.4/20.0 TB' },
                    { name: 'Google Cloud Storage (EU-West)', status: 'online', used: '8.4/12.0 TB' },
                  ].map((provider) => (
                    <div key={provider.name} className="flex items-center justify-between p-3 rounded-lg bg-[#09090b]/50 border border-[#27272a]">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${provider.status === 'online' ? 'bg-[#3ecf8e]' : 'bg-rose-500'}`} />
                        <div>
                          <div className="font-mono text-white text-sm">{provider.name}</div>
                          <div className="text-[10px] text-[#71717a] font-mono">{provider.used}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono ${provider.status === 'online' ? 'bg-[#3ecf8e]/15 text-[#3ecf8e]' : 'bg-rose-500/15 text-rose-400'}`}>
                        {provider.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Sessions */}
        {activeTab === 'sessions' && (
          <div className="p-5 rounded-xl bg-[#121216]/85 border border-[#27272a]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-mono font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#3ecf8e]" />
                Active Sessions
              </h3>
              <span className="px-2 py-1 rounded text-[10px] font-mono bg-[#3ecf8e]/15 text-[#3ecf8e] border border-[#3ecf8e]/30">
                247 Active
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="border-b border-[#27272a] text-left text-[#71717a]">
                    <th className="pb-2">Session ID</th>
                    <th className="pb-2">User</th>
                    <th className="pb-2">Role</th>
                    <th className="pb-2">IP Address</th>
                    <th className="pb-2">Created</th>
                    <th className="pb-2">Last Activity</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 'sess_abc123', user: 'admin@viztr.com', role: 'super_admin', ip: '192.168.1.1', created: '2h ago', last: '1m ago', status: 'active' },
                    { id: 'sess_def456', user: 'manager@viztr.com', role: 'admin', ip: '10.0.0.5', created: '4h ago', last: '5m ago', status: 'active' },
                    { id: 'sess_ghi789', user: 'client@viztr.com', role: 'client', ip: '203.0.113.2', created: '1h ago', last: '30s ago', status: 'active' },
                    { id: 'sess_jkl012', user: 'user@viztr.com', role: 'user', ip: '198.51.100.1', created: '30m ago', last: '2m ago', status: 'idle' },
                  ].map((session) => (
                    <tr key={session.id} className="border-b border-[#27272a]/50 hover:bg-[#18181b]/50">
                      <td className="py-3 font-mono text-[#a1a1aa]">{session.id}</td>
                      <td className="py-3 text-white">{session.user}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono ${
                          session.role === 'super_admin' ? 'bg-rose-500/15 text-rose-400' :
                          session.role === 'admin' ? 'bg-[#6366f1]/15 text-[#818cf8]' :
                          session.role === 'client' ? 'bg-[#3ecf8e]/15 text-[#3ecf8e]' :
                          'bg-[#6366f1]/15 text-[#818cf8]'
                        }`}>
                          {session.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-[#a1a1aa]">{session.ip}</td>
                      <td className="py-3 text-[#71717a]">{session.created}</td>
                      <td className="py-3 text-[#71717a]">{session.last}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono ${
                          session.status === 'active' ? 'bg-[#3ecf8e]/15 text-[#3ecf8e]' : 'bg-[#6366f1]/15 text-[#818cf8]'
                        }`}>
                          {session.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3">
                        <button className="px-2 py-1 rounded text-[10px] font-mono bg-[#18181b] hover:bg-rose-500/20 hover:text-rose-400 text-[#71717a] transition">
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Audit Logs */}
        {activeTab === 'audit' && (
          <div className="p-5 rounded-xl bg-[#121216]/85 border border-[#27272a]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-mono font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                Security Audit Logs
              </h3>
              <div className="flex gap-2">
                <select className="bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#3ecf8e]">
                  <option>All Severities</option>
                  <option>Critical</option>
                  <option>Error</option>
                  <option>Warning</option>
                  <option>Info</option>
                </select>
                <select className="bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#3ecf8e]">
                  <option>All Events</option>
                  <option>auth.login</option>
                  <option>auth.failed</option>
                  <option>access.denied</option>
                  <option>data.export</option>
                  <option>admin.user_delete</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="border-b border-[#27272a] text-left text-[#71717a]">
                    <th className="pb-2">Time</th>
                    <th className="pb-2">Event</th>
                    <th className="pb-2">User</th>
                    <th className="pb-2">IP</th>
                    <th className="pb-2">Outcome</th>
                    <th className="pb-2">Risk</th>
                    <th className="pb-2">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { time: '2m ago', event: 'auth.login', user: 'admin@viztr.com', ip: '192.168.1.1', outcome: 'success', risk: 10, details: 'MFA verified' },
                    { time: '5m ago', event: 'access.denied', user: 'client@viztr.com', ip: '203.0.113.2', outcome: 'blocked', risk: 35, details: 'Admin panel access' },
                    { time: '12m ago', event: 'auth.failed', user: 'unknown', ip: '45.77.12.1', outcome: 'blocked', risk: 40, details: 'Invalid credentials' },
                    { time: '25m ago', event: 'data.export', user: 'admin@viztr.com', ip: '192.168.1.1', outcome: 'success', risk: 50, details: 'Project data export' },
                    { time: '1h ago', event: 'admin.user_delete', user: 'admin@viztr.com', ip: '192.168.1.1', outcome: 'success', risk: 60, details: 'Deleted user usr_old_01' },
                    { time: '2h ago', event: 'security.suspicious_activity', user: 'unknown', ip: '185.220.101.1', outcome: 'blocked', risk: 80, details: 'Rate limit exceeded' },
                  ].map((log, i) => (
                    <tr key={i} className="border-b border-[#27272a]/50 hover:bg-[#18181b]/50">
                      <td className="py-3 text-[#71717a]">{log.time}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono ${
                          log.event.startsWith('auth.') ? 'bg-[#6366f1]/15 text-[#818cf8]' :
                          log.event.startsWith('access.') ? 'bg-rose-500/15 text-rose-400' :
                          log.event.startsWith('data.') ? 'bg-[#3ecf8e]/15 text-[#3ecf8e]' :
                          log.event.startsWith('admin.') ? 'bg-[#f59e0b]/15 text-[#f59e0b]' :
                          'bg-rose-500/15 text-rose-400'
                        }`}>
                          {log.event}
                        </span>
                      </td>
                      <td className="py-3 text-white">{log.user}</td>
                      <td className="py-3 font-mono text-[#a1a1aa]">{log.ip}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono ${
                          log.outcome === 'success' ? 'bg-[#3ecf8e]/15 text-[#3ecf8e]' : 'bg-rose-500/15 text-rose-400'
                        }`}>
                          {log.outcome.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono ${
                          log.risk >= 70 ? 'bg-rose-500/15 text-rose-400' :
                          log.risk >= 40 ? 'bg-[#f59e0b]/15 text-[#f59e0b]' :
                          'bg-[#3ecf8e]/15 text-[#3ecf8e]'
                        }`}>
                          {log.risk}/100
                        </span>
                      </td>
                      <td className="py-3 text-[10px] text-[#71717a]">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Performance */}
        {activeTab === 'performance' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={BarChart2}
              value="12ms"
              label="Avg API Latency"
              color="#3ecf8e"
              trend="p99: 45ms"
            />
            <StatCard
              icon={Database}
              value="2.3ms"
              label="DB Query Avg"
              color="#6366f1"
              trend="p99: 8ms"
            />
            <StatCard
              icon={Loader2}
              value="99.97%"
              label="Uptime (30d)"
              color="#f59e0b"
              trend="0 incidents"
            />
            <StatCard
              icon={Shield}
              value="0"
              label="Critical Errors (24h)"
              color="rose-500"
              trend="Clean"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, color, trend }: { 
  icon: React.ElementType; 
  value: string; 
  label: string; 
  color: string; 
  trend: string;
}) {
  return (
    <div className="p-5 rounded-xl bg-[#121216]/85 border border-[#27272a]">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${typeof color === 'string' && color.startsWith('#') ? `bg-[${color}]/10` : `bg-[${color}]/10`} text-[${color}]`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`px-2 py-0.5 rounded text-[9px] font-mono text-[${color}] bg-[${color}]/10`}>
          {trend}
        </span>
      </div>
      <div className="text-2xl font-mono font-bold text-white">{value}</div>
      <div className="text-[11px] text-[#71717a] font-mono">{label}</div>
    </div>
  );
}
