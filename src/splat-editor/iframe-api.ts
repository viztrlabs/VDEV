import { Events } from './events';
import { Scene } from './scene';

export const registerIframeApi = (events: Events) => {
    // Iframe API for embedding
    events.function('iframeApi.ready', () => {});
};