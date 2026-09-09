'use client';

import React from 'react';
import Link from 'next/link';
import RoleLayout from '@/app/app/RoleLayout';
import { LayoutDashboard, FolderOpen, Target, Users, Receipt, Calendar, HelpCircle, BarChart3, FileText, Plus, FolderOpen as FolderIcon, ArrowRight, CheckCircle, Clock, AlertCircle, DollarSign, Settings } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/app/admin', icon: LayoutDashboard },
  { name: 'Projects', href: '/app/admin/projects', icon: FolderOpen },
  { name: 'Leads', href: '/app/admin/leads', icon: Target },
  { name: 'Clients', href: '/app/admin/clients', icon: Users },
  { name: 'Team', href: '/app/admin/team', icon: Users },
  { name: 'Quotes', href: '/app/admin/quotes', icon: FileText },
  { name: 'Invoices', href: '/app/admin/invoices', icon: Receipt },
  { name: 'Payments', href: '/app/admin/payments', icon: DollarSign },
  { name: 'Files', href: '/app/admin/files', icon: FolderOpen },
  { name: 'Approvals', href: '/app/admin/approvals', icon: CheckCircle },
  { name: 'Meetings', href: '/app/admin/meetings', icon: Calendar },
  { name: 'Support', href: '/app/admin/support', icon: HelpCircle },
  { name: 'Analytics', href: '/app/admin/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/app/admin/settings', icon: Settings },
];

export default function AdminDashboard() {
  return (
    <RoleLayout role="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-display">Admin Dashboard</h1>
          <p className="text-zinc-400 mt-1">Organization administration and management</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Projects', value: '24', icon: FolderOpen, color: 'blue' },
            { label: 'Open Leads', value: '8', icon: Target, color: 'emerald' },
            { label: 'Team Members', value: '12', icon: Users, color: 'purple' },
            { label: 'Revenue (MTD)', value: '$48.5K', icon: DollarSign, color: 'amber' },
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

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold font-display">Recent Projects</h2>
                <Link
                  href="/app/admin/projects"
                  className="text-cyan-400 text-sm font-semibold flex items-center gap-1"
                >
                  View All
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Riverside Tower', type: 'Exterior', status: 'Rendering', progress: 65 },
                  { name: 'Parkview Residences', type: 'Interior', status: 'Complete', progress: 100 },
                  { name: 'Harbor Commercial', type: 'Walkthrough', status: 'In Review', progress: 80 },
                  { name: 'Mountain Retreat', type: 'XR', status: 'Draft', progress: 25 },
                ].map((project) => (
                  <div key={project.name} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-zinc-800/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <FolderIcon className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{project.name}</h4>
                        <p className="text-xs text-zinc-500">{project.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-1 sm:justify-end">
                      <div className="w-32">
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${project.progress}%` }} />
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                        {project.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold">Quick Actions</h3>
              <Link
                href="/app/admin/projects/new"
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-all border border-transparent hover:border-blue-500/30"
              >
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Plus className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-sm font-medium">New Project</span>
              </Link>
              <Link
                href="/app/admin/leads"
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-all border border-transparent hover:border-emerald-500/30"
              >
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <Target className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-sm font-medium">View Leads</span>
              </Link>
              <Link
                href="/app/admin/team"
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-all border border-transparent hover:border-purple-500/30"
              >
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-sm font-medium">Manage Team</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
