import { WebPCodec, WorkerQueue } from '@playcanvas/splat-transform';
import { Color, createGraphicsDevice } from 'playcanvas';

import { registerCameraPosesEvents } from './camera-poses';
import { CommandQueue } from './command-queue';
import { registerDocEvents } from './doc';
import { EditHistory } from './edit-history';
import { registerEditorEvents } from './editor-events';
import { Events } from './events';
import { initFileHandler } from './file-handler';
import { registerIframeApi } from './iframe-api';
import { registerPreferences } from './preferences';
import { registerPublishEvents } from './publish';
import { registerRenderEvents } from './render';
import { Scene } from './scene';
import { getSceneConfig } from './scene-config';
import { registerSelectionEvents } from './selection';
import { registerSequenceEvents } from './sequence';
import { ShortcutManager } from './shortcut-manager';
import { registerTimelineEvents } from './timeline';
import { 
    RectSelection, 
    BrushSelection, 
    SphereBrushSelection, 
    FloodSelection, 
    PolygonSelection, 
    LassoSelection, 
    SphereSelection, 
    BoxSelection, 
    EyedropperSelection 
} from './tools/selection-tools';
import { MoveTool, RotateTool, ScaleTool, MeasureTool, OrientTool } from './tools/transform-tools';
import { ToolManager } from './tools/tool-manager';
import { registerTrackManagerEvents } from './track-manager';
import { registerTransformHandlerEvents } from './transform-handler';
import { BoundDimensionsOverlay } from './ui/bound-dimensions-overlay';
import { EditorUI } from './ui/editor';
import { i18n } from './ui/localization';
import { registerSelectCursor } from './ui/select-cursor';

declare global {
    interface LaunchParams {
        readonly files: FileSystemFileHandle[];
    }

    interface Window {
        launchQueue: {
            setConsumer: (callback: (launchParams: LaunchParams) => void) => void;
        };
        scene: Scene;
    }
}

const getURLArgs = () => {
    const config: Record<string, any> = {};

    const apply = (key: string, value: string) => {
        let obj: any = config;
        key.split('.').forEach((k, i, a) => {
            if (i === a.length - 1) {
                obj[k] = value;
            } else {
                if (!obj.hasOwnProperty(k)) {
                    obj[k] = {};
                }
                obj = obj[k];
            }
        });
    };

    const params = new URLSearchParams(window.location.search.slice(1));
    params.forEach((value: string, key: string) => {
        apply(key, value);
    });

    return config;
};

