import { Events } from '../../events';

export class ShortcutsPopup {
    hidden = true;

    constructor(private events: Events) {
        this.events.on('showShortcutsPopup', () => {
            this.hidden = false;
        });
        this.events.on('hideShortcutsPopup', () => {
            this.hidden = true;
        });
    }
}

export function registerShortcutsPopup(events: Events): ShortcutsPopup {
    return new ShortcutsPopup(events);
}