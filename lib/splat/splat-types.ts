export type ToolType = 
    | 'move' 
    | 'rotate' 
    | 'scale' 
    | 'select' 
    | 'rectSelect' 
    | 'brushSelect' 
    | 'sphereBrushSelect'
    | 'floodSelect' 
    | 'polygonSelect' 
    | 'lassoSelect' 
    | 'sphereSelect' 
    | 'boxSelect' 
    | 'eyedropperSelect'
    | 'measure' 
    | 'orient';

export interface SplatSceneDef {
    id: string;
    name: string;
    url: string;
    format?: 'splat' | 'ply' | 'ksplat';
    position?: [number, number, number];
    rotation?: [number, number, number, number];
    scale?: [number, number, number];
    thumbnail?: string;
}

export interface SelectionState {
    mode: 'add' | 'remove' | 'set' | 'intersect';
    footprint: number;
    useDepth: boolean;
}

export interface ViewSettings {
    showGaussians: boolean;
    showCenters: boolean;
    showRings: boolean;
    ringSize: number;
    showGrid: boolean;
    gridPlanes: ('xz' | 'xy' | 'yz')[];
    showBound: boolean;
    showBoundDimensions: boolean;
    showCameraPoses: boolean;
    showCameraInfo: boolean;
    stochastic: 'disabled' | 'enabled' | 'movement' | 'auto';
    perfOverlay: boolean;
}

export interface ColorSettings {
    bgColor: { r: number; g: number; b: number; a: number };
    selectedColor: { r: number; g: number; b: number; a: number };
    unselectedColor: { r: number; g: number; b: number; a: number };
    lockedColor: { r: number; g: number; b: number; a: number };
}

export interface SplatEditorState {
    scenes: SplatSceneDef[];
    activeSceneId: string | null;
    activeTool: ToolType;
    selection: SelectionState;
    viewSettings: ViewSettings;
    colorSettings: ColorSettings;
    isInitialized: boolean;
}