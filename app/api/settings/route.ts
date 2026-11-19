export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-guard';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { clearSettingsCache } from '@/lib/server-credentials';
import { z } from 'zod';

const SettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().min(1),
  description: z.string().optional(),
});

/**
 * GET /api/settings
 * List all credential keys (without values) for admin UI.
 */
export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('key, description, updated_at, is_encrypted')
      .order('key');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      settings: (data || []).map((s: any) => ({
        key: s.key,
        description: s.description,
        updatedAt: s.updated_at,
        isEncrypted: s.is_encrypted,
        hasValue: true, // if row exists, it has a value
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settings
 * Create or update a credential value. Admin only.
 */
export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  let body: { key?: string; value?: string; description?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validated = SettingSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { error: 'Invalid request', issues: validated.error.issues },
      { status: 422 }
    );
  }

  const { key, value, description } = validated.data;

  try {
    const now = new Date().toISOString();
    const { error } = await supabaseAdmin
      .from('settings')
      .upsert(
        {
          key,
          value,
          is_encrypted: true,
          description,
          updated_by: guard.userId,
          updated_at: now,
        },
        { onConflict: 'key' }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Clear the settings cache so new value is picked up immediately
    await clearSettingsCache();

    return NextResponse.json({ success: true, key });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to save setting' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/settings?key=xxx
 * Delete a credential. Admin only.
 */
export async function DELETE(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');

  if (!key) {
    return NextResponse.json({ error: 'key query parameter is required' }, { status: 400 });
  }

  try {
    const { error } = await supabaseAdmin.from('settings').delete().eq('key', key);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await clearSettingsCache();

    return NextResponse.json({ success: true, key });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to delete setting' },
      { status: 500 }
    );
  }
}
