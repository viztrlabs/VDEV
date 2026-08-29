import { NextRequest, NextResponse } from 'next/server';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'CLIENT';
  department: string;
  status: 'active' | 'invited' | 'suspended';
  twoFactorEnabled: boolean;
  avatarUrl?: string;
  lastActive: string;
  assignedProjectsCount: number;
  company?: string;
  phone?: string;
  createdAt: string;
}

// In-memory persistent state across requests
let USERS_DB: UserRecord[] = [
  {
    id: 'usr_super_01',
    name: 'Marcus Vance',
    email: 'admin@viztr.com',
    role: 'SUPER_ADMIN',
    department: 'Executive / Core Engineering',
    status: 'active',
    twoFactorEnabled: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    lastActive: 'Just now',
    assignedProjectsCount: 14,
    company: 'VizTR Global HQ',
    phone: '+1 (415) 890-2100',
    createdAt: '2025-01-10T08:00:00Z',
  },
  {
    id: 'usr_admin_02',
    name: 'Sarah Lin',
    email: 'sarah.lin@viztr.com',
    role: 'ADMIN',
    department: 'CGI & Unreal Engine 5.4 Lead',
    status: 'active',
    twoFactorEnabled: true,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    lastActive: '12 mins ago',
    assignedProjectsCount: 8,
    company: 'VizTR Studios London',
    phone: '+44 20 7946 0912',
    createdAt: '2025-02-14T10:30:00Z',
  },
  {
    id: 'usr_admin_03',
    name: 'David Kalu',
    email: 'david.k@viztr.com',
    role: 'ADMIN',
    department: 'WebXR / Spatial Computing Lead',
    status: 'active',
    twoFactorEnabled: false,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    lastActive: '1 hour ago',
    assignedProjectsCount: 6,
    company: 'VizTR Studios SF',
    phone: '+1 (415) 678-4321',
    createdAt: '2025-03-01T09:15:00Z',
  },
  {
    id: 'usr_user_04',
    name: 'Elena Rostova',
    email: 'elena.r@viztr.com',
    role: 'USER',
    department: 'BIM & Parametric Modeling',
    status: 'active',
    twoFactorEnabled: true,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    lastActive: '3 hours ago',
    assignedProjectsCount: 5,
    company: 'VizTR Studios Dubai',
    phone: '+971 4 321 8899',
    createdAt: '2025-03-12T14:20:00Z',
  },
  {
    id: 'usr_client_05',
    name: 'Alexander Sterling',
    email: 'a.sterling@fosterandpartners.com',
    role: 'CLIENT',
    department: 'External Architecture Principal',
    status: 'active',
    twoFactorEnabled: true,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    lastActive: '5 hours ago',
    assignedProjectsCount: 2,
    company: 'Foster + Partners London',
    phone: '+44 20 7738 0455',
    createdAt: '2025-04-01T11:00:00Z',
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');
  const query = searchParams.get('q')?.toLowerCase();

  let filtered = [...USERS_DB];
  if (role && role !== 'ALL') {
    filtered = filtered.filter((u) => u.role === role);
  }
  if (query) {
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.department.toLowerCase().includes(query) ||
        u.company?.toLowerCase().includes(query)
    );
  }

  return NextResponse.json({ success: true, count: filtered.length, users: filtered });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newUser: UserRecord = {
      id: `usr_${Date.now()}`,
      name: body.name || 'New Team Member',
      email: body.email || `user_${Date.now()}@viztr.com`,
      role: body.role || 'USER',
      department: body.department || 'Architecture Visualization',
      status: body.status || 'active',
      twoFactorEnabled: !!body.twoFactorEnabled,
      avatarUrl: body.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      lastActive: 'Just now',
      assignedProjectsCount: body.assignedProjectsCount || 0,
      company: body.company || 'VizTR Studio Client',
      phone: body.phone || '+1 (555) 000-0000',
      createdAt: new Date().toISOString(),
    };

    USERS_DB.unshift(newUser);
    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const index = USERS_DB.findIndex((u) => u.id === body.id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    USERS_DB[index] = {
      ...USERS_DB[index],
      ...body,
    };

    return NextResponse.json({ success: true, user: USERS_DB[index] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
  }

  const initialLength = USERS_DB.length;
  USERS_DB = USERS_DB.filter((u) => u.id !== id);

  if (USERS_DB.length === initialLength) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: `User ${id} removed successfully` });
}
