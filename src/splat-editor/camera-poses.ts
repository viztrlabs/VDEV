import { Events } from './events';

export const registerCameraPosesEvents = (events: Events) => {
    // Placeholder for camera poses functionality
    events.function('cameraPoses.list', () => []);
    events.function('cameraPoses.active', () => null);
    
    events.on('cameraPoses.add', () => {});
    events.on('cameraPoses.remove', () => {});
    events.on('cameraPoses.setActive', () => {});
    events.on('cameraPoses.update', () => {});
};