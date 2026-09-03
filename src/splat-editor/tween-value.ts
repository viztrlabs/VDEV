// Tween value class for smooth camera animation
export class TweenValue<T extends Record<string, any>> {
    value: T;
    target: T;
    source: T;
    timer = 0;
    transitionTime = 0;

    constructor(initial: T) {
        this.value = { ...initial };
        this.target = { ...initial };
        this.source = { ...initial };
    }

    goto(target: T, transitionTime: number) {
        Object.assign(this.source, this.target);
        Object.assign(this.target, target);
        this.timer = 0;
        this.transitionTime = Math.max(0.001, transitionTime);
    }

    update(deltaTime: number) {
        if (this.timer < this.transitionTime) {
            this.timer = Math.min(this.timer + deltaTime, this.transitionTime);
            const t = this.timer / this.transitionTime;
            const tEased = 1 - Math.pow(1 - t, 3); // ease-out cubic

            for (const key in this.value) {
                const src = this.source[key];
                const tgt = this.target[key];
                if (typeof src === 'number' && typeof tgt === 'number') {
                    this.value[key] = src + (tgt - src) * tEased;
                } else {
                    this.value[key] = tgt;
                }
            }
        }
    }
}