/**
 * Mock Repository Implementations
 * 
 * In-memory implementations for development/testing.
 * Uses localStorage for persistence across sessions.
 */

import type {
  UserRepository,
  GPURepository,
  FeatureToggleRepository,
  SystemLogRepository,
  RevenueRepository,
  BookingRepository,
  ContactRepository,
  RepositoryFactory,
  PaginationParams,
  PaginatedResult,
  UserFilters,
  GPUFilters,
  LogFilters,
} from './index';

import {
  INITIAL_USERS,
  INITIAL_GPU_NODES,
  INITIAL_FEATURE_TOGGLES,
  INITIAL_SYSTEM_LOGS,
  type AdminUser,
  type UserRole,
  type UserStatus,
  type RegionGPUNode,
  type FeatureToggle,
  type SystemHealthLog,
  type RevenueMetric,
  type Booking,
  type BookingStatus,
  type BookingServiceType,
  type BookingFilters,
  type BookingStats,
  type CreateBooking,
  type UpdateBooking,
  type ApproveBooking,
  type RejectBooking,
  type ContactSubmission,
  type ContactStatus,
  type ContactServiceInterest,
  type ContactFilters,
  type ContactStats,
  type CreateContact,
} from '../super-admin-store-types';

import { INITIAL_MANAGED_PROJECTS } from '../projects-data';

// =====================================================================
// STORAGE HELPERS
// =====================================================================

const STORAGE_KEYS = {
  users: 'viztr_super_admin_users',
  gpuNodes: 'viztr_super_admin_gpu_nodes',
  featureToggles: 'viztr_super_admin_feature_toggles',
  systemLogs: 'viztr_super_admin_system_logs',
  bookings: 'viztr_super_admin_bookings',
  contacts: 'viztr_super_admin_contacts',
};

function loadFromStorage<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.warn(`Failed to load ${key} from localStorage:`, e);
  }
  return fallback;
}

