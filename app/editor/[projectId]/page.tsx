import { getProject, getScenes } from '@/lib/supabase-admin';
import EditorClient from './EditorClient';

export default async function EditorPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const [project, scenes] = await Promise.all([
    getProject(projectId),
    getScenes(projectId),
  ]);

  if (!project) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1a1a2e', color: '#fff', fontFamily: 'monospace' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Project Not Found</h1>
          <p style={{ color: '#888' }}>Project {projectId} does not exist in Supabase.</p>
        </div>
      </div>
    );
  }

  const scene = scenes[0] || null;

  const config = {
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
          howdoi: true,
        },
      },
      branch: {
        id: 'main',
        name: 'main',
        createdAt: new Date().toISOString(),
        latestCheckpointId: null,
      },
      plan: { id: 1, type: 'individual' },
      locale: 'en',
    },
    owner: {
      id: 1,
      username: 'viztr-user',
      plan: { id: 1, type: 'individual' },
      size: 0,
      diskAllowance: 10737418240,
    },
    accessToken: 'local-dev-token',
    project: {
      id: project.id,
      name: project.name,
      description: project.description || '',
      privateAssets: false,
      hasPrivateSettings: false,
      thumbnails: {},
      settings: {
        id: `settings_${project.id}`,
        engineV2: false,
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
          '3': { name: 'UI', opaqueSortMode: 0, transparentSortMode: 0 },
        },
        layerOrder: [
          { layer: 0, transparent: false, enabled: true },
          { layer: 1, transparent: false, enabled: true },
          { layer: 2, transparent: false, enabled: true },
          { layer: 3, transparent: true, enabled: true },
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
      fork_from: project.fork_from,
      permissions: project.permissions || { read: [1], admin: [1], write: [1] },
      private: project.private ?? true,
      primaryApp: 0,
      playUrl: '',
      masterBranch: project.master_branch || 'main',
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    },
    aws: { s3Prefix: '' },
    store: { sketchfab: { clientId: '', cookieName: '', redirectUrl: '' } },
    scene: scene
      ? {
          id: scene.id,
          uniqueId: scene.unique_id || scene.id,
          name: scene.name,
          entities: scene.entities || {},
          settings: {
            cameraClearColor: [0.117, 0.117, 0.117, 1],
            fog: { type: 0, color: [0, 0, 0], density: 0 },
            ambientLight: [0.2, 0.2, 0.2],
            skybox: null,
            skyboxIntensity: 1,
            skyboxMip: 0,
            toneMapping: 0,
            exposure: 1,
            gsplat: { enabled: true },
            ...(scene.settings || {}),
          },
        }
      : null,
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
      images: 'http://localhost:3487/',
    },
    engineVersions: {
      current: { version: '2.23.0-beta.0', description: 'VizTR Custom Engine' },
      force: { version: '2.23.0-beta.0', description: 'VizTR Custom Engine' },
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
              'x-scope': 'projectUser',
              properties: {
                cameraClearColor: { type: 'array', default: [0.117, 0.117, 0.117, 1], 'x-scope': 'projectUser' },
                cameraNearClip: { type: 'number', default: 0.0001, 'x-scope': 'projectUser' },
                cameraFarClip: { type: 'number', default: 1000, 'x-scope': 'projectUser' },
                cameraToneMapping: { type: 'number', default: 0, 'x-scope': 'projectUser' },
                cameraGammaCorrection: { type: 'number', default: 0, 'x-scope': 'projectUser' },
                showFog: { type: 'boolean', default: true, 'x-scope': 'projectUser' },
                snapIncrement: { type: 'number', default: 0.1, 'x-scope': 'projectUser' },
                gridSnap: { type: 'boolean', default: false, 'x-scope': 'projectUser' },
              },
            },
          },
        },
      },
      assetData: {},
    },
    wasmModules: [],
  };

  return <EditorClient config={config} />;
}