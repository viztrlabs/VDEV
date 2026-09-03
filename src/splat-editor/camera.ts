import {
    math,
    ADDRESS_CLAMP_TO_EDGE,
    ASPECT_MANUAL,
    FILTER_NEAREST,
    PIXELFORMAT_RGBA8,
    PIXELFORMAT_RGBA16F,
    PIXELFORMAT_DEPTH,
    PROJECTION_ORTHOGRAPHIC,
    PROJECTION_PERSPECTIVE,
    TONEMAP_ACES,
    TONEMAP_ACES2,
    TONEMAP_FILMIC,
    TONEMAP_HEJL,
    TONEMAP_LINEAR,
    TONEMAP_NEUTRAL,
    BoundingBox,
    Color,
    Entity,
    Mat4,
    Quat,
    Ray,
    RenderPass,
    RenderPassForward,
    RenderTarget,
    Texture,
    Vec3,
    Vec4
} from 'playcanvas';

import { PointerController } from './controllers';
import { Element, ElementType } from './element';
import { Picker } from './picker';
import { Serializer } from './serializer';
import { vertexShader, fragmentShader } from './shaders/blit-shader';
import { Splat } from './splat';
import { TweenValue } from './tween-value';
import { ShaderQuad, SimpleRenderPass } from './utils/simple-render-pass';

const forwardVec = new Vec3();
const cameraPosition = new Vec3();
const ray = new Ray();
const vec = new Vec3();
const vecb = new Vec3();
const va = new Vec3();
const m = new Mat4();
const v4 = new Vec4();

const mod = (n: number, m: number) => ((n % m) + m) % m;

const RESOLVE_UNIFFORM = { none: 0, old: 1, new: 2 };

export class Camera extends Element {
    controller: PointerController;
    focalPointTween = new TweenValue({ x: 0, y: 0.5, z: 0 });
    azimElevTween = new TweenValue({ azim: 30, elev: -15 });
    distanceTween = new TweenValue({ distance: 1 });

    minElev = -90;
    maxElev = 90;

    sceneRadius = 1;

    flySpeed = 1;

    controlMode: 'orbit' | 'fly' = 'orbit';

    lookCameraPos: Vec3 | null = null;

    picker: Picker;

    mainCamera: Entity;

    mainTarget: RenderTarget;
    splatTarget: RenderTarget;
    colorTarget: RenderTarget;
    workTarget: RenderTarget;

    clearPass: RenderPass;
    mainPass: RenderPassForward;
    splatPass: RenderPassForward;
    gizmoPass: RenderPassForward;
    finalPass: SimpleRenderPass;

    targetSizeOverride: { width: number, height: number } = null;

    poseOverride: { position: Vec3, rotation: Quat, fov: number, near: number, far: number } | null = null;

    displayTransform = new Mat4();

    renderOverlays = true;

    updateCameraUniforms: () => void;

    constructor() {
        super(ElementType.camera);

        this.mainCamera = new Entity('Camera');
        this.mainCamera.addComponent('camera');
    }

    set ortho(value: boolean) {
        if (value !== this.ortho) {
            this.camera.projection = value ? PROJECTION_ORTHOGRAPHIC : PROJECTION_PERSPECTIVE;
            this.scene.events.fire('camera.ortho', value);
        }
    }

    get ortho() {
        return this.camera.projection === PROJECTION_ORTHOGRAPHIC;
    }

    set fov(value: number) {
        this.camera.fov = value;
    }

    get fov() {
        return this.camera.fov;
    }

    set tonemapping(value: string) {
        const mapping: Record<string, number> = {
            linear: TONEMAP_LINEAR,
            neutral: TONEMAP_NEUTRAL,
            aces: TONEMAP_ACES,
            aces2: TONEMAP_ACES2,
            filmic: TONEMAP_FILMIC,
            hejl: TONEMAP_HEJL
        };

        const tvalue = mapping[value];

        if (tvalue !== undefined && tvalue !== this.camera.toneMapping) {
            this.camera.toneMapping = tvalue;
            this.scene.events.fire('camera.tonemapping', value);
        }
    }

    get tonemapping() {
        switch (this.camera.toneMapping) {
            case TONEMAP_LINEAR: return 'linear';
            case TONEMAP_NEUTRAL: return 'neutral';
            case TONEMAP_ACES: return 'aces';
            case TONEMAP_ACES2: return 'aces2';
            case TONEMAP_FILMIC: return 'filmic';
            case TONEMAP_HEJL: return 'hejl';
        }
        return 'linear';
    }

