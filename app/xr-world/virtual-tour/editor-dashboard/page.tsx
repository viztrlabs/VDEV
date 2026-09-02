'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Plus,
  Grid3X3,
  List as ListIcon,
  Search,
  Edit3,
  Eye,
  Trash2,
  Share2,
  Calendar,
  Layers,
  Cloud,
  Lock,
  Clock,
  Tag,
  Crown,
  Star,
  MapPin,
  DoorOpen,
  Info,
  Settings,
  Upload,
  Zap,
} from 'lucide-react';

const MarzipanoViewer = dynamic(() => import('@/components/xr/MarzipanoViewer'), {
  ssr: false,
});

type Tab = 'marzipano' | 'preview' | 'settings';
type SubTab = 'scenes' | 'hotspots' | 'settings';

interface MarzipanoScene {
  id: string;
  name: string;
  panoramaUrl: string;
  initialYaw: number;
  initialPitch: number;
  initialFov: number;
  linkHotspots: MarzipanoHotspot[];
  infoHotspots: MarzipanoHotspot[];
}

interface MarzipanoHotspot {
  id: string;
  yaw: number;
  pitch: number;
  rotation?: number;
  title: string;
  text?: string;
  target?: string;
  type: 'link' | 'info';
}

interface MarzipanoSettings {
  mouseViewMode: 'drag' | 'qtvr';
  autorotateEnabled: boolean;
  autorotateSpeed: number;
  fullscreenButton: boolean;
  viewControlButtons: boolean;
}

interface ProjectData {
  id: string;
  name: string;
  tourId: string;
  author: string;
  sceneCount: number;
  status: string;
  engine: string;
  scenes: MarzipanoScene[];
  settings: MarzipanoSettings;
  createdAt: string;
  updatedAt: string;
}

const PREVIEW_CARDS = [
  { title: 'Quick Start', body: 'Learn how to create your first Marzipano tour.', badge: 'NEW' },
  { title: 'Best Practices', body: 'Tips for creating engaging 360° experiences.', badge: 'Essentials' },
  { title: 'Help Center', body: 'Get help with Marzipano integration.', badge: 'Support' },
];

