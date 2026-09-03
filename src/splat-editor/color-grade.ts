import { Color } from 'playcanvas';

export interface GradeParams {
    exposure: number;
    lights: number;
    shadows: number;
    range: number;
    masking: number;
    quality: number;
}

export interface GradeTerms {
    exposure: number;
    lights: number;
    shadows: number;
    range: number;
    masking: number;
    quality: number;
}

export function createGradeTerms(): GradeTerms {
    return {
        exposure: 0,
        lights: 0,
        shadows: 0,
        range: 0,
        masking: 0,
        quality: 0
    };
}

export function composeGrades(base: GradeTerms, overlay: GradeTerms, result: GradeTerms): GradeTerms {
    result.exposure = base.exposure + overlay.exposure;
    result.lights = base.lights + overlay.lights;
    result.shadows = base.shadows + overlay.shadows;
    result.range = base.range + overlay.range;
    result.masking = base.masking + overlay.masking;
    result.quality = base.quality + overlay.quality;
    return result;
}

export function gradeTerms(params: GradeParams, terms: GradeTerms): GradeTerms {
    terms.exposure = params.exposure;
    terms.lights = params.lights;
    terms.shadows = params.shadows;
    terms.range = params.range;
    terms.masking = params.masking;
    terms.quality = params.quality;
    return terms;
}