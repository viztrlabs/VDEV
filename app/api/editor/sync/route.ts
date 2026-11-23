export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { SceneSnapshot } from '@/lib/3d/bridge/types';
import { requireAuth } from '@/lib/api-guard';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

/**
 * GET /api/editor/sync
 * Hydrates the latest scene snapshot from the database.
 */
export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    // Fetch the user's most recent scene
    const { data: scenes, error } = await supabaseAdmin
      .from('editor_scenes')
      .select('snapshot, version, updated_at, name, is_published')
      .eq('user_id', guard.userId)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (scenes && scenes.length > 0) {
      const row = scenes[0];
      return NextResponse.json({
        snapshot: row.snapshot as SceneSnapshot,
        version: row.version,
        updatedAt: row.updated_at,
        cached: true,
      });
    }

    // Default sample snapshot when no saved scene exists
    const defaultSnapshot: SceneSnapshot = {
      id: 'default-scene',
      version: 1,
      name: 'VizTR 3D Interactive Scene',
      engine: 'three',
      camera: {
        position: { x: 5, y: 5, z: 5 },
        target: { x: 0, y: 0, z: 0 },
        fov: 60,
      },
      entities: [
        {
          id: 'ent-cube-1',
          name: 'Hero Cube',
          type: 'mesh',
          position: { x: 0, y: 1, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          visible: true,
          materialId: 'mat-arch-cube',
        },
        {
          id: 'ent-sphere-1',
          name: 'Accent Sphere',
          type: 'mesh',
          position: { x: 3, y: 0.8, z: 1 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          visible: true,
          materialId: 'mat-accent-sphere',
        },
      ],
      materials: [
        {
          id: 'mat-arch-cube',
          name: 'Architectural Emerald',
          color: '#dbfcff',
          roughness: 0.3,
          metalness: 0.2,
          opacity: 1,
          wireframe: false,
        },
        {
          id: 'mat-accent-sphere',
          name: 'Electric Indigo',
          color: '#6366f1',
          roughness: 0.1,
          metalness: 0.8,
          opacity: 1,
          wireframe: false,
        },
      ],
      hotspots: [],
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ snapshot: defaultSnapshot, cached: false });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to read scene snapshot' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/editor/sync
 * Persists updated scene snapshot to the database.
 */
export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const snapshot: SceneSnapshot = await req.json();

    if (!snapshot || !snapshot.id) {
      return NextResponse.json({ error: 'Invalid scene snapshot payload' }, { status: 400 });
    }

    // Find existing scene for this user
    const { data: existing } = await supabaseAdmin
      .from('editor_scenes')
      .select('id, version')
      .eq('user_id', guard.userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const now = new Date().toISOString();
    const nextVersion = (existing?.version || 0) + 1;

    if (existing) {
      // Update existing scene
      const { data: updated, error } = await supabaseAdmin
        .from('editor_scenes')
        .update({
          snapshot: snapshot,
          version: nextVersion,
          updated_at: now,
          name: snapshot.name || 'Untitled Scene',
        })
        .eq('id', existing.id)
        .select('id, version, updated_at')
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        id: updated.id,
        version: updated.version,
        updatedAt: updated.updated_at,
      });
    } else {
      // Create new scene
      const { data: created, error } = await supabaseAdmin
        .from('editor_scenes')
        .insert({
          user_id: guard.userId,
          name: snapshot.name || 'Untitled Scene',
          engine: snapshot.engine || 'three',
          version: nextVersion,
          snapshot: snapshot,
          is_published: false,
          created_at: now,
          updated_at: now,
        })
        .select('id, version, updated_at')
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        id: created.id,
        version: created.version,
        updatedAt: created.updated_at,
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to save scene snapshot' },
      { status: 500 }
    );
  }
}
