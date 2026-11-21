import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getUserClient } from '@/lib/services/client';
import ProjectExperienceHub, { HubService, HubProject } from '@/components/experience/ProjectExperienceHub';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

interface ExperienceRow {
  id: string;
  title: string;
  slug: string;
  project_service_id: string;
  config?: Record<string, any> | null;
}

/**
 * Experience Dashboard hub — one project URL, all enabled services.
 *
 * Data is fetched with the anon-key client so RLS decides access:
 * - experiences_anon_read allows published experiences of PUBLIC projects
 * - assets_anon_read allows media of PUBLIC / CLIENT_ONLY projects
 * Authenticated client access (CLIENT_ONLY projects) is a Phase 05 follow-up
 * that passes the session JWT through the same query path.
 */
export default async function ExperienceHubPage({ params }: PageProps) {
  // Feature-flag gate (server-side read; flag env: NEXT_PUBLIC_FLAG_EXPERIENCE_HUB)
  const flagValue = process.env.NEXT_PUBLIC_FLAG_EXPERIENCE_HUB;
  const hubEnabled = flagValue === undefined ? false : flagValue === 'true' || flagValue === '1';
  if (!hubEnabled) notFound();

  const { projectId } = await params;
  const svc = getUserClient();
  if (!svc) notFound();

  const { data: project } = await svc.from('Project').select('*').eq('id', projectId).limit(1);
  const projectRow = project?.[0];
  if (!projectRow) notFound();

  // Enabled services with catalog metadata
  const { data: projectServices } = await svc
    .from('project_services')
    .select('id, service_id, status, service:service_id(slug, name, category, icon)')
    .eq('project_id', projectId)
    .eq('status', 'active');

  // Published experiences for this project
  const { data: experiences } = await svc
    .from('experiences')
    .select('id, title, slug, project_service_id, status')
    .eq('project_id', projectId)
    .eq('status', 'published');

  // Configs for published experiences (anon-readable when published + PUBLIC)
  const experienceRows: ExperienceRow[] = (experiences || []) as ExperienceRow[];
  const configMap: Record<string, Record<string, any>> = {};
  if (experienceRows.length > 0) {
    const { data: configs } = await svc
      .from('experience_configs')
      .select('experience_id, config')
      .in('experience_id', experienceRows.map((e) => e.id));
    for (const c of configs || []) {
      configMap[(c as any).experience_id] = (c as any).config || {};
    }
  }

  // Gallery media (images/videos) for projects visible to anon
  const { data: mediaAssets } = await svc
    .from('assets')
    .select('id, url, type, metadata, created_at')
    .eq('project_id', projectId)
    .in('type', ['image', 'video'])
    .order('created_at', { ascending: true });

  const serviceRows = (projectServices || []).map((ps: any) => {
    const catalog = ps.service || {};
    const serviceExperiences = experienceRows
      .filter((e) => e.project_service_id === ps.id)
      .map((e) => ({
        id: e.id,
        title: e.title,
        slug: e.slug,
        config: configMap[e.id] || null,
      }));
    const hubService: HubService = {
      projectServiceId: ps.id,
      slug: catalog.slug || 'unknown',
      name: catalog.name || catalog.slug || 'Service',
      icon: catalog.icon || '',
      experiences: serviceExperiences,
    };
    return hubService;
  });

  const hubProject: HubProject = {
    id: projectRow.id,
    name: projectRow.name || projectRow.title || projectRow.id,
    description: projectRow.description || '',
  };

  const gallery = (mediaAssets || []).map((a: any) => ({
    id: a.id,
    url: a.url,
    type: a.type as 'image' | 'video',
  }));

  const hasAnyContent =
    serviceRows.some((s) => s.experiences.length > 0) || gallery.length > 0 || serviceRows.length > 0;

  if (!hasAnyContent) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#09090B] text-[#FAFAFA] px-4">
        <h1 className="text-2xl font-bold mb-2">{hubProject.name}</h1>
        <p className="text-sm text-[#A1A1AA] mb-6">No published experiences yet. Check back soon.</p>
        <Link href="/" className="px-5 py-2.5 rounded bg-[#3ECF8E] text-black font-mono text-xs uppercase">
          Return to VizTR
        </Link>
      </main>
    );
  }

  return <ProjectExperienceHub project={hubProject} services={serviceRows} gallery={gallery} />;
}