    set near(value: number) {
        this.camera.nearClip = value;
    }

    get near() {
        return this.camera.nearClip;
    }

    set far(value: number) {
        this.camera.farClip = value;
    }

    get far() {
        return this.camera.farClip;
    }

    get focalPoint() {
        const t = this.focalPointTween.target;
        return new Vec3(t.x, t.y, t.z);
    }

    get azimElev() {
        return this.azimElevTween.target;
    }

    get azim() {
        return this.azimElev.azim;
    }

    get elevation() {
        return this.azimElev.elev;
    }

    get distance() {
        return this.distanceTween.target.distance;
    }

    setFocalPoint(point: Vec3, dampingFactorFactor: number = 1) {
        this.lookCameraPos = null;
        this.focalPointTween.goto(point, dampingFactorFactor * this.scene.config.controls.dampingFactor);
    }

    look(dx: number, dy: number) {
        const sensitivity = this.scene.config.controls.orbitSensitivity;
        const d = this.distance * this.sceneRadius / this.fovFactor;

        Camera.calcForwardVec(forwardVec, this.azim, this.elevation);
        const cameraPos = this.focalPoint.add(forwardVec.clone().mulScalar(d));

        const azim = this.azim - dx * sensitivity;
        const elev = this.elevation - dy * sensitivity;

        Camera.calcForwardVec(forwardVec, azim, elev);
        const focalPoint = cameraPos.clone().sub(forwardVec.clone().mulScalar(d));

        this.setAzimElev(azim, elev);
        this.focalPointTween.goto(focalPoint, this.scene.config.controls.dampingFactor);
        this.lookCameraPos = cameraPos;
    }

    setAzimElev(azim: number, elev: number, dampingFactorFactor: number = 1) {
        azim = mod(azim, 360);
        elev = Math.max(this.minElev, Math.min(this.maxElev, elev));

        const t = this.azimElevTween;
        t.goto({ azim, elev }, dampingFactorFactor * this.scene.config.controls.dampingFactor);

        if (t.source.azim - azim < -180) {
            t.source.azim += 360;
        } else if (t.source.azim - azim > 180) {
            t.source.azim -= 360;
        }

        this.ortho = false;
    }

    setDistance(distance: number, dampingFactorFactor: number = 1) {
        this.lookCameraPos = null;

        const controls = this.scene.config.controls;

        distance = Math.max(controls.minZoom, Math.min(controls.maxZoom, distance));

        const t = this.distanceTween;
        t.goto({ distance }, dampingFactorFactor * controls.dampingFactor);
    }

    setPose(position: Vec3, target: Vec3, dampingFactorFactor: number = 1) {
        vec.sub2(target, position);
        const l = vec.length();
        const azim = Math.atan2(-vec.x / l, -vec.z / l) * math.RAD_TO_DEG;
        const elev = Math.asin(vec.y / l) * math.RAD_TO_DEG;
        this.setFocalPoint(target, dampingFactorFactor);
        this.setAzimElev(azim, elev, dampingFactorFactor);
        this.setDistance(l / this.sceneRadius * this.fovFactor, dampingFactorFactor);
    }

    setPoseOverride(override: Camera['poseOverride']) {
        this.poseOverride = override;
        this.onUpdate(0);
    }

    worldToScreen(world: Vec3, screen: Vec3) {
        const { camera } = this;
        m.mul2(camera.projectionMatrix, camera.viewMatrix);

        v4.set(world.x, world.y, world.z, 1);
        m.transformVec4(v4, v4);

        screen.x = v4.x / v4.w * 0.5 + 0.5;
        screen.y = 1.0 - (v4.y / v4.w * 0.5 + 0.5);
        screen.z = v4.z / v4.w;
    }

