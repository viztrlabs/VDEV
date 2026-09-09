/**
 * Engine Bridge Type Definitions
 *
 * Provides a unified, type-safe contract between the Frontend UI,
 * the Editor Logic (State/Commands), and the underlying 3D/XR Engines
 * (Three.js, PlayCanvas/WebGPU Splats, and Marzipano 360°).
 */

export type EngineType = 'three' | 'playcanvas' | 'marzipano';

export type ToolType = 'select' | 'move' | 'rotate' | 'scale' | 'hotspot' | 'measure';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface EulerRotation {
  x: number;
  y: number;
  z: number;
  order?: 'XYZ' | 'YXZ' | 'ZXY' | 'ZYX' | 'YZX' | 'XZY';
}

export interface CameraPose {
  position: Vector3D;
  target: Vector3D;
  fov?: number;
  yaw?: number;
  pitch?: number;
  roll?: number;
}

export interface PBRMaterialData {
  id: string;
  name?: string;
  color: string;
  roughness: number;
  metalness: number;
  opacity: number;
  wireframe?: boolean;
  mapUrl?: string;
  normalMapUrl?: string;
}

export interface SceneEntity {
  id: string;
  name: string;
  type: 'mesh' | 'group' | 'light' | 'camera' | 'splat' | 'hotspot';
  position: Vector3D;
  rotation: EulerRotation;
  scale: Vector3D;
  visible: boolean;
  locked?: boolean;
  materialId?: string;
  metadata?: Record<string, unknown>;
  children?: SceneEntity[];
}

export interface HotspotData {
  id: string;
  title: string;
  type: 'metadata' | 'room_link' | 'image' | 'video' | 'info' | 'audio' | 'link';
  position?: Vector3D; // For 3D world space
  yaw?: number;        // For 360 spherical space
  pitch?: number;      // For 360 spherical space
  xPercent?: number;   // For 2D / screen projected
  yPercent?: number;
  targetRoomId?: string;
  description?: string;
  mediaUrl?: string;
  color?: string;
  icon?: string;
}

export interface TelemetryMetrics {
  fps: number;
  frameTimeMs: number;
  drawCalls: number;
  triangles: number;
  splatCount?: number;
  memoryUsageMb?: number;
  webglContextState: 'active' | 'lost' | 'restored';
}

export interface RaycastHit {
  point: Vector3D;
  normal?: Vector3D;
  distance: number;
  entityId?: string;
  hotspotId?: string;
  uv?: { u: number; v: number };
}

export interface SceneSnapshot {
  id: string;
  version: number;
  name: string;
  engine: EngineType;
  environmentUrl?: string;
  camera: CameraPose;
  entities: SceneEntity[];
  materials: PBRMaterialData[];
  hotspots: HotspotData[];
  settings?: Record<string, unknown>;
  updatedAt: string;
}

// ============================================================================
// Engine Commands (UI -> Engine)
// ============================================================================

export type EngineCommand =
  | { type: 'LOAD_SCENE'; payload: { snapshot?: SceneSnapshot; assetUrl?: string } }
  | { type: 'SET_CAMERA_POSE'; payload: Partial<CameraPose> & { transitionDuration?: number } }
  | { type: 'SELECT_ENTITY'; payload: { entityId: string | null; multiSelect?: boolean } }
  | { type: 'TRANSFORM_ENTITY'; payload: { entityId: string; position?: Vector3D; rotation?: EulerRotation; scale?: Vector3D } }
  | { type: 'SET_ENTITY_VISIBILITY'; payload: { entityId: string; visible: boolean } }
  | { type: 'UPDATE_MATERIAL'; payload: { materialId: string; updates: Partial<PBRMaterialData> } }
  | { type: 'ADD_HOTSPOT'; payload: HotspotData }
  | { type: 'UPDATE_HOTSPOT'; payload: { id: string; patch: Partial<HotspotData> } }
  | { type: 'DELETE_HOTSPOT'; payload: { id: string } }
  | { type: 'SET_ACTIVE_TOOL'; payload: { tool: ToolType } }
  | { type: 'SET_GRID_VISIBLE'; payload: { visible: boolean } }
  | { type: 'FOCUS_ENTITY'; payload: { entityId: string } }
  | { type: 'RESET_VIEW'; payload?: Record<string, never> }
  | { type: 'TAKE_SCREENSHOT'; payload: { width?: number; height?: number; callback: (dataUrl: string) => void } };

// ============================================================================
// Engine Events (Engine -> UI)
// ============================================================================

export type EngineEvent =
  | { type: 'ENGINE_READY'; payload: { engine: EngineType; version: string } }
  | { type: 'ENGINE_ERROR'; payload: { code: string; message: string; details?: unknown } }
  | { type: 'SCENE_LOADED'; payload: { snapshot: SceneSnapshot } }
  | { type: 'SELECTION_CHANGED'; payload: { selectedIds: string[] } }
  | { type: 'TRANSFORM_INTERIM'; payload: { entityId: string; position: Vector3D; rotation: EulerRotation; scale: Vector3D } }
  | { type: 'TRANSFORM_COMMITTED'; payload: { entityId: string; position: Vector3D; rotation: EulerRotation; scale: Vector3D; previousState: { position: Vector3D; rotation: EulerRotation; scale: Vector3D } } }
  | { type: 'CAMERA_MOVED'; payload: CameraPose }
  | { type: 'POINTER_CLICK'; payload: { hit: RaycastHit | null; rawEvent: MouseEvent } }
  | { type: 'POINTER_HOVER'; payload: { hit: RaycastHit | null } }
  | { type: 'TELEMETRY_UPDATED'; payload: TelemetryMetrics }
  | { type: 'HOTSPOT_SELECTED'; payload: { hotspotId: string } }
  | { type: 'DIRTY_STATE_CHANGED'; payload: { isDirty: boolean } };

// ============================================================================
// Engine Adapter Contract
// ============================================================================

export interface EngineInitOptions {
  canvas?: HTMLCanvasElement;
  container: HTMLElement;
  initialSnapshot?: SceneSnapshot;
  antialias?: boolean;
  pixelRatio?: number;
  backgroundColor?: string;
  enableGizmos?: boolean;
}

export interface EngineAdapter {
  readonly engineType: EngineType;
  readonly isInitialized: boolean;

  init(options: EngineInitOptions): Promise<void>;
  destroy(): void;
  resize(width: number, height: number): void;

  dispatchCommand(command: EngineCommand): Promise<boolean> | boolean;
  onEvent(handler: (event: EngineEvent) => void): () => void;

  getSceneSnapshot(): SceneSnapshot;
  loadSceneSnapshot(snapshot: SceneSnapshot): Promise<void>;
  getTelemetry(): TelemetryMetrics;
}
