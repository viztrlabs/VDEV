'use client';

import React from 'react';
import Link from 'next/link';
import RoleLayout from '@/app/app/RoleLayout';
import { LayoutDashboard, FolderOpen, Calendar, MessageSquare, Receipt, CreditCard, HelpCircle, User, ArrowRight, CheckCircle, FolderOpen as FolderIcon } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/app/client', icon: LayoutDashboard },
  { name: 'Projects', href: '/app/client/projects', icon: FolderOpen },
  { name: 'Meetings', href: '/app/client/meetings', icon: Calendar },
  { name: 'Messages', href: '/app/client/messages', icon: MessageSquare },
  { name: 'Invoices', href: '/app/client/invoices', icon: Receipt },
  { name: 'Payments', href: '/app/client/payments', icon: CreditCard },
  { name: 'Support', href: '/app/client/support', icon: HelpCircle },
  { name: 'Profile', href: '/app/client/profile', icon: User },
];

export default function ClientDashboard() {
  return (
    <RoleLayout role="client">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-display">Client Portal</h1>
          <p className="text-zinc-400 mt-1">Review and collaborate on your projects</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Projects', value: '3', icon: FolderOpen, color: 'amber' },
            { label: 'Pending Reviews', value: '2', icon: CheckCircle, color: 'emerald' },
            { label: 'Upcoming Meetings', value: '1', icon: Calendar, color: 'blue' },
            { label: 'Unread Messages', value: '4', icon: MessageSquare, color: 'rose' },
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
          <div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold font-display">Your Projects</h2>
                <Link
                  href="/app/client/projects"
                  className="text-cyan-400 text-sm font-semibold flex items-center gap-1"
                >
                  View All
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-zinc-800">
                {[
                  { name: 'Riverside Tower', phase: 'Construction', status: 'On Track', milestone: 'Foundation Complete' },
                  { name: 'Parkview Residences', phase: 'Design', status: 'In Review', milestone: 'Interior Selections' },
                ].map((project) => (
                  <div key={project.name} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <FolderOpen className="w-6 h-6 text-amber-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{project.name}</h4>
                        <p className="text-xs text-zinc-500">{project.phase} • {project.milestone}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      project.status === 'On Track' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Upcoming Meeting</h3>
              <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-lg">
                <div className="w-14 h-14 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Parkview Residences - Design Review</h4>
                  <p className="text-sm text-zinc-400">Tomorrow, 2:00 PM • 60 min</p>
                  <p className="text-xs text-zinc-500 mt-1">Interior material selections review</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Unread Messages</h3>
              <div className="space-y-3">
                {[
                  { from: 'Sarah (PM)', preview: 'Please review the latest interior renders...', time: '2h ago', unread: true },
                  { from: 'Mike (Architect)', preview: 'Updated floor plans uploaded...', time: '5h ago', unread: true },
                  { from: 'Emily (Designer)', preview: 'Material samples ready for review...', time: '1d ago', unread: false },
                ].map((msg) => (
                  <div key={msg.from} className={`flex items-start gap-3 p-3 rounded-lg ${msg.unread ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-zinc-800/50'}`}>
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{msg.from}</p>
                      <p className="text-xs text-zinc-400">{msg.preview}</p>
                      <p className="text-[10px] text-zinc-500 mt-1">{msg.time}</p>
                    </div>
                    {msg.unread && <span className="w-2 h-2 bg-emerald-500 rounded-full" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