    add() {
        const { camera, scene } = this;

        scene.cameraRoot.addChild(this.mainCamera);

        this.mainCamera.camera.layers = [
            scene.worldLayer.id,
            scene.splatLayer.id,
            scene.overlayLayer.id,
            scene.centersLayer.id,
            scene.gizmoLayer.id
        ];

        camera.aspectRatioMode = ASPECT_MANUAL;

        const device = scene.graphicsDevice;
        const { app } = scene;
        const renderer = app.renderer;
        const composition = app.scene.layers;

        this.clearPass = new RenderPass(device);
        this.mainPass = new RenderPassForward(device, composition, app.scene, renderer);
        this.splatPass = new RenderPassForward(device, composition, app.scene, renderer);
        this.gizmoPass = new RenderPassForward(device, composition, app.scene, renderer);
        this.finalPass = new SimpleRenderPass(device,
            new ShaderQuad(device, vertexShader, fragmentShader, 'final-blit'), {
                vars: () => {
                    const gd = this.scene.graphicsDevice;
                    const ts = this.targetSize;
                    return {
                        srcTexture: this.mainTarget.colorBuffer,
                        blitScale: [ts.width / gd.width, ts.height / gd.height],
                        quadResolve: this.scene.movingRender ? RESOLVE_UNIFORM[this.scene.resolveMode] : 0
                    };
                }
            });

        const target = document.getElementById('canvas-container');
        this.controller = new PointerController(this, target);

        const config = scene.config;
        const controls = config.controls;

        this.minElev = (controls.minPolarAngle * 180) / Math.PI - 90;
        this.maxElev = (controls.maxPolarAngle * 180) / Math.PI - 90;

        camera.toneMapping = {
            linear: TONEMAP_LINEAR,
            filmic: TONEMAP_FILMIC,
            hejl: TONEMAP_HEJL,
            aces: TONEMAP_ACES,
            aces2: TONEMAP_ACES2,
            neutral: TONEMAP_NEUTRAL
        }[config.camera.toneMapping];

        scene.app.scene.exposure = config.camera.exposure;

        this.fov = config.camera.fov;

        this.setAzimElev(controls.initialAzim, controls.initialElev, 0);
        this.setDistance(controls.initialZoom, 0);

        this.picker = new Picker(scene);

        scene.events.on('scene.boundChanged', this.onBoundChanged, this);

        this.updateCameraUniforms = () => {
            const device = scene.graphicsDevice;
            const entity = this.mainCamera;
            const camera = entity.camera;

            const set = (name: string, vec: Vec3) => {
                device.scope.resolve(name).setValue([vec.x, vec.y, vec.z]);
            };

            const points = camera.camera.getFrustumCorners(-100);
            const worldTransform = this.worldTransform;
            for (let i = 0; i < points.length; i++) {
                worldTransform.transformPoint(points[i], points[i]);
            }

            if (camera.projection === PROJECTION_PERSPECTIVE) {
                set('near_origin', worldTransform.getTranslation());
                set('near_x', Vec3.ZERO);
                set('near_y', Vec3.ZERO);
            } else {
                set('near_origin', points[3]);
                set('near_x', va.sub2(points[0], points[3]));
                set('near_y', va.sub2(points[2], points[3]));
            }

            set('far_origin', points[7]);
            set('far_x', va.sub2(points[4], points[7]));
            set('far_y', va.sub2(points[6], points[7]));
        };

        const url = new URL(location.href);
        const focal = url.searchParams.get('focal');
        if (focal) {
            const parts = focal.toString().split(',');
            if (parts.length === 3) {
                this.setFocalPoint(new Vec3(parseFloat(parts[0]), parseFloat(parts[1]), parseFloat(parts[2])), 0);
            }
        }
        const angles = url.searchParams.get('angles');
        if (angles) {
            const parts = angles.toString().split(',');
            if (parts.length === 2) {
                this.setAzimElev(parseFloat(parts[0]), parseFloat(parts[1]), 0);
            }
        }
        const distance = url.searchParams.get('distance');
        if (distance) {
            this.setDistance(parseFloat(distance), 0);
        }
    }

    remove() {
        const { scene } = this;

        this.controller.destroy();
        this.controller = null;

        this.clearPass?.destroy();
        this.mainPass?.destroy();
        this.splatPass?.destroy();
        this.gizmoPass?.destroy();
        this.finalPass?.destroy();
        this.camera.framePasses = null;

        scene.cameraRoot.removeChild(this.mainCamera);

        this.picker.destroy();
        this.picker = null;

        scene.events.off('scene.boundChanged', this.onBoundChanged, this);
    }

    onBoundChanged(bound: BoundingBox) {
        const prevDistance = this.distanceTween.value.distance * this.sceneRadius;
        this.sceneRadius = Math.max(1e-03, bound.halfExtents.length());
        this.setDistance(prevDistance / this.sceneRadius, 0);
    }

    serialize(serializer: Serializer) {
        const pack3 = (v: Vec3) => [v.x, v.y, v.z];

        serializer.packa(this.worldTransform.data);
        serializer.pack(
            this.fov,
            this.tonemapping,
            this.targetSize.width,
            this.targetSize.height
        );
    }

