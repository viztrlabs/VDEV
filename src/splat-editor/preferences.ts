import { Events } from './events';
import { SceneConfig } from './scene-config';

export const registerPreferences = (events: Events, sceneConfig: SceneConfig, urlArgs: any) => {
    // Apply stored preferences
    events.on('preferences.suspend', () => {});
    events.on('preferences.resume', () => {});
    
    // Load preferences from localStorage
    try {
        const stored = localStorage.getItem('supersplat-preferences');
        if (stored) {
            const prefs = JSON.parse(stored);
            // Apply preferences
        }
    } catch (e) {
        console.warn('Failed to load preferences', e);
    }
};