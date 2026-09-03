import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { temporal } from 'zundo';
import { persist, createJSONStorage } from 'zustand/middleware';

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
    // Scene data
    scenes: SplatSceneDef[];
    activeSceneId: string | null;
    
    // Editor state
    activeTool: ToolType;
    selection: SelectionState;
    viewSettings: ViewSettings;
    colorSettings: ColorSettings;
    
    // Initialization
    isInitialized: boolean;
    
    // Actions
    initializeEditor: () => void;
    setActiveTool: (tool: ToolType) => void;
    setActiveScene: (sceneId: string) => void;
    addScene: (scene: SplatSceneDef) => void;
    removeScene: (sceneId: string) => void;
    updateScene: (sceneId: string, patch: Partial<SplatSceneDef>) => void;
    setSelectionMode: (mode: 'add' | 'remove' | 'set' | 'intersect') => void;
    setFootprint: (value: number) => void;
    setUseDepth: (value: boolean) => void;
    updateViewSettings: (settings: Partial<ViewSettings>) => void;
    updateColorSettings: (settings: Partial<ColorSettings>) => void;
    
    // Undo/Redo
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    
    // File operations
    loadSplat: (url: string, filename: string) => Promise<void>;
    exportSplat: (format: 'splat' | 'ply' | 'ksplat') => Promise<void>;
}

const initialViewSettings: ViewSettings = {
    showGaussians: true,
    showCenters: false,
    showRings: false,
    ringSize: 4,
    showGrid: true,
    gridPlanes: ['xz'],
    showBound: true,
    showBoundDimensions: false,
    showCameraPoses: false,
    showCameraInfo: false,
    stochastic: 'auto',
    perfOverlay: false
};

const initialColorSettings: ColorSettings = {
    bgColor: { r: 0, g: 0, b: 0, a: 1 },
    selectedColor: { r: 1, g: 1, b: 0, a: 1 },
    unselectedColor: { r: 0, g: 0, b: 1, a: 0.5 },
    lockedColor: { r: 0, g: 0, b: 0, a: 0.05 }
};

const initialSelection: SelectionState = {
    mode: 'add',
    footprint: 0,
    useDepth: false
};

export const useSplatEditorStore = create<SplatEditorState>()(
    temporal(
        persist(
            immer((set, get) => ({
                scenes: [],
                activeSceneId: null,
                activeTool: 'move',
                selection: initialSelection,
                viewSettings: initialViewSettings,
                colorSettings: initialColorSettings,
                isInitialized: false,
                
                initializeEditor: () => set({ isInitialized: true }),
                
                setActiveTool: (tool) => set({ activeTool: tool }),
                
                setActiveScene: (sceneId) => set({ activeSceneId: sceneId }),
                
                addScene: (scene) => set((state) => {
                    state.scenes.push(scene);
                    if (!state.activeSceneId) {
                        state.activeSceneId = scene.id;
                    }
                }),
                
                removeScene: (sceneId) => set((state) => {
                    state.scenes = state.scenes.filter(s => s.id !== sceneId);
                    if (state.activeSceneId === sceneId) {
                        state.activeSceneId = state.scenes[0]?.id ?? null;
                    }
                }),
                
                updateScene: (sceneId, patch) => set((state) => {
                    const scene = state.scenes.find(s => s.id === sceneId);
                    if (scene) {
                        Object.assign(scene, patch);
                    }
                }),
                
                setSelectionMode: (mode) => set((state) => {
                    state.selection.mode = mode;
                }),
                
                setFootprint: (value) => set((state) => {
                    state.selection.footprint = value;
                }),
                
                setUseDepth: (value) => set((state) => {
                    state.selection.useDepth = value;
                }),
                
                updateViewSettings: (settings) => set((state) => {
                    Object.assign(state.viewSettings, settings);
                }),
                
                updateColorSettings: (settings) => set((state) => {
                    Object.assign(state.colorSettings, settings);
                }),
                
                undo: () => {
                    // Events-based undo
                    if (typeof window !== 'undefined' && (window as any).scene?.events) {
                        (window as any).scene.events.fire('edit.undo');
                    }
                },
                
                redo: () => {
                    if (typeof window !== 'undefined' && (window as any).scene?.events) {
                        (window as any).scene.events.fire('edit.redo');
                    }
                },
                
                get canUndo() {
                    if (typeof window !== 'undefined' && (window as any).scene?.events) {
                        return (window as any).scene.events.invoke('edit.canUndo');
                    }
                    return false;
                },
                
                get canRedo() {
                    if (typeof window !== 'undefined' && (window as any).scene?.events) {
                        return (window as any).scene.events.invoke('edit.canRedo');
                    }
                    return false;
                },
                
                loadSplat: async (url: string, filename: string) => {
                    if (typeof window !== 'undefined' && (window as any).scene?.events) {
                        await (window as any).scene.events.invoke('import', [{
                            filename,
                            url
                        }]);
                    }
                },
                
                exportSplat: async (format: 'splat' | 'ply' | 'ksplat') => {
                    if (typeof window !== 'undefined' && (window as any).scene?.events) {
                        await (window as any).scene.events.invoke('export', format);
                    }
                }
            })),
            {
                name: 'viztr-splat-editor',
                storage: createJSONStorage(() => localStorage),
                partialize: (state) => ({
                    scenes: state.scenes,
                    activeSceneId: state.activeSceneId,
                    viewSettings: state.viewSettings,
                    colorSettings: state.colorSettings
                })
            }
        ),
        {
            partialize: (state) => ({
                scenes: state.scenes,
                activeSceneId: state.activeSceneId
            }),
            limit: 50
        }
    )
);

export const useSplatEditorScenes = () => useSplatEditorStore(s => s.scenes);
export const useSplatEditorActiveScene = () => useSplatEditorStore(s => s.scenes.find(sc => sc.id === s.activeSceneId) ?? s.scenes[0]);
export const useSplatEditorActiveTool = () => useSplatEditorStore(s => s.activeTool);
export const useSplatEditorViewSettings = () => useSplatEditorStore(s => s.viewSettings);
export const useSplatEditorColorSettings = () => useSplatEditorStore(s => s.colorSettings);