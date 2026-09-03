import {
    BUFFERUSAGE_COPY_DST,
    BUFFERUSAGE_COPY_SRC,
    GraphicsDevice,
    StorageBuffer
} from 'playcanvas';

import { IndexRanges } from './index-ranges';
import { State } from './splat-state';

export type RemovedInstances = {
    ranges: IndexRanges;
    sourceRow: Uint32Array;
    flags: Uint8Array;
    palette: Uint32Array;
};

const FILE_STATE_DELETED = 4;

class DirtySpan {
    lo = -1;
    hi = -1;

    add(lo: number, hi: number) {
        if (this.lo < 0) {
            this.lo = lo;
            this.hi = hi;
        } else {
            if (lo < this.lo) this.lo = lo;
            if (hi > this.hi) this.hi = hi;
        }
    }

    clear() {
        this.lo = -1;
        this.hi = -1;
    }

    get dirty() {
        return this.lo >= 0;
    }
}

export class GaussianInstances {
    count: number;

    readonly sourceRow: Uint32Array;
    readonly flags: Uint8Array;
    readonly palette: Uint32Array;

    readonly instanceSource: StorageBuffer;
    readonly instanceFlags: StorageBuffer;
    readonly instancePalette: StorageBuffer;

    numSelected = 0;
    numLocked = 0;
    numRemoved = 0;

    private readonly flagWords: Uint32Array;
    private readonly flagSpan = new DirtySpan();
    private readonly paletteSpan = new DirtySpan();
    private readonly sourceSpan = new DirtySpan();
    private countsDirty = true;

    constructor(device: GraphicsDevice, numRows: number, initialFlags?: Uint8Array) {
        this.count = numRows;

        this.sourceRow = new Uint32Array(numRows);
        for (let i = 0; i < numRows; ++i) {
            this.sourceRow[i] = i;
        }

        this.flagWords = new Uint32Array(Math.ceil(numRows / 4));
        this.flags = new Uint8Array(this.flagWords.buffer, 0, numRows);
        this.palette = new Uint32Array(numRows);

        if (initialFlags) {
            this.flags.set(initialFlags.subarray(0, numRows));
            this.remove(IndexRanges.fromPredicate(numRows, i => (this.flags[i] & FILE_STATE_DELETED) !== 0));
        }

        const usage = BUFFERUSAGE_COPY_DST | BUFFERUSAGE_COPY_SRC;
        this.instanceSource = new StorageBuffer(device, Math.max(4, numRows * 4), usage);
        this.instanceFlags = new StorageBuffer(device, Math.max(4, this.flagWords.length * 4), usage);
        this.instancePalette = new StorageBuffer(device, Math.max(4, numRows * 4), usage);

        this.markDirty(0, this.count);
    }

    static fromSubset(device: GraphicsDevice, source: GaussianInstances, ranges: IndexRanges) {
        const capacity = source.sourceRow.length;
        const result = new GaussianInstances(device, capacity);
        let dst = 0;
        ranges.forEachRun((start, count) => {
            const end = start + count;
            result.sourceRow.set(source.sourceRow.subarray(start, end), dst);
            result.palette.set(source.palette.subarray(start, end), dst);
            result.flags.set(source.flags.subarray(start, end), dst);
            dst += count;
        });
        result.count = ranges.count;
        result.numRemoved = capacity - ranges.count;
        result.markDirty(0, result.count);
        result.countsDirty = true;
        return result;
    }

    static fromRecords(
        device: GraphicsDevice,
        numRows: number,
        sourceRow: Uint32Array,
        flags: Uint8Array,
        palette: Uint32Array
    ) {
        const result = new GaussianInstances(device, numRows);
        result.sourceRow.set(sourceRow);
        result.flags.set(flags);
        result.palette.set(palette);
        result.count = sourceRow.length;
        result.numRemoved = numRows - result.count;
        result.countsDirty = true;
        return result;
    }

