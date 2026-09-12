/**
 * Typed Admin API Client
 * 
 * Type-safe API client for all admin endpoints.
 * Uses fetch with automatic validation via zod schemas.
 */

import { 
  validate,
  validateQuery,
  ApiError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  type AdminUser,
  type CreateAdminUser,
  type UpdateAdminUser,
  type UserFilters,
  type PaginationParams,
  type PaginatedResponse,
  type GpuNode,
  type UpdateGpuNode,
  type GpuFilters,
  type GpuClusterStats,
  type FeatureToggle,
  type UpdateFeatureToggle,
  type SystemHealthLog,
  type CreateSystemLog,
  type LogFilters,
  type LogStats,
  type RevenueMetric,
  type RevenueSummary,
  type ManagedProject,
  type CreateProject,
  type UpdateProject,
  type XRLink,
  type CreateXRLink,
  type Tour,
  type CreateTour,
  type UpdateTour,
  type ClientDiscovery,
  type CreateClientDiscovery,
  type Document,
  type Lead,
  type StudioProfile,
  type StorageFile,
} from './schemas';

const API_BASE = '/api/admin';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${API_BASE}${path}`, window.location.origin);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    }
  }
  return url.toString();
}

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers, ...fetchOptions } = options;
  const url = buildUrl(path, params);
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  const response = await fetch(url, {
    ...fetchOptions,
    headers: defaultHeaders,
    credentials: 'include',
  });

  if (!response.ok) {
    let errorData: { error?: { code: string; message: string } } = {};
    try {
      errorData = await response.json();
    } catch {
      // Ignore JSON parse errors
    }

    const message = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
    const code = errorData.error?.code || 'UNKNOWN_ERROR';

    switch (response.status) {
      case 401:
        throw new UnauthorizedError(message);
      case 403:
        throw new ForbiddenError(message);
      case 404:
        throw new NotFoundError('Resource', 'unknown');
      case 400:
        if (code === 'VALIDATION_ERROR') {
          throw new ValidationError({ 
            issues: [{ path: [], message }] 
          } as any);
        }
        throw new ApiError(code, message, response.status);
      default:
        throw new ApiError(code, message, response.status);
    }
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

function get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  return request<T>(path, { method: 'GET', params });
}

function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

function put<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
}

function patch<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
}

function del<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}

// =====================================================================
// USERS / ADMINS
// =====================================================================

export const usersApi = {
  list: (filters?: UserFilters, pagination?: PaginationParams) => 
    get<PaginatedResponse<AdminUser>>('/users', { ...filters, ...pagination }),

  get: (id: string) => 
    get<AdminUser>(`/users/${id}`),

  getByEmail: (email: string) => 
    get<AdminUser>(`/users/by-email/${encodeURIComponent(email)}`),

  create: (data: CreateAdminUser) => 
    post<AdminUser>('/users', data),

  update: (id: string, data: UpdateAdminUser) => 
    patch<AdminUser>(`/users/${id}`, data),

  delete: (id: string) => 
    del<void>(`/users/${id}`),

  changeRole: (id: string, role: AdminUser['role']) => 
    patch<AdminUser>(`/users/${id}/role`, { role }),

  changeStatus: (id: string, status: AdminUser['status']) => 
    patch<AdminUser>(`/users/${id}/status`, { status }),

  getStats: () => 
    get<{ total: number; byRole: Record<string, number>; byStatus: Record<string, number> }>('/users/stats'),
};

// =====================================================================
// GPU NODES
// =====================================================================

export const gpuApi = {
  list: (filters?: GpuFilters) => 
    get<GpuNode[]>('/gpu', filters),

  get: (id: string) => 
    get<GpuNode>(`/gpu/${id}`),

  update: (id: string, data: UpdateGpuNode) => 
    patch<GpuNode>(`/gpu/${id}`, data),

  updateLoad: (id: string, data: Pick<UpdateGpuNode, 'loadPercentage' | 'avgFps' | 'temperatureC'>) => 
    patch<GpuNode>(`/gpu/${id}/load`, data),

  toggleMaintenance: (id: string) => 
    post<GpuNode>(`/gpu/${id}/maintenance`, {}),

  scaleNodes: (id: string, delta: number) => 
    post<GpuNode>(`/gpu/${id}/scale`, { delta }),

  restart: (id: string) => 
    post<GpuNode>(`/gpu/${id}/restart`, {}),

  getClusterStats: () => 
    get<GpuClusterStats>('/gpu/stats'),
};

// =====================================================================
// FEATURE TOGGLES
// =====================================================================

export const featuresApi = {
  list: () => 
    get<FeatureToggle[]>('/features'),

  get: (key: string) => 
    get<FeatureToggle>(`/features/${key}`),

  toggle: (key: string) => 
    post<FeatureToggle>(`/features/${key}/toggle`, {}),

  update: (key: string, data: UpdateFeatureToggle) => 
    patch<FeatureToggle>(`/features/${key}`, data),

  reset: () => 
    post<void>('/features/reset', {}),

  getByCategory: (category: FeatureToggle['category']) => 
    get<FeatureToggle[]>(`/features/category/${category}`),
};

// =====================================================================
// SYSTEM LOGS
// =====================================================================

export const logsApi = {
  list: (filters?: LogFilters, pagination?: PaginationParams) => 
    get<PaginatedResponse<SystemHealthLog>>('/logs', { ...filters, ...pagination }),

  add: (data: CreateSystemLog) => 
    post<SystemHealthLog>('/logs', data),

  clear: () => 
    del<void>('/logs'),

  getStats: () => 
    get<LogStats>('/logs/stats'),
};

// =====================================================================
// REVENUE
// =====================================================================

export const revenueApi = {
  getMonthly: () => 
    get<RevenueMetric[]>('/revenue/monthly'),

  getSummary: () => 
    get<RevenueSummary>('/revenue/summary'),

  refresh: () => 
    post<void>('/revenue/refresh', {}),
};

// =====================================================================
// PROJECTS
// =====================================================================

export const projectsApi = {
  list: (filters?: { search?: string; status?: ManagedProject['status']; projectType?: ManagedProject['projectType'] }, pagination?: PaginationParams) => 
    get<PaginatedResponse<ManagedProject>>('/projects', { ...filters, ...pagination }),

  get: (id: string) => 
    get<ManagedProject>(`/projects/${id}`),

  create: (data: CreateProject) => 
    post<ManagedProject>('/projects', data),

  update: (id: string, data: UpdateProject) => 
    patch<ManagedProject>(`/projects/${id}`, data),

  delete: (id: string) => 
    del<void>(`/projects/${id}`),

  logHours: (projectId: string, entry: { date: string; hours: number; description: string; billable: boolean }) => 
    post<ManagedProject>(`/projects/${projectId}/hours`, entry),
};

// =====================================================================
// XR LINKS
// =====================================================================

export const xrLinksApi = {
  list: (projectId?: string) => 
    get<XRLink[]>(`/xr-links`, projectId ? { projectId } : undefined),

  create: (data: CreateXRLink) => 
    post<XRLink>('/xr-links', data),

  revoke: (id: string) => 
    del<void>(`/xr-links/${id}`),
};

// =====================================================================
// VIRTUAL TOURS
// =====================================================================

export const toursApi = {
  list: (filters?: { projectId?: string; status?: Tour['status'] }) => 
    get<Tour[]>('/tours', filters),

  get: (id: string) => 
    get<Tour>(`/tours/${id}`),

  create: (data: CreateTour) => 
    post<Tour>('/tours', data),

  update: (id: string, data: UpdateTour) => 
    patch<Tour>(`/tours/${id}`, data),

  delete: (id: string) => 
    del<void>(`/tours/${id}`),

  getSettings: (id: string) => 
    get<any>(`/tours/${id}/settings`),

  updateSettings: (id: string, settings: any) => 
    patch<any>(`/tours/${id}/settings`, settings),

  getViews: (id: string, params?: { period?: string }) => 
    get<any[]>(`/tours/${id}/views`, params),

  getCollaborations: (id: string) => 
    get<any[]>(`/tours/${id}/collaborations`),

  createCollaboration: (id: string, data: any) => 
    post<any>(`/tours/${id}/collaborations`, data),

  updateCollaboration: (tourId: string, collabId: string, data: any) => 
    patch<any>(`/tours/${tourId}/collaborations/${collabId}`, data),
};

// =====================================================================
// CLIENT DISCOVERY
// =====================================================================

export const discoveryApi = {
  list: () => 
    get<ClientDiscovery[]>('/discovery'),

  create: (data: CreateClientDiscovery) => 
    post<ClientDiscovery>('/discovery', data),
};

// =====================================================================
// DOCSTUDIO CRM
// =====================================================================

export const docStudioApi = {
  documents: {
    list: () => get<Document[]>('/docstudio/documents'),
    get: (id: string) => get<Document>(`/docstudio/documents/${id}`),
    create: (data: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => post<Document>('/docstudio/documents', data),
    update: (id: string, data: Partial<Document>) => patch<Document>(`/docstudio/documents/${id}`, data),
    delete: (id: string) => del<void>(`/docstudio/documents/${id}`),
  },
  leads: {
    list: () => get<Lead[]>('/docstudio/leads'),
    get: (id: string) => get<Lead>(`/docstudio/leads/${id}`),
    create: (data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => post<Lead>('/docstudio/leads', data),
    update: (id: string, data: Partial<Lead>) => patch<Lead>(`/docstudio/leads/${id}`, data),
    delete: (id: string) => del<void>(`/docstudio/leads/${id}`),
  },
  studioProfile: {
    get: () => get<StudioProfile>('/docstudio/studio-profile'),
    update: (data: Partial<StudioProfile>) => patch<StudioProfile>('/docstudio/studio-profile', data),
  },
};

// =====================================================================
// FILE STORAGE
// =====================================================================

export const storageApi = {
  list: (params?: { path?: string; bucket?: string; provider?: string }) => 
    get<StorageFile[]>('/storage', params),

  upload: async (file: File, options: { bucket: string; provider: string; path?: string }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', options.bucket);
    formData.append('provider', options.provider);
    if (options.path) formData.append('path', options.path);

    const response = await fetch(buildUrl('/storage/upload'), {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new ApiError('UPLOAD_FAILED', 'File upload failed', response.status);
    }
    return response.json() as Promise<StorageFile>;
  },

  delete: (id: string) => 
    del<void>(`/storage/${id}`),

  getSignedUrl: (id: string) => 
    get<{ url: string }>(`/storage/${id}/signed-url`),
};

// =====================================================================
// AI / HERMES
// =====================================================================

export const aiApi = {
  chat: (message: string, context?: Record<string, unknown>) => 
    post<{ response: string; suggestions?: string[] }>('/hermes', { message, context }),

  getSuggestions: (projectId: string) => 
    get<{ suggestions: string[] }>(`/ai/suggestions/${projectId}`),
};

// =====================================================================
// PIXEL STREAMING
// =====================================================================

export const pixelStreamingApi = {
  start: (data: { projectId: string; region: string; settings?: Record<string, unknown> }) => 
    post<{ sessionId: string; streamUrl: string }>('/pixel-streaming/start', data),

  stop: (sessionId: string) => 
    post<{ success: boolean }>(`/pixel-streaming/stop`, { sessionId }),

  getStatus: (sessionId: string) => 
    get<{ status: string; metrics?: Record<string, number> }>(`/pixel-streaming/${sessionId}/status`),
};

// =====================================================================
// COMBINED EXPORT
// =====================================================================

export const adminApi = {
  users: usersApi,
  gpu: gpuApi,
  features: featuresApi,
  logs: logsApi,
  revenue: revenueApi,
  projects: projectsApi,
  xrLinks: xrLinksApi,
  tours: toursApi,
  discovery: discoveryApi,
  docStudio: docStudioApi,
  storage: storageApi,
  ai: aiApi,
  pixelStreaming: pixelStreamingApi,
};

export default adminApi;