    rebuildRenderTargets() {
        const { width, height } = this.targetSize;
        const { mainTarget, scene } = this;

        if (mainTarget && mainTarget.width === width && mainTarget.height === height) {
            return;
        }

        if (!mainTarget) {
            const { graphicsDevice } = scene;

            const createTexture = (name: string, width: number, height: number, format: number) => {
                return new Texture(graphicsDevice, {
                    name,
                    width,
                    height,
                    format,
                    mipmaps: false,
                    minFilter: FILTER_NEAREST,
                    magFilter: FILTER_NEAREST,
                    addressU: ADDRESS_CLAMP_TO_EDGE,
                    addressV: ADDRESS_CLAMP_TO_EDGE
                });
            };

            const colorBuffer = createTexture('cameraColor', width, height, PIXELFORMAT_RGBA16F);
            const workBuffer = createTexture('workColor', width, height, PIXELFORMAT_RGBA8);
            const depthBuffer = createTexture('cameraDepth', width, height, PIXELFORMAT_DEPTH);

            this.mainTarget = new RenderTarget({
                colorBuffer,
                depthBuffer,
                flipY: false,
                autoResolve: false
            });

            this.splatTarget = new RenderTarget({
                colorBuffers: [
                    colorBuffer,
                    workBuffer
                ],
                depthBuffer,
                flipY: false,
                autoResolve: false
            });

            this.colorTarget = new RenderTarget({
                colorBuffer,
                depth: false,
                autoResolve: false
            });

            this.workTarget = new RenderTarget({
                colorBuffer: workBuffer,
                depth: false,
                autoResolve: false
            });

            this.picker.setRenderTargets(this.colorTarget, this.workTarget);

            this.clearPass.init(this.splatTarget);
            this.clearPass.setClearColor(new Color(0, 0, 0, 0));
            this.clearPass.setClearDepth(1);
            this.clearPass.setClearStencil(0);

            this.mainPass.init(this.mainTarget);
            this.mainPass.addLayer(this.camera, scene.worldLayer, false, false);
            this.mainPass.addLayer(this.camera, scene.worldLayer, true, false);

            this.splatPass.init(this.splatTarget);
            this.splatPass.addLayer(this.camera, scene.splatLayer, false, false);
            this.splatPass.addLayer(this.camera, scene.splatLayer, true, false);

            this.gizmoPass.init(this.mainTarget);
            this.gizmoPass.addLayer(this.camera, scene.overlayLayer, false, false);
            this.gizmoPass.addLayer(this.camera, scene.overlayLayer, true, false);
            this.gizmoPass.addLayer(this.camera, scene.centersLayer, false, true);
            this.gizmoPass.addLayer(this.camera, scene.centersLayer, true, false);
            this.gizmoPass.addLayer(this.camera, scene.gizmoLayer, false, true);
            this.gizmoPass.addLayer(this.camera, scene.gizmoLayer, true, false);

            this.finalPass.init(null);

            this.camera.framePasses = [this.clearPass, this.mainPass, this.splatPass, this.gizmoPass, this.finalPass];
        } else {
            const { splatTarget, colorTarget, workTarget } = this;

            mainTarget.resize(width, height);
            workTarget.resize(width, height);
            colorTarget.resize(width, height);
            splatTarget.resize(width, height);
        }

        this.camera.horizontalFov = width > height;
        this.camera.aspectRatio = width / height;
        scene.events.fire('camera.resize', { width, height });
    }

    onUpdate(deltaTime: number) {
        this.controller.update(deltaTime);

        this.focalPointTween.update(deltaTime);
        this.azimElevTween.update(deltaTime);
        this.distanceTween.update(deltaTime);

        const azimElev = this.azimElevTween.value;
        const distance = this.distanceTween.value;

        Camera.calcForwardVec(forwardVec, azimElev.azim, azimElev.elev);

        if (this.lookCameraPos) {
            cameraPosition.copy(this.lookCameraPos);
            if (this.azimElevTween.timer >= this.azimElevTween.transitionTime) {
                this.lookCameraPos = null;
            }
        } else {
            cameraPosition.copy(forwardVec);
            cameraPosition.mulScalar(distance.distance * this.sceneRadius / this.fovFactor);
            cameraPosition.add(this.focalPointTween.value);
        }

        if (this.poseOverride) {
            const { position, rotation, fov, near, far } = this.poseOverride;
            this.mainCamera.setLocalPosition(position);
            this.mainCamera.setLocalRotation(rotation);
            this.camera.fov = fov;
            this.near = near;
            this.far = far;
        } else {
            this.mainCamera.setLocalPosition(cameraPosition);
            this.mainCamera.setLocalEulerAngles(azimElev.elev, azimElev.azim, 0);

            this.fitClippingPlanes(this.mainCamera.getLocalPosition(), this.mainCamera.forward);

            this.displayTransform.copy(this.mainCamera.getWorldTransform());
        }

        const { camera } = this.mainCamera;
        const { targetSize } = this;

        camera.orthoHeight = this.distanceTween.value.distance * this.sceneRadius / this.fovFactor * (this.fov / 90) * (camera.horizontalFov ? targetSize.height / targetSize.width : 1);
        camera.camera._updateViewProjMat();
    }

