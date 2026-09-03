// Per-gaussian editor state bits. The live storage lives on the instance list
// (see src/gaussian-instances.ts); this is just the shared vocabulary.
// Deletion is not a state: it removes instances from the list
export enum State {
    selected = 1,
    locked = 2
}