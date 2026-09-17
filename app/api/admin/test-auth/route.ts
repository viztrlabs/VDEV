import { NextResponse } from 'next/server';
import { getAuthUser, requireAdmin } from '@/lib/api/auth';

export async function GET() {
  try {
    const user = await getAuthUser();
    requireAdmin(user);
    return NextResponse.json({ ok: true, route: 'test-auth', user: user?.email });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 401 });
  }
}