    fitClippingPlanes(cameraPosition: Vec3, forwardVec: Vec3) {
        const bound = this.scene.bound;
        const boundRadius = bound.halfExtents.length();

        vec.sub2(bound.center, cameraPosition);
        const dist = vec.dot(forwardVec);

        if (this.ortho) {
            const radius = Math.max(boundRadius, 1e-2);
            this.far = dist + radius;
            this.near = dist - radius;
        } else {
            const far = Math.max(dist + boundRadius, 1e-2);
            const near = Math.max(dist - boundRadius, far / (1024 * 16));

            this.far = far;
            this.near = Math.min(1.0, near);
        }
    }

    onPreRender() {
        this.rebuildRenderTargets();
        this.updateCameraUniforms();
    }

    onPostRender() {

    }

    focus(options?: { focalPoint: Vec3, radius: number, speed: number }) {
        const getSplatFocalPoint = () => {
            for (const element of this.scene.elements) {
                if (element.type === ElementType.splat) {
                    const focalPoint = (element as Splat).focalPoint?.();
                    if (focalPoint) {
                        return focalPoint;
                    }
                }
            }
        };

        const focalPoint = options ? options.focalPoint : (getSplatFocalPoint() ?? this.scene.bound.center);
        const focalRadius = options ? options.radius : this.scene.bound.halfExtents.length();

        const fdist = focalRadius / this.sceneRadius;

        this.setDistance(isFinite(fdist) ? fdist : 1, options?.speed ?? 0);
        this.setFocalPoint(focalPoint, options?.speed ?? 0);
    }

    get fovFactor() {
        return Math.sin(this.fov * math.DEG_TO_RAD * 0.5);
    }

    worldSizePerPixel(depth: number) {
        const pixelScale = (2 / this.camera.projectionMatrix.data[5]) / Math.max(1, this.scene.canvas.clientHeight);
        return this.ortho ? pixelScale : pixelScale * depth;
    }

    getRay(screenX: number, screenY: number, ray: Ray) {
        const { camera, ortho } = this;
        const cameraPos = this.mainCamera.getPosition();

        if (ortho) {
            camera.screenToWorld(screenX, screenY, -1.0, vec);
            camera.screenToWorld(screenX, screenY, 1.0, vecb);
            vecb.sub(vec).normalize();
            ray.set(vec, vecb);
        } else {
            camera.screenToWorld(screenX, screenY, 1.0, vec);
            vec.sub(cameraPos).normalize();
            ray.set(cameraPos, vec);
        }
    }

