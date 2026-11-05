export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin, TEMPLATES } from '@/lib/supabase-admin';
import { requireAuth } from '@/lib/api-guard';

const CreateEditorProjectSchema = z.object({
  name: z.string().max(255).optional(),
  description: z.string().max(2000).optional(),
  settings: z.record(z.unknown()).optional(),
  fork_from: z.string().optional(),
});

export async function GET(request: NextRequest) {
    const guard = await requireAuth(request);
    if (guard.error) return guard.error;
    if (!getSupabaseAdmin()) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    try {
        const { data, error } = await getSupabaseAdmin()!
            .from('editor_projects')
            .select('*')
            .eq('owner_id', guard.userId)
            .order('updated_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data || []);
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Unknown error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
  const guard = await requireAuth(request);
  if (guard.error) return guard.error;
  if (!getSupabaseAdmin()) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    try {
        const body = await request.json();
        const parsed = CreateEditorProjectSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
            { status: 400 }
          );
        }
        const { name, description, settings, fork_from } = parsed.data;

        // Resolve template from fork_from
        const template = fork_from ? TEMPLATES[fork_from] : null;

        // Create project
        const { data: project, error: projectError } = await getSupabaseAdmin()!
            .from('editor_projects')
            .insert({
                owner_id: guard.userId,
                name: name || 'Untitled',
                description: description || '',
                settings: settings || {},
                fork_from: fork_from || null,
            })
            .select()
            .single();

        if (projectError) {
            return NextResponse.json({ error: projectError.message }, { status: 500 });
        }

        // Create default branch
        await getSupabaseAdmin()!
            .from('editor_branches')
            .insert({
                id: 'main',
                name: 'main',
                project_id: project.id,
            });

        // Create scene from template or blank
        const { error: sceneError } = await getSupabaseAdmin()!
            .from('editor_scenes')
            .insert({
                name: template ? template.name : 'Root',
                project_id: project.id,
                branch_id: 'main',
                entities: template ? template.entities : {},
                settings: template ? template.settings : {},
            });

        if (sceneError) {
            console.error('Scene creation error:', sceneError);
        }

        return NextResponse.json(project, { status: 201 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Unknown error' }, { status: 500 });
    }
}
