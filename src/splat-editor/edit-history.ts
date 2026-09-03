import { CommandQueue } from './command-queue';
import { EditOp, MultiOp } from './edit-ops';
import { Events } from './events';
import { Splat } from './splat';

const opReferencesSplat = (op: EditOp, splat: Splat): boolean => {
    if (op instanceof MultiOp) {
        return op.ops.some(nestedOp => opReferencesSplat(nestedOp, splat));
    }
    return (op as any).splat === splat;
};

export class EditHistory {
    history: EditOp[] = [];
    cursor = 0;
    events: Events;
    private commandQueue: CommandQueue;

    constructor(events: Events, commandQueue: CommandQueue) {
        this.events = events;
        this.commandQueue = commandQueue;

        events.on('edit.undo', () => this.undo());
        events.on('edit.redo', () => this.redo());
        events.on('edit.add', (editOp: EditOp, suppressOp = false) => this.add(editOp, suppressOp));
        events.on('edit.removeForShape', (shape: unknown) => this.removeForShape(shape));
    }

    private queue<T>(fn: () => T | Promise<T>): Promise<T> {
        return this.commandQueue.enqueue(fn);
    }

    add(editOp: EditOp, suppressOp = false) {
        return this.queue(() => this._add(editOp, suppressOp));
    }

    canUndo(): boolean {
        return this.cursor > 0;
    }

    canRedo(): boolean {
        return this.cursor < this.history.length;
    }

    undo() {
        return this.queue(async () => {
            if (this.canUndo()) {
                await this._undo();
            }
        });
    }

    redo(suppressOp = false) {
        return this.queue(async () => {
            if (this.canRedo()) {
                await this._redo(suppressOp);
            }
        });
    }

    private async _add(editOp: EditOp, suppressOp = false) {
        while (this.cursor < this.history.length) {
            this.history.pop().destroy?.();
        }
        this.history.push(editOp);
        await this._redo(suppressOp);
    }

    private async _undo() {
        const editOp = this.history[this.cursor - 1];
        await editOp.undo();
        this.cursor--;
        this.events.fire('edit.apply', editOp);
        this.fireEvents();
    }

    private async _redo(suppressOp = false) {
        const editOp = this.history[this.cursor];
        if (!suppressOp) {
            await editOp.do();
        }
        this.cursor++;
        this.events.fire('edit.apply', editOp);
        this.fireEvents();
    }

    fireEvents() {
        this.events.fire('edit.canUndo', this.canUndo());
        this.events.fire('edit.canRedo', this.canRedo());
    }

    clear() {
        return this.queue(() => {
            this.history.forEach((editOp) => {
                editOp.destroy?.();
            });
            this.history = [];
            this.cursor = 0;
            this.fireEvents();
        });
    }

    removeForShape(shape: unknown) {
        return this.queue(() => {
            let newCursor = 0;
            const newHistory: EditOp[] = [];

            for (let i = 0; i < this.history.length; i++) {
                const op = this.history[i];
                if ((op as any).shape === shape) {
                    op.destroy?.();
                } else {
                    newHistory.push(op);
                    if (i < this.cursor) {
                        newCursor++;
                    }
                }
            }

            this.history = newHistory;
            this.cursor = newCursor;
            this.fireEvents();
        });
    }

    removeForSplat(splat: Splat) {
        return this.queue(() => {
            let newCursor = 0;
            const newHistory: EditOp[] = [];

            for (let i = 0; i < this.history.length; i++) {
                const op = this.history[i];
                if (!opReferencesSplat(op, splat)) {
                    newHistory.push(op);
                    if (i < this.cursor) {
                        newCursor++;
                    }
                }
            }

            this.history = newHistory;
            this.cursor = newCursor;
            this.fireEvents();
        });
    }
}