import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, TEMPLATES } from '@/lib/supabase-admin';

export async function GET() {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('editor_projects')
            .select('*')
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
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    try {
        const body = await request.json();
        const { name, description, settings, fork_from } = body;

        // Resolve template from fork_from
        const template = fork_from ? TEMPLATES[fork_from] : null;

        // Create project
        const { data: project, error: projectError } = await supabaseAdmin
            .from('editor_projects')
            .insert({
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
        await supabaseAdmin
            .from('editor_branches')
            .insert({
                id: 'main',
                name: 'main',
                project_id: project.id,
            });

        // Create scene from template or blank
        const { error: sceneError } = await supabaseAdmin
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
