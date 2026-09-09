/**
 * Three.js Engine Adapter
 *
 * Implements the EngineAdapter contract for Three.js / WebGL.
 * Manages rendering, raycasting, camera controls, object transformations,
 * and emits typed events to the EngineBridge.
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
} from '../types';

export class ThreeEngineAdapter implements EngineAdapter {
  public readonly engineType: EngineType = 'three';
  public isInitialized = false;

  private container: HTMLElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private gridHelper: THREE.GridHelper | null = null;

  // Object Registry
  private entityMap: Map<string, THREE.Object3D> = new Map();
  private materialMap: Map<string, THREE.Material> = new Map();
  private hotspotMap: Map<string, THREE.Sprite | THREE.Mesh> = new Map();

  // Raycasting & Interaction
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

  // Orbit controls state (lightweight built-in camera orbit)
  private isOrbiting = false;
  private previousMousePosition = { x: 0, y: 0 };
  private spherical = { radius: 10, theta: 0.78, phi: 1.1 };
  private cameraTarget = new THREE.Vector3(0, 0, 0);

  // Snapshot cache
  private currentSnapshot: SceneSnapshot = {
    id: 'default-three-scene',
    version: 1,
    name: 'Three.js Scene',
    engine: 'three',
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

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(options.backgroundColor || '#09090b');

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.updateCameraFromSpherical();

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: options.canvas,
      antialias: options.antialias ?? true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, options.pixelRatio || 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    if (!options.canvas && this.container) {
      this.container.appendChild(this.renderer.domElement);
    }

    // 4. Default Environment & Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 15, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    this.scene.add(dirLight);

    // 5. Grid Helper
    this.gridHelper = new THREE.GridHelper(20, 20, 0x3ecf8e, 0x27272a);
    this.gridHelper.position.y = -0.01;
    this.scene.add(this.gridHelper);

    // 6. Bind DOM interactions
    this.attachEventListeners();

    // 7. Initialize sample procedural entities if no initial snapshot
    if (options.initialSnapshot) {
      await this.loadSceneSnapshot(options.initialSnapshot);
    } else {
      this.setupDefaultEntities();
    }

    this.isInitialized = true;
    this.startRenderLoop();

    this.emit({
      type: 'ENGINE_READY',
      payload: { engine: 'three', version: THREE.REVISION },
    });
  }

  public destroy(): void {
    this.isDisposed = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.detachEventListeners();

    // Dispose entities
    this.entityMap.forEach((obj) => {
      this.disposeObject(obj);
    });
    this.entityMap.clear();

    // Dispose materials
    this.materialMap.forEach((mat) => mat.dispose());
    this.materialMap.clear();

    // Dispose renderer
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement.parentElement) {
        this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
      }
      this.renderer = null;
    }

    this.scene = null;
    this.camera = null;
    this.container = null;
    this.isInitialized = false;
    this.eventHandlers.clear();
  }

  public resize(width: number, height: number): void {
    if (!this.renderer || !this.camera || height === 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public async dispatchCommand(command: EngineCommand): Promise<boolean> {
    if (!this.isInitialized || !this.scene) return false;

    switch (command.type) {
      case 'LOAD_SCENE': {
        if (command.payload.snapshot) {
          await this.loadSceneSnapshot(command.payload.snapshot);
          return true;
        }
        return false;
      }

      case 'SET_CAMERA_POSE': {
        const p = command.payload;
        if (p.position && this.camera) {
          this.camera.position.set(p.position.x, p.position.y, p.position.z);
        }
        if (p.target) {
          this.cameraTarget.set(p.target.x, p.target.y, p.target.z);
          if (this.camera) this.camera.lookAt(this.cameraTarget);
        }
        if (p.fov && this.camera) {
          this.camera.fov = p.fov;
          this.camera.updateProjectionMatrix();
        }
        return true;
      }

      case 'SELECT_ENTITY': {
        const { entityId } = command.payload;
        this.selectEntity(entityId);
        return true;
      }

      case 'TRANSFORM_ENTITY': {
        const { entityId, position, rotation, scale } = command.payload;
        const obj = this.entityMap.get(entityId);
        if (obj) {
          if (position) obj.position.set(position.x, position.y, position.z);
          if (rotation) obj.rotation.set(rotation.x, rotation.y, rotation.z);
          if (scale) obj.scale.set(scale.x, scale.y, scale.z);
          return true;
        }
        return false;
      }

      case 'SET_ENTITY_VISIBILITY': {
        const { entityId, visible } = command.payload;
        const obj = this.entityMap.get(entityId);
        if (obj) {
          obj.visible = visible;
          return true;
        }
        return false;
      }

      case 'UPDATE_MATERIAL': {
        const { materialId, updates } = command.payload;
        const mat = this.materialMap.get(materialId) as THREE.MeshStandardMaterial;
        if (mat) {
          if (updates.color) mat.color.set(updates.color);
          if (updates.roughness !== undefined) mat.roughness = updates.roughness;
          if (updates.metalness !== undefined) mat.metalness = updates.metalness;
          if (updates.opacity !== undefined) {
            mat.opacity = updates.opacity;
            mat.transparent = updates.opacity < 1;
          }
          if (updates.wireframe !== undefined) mat.wireframe = updates.wireframe;
          mat.needsUpdate = true;
          return true;
        }
        return false;
      }

      case 'ADD_HOTSPOT': {
        this.createHotspotVisual(command.payload);
        return true;
      }

      case 'UPDATE_HOTSPOT': {
        const { id, patch } = command.payload;
        const spot = this.hotspotMap.get(id);
        if (spot && patch.position) {
          spot.position.set(patch.position.x, patch.position.y, patch.position.z);
        }
        return true;
      }

      case 'DELETE_HOTSPOT': {
        const spot = this.hotspotMap.get(command.payload.id);
        if (spot && this.scene) {
          this.scene.remove(spot);
          this.disposeObject(spot);
          this.hotspotMap.delete(command.payload.id);
          return true;
        }
        return false;
      }

      case 'SET_GRID_VISIBLE': {
        if (this.gridHelper) {
          this.gridHelper.visible = command.payload.visible;
          return true;
        }
        return false;
      }

      case 'FOCUS_ENTITY': {
        const obj = this.entityMap.get(command.payload.entityId);
        if (obj && this.camera) {
          const box = new THREE.Box3().setFromObject(obj);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          this.cameraTarget.copy(center);
          this.spherical.radius = maxDim * 2.5;
          this.updateCameraFromSpherical();
          return true;
        }
        return false;
      }

      case 'RESET_VIEW': {
        this.spherical.radius = 10;
        this.spherical.theta = 0.78;
        this.spherical.phi = 1.1;
        this.cameraTarget.set(0, 0, 0);
        this.updateCameraFromSpherical();
        return true;
      }

      case 'TAKE_SCREENSHOT': {
        if (this.renderer && this.scene && this.camera) {
          this.renderer.render(this.scene, this.camera);
          const dataUrl = this.renderer.domElement.toDataURL('image/png');
          command.payload.callback(dataUrl);
          return true;
        }
        return false;
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
    // Generate snapshot from current scene graph
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

    // Clear existing entities
    this.entityMap.forEach((obj) => {
      if (this.scene) this.scene.remove(obj);
      this.disposeObject(obj);
    });
    this.entityMap.clear();

    // Create materials
    snapshot.materials.forEach((matData) => {
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(matData.color),
        roughness: matData.roughness,
        metalness: matData.metalness,
        opacity: matData.opacity,
        transparent: matData.opacity < 1,
        wireframe: matData.wireframe ?? false,
      });
      mat.name = matData.name || matData.id;
      this.materialMap.set(matData.id, mat);
    });

    // Create entities
    snapshot.entities.forEach((entityData) => {
      const geo = new THREE.BoxGeometry(1, 1, 1);
      const defaultMat = new THREE.MeshStandardMaterial({ color: 0x3ecf8e, roughness: 0.4 });
      const mat = entityData.materialId
        ? this.materialMap.get(entityData.materialId) || defaultMat
        : defaultMat;

      const mesh = new THREE.Mesh(geo, mat);
      mesh.name = entityData.name;
      mesh.position.set(entityData.position.x, entityData.position.y, entityData.position.z);
      mesh.rotation.set(entityData.rotation.x, entityData.rotation.y, entityData.rotation.z);
      mesh.scale.set(entityData.scale.x, entityData.scale.y, entityData.scale.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { entityId: entityData.id };

      this.scene!.add(mesh);
      this.entityMap.set(entityData.id, mesh);
    });

    // Create Hotspots
    snapshot.hotspots.forEach((h) => this.createHotspotVisual(h));

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
    }

    this.emit({ type: 'SCENE_LOADED', payload: { snapshot } });
  }

  public getTelemetry(): TelemetryMetrics {
    return {
      fps: this.currentFps,
      frameTimeMs: performance.now() - this.lastFrameTime,
      drawCalls: this.renderer?.info.render.calls || 0,
      triangles: this.renderer?.info.render.triangles || 0,
      memoryUsageMb: (performance as any).memory
        ? Math.round((performance as any).memory.usedJSHeapSize / (1024 * 1024))
        : undefined,
      webglContextState: 'active',
    };
  }

  // --------------------------------------------------------------------------
  // Internal Helpers
  // --------------------------------------------------------------------------

  private setupDefaultEntities() {
    if (!this.scene) return;

    // Architectural cube
    const cubeMat = new THREE.MeshStandardMaterial({
      color: 0x3ecf8e,
      roughness: 0.3,
      metalness: 0.2,
    });
    this.materialMap.set('mat-arch-cube', cubeMat);

    const cubeGeo = new THREE.BoxGeometry(2, 2, 2);
    const cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
    cubeMesh.position.set(0, 1, 0);
    cubeMesh.castShadow = true;
    cubeMesh.receiveShadow = true;
    cubeMesh.name = 'Hero Cube';
    cubeMesh.userData = { entityId: 'ent-cube-1' };

    this.scene.add(cubeMesh);
    this.entityMap.set('ent-cube-1', cubeMesh);

    // Accent sphere
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      roughness: 0.1,
      metalness: 0.8,
    });
    this.materialMap.set('mat-accent-sphere', sphereMat);

    const sphereGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    sphereMesh.position.set(3, 0.8, 1);
    sphereMesh.castShadow = true;
    sphereMesh.receiveShadow = true;
    sphereMesh.name = 'Accent Sphere';
    sphereMesh.userData = { entityId: 'ent-sphere-1' };

    this.scene.add(sphereMesh);
    this.entityMap.set('ent-sphere-1', sphereMesh);
  }

  private createHotspotVisual(data: HotspotData) {
    if (!this.scene) return;

    const pos = data.position || { x: 0, y: 1.5, z: 0 };
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.arc(32, 32, 26, 0, Math.PI * 2);
      ctx.fillStyle = data.color || '#3ecf8e';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.set(pos.x, pos.y, pos.z);
    sprite.scale.set(0.6, 0.6, 1);
    sprite.userData = { hotspotId: data.id };

    this.scene.add(sprite);
    this.hotspotMap.set(data.id, sprite);
  }

  private selectEntity(entityId: string | null) {
    // Un-highlight previous
    if (this.selectedEntityId) {
      const prev = this.entityMap.get(this.selectedEntityId);
      if (prev instanceof THREE.Mesh && prev.material instanceof THREE.MeshStandardMaterial) {
        prev.material.emissive.set(0x000000);
      }
    }

    this.selectedEntityId = entityId;

    // Highlight new
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

  private startRenderLoop() {
    const render = () => {
      if (this.isDisposed) return;
      this.animationFrameId = requestAnimationFrame(render);

      const now = performance.now();
      this.frameCount++;

      // FPS sampling every 500ms
      if (now - this.lastFpsSampleTime >= 500) {
        this.currentFps = Math.round((this.frameCount * 1000) / (now - this.lastFpsSampleTime));
        this.frameCount = 0;
        this.lastFpsSampleTime = now;
        this.emit({ type: 'TELEMETRY_UPDATED', payload: this.getTelemetry() });
      }

      this.lastFrameTime = now;

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    };

    this.animationFrameId = requestAnimationFrame(render);
  }

  private attachEventListeners() {
    const el = this.renderer?.domElement;
    if (!el) return;

    el.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    el.addEventListener('wheel', this.onWheel, { passive: false });
    el.addEventListener('click', this.onClick);
  }

  private detachEventListeners() {
    const el = this.renderer?.domElement;
    if (!el) return;

    el.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    el.removeEventListener('wheel', this.onWheel);
    el.removeEventListener('click', this.onClick);
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
    const meshes = Array.from(this.entityMap.values());
    const sprites = Array.from(this.hotspotMap.values());
    const intersects = this.raycaster.intersectObjects([...meshes, ...sprites], true);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const entityId = hit.object.userData.entityId;
      const hotspotId = hit.object.userData.hotspotId;

      if (hotspotId) {
        this.emit({ type: 'HOTSPOT_SELECTED', payload: { hotspotId } });
      } else if (entityId) {
        this.selectEntity(entityId);
      }

      const raycastHit: RaycastHit = {
        point: { x: hit.point.x, y: hit.point.y, z: hit.point.z },
        normal: hit.face ? { x: hit.face.normal.x, y: hit.face.normal.y, z: hit.face.normal.z } : undefined,
        distance: hit.distance,
        entityId,
        hotspotId,
      };

      this.emit({ type: 'POINTER_CLICK', payload: { hit: raycastHit, rawEvent: e } });
    } else {
      this.selectEntity(null);
      this.emit({ type: 'POINTER_CLICK', payload: { hit: null, rawEvent: e } });
    }
  };

  private emit(event: EngineEvent): void {
    this.eventHandlers.forEach((handler) => handler(event));
  }

  private disposeObject(obj: THREE.Object3D): void {
    if (obj instanceof THREE.Mesh) {
      obj.geometry?.dispose();
    }
  }
}
