import './openapi-setup.ts';

import { OpenAPIRegistry, OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import {
  // Users
  AdminUserSchema,
  CreateAdminUserSchema,
  UpdateAdminUserSchema,
  UserFiltersSchema,
  PaginationParamsSchema,
  UserStatsSchema,
  // GPU
  GpuNodeSchema,
  UpdateGpuNodeSchema,
  GpuFiltersSchema,
  GpuClusterStatsSchema,
  // Features
  FeatureToggleSchema,
  UpdateFeatureToggleSchema,
  FeatureToggleCategorySchema,
  FeatureToggleEnvironmentSchema,
  // Logs
  SystemHealthLogSchema,
  CreateSystemLogSchema,
  LogFiltersSchema,
  LogStatsSchema,
  // Revenue
  RevenueMetricSchema,
  RevenueSummarySchema,
  // Projects
  ManagedProjectSchema,
  CreateProjectSchema,
  UpdateProjectSchema,
  ProjectTypeSchema,
  ProjectStatusSchema,
  PaymentStatusSchema,
  TimesheetEntrySchema,
  HoursMonitoringSchema,
  // XR Links
  XRLinkSchema,
  CreateXRLinkSchema,
  // Tours
  TourSchema,
  CreateTourSchema,
  UpdateTourSchema,
  TourHotspotSchema,
  TourRoomSchema,
  // Client Discovery
  ClientDiscoverySchema,
  CreateClientDiscoverySchema,
  // DocStudio
  DocumentSchema,
  LeadSchema,
  StudioProfileSchema,
  // Storage
  StorageFileSchema,
  UploadFileSchema,
  // Bookings
  BookingSchema,
  BookingFiltersSchema,
  BookingStatsSchema,
  // Contact
  ContactSubmissionSchema,
  ContactFiltersSchema,
  ContactStatsSchema,
  // Base types
  UserRoleSchema,
  UserStatusSchema,
  GpuNodeStatusSchema,
  LogLevelSchema,
} from '@/lib/api/contracts/schemas';

const registry = new OpenAPIRegistry();

// Register component schemas
const AdminUser = registry.register('AdminUser', AdminUserSchema);
const CreateAdminUser = registry.register('CreateAdminUser', CreateAdminUserSchema);
const UpdateAdminUser = registry.register('UpdateAdminUser', UpdateAdminUserSchema);
const GpuNode = registry.register('GpuNode', GpuNodeSchema);
const UpdateGpuNode = registry.register('UpdateGpuNode', UpdateGpuNodeSchema);
const FeatureToggle = registry.register('FeatureToggle', FeatureToggleSchema);
const UpdateFeatureToggle = registry.register('UpdateFeatureToggle', UpdateFeatureToggleSchema);
const SystemHealthLog = registry.register('SystemHealthLog', SystemHealthLogSchema);
const CreateSystemLog = registry.register('CreateSystemLog', CreateSystemLogSchema);
const RevenueMetric = registry.register('RevenueMetric', RevenueMetricSchema);
const RevenueSummary = registry.register('RevenueSummary', RevenueSummarySchema);
const ManagedProject = registry.register('ManagedProject', ManagedProjectSchema);
const CreateProject = registry.register('CreateProject', CreateProjectSchema);
const UpdateProject = registry.register('UpdateProject', UpdateProjectSchema);
const XRLink = registry.register('XRLink', XRLinkSchema);
const CreateXRLink = registry.register('CreateXRLink', CreateXRLinkSchema);
const Tour = registry.register('Tour', TourSchema);
const CreateTour = registry.register('CreateTour', CreateTourSchema);
const UpdateTour = registry.register('UpdateTour', UpdateTourSchema);
const Booking = registry.register('Booking', BookingSchema);
const BookingFilters = registry.register('BookingFilters', BookingFiltersSchema);
const BookingStats = registry.register('BookingStats', BookingStatsSchema);
const ContactSubmission = registry.register('ContactSubmission', ContactSubmissionSchema);
const ContactFilters = registry.register('ContactFilters', ContactFiltersSchema);
const ContactStats = registry.register('ContactStats', ContactStatsSchema);

// =====================================================================
// REGISTER PATHS
// =====================================================================

// Users
registry.registerPath({
  method: 'get',
  path: '/api/admin/users',
  summary: 'List users',
  description: 'Get paginated list of admin users with filtering',
  request: {
    query: UserFiltersSchema.merge(PaginationParamsSchema).optional().openapi({ param: { in: 'query', name: 'UserFilters' } }),
  },
  responses: {
    200: {
      description: 'Paginated list of users',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.array(AdminUserSchema),
            meta: z.object({
              timestamp: z.string(),
              requestId: z.string().optional(),
            }).optional(),
          }),
        },
      },
    },
    400: { description: 'Bad request' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/admin/users',
  summary: 'Create user',
  description: 'Create a new admin user (super_admin required for admin roles)',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateAdminUserSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'User created',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: AdminUserSchema,
            meta: z.object({
              timestamp: z.string(),
              requestId: z.string().optional(),
            }).optional(),
          }),
        },
      },
    },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    409: { description: 'Email already exists' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/admin/users/{id}',
  summary: 'Get user by ID',
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      description: 'User found',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: AdminUserSchema,
            meta: z.object({
              timestamp: z.string(),
              requestId: z.string().optional(),
            }).optional(),
          }),
        },
      },
    },
    404: { description: 'User not found' },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/admin/users/{id}',
  summary: 'Update user',
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: UpdateAdminUserSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'User updated',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: AdminUserSchema,
            meta: z.object({
              timestamp: z.string(),
              requestId: z.string().optional(),
            }).optional(),
          }),
        },
      },
    },
    404: { description: 'User not found' },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/admin/users/{id}',
  summary: 'Delete user',
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    204: { description: 'User deleted' },
    404: { description: 'User not found' },
  },
});

