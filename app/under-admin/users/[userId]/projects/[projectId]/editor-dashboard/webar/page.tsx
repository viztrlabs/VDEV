'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ServiceEditorPanels, Tab } from '@/components/editor/service-editor-panels';
import { DeviceCompatibility } from '@/components/editor/device-compatibility';
import { EditorErrorBoundary } from '@/components/editor/editor-error-boundary';
import { PermissionProvider } from '@/components/editor/permissions';
export default function WebarEditorPage() {
  const params = useParams<{ userId: string; projectId: string }>();
  const projectId = params?.projectId;
  const serviceSlug = "webar";
    
  const tabs: Tab[] = [
    {
      key: 'experiences',
      label: 'Experiences',
      columns: [
        { key: 'title', label: 'Title' },
        { key: 'slug', label: 'Slug' },
        { key: 'status', label: 'Status' },
        { key: 'version', label: 'Version' },
      ],
      fields: [
        { key: 'project_id', label: 'Project ID', type: 'text' },
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'slug', label: 'Slug', type: 'text' },
        { key: 'status', label: 'Status', type: 'select', options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' },
          { label: 'Archived', value: 'archived' },
        ]},
        { key: 'version', label: 'Version', type: 'number' },
        { key: 'description', label: 'Description', type: 'textarea' },
      ],
      apiEndpoint: '/api/experiences',
      rowIdField: 'id',
    },
    {
      key: 'configs',
      label: 'Configs',
      columns: [
        { key: 'experience_id', label: 'Experience ID' },
        { key: 'config', label: 'Config', render: (v) => (v ? JSON.stringify(v).slice(0, 80) + '…' : '-') },
        { key: 'settings', label: 'Settings', render: (v) => (v ? JSON.stringify(v).slice(0, 80) + '…' : '-') },
        { key: 'assets', label: 'Assets', render: (v) => (Array.isArray(v) ? `${v.length} items` : '-') },
      ],
      fields: [
        { key: 'experience_id', label: 'Experience ID', type: 'text' },
        { key: 'config', label: 'Config', type: 'json' },
        { key: 'settings', label: 'Settings', type: 'json' },
        { key: 'assets', label: 'Assets', type: 'json' },
      ],
      apiEndpoint: '/api/experience-configs',
      rowIdField: 'id',
    },
    {
      key: 'deliverables',
      label: 'Deliverables',
      columns: [
        { key: 'title', label: 'Title' },
        { key: 'type', label: 'Type' },
        { key: 'status', label: 'Status' },
        {
          key: 'url',
          label: 'URL',
          render: (value) =>
            value ? (
              <a href={value} target="_blank" rel="noreferrer" className="text-[#3ECF8E] underline">
                Open
              </a>
            ) : (
              '-'
            ),
        },
      ],
      fields: [
        { key: 'project_id', label: 'Project ID', type: 'text' },
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'type', label: 'Type', type: 'select', options: [
          { label: 'Virtual Tour', value: 'virtual_tour' },
          { label: 'Video', value: 'video' },
          { label: 'WebAR', value: 'webar' },
          { label: 'WebXR', value: 'webxr' },
          { label: 'Animation', value: 'animation' },
          { label: 'Model', value: 'model' },
        ]},
        { key: 'status', label: 'Status', type: 'select', options: [
          { label: 'Processing', value: 'processing' },
          { label: 'Ready', value: 'ready' },
          { label: 'Delivered', value: 'delivered' },
          { label: 'Archived', value: 'archived' },
        ]},
        { key: 'url', label: 'URL', type: 'text' },
        { key: 'metadata', label: 'Metadata', type: 'json' },
      ],
      apiEndpoint: '/api/deliverables',
      rowIdField: 'id',
    },
    {
      key: 'assets',
      label: 'Assets',
      columns: [
        { key: 'type', label: 'Type' },
        {
          key: 'url',
          label: 'URL',
          render: (value) =>
            value ? (
              <a href={value} target="_blank" rel="noreferrer" className="text-[#3ECF8E] underline">
                Open
              </a>
            ) : (
              '-'
            ),
        },
        { key: 'mime_type', label: 'MIME' },
        { key: 'size', label: 'Size', render: (value) => (value ? `${Number(value).toLocaleString()} B` : '-') },
      ],
      fields: [
        { key: 'project_id', label: 'Project ID', type: 'text' },
        { key: 'service', label: 'Service', type: 'text' },
        { key: 'experience_id', label: 'Experience ID', type: 'text' },
        { key: 'type', label: 'Type', type: 'text' },
        { key: 'url', label: 'URL', type: 'text' },
        { key: 'mime_type', label: 'MIME', type: 'text' },
        { key: 'size', label: 'Size', type: 'number' },
        { key: 'metadata', label: 'Metadata', type: 'json' },
      ],
      apiEndpoint: '/api/assets',
      rowIdField: 'id',
    },
    {
      key: 'members',
      label: 'Members',
      columns: [
        { key: 'user_id', label: 'User ID' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role' },
        { key: 'status', label: 'Status' },
      ],
      fields: [
        { key: 'project_id', label: 'Project ID', type: 'text' },
        { key: 'user_id', label: 'User ID', type: 'text' },
        { key: 'email', label: 'Email', type: 'text' },
        { key: 'role', label: 'Role', type: 'select', options: [
          { label: 'Owner', value: 'owner' },
          { label: 'Editor', value: 'editor' },
          { label: 'Viewer', value: 'viewer' },
        ]},
        { key: 'status', label: 'Status', type: 'select', options: [
          { label: 'Active', value: 'active' },
          { label: 'Invited', value: 'invited' },
          { label: 'Archived', value: 'archived' },
        ]},
      ],
      apiEndpoint: '/api/project-members',
      rowIdField: 'id',
    },
  ];

  const [data, setData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!projectId) return;
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
          experiencesRes.json(),
          configsRes.json(),
          deliverablesRes.json(),
          assetsRes.json(),
          membersRes.json(),
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
    return () => {
      cancelled = true;
    };
  }, [projectId, serviceSlug]);

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <div className="px-4 sm:px-6 py-3 border-b border-[#27272A]">
        <h1 className="text-sm font-mono font-bold text-white capitalize">{serviceTitle}</h1>
        <p className="text-[10px] font-mono text-[#71717A]">{params?.userId} / {params?.projectId} / {serviceSlug}</p>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <ServiceEditorPanels tabs={tabs} tabData={data} loading={loading} error={error} />
        <DeviceCompatibility />
      </div>
    </div>
  );
}
