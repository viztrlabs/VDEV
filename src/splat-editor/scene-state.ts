import { Element, ElementType, ElementTypeList } from './element';

// A frame's state: a mapping from element type to a sparse array of packed values.
// Each element contributes a fixed-size slice of the array; comparing two
// frames just walks the slices and checks equality.
class SceneState {
    slices = new Map<ElementType, any[]>();

    reset() {
        this.slices.clear();
    }

    // Encode an element's state into the per-type slice.
    pack(element: Element) {
        if (!element.pack) return;
        const type = element.type;
        if (!this.slices.has(type)) {
            this.slices.set(type, []);
        }
        const slice = this.slices.get(type)!;
        element.pack(this, slice);
    }

    // Compare with another frame, returning sets of added/removed/moved/changed types.
    compare(other: SceneState) {
        const added = new Set<ElementType>();
        const removed = new Set<ElementType>();
        const moved = new Set<ElementType>();
        const changed = new Set<ElementType>();

        const types = new Set([...this.slices.keys(), ...other.slices.keys()]);

        types.forEach(type => {
            const a = this.slices.get(type) ?? [];
            const b = other.slices.get(type) ?? [];

            if (a.length === 0) {
                added.add(type);
            } else if (b.length === 0) {
                removed.add(type);
            } else if (a.length !== b.length) {
                moved.add(type);
            } else {
                let same = true;
                for (let i = 0; i < a.length; ++i) {
                    if (a[i] !== b[i]) {
                        same = false;
                        break;
                    }
                }
                if (!same) {
                    changed.add(type);
                }
            }
        });

        return { added, removed, moved, changed };
    }
}

export { SceneState };