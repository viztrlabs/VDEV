import { Color, Mat4, Quat, Vec3 } from 'playcanvas';

import { AnimTrack } from './anim-track';
import { BoxShape } from './box-shape';
import { composeGrades, createGradeTerms, type GradeTerms } from './color-grade';
import type { RemovedInstances } from './gaussian-instances';
import { IndexRanges, sortedPredicate } from './index-ranges';
import { Pivot } from './pivot';
import { Scene } from './scene';
import { SphereShape } from './sphere-shape';
import { Splat } from './splat';
import { State } from './splat-state';
import { Transform } from './transform';

export interface EditOp {
    name: string;
    do(): void | Promise<void>;
    undo(): void | Promise<void>;
    destroy?(): void;
}

const enum BitOp {
    SET,
    CLEAR,
    TOGGLE
}

class StateOp {
    splat: Splat;
    ranges: IndexRanges;
    mask: number;
    op: BitOp;

    constructor(splat: Splat, ranges: IndexRanges, mask: number, op: BitOp) {
        this.splat = splat;
        this.ranges = ranges;
        this.mask = mask;
        this.op = op;
    }

    private apply(op: BitOp) {
        const { instances } = this.splat;
        const { mask, ranges } = this;

        switch (op) {
            case BitOp.SET:
                instances.setBits(ranges, mask);
                break;
            case BitOp.CLEAR:
                instances.clearBits(ranges, mask);
                break;
            case BitOp.TOGGLE:
                instances.toggleBits(ranges, mask);
                break;
        }
    }

    async do() {
        this.apply(this.op);
        await this.splat.updateState();
    }

    async undo() {
        const undoOp = this.op === BitOp.TOGGLE ? BitOp.TOGGLE :
            this.op === BitOp.SET ? BitOp.CLEAR : BitOp.SET;
        this.apply(undoOp);
        await this.splat.updateState();
    }

    destroy() {
        this.splat = null;
        this.ranges = null;
    }
}

export class SelectAllOp extends StateOp {
    name = 'selectAll';

    constructor(splat: Splat) {
        const state = splat.instances.flags;
        const count = splat.instances.count;
        super(splat, IndexRanges.fromPredicate(count, i => state[i] === 0), State.selected, BitOp.SET);
    }
}

export class SelectNoneOp extends StateOp {
    name = 'selectNone';

    constructor(splat: Splat) {
        const state = splat.instances.flags;
        const count = splat.instances.count;
        super(splat, IndexRanges.fromPredicate(count, i => state[i] === State.selected), State.selected, BitOp.CLEAR);
    }
}

export class SelectInvertOp extends StateOp {
    name = 'selectInvert';

    constructor(splat: Splat) {
        const state = splat.instances.flags;
        const count = splat.instances.count;
        super(splat, IndexRanges.fromPredicate(count, i => (state[i] & State.locked) === 0), State.selected, BitOp.TOGGLE);
    }
}

export class SelectOp extends StateOp {
    name = 'selectOp';

    constructor(splat: Splat, op: 'add' | 'remove' | 'set' | 'intersect', sel: Uint8Array | Uint32Array) {
        const state = splat.instances.flags;
        const count = splat.instances.count;
        const isHit = sel instanceof Uint32Array ? sortedPredicate(sel) : (i: number) => sel[i] === 255;

        const valid = (i: number) => state[i] === 0 || state[i] === State.selected;

        const bitOps = {
            add: BitOp.SET,
            remove: BitOp.CLEAR,
            set: BitOp.TOGGLE,
            intersect: BitOp.CLEAR
        };

        const preds = {
            add: (i: number) => valid(i) && isHit(i) && state[i] === 0,
            remove: (i: number) => valid(i) && isHit(i) && state[i] === State.selected,
            set: (i: number) => valid(i) && ((state[i] === State.selected) !== isHit(i)),
            intersect: (i: number) => valid(i) && state[i] === State.selected && !isHit(i)
        };

        super(splat, IndexRanges.fromPredicate(count, preds[op]), State.selected, bitOps[op]);
    }
}

export class HideSelectionOp extends StateOp {
    name = 'hideSelection';

    constructor(splat: Splat) {
        const state = splat.instances.flags;
        const count = splat.instances.count;
        super(splat, IndexRanges.fromPredicate(count, i => state[i] === State.selected), State.locked, BitOp.SET);
    }
}

export class UnhideAllOp extends StateOp {
    name = 'unhideAll';

    constructor(splat: Splat) {
        const state = splat.instances.flags;
        const count = splat.instances.count;
        super(splat, IndexRanges.fromPredicate(count, i => (state[i] & State.locked) !== 0), State.locked, BitOp.CLEAR);
    }
}

export function selectedRanges(splat: Splat): IndexRanges {
    const flags = splat.instances.flags;
    return IndexRanges.fromPredicate(splat.instances.count, i => flags[i] === State.selected);
}

export class RemoveInstancesOp {
    name = 'removeInstances';
    splat: Splat;
    ranges: IndexRanges;
    private removed: RemovedInstances = null;

