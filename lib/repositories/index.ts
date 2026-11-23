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
  Booking,
  BookingStatus,
  BookingServiceType,
  BookingFilters,
  BookingStats,
  CreateBooking,
  UpdateBooking,
  ApproveBooking,
  RejectBooking,
  ContactSubmission,
  ContactStatus,
  ContactServiceInterest,
  ContactFilters,
  ContactStats,
  CreateContact,
  GA4Credentials,
  GA4CredentialsInput,
  UpdateGA4Credentials,
  GTMSettings,
  GTMSettingsInput,
} from '../super-admin-store-types';
import { createSupabaseRepositoryFactory } from './supabase-repositories';

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

export interface BookingFilters {
  search?: string;
  status?: BookingStatus;
  service_type?: BookingServiceType;
  date_from?: string;
  date_to?: string;
}

export interface BookingStats {
  total: number;
  by_status: Record<BookingStatus, number>;
  by_service_type: Record<BookingServiceType, number>;
}

// =====================================================================
// BOOKING REPOSITORY
// =====================================================================

export interface BookingRepository {
  findAll(filters?: BookingFilters, pagination?: PaginationParams): Promise<PaginatedResult<Booking>>;
  findById(id: string): Promise<Booking | null>;
  create(booking: CreateBooking): Promise<Booking>;
  update(id: string, updates: UpdateBooking): Promise<Booking>;
  delete(id: string): Promise<void>;
  approve(id: string, adminNotes?: string): Promise<Booking>;
  reject(id: string, rejectionReason: string, adminNotes?: string): Promise<Booking>;
  getStats(): Promise<BookingStats>;
}

// =====================================================================
// CONTACT REPOSITORY
// =====================================================================

export interface ContactRepository {
  findAll(filters?: ContactFilters, pagination?: PaginationParams): Promise<PaginatedResult<ContactSubmission>>;
  findById(id: string): Promise<ContactSubmission | null>;
  create(contact: CreateContact): Promise<ContactSubmission>;
  updateStatus(id: string, status: ContactStatus): Promise<ContactSubmission>;
  delete(id: string): Promise<void>;
  getStats(): Promise<ContactStats>;
}

// =====================================================================
// REPOSITORY FACTORY
// =====================================================================
// LOG FILTERS (existing)

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
// GA4 CREDENTIALS REPOSITORY
// =====================================================================

export interface GA4CredentialsRepository {
  findActive(): Promise<GA4Credentials | null>;
  findById(id: string): Promise<GA4Credentials | null>;
  create(credentials: GA4CredentialsInput): Promise<GA4Credentials>;
  update(id: string, updates: UpdateGA4Credentials): Promise<GA4Credentials>;
  delete(id: string): Promise<void>;
  setActive(id: string): Promise<void>;
}

// =====================================================================
// GTM SETTINGS REPOSITORY
// =====================================================================

export interface GTMSettingsRepository {
  get(): Promise<GTMSettings | null>;
  update(settings: GTMSettingsInput): Promise<GTMSettings>;
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
  ga4Credentials: GA4CredentialsRepository;
  gtmSettings: GTMSettingsRepository;
  bookings: BookingRepository;
  contacts: ContactRepository;
}

export type RepositoryMode = 'mock' | 'supabase' | 'auto';

export async function createRepositoryFactory(mode: RepositoryMode = 'auto'): Promise<RepositoryFactory> {
  if (mode === 'supabase' || (mode === 'auto' && (() => {
    try {
      const { getSupabaseAdmin, isSupabaseAdminConfigured } = require('@/lib/supabase-admin');
      return isSupabaseAdminConfigured() && !!getSupabaseAdmin();
    } catch {
      return false;
    }
  })())) {
    const { createSupabaseRepositoryFactory } = await import('./supabase-repositories');
    return createSupabaseRepositoryFactory();
  }
  const { createMockRepositoryFactory } = await import('./mock-repositories');
  return createMockRepositoryFactory();
}

export function getSupabaseRepository(): RepositoryFactory {
  return createSupabaseRepositoryFactory();
}

// Synchronous version for immediate use (mock only)
export function createMockRepositoryFactorySync(): RepositoryFactory {
  const { createMockRepositoryFactory } = require('./mock-repositories');
  return createMockRepositoryFactory();
}