/**
 * Admin API Contracts - Zod Schemas
 * 
 * Single source of truth for all admin API request/response types.
 * Shared between client and server for type safety.
 */

import { z } from 'zod';

// =====================================================================
// BASE TYPES
// =====================================================================

export const UserRoleSchema = z.enum(['super_admin', 'admin', 'user', 'client']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserStatusSchema = z.enum(['active', 'invited', 'suspended', 'inactive']);
export type UserStatus = z.infer<typeof UserStatusSchema>;

export const ProjectTypeSchema = z.enum(['Architectural', 'Virtual Reality', 'Pixel Streaming', 'WebXR', 'Other']);
export type ProjectType = z.infer<typeof ProjectTypeSchema>;

export const ProjectStatusSchema = z.enum(['Planning', 'Work in Progress', 'Client Review', 'Revisions', 'Final Delivery', 'On Hold', 'Completed']);
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

export const PaymentStatusSchema = z.enum(['Pending', 'Partial 50%', 'Paid', 'Overdue']);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const GpuNodeStatusSchema = z.enum(['healthy', 'warning', 'degraded', 'maintenance']);
export type GpuNodeStatus = z.infer<typeof GpuNodeStatusSchema>;

export const FeatureToggleCategorySchema = z.enum(['core', 'rendering', 'xr', 'ai', 'security', 'storage']);
export type FeatureToggleCategory = z.infer<typeof FeatureToggleCategorySchema>;

export const FeatureToggleEnvironmentSchema = z.enum(['all', 'production', 'staging']);
export type FeatureToggleEnvironment = z.infer<typeof FeatureToggleEnvironmentSchema>;

export const LogLevelSchema = z.enum(['info', 'warn', 'error', 'critical']);
export type LogLevel = z.infer<typeof LogLevelSchema>;

// =====================================================================
// PAGINATION
// =====================================================================

export const PaginationParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
export type PaginationParams = z.infer<typeof PaginationParamsSchema>;

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  });
export type PaginatedResponse<T> = z.infer<ReturnType<typeof PaginatedResponseSchema<z.ZodTypeAny>>>;

// =====================================================================
// USERS / ADMINS
// =====================================================================

export const AdminUserSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  role: UserRoleSchema,
  status: UserStatusSchema,
  avatar: z.string().url(),
  department: z.string(),
  assignedProjectsCount: z.number().int().nonnegative(),
  lastLogin: z.string(),
  twoFactorEnabled: z.boolean(),
  createdAt: z.string().datetime(),
  permissionsOverride: z.array(z.string()).optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
});
export type AdminUser = z.infer<typeof AdminUserSchema>;

export const CreateAdminUserSchema = AdminUserSchema.omit({ id: true, createdAt: true });
export type CreateAdminUser = z.infer<typeof CreateAdminUserSchema>;

export const UpdateAdminUserSchema = AdminUserSchema.partial().omit({ id: true, createdAt: true });
export type UpdateAdminUser = z.infer<typeof UpdateAdminUserSchema>;

export const UserFiltersSchema = z.object({
  search: z.string().optional(),
  role: UserRoleSchema.optional(),
  status: UserStatusSchema.optional(),
  department: z.string().optional(),
});
export type UserFilters = z.infer<typeof UserFiltersSchema>;

export const UserStatsSchema = z.object({
  total: z.number().int().nonnegative(),
  byRole: z.record(UserRoleSchema, z.number().int().nonnegative()),
  byStatus: z.record(UserStatusSchema, z.number().int().nonnegative()),
});
export type UserStats = z.infer<typeof UserStatsSchema>;

// =====================================================================
// GPU NODES
// =====================================================================

export const GpuNodeSchema = z.object({
  id: z.string(),
  regionCode: z.string(),
  regionName: z.string(),
  flagEmoji: z.string().optional(),
  gpuModel: z.string(),
  instanceType: z.string(),
  totalNodes: z.number().int().nonnegative(),
  activeNodes: z.number().int().nonnegative(),
  activeSessions: z.number().int().nonnegative(),
  maxSessions: z.number().int().nonnegative(),
  loadPercentage: z.number().int().min(0).max(100),
  vramUsedGB: z.number().nonnegative(),
  vramTotalGB: z.number().nonnegative(),
  avgLatencyMs: z.number().nonnegative(),
  avgFps: z.number().nonnegative(),
  temperatureC: z.number().int().nonnegative(),
  status: GpuNodeStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type GpuNode = z.infer<typeof GpuNodeSchema>;

export const UpdateGpuNodeSchema = GpuNodeSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });
export type UpdateGpuNode = z.infer<typeof UpdateGpuNodeSchema>;

export const GpuFiltersSchema = z.object({
  regionCode: z.string().optional(),
  status: GpuNodeStatusSchema.optional(),
});
export type GpuFilters = z.infer<typeof GpuFiltersSchema>;

export const GpuClusterStatsSchema = z.object({
  totalNodes: z.number().int().nonnegative(),
  activeNodes: z.number().int().nonnegative(),
  totalSessions: z.number().int().nonnegative(),
  avgLoad: z.number().nonnegative(),
  avgLatency: z.number().nonnegative(),
});
export type GpuClusterStats = z.infer<typeof GpuClusterStatsSchema>;

