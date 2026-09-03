import {
    EVENT_POSTRENDER_LAYER,
    EVENT_PRERENDER_LAYER,
    LAYERID_DEPTH,
    SORTMODE_CUSTOM,
    BoundingBox,
    CameraComponent,
    Color,
    Entity,
    Layer,
    GraphicsDevice,
    MeshInstance,
    Vec3
} from 'playcanvas';

import { AssetLoader } from './asset-loader';
import { Camera } from './camera';
import { CameraPoseGizmos } from './camera-pose-gizmos';
import { CommandQueue } from './command-queue';
import { DataProcessor } from './data-processor';
import { Element, ElementType, ElementTypeList } from './element';
import { Events } from './events';
import { InfiniteGrid as Grid } from './infinite-grid';
import { Outline } from './outline';
import { PCApp } from './pc-app';
import { ProjectedSplatRenderer } from './projected-splat-renderer';
import { SceneConfig } from './scene-config';
import { SceneState } from './scene-state';
import { Splat } from './splat';
import { SplatCenters } from './splat-centers';
import { Underlay } from './underlay';

const corner = new Vec3();
const cameraPos = new Vec3();
const cameraDir = new Vec3();

const specialSort = (instances: MeshInstance[], numInstances: number, cameraPos: Vec3, cameraDir: Vec3) => {
    const distances = new Map<MeshInstance, number>();

    for (let i = 0; i < numInstances; i++) {
        const instance = instances[i];
        const { aabb } = instance;
        const { center, halfExtents } = aabb;

        let maxDist = -Infinity;
        for (let cx = -1; cx <= 1; cx += 2) {
            for (let cy = -1; cy <= 1; cy += 2) {
                for (let cz = -1; cz <= 1; cz += 2) {
                    corner.set(
                        center.x + cx * halfExtents.x,
                        center.y + cy * halfExtents.y,
                        center.z + cz * halfExtents.z
                    );
                    const dist = (corner.x - cameraPos.x) * cameraDir.x +
                                    (corner.y - cameraPos.y) * cameraDir.y +
                                    (corner.z - cameraPos.z) * cameraDir.z;
                    if (dist > maxDist) {
                        maxDist = dist;
                    }
                }
            }
        }

        distances.set(instance, maxDist);
    }

    instances.sort((a, b) => distances.get(b) - distances.get(a));
};

type ResolveMode = 'none' | 'old' | 'new';

const FRAME_TIMING_WINDOW = 180;

export class Scene {
    events: Events;
    config: SceneConfig;
    canvas: HTMLCanvasElement;
    app: PCApp;
    worldLayer: Layer;
    splatLayer: Layer;
    overlayLayer: Layer;
    centersLayer: Layer;
    gizmoLayer: Layer;
    sceneState = [new SceneState(), new SceneState()];
    elements: Element[] = [];
    boundStorage = new BoundingBox();
    boundDirty = true;
    forceRender = false;

    forceInteracting = false;

    movingRender = false;
    pendingResolve = false;

    autoEngageMs = 60;
    autoEngaged = false;
    private autoSampling = false;
    private frameModes = new Map<number, boolean>();

    lockedRenderMode = false;
    lockedRender = false;

    suspendRender = false;

    private _resolveMode: ResolveMode = 'new';

    canvasResize: {width: number; height: number} | null = null;
    targetSize = {
        width: 0,
        height: 0
    };

    readonly frameTimings = {
        gpu: [] as number[],
        cpu: [] as number[],
        width: 0,
        height: 0,
        stochastic: false,
        gpuSupported: false
    };

    private cpuFrameStart = 0;

    dataProcessor: DataProcessor;
    projectedSplatRenderer: ProjectedSplatRenderer;
    assetLoader: AssetLoader;
    camera: Camera;
    cameraPoseGizmos: CameraPoseGizmos;
    splatCenters: SplatCenters;
    grid: Grid;
    outline: Outline;
    underlay: Underlay;

    commandQueue: CommandQueue;

    contentRoot: Entity;
    cameraRoot: Entity;

