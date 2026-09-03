import { BoundingBox, Vec3, Quat } from 'playcanvas';

import { Element, ElementType } from './element';
import { GaussianInstances } from './gaussian-instances';
import { Transform } from './transform';

export class Splat extends Element {
    resource: any = null;
    instances: GaussianInstances;
    entity: any;
    transformPalette: any;
    colorPalette: any;
    name = '';
    localBound = new BoundingBox();
    worldBound = new BoundingBox();
    numSelected = 0;
    localFrameOrigin = new Vec3();
    localFrame = new Quat();

    constructor(device: any, numRows: number, initialFlags?: Uint8Array) {
        super(ElementType.splat);
        this.instances = new GaussianInstances(device, numRows, initialFlags);
    }

    move(position: Vec3, rotation: Quat, scale: Vec3) {
        // Move splat entity
    }

    setLocalFrame(origin: Vec3, frame: Quat) {
        this.localFrameOrigin.copy(origin);
        this.localFrame.copy(frame);
    }

    async updateState() {
        // Update state
    }

    async updatePositions() {
        // Update positions
    }

    updateColors() {
        // Update colors
    }

    focalPoint() {
        return this.localBound.center;
    }

    createLayer(ranges: any, name: string) {
        return this;
    }

    destroy() {
        super.destroy();
    }

    get selectionBound() {
        return this.localBound;
    }

    get worldTransform() {
        return null as any;
    }

    add() {
        return Promise.resolve();
    }

    remove() {}
}