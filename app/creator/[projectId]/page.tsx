'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Upload, 
  Box, 
  Edit3, 
  Settings, 
  Share2, 
  BarChart3, 
  FileText,
  ChevronRight
} from 'lucide-react';

const sidebarItems = [
  { name: 'Overview', href: '', icon: LayoutDashboard },
  { name: 'Assets', href: 'assets', icon: FolderOpen },
  { name: '3D Editor', href: 'editor/3d', icon: Box },
  { name: 'Materials', href: 'editor/materials', icon: Edit3 },
  { name: 'Lighting', href: 'editor/lighting', icon: Settings },
  { name: 'Camera', href: 'editor/camera', icon: Settings },
  { name: 'Environment', href: 'editor/environment', icon: Box },
  { name: 'Hotspots', href: 'editor/hotspots', icon: Share2 },
  { name: 'Annotations', href: 'editor/annotations', icon: FileText },
  { name: 'Configurator', href: 'editor/configurator', icon: Settings },
  { name: 'XR Settings', href: 'xr-settings', icon: BarChart3 },
  { name: 'Publish', href: 'publish', icon: Share2 },
];

export default function ProjectWorkspace() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId || 'new';
  const [activeItem, setActiveItem] = useState('Overview');

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      <aside className="w-64 border-r border-zinc-800 h-screen overflow-y-auto">
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
            <LayoutDashboard className="w-4 h-4" />
            <span>Creator</span>
            <ChevronRight className="w-4 h-4" />
            <span>Project {projectId}</span>
          </div>
          <h2 className="font-bold text-lg truncate">Project Workspace</h2>
        </div>
        <nav className="p-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.name}
              href={`/creator/${projectId}/${item.href}`}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-zinc-800 transition-colors"
            >
              {React.createElement(item.icon, { className: 'w-4 h-4' })}
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold font-display">Project Workspace</h1>
          <p className="text-zinc-400 mt-1">Project ID: {projectId}</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8">
          <p className="text-zinc-400">Project workspace is being built.</p>
        </div>
      </main>
    </div>
  );
}
