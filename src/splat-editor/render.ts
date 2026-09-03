import { Events } from './events';
import { Scene } from './scene';

export const registerRenderEvents = (scene: Scene, events: Events) => {
    events.on('render', () => {
        // Render event
    });
};