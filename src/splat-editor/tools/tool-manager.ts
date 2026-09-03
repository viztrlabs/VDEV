import { Events } from '../events';

export interface Tool {
    name: string;
    activate?(): void;
    deactivate?(): void;
}

export class ToolManager {
    private events: Events;
    private tools = new Map<string, Tool>();
    private activeTool: Tool | null = null;

    constructor(events: Events) {
        this.events = events;

        events.on('tool.activate', (name: string) => this.activateTool(name));
        events.on('tool.deactivate', () => this.deactivateTool());
    }

    register(name: string, tool: Tool) {
        this.tools.set(name, tool);
    }

    activateTool(name: string) {
        if (this.activeTool) {
            this.activeTool.deactivate?.();
            this.events.fire('tool.deactivated', this.activeTool);
        }

        const tool = this.tools.get(name);
        if (tool) {
            this.activeTool = tool;
            tool.activate?.();
            this.events.fire('tool.activated', tool);
        }
    }

    deactivateTool() {
        if (this.activeTool) {
            this.activeTool.deactivate?.();
            this.events.fire('tool.deactivated', this.activeTool);
            this.activeTool = null;
        }
    }

    getActiveTool(): Tool | null {
        return this.activeTool;
    }
}