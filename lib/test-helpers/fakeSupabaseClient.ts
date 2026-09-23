/**
 * Minimal in-memory fake of the supabase-js surface used by lib/toursRepo.
 * Supports: `.from(t).select(c).eq(c,v).order(c,{ascending}).thenable`
 * plus `.update(patch).eq(c,v)` and `.insert(row)` (both thenable).
 * Rows live in the passed array so tests can inspect/seed them.
 */

interface FakeRow {
  [key: string]: any;
  id: string;
  created_at: string;
  updated_at: string;
}

export const FAKE_USER_ID = '00000000-0000-0000-0000-000000000001';

export function makeFakeSupabaseClient(rows: FakeRow[], table = 'tours') {
  let seq = 0;
  const users: FakeRow[] = [{ id: FAKE_USER_ID, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }];

  function buildQuery(store: FakeRow[]) {
    const state: {
      filters: Array<(r: FakeRow) => boolean>;
      cols: string;
      order: string | null;
      limit: number | null;
    } = {
      filters: [],
      cols: '*',
      order: null,
      limit: null,
    };

    const q: any = {
      __state: state,
      select(cols: string) {
        state.cols = cols;
        return q;
      },
      eq(col: string, val: any) {
        if (col.startsWith('data->identity->>')) {
          const key = col.replace(/^data->identity->>/, '');
          state.filters.push((r) => r.data?.identity?.[key] === val);
        } else {
          state.filters.push((r) => r[col] === val);
        }
        return q;
      },
      order(col: string) {
        state.order = col;
        return q;
      },
      limit(n: number) {
        state.limit = n;
        return q;
      },
      maybeSingle() {
        state.limit = 1;
        return q;
      },
    };

    const run = async () => {
      let out = store.filter((r) => state.filters.every((f) => f(r)));
      const orderCol = state.order;
      if (orderCol) {
        out = [...out].sort((a, b) => {
          const av = a[orderCol];
          const bv = b[orderCol];
          if (av == null && bv == null) return 0;
          if (av == null) return -1;
          if (bv == null) return 1;
          return av < bv ? -1 : av > bv ? 1 : 0;
        });
      }
      if (state.limit != null) out = out.slice(0, state.limit);
      const projected =
        state.cols === '*'
          ? out
          : out.map((r) => {
              const picked: any = {};
              for (const col of state.cols.split(',').map((c) => c.trim())) {
                if (col) picked[col] = r[col];
              }
              return picked;
            });
      return { data: projected, error: null };
    };

    q.then = (res: any, rej: any) => run().then(res, rej);
    return q;
  }

  const client = {
    from(t: string) {
      if (t === 'User') {
        const q = buildQuery(users);
        return { select: q.select, order: q.order, eq: q.eq, limit: q.limit, then: q.then };
      }
      if (t !== table) throw new Error(`unexpected table "${t}" (expected "${table}" or "User")`);
      const q = buildQuery(rows);
      return {
        select: q.select,
        order: q.order,
        insert(row: any) {
          const id = row.id ?? `row-${++seq}`;
          const now = new Date().toISOString();
          rows.push({
            ...row,
            id,
            created_at: row.created_at ?? now,
            updated_at: row.updated_at ?? now,
          });
          return { data: null, error: null } as any;
        },
        update(patch: any) {
          const uq = buildQuery(rows);
          return {
            eq(col: string, val: any) {
              const filters = uq.__state.filters as Array<(r: any) => boolean>;
              filters.push((r: any) => r[col] === val);
              const run = async () => {
                const matched = rows.filter((r: any) => filters.every((f) => f(r)));
                for (const r of matched) {
                  Object.assign(r, patch);
                  r.updated_at = new Date().toISOString();
                }
                return { data: matched, error: null };
              };
              return { then: (res: any, rej: any) => run().then(res, rej) } as any;
            },
          };
        },
      };
    },
  };

  return client;
}