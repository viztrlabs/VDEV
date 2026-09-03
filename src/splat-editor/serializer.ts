import { Color, Vec3 } from 'playcanvas';

export class Serializer {
    constructor(private packValue: (value: any) => void) {}

    pack(...args: any[]) {
        for (let j = 0; j < args.length; ++j) {
            this.packValue(args[j]);
        }
    }

    packa(a: any[] | Float32Array) {
        for (let j = 0; j < a.length; ++j) {
            this.packValue(a[j]);
        }
    }

    packVec3(v: Vec3) {
        this.pack(v.x, v.y, v.z);
    }

    packColor(c: Color) {
        this.pack(c.r, c.g, c.b, c.a);
    }
}