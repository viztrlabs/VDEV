import { Events } from './events';
import { Scene } from './scene';

export const registerSequenceEvents = (events: Events, scene: Scene) => {
    // Sequence/animation events
    events.on('sequence.add', () => {});
    events.on('sequence.remove', () => {});
    events.on('sequence.play', () => {});
    events.on('sequence.pause', () => {});
};