    destroy() {
        this.instanceSource.destroy();
        this.instanceFlags.destroy();
        this.instancePalette.destroy();
    }

    get byteSize() {
        return this.instanceSource.byteSize + this.instanceFlags.byteSize + this.instancePalette.byteSize;
    }

    transformIndex(instance: number): number {
        return this.palette[instance] & 0xffff;
    }

    setTransformIndex(instance: number, index: number) {
        this.palette[instance] = (this.palette[instance] & 0xffff0000) | (index & 0xffff);
        this.paletteSpan.add(instance, instance + 1);
    }

    colorIndex(instance: number): number {
        return this.palette[instance] >>> 16;
    }

    setColorIndex(instance: number, index: number) {
        this.palette[instance] = (this.palette[instance] & 0xffff) | ((index & 0xffff) << 16);
        this.paletteSpan.add(instance, instance + 1);
    }

    setBits(ranges: IndexRanges, mask: number): void {
        this.mutate(ranges, before => before | mask);
    }

    clearBits(ranges: IndexRanges, mask: number): void {
        this.mutate(ranges, before => before & ~mask);
    }

    toggleBits(ranges: IndexRanges, mask: number): void {
        this.mutate(ranges, before => before ^ mask);
    }

    remove(ranges: IndexRanges): RemovedInstances {
        const total = ranges.count;
        const removed: RemovedInstances = {
            ranges,
            sourceRow: new Uint32Array(total),
            flags: new Uint8Array(total),
            palette: new Uint32Array(total)
        };
        if (total === 0) {
            return removed;
        }

        const { sourceRow, flags, palette } = this;
        let first = -1;
        let dst = 0;
        let src = 0;
        let out = 0;
        ranges.forEachRun((start, count) => {
            if (first < 0) {
                first = start;
                dst = start;
                src = start;
            }
            if (start > src) {
                sourceRow.copyWithin(dst, src, start);
                flags.copyWithin(dst, src, start);
                palette.copyWithin(dst, src, start);
                dst += start - src;
            }
            removed.sourceRow.set(sourceRow.subarray(start, start + count), out);
            removed.flags.set(flags.subarray(start, start + count), out);
            removed.palette.set(palette.subarray(start, start + count), out);
            out += count;
            src = start + count;
        });
        if (this.count > src) {
            sourceRow.copyWithin(dst, src, this.count);
            flags.copyWithin(dst, src, this.count);
            palette.copyWithin(dst, src, this.count);
            dst += this.count - src;
        }

        this.count = dst;
        this.numRemoved += total;
        this.markDirty(first, dst);
        this.countsDirty = true;
        return removed;
    }

    insert(removed: RemovedInstances) {
        const total = removed.sourceRow.length;
        if (total === 0) {
            return;
        }

        const { sourceRow, flags, palette } = this;
        const runs: number[] = [];
        removed.ranges.forEachRun((start, count) => runs.push(start, count));

        let dstEnd = this.count + total;
        let srcEnd = this.count;
        let out = total;
        for (let r = runs.length - 2; r >= 0; r -= 2) {
            const start = runs[r];
            const count = runs[r + 1];
            const keep = dstEnd - (start + count);
            if (keep > 0) {
                sourceRow.copyWithin(dstEnd - keep, srcEnd - keep, srcEnd);
                flags.copyWithin(dstEnd - keep, srcEnd - keep, srcEnd);
                palette.copyWithin(dstEnd - keep, srcEnd - keep, srcEnd);
                srcEnd -= keep;
            }
            out -= count;
            sourceRow.set(removed.sourceRow.subarray(out, out + count), start);
            flags.set(removed.flags.subarray(out, out + count), start);
            palette.set(removed.palette.subarray(out, out + count), start);
            dstEnd = start;
        }

        this.count += total;
        this.numRemoved -= total;
        this.markDirty(runs[0], this.count);
        this.countsDirty = true;
    }

