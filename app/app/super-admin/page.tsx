'use client';

import React from 'react';
import RoleLayout from '@/app/app/RoleLayout';
import { LayoutDashboard, Building2, Users, Shield, UserCheck, FolderOpen, Database, CreditCard, BarChart3, FileText, Gift, Activity, ShieldAlert, Plug, Settings } from 'lucide-react';

export default function SuperAdminDashboard() {
  return (
    <RoleLayout role="super_admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-display">Super Admin Dashboard</h1>
          <p className="text-zinc-400 mt-1">Platform-wide administration and oversight</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Organizations', value: '5', icon: Building2, color: 'purple' },
            { label: 'Active Users', value: '1,204', icon: Users, color: 'blue' },
            { label: 'Total Revenue', value: '$124.8K', icon: CreditCard, color: 'emerald' },
            { label: 'System Status', value: '99.9%', icon: Shield, color: 'amber' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                <Icon className={`w-5 h-5 text-${stat.color}-400 mb-3`} />
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-zinc-400 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-xl font-bold font-display mb-4">System Overview</h2>
            <div className="space-y-4">
              {[
                { name: 'Platform Status', status: 'Healthy', uptime: '99.9%' },
                { name: 'Database', status: 'Healthy', uptime: '99.8%' },
                { name: 'API Gateway', status: 'Degraded', uptime: '98.5%' },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                  <span className="font-medium">{item.name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    item.status === 'Healthy' ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-xl font-bold font-display mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {[
                { action: 'New organization created', user: 'Sarah Chen', time: '2 hours ago' },
                { action: 'User role updated', user: 'Michael Rodriguez', time: '4 hours ago' },
                { action: 'Plan upgraded', user: 'Acme Corp', time: '1 day ago' },
              ].map((activity) => (
                <div key={activity.action} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-zinc-500">{activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
