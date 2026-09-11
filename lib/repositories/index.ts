/**
 * Repository Interfaces - Type-safe data access layer
 * 
 * These interfaces define the contract for data access.
 * Implementations can be swapped (MockRepository for dev, SupabaseRepository for prod).
 */

import type {
  AdminUser,
  UserRole,
  UserStatus,
  RegionGPUNode,
  FeatureToggle,
  SystemHealthLog,
  RevenueMetric,
} from '../super-admin-store-types';

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  department?: string;
}

export interface GPUFilters {
  regionCode?: string;
  status?: RegionGPUNode['status'];
}

export interface LogFilters {
  level?: SystemHealthLog['level'];
  service?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

// =====================================================================
// USER REPOSITORY
// =====================================================================

export interface UserRepository {
  findAll(filters?: UserFilters, pagination?: PaginationParams): Promise<PaginatedResult<AdminUser>>;
  findById(id: string): Promise<AdminUser | null>;
  findByEmail(email: string): Promise<AdminUser | null>;
  create(user: Omit<AdminUser, 'id' | 'createdAt'>): Promise<AdminUser>;
  update(id: string, updates: Partial<AdminUser>): Promise<AdminUser>;
  delete(id: string): Promise<void>;
  changeRole(id: string, role: UserRole): Promise<AdminUser>;
  changeStatus(id: string, status: UserStatus): Promise<AdminUser>;
  getStats(): Promise<{
    total: number;
    byRole: Record<UserRole, number>;
    byStatus: Record<UserStatus, number>;
  }>;
}

// =====================================================================
// GPU NODE REPOSITORY
// =====================================================================

export interface GPURepository {
  findAll(filters?: GPUFilters): Promise<RegionGPUNode[]>;
  findById(id: string): Promise<RegionGPUNode | null>;
  update(id: string, updates: Partial<RegionGPUNode>): Promise<RegionGPUNode>;
  updateLoad(id: string, load: Partial<Pick<RegionGPUNode, 'loadPercentage' | 'avgFps' | 'temperatureC'>>): Promise<RegionGPUNode>;
  toggleMaintenance(id: string): Promise<RegionGPUNode>;
  scaleNodes(id: string, delta: number): Promise<RegionGPUNode>;
  restart(id: string): Promise<RegionGPUNode>;
  getClusterStats(): Promise<{
    totalNodes: number;
    activeNodes: number;
    totalSessions: number;
    avgLoad: number;
    avgLatency: number;
  }>;
}

// =====================================================================
// FEATURE TOGGLE REPOSITORY
// =====================================================================

export interface FeatureToggleRepository {
  findAll(): Promise<FeatureToggle[]>;
  findByKey(key: string): Promise<FeatureToggle | null>;
  toggle(key: string): Promise<FeatureToggle>;
  update(key: string, updates: Partial<FeatureToggle>): Promise<FeatureToggle>;
  reset(): Promise<void>;
  getByCategory(category: FeatureToggle['category']): Promise<FeatureToggle[]>;
}

// =====================================================================
// SYSTEM LOG REPOSITORY
// =====================================================================

export interface SystemLogRepository {
  findAll(filters?: LogFilters, pagination?: PaginationParams): Promise<PaginatedResult<SystemHealthLog>>;
  add(log: Omit<SystemHealthLog, 'id' | 'timestamp'>): Promise<SystemHealthLog>;
  clear(): Promise<void>;
  getStats(): Promise<{
    total: number;
    byLevel: Record<SystemHealthLog['level'], number>;
    byService: Record<string, number>;
  }>;
}

// =====================================================================
// REVENUE REPOSITORY
// =====================================================================

export interface RevenueRepository {
  getMonthly(): Promise<RevenueMetric[]>;
  getSummary(): Promise<{
    currentMRR: number;
    currentARR: number;
    growthRateMoM: number;
  }>;
  refresh(): Promise<void>;
}

// =====================================================================
// REPOSITORY FACTORY
// =====================================================================

export interface RepositoryFactory {
  users: UserRepository;
  gpu: GPURepository;
  featureToggles: FeatureToggleRepository;
  logs: SystemLogRepository;
  revenue: RevenueRepository;
}

export type RepositoryMode = 'mock' | 'supabase';

export async function createRepositoryFactory(mode: RepositoryMode = 'mock'): Promise<RepositoryFactory> {
  if (mode === 'supabase') {
    // Dynamic import to avoid bundling Supabase client in mock mode
    const { createSupabaseRepositoryFactory } = await import('./supabase-repositories');
    return createSupabaseRepositoryFactory();
  }
  const { createMockRepositoryFactory } = await import('./mock-repositories');
  return createMockRepositoryFactory();
}

// Synchronous version for immediate use (mock only)
export function createMockRepositoryFactorySync(): RepositoryFactory {
  const { createMockRepositoryFactory } = require('./mock-repositories');
  return createMockRepositoryFactory();
}