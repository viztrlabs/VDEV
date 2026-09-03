import { getServiceClient } from './client';
import type { ServiceRow } from './catalog';

export interface ProjectServiceRow {
  id: string;
  project_id: string;
  service_id: string;
  status: string;
  enabled_at: string | null;
  disabled_at: string | null;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
  service?: ServiceRow | null;
}

export async function listProjectServices(projectId: string) {
  const svc = getServiceClient();
  if (!svc || !projectId) return [];
  try {
    const { data, error } = await svc
      .from('project_services')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error || !data) return [];
    const rows = data as ProjectServiceRow[];
    const serviceIds = Array.from(new Set(rows.map((row) => row.service_id)));
    let serviceMap = new Map<string, ServiceRow | null>();
    if (serviceIds.length) {
      const { data: svcRows, error: svcError } = await svc.from('Service').select('*').in('id', serviceIds);
      if (!svcError && svcRows) {
        serviceMap = new Map(svcRows.map((row: any) => [row.id, row]));
      }
    }
    return rows.map((row) => ({ ...row, service: serviceMap.get(row.service_id) || null }));
  } catch {
    return [];
  }
}

export async function getProjectService(projectId: string, serviceId: string) {
  const svc = getServiceClient();
  if (!svc) return null;
  try {
    const { data, error } = await svc
      .from('project_services')
      .select('*')
      .eq('project_id', projectId)
      .eq('service_id', serviceId)
      .maybeSingle();
    if (error || !data) return null;
    return data as ProjectServiceRow;
  } catch {
    return null;
  }
}

export async function ensureProjectService(projectId: string, serviceId: string) {
  const svc = getServiceClient();
  if (!svc) return null;
  try {
    const { data, error } = await svc
      .from('project_services')
      .upsert({ project_id: projectId, service_id: serviceId, status: 'active' }, { onConflict: 'project_id,service_id' })
      .select('*')
      .single();
    if (error || !data) return null;
    return data as ProjectServiceRow;
  } catch {
    return null;
  }
}
