import { Events } from './events';

export class ShortcutManager {
    private shortcuts = new Map<string, { down: () => void; up: () => void }>();

    constructor(private events: Events) {
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));
        window.addEventListener('blur', this.clearAll.bind(this));
    }

    register(name: string, down: () => void, up: () => void) {
        this.shortcuts.set(name, { down, up });
    }

    private onKeyDown(e: KeyboardEvent) {
        // Handle shortcuts
    }

    private onKeyUp(e: KeyboardEvent) {
        // Handle shortcuts
    }

    private clearAll() {
        // Clear all shortcuts
    }
}