    constructor(
        events: Events,
        config: SceneConfig,
        canvas: HTMLCanvasElement,
        graphicsDevice: GraphicsDevice,
        commandQueue: CommandQueue
    ) {
        this.events = events;
        this.config = config;
        this.canvas = canvas;
        this.commandQueue = commandQueue;

        this.app = new PCApp(canvas, { graphicsDevice });

        this.app.autoRender = false;
        // @ts-ignore
        this.app._allowResize = false;

        // @ts-ignore
        this.app.off('prerender', this.app._firstBake, this.app);

        // @ts-ignore
        this.app.loader.getHandler('texture').imgParser.crossOrigin = 'anonymous';

        this.app.graphicsDevice.maxPixelRatio = window.devicePixelRatio;

        const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
            if (entries.length > 0) {
                const entry = entries[0];
                if (entry) {
                    if (entry.devicePixelContentBoxSize) {
                        this.canvasResize = {
                            width: entry.devicePixelContentBoxSize[0].inlineSize,
                            height: entry.devicePixelContentBoxSize[0].blockSize
                        };
                    } else if (entry.contentBoxSize.length > 0) {
                        const pixelRatio = window.devicePixelRatio;
                        this.canvasResize = {
                            width: Math.ceil(entry.contentBoxSize[0].inlineSize * pixelRatio),
                            height: Math.ceil(entry.contentBoxSize[0].blockSize * pixelRatio)
                        };
                    }
                }
                this.forceRender = true;
            }
        });

        const canvasContainer = window.document.getElementById('canvas-container');
        observer.observe(canvasContainer);

        canvasContainer.addEventListener('pointermove', (event: PointerEvent) => {
            if (event.buttons !== 0) {
                this.forceInteracting = true;
            }
        }, true);

        const depthLayer = this.app.scene.layers.getLayerById(LAYERID_DEPTH);
        this.app.scene.layers.remove(depthLayer);
        this.app.scene.layers.insertOpaque(depthLayer, 2);

        this.app.on('update', (deltaTime: number) => this.onUpdate(deltaTime));
        this.app.on('prerender', () => this.onPreRender());
        this.app.on('postrender', () => this.onPostRender());

        this.frameTimings.gpuSupported = !!(this.app.graphicsDevice as any).supportsTimestampQuery;
        events.function('scene.frameTimings', () => this.frameTimings);

        const profiler = this.app.graphicsDevice.gpuProfiler as any;
        const originalReport = profiler.report.bind(profiler);
        profiler.report = (renderVersion: number, timings: number[] | null, frameTime?: number) => {
            originalReport(renderVersion, timings, frameTime);
            this.onGpuReport(renderVersion, timings, frameTime);
        };

        this.app.graphicsDevice.on('devicerestored', () => {
            this.forceRender = true;
        });

        this.app.scene.on(EVENT_PRERENDER_LAYER, (camera: CameraComponent, layer: Layer, transparent: boolean) => {
            camera.fire('preRenderLayer', layer, transparent);
        });

        this.app.scene.on(EVENT_POSTRENDER_LAYER, (camera: CameraComponent, layer: Layer, transparent: boolean) => {
            camera.fire('postRenderLayer', layer, transparent);
        });

        this.worldLayer = this.app.scene.layers.getLayerByName('World');

        this.splatLayer = new Layer({
            name: 'Splat',
            opaqueSortMode: SORTMODE_CUSTOM,
            transparentSortMode: SORTMODE_CUSTOM
        });
        this.splatLayer.customCalculateSortValues = specialSort;

        this.overlayLayer = new Layer({ name: 'ToolOverlay' });

        this.centersLayer = new Layer({
            name: 'Centers',
            clearDepthBuffer: true
        });

        this.gizmoLayer = new Layer({
            name: 'Gizmo',
            clearDepthBuffer: true,
            clearStencilBuffer: true
        });

        const layers = this.app.scene.layers;
        layers.push(this.splatLayer);
        layers.push(this.overlayLayer);
        layers.push(this.centersLayer);
        layers.push(this.gizmoLayer);

        this.projectedSplatRenderer = new ProjectedSplatRenderer(this);
        this.dataProcessor = new DataProcessor(this.app.graphicsDevice);
        this.assetLoader = new AssetLoader(this.app, events);

        this.contentRoot = new Entity('contentRoot');
        this.app.root.addChild(this.contentRoot);

        this.cameraRoot = new Entity('cameraRoot');
        this.app.root.addChild(this.cameraRoot);

        this.camera = new Camera();
        this.add(this.camera);

        this.cameraPoseGizmos = new CameraPoseGizmos();
        this.add(this.cameraPoseGizmos);

        this.splatCenters = new SplatCenters();
        this.add(this.splatCenters);

        this.grid = new Grid();
        this.add(this.grid);

        this.outline = new Outline();
        this.add(this.outline);
        this.underlay = new Underlay();
        this.add(this.underlay);
    }

    start() {
        this.app.start();
    }

    clear() {
        const splats = this.getElementsByType(ElementType.splat);
        splats.forEach((splat) => {
            (splat as Splat).destroy();
        });
    }

    async add(element: Element) {
        if (!element.scene) {
            element.scene = this;
            await element.add();
            this.elements.push(element);

            this.forEachElement(e => e !== element && e.onAdded(element));

            this.events.fire('scene.elementAdded', element);
        }
    }

    remove(element: Element) {
        if (element.scene === this) {
            const index = this.elements.indexOf(element);
            if (index !== -1) {
                this.elements.splice(index, 1);
            }

            this.events.fire('scene.elementRemoved', element);

            this.forEachElement(e => e.onRemoved(element));

            element.remove();
            element.scene = null;
        }
    }

    get bound() {
        if (this.boundDirty) {
            let valid = false;
            this.forEachElement((e) => {
                const bound = e.worldBound;
                if (bound) {
                    if (!valid) {
                        valid = true;
                        this.boundStorage.copy(bound);
                    } else {
                        this.boundStorage.add(bound);
                    }
                }
            });

            this.boundDirty = false;
            this.events.fire('scene.boundChanged', this.boundStorage);
        }

        return this.boundStorage;
    }

    getElementsByType(elementType: ElementType) {
        return this.elements.filter(e => e.type === elementType);
    }

    get graphicsDevice() {
        return this.app.graphicsDevice;
    }

    set resolveMode(value: ResolveMode) {
        this._resolveMode = value;
        this.forceRender = true;
    }

    get resolveMode() {
        return this._resolveMode;
    }

    private forEachElement(action: (e: Element) => void) {
        this.elements.forEach(action);
    }

    private onUpdate(deltaTime: number) {
        this.cpuFrameStart = performance.now();

        if (this.canvasResize) {
            this.canvas.width = this.canvasResize.width;
            this.canvas.height = this.canvasResize.height;
            this.canvasResize = null;
        }

        this.forEachElement(e => e.onUpdate(deltaTime));

        this.events.fire('update', deltaTime);

        const i = this.app.frame % 2;
        const state = this.sceneState[i];
        state.reset();
        this.forEachElement(e => state.pack(e));

        const result = state.compare(this.sceneState[1 - i]);

        const all = new Set([...result.added, ...result.removed, ...result.moved, ...result.changed]);

        const profiling = !!this.events.invoke('view.perfOverlay');

        const changed = this.forceRender || profiling || all.size > 0;
        const interacting = this.forceInteracting || all.size > 0;
        const stochastic = this.events.invoke('view.stochastic');

        const auto = stochastic === 'auto';
        this.autoSampling = auto && this.frameTimings.gpuSupported;
        const adaptive = stochastic === 'movement' ||
            (auto && (this.autoEngaged || !this.frameTimings.gpuSupported));
        this.movingRender = !this.lockedRenderMode &&
            (stochastic === 'enabled' || (adaptive && interacting));

        this.app.graphicsDevice.gpuProfiler.enabled =
            (profiling || this.autoSampling) && !this.lockedRenderMode;

        if (this.suspendRender) {
            this.app.renderNextFrame = false;
        } else if (this.lockedRenderMode) {
            this.app.renderNextFrame = this.lockedRender;
            this.lockedRender = false;
        } else if (!this.app.renderNextFrame) {
            if (changed) {
                this.app.renderNextFrame = true;
                if (interacting) {
                    this.pendingResolve = adaptive;
                }
            } else if (this.pendingResolve) {
                this.pendingResolve = false;
                this.app.renderNextFrame = true;
            }
        }
        this.forceRender = false;
        this.forceInteracting = false;

        ElementTypeList.forEach((type) => {
            if (all.has(type)) {
                this.events.fire(`updated:${type}`);
            }
        });

        this.forEachElement(e => e.onPostUpdate());
    }

    private onPreRender() {
        this.targetSize.width = Math.ceil(this.app.graphicsDevice.width / this.config.camera.pixelScale);
        this.targetSize.height = Math.ceil(this.app.graphicsDevice.height / this.config.camera.pixelScale);

        this.forEachElement(e => e.onPreRender());

        this.projectedSplatRenderer.render();

        this.events.fire('prerender', this.camera.displayTransform);

        if (this.config.debug.showBound) {
            this.forEachElement((e: Element) => {
                if (e.type === ElementType.splat) {
                    const splat = e as Splat;

                    const local = splat.localBound;
                    this.app.drawWireAlignedBox(
                        local.getMin(),
                        local.getMax(),
                        Color.RED,
                        true,
                        undefined,
                        splat.entity.getWorldTransform());

                    const world = splat.worldBound;
                    this.app.drawWireAlignedBox(
                        world.getMin(),
                        world.getMax(),
                        Color.GREEN);
                }
            });

            this.app.drawWireAlignedBox(this.bound.getMin(), this.bound.getMax(), Color.BLUE);
        }
    }

    private onPostRender() {
        this.forEachElement(e => e.onPostRender());

        this.events.fire('postrender');

        const gpuTime = (this.app.graphicsDevice.gpuProfiler as any)?._frameTime ?? 0;

        const device = this.app.graphicsDevice as any;
        if (device.gpuProfiler._enabled) {
            this.frameModes.set(device.renderVersion, this.movingRender);
        }

        const timings = this.frameTimings;
        timings.gpu.push(gpuTime);
        timings.cpu.push(performance.now() - this.cpuFrameStart);
        if (timings.gpu.length > FRAME_TIMING_WINDOW) {
            timings.gpu.shift();
            timings.cpu.shift();
        }
        timings.width = this.targetSize.width;
        timings.height = this.targetSize.height;
        timings.stochastic = this.movingRender;
    }

    private onGpuReport(renderVersion: number, timings: number[] | null, frameTime?: number) {
        const moving = this.frameModes.get(renderVersion);

        this.frameModes.forEach((_, version) => {
            if (version <= renderVersion) {
                this.frameModes.delete(version);
            }
        });

        if (moving === false && timings && timings.length > 0) {
            const gpuTime = frameTime ?? timings.reduce((sum, t) => sum + t, 0);
            this.autoEngaged = gpuTime > this.autoEngageMs;
        }
    }
}

