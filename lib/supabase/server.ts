import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Server-side Supabase client (user-scoped, RLS applies).
// Reads/writes the auth cookie via next/headers. Returns null when env vars
// are absent so pages stay renderable before credentials are configured.
function stripBom(s: string): string {
  return s.replace(/^\uFEFF/, '');
}

function isValidHttpUrl(s?: string): boolean {
  if (!s) return false;
  try {
    const url = new URL(s);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function createClient() {
  const url = stripBom(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
  const anonKey = stripBom(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
  if (!url || !anonKey || anonKey === '[SENSITIVE]' || !isValidHttpUrl(url)) return null;

  try {
    const cookieStore = await cookies();
    return createServerClient(url, anonKey, {
      cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — middleware refreshes the session.
        }
      },
    },
  });
  } catch {
    return null;
  }
}

export async function getSessionUser() {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
