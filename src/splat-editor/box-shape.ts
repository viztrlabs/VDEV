import { Entity, Vec3, Quat, Mat4 } from 'playcanvas';

import { Events } from '../events';
import { Transform } from '../transform';

export class BoxShape {
    entity: Entity;
    pivot: Entity;
    scene: any;
    events: Events;

    lenX = 1;
    lenY = 1;
    lenZ = 1;

    constructor(events: Events, scene: any) {
        this.events = events;
        this.scene = scene;

        this.entity = new Entity('box-shape');
        this.pivot = new Entity('box-pivot');
        this.entity.addChild(this.pivot);
    }

    setScene(value: any) {
        this.scene = value;
    }

    moved() {
        this.events.fire('shapeSelection.changed', this);
    }

    destroy() {
        this.entity.destroy();
    }
}