import { Events } from '../../events';

export class Popup {
    constructor(tooltips: any) {}

    show(options: any) {
        return Promise.resolve(false);
    }
}

export interface ShowOptions {
    type: 'error' | 'info' | 'warning' | 'confirm';
    header: string;
    message: string;
}