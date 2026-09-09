import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const runtime = 'nodejs';

// Extended session user type to include custom properties from auth callbacks
interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  clientId?: string;
  accessCode?: string;
  assignedDirector?: string;
  clientFirm?: string;
}

const EDITOR_LAUNCH_SECRET = process.env.EDITOR_LAUNCH_SECRET || process.env.NEXTAUTH_SECRET || 'dev-editor-launch-secret';
const EDITOR_LAUNCH_TTL_SECONDS = Number(process.env.EDITOR_LAUNCH_TTL_SECONDS || '3600');

function base64UrlEncode(input: Buffer): string {
  return input.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function signLaunchToken(payload: Record<string, unknown>) {
  const header = base64UrlEncode(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body = base64UrlEncode(Buffer.from(JSON.stringify(payload)));
  const data = `${header}.${body}`;

  const crypto = require('crypto');
  const signature = crypto.createHmac('sha256', EDITOR_LAUNCH_SECRET).update(data).digest('base64');
  const encodedSignature = signature.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

  return `${data}.${encodedSignature}`;
}

function verifyLaunchToken(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  const header = parts[0];
  const body = parts[1];
  const signature = parts[2];

  const data = `${header}.${body}`;

  const crypto = require('crypto');
  const expectedSignature = crypto.createHmac('sha256', EDITOR_LAUNCH_SECRET).update(data).digest('base64');
  const encodedExpected = expectedSignature.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

  if (signature !== encodedExpected) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64').toString('utf-8'));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as ExtendedUser | undefined;
    const userId = user?.id;
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const projectId = typeof body.projectId === 'string' ? body.projectId : undefined;

    if (!projectId) {
      return NextResponse.json({ success: false, error: 'projectId is required' }, { status: 400 });
    }

    const now = Math.floor(Date.now() / 1000);
    const payload: Record<string, unknown> = {
      sub: userId,
      projectId,
      iss: 'viztr',
      iat: now,
      exp: now + EDITOR_LAUNCH_TTL_SECONDS,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };

    const token = signLaunchToken(payload);

    return NextResponse.json({ success: true, token });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed to create launch token' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Missing token' }, { status: 401 });
    }

    const payload = verifyLaunchToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
    }

    return NextResponse.json({ success: true, payload });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed to validate token' }, { status: 500 });
  }
}
