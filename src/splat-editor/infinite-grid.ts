import { Events } from './events';
import { Scene } from './scene';

export type GridPlane = 'xz' | 'xy' | 'yz';

export class InfiniteGrid {
    visible = true;
    planes: GridPlane[] = ['xz'];

    constructor(private scene: Scene, private events: Events) {
        events.on('grid.visible', () => this.visible);
        events.on('grid.setVisible', (v: boolean) => { this.visible = v; });
        events.on('grid.toggleVisible', () => { this.visible = !this.visible; });
        events.on('grid.planes', () => this.planes);
        events.on('grid.setPlanes', (p: GridPlane[]) => { this.planes = p; });
        events.on('grid.togglePlane', (plane: GridPlane) => {
            const i = this.planes.indexOf(plane);
            if (i >= 0) this.planes.splice(i, 1);
            else this.planes.push(plane);
        });
    }
}