export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-guard';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { z } from 'zod';

const RollbackSchema = z.object({
  versionId: z.string().uuid(),
});

/**
 * GET /api/editor/versions?sceneId=xxx
 * Get version history for a scene.
 */
export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const sceneId = searchParams.get('sceneId');

  if (!sceneId) {
    return NextResponse.json({ error: 'sceneId is required' }, { status: 400 });
  }

  try {
    // Verify scene ownership
    const { data: scene, error: sceneError } = await supabaseAdmin
      .from('editor_scenes')
      .select('id, user_id, is_published')
      .eq('id', sceneId)
      .single();

    if (sceneError || !scene) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
    }

    if (scene.user_id !== guard.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { data: versions, error } = await supabaseAdmin
      .from('editor_scene_versions')
      .select('*')
      .eq('scene_id', sceneId)
      .order('version', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      sceneId,
      versions: versions || [],
      currentVersion: scene.is_published ? 'published' : 'draft',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch versions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/editor/versions/rollback
 * Rollback a scene to a previous version.
 */
export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  let body: { versionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validated = RollbackSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { error: 'Invalid request', issues: validated.error.issues },
      { status: 422 }
    );
  }

  const { versionId } = validated.data;

  try {
    // Get the version entry
    const { data: version, error: versionError } = await supabaseAdmin
      .from('editor_scene_versions')
      .select('*, editor_scenes!inner(user_id, id)')
      .eq('id', versionId)
      .single();

    if (versionError || !version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    const sceneId = version.editor_scenes.id;
    if (version.editor_scenes.user_id !== guard.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const now = new Date().toISOString();

    // Create a new version entry for the rollback (preserving history)
    const { data: rollbackEntry, error: rollbackError } = await supabaseAdmin
      .from('editor_scene_versions')
      .insert({
        scene_id: sceneId,
        version: (version.version || 0) + 1,
        snapshot: version.snapshot,
        name: version.name,
        engine: version.engine,
        is_published: false,
        change_description: `Rolled back to version ${version.version}`,
        created_by: guard.userId,
      })
      .select()
      .single();

    if (rollbackError) {
      return NextResponse.json({ error: rollbackError.message }, { status: 500 });
    }

    // Update the scene to the rolled-back state
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('editor_scenes')
      .update({
        snapshot: version.snapshot,
        version: (version.version || 0) + 1,
        name: version.name,
        engine: version.engine,
        is_published: false,
        updated_at: now,
      })
      .eq('id', sceneId)
      .select('id, version, is_published, updated_at')
      .single();

    if (updateError) {
      await supabaseAdmin.from('editor_scene_versions').delete().eq('id', rollbackEntry.id);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      sceneId: updated.id,
      version: updated.version,
      isPublished: updated.is_published,
      rolledBackFromVersionId: versionId,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to rollback scene' },
      { status: 500 }
    );
  }
}
