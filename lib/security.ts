import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { normalizeUserRole, type UserRole } from '@/lib/rbac';

/**
 * Enhanced security types
 */
export interface SecurityContext {
  userId: string;
  email: string;
  role: UserRole;
  clientId?: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  permissions: string[];
  sessionCreatedAt: number;
  lastActivityAt: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  severity: 'info' | 'warning' | 'error' | 'critical';
  userId: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  resource: string;
  action: string;
  outcome: 'success' | 'failure' | 'blocked';
  details: Record<string, unknown>;
  riskScore: number; // 0-100
}

export type AuditEventType = 
  | 'auth.login' 
  | 'auth.logout' 
  | 'auth.failed' 
  | 'auth.session_expired'
  | 'auth.password_change'
  | 'auth.mfa_challenge'
  | 'auth.mfa_success'
  | 'auth.mfa_failed'
  | 'access.granted'
  | 'access.denied'
  | 'access.escalation'
  | 'data.read'
  | 'data.write'
  | 'data.delete'
  | 'data.export'
  | 'admin.user_create'
  | 'admin.user_update'
  | 'admin.user_delete'
  | 'admin.role_change'
  | 'admin.config_change'
  | 'api.rate_limit'
  | 'api.error'
  | 'security.suspicious_activity'
  | 'security.anomaly_detected';

/**
 * In-memory audit log (in production, use dedicated logging service)
 */
const auditLog: AuditLogEntry[] = [];
const MAX_AUDIT_LOG_SIZE = 10000;

/**
 * Session management
 */
const activeSessions = new Map<string, SecurityContext>();
const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Get client IP address
 */
function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  
  if (cfConnectingIp) return cfConnectingIp;
  if (realIp) return realIp;
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.ip || 'unknown';
}

/**
 * Extract user agent
 */
function getUserAgent(req: NextRequest): string {
  return req.headers.get('user-agent') || 'unknown';
}

/**
 * Generate secure session ID
 */
