'use client';
import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { ServiceEditorPanels } from '@/components/editor/service-editor-panels';
import { DeviceCompatibility } from '@/components/editor/device-compatibility';
import { Timeline } from '@/components/editor/timeline';
import { EditorErrorBoundary } from '@/components/editor/editor-error-boundary';
import { PermissionProvider } from '@/components/editor/permissions';
import { SERVICE_META } from '@/lib/service-meta';
import { buildServiceTabs } from '@/lib/service-editor-tabs';

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

  if (!projectId || !serviceSlug || !meta) {
    notFound();
  }

  let body = (
    <>
      <ServiceEditorPanels tabs={tabs} tabData={data} loading={loading} error={error} />
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

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <div className="px-4 sm:px-6 py-3 border-b border-[#27272A]">
        <h1 className="text-sm font-mono font-bold text-white capitalize">{meta.title}</h1>
        <p className="text-[10px] font-mono text-[#71717A]">{projectId} / {serviceSlug}</p>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {body}
      </div>
    </div>
  );
}