    constructor(splat: Splat) {
        this.splat = splat;
        this.ranges = selectedRanges(splat);
    }

    async do() {
        this.removed = this.splat.instances.remove(this.ranges);
        await this.splat.updateState();
    }

    async undo() {
        this.splat.instances.insert(this.removed);
        this.removed = null;
        await this.splat.updateState();
    }

    destroy() {
        this.splat = null;
        this.ranges = null;
        this.removed = null;
    }
}

export class RestoreMissingInstancesOp {
    name = 'restoreMissingInstances';
    splat: Splat;
    private appended = 0;

    constructor(splat: Splat) {
        this.splat = splat;
    }

    async do() {
        this.appended = this.splat.instances.appendMissing(this.splat.resource.numRows);
        await this.splat.updateState();
    }

    async undo() {
        this.splat.instances.truncate(this.appended);
        this.appended = 0;
        await this.splat.updateState();
    }

    destroy() {
        this.splat = null;
    }
}

export class EntityTransformOp {
    name = 'entityTransform';
    splat: Splat;
    oldt: Transform;
    newt: Transform;

    constructor(options: { splat: Splat, oldt: Transform, newt: Transform }) {
        this.splat = options.splat;
        this.oldt = options.oldt;
        this.newt = options.newt;
    }

    do() {
        this.splat.move(this.newt.position, this.newt.rotation, this.newt.scale);
    }

    undo() {
        this.splat.move(this.oldt.position, this.oldt.rotation, this.oldt.scale);
    }

    destroy() {
        this.splat = null;
        this.oldt = null;
        this.newt = null;
    }
}

const mat = new Mat4();

export class SplatsTransformOp {
    name = 'splatsTransform';

    splat: Splat;
    transform: Mat4;
    paletteMap: Map<number, number>;

    constructor(options: { splat: Splat, transform: Mat4, paletteMap: Map<number, number> }) {
        this.splat = options.splat;
        this.transform = options.transform;
        this.paletteMap = options.paletteMap;
    }

    async do() {
        const { splat, transform, paletteMap } = this;
        const { instances } = splat;
        const state = instances.flags;

        for (let i = 0; i < instances.count; ++i) {
            if (state[i] === State.selected) {
                instances.setTransformIndex(i, paletteMap.get(instances.transformIndex(i)));
            }
        }

        splat.transformPalette.alloc(paletteMap.size);

        const { transformPalette } = splat;
        this.paletteMap.forEach((newIdx, oldIdx) => {
            transformPalette.getTransform(oldIdx, mat);
            mat.mul2(transform, mat);
            transformPalette.setTransform(newIdx, mat);
        });

        await splat.updatePositions();
    }

    async undo() {
        const { splat, paletteMap } = this;
        const { instances } = splat;
        const state = instances.flags;

        const inverseMap = new Map<number, number>();
        paletteMap.forEach((newIdx, oldIdx) => {
            inverseMap.set(newIdx, oldIdx);
        });

        for (let i = 0; i < instances.count; ++i) {
            if (state[i] === State.selected) {
                instances.setTransformIndex(i, inverseMap.get(instances.transformIndex(i)));
            }
        }

        splat.transformPalette.free(paletteMap.size);

        await splat.updatePositions();
    }

    destroy() {
        this.splat = null;
        this.transform = null;
        this.paletteMap = null;
    }
}

const gradeA = createGradeTerms();
const gradeB = createGradeTerms();
const identityGrade = createGradeTerms();

export class SplatsColorOp {
    name = 'splatsColor';

    splat: Splat;
    grade: GradeTerms;

    private oldIndices: number[];
    private paletteMap: Map<number, number>;

    constructor(options: { splat: Splat, grade: GradeTerms | null }) {
        this.splat = options.splat;
        this.grade = options.grade;

        const seen = new Set<number>();
        this.forEachTarget(i => seen.add(options.splat.instances.colorIndex(i)));
        this.oldIndices = [...seen];
    }

    private forEachTarget(fn: (i: number) => void) {
        const { instances } = this.splat;
        const { flags } = instances;
        const all = instances.numSelected === 0;
        for (let i = 0; i < instances.count; ++i) {
            const f = flags[i];
            if ((f & State.locked) === 0 && (all || (f & State.selected) !== 0)) {
                fn(i);
            }
        }
    }

    do() {
        const { splat, grade, oldIndices } = this;
        const { instances, colorPalette } = splat;

        const base = colorPalette.alloc(oldIndices.length);
        const paletteMap = new Map<number, number>();
        oldIndices.forEach((oldIdx, i) => paletteMap.set(oldIdx, base + i));
        this.paletteMap = paletteMap;

        this.forEachTarget((i) => {
            instances.setColorIndex(i, paletteMap.get(instances.colorIndex(i)));
        });

        paletteMap.forEach((newIdx, oldIdx) => {
            if (grade) {
                colorPalette.getEntry(oldIdx, gradeA);
                colorPalette.setEntry(newIdx, composeGrades(gradeA, grade, gradeB));
            } else {
                colorPalette.setEntry(newIdx, identityGrade);
            }
        });

        splat.updateColors();
    }

