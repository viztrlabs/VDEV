import { NextRequest, NextResponse } from 'next/server';

export interface ClientRecord {
  id: string;
  name: string;
  firmName: string;
  email: string;
  phone: string;
  tier: 'Enterprise VIP' | 'Standard Studio' | 'Retainer Partner';
  activeProjects: number;
  totalSpend: string;
  status: 'Active' | 'Pending Review' | 'Archived';
  portalAccessCode: string;
  assignedDirector: string;
  joinedDate: string;
  notes: string;
  logoUrl?: string;
}

let CLIENTS_DB: ClientRecord[] = [
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tier = searchParams.get('tier');
  const query = searchParams.get('q')?.toLowerCase();

  let filtered = [...CLIENTS_DB];
  if (tier && tier !== 'ALL') {
    filtered = filtered.filter((c) => c.tier === tier);
  }
  if (query) {
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.firmName.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.portalAccessCode.toLowerCase().includes(query)
    );
  }

  return NextResponse.json({ success: true, count: filtered.length, clients: filtered });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newClient: ClientRecord = {
      id: `cli_${Date.now()}`,
      name: body.name || 'New Client Contact',
      firmName: body.firmName || 'Architectural Practice',
      email: body.email || `client_${Date.now()}@firm.com`,
      phone: body.phone || '+1 (555) 123-4567',
      tier: body.tier || 'Standard Studio',
      activeProjects: body.activeProjects || 1,
      totalSpend: body.totalSpend || '$0',
      status: body.status || 'Active',
      portalAccessCode: body.portalAccessCode || `VTR-${Math.floor(1000 + Math.random() * 9000)}-KEY`,
      assignedDirector: body.assignedDirector || 'Marcus Vance',
      joinedDate: new Date().toISOString().split('T')[0],
      notes: body.notes || 'New corporate account on boarded to VizTR Client Access Portal.',
      logoUrl: body.logoUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100',
    };

    CLIENTS_DB.unshift(newClient);
    return NextResponse.json({ success: true, client: newClient }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Client ID is required' }, { status: 400 });
    }

    const index = CLIENTS_DB.findIndex((c) => c.id === body.id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });
    }

    CLIENTS_DB[index] = {
      ...CLIENTS_DB[index],
      ...body,
    };

    return NextResponse.json({ success: true, client: CLIENTS_DB[index] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'Client ID is required' }, { status: 400 });
  }

  const initialLength = CLIENTS_DB.length;
  CLIENTS_DB = CLIENTS_DB.filter((c) => c.id !== id);

  if (CLIENTS_DB.length === initialLength) {
    return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: `Client ${id} removed successfully` });
}
