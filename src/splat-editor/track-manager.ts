import { Events } from './events';
import { Scene } from './scene';

export const registerTrackManagerEvents = (events: Events) => {
    // Track manager events
    events.on('track.add', () => {});
    events.on('track.remove', () => {});
};