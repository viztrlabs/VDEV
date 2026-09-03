import {
    AppBase,
    AppOptions,
    AnimComponentSystem,
    RenderComponentSystem,
    CameraComponentSystem,
    LightComponentSystem,
    GSplatComponentSystem,
    RenderHandler,
    AnimClipHandler,
    AnimStateGraphHandler,
    ContainerHandler,
    CubemapHandler,
    GSplatHandler,
    TextureHandler
} from 'playcanvas';

export class PCApp extends AppBase {
    constructor(canvas: HTMLCanvasElement, options: any) {
        super(canvas);

        const appOptions = new AppOptions();

        appOptions.graphicsDevice = options.graphicsDevice;
        this.addComponentSystems(appOptions);
        this.addResourceHandles(appOptions);

        appOptions.elementInput = options.elementInput;
        appOptions.keyboard = options.keyboard;
        appOptions.mouse = options.mouse;
        appOptions.touch = options.touch;
        appOptions.gamepads = options.gamepads;

        appOptions.scriptPrefix = options.scriptPrefix;
        appOptions.assetPrefix = options.assetPrefix;
        appOptions.scriptsOrder = options.scriptsOrder;

        this.init(appOptions);
    }

    addComponentSystems(appOptions: AppOptions) {
        appOptions.componentSystems = [
            AnimComponentSystem,
            RenderComponentSystem,
            CameraComponentSystem,
            LightComponentSystem,
            GSplatComponentSystem
        ];
    }

    addResourceHandles(appOptions: AppOptions) {
        appOptions.resourceHandlers = [
            RenderHandler,
            AnimClipHandler,
            AnimStateGraphHandler,
            TextureHandler,
            CubemapHandler,
            ContainerHandler,
            GSplatHandler
        ];
    }
}