function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed to save ${key} to localStorage:`, e);
  }
}

// =====================================================================
// MOCK USER REPOSITORY
// =====================================================================

function createUserRepository(): UserRepository {
  let users = loadFromStorage<AdminUser>(STORAGE_KEYS.users, INITIAL_USERS);

  const persist = () => saveToStorage(STORAGE_KEYS.users, users);

  function applyFilters(list: AdminUser[], filters?: UserFilters): AdminUser[] {
    if (!filters) return list;
    return list.filter(u => {
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (!u.name.toLowerCase().includes(s) &&
            !u.email.toLowerCase().includes(s) &&
            !u.department.toLowerCase().includes(s) &&
            !(u.company?.toLowerCase().includes(s))) {
          return false;
        }
      }
      if (filters.role && u.role !== filters.role) return false;
      if (filters.status && u.status !== filters.status) return false;
      if (filters.department && u.department !== filters.department) return false;
      return true;
    });
  }

  function paginate<T>(list: T[], pagination?: PaginationParams): PaginatedResult<T> {
    if (!pagination) return { data: list, total: list.length, page: 1, pageSize: list.length, totalPages: 1 };
    const { page = 1, pageSize = 20 } = pagination;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      data: list.slice(start, end),
      total: list.length,
      page,
      pageSize,
      totalPages: Math.ceil(list.length / pageSize),
    };
  }

  return {
    async findAll(filters?: UserFilters, pagination?: PaginationParams) {
      const filtered = applyFilters(users, filters);
      return paginate(filtered, pagination);
    },
    async findById(id: string) {
      return users.find(u => u.id === id) || null;
    },
    async findByEmail(email: string) {
      return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    },
    async create(user: Omit<AdminUser, 'id' | 'createdAt'>) {
      const newUser: AdminUser = {
        ...user,
        id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      users = [newUser, ...users];
      persist();
      return newUser;
    },
    async update(id: string, updates: Partial<AdminUser>) {
      const idx = users.findIndex(u => u.id === id);
      if (idx === -1) throw new Error(`User ${id} not found`);
      users[idx] = { ...users[idx], ...updates };
      persist();
      return users[idx];
    },
    async delete(id: string) {
      const idx = users.findIndex(u => u.id === id);
      if (idx === -1) throw new Error(`User ${id} not found`);
      users.splice(idx, 1);
      persist();
    },
    async changeRole(id: string, role: UserRole) {
      const idx = users.findIndex(u => u.id === id);
      if (idx === -1) throw new Error(`User ${id} not found`);
      users[idx] = { ...users[idx], role };
      persist();
      return users[idx];
    },
    async changeStatus(id: string, status: UserStatus) {
      const idx = users.findIndex(u => u.id === id);
      if (idx === -1) throw new Error(`User ${id} not found`);
      users[idx] = { ...users[idx], status };
      persist();
      return users[idx];
    },
    async getStats() {
      const byRole: Record<UserRole, number> = { super_admin: 0, admin: 0, user: 0, client: 0 };
      const byStatus: Record<UserStatus, number> = { active: 0, invited: 0, suspended: 0, inactive: 0 };
      
      users.forEach(u => {
        byRole[u.role] = (byRole[u.role] || 0) + 1;
        byStatus[u.status] = (byStatus[u.status] || 0) + 1;
      });
      
      return { total: users.length, byRole, byStatus };
    },
  };
}

// =====================================================================
// MOCK GPU REPOSITORY
// =====================================================================

function createGPURepository(): GPURepository {
  let nodes = loadFromStorage<RegionGPUNode>(STORAGE_KEYS.gpuNodes, INITIAL_GPU_NODES);

  const persist = () => saveToStorage(STORAGE_KEYS.gpuNodes, nodes);

  function findIdx(id: string) {
    const idx = nodes.findIndex(n => n.id === id);
    if (idx === -1) throw new Error(`GPU node ${id} not found`);
    return idx;
  }

  return {
    async findAll(filters) {
      if (!filters) return [...nodes];
      return nodes.filter(n => {
        if (filters.regionCode && n.regionCode !== filters.regionCode) return false;
        if (filters.status && n.status !== filters.status) return false;
        return true;
      });
    },
    async findById(id) {
      return nodes.find(n => n.id === id) || null;
    },
    async update(id, updates) {
      const idx = findIdx(id);
      nodes[idx] = { ...nodes[idx], ...updates };
      persist();
      return nodes[idx];
    },
    async updateLoad(id, load) {
      return this.update(id, load);
    },
    async toggleMaintenance(id) {
      const idx = findIdx(id);
      const newStatus = nodes[idx].status === 'maintenance' ? 'healthy' : 'maintenance';
      nodes[idx] = { ...nodes[idx], status: newStatus };
      persist();
      return nodes[idx];
    },
    async scaleNodes(id, delta) {
      const idx = findIdx(id);
      const newActive = Math.max(0, nodes[idx].activeNodes + delta);
      nodes[idx] = { ...nodes[idx], activeNodes: newActive };
      persist();
      return nodes[idx];
    },
    async restart(id) {
      const idx = findIdx(id);
      // Simulate restart: temporarily set to degraded, then healthy
      nodes[idx] = { ...nodes[idx], status: 'degraded', loadPercentage: 0, activeSessions: 0 };
      persist();
      // In real implementation, this would be async with actual restart
      setTimeout(() => {
        nodes[idx] = { ...nodes[idx], status: 'healthy' };
        persist();
      }, 2000);
      return nodes[idx];
    },
    async getClusterStats() {
      const totalNodes = nodes.reduce((sum, n) => sum + n.totalNodes, 0);
      const activeNodes = nodes.reduce((sum, n) => sum + n.activeNodes, 0);
      const totalSessions = nodes.reduce((sum, n) => sum + n.activeSessions, 0);
      const avgLoad = nodes.length > 0 
        ? nodes.reduce((sum, n) => sum + n.loadPercentage, 0) / nodes.length 
        : 0;
      const avgLatency = nodes.length > 0
        ? nodes.reduce((sum, n) => sum + n.avgLatencyMs, 0) / nodes.length
        : 0;
      return { totalNodes, activeNodes, totalSessions, avgLoad: Math.round(avgLoad), avgLatency: Math.round(avgLatency * 10) / 10 };
    },
  };
}

// =====================================================================
// MOCK FEATURE TOGGLE REPOSITORY
// =====================================================================

function createFeatureToggleRepository(): FeatureToggleRepository {
  let toggles = loadFromStorage<FeatureToggle>(STORAGE_KEYS.featureToggles, INITIAL_FEATURE_TOGGLES);

  const persist = () => saveToStorage(STORAGE_KEYS.featureToggles, toggles);

  return {
    async findAll() {
      return [...toggles].sort((a, b) => a.key.localeCompare(b.key));
    },
    async findByKey(key) {
      return toggles.find(t => t.key === key) || null;
    },
    async toggle(key) {
      const idx = toggles.findIndex(t => t.key === key);
      if (idx === -1) throw new Error(`Feature toggle ${key} not found`);
      toggles[idx] = { ...toggles[idx], enabled: !toggles[idx].enabled, lastModifiedAt: new Date().toISOString() };
      persist();
      return toggles[idx];
    },
    async update(key, updates) {
      const idx = toggles.findIndex(t => t.key === key);
      if (idx === -1) throw new Error(`Feature toggle ${key} not found`);
      toggles[idx] = { ...toggles[idx], ...updates, lastModifiedAt: new Date().toISOString() };
      persist();
      return toggles[idx];
    },
    async reset() {
      toggles = [...INITIAL_FEATURE_TOGGLES];
      persist();
    },
    async getByCategory(category) {
      return toggles.filter(t => t.category === category);
    },
  };
}

// =====================================================================
// MOCK SYSTEM LOG REPOSITORY
// =====================================================================

function createSystemLogRepository(): SystemLogRepository {
  let logs = loadFromStorage<SystemHealthLog>(STORAGE_KEYS.systemLogs, INITIAL_SYSTEM_LOGS);

  const persist = () => saveToStorage(STORAGE_KEYS.systemLogs, logs);

  function applyFilters(list: SystemHealthLog[], filters?: LogFilters): SystemHealthLog[] {
    if (!filters) return list;
    return list.filter(l => {
      if (filters.level && l.level !== filters.level) return false;
      if (filters.service && l.service !== filters.service) return false;
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (!l.message.toLowerCase().includes(s) &&
            !l.service.toLowerCase().includes(s) &&
            !(l.details?.toLowerCase().includes(s))) {
          return false;
        }
      }
      if (filters.dateFrom && l.timestamp < filters.dateFrom) return false;
      if (filters.dateTo && l.timestamp > filters.dateTo) return false;
      return true;
    });
  }

  function paginate<T>(list: T[], pagination?: PaginationParams): PaginatedResult<T> {
    if (!pagination) return { data: list, total: list.length, page: 1, pageSize: list.length, totalPages: 1 };
    const { page = 1, pageSize = 50 } = pagination;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      data: list.slice(start, end),
      total: list.length,
      page,
      pageSize,
      totalPages: Math.ceil(list.length / pageSize),
    };
  }

  return {
    async findAll(filters?: LogFilters, pagination?: PaginationParams) {
      const filtered = applyFilters([...logs].sort((a: SystemHealthLog, b: SystemHealthLog) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), filters);
      return paginate(filtered, pagination);
    },
    async add(log: Omit<SystemHealthLog, 'id' | 'timestamp'>) {
      const newLog: SystemHealthLog = {
        ...log,
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
      };
      logs = [newLog, ...logs];
      if (logs.length > 10000) logs = logs.slice(0, 10000); // Cap at 10k
      persist();
      return newLog;
    },
    async clear() {
      logs = [];
      persist();
    },
    async getStats() {
      const byLevel: Record<SystemHealthLog['level'], number> = { info: 0, warn: 0, error: 0, critical: 0 };
      const byService: Record<string, number> = {};
      
      logs.forEach(l => {
        byLevel[l.level] = (byLevel[l.level] || 0) + 1;
        byService[l.service] = (byService[l.service] || 0) + 1;
      });
      
      return { total: logs.length, byLevel, byService };
    },
  };
}

// =====================================================================
// MOCK REVENUE REPOSITORY
// =====================================================================

function createRevenueRepository(): RevenueRepository {

  function computeMonthly(): RevenueMetric[] {
    const monthly: Record<string, RevenueMetric> = {};
    
    INITIAL_MANAGED_PROJECTS.forEach((p) => {
      const monthKey = p.lastUpdate.includes('2025') ? '2025-08' : '2025-09'; // Simplified
      if (!monthly[monthKey]) {
        monthly[monthKey] = { month: monthKey, mrr: 0, oneOffCommissions: 0, gpuStreamingRevenue: 0, vrLicenses: 0, total: 0, expenses: 0, netMargin: 0 };
      }
      monthly[monthKey].total += p.bookingAmount;
      if (p.paymentStatus === 'Paid') monthly[monthKey].mrr += p.bookingAmount / 12;
      else if (p.paymentStatus === 'Partial 50%') monthly[monthKey].oneOffCommissions += p.bookingAmount * 0.5;
      if (p.projectType === 'Pixel Streaming') monthly[monthKey].gpuStreamingRevenue += p.bookingAmount;
      if (p.projectType === 'Virtual Reality') monthly[monthKey].vrLicenses += p.bookingAmount;
    });
    
    return Object.values(monthly).sort((a, b) => b.month.localeCompare(a.month));
  }

  return {
    async getMonthly() {
      return computeMonthly();
    },
    async getSummary() {
      const monthly = computeMonthly();
      const currentMonth = monthly[0] || { mrr: 0, total: 0 };
      const prevMonth = monthly[1] || { mrr: 0 };
      const growthRateMoM = prevMonth.mrr > 0 ? ((currentMonth.mrr - prevMonth.mrr) / prevMonth.mrr) * 100 : 0;
      
      return {
        currentMRR: Math.round(currentMonth.mrr),
        currentARR: Math.round(currentMonth.mrr * 12),
        growthRateMoM: Math.round(growthRateMoM * 10) / 10,
      };
    },
    async refresh() {
      // In mock, just return current computed values
      return;
    },
  };
}

// =====================================================================
// MOCK BOOKING REPOSITORY
// =====================================================================

function createBookingRepository(): BookingRepository {
  let bookings = loadFromStorage<Booking>(STORAGE_KEYS.bookings, []);

  const persist = () => saveToStorage(STORAGE_KEYS.bookings, bookings);

  function applyFilters(list: Booking[], filters?: BookingFilters): Booking[] {
    if (!filters) return list;
    return list.filter(b => {
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (!b.client_name.toLowerCase().includes(s) &&
            !b.client_email.toLowerCase().includes(s) &&
            !b.company?.toLowerCase().includes(s) &&
            !b.project_description?.toLowerCase().includes(s)) {
          return false;
        }
      }
      if (filters.status && b.status !== filters.status) return false;
      if (filters.service_type && b.service_type !== filters.service_type) return false;
      if (filters.date_from && b.preferred_date < filters.date_from) return false;
      if (filters.date_to && b.preferred_date > filters.date_to) return false;
      return true;
    });
  }

  function paginate<T>(list: T[], pagination?: PaginationParams): PaginatedResult<T> {
    if (!pagination) return { data: list, total: list.length, page: 1, pageSize: list.length, totalPages: 1 };
    const { page = 1, pageSize = 20 } = pagination;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      data: list.slice(start, end),
      total: list.length,
      page,
      pageSize,
      totalPages: Math.ceil(list.length / pageSize),
    };
  }

  return {
    async findAll(filters?: BookingFilters, pagination?: PaginationParams) {
      const filtered = applyFilters(bookings, filters);
      // Sort by created_at descending
      const sorted = [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return paginate(sorted, pagination);
    },
    async findById(id: string) {
      return bookings.find(b => b.id === id) || null;
    },
    async create(booking: CreateBooking) {
      const newBooking: Booking = {
        ...booking,
        id: `bkg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        status: 'pending',
        admin_notes: undefined,
        approved_by: undefined,
        approved_at: undefined,
        rejected_by: undefined,
        rejected_at: undefined,
        rejection_reason: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      bookings = [newBooking, ...bookings];
      persist();
      return newBooking;
    },
    async update(id: string, updates: Partial<Booking>) {
      const idx = bookings.findIndex(b => b.id === id);
      if (idx === -1) throw new Error(`Booking ${id} not found`);
      bookings[idx] = { ...bookings[idx], ...updates, updated_at: new Date().toISOString() };
      persist();
      return bookings[idx];
    },
    async delete(id: string) {
      const idx = bookings.findIndex(b => b.id === id);
      if (idx === -1) throw new Error(`Booking ${id} not found`);
      bookings.splice(idx, 1);
      persist();
    },
    async approve(id: string, adminNotes?: string) {
      const idx = bookings.findIndex(b => b.id === id);
      if (idx === -1) throw new Error(`Booking ${id} not found`);
      if (bookings[idx].status !== 'pending') {
        throw new Error('Only pending bookings can be approved');
      }
      bookings[idx] = {
        ...bookings[idx],
        status: 'approved',
        admin_notes: adminNotes,
        approved_by: 'current-user-id', // In real app, get from auth context
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      persist();
      return bookings[idx];
    },
    async reject(id: string, rejectionReason: string, adminNotes?: string) {
      const idx = bookings.findIndex(b => b.id === id);
      if (idx === -1) throw new Error(`Booking ${id} not found`);
      if (bookings[idx].status !== 'pending') {
        throw new Error('Only pending bookings can be rejected');
      }
      bookings[idx] = {
        ...bookings[idx],
        status: 'rejected',
        rejection_reason: rejectionReason,
        admin_notes: adminNotes,
        rejected_by: 'current-user-id',
        rejected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      persist();
      return bookings[idx];
    },
    async getStats() {
      const byStatus: Record<BookingStatus, number> = { pending: 0, approved: 0, rejected: 0, completed: 0, cancelled: 0 };
      const byServiceType: Record<BookingServiceType, number> = {
        Architectural: 0, 'Virtual Reality': 0, 'Pixel Streaming': 0, WebXR: 0, WebAR: 0, 'Virtual Tour 360': 0, Animation: 0, 'Still Renders': 0, Other: 0,
      };
      
      bookings.forEach(b => {
        byStatus[b.status] = (byStatus[b.status] || 0) + 1;
        byServiceType[b.service_type] = (byServiceType[b.service_type] || 0) + 1;
      });
      
      return { total: bookings.length, by_status: byStatus, by_service_type: byServiceType };
    },
  };
}

