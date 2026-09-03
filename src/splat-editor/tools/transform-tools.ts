import { Events } from '../events';
import { Tool } from './tool-manager';

export class MoveTool implements Tool {
    name = 'move';

    constructor(private events: Events, private scene: any) {}

    activate() {
        // Activate move gizmo
        this.events.fire('transform.activate', 'move');
    }

    deactivate() {
        this.events.fire('transform.deactivate', 'move');
    }
}

export class RotateTool implements Tool {
    name = 'rotate';

    constructor(private events: Events, private scene: any) {}

    activate() {
        this.events.fire('transform.activate', 'rotate');
    }

    deactivate() {
        this.events.fire('transform.deactivate', 'rotate');
    }
}

export class ScaleTool implements Tool {
    name = 'scale';

    constructor(private events: Events, private scene: any) {}

    activate() {
        this.events.fire('transform.activate', 'scale');
    }

    deactivate() {
        this.events.fire('transform.deactivate', 'scale');
    }
}

export class MeasureTool implements Tool {
    name = 'measure';

    constructor(private events: Events, private scene: any, private canvasContainer: HTMLElement, private annotationContainer: HTMLElement) {}

    activate() {
        // Activate measure tool
    }

    deactivate() {
        // Deactivate measure tool
    }
}

export class OrientTool implements Tool {
    name = 'orient';

    constructor(private events: Events, private scene: any, private toolsContainer: HTMLElement, private canvasContainer: HTMLElement, private annotationContainer: HTMLElement) {}

    activate() {
        // Activate orient tool
    }

    deactivate() {
        // Deactivate orient tool
    }
}