function generateSessionId(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Calculate risk score based on context
 */
function calculateRiskScore(context: Partial<SecurityContext>, eventType: AuditEventType): number {
  let score = 0;
  
  // Base score by event type
  const eventScores: Record<AuditEventType, number> = {
    'auth.login': 10,
    'auth.logout': 5,
    'auth.failed': 40,
    'auth.session_expired': 15,
    'auth.password_change': 30,
    'auth.mfa_challenge': 20,
    'auth.mfa_success': 10,
    'auth.mfa_failed': 50,
    'access.granted': 5,
    'access.denied': 35,
    'access.escalation': 60,
    'data.read': 5,
    'data.write': 15,
    'data.delete': 40,
    'data.export': 50,
    'admin.user_create': 30,
    'admin.user_update': 20,
    'admin.user_delete': 60,
    'admin.role_change': 55,
    'admin.config_change': 45,
    'api.rate_limit': 45,
    'api.error': 25,
    'security.suspicious_activity': 80,
    'security.anomaly_detected': 75,
  };
  
  score += eventScores[eventType] || 10;
  
  // Increase for admin actions
  if (context.role === 'super_admin' && eventType.startsWith('admin.')) {
    score += 10;
  }
  
  // Increase for client role accessing admin resources
  if (context.role === 'client' && eventType.startsWith('admin.')) {
    score += 50;
  }
  
  // Increase for off-hours access (simplified)
  const hour = new Date().getHours();
  if (hour < 6 || hour > 22) {
    score += 10;
  }
  
  return Math.min(100, score);
}

/**
 * Enhanced authentication with security context
 */
export async function requireSecureAuth(
  req: NextRequest,
  allowedRoles?: UserRole[],
  requiredPermissions?: string[]
): Promise<
  | { context: SecurityContext; error?: undefined }
  | { error: NextResponse; context?: undefined }
> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    await logAuditEvent({
      eventType: 'auth.failed',
      severity: 'warning',
      userId: 'unknown',
      sessionId: 'none',
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
      resource: req.nextUrl.pathname,
      action: 'unauthenticated_access',
      outcome: 'blocked',
      details: { reason: 'No session', url: req.url },
      riskScore: 30
    });

    return {
      error: NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  const role = normalizeUserRole((session.user as any)?.role);
  const userId = (session.user as any)?.id || session.user?.email || '';
  const clientId = (session.user as any)?.clientId;
  const sessionId = (session.user as any)?.sessionId || generateSessionId();

  // Check session validity
  const existingSession = activeSessions.get(sessionId);
  const now = Date.now();
  
  if (existingSession) {
    if (now - existingSession.lastActivityAt > INACTIVITY_TIMEOUT_MS) {
      activeSessions.delete(sessionId);
      await logAuditEvent({
        eventType: 'auth.session_expired',
        severity: 'info',
        userId,
        sessionId,
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
        resource: req.nextUrl.pathname,
        action: 'session_expired',
        outcome: 'blocked',
        details: { reason: 'Inactivity timeout' },
        riskScore: 20
      });
    } else {
      existingSession.lastActivityAt = now;
    }
  }

  // Create new session context
  const context: SecurityContext = {
    userId,
    email: session.user?.email || '',
    role,
    clientId,
    sessionId,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
    permissions: (session.user as any)?.permissions || getRolePermissions(role),
    sessionCreatedAt: existingSession?.sessionCreatedAt || now,
    lastActivityAt: now,
  };

  activeSessions.set(sessionId, context);

  // Check role authorization
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    await logAuditEvent({
      eventType: 'access.denied',
      severity: 'warning',
      ...context,
      resource: req.nextUrl.pathname,
      action: 'role_check_failed',
      outcome: 'blocked',
      details: { requiredRoles: allowedRoles, userRole: role },
      riskScore: calculateRiskScore(context, 'access.denied')
    });

    return {
      error: NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      ),
    };
  }

  // Check permissions
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.every(p => context.permissions.includes(p));
    if (!hasPermission) {
      await logAuditEvent({
        eventType: 'access.denied',
        severity: 'warning',
        ...context,
        resource: req.nextUrl.pathname,
        action: 'permission_check_failed',
        outcome: 'blocked',
        details: { requiredPermissions, userPermissions: context.permissions },
        riskScore: calculateRiskScore(context, 'access.denied')
      });

      return {
        error: NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        ),
      };
    }
  }

  // Log successful access
  await logAuditEvent({
    eventType: 'access.granted',
    severity: 'info',
    ...context,
    resource: req.nextUrl.pathname,
    action: req.method.toLowerCase(),
    outcome: 'success',
    details: { method: req.method, url: req.url },
    riskScore: calculateRiskScore(context, 'access.granted')
  });

  return { context };
}

/**
 * Get permissions for a role
 */
function getRolePermissions(role: UserRole): string[] {
  const permissions: Record<UserRole, string[]> = {
    super_admin: [
      'read', 'write', 'delete', 'admin', 'manage_users', 'manage_roles',
      'manage_billing', 'manage_config', 'view_analytics', 'export_data',
      'manage_integrations', 'manage_security', 'view_audit_logs'
    ],
    admin: [
      'read', 'write', 'delete', 'manage_users', 'manage_roles',
      'view_analytics', 'export_data', 'manage_integrations'
    ],
    user: [
      'read', 'write', 'delete', 'view_analytics'
    ],
    client: [
      'read', 'view_own_projects', 'view_own_assets'
    ],
  };
  return permissions[role] || [];
}

/**
 * Log audit event
 */
export async function logAuditEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
  const logEntry: AuditLogEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    ...entry
  };

  auditLog.push(logEntry);

  // Trim log if too large
  if (auditLog.length > MAX_AUDIT_LOG_SIZE) {
    auditLog.splice(0, auditLog.length - MAX_AUDIT_LOG_SIZE);
  }

  // In production, send to logging service (Datadog, Splunk, etc.)
  // await sendToLoggingService(logEntry);

  // Alert on critical events
  if (entry.severity === 'critical' || entry.riskScore >= 80) {
    await triggerSecurityAlert(logEntry);
  }
}

/**
 * Trigger security alert for high-risk events
 */
