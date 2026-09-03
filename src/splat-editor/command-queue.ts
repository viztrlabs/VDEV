// Unified FIFO queue for all async splat work (GPU readbacks + history mutations).
// Every consumer that needs ordering relative to other commands enqueues a task
// here; the queue guarantees strict FIFO across the whole app, so neither
// dataProcessor nor edit-history needs its own private chain.
export class CommandQueue {
    private tail: Promise<void> = Promise.resolve();

    enqueue<T>(fn: () => T | Promise<T>): Promise<T> {
        const next = this.tail.then(fn);
        // Swallow errors on the chain itself so a failed task doesn't poison
        // subsequent ones. The caller still sees the rejection on its own promise.
        this.tail = next.then(() => {}, (err) => {
            console.error('CommandQueue task failed', err);
        });
        return next;
    }
}