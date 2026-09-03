import { Events } from './events';
import { Scene } from './scene';

export class Underlay {
    constructor(private scene: Scene, private events: Events) {}
}