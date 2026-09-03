import { Events } from '../events';

export class EditorUI {
    appContainer: any;
    topContainer: any;
    canvasContainer: any;
    annotationContainer: any;
    toolsContainer: any;
    canvas: HTMLCanvasElement;
    tooltips: any;

    constructor(events: Events) {
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'canvas';

        // Create container structure
        this.appContainer = this.createContainer('app-container');
        const editorContainer = this.createContainer('editor-container');
        this.appContainer.appendChild(editorContainer);

        const mainContainer = this.createContainer('main-container');
        editorContainer.appendChild(mainContainer);

        this.canvasContainer = this.createContainer('canvas-container');
        this.canvasContainer.appendChild(this.canvas);
        mainContainer.appendChild(this.canvasContainer);

        // Tools container
        this.toolsContainer = this.createContainer('tools-container');
        this.canvasContainer.appendChild(this.toolsContainer);

        // Annotation container
        this.annotationContainer = this.createContainer('annotation-container');
        this.canvasContainer.appendChild(this.annotationContainer);

        // App label
        const appLabel = document.createElement('div');
        appLabel.id = 'app-label';
        appLabel.textContent = 'SUPERSPLAT ';
        const versionSpan = document.createElement('span');
        versionSpan.textContent = 'v3.0.0-alpha';
        appLabel.appendChild(versionSpan);
        this.canvasContainer.appendChild(appLabel);

        // Tooltips
        this.tooltips = {
            show: () => {},
            hide: () => {}
        };

        document.body.appendChild(this.appContainer);
    }

    private createContainer(id: string): HTMLDivElement {
        const div = document.createElement('div');
        div.id = id;
        return div;
    }
}