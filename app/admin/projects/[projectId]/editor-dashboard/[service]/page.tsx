'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, notFound } from 'next/navigation';
import { ServiceEditorPanels } from '@/components/editor/service-editor-panels';
import { DeviceCompatibility } from '@/components/editor/device-compatibility';
import { Timeline } from '@/components/editor/timeline';
import { EditorErrorBoundary } from '@/components/editor/editor-error-boundary';
import { PermissionProvider } from '@/components/editor/permissions';
import { SERVICE_META } from '@/lib/service-meta';
import { buildServiceTabs } from '@/lib/service-editor-tabs';
import { onEditorSave } from '@/lib/editor-sync';
import { openEditorProject } from '@/lib/editor/launch';
import { ExternalLink, Play } from 'lucide-react';

export default function ServiceEditorPage() {
  const params = useParams<{ projectId: string; service: string }>();
  const projectId = params?.projectId;
  const serviceSlug = params?.service;

  const meta = serviceSlug ? SERVICE_META[serviceSlug] : undefined;
  const [data, setData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const experienceOptions = (data.experiences || []).map((e: any) => ({ label: e.title, value: e.id }));
  const tabs = buildServiceTabs(experienceOptions);

  const timelineItems = [
    { id: 't1', title: 'Entrance scene', start: 0, duration: 20, type: 'scene' },
    { id: 't2', title: 'Living room', start: 20, duration: 25, type: 'scene' },
  ];

  const loadConfigs = useCallback(async () => {
    if (!projectId) return;
    try {
      const configsRes = await fetch(`/api/experience-configs?projectId=${encodeURIComponent(projectId)}`);
      const configs = await configsRes.json();
      if (configsRes.ok) {
        setData(prev => ({ ...prev, configs: configs.configs || [] }));
      }
    } catch {}
  }, [projectId]);

  useEffect(() => {
    if (!projectId || !serviceSlug) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(undefined);
      try {
        const [experiencesRes, configsRes, deliverablesRes, assetsRes, membersRes] = await Promise.all([
          fetch(`/api/experiences?projectId=${encodeURIComponent(projectId)}`),
          fetch(`/api/experience-configs?projectId=${encodeURIComponent(projectId)}`),
          fetch(`/api/deliverables?projectId=${encodeURIComponent(projectId)}&service=${encodeURIComponent(serviceSlug)}`),
          fetch(`/api/assets?projectId=${encodeURIComponent(projectId)}&service=${encodeURIComponent(serviceSlug)}`),
          fetch(`/api/project-members?projectId=${encodeURIComponent(projectId)}`),
        ]);
        if (cancelled) return;
        const [experiences, configs, deliverables, assets, members] = await Promise.all([
          experiencesRes.json(), configsRes.json(), deliverablesRes.json(), assetsRes.json(), membersRes.json(),
        ]);
        if (!experiencesRes.ok) throw new Error(experiences.error || 'Failed to load experiences');
        if (!configsRes.ok) throw new Error(configs.error || 'Failed to load configs');
        if (!deliverablesRes.ok) throw new Error(deliverables.error || 'Failed to load deliverables');
        if (!assetsRes.ok) throw new Error(assets.error || 'Failed to load assets');
        if (!membersRes.ok) throw new Error(members.error || 'Failed to load members');
        setData({
          experiences: experiences.experiences || [],
          configs: configs.configs || [],
          deliverables: deliverables.deliverables || [],
          assets: assets.assets || [],
          members: members.members || [],
        });
      } catch (err: any) {
        setError(err?.message || 'Failed to load project data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [projectId, serviceSlug]);

  useEffect(() => {
    return onEditorSave(() => {
      loadConfigs();
    });
  }, [loadConfigs]);

  if (!projectId || !serviceSlug || !meta) {
    notFound();
  }

  let body = (
    <>
      <ServiceEditorPanels 
        tabs={tabs} 
        tabData={data} 
        loading={loading} 
        error={error}
        onOpenEditor={() => handleOpenEditor()}
      />
      {meta.showDeviceCompatibility && <DeviceCompatibility />}
      {meta.showTimeline && <Timeline items={timelineItems} />}
    </>
  );
  if (meta.wrapPermissions) {
    body = (
      <PermissionProvider role="owner">
        <EditorErrorBoundary serviceName={meta.title}>{body}</EditorErrorBoundary>
      </PermissionProvider>
    );
  }

  const handleOpenEditor = async () => {
    const id = typeof projectId === 'string' ? projectId.trim() : '';
    if (!id || id === 'undefined' || id === 'null') {
      setError('A valid project ID is required to open the editor.');
      return;
    }

    if (serviceSlug === 'virtual-tour') {
      window.open(
        `/xr-world/virtual-tour/editor?projectId=${encodeURIComponent(id)}`,
        '_blank',
        'noopener,noreferrer',
      );
      return;
    }

    if (serviceSlug !== 'gaussian-splat') {
      try {
        await openEditorProject(id);
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : 'Failed to open the editor');
      }
      return;
    }

    const editorWindow = window.open('about:blank', '_blank');
    if (!editorWindow) {
      setError('The editor window was blocked. Allow pop-ups and try again.');
      return;
    }
    editorWindow.opener = null;

    try {
      const response = await fetch('/api/editor/launch-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: id, service: serviceSlug }),
      });
      const data = await response.json();
      if (!response.ok || typeof data.token !== 'string' || !data.token) {
        throw new Error(data.error || 'Failed to authenticate with the editor.');
      }

      const editorUrl = new URL('http://localhost:3002/');
      editorUrl.searchParams.set('token', data.token);
      editorUrl.searchParams.set('projectId', id);
      editorWindow.location.replace(editorUrl.toString());
    } catch (error: unknown) {
      editorWindow.close();
      setError(error instanceof Error ? error.message : 'Failed to open the editor');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <div className="px-4 sm:px-6 py-3 border-b border-[#27272A] flex items-center justify-between">
        <div>
          <h1 className="text-sm font-mono font-bold text-white capitalize">{meta.title}</h1>
          <p className="text-[10px] font-mono text-[#71717A]">{projectId} / {serviceSlug}</p>
        </div>
        <button
          onClick={() => handleOpenEditor()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#3ECF8E]/40 bg-[#3ECF8E]/15 text-[10px] font-mono font-semibold text-[#3ECF8E] hover:bg-[#3ECF8E]/25 shadow-lg shadow-[#3ECF8E]/20 transition"
        >
          <Play className="w-3.5 h-3.5" />
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Open Editor</span>
        </button>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {body}
      </div>
    </div>
  );
}