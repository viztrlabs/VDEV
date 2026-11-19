export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-guard';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { z } from 'zod';

const PublishSchema = z.object({
  sceneId: z.string().uuid(),
  changeDescription: z.string().optional(),
});

/**
 * POST /api/editor/publish
 * Publish a draft scene version, creating a version history entry.
 */
export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  let body: { sceneId?: string; changeDescription?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validated = PublishSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { error: 'Invalid request', issues: validated.error.issues },
      { status: 422 }
    );
  }

  const { sceneId, changeDescription } = validated.data;

  try {
    // Verify scene ownership
    const { data: scene, error: sceneError } = await supabaseAdmin
      .from('editor_scenes')
      .select('id, user_id, version, snapshot, name, engine, is_published')
      .eq('id', sceneId)
      .single();

    if (sceneError || !scene) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
    }

    if (scene.user_id !== guard.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (scene.is_published) {
      return NextResponse.json({ error: 'Scene is already published' }, { status: 409 });
    }

    const now = new Date().toISOString();
    const nextVersion = (scene.version || 0) + 1;

    // Create version history entry from current state
    const { data: versionEntry, error: versionError } = await supabaseAdmin
      .from('editor_scene_versions')
      .insert({
        scene_id: sceneId,
        version: scene.version,
        snapshot: scene.snapshot,
        name: scene.name,
        engine: scene.engine,
        is_published: true,
        published_at: now,
        change_description: changeDescription || 'Published',
        created_by: guard.userId,
      })
      .select()
      .single();

    if (versionError) {
      return NextResponse.json({ error: versionError.message }, { status: 500 });
    }

    // Update the scene to published
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('editor_scenes')
      .update({
        version: nextVersion,
        is_published: true,
        published_at: now,
        updated_at: now,
      })
      .eq('id', sceneId)
      .select('id, version, is_published, published_at, updated_at')
      .single();

    if (updateError) {
      // Rollback version entry
      await supabaseAdmin.from('editor_scene_versions').delete().eq('id', versionEntry.id);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      sceneId: updated.id,
      version: updated.version,
      isPublished: updated.is_published,
      publishedAt: updated.published_at,
      versionEntryId: versionEntry.id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to publish scene' },
      { status: 500 }
    );
  }
}
