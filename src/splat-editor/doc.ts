import { Events } from './events';
import { Scene } from './scene';
import { Serializer } from './serializer';

export const registerDocEvents = (scene: Scene, events: Events) => {
    // Import/export handling
    events.on('import', async (files: Array<{ filename: string; url?: string; contents?: File }>) => {
        // Placeholder for import functionality
        console.log('Import requested:', files);
    });

    events.on('export', async (format: string) => {
        // Placeholder for export functionality
        console.log('Export requested:', format);
    });

    // Document serialization
    events.function('docSerialize', () => {
        const serializer = new Serializer((value: any) => {});
        scene.forEachElement((e: any) => e.serialize(serializer));
        return serializer;
    });

    events.function('docDeserialize', (data: any) => {
        // Placeholder for deserialization
    });

    events.on('doc.saved', () => {
        // Mark document as saved
    });
};