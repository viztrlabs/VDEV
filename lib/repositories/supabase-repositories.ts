/**
 * Supabase Repository Implementations (Stubs)
 * 
 * These are placeholders for when Supabase backend is enabled.
 * Currently throw "not implemented" errors.
 */

import type {
  UserRepository,
  GPURepository,
  FeatureToggleRepository,
  SystemLogRepository,
  RevenueRepository,
  RepositoryFactory,
  PaginationParams,
  PaginatedResult,
  UserFilters,
  GPUFilters,
  LogFilters,
} from './index';

import type {
  AdminUser,
  UserRole,
  UserStatus,
  RegionGPUNode,
  FeatureToggle,
  SystemHealthLog,
  RevenueMetric,
} from '../super-admin-store';

function notImplemented(method: string): never {
  throw new Error(`SupabaseRepository.${method} not implemented. Enable Supabase backend or use mock repositories.`);
}

function createSupabaseUserRepository(): UserRepository {
  return {
    findAll: () => Promise.resolve(notImplemented('users.findAll')),
    findById: () => Promise.resolve(notImplemented('users.findById')),
    findByEmail: () => Promise.resolve(notImplemented('users.findByEmail')),
    create: () => Promise.resolve(notImplemented('users.create')),
    update: () => Promise.resolve(notImplemented('users.update')),
    delete: () => Promise.resolve(notImplemented('users.delete')),
    changeRole: () => Promise.resolve(notImplemented('users.changeRole')),
    changeStatus: () => Promise.resolve(notImplemented('users.changeStatus')),
    getStats: () => Promise.resolve(notImplemented('users.getStats')),
  };
}

function createSupabaseGPURepository(): GPURepository {
  return {
    findAll: () => Promise.resolve(notImplemented('gpu.findAll')),
    findById: () => Promise.resolve(notImplemented('gpu.findById')),
    update: () => Promise.resolve(notImplemented('gpu.update')),
    updateLoad: () => Promise.resolve(notImplemented('gpu.updateLoad')),
    toggleMaintenance: () => Promise.resolve(notImplemented('gpu.toggleMaintenance')),
    scaleNodes: () => Promise.resolve(notImplemented('gpu.scaleNodes')),
    restart: () => Promise.resolve(notImplemented('gpu.restart')),
    getClusterStats: () => Promise.resolve(notImplemented('gpu.getClusterStats')),
  };
}

function createSupabaseFeatureToggleRepository(): FeatureToggleRepository {
  return {
    findAll: () => Promise.resolve(notImplemented('featureToggles.findAll')),
    findByKey: () => Promise.resolve(notImplemented('featureToggles.findByKey')),
    toggle: () => Promise.resolve(notImplemented('featureToggles.toggle')),
    update: () => Promise.resolve(notImplemented('featureToggles.update')),
    reset: () => Promise.resolve(notImplemented('featureToggles.reset')),
    getByCategory: () => Promise.resolve(notImplemented('featureToggles.getByCategory')),
  };
}

function createSupabaseSystemLogRepository(): SystemLogRepository {
  return {
    findAll: () => Promise.resolve(notImplemented('logs.findAll')),
    add: () => Promise.resolve(notImplemented('logs.add')),
    clear: () => Promise.resolve(notImplemented('logs.clear')),
    getStats: () => Promise.resolve(notImplemented('logs.getStats')),
  };
}

function createSupabaseRevenueRepository(): RevenueRepository {
  return {
    getMonthly: () => Promise.resolve(notImplemented('revenue.getMonthly')),
    getSummary: () => Promise.resolve(notImplemented('revenue.getSummary')),
    refresh: () => Promise.resolve(notImplemented('revenue.refresh')),
  };
}

export function createSupabaseRepositoryFactory() {
  return {
    users: createSupabaseUserRepository(),
    gpu: createSupabaseGPURepository(),
    featureToggles: createSupabaseFeatureToggleRepository(),
    logs: createSupabaseSystemLogRepository(),
    revenue: createSupabaseRevenueRepository(),
  };
}