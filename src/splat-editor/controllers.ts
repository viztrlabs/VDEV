import { Vec3 } from 'playcanvas';

import { Camera } from './camera';

const fromWorldPoint = new Vec3();
const toWorldPoint = new Vec3();
const worldDiff = new Vec3();
const moveVec = new Vec3();

const dist = (x0: number, y0: number, x1: number, y1: number) => Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);

export class PointerController {
    update: (deltaTime: number) => void;
    destroy: () => void;

    constructor(camera: Camera, target: HTMLElement) {

        const orbit = (dx: number, dy: number) => {
            const azim = camera.azim - dx * camera.scene.config.controls.orbitSensitivity;
            const elev = camera.elevation - dy * camera.scene.config.controls.orbitSensitivity;
            camera.setAzimElev(azim, elev);
        };

        const look = (dx: number, dy: number) => {
            camera.look(dx, dy);
        };

        const pan = (x: number, y: number, dx: number, dy: number) => {
            const c = camera.camera;
            const distance = camera.distanceTween.value.distance * camera.sceneRadius / camera.fovFactor;

            c.screenToWorld(x, y, distance, fromWorldPoint);
            c.screenToWorld(x - dx, y - dy, distance, toWorldPoint);

            worldDiff.sub2(toWorldPoint, fromWorldPoint);
            worldDiff.add(camera.focalPoint);

            camera.setFocalPoint(worldDiff);
        };

        const zoom = (amount: number) => {
            camera.setDistance(camera.distance - (camera.distance * 0.999 + 0.001) * amount * camera.scene.config.controls.zoomSensitivity, 2);
        };

        const pickFocalPoint = (event: MouseEvent) => {
            const rect = target.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                camera.pickFocalPoint(
                    (event.clientX - rect.left) / rect.width,
                    (event.clientY - rect.top) / rect.height
                );
            }
        };

        let pressedButton = -1;
        let x: number, y: number;

        const CLICK_DRAG_THRESHOLD = 4;
        let mmbStartX = 0, mmbStartY = 0, mmbDragged = false;

        let touches: { id: number, x: number, y: number }[] = [];
        let midx: number, midy: number, midlen: number;

        const pointerdown = (event: PointerEvent) => {
            if (event.pointerType === 'mouse') {
                if (pressedButton !== -1) {
                    return;
                }
                target.setPointerCapture(event.pointerId);
                pressedButton = event.button;
                x = event.offsetX;
                y = event.offsetY;
                if (pressedButton === 1) {
                    mmbStartX = x;
                    mmbStartY = y;
                    mmbDragged = false;
                }
            } else if (event.pointerType === 'touch') {
                if (touches.length === 0) {
                    target.setPointerCapture(event.pointerId);
                }
                touches.push({
                    x: event.offsetX,
                    y: event.offsetY,
                    id: event.pointerId
                });

                if (touches.length === 2) {
                    midx = (touches[0].x + touches[1].x) * 0.5;
                    midy = (touches[0].y + touches[1].y) * 0.5;
                    midlen = dist(touches[0].x, touches[0].y, touches[1].x, touches[1].y);
                }
            }
        };

        const pointerup = (event: PointerEvent) => {
            if (event.pointerType === 'mouse') {
                if (event.button === pressedButton) {
                    if (pressedButton === 1 && camera.controlMode === 'orbit' && !mmbDragged) {
                        pickFocalPoint(event);
                    }
                    pressedButton = -1;
                    target.releasePointerCapture(event.pointerId);
                }
            } else {
                touches = touches.filter(touch => touch.id !== event.pointerId);
                if (touches.length === 0) {
                    target.releasePointerCapture(event.pointerId);
                }
            }
        };