// =====================================================================
// FEATURE TOGGLES
// =====================================================================

export const FeatureToggleSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string(),
  category: FeatureToggleCategorySchema,
  enabled: z.boolean(),
  requiresRestart: z.boolean(),
  environment: FeatureToggleEnvironmentSchema,
  lastModifiedBy: z.string().nullable(),
  lastModifiedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
});
export type FeatureToggle = z.infer<typeof FeatureToggleSchema>;

export const UpdateFeatureToggleSchema = FeatureToggleSchema.partial().omit({ id: true, key: true, createdAt: true });
export type UpdateFeatureToggle = z.infer<typeof UpdateFeatureToggleSchema>;

// =====================================================================
// SYSTEM LOGS
// =====================================================================

export const SystemHealthLogSchema = z.object({
  id: z.string(),
  timestamp: z.string().datetime(),
  level: LogLevelSchema,
  service: z.string(),
  message: z.string(),
  details: z.string().optional(),
  region: z.string().optional(),
  ip: z.string().optional(),
});
export type SystemHealthLog = z.infer<typeof SystemHealthLogSchema>;

export const CreateSystemLogSchema = SystemHealthLogSchema.omit({ id: true, timestamp: true });
export type CreateSystemLog = z.infer<typeof CreateSystemLogSchema>;

export const LogFiltersSchema = z.object({
  level: LogLevelSchema.optional(),
  service: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});
export type LogFilters = z.infer<typeof LogFiltersSchema>;

export const LogStatsSchema = z.object({
  total: z.number().int().nonnegative(),
  byLevel: z.record(LogLevelSchema, z.number().int().nonnegative()),
  byService: z.record(z.string(), z.number().int().nonnegative()),
});
export type LogStats = z.infer<typeof LogStatsSchema>;

// =====================================================================
// REVENUE METRICS
// =====================================================================

export const RevenueMetricSchema = z.object({
  month: z.string(),
  mrr: z.number().nonnegative(),
  oneOffCommissions: z.number().nonnegative(),
  gpuStreamingRevenue: z.number().nonnegative(),
  vrLicenses: z.number().nonnegative(),
  total: z.number().nonnegative(),
  expenses: z.number().nonnegative(),
  netMargin: z.number(),
});
export type RevenueMetric = z.infer<typeof RevenueMetricSchema>;

export const RevenueSummarySchema = z.object({
  currentMRR: z.number().nonnegative(),
  currentARR: z.number().nonnegative(),
  growthRateMoM: z.number(),
});
export type RevenueSummary = z.infer<typeof RevenueSummarySchema>;

// =====================================================================
// PROJECTS
// =====================================================================

export const TimesheetEntrySchema = z.object({
  id: z.string(),
  date: z.string().datetime(),
  hours: z.number().positive(),
  description: z.string(),
  billable: z.boolean(),
});
export type TimesheetEntry = z.infer<typeof TimesheetEntrySchema>;

export const HoursMonitoringSchema = z.object({
  estimatedHours: z.number().nonnegative(),
  hoursSpent: z.number().nonnegative(),
  hoursRemaining: z.number(),
  timesheetEntries: z.array(TimesheetEntrySchema),
});
export type HoursMonitoring = z.infer<typeof HoursMonitoringSchema>;

export const ManagedProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  clientName: z.string(),
  projectType: ProjectTypeSchema,
  status: ProjectStatusSchema,
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  estimatedHours: z.number().nonnegative(),
  assignedTeam: z.array(z.string()),
  hoursMonitoring: HoursMonitoringSchema,
  bookingAmount: z.number().nonnegative(),
  paymentStatus: PaymentStatusSchema,
  notes: z.string().optional(),
  bookingFormData: z.record(z.string(), z.unknown()).optional(),
});
export type ManagedProject = z.infer<typeof ManagedProjectSchema>;

export const CreateProjectSchema = ManagedProjectSchema.omit({ id: true });
export type CreateProject = z.infer<typeof CreateProjectSchema>;

export const UpdateProjectSchema = ManagedProjectSchema.partial().omit({ id: true });
export type UpdateProject = z.infer<typeof UpdateProjectSchema>;

// =====================================================================
// XR LINKS
// =====================================================================

export const XRLinkSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  projectName: z.string(),
  token: z.string(),
  url: z.string().url(),
  expiresAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  createdBy: z.string(),
  accessCount: z.number().int().nonnegative(),
  maxAccess: z.number().int().positive(),
  allowedDomains: z.array(z.string()).optional(),
  passwordProtected: z.boolean().default(false),
  passwordHash: z.string().optional(),
});
export type XRLink = z.infer<typeof XRLinkSchema>;

export const CreateXRLinkSchema = z.object({
  projectId: z.string(),
  expiresAt: z.string().datetime(),
  maxAccess: z.number().int().positive().optional(),
  allowedDomains: z.array(z.string()).optional(),
  password: z.string().optional(),
});
export type CreateXRLink = z.infer<typeof CreateXRLinkSchema>;

