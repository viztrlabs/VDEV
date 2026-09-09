'use client';

import React from 'react';
import RoleLayout from '@/app/app/RoleLayout';
import { ChevronRight, LayoutDashboard } from 'lucide-react';

export default function VirtualTourPage() {
  return (
    <RoleLayout role="client">
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <LayoutDashboard className="w-4 h-4" />
          <ChevronRight className="w-4 h-4" />
          <span className="text-zinc-400">Virtual Tour</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold font-display">Virtual Tour</h1>
          <p className="text-zinc-400 mt-1">Client section</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center">
          <p className="text-zinc-400">This Client feature is being built.</p>
        </div>
      </div>
    </RoleLayout>
  );
}