    undo() {
        const { splat, paletteMap } = this;
        const { instances, colorPalette } = splat;

        const inverseMap = new Map<number, number>();
        paletteMap.forEach((newIdx, oldIdx) => {
            inverseMap.set(newIdx, oldIdx);
        });

        this.forEachTarget((i) => {
            instances.setColorIndex(i, inverseMap.get(instances.colorIndex(i)));
        });

        colorPalette.free(paletteMap.size);

        splat.updateColors();
    }

    destroy() {
        this.splat = null;
        this.grade = null;
        this.oldIndices = null;
        this.paletteMap = null;
    }
}

export class PlacePivotOp {
    name = 'setPivot';
    pivot: Pivot;
    oldt: Transform;
    newt: Transform;

    constructor(options: { pivot: Pivot, oldt: Transform, newt: Transform }) {
        this.pivot = options.pivot;
        this.oldt = options.oldt;
        this.newt = options.newt;
    }

    do() {
        this.pivot.place(this.newt);
    }

    undo() {
        this.pivot.place(this.oldt);
    }
}

export class SetLocalFrameOp {
    name = 'setLocalFrame';
    splat: Splat;
    oldOrigin: Vec3;
    oldFrame: Quat;
    newOrigin: Vec3;
    newFrame: Quat;

    constructor(options: { splat: Splat, oldOrigin: Vec3, oldFrame: Quat, newOrigin: Vec3, newFrame: Quat }) {
        this.splat = options.splat;
        this.oldOrigin = options.oldOrigin;
        this.oldFrame = options.oldFrame;
        this.newOrigin = options.newOrigin;
        this.newFrame = options.newFrame;
    }

    do() {
        this.splat.setLocalFrame(this.newOrigin, this.newFrame);
    }

    undo() {
        this.splat.setLocalFrame(this.oldOrigin, this.oldFrame);
    }

    destroy() {
        this.splat = null;
        this.oldOrigin = null;
        this.oldFrame = null;
        this.newOrigin = null;
        this.newFrame = null;
    }
}

export type ShapeTransformState = {
    position: Vec3;
    rotation?: Quat;
    lens?: Vec3;
    radius?: number;
};

export class ShapeTransformOp {
    name = 'shapeTransform';
    shape: BoxShape | SphereShape;
    oldState: ShapeTransformState;
    newState: ShapeTransformState;

    constructor(options: { shape: BoxShape | SphereShape, oldState: ShapeTransformState, newState: ShapeTransformState }) {
        this.shape = options.shape;
        this.oldState = options.oldState;
        this.newState = options.newState;
    }

    apply(state: ShapeTransformState) {
        const { shape } = this;
        shape.pivot.setPosition(state.position);
        if (state.rotation) {
            shape.pivot.setRotation(state.rotation);
        }
        if (shape instanceof BoxShape && state.lens) {
            shape.lenX = state.lens.x;
            shape.lenY = state.lens.y;
            shape.lenZ = state.lens.z;
        } else if (shape instanceof SphereShape && state.radius !== undefined) {
            shape.radius = state.radius;
        } else {
            shape.moved();
        }

        shape.scene?.events.fire('shapeSelection.changed', shape);
    }

    do() {
        this.apply(this.newState);
    }

    undo() {
        this.apply(this.oldState);
    }
}

export class AnimTrackEditOp {
    name: string;
    track: AnimTrack;
    before: unknown;
    after: unknown;

    constructor(name: string, track: AnimTrack, before: unknown, after: unknown) {
        this.name = name;
        this.track = track;
        this.before = before;
        this.after = after;
    }

    do() {
        this.track.restore(this.after);
    }

    undo() {
        this.track.restore(this.before);
    }
}

export class MultiOp {
    name = 'multiOp';
    ops: EditOp[];

    constructor(ops: EditOp[]) {
        this.ops = ops;
    }

    async do() {
        for (const op of this.ops) {
            await op.do();
        }
    }

    async undo() {
        for (const op of this.ops) {
            await op.undo();
        }
    }
}

export class AddSplatOp {
    name = 'addSplat';
    scene: Scene;
    splat: Splat;

    constructor(scene: Scene, splat: Splat) {
        this.scene = scene;
        this.splat = splat;
    }

    async do() {
        await this.scene.add(this.splat);
    }

    undo() {
        this.scene.remove(this.splat);
    }

    destroy() {
        this.splat.destroy();
    }
}

export class SplatRenameOp {
    name = 'splatRename';
    splat: Splat;
    oldName: string;
    newName: string;

    constructor(splat: Splat, newName: string) {
        this.splat = splat;
        this.oldName = splat.name;
        this.newName = newName;
    }

    do() {
        this.splat.name = this.newName;
    }

    undo() {
        this.splat.name = this.oldName;
    }
}