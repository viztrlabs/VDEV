import { Events } from './events';
import { Scene } from './scene';

export const registerTimelineEvents = (events: Events) => {
    // Timeline/animation events
    events.on('timeline.play', () => {});
    events.on('timeline.pause', () => {});
    events.on('timeline.stop', () => {});
};