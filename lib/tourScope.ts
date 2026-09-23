// Builds a deterministic TourScope from URL/search param input. A `tour` value
// that looks like a uuid targets tours.id, otherwise it is treated as the
// stable slug (public address).

import { looksLikeId, TourScope } from './tourIdentity';

export function buildTourScope(params: {
  tour?: string | null;
  experience?: string | null;
  project?: string | null;
}): TourScope {
  const scope: TourScope = {};
  if (params.tour) {
    if (looksLikeId(params.tour)) scope.tourId = params.tour;
    else scope.slug = params.tour;
  }
  scope.experienceId = params.experience || undefined;
  scope.projectId = params.project || undefined;
  return scope;
}

export function parseTourParams(
  params: { get(name: string): string | null },
): { scope: TourScope; isPublic: boolean } {
  const scope = buildTourScope({
    tour: params.get('tour'),
    experience: params.get('experience'),
    project: params.get('project'),
  });
  const isPublic = params.get('public') === '1';
  return { scope, isPublic };
}