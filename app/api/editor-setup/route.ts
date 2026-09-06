import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST() {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    const migrations = [
        // Editor Projects
        `CREATE TABLE IF NOT EXISTS public.editor_projects (
          id bigint PRIMARY KEY DEFAULT generate_bigserial(),
          name text NOT NULL DEFAULT 'Untitled',
          description text NOT NULL DEFAULT '',
          settings jsonb NOT NULL DEFAULT '{}'::jsonb,
          fork_from integer,
          permissions jsonb NOT NULL DEFAULT '{"admin":[1],"read":[1],"write":[1]}'::jsonb,
          private boolean NOT NULL DEFAULT true,
          primary_app text,
          play_url text NOT NULL DEFAULT '',
          private_assets boolean NOT NULL DEFAULT false,
          has_private_settings boolean NOT NULL DEFAULT false,
          thumbnails jsonb NOT NULL DEFAULT '{}'::jsonb,
          master_branch text NOT NULL DEFAULT 'main',
          owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS editor_projects_owner_id_idx ON public.editor_projects(owner_id);
        CREATE INDEX IF NOT EXISTS editor_projects_created_at_idx ON public.editor_projects(created_at DESC);`,

        // Editor Scenes
        `CREATE TABLE IF NOT EXISTS public.editor_scenes (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          unique_id uuid NOT NULL DEFAULT gen_random_uuid(),
          name text NOT NULL DEFAULT 'Root',
          project_id bigint NOT NULL REFERENCES public.editor_projects(id) ON DELETE CASCADE,
          branch_id text NOT NULL DEFAULT 'main',
          entities jsonb NOT NULL DEFAULT '{}'::jsonb,
          settings jsonb NOT NULL DEFAULT '{}'::jsonb,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS editor_scenes_project_id_idx ON public.editor_scenes(project_id);`,

        // Editor Assets
        `CREATE TABLE IF NOT EXISTS public.editor_assets (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id bigint NOT NULL REFERENCES public.editor_projects(id) ON DELETE CASCADE,
          name text NOT NULL,
          type text NOT NULL,
          filename text,
          size bigint DEFAULT 0,
          data jsonb NOT NULL DEFAULT '{}'::jsonb,
          meta jsonb NOT NULL DEFAULT '{}'::jsonb,
          tags jsonb NOT NULL DEFAULT '[]'::jsonb,
          url text,
          storage_path text,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS editor_assets_project_id_idx ON public.editor_assets(project_id);`,

        // Editor Branches
        `CREATE TABLE IF NOT EXISTS public.editor_branches (
          id text NOT NULL DEFAULT 'main',
          name text NOT NULL DEFAULT 'main',
          project_id bigint NOT NULL REFERENCES public.editor_projects(id) ON DELETE CASCADE,
          latest_checkpoint_id uuid,
          created_at timestamptz NOT NULL DEFAULT now(),
          PRIMARY KEY (project_id, id)
        );`,

        // Editor Checkpoints
        `CREATE TABLE IF NOT EXISTS public.editor_checkpoints (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id bigint NOT NULL REFERENCES public.editor_projects(id) ON DELETE CASCADE,
          branch_id text NOT NULL DEFAULT 'main',
          description text NOT NULL DEFAULT '',
          scene_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
          asset_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
          created_at timestamptz NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS editor_checkpoints_project_id_idx ON public.editor_checkpoints(project_id);`,

        // RLS Policies
        `ALTER TABLE public.editor_projects ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.editor_scenes ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.editor_assets ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.editor_branches ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.editor_checkpoints ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS editor_projects_anon_all ON public.editor_projects;
        CREATE POLICY editor_projects_anon_all ON public.editor_projects FOR ALL USING (true);
        DROP POLICY IF EXISTS editor_scenes_anon_all ON public.editor_scenes;
        CREATE POLICY editor_scenes_anon_all ON public.editor_scenes FOR ALL USING (true);
        DROP POLICY IF EXISTS editor_assets_anon_all ON public.editor_assets;
        CREATE POLICY editor_assets_anon_all ON public.editor_assets FOR ALL USING (true);
        DROP POLICY IF EXISTS editor_branches_anon_all ON public.editor_branches;
        CREATE POLICY editor_branches_anon_all ON public.editor_branches FOR ALL USING (true);
        DROP POLICY IF EXISTS editor_checkpoints_anon_all ON public.editor_checkpoints;
        CREATE POLICY editor_checkpoints_anon_all ON public.editor_checkpoints FOR ALL USING (true);`,
    ];

    const results = [];
    for (const sql of migrations) {
        const { error } = await supabaseAdmin.rpc('exec_sql', { sql });
        if (error) {
            // Try direct query as fallback
            const { error: directError } = await supabaseAdmin.from('_sql').select().throwOnError();
            results.push({ sql: sql.substring(0, 50) + '...', error: error.message });
        } else {
            results.push({ sql: sql.substring(0, 50) + '...', ok: true });
        }
    }

    return NextResponse.json({ results });
}
