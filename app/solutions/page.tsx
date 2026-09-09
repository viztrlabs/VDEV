'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, BarChart2, Home, Target, Users, DollarSign } from 'lucide-react';

const solutions = [
  { name: 'Architects', href: '/solutions/architects', icon: Home, desc: 'Design development & client presentation' },
  { name: 'Real Estate', href: '/solutions/real-estate', icon: Home, desc: 'Marketing visuals & virtual staging' },
  { name: 'Developers', href: '/solutions/developers', icon: BarChart2, desc: 'XR integration & API access' },
  { name: 'Interior Designers', href: '/solutions/interior-designers', icon: Target, desc: 'Luxury staging & material visualization' },
  { name: 'Agencies', href: '/solutions/agencies', icon: Users, desc: 'White-label creative production' },
];

export default function SolutionsHub() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold font-display mb-6">Solutions</h1>
          <p className="text-xl text-zinc-300 mb-8">
            Tailored visualization solutions for every industry.
          </p>
          <div className="space-y-4">
            {solutions.map((sol) => {
              const Icon = sol.icon;
              return (
                <Link
                  key={sol.name}
                  href={sol.href}
                  className="group flex items-start gap-4 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-emerald-500/50 transition-all"
                >
                  <div className="p-3 rounded-lg bg-emerald-500/20">
                    <Icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1 group-hover:text-emerald-400">{sol.name}</h3>
                    <p className="text-sm text-zinc-400">{sol.desc}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