// =====================================================================
// VIRTUAL TOURS
// =====================================================================

export const TourHotspotSchema = z.object({
  id: z.string(),
  position: z.object({
    yaw: z.number(),
    pitch: z.number(),
  }),
  title: z.string(),
  type: z.string(),
  targetRoomId: z.string().optional(),
  mediaUrl: z.string().optional(),
});
export type TourHotspot = z.infer<typeof TourHotspotSchema>;

export const TourRoomSchema = z.object({
  id: z.string(),
  name: z.string(),
  subtitle: z.string().optional(),
  panoramaUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  initialYaw: z.number().default(0),
  initialPitch: z.number().default(0),
  defaultHotspots: z.array(TourHotspotSchema).default([]),
});
export type TourRoom = z.infer<typeof TourRoomSchema>;

export const TourSchema = z.object({
  id: z.string(),
  name: z.string(),
  projectId: z.string(),
  rooms: z.array(TourRoomSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  status: z.enum(['draft', 'published', 'archived']),
});
export type Tour = z.infer<typeof TourSchema>;

export const CreateTourSchema = TourSchema.omit({ id: true, createdAt: true, updatedAt: true });
export type CreateTour = z.infer<typeof CreateTourSchema>;

export const UpdateTourSchema = CreateTourSchema.partial();
export type UpdateTour = z.infer<typeof UpdateTourSchema>;

// =====================================================================
// CLIENT DISCOVERY
// =====================================================================

export const ClientDiscoverySchema = z.object({
  id: z.string(),
  companyName: z.string(),
  contactName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  projectType: ProjectTypeSchema,
  description: z.string(),
  budgetRange: z.string().optional(),
  timeline: z.string().optional(),
  submittedAt: z.string().datetime(),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'closed']),
});
export type ClientDiscovery = z.infer<typeof ClientDiscoverySchema>;

export const CreateClientDiscoverySchema = ClientDiscoverySchema.omit({ id: true, submittedAt: true, status: true });
export type CreateClientDiscovery = z.infer<typeof CreateClientDiscoverySchema>;

// =====================================================================
// DOCSTUDIO CRM
// =====================================================================

export const DocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  clientName: z.string(),
  assignedTo: z.string().optional(),
  status: z.enum(['draft', 'review', 'approved', 'published']),
  tags: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Document = z.infer<typeof DocumentSchema>;

export const LeadSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  company: z.string(),
  source: z.string(),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']),
  assignedTo: z.string().optional(),
  value: z.number().nonnegative().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Lead = z.infer<typeof LeadSchema>;

export const StudioProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  tagline: z.string(),
  description: z.string(),
  logo: z.string().url().optional(),
  settings: z.record(z.string(), z.unknown()),
});
export type StudioProfile = z.infer<typeof StudioProfileSchema>;

// =====================================================================
// FILE STORAGE
// =====================================================================

export const StorageFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  size: z.number().nonnegative(),
  mimeType: z.string(),
  provider: z.enum(['aws', 'cloudflare', 'google', 'local']),
  bucket: z.string(),
  url: z.string().url().optional(),
  createdAt: z.string().datetime(),
  uploadedBy: z.string(),
});
export type StorageFile = z.infer<typeof StorageFileSchema>;

export const UploadFileSchema = z.object({
  file: z.instanceof(File),
  bucket: z.string(),
  provider: z.enum(['aws', 'cloudflare', 'google', 'local']),
  path: z.string().optional(),
});
export type UploadFile = z.infer<typeof UploadFileSchema>;

// =====================================================================
// API RESPONSE WRAPPERS
// =====================================================================

export const ApiSuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: z.object({
      timestamp: z.string().datetime(),
      requestId: z.string().optional(),
    }).optional(),
  });

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.string(), z.unknown()).optional(),
  }),
  meta: z.object({
    timestamp: z.string().datetime(),
    requestId: z.string().optional(),
  }).optional(),
});

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.union([ApiSuccessSchema(dataSchema), ApiErrorSchema]);

// =====================================================================
// HTTP ERROR CLASSES
// =====================================================================

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string, id: string) {
    super('NOT_FOUND', `${resource} with id ${id} not found`, 404, { resource, id });
  }
}

export class ValidationError extends ApiError {
  constructor(errors: z.ZodError) {
    super('VALIDATION_ERROR', 'Request validation failed', 400, {
      issues: errors.issues.map(i => ({
        path: i.path.join('.'),
        message: i.message,
      })),
    });
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super('FORBIDDEN', message, 403);
  }
}

// =====================================================================
// VALIDATION HELPER
// =====================================================================

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(result.error);
  }
  return result.data;
}

export function validateQuery<T>(schema: z.ZodSchema<T>, searchParams: URLSearchParams): T {
  const data: Record<string, unknown> = {};
  for (const [key, value] of searchParams.entries()) {
    if (data[key]) {
      if (Array.isArray(data[key])) {
        (data[key] as unknown[]).push(value);
      } else {
        data[key] = [data[key], value];
      }
    } else {
      data[key] = value;
    }
  }
  return validate(schema, data);
}