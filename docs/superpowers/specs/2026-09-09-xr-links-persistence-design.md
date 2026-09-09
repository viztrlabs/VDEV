# XR Links Persistence — DB Migration & Service-Role Store (Design)

## Goal

Make the spatial-link publish chain persist to Supabase for real. The current store (`lib/xr-links-store.ts`) queries a non-existent `xr_links` table via the **anon key** with a camelCase-upsert/snake_case-`order` mismatch, so in practice it always falls back to the in-memory `XR_LINKS_DB`. This pass adds the `xr_links` table to the Supabase schema and switches the store to a **server-only service-role client** with proper snake_case mapping — while preserving the graceful in-memory fallback when Supabase is not configured.

Explicitly **not** in scope: analytics increment/view-tracking logic (counters ship and default to 0; increments are a later analytics pass), and any change to the public/auth route handlers' behavior.

## Decisions (confirmed with user)

1. **Row model only.** The table covers the full `XRLinkRecord`, including the three analytics counter columns (`views_count`, `unique_visitors`, `avg_engagement_secs`) defaulting to 0. No analytics increment API this pass.
2. **Service-role server client.** A server-only Supabase admin client (service_role key, never `NEXT_PUBLIC_`) performs all `xr_links` reads/writes. RLS is enabled with **no** anon/authenticated grants, so the table is invisible to the Data API and `access_password` can never leak.
3. **snake_case columns + mapper.** Columns are idiomatic snake_case. The store gains thin `toDbRow` / `fromDbRow` mappers; `.order('created_at', …)` stays valid.
4. **Seed the table.** The 6 in-memory seed records (3 generator slugs + `lumina-sky-atrium` + `aura-waterfront-pavilion` + `client-secure-haven`) are inserted idempotently so public links keep resolving exactly as today.

## Architecture

### Table: `public.xr_links`

```sql
create table if not exists public.xr_links (
  id text primary key,
  name text not null,
  slug text unique not null,
  project_id text,
  scene_id text,
  model_url text not null,
  thumbnail_url text,
  share_url text not null,
  qr_code_url text not null default '',
  environment text not null default 'studio'
    check (environment in ('studio','sunset','urban','interior')),
  ar_placement text not null default 'floor'
    check (ar_placement in ('floor','tabletop','wall','image')),
  password_protected boolean not null default false,
  access_password text,
  views_count integer not null default 0,
  unique_visitors integer not null default 0,
  avg_engagement_secs double precision not null default 0,
  status text not null default 'draft'
    check (status in ('draft','active','expired','revoked','processing')),
  expires_at timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists xr_links_slug_idx on public.xr_links (slug);
create index if not exists xr_links_created_at_idx on public.xr_links (created_at desc);

alter table public.xr_links enable row level security;
-- No policies. Service role bypasses RLS; anon/authenticated are granted nothing,
-- so the table is not reachable through the Data API (access_password stays private).
```

`id` is `text` (not `uuid`) to match the store's generated ids (`xr_<ts>_<rand>`) and the seed ids (`xr_link_01`, `xr_link_gp`, …). `slug` is `unique not null` since slug is now a stable per-record field used by the public resolver.

### Seed

After DDL, idempotent insert of the 6 records identical to `XR_LINKS_DB` (including `client-secure-haven` with `access_password 'VIZTR-2026'`, and the 3 generator slugs `glass-pavilion-v1`, `tokyo-skyloft-xr`, `brutalist-garden-ar`):

```sql
insert into public.xr_links
  (id, name, slug, project_id, scene_id, model_url, thumbnail_url, share_url,
   qr_code_url, environment, ar_placement, password_protected, access_password,
   views_count, unique_visitors, avg_engagement_secs, status, expires_at, metadata,
   created_at, updated_at)
values
  (... 6 rows ...)
on conflict (id) do nothing;
```

Note: the 4 in-memory generator seeds compute `expiresAt = now + 90 days` dynamically; the SQL seed pins **fixed ISO timestamps** (90 days after ship date). This is a deliberate, documented divergence — DB-seeded rows are static, matching how the public resolver sees them after the first day.

