/**
 * PlayCanvas Engine Adapter
 *
 * Implements the EngineAdapter contract for PlayCanvas Engine.
 * Wraps pc.Application to provide a unified interface for the EngineBridge.
 * Loads the VizTR custom PlayCanvas engine (WebGPU/WebXR/GSplat enabled).
 */

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
  CameraPose,
  Vector3D,
  EulerRotation,
} from '../types';

// Global PlayCanvas namespace (loaded dynamically)
declare global {
  interface Window {
    pc?: any;
  }
}

export class PlayCanvasEngineAdapter implements EngineAdapter {
  public readonly engineType: EngineType = 'playcanvas';
  public isInitialized = false;

  private container: HTMLElement | null = null;
  private app: any = null;
  private canvas: HTMLCanvasElement | null = null;

  // Entity/Material/Hotspot Registries
  private entityMap: Map<string, any> = new Map();
  private materialMap: Map<string, any> = new Map();
  private hotspotMap: Map<string, any> = new Map();

  // Event handling
  private eventHandlers: Set<(event: EngineEvent) => void> = new Set();
  private isDisposed = false;

  // Camera orbit state
  private orbitState = {
    distance: 10,
    theta: 0.78,
    phi: 1.1,
    target: { x: 0, y: 0, z: 0 },
  };

  // Snapshot cache
  private currentSnapshot: SceneSnapshot = {
    id: 'default-pc-scene',
    version: 1,
    name: 'PlayCanvas Scene',
    engine: 'playcanvas',
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

    // Load PlayCanvas engine dynamically
    await this.loadPlayCanvasEngine();

    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 600;

    // Create canvas if not provided
    if (options.canvas) {
      this.canvas = options.canvas;
    } else {
      this.canvas = document.createElement('canvas');
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.display = 'block';
      if (this.container) {
        this.container.appendChild(this.canvas);
      }
    }

    // Create PlayCanvas Application
    const pc = window.pc;
    if (!pc) {
      throw new Error('PlayCanvas engine failed to load');
    }

    this.app = new pc.Application(this.canvas, {
      graphicsDeviceOptions: {
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        preferWebGl2: true,
        powerPreference: 'high-performance',
      },
      assetPrefix: options.assetPrefix || '',
      scriptPrefix: options.scriptPrefix || '',
    });

    // Configure graphics device
    this.app.graphicsDevice.maxAnisotropy = 16;
    this.app.graphicsDevice.depthBuffer = true;
    this.app.graphicsDevice.stencilBuffer = true;

    // Set canvas size
    this.resize(this.container.clientWidth || 800, this.container.clientHeight || 600);

    // Configure scene
    this.app.scene.ambientLight = new pc.Color(0.2, 0.2, 0.2);
    this.app.scene.fog = pc.FOG_NONE;
    this.app.scene.gammaCorrection = pc.GAMMA_SRGB;

    // Create default lighting
    this.createDefaultLighting();

    // Create grid helper (visual grid in editor)
    this.createGridHelper();

    // Set background color
    const bgColor = options.backgroundColor || '#09090b';
    this.app.scene.clearColor = new pc.Color(
      parseInt(bgColor.slice(1, 3), 16) / 255,
      parseInt(bgColor.slice(3, 5), 16) / 255,
      parseInt(bgColor.slice(5, 7), 16) / 255
    );

    // Start the application
    this.app.start();

    // Attach input event listeners
    this.attachEventListeners();

    this.isInitialized = true;

    // Emit ENGINE_READY event
    this.emit({
      type: 'ENGINE_READY',
      payload: { engine: 'playcanvas', version: pc.REVISION || '2.23.0' },
    });

    // Load initial snapshot if provided
    if (options.initialSnapshot) {
      await this.loadSceneSnapshot(options.initialSnapshot);
    } else {
      this.setupDefaultEntities();
    }
  }