// GPU Nodes
registry.registerPath({
  method: 'get',
  path: '/api/admin/gpu',
  summary: 'List GPU nodes',
  request: {
    query: GpuFiltersSchema.optional().openapi({ param: { in: 'query', name: 'GpuFilters' } }),
  },
  responses: {
    200: {
      description: 'GPU nodes list',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.array(GpuNodeSchema),
            meta: z.object({
              timestamp: z.string(),
              requestId: z.string().optional(),
            }).optional(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/admin/gpu',
  summary: 'Create GPU node',
  request: {
    body: {
      content: {
        'application/json': {
          schema: GpuNodeSchema.omit({ id: true, createdAt: true, updatedAt: true }),
        },
      },
    },
  },
  responses: {
    201: { description: 'GPU node created' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/admin/gpu/{id}',
  summary: 'Get GPU node',
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: { 200: { description: 'GPU node found' } },
});

registry.registerPath({
  method: 'patch',
  path: '/api/admin/gpu/{id}',
  summary: 'Update GPU node',
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: UpdateGpuNodeSchema,
        },
      },
    },
  },
  responses: { 200: { description: 'GPU node updated' } },
});

registry.registerPath({
  method: 'delete',
  path: '/api/admin/gpu/{id}',
  summary: 'Delete GPU node',
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: { 204: { description: 'GPU node deleted' } },
});

registry.registerPath({
  method: 'post',
  path: '/api/admin/gpu/{id}/maintenance',
  summary: 'Toggle maintenance mode',
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: { 200: { description: 'Maintenance toggled' } },
});

registry.registerPath({
  method: 'get',
  path: '/api/admin/gpu/stats',
  summary: 'Get cluster stats',
  responses: {
    200: {
      description: 'Cluster stats',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: GpuClusterStatsSchema,
            meta: z.object({
              timestamp: z.string(),
              requestId: z.string().optional(),
            }).optional(),
          }),
        },
      },
    },
  },
});

