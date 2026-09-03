import { getServiceClient } from './client';

export interface ServiceRow {
  id: string;
  slug: string;
  name: string;
  category?: string;
  description?: string;
  icon?: string;
  image?: string;
  visible?: boolean;
  order?: number;
  enabled?: boolean;
  created_at?: string;
}

export async function listServices() {
  const svc = getServiceClient();
  if (!svc) return [];
  try {
    const { data, error } = await svc.from('Service').select('*').order('"order"', { ascending: true });
    if (error || !data) return [];
    return data as ServiceRow[];
  } catch {
    return [];
  }
}

export async function getServiceBySlug(slug: string) {
  const svc = getServiceClient();
  if (!svc) return null;
  try {
    const { data, error } = await svc.from('Service').select('*').eq('slug', slug).maybeSingle();
    if (error || !data) return null;
    return data as ServiceRow;
  } catch {
    return null;
  }
}
