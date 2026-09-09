import {
  listClientsSupabase,
  isSupabaseAdminReady,
} from '@/lib/supabase/repositories';
import type { ClientRecord } from '@/app/api/clients/route';

export type ClientDirectoryRecord = ClientRecord;

export interface ClientDirectoryQuery {
  tier?: string;
  query?: string;
  accessCode?: string;
  id?: string;
  email?: string;
}

export let CLIENTS_DB: ClientRecord[] = [
  {
    id: 'cli_01',
    name: 'Alexander Sterling',
    firmName: 'Foster + Partners London',
    email: 'a.sterling@fosterpartners.com',
    phone: '+44 20 7738 0455',
    tier: 'Enterprise VIP',
    activeProjects: 3,
    totalSpend: '$420,000',
    status: 'Active',
    portalAccessCode: 'FST-2025-VTR',
    assignedDirector: 'Marcus Vance',
    joinedDate: '2024-03-15',
    notes: 'Primary focus on supertall tower architectural visualization and Unreal 5.4 Lumen interactive exhibitions.',
    logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100',
  },
  {
    id: 'cli_02',
    name: 'Helena Berg',
    firmName: 'Snøhetta Oslo',
    email: 'h.berg@snohetta.no',
    phone: '+47 24 15 60 00',
    tier: 'Retainer Partner',
    activeProjects: 2,
    totalSpend: '$290,000',
    status: 'Active',
    portalAccessCode: 'SNH-2025-VTR',
    assignedDirector: 'Sarah Lin',
    joinedDate: '2024-06-20',
    notes: 'Specializing in arctic and coastal biophilic structures with real-time daylight climate simulation.',
    logoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=100',
  },
  {
    id: 'cli_03',
    name: 'Kenji Takahashi',
    firmName: 'Kengo Kuma & Associates',
    email: 'k.takahashi@kkaa.co.jp',
    phone: '+81 3 5774 7722',
    tier: 'Enterprise VIP',
    activeProjects: 1,
    totalSpend: '$180,000',
    status: 'Active',
    portalAccessCode: 'KMA-2025-VTR',
    assignedDirector: 'David Kalu',
    joinedDate: '2024-09-05',
    notes: 'Parametric cedar and bamboo pavilion studies with WebXR spatial viewing for museum stakeholders.',
    logoUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=100',
  },
];

export async function listClientDirectory(
  q: ClientDirectoryQuery = {},
): Promise<ClientRecord[]> {
  if (isSupabaseAdminReady()) {
    const fromDb = await listClientsSupabase({
      tier: q.tier,
      query: q.query,
      accessCode: q.accessCode,
      id: q.id,
    });
    if (fromDb !== null) return fromDb;
  }

  let filtered = [...CLIENTS_DB];
  if (q.tier && q.tier !== 'ALL') filtered = filtered.filter((c) => c.tier === q.tier);
  if (q.email) {
    const needle = q.email.toLowerCase().trim();
    filtered = filtered.filter((c) => c.email.toLowerCase() === needle);
  }
  if (q.query) {
    const term = q.query.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.firmName.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.portalAccessCode.toLowerCase().includes(term),
    );
  }
  if (q.accessCode) {
    const code = q.accessCode.toUpperCase();
    filtered = filtered.filter((c) => c.portalAccessCode.toUpperCase() === code);
  }
  if (q.id) filtered = filtered.filter((c) => c.id === q.id);
  return filtered;
}

export function toPublicClient(
  c: ClientRecord,
): Omit<ClientRecord, 'portalAccessCode' | 'notes' | 'totalSpend'> {
  const { portalAccessCode: _p, notes: _n, totalSpend: _t, ...rest } = c;
  return rest;
}