// =====================================================================
// MOCK CONTACT REPOSITORY
// =====================================================================

function createContactRepository(): ContactRepository {
  let contacts = loadFromStorage<ContactSubmission>(STORAGE_KEYS.contacts, []);

  const persist = () => saveToStorage(STORAGE_KEYS.contacts, contacts);

  function applyFilters(list: ContactSubmission[], filters?: ContactFilters): ContactSubmission[] {
    if (!filters) return list;
    return list.filter(c => {
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (!c.name.toLowerCase().includes(s) &&
            !c.email.toLowerCase().includes(s) &&
            !(c.company && c.company.toLowerCase().includes(s)) &&
            !(c.message && c.message.toLowerCase().includes(s))) {
          return false;
        }
      }
      if (filters.status && c.status !== filters.status) return false;
      if (filters.service_interest && c.service_interest !== filters.service_interest) return false;
      if (filters.date_from && c.created_at < filters.date_from) return false;
      if (filters.date_to && c.created_at > filters.date_to + 'T23:59:59Z') return false;
      return true;
    });
  }

  return {
    async findAll(filters?: ContactFilters, pagination?: PaginationParams): Promise<PaginatedResult<ContactSubmission>> {
      let filtered = applyFilters([...contacts], filters);
      
      const sortBy = pagination?.sortBy || 'created_at';
      const sortOrder = pagination?.sortOrder || 'desc';
      filtered.sort((a, b) => {
        const aVal = a[sortBy as keyof ContactSubmission] as string;
        const bVal = b[sortBy as keyof ContactSubmission] as string;
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      const page = pagination?.page || 1;
      const pageSize = pagination?.pageSize || 20;
      const start = (page - 1) * pageSize;
      const paginated = filtered.slice(start, start + pageSize);

      return {
        data: paginated,
        total: filtered.length,
        page,
        pageSize,
        totalPages: Math.ceil(filtered.length / pageSize),
      };
    },

    async findById(id: string): Promise<ContactSubmission | null> {
      return contacts.find(c => c.id === id) || null;
    },

    async create(contact: CreateContact): Promise<ContactSubmission> {
      const now = new Date().toISOString();
      const newContact: ContactSubmission = {
        id: `CONT-${new Date().getFullYear()}-${String(contacts.length + 1).padStart(3, '0')}`,
        ...contact,
        status: 'new',
        created_at: now,
        updated_at: now,
      };
      contacts.push(newContact);
      persist();
      return newContact;
    },

    async updateStatus(id: string, status: ContactStatus): Promise<ContactSubmission> {
      const idx = contacts.findIndex(c => c.id === id);
      if (idx === -1) throw new Error(`Contact ${id} not found`);
      
      contacts[idx] = {
        ...contacts[idx],
        status,
        updated_at: new Date().toISOString(),
      };
      persist();
      return contacts[idx];
    },

    async delete(id: string): Promise<void> {
      contacts = contacts.filter(c => c.id !== id);
      persist();
    },

    async getStats(): Promise<ContactStats> {
      const byStatus: Record<string, number> = {};
      const byServiceInterest: Record<string, number> = {};

      contacts.forEach(c => {
        byStatus[c.status] = (byStatus[c.status] || 0) + 1;
        if (c.service_interest) {
          byServiceInterest[c.service_interest] = (byServiceInterest[c.service_interest] || 0) + 1;
        }
      });

      return {
        total: contacts.length,
        by_status: byStatus as any,
        by_service_interest: byServiceInterest as any,
      };
    },
  };
}

export function createMockRepositoryFactory() {
  return {
    users: createUserRepository(),
    gpu: createGPURepository(),
    featureToggles: createFeatureToggleRepository(),
    logs: createSystemLogRepository(),
    revenue: createRevenueRepository(),
    bookings: createBookingRepository(),
    contacts: createContactRepository(),
  };
}

export function createMockRepositoryFactorySync() {
  return createMockRepositoryFactory();
}