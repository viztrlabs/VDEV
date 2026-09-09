import { Events } from '../../events';

export class Progress {
    hidden = true;
    onCancel: (() => void) | null = null;

    constructor(private events: Events) {
        this.events.on('showProgress', () => {
            this.hidden = false;
        });
        this.events.on('hideProgress', () => {
            this.hidden = true;
        });
    }

    setHeader(header: string) {}
    setText(text: string) {}
    setProgress(progress: number) {}
    showCancelButton(show: boolean) {}
}

export function registerProgress(events: Events): Progress {
    return new Progress(events);
}