export default function TourEditorDashboardPage() {
  const [tab, setTab] = useState<Tab>('marzipano');
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<SubTab>('scenes');
  const [newSceneName, setNewSceneName] = useState('');
  const [editingScene, setEditingScene] = useState<string | null>(null);
  const [showAddHotspot, setShowAddHotspot] = useState(false);
  const [hotspotType, setHotspotType] = useState<'link' | 'info'>('info');
  const [hotspotYaw, setHotspotYaw] = useState(0);
  const [hotspotPitch, setHotspotPitch] = useState(0);
  const [hotspotTitle, setHotspotTitle] = useState('');
  const [hotspotTarget, setHotspotTarget] = useState('');
  const [hotspotText, setHotspotText] = useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'failed');
      const projectsWithDefaults = (data.projects || []).map((p: any) => ({
        ...p,
        scenes: p.scenes || [],
        settings: p.settings || {
          mouseViewMode: 'drag' as const,
          autorotateEnabled: false,
          autorotateSpeed: 0.5,
          fullscreenButton: true,
          viewControlButtons: true,
        },
        engine: 'marzipano',
      }));
      setProjects(projectsWithDefaults);
    } catch (e: any) {
      setError(e?.message || 'failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'marzipano') fetchProjects();
  }, [tab]);

  const createProject = async () => {
    const name = prompt('Project name?');
    if (!name) return;
    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          tourId: 'marzipano-default',
          author: 'You',
          sceneCount: 0,
          status: 'draft',
          engine: 'marzipano',
          scenes: [],
          settings: {
            mouseViewMode: 'drag' as const,
            autorotateEnabled: false,
            autorotateSpeed: 0.5,
            fullscreenButton: true,
            viewControlButtons: true,
          },
        }),
      });
      fetchProjects();
    } catch (e: any) {
      setError(e?.message || 'create failed');
    }
  };

  const removeProject = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    try {
      await fetch(`/api/projects?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      fetchProjects();
      if (selectedProject?.id === id) setSelectedProject(null);
    } catch (e: any) {
      setError(e?.message || 'delete failed');
    }
  };

  const viewProject = (project: ProjectData) => {
    setSelectedProject(project);
    setShowPreview(true);
  };

  const selectProject = (project: ProjectData) => {
    setSelectedProject(project);
    setShowPreview(false);
  };

  const addScene = async () => {
    if (!selectedProject || !newSceneName.trim()) return;
    const newScene: MarzipanoScene = {
      id: `scene-${Date.now()}`,
      name: newSceneName.trim(),
      panoramaUrl: '',
      initialYaw: 0,
      initialPitch: 0,
      initialFov: Math.PI / 2,
      linkHotspots: [],
      infoHotspots: [],
    };
    const updatedScenes = [...selectedProject.scenes, newScene];
    try {
      await fetch(`/api/projects?id=${encodeURIComponent(selectedProject.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenes: updatedScenes, sceneCount: updatedScenes.length }),
      });
      setNewSceneName('');
      setSubTab('scenes');
      fetchProjects();
    } catch (e: any) {
      setError(e?.message || 'add scene failed');
    }
  };

  const removeScene = async (sceneId: string) => {
    if (!selectedProject || !confirm('Remove this scene?')) return;
    try {
      const updatedScenes = selectedProject.scenes.filter((s) => s.id !== sceneId);
      await fetch(`/api/projects?id=${encodeURIComponent(selectedProject.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenes: updatedScenes, sceneCount: updatedScenes.length }),
      });
      if (editingScene === sceneId) setEditingScene(null);
      fetchProjects();
    } catch (e: any) {
      setError(e?.message || 'remove scene failed');
    }
  };

  const updateSceneField = async (sceneId: string, field: string, value: any) => {
    if (!selectedProject) return;
    try {
      const updatedScenes = selectedProject.scenes.map((s) =>
        s.id === sceneId ? { ...s, [field]: value } : s
      );
      await fetch(`/api/projects?id=${encodeURIComponent(selectedProject.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenes: updatedScenes }),
      });
      fetchProjects();
    } catch (e: any) {
      setError(e?.message || 'update scene failed');
    }
  };

  const addHotspot = async () => {
    if (!selectedProject || !editingScene || !hotspotTitle.trim()) return;
    const newHotspot: MarzipanoHotspot = {
      id: `hotspot-${Date.now()}`,
      yaw: hotspotYaw,
      pitch: hotspotPitch,
      title: hotspotTitle.trim(),
      text: hotspotText.trim(),
      target: hotspotTarget.trim(),
      type: hotspotType,
      rotation: 0,
    };
    const updatedScenes = selectedProject.scenes.map((s) => {
      if (s.id === editingScene) {
        return {
          ...s,
          [hotspotType === 'link' ? 'linkHotspots' : 'infoHotspots']: [
            ...(hotspotType === 'link' ? s.linkHotspots : s.infoHotspots),
            newHotspot,
          ],
        };
      }
      return s;
    });
    try {
      await fetch(`/api/projects?id=${encodeURIComponent(selectedProject.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenes: updatedScenes }),
      });
      setShowAddHotspot(false);
      setHotspotTitle('');
      setHotspotText('');
      setHotspotTarget('');
      fetchProjects();
    } catch (e: any) {
      setError(e?.message || 'add hotspot failed');
    }
  };

  const removeHotspot = async (sceneId: string, hotspotId: string, type: 'link' | 'info') => {
    if (!selectedProject) return;
    try {
      const updatedScenes = selectedProject.scenes.map((s) => {
        if (s.id === sceneId) {
          return {
            ...s,
            [type === 'link' ? 'linkHotspots' : 'infoHotspots']: (
              s[type === 'link' ? 'linkHotspots' : 'infoHotspots'] || []
            ).filter((h) => h.id !== hotspotId),
          };
        }
        return s;
      });
      await fetch(`/api/projects?id=${encodeURIComponent(selectedProject.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenes: updatedScenes }),
      });
      fetchProjects();
    } catch (e: any) {
      setError(e?.message || 'remove hotspot failed');
    }
  };

  const updateSettings = async (updates: Partial<MarzipanoSettings>) => {
    if (!selectedProject) return;
    try {
      const newSettings = { ...selectedProject.settings, ...updates };
      await fetch(`/api/projects?id=${encodeURIComponent(selectedProject.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: newSettings }),
      });
      fetchProjects();
    } catch (e: any) {
      setError(e?.message || 'settings update failed');
    }
  };

  const filtered = projects.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getSceneHotspots = (scene: MarzipanoScene, type: 'link' | 'info') => {
    return type === 'link' ? (scene.linkHotspots || []) : (scene.infoHotspots || []);
  };

  const isProjectSelected = selectedProject && !showPreview;

  return (
    <div className="h-screen bg-[#09090B] text-white flex flex-col">
      <div className="flex-1 min-h-0 overflow-auto">
        {tab === 'marzipano' && (
          <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            {error && (
              <div className="mb-3 px-3 py-2 bg-rose-950/40 border border-rose-900 text-rose-300 text-xs font-mono rounded">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div>
                <h1 className="text-base font-mono font-bold text-[#3ECF8E]">Marzipano Tour Editor Dashboard</h1>
                <p className="text-[10px] font-mono text-[#71717A]">Manage your Marzipano-powered virtual tours with scene management</p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['marzipano'] as Tab[]).map((t) => (
                  <button key={t} type="button" onClick={() => setTab(t)} className="px-3 py-1.5 rounded-lg text-xs font-mono capitalize bg-[#18181B] text-[#3ECF8E] border border-[#3ECF8E]">{t}</button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={createProject} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#3ECF8E]/80 text-black text-xs font-bold font-mono">
                  <Plus className="w-3.5 h-3.5" /> New Marzipano Tour
                </button>
                <button type="button" onClick={() => setView('grid')} className={`p-1.5 rounded ${view === 'grid' ? 'bg-[#3ECF8E] text-black' : 'text-[#71717A] hover:text-white'}`} title="Grid view"><Grid3X3 className="w-4 h-4" /></button>
                <button type="button" onClick={() => setView('list')} className={`p-1.5 rounded ${view === 'list' ? 'bg-[#3ECF8E] text-black' : 'text-[#71717A] hover:text-white'}`} title="List view"><ListIcon className="w-4 h-4" /></button>
                <span className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-mono ml-2">
                  <Clock className="w-3 h-3" /> Marzipano Engine
                </span>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-[#71717A]" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Marzipano tours…" className="pl-7 pr-2 py-1.5 rounded bg-[#18181B] border border-[#27272A] text-xs font-mono text-white w-48" />
              </div>
            </div>

            {loading ? (
              <div className="text-center text-xs font-mono text-[#71717A] py-12">Loading Marzipano tours…</div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-xs font-mono text-[#71717A] py-12 border border-dashed border-[#27272A] rounded-lg">
                {projects.length === 0 ? 'No Marzipano tours yet. Click "New Marzipano Tour" to start.' : 'No tours match the search.'}
              </div>
            ) : view === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filtered.map((p) => <ProjectCard key={p.id} project={p} onDelete={() => removeProject(p.id)} onView={() => viewProject(p)} onSelect={() => selectProject(p)} />)}
              </div>
            ) : (
              <table className="w-full text-xs font-mono">
                <thead><tr className="text-[#71717A] border-b border-[#27272A]">
                  <th className="text-left p-2">Project</th><th className="text-left p-2">Type</th><th className="text-left p-2">Scenes</th><th className="text-left p-2">Status</th><th className="text-left p-2">Modified</th><th className="text-right p-2">Actions</th>
                </tr></thead>
                <tbody>
                  {filtered.map((p) => <tr key={p.id} className="border-b border-[#18181B] hover:bg-[#0c0c0f]">
                    <td className="p-2 flex items-center gap-2">
                      {p.thumbnailUrl ? <img src={p.thumbnailUrl} alt={p.name} className="w-8 h-8 rounded object-cover" /> : <div className="w-8 h-8 rounded bg-[#3ECF8E]/20" />}
                      <div><div className="text-white">{p.name}</div><div className="text-[9px] text-[#71717A]">{p.id.slice(-8)}</div></div>
                    </td>
                    <td className="p-2 text-[#A1A1AA]"><span className="px-1.5 py-0.5 rounded bg-[#3ECF8E]/15 text-[#3ECF8E]">{p.engine || 'Marzipano'}</span></td>
                    <td className="p-2 text-[#A1A1AA]">{p.sceneCount || 0}</td>
                    <td className="p-2"><span className={`px-1.5 py-0.5 rounded text-[10px] ${p.status === 'published' ? 'bg-[#3ECF8E]/15 text-[#3ECF8E]' : 'bg-amber-500/15 text-amber-400'}`}>{p.status === 'published' ? 'Published' : 'Draft'}</span></td>
                    <td className="p-2 text-[#71717A]">{new Date(p.updatedAt).toLocaleString()}</td>
                    <td className="p-2 text-right">
                      <button onClick={() => selectProject(p)} className="inline-flex p-1 hover:text-[#3ECF8E]" title="Edit"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => viewProject(p)} className="inline-flex p-1 hover:text-[#3ECF8E]" title="Preview"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => removeProject(p.id)} className="inline-flex p-1 hover:text-rose-400" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>)}
                </tbody>
              </table>
            )}
          </div>
        )}

        {isProjectSelected && (
          <ProjectEditor project={selectedProject} onBack={() => { setSelectedProject(null); setShowPreview(false); }} onRefresh={fetchProjects} />
        )}

        {tab === 'preview' && showPreview && selectedProject && (
          <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div><h1 className="text-base font-mono font-bold text-white">Tour Preview: {selectedProject.name}</h1><p className="text-[10px] font-mono text-[#71717A]">Engine: {selectedProject.engine || 'Marzipano'} • Scenes: {selectedProject.scenes?.length || 0}</p></div>
              <button onClick={() => { setShowPreview(false); setSelectedProject(null); }} className="px-3 py-1.5 rounded bg-[#27272A] hover:bg-[#3ECF8E]/20 text-[#A1A1AA] hover:text-white text-xs font-mono">Back to Projects</button>
            </div>
            <div className="bg-black rounded-lg border border-[#27272A] overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
              <MarzipanoViewer scene={selectedProject.scenes?.[0] ? { id: selectedProject.scenes[0].id, name: selectedProject.scenes[0].name, type: '360', url: selectedProject.scenes[0].panoramaUrl, hotspots: [...(selectedProject.scenes[0].linkHotspots || []), ...(selectedProject.scenes[0].infoHotspots || [])].map(h => ({ position: { yaw: h.yaw, pitch: h.pitch }, title: h.title, type: h.type === 'link' ? 'room_link' : 'info' })) } : { id: 'default', name: 'No Scenes', type: '360', url: '', hotspots: [] } } />
            </div>
          </div>
        )}

        {tab === 'preview' && !showPreview && (
          <div className="p-4 sm:p-6 max-w-5xl mx-auto text-center text-xs font-mono text-[#71717A] py-12">
            <Eye className="w-8 h-8 mx-auto mb-2 text-[#3ECF8E]" />Select a project to preview it.
          </div>
        )}

        {tab === 'settings' && (
          <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4">
            <h2 className="text-base font-mono font-bold text-[#3ECF8E]">Marzipano Settings</h2>
            <div className="rounded-xl border border-[#27272A] bg-[#0c0c0f] p-4 space-y-3">
              <div className="text-xs font-mono text-[#71717A]">Core Marzipano engine settings for tour rendering, controls, and viewer configuration.</div>
              <button onClick={() => setTab('marzipano')} className="px-3 py-1.5 rounded bg-[#3ECF8E] hover:bg-[#3ECF8E]/80 text-black text-xs font-mono font-bold">Manage Marzipano Tours</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PREVIEW_CARDS.map((c) => (<div key={c.title} className="rounded-xl border border-[#27272A] bg-[#0c0c0f] p-4 space-y-2"><div className="text-[10px] font-mono uppercase text-amber-400 tracking-wider">{c.badge}</div><div className="text-sm font-mono font-bold text-white">{c.title}</div><p className="text-[10px] font-mono text-[#A1A1AA]">{c.body}</p></div>))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectEditor({ project, onBack, onRefresh }: { project: ProjectData; onBack: () => void; onRefresh: () => void }) {
  const [subTab, setSubTab] = useState<'scenes' | 'hotspots' | 'settings'>('scenes');
  const [newSceneName, setNewSceneName] = useState('');
  const [editingScene, setEditingScene] = useState<string | null>(null);
  const [showAddHotspot, setShowAddHotspot] = useState(false);
  const [hotspotType, setHotspotType] = useState<'link' | 'info'>('info');
  const [hotspotYaw, setHotspotYaw] = useState(0);
  const [hotspotPitch, setHotspotPitch] = useState(0);
  const [hotspotTitle, setHotspotTitle] = useState('');
  const [hotspotTarget, setHotspotTarget] = useState('');
  const [hotspotText, setHotspotText] = useState('');
  const [settings, setSettings] = useState(project.settings);

  const scenes = useMemo(() => project.scenes || [], [project.scenes]);

  const handleAddScene = useCallback(() => {
    if (!newSceneName.trim()) return;
    const newScene = { id: `scene-${Date.now()}`, name: newSceneName.trim(), panoramaUrl: '', initialYaw: 0, initialPitch: 0, initialFov: Math.PI / 2, linkHotspots: [], infoHotspots: [] };
    fetch(`/api/projects?id=${encodeURIComponent(project.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scenes: [...scenes, newScene] }) }).then(() => { onRefresh(); setNewSceneName(''); });
  }, [newSceneName, scenes, project.id, onRefresh]);

  const handleRemoveScene = useCallback((sceneId: string) => {
    if (!confirm('Remove this scene?')) return;
    fetch(`/api/projects?id=${encodeURIComponent(project.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scenes: [...scenes].filter((s) => s.id !== sceneId) }) }).then(() => { if (editingScene === sceneId) setEditingScene(null); onRefresh(); });
  }, [scenes, project.id, editingScene, onRefresh]);

  const handleUpdateScene = useCallback((sceneId: string, field: string, value: any) => {
    const updated = scenes.map((s) => (s.id === sceneId ? { ...s, [field]: value } : s));
    fetch(`/api/projects?id=${encodeURIComponent(project.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scenes: updated }) }).then(onRefresh);
  }, [scenes, project.id, onRefresh]);

  const handleAddHotspot = useCallback(() => {
    if (!hotspotTitle.trim()) return;
    const newHotspot = { id: `hotspot-${Date.now()}`, yaw: hotspotYaw, pitch: hotspotPitch, title: hotspotTitle.trim(), text: hotspotText.trim(), target: hotspotTarget.trim(), type: hotspotType, rotation: 0 };
    const updated = scenes.map((s) => {
      if (s.id === editingScene) {
        return { ...s, [hotspotType === 'link' ? 'linkHotspots' : 'infoHotspots']: [...(s[hotspotType === 'link' ? 'linkHotspots' : 'infoHotspots'] || []), newHotspot] };
      }
      return s;
    });
    fetch(`/api/projects?id=${encodeURIComponent(project.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scenes: updated }) }).then(() => { setShowAddHotspot(false); setHotspotTitle(''); setHotspotText(''); setHotspotTarget(''); onRefresh(); });
  }, [hotspotType, hotspotYaw, hotspotPitch, hotspotTitle, hotspotTarget, hotspotText, scenes, project.id, editingScene, onRefresh]);

  const handleRemoveHotspot = useCallback((sceneId: string, hotspotId: string, type: 'link' | 'info') => {
    if (!confirm('Remove this hotspot?')) return;
    const updated = scenes.map((s) => {
      if (s.id === sceneId) return { ...s, [type === 'link' ? 'linkHotspots' : 'infoHotspots']: (s[type === 'link' ? 'linkHotspots' : 'infoHotspots'] || []).filter((h) => h.id !== hotspotId) };
      return s;
    });
    fetch(`/api/projects?id=${encodeURIComponent(project.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scenes: updated }) }).then(onRefresh);
  }, [scenes, project.id, onRefresh]);

  const handleSaveSettings = useCallback(() => {
    fetch(`/api/projects?id=${encodeURIComponent(project.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ settings }) }).then(onRefresh);
  }, [settings, project.id, onRefresh]);

  const yawToPercent = (yaw: number) => ((yaw + Math.PI) / (2 * Math.PI)) * 100;
  const pitchToPercent = (pitch: number) => ((Math.PI / 2 - pitch) / Math.PI) * 100;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <button onClick={onBack} className="text-[#3ECF8E] hover:text-white text-xs font-mono mb-2 inline-flex items-center gap-1">&larr; Back to Projects</button>
          <h1 className="text-base font-mono font-bold text-white">{project.name}</h1>
          <p className="text-[10px] font-mono text-[#71717A]">Marzipano Tour • {scenes.length} scene{scenes.length !== 1 ? 's' : ''} • Engine: {project.engine}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="px-3 py-1.5 rounded bg-[#27272A] hover:bg-[#3ECF8E]/20 text-[#A1A1AA] hover:text-white text-xs font-mono">Back to Projects</button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-4">
        {([['scenes', 'Scenes'], ['hotspots', 'Hotspots'], ['settings', 'Settings']] as [SubTab, string][]).map(([key, label]) => (
          <button key={key} type="button" onClick={() => setSubTab(key)} className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize ${subTab === key ? 'bg-[#18181B] text-[#3ECF8E] border border-[#3ECF8E]' : 'text-[#A1A1AA] hover:text-white'}`}>{label}</button>
        ))}
      </div>

      {subTab === 'scenes' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input value={newSceneName} onChange={(e) => setNewSceneName(e.target.value)} placeholder="New scene name…" className="flex-1 px-3 py-1.5 rounded bg-[#18181B] border border-[#27272A] text-xs font-mono text-white" />
            <button onClick={handleAddScene} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#3ECF8E] hover:bg-[#3ECF8E]/80 text-black text-xs font-bold font-mono"><Plus className="w-3.5 h-3.5" /> Add Scene</button>
          </div>
          {scenes.length === 0 ? (
            <div className="text-center text-xs font-mono text-[#71717A] py-12 border border-dashed border-[#27272A] rounded-lg">No scenes yet. Add your first equirectangular panorama scene above.</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {scenes.map((scene) => (
                <div key={scene.id} className="rounded-lg border border-[#27272A] bg-[#0c0c0f] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#3ECF8E]" />
                      {editingScene === scene.id ? (
                        <input value={scene.name} onChange={(e) => handleUpdateScene(scene.id, 'name', e.target.value)} className="bg-transparent text-sm font-mono text-white border-b border-[#3ECF8E] outline-none" />
                      ) : (
                        <span className="text-sm font-mono font-bold text-white cursor-pointer hover:text-[#3ECF8E]" onClick={() => setEditingScene(editingScene === scene.id ? null : scene.id)}>{scene.name}</span>
                      )}
                    </div>
                    <button onClick={() => handleRemoveScene(scene.id)} className="p-1 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  {editingScene === scene.id && (
                    <div className="space-y-2 p-2 bg-[#18181B] rounded border border-[#27272A]">
                      <div>
                        <label className="text-[10px] font-mono text-[#71717A]">Panorama URL</label>
                        <input value={scene.panoramaUrl} onChange={(e) => handleUpdateScene(scene.id, 'panoramaUrl', e.target.value)} className="w-full px-2 py-1 rounded bg-[#09090B] border border-[#27272A] text-xs font-mono text-white" placeholder="https://example.com/panorama.jpg" />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] font-mono text-[#71717A]">Yaw (rad)</label>
                          <input type="number" value={scene.initialYaw} onChange={(e) => handleUpdateScene(scene.id, 'initialYaw', Number(e.target.value))} className="w-full px-2 py-1 rounded bg-[#09090B] border border-[#27272A] text-xs font-mono text-white" />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-[#71717A]">Pitch (rad)</label>
                          <input type="number" value={scene.initialPitch} onChange={(e) => handleUpdateScene(scene.id, 'initialPitch', Number(e.target.value))} className="w-full px-2 py-1 rounded bg-[#09090B] border border-[#27272A] text-xs font-mono text-white" />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-[#71717A]">FOV (rad)</label>
                          <input type="number" value={scene.initialFov} onChange={(e) => handleUpdateScene(scene.id, 'initialFov', Number(e.target.value))} className="w-full px-2 py-1 rounded bg-[#09090B] border border-[#27272A] text-xs font-mono text-white" />
                        </div>
                      </div>
                      <div className="text-[10px] font-mono text-[#71717A]">Equirect: x={yawToPercent(scene.initialYaw).toFixed(1)}% y={pitchToPercent(scene.initialPitch).toFixed(1)}%</div>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] font-mono text-[#71717A]">Link hotspots:</span>
                        <span className="text-[10px] font-mono text-[#3ECF8E]">{(scene.linkHotspots || []).length}</span>
                        <span className="text-[10px] font-mono text-[#71717A]">Info hotspots:</span>
                        <span className="text-[10px] font-mono text-[#3ECF8E]">{(scene.infoHotspots || []).length}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {subTab === 'hotspots' && (
        <div className="space-y-4">
          {editingScene && scenes.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-mono font-bold text-white">Managing hotspots for <span className="text-[#3ECF8E]">{scenes.find((s) => s.id === editingScene)?.name}</span></h3>
                <button onClick={() => setShowAddHotspot(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#3ECF8E] hover:bg-[#3ECF8E]/80 text-black text-xs font-bold font-mono"><Plus className="w-3.5 h-3.5" /> Add Hotspot</button>
              </div>

              {showAddHotspot && (
                <div className="rounded-lg border border-[#27272A] bg-[#0c0c0f] p-4 space-y-3">
                  <h4 className="text-xs font-mono font-bold text-white">Add New Hotspot</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-mono text-[#71717A]">Type</label>
                      <select value={hotspotType} onChange={(e) => setHotspotType(e.target.value as 'link' | 'info')} className="w-full px-2 py-1 rounded bg-[#18181B] border border-[#27272A] text-xs font-mono text-white">
                        <option value="info">Info</option><option value="link">Link</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-[#71717A]">Title</label>
                      <input value={hotspotTitle} onChange={(e) => setHotspotTitle(e.target.value)} className="w-full px-2 py-1 rounded bg-[#09090B] border border-[#27272A] text-xs font-mono text-white" placeholder="Hotspot title" />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-[#71717A]">Yaw (rad)</label>
                      <input type="number" value={hotspotYaw} onChange={(e) => setHotspotYaw(Number(e.target.value))} className="w-full px-2 py-1 rounded bg-[#09090B] border border-[#27272A] text-xs font-mono text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-[#71717A]">Pitch (rad)</label>
                      <input type="number" value={hotspotPitch} onChange={(e) => setHotspotPitch(Number(e.target.value))} className="w-full px-2 py-1 rounded bg-[#09090B] border border-[#27272A] text-xs font-mono text-white" />
                    </div>
                    {hotspotType === 'link' && (
                      <div className="col-span-2">
                        <label className="text-[10px] font-mono text-[#71717A]">Target Scene ID</label>
                        <input value={hotspotTarget} onChange={(e) => setHotspotTarget(e.target.value)} className="w-full px-2 py-1 rounded bg-[#09090B] border border-[#27272A] text-xs font-mono text-white" placeholder="target-scene-id" />
                      </div>
                    )}
                    {!hotspotType === 'link' && (
                      <div className="col-span-2">
                        <label className="text-[10px] font-mono text-[#71717A]">Description</label>
                        <input value={hotspotText} onChange={(e) => setHotspotText(e.target.value)} className="w-full px-2 py-1 rounded bg-[#09090B] border border-[#27272A] text-xs font-mono text-white" placeholder="Info text" />
                      </div>
                    )}
                    <div className="col-span-2 flex gap-2">
                      <button onClick={handleAddHotspot} className="px-3 py-1.5 rounded bg-[#3ECF8E] hover:bg-[#3ECF8E]/80 text-black text-xs font-bold font-mono">Add Hotspot</button>
                      <button onClick={() => { setShowAddHotspot(false); setHotspotTitle(''); setHotspotText(''); setHotspotTarget(''); }} className="px-3 py-1.5 rounded bg-[#27272A] hover:bg-[#3ECF8E]/20 text-[#A1A1AA] text-xs font-mono">Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="rounded-lg border border-[#27272A] bg-[#0c0c0f] p-4">
                  <h4 className="text-xs font-mono font-bold text-[#3ECF8E] mb-2 flex items-center gap-1.5"><DoorOpen className="w-3.5 h-3.5" /> Link Hotspots ({(scenes.find((s) => s.id === editingScene)?.linkHotspots || []).length})</h4>
                  {(scenes.find((s) => s.id === editingScene)?.linkHotspots || []).length === 0 ? <div className="text-[10px] font-mono text-[#71717A] py-2">No link hotspots</div> : (
                    <div className="space-y-2">
                      {(scenes.find((s) => s.id === editingScene)?.linkHotspots || []).map((h) => (
                        <div key={h.id} className="flex items-center justify-between p-2 bg-[#18181B] rounded border border-[#27272A]">
                          <div><div className="text-xs font-mono text-white">{h.title}</div><div className="text-[10px] font-mono text-[#71717A]">yaw: {h.yaw.toFixed(2)} pitch: {h.pitch.toFixed(2)} → {h.target}</div></div>
                          <button onClick={() => handleRemoveHotspot(editingScene, h.id, 'link')} className="p-1 hover:text-rose-400"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="rounded-lg border border-[#27272A] bg-[#0c0c0f] p-4">
                  <h4 className="text-xs font-mono font-bold text-[#3ECF8E] mb-2 flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> Info Hotspots ({(scenes.find((s) => s.id === editingScene)?.infoHotspots || []).length})</h4>
                  {(scenes.find((s) => s.id === editingScene)?.infoHotspots || []).length === 0 ? <div className="text-[10px] font-mono text-[#71717A] py-2">No info hotspots</div> : (
                    <div className="space-y-2">
                      {(scenes.find((s) => s.id === editingScene)?.infoHotspots || []).map((h) => (
                        <div key={h.id} className="flex items-center justify-between p-2 bg-[#18181B] rounded border border-[#27272A]">
                          <div><div className="text-xs font-mono text-white">{h.title}</div><div className="text-[10px] font-mono text-[#71717A]">yaw: {h.yaw.toFixed(2)} pitch: {h.pitch.toFixed(2)}</div><div className="text-[10px] font-mono text-[#A1A1AA]">{h.text}</div></div>
                          <button onClick={() => handleRemoveHotspot(editingScene, h.id, 'info')} className="p-1 hover:text-rose-400"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-xs font-mono text-[#71717A] py-12 border border-dashed border-[#27272A] rounded-lg">Select a scene to manage its hotspots.</div>
          )}
        </div>
      )}

      {subTab === 'settings' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#27272A] bg-[#0c0c0f] p-4 space-y-3">
            <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2"><Settings className="w-4 h-4 text-[#3ECF8E]" /> Marzipano Viewer Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono text-[#71717A]">Mouse View Mode</label>
                <select value={settings.mouseViewMode} onChange={(e) => setSettings({ ...settings, mouseViewMode: e.target.value as 'drag' | 'qtvr' })} className="w-full px-2 py-1 rounded bg-[#18181B] border border-[#27272A] text-xs font-mono text-white">
                  <option value="drag">Drag</option><option value="qtvr">QTVR</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={settings.autorotateEnabled} onChange={(e) => setSettings({ ...settings, autorotateEnabled: e.target.checked })} className="rounded" />
                <label className="text-[10px] font-mono text-[#71717A]">Autorotate Enabled</label>
              </div>
              <div>
                <label className="text-[10px] font-mono text-[#71717A]">Autorotate Speed</label>
                <input type="number" value={settings.autorotateSpeed} onChange={(e) => setSettings({ ...settings, autorotateSpeed: Number(e.target.value) })} className="w-full px-2 py-1 rounded bg-[#09090B] border border-[#27272A] text-xs font-mono text-white" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={settings.fullscreenButton} onChange={(e) => setSettings({ ...settings, fullscreenButton: e.target.checked })} className="rounded" />
                <label className="text-[10px] font-mono text-[#71717A]">Fullscreen Button</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={settings.viewControlButtons} onChange={(e) => setSettings({ ...settings, viewControlButtons: e.target.checked })} className="rounded" />
                <label className="text-[10px] font-mono text-[#71717A]">View Control Buttons</label>
              </div>
            </div>
            <button onClick={handleSaveSettings} className="px-3 py-1.5 rounded bg-[#3ECF8E] hover:bg-[#3ECF8E]/80 text-black text-xs font-bold font-mono">Save Settings</button>
          </div>
          <div className="rounded-lg border border-[#27272A] bg-[#0c0c0f] p-4 space-y-3">
            <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2"><Zap className="w-4 h-4 text-[#3ECF8E]" /> Coordinate Bridge Reference</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] font-mono">
              <div className="p-2 bg-[#18181B] rounded border border-[#27272A]">
                <div className="text-[#3ECF8E] font-bold mb-1">yaw → xPercent</div>
                <div className="text-[#A1A1AA]">x = ((yaw + π) / 2π) × 100</div>
                <div className="text-[#71717A]">yaw=+π/2 → x=75%</div>
              </div>
              <div className="p-2 bg-[#18181B] rounded border border-[#27272A]">
                <div className="text-[#3ECF8E] font-bold mb-1">pitch → yPercent</div>
                <div className="text-[#A1A1AA]">y = ((π/2 - pitch) / π) × 100</div>
                <div className="text-[#71717A]">pitch=0 → y=50%</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, onDelete, onView, onSelect }: { project: ProjectData; onDelete: () => void; onView: () => void; onSelect: () => void }) {
  return (
    <div className="group rounded-lg border border-[#27272A] bg-[#0c0c0f] overflow-hidden hover:border-[#3ECF8E]/40 transition-colors">
      <div className="relative aspect-video bg-[#18181B]">
        {project.thumbnailUrl ? (
          <img src={project.thumbnailUrl} alt={project.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#3ECF8E]/30"><Layers className="w-12 h-12" /></div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex items-center gap-1.5">
            <button onClick={onSelect} className="p-2 rounded bg-[#3ECF8E] text-black" title="Edit"><Edit3 className="w-4 h-4" /></button>
            <button onClick={onView} className="p-2 rounded bg-white/10 backdrop-blur text-white border border-white/20" title="Preview"><Eye className="w-4 h-4" /></button>
            <button onClick={onDelete} className="p-2 rounded bg-rose-500/80 text-white" title="Delete"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-[#3ECF8E] flex items-center gap-1"><Tag className="w-2.5 h-2.5" />Marzipano</div>
        <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white">{project.sceneCount || 0} scenes</div>
      </div>
      <div className="p-2.5 space-y-1">
        <div className="flex items-center justify-between"><span className="text-sm font-mono text-white truncate">{project.name}</span><span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${project.status === 'published' ? 'bg-[#3ECF8E]/15 text-[#3ECF8E]' : 'bg-amber-500/15 text-amber-400'}`}>{project.status === 'published' ? 'Published' : 'Draft'}</span></div>
        <div className="text-[10px] font-mono text-[#71717A] flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(project.updatedAt).toLocaleString()}</div>
      </div>
    </div>
  );
}