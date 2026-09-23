/**
 * Client-side experience resolution for the virtual tour editor/builder.
 *
 * Resolves the VizTR experience id a tour belongs to, in order:
 *   1. explicit URL `?experience=` param (passed in as `urlExperience`)
 *   2. an experience id already persisted on the tour row (`savedExperienceId`)
 *   3. an existing experience for the project (GET /api/experiences)
 *   4. create one (POST /api/experiences)
 *
 * Never throws for network/auth failures — returns `{ experienceId: null, error }`
 * so callers can surface the failure without blocking tour save.
 */

export interface ResolveExperienceInput {
  urlExperience?: string | null;
  savedExperienceId?: string | null;
  projectId?: string | null;
}

export interface ResolveExperienceResult {
  experienceId: string | null;
  error?: string;
}

export async function resolveExperienceId(input: ResolveExperienceInput): Promise<ResolveExperienceResult> {
  if (input.urlExperience) return { experienceId: input.urlExperience };
  if (input.savedExperienceId) return { experienceId: input.savedExperienceId };
  if (!input.projectId) return { experienceId: null };

  try {
    const res = await fetch(`/api/experiences?projectId=${encodeURIComponent(input.projectId)}`, {
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      const list = data?.experiences || data?.data || [];
      if (Array.isArray(list) && list.length > 0 && list[0]?.id) {
        return { experienceId: list[0].id };
      }
    }

    const created = await fetch('/api/experiences', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: input.projectId,
        title: 'Virtual Tour',
        slug: `virtual-tour-${Date.now()}`,
      }),
    });
    if (created.ok) {
      const d = await created.json();
      const id = d?.experience?.id || d?.experience_id || d?.id;
      if (id) return { experienceId: id };
      return { experienceId: null, error: 'Experience API returned no id.' };
    }
    if (created.status === 401) {
      return { experienceId: null, error: 'Experience API requires sign-in (401).' };
    }
    return { experienceId: null, error: `Experience API failed (${created.status}).` };
  } catch (e: any) {
    return { experienceId: null, error: e?.message || 'Experience resolution failed.' };
  }
}