import { Events } from './events';
import { Scene } from './scene';

export const registerSelectionEvents = (events: Events, scene: Scene) => {
    events.function('selection', () => {
        // Return current selection
        return null;
    });
};