import { Events } from '../../events';

export class ExportPopup {
    constructor(events: Events) {}

    show(exportType: any, splatNames: any, showFilenameEdit: boolean) {
        return Promise.resolve(false);
    }
}