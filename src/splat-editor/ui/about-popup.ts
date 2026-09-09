import { Events } from '../../events';

export class AboutPopup {
    hidden = true;

    constructor(private events: Events) {
        this.events.on('showAboutPopup', () => {
            this.hidden = false;
        });
        this.events.on('hideAboutPopup', () => {
            this.hidden = true;
        });
    }
}

export function registerAboutPopup(events: Events): AboutPopup {
    return new AboutPopup(events);
}