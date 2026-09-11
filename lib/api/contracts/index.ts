/**
 * Admin API Contracts - Main Export
 * 
 * Re-exports all schemas, client, and validation helpers.
 */

export * from './schemas';
export * from './client';

// Re-export commonly used types for convenience
export type {
  AdminUser,
  CreateAdminUser,
  UpdateAdminUser,
  UserFilters,
  PaginationParams,
  PaginatedResponse,
  GpuNode,
  UpdateGpuNode,
  GpuFilters,
  GpuClusterStats,
  FeatureToggle,
  UpdateFeatureToggle,
  SystemHealthLog,
  CreateSystemLog,
  LogFilters,
  LogStats,
  RevenueMetric,
  RevenueSummary,
  ManagedProject,
  CreateProject,
  UpdateProject,
  XRLink,
  CreateXRLink,
  Tour,
  CreateTour,
  UpdateTour,
  ClientDiscovery,
  CreateClientDiscovery,
  Document,
  Lead,
  StudioProfile,
  StorageFile,
  UserRole,
  UserStatus,
  ProjectType,
  ProjectStatus,
  PaymentStatus,
  GpuNodeStatus,
  FeatureToggleCategory,
  FeatureToggleEnvironment,
  LogLevel,
} from './schemas';

export {
  validate,
  validateQuery,
  ApiError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
} from './schemas';

export { adminApi, usersApi, gpuApi, featuresApi, logsApi, revenueApi, projectsApi, xrLinksApi, toursApi, discoveryApi, docStudioApi, storageApi, aiApi, pixelStreamingApi } from './client';