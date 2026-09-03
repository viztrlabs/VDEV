import { Events } from '../events';
import { Tool } from './tool-manager';

export class RectSelection implements Tool {
    name = 'rectSelection';

    constructor(private events: Events, private container: HTMLElement) {}

    activate() {
        this.events.fire('selection.mode', 'rect');
    }

    deactivate() {}
}

export class BrushSelection implements Tool {
    name = 'brushSelection';

    constructor(private events: Events, private container: HTMLElement, private mask: any) {}

    activate() {
        this.events.fire('selection.mode', 'brush');
    }

    deactivate() {}
}

export class SphereBrushSelection implements Tool {
    name = 'sphereBrushSelection';

    constructor(private events: Events, private container: HTMLElement, private mask: any) {}

    activate() {
        this.events.fire('selection.mode', 'sphereBrush');
    }

    deactivate() {}
}

export class FloodSelection implements Tool {
    name = 'floodSelection';

    constructor(private events: Events, private container: HTMLElement, private mask: any, private canvasContainer: HTMLElement) {}

    activate() {
        this.events.fire('selection.mode', 'flood');
    }

    deactivate() {}
}

export class PolygonSelection implements Tool {
    name = 'polygonSelection';

    constructor(private events: Events, private container: HTMLElement, private mask: any) {}

    activate() {
        this.events.fire('selection.mode', 'polygon');
    }

    deactivate() {}
}

export class LassoSelection implements Tool {
    name = 'lassoSelection';

    constructor(private events: Events, private container: HTMLElement, private mask: any) {}

    activate() {
        this.events.fire('selection.mode', 'lasso');
    }

    deactivate() {}
}

export class SphereSelection implements Tool {
    name = 'sphereSelection';

    constructor(private events: Events, private scene: any, private canvasContainer: HTMLElement, private tooltips: any) {}

    activate() {
        this.events.fire('selection.mode', 'sphere');
    }

    deactivate() {}
}

export class BoxSelection implements Tool {
    name = 'boxSelection';

    constructor(private events: Events, private scene: any, private canvasContainer: HTMLElement, private tooltips: any) {}

    activate() {
        this.events.fire('selection.mode', 'box');
    }

    deactivate() {}
}

export class EyedropperSelection implements Tool {
    name = 'eyedropperSelection';

    constructor(private events: Events, private container: HTMLElement, private canvasContainer: HTMLElement) {}

    activate() {
        this.events.fire('selection.mode', 'eyedropper');
    }

    deactivate() {}
}