// Feature Toggles
registry.registerPath({
  method: 'get',
  path: '/api/admin/features',
  summary: 'List feature toggles',
  request: {
    query: z.object({ category: FeatureToggleCategorySchema.optional() }).optional().openapi({ param: { in: 'query', name: 'FeatureToggleQuery' } }),
  },
  responses: {
    200: {
      description: 'Feature toggles list',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.array(FeatureToggleSchema),
            meta: z.object({
              timestamp: z.string(),
              requestId: z.string().optional(),
            }).optional(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/admin/features',
  summary: 'Create feature toggle',
  request: {
    body: {
      content: {
        'application/json': {
          schema: FeatureToggleSchema.omit({ id: true, lastModifiedBy: true, lastModifiedAt: true, createdAt: true }),
        },
      },
    },
  },
  responses: { 201: { description: 'Feature toggle created' } },
});

registry.registerPath({
  method: 'get',
  path: '/api/admin/features/{key}',
  summary: 'Get feature toggle',
  request: {
    params: z.object({ key: z.string() }),
  },
  responses: { 200: { description: 'Feature toggle found' } },
});

registry.registerPath({
  method: 'patch',
  path: '/api/admin/features/{key}',
  summary: 'Update feature toggle',
  request: {
    params: z.object({ key: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: UpdateFeatureToggleSchema,
        },
      },
    },
  },
  responses: { 200: { description: 'Feature toggle updated' } },
});

registry.registerPath({
  method: 'post',
  path: '/api/admin/features/{key}/toggle',
  summary: 'Toggle feature',
  request: {
    params: z.object({ key: z.string() }),
  },
  responses: { 200: { description: 'Feature toggled' } },
});

registry.registerPath({
  method: 'delete',
  path: '/api/admin/features/{key}',
  summary: 'Delete feature toggle',
  request: {
    params: z.object({ key: z.string() }),
  },
  responses: { 204: { description: 'Feature toggle deleted' } },
});

// System Logs
registry.registerPath({
  method: 'get',
  path: '/api/admin/logs',
  summary: 'List system logs',
  request: {
    query: LogFiltersSchema.merge(PaginationParamsSchema).optional().openapi({ param: { in: 'query', name: 'LogFilters' } }),
  },
  responses: {
    200: {
      description: 'Paginated logs',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.array(SystemHealthLogSchema),
            meta: z.object({
              timestamp: z.string(),
              requestId: z.string().optional(),
            }).optional(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/admin/logs',
  summary: 'Add system log',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateSystemLogSchema,
        },
      },
    },
  },
  responses: { 201: { description: 'Log created' } },
});

registry.registerPath({
  method: 'delete',
  path: '/api/admin/logs',
  summary: 'Clear all logs',
  responses: { 204: { description: 'Logs cleared' } },
});

// Revenue
registry.registerPath({
  method: 'get',
  path: '/api/admin/revenue',
  summary: 'Get revenue metrics',
  request: {
    query: z.object({ period: z.enum(['monthly', 'quarterly', 'yearly']).optional() }).optional().openapi({ param: { in: 'query', name: 'RevenueQuery' } }),
  },
  responses: {
    200: {
      description: 'Revenue metrics',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.object({
              monthly: z.array(RevenueMetricSchema),
              summary: RevenueSummarySchema,
            }),
            meta: z.object({
              timestamp: z.string(),
              requestId: z.string().optional(),
            }).optional(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/admin/revenue/refresh',
  summary: 'Refresh revenue materialized view',
  responses: { 200: { description: 'Revenue refreshed' } },
});

// Projects
registry.registerPath({
  method: 'get',
  path: '/api/admin/projects',
  summary: 'List projects',
  request: {
    query: z.object({
      search: z.string().optional(),
      status: ProjectStatusSchema.optional(),
      projectType: ProjectTypeSchema.optional(),
      paymentStatus: PaymentStatusSchema.optional(),
    }).merge(PaginationParamsSchema).optional().openapi({ param: { in: 'query', name: 'ProjectFilters' } }),
  },
  responses: {
    200: {
      description: 'Paginated projects',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.array(ManagedProjectSchema),
            meta: z.object({
              timestamp: z.string(),
              requestId: z.string().optional(),
            }).optional(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/admin/projects',
  summary: 'Create project',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateProjectSchema,
        },
      },
    },
  },
  responses: { 201: { description: 'Project created' } },
});

registry.registerPath({
  method: 'get',
  path: '/api/admin/projects/{id}',
  summary: 'Get project',
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: { 200: { description: 'Project found' } },
});

registry.registerPath({
  method: 'patch',
  path: '/api/admin/projects/{id}',
  summary: 'Update project',
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: UpdateProjectSchema,
        },
      },
    },
  },
  responses: { 200: { description: 'Project updated' } },
});

registry.registerPath({
  method: 'delete',
  path: '/api/admin/projects/{id}',
  summary: 'Delete project',
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: { 204: { description: 'Project deleted' } },
});

registry.registerPath({
  method: 'post',
  path: '/api/admin/projects/{id}/hours',
  summary: 'Log hours for project',
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            date: z.string().datetime(),
            hours: z.number().positive(),
            description: z.string().min(1),
            billable: z.boolean(),
          }),
        },
      },
    },
  },
  responses: { 200: { description: 'Hours logged' } },
});

// XR Links
registry.registerPath({
  method: 'get',
  path: '/api/admin/xr-links',
  summary: 'List XR links',
  request: {
    query: z.object({ projectId: z.string().optional() }).optional().openapi({ param: { in: 'query', name: 'XRLinkQuery' } }),
  },
  responses: {
    200: {
      description: 'XR links list',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.array(XRLinkSchema),
            meta: z.object({
              timestamp: z.string(),
              requestId: z.string().optional(),
            }).optional(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/admin/xr-links',
  summary: 'Create XR link',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateXRLinkSchema,
        },
      },
    },
  },
  responses: { 201: { description: 'XR link created' } },
});

// Tours
registry.registerPath({
  method: 'get',
  path: '/api/admin/tours',
  summary: 'List tours',
  request: {
    query: z.object({
      projectId: z.string().optional(),
      status: z.enum(['draft', 'published', 'archived']).optional(),
    }).optional().openapi({ param: { in: 'query', name: 'TourFilters' } }),
  },
  responses: {
    200: {
      description: 'Tours list',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.array(TourSchema),
            meta: z.object({
              timestamp: z.string(),
              requestId: z.string().optional(),
            }).optional(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/admin/tours',
  summary: 'Create tour',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateTourSchema,
        },
      },
    },
  },
  responses: { 201: { description: 'Tour created' } },
});

