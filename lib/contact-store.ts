/**
 * Shared in-memory contact store
 * Used by /api/contact routes for demo/development purposes.
 */

import type { ContactSubmission, CreateContact, ContactStats, ContactFilters, PaginationParams, PaginatedResult } from '@/lib/super-admin-store-types';

export interface ContactStore {
  submissions: ContactSubmission[];
}

let submissions: ContactSubmission[] = [
  {
    id: 'CONT-2026-001',
    name: 'Sarah Chen',
    email: 'sarah.chen@fosterpartners.com',
    phone: '+1 555 0101',
    company: 'Foster & Partners',
    service_interest: 'Virtual Reality',
    message: 'Interested in VR project presentations for upcoming tower launch.',
    status: 'new',
    created_at: '2026-09-10T08:30:00Z',
    updated_at: '2026-09-10T08:30:00Z',
  },
  {
    id: 'CONT-2026-002',
    name: 'Marcus Rivera',
    email: 'marcus@buildwise.io',
    phone: '+1 555 0102',
    company: 'BuildWise',
    service_interest: 'Architectural',
    message: 'Need 8K exterior visualization package for waterfront development.',
    status: 'read',
    created_at: '2026-09-11T14:20:00Z',
    updated_at: '2026-09-12T09:15:00Z',
  },
];

export function getContactStore() {
  return { submissions };
}

export function setContactStore(next: ContactSubmission[]) {
  submissions = next;
}

export function applyContactFilters(list: ContactSubmission[], filters?: ContactFilters): ContactSubmission[] {
  if (!filters) return list;
  return list.filter((c) => {
    if (filters.search) {
      const s = filters.search.toLowerCase();
      if (
        !c.name.toLowerCase().includes(s) &&
        !c.email.toLowerCase().includes(s) &&
        !(c.company && c.company.toLowerCase().includes(s)) &&
        !(c.message && c.message.toLowerCase().includes(s))
      ) {
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

export function paginateContacts(list: ContactSubmission[], pagination?: PaginationParams): PaginatedResult<ContactSubmission> {
  const page = pagination?.page || 1;
  const pageSize = pagination?.pageSize || 20;
  const start = (page - 1) * pageSize;
  return {
    data: list.slice(start, start + pageSize),
    total: list.length,
    page,
    pageSize,
    totalPages: Math.ceil(list.length / pageSize),
  };
}

export function computeContactStats(items: ContactSubmission[]): ContactStats {
  const byStatus: Record<string, number> = {};
  const byServiceInterest: Record<string, number> = {};
  for (const c of items) {
    byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    if (c.service_interest) {
      byServiceInterest[c.service_interest] = (byServiceInterest[c.service_interest] || 0) + 1;
    }
  }
  return {
    total: items.length,
    by_status: byStatus as any,
    by_service_interest: byServiceInterest as any,
  };
}
