import { join } from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Lazy env reads — dotenv must be loaded before calling generateConfig()
function getEnv() {
    return {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    };
}

async function supabaseQuery(table, query = '') {
    const { supabaseUrl, supabaseKey } = getEnv();
    if (!supabaseUrl || !supabaseKey) return null;
    const url = `${supabaseUrl}/rest/v1/${table}?${query}`;
    const res = await fetch(url, {
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) return null;
    return res.json();
}

async function supabaseSingle(table, query) {
    const data = await supabaseQuery(table, query);
    return data?.[0] || null;
}

export async function generateConfig(projectId = null) {
    const scene = projectId ? await loadScene(projectId) : null;
    const project = projectId ? await loadProject(projectId) : null;

    return {
        version: '2.31.4',
        self: {
            id: 1,
            username: 'viztr-user',
            flags: {},
            branch: projectId ? {
                id: 'main',
                name: 'main',
                createdAt: new Date().toISOString(),
                latestCheckpointId: null
            } : null,
            plan: { id: 1, type: 'individual' },
            locale: 'en'
        },
        owner: {
            id: 1,
            username: 'viztr-user',
            plan: { id: 1, type: 'individual' },
            size: 0,
            diskAllowance: 10737418240
        },
        accessToken: 'local-dev-token',
        project: project || { id: projectId },
        aws: { s3Prefix: '' },
        store: { sketchfab: { clientId: '', cookieName: '', redirectUrl: '' } },
        scene: scene,
        url: {
            api: 'http://localhost:3487/api',
            launch: 'http://localhost:3487/launch',
            home: 'http://localhost:3487',
            realtime: { http: 'ws://localhost:3487/ws/realtime' },
            messenger: { http: 'http://localhost:3487/ws/messenger', ws: 'ws://localhost:3487/ws/messenger' },
            relay: { http: 'http://localhost:3487/ws/relay', ws: 'ws://localhost:3487/ws/relay' },
            frontend: 'http://localhost:3487',
            engine: 'http://localhost:3487/engine',
            useCustomEngine: true,
            store: 'http://localhost:3487',
            howdoi: 'http://localhost:3487',
            static: 'http://localhost:3487',
            images: 'http://localhost:3487'
        },
        engineVersions: {
            current: { version: '2.23.0-beta.0', description: 'VizTR Custom Engine' },
            force: { version: '2.23.0-beta.0', description: 'VizTR Custom Engine' }
        },
        sentry: { enabled: false, env: 'local', version: '1.0.0', send: false, service: 'editor', page: '', disable_breadcrumbs: true },
        metrics: { env: 'local', send: false },
        oneTrustDomainKey: '',
        schema: { version: 1, documents: {} },
        wasmModules: []
    };
}

async function loadProject(projectId) {
    const project = await supabaseSingle('editor_projects', `id=eq.${projectId}`);
    if (!project) return null;
    return {
        id: project.id,
        name: project.name,
        description: project.description,
        settings: project.settings,
        fork_from: project.fork_from,
        permissions: project.permissions,
        private: project.private,
        masterBranch: project.master_branch,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
    };
}

async function loadScene(projectId) {
    const scenes = await supabaseQuery('editor_scenes', `project_id=eq.${projectId}&order=created_at.asc&limit=1`);
    if (!scenes || scenes.length === 0) return null;
    const scene = scenes[0];
    return {
        id: scene.id,
        name: scene.name,
        entities: scene.entities || {},
        settings: scene.settings || {}
    };
}
