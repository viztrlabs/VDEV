import { Events } from './events';
import { Scene } from './scene';

export class Outline {
    constructor(private scene: Scene, private events: Events) {
        events.on('view.outlineSelection', () => {});
    }
}