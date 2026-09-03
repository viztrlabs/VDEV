import { Events } from '../events';

export class SelectCursor {
    constructor(events: Events, container: HTMLElement) {
        // Create cursor element
        const cursor = document.createElement('div');
        cursor.id = 'select-cursor';
        cursor.style.cssText = `
            position: absolute;
            pointer-events: none;
            z-index: 1000;
            display: none;
        `;
        container.appendChild(cursor);
    }
}