async function triggerSecurityAlert(entry: AuditLogEntry): Promise<void> {
  // In production: send to alerting system (PagerDuty, Slack, email)
  console.warn('[SECURITY ALERT]', {
    eventType: entry.eventType,
    severity: entry.severity,
    userId: entry.userId,
    ipAddress: entry.ipAddress,
    riskScore: entry.riskScore,
    details: entry.details
  });
}

/**
 * Get audit logs with filtering
 */
export function getAuditLogs(filters?: {
  userId?: string;
  eventType?: AuditEventType;
  severity?: AuditLogEntry['severity'];
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}): AuditLogEntry[] {
  let filtered = [...auditLog].reverse(); // Most recent first

  if (filters?.userId) {
    filtered = filtered.filter(log => log.userId === filters.userId);
  }
  if (filters?.eventType) {
    filtered = filtered.filter(log => log.eventType === filters.eventType);
  }
  if (filters?.severity) {
    filtered = filtered.filter(log => log.severity === filters.severity);
  }
  if (filters?.startDate) {
    filtered = filtered.filter(log => log.timestamp >= filters.startDate!);
  }
  if (filters?.endDate) {
    filtered = filtered.filter(log => log.timestamp <= filters.endDate!);
  }

  const offset = filters?.offset || 0;
  const limit = filters?.limit || 100;

  return filtered.slice(offset, offset + limit);
}

/**
 * Get session statistics
 */
export function getSessionStats() {
  const now = Date.now();
  const sessions = Array.from(activeSessions.values());
  
  return {
    totalActive: sessions.length,
    byRole: sessions.reduce((acc, s) => {
      acc[s.role] = (acc[s.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    avgSessionAge: sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + (now - s.sessionCreatedAt), 0) / sessions.length 
      : 0,
    avgInactivity: sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (now - s.lastActivityAt), 0) / sessions.length
      : 0,
    expiredSessions: sessions.filter(s => now - s.lastActivityAt > INACTIVITY_TIMEOUT_MS).length
  };
}

/**
 * Invalidate session
 */
export function invalidateSession(sessionId: string): boolean {
  return activeSessions.delete(sessionId);
}

/**
 * Invalidate all sessions for a user
 */
export function invalidateUserSessions(userId: string): number {
  let count = 0;
  for (const [sessionId, context] of activeSessions.entries()) {
    if (context.userId === userId) {
      activeSessions.delete(sessionId);
      count++;
    }
  }
  return count;
}

/**
 * Check if IP is suspicious (simple rate-based)
 */
const ipRequestCounts = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = ipRequestCounts.get(ip);

  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW) {
    ipRequestCounts.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetAt: now + RATE_LIMIT_WINDOW };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetAt: record.windowStart + RATE_LIMIT_WINDOW };
  }

  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count, resetAt: record.windowStart + RATE_LIMIT_WINDOW };
}

/**
 * Detect suspicious patterns
 */
export function detectAnomalies(context: SecurityContext): string[] {
  const anomalies: string[] = [];
  const now = Date.now();

  // Check for rapid requests
  const rateLimit = checkRateLimit(context.ipAddress);
  if (!rateLimit.allowed) {
    anomalies.push('rate_limit_exceeded');
  }

  // Check for unusual hour access
  const hour = new Date().getHours();
  if (hour < 6 || hour > 22) {
    anomalies.push('off_hours_access');
  }

  // Check for new IP
  const userSessions = Array.from(activeSessions.values()).filter(s => s.userId === context.userId);
  const knownIps = new Set(userSessions.map(s => s.ipAddress));
  if (!knownIps.has(context.ipAddress) && userSessions.length > 0) {
    anomalies.push('new_ip_address');
  }

  // Check for role escalation attempt
  if (context.role === 'client' || context.role === 'user') {
    // This would be checked at the API level
  }

  return anomalies;
}

export const securityModule = {
  requireSecureAuth,
  logAuditEvent,
  getAuditLogs,
  getSessionStats,
  invalidateSession,
  invalidateUserSessions,
  checkRateLimit,
  detectAnomalies,
  activeSessions,
  auditLog
};

export default securityModule;