### Server-only admin client: `lib/supabase-admin.ts` (new)

- Reads `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (server-only; do **not** prefix with `NEXT_PUBLIC_`).
- Exports `isSupabaseAdminConfigured` and `adminClient` (null when not configured).
- The service_role key is intentionally never exposed to the browser; the existing `lib/supabase.ts` anon client is unchanged and out of scope.

### Store rework: `lib/xr-links-store.ts`

- `getXRLinksFromDB`, `saveXRLinkToDB`, `deleteXRLinkFromDB`: when `isSupabaseAdminConfigured`, operate on `adminClient`. When not configured (or on error), preserve today's exact semantics: **reads** fall back to the in-memory `XR_LINKS_DB`; **writes** return `false`/`false` (unpersisted) exactly as they do now when Supabase is unavailable.
- Mappers:
  - `toDbRow(link: XRLinkRecord)` — camelCase → snake_case (incl. `createdAt/updatedAt` → `created_at/updated_at`; `metadata` serialized via `insert` as a JSON object, stored as JSONB).
  - `fromDbRow(row)` — snake_case → camelCase, restoring `XRLinkRecord` (metadata parsed back to the record's `metadata` shape).
- `saveXRLinkToDB` upserts the snake_case row with `{ onConflict: 'id' }` — fixing the latent camelCase-upsert mismatch that exists today.
- `getXRLinksFromDB` keeps `.order('created_at', { ascending: false })`, now valid against the real column.
- All admin-client calls stay inside the existing try/catch so any DB failure degrades to the in-memory fallback (public routes stay alive).

### Files

| File | Change |
|------|--------|
| `supabase/schema.sql` | Add `xr_links` table + indexes + RLS + seed (matches existing idempotent style). |
| `supabase/migrations/<yyyymmdd>_xr_links.sql` | New dated migration containing the same DDL + seed. |
| `lib/supabase-admin.ts` | New server-only admin client. |
| `lib/xr-links-store.ts` | Admin client + `toDbRow`/`fromDbRow` + upsert fix. |
| `.env.example` | Add `SUPABASE_SERVICE_ROLE_KEY` placeholder line + comment that it is server-only. |

`.env.local` gains a real `SUPABASE_SERVICE_ROLE_KEY` (user-supplied; not committed).

## Data flow

- Publisher POST `/api/xr-links` (auth-gated app-side) → `buildXRLinkRecord` → `saveXRLinkToDB` → admin upsert to `xr_links` (snake_case).
- Visitor GET `/api/xr-links/public/{slug}` → store → admin read → `fromDbRow` → `toPublic` (strips `access_password`, analytics) → JSON. App-side unauthenticated; DB access via service role server-side.
- Visitor POST `/api/xr-links/public/{slug}/verify` → admin read → constant-time compare → 200/401.
- No Supabase configured / DB error → in-memory `XR_LINKS_DB` fallback (all existing routes keep working).

## Error handling

- Admin client unavailable or any admin-query error → console.warn + in-memory fallback (existing pattern preserved).
- Upsert conflict on `id` → overwrite row (upsert semantics), matching today's intended behavior.

## Testing

- New unit tests for the mappers: `toDbRow`/`fromDbRow` round-trip all fields (camelCase↔snake_case, metadata passthrough, dates), placed in `lib/__tests__/xr-links-store.test.ts` (or extend the existing store test file).
- `isSupabaseAdminConfigured` is false under jest (no service key in test env), so the current 26 suites / 163 tests keep passing via the in-memory fallback unchanged.
- Full suite `pnpm exec jest --runInBand` stays green (163), `pnpm build` exits 0.
- Schema validation: after migration, run `supabase db advisors` (or MCP `get_advisors`) to confirm no new advisories; plan to run the DDL against the project via the repo's `supabase db push` / SQL-editor path (user-owned step since it touches the real project).