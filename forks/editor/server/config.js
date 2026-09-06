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
                    mainMenu: true,
                    controls: true,
                    launch: true,
                    howdoi: true
                }
            },
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
            launch: 'http://localhost:3487/launch/',
            home: 'http://localhost:3487/',
            realtime: { http: 'ws://localhost:3487/ws/realtime' },
            messenger: { http: 'http://localhost:3487/ws/messenger', ws: 'ws://localhost:3487/ws/messenger' },
            relay: { http: 'http://localhost:3487/ws/relay', ws: 'ws://localhost:3487/ws/relay' },
            frontend: 'http://localhost:3487/',
            engine: 'http://localhost:3487/engine',
            useCustomEngine: true,
            store: 'http://localhost:3487/',
            howdoi: 'http://localhost:3487/',
            static: 'http://localhost:3487/',
            images: 'http://localhost:3487/'
        },
        engineVersions: {
            current: { version: '2.23.0-beta.0', description: 'VizTR Custom Engine' },
            force: { version: '2.23.0-beta.0', description: 'VizTR Custom Engine' }
        },
        sentry: { enabled: false, env: 'local', version: '1.0.0', send: false, service: 'editor', page: '', disable_breadcrumbs: true },
        metrics: { env: 'local', send: false },
        oneTrustDomainKey: '',
        schema: {
            version: 1,
            documents: {
                settings: {
                    type: 'object',
                    properties: {
                        editor: {
                            type: 'object',
                            properties: {
                                // Project-User Settings
                                cameraClearColor: { type: 'array', default: [0.117, 0.117, 0.117, 1], 'x-scope': 'projectUser' },
                                cameraNearClip: { type: 'number', default: 0.0001, 'x-scope': 'projectUser' },
                                cameraFarClip: { type: 'number', default: 1000, 'x-scope': 'projectUser' },
                                cameraToneMapping: { type: 'number', default: 0, 'x-scope': 'projectUser' },
                                cameraGammaCorrection: { type: 'number', default: 0, 'x-scope': 'projectUser' },
                                showFog: { type: 'boolean', default: true, 'x-scope': 'projectUser' },
                                snapIncrement: { type: 'number', default: 0.1, 'x-scope': 'projectUser' },
                                gridSnap: { type: 'boolean', default: false, 'x-scope': 'projectUser' },
                                gridDivisionSize: { type: 'number', default: 1, 'x-scope': 'projectUser' },

                                // User Settings
                                zoomSensitivity: { type: 'number', default: 10, 'x-scope': 'user' },
                                gizmoSize: { type: 'number', default: 1, 'x-scope': 'user' },
                                gizmoPreset: { type: 'string', default: 'default', 'x-scope': 'user' },
                                showViewCube: { type: 'boolean', default: true, 'x-scope': 'user' },
                                viewCubeSize: { type: 'number', default: 1, 'x-scope': 'user' },
                                iconSize: { type: 'number', default: 16, 'x-scope': 'user' },
                                showSkeleton: { type: 'boolean', default: true, 'x-scope': 'user' },
                                howdoi: { type: 'boolean', default: false, 'x-scope': 'user' }
                            }
                        }
                    }
                },
                scene: {
                    type: 'object',
                    properties: {
                        settings: {
                            type: 'object',
                            properties: {
                                physics: {
                                    type: 'object',
                                    properties: {
                                        gravity: { type: 'array', default: [0, -9.8, 0] }
                                    }
                                },
                                render: {
                                    type: 'object',
                                    properties: {
                                        clear_color: { type: 'array', default: [0.117, 0.117, 0.117, 1] },
                                        exposure: { type: 'number', default: 1 },
                                        fog: { type: 'string', default: 'none' },
                                        fog_color: { type: 'array', default: [0, 0, 0] },
                                        fog_density: { type: 'number', default: 0 },
                                        fog_start: { type: 'number', default: 1 },
                                        fog_end: { type: 'number', default: 1000 },
                                        gamma_correction: { type: 'number', default: 1 },
                                        global_ambient: { type: 'array', default: [0.2, 0.2, 0.2] },
                                        lightmapMaxResolution: { type: 'number', default: 2048 },
                                        lightmapMode: { type: 'number', default: 0 },
                                        lightmapSizeMultiplier: { type: 'number', default: 16 },
                                        skybox: { type: 'number', default: null },
                                        skyboxIntensity: { type: 'number', default: 1 },
                                        skyboxMip: { type: 'number', default: 0 },
                                        skyboxRotation: { type: 'array', default: [0, 0, 0] },
                                        tonemapping: { type: 'number', default: 0 }
                                    }
                                }
                            }
                        },
                        entities: {
                            type: 'object',
                            additionalProperties: {
                                type: 'object',
                                properties: {
                                    components: {
                                        type: 'object',
                                        properties: {
                                            render: {
                                                type: 'object',
                                                properties: {
                                                    enabled: { type: 'boolean', default: true },
                                                    type: { type: 'string', default: 'asset' },
                                                    asset: { type: 'number', default: null },
                                                    materialAssets: { type: 'array', items: { type: 'number' }, default: [] },
                                                    castShadows: { type: 'boolean', default: true },
                                                    castShadowsLightmap: { type: 'boolean', default: true },
                                                    receiveShadows: { type: 'boolean', default: true },
                                                    isStatic: { type: 'boolean', default: false },
                                                    lightmapped: { type: 'boolean', default: false },
                                                    lightmapSizeMultiplier: { type: 'number', default: 1 },
                                                    customAabb: { type: 'boolean', default: false },
                                                    aabbCenter: { type: 'array', default: [0, 0, 0] },
                                                    aabbHalfExtents: { type: 'array', default: [0, 0, 0] },
                                                    rootBone: { type: 'string', default: null },
                                                    batchGroupId: { type: 'number', default: null },
                                                    layers: { type: 'array', items: { type: 'number' }, default: [0] }
                                                }
                                            },
                                            model: {
                                                type: 'object',
                                                properties: {
                                                    enabled: { type: 'boolean', default: true },
                                                    type: { type: 'string', default: 'asset' },
                                                    asset: { type: 'number', default: null },
                                                    materialAsset: { type: 'number', default: null },
                                                    castShadows: { type: 'boolean', default: true },
                                                    castShadowsLightmap: { type: 'boolean', default: true },
                                                    receiveShadows: { type: 'boolean', default: true },
                                                    isStatic: { type: 'boolean', default: false },
                                                    lightmapped: { type: 'boolean', default: false },
                                                    lightmapSizeMultiplier: { type: 'number', default: 1 },
                                                    batchGroupId: { type: 'number', default: null },
                                                    layers: { type: 'array', items: { type: 'number' }, default: [0] },
                                                    mapping: { type: 'object', default: {} }
                                                }
                                            },
                                            camera: {
                                                type: 'object',
                                                properties: {
                                                    enabled: { type: 'boolean', default: true },
                                                    clearColor: { type: 'array', default: [0.117, 0.117, 0.117, 1] },
                                                    clearColorBuffer: { type: 'boolean', default: true },
                                                    clearDepthBuffer: { type: 'boolean', default: true },
                                                    projection: { type: 'number', default: 0 },
                                                    fov: { type: 'number', default: 45 },
                                                    orthoHeight: { type: 'number', default: 4 },
                                                    nearClip: { type: 'number', default: 0.1 },
                                                    farClip: { type: 'number', default: 1000 },
                                                    priority: { type: 'number', default: 0 },
                                                    rect: { type: 'array', default: [0, 0, 1, 1] },
                                                    frustumCulling: { type: 'boolean', default: true },
                                                    layers: { type: 'array', items: { type: 'number' }, default: [0, 1, 2, 3, 4] },
                                                    toneMapping: { type: 'number', default: 0 },
                                                    gammaCorrection: { type: 'number', default: 1 }
                                                }
                                            },
                                            light: {
                                                type: 'object',
                                                properties: {
                                                    enabled: { type: 'boolean', default: true },
                                                    type: { type: 'string', default: 'directional' },
                                                    color: { type: 'array', default: [1, 1, 1] },
                                                    intensity: { type: 'number', default: 1 },
                                                    castShadows: { type: 'boolean', default: false },
                                                    shadowType: { type: 'number', default: 0 },
                                                    shadowResolution: { type: 'number', default: 1024 },
                                                    shadowDistance: { type: 'number', default: 40 },
                                                    shadowBias: { type: 'number', default: 0.05 },
                                                    normalOffsetBias: { type: 'number', default: 0 },
                                                    range: { type: 'number', default: 10 },
                                                    innerConeAngle: { type: 'number', default: 40 },
                                                    outerConeAngle: { type: 'number', default: 45 },
                                                    falloffMode: { type: 'number', default: 0 },
                                                    shape: { type: 'number', default: 0 },
                                                    numCascades: { type: 'number', default: 1 },
                                                    cascadeDistribution: { type: 'number', default: 0.5 },
                                                    affectDynamic: { type: 'boolean', default: true },
                                                    affectLightmapped: { type: 'boolean', default: false },
                                                    bake: { type: 'boolean', default: false },
                                                    bakeDir: { type: 'boolean', default: true },
                                                    vsmBlurMode: { type: 'number', default: 1 },
                                                    vsmBlurSize: { type: 'number', default: 11 },
                                                    vsmBias: { type: 'number', default: 0.01 },
                                                    penumbraSize: { type: 'number', default: 1 },
                                                    penumbraFalloff: { type: 'number', default: 1 },
                                                    cookieAsset: { type: 'number', default: null },
                                                    cookieIntensity: { type: 'number', default: 1 },
                                                    cookieAngle: { type: 'number', default: 0 },
                                                    cookieOffset: { type: 'array', default: [0, 0] },
                                                    cookieScale: { type: 'array', default: [1, 1] },
                                                    cookieFalloff: { type: 'boolean', default: true },
                                                    cookieChannel: { type: 'string', default: 'rgb' },
                                                    layers: { type: 'array', items: { type: 'number' }, default: [0] }
                                                }
                                            },
                                            collision: {
                                                type: 'object',
                                                properties: {
                                                    enabled: { type: 'boolean', default: true },
                                                    type: { type: 'string', default: 'box' },
                                                    halfExtents: { type: 'array', default: [0.5, 0.5, 0.5] },
                                                    radius: { type: 'number', default: 0.5 },
                                                    height: { type: 'number', default: 1 },
                                                    axis: { type: 'number', default: 1 },
                                                    asset: { type: 'number', default: null },
                                                    renderAsset: { type: 'number', default: null },
                                                    convexHull: { type: 'boolean', default: false },
                                                    linearOffset: { type: 'array', default: [0, 0, 0] },
                                                    angularOffset: { type: 'array', default: [0, 0, 0] }
                                                }
                                            },
                                            rigidbody: {
                                                type: 'object',
                                                properties: {
                                                    enabled: { type: 'boolean', default: true },
                                                    type: { type: 'string', default: 'static' },
                                                    mass: { type: 'number', default: 1 },
                                                    linearDamping: { type: 'number', default: 0 },
                                                    angularDamping: { type: 'number', default: 0 },
                                                    linearFactor: { type: 'array', default: [1, 1, 1] },
                                                    angularFactor: { type: 'array', default: [1, 1, 1] },
                                                    friction: { type: 'number', default: 0.5 },
                                                    restitution: { type: 'number', default: 0 },
                                                    rollingFriction: { type: 'number', default: 0 }
                                                }
                                            },
                                            script: {
                                                type: 'object',
                                                properties: {
                                                    enabled: { type: 'boolean', default: true },
                                                    order: { type: 'array', items: { type: 'string' }, default: [] },
                                                    scripts: { type: 'object', default: {} }
                                                }
                                            },
                                            anim: {
                                                type: 'object',
                                                properties: {
                                                    enabled: { type: 'boolean', default: true },
                                                    speed: { type: 'number', default: 1 },
                                                    activate: { type: 'boolean', default: true },
                                                    stateGraphAsset: { type: 'number', default: null },
                                                    layers: { type: 'object', default: {} },
                                                    parameters: { type: 'object', default: {} }
                                                }
                                            },
                                            animation: {
                                                type: 'object',
                                                properties: {
                                                    enabled: { type: 'boolean', default: true },
                                                    assets: { type: 'array', items: { type: 'number' }, default: [] },
                                                    speed: { type: 'number', default: 1 },
                                                    loop: { type: 'boolean', default: true },
                                                    activate: { type: 'boolean', default: true }
                                                }
                                            },
                                            audiolistener: {
                                                type: 'object',
                                                properties: {
                                                    enabled: { type: 'boolean', default: true }
                                                }
                                            },
                                            sound: {
                                                type: 'object',
                                                properties: {
                                                    enabled: { type: 'boolean', default: true },
                                                    volume: { type: 'number', default: 1 },
                                                    pitch: { type: 'number', default: 1 },
                                                    positional: { type: 'boolean', default: true },
                                                    distanceModel: { type: 'string', default: 'linear' },
                                                    refDistance: { type: 'number', default: 1 },
                                                    maxDistance: { type: 'number', default: 10000 },
                                                    rollOffFactor: { type: 'number', default: 1 },
                                                    slots: { type: 'object', default: {} }
                                                }
                                            },
                                            element: {
                                                type: 'object',
                                                properties: {
                                                    enabled: { type: 'boolean', default: true },
                                                    type: { type: 'string', default: 'group' },
                                                    anchor: { type: 'array', default: [0.5, 0.5, 0.5, 0.5] },
                                                    pivot: { type: 'array', default: [0.5, 0.5] },
                                                    width: { type: 'number', default: 32 },
                                                    height: { type: 'number', default: 32 },
                                                    margin: { type: 'array', default: [0, 0, 0, 0] },
                                                    alignment: { type: 'array', default: [0.5, 0.5] },
                                                    text: { type: 'string', default: '' },
                                                    fontAsset: { type: 'number', default: null },
                                                    fontSize: { type: 'number', default: 32 },
                                                    color: { type: 'array', default: [1, 1, 1] },
                                                    opacity: { type: 'number', default: 1 },
                                                    textureAsset: { type: 'number', default: null },
                                                    spriteAsset: { type: 'number', default: null },
                                                    layers: { type: 'array', items: { type: 'number' }, default: [0] }
                                                }
                                            },
                                            screen: {
                                                type: 'object',
                                                properties: {
                                                    enabled: { type: 'boolean', default: true },
                                                    screenSpace: { type: 'boolean', default: true },
                                                    scaleMode: { type: 'string', default: 'none' },
                                                    scaleBlend: { type: 'number', default: 0.5 },
                                                    resolution: { type: 'array', default: [1280, 720] },
                                                    referenceResolution: { type: 'array', default: [1280, 720] }
                                                }
                                            },
                                            button: {
                                                type: 'object',
                                                properties: {
                                                    enabled: { type: 'boolean', default: true },
                                                    active: { type: 'boolean', default: true },
                                                    imageEntity: { type: 'string', default: null },
                                                    hitPadding: { type: 'array', default: [0, 0, 0, 0] },
                                                    transitionMode: { type: 'number', default: 0 }
                                                }
                                            },
                                            scrollview: {
                                                type: 'object',
                                                properties: {
                                                    enabled: { type: 'boolean', default: true },
                                                    scrollMode: { type: 'number', default: 0 },
                                                    bounceAmount: { type: 'number', default: 0.1 },
                                                    friction: { type: 'number', default: 0.05 },
                                                    viewportEntity: { type: 'string', default: null },
                                                    contentEntity: { type: 'string', default: null }
                                                }
                                            },
                                            scrollbar: {
                                                type: 'object',
                                                properties: {
                                                    enabled: { type: 'boolean', default: true },
                                                    orientation: { type: 'number', default: 0 },
                                                    value: { type: 'number', default: 0 },
                                                    handleSize: { type: 'number', default: 0.5 },
                                                    handleEntity: { type: 'string', default: null }
                                                }
                                            },
                                            layoutgroup: {
                                                type: 'object',
                                                properties: {
                                                    enabled: { type: 'boolean', default: true },
                                                    orientation: { type: 'number', default: 0 },
                                                    reverseX: { type: 'boolean', default: false },
                                                    reverseY: { type: 'boolean', default: false },
                                                    alignment: { type: 'array', default: [0, 0] },
                                                    padding: { type: 'array', default: [0, 0, 0, 0] },
                                                    spacing: { type: 'array', default: [0, 0] },
                                                    widthFitting: { type: 'number', default: 0 },
                                                    heightFitting: { type: 'number', default: 0 },
                                                    wrap: { type: 'boolean', default: false }
                                                }
                                            },
                                            layoutchild: {
                                                type: 'object',
                                                properties: {
                                                    enabled: { type: 'boolean', default: true },
                                                    minWidth: { type: 'number', default: 0 },
                                                    minHeight: { type: 'number', default: 0 },
                                                    maxWidth: { type: 'number', default: null },
                                                    maxHeight: { type: 'number', default: null },
                                                    fitWidthProportion: { type: 'number', default: 0 },
                                                    fitHeightProportion: { type: 'number', default: 0 },
                                                    excludeFromLayout: { type: 'boolean', default: false }
                                                }
                                            },
                                            sprite: {
                                                type: 'object',
                                                properties: {
                                                    enabled: { type: 'boolean', default: true },
                                                    type: { type: 'string', default: 'simple' },
                                                    frame: { type: 'number', default: 0 },
                                                    speed: { type: 'number', default: 1 },
                                                    spriteAsset: { type: 'number', default: null },
                                                    width: { type: 'number', default: 1 },
                                                    height: { type: 'number', default: 1 },
                                                    color: { type: 'array', default: [1, 1, 1] },
                                                    opacity: { type: 'number', default: 1 },
                                                    clips: { type: 'object', default: {} },
                                                    autoPlayClip: { type: 'string', default: null },
                                                    batchGroupId: { type: 'number', default: null },
                                                    layers: { type: 'array', items: { type: 'number' }, default: [0] }
                                                }
                                            },
                                            particlesystem: {
                                                type: 'object',
                                                properties: {
                                                    enabled: { type: 'boolean', default: true },
                                                    numParticles: { type: 'number', default: 30 },
                                                    lifetime: { type: 'number', default: 5 },
                                                    rate: { type: 'number', default: 0.1 },
                                                    colorMap: { type: 'number', default: null },
                                                    layers: { type: 'array', items: { type: 'number' }, default: [0] }
                                                }
                                            },
                                            zone: {
                                                type: 'object',
                                                properties: {
                                                    enabled: { type: 'boolean', default: true },
                                                    size: { type: 'array', default: [1, 1, 1] }
                                                }
                                            },
                                            gsplat: {
                                                type: 'object',
                                                properties: {
                                                    enabled: { type: 'boolean', default: true },
                                                    asset: { type: 'number', default: null },
                                                    layers: { type: 'array', items: { type: 'number' }, default: [0] }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                asset: {
                    type: 'object',
                    properties: {
                        type: {
                            type: 'string',
                            enum: [
                                'animation', 'animstategraph', 'audio', 'bundle', 'container',
                                'css', 'cubemap', 'font', 'gsplat', 'html', 'json',
                                'material', 'model', 'render', 'script', 'shader',
                                'sprite', 'text', 'texture', 'textureAtlas', 'wasm'
                            ]
                        }
                    }
                }
            },
            assetData: {
                material: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', default: 'New Material' },
                        diffuse: { type: 'array', default: [1, 1, 1] },
                        diffuseTint: { type: 'boolean', default: false },
                        diffuseVertexColor: { type: 'boolean', default: false },
                        diffuseVertexColorChannel: { type: 'string', default: 'r' },
                        diffuseMap: { type: 'number', default: null },
                        diffuseMapChannel: { type: 'string', default: 'rgb' },
                        diffuseMapUv: { type: 'number', default: 0 },
                        diffuseMapTiling: { type: 'array', default: [1, 1] },
                        diffuseMapOffset: { type: 'array', default: [0, 0] },
                        diffuseMapRotation: { type: 'number', default: 0 },
                        specular: { type: 'array', default: [0, 0, 0] },
                        specularTint: { type: 'boolean', default: false },
                        specularVertexColor: { type: 'boolean', default: false },
                        specularMap: { type: 'number', default: null },
                        useMetalness: { type: 'boolean', default: true },
                        metalness: { type: 'number', default: 1, minimum: 0, maximum: 1 },
                        metalnessMap: { type: 'number', default: null },
                        metalnessMapChannel: { type: 'string', default: 'r' },
                        metalnessVertexColor: { type: 'boolean', default: false },
                        shininess: { type: 'number', default: 100, minimum: 0, maximum: 100 },
                        glossMap: { type: 'number', default: null },
                        glossMapChannel: { type: 'string', default: 'r' },
                        glossVertexColor: { type: 'boolean', default: false },
                        useMetalnessSpecularColor: { type: 'boolean', default: false },
                        specularityFactor: { type: 'number', default: 1, minimum: 0, maximum: 1 },
                        specularityFactorMap: { type: 'number', default: null },
                        emissive: { type: 'array', default: [0, 0, 0] },
                        emissiveIntensity: { type: 'number', default: 1 },
                        emissiveMap: { type: 'number', default: null },
                        normalMap: { type: 'number', default: null },
                        bumpMapFactor: { type: 'number', default: 1 },
                        heightMap: { type: 'number', default: null },
                        heightMapFactor: { type: 'number', default: 1 },
                        opacity: { type: 'number', default: 1, minimum: 0, maximum: 1 },
                        opacityMap: { type: 'number', default: null },
                        blendType: { type: 'number', default: 0 },
                        cull: { type: 'number', default: 1 },
                        ambient: { type: 'array', default: [0.2, 0.2, 0.2] },
                        aoMap: { type: 'number', default: null },
                        aoIntensity: { type: 'number', default: 1 },
                        occludeSpecular: { type: 'number', default: 0 },
                        clearCoat: { type: 'number', default: 0 },
                        clearCoatGloss: { type: 'number', default: 1 },
                        clearCoatBumpiness: { type: 'number', default: 1 },
                        clearCoatNormalMap: { type: 'number', default: null },
                        clearCoatMap: { type: 'number', default: null },
                        clearCoatGlossMap: { type: 'number', default: null },
                        useSheen: { type: 'boolean', default: false },
                        sheen: { type: 'array', default: [1, 1, 1] },
                        sheenMap: { type: 'number', default: null },
                        sheenGloss: { type: 'number', default: 0 },
                        sheenGlossMap: { type: 'number', default: null },
                        useDynamicRefraction: { type: 'boolean', default: false },
                        refractionIndex: { type: 'number', default: 1.5 },
                        thickness: { type: 'number', default: 0 },
                        thicknessMap: { type: 'number', default: null },
                        attenuation: { type: 'array', default: [1, 1, 1] },
                        attenuationDistance: { type: 'number', default: 0 },
                        useIridescence: { type: 'boolean', default: false },
                        iridescence: { type: 'number', default: 1 },
                        iridescenceMap: { type: 'number', default: null },
                        iridescenceThickness: { type: 'number', default: 100 },
                        iridescenceThicknessMap: { type: 'number', default: null },
                        sphereMap: { type: 'number', default: null },
                        cubeMap: { type: 'number', default: null },
                        cubeMapProjection: { type: 'number', default: 0 },
                        lightMap: { type: 'number', default: null },
                        enableGGXSpecular: { type: 'boolean', default: false },
                        anisotropyIntensity: { type: 'number', default: 0 },
                        anisotropyRotation: { type: 'number', default: 0 },
                        anisotropyMap: { type: 'number', default: null },
                        alphaTest: { type: 'number', default: 0 },
                        alphaFade: { type: 'boolean', default: true },
                        opacityFadesSpecular: { type: 'boolean', default: true },
                        twoSidedLighting: { type: 'boolean', default: false },
                        useLighting: { type: 'boolean', default: true },
                        useFog: { type: 'boolean', default: true },
                        useSkybox: { type: 'boolean', default: true }
                    }
                },
                animstategraph: {
                    type: 'object',
                    properties: {}
                }
            }
        },
        wasmModules: []
    };
}

async function loadProject(projectId) {
    const project = await supabaseSingle('editor_projects', `id=eq.${projectId}`);
    if (!project) return null;
    return {
        id: project.id,
        name: project.name,
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
        masterBranch: project.master_branch || 'main',
        createdAt: project.created_at,
        updatedAt: project.updated_at,
    };
}

async function loadScene(projectId) {
    const scenes = await supabaseQuery('editor_scenes', `project_id=eq.${projectId}&order=created_at.asc&limit=1`);
    if (!scenes || scenes.length === 0) return null;
    const scene = scenes[0];
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
    const rawSettings = scene.settings || {};
    return {
        id: scene.id,
        uniqueId: scene.unique_id || scene.id,
        name: scene.name,
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