const main = async () => {
    const events = new Events();

    const url = new URL(window.location.href);

    const commandQueue = new CommandQueue();

    const editHistory = new EditHistory(events, commandQueue);

    events.function('queue', (fn: () => Promise<void> | void) => commandQueue.enqueue(fn));

    await i18n.init();

    WebPCodec.wasmUrl = new URL('/splat-editor/lib/webp/webp.wasm', document.baseURI).toString();

    WorkerQueue.maxWorkers = 0;

    registerTimelineEvents(events);
    registerCameraPosesEvents(events);
    registerTrackManagerEvents(events);
    registerTransformHandlerEvents(events);
    registerPublishEvents(events);
    registerIframeApi(events);

    const shortcutManager = new ShortcutManager(events);
    events.function('shortcutManager', () => shortcutManager);

    const editorUI = new EditorUI(events);

    const graphicsDevice = await createGraphicsDevice(editorUI.canvas, {
        deviceTypes: ['webgpu'],
        antialias: false,
        depth: false,
        stencil: false,
        xrCompatible: false,
        powerPreference: 'high-performance'
    });

    const urlArgs = getURLArgs();

    const overrides = [
        urlArgs
    ];

    const sceneConfig = getSceneConfig(overrides);

    const scene = new Scene(
        events,
        sceneConfig,
        editorUI.canvas,
        graphicsDevice,
        commandQueue
    );

    const bgClr = new Color();
    const selectedClr = new Color();
    const unselectedClr = new Color();
    const lockedClr = new Color();

    const setClr = (target: Color, value: Color, event: string) => {
        if (!target.equals(value)) {
            target.copy(value);
            events.fire(event, target);
        }
    };

    const setBgClr = (clr: Color) => {
        setClr(bgClr, clr, 'bgClr');
    };
    const setSelectedClr = (clr: Color) => {
        setClr(selectedClr, clr, 'selectedClr');
    };
    const setUnselectedClr = (clr: Color) => {
        setClr(unselectedClr, clr, 'unselectedClr');
    };
    const setLockedClr = (clr: Color) => {
        setClr(lockedClr, clr, 'lockedClr');
    };

    events.on('setBgClr', (clr: Color) => {
        setBgClr(clr);
    });
    events.on('setSelectedClr', (clr: Color) => {
        setSelectedClr(clr);
    });
    events.on('setUnselectedClr', (clr: Color) => {
        setUnselectedClr(clr);
    });
    events.on('setLockedClr', (clr: Color) => {
        setLockedClr(clr);
    });

    events.function('bgClr', () => {
        return bgClr;
    });
    events.function('selectedClr', () => {
        return selectedClr;
    });
    events.function('unselectedClr', () => {
        return unselectedClr;
    });
    events.function('lockedClr', () => {
        return lockedClr;
    });

    events.on('bgClr', (clr: Color) => {
        const cnv = (v: number) => `${Math.max(0, Math.min(255, (v * 255))).toFixed(0)}`;
        document.body.style.backgroundColor = `rgba(${cnv(clr.r)},${cnv(clr.g)},${cnv(clr.b)},1)`;
    });
    events.on('selectedClr', (clr: Color) => {
        scene.forceRender = true;
    });
    events.on('unselectedClr', (clr: Color) => {
        scene.forceRender = true;
    });
    events.on('lockedClr', (clr: Color) => {
        scene.forceRender = true;
    });

    const toColor = (value: { r: number, g: number, b: number, a: number }) => {
        return new Color(value.r, value.g, value.b, value.a);
    };
    setBgClr(toColor(sceneConfig.bgClr));
    setSelectedClr(toColor(sceneConfig.selectedClr));
    setUnselectedClr(toColor(sceneConfig.unselectedClr));
    setLockedClr(toColor(sceneConfig.lockedClr));

    const maskCanvas = document.createElement('canvas');
    const maskContext = maskCanvas.getContext('2d');
    maskCanvas.setAttribute('id', 'mask-canvas');
    maskContext.globalCompositeOperation = 'copy';

    const mask = {
        canvas: maskCanvas,
        context: maskContext,
        busy: false
    };

    const toolManager = new ToolManager(events);
    toolManager.register('rectSelection', new RectSelection(events, editorUI.toolsContainer));
    toolManager.register('brushSelection', new BrushSelection(events, editorUI.toolsContainer, mask));
    toolManager.register('sphereBrushSelection', new SphereBrushSelection(events, editorUI.toolsContainer, mask));
    toolManager.register('floodSelection', new FloodSelection(events, editorUI.toolsContainer, mask, editorUI.canvasContainer));
    toolManager.register('polygonSelection', new PolygonSelection(events, editorUI.toolsContainer, mask));
    toolManager.register('lassoSelection', new LassoSelection(events, editorUI.toolsContainer, mask));
    toolManager.register('sphereSelection', new SphereSelection(events, scene, editorUI.canvasContainer, editorUI.tooltips));
    toolManager.register('boxSelection', new BoxSelection(events, scene, editorUI.canvasContainer, editorUI.tooltips));
    toolManager.register('eyedropperSelection', new EyedropperSelection(events, editorUI.toolsContainer, editorUI.canvasContainer));
    toolManager.register('move', new MoveTool(events, scene));
    toolManager.register('rotate', new RotateTool(events, scene));
    toolManager.register('scale', new ScaleTool(events, scene));
    toolManager.register('measure', new MeasureTool(events, scene, editorUI.canvasContainer, editorUI.annotationContainer));
    toolManager.register('orient', new OrientTool(events, scene, editorUI.toolsContainer, editorUI.canvasContainer, editorUI.annotationContainer));

    const boundDimensionsOverlay = new BoundDimensionsOverlay(events, scene, editorUI.canvasContainer, editorUI.annotationContainer.dom);

    editorUI.toolsContainer.dom.appendChild(maskCanvas);

    registerSelectCursor(events, editorUI.toolsContainer.dom);

    window.scene = scene;

    registerEditorEvents(events, editHistory, scene);
    registerSelectionEvents(events, scene);
    registerSequenceEvents(events, scene);
    registerDocEvents(scene, events);
    registerRenderEvents(scene, events);
    initFileHandler(scene, events, editorUI.appContainer.dom);

    registerPreferences(events, sceneConfig, urlArgs);

    scene.start();

    const loadList = url.searchParams.getAll('load');
    const filenameList = url.searchParams.getAll('filename');
    for (const [i, value] of loadList.entries()) {
        const decoded = decodeURIComponent(value);
        const filename = i < filenameList.length ?
            decodeURIComponent(filenameList[i]) :
            decoded.split('/').pop();

        await events.invoke('import', [{
            filename,
            url: decoded
        }]);
    }

    if ('launchQueue' in window) {
        window.launchQueue.setConsumer(async (launchParams: LaunchParams) => {
            for (const file of launchParams.files) {
                await events.invoke('import', [{
                    filename: file.name,
                    contents: await file.getFile()
                }]);
            }
        });
    }
};

export { main };