/**
 * IWSDK Engine Adapter
 *
 * Implements the EngineAdapter contract for Meta Immersive Web SDK (IWSDK)
 * with SparkJS Gaussian Splat rendering.
 *
 * Uses dynamic imports for browser-only modules (IWSDK, SparkJS).
 * Runs on upstream three.js 0.185.1 (via pnpm override @iwsdk/core>three=0.185.1).
 */

import * as THREE from 'three';
import {
  EngineAdapter,
  EngineCommand,
  EngineEvent,
  EngineInitOptions,
  EngineType,
  SceneSnapshot,
  TelemetryMetrics,
  RaycastHit,
  SceneEntity,
  PBRMaterialData,
  HotspotData,
  SpatialAlignment,
  AlignmentMarker,
} from '../types';

// Dynamic import helpers for browser-only modules
const loadIWSDK = () => import('@iwsdk/core');
const loadSparkJS = () => import('@sparkjsdev/spark');

export class IWSDKEngineAdapter implements EngineAdapter {
  public readonly engineType: EngineType = 'iwSDK';
  public isInitialized = false;

  private container: HTMLElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;

  // XR rig (camera + controllers move together for locomotion)
  private xrRig: THREE.Group | null = null;
  private controllers: any[] = [];
  private laserGeo: THREE.BufferGeometry | null = null;
  private laserMat: THREE.LineBasicMaterial | null = null;

  // IWSDK World
  private world: any = null; // IWSDK World instance
  private iwSDKModule: any = null; // Loaded @iwsdk/core module
  private sparkModule: any = null; // Loaded @sparkjsdev/spark module

  // SparkJS
  private sparkRenderer: any = null; // SparkJS SparkRenderer instance
  private splatMeshes: Map<string, any> = new Map(); // SplatMesh instances

  // Three.js registries (for compatibility with EngineBridge expectations)
  private entityMap: Map<string, THREE.Object3D> = new Map();
  private materialMap: Map<string, THREE.Material> = new Map();
  private hotspotMap: Map<string, THREE.Sprite | THREE.Mesh> = new Map();

  // Raycasting & Interaction (using Three.js raycaster for IWSDK entities)
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private selectedEntityId: string | null = null;

  // Render loop & Telemetry
  private animationFrameId: number | null = null;
  private eventHandlers: Set<(event: EngineEvent) => void> = new Set();
  private lastFrameTime = performance.now();
  private frameCount = 0;
  private lastFpsSampleTime = performance.now();
  private currentFps = 60;
  private isDisposed = false;

  // Camera orbit controls (for desktop simulation)
  private isOrbiting = false;
  private previousMousePosition = { x: 0, y: 0 };
  private spherical = { radius: 10, theta: 0.78, phi: 1.1 };
  private cameraTarget = new THREE.Vector3(0, 0, 0);

  // Snapshot cache
  private currentSnapshot: SceneSnapshot = {
    id: 'iwSDK-scene',
    version: 1,
    name: 'IWSDK Scene',
    engine: 'iwSDK',
    camera: {
      position: { x: 5, y: 5, z: 5 },
      target: { x: 0, y: 0, z: 0 },
      fov: 60,
    },
    entities: [],
    materials: [],
    hotspots: [],
    updatedAt: new Date().toISOString(),
  };

