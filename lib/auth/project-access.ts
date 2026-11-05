import { getServiceClient } from '@/lib/services/client';
import { type UserRole } from '@/lib/rbac';

/**
 * Central project access authorization.
 *
 * Every project-scoped API route must call verifyProjectAccess() before
 * performing any database operation. This prevents IDOR attacks where
 * an authenticated user supplies another user's project/experience/resource IDs.
 *
 * Authorization chain:
 *   user → project ownership or membership → resource access
 *
 * Usage:
 *   const access = await verifyProjectAccess(userId, projectId);
 *   if (!access.allowed) return forbidden(access.reason);
 */

export interface ProjectAccessResult {
  allowed: boolean;
  reason?: string;
  projectId?: string;
  project?: any;
}

/**
 * Verify that a user has access to a project.
 * Checks: ownership (projects.owner_id) OR membership (project_members).
 */
export async function verifyProjectAccess(
  userId: string,
  projectId: string,
  role?: UserRole
): Promise<ProjectAccessResult> {
  if (!userId || !projectId) {
    return { allowed: false, reason: 'Missing userId or projectId' };
  }

  const svc = getServiceClient();
  if (!svc) {
    return { allowed: false, reason: 'Database not configured' };
  }

  // Super admins bypass project-level checks
  if (role === 'super_admin') {
    const { data: project } = await svc.from('projects').select('*').eq('id', projectId).maybeSingle();
    return { allowed: true, projectId, project };
  }

  // Check 1: User owns the project
  const { data: project, error: projectError } = await svc
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .maybeSingle();

  if (projectError || !project) {
    return { allowed: false, reason: 'Project not found' };
  }

  if (project.owner_id === userId) {
    return { allowed: true, projectId, project };
  }

  // Check 2: User is a project member
  const { data: membership } = await svc
    .from('project_members')
    .select('id, role, status')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  if (membership) {
    return { allowed: true, projectId, project };
  }

  // Check 3: Admins can access any project (within their org scope)
  if (role === 'admin') {
    return { allowed: true, projectId, project };
  }

  return { allowed: false, reason: 'User does not have access to this project' };
}

/**
 * Verify that a user has access to an experience via its parent project.
 */
export async function verifyExperienceAccess(
  userId: string,
  experienceId: string,
  role?: UserRole
): Promise<ProjectAccessResult & { experience?: any }> {
  if (!userId || !experienceId) {
    return { allowed: false, reason: 'Missing userId or experienceId' };
  }

  const svc = getServiceClient();
  if (!svc) {
    return { allowed: false, reason: 'Database not configured' };
  }

  // Super admins bypass
  if (role === 'super_admin') {
    const { data: experience } = await svc.from('experiences').select('*, projects!inner(*)').eq('id', experienceId).maybeSingle();
    return { allowed: true, experience, project: experience?.projects };
  }

  // Fetch experience with its parent project
  const { data: experience, error } = await svc
    .from('experiences')
    .select('id, project_id, projects!inner(id, owner_id)')
    .eq('id', experienceId)
    .maybeSingle();

  if (error || !experience) {
    return { allowed: false, reason: 'Experience not found' };
  }

  const projectId = experience.project_id;
  const project = (experience as any).projects;

  // Check ownership
  if (project?.owner_id === userId) {
    return { allowed: true, projectId, project, experience };
  }

  // Check membership
  const { data: membership } = await svc
    .from('project_members')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  if (membership) {
    return { allowed: true, projectId, project, experience };
  }

  // Admins
  if (role === 'admin') {
    return { allowed: true, projectId, project, experience };
  }

  return { allowed: false, reason: 'User does not have access to this experience' };
}

/**
 * Verify that a specific resource (asset, deliverable, config, member)
 * belongs to a project the user has access to.
 *
 * @param resourceTable - The table to query (e.g., 'assets', 'deliverables')
 * @param resourceId - The resource ID
 * @param projectField - The foreign key column in the resource table (default: 'project_id')
 */
export async function verifyResourceAccess(
  userId: string,
  resourceTable: string,
  resourceId: string,
  projectField: string = 'project_id',
  role?: UserRole
): Promise<ProjectAccessResult & { resource?: any }> {
  if (!userId || !resourceId) {
    return { allowed: false, reason: 'Missing userId or resourceId' };
  }

  const svc = getServiceClient();
  if (!svc) {
    return { allowed: false, reason: 'Database not configured' };
  }

  // Super admins bypass
  if (role === 'super_admin') {
    const { data: resource } = await svc.from(resourceTable).select('*').eq('id', resourceId).maybeSingle();
    return { allowed: true, resource };
  }

  // Fetch the resource to get its project_id
  const { data: resource, error } = await svc
    .from(resourceTable)
    .select(`id, ${projectField}`)
    .eq('id', resourceId)
    .maybeSingle();

  if (error || !resource) {
    return { allowed: false, reason: 'Resource not found' };
  }

  const projectId = (resource as any)[projectField];
  if (!projectId) {
    return { allowed: false, reason: 'Resource has no project association' };
  }

  // Delegate to project access check
  const access = await verifyProjectAccess(userId, projectId, role);
  return { ...access, resource };
}

/**
 * Verify that a user can access an experience config via its parent experience.
 */
export async function verifyConfigAccess(
  userId: string,
  configId: string,
  role?: UserRole
): Promise<ProjectAccessResult & { config?: any }> {
  if (!userId || !configId) {
    return { allowed: false, reason: 'Missing userId or configId' };
  }

  const svc = getServiceClient();
  if (!svc) {
    return { allowed: false, reason: 'Database not configured' };
  }

  // Super admins bypass
  if (role === 'super_admin') {
    const { data: config } = await svc.from('experience_configs').select('*').eq('id', configId).maybeSingle();
    return { allowed: true, config };
  }

  // Fetch config to get experience_id
  const { data: config, error } = await svc
    .from('experience_configs')
    .select('id, experience_id')
    .eq('id', configId)
    .maybeSingle();

  if (error || !config) {
    return { allowed: false, reason: 'Config not found' };
  }

  // Delegate to experience access check
  const access = await verifyExperienceAccess(userId, (config as any).experience_id, role);
  return { ...access, config };
}