registry.registerPath({
  method: 'get',
  path: '/api/admin/tours/{id}',
  summary: 'Get tour',
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: { 200: { description: 'Tour found' } },
});

registry.registerPath({
  method: 'patch',
  path: '/api/admin/tours/{id}',
  summary: 'Update tour',
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: UpdateTourSchema,
        },
      },
    },
  },
  responses: { 200: { description: 'Tour updated' } },
});

registry.registerPath({
  method: 'delete',
  path: '/api/admin/tours/{id}',
  summary: 'Delete tour',
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: { 204: { description: 'Tour deleted' } },
});

// Bookings
registry.registerPath({
  method: 'get',
  path: '/api/admin/bookings',
  summary: 'List bookings',
  request: {
    query: BookingFiltersSchema.merge(PaginationParamsSchema).optional().openapi({ param: { in: 'query', name: 'BookingFilters' } }),
  },
  responses: {
    200: {
      description: 'Paginated bookings',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.array(BookingSchema),
            total: z.number(),
            page: z.number(),
            pageSize: z.number(),
            totalPages: z.number(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/admin/bookings',
  summary: 'Create booking',
  request: {
    body: {
      content: {
        'application/json': {
          schema: BookingSchema.omit({ id: true, created_at: true, updated_at: true }),
        },
      },
    },
  },
  responses: { 201: { description: 'Booking created' } },
});

registry.registerPath({
  method: 'post',
  path: '/api/admin/bookings/{id}/approve',
  summary: 'Approve booking',
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: z.object({ admin_notes: z.string().optional() }),
        },
      },
    },
  },
  responses: { 200: { description: 'Booking approved' } },
});

registry.registerPath({
  method: 'post',
  path: '/api/admin/bookings/{id}/reject',
  summary: 'Reject booking',
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: z.object({ rejection_reason: z.string(), admin_notes: z.string().optional() }),
        },
      },
    },
  },
  responses: { 200: { description: 'Booking rejected' } },
});

// Contact
registry.registerPath({
  method: 'get',
  path: '/api/contact',
  summary: 'List contact submissions',
  request: {
    query: ContactFiltersSchema.merge(PaginationParamsSchema).optional().openapi({ param: { in: 'query', name: 'ContactFilters' } }),
  },
  responses: {
    200: {
      description: 'Paginated contact submissions',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.array(ContactSubmissionSchema),
            total: z.number(),
            page: z.number(),
            pageSize: z.number(),
            totalPages: z.number(),
            stats: ContactStatsSchema,
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/contact',
  summary: 'Submit contact form',
  request: {
    body: {
      content: {
        'application/json': {
          schema: ContactSubmissionSchema.omit({ id: true, status: true, created_at: true, updated_at: true }),
        },
      },
    },
  },
  responses: { 201: { description: 'Contact submitted' } },
});

// Comments
registry.registerPath({
  method: 'get',
  path: '/api/projects/{id}/comments',
  summary: 'List project comments',
  request: {
    params: z.object({ id: z.string() }),
    query: z.object({
      status: z.string().optional().openapi({ param: { in: 'query', name: 'status' } }),
      authorId: z.string().optional().openapi({ param: { in: 'query', name: 'authorId' } }),
      deliverableId: z.string().optional().openapi({ param: { in: 'query', name: 'deliverableId' } }),
      search: z.string().optional().openapi({ param: { in: 'query', name: 'search' } }),
    }),
  },
  responses: {
    200: {
      description: 'Comment tree',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.array(z.any()),
            total: z.number(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/projects/{id}/comments',
  summary: 'Create comment',
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            deliverableId: z.string().optional(),
            parentId: z.string().optional(),
            content: z.string().min(1).max(2000),
            mentions: z.array(z.string()).optional(),
            attachments: z.array(z.string()).optional(),
          }),
        },
      },
    },
  },
  responses: { 201: { description: 'Comment created' } },
});

// =====================================================================
// GENERATE SPEC
// =====================================================================

const generator = new OpenApiGeneratorV31(registry.definitions);
const openApiSpec = generator.generateDocument({
  openapi: '3.1.0',
  info: {
    title: 'VizTR Super Admin API',
    version: '1.0.0',
    description: 'Super Admin Dashboard API for VizTR Architecture Visualization Platform',
    contact: {
      name: 'VizTR Team',
      email: 'api@viztr.studio',
    },
  },
  servers: [
    {
      url: 'https://api.viztr.studio',
      description: 'Production server',
    },
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    { bearerAuth: [] },
  ],
});

console.log(JSON.stringify(openApiSpec, null, 2));