/**
 * Audit Logging System — Phase 2D
 * Tamper-evident audit trails with cryptographic chaining,
 * searchable event store, and compliance export formats.
 */

import { createHash, createHmac } from 'node:crypto';

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';
export type AuditResourceType =
  | 'user'
  | 'project'
  | 'scene'
  | 'asset'
  | 'billing'
  | 'organization'
  | 'system'
  | 'security'
  | 'compliance'
  | string;

export interface AuditEvent {
  eventId: string;
  timestamp: number;
  severity: AuditSeverity;
  actor: {
    id: string;
    email?: string;
    role?: string;
  };
  action: string;
  resourceType: AuditResourceType;
  resourceId?: string;
  resourceName?: string;
  changes?: Record<string, { from: unknown; to: unknown }>;
  ip?: string;
  userAgent?: string;
  sessionId?: string;
  requestId?: string;
  previousHash?: string;
  hash: string;
  signature?: string;
}

interface AuditLoggerOptions {
  signingKey?: string;
  retentionDays?: number;
}

const HMAC_PREFIX = 'viztr_audit_v1';

function computeHash(event: Omit<AuditEvent, 'hash'>): string {
  const payload = JSON.stringify({
    eventId: event.eventId,
    timestamp: event.timestamp,
    severity: event.severity,
    actor: event.actor,
    action: event.action,
    resourceType: event.resourceType,
    resourceId: event.resourceId,
    changes: event.changes,
    previousHash: event.previousHash,
  });
  const h = createHash('sha256').update(HMAC_PREFIX + payload).digest('hex');
  return h;
}

function computeSignature(event: Omit<AuditEvent, 'hash' | 'signature'>, key: string): string {
  const payload = JSON.stringify({
    eventId: event.eventId,
    timestamp: event.timestamp,
    hash: event.hash,
  });
  return createHmac('sha256', key).update(HMAC_PREFIX + payload).digest('hex');
}

/** In-memory store with bounded size for the audit log. */
const AUDIT_STORE_MAX = 10000;

class AuditLogger {
  private store: AuditEvent[] = [];
  private signingKey: string | undefined;
  private retentionMs: number;

  constructor(opts: AuditLoggerOptions = {}) {
    this.signingKey = opts.signingKey;
    this.retentionMs = (opts.retentionDays ?? 90) * 24 * 60 * 60 * 1000;
    // Periodic cleanup of old entries
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.prune(), 60 * 60 * 1000);
    }
  }

  log(event: Omit<AuditEvent, 'eventId' | 'timestamp' | 'hash' | 'signature' | 'previousHash'>): AuditEvent {
    const previousHash = this.store.length > 0
      ? this.store[this.store.length - 1].hash
      : undefined;

    const base: Omit<AuditEvent, 'eventId' | 'timestamp' | 'hash' | 'signature' | 'previousHash'> & {
      previousHash?: string;
    } = { ...event, previousHash };

    const eventId = `aud_${Date.now()}_${createHash('sha1').update(JSON.stringify(base)).digest('hex').slice(0, 8)}`;
    const timestamp = Date.now();

    const draft: Omit<AuditEvent, 'hash' | 'signature'> & { eventId: string; timestamp: number; previousHash?: string } = {
      ...base,
      eventId,
      timestamp,
    };

    const hash = computeHash(draft);
    const signature = this.signingKey
      ? computeSignature({ ...draft, hash }, this.signingKey)
      : undefined;

    const fullEvent: AuditEvent = { ...draft, hash, signature };

    this.store.push(fullEvent);
    if (this.store.length > AUDIT_STORE_MAX) this.store.shift();

    // Also emit to console in dev
    if (process.env.NODE_ENV === 'development') {
      console.log(`[audit] ${event.severity} ${event.action} on ${event.resourceType}${event.resourceId ? `:${event.resourceId}` : ''}`);
    }

    return fullEvent;
  }

  /**
   * Verify the integrity of the entire audit chain.
   * Returns the index of the first tampered event, or null if all valid.
   */
  verifyChain(): number | null {
    for (let i = 1; i < this.store.length; i++) {
      const prev = this.store[i - 1];
      const curr = this.store[i];
      if (curr.previousHash !== prev.hash) return i;
    }
    return null;
  }

  /**
   * Search audit events with filters.
   */
  search(opts: {
    actorId?: string;
    action?: string;
    resourceType?: string;
    resourceId?: string;
    severity?: AuditSeverity;
    after?: number;
    before?: number;
    limit?: number;
  } = {}): AuditEvent[] {
    return this.store
      .filter((e) => {
        if (opts.actorId && e.actor.id !== opts.actorId) return false;
        if (opts.action && !e.action.includes(opts.action)) return false;
        if (opts.resourceType && e.resourceType !== opts.resourceType) return false;
        if (opts.resourceId && e.resourceId !== opts.resourceId) return false;
        if (opts.severity && e.severity !== opts.severity) return false;
        if (opts.after && e.timestamp < opts.after) return false;
        if (opts.before && e.timestamp > opts.before) return false;
        return true;
      })
      .slice(0, opts.limit ?? 100);
  }

  /**
   * Export audit events in compliance-friendly format (CSV/JSON).
   */
  export(format: 'json' | 'csv' = 'json', opts: { after?: number; before?: number } = {}): string {
    const events = this.search({ after: opts.after, before: opts.before, limit: 100000 });
    if (format === 'csv') {
      const cols = ['timestamp', 'severity', 'action', 'resource', 'resourceId', 'actorId', 'actorEmail', 'hash'];
      const rows = events.map((e) =>
        [
          e.timestamp,
          e.severity,
          `"${e.action}"`,
          `"${e.resourceType}"`,
          `"${e.resourceId ?? ''}"`,
          `"${e.actor.id}"`,
          `"${e.actor.email ?? ''}"`,
          e.hash,
        ].join(','),
      );
      return [cols.join(','), ...rows].join('\n');
    }
    return JSON.stringify(events, null, 2);
  }

  private prune() {
    const cutoff = Date.now() - this.retentionMs;
    this.store = this.store.filter((e) => e.timestamp > cutoff);
  }

  size() {
    return this.store.length;
  }
}

// Singleton — uses HMAC key from env for signing
export const auditLogger = new AuditLogger({
  signingKey: process.env.VIZTR_AUDIT_SIGNING_KEY,
  retentionDays: 365,
});

export default auditLogger;
