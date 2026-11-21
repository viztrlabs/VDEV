import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/api-guard';
import { getSupabaseRepository } from '@/lib/repositories';

// GET /api/admin/ga4/credentials - Get active GA4 credentials
export async function GET(req: NextRequest) {
  try {
    const guard = await requireSuperAdmin(req);
    if (guard.error) return guard.error;

    const repo = getSupabaseRepository();
    const active = await repo.ga4Credentials.findActive();

    return NextResponse.json({
      success: true,
      data: active,
    });
  } catch (error: any) {
    console.error('GA4 credentials fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch GA4 credentials' },
      { status: 500 }
    );
  }
}

// POST /api/admin/ga4/credentials - Create new GA4 credentials
export async function POST(req: NextRequest) {
  try {
    const guard = await requireSuperAdmin(req);
    if (guard.error) return guard.error;

    const body = await req.json();

    if (!body.propertyId || !body.serviceAccountEmail || !body.privateKey) {
      return NextResponse.json(
        { success: false, error: 'Property ID, service account email, and private key are required' },
        { status: 400 }
      );
    }

    if (!body.privateKey.includes('BEGIN PRIVATE KEY')) {
      return NextResponse.json(
        { success: false, error: 'Invalid private key format. Must be PEM format with BEGIN/END PRIVATE KEY' },
        { status: 400 }
      );
    }

    const repo = getSupabaseRepository();
    const created = await repo.ga4Credentials.create({
      propertyId: body.propertyId,
      serviceAccountEmail: body.serviceAccountEmail,
      privateKey: body.privateKey,
      isActive: body.isActive !== undefined ? body.isActive : true,
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'GA4 credentials saved successfully',
    });
  } catch (error: any) {
    console.error('GA4 credentials create error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create GA4 credentials' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/ga4/credentials - Update GA4 credentials
export async function PUT(req: NextRequest) {
  try {
    const guard = await requireSuperAdmin(req);
    if (guard.error) return guard.error;

    const body = await req.json();
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Credentials ID is required' },
        { status: 400 }
      );
    }

    // Validate private key format if provided
    if (body.privateKey && !body.privateKey.includes('BEGIN PRIVATE KEY')) {
      return NextResponse.json(
        { success: false, error: 'Invalid private key format. Must be PEM format with BEGIN/END PRIVATE KEY' },
        { status: 400 }
      );
    }

    const repo = getSupabaseRepository();
    const updated = await repo.ga4Credentials.update(body.id, {
      propertyId: body.propertyId,
      serviceAccountEmail: body.serviceAccountEmail,
      privateKey: body.privateKey,
      isActive: body.isActive,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'GA4 credentials updated successfully',
    });
  } catch (error: any) {
    console.error('GA4 credentials update error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update GA4 credentials' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/ga4/credentials - Delete GA4 credentials
export async function DELETE(req: NextRequest) {
  try {
    const guard = await requireSuperAdmin(req);
    if (guard.error) return guard.error;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Credentials ID is required' },
        { status: 400 }
      );
    }

    const repo = getSupabaseRepository();
    await repo.ga4Credentials.delete(id);

    return NextResponse.json({
      success: true,
      message: 'GA4 credentials deleted successfully',
    });
  } catch (error: any) {
    console.error('GA4 credentials delete error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete GA4 credentials' },
      { status: 500 }
    );
  }
}
