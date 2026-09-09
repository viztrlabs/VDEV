import { Events } from '../../events';

export class Spinner {
    hidden = true;

    constructor(private events: Events) {
        this.events.on('showSpinner', () => {
            this.hidden = false;
        });
        this.events.on('hideSpinner', () => {
            this.hidden = true;
        });
    }
}

export function registerSpinner(events: Events): Spinner {
    return new Spinner(events);
}