    appendMissing(numRows: number): number {
        const present = new Uint8Array(numRows);
        for (let i = 0; i < this.count; ++i) {
            present[this.sourceRow[i]] = 1;
        }

        const first = this.count;
        let at = first;
        for (let row = 0; row < numRows; ++row) {
            if (!present[row]) {
                this.sourceRow[at] = row;
                this.flags[at] = 0;
                this.palette[at] = 0;
                at++;
            }
        }

        if (at > first) {
            this.count = at;
            this.numRemoved -= at - first;
            this.markDirty(first, at);
            this.countsDirty = true;
        }
        return at - first;
    }

    truncate(n: number) {
        if (n > 0) {
            this.count -= n;
            this.numRemoved += n;
            this.countsDirty = true;
        }
    }

    private mutate(ranges: IndexRanges, op: (before: number) => number) {
        const { flags } = this;
        let lo = Infinity;
        let hi = -1;
        ranges.forEach((i) => {
            const before = flags[i];
            const after = op(before);
            if (after !== before) {
                flags[i] = after;
                this.reclassify(before, after);
            }
            if (i < lo) lo = i;
            if (i >= hi) hi = i + 1;
        });
        if (hi > 0) {
            this.flagSpan.add(lo, hi);
        }
    }

    private markDirty(lo: number, hi: number) {
        this.flagSpan.add(lo, hi);
        this.paletteSpan.add(lo, hi);
        this.sourceSpan.add(lo, hi);
    }

    private static bucket(s: number): number {
        if (s & State.locked) return State.locked;
        if (s & State.selected) return State.selected;
        return 0;
    }

    private reclassify(before: number, after: number) {
        const from = GaussianInstances.bucket(before);
        const to = GaussianInstances.bucket(after);
        if (from === to) return;
        if (from === State.locked) this.numLocked--;
        else if (from === State.selected) this.numSelected--;
        if (to === State.locked) this.numLocked++;
        else if (to === State.selected) this.numSelected++;
    }

    private recount() {
        const { flags, count } = this;
        let numSelected = 0;
        let numLocked = 0;
        for (let i = 0; i < count; ++i) {
            const s = flags[i];
            if (s & State.locked) {
                numLocked++;
            } else if (s & State.selected) {
                numSelected++;
            }
        }
        this.numSelected = numSelected;
        this.numLocked = numLocked;
    }

    flush(): void {
        if (this.countsDirty) {
            this.recount();
            this.countsDirty = false;
        }

        if (this.flagSpan.dirty) {
            const firstWord = this.flagSpan.lo >> 2;
            const lastWord = Math.min(this.flagWords.length, (this.flagSpan.hi + 3) >> 2);
            this.instanceFlags.write(firstWord * 4, this.flagWords, firstWord, lastWord - firstWord);
            this.flagSpan.clear();
        }

        if (this.paletteSpan.dirty) {
            const { lo, hi } = this.paletteSpan;
            this.instancePalette.write(lo * 4, this.palette, lo, hi - lo);
            this.paletteSpan.clear();
        }

        if (this.sourceSpan.dirty) {
            const { lo, hi } = this.sourceSpan;
            this.instanceSource.write(lo * 4, this.sourceRow, lo, hi - lo);
            this.sourceSpan.clear();
        }
    }
}

export const groupInstancesByChunk = (instances: GaussianInstances, chunkSize: number, numChunks: number) => {
    const { sourceRow, count } = instances;
    const starts = new Uint32Array(numChunks + 1);
    for (let i = 0; i < count; ++i) {
        starts[Math.floor(sourceRow[i] / chunkSize) + 1]++;
    }
    for (let c = 0; c < numChunks; ++c) {
        starts[c + 1] += starts[c];
    }
    const cursors = starts.slice(0, numChunks);
    const ordered = new Uint32Array(count);
    for (let i = 0; i < count; ++i) {
        ordered[cursors[Math.floor(sourceRow[i] / chunkSize)]++] = i;
    }
    return { starts, ordered };
};