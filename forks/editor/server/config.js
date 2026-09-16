import { join } from 'path';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getEditorSchema } from './schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Lazy env reads — dotenv must be loaded before calling generateConfig()
function getEnv() {
    return {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    };
}

/**
 * Returns the base HTTP and WebSocket origin for the editor server.
 * Reads EDITOR_HOST and EDITOR_PORT from the environment so the
 * editor works when accessed from LAN IPs, Docker, etc.
 */
function getServerOrigin() {
    const host = process.env.EDITOR_HOST || 'localhost';
    const port = process.env.EDITOR_PORT || '3487';
    const base = `${host}:${port}`;
    return { http: `http://${base}`, ws: `ws://${base}` };
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

export async function generateConfig(projectId = null, sceneId = null) {
    const project = projectId ? await loadProject(projectId) : await loadProject(1);
    const resolvedProjectId = project?.id || projectId || 1;
    const scene = await loadScene(resolvedProjectId, sceneId);

    return {
        version: '2.31.4',
        self: {
            id: 1,
            username: 'viztr-user',
            flags: {
                openedEditor: true,
                superUser: true,
                tips: {
                    hierarchy: true,
                    assets: true,
                    store: true,
                    dashboard: true,
                    entityInspector: true,
                    soundComponent: true,
                    mainMenu: false,
                    controls: true,
                    launch: true,
                    howdoi: true
                }
            },
            branch: {
                id: 'main',
                name: 'main',
                createdAt: new Date().toISOString(),
                latestCheckpointId: null
            },
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
        url: (() => {
            const origin = getServerOrigin();
            return {
                api: `${origin.http}/api`,
                launch: `${origin.http}/launch/`,
                home: `${origin.http}/`,
                realtime: { http: `${origin.ws}/ws/realtime` },
                messenger: { http: `${origin.http}/ws/messenger`, ws: `${origin.ws}/ws/messenger` },
                relay: { http: `${origin.http}/ws/relay`, ws: `${origin.ws}/ws/relay` },
                frontend: `${origin.http}/`,
                engine: `${origin.http}/engine`,
                useCustomEngine: true,
                store: `${origin.http}/`,
                howdoi: `${origin.http}/`,
                static: `${origin.http}/`,
                images: `${origin.http}/`
            };
        })(),
        engineVersions: {
            current: { version: '2.23.0-beta.0', description: 'VizTR Custom Engine' },
            force: { version: '2.23.0-beta.0', description: 'VizTR Custom Engine' }
        },
        sentry: { enabled: false, env: 'local', version: '1.0.0', send: false, service: 'editor', page: '', disable_breadcrumbs: true },
        metrics: { env: 'local', send: false },
        oneTrustDomainKey: '',
        schema: getEditorSchema(),
        wasmModules: []
    };
}

async function loadProject(projectId) {
    let project = null;
    try {
        project = await supabaseSingle('editor_projects', `id=eq.${projectId}`);
    } catch (e) {
        console.warn('[Config] Failed to load project from Supabase:', e.message);
    }

    if (!project) {
        // Try local projects directory
        const projFile = join(__dirname, 'data', 'projects', String(projectId), 'project.json');
        if (existsSync(projFile)) {
            try {
                project = JSON.parse(readFileSync(projFile, 'utf-8'));
            } catch (e) {
                console.warn('[Config] Failed to parse project.json:', e.message);
            }
        } else {
            // Find any existing project in data/projects
            const projectsDir = join(__dirname, 'data', 'projects');
            if (existsSync(projectsDir)) {
                const entries = readdirSync(projectsDir);
                if (entries.length > 0) {
                    const fallbackFile = join(projectsDir, entries[0], 'project.json');
                    if (existsSync(fallbackFile)) {
                        try { project = JSON.parse(readFileSync(fallbackFile, 'utf-8')); } catch (e) {
                            console.warn('[Config] Failed to parse fallback project.json:', e.message);
                        }
                    }
                }
            }
        }
    }

    if (!project) {
        project = {
            id: projectId || 1,
            name: 'VizTR XR Studio Project',
            description: 'Local XR Studio Project',
            settings: {},
            permissions: { admin: [1], read: [1], write: [1] },
            private: true,
            master_branch: 'main',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
    }

    return {
        id: project.id,
        name: project.name || 'VizTR Project',
        description: project.description || '',
        privateAssets: false,
        hasPrivateSettings: false,
        thumbnails: {},
        settings: {
            id: `settings_${project.id}`,
            engineV2: true,
            antiAlias: true,
            fillMode: 'KEEP_CASPECT',
            resolutionMode: 'AUTO',
            width: 800,
            height: 600,
            use3dPhysics: false,
            enableWebGpu: false,
            enableWebGl2: true,
            powerPreference: 'default',
            preserveDrawingBuffer: false,
            transparentCanvas: false,
            useDevicePixelRatio: true,
            useLegacyScripts: false,
            loadingScreenScript: null,
            importMap: null,
            externalScripts: [],
            scripts: [],
            batchGroups: {},
            layers: {
                '0': { name: 'Default', opaqueSortMode: 0, transparentSortMode: 0 },
                '1': { name: 'Depth', opaqueSortMode: 0, transparentSortMode: 0 },
                '2': { name: 'Skybox', opaqueSortMode: 0, transparentSortMode: 0 },
                '3': { name: 'UI', opaqueSortMode: 0, transparentSortMode: 0 }
            },
            layerOrder: [
                { layer: 0, transparent: false, enabled: true },
                { layer: 1, transparent: false, enabled: true },
                { layer: 2, transparent: false, enabled: true },
                { layer: 3, transparent: true, enabled: true }
            ],
            i18nAssets: [],
            useLegacyAmmoPhysics: false,
            enableSharedArrayBuffer: false,
            vr: false,
            useKeyboard: true,
            useMouse: true,
            useTouch: true,
            useGamepads: false,
            maxAssetRetries: 0,
            ...(project.settings || {}),
        },
        permissions: project.permissions || { admin: [1], read: [1], write: [1] },
        private: project.private ?? true,
        primaryApp: 0,
        playUrl: '',
        masterBranch: project.master_branch || project.masterBranch || 'main',
        createdAt: project.created_at || project.createdAt || new Date().toISOString(),
        updatedAt: project.updated_at || project.updatedAt || new Date().toISOString(),
    };
}

async function loadScene(projectId, sceneId = null) {
    let scene = null;
    try {
        if (sceneId) {
            const scenes = await supabaseQuery('editor_scenes', `or=(id.eq.${sceneId},unique_id.eq.${sceneId})&limit=1`);
            if (scenes && scenes[0]) scene = scenes[0];
        }
        if (!scene) {
            const scenes = await supabaseQuery('editor_scenes', `project_id=eq.${projectId}&order=created_at.asc&limit=1`);
            if (scenes && scenes[0]) scene = scenes[0];
        }
    } catch (e) { console.warn('[Config] Failed to load scene from Supabase:', e?.message); }

    if (!scene) {
        // Try local projects directory
        const scenesDir = join(__dirname, 'data', 'projects', String(projectId), 'scenes');
        if (existsSync(scenesDir)) {
            const files = readdirSync(scenesDir).filter(f => f.endsWith('.json'));
            if (files.length > 0) {
                try {
                    scene = JSON.parse(readFileSync(join(scenesDir, files[0]), 'utf-8'));
                } catch (e) { console.warn('[Config] Failed to load scene from local file:', e?.message); }
            }
        } else {
            // Find any scene in any project in data/projects
            const projectsDir = join(__dirname, 'data', 'projects');
            if (existsSync(projectsDir)) {
                const entries = readdirSync(projectsDir);
                for (const entry of entries) {
                    const candidateDir = join(projectsDir, entry, 'scenes');
                    if (existsSync(candidateDir)) {
                        const files = readdirSync(candidateDir).filter(f => f.endsWith('.json'));
                        if (files.length > 0) {
                            try {
                                scene = JSON.parse(readFileSync(join(candidateDir, files[0]), 'utf-8'));
                                break;
    } catch (e) { console.warn('[Config] Failed to load scene from Supabase:', e?.message); }
                        }
                    }
                }
            }
        }
    }

    const defaultSettings = {
        physics: {
            gravity: [0, -9.8, 0]
        },
        render: {
            clear_color: [0.117, 0.117, 0.117, 1],
            exposure: 1,
            fog: 'none',
            fog_color: [0, 0, 0],
            fog_density: 0,
            fog_start: 1,
            fog_end: 1000,
            gamma_correction: 1,
            global_ambient: [0.2, 0.2, 0.2],
            lightmapMaxResolution: 2048,
            lightmapMode: 0,
            lightmapSizeMultiplier: 16,
            skybox: null,
            skyboxIntensity: 1,
            skyboxMip: 0,
            skyboxRotation: [0, 0, 0],
            tonemapping: 0
        },
        cameraClearColor: [0.117, 0.117, 0.117, 1],
        fog: { type: 0, color: [0, 0, 0], density: 0 },
        ambientLight: [0.2, 0.2, 0.2],
        skybox: null,
        skyboxIntensity: 1,
        skyboxMip: 0,
        toneMapping: 0,
        exposure: 1,
        gsplat: { enabled: true }
    };

    if (!scene) {
        scene = {
            id: sceneId || 1,
            unique_id: String(sceneId || 1),
            name: 'Scene 1',
            entities: {
                'camera-default': {
                    name: 'Camera',
                    components: {
                        camera: {
                            clearColor: [0.117, 0.117, 0.117, 1],
                            fov: 60,
                            near: 0.1,
                            far: 1000
                        }
                    }
                },
                'light-default': {
                    name: 'Directional Light',
                    components: {
                        light: {
                            type: 'directional',
                            color: [1, 1, 1],
                            intensity: 1,
                            castShadows: true
                        }
                    }
                }
            }
        };
    }

    const rawSettings = scene.settings || {};
    return {
        id: scene.id || sceneId || 1,
        uniqueId: scene.unique_id || scene.uniqueId || scene.id || String(sceneId || 1),
        name: scene.name || 'Scene 1',
        entities: scene.entities || {},
        settings: {
            ...defaultSettings,
            ...rawSettings,
            physics: {
                ...defaultSettings.physics,
                ...(rawSettings.physics || {})
            },
            render: {
                ...defaultSettings.render,
                ...(rawSettings.render || {})
            }
        }
    };
}
