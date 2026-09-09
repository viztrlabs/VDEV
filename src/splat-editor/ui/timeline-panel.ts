import { Events } from '../../events';

export class TimelinePanel {
    hidden = true;

    constructor(private events: Events) {
        this.events.on('showTimelinePanel', () => {
            this.hidden = false;
        });
        this.events.on('hideTimelinePanel', () => {
            this.hidden = true;
        });
    }
}

export function registerTimelinePanel(events: Events): TimelinePanel {
    return new TimelinePanel(events);
}