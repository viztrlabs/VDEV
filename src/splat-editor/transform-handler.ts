import { Events } from './events';
import { Scene } from './scene';

export const registerTransformHandlerEvents = (events: Events) => {
    // Transform handler events
    events.on('transform.activate', () => {});
    events.on('transform.deactivate', () => {});
    events.on('transform.move', () => {});
    events.on('transform.rotate', () => {});
    events.on('transform.scale', () => {});
};