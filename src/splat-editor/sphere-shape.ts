import { Entity, Vec3, Quat, Mat4 } from 'playcanvas';

import { Events } from '../events';
import { Transform } from '../transform';

export class SphereShape {
    entity: Entity;
    pivot: Entity;
    scene: any;
    events: Events;

    radius = 1;

    constructor(events: Events, scene: any) {
        this.events = events;
        this.scene = scene;

        this.entity = new Entity('sphere-shape');
        this.pivot = new Entity('sphere-pivot');
        this.entity.addChild(this.pivot);
    }

    get scene() {
        return this._scene;
    }

    set scene(value: any) {
        this._scene = value;
    }

    moved() {
        this.events.fire('shapeSelection.changed', this);
    }

    destroy() {
        this.entity.destroy();
    }
}