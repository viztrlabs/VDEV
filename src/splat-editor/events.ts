type FunctionCallback = (...args: any[]) => any;

class Events {
    private handlers = new Map<string, Set<FunctionCallback>>();
    private functions = new Map<string, FunctionCallback>();

    // EventHandler-compatible API
    on(name: string, fn: FunctionCallback) {
        if (!this.handlers.has(name)) {
            this.handlers.set(name, new Set());
        }
        this.handlers.get(name)!.add(fn);
    }

    off(name: string, fn: FunctionCallback) {
        this.handlers.get(name)?.delete(fn);
    }

    fire(name: string, ...args: any[]) {
        this.handlers.get(name)?.forEach(fn => fn(...args));
    }

    once(name: string, fn: FunctionCallback) {
        const wrapped = (...args: any[]) => {
            this.off(name, wrapped);
            fn(...args);
        };
        this.on(name, wrapped);
    }

    has(name: string): boolean {
        return this.handlers.has(name) && this.handlers.get(name)!.size > 0;
    }

    // Function registry for request-response pattern
    function(name: string, fn: FunctionCallback) {
        if (this.functions.has(name)) {
            throw new Error(`error: function ${name} already exists`);
        }
        this.functions.set(name, fn);
    }

    invoke(name: string, ...args: any[]): any {
        const fn = this.functions.get(name);
        if (!fn) {
            console.error(`error: function not found '${name}'`);
            return;
        }
        return fn(...args);
    }

    // Check if a function is registered
    hasFunction(name: string): boolean {
        return this.functions.has(name);
    }
}

export { Events };