        const pointermove = (event: PointerEvent) => {
            if (event.pointerType === 'mouse') {
                if (pressedButton === -1) {
                    return;
                }

                const buttonMask = [1, 4, 2][pressedButton];
                if ((event.buttons & buttonMask) === 0) {
                    pressedButton = -1;
                    return;
                }

                const dx = event.offsetX - x;
                const dy = event.offsetY - y;
                x = event.offsetX;
                y = event.offsetY;

                if (camera.controlMode === 'fly') {
                    if (pressedButton === 0) {
                        look(dx, dy);
                    } else if (pressedButton === 1) {
                        zoom(dy * -0.02);
                    } else if (pressedButton === 2) {
                        const mod = event.shiftKey || event.ctrlKey ? 'look' :
                            (event.altKey || event.metaKey ? 'zoom' : 'pan');

                        if (mod === 'look') {
                            look(dx, dy);
                        } else if (mod === 'zoom') {
                            zoom(dy * -0.02);
                        } else {
                            pan(x, y, dx, dy);
                        }
                    }
                } else {
                    if (pressedButton === 1 && !mmbDragged) {
                        if (dist(event.offsetX, event.offsetY, mmbStartX, mmbStartY) < 4) {
                            return;
                        }
                        mmbDragged = true;
                    }

                    let mod: 'orbit' | 'pan' | 'zoom';
                    if (pressedButton === 2) {
                        mod = event.shiftKey || event.ctrlKey ? 'orbit' :
                            (event.altKey || event.metaKey ? 'zoom' : 'pan');
                    } else if (pressedButton === 1) {
                        mod = event.shiftKey ? 'pan' :
                            (event.ctrlKey ? 'zoom' : 'orbit');
                    } else {
                        mod = 'orbit';
                    }

                    if (mod === 'orbit') {
                        orbit(dx, dy);
                    } else if (mod === 'zoom') {
                        zoom(dy * -0.02);
                    } else {
                        pan(x, y, dx, dy);
                    }
                }
            } else {
                if (touches.length === 1) {
                    const touch = touches[0];
                    const dx = event.offsetX - touch.x;
                    const dy = event.offsetY - touch.y;
                    touch.x = event.offsetX;
                    touch.y = event.offsetY;

                    if (camera.controlMode === 'fly') {
                        look(dx, dy);
                    } else {
                        orbit(dx, dy);
                    }
                } else if (touches.length === 2) {
                    const touch = touches[touches.map(t => t.id).indexOf(event.pointerId)];
                    touch.x = event.offsetX;
                    touch.y = event.offsetY;

                    const mx = (touches[0].x + touches[1].x) * 0.5;
                    const my = (touches[0].y + touches[1].y) * 0.5;
                    const ml = dist(touches[0].x, touches[0].y, touches[1].x, touches[1].y);

                    if (camera.controlMode === 'fly') {
                        const zoomDelta = (ml - midlen) * 0.01;
                        const worldTransform = camera.mainCamera.getWorldTransform();
                        const zAxis = worldTransform.getZ();
                        moveVec.copy(zAxis).mulScalar(-zoomDelta * camera.flySpeed);
                        const p = camera.focalPoint.add(moveVec);
                        camera.setFocalPoint(p);
                    } else {
                        pan(mx, my, (mx - midx), (my - midy));
                        zoom((ml - midlen) * 0.01);
                    }

                    midx = mx;
                    midy = my;
                    midlen = ml;
                }
            }
        };

        let ctrlDown = false;
        const keydown = (event: KeyboardEvent) => {
            if (event.key === 'Control') ctrlDown = true;
        };
        const keyup = (event: KeyboardEvent) => {
            if (event.key === 'Control') ctrlDown = false;
        };

        const wheel = (event: WheelEvent) => {
            const { deltaX, deltaY } = event;

            const wheelDelta = event.shiftKey && deltaY === 0 ? deltaX : deltaY;

            const isPinch = (event.ctrlKey && !ctrlDown) || event.metaKey;
            const isOrbit = event.ctrlKey && ctrlDown;

            if (camera.controlMode === 'fly') {
                if (isOrbit) {
                    look(deltaX, deltaY);
                } else if (event.shiftKey) {
                    pan(event.offsetX, event.offsetY, deltaX, deltaY);
                } else if (camera.ortho) {
                    zoom(isPinch ? deltaY * -0.02 : wheelDelta * -0.002);
                } else {
                    const factor = camera.flySpeed * 0.01;
                    const worldTransform = camera.mainCamera.getWorldTransform();
                    const zAxis = worldTransform.getZ();
                    moveVec.copy(zAxis).mulScalar(wheelDelta * factor);
                    const p = camera.focalPoint.add(moveVec);
                    camera.setFocalPoint(p);
                }
            } else if (isOrbit) {
                orbit(deltaX, deltaY);
            } else if (event.shiftKey) {
                pan(event.offsetX, event.offsetY, deltaX, deltaY);
            } else if (isPinch) {
                zoom(deltaY * -0.02);
            } else {
                zoom(wheelDelta * -0.002);
            }

            event.preventDefault();
        };

        const canvas = camera.scene.app.graphicsDevice.canvas;

        const dblclick = (event: MouseEvent) => {
            if (event.target === target || event.target === canvas) {
                if (camera.controlMode === 'fly') {
                    camera.scene.events.fire('camera.setControlMode', 'orbit');
                }
                pickFocalPoint(event);
            }
        };

