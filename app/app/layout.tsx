'use client';

import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, FolderOpen, Box, Sparkles, Globe, Layers, Image, Users, CreditCard, Settings, Plus, ArrowRight } from 'lucide-react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {children}
    </div>
  );
}