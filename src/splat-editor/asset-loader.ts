import { AppBase } from 'playcanvas';

export class AssetLoader {
    constructor(private app: AppBase, private events: any) {}

    async loadSplat(url: string): Promise<any> {
        // Load a .splat file
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return arrayBuffer;
    }

    async loadPly(url: string): Promise<any> {
        // Load a .ply file
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return arrayBuffer;
    }
}