  private async loadPlayCanvasEngine(): Promise<void> {
    // Try to load from the VizTR custom engine endpoint first
    const engineUrls = [
      '/engine/playcanvas.js',           // Served by editor server from forks/engine/build
      'https://code.playcanvas.com/playcanvas-1.68.0.min.js', // Fallback CDN
    ];

    for (const url of engineUrls) {
      try {
        await this.loadScript(url);
        if (window.pc && window.pc.Application) {
          console.log(`[PlayCanvasEngineAdapter] Engine loaded from ${url}`);
          return;
        }
      } catch (e) {
        console.warn(`[PlayCanvasEngineAdapter] Failed to load from ${url}:`, e);
      }
    }

    throw new Error('Failed to load PlayCanvas engine from any source');
  }

  private loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${url}"]`)) {
        // Already loaded
        setTimeout(() => {
          if (window.pc) resolve();
          else reject(new Error('Script loaded but pc not available'));
        }, 0);
        return;
      }

      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${url}`));
      document.head.appendChild(script);
    });
  }

  private createDefaultLighting(): void {
    if (!this.app) return;

    // Ambient light
    this.app.scene.ambientLight = new pc.Color(0.2, 0.2, 0.2);

    // Directional light (sun)
    const lightEntity = new pc.Entity('Directional Light');
    lightEntity.addComponent('light', {
      type: 'directional',
      color: new pc.Color(1, 1, 1),
      intensity: 1.5,
      castShadows: true,
      shadowDistance: 50,
      shadowBias: 0.005,
      normalOffsetBias: 0.001,
    });
    lightEntity.rotateLocal(45, -30, 0);
    this.app.root.addChild(lightEntity);

    // Secondary fill light
    const fillLightEntity = new pc.Entity('Fill Light');
    fillLightEntity.addComponent('light', {
      type: 'directional',
      color: new pc.Color(0.6, 0.7, 1.0),
      intensity: 0.3,
      castShadows: false,
    });
    fillLightEntity.rotateLocal(-30, 120, 0);
    this.app.root.addChild(fillLightEntity);
  }

  private createGridHelper(): void {
    if (!this.app) return;

    // Create a grid of lines using line meshes
    const gridSize = 20;
    const divisions = 20;
    const step = gridSize / divisions;
    const half = gridSize / 2;
    const color = new pc.Color(0.24, 0.24, 0.24); // VizTR grid color
    const accentColor = new pc.Color(0.24, 0.81, 0.56); // VizTR green

    const lineMaterial = new pc.StandardMaterial();
    lineMaterial.emissive = color;
    lineMaterial.useLighting = false;
    lineMaterial.update();

    for (let i = 0; i <= divisions; i++) {
      const pos = -half + i * (gridSize / divisions);

      // X-axis lines
      const lineX = new pc.Entity();
      lineX.addComponent('render', {
        type: 'line',
        vertices: new Float32Array([
          -half, 0, pos,
          half, 0, pos
        ]),
        material: lineMaterial,
      });
      this.app.root.addChild(lineX);

      // Z-axis lines
      const lineZ = new pc.Entity();
      lineZ.addComponent('render', {
        type: 'line',
        vertices: new Float32Array([
          pos, 0, -half,
          pos, 0, half
        ]),
        material: lineMaterial,
      });
      this.app.root.addChild(lineZ);
    }

    // Origin axes
    this.createAxisLine(new pc.Vec3(0, 0, 0), new pc.Vec3(1, 0, 0), new pc.Color(1, 0, 0), 'X-Axis');
    this.createAxisLine(new pc.Vec3(0, 0, 0), new pc.Vec3(0, 1, 0), new pc.Color(0, 1, 0), 'Y-Axis');
    this.createAxisLine(new pc.Vec3(0, 0, 0), new pc.Vec3(0, 0, 1), new pc.Color(0, 0, 1), 'Z-Axis');
  }

  private createAxisLine(start: pc.Vec3, end: pc.Vec3, color: pc.Color, name: string): void {
    if (!this.app) return;
    const lineMat = new pc.StandardMaterial();
    lineMat.emissive = color;
    lineMat.useLighting = false;
    lineMat.update();

    const entity = new pc.Entity(name);
    entity.addComponent('render', {
      type: 'line',
      vertices: new Float32Array([start.x, start.y, start.z, end.x, end.y, end.z]),
      material: lineMat,
    });
    this.app.root.addChild(entity);
  }

  private setupDefaultEntities(): void {
    if (!this.app) return;

    // Create a default architectural cube entity
    const cube = new pc.Entity('Architecture Cube');
    cube.addComponent('model', {
      type: 'box',
    });
    cube.setLocalScale(2, 2, 2);
    cube.setLocalPosition(0, 1, 0);
    cube.addComponent('render', {
      material: this.createMaterial('arch-cube', new pc.Color(0.24, 0.81, 0.56), 0.3, 0.2),
    });
    cube.setLocalPosition(0, 1, 0);
    cube.castShadow = true;
    cube.receiveShadow = true;
    this.app.root.addChild(cube);
    this.entityMap.set('ent-arch-cube', cube);

    // Accent sphere
    const sphere = new pc.Entity('Accent Sphere');
    sphere.addComponent('model', {
      type: 'sphere',
    });
    sphere.setLocalScale(0.8, 0.8, 0.8);
    sphere.setLocalPosition(3, 0.8, 1);
    sphere.addComponent('render', {
      material: this.createMaterial('accent-sphere', new pc.Color(0.39, 0.40, 0.95), 0.1, 0.8),
    });
    sphere.setLocalPosition(3, 0.8, 1);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    this.app.root.addChild(sphere);
    this.entityMap.set('ent-sphere-1', sphere);
  }

  private createMaterial(id: string, color: pc.Color, roughness: number, metalness: number): pc.StandardMaterial {
    const mat = new pc.StandardMaterial();
    mat.diffuse = color;
    mat.roughness = roughness;
    mat.metalness = metalness;
    mat.update();
    mat.name = id;
    this.materialMap.set(id, mat);
    return mat;
  }

  public destroy(): void {
    this.isDisposed = true;

    // Stop render loop
    if (this.app) {
      this.app.destroy();
      this.app = null;
    }

    // Remove canvas
    if (this.canvas && this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
      this.canvas = null;
    }

    // Clear registries
    this.entityMap.clear();
    this.materialMap.clear();
    this.hotspotMap.clear();
    this.eventHandlers.clear();

    this.container = null;
    this.canvas = null;
    this.isInitialized = false;
  }

  public resize(width: number, height: number): void {
    if (!this.app || height === 0) return;
    this.app.resizeCanvas(width, height);
  }

  public async dispatchCommand(command: EngineCommand): Promise<boolean> {
    if (!this.isInitialized || !this.app) return false;

    try {
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
          if (!this.app.camera) return false;

          if (p.position) {
            this.app.camera.setLocalPosition(p.position.x, p.position.y, p.position.z);
          }
          if (p.target) {
            this.orbitState.target = p.target;
            this.updateCameraFromOrbit();
          }
          if (p.fov && this.app.camera.camera) {
            this.app.camera.camera.fov = p.fov;
          }
          if (p.transitionDuration) {
            // Could animate transition here
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
          const entity = this.entityMap.get(entityId);
          if (entity) {
            if (position) entity.setLocalPosition(position.x, position.y, position.z);
            if (rotation) entity.setLocalEulerAngles(rotation.x, rotation.y, rotation.z);
            if (scale) entity.setLocalScale(scale.x, scale.y, scale.z);
            return true;
          }
          return false;
        }

        case 'SET_ENTITY_VISIBILITY': {
          const { entityId, visible } = command.payload;
          const entity = this.entityMap.get(entityId);
          if (entity) {
            entity.enabled = visible;
            return true;
          }
          return false;
        }

        case 'UPDATE_MATERIAL': {
          const { materialId, updates } = command.payload;
          const mat = this.materialMap.get(materialId);
          if (mat) {
            if (updates.color) mat.diffuse = new pc.Color(updates.color);
            if (updates.roughness !== undefined) mat.roughness = updates.roughness;
            if (updates.metalness !== undefined) mat.metalness = updates.metalness;
            if (updates.opacity !== undefined) {
              mat.opacity = updates.opacity;
              mat.transparent = updates.opacity < 1;
            }
            mat.update();
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
          const hotspot = this.hotspotMap.get(id);
          if (hotspot && patch.position) {
            hotspot.setLocalPosition(patch.position.x, patch.position.y, patch.position.z);
          }
          return true;
        }

        case 'DELETE_HOTSPOT': {
          const hotspot = this.hotspotMap.get(command.payload.id);
          if (hotspot) {
            hotspot.destroy();
            this.hotspotMap.delete(command.payload.id);
            return true;
          }
          return false;
        }

        case 'SET_ACTIVE_TOOL': {
          // Tool state managed by UI; engine doesn't need to track
          return true;
        }

        case 'SET_GRID_VISIBLE': {
          // Grid is part of root scene; could toggle visibility
          return true;
        }

        case 'FOCUS_ENTITY': {
          const entity = this.entityMap.get(command.payload.entityId);
          if (entity) {
            const aabb = this.getEntityAABB(entity);
            if (aabb) {
              const center = aabb.center;
              this.orbitState.target = { x: center.x, y: center.y, z: center.z };
              const size = aabb.halfExtents;
              const maxDim = Math.max(size.x, size.y, size.z);
              this.orbitState.distance = maxDim * 2.5;
              this.updateCameraFromOrbit();
              return true;
            }
          }
          return false;
        }

        case 'RESET_VIEW': {
          this.orbitState.distance = 10;
          this.orbitState.theta = 0.78;
          this.orbitState.phi = 1.1;
          this.orbitState.target = { x: 0, y: 0, z: 0 };
          this.updateCameraFromOrbit();
          return true;
        }

        case 'TAKE_SCREENSHOT': {
          // Render to canvas and get data URL
          if (this.app && this.canvas) {
            this.app.render();
            const dataUrl = this.canvas.toDataURL('image/png');
            command.payload.callback(dataUrl);
            return true;
          }
          return false;
        }

        default:
          return false;
      }
    } catch (error) {
      console.error('[PlayCanvasEngineAdapter] Command error:', error);
      this.emit({
        type: 'ENGINE_ERROR',
        payload: { code: 'COMMAND_FAILED', message: String(error) },
      });
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
    this.entityMap.forEach((entity, id) => {
      if (entity === this.app.camera || entity === this.app.scene) return;
      const pos = entity.getLocalPosition();
      const rot = entity.getLocalEulerAngles();
      const scale = entity.getLocalScale();
      entities.push({
        id,
        name: entity.name || id,
        type: entity.model ? 'mesh' : entity.light ? 'light' : entity.camera ? 'camera' : 'group',
        position: { x: pos.x, y: pos.y, z: pos.z },
        rotation: { x: rot.x, y: rot.y, z: rot.z },
        scale: { x: scale.x, y: scale.y, z: scale.z },
        visible: entity.enabled,
        materialId: entity.render?.material ? entity.render.material.id : undefined,
      });
    });

    const materials: PBRMaterialData[] = [];
    this.materialMap.forEach((mat, id) => {
      if (mat instanceof pc.StandardMaterial) {
        materials.push({
          id,
          name: mat.name,
          color: '#' + mat.diffuse.toHEX(),
          roughness: mat.roughness,
          metalness: mat.metalness,
          opacity: mat.opacity,
          wireframe: mat.wireframe,
        });
      }
    });

    const hotspots: HotspotData[] = [];
    this.hotspotMap.forEach((spot, id) => {
      const pos = spot.getLocalPosition();
      hotspots.push({
        id,
        title: spot.name,
        type: 'info',
        position: { x: pos.x, y: pos.y, z: pos.z },
        color: '#3ecf8e',
      });
    });

    const camera = this.app.camera;
    return {
      ...this.currentSnapshot,
      entities,
      materials,
      hotspots,
      camera: {
        position: camera ? { x: camera.getPosition().x, y: camera.getPosition().y, z: camera.getPosition().z } : { x: 5, y: 5, z: 5 },
        target: this.orbitState.target,
        fov: camera?.camera?.fov || 60,
      },
      updatedAt: new Date().toISOString(),
    };
  }

  public async loadSceneSnapshot(snapshot: SceneSnapshot): Promise<void> {
    if (!this.app) return;
    this.currentSnapshot = snapshot;

    // Clear existing entities
    this.entityMap.forEach((entity, id) => {
      if (entity !== this.app.camera && entity !== this.app.scene) {
        entity.destroy();
      }
    });
    this.entityMap.clear();
    this.materialMap.clear();
    this.hotspotMap.clear();

    // Create materials
    snapshot.materials.forEach((matData) => {
      const mat = new pc.StandardMaterial();
      mat.diffuse = new pc.Color(matData.color);
      mat.roughness = matData.roughness;
      mat.metalness = matData.metalness;
      mat.opacity = matData.opacity;
      mat.transparent = matData.opacity < 1;
      mat.wireframe = matData.wireframe ?? false;
      mat.update();
      mat.name = matData.name || matData.id;
      this.materialMap.set(matData.id, mat);
    });

    // Create entities
    snapshot.entities.forEach((entityData) => {
      let entity: pc.Entity;

      switch (entityData.type) {
        case 'mesh':
          entity = new pc.Entity(entityData.name);
          entity.addComponent('model', { type: 'box' });
          const mat = entityData.materialId ? this.materialMap.get(entityData.materialId) : null;
          if (mat) {
            entity.addComponent('render', { material: mat });
          }
          break;
        case 'light':
          entity = new pc.Entity(entityData.name);
          entity.addComponent('light', {
            type: 'directional',
            color: new pc.Color(1, 1, 1),
            intensity: 1,
          });
          break;
        case 'camera':
          // Skip - use existing camera
          return;
        default:
          entity = new pc.Entity(entityData.name);
      }

      if (entity) {
        entity.setLocalPosition(entityData.position.x, entityData.position.y, entityData.position.z);
        entity.setLocalEulerAngles(entityData.rotation.x, entityData.rotation.y, entityData.rotation.z);
        entity.setLocalScale(entityData.scale.x, entityData.scale.y, entityData.scale.z);
        entity.enabled = entityData.visible;
        this.app.root.addChild(entity);
        this.entityMap.set(entityData.id, entity);
      }
    });

    // Create hotspots
    snapshot.hotspots.forEach((h) => this.createHotspotVisual(h));

    // Restore camera
    if (snapshot.camera && this.app.camera) {
      this.app.camera.setLocalPosition(snapshot.camera.position.x, snapshot.camera.position.y, snapshot.camera.position.z);
      this.orbitState.target = snapshot.camera.target;
      this.updateCameraFromOrbit();
      if (snapshot.camera.fov && this.app.camera.camera) {
        this.app.camera.camera.fov = snapshot.camera.fov;
      }
    }

    this.emit({ type: 'SCENE_LOADED', payload: { snapshot } });
  }

  public getTelemetry(): TelemetryMetrics {
    if (!this.app) {
      return {
        fps: 0,
        frameTimeMs: 0,
        drawCalls: 0,
        triangles: 0,
        webglContextState: 'active',
      };
    }

    const stats = this.app.graphicsDevice.getStats();
    return {
      fps: this.app.getFps(),
      frameTimeMs: 1000 / (this.app.getFps() || 60),
      drawCalls: stats.drawCalls,
      triangles: stats.triangles,
      memoryUsageMb: (performance as any).memory
        ? Math.round((performance as any).memory.usedJSHeapSize / (1024 * 1024))
        : undefined,
      webglContextState: 'active',
    };
  }

  // --- Private Helpers ---

  private updateCameraFromOrbit(): void {
    if (!this.app || !this.app.camera) return;
    const { distance, theta, phi, target } = this.orbitState;
    const x = distance * Math.sin(phi) * Math.sin(theta);
    const y = distance * Math.cos(phi);
    const z = distance * Math.sin(phi) * Math.cos(theta);

    this.app.camera.setLocalPosition(
      target.x + x,
      target.y + y,
      target.z + z
    );
    this.app.camera.lookAt(new pc.Vec3(target.x, target.y, target.z));
  }

  private getEntityAABB(entity: pc.Entity): { center: pc.Vec3; halfExtents: pc.Vec3 } | null {
    if (!entity.model) return null;
    const meshInstances = entity.model.meshInstances;
    if (!meshInstances.length) return null;

    let min = new pc.Vec3(Infinity, Infinity, Infinity);
    let max = new pc.Vec3(-Infinity, -Infinity, -Infinity);

    meshInstances.forEach((mi: any) => {
      const aabb = mi.aabb;
      if (aabb) {
        min.x = Math.min(min.x, aabb.center.x - aabb.halfExtents.x);
        min.y = Math.min(min.y, aabb.center.y - aabb.halfExtents.y);
        min.z = Math.min(min.z, aabb.center.z - aabb.halfExtents.z);
        max.x = Math.max(max.x, aabb.center.x + aabb.halfExtents.x);
        max.y = Math.max(max.y, aabb.center.y + aabb.halfExtents.y);
        max.z = Math.max(max.z, aabb.center.z + aabb.halfExtents.z);
      }
    });

    return {
      center: new pc.Vec3().add2(min, max).scale(0.5),
      halfExtents: new pc.Vec3().sub2(max, min).scale(0.5),
    };
  }

  private selectEntity(entityId: string | null): void {
    // Could add selection highlight material here
    this.emit({
      type: 'SELECTION_CHANGED',
      payload: { selectedIds: entityId ? [entityId] : [] },
    });
  }

  private createHotspotVisual(data: HotspotData): void {
    if (!this.app) return;

    const pos = data.position || { x: 0, y: 1.5, z: 0 };
    const hotspot = new pc.Entity(`Hotspot-${data.id}`);
    hotspot.addComponent('render', {
      type: 'plane',
    });
    hotspot.setLocalScale(0.5, 0.5, 1);
    hotspot.setLocalPosition(pos.x, pos.y, pos.z);
    hotspot.billboard = true;

    const mat = new pc.StandardMaterial();
    mat.emissive = new pc.Color(data.color || '#3ecf8e');
    mat.useLighting = false;
    mat.opacity = 0.9;
    mat.transparent = true;
    mat.update();

    hotspot.addComponent('render', {
      type: 'plane',
      material: mat,
    });
    hotspot.rotateLocal(0, 180, 0); // Face camera
    this.app.root.addChild(hotspot);
    this.hotspotMap.set(data.id, hotspot);
  }

  private emit(event: EngineEvent): void {
    this.eventHandlers.forEach((handler) => handler(event));
  }

  private attachEventListeners(): void {
    if (!this.canvas) return;

    // Mouse orbit
    let isOrbiting = false;
    let lastX = 0, lastY = 0;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0 || e.button === 2) { // Left or right click
        isOrbiting = true;
        lastX = e.clientX;
        lastY = e.clientY;
        this.canvas.style.cursor = 'grabbing';
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isOrbiting) return;
      const deltaX = e.clientX - lastX;
      const deltaY = e.clientY - lastY;
      this.orbitState.theta -= deltaX * 0.005;
      this.orbitState.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.orbitState.phi - deltaY * 0.005));
      this.updateCameraFromOrbit();
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const onMouseUp = () => {
      isOrbiting = false;
      this.canvas.style.cursor = 'default';
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      this.orbitState.distance = Math.max(1, Math.min(100, this.orbitState.distance + e.deltaY * 0.01));
      this.updateCameraFromOrbit();
    };

    this.canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    this.canvas.addEventListener('wheel', onWheel, { passive: false });

    // Click selection (raycast)
    this.canvas.addEventListener('click', (e: MouseEvent) => {
      if (!this.app) return;
      const rect = this.canvas!.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Raycast using PlayCamera's built-in picker
      if (this.app && this.app.camera) {
        const ray = this.app.camera.camera.screenPointToRay(x, y);
        const result = this.app.scene.pick(ray);
        if (result) {
          const entity = result.entity;
          const entityId = entity.guid;
          this.emit({
            type: 'SELECTION_CHANGED',
            payload: { selectedIds: [entityId] },
          });
        }
      }
    });

    // Cleanup on destroy
    this.canvas.addEventListener('destroy', () => {
      this.canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      this.canvas.removeEventListener('wheel', onWheel);
      this.canvas.removeEventListener('click', onClick);
    });
  }

  private emit(event: EngineEvent): void {
    this.eventHandlers.forEach((handler) => handler(event));
  }
}