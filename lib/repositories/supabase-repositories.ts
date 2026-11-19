/**
 * Supabase Repository Implementations
 * 
 * Production implementations backed by Supabase (service-role client).
 * Replaces mock/localStorage repositories for production use.
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
  BookingFilters,
} from './index';

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
  CreateBooking,
  UpdateBooking,
  ContactSubmission,
  ContactStatus,
  ContactServiceInterest,
  ContactFilters,
  ContactStats,
  CreateContact,
} from '../super-admin-store-types';

import { getSupabaseAdmin } from '@/lib/supabase-admin';

function requireAdmin() {
  const admin = getSupabaseAdmin();
  if (!admin) {
    throw new Error('Supabase admin client not configured. Set SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL.');
  }
  return admin;
}

function toAdminUser(row: any): AdminUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as UserRole,
    status: row.status as UserStatus,
    avatar: row.avatar || '',
    department: row.department || '',
    assignedProjectsCount: row.assigned_projects_count || 0,
    lastLogin: row.last_login || '',
    twoFactorEnabled: row.two_factor_enabled || false,
    phone: row.phone || undefined,
    company: row.company || undefined,
    createdAt: row.created_at,
    permissionsOverride: row.permissions_override || undefined,
  };
}

function toRegionGPUNode(row: any): RegionGPUNode {
  return {
    id: row.id,
    regionCode: row.region_code,
    regionName: row.region_name,
    flagEmoji: row.flag_emoji || '',
    gpuModel: row.gpu_model,
    instanceType: row.instance_type,
    totalNodes: row.total_nodes,
    activeNodes: row.active_nodes,
    activeSessions: row.active_sessions,
    maxSessions: row.max_sessions,
    loadPercentage: row.load_percentage,
    vramUsedGB: row.vram_used_gb,
    vramTotalGB: row.vram_total_gb,
    avgLatencyMs: row.avg_latency_ms,
    avgFps: row.avg_fps,
    temperatureC: row.temperature_c,
    status: row.status as 'healthy' | 'warning' | 'degraded' | 'maintenance',
  };
}

function toFeatureToggle(row: any): FeatureToggle {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description || '',
    category: row.category as FeatureToggle['category'],
    enabled: row.enabled,
    requiresRestart: row.requires_restart,
    environment: row.environment as FeatureToggle['environment'],
    lastModifiedBy: row.last_modified_by || '',
    lastModifiedAt: row.last_modified_at,
  };
}

function toSystemHealthLog(row: any): SystemHealthLog {
  return {
    id: row.id,
    timestamp: row.timestamp,
    level: row.level as SystemHealthLog['level'],
    service: row.service,
    message: row.message,
    details: row.details || undefined,
    region: row.region || undefined,
    ip: row.ip || undefined,
  };
}

function toRevenueMetric(row: any): RevenueMetric {
  return {
    month: row.month,
    mrr: row.mrr,
    oneOffCommissions: row.one_off_commissions,
    vrLicenses: row.vr_licenses,
    total: row.total,
    expenses: row.expenses,
    netMargin: row.net_margin,
  };
}

function toBooking(row: any): Booking {
  return {
    id: row.id,
    service_type: row.service_type as BookingServiceType,
    client_name: row.client_name,
    client_email: row.client_email,
    client_phone: row.client_phone || undefined,
    company: row.company || undefined,
    project_description: row.project_description || undefined,
    preferred_date: row.preferred_date,
    preferred_time: row.preferred_time,
    timezone: row.timezone,
    message: row.message || undefined,
    status: row.status as BookingStatus,
    admin_notes: row.admin_notes || undefined,
    approved_by: row.approved_by || undefined,
    approved_at: row.approved_at || undefined,
    rejected_by: row.rejected_by || undefined,
    rejected_at: row.rejected_at || undefined,
    rejection_reason: row.rejection_reason || undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function toContactSubmission(row: any): ContactSubmission {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || undefined,
    company: row.company || undefined,
    service_interest: row.service_interest as ContactServiceInterest | undefined,
    message: row.message || undefined,
    status: row.status as ContactStatus,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// =====================================================================
// USER REPOSITORY
// =====================================================================

function createSupabaseUserRepository(): UserRepository {
  const admin = requireAdmin();

  return {
    async findAll(filters?, pagination?) {
      let query = admin.from('super_admin_users').select('*');

      if (filters?.role) query = query.eq('role', filters.role);
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,department.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
      }

      const page = pagination?.page || 1;
      const pageSize = pagination?.pageSize || 20;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: (data || []).map(toAdminUser),
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    },

    async findById(id) {
      const { data, error } = await admin.from('super_admin_users').select('*').eq('id', id).single();
      if (error) throw error;
      return data ? toAdminUser(data) : null;
    },

    async findByEmail(email) {
      const { data, error } = await admin.from('super_admin_users').select('*').eq('email', email).single();
      if (error) throw error;
      return data ? toAdminUser(data) : null;
    },

    async create(user) {
      const id = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const now = new Date().toISOString();
      const { data, error } = await admin
        .from('super_admin_users')
        .insert({
          id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          avatar: user.avatar || '',
          department: user.department || '',
          assigned_projects_count: user.assignedProjectsCount || 0,
          last_login: user.lastLogin || '',
          two_factor_enabled: user.twoFactorEnabled || false,
          phone: user.phone || null,
          company: user.company || null,
          permissions_override: user.permissionsOverride || null,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) throw error;
      return toAdminUser(data);
    },

    async update(id, updates) {
      const now = new Date().toISOString();
      const { data, error } = await admin
        .from('super_admin_users')
        .update({
          ...(updates.name !== undefined && { name: updates.name }),
          ...(updates.email !== undefined && { email: updates.email }),
          ...(updates.role !== undefined && { role: updates.role }),
          ...(updates.status !== undefined && { status: updates.status }),
          ...(updates.avatar !== undefined && { avatar: updates.avatar }),
          ...(updates.department !== undefined && { department: updates.department }),
          ...(updates.phone !== undefined && { phone: updates.phone }),
          ...(updates.company !== undefined && { company: updates.company }),
          updated_at: now,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return toAdminUser(data);
    },

    async delete(id) {
      const { error } = await admin.from('super_admin_users').delete().eq('id', id);
      if (error) throw error;
    },

    async changeRole(id, role) {
      const { data, error } = await admin
        .from('super_admin_users')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return toAdminUser(data);
    },

    async changeStatus(id, status) {
      const { data, error } = await admin
        .from('super_admin_users')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return toAdminUser(data);
    },

    async getStats() {
      const { data, error } = await admin.from('super_admin_users').select('role, status');
      if (error) throw error;

      const byRole: Record<UserRole, number> = { super_admin: 0, admin: 0, user: 0, client: 0 };
      const byStatus: Record<UserStatus, number> = { active: 0, invited: 0, suspended: 0, inactive: 0 };

      (data || []).forEach((row: any) => {
        byRole[row.role as UserRole] = (byRole[row.role as UserRole] || 0) + 1;
        byStatus[row.status as UserStatus] = (byStatus[row.status as UserStatus] || 0) + 1;
      });

      return { total: (data || []).length, byRole, byStatus };
    },
  };
}

// =====================================================================
// GPU REPOSITORY
// =====================================================================

function createSupabaseGPURepository(): GPURepository {
  const admin = requireAdmin();

  return {
    async findAll(filters?) {
      let query = admin.from('gpu_nodes').select('*');

      if (filters?.regionCode) query = query.eq('region_code', filters.regionCode);
      if (filters?.status) query = query.eq('status', filters.status);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(toRegionGPUNode);
    },

    async findById(id) {
      const { data, error } = await admin.from('gpu_nodes').select('*').eq('id', id).single();
      if (error) throw error;
      return data ? toRegionGPUNode(data) : null;
    },

    async update(id, updates) {
      const now = new Date().toISOString();
      const { data, error } = await admin
        .from('gpu_nodes')
        .update({
          ...(updates.regionCode !== undefined && { region_code: updates.regionCode }),
          ...(updates.regionName !== undefined && { region_name: updates.regionName }),
          ...(updates.flagEmoji !== undefined && { flag_emoji: updates.flagEmoji }),
          ...(updates.gpuModel !== undefined && { gpu_model: updates.gpuModel }),
          ...(updates.instanceType !== undefined && { instance_type: updates.instanceType }),
          ...(updates.totalNodes !== undefined && { total_nodes: updates.totalNodes }),
          ...(updates.activeNodes !== undefined && { active_nodes: updates.activeNodes }),
          ...(updates.activeSessions !== undefined && { active_sessions: updates.activeSessions }),
          ...(updates.maxSessions !== undefined && { max_sessions: updates.maxSessions }),
          ...(updates.loadPercentage !== undefined && { load_percentage: updates.loadPercentage }),
          ...(updates.vramUsedGB !== undefined && { vram_used_gb: updates.vramUsedGB }),
          ...(updates.vramTotalGB !== undefined && { vram_total_gb: updates.vramTotalGB }),
          ...(updates.avgLatencyMs !== undefined && { avg_latency_ms: updates.avgLatencyMs }),
          ...(updates.avgFps !== undefined && { avg_fps: updates.avgFps }),
          ...(updates.temperatureC !== undefined && { temperature_c: updates.temperatureC }),
          ...(updates.status !== undefined && { status: updates.status }),
          updated_at: now,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return toRegionGPUNode(data);
    },

    async updateLoad(id, load) {
      const now = new Date().toISOString();
      const { data, error } = await admin
        .from('gpu_nodes')
        .update({
          ...(load.loadPercentage !== undefined && { load_percentage: load.loadPercentage }),
          ...(load.avgFps !== undefined && { avg_fps: load.avgFps }),
          ...(load.temperatureC !== undefined && { temperature_c: load.temperatureC }),
          updated_at: now,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return toRegionGPUNode(data);
    },

    async toggleMaintenance(id) {
      const { data: node } = await admin.from('gpu_nodes').select('status').eq('id', id).single();
      if (!node) throw new Error(`GPU node ${id} not found`);

      const newStatus = node.status === 'maintenance' ? 'healthy' : 'maintenance';
      const { data, error } = await admin
        .from('gpu_nodes')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return toRegionGPUNode(data);
    },

    async scaleNodes(id, delta) {
      const { data: node } = await admin.from('gpu_nodes').select('active_nodes').eq('id', id).single();
      if (!node) throw new Error(`GPU node ${id} not found`);

      const newActive = Math.max(0, node.active_nodes + delta);
      const { data, error } = await admin
        .from('gpu_nodes')
        .update({ active_nodes: newActive, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return toRegionGPUNode(data);
    },

    async restart(id) {
      const now = new Date().toISOString();
      const { data, error } = await admin
        .from('gpu_nodes')
        .update({ status: 'degraded', load_percentage: 0, active_sessions: 0, updated_at: now })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Simulate restart completion after 2 seconds
      setTimeout(async () => {
        try {
          await admin
            .from('gpu_nodes')
            .update({ status: 'healthy', updated_at: new Date().toISOString() })
            .eq('id', id);
        } catch {
          // Ignore timeout errors
        }
      }, 2000);

      return toRegionGPUNode(data);
    },

    async getClusterStats() {
      const { data, error } = await admin.from('gpu_nodes').select('*');
      if (error) throw error;

      const nodes = data || [];
      return {
        totalNodes: nodes.reduce((sum, n) => sum + (n.total_nodes || 0), 0),
        activeNodes: nodes.reduce((sum, n) => sum + (n.active_nodes || 0), 0),
        totalSessions: nodes.reduce((sum, n) => sum + (n.active_sessions || 0), 0),
        avgLoad: nodes.length > 0 ? Math.round(nodes.reduce((sum, n) => sum + (n.load_percentage || 0), 0) / nodes.length) : 0,
        avgLatency: nodes.length > 0 ? Math.round(nodes.reduce((sum, n) => sum + (n.avg_latency_ms || 0), 0) / nodes.length * 10) / 10 : 0,
      };
    },
  };
}

// =====================================================================
// FEATURE TOGGLE REPOSITORY
// =====================================================================

function createSupabaseFeatureToggleRepository(): FeatureToggleRepository {
  const admin = requireAdmin();

  return {
    async findAll() {
      const { data, error } = await admin.from('feature_toggles').select('*').order('key');
      if (error) throw error;
      return (data || []).map(toFeatureToggle);
    },

    async findByKey(key) {
      const { data, error } = await admin.from('feature_toggles').select('*').eq('key', key).single();
      if (error) throw error;
      return data ? toFeatureToggle(data) : null;
    },

    async toggle(key) {
      const { data: current } = await admin.from('feature_toggles').select('enabled').eq('key', key).single();
      if (!current) throw new Error(`Feature toggle ${key} not found`);

      const { data, error } = await admin
        .from('feature_toggles')
        .update({ enabled: !current.enabled, last_modified_at: new Date().toISOString() })
        .eq('key', key)
        .select()
        .single();

      if (error) throw error;
      return toFeatureToggle(data);
    },

    async update(key, updates) {
      const now = new Date().toISOString();
      const { data, error } = await admin
        .from('feature_toggles')
        .update({
          ...(updates.name !== undefined && { name: updates.name }),
          ...(updates.description !== undefined && { description: updates.description }),
          ...(updates.category !== undefined && { category: updates.category }),
          ...(updates.enabled !== undefined && { enabled: updates.enabled }),
          ...(updates.requiresRestart !== undefined && { requires_restart: updates.requiresRestart }),
          ...(updates.environment !== undefined && { environment: updates.environment }),
          ...(updates.lastModifiedBy !== undefined && { last_modified_by: updates.lastModifiedBy }),
          last_modified_at: now,
        })
        .eq('key', key)
        .select()
        .single();

      if (error) throw error;
      return toFeatureToggle(data);
    },

    async reset() {
      const { error } = await admin.from('feature_toggles').delete().neq('key', '');
      if (error) throw error;
    },

    async getByCategory(category) {
      const { data, error } = await admin.from('feature_toggles').select('*').eq('category', category);
      if (error) throw error;
      return (data || []).map(toFeatureToggle);
    },
  };
}

// =====================================================================
// SYSTEM LOG REPOSITORY
// =====================================================================

function createSupabaseSystemLogRepository(): SystemLogRepository {
  const admin = requireAdmin();

  return {
    async findAll(filters?, pagination?) {
      let query = admin.from('system_logs').select('*').order('timestamp', { ascending: false });

      if (filters?.level) query = query.eq('level', filters.level);
      if (filters?.service) query = query.eq('service', filters.service);
      if (filters?.search) {
        query = query.or(`message.ilike.%${filters.search}%,service.ilike.%${filters.search}%,details.ilike.%${filters.search}%`);
      }
      if (filters?.dateFrom) query = query.gte('timestamp', filters.dateFrom);
      if (filters?.dateTo) query = query.lte('timestamp', filters.dateTo);

      const page = pagination?.page || 1;
      const pageSize = pagination?.pageSize || 50;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        data: (data || []).map(toSystemHealthLog),
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    },

    async add(log) {
      const id = `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const { data, error } = await admin
        .from('system_logs')
        .insert({
          id,
          timestamp: new Date().toISOString(),
          level: log.level,
          service: log.service,
          message: log.message,
          details: log.details || null,
          region: log.region || null,
          ip: log.ip || null,
        })
        .select()
        .single();

      if (error) throw error;
      return toSystemHealthLog(data);
    },

    async clear() {
      const { error } = await admin.from('system_logs').delete().neq('id', '');
      if (error) throw error;
    },

    async getStats() {
      const { data, error } = await admin.from('system_logs').select('level, service');
      if (error) throw error;

      const byLevel: Record<string, number> = { info: 0, warn: 0, error: 0, critical: 0 };
      const byService: Record<string, number> = {};

      (data || []).forEach((row: any) => {
        byLevel[row.level] = (byLevel[row.level] || 0) + 1;
        byService[row.service] = (byService[row.service] || 0) + 1;
      });

      return { total: (data || []).length, byLevel, byService };
    },
  };
}

// =====================================================================
// REVENUE REPOSITORY
// =====================================================================

function createSupabaseRevenueRepository(): RevenueRepository {
  const admin = requireAdmin();

  return {
    async getMonthly() {
      const { data, error } = await admin.from('revenue_metrics').select('*').order('month', { ascending: false });
      if (error) throw error;
      return (data || []).map(toRevenueMetric);
    },

    async getSummary() {
      const { data, error } = await admin.from('revenue_metrics').select('*').order('month', { ascending: false }).limit(1);
      if (error) throw error;

      const current = data?.[0] || { mrr: 0, total: 0 };
      const { data: prevData } = await admin.from('revenue_metrics').select('mrr').order('month', { ascending: false }).range(1, 1);
      const prev = prevData?.[0] || { mrr: 0 };

      const growthRateMoM = prev.mrr > 0 ? ((current.mrr - prev.mrr) / prev.mrr) * 100 : 0;

      return {
        currentMRR: Math.round(current.mrr),
        currentARR: Math.round(current.mrr * 12),
        growthRateMoM: Math.round(growthRateMoM * 10) / 10,
      };
    },

    async refresh() {
      // Revenue metrics are computed externally; refresh is a no-op in Supabase impl
      return;
    },
  };
}

// =====================================================================
// BOOKING REPOSITORY
// =====================================================================

function createSupabaseBookingRepository(): BookingRepository {
  const admin = requireAdmin();

  return {
    async findAll(filters?, pagination?) {
      let query = admin.from('bookings').select('*').order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`client_name.ilike.%${filters.search}%,client_email.ilike.%${filters.search}%,company.ilike.%${filters.search}%,project_description.ilike.%${filters.search}%`);
      }
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.service_type) query = query.eq('service_type', filters.service_type);
      if (filters?.date_from) query = query.gte('preferred_date', filters.date_from);
      if (filters?.date_to) query = query.lte('preferred_date', filters.date_to);

      const page = pagination?.page || 1;
      const pageSize = pagination?.pageSize || 20;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        data: (data || []).map(toBooking),
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    },

    async findById(id) {
      const { data, error } = await admin.from('bookings').select('*').eq('id', id).single();
      if (error) throw error;
      return data ? toBooking(data) : null;
    },

    async create(booking) {
      const id = `bkg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const now = new Date().toISOString();
      const { data, error } = await admin
        .from('bookings')
        .insert({
          id,
          service_type: booking.service_type,
          client_name: booking.client_name,
          client_email: booking.client_email,
          client_phone: booking.client_phone || null,
          company: booking.company || null,
          project_description: booking.project_description || null,
          preferred_date: booking.preferred_date,
          preferred_time: booking.preferred_time,
          timezone: booking.timezone,
          message: booking.message || null,
          status: 'pending',
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) throw error;
      return toBooking(data);
    },

    async update(id, updates) {
      const now = new Date().toISOString();
      const { data, error } = await admin
        .from('bookings')
        .update({
          ...(updates.service_type !== undefined && { service_type: updates.service_type }),
          ...(updates.client_name !== undefined && { client_name: updates.client_name }),
          ...(updates.client_email !== undefined && { client_email: updates.client_email }),
          ...(updates.status !== undefined && { status: updates.status }),
          ...(updates.admin_notes !== undefined && { admin_notes: updates.admin_notes }),
          updated_at: now,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return toBooking(data);
    },

    async delete(id) {
      const { error } = await admin.from('bookings').delete().eq('id', id);
      if (error) throw error;
    },

    async approve(id, adminNotes) {
      const now = new Date().toISOString();
      const { data, error } = await admin
        .from('bookings')
        .update({
          status: 'approved',
          admin_notes: adminNotes || null,
          approved_by: 'current-user',
          approved_at: now,
          updated_at: now,
        })
        .eq('id', id)
        .eq('status', 'pending')
        .select()
        .single();

      if (error) throw error;
      return toBooking(data);
    },

    async reject(id, rejectionReason, adminNotes) {
      const now = new Date().toISOString();
      const { data, error } = await admin
        .from('bookings')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          admin_notes: adminNotes || null,
          rejected_by: 'current-user',
          rejected_at: now,
          updated_at: now,
        })
        .eq('id', id)
        .eq('status', 'pending')
        .select()
        .single();

      if (error) throw error;
      return toBooking(data);
    },

    async getStats() {
      const { data, error } = await admin.from('bookings').select('status, service_type');
      if (error) throw error;

      const byStatus: Record<BookingStatus, number> = { pending: 0, approved: 0, rejected: 0, completed: 0, cancelled: 0 };
      const byServiceType: Record<BookingServiceType, number> = {
        Architectural: 0, 'Virtual Reality': 0, WebXR: 0, WebAR: 0, 'Virtual Tour 360': 0, Animation: 0, 'Still Renders': 0, Other: 0,
      };

      (data || []).forEach((row: any) => {
        byStatus[row.status as BookingStatus] = (byStatus[row.status as BookingStatus] || 0) + 1;
        byServiceType[row.service_type as BookingServiceType] = (byServiceType[row.service_type as BookingServiceType] || 0) + 1;
      });

      return { total: (data || []).length, by_status: byStatus, by_service_type: byServiceType };
    },
  };
}

// =====================================================================
// CONTACT REPOSITORY
// =====================================================================

function createSupabaseContactRepository(): ContactRepository {
  const admin = requireAdmin();

  return {
    async findAll(filters?, pagination?) {
      let query = admin.from('contact_submissions').select('*').order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);
      }
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.service_interest) query = query.eq('service_interest', filters.service_interest);
      if (filters?.date_from) query = query.gte('created_at', filters.date_from);
      if (filters?.date_to) query = query.lte('created_at', filters.date_to + 'T23:59:59Z');

      const page = pagination?.page || 1;
      const pageSize = pagination?.pageSize || 20;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        data: (data || []).map(toContactSubmission),
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    },

    async findById(id) {
      const { data, error } = await admin.from('contact_submissions').select('*').eq('id', id).single();
      if (error) throw error;
      return data ? toContactSubmission(data) : null;
    },

    async create(contact) {
      const now = new Date().toISOString();
      const year = new Date().getFullYear();
      const { data: existing } = await admin.from('contact_submissions').select('id').order('created_at', { ascending: false }).limit(1);
      const nextNum = (existing?.length || 0) + 1;
      const id = `CONT-${year}-${String(nextNum).padStart(3, '0')}`;

      const { data, error } = await admin
        .from('contact_submissions')
        .insert({
          id,
          name: contact.name,
          email: contact.email,
          phone: contact.phone || null,
          company: contact.company || null,
          service_interest: contact.service_interest || null,
          message: contact.message || null,
          status: 'new',
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) throw error;
      return toContactSubmission(data);
    },

    async updateStatus(id, status) {
      const { data, error } = await admin
        .from('contact_submissions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return toContactSubmission(data);
    },

    async delete(id) {
      const { error } = await admin.from('contact_submissions').delete().eq('id', id);
      if (error) throw error;
    },

    async getStats() {
      const { data, error } = await admin.from('contact_submissions').select('status, service_interest');
      if (error) throw error;

      const byStatus: Record<string, number> = {};
      const byServiceInterest: Record<string, number> = {};

      (data || []).forEach((row: any) => {
        byStatus[row.status] = (byStatus[row.status] || 0) + 1;
        if (row.service_interest) {
          byServiceInterest[row.service_interest] = (byServiceInterest[row.service_interest] || 0) + 1;
        }
      });

      return { total: (data || []).length, by_status: byStatus, by_service_interest: byServiceInterest };
    },
  };
}

// =====================================================================
// REPOSITORY FACTORY
// =====================================================================

export function createSupabaseRepositoryFactory(): RepositoryFactory {
  return {
    users: createSupabaseUserRepository(),
    gpu: createSupabaseGPURepository(),
    featureToggles: createSupabaseFeatureToggleRepository(),
    logs: createSupabaseSystemLogRepository(),
    revenue: createSupabaseRevenueRepository(),
    bookings: createSupabaseBookingRepository(),
    contacts: createSupabaseContactRepository(),
  };
}
