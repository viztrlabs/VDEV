'use client';

import { useEffect, useState, useCallback } from 'react';
import { useClientSession } from './useClientSession';
import type { ManagedProject } from '@/lib/projects-data';

export interface ClientProjectsState {
  projects: ManagedProject[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useClientProjects(): ClientProjectsState {
  const { clientId, isAuthenticated, isLoading: sessionLoading } = useClientSession();
  const [projects, setProjects] = useState<ManagedProject[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!clientId) {
      setProjects([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (clientId) params.set('clientId', clientId);
      const res = await fetch(`/api/projects/client?${params.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        throw new Error(`Failed to load projects: ${res.status}`);
      }
      const data = await res.json();
      const list: ManagedProject[] = (data?.projects || data?.data || []) as ManagedProject[];
      setProjects(Array.isArray(list) ? list : []);
    } catch (err: any) {
      setError(err?.message || 'Unknown error loading projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (sessionLoading) return;
    if (!isAuthenticated) {
      setProjects([]);
      return;
    }
    fetchProjects();
  }, [isAuthenticated, sessionLoading, fetchProjects]);

  return { projects, loading, error, refresh: fetchProjects };
}