    async intersectMany(
        points: { x: number, y: number }[],
        splats = this.scene.getElementsByType(ElementType.splat) as Splat[],
        pose?: { position: Vec3, rotation: Quat, orthoHeight: number, near: number, far: number }
    ) {
        const { scene } = this;
        const closestDepths = points.map(() => Infinity);
        const closestSplats: (Splat | null)[] = new Array(points.length).fill(null);

        const cameraPos = pose?.position ?? this.mainCamera.getPosition().clone();
        const cameraRot = pose?.rotation ?? this.mainCamera.getRotation().clone();
        const orthoHeight = pose?.orthoHeight ?? this.camera.orthoHeight;
        const near = pose?.near ?? this.near;
        const far = pose?.far ?? this.far;
        const forward = cameraRot.transformVector(Vec3.FORWARD, new Vec3());

        const withSnapshotCamera = (fn: () => void) => {
            const livePos = this.mainCamera.getPosition().clone();
            const liveRot = this.mainCamera.getRotation().clone();
            const liveOrthoHeight = this.camera.orthoHeight;
            const liveNear = this.camera.nearClip;
            const liveFar = this.camera.farClip;
            this.mainCamera.setPosition(cameraPos);
            this.mainCamera.setRotation(cameraRot);
            this.camera.orthoHeight = orthoHeight;
            this.camera.nearClip = near;
            this.camera.farClip = far;
            fn();
            this.mainCamera.setPosition(livePos);
            this.mainCamera.setRotation(liveRot);
            this.camera.orthoHeight = liveOrthoHeight;
            this.camera.nearClip = liveNear;
            this.camera.farClip = liveFar;
        };

        const rays: { origin: Vec3, direction: Vec3, cosAngle: number, originDepth: number }[] = [];
        withSnapshotCamera(() => {
            for (const { x, y } of points) {
                this.getRay(x * scene.canvas.clientWidth, y * scene.canvas.clientHeight, ray);
                rays.push({
                    origin: ray.origin.clone(),
                    direction: ray.direction.clone(),
                    cosAngle: ray.direction.dot(forward),
                    originDepth: vecb.sub2(ray.origin, cameraPos).dot(forward)
                });
            }
        });

        for (let i = 0; i < splats.length; ++i) {
            const splat = splats[i];

            withSnapshotCamera(() => {
                scene.projectedSplatRenderer.renderSortedForPick();
                this.picker.prepareDepth(splat);
            });
            const depths = await this.picker.readDepths(points);
            for (let j = 0; j < depths.length; ++j) {
                const depth = depths[j];
                if (depth !== null && depth < closestDepths[j]) {
                    closestDepths[j] = depth;
                    closestSplats[j] = splat;
                }
            }
        }

        return points.map((point, index) => {
            const splat = closestSplats[index];
            if (!splat) {
                return null;
            }

            const linearDepth = closestDepths[index] * (far - near) + near;

            const { origin, direction, cosAngle, originDepth } = rays[index];
            const t = (linearDepth - originDepth) / cosAngle;
            const position = new Vec3();
            position.copy(origin).add(vec.copy(direction).mulScalar(t));

            const distance = Math.abs(linearDepth) / cosAngle;

            return { splat, position, distance, depth: linearDepth };
        });
    }

    async intersect(x: number, y: number) {
        return (await this.intersectMany([{ x, y }]))[0];
    }

    async pickFocalPoint(x: number, y: number) {
        const result = await this.intersect(x, y);
        if (result) {
            const { scene } = this;

            this.setFocalPoint(result.position);
            this.setDistance(result.distance / this.sceneRadius * this.fovFactor);
            scene.events.fire('camera.focalPointPicked', {
                camera: this,
                splat: result.splat,
                position: result.position
            });
        }
    }

    pickPrep(splat: Splat, mode: 'add' | 'remove' | 'set' | 'intersect') {
        this.picker.prepareId(splat, mode);
    }

    pick(x: number, y: number) {
        return this.picker.readId(x, y);
    }

    pickRect(x: number, y: number, width: number, height: number) {
        return this.picker.readIds(x, y, width, height);
    }

    docSerialize() {
        const pack3 = (v: Vec3) => [v.x, v.y, v.z];

        return {
            focalPoint: pack3(this.focalPointTween.target),
            azim: this.azim,
            elev: this.elevation,
            distance: this.distance,
            fov: this.fov,
            tonemapping: this.tonemapping
        };
    }

    docDeserialize(settings: any) {
        this.setFocalPoint(new Vec3(settings.focalPoint), 0);
        this.setAzimElev(settings.azim, settings.elev, 0);
        this.setDistance(settings.distance, 0);
        this.fov = settings.fov;
        this.tonemapping = settings.tonemapping;
    }

    startOffscreenMode(width: number, height: number) {
        this.targetSizeOverride = { width, height };
        this.finalPass.enabled = false;
        this.rebuildRenderTargets();
        this.onUpdate(0);
    }

    endOffscreenMode() {
        this.targetSizeOverride = null;
        this.finalPass.enabled = true;
        this.rebuildRenderTargets();
        this.onUpdate(0);
    }

    get targetSize() {
        return this.targetSizeOverride ?? this.scene.targetSize;
    }

    get camera() {
        return this.mainCamera.camera;
    }

    get worldTransform() {
        return this.mainCamera.getWorldTransform();
    }

    get position() {
        return this.mainCamera.getPosition();
    }

    get forward() {
        return this.mainCamera.forward;
    }
}