  public async init(options: EngineInitOptions): Promise<void> {
    if (this.isInitialized) return;
    this.container = options.container;

    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 600;

    // 1. Load IWSDK and SparkJS dynamically (browser-only)
    const [iwSDK, spark] = await Promise.all([loadIWSDK(), loadSparkJS()]);
    this.iwSDKModule = iwSDK;
    this.sparkModule = spark;

    // 2. Create Three.js scene/renderer for IWSDK to render into
    const arMode = options.xrMode === 'immersive-ar';

    this.scene = new THREE.Scene();
    // AR must render on a transparent background so the immersive-ar camera
    // passthrough is visible behind the scene. Opaque elsewhere.
    this.scene.background = arMode ? null : new THREE.Color(options.backgroundColor || '#131314');

    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.set(0, 1.6, 3);
    this.camera.lookAt(0, 1.6, 0);

    // Rig so locomotion moves camera + controllers together.
    this.xrRig = new THREE.Group();
    this.scene.add(this.xrRig);
    this.xrRig.add(this.camera);

    this.renderer = new THREE.WebGLRenderer({
      canvas: options.canvas,
      antialias: options.antialias ?? true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, options.pixelRatio || 2));
    this.renderer.xr.enabled = true; // Enable WebXR
    this.setupControllers();

    if (arMode) {
      // Transparent clear colour + transparent canvas = camera passthrough.
      this.renderer.setClearColor(0x000000, 0);
      const canvas = this.renderer.domElement;
      canvas.style.background = 'transparent';
      canvas.style.position = 'fixed';
      canvas.style.inset = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.zIndex = '0';
    }

    if (!options.canvas && this.container) {
      this.container.appendChild(this.renderer.domElement);
    }

    // Render loop. three.js drives XR frames automatically once a session is set.
    this.renderer.setAnimationLoop(this.renderFrame);

    // 3. Initialize IWSDK World
    const { World, SessionMode } = this.iwSDKModule;
    const sessionMode = arMode
      ? (SessionMode?.ImmersiveAR ?? 'immersive-ar')
      : (SessionMode?.ImmersiveVR ?? 'immersive-vr');
    const features: any = {
      locomotion: true,
      grabbing: true,
      spatialUI: true,
      physics: false, // Havok not installed; physics disabled
    };
    this.world = await World.create(this.renderer.domElement, {
      xr: {
        sessionMode,
        offer: 'none', // Don't auto-offer; let UI trigger (preserves user gesture)
        requiredFeatures: arMode ? ['hit-test'] : ['local-floor', 'bounded-floor'],
        optionalFeatures: arMode
          ? ['dom-overlay', 'local-floor', 'anchors']
          : ['hand-tracking', 'layers', 'depth-sensing', 'hit-test'],
      },
      features,
      render: {
        fov: 60,
        near: 0.1,
        far: 200,
      },
    });

    // 4. Create SparkJS renderer (for Gaussian splats)
    const { SparkRenderer } = this.sparkModule;
    this.sparkRenderer = new SparkRenderer({
      renderer: this.renderer,
      enableLod: true,
      lodSplatScale: 1.0,
      behindFoveate: 0.1,
    });
    if (this.sparkRenderer && this.scene) {
      this.scene.add(this.sparkRenderer);
    }

    // 5. Attach Three.js camera to IWSDK (IWSDK manages its own camera for XR)
    // We sync our Three.js camera with IWSDK's camera for desktop simulation
    this.syncCameraFromIWSDK();

    // 5. Bind DOM interactions for desktop simulation
    this.attachEventListeners();

    this.isInitialized = true;

    this.emit({
        type: 'ENGINE_READY',
        payload: { engine: 'iwSDK', version: this.iwSDKModule.VERSION || '1.2.0-rc.0' },
      });
  }

