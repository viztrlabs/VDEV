import { NextRequest, NextResponse } from 'next/server';
import {
  listClientDirectory,
  CLIENTS_DB,
} from '@/lib/client-directory';
import { isSupabaseAdminReady } from '@/lib/supabase/repositories';

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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tier = searchParams.get('tier') || undefined;
  const query = searchParams.get('q')?.toLowerCase() || undefined;
  const accessCode = searchParams.get('accessCode') || undefined;
  const id = searchParams.get('id') || undefined;
  const email = searchParams.get('email') || undefined;

  const clients = await listClientDirectory({ tier, query, accessCode, id, email });
  return NextResponse.json({
    success: true,
    count: clients.length,
    clients,
    source: isSupabaseAdminReady() ? 'supabase' : 'memory',
  });
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

  const index = CLIENTS_DB.findIndex((c) => c.id === id);

  if (index === -1) {
    return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });
  }

  CLIENTS_DB.splice(index, 1);

  return NextResponse.json({ success: true, message: `Client ${id} removed successfully` });
}
