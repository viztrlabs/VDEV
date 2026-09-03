import { Events } from './events';
import { Scene } from './scene';

export const registerPublishEvents = (events: Events) => {
    events.on('publish', async (settings: any) => {
        // Publish to PlayCanvas or custom hosting
        console.log('Publish requested:', settings);
    });

    events.function('publish.userStatus', async () => {
        // Check if user is logged in
        return true;
    });
};