  /** Attach WebXR controllers (laser pointers + grip models) to the rig. */
  private setupControllers(): void {
    if (!this.renderer || !this.xrRig) return;
    const raycaster = new THREE.Raycaster();
    const tempMatrix = new THREE.Matrix4();

    import('three/examples/jsm/webxr/XRControllerModelFactory.js')
      .then(({ XRControllerModelFactory }) => {
        if (!this.renderer || !this.xrRig || this.isDisposed) return;
        const factory = new XRControllerModelFactory();
        this.laserGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 0, -1),
        ]);
        this.laserMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.85 });

        for (let i = 0; i < 2; i++) {
          const controller = this.renderer.xr.getController(i);
          const grip = this.renderer.xr.getControllerGrip(i);
          grip.add(factory.createControllerModel(grip));
          const laser = new THREE.Line(this.laserGeo, this.laserMat);
          laser.scale.z = 5;
          controller.add(laser);
          controller.addEventListener('selectstart', () => {
            tempMatrix.identity().extractRotation(controller.matrixWorld);
            raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
            raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
            const hits = raycaster.intersectObjects(Array.from(this.entityMap.values()), true);
            if (hits[0]) {
              this.selectedEntityId = hits[0].object.name || this.selectedEntityId;
              this.emit({ type: 'SELECTION_CHANGED', payload: { selectedIds: this.selectedEntityId ? [this.selectedEntityId] : [] } });
            }
          });
          controller.addEventListener('squeezestart', () => {
            if (this.xrRig) this.xrRig.rotation.y += Math.PI / 6; // 30° snap turn
          });
          this.xrRig.add(controller, grip);
          this.controllers.push(controller);
        }
      })
      .catch(() => {
        /* controllers optional */
      });
  }

  /** Apply shared viewer settings (scale / rotation / elevation) to the model. */
  public applyTransform(settings: any): void {
    const model = this.entityMap.get('model');
    if (!model || !settings) return;
    if (typeof settings.scale === 'number' && settings.scale > 0) model.scale.setScalar(settings.scale);
    if (typeof settings.rotationY === 'number') model.rotation.y = THREE.MathUtils.degToRad(settings.rotationY);
    if (typeof settings.elevation === 'number') model.position.y = settings.elevation;
  }

  /**
   * three.js animation-loop callback. Renders the scene every frame; when an
   * immersive session is active, three.js redirects this to the XR framebuffer.
   * Also drives thumbstick locomotion + snap-turn in VR.
   */
  private renderFrame = () => {
    if (!this.renderer || !this.scene || !this.camera) return;

    if (this.renderer.xr.isPresenting && this.xrRig) {
      const session = this.renderer.xr.getSession();
      if (session) {
        for (const src of Array.from((session as any).inputSources as any)) {
          const gp = (src as any).gamepad;
          if (!gp) continue;
          const ax = gp.axes || [];
          const y = ax[3] ?? ax[1] ?? 0;
          const x = ax[2] ?? ax[0] ?? 0;
          if (Math.abs(y) > 0.15) {
            const dir = new THREE.Vector3(0, 0, -y * 0.06).applyAxisAngle(
              new THREE.Vector3(0, 1, 0),
              this.xrRig.rotation.y
            );
            this.xrRig.position.add(dir);
          }
          if (Math.abs(x) > 0.15) this.xrRig.rotation.y -= x * 0.03;
        }
      }
    }

    this.renderer.render(this.scene, this.camera);
  };

  /**
   * Start an immersive session.
   *
   * `session` is an optional pre-created XRSession (requested synchronously from
   * a user-gesture click handler in the UI so the browser will prompt for camera
   * access). When omitted, IWSDK creates the session itself.
   */
  public async startXR(
    session?: unknown,
    mode: 'immersive-ar' | 'immersive-vr' = 'immersive-vr'
  ): Promise<boolean> {
    if (!this.renderer) return false;

    if (mode === 'immersive-ar' && this.renderer.xr) {
      // AR runs in a 'local' reference space; three.js defaults to 'local-floor'.
      try {
        this.renderer.xr.setReferenceSpaceType('local');
      } catch {
        /* ignore on runtimes without setReferenceSpaceType */
      }
    }

    try {
      if (session) {
        // Prefer three.js' WebXR manager: it composites the transparent AR
        // canvas over the live camera feed and renders our scene each frame.
        if (this.renderer.xr && typeof this.renderer.xr.setSession === 'function') {
          await this.renderer.xr.setSession(session as never);
        } else if (this.world && typeof this.world.launchXR === 'function') {
          await this.world.launchXR({ sessionMode: mode, session });
        } else {
          return false;
        }
      } else if (this.world && typeof this.world.launchXR === 'function') {
        await this.world.launchXR({ sessionMode: mode });
      } else {
        return false;
      }
      this.emit({
        type: 'ENGINE_READY',
        payload: { engine: 'iwSDK', version: this.iwSDKModule?.VERSION || '1.2.0-rc.0' },
      });
      return true;
    } catch (err) {
      this.emit({
        type: 'ENGINE_ERROR',
        payload: {
          code: 'XR_SESSION_FAILED',
          message: err instanceof Error ? err.message : String(err),
        },
      });
      return false;
    }
  }

  public destroy(): void {
    this.isDisposed = true;

    // End any active immersive session before tearing down the renderer.
    try {
      const session = this.renderer?.xr?.getSession?.();
      if (session && typeof session.end === 'function') {
        session.end().catch(() => {});
      }
    } catch {
      /* no active session */
    }

    // Dispose XR controllers + laser resources.
    for (const c of this.controllers) {
      try {
        this.xrRig?.remove(c);
      } catch {
        /* ignore */
      }
    }
    this.controllers = [];
    try {
      this.laserGeo?.dispose();
      this.laserMat?.dispose();
    } catch {
      /* ignore */
    }
    this.laserGeo = null;
    this.laserMat = null;
    this.xrRig = null;

    // Stop IWSDK render loop
    if (this.world) {
      this.world.destroy();
      this.world = null;
    }

    // Dispose SparkJS
    if (this.sparkRenderer) {
      this.sparkRenderer.dispose();
      this.scene?.remove(this.sparkRenderer);
      this.sparkRenderer = null;
    }

    // Dispose SplatMeshes
    this.splatMeshes.forEach((splat) => {
      splat.dispose();
    });
    this.splatMeshes.clear();

    // Stop render loop
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.detachEventListeners();

    // Dispose Three.js resources
    this.entityMap.forEach((obj) => this.disposeObject(obj));
    this.entityMap.clear();
    this.materialMap.forEach((mat) => mat.dispose());
    this.materialMap.clear();

    if (this.renderer) {
      // Stop the three.js render loop before disposing.
      this.renderer.setAnimationLoop(null);
      this.renderer.dispose();
      if (this.renderer.domElement.parentElement) {
        this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
      }
      this.renderer = null;
    }

    if (this.world) {
      this.world.destroy();
      this.world = null;
    }

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.container = null;
    this.isInitialized = false;
    this.eventHandlers.clear();
  }

  public resize(width: number, height: number): void {
    if (!this.renderer || !this.camera || height === 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    // Also resize IWSDK world if it has a resize method
    if (this.world && typeof this.world.resize === 'function') {
      this.world.resize(width, height);
    }
  }

  public async dispatchCommand(command: EngineCommand): Promise<boolean> {
    if (!this.isInitialized || !this.world) return false;

    switch (command.type) {
      case 'LOAD_SCENE': {
        if (command.payload.snapshot) {
          await this.loadSceneSnapshot(command.payload.snapshot);
          return true;
        }
        return false;
      }

      case 'LAUNCH_XR': {
        const session = command.payload?.session;
        const mode = command.payload?.mode ?? 'immersive-vr';
        return this.startXR(session, mode);
      }

      case 'SET_CAMERA_POSE': {
        const p = command.payload;
        // IWSDK manages its own camera in XR; for desktop we update our synced camera
        if (p.position && this.camera) {
          this.camera.position.set(p.position.x, p.position.y, p.position.z);
        }
        if (p.target) {
          this.camera.lookAt(p.target.x, p.target.y, p.target.z);
        }
        if (p.fov && this.camera) {
          this.camera.fov = p.fov;
          this.camera.updateProjectionMatrix();
        }
        return true;
      }

      case 'SELECT_ENTITY': {
        // IWSDK entities are managed differently; we track selection for UI
        const { entityId } = command.payload;
        this.selectedEntityId = entityId;
        this.emit({
          type: 'SELECTION_CHANGED',
          payload: { selectedIds: entityId ? [entityId] : [] },
        });
        return true;
      }

      case 'TRANSFORM_ENTITY': {
        // IWSDK entities are ECS components; not directly transformable via Three.js
        // For now, return true (no-op) — real implementation would use IWSDK ECS
        return true;
      }

      case 'SET_ENTITY_VISIBILITY': {
        // Not directly supported for IWSDK entities
        return true;
      }

      case 'ADD_HOTSPOT': {
        // IWSDK uses spatial UI panels; create a PanelUI entity
        const { PanelUI, Interactable } = this.iwSDKModule;
        const panel = this.world.createTransformEntity()
          .addComponent(PanelUI, {
            markup: `<ui-kit><ui-panel style="padding:12px;background:#201f20cc;border-radius:8px"><ui-label style="font-size:28px;color:#dbfcff">${command.payload.title || 'Hotspot'}</ui-label></ui-panel></ui-kit>`,
            maxHeight: 0.5,
            maxWidth: 0.8,
          })
          .addComponent(this.iwSDKModule.Interactable);
        if (command.payload.position) {
          panel.object3D!.position.set(
            command.payload.position.x,
            command.payload.position.y,
            command.payload.position.z
          );
        }
        panel.addComponent(this.iwSDKModule.Interactable);
        return true;
      }

      case 'SET_GRID_VISIBLE': {
        // IWSDK doesn't use a grid; no-op
        return true;
      }

      case 'FOCUS_ENTITY': {
        // Teleport to entity — use IWSDK locomotor
        return true;
      }

      case 'RESET_VIEW': {
        this.camera.position.set(0, 1.6, 3);
        this.camera.lookAt(0, 1.6, 0);
        this.cameraTarget.set(0, 1.6, 0);
        this.syncCameraToIWSDK();
        return true;
      }

      default:
        return false;
    }
  }

  public onEvent(handler: (event: EngineEvent) => void): () => void {
    this.eventHandlers.add(handler);
    return () => {
      this.eventHandlers.delete(handler);
    };
  }

  public getSceneSnapshot(): SceneSnapshot {
    const entities: SceneEntity[] = [];
    this.entityMap.forEach((obj, id) => {
      entities.push({
        id,
        name: obj.name || id,
        type: 'mesh',
        position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
        rotation: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z },
        scale: { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z },
        visible: obj.visible,
      });
    });

    const materials: PBRMaterialData[] = [];
    this.materialMap.forEach((mat, id) => {
      if (mat instanceof THREE.MeshStandardMaterial) {
        materials.push({
          id,
          name: mat.name,
          color: '#' + mat.color.getHexString(),
          roughness: mat.roughness,
          metalness: mat.metalness,
          opacity: mat.opacity,
          wireframe: mat.wireframe,
        });
      }
    });

    return {
      ...this.currentSnapshot,
      entities,
      materials,
      camera: {
        position: {
          x: this.camera?.position.x || 5,
          y: this.camera?.position.y || 5,
          z: this.camera?.position.z || 5,
        },
        target: {
          x: this.cameraTarget.x,
          y: this.cameraTarget.y,
          z: this.cameraTarget.z,
        },
        fov: this.camera?.fov || 60,
      },
      updatedAt: new Date().toISOString(),
    };
  }

  public async loadSceneSnapshot(snapshot: SceneSnapshot): Promise<void> {
    if (!this.scene) return;
    this.currentSnapshot = snapshot;

    // Clear existing Three.js entities
    this.entityMap.forEach((obj) => {
      if (this.scene) this.scene.remove(obj);
      this.disposeObject(obj);
    });
    this.entityMap.clear();

    // Load Gaussian Splat if present in settings
    const splatUrl = (snapshot.settings as any)?.splat?.url;
    if (splatUrl) {
      await this.loadSplat(splatUrl);
    }

    // Load a GLB model for AR placement / 3D preview (Draco supported).
    const modelUrl =
      (snapshot.settings as any)?.modelUrl || (snapshot.settings as any)?.glbUrl;
    if (modelUrl) {
      await this.loadModel(modelUrl);
    }

    // Load GLB collision mesh if present
    const colliderUrl = (snapshot.settings as any)?.colliderUrl;
    if (colliderUrl) {
      await this.loadCollider(colliderUrl);
    }

    // Restore Camera
    if (snapshot.camera && this.camera) {
      this.camera.position.set(
        snapshot.camera.position.x,
        snapshot.camera.position.y,
        snapshot.camera.position.z
      );
      this.cameraTarget.set(
        snapshot.camera.target.x,
        snapshot.camera.target.y,
        snapshot.camera.target.z
      );
      this.camera.lookAt(this.cameraTarget);
      this.syncCameraToIWSDK();
    }

    this.emit({ type: 'SCENE_LOADED', payload: { snapshot } });
  }

  public getTelemetry(): TelemetryMetrics {
    let drawCalls = 0;
    let triangles = 0;

    if (this.renderer) {
      drawCalls = this.renderer.info.render.calls;
      triangles = this.renderer.info.render.triangles;
    }

    // Add SparkJS splat counts if available
    let splatCount = 0;
    this.splatMeshes.forEach((splat) => {
      if (splat.geometry?.attributes?.position) {
        triangles += splat.geometry.attributes.position.count;
        splatCount++;
      }
    });

    return {
      fps: this.currentFps,
      frameTimeMs: performance.now() - this.lastFrameTime,
      drawCalls,
      triangles,
      splatCount,
      memoryUsageMb: (performance as any).memory
        ? Math.round((performance as any).memory.usedJSHeapSize / (1024 * 1024))
        : undefined,
      webglContextState: 'active',
    };
  }

  // --------------------------------------------------------------------------
  // IWSDK/SparkJS Specific Methods
  // --------------------------------------------------------------------------

  private async loadSplat(url: string): Promise<void> {
    if (!this.sparkModule || !this.sparkRenderer) return;

    const { SplatMesh } = this.sparkModule;
    const splat = new this.sparkModule.SplatMesh({
      url,
      lod: true,
    });

    await splat.initialized;

    splat.position.set(0, 1.4, -1);
    splat.scale.setScalar(0.6);

    this.scene?.add(splat);
    this.splatMeshes.set(url, splat);
  }

  private async loadCollider(url: string): Promise<void> {
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(url);

    gltf.scene.traverse((child: any) => {
      if (child.isMesh) {
        // Use as invisible collision mesh for IWSDK locomotor
        child.visible = false;
        const { LocomotionEnvironment, EnvironmentType } = this.iwSDKModule;
        const entity = this.world.createTransformEntity(child);
        entity.addComponent(this.iwSDKModule.LocomotionEnvironment, { type: EnvironmentType.STATIC });
      }
    });
  }

  /**
   * Load a GLB model (Draco-compressed or plain) and place it in front of the
   * viewer. In immersive-ar the model sits ~2m ahead so it appears in the room.
   */
  private async loadModel(url: string): Promise<void> {
    if (!this.scene) return;
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js');
    const draco = new DRACOLoader();
    draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);

    const gltf = await loader.loadAsync(url);
    const model = gltf.scene;
    model.position.set(0, 0, -2);
    this.scene.add(model);
    this.entityMap.set('model', model);
    draco.dispose();
  }

  // --------------------------------------------------------------------------
  // Camera Sync (Three.js <-> IWSDK)
  // --------------------------------------------------------------------------

  private syncCameraFromIWSDK(): void {
    if (!this.world || !this.camera) return;
    // IWSDK manages its own camera for XR; we read its pose for desktop
    const iwSDKCamera = this.world.camera;
    if (iwSDKCamera) {
      this.camera.position.copy(iwSDKCamera.position);
      this.camera.quaternion.copy(iwSDKCamera.quaternion);
    }
  }

  private syncCameraToIWSDK(): void {
    if (!this.world || !this.camera) return;
    // For desktop simulation, sync our Three.js camera to IWSDK
    const iwSDKCamera = this.world.camera;
    if (iwSDKCamera) {
      iwSDKCamera.position.copy(this.camera.position);
      iwSDKCamera.quaternion.copy(this.camera.quaternion);
    }
  }

  // --------------------------------------------------------------------------
  // Event Listeners (Desktop Simulation)
  // --------------------------------------------------------------------------

  private attachEventListeners(): void {
    const el = this.renderer?.domElement;
    if (!el) return;

    el.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    el.addEventListener('wheel', this.onWheel, { passive: false });
    el.addEventListener('click', this.onClick);

    // XR session events
    if (this.renderer?.xr) {
      this.renderer.xr.addEventListener('sessionstart', this.onXRSessionStart);
      this.renderer.xr.addEventListener('sessionend', this.onXRSessionEnd);
    }
  }

  private detachEventListeners(): void {
    const el = this.renderer?.domElement;
    if (!el) return;

    el.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    el.removeEventListener('wheel', this.onWheel);
    el.removeEventListener('click', this.onClick);

    if (this.renderer?.xr) {
      this.renderer.xr.removeEventListener('sessionstart', this.onXRSessionStart);
      this.renderer.xr.removeEventListener('sessionend', this.onXRSessionEnd);
    }
  }

  private onMouseDown = (e: MouseEvent) => {
    if (e.button === 0 || e.button === 2) {
      this.isOrbiting = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    }
  };

  private onMouseMove = (e: MouseEvent) => {
    if (!this.isOrbiting) return;
    const deltaX = e.clientX - this.previousMousePosition.x;
    const deltaY = e.clientY - this.previousMousePosition.y;

    this.spherical.theta -= deltaX * 0.008;
    this.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.spherical.phi - deltaY * 0.008));
    this.previousMousePosition = { x: e.clientX, y: e.clientY };

    this.updateCameraFromSpherical();
  };

  private onMouseUp = () => {
    this.isOrbiting = false;
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    this.spherical.radius = Math.max(1, Math.min(100, this.spherical.radius + e.deltaY * 0.01));
    this.updateCameraFromSpherical();
  };

  private onClick = (e: MouseEvent) => {
    if (!this.renderer || !this.camera || !this.scene) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    // IWSDK entities are not in Three.js scene; raycast against Three.js objects only
    const meshes = Array.from(this.entityMap.values());
    const sprites = Array.from(this.hotspotMap.values());
    const intersects = this.raycaster.intersectObjects([...this.entityMap.values()], true);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const entityId = hit.object.userData.entityId;
      const hotspotId = hit.object.userData.hotspotId;

      if (entityId) {
        this.selectEntity(entityId);
      }

      const raycastHit: RaycastHit = {
        point: { x: hit.point.x, y: hit.point.y, z: hit.point.z },
        normal: hit.face ? { x: hit.face.normal.x, y: hit.face.normal.y, z: hit.face.normal.z } : undefined,
        distance: hit.distance,
        entityId,
      };

      this.emit({ type: 'POINTER_CLICK', payload: { hit: { ...raycastHit, entityId }, rawEvent: e } });
    } else {
      this.selectEntity(null);
      this.emit({ type: 'POINTER_CLICK', payload: { hit: null, rawEvent: e } });
    }
  };

  private selectEntity(entityId: string | null) {
    if (this.selectedEntityId) {
      const prev = this.entityMap.get(this.selectedEntityId);
      if (prev instanceof THREE.Mesh && prev.material instanceof THREE.MeshStandardMaterial) {
        prev.material.emissive.set(0x000000);
      }
    }

    this.selectedEntityId = entityId;

    if (entityId) {
      const current = this.entityMap.get(entityId);
      if (current instanceof THREE.Mesh && current.material instanceof THREE.MeshStandardMaterial) {
        current.material.emissive.set(0x333333);
      }
    }

    this.emit({
      type: 'SELECTION_CHANGED',
      payload: { selectedIds: entityId ? [entityId] : [] },
    });
  }

  private updateCameraFromSpherical() {
    if (!this.camera) return;
    const { radius, theta, phi } = this.spherical;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);

    this.camera.position.set(
      this.cameraTarget.x + x,
      this.cameraTarget.y + y,
      this.cameraTarget.z + z
    );
    this.camera.lookAt(this.cameraTarget);

    this.emit({
      type: 'CAMERA_MOVED',
      payload: {
        position: { x: this.camera.position.x, y: this.camera.position.y, z: this.camera.position.z },
        target: { x: this.cameraTarget.x, y: this.cameraTarget.y, z: this.cameraTarget.z },
        fov: this.camera.fov,
      },
    });
  }

  private disposeObject(obj: THREE.Object3D): void {
    if (obj instanceof THREE.Mesh) {
      obj.geometry?.dispose();
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => m.dispose());
      } else {
        obj.material?.dispose();
      }
    }
  }

  private emit(event: EngineEvent): void {
    this.eventHandlers.forEach((handler) => handler(event));
  }

  // XR Session handlers
  private onXRSessionStart = () => {
    this.emit({ type: 'ENGINE_READY', payload: { engine: 'iwSDK', version: this.iwSDKModule.VERSION || '1.2.0-rc.0' } });
  };

  private onXRSessionEnd = () => {
    this.syncCameraFromIWSDK(); // Restore desktop camera
  };
}