import { Events } from './events';
import { Scene } from './scene';

export const initFileHandler = (scene: Scene, events: Events, container: HTMLElement) => {
    // Handle file drag and drop
    container.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });

    container.addEventListener('drop', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            await events.invoke('import', files.map(f => ({
                filename: f.name,
                contents: f
            })));
        }
    });

    // Handle paste
    document.addEventListener('paste', async (e) => {
        const files = Array.from(e.clipboardData.files);
        if (files.length > 0) {
            await events.invoke('import', files.map(f => ({
                filename: f.name,
                contents: f
            })));
        }
    });
};