        let flyForward = false;
        let flyBackward = false;
        let flyLeft = false;
        let flyRight = false;
        let flyDown = false;
        let flyUp = false;

        let fastDown = false;
        let slowDown = false;

        const clearAllKeys = () => {
            flyForward = false;
            flyBackward = false;
            flyLeft = false;
            flyRight = false;
            flyDown = false;
            flyUp = false;
            fastDown = false;
            slowDown = false;
            ctrlDown = false;
        };

        const handleFlyKey = (down: boolean) => {
            if (down && camera.controlMode !== 'fly') {
                camera.scene.events.fire('camera.setControlMode', 'fly');
            }
        };

        const events = camera.scene.events;

        const onFlyForward = (down: boolean) => { flyForward = down; handleFlyKey(down); };
        const onFlyBackward = (down: boolean) => { flyBackward = down; handleFlyKey(down); };
        const onFlyLeft = (down: boolean) => { flyLeft = down; handleFlyKey(down); };
        const onFlyRight = (down: boolean) => { flyRight = down; handleFlyKey(down); };
        const onFlyDown = (down: boolean) => { flyDown = down; handleFlyKey(down); };
        const onFlyUp = (down: boolean) => { flyUp = down; handleFlyKey(down); };
        const onModifierFast = (down: boolean) => { fastDown = down; };
        const onModifierSlow = (down: boolean) => { slowDown = down; };

        events.on('camera.fly.forward', onFlyForward);
        events.on('camera.fly.backward', onFlyBackward);
        events.on('camera.fly.left', onFlyLeft);
        events.on('camera.fly.right', onFlyRight);
        events.on('camera.fly.down', onFlyDown);
        events.on('camera.fly.up', onFlyUp);
        events.on('camera.modifier.fast', onModifierFast);
        events.on('camera.modifier.slow', onModifierSlow);

        this.update = (deltaTime: number) => {
            if (camera.controlMode !== 'fly') return;

            const forward = (flyForward ? 1 : 0) - (flyBackward ? 1 : 0);
            const strafe = (flyRight ? 1 : 0) - (flyLeft ? 1 : 0);
            const vertical = (flyUp ? 1 : 0) - (flyDown ? 1 : 0);

            if (forward || strafe || vertical) {
                const speedMod = fastDown ? 10 : (slowDown ? 0.1 : 1);
                const factor = deltaTime * camera.flySpeed * speedMod;
                const worldTransform = camera.worldTransform;

                moveVec.set(0, 0, 0);

                if (forward) {
                    const zAxis = worldTransform.getZ();
                    zAxis.y = 0;
                    zAxis.normalize();
                    moveVec.add(zAxis.mulScalar(-forward * factor));
                }

                if (strafe) {
                    const xAxis = worldTransform.getX();
                    xAxis.y = 0;
                    xAxis.normalize();
                    moveVec.add(xAxis.mulScalar(strafe * factor));
                }

                if (vertical) {
                    moveVec.y += vertical * factor;
                }

                const p = camera.focalPoint.add(moveVec);
                camera.setFocalPoint(p);
            }
        };

        let destroy: () => void = null;

        const wrap = (target: any, name: string, fn: any, options?: any) => {
            const callback = (event: any) => {
                camera.scene.events.fire('camera.controller', name);
                fn(event);
            };
            target.addEventListener(name, callback, options);
            destroy = () => {
                destroy?.();
                target.removeEventListener(name, callback);
            };
        };

        wrap(target, 'pointerdown', pointerdown);
        wrap(target, 'pointerup', pointerup);
        wrap(target, 'pointermove', pointermove);
        wrap(target, 'wheel', wheel, { passive: false });
        wrap(target, 'dblclick', dblclick);
        wrap(window, 'blur', clearAllKeys);

        window.addEventListener('keydown', keydown, { capture: true });
        window.addEventListener('keyup', keyup, { capture: true });

        this.destroy = () => {
            destroy?.();
            window.removeEventListener('keydown', keydown, { capture: true });
            window.removeEventListener('keyup', keyup, { capture: true });
            events.off('camera.fly.forward', onFlyForward);
            events.off('camera.fly.backward', onFlyBackward);
            events.off('camera.fly.left', onFlyLeft);
            events.off('camera.fly.right', onFlyRight);
            events.off('camera.fly.down', onFlyDown);
            events.off('camera.fly.up', onFlyUp);
            events.off('camera.modifier.fast', onModifierFast);
            events.off('camera.modifier.slow